// новая игра → кот → ввод имени → проверка обращения и сердечек
module.exports = async (p, { url, errs }) => {
  await p.goto(url); await p.waitForFunction(() => !document.getElementById('btnNew').disabled, null, { timeout: 90000 });
  await p.click('#btnNew');
  await p.waitForFunction(() => document.getElementById('loader')?.classList.contains('hidden') ?? true, null, { timeout: 120000 }); await p.waitForTimeout(2500);
  // пропустить вступление, если есть
  for (let i = 0; i < 30 && await p.evaluate(() => window.__game.ui.dialogOpen); i++) { await p.keyboard.press('Space'); await p.waitForTimeout(250); }
  await p.evaluate(() => { const g = window.__game; g.player.pos.copy(g.ctx.cat.position).add(new g.THREE.Vector3(1.5, 0, 0)); });
  await p.waitForTimeout(500);
  p.evaluate(() => window.__game.interact());
  for (let i = 0; i < 20 && !(await p.$('#nameIn')); i++) { await p.keyboard.press('Space'); await p.waitForTimeout(300); }
  await p.screenshot({ path: 'nm1.png' });
  await p.type('#nameIn', 'наталья'); await p.keyboard.press('KeyW'); await p.keyboard.press('Enter'); await p.waitForTimeout(600);
  await p.screenshot({ path: 'nm2.png' });
  const texts = [];
  for (let i = 0; i < 25 && await p.evaluate(() => window.__game.ui.dialogOpen); i++) { texts.push(await p.evaluate(() => document.getElementById('dText').textContent)); await p.keyboard.press('Space'); await p.waitForTimeout(400); }
  const r = await p.evaluate(() => ({ name: window.__game.st().name, stage: window.__game.st().stage }));
  console.log('LOG name', JSON.stringify(r)); console.log('LOG texts', JSON.stringify([...new Set(texts)].filter((t) => /Натал|Сказит/.test(t))));
  await p.evaluate(() => { const g = window.__game; g.player.hp = Math.max(1, g.player.maxHp - 2); }); await p.waitForTimeout(400);
  await p.screenshot({ path: 'nm3.png', clip: { x: 0, y: 0, width: 420, height: 110 } });
  console.log('ERRORS', errs.length, errs.slice(0, 3).join(' / '));
};
