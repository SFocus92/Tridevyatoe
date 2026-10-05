// фальшивый голос: старт через 400 мс, 11 букв/с, слова через onboundary (или без них) — сравниваем, насколько текст отстаёт/убегает
module.exports = async (p, { url, errs }) => {
  await p.goto(url); await p.waitForFunction(() => !document.getElementById('btnNew').disabled, null, { timeout: 90000 });
  const r = await p.evaluate(async () => {
    const { UI } = await import('./src/ui.js'); const ui = window.__game?.ui || new UI();
    const ev = await import('./src/evening.js');
    const res = [];
    for (const mode of ['words', 'nowords', 'words']) {
      let timers = [];
      ui.speechMap = (t) => { const m = []; let d = 0; for (let j = 0; j < t.length; j++) { const ch = t[j]; if (ch === '(') d++; else if (ch === ')') d--; else if (!d) m.push(j); } return m; };
      ui.voiceRateFor = () => 1;
      let spoken = 0, cleanTxt = '';
      ui.onSpeak = (who, text, h) => { cleanTxt = text.replace(/\([^)]*\)/g, ''); const cps = 11; const t0 = 400;
        timers.push(setTimeout(() => h.start(), t0));
        const re = /\S+/g; let m; while ((m = re.exec(cleanTxt))) { const ci = m.index, k = ci + m[0].length; timers.push(setTimeout(() => { spoken = k; if (mode === 'words') h.word(k, ci); }, t0 + ci / cps * 1000)); }
        timers.push(setTimeout(() => { spoken = cleanTxt.length; h.end(); }, t0 + cleanTxt.length / cps * 1000 + 200)); return true; };
      const txt = 'Мяу… то есть, здравствуй. (кот потягивается) Проснулся? Значит, ты — Сказитель. Я Кот учёный. Днём и ночью я ходил по цепи кругом, а теперь сижу и не помню, куда идти.';
      const pr = ui.dialog('Кот учёный', txt); const samples = [];
      for (let s = 0; s < 22; s++) { await new Promise((r) => setTimeout(r, 750)); const shown = document.getElementById('dText').textContent.replace(/\([^)]*\)?/g, '').length; samples.push(shown + ':' + spoken); }
      ui._advance && ui._advance(); ui._advance && ui._advance(); timers.forEach(clearTimeout);
      res.push(mode + ' cps=' + ui._cps.toFixed(1) + ' diff=' + samples.join(','));
    }
    return res; });
  console.log('LOG', r.join('\n'));
  console.log('ERRORS', errs.length, errs.slice(0, 3).join(' / '));
};
