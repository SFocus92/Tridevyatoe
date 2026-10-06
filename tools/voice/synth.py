#!/usr/bin/env python3
"""Синтез озвучки: tools/voice/jobs.json → assets/voice/<край>/<персонаж>_<ключ>.mp3 + assets/voice/index.json

Голос — Silero TTS v5_5_ru (ударения и омографы — Silero Stress + словарь ниже), обработка — ffmpeg (rubberband).
Запуск:  python3 tools/voice/synth.py [--model путь/к/v5_5_ru.pt] [--force] [--only ключ,ключ]
Готовые файлы не пересинтезируются (если текст реплики не изменился, ключ тот же).
"""
import json, os, re, subprocess, sys, tempfile, time, argparse, wave
import torch

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'voice')
SR = 24000
# словарь ударений поверх Silero Stress: сказочные имена и слова, где автомат ошибается
STRESS = {
    'ряба': 'р+яба', 'рябу': 'р+ябу', 'рябы': 'р+ябы', 'рябой': 'р+ябой',
}

def accent_fix(text):
    def fix(m):
        w = m.group(0); plain = w.replace('+', '').lower()
        if plain in STRESS:
            r = STRESS[plain]
            return r[0].upper() + r[1:] if w.replace('+', '')[:1].isupper() else r
        return w
    return re.sub(r"[А-Яа-яЁё+]+", fix, text)

def chunks(text, limit=600):
    if len(text) <= limit: return [text]
    parts, cur = [], ''
    for s in re.split(r'(?<=[.!?…])\s+', text):
        if cur and len(cur) + len(s) + 1 > limit: parts.append(cur); cur = s
        else: cur = (cur + ' ' + s).strip()
    if cur: parts.append(cur)
    return parts

def write_wav(path, audio):
    a = (audio.clamp(-1, 1) * 32767).to(torch.int16).numpy().tobytes()
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(a)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--model', default=os.environ.get('SILERO_MODEL', '/data/tts/v5_5_ru.pt'))
    ap.add_argument('--force', action='store_true'); ap.add_argument('--only', default=''); ap.add_argument('--limit', type=int, default=0); ap.add_argument('--where', default='', help="выражение на Python, напр. \"v['st'] < -2 or v.get('echo')\"")
    a = ap.parse_args()
    torch.set_num_threads(max(1, (os.cpu_count() or 2)))
    jobs = json.load(open(os.path.join(ROOT, 'tools', 'voice', 'jobs.json'), encoding='utf-8'))
    only = set(filter(None, a.only.split(',')))
    if only: jobs = [j for j in jobs if j['key'] in only]
    if a.limit: jobs = jobs[:a.limit]
    from silero_stress import load_accentor
    acc = load_accentor()
    model = torch.package.PackageImporter(a.model).load_pickle('tts_models', 'model')
    tmp = tempfile.mkdtemp()
    state_path = os.path.join(ROOT, 'tools', 'voice', 'state.json')
    state = json.load(open(state_path, encoding='utf-8')) if os.path.exists(state_path) else {}
    sig = lambda j: json.dumps([j['tts'], j['voice']['speaker'], j['voice']['st'], round(j['voice']['rate'], 4), j['voice'].get('gain', 0), j['voice'].get('echo', 0), 2], ensure_ascii=False)
    if a.where: jobs_force = set(j['key'] for j in jobs if eval(a.where, {}, {'v': j['voice'], 'j': j}))
    else: jobs_force = set()
    done = 0; t0 = time.time(); fails = []
    for j in jobs:
        dst = os.path.join(OUT, j['file'])
        fresh = os.path.exists(dst) and (state.get(j['key']) in (None, sig(j)))
        if fresh and not a.force and j['key'] not in jobs_force:
            state[j['key']] = sig(j); continue
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        v = j['voice']
        try:
            stressed = accent_fix(acc(j['tts']))
            pieces = []
            for part in chunks(stressed):
                au = model.apply_tts(text=part, speaker=v['speaker'], sample_rate=SR, put_accent=False, put_yo=False, put_stress_homo=False, put_yo_homo=False)
                pieces.append(au); pieces.append(torch.zeros(int(SR * 0.25)))
            audio = torch.cat(pieces[:-1])
            wav = os.path.join(tmp, 'a.wav'); write_wav(wav, audio)
            st, rate = float(v['st']), float(v['rate'])
            f = ['silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.04', 'areverse', 'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.12', 'areverse']
            if abs(st) > 0.01 or abs(rate - 1) > 0.001:
                f.append('rubberband=pitch=%.5f:tempo=%.4f:formant=%s:pitchq=quality' % (2 ** (st / 12), rate, 'shifted' if st > 2 else 'preserved'))  # маленьким и звонким — сдвиг тембра, низким — сохраняем разборчивость
            if v.get('echo'): f.append('aecho=0.85:0.5:40|80:0.15|0.08')
            f.append('loudnorm=I=-17:TP=-1.5:LRA=9')
            if v.get('gain'): f.append('volume=%.1fdB' % v['gain'])
            f.append('apad=pad_dur=0.06')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af', ','.join(f), '-ar', str(SR), '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '48k', dst], check=True)
            done += 1; state[j['key']] = sig(j)
            if done % 25 == 0: print(f'{done}/{len(jobs)}  {time.time() - t0:.0f}s', flush=True)
        except Exception as e:
            fails.append((j['key'], str(e)[:200])); print('FAIL', j['key'], j['tts'][:80], e, flush=True)
    json.dump(state, open(state_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    # манифест: только существующие файлы
    files = {j['key']: j['file'] for j in json.load(open(os.path.join(ROOT, 'tools', 'voice', 'jobs.json'), encoding='utf-8')) if os.path.exists(os.path.join(OUT, j['file']))}
    json.dump({'v': 1, 'engine': 'silero-v5_5_ru', 'n': len(files), 'files': files}, open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('готово', done, 'новых, всего в манифесте', len(files), 'ошибок', len(fails), f'{time.time() - t0:.0f}s')

if __name__ == '__main__':
    main()
