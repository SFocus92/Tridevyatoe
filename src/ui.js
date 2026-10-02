export class UI {
  constructor() {
    this.$ = (id) => document.getElementById(id);
    this.dialogOpen = false; this.bookOpen = false; this._cache = {};
    this._resolve = null; this._choices = null; this._openedAt = 0; this._typing = null;
    window.addEventListener('keydown', (e) => this._key(e));
    this.$('dialog').addEventListener('click', (e) => { if (e.target.tagName !== 'BUTTON') this._advance(); });
  }
  busy() { return this.dialogOpen || this.bookOpen; }
  set(id, html) { if (this._cache[id] !== html) { this._cache[id] = html; this.$(id).innerHTML = html; } }
  hud(p) {
    this.set('hearts', '❤'.repeat(Math.max(0, p.hp)) + '<span style="opacity:.25">' + '❤'.repeat(Math.max(0, p.maxHp - p.hp)) + '</span>');
    const w = Math.round(p.word);
    if (this._cache.w !== w) { this._cache.w = w; this.$('word').style.width = w + '%'; }
    this.set('luck', p.luckCd <= 0 ? '🍀 R — Удача дурака: готова' : `🍀 Удача дурака: ${Math.ceil(p.luckCd)} с`);
  }
  tracker(html) { this.set('tracker', html); }
  prompt(text) { const el = this.$('prompt'); if (this._cache.prompt !== text) { this._cache.prompt = text; el.textContent = text || ''; el.style.display = text ? 'block' : 'none'; } }
  toast(text, big = false, ms = 2600) {
    const d = document.createElement('div'); d.className = 'toast' + (big ? ' big' : ''); d.textContent = text;
    this.$('toasts').appendChild(d); setTimeout(() => d.remove(), ms);
  }
  dialog(speaker, text, choices = null) {
    this.dialogOpen = true; this._openedAt = performance.now();
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
    this._typing = setInterval(() => { i += 2; t.textContent = text.slice(0, i); if (i >= text.length) this._full(); }, 16);
    return new Promise((res) => { this._resolve = res; });
  }
  _close(v) {
    this.dialogOpen = false; this.$('dialog').classList.add('hidden');
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
  async say(speaker, lines) { for (const l of lines) await this.dialog(speaker, l); }
  book(st, open) {
    this.bookOpen = open; this.$('book').classList.toggle('hidden', !open);
    if (!open) return;
    this.$('bookList').innerHTML = st.book.length
      ? st.book.map((b) => `<div class="entry"><h4>${b.title}</h4><div>${b.text}</div></div>`).join('')
      : '<p class="muted">Пока пусто. Свяжи первую Нить Сказа.</p>';
    this.$('wordList').innerHTML = st.words.length ? st.words.map((w) => `<div class="entry"><b>${w.word}</b> — ${w.text}</div>`).join('') : '<p class="muted">Ни одного. Кот учёный иногда ошибается — слушай внимательно.</p>';
  }
}
