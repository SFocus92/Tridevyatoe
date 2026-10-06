// Записанная озвучка: реплика играет mp3 из assets/voice, текст печатается в такт; бот считает покрытие реплик записями.
// node tools/test/run.js tools/test/recvoice.js   (BOT_STEPS=300 — сколько шагов бота)
module.exports = async (p, { url, errs }) => {
  const mp3 = []; p.on('request', (r) => { if (/assets\/voice\/.+\.mp3/.test(r.url())) mp3.push(r.url().split('/assets/voice/')[1]); });
  await p.goto(url); await p.waitForFunction(() => !document.getElementById('btnNew').disabled, null, { timeout: 90000 });
  await p.click('#btnNew');
  await p.waitForFunction(() => document.getElementById('loader')?.classList.contains('hidden') ?? true, null, { timeout: 120000 });
  await p.waitForTimeout(1500);
  // 1) живая реплика через настоящий onSpeak
  const r = await p.evaluate(async () => {
    const ui = window.__game.ui; for (let i = 0; i < 50 && !ui.voiceFind('Кот учёный', 'x'); i++) await new Promise((r) => setTimeout(r, 100));
    const line = 'Я Кот учёный. Днём и ночью я ходил по цепи кругом… а теперь сижу и не помню, куда идти. Цепь порвана.';
    const found = ui.voiceFind('Кот учёный', line);
    const ev = []; const A = HTMLMediaElement.prototype; const t0 = performance.now();
    for (const n of ['play', 'pause']) { const o = A[n]; A[n] = function () { const el = this; ev.push(n + '@' + Math.round(performance.now() - t0) + ':' + String(el.src).slice(0, 30)); if (!el.__dbg) { el.__dbg = 1; for (const k of ['ended', 'error', 'playing']) el.addEventListener(k, () => ev.push(k + '@' + Math.round(performance.now() - t0) + ' d=' + el.duration + ' t=' + el.currentTime + (el.error ? ' err=' + el.error.code + el.error.message : ''))); } const r = o.apply(el, arguments); if (r && r.catch) r.catch((e) => ev.push('reject ' + e.name)); return r; }; }
    const pr = ui.dialog('Кот учёный', line); const samples = [];
    for (let s = 0; s < 8; s++) { await new Promise((r) => setTimeout(r, 500)); samples.push(document.getElementById('dText').textContent.length); }
    ui._advance(); ui._advance();
    return { found: JSON.stringify(found), samples: samples.join(',') + ' EV ' + ev.join(' ') };
  });
  console.log('LOG live', r.found, 'typing', r.samples, 'mp3 requests', mp3.length, mp3.slice(0, 3).join(' '));
  // 2) покрытие: бот проходит игру, каждая реплика проверяется на запись
  await p.addScriptTag({ path: 'tools/test/bot_inject.js' });
  const steps = +(process.env.BOT_STEPS || 250);
  const cov = await p.evaluate(async (steps) => {
    const g = window.__game, ui = g.ui; const hit = [], miss = []; ui.askName = () => Promise.resolve('Маша'); // бот не печатает имя
    const wrap = () => { const orig = ui.dialog; if (orig.__w) return; const w = function (s, t, c) { try { if (String(t).replace(/\([^)]*\)/g, '').replace(/[\s.,!?…—-]/g, '')) (ui.voiceFind(s, t) ? hit : miss).push(s + ': ' + t); } catch (e) { miss.push('ERR ' + e.message); } return orig.call(ui, s, t, c); }; w.__w = 1; ui.dialog = w; };
    const run = window.__bot({ max: steps, stuck: 60 }); wrap(); // __bot подменяет ui.dialog синхронно в начале — оборачиваем поверх
    try { await run; } catch {}
    return { hit: hit.length, miss: [...new Set(miss)] };
  }, steps);
  console.log('LOG coverage hit', cov.hit, 'miss', cov.miss.length); cov.miss.slice(0, 40).forEach((m) => console.log('LOG   miss', m.slice(0, 160)));
  console.log('ERRORS', errs.length, errs.slice(0, 3).join(' / '));
};
