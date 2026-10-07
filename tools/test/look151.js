// 1.5.1: конь без рогов, перо у избы бабки, оформление окна сказа
module.exports = async (p, { url, errs }) => {
  await p.goto(url); await p.waitForFunction(() => !document.getElementById('btnNew').disabled, null, { timeout: 90000 });
  await p.click('#btnNew');
  await p.waitForFunction(() => document.getElementById('loader')?.classList.contains('hidden') ?? true, null, { timeout: 120000 }); await p.waitForTimeout(2500);
  for (let i = 0; i < 30 && await p.evaluate(() => window.__game.ui.dialogOpen); i++) { await p.keyboard.press('Space'); await p.waitForTimeout(250); }
  await p.evaluate(() => { const g = window.__game, T = g.THREE; g.player.pos.set(-36, g.groundH(-36, 4), 4); g.cam.yaw = 0;
    for (const [x, z, ry] of [[-34, 0, 0.6], [-31.5, 1, -1.2]]) { const h = g.ctx.horse(1.55); h.root.position.set(x, g.groundH(x, z), z); h.root.rotation.y = ry; g.scene.add(h.root); } });
  await p.waitForTimeout(2500); await p.screenshot({ path: '/tmp/l1.png' });
  await p.evaluate(() => { const g = window.__game; g.player.pos.set(-43, g.groundH(-43, 2), 2); g.cam.yaw = 0; });
  await p.waitForTimeout(2000); await p.screenshot({ path: '/tmp/l2.png' });
  p.evaluate(() => window.__game.ui.say('Кот учёный', ['(Мурлычет.) Здравствуй, Сказитель! Садись поближе — расскажу тебе сказку про Сивку-Бурку, вещую каурку.'])).catch(() => {});
  await p.waitForTimeout(1500); await p.screenshot({ path: '/tmp/l3.png' });
  await p.keyboard.press('Space'); await p.waitForTimeout(300); await p.keyboard.press('Space'); await p.waitForTimeout(300);
  p.evaluate(() => window.__game.ui.dialog('Баба-Яга', 'Зачем пожаловал, добрый молодец?', ['«Дело пытаю, бабушка!»', '«Заблудился я…»', '«Накорми, напои, а потом расспрашивай!»'])).catch(() => {});
  await p.waitForTimeout(1200); await p.screenshot({ path: '/tmp/l4.png' });
  await p.evaluate(() => window.__game.ui.toast('🪶 Перо Жар-птицы найдено! (1/7)', false, 4000)); await p.waitForTimeout(400);
  await p.screenshot({ path: '/tmp/l5.png' });
  const fe = await p.evaluate(() => { const g = window.__game; const out = []; g.scene.traverse((o) => { if (/feather/i.test(o.name)) out.push([o.name, o.position.x.toFixed(1), o.position.z.toFixed(1)]); }); return out.slice(0, 10); });
  console.log('LOG feathers', JSON.stringify(fe));
  console.log('ERRORS', errs.length, errs.slice(0, 3).join(' / '));
};
