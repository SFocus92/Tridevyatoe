// ---------- механики ----------
function toggleSight(force) {
  const on = force !== undefined ? force : !player.sight;
  if (on && player.word < 5) { ui.toast('Не хватает Слова. Отдохни у костра.'); S.wrong(); return; }
  if (on === player.sight) return;
  player.sight = on; document.body.classList.toggle('sight', on); S.sight(on);
}
function hurtEnemy(e, dmg, from) {
  if (!e.alive) return false;
  if (e.cond && !e.cond()) { e.flash = 0.1; if (e.immune) ui.toast(e.immune, false, 1400); return false; }
  const d = e.g.position.clone().sub(from); d.y = 0; d.normalize();
  e.hp -= dmg; e.flash = 0.2; e.kb.copy(d).multiplyScalar(9 * (e.heavy ? 0.2 : 1));
  burst(e.g.position, 0xffffff, 12, 3, 0.5, 0.18);
  if (e.hp <= 0) { e.alive = false; e.dying = 1; S.sleep(); ui.toast((e.name || 'Забудка') + ' уснула 💤'); burst(e.g.position, 0xffe27a, 40, 4, 1.2); e.onDeath && e.onDeath(e); if (e.group === 'grove') checkGrove(); }
  return true;
}
const hittables = []; // {pos(), r, cond(), onHit(hero)} — то, что можно ударить (лёд, сундук…)
const orbs = [];
function attack() {
  if (player.attackT > 0 || ui.busy() || player.locked) return;
  const hero = player.hero; const H0 = heroes[hero];
  player.attackT = hero === 'finist' ? 0.26 : 0.38; S.swing();
  H0.once(hero === 'vasilisa' ? 'interact-right' : 'attack-melee-right', 'idle', hero === 'finist' ? 1.7 : 1.3);
  const fwd = new THREE.Vector3(Math.sin(player.facing), 0, Math.cos(player.facing));
  if (hero === 'vasilisa') { // волшебный огонёк-клубок: летит к ближайшей цели впереди
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), new THREE.MeshBasicMaterial({ color: 0x9fe8ff }));
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 8), new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); m.add(glow);
    m.position.copy(player.pos).add(new THREE.Vector3(0, 1.4, 0)).addScaledVector(fwd, 0.8); scene.add(m);
    let tgt = null, best = 18;
    const consider = (q, extra) => { const d = q.clone().sub(m.position); const L = d.length(); if (L < best + extra && L > 0.5) { const f = d.clone().setY(0).normalize().dot(fwd); if (f > 0.55) { best = L - extra; tgt = q; } } };
    for (const e of enemies) if (e.alive && e.g.parent?.visible) consider(e.g.position.clone(), 0);
    for (const h of hittables) if (!h.cond || h.cond()) consider(h.pos(), 2);
    const v = tgt ? tgt.clone().sub(m.position).normalize().multiplyScalar(18) : fwd.clone().multiplyScalar(18);
    orbs.push({ m, v, t: 0, tgt }); S.magic(); return;
  }
  let hitAny = false; const reach = hero === 'finist' ? 3.2 : 2.8;
  for (const e of enemies) {
    if (!e.alive || !e.g.parent?.visible) continue;
    const d = e.g.position.clone().sub(player.pos); const dy = Math.abs(d.y); d.y = 0;
    if (d.length() < reach + (e.big || 0) && dy < 4 + (e.big || 0) && d.normalize().dot(fwd) > 0.2) {
      const dmg = (player.buffT > 0 ? 3 : 1) * (player.sight ? 2 : 1) * (hero === 'ivan' ? 1.5 : 1);
      if (hurtEnemy(e, dmg, player.pos)) hitAny = true;
    }
  }
  for (const h of hittables) { if (h.cond && !h.cond()) continue; const hp = h.pos(); const d = hp.clone().sub(player.pos); if (Math.hypot(d.x, d.z) < (h.r || 3) + 0.8 && Math.abs(d.y) < (h.ry || 3)) { h.onHit(hero); hitAny = true; } }
  if (hitAny) S.hit();
  if (region === LUK && player.pos.distanceTo(KIKI_POS) < 3 && !st.links.kiki) { ui.toast('Кикимору силой не взять! Её надо… рассмешить. (F)'); S.laugh(); }
}
function checkGrove() {
  const g = enemies.filter((e) => e.group === 'grove');
  if (g.length && g.every((e) => !e.alive) && !st.groveCleared) {
    st.groveCleared = true; save();
    setTimeout(() => { ui.toast('Роща притихла… Что-то блеснуло — но глазами не видно.'); }, 900);
  }
}
const LUCK = [
  ['Богатырская сила! Урон ×3 на 8 секунд', () => (player.buffT = 8)],
  ['Апчхи! Иван чихнул — всех вокруг разметало!', () => { enemies.forEach((e) => { if (!e.alive || !e.g.parent?.visible) return; const d = e.g.position.clone().sub(player.pos); d.y = 0; if (d.length() < 9) { e.kb.copy(d.normalize()).multiplyScalar(22); hurtEnemy(e, 1, player.pos); } }); burst(player.pos.clone().setY(player.pos.y + 1.6), 0xffffff, 50, 8, 0.8); }],
  ['В кармане нашёлся пряник! +2 ❤', () => (player.hp = Math.min(player.maxHp, player.hp + 2))],
  ['Вороны засмеялись… и всё. Зато весело! 😄', () => {}],
  ['Попутный ветер! Скорость ×1.6 на 8 секунд', () => (player.speedT = 8)],
];
function ability() {
  if (ui.busy() || player.locked) return;
  if (player.luckCd > 0) { ui.toast(player.hero === 'ivan' ? 'Удача ещё не вернулась.' : 'Сила ещё не вернулась.'); return; }
  const h = player.hero;
  if (h === 'ivan') { const [txt, fn] = LUCK[Math.floor(Math.random() * LUCK.length)]; fn(); player.luckCd = 25; ui.toast('🍀 ' + txt); S.chime(); heroes.ivan.once('emote-yes'); }
  else if (h === 'vasilisa') {
    player.hp = Math.min(player.maxHp, player.hp + 2); player.word = Math.min(100, player.word + 40); player.luckCd = 30; S.magic(); heroes.vasilisa.once('emote-yes');
    burst(player.pos.clone().setY(player.pos.y + 1.4), 0x9fe8ff, 40, 4, 1);
    const [, txt] = objective(); ui.toast('📘 Премудрость: +2 ❤, +Слово. Подсказка: ' + txt, false, 4500);
  } else if (h === 'finist') { player.dashT = 0.28; player.luckCd = 3.5; S.dash(); burst(player.pos.clone().setY(player.pos.y + 1), 0xffe0a0, 20, 3, 0.5); player.vy = Math.max(player.vy, 3); }
}
function heroLabel() {
  const h = player.hero; const cd = player.luckCd;
  const nm = h === 'ivan' ? '🍀 R — Удача дурака' : h === 'vasilisa' ? '📘 R — Премудрость' : '🦅 R — рывок · Пробел×2 — полёт';
  return `${HERO_NAME[h]} · ${cd <= 0 ? nm + ': готово' : nm.replace(/R — /, '') + ': ' + Math.ceil(cd) + ' с'}`;
}
function jump() {
  const p = player; if (ui.busy() || p.locked) return;
  if (p.onGround) { p.vy = p.hero === 'finist' ? 10 : 9; p.onGround = false; p.jumps = 1; S.jump(); }
  else if (p.hero === 'finist' && p.jumps < 2) { p.vy = 11; p.jumps = 2; S.dash(); burst(p.pos.clone().setY(p.pos.y + 1), 0xffe0a0, 14, 3, 0.5); }
}
function damagePlayer(e) {
  const toE = e.g.position.clone().sub(player.pos); toE.y = 0; toE.normalize();
  const fwd = new THREE.Vector3(Math.sin(player.facing), 0, Math.cos(player.facing));
  const blocking = keys.has('KeyK') || mouseBlock;
  if (blocking && fwd.dot(toE) > 0.1) { ui.toast('Блок!', false, 800); e.kb.copy(toE).multiplyScalar(12); S.hit(); return; }
  e.kb.copy(toE).multiplyScalar(6); hurtPlayer(e.dmg || 1);
}
function hurtPlayer(n = 1, why, force = false) {
  if (player.hurtT > 0 && !force) return; if (player.locked && !force) return;
  player.hp -= n; player.hurtT = 0.5; S.hurt(); shake(0.25); heroes[player.hero].once('emote-no', 'idle', 2);
  if (why) ui.toast(why, false, 2200);
  if (player.hp <= 0) fallAsleep();
}
let shakeT = 0; const shake = (k = 0.4) => (shakeT = Math.max(shakeT, k));
async function fallAsleep() {
  player.locked = true; const fade = document.getElementById('fade'); fade.style.opacity = 1; toggleSight(false);
  ui.toast(`${HERO_NAME[player.hero]} засыпает… Сказки не умирают — они засыпают.`, true, 3000);
  await wait(1400);
  if (region === LUK) { player.pos.set(FIRE3.x + 2, FIRE3.y, FIRE3.z + 2.5); spawnEnemies(); }
  else { const sp = region.spawn(); player.pos.set(sp.x, groundH(sp.x, sp.z), sp.z); region.onSleep && region.onSleep(); }
  player.hp = player.maxHp; player.word = 100; player.luckCd = 0; player.cold = 0; player.vy = 0;
  fade.style.opacity = 0; player.locked = false;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
