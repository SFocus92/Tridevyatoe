// iPhone-подобная среда: нет Pointer Lock — «Действие» и разговор должны работать
module.exports = async (p, { url, errs }) => {
  await p.addInitScript(() => { try { delete Document.prototype.exitPointerLock; delete Element.prototype.requestPointerLock; } catch (e) {} });
  await p.goto(url); await p.waitForFunction(() => !document.getElementById('btnNew').disabled, null, { timeout: 90000 });
  console.log('LOG exitPointerLock', await p.evaluate(() => (Object.getOwnPropertyDescriptor(document, 'exitPointerLock') ? 'заглушка' : 'родной') + ' ' + typeof document.exitPointerLock));
  await p.click('#btnNew');
  await p.waitForFunction(() => document.getElementById('loader')?.classList.contains('hidden') ?? true, null, { timeout: 120000 }); await p.waitForTimeout(2500);
  for (let i = 0; i < 30 && await p.evaluate(() => window.__game.ui.dialogOpen); i++) { await p.keyboard.press('Space'); await p.waitForTimeout(250); }
  await p.evaluate(() => { const g = window.__game; g.player.pos.copy(g.ctx.cat.position).add(new g.THREE.Vector3(1.5, 0, 0)); });
  await p.waitForTimeout(600);
  p.evaluate(() => window.__game.interact()).catch(() => {});
  await p.waitForTimeout(1500);
  console.log('LOG dialogOpen after interact', await p.evaluate(() => window.__game.ui.dialogOpen));
  console.log('ERRORS', errs.length, errs.slice(0, 3).join(' / '));
};
