// Процедурный звук без внешних файлов: гусли (щипковый синтез), балалайка (тремоло), жалейка-флейта, колокольчики,
// пэды, шумы. Шины: мастер / музыка / эффекты / окружение. Темы музыки для каждого острова.
const D = 293.66;
const f = (st) => D * Math.pow(2, st / 12);
// лады: дорийский (Лукоморье), натуральный минор (лес), мажор (праздник), фригийский (Кощей)
const MODES = { dorian: [0, 2, 3, 5, 7, 9, 10], minor: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11], phryg: [0, 1, 3, 5, 7, 8, 10], penta: [0, 2, 4, 7, 9] };
const deg = (mode, n) => { const m = MODES[mode]; const o = Math.floor(n / m.length); return m[((n % m.length) + m.length) % m.length] + 12 * o; };
// Тема: лад, тоника (полутоны от ре), темп (сек на долю), мелодия (ступени, -99 = пауза), бас, инструмент мелодии, ударные
export const THEMES = {
  luk: { mode: 'dorian', root: 0, beat: 0.3, lead: 'pluck', drum: 1, bass: [0, 3, 4, 0], mel: [[0, 1, 2, 3, 2, 1, 0, -99], [4, 4, 5, 4, 3, 2, 3, -99], [7, 6, 4, 5, 4, 3, 2, 0], [2, 3, 4, 2, 1, 2, 0, -99]] },
  forest: { mode: 'minor', root: -2, beat: 0.36, lead: 'flute', drum: 0, pad: true, bass: [0, -2, -3, -1], mel: [[0, -99, 2, 1, 0, -99, -1, -99], [2, 3, 4, -99, 3, 2, 1, -99], [4, -99, 3, 2, 1, 0, -1, 0], [-99, 0, 1, 2, 0, -99, -99, -99]] },
  mountains: { mode: 'minor', root: 3, beat: 0.42, lead: 'bell', drum: 0, pad: true, bass: [0, 5, 3, 4], mel: [[7, -99, 6, -99, 4, -99, 5, -99], [4, 3, 2, -99, 0, -99, -99, -99], [2, -99, 4, -99, 5, 4, 3, 2], [4, -99, -99, -99, 0, -99, -99, -99]] },
  rivers: { mode: 'major', root: 2, beat: 0.27, lead: 'balalaika', drum: 1, bass: [0, 3, 4, 0], mel: [[0, 2, 4, 2, 0, 2, 4, 5], [4, 3, 2, 1, 2, -99, 0, -99], [4, 5, 7, 5, 4, 2, 4, 2], [1, 2, 3, 1, 0, -99, 0, -99]] },
  koschei: { mode: 'phryg', root: -5, beat: 0.4, lead: 'flute', drum: 2, pad: true, bass: [0, 1, 0, -2], mel: [[0, -99, 1, 0, -99, -99, -1, -99], [3, 2, 1, -99, 0, -99, -99, -99], [-99, 4, 3, 1, 0, 1, -99, -99], [0, -99, -99, -99, -1, -99, 0, -99]] },
  boss: { mode: 'phryg', root: -5, beat: 0.22, lead: 'balalaika', drum: 3, bass: [0, 0, 1, -2], mel: [[0, 1, 0, -1, 0, 3, 1, 0], [4, 3, 1, 0, 1, 0, -1, 0], [0, 1, 3, 4, 5, 4, 3, 1], [0, -99, 0, -99, 1, 0, -1, -99]] },
  night: { mode: 'minor', root: -3, beat: 0.5, lead: 'bell', drum: 0, pad: true, bass: [0, 3, 4, 0], mel: [[4, -99, 2, -99, 4, -99, 2, -99], [4, 3, 2, 1, 2, -99, -99, -99], [2, -99, 1, -99, 2, -99, 0, -99], [1, 0, -1, 1, 0, -99, -99, -99]] }, // колыбельная «Баю-баюшки-баю»
  sea: { mode: 'dorian', root: -3, beat: 0.34, lead: 'bell', drum: 0, pad: true, bass: [0, 5, 3, 4], mel: [[0, 2, 4, -99, 5, 4, 2, -99], [4, -99, 5, 7, 5, -99, 4, 2], [2, 4, 5, 4, 2, -99, 0, -99], [1, 2, 0, -99, -1, -99, 0, -99]] }, // «Садко»: гусли под водой
  bridge: { mode: 'dorian', root: 2, beat: 0.28, lead: 'balalaika', drum: 2, pad: true, bass: [0, -2, 3, 4], mel: [[0, 0, 2, 3, 4, -99, 3, 2], [4, 5, 7, 5, 4, 3, 2, -99], [0, 2, 3, 4, 3, 2, 0, -1], [0, -99, 2, -99, 0, -99, -99, -99]] }, // богатырская: Калинов мост
  finale: { mode: 'major', root: 0, beat: 0.26, lead: 'balalaika', drum: 1, pad: true, bass: [0, 3, 4, 0], mel: [[0, 2, 4, 5, 4, 2, 4, 7], [5, 4, 2, 4, 2, 1, 0, -99], [4, 4, 5, 7, 5, 4, 2, 4], [2, 1, 2, 4, 0, -99, 0, -99]] },
};
// длительности петель (сек) — пишет tools/render_music.js
export const MUSIC_LEN = { luk: 28.8, forest: 34.56, mountains: 26.88, rivers: 25.92, koschei: 38.4, boss: 21.12, night: 32, finale: 24.96, sea: 32.64, bridge: 26.88 }; // длины петель в assets/music (для плееров, не срезающих задержку mp3)
export class Sound {
  constructor() {
    this.ctx = null; this.theme = 'luk'; this.color = 0.12; this.musicOn = false;
    let v = {}; try { v = JSON.parse(localStorage.getItem('tri_opts') || '{}'); } catch {}
    this.vol = { master: v.master ?? 0.7, music: v.music ?? 0.6, sfx: v.sfx ?? 0.8 };
  }
  init() {
    if (this.ctx) { this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = (this.ctx = new C());
    this.comp = c.createDynamicsCompressor(); this.comp.threshold.value = -14; this.comp.ratio.value = 3; this.comp.connect(c.destination);
    this.master = c.createGain(); this.master.connect(this.comp);
    this.music = c.createGain(); this.sfxBus = c.createGain(); this.amb = c.createGain();
    this.music.connect(this.master); this.sfxBus.connect(this.master); this.amb.connect(this.master);
    // реверберация: свёртка с затухающим шумом
    const len = c.sampleRate * 2.2, ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    this.rev = c.createConvolver(); this.rev.buffer = ir; const rw = c.createGain(); rw.gain.value = 0.32; this.rev.connect(rw); rw.connect(this.master);
    this.delay = c.createDelay(); this.delay.delayTime.value = 0.3; const fb = c.createGain(); fb.gain.value = 0.25; this.delay.connect(fb); fb.connect(this.delay);
    const dw = c.createGain(); dw.gain.value = 0.18; this.delay.connect(dw); dw.connect(this.music);
    // шум
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.noiseBuf = buf;
    // окружение: ветер + вода
    const mk = (type, freq, q) => { const n = c.createBufferSource(); n.buffer = buf; n.loop = true; const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = freq; fl.Q.value = q; const g = c.createGain(); g.gain.value = 0; n.connect(fl); fl.connect(g); g.connect(this.amb); n.start(); return { g, fl }; };
    this.wind = mk('bandpass', 380, 0.6); this.water = mk('lowpass', 500, 0.4);
    this.lfo = c.createOscillator(); this.lfo.frequency.value = 0.13; const lg = c.createGain(); lg.gain.value = 140; this.lfo.connect(lg); lg.connect(this.wind.fl.frequency); this.lfo.start();
    this.applyVolumes(); this.setAmbience({ wind: 0.06, water: 0.03 }); this.startMusic();
  }
  applyVolumes() { if (!this.ctx) return; const t = this.ctx.currentTime; this.master.gain.setTargetAtTime(this.vol.master, t, 0.05); this.music.gain.setTargetAtTime(this.vol.music * 0.9, t, 0.05); this.sfxBus.gain.setTargetAtTime(this.vol.sfx, t, 0.05); this.amb.gain.setTargetAtTime(this.vol.sfx * 0.9, t, 0.05); }
  setAmbience({ wind = 0.04, windFreq = 380, water = 0 } = {}) { if (!this.ctx) { this._amb = { wind, windFreq, water }; return; } const t = this.ctx.currentTime; this.wind.g.gain.setTargetAtTime(wind, t, 1); this.wind.fl.frequency.setTargetAtTime(windFreq, t, 1); this.water.g.gain.setTargetAtTime(water, t, 1); }
  setGray(g) { this.setColor(1 - g); }
  setColor(life) { this.color = life; if (this.musicLP && this.ctx) { const t = this.ctx.currentTime; this.musicLP.frequency.setTargetAtTime(450 + life * life * 15500, t, 0.4); this.trackBus.gain.setTargetAtTime(0.5 + 0.5 * life, t, 0.4); } } // серый мир — музыка глуше и тише
  setTheme(name) { if (!THEMES[name] || name === this.theme) return; this.theme = name; this._step = 0; if (this.musicOn) this._playTrack(name); }
  // ---------- инструменты ----------
  _out(bus) { return bus === 'music' ? this.music : this.sfxBus; }
  pluck(freq, t = 0, vol = 0.2, dur = 1.6, bus = 'sfx') { // гусли
    const c = this.ctx; if (!c) return; const now = c.currentTime + Math.max(0, t);
    const g = c.createGain(); g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol, now + 0.004); g.gain.exponentialRampToValueAtTime(0.0008, now + dur);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(Math.min(16000, freq * 9), now); lp.frequency.exponentialRampToValueAtTime(freq * 1.4, now + dur * 0.6);
    [[1, 'triangle', 1], [2.003, 'sine', 0.35], [3.01, 'sine', 0.13], [4.02, 'sine', 0.05]].forEach(([m, type, a]) => { const o = c.createOscillator(); o.type = type; o.frequency.value = freq * m; const og = c.createGain(); og.gain.value = a; o.connect(og); og.connect(lp); o.start(now); o.stop(now + dur + 0.05); });
    lp.connect(g); g.connect(this._out(bus)); g.connect(this.rev); if (bus === 'music') g.connect(this.delay);
  }
  balalaika(freq, t = 0, vol = 0.12, dur = 0.5, bus = 'music') { // тремоло: быстрые повторные щипки
    const n = Math.max(2, Math.round(dur / 0.065)); for (let i = 0; i < n; i++) this.pluck(freq * (i % 2 ? 1.001 : 1), t + i * 0.065, vol * (1 - i / n * 0.5), 0.35, bus);
  }
  flute(freq, t = 0, vol = 0.08, dur = 0.6, bus = 'music') { // жалейка: синус с вибрато и придыханием
    const c = this.ctx; if (!c) return; const now = c.currentTime + Math.max(0, t);
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq; const o2 = c.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq * 2; const g2 = c.createGain(); g2.gain.value = 0.18; o2.connect(g2);
    const vib = c.createOscillator(); vib.frequency.value = 5.2; const vg = c.createGain(); vg.gain.value = freq * 0.012; vib.connect(vg); vg.connect(o.frequency);
    const g = c.createGain(); g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol, now + 0.06); g.gain.setValueAtTime(vol, now + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.connect(g); g2.connect(g); g.connect(this._out(bus)); g.connect(this.rev);
    [o, o2, vib].forEach((x) => { x.start(now); x.stop(now + dur + 0.05); });
    this.noise(t, 0.05, 3000, vol * 0.25, bus);
  }
  bell(freq, t = 0, vol = 0.1, dur = 2.2, bus = 'sfx') { // колокольчик: неровные обертоны
    const c = this.ctx; if (!c) return; const now = c.currentTime + Math.max(0, t);
    [[1, 1], [2.76, 0.4], [5.4, 0.2], [8.93, 0.08]].forEach(([m, a]) => { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq * m; const g = c.createGain(); g.gain.setValueAtTime(vol * a, now); g.gain.exponentialRampToValueAtTime(0.0005, now + dur / m ** 0.3); o.connect(g); g.connect(this._out(bus)); g.connect(this.rev); o.start(now); o.stop(now + dur); });
  }
  pad(freqs, t = 0, vol = 0.03, dur = 3, bus = 'music') {
    const c = this.ctx; if (!c) return; const now = c.currentTime + Math.max(0, t);
    const g = c.createGain(); g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol, now + dur * 0.4); g.gain.linearRampToValueAtTime(0, now + dur);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200; lp.connect(g); g.connect(this._out(bus)); g.connect(this.rev);
    freqs.forEach((fr) => [-4, 4].forEach((det) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.detune.value = det; o.connect(lp); o.start(now); o.stop(now + dur + 0.05); }));
  }
  noise(t = 0, dur = 0.12, freq = 900, vol = 0.3, bus = 'sfx', type = 'lowpass') {
    const c = this.ctx; if (!c) return; const now = c.currentTime + Math.max(0, t);
    const s = c.createBufferSource(); s.buffer = this.noiseBuf; const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = freq;
    const g = c.createGain(); g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    s.connect(fl); fl.connect(g); g.connect(this._out(bus)); s.start(now, Math.random()); s.stop(now + dur + 0.02);
  }
  thump(freq = 90, t = 0, vol = 0.4, dur = 0.25, bus = 'sfx') {
    const c = this.ctx; if (!c) return; const now = c.currentTime + Math.max(0, t);
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(freq * 2, now); o.frequency.exponentialRampToValueAtTime(freq * 0.5, now + dur);
    const g = c.createGain(); g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.001, now + dur); o.connect(g); g.connect(this._out(bus)); o.start(now); o.stop(now + dur + 0.02);
  }
  // ---------- музыка ----------
  // Фоновая музыка играет из готовых файлов assets/music/*.mp3 (отрендерены из этих же тем tools/render_music.js):
  // никакого планировщика нот на главном потоке — звук не «заикается», когда тормозит кадр, а файлы кэшируются браузером.
  // Если файл не загрузился — запасной вариант: живой синтез нот (_startSynth).
  startMusic() {
    if (!this.ctx || this.musicOn) return; this.musicOn = true;
    if (!this.musicLP) { const c = this.ctx; this.musicLP = c.createBiquadFilter(); this.musicLP.type = 'lowpass'; this.musicLP.frequency.value = 16000; this.trackBus = c.createGain(); this.musicLP.connect(this.trackBus); this.trackBus.connect(this.music); this.setColor(this.color); }
    this._playTrack(this.theme);
    // заранее скачиваем остальные темы (только файлы, без распаковки) — переход между краями без пауз
    setTimeout(() => Object.keys(THEMES).forEach((n, i) => setTimeout(() => this._fetchTrack(n), i * 700)), 4000);
  }
  _fetchTrack(name) { this._files ||= {}; return (this._files[name] ||= fetch(`assets/music/${name}.mp3`).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null)); }
  async _decode(name) {
    this._dec ||= {}; if (this._dec[name]) return this._dec[name];
    const ab = await this._fetchTrack(name); if (!ab) return null;
    const buf = await new Promise((res) => { try { this.ctx.decodeAudioData(ab.slice(0), res, () => res(null)); } catch { res(null); } });
    if (buf) { this._dec[name] = buf; const keep = new Set([name, this._curName]); Object.keys(this._dec).forEach((k) => { if (!keep.has(k)) delete this._dec[k]; }); } // в памяти не больше двух тем
    return buf;
  }
  async _playTrack(name) {
    const tok = (this._tok = (this._tok || 0) + 1);
    const buf = await this._decode(name); if (tok !== this._tok || !this.ctx) return;
    if (!buf) { if (!this._synthOn) this._startSynth(); return; }
    if (this._cur && this._curName === name) return; // та же тема уже звучит — не перезапускаем
    if (this._synthOn) { clearInterval(this._music); this._synthOn = false; }
    const c = this.ctx, now = c.currentTime;
    if (this._cur) { const o = this._cur; o.g.gain.cancelScheduledValues(now); o.g.gain.setValueAtTime(o.g.gain.value, now); o.g.gain.linearRampToValueAtTime(0, now + 1.4); setTimeout(() => { try { o.src.stop(); } catch {} o.g.disconnect(); }, 1700); }
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    const L = MUSIC_LEN[name]; if (L && buf.duration - L > 0.004) { src.loopStart = Math.min(buf.duration - L, 1105 / 44100); src.loopEnd = src.loopStart + L; }
    const g = c.createGain(); g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(1, now + 1.4); src.connect(g); g.connect(this.musicLP);
    src.start(now, src.loopStart || 0); this._cur = { src, g }; this._curName = name;
  }
  _startSynth() {
    this._synthOn = true; this._step = 0; this._next = this.ctx.currentTime + 0.3;
    this._music = setInterval(() => this._tick(), 90);
  }
  _tick() { const c = this.ctx; if (!c || c.state !== 'running') return; this._sched(c.currentTime + 0.35, c.currentTime); }
  _sched(limit, base) { // планировщик нот темы (живой синтез и рендер файлов tools/render_music.html)
    while (this._next < limit) {
      const th = THEMES[this.theme]; const s = this._step, t = this._next - base; const root = th.root;
      const bar = Math.floor(s / 8) % th.mel.length, i = s % 8; const n = th.mel[bar][i];
      const live = this.color; const dense = live > 0.6 || i % 2 === 0; // в сером мире музыка редеет
      const F = (d, o = 0) => f(deg(th.mode, d) + root + o);
      if (n > -99 && dense && (live > 0.25 || i % 4 === 0)) {
        if (th.lead === 'pluck') this.pluck(F(n), t, 0.1, 1.3, 'music');
        else if (th.lead === 'flute') this.flute(F(n, 12), t, 0.06, th.beat * 1.8);
        else if (th.lead === 'bell') this.bell(F(n, 12), t, 0.05, 2.4, 'music');
        else this.balalaika(F(n), t, 0.07, th.beat * 0.9);
        if (live > 0.8 && th.lead !== 'pluck' && i % 2 === 0) this.pluck(F(n - 2), t + 0.01, 0.04, 0.8, 'music');
      }
      if (i === 0) { const b = th.bass[bar % th.bass.length]; this.pluck(F(b, -12), t, 0.09, 2.2, 'music'); if (th.pad) this.pad([F(b, -12), F(b + 2, -12), F(b + 4, -12)], t, 0.012 + 0.012 * live, th.beat * 8); }
      if (i === 4 && th.drum) this.pluck(F(th.bass[bar % th.bass.length] + 4, -12), t, 0.06, 1.2, 'music');
      if (th.drum && live > 0.3) { // бубен и ложки
        if (i % 2 === 1) this.noise(t, 0.05, 5000, 0.025 * th.drum, 'music', 'highpass');
        if (th.drum >= 2 && i % 4 === 0) this.thump(55, t, 0.12, 0.3, 'music');
        if (th.drum === 3 && i % 2 === 0) this.thump(70, t, 0.08, 0.15, 'music');
      }
      this._step++; this._next += th.beat;
    }
  }
  // ---------- эффекты ----------
  hit() { this.noise(0, 0.1, 700, 0.35); this.thump(110, 0, 0.25, 0.18); }
  hurt() { this.pluck(f(-12), 0, 0.2, 0.5); this.pluck(f(-11), 0.05, 0.15, 0.5); this.noise(0, 0.15, 400, 0.2); }
  swing() { this.noise(0, 0.1, 2500, 0.1, 'sfx', 'bandpass'); }
  magic() { [12, 16, 19, 24].forEach((s, i) => this.bell(f(s), i * 0.04, 0.05, 0.8)); this.noise(0, 0.25, 6000, 0.04, 'sfx', 'highpass'); }
  dash() { this.noise(0, 0.25, 1800, 0.18, 'sfx', 'bandpass'); this.flute(f(19), 0, 0.03, 0.2, 'sfx'); }
  sight(on) { (on ? [7, 12, 19, 24] : [24, 19, 12, 7]).forEach((s, i) => this.bell(f(s), i * 0.05, 0.06, 1.4)); }
  chime() { [0, 7, 12, 16, 19, 24].forEach((s, i) => this.pluck(f(s), i * 0.08, 0.14, 2)); this.bell(f(24), 0.5, 0.05, 2); }
  wrong() { this.pluck(f(-5), 0, 0.15, 0.4); this.pluck(f(-6), 0.12, 0.15, 0.6); }
  laugh() { [12, 10, 7, 10, 7, 5].forEach((s, i) => this.pluck(f(s), i * 0.09, 0.12, 0.4)); }
  sleep() { [7, 5, 3, 0].forEach((s, i) => this.bell(f(s + 12), i * 0.12, 0.05, 1.2)); }
  restore() { for (let i = 0; i < 24; i++) this.pluck(f(deg('dorian', i % 14) + (i >= 14 ? 12 : 0)), i * 0.07, 0.13, 2.5); [0, 4, 7].forEach((s, i) => this.bell(f(s + 24), 1.2 + i * 0.2, 0.06, 3)); }
  fanfare() { [0, 4, 7, 12, 7, 12, 16, 19].forEach((s, i) => this.balalaika(f(s), i * 0.16, 0.09, 0.15, 'sfx')); [0, 4, 7].forEach((s) => this.bell(f(s + 24), 1.3, 0.05, 3)); }
  click() { this.pluck(f(12), 0, 0.05, 0.15); }
  step(surface = 'grass') {
    if (!this.ctx) return; const r = 0.85 + Math.random() * 0.3;
    if (surface === 'snow') this.noise(0, 0.12, 1400 * r, 0.06, 'sfx', 'bandpass');
    else if (surface === 'wood') { this.thump(180 * r, 0, 0.07, 0.07); this.noise(0, 0.04, 2000, 0.03); }
    else if (surface === 'stone') { this.noise(0, 0.04, 3500 * r, 0.05, 'sfx', 'highpass'); this.thump(140, 0, 0.04, 0.05); }
    else if (surface === 'water') this.noise(0, 0.15, 900 * r, 0.06, 'sfx', 'bandpass');
    else if (surface === 'sand') this.noise(0, 0.09, 2500 * r, 0.035);
    else this.noise(0, 0.07, 1100 * r, 0.04);
  }
  jump() { this.noise(0, 0.08, 1500, 0.05); }
  land() { this.thump(80, 0, 0.12, 0.12); this.noise(0, 0.08, 900, 0.06); }
  splash() { this.noise(0, 0.5, 1200, 0.2, 'sfx', 'bandpass'); }
  cricket() { for (let i = 0; i < 3; i++) this.noise(i * 0.07, 0.04, 4200 + Math.random() * 600, 0.025, 'sfx', 'bandpass'); }
  owl() { [0, 0.5].forEach((t) => this.flute(f(-5), t, 0.04, 0.35, 'sfx')); this.flute(f(-7), 0.95, 0.04, 0.6, 'sfx'); }
  bird() { const b = 2000 + Math.random() * 1500; for (let i = 0; i < 3; i++) this.flute(b * (1 + i * 0.12), i * 0.08, 0.015, 0.07, 'sfx'); }
  honk() { const c = this.ctx; if (!c) return; const now = c.currentTime; const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(420, now); o.frequency.exponentialRampToValueAtTime(300, now + 0.25); const fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = 900; const g = c.createGain(); g.gain.setValueAtTime(0.09, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.3); o.connect(fl); fl.connect(g); g.connect(this.sfxBus); o.start(now); o.stop(now + 0.32); }
  stomp() { this.thump(45, 0, 0.5, 0.5); this.noise(0, 0.4, 300, 0.25); }
  crack() { this.noise(0, 0.25, 4000, 0.25, 'sfx', 'highpass'); this.bell(f(31), 0, 0.03, 0.5); }
  freeze() { [24, 31, 28, 36].forEach((s, i) => this.bell(f(s), i * 0.06, 0.03, 1)); }
  dark() { this.thump(40, 0, 0.3, 1); this.pad([f(-24), f(-23)], 0, 0.05, 1.5, 'sfx'); }
}
