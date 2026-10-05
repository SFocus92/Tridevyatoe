// Дымовой тест: новая игра, 5 секунд ходьбы, скриншот, счётчик ошибок.
// node tools/test/run.js tools/test/smoke.js
module.exports = async (p, { url, errs }) => {
  await p.goto(url); await p.waitForFunction(() => !document.getElementById('btnNew').disabled, null, { timeout: 90000 });
  await p.click('#btnNew');
  await p.waitForFunction(() => document.getElementById('loader')?.classList.contains('hidden') ?? true, null, { timeout: 120000 });
  await p.waitForTimeout(2000);
  await p.evaluate(() => window.__game.keys.add('KeyW')); await p.waitForTimeout(3000); await p.evaluate(() => window.__game.keys.delete('KeyW'));
  await p.screenshot({ path: 'smoke.png' });
  console.log('LOG region', await p.evaluate(() => window.__game.region().id));
  console.log('ERRORS', errs.length, errs.slice(0, 3).join(' / '));
};
