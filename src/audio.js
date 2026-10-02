// Процедурный звук: «гусли» (щипковый синтез), ветер, народная мелодия. Без внешних файлов.
const D = 293.66;
const SCALE = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19]; // ре дорийский
const f = (st) => D * Math.pow(2, st / 12);
export class Sound {
  constructor() { this.ctx = null; this.musicOn = false; }
  init() {
    if (this.ctx) { this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = (this.ctx = new C());
    this.master = c.createGain(); this.master.gain.value = 0.55; this.master.connect(c.destination);
    this.delay = c.createDelay(); this.delay.delayTime.value = 0.27;
    const fb = c.createGain(); fb.gain.value = 0.33; this.delay.connect(fb); fb.connect(this.delay);
    const wet = c.createGain(); wet.gain.value = 0.3; this.delay.connect(wet); wet.connect(this.master);
    // ветер
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const n = c.createBufferSource(); n.buffer = buf; n.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 0.6;
    this.windGain = c.createGain(); this.windGain.gain.value = 0.06;
    n.connect(bp); bp.connect(this.windGain); this.windGain.connect(this.master); n.start();
    this.noiseBuf = buf;
  }
  pluck(freq, t = 0, vol = 0.2, dur = 1.6) {
    const c = this.ctx; if (!c) return; const now = c.currentTime + t;
    const g = c.createGain(); g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol, now + 0.004); g.gain.exponentialRampToValueAtTime(0.0008, now + dur);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(freq * 8, now); lp.frequency.exponentialRampToValueAtTime(freq * 1.5, now + dur * 0.6);
    [[1, 'triangle', 1], [2.003, 'sine', 0.35], [3.01, 'sine', 0.12]].forEach(([m, type, a]) => {
      const o = c.createOscillator(); o.type = type; o.frequency.value = freq * m;
      const og = c.createGain(); og.gain.value = a; o.connect(og); og.connect(lp); o.start(now); o.stop(now + dur + 0.05);
    });
    lp.connect(g); g.connect(this.master); g.connect(this.delay);
  }
  noise(t = 0, dur = 0.12, freq = 900, vol = 0.3) {
    const c = this.ctx; if (!c) return; const now = c.currentTime + t;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = freq;
    const g = c.createGain(); g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    s.connect(fl); fl.connect(g); g.connect(this.master); s.start(now, Math.random()); s.stop(now + dur);
  }
  hit() { this.noise(0, 0.1, 700, 0.35); this.pluck(110, 0, 0.15, 0.25); }
  hurt() { this.pluck(f(-12), 0, 0.2, 0.5); this.pluck(f(-11), 0.05, 0.15, 0.5); }
  swing() { this.noise(0, 0.08, 2500, 0.08); }
  sight(on) { (on ? [7, 12, 19, 24] : [24, 19, 12, 7]).forEach((s, i) => this.pluck(f(s), i * 0.05, 0.08, 1.2)); }
  chime() { [0, 7, 12, 15, 19, 24].forEach((s, i) => this.pluck(f(s), i * 0.08, 0.15, 2)); }
  wrong() { this.pluck(f(-5), 0, 0.15, 0.4); this.pluck(f(-6), 0.12, 0.15, 0.6); }
  laugh() { [12, 10, 7, 10, 7, 5].forEach((s, i) => this.pluck(f(s), i * 0.09, 0.12, 0.4)); }
  sleep() { [7, 5, 3, 0].forEach((s, i) => this.pluck(f(s), i * 0.12, 0.1, 0.9)); }
  restore() { for (let i = 0; i < 24; i++) this.pluck(f(SCALE[i % SCALE.length] + (i >= 12 ? 12 : 0)), i * 0.07, 0.13, 2.5); }
  setGray(g) { if (this.windGain) this.windGain.gain.setTargetAtTime(0.02 + 0.06 * g, this.ctx.currentTime, 1); }
  startMusic() {
    if (!this.ctx || this.musicOn) return; this.musicOn = true;
    const c = this.ctx;
    [f(-24), f(-17)].forEach((fr) => { // бурдон
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = fr;
      const g = c.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(0.05, c.currentTime + 4);
      o.connect(g); g.connect(this.master); o.start();
    });
    const phrases = [[0, 2, 3, 4, 3, 2, 1, 0], [4, 4, 5, 4, 3, 2, 3, -1], [7, 6, 4, 5, 4, 3, 2, 0], [2, 3, 4, 2, 1, 2, 0, -1]];
    let step = 0, next = c.currentTime + 0.5; const beat = 0.32;
    this._music = setInterval(() => {
      while (next < c.currentTime + 0.4) {
        const ph = phrases[Math.floor(step / 8) % phrases.length]; const n = ph[step % 8];
        if (n >= 0) this.pluck(f(SCALE[n]), next - c.currentTime, 0.11, 1.3);
        if (step % 4 === 0) this.pluck(f(SCALE[[0, 3, 4, 0][Math.floor(step / 8) % 4]] - 12), next - c.currentTime, 0.09, 2);
        if (step % 2 === 1) this.noise(next - c.currentTime, 0.04, 4000, 0.03);
        step++; next += beat;
      }
    }, 100);
  }
}
