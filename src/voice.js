// v1.5: записанная озвучка (Silero TTS, русские ударения) — assets/voice/<край>/<персонаж>_<ключ>.mp3.
// Реплика ищется по ключу «кто|чистый текст» (src/voicekey.js). Нет записи — говорит speechSynthesis, как раньше.
// Длинная реплика с числами или именем игрока склеивается из записанных предложений.
import { spoken, stripAddress, keyOf, sentences } from './voicekey.js';
import { personal } from './ui.js';

const BASE = 'assets/voice/';
let files = null;
const ready = fetch(BASE + 'index.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).then((j) => { files = (j && j.files) || null; return !!files; }).catch(() => false);
// тишина 0,1 с — «разблокировать» звук на телефоне по первому касанию
const SILENT = 'data:audio/mpeg;base64,SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYxLjEuMTAwAAAAAAAAAAAAAAD/84TAAAAAAAAAAAAASW5mbwAAAA8AAAAHAAADYABVVVVVVVVVVVVVVVVVVXFxcXFxcXFxcXFxcXFxjo6Ojo6Ojo6Ojo6Ojo6qqqqqqqqqqqqqqqqqqqrHx8fHx8fHx8fHx8fHx+Pj4+Pj4+Pj4+Pj4+Pj//////////////////8AAAAATGF2YzYxLjMuAAAAAAAAAAAAAAAAJAQgAAAAAAAAA2CZUIMeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/80TEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TEUwAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TEpgAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80TErAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80TErAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';

// файл → blob: URL (из кэша service worker'а, без Range-запросов — так надёжнее офлайн и на iPhone)
const blobs = new Map();
function blob(url) {
  if (blobs.has(url)) { const p = blobs.get(url); blobs.delete(url); blobs.set(url, p); return p; }
  const p = fetch(url).then((r) => { if (!r.ok) throw new Error(r.status); return r.blob(); }).then((b) => URL.createObjectURL(b));
  p.catch(() => blobs.delete(url)); blobs.set(url, p);
  while (blobs.size > 24) { const [k, old] = blobs.entries().next().value; blobs.delete(k); old.then((u) => URL.revokeObjectURL(u), () => {}); }
  return p;
}
export function createVoice() {
  const el = new Audio(); el.preload = 'auto'; try { el.preservesPitch = true; el.mozPreservesPitch = true; el.webkitPreservesPitch = true; } catch {}
  let unlocked = false, cur = null;
  const unlock = () => { if (unlocked) return; unlocked = true; try { el.src = SILENT; el.volume = 0; const p = el.play(); if (p) p.catch(() => { unlocked = false; }); } catch { unlocked = false; } };
  const look = (who, clean, touch) => {
    for (const w of [who, '*']) { if (touch) { const k = keyOf(w, clean, true); if (files[k]) return files[k]; } const k = keyOf(w, clean); if (files[k]) return files[k]; }
    return null;
  };
  // [{ url, w }] — файлы и их «вес» в буквах (для печати текста в такт голосу) или null
  function find(who, raw, name, touch) {
    if (!files || typeof raw !== 'string') return null;
    const txt = name && personal(raw, name) !== raw ? stripAddress(raw) : raw;
    const clean = spoken(txt); if (!clean) return null;
    const one = look(who, clean, touch); if (one) return [{ url: BASE + one, w: clean.length }];
    if (name && clean.startsWith(name)) { // «Маша! Какое славное имя…» — имя не записать: играем остальное
      const rest = clean.slice(name.length).replace(/^[!?.,…]+\s*/, ''); const f = rest && look(who, rest, touch); if (f) return [{ url: BASE + f, w: rest.length }];
    }
    const ss = sentences(clean); if (ss.length < 2) return null;
    const out = [];
    for (const s of ss) {
      if (name && s.replace(/[!?.,…\s]+$/, '') === name) continue; // «Маша!» — имя игрока не записать, пропускаем
      const f = look(who, s, touch); if (!f) return null; out.push({ url: BASE + f, w: s.length });
    }
    return out.length ? out : null;
  }
  function stop() { if (!cur) return; const c = cur; cur = null; clearInterval(c.tick); try { el.pause(); } catch {} el.onended = el.onerror = el.onplaying = null; }
  // играть список; hooks — как у speechSynthesis (start / word / end); fail() — если звук не пошёл
  function play(list, { rate = 1, volume = 1, chars = 0 } = {}, hooks = {}, fail = () => {}) {
    stop();
    const me = (cur = { tick: 0 }); const total = list.reduce((a, x) => a + x.w, 0) || 1; const scale = (chars || total) / total;
    let i = 0, before = 0, started = false, live = false; // live — текущий кусочек уже звучит (до этого el ещё держит старый файл)
    const report = () => { if (cur !== me || !list[i]) return; const d = el.duration; const p = live && d && isFinite(d) ? Math.min(1, el.currentTime / d) : 0; const k = Math.round((before + p * list[i].w) * scale); hooks.word && hooks.word(k, k); };
    const bad = () => { if (cur !== me) return; stop(); if (!started) fail(); else hooks.end && hooks.end(true); };
    const next = () => {
      if (cur !== me) return;
      if (i >= list.length) { stop(); hooks.end && hooks.end(true); return; }
      if (list[i + 1]) blob(list[i + 1].url).catch(() => {}); // следующий кусочек — заранее
      live = false;
      blob(list[i].url).then((src) => {
        if (cur !== me) return;
        el.src = src; el.playbackRate = rate; el.defaultPlaybackRate = rate; el.volume = Math.max(0, Math.min(1, volume));
        const p = el.play(); if (p) p.catch(bad);
      }, bad);
    };
    el.onplaying = () => { if (cur !== me) return; live = true; try { el.playbackRate = rate; } catch {} if (!started) { started = true; hooks.start && hooks.start(); } };
    el.onended = () => { if (cur !== me) return; before += list[i].w; i++; live = false; report(); next(); };
    el.onerror = bad;
    me.tick = setInterval(report, 60);
    next();
    return true;
  }
  return { ready, unlock, find, play, stop, has: () => !!files, get playing() { return !!cur; } };
}
