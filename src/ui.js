const KEYICON = { F: '✋', Q: '👁', R: '✨', B: '📖', T: '🐟', J: '⚔', K: '🛡', H: '', P: '⚙' };
export const isTouchDevice = () => matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
// на телефоне подсказки вида «Нажми Q», «(F)», «клавише T» показываем значками кнопок
export function touchText(t) {
  if (!t || !document.body.classList.contains('touch')) return t;
  return String(t)
    .replace(/\(([FQRBTJK])\)/g, (m, k) => `(${KEYICON[k]})`)
    .replace(/([Нн]ажми|[Нн]ажать|клавиш[аеуиы]?|кнопк[аеуи]) ([FQRBTJK])(?![a-zA-Z])/g, (m, w, k) => `${w} ${KEYICON[k]}`)
    .replace(/(^|[\s«(>])([FQRBTJK]) — /g, (m, a, k) => `${a}${KEYICON[k]} — `)
    .replace(/[Пп]робел/g, (m) => (m[0] === 'П' ? 'Кнопка ⤴' : 'кнопка ⤴'))
    .replace(/ЛКМ\/J|ЛКМ/g, '⚔').replace(/ПКМ\/K|ПКМ/g, '🛡');
}
const HEART = (on) => `<svg class="hrt${on ? '' : ' off'}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
// v1.4.2: имя игрока — подставляется вместо обращения «Сказитель» (только в обращениях: «Спасибо, Сказитель!», «Сказитель, выручи!»)
export function cleanName(s) { s = String(s || '').replace(/[^A-Za-zА-Яа-яЁё\- ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16); return s ? s[0].toUpperCase() + s.slice(1) : ''; }
export function personal(text, name) {
  if (!name || typeof text !== 'string') return text;
  return text.replace(/(^|[,!?.…(] )Сказитель(?=[,.!?…:)]|$)/g, (m, a) => a + name).replace(/^Сказитель(?=[,!])/g, name);
}
export class UI {
  constructor() {
    this.$ = (id) => document.getElementById(id);
    this.dialogOpen = false; this.bookOpen = false; this._cache = {};
    this._resolve = null; this._choices = null; this._openedAt = 0; this._typing = null;
    window.addEventListener('keydown', (e) => this._key(e));
    this.$('dialog').addEventListener('click', (e) => { if (e.target.tagName !== 'BUTTON') this._advance(); });
  }
  // окошко «Как тебя зовут?» — ребёнок вводит имя; пустое — остаётся «Сказитель»
  askName(speaker, question, cur = '') {
    return new Promise((res) => {
      try { document.exitPointerLock && document.exitPointerLock(); } catch {}
      this.dialogOpen = true; document.body.classList.add('dlg');
      const box = document.createElement('div'); box.id = 'nameBox';
      box.innerHTML = `<div class="nbIn"><b></b><p></p><input id="nameIn" maxlength="16" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Твоё имя"><div><button id="nameOk">Это я!</button> <button id="nameSkip" class="muted">Зови Сказителем</button></div></div>`;
      box.querySelector('b').textContent = speaker; box.querySelector('p').textContent = question;
      document.body.appendChild(box);
      const inp = box.querySelector('#nameIn'); inp.value = cur;
      const done = (v) => { box.remove(); this.dialogOpen = false; document.body.classList.remove('dlg'); res(cleanName(v)); };
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') done(inp.value); });
      inp.addEventListener('keyup', (e) => e.stopPropagation());
      box.querySelector('#nameOk').onclick = () => done(inp.value);
      box.querySelector('#nameSkip').onclick = () => done('');
      setTimeout(() => inp.focus(), 50);
    });
  }
  busy() { return this.dialogOpen || this.bookOpen; }
  set(id, html) { if (this._cache[id] !== html) { this._cache[id] = html; this.$(id).innerHTML = html; } }
  hud(p, label) {
    // v1.4.2: сердечки — SVG, всегда красные на любом устройстве; потерянные — прозрачные с красным контуром
    const hk = p.hp + '/' + p.maxHp;
    if (this._cache.hk !== hk) { this._cache.hk = hk; this.$('hearts').innerHTML = HEART(true).repeat(Math.max(0, p.hp)) + HEART(false).repeat(Math.max(0, p.maxHp - p.hp)); }
    const w = Math.round(p.word);
    if (this._cache.w !== w) { this._cache.w = w; this.$('word').style.width = w + '%'; }
    this.set('luck', touchText(label || ''));
  }
  tracker(html) { this.set('tracker', touchText(html)); }
  prompt(text) { const el = this.$('prompt'); if (this._cache.prompt !== text) { this._cache.prompt = text; el.textContent = touchText(text) || ''; el.style.display = text ? 'block' : 'none'; } }
  toast(text, big = false, ms = 2600) {
    const d = document.createElement('div'); d.className = 'toast' + (big ? ' big' : ''); d.textContent = personal(text, this.playerName ? this.playerName() : '');
    this.$('toasts').appendChild(d); setTimeout(() => d.remove(), ms);
  }
  dialog(speaker, text, choices = null) {
    this.dialogOpen = true; this._openedAt = performance.now(); document.body.classList.add('dlg');
    const nm = this.playerName ? this.playerName() : '';
    text = personal(touchText(text), nm); if (choices) choices = choices.map((c) => personal(touchText(c), nm));
    // озвучка: текст печатается в темпе голоса (начинает, когда голос зазвучал, и подтягивается по словам), а не убегает вперёд
    const sync = { on: false, started: false, said: 0, end: false };
    try { sync.on = !!(this.onSpeak && this.onSpeak(speaker, text, { start: () => (sync.started = true), word: (k) => { sync.got = true; sync.said = Math.max(sync.said, k); }, end: () => (sync.end = true) })); } catch {}
    const t0 = performance.now();
    this.$('dialog').classList.remove('hidden');
    this.$('dSpeaker').textContent = speaker;
    this.$('dHint').style.display = choices ? 'none' : 'block';
    const box = this.$('dChoices'); box.innerHTML = '';
    this._choices = choices;
    const t = this.$('dText'); t.textContent = '';
    let i = 0; clearInterval(this._typing);
    const showChoices = () => {
      if (!choices) return;
      choices.forEach((c, k) => {
        const b = document.createElement('button'); b.textContent = `${k + 1}. ${c}`;
        b.onclick = () => this._choose(k); box.appendChild(b);
      });
    };
    this._full = () => { clearInterval(this._typing); this._typing = null; t.textContent = text; if (!box.children.length) showChoices(); };
    const cps = 14 * (this.voiceRate ? this.voiceRate() : 1); // ≈ букв в секунду у голоса
    this._typing = setInterval(() => {
      if (!sync.on) i += 2;
      else {
        if (sync.end) i = text.length;
        else if (!sync.started && performance.now() - t0 < 900) return; // ждём, пока голос начнёт
        else { const said = Math.round(sync.said * text.length / Math.max(1, sync.cleanLen || text.length)); if (said > i) i = said; else if (!sync.got || i < said + 28) i += cps * 0.016; }
      }
      t.textContent = text.slice(0, Math.floor(i)); if (i >= text.length) this._full();
    }, 16);
    sync.cleanLen = this.cleanLen ? this.cleanLen(text) : text.length;
    return new Promise((res) => { this._resolve = res; });
  }
  _close(v) {
    this.dialogOpen = false; this.$('dialog').classList.add('hidden'); document.body.classList.remove('dlg');
    try { this.onHush && this.onHush(); } catch {}
    const r = this._resolve; this._resolve = null; r && r(v);
  }
  _choose(k) { if (this._typing) { this._full(); return; } this._close(k); }
  _advance() {
    if (performance.now() - this._openedAt < 180) return;
    if (this._typing) { this._full(); return; }
    if (!this._choices) this._close(-1);
  }
  _key(e) {
    if (this.dialogOpen) {
      if (['Space', 'Enter', 'KeyF', 'KeyE'].includes(e.code)) { e.preventDefault(); this._advance(); }
      const n = parseInt(e.key, 10);
      if (this._choices && n >= 1 && n <= this._choices.length && !this._typing) this._close(n - 1);
    }
  }
  // мини-игра «тянем-потянем»: остановить бегунок в зелёной зоне
  timing(title, speed = 1) {
    return new Promise((res) => {
      const box = this.$('timing'); box.classList.remove('hidden'); this.dialogOpen = true; document.body.classList.add('dlg');
      this.$('tTitle').textContent = title;
      const zone = this.$('tZone'), ptr = this.$('tPtr');
      const zw = 16 + Math.random() * 6, zx = 15 + Math.random() * (70 - zw); zone.style.left = zx + '%'; zone.style.width = zw + '%';
      let x = 0, dir = 1, last = performance.now(), done = false;
      const tick = (now) => { if (done) return; const dt = (now - last) / 1000; last = now; x += dir * dt * 95 * speed; if (x > 100) { x = 100; dir = -1; } if (x < 0) { x = 0; dir = 1; } ptr.style.left = x + '%'; requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      const stop = (e) => {
        if (e.type === 'keydown' && !['Space', 'KeyF', 'Enter'].includes(e.code)) return;
        e.preventDefault(); done = true; removeEventListener('keydown', stop); box.removeEventListener('pointerdown', stop);
        const ok = x >= zx && x <= zx + zw; ptr.classList.add(ok ? 'ok' : 'bad');
        setTimeout(() => { ptr.classList.remove('ok', 'bad'); box.classList.add('hidden'); this.dialogOpen = false; document.body.classList.remove('dlg'); res(ok); }, 550);
      };
      setTimeout(() => { addEventListener('keydown', stop); box.addEventListener('pointerdown', stop); }, 250);
    });
  }
  // мини-игра «гусли»: ноты бегут по трём струнам к золотой черте — жми 1/2/3 (или тапни струну) вовремя
  rhythm(title, { notes = 14, speed = 1, hint = '', onNote = null } = {}) {
    return new Promise((res) => {
      const touch = document.body.classList.contains('touch');
      const box = document.createElement('div'); box.id = 'rhythm';
      box.style.cssText = 'position:fixed;left:50%;bottom:18%;transform:translateX(-50%);width:min(560px,92vw);background:rgba(30,20,12,.9);border:2px solid #e8c070;border-radius:14px;padding:12px 14px;z-index:60;color:#fff3d8;font-family:Georgia,serif;text-align:center;user-select:none';
      box.innerHTML = `<div style="font-size:18px;margin-bottom:6px">${title}</div><div class="rl" style="position:relative;height:150px;overflow:hidden"></div><div class="rs" style="margin-top:6px;font-size:14px;opacity:.85"></div><div style="font-size:12px;opacity:.7;margin-top:2px">${touch ? 'Тапни по струне, когда нота у золотой черты' : '1 / 2 / 3 — струна, когда нота у золотой черты'}${hint ? ' · ' + hint : ''}</div>`;
      document.body.appendChild(box); this.dialogOpen = true; document.body.classList.add('dlg');
      const lanes = box.querySelector('.rl'), score = box.querySelector('.rs'); const COLS = ['#ffd26a', '#9fe8ff', '#ffa8c8']; const HX = 14;
      const strs = [0, 1, 2].map((k) => { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:0;right:0;top:${k * 50}px;height:50px;cursor:pointer`; d.innerHTML = `<div style="position:absolute;left:0;right:0;top:24px;height:3px;background:${COLS[k]};opacity:.55;border-radius:2px"></div><div style="position:absolute;left:4px;top:13px;font-size:15px;color:${COLS[k]}">${touch ? '' : k + 1}</div>`; lanes.appendChild(d); return d; });
      const line = document.createElement('div'); line.style.cssText = `position:absolute;top:0;bottom:0;left:${HX}%;width:4px;margin-left:-2px;background:#ffd23f;box-shadow:0 0 10px #ffd23f`; lanes.appendChild(line);
      const list = []; let t0 = performance.now(), hit = 0, miss = 0, done = false, gap = 0.62 / speed;
      for (let i = 0; i < notes; i++) { const el = document.createElement('div'); const ln = (i * 7 + Math.floor(i / 3)) % 3; el.style.cssText = `position:absolute;width:26px;height:26px;margin:-13px;border-radius:50%;background:${COLS[ln]};box-shadow:0 0 8px ${COLS[ln]};top:${ln * 50 + 25}px;left:110%`; lanes.appendChild(el); list.push({ el, ln, at: 1.6 + i * gap * (i % 4 === 3 ? 1.5 : 1) + Math.floor(i / 4) * gap * 0.5, st: 0 }); }
      const travel = 2.0 / speed; // секунд от правого края до черты
      const xOf = (n, t) => HX + ((n.at - t) / travel) * (100 - HX);
      const upd = () => { score.textContent = `Чисто: ${hit} · мимо: ${miss} · осталось ${list.filter((n) => !n.st).length}`; };
      const press = (ln) => {
        const t = (performance.now() - t0) / 1000; let best = null, bd = 9;
        for (const n of list) if (!n.st && n.ln === ln) { const d = Math.abs(n.at - t); if (d < bd) { bd = d; best = n; } }
        strs[ln].firstChild.style.opacity = 1; setTimeout(() => (strs[ln].firstChild.style.opacity = 0.55), 120);
        if (best && bd < 0.2) { best.st = 1; hit++; best.el.style.transform = 'scale(1.7)'; best.el.style.opacity = 0; best.el.style.transition = 'all .25s'; onNote && onNote(ln, true); }
        else { onNote && onNote(ln, false); }
        upd();
      };
      const key = (e) => { const k = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2, KeyA: 0, KeyS: 1, KeyD: 2 }[e.code]; if (k === undefined) return; e.preventDefault(); e.stopPropagation(); if (!e.repeat) press(k); };
      addEventListener('keydown', key, true);
      strs.forEach((d, k) => d.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); press(k); }));
      const tick = () => {
        if (done) return; const t = (performance.now() - t0) / 1000;
        for (const n of list) { if (n.st) continue; const x = xOf(n, t); n.el.style.left = x + '%'; if (n.at - t < -0.22) { n.st = 2; miss++; n.el.style.opacity = 0.15; upd(); } }
        if (list.every((n) => n.st)) { done = true; finish(); return; }
        requestAnimationFrame(tick);
      };
      const finish = () => { removeEventListener('keydown', key, true); setTimeout(() => { box.remove(); this.dialogOpen = false; document.body.classList.remove('dlg'); res(hit / notes); }, 500); };
      upd(); requestAnimationFrame(tick);
    });
  }
  async say(speaker, lines) { for (const l of lines) await this.dialog(speaker, l); }
  book(st, open) {
    this.bookOpen = open; this.$('book').classList.toggle('hidden', !open);
    if (!open) return;
    this.$('bookCount').textContent = `Сказы: ${st.book.length}/${this.totals?.book || 5} · Забытые слова: ${st.words.length}/${this.totals?.words || 5}`;
    this.$('bookList').innerHTML = st.book.length
      ? st.book.map((b) => `<div class="entry"><h4>${b.title}</h4><div>${b.text}</div></div>`).join('')
      : '<p class="muted">Пока пусто. Свяжи первую Нить Сказа.</p>';
    this.$('wordList').innerHTML = st.words.length ? st.words.map((w) => `<div class="entry"><b>${w.word}</b> — ${w.text}</div>`).join('') : '<p class="muted">Ни одного. Кот учёный иногда ошибается — слушай внимательно.</p>';
    const ex = this.$('extraList'); if (ex) ex.innerHTML = this.extra ? this.extra(st) : '';
  }
}
