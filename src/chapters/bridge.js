// Глава 6. Калинов мост на реке Смородине — Илья Муромец (былина) и Змей Горыныч (русские народные сказки, свой пересказ).
// Илья сидит сиднем 33 года — его поднимает живая вода из Морского царства. Три головы Змея: загадка, бой, хитрость (Закон имени).
// Добрый финал: Горыныч вспоминает, что он — страж моста. Встреча всех четырёх героев на пиру.
import { near, dist2, makeSky, homePortal, campfire, rng, ringFx } from './common.js';
export default function bridge(ctx) {
  const { THREE, S, ui, toon, kit, npc, M, burst, player, colliders, interactables, hittables, wait } = ctx;
  const CX = -600, CZ = 600; const V = (x, z, y = 0) => new THREE.Vector3(x, y, z);
  const group = new THREE.Group(); group.name = 'bridge'; const R = rng(7331);
  const SPAWN = V(CX + 2, CZ + 44), VIL = V(CX - 12, CZ + 26), ILYA = V(CX - 9.5, CZ + 23.5), STONE = V(CX + 4.5, CZ + 11), GOR = V(CX, CZ - 13), FEAST = V(CX + 2, CZ - 30), FIRE = V(CX + 8, CZ + 30);
  const rz = (x) => CZ + 3.2 * Math.sin((x - CX) * 0.06);
  const riverD = (x, z) => Math.abs(z - rz(x));
  const onBridge = (x, z) => Math.abs(x - CX) < 2.4 && riverD(x, z) < 8;
  const H = (x, z) => {
    const lx = x - CX, lz = z - CZ, r = Math.hypot(lx, lz);
    let h = 1 + 0.8 * Math.sin(lx * 0.07) * Math.cos(lz * 0.05) + 0.3 * Math.sin(lx * 0.2 + lz * 0.13) + ctx.smooth(46, 62, r) * 11;
    h += 3 * Math.exp(-((x - GOR.x) ** 2 + (z - GOR.z) ** 2) / 90);
    const rd = riverD(x, z); h = h * ctx.smooth(3.6, 6.5, rd) - 1.6 * (1 - ctx.smooth(3.6, 6.5, rd));
    if (onBridge(x, z)) h = Math.max(h, 1.6 + 0.5 * Math.cos(Math.min(1, riverD(x, z) / 8) * Math.PI / 2));
    return h;
  };
  ctx.makeTerrain(CX, CZ, 160, 150, H, (x, z, y, c) => { const rd = riverD(x, z); const k = Math.sin(x * 0.33) * Math.cos(z * 0.29) * 0.04; if (rd < 5.5 && !onBridge(x, z)) c.setRGB(0.36, 0.22, 0.16); else if (z < rz(x)) c.setRGB(0.42 + k, 0.56 + k, 0.28); else c.setRGB(0.4 + k, 0.64 + k, 0.3); }, group);
  // огненная река Смородина
  const lavaM = new THREE.MeshBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: 0.92 });
  { const pts = [], idx = []; let n = 0; for (let x = CX - 75; x <= CX + 75; x += 1.5) { const z = rz(x); pts.push(x, -0.3, z - 4, x, -0.3, z + 4); if (n) idx.push((n - 1) * 2, (n - 1) * 2 + 1, n * 2, (n - 1) * 2 + 1, n * 2 + 1, n * 2); n++; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.setIndex(idx); const m = new THREE.Mesh(g, lavaM); m.material.side = THREE.DoubleSide; group.add(m); }
  const glowL = []; for (let i = 0; i < 5; i++) { const x = CX - 40 + i * 20; const L = new THREE.PointLight(0xff7a2a, 10, 22); L.position.set(x, 1.5, rz(x)); group.add(L); glowL.push(L); }
  // Калинов мост
  const brM = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0x8a5a3a, gradientMap: ctx.grad })), brM2 = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0x6a4028, gradientMap: ctx.grad }));
  const bridge = new THREE.Group(); bridge.position.set(CX, 0, rz(CX)); group.add(bridge);
  for (let i = -7; i <= 7; i++) { const z = i * 1.05; const y = H(CX, rz(CX) + z) - 0.12; const pl = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.22, 0.95), i % 2 ? brM : brM2); pl.position.set(0, y, z); bridge.add(pl); }
  const berry = new THREE.MeshBasicMaterial({ color: 0xe0202a });
  for (const s of [-1, 1]) for (let i = -7; i <= 7; i += 1) { const z = i * 1.05; const y = H(CX, rz(CX) + z); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.2, 6), brM2); post.position.set(s * 2.25, y + 0.5, z); bridge.add(post); if (i % 2 === 0) for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), berry); b.position.set(s * 2.3 + (R() - 0.5) * 0.2, y + 0.95 + R() * 0.25, z + (R() - 0.5) * 0.4); bridge.add(b); } }
  for (const s of [-1, 1]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 15.5), brM); rail.position.set(s * 2.25, H(CX, rz(CX)) + 1.05, 0); bridge.add(rail); }
  // калиновые кусты и природа
  function kalina(x, z) { const g = new THREE.Group(); g.position.set(x, H(x, z), z); group.add(g); const lm = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0x3f8a3a, gradientMap: ctx.grad })); for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.9 - i * 0.15, 8, 6), lm); b.position.set((R() - 0.5) * 0.8, 0.8 + i * 0.4, (R() - 0.5) * 0.8); g.add(b); } for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 5), berry); b.position.set((R() - 0.5) * 1.6, 0.8 + R() * 1.2, (R() - 0.5) * 1.6); g.add(b); } colliders.push({ x, z, r: 0.8 }); }
  for (let i = 0; i < 26; i++) { const x = CX - 50 + i * 4 + (R() - 0.5) * 2; if (Math.abs(x - CX) < 6) continue; for (const s of [-1, 1]) if (R() < 0.6) kalina(x, rz(x) + s * (7.5 + R() * 2)); }
  const zones = [[SPAWN, 10], [VIL, 10], [GOR, 12], [FEAST, 10], [FIRE, 4], [STONE, 3]];
  const free = (x, z) => zones.every(([p, r]) => Math.hypot(x - p.x, z - p.z) > r) && riverD(x, z) > 10;
  const TREES = ['tree_oak', 'tree_default', 'tree_detailed', 'tree_fat'];
  for (let i = 0; i < 120; i++) { const a = R() * 6.28, r = 10 + Math.sqrt(R()) * 52; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (!free(x, z)) continue; const o = ctx.P(TREES[i % 4], x, z, 4.5 + R() * 2.5, R() * 6, -0.1, group, H); if (r < 52) { colliders.push({ x, z, r: 0.7 }); ctx.camBlockers.push(o); } }
  const FL = ['flower_purpleA', 'flower_redA', 'flower_yellowA', 'grass_large'];
  for (let i = 0; i < 160; i++) { const a = R() * 6.28, r = 4 + R() * 48; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (riverD(x, z) < 6) continue; ctx.P(FL[i % 4], x, z, 4, R() * 6, 0, group, H); }
  // деревня Карачарово: изба Ильи
  const izba = new THREE.Group(); izba.position.copy(VIL).setY(H(VIL.x, VIL.z)); izba.rotation.y = 0.6; group.add(izba);
  { const log = toon(0xa8743e), roof = toon(0x7a4a2a), win = new THREE.MeshBasicMaterial({ color: 0xffd76a });
    for (let i = 0; i < 7; i++) { const a = M(new THREE.CylinderGeometry(0.24, 0.24, 5, 8), log, 0, 0.24 + i * 0.46, 2, izba); a.rotation.z = Math.PI / 2; const b = a.clone(); b.position.z = -2; izba.add(b); const c1 = M(new THREE.CylinderGeometry(0.24, 0.24, 4.4, 8), log, 2.3, 0.24 + i * 0.46, 0, izba); c1.rotation.x = Math.PI / 2; const c2 = c1.clone(); c2.position.x = -2.3; izba.add(c2); }
    const r1 = M(new THREE.BoxGeometry(5.6, 0.18, 3), roof, 0, 3.9, 1.05, izba); r1.rotation.x = 0.62; const r2 = M(new THREE.BoxGeometry(5.6, 0.18, 3), roof, 0, 3.9, -1.05, izba); r2.rotation.x = -0.62; // конёк вверх
    for (const gx of [-2.32, 2.32]) { const sh = new THREE.Shape(); sh.moveTo(-2.2, 0); sh.lineTo(2.2, 0); sh.lineTo(0, 1.6); sh.closePath(); const gm = new THREE.Mesh(new THREE.ShapeGeometry(sh), log); gm.material.side = THREE.DoubleSide; gm.position.set(gx, 3.2, 0); gm.rotation.y = Math.PI / 2; izba.add(gm); }
    M(new THREE.PlaneGeometry(0.8, 0.7), win, 1.1, 1.6, 2.26, izba); M(new THREE.BoxGeometry(1, 1.9, 0.1), toon(0x6a4020), -1, 0.95, 2.25, izba); }
  colliders.push({ x: VIL.x, z: VIL.z, r: 3 }); ctx.camBlockers.push(izba);
  const bench = new THREE.Group(); bench.position.copy(ILYA).setY(H(ILYA.x, ILYA.z)); bench.rotation.y = 0.6; group.add(bench); M(new THREE.BoxGeometry(1.8, 0.12, 0.5), toon(0x8a6038), 0, 0.5, 0, bench); for (const x of [-0.75, 0.75]) M(new THREE.BoxGeometry(0.12, 0.5, 0.45), toon(0x6a4020), x, 0.25, 0, bench);
  for (let i = 0; i < 6; i++) kit('town/fence', VIL.x - 6 + i * 3, VIL.z + 6, 3, Math.PI / 2, 0, group, H);
  kit('town/cart', VIL.x + 7, VIL.z + 2, 2.8, 0.4, 0, group, H); colliders.push({ x: VIL.x + 7, z: VIL.z + 2, r: 1.6 });
  const stone = ctx.P('stone_tallA', STONE.x, STONE.z, 4, 0.3, 0, group, H); colliders.push({ x: STONE.x, z: STONE.z, r: 1 });
  try { ctx.runeStone?.(stone, ['КАЛИНОВ МОСТ', 'РЕКА СМОРОДИНА', '', 'СТРАЖ МОСТА —', 'ГОРЫНЫЧ,', 'СЫН ГОРЫ'], { faces: [Math.atan2(SPAWN.x - STONE.x, SPAWN.z - STONE.z), Math.atan2(GOR.x - STONE.x, GOR.z - STONE.z)], unread: () => !ctx.st.bridge?.readStone }); } catch (e) { console.error('rune', e); }
  homePortal(ctx, group, SPAWN.x + 8, SPAWN.z + 1, H, -0.3); const HOME = V(SPAWN.x + 8, SPAWN.z + 1);
  const fire = campfire(ctx, group, FIRE.x, FIRE.z, H);
  const feastFire = campfire(ctx, group, FEAST.x, FEAST.z, H);
  { const tb = new THREE.Group(); tb.position.set(FEAST.x + 4.5, H(FEAST.x + 4.5, FEAST.z), FEAST.z); group.add(tb); M(new THREE.BoxGeometry(1.4, 0.12, 4), toon(0x9a6a3e), 0, 0.85, 0, tb); for (const [x, z] of [[-0.6, -1.8], [0.6, -1.8], [-0.6, 1.8], [0.6, 1.8]]) M(new THREE.BoxGeometry(0.12, 0.85, 0.12), toon(0x6a4020), x, 0.42, z, tb); for (let i = 0; i < 4; i++) M(new THREE.SphereGeometry(0.25, 8, 6), toon([0xe0a050, 0xe0302a, 0xffc93a, 0x9ae86a][i]), (i % 2 - 0.5) * 0.5, 1.05, -1.4 + i * 0.9, tb); colliders.push({ x: tb.position.x, z: tb.position.z, r: 1.4 }); }
  // ===== Змей Горыныч =====
  const gor = new THREE.Group(); gor.position.copy(GOR).setY(H(GOR.x, GOR.z)); group.add(gor);
  const gM = new THREE.MeshToonMaterial({ color: 0x3a8a3a, gradientMap: ctx.grad, emissive: 0x000000 }), gB = toon(0xd8c060), gW = toon(0x2a6a2a, { side: THREE.DoubleSide }), hornM = toon(0xf0e8d0);
  { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), gM); b.scale.set(3, 2.4, 3.8); b.position.y = 2.6; gor.add(b); const bl = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), gB); bl.scale.set(2.5, 1.9, 3.2); bl.position.set(0, 2.2, 0.6); gor.add(bl);
    for (const s of [-1, 1]) { const w = new THREE.Group(); w.position.set(s * 2.4, 4.2, -0.6); gor.add(w); const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(s * 6, 2.5); sh.lineTo(s * 5.4, -0.6); sh.lineTo(s * 3.4, -0.2); sh.lineTo(s * 2.4, -1.4); sh.lineTo(0, -0.6); const wm = new THREE.Mesh(new THREE.ShapeGeometry(sh), gW); wm.rotation.x = -0.25; w.add(wm); w.userData.s = s; gor.userData['wing' + s] = w;
      for (const z of [-1.4, 1.6]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.8, 8), gM); leg.position.set(s * 1.9, 0.9, z); gor.add(leg); } }
    let prev = new THREE.Vector3(0, 2.2, -3.4); for (let i = 0; i < 7; i++) { const t = new THREE.Mesh(new THREE.SphereGeometry(0.9 - i * 0.11, 10, 8), gM); t.position.set(Math.sin(i * 0.7) * 0.8, 1.6 - i * 0.18, -3.6 - i * 1.05); gor.add(t); } }
  const heads = [-1, 0, 1].map((k) => { const neck = new THREE.Group(); neck.position.set(k * 1.5, 4.2, 2.6); gor.add(neck); const segs = [];
    for (let i = 0; i < 5; i++) { const sg = new THREE.Mesh(new THREE.SphereGeometry(0.62 - i * 0.04, 10, 8), gM); neck.add(sg); segs.push(sg); }
    const head = new THREE.Group(); neck.add(head); const hm = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1, 1.5), gM); head.add(hm); const sn = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 1), gM); sn.position.set(0, -0.15, 1.1); head.add(sn);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe14a })); e.position.set(s * 0.45, 0.3, 0.7); head.add(e); const pu = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), new THREE.MeshBasicMaterial({ color: 0x111111 })); pu.position.set(s * 0.47, 0.3, 0.84); head.add(pu); const h = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.6, 6), hornM); h.position.set(s * 0.4, 0.75, -0.3); h.rotation.x = -0.6; head.add(h); }
    const nost = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), new THREE.MeshBasicMaterial({ color: 0x1a1a1a })); nost.position.set(0, 0, 1.62); head.add(nost);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(1.4, 7, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); flame.rotation.x = -Math.PI / 2; flame.position.z = 5; head.add(flame); flame.visible = false;
    return { k, neck, segs, head, flame, low: 0 }; });
  colliders.push({ x: GOR.x, z: GOR.z, r: 3.6 });
  const hp2 = { v: 3 }; let fightT = 0, breathing = 0;
  hittables.push({ pos: () => heads[1].head.getWorldPosition(new THREE.Vector3()), r: 2.2, ry: 4, heavy: true, cond: () => ctx.region().id === 'bridge' && st().stage === 3 && st().h2 !== true && heads[1].low > 0.6, onHit: (hero) => {
    if (hero !== 'ilya') { ui.toast('Огненную голову одолеет только богатырь — Илья Муромец (4)!', false, 2000); return; }
    hp2.v -= 1; S.hit(); ctx.shake(0.3); burst(heads[1].head.getWorldPosition(new THREE.Vector3()), 0xffe27a, 30, 4, 0.8); heads[1].low = 0; fightT = 3.2; gM.emissive.setHex(0xffffff); setTimeout(() => gM.emissive.setHex(0), 150);
    if (hp2.v <= 0) { st().h2 = true; ctx.save(); S.chime(); ui.toast('Огненная голова сдалась: «Уф! Ну и силища!»', true, 3000); setTimeout(() => { if (!ui.busy()) checkHeads(); }, 900); }
    else ui.toast(`Богатырский удар! Огненная голова ${3 - hp2.v}/3`, false, 1500);
  } });
  // ===== жители =====
  const ilya = npc('ilya'); ilya.root.position.copy(ILYA).setY(H(ILYA.x, ILYA.z) + 0.05); ilya.root.rotation.y = 0.6; group.add(ilya.root);
  const crew = {}; for (const k of ['ivan', 'vasilisa', 'finist', 'ilya']) { const ch = npc(k); ch.root.visible = false; group.add(ch.root); crew[k] = ch; }
  const st = () => { const b = ctx.st.bridge; b.stage ??= 0; return b; };
  const me = () => ctx.HERO_NAME[player.hero].split(' ')[0];
  const IL = 'Илья Муромец', GO = 'Змей Горыныч', G1 = 'Голова-загадочница', G2 = 'Голова огненная', G3 = 'Голова хитрая';
  async function ilyaTalk() {
    const b = st();
    if (b.stage === 0) {
      await ui.say(IL, ['(Богатырь сидит на лавке, могучий, да неподвижный.) Здравствуй, добрый человек. Я Илья, сын Иванович, из села Карачарова.', 'Тридцать лет и три года сижу сиднем: ни рукой, ни ногой. А за рекой Смородиной Змей Горыныч мост держит — никого не пускает…']);
      if (!ctx.st.sea?.water) { await ui.say(IL, ['Говорят, поднять меня может только живая вода. Да где ж её взять…']); b.stage = 1; ctx.save(); return; }
      b.stage = 1;
    }
    if (b.stage === 1) {
      if (!ctx.st.sea?.water) { await ui.say(IL, ['Живая вода… Она, сказывают, у Морского царя на дне морском.']); return; }
      const k = await ui.dialog(me(), '(У тебя фляга живой воды от Морского царя.)', ['Испей, Илья Иванович, живой воды!', 'Потом']);
      if (k !== 0) return;
      burst(ilya.root.position.clone().setY(ilya.root.position.y + 1.4), 0x9fe8ff, 60, 4, 1.4, 0.25); S.magic(); await wait(500);
      ilya.root.position.y = H(ILYA.x, ILYA.z) + 0.1; ilya.play('idle'); ilya.once('emote-yes'); S.fanfare(); ctx.shake(0.4);
      await ui.say(IL, ['(Илья встаёт — и земля под ним гудит!) Чую в себе силушку великую! Кабы был столб до неба — повернул бы всю землю!', 'Спасибо тебе, Сказитель. Сила моя — не для хвастовства, а чтоб слабых защищать. Пойдём к Калинову мосту!']);
      b.stage = 2; ctx.save(); ctx.unlockHero('ilya'); player.maxHp += 1; player.hp = player.maxHp;
      ctx.addBook('Илья Муромец', 'В селе Карачарове тридцать лет и три года сидел сиднем Илья, сын Иванович. Сказитель принёс ему живую воду со дна Морского царства — и встал Илья, и почуял силушку великую. «Сила — не для хвастовства, а чтоб слабых защищать», — сказал богатырь и пошёл к Калинову мосту.');
      ui.toast('💪 Илья Муромец: клавиша 4 · R — богатырский удар · удары ×2', true, 5500); return;
    }
    await ui.say(IL, b.stage >= 4 ? ['Застава богатырская у моста — дело хорошее. Горыныч сторожит, а я в гости захаживаю.'] : ['Идём к мосту! Огненную голову я на себя возьму (переключись на меня — 4).']);
  }
  async function stoneTalk() { await ui.say('Камень у моста', ['«Здесь, на реке Смородине, стоит Калинов мост. Сторожит его страж — ГОРЫНЫЧ, сын горы. Не разбойник он, а сторожевой змей: пропускает добрых, не пускает злых».', 'Ниже нацарапано: «Кто имя стражу напомнит — тот и пройдёт».']); st().readStone = true; ctx.save(); }
  const RIDDLES = [['Что в огне не горит и в воде не тонет?', ['Лёд', 'Камень', 'Пепел'], 0], ['Без рук, без ног, а ворота отворяет.', ['Ветер', 'Ключ', 'Змей'], 0], ['Течёт-течёт — не вытечет, бежит-бежит — не выбежит.', ['Река', 'Огонь', 'Время'], 0]];
  async function gorTalk() {
    const b = st();
    if (b.stage < 2) { await ui.say(GO, ['ХА-ХА-ХА! (три головы гогочут разом) Кто там? Ступай прочь, пока цел! Через Калинов мост не пройдёт никто!']); ui.toast('Сначала загляни в деревню — там богатырь сидит сиднем', false, 3000); return; }
    if (b.stage === 2) {
      await ui.say(GO, ['Кто идёт по Калинову мосту?! (земля дрожит, из пастей валит дым)', 'Нас трое — три головы. Каждая испытает тебя по-своему. Пройдёшь все три — пропустим. Нет — ступай домой!']);
      b.stage = 3; ctx.save(); S.setTheme('boss');
    }
    await checkHeads();
  }
  async function checkHeads() {
    const b = st(); if (b.stage !== 3) return;
    if (!b.h1) {
      await ui.say(G1, ['Я — голова-загадочница. Три загадки — Закон трёх! Ошибёшься — начнём сначала.']);
      let i = 0; while (i < 3) { const [q, opts0, ok] = RIDDLES[i]; const order = [0, 1, 2].sort(() => Math.random() - 0.5); const opts = order.map((j) => opts0[j]); const c = await ui.dialog(G1, `Загадка ${i + 1}: ${q}`, [...opts, 'Подумаю']); if (c === 3 || c < 0) return; if (order[c] === ok) { i++; S.chime(); } else { S.wrong(); await ui.say(G1, ['Хо-хо! Мимо! Сначала!']); i = 0; } }
      b.h1 = true; ctx.save(); await ui.say(G1, ['Ишь, умник… Ладно, моя взяла — то есть твоя. Пропускаю!']);
    }
    if (!b.h2) { await ui.say(G2, ['А я — голова огненная! Силой меряться будем! Как пригнусь пламенем дохнуть — тут и бей. Только богатырь меня одолеет.', 'Огонь мой — прикрывайся щитом (K / ПКМ) или отходи в сторону!']); if (player.hero !== 'ilya') ui.toast('Переключись на Илью Муромца (4)!', true, 3000); fightT = 2.5; return; }
    if (!b.h3) {
      await ui.say(G3, ['А я — голова хитрая. Скажи-ка мне, Сказитель… кто я такой? Как меня зовут? Я… я и сам забыл. Забудки съели.']);
      const opts = ['Ты — Змей-разбойник, гроза всех дорог!', 'Ты — Горыныч, сын горы, страж Калинова моста!', 'Ты — Кощей Бессмертный!', 'Не знаю…'];
      const c = await ui.dialog(G3, 'Ну? Кто я?', opts);
      if (c !== 1) { S.wrong(); await ui.say(G3, [c === 3 ? 'Вот и я не знаю… Прочти-ка камень у моста — там что-то написано.' : 'Не-ет… Не то. Не чую я этого имени в себе. (Может, подскажет камень у моста?)']); return; }
      b.h3 = true; ctx.save();
    }
    await gorDone();
  }
  async function gorDone() {
    const b = st(); S.setTheme('bridge'); S.restore(); heads.forEach((h) => (h.flame.visible = false));
    await ui.say(GO, ['(Все три головы замирают… и вдруг тихонько улыбаются.)', 'Горыныч… Страж Калинова моста… ВСПОМНИЛ! Мы не разбойники — мы сторожим мост, чтоб злые не прошли. А забудки нашептали, будто мы всех ненавидим.', 'Прости, Сказитель. Проходи. И друзей своих зови — путь открыт для добрых.']);
    await ui.say(GO, ['А вот тебе слово заветное — имя нашей реки. Огненная она, да не злая: отделяет сказку от яви, мир живых от тёмного царства. Река «Смородина».']);
    ctx.addWord('Смородина', 'огненная река на границе сказочного мира; через неё перекинут Калинов мост. Слово вспомнил Змей Горыныч, страж моста.');
    ctx.addBook('Змей Горыныч и Калинов мост', 'На реке Смородине, у Калинова моста, Змей Горыныч никого не пускал. Голова-загадочница задала три загадки, огненную голову одолел Илья Муромец, а хитрой голове Сказитель напомнил её имя: «Горыныч, страж Калинова моста». Змей вспомнил, что он не разбойник, а сторож, — и пропустил добрых людей.');
    b.stage = 4; ctx.save(); ui.toast('🔥 Путь через Калинов мост открыт! На том берегу — пир', true, 4000);
  }
  async function feast() {
    const b = st(); player.locked = true;
    const ks = ['ivan', 'vasilisa', 'finist', 'ilya']; const spots = ks.map((k, i) => { const a = -0.9 + i * 0.6; return V(FEAST.x + Math.sin(a) * 3.4, FEAST.z + Math.cos(a) * 3.4); });
    ks.forEach((k, i) => { const ch = crew[k]; ch.root.visible = k !== player.hero; ch.root.position.copy(spots[i]).setY(H(spots[i].x, spots[i].z)); ch.root.rotation.y = Math.atan2(FEAST.x - spots[i].x, FEAST.z - spots[i].z); ch.play('idle'); });
    const pi = ks.indexOf(player.hero); if (pi >= 0) { player.pos.copy(spots[pi]); player.pos.y = H(spots[pi].x, spots[pi].z); player.facing = Math.atan2(FEAST.x - spots[pi].x, FEAST.z - spots[pi].z); }
    ilya.root.visible = false; ctx.setCam({ pos: V(FEAST.x - 1, FEAST.z + 9.5, H(FEAST.x, FEAST.z) + 4.5), look: V(FEAST.x, FEAST.z, H(FEAST.x, FEAST.z) + 1.2) }); S.setTheme('finale');
    try {
      await ui.say('Сказитель', ['(У костра на том берегу Смородины собрались все четыре героя. Впервые — вместе.)']);
      await ui.say('Иван', ['Ну, братцы, вот мы и вместе! Дураку везёт — а с вами и подавно.']);
      await ui.say('Василиса Премудрая', ['Сила — у Ильи, крылья — у Финиста, удача — у Ивана, а у меня — премудрость. Вместе мы — целая сказка.']);
      await ui.say('Финист — Ясный Сокол', ['С высоты видно всё Тридевятое: лес, горы, реки, море — и всё снова в красках.']);
      await ui.say(IL, ['Тридцать лет и три года сидел я сиднем… Живая вода подняла меня, а вы научили: сила служит добру. Буду стоять заставой у Калинова моста — вместе с Горынычем.']);
      await ui.say(GO, ['(издалека, тихонько) А можно и мне пирожок? Я теперь страж, а не разбойник…']);
      await ui.say('Сказитель', ['И был пир на весь мир. А Сказитель записал в Книгу: «Когда герои вместе — никакая забудка не страшна».']);
      ks.forEach((k) => crew[k].once('emote-yes')); S.fanfare(); burst(V(FEAST.x, FEAST.z, H(FEAST.x, FEAST.z) + 2), 0xffe27a, 120, 7, 2, 0.3);
      b.stage = 5; b.done = true; ctx.save(); ui.toast('🎉 Все четыре героя вместе! Калинов мост — богатырская застава', true, 5000);
    } finally { ctx.setCam(null); player.locked = false; S.setTheme('bridge'); }
  }
  interactables.push(
    { label: () => (st().stage <= 1 ? 'Поговорить с богатырём на лавке' : 'Поговорить с Ильёй Муромцем'), pos: () => ilya.root.position, r: 3.4, cond: () => ilya.root.visible, act: ilyaTalk },
    { label: 'Прочитать камень у моста', pos: () => STONE, r: 3, act: stoneTalk },
    { label: () => (st().stage >= 4 ? 'Поговорить с Горынычем' : 'Говорить со Змеем Горынычем'), pos: () => V(GOR.x, GOR.z + 6), r: 6, prio: 1, act: async () => { if (st().stage >= 4) { await ui.say(GO, ['Стережём мост, Сказитель! Добрым — дорога, злым — от ворот поворот. (Все три головы кивают)']); return; } await gorTalk(); } },
    { label: 'Сесть к костру — пир героев', pos: () => FEAST, r: 5, prio: 2, cond: () => st().stage === 4, act: feast },
  );
  interactables.forEach((it) => { if (typeof it.label === 'function') { const f = it.label; Object.defineProperty(it, 'label', { get: f }); } });
  function objective() {
    const b = st();
    if (b.stage === 0) return [ilya.root.position, 'в деревню — там богатырь сидит на лавке'];
    if (b.stage === 1) return ctx.st.sea?.water ? [ilya.root.position, 'дай Илье живой воды'] : [HOME, 'нужна живая вода — из Морского царства'];
    if (b.stage === 2) return [V(GOR.x, GOR.z + 6), 'к Калинову мосту — там Змей Горыныч'];
    if (b.stage === 3) { if (!b.h1) return [V(GOR.x, GOR.z + 6), 'голова-загадочница ждёт (F)']; if (!b.h2) return [V(GOR.x, GOR.z + 6), player.hero === 'ilya' ? 'бей огненную голову, когда она пригнётся' : 'переключись на Илью (4) — бой с огненной головой']; return b.readStone ? [V(GOR.x, GOR.z + 6), 'напомни хитрой голове её имя'] : [STONE, 'прочти камень у моста — там имя стража']; }
    if (b.stage === 4) return [FEAST, 'через мост — на пир к костру'];
    return [HOME, 'домой — Тридевятое ждёт новых сказок'];
  }
  function tracker() {
    const b = st(); const ck = (v) => (v ? '☑' : '☐');
    if (b.stage <= 1) return `<b>🔥 Калинов мост</b><br>• Богатырь сидит сиднем<br>${ck(ctx.st.sea?.water)} Живая вода`;
    if (b.stage <= 3) return `<b>🐉 Змей Горыныч</b><br>${ck(b.h1)} Голова-загадочница — 3 загадки<br>${ck(b.h2)} Голова огненная — бой (Илья)<br>${ck(b.h3)} Голова хитрая — Закон имени`;
    if (b.stage === 4) return '<b>🔥 Калинов мост</b><br>• Пир на том берегу';
    return '<b>🔥 Застава у Калинова моста</b><br>☑ Все четыре героя вместе';
  }
  function life() { const b = st(); if (b.done) return 1; return [0.15, 0.2, 0.38, 0.45 + 0.12 * ((b.h1 ? 1 : 0) + (b.h2 ? 1 : 0) + (b.h3 ? 1 : 0)), 0.92][b.stage] ?? 1; }
  function update(dt, canMove) {
    const T = ctx.T(), b = st(); fire.update(dt, T); feastFire.update(dt, T); group.children.forEach((c) => c.userData.update && c.userData.update(dt));
    lavaM.color.setHSL(0.05 + Math.sin(T * 2) * 0.01, 1, 0.5 + Math.sin(T * 3.3) * 0.05); glowL.forEach((L, i) => (L.intensity = 9 + Math.sin(T * 4 + i) * 3));
    if (Math.random() < dt * 6) { const x = CX + (Math.random() - 0.5) * 100; burst(V(x, rz(x) + (Math.random() - 0.5) * 6, 0), 0xffa040, 4, 2, 1, 0.16); }
    // огненная река: только по мосту (Финист может перелететь повыше)
    const p = player.pos; const rd = riverD(p.x, p.z);
    if (rd < 4.2 && !onBridge(p.x, p.z) && p.y < 3.5 && canMove) { const side = p.z > rz(p.x) ? 1 : -1; p.z = rz(p.x) + side * 5.6; p.y = H(p.x, p.z); ctx.hurtPlayer(1, 'Река Смородина огненная! Переходи только по Калинову мосту'); }
    if (b.stage < 4 && p.z < rz(p.x) - 8.2 && Math.abs(p.x - CX) < 40 && canMove) { p.z = rz(p.x) - 7.8; ui.toast('Змей Горыныч не пускает дальше! (F — говорить)', false, 1500); }
    // Горыныч
    const tgt = V(p.x, p.z, p.y + 1);
    heads.forEach((h, i) => { const sway = Math.sin(T * 1.3 + i * 2) * 0.35; const lowK = h.low; const happy = b.stage >= 4;
      h.segs.forEach((sg, j) => { const t = (j + 1) / 5; sg.position.set(h.k * t * 1.2 + Math.sin(T * 1.3 + i * 2 + j * 0.5) * 0.25 * t, t * (3.4 - lowK * 6.6), t * (1.6 + lowK * 2.2)); });
      h.head.position.set(h.k * 1.4 + sway * 0.8, 4 - lowK * 7.4 + Math.sin(T * 2 + i) * 0.15, 2.2 + lowK * 3);
      const hp = h.head.getWorldPosition(new THREE.Vector3()); const d = tgt.clone().sub(hp); h.head.rotation.y = Math.atan2(d.x, d.z) - 0; h.head.rotation.x = happy ? Math.sin(T * 3 + i) * 0.15 : -Math.atan2(d.y, Math.hypot(d.x, d.z)) * 0.6; });
    for (const s of [-1, 1]) gor.userData['wing' + s].rotation.z = s * Math.sin(T * (b.stage === 3 ? 3 : 1)) * 0.2;
    // бой с огненной головой
    const h2 = heads[1];
    if (b.stage === 3 && b.h1 && !b.h2 && canMove && near(p, GOR, 16)) {
      fightT -= dt;
      if (fightT < 0 && h2.low === 0 && breathing <= 0) { breathing = 1.6; h2.flame.visible = true; S.noise(0, 1.4, 600, 0.18); }
      if (breathing > 0) { breathing -= dt; h2.flame.scale.set(1 + Math.sin(T * 30) * 0.08, 1, 1); const hp = h2.head.getWorldPosition(new THREE.Vector3()); const fwd = V(p.x - hp.x, p.z - hp.z).normalize(); const dd = Math.hypot(p.x - hp.x, p.z - hp.z);
        if (dd < 9 && Math.random() < dt * 3) { const blocking = ctx.mouseBlock(); if (!blocking) ctx.hurtPlayer(1, 'Пламя Горыныча! Прикройся щитом (K) или отойди'); else ui.toast('Щит держит пламя!', false, 600); }
        if (breathing <= 0) { h2.flame.visible = false; h2.low = 1; fightT = 2.2; ui.toast('Огненная голова пригнулась — бей!', false, 1400); } }
      else if (h2.low > 0) { fightT -= 0; h2.lowT = (h2.lowT || 0) + dt; if (h2.lowT > 2.2) { h2.low = 0; h2.lowT = 0; fightT = 2.4; } }
    } else if (b.stage !== 3 || b.h2) { h2.flame.visible = false; h2.low = 0; }
    if (h2.low > 0 && h2.lowT === undefined) h2.lowT = 0;
    // Илья и друзья
    if (b.stage <= 1) { ilya.play('sit'); ilya.root.position.y = H(ILYA.x, ILYA.z) + 0.05; } else if (b.stage < 5) { ilya.root.visible = !ctx.st.heroes.includes('ilya') || player.hero !== 'ilya'; if (near(p, ilya.root.position, 8)) { const d = p.clone().sub(ilya.root.position); ilya.root.rotation.y = Math.atan2(d.x, d.z); } }
    if (b.stage >= 5) { ilya.root.visible = false; ['ivan', 'vasilisa', 'finist', 'ilya'].forEach((k, i) => { const ch = crew[k]; ch.root.visible = k !== player.hero; if (!ch.root.userData.set) { const a = -0.9 + i * 0.6; ch.root.position.set(FEAST.x + Math.sin(a) * 3.4, 0, FEAST.z + Math.cos(a) * 3.4); ch.root.position.y = H(ch.root.position.x, ch.root.position.z); ch.root.rotation.y = Math.atan2(FEAST.x - ch.root.position.x, FEAST.z - ch.root.position.z); ch.root.userData.set = true; } }); }
  }
  function surface(x, z) { return onBridge(x, z) ? 'wood' : 'grass'; }
  function init() { const b = st(); if (b.stage >= 2) { ilya.play('idle'); ilya.root.position.y = H(ILYA.x, ILYA.z) + 0.1; } }
  function onSleep() { hp2.v = 3; }
  function onEnter() { const b = st(); if (b.stage === 3) S.setTheme('boss'); if (b.stage === 0) setTimeout(() => ui.toast('Пахнет дымом и калиной… За рекой кто-то гогочет в три голоса.', false, 4000), 2600); }
  const TP = [['Вход', () => SPAWN.clone()], ['Деревня Карачарово', () => VIL.clone().add(V(5, 6))], ['Калинов мост', () => V(CX, rz(CX) + 9)], ...(st().stage >= 4 ? [['Пир за мостом', () => FEAST.clone().add(V(0, 6))]] : [])];
  return {
    id: 'bridge', name: '🔥 Калинов мост — река Смородина', center: new THREE.Vector2(CX, CZ), radius: 54, H, group, music: 'bridge', water: false,
    sky: makeSky(THREE, 0xe08a4a, 0xffe0b0), sun: 2.2, fogNear: 40, fogFar: 150, amb: { wind: 0.05, water: 0 },
    mm: { bg: [70, 90, 60], land: [100, 160, 80] }, mmDraw: (c, X, Z, k, g) => { c.strokeStyle = g([140, 120, 110], [255, 110, 30]); c.lineWidth = 8 * k; c.beginPath(); for (let x = CX - 56; x < CX + 56; x += 3) c.lineTo(X(x), Z(rz(x))); c.stroke(); c.strokeStyle = '#8a5a3a'; c.lineWidth = 4 * k; c.beginPath(); c.moveTo(X(CX), Z(rz(CX) + 7)); c.lineTo(X(CX), Z(rz(CX) - 7)); c.stroke(); },
    icons: () => [['🛖', VIL.x, VIL.z], ['💪', ILYA.x, ILYA.z], ['🪨', STONE.x, STONE.z], ['🐉', GOR.x, GOR.z], ['🔥', FEAST.x, FEAST.z], ['🌀', HOME.x, HOME.z]],
    life, spawn: () => SPAWN.clone(), surface, tp: TP, objective, tracker, update, init, onEnter, onSleep,
  };
}
