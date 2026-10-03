// Глава 3. Молочные реки, кисельные берега — Гуси-лебеди
import { near, dist2, makeSky, homePortal, campfire, rng } from './common.js';
export default function river(ctx) {
  const { THREE, S, ui, toon, kit, npc, M, burst, player, colliders, interactables, wait } = ctx;
  const CX = -600, CZ = 0; const V = (x, z, y = 0) => new THREE.Vector3(x, y, z);
  const group = new THREE.Group(); group.name = 'river'; const R = rng(4242);
  const SPAWN = V(CX, CZ + 44), ALYO = V(CX - 4, CZ + 34), STOVE = V(CX - 30, CZ + 12), APPLE = V(CX + 26, CZ + 14), SPRING = V(CX - 6, CZ - 12), LAKE = V(CX, CZ - 32), HILL = V(CX + 17, CZ - 12), FIRE = V(CX + 6, CZ + 30);
  const rx = (z) => CX - 14 + 10 * Math.sin(z * 0.07);
  const riverD = (x, z) => (z > LAKE.z + 6 && z < CZ + 70 ? Math.abs(x - rx(z)) : 99);
  const lakeD = (x, z) => Math.hypot(x - LAKE.x, z - LAKE.z);
  const H = (x, z) => {
    const lx = x - CX, lz = z - CZ, r = Math.hypot(lx, lz);
    let h = 0.9 + 0.8 * Math.sin(lx * 0.06) * Math.cos(lz * 0.05) + 0.3 * Math.sin(lx * 0.19 + lz * 0.15);
    h += 9.5 * Math.exp(-((x - HILL.x) ** 2 + (z - HILL.z) ** 2) / 70) + ctx.smooth(48, 64, r) * 10;
    const rd = riverD(x, z); h = h * ctx.smooth(1.5, 4.5, rd) - 0.5 * (1 - ctx.smooth(1.5, 4.5, rd));
    const ld = lakeD(x, z); h = h * ctx.smooth(10, 13, ld) - 0.8 * (1 - ctx.smooth(10, 13, ld));
    h = Math.max(h, 8.4 * (1 - ctx.smooth(2.2, 3.2, ld))); // скала-гнездо
    return h;
  };
  ctx.makeTerrain(CX, CZ, 160, 150, H, (x, z, y, c) => { const rd = Math.min(riverD(x, z), Math.abs(lakeD(x, z) - 10.5) + 1.5); const ld = lakeD(x, z); if (ld < 3.3 && y > 1) c.setRGB(0.55, 0.5, 0.48); else if (rd < 4.6 && y < 1.2) c.setRGB(0.88, 0.5, 0.62); else { const k = Math.sin(x * 0.35) * Math.cos(z * 0.3) * 0.04; c.setRGB(0.38 + k, 0.66 + k, 0.3); } }, group);
  // молочная река и озеро
  const milkM = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0xfff6e8, gradientMap: ctx.grad, transparent: true, opacity: 0.92, emissive: 0x221a10 }));
  { const pts = []; const idx = []; let n = 0; for (let z = LAKE.z + 4; z <= CZ + 72; z += 1.5) { const x = rx(z); pts.push(x - 3.4, 0.1, z, x + 3.4, 0.1, z); if (n) idx.push((n - 1) * 2, n * 2, (n - 1) * 2 + 1, (n - 1) * 2 + 1, n * 2, n * 2 + 1); n++; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, milkM); m.material.side = THREE.DoubleSide; group.add(m); }
  const lake = new THREE.Mesh(new THREE.CircleGeometry(11.5, 40), milkM); lake.rotation.x = -Math.PI / 2; lake.position.set(LAKE.x, 0.1, LAKE.z); group.add(lake);
  // природа
  const zones = [[SPAWN, 12], [ALYO, 4], [STOVE, 5], [APPLE, 5], [SPRING, 4], [LAKE, 15], [HILL, 6], [FIRE, 4]];
  const free = (x, z) => zones.every(([p, r]) => Math.hypot(x - p.x, z - p.z) > r + 2) && riverD(x, z) > 5;
  const TREES = ['town/tree-high-round', 'town/tree-crooked', 'survival/tree-autumn', 'survival/tree-autumn-tall'];
  for (let i = 0; i < 170; i++) { const a = R() * 6.28, r = 8 + Math.sqrt(R()) * 62; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (!free(x, z)) continue; const n = TREES[Math.floor(R() * 4)]; const s = (n.startsWith('town') ? 3.4 : 5) + R() * 1.5; const o = kit(n, x, z, s * (r > 52 ? 1.3 : 1), R() * 6.28, -0.1, group, H); if (r < 52) { colliders.push({ x, z, r: 0.6 }); ctx.camBlockers.push(o); } }
  const FL = ['flower_purpleA', 'flower_redA', 'flower_yellowA', 'flower_yellowB', 'flower_redB'];
  for (let i = 0; i < 220; i++) { const a = R() * 6.28, r = 4 + R() * 48; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (riverD(x, z) < 4 || lakeD(x, z) < 13) continue; ctx.P(i % 3 ? FL[i % 5] : 'grass_large', x, z, 4, R() * 6, 0, group, H); }
  kit('town/watermill', rx(CZ + 22) + 4.2, CZ + 22, 3, -Math.PI / 2, 0.6, group, H); colliders.push({ x: rx(CZ + 22) + 4.2, z: CZ + 22, r: 2.6 });
  kit('town/windmill', HILL.x + 5, HILL.z + 3, 3.4, 2.4, 0, group, H); colliders.push({ x: HILL.x + 5, z: HILL.z + 3, r: 1.2 });
  for (let i = 0; i < 8; i++) kit('town/fence', ALYO.x - 6 + i * 3, ALYO.z + 6, 3, Math.PI / 2, 0, group, H);
  kit('town/cart', ALYO.x + 5, ALYO.z + 2, 2.8, 0.7, 0, group, H); colliders.push({ x: ALYO.x + 5, z: ALYO.z + 2, r: 1.6 });
  for (let i = 0; i < 7; i++) { const a = i * 0.9; kit('holiday/rocks-medium', LAKE.x + Math.cos(a) * 2.6, LAKE.z + Math.sin(a) * 2.6, 0.9, a, 7.6, group, () => 0); }
  const nest = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.45, 8, 20), toon(0x8a6a3a)); nest.rotation.x = -Math.PI / 2; nest.position.set(LAKE.x, 8.6, LAKE.z); group.add(nest);
  homePortal(ctx, group, SPAWN.x + 8, SPAWN.z + 1, H, -0.3); const HOME = V(SPAWN.x + 8, SPAWN.z + 1);
  const fire = campfire(ctx, group, FIRE.x, FIRE.z, H);
  // помощники: печка, яблонька, речка
  const stove = new THREE.Group(); stove.position.copy(STOVE).setY(H(STOVE.x, STOVE.z)); stove.rotation.y = 1.2; group.add(stove);
  const wM = toon(0xf4efe4), rM = toon(0xc8302a); M(new THREE.BoxGeometry(2.6, 2, 2.4), wM, 0, 1, 0, stove); M(new THREE.BoxGeometry(2.8, 0.3, 2.6), wM, 0, 2.15, 0, stove); M(new THREE.BoxGeometry(0.7, 1.6, 0.7), wM, 0.7, 3, -0.6, stove);
  const mouth = M(new THREE.CircleGeometry(0.6, 16, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x2a1a10 }), 0, 0.8, 1.21, stove); M(new THREE.BoxGeometry(2.62, 0.12, 0.05), rM, 0, 1.75, 1.21, stove);
  const glowS = new THREE.PointLight(0xff8a30, 6, 6); glowS.position.set(0, 0.9, 1.6); stove.add(glowS);
  for (const x of [-0.4, 0, 0.4]) M(new THREE.SphereGeometry(0.16, 8, 6), toon(0xc88a3a), x, 0.65, 1.3, stove).scale.y = 0.6;
  const eyesM = new THREE.MeshBasicMaterial({ color: 0x2a1a10 }); M(new THREE.SphereGeometry(0.09, 6, 6), eyesM, -0.45, 1.45, 1.22, stove); M(new THREE.SphereGeometry(0.09, 6, 6), eyesM, 0.45, 1.45, 1.22, stove);
  colliders.push({ x: STOVE.x, z: STOVE.z, r: 1.8 });
  const apple = ctx.P('tree_default', APPLE.x, APPLE.z, 7, 0.4, 0, group, H); colliders.push({ x: APPLE.x, z: APPLE.z, r: 0.9 }); ctx.camBlockers.push(apple);
  const appleM = toon(0xe0302a); for (let i = 0; i < 16; i++) { const a = i * 2.4, r = 1.4 + (i % 3) * 0.5; M(new THREE.SphereGeometry(0.22, 8, 6), appleM, APPLE.x + Math.cos(a) * r, H(APPLE.x, APPLE.z) + 5 + (i % 4) * 0.7, APPLE.z + Math.sin(a) * r, group); }
  const spring = kit('town/fountain-round', SPRING.x, SPRING.z, 2.4, 0, 0, group, H); colliders.push({ x: SPRING.x, z: SPRING.z, r: 2.2 });
  const springGlow = new THREE.Mesh(new THREE.CircleGeometry(1.8, 24), new THREE.MeshBasicMaterial({ color: 0xfff6e8 })); springGlow.rotation.x = -Math.PI / 2; springGlow.position.set(SPRING.x, H(SPRING.x, SPRING.z) + 0.55, SPRING.z); group.add(springGlow);
  // жители
  const alyo = npc('alyonushka'); alyo.root.position.copy(ALYO).setY(H(ALYO.x, ALYO.z)); group.add(alyo.root); alyo.play('sit');
  const ivn = npc('ivanushka', { scale: 0.48 }); ivn.root.position.set(LAKE.x, 8.4, LAKE.z); group.add(ivn.root); ivn.play('sit');
  const geeseHome = V(LAKE.x, LAKE.z + 2);
  function gooseModel() {
    const g = new THREE.Group(); const mat = new THREE.MeshToonMaterial({ color: 0xf6f6f6, gradientMap: ctx.grad, emissive: 0x000000 });
    const b = M(new THREE.SphereGeometry(0.55, 12, 10), mat, 0, 0, 0, g); b.scale.set(0.8, 0.7, 1.3);
    const n = M(new THREE.CylinderGeometry(0.1, 0.14, 0.9, 8), mat, 0, 0.5, 0.6, g); n.rotation.x = 0.5;
    M(new THREE.SphereGeometry(0.2, 10, 8), mat, 0, 0.95, 0.85, g); const bk = M(new THREE.ConeGeometry(0.08, 0.32, 6), toon(0xff9a2a), 0, 0.92, 1.12, g); bk.rotation.x = Math.PI / 2;
    const em = new THREE.MeshBasicMaterial({ color: 0x111111 }); M(new THREE.SphereGeometry(0.04, 6, 6), em, -0.12, 1, 0.98, g); M(new THREE.SphereGeometry(0.04, 6, 6), em, 0.12, 1, 0.98, g);
    const w = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(s * 0.35, 0.15, 0); M(new THREE.BoxGeometry(1.3, 0.06, 0.6), mat, s * 0.65, 0, 0, p); g.add(p); return p; });
    g.userData.mat = mat; g.userData.wings = w; return g;
  }
  const st = () => { const r = ctx.st.river; r.stage = r.stage || 0; r.help = r.help || {}; return r; };
  const me = () => ctx.HERO_NAME[player.hero].split(' ')[0];
  const geese = [];
  function spawnGeese() {
    ctx.removeEnemies('geese'); geese.length = 0;
    for (let i = 0; i < 5; i++) geese.push(ctx.spawnEnemy(group, V(geeseHome.x + Math.cos(i) * 4, geeseHome.z + Math.sin(i) * 4), { model: gooseModel, hp: 99, group: 'geese', name: 'Гусь-лебедь', fly: 3 + i * 0.4, speed: 8.2, aggroR: 34, reach: 1.6, rate: 1.4, passive: st().stage !== 3, cond: () => false, immune: 'Гусей-лебедей не одолеть — прячься у помощников!', custom: (e) => { const w = e.g.userData.wings; w[0].rotation.z = Math.sin(ctx.T() * 14 + e.ph) * 0.6; w[1].rotation.z = -w[0].rotation.z; } }));
  }
  const AL = 'Алёнушка', ST = 'Печка', AP = 'Яблонька', RV = 'Молочная речка', IV = 'Иванушка';
  async function alyoTalk() {
    const r = st();
    if (r.stage === 0) {
      await ui.say(AL, ['(плачет) Ой, беда, беда! Наказывали мне батюшка с матушкой беречь братца Иванушку, а я заигралась…', 'Налетели гуси-лебеди, подхватили Иванушку и унесли! А куда — не видала. Всё вокруг серое, забудки и речку, и берега заморочили.', 'Помоги! Спроси у Печки, у Яблоньки, у Молочной речки — они всё видят. Только будь с ними вежлив: они не любят гордецов.']);
      r.stage = 1; ctx.save(); S.chime(); return;
    }
    if (r.stage === 1) { await ui.say(AL, [`Помощники рассказали? (${Object.keys(r.help).length}/3) Печка — у западной рощи, Яблонька — на востоке, а Речка — у родника.`]); return; }
    if (r.stage === 2) { await ui.say(AL, ['Гнездо на скале посреди озера? Туда только птица долетит… Или сокол ясный!']); return; }
    if (r.stage === 3) { await finish(); return; }
    await ui.say(AL, ['Спасибо тебе, Сказитель! Теперь я с братца глаз не спущу.']);
  }
  async function helper(key, who, text, choices, after) {
    const r = st();
    if (r.stage === 3) { player.hidden = 5; player.hiddenModel = true; S.magic(); ui.toast(`${who} укрыла тебя! Гуси пролетели мимо…`, true, 2500); geese.forEach((e) => { e.kb.set(0, 0, 0); e.g.position.lerp(geeseHome, 0.5); }); return; }
    if (r.help[key]) { await ui.say(who, [after]); return; }
    if (r.stage < 1) { await ui.say(who, ['…'] ); return; }
    const c = await ui.dialog(who, text, choices);
    if (c !== 0) { S.wrong(); await ui.say(who, ['Ишь, гордец! Ничего тебе не скажу.']); return; }
    r.help[key] = true; ctx.save(); S.chime(); player.hp = Math.min(player.maxHp, player.hp + 1);
    await ui.say(who, [after]);
    if (Object.keys(r.help).length === 3) {
      await ui.say(RV, ['Все трое тебе ответили — значит, сердце у тебя доброе. Вот тебе заветное слово — «Явь». Так зовётся наш мир, живой и настоящий, где дети смеются, а реки текут молоком.', 'А гуси унесли Иванушку в гнездо на высокой скале посреди озера. Ни пешком, ни вплавь туда не добраться — только по воздуху!']);
      ctx.addWord('Явь', 'живой, настоящий мир, где мы живём. Подарок Молочной речки.');
      ctx.addBook('Молочные реки, кисельные берега', 'В краю, где текут молочные реки меж кисельных берегов, живут добрые помощники — Печка, Яблонька и Речка. Гордецам они не помогают, а тому, кто вежливо отведает пирожка, яблочка и киселька, всё расскажут и от беды укроют.');
      r.stage = 2; ctx.save(); ui.toast('Нужен Финист: долети с холма до скалы (3 — сменить героя, Пробел×2 и держи — парить)', false, 6000);
    }
  }
  async function takeIvanushka() {
    const r = st();
    await ui.say(IV, ['(Иванушка сидит в гнезде и играет золотыми яблочками) Ой! Ты за мной? Гуси добрые, только кусачие…']);
    await ui.say(me(), ['Держись крепче, Иванушка! Летим домой!']);
    ctx.fade(1); await wait(700); player.pos.set(LAKE.x + 8, 0, LAKE.z + 15); player.pos.y = H(player.pos.x, player.pos.z); ivn.play('walk'); ctx.fade(0);
    r.stage = 3; ctx.save(); spawnGeese(); S.honk(); S.setTheme('boss');
    ui.toast('Гуси-лебеди погнались! Беги к Алёнушке, прячься у Печки, Яблоньки и Речки (F)!', true, 5000);
  }
  async function finish() {
    const r = st(); r.stage = 4; r.done = true; ctx.save(); ctx.removeEnemies('geese'); S.setTheme('rivers'); S.restore();
    alyo.play('idle'); alyo.once('emote-yes');
    await ui.say(AL, ['Иванушка! Братец мой! (обнимает) Спасибо тебе, Сказитель! И Печке, и Яблоньке, и Речке спасибо!']);
    await ui.say(IV, ['А гуси-лебеди мне сказали, что их Кощей заколдовал — забудками. Они не злые, просто всё забыли. Как все тут…']);
    ctx.addBook('Гуси-лебеди', 'Гуси-лебеди унесли маленького Иванушку. Сказитель вежливо принял угощение Печки, Яблоньки и Молочной речки, долетел Финистом до гнезда на скале и, прячась у добрых помощников, вернул братца Алёнушке.');
    setTimeout(() => ui.toast('Портал в Лукоморье теперь ведёт в царство Кощея Бессмертного…', false, 4500), 1200);
  }
  interactables.push(
    { label: 'Поговорить с Алёнушкой', pos: () => alyo.root.position, r: 3.6, act: alyoTalk },
    { label: () => (st().stage === 3 ? 'Спрятаться у Печки' : 'Поговорить с Печкой'), pos: () => stove.position, r: 3.8, act: () => helper('stove', ST, 'Съешь моего ржаного пирожка — скажу, куда гуси полетели.', ['С удовольствием! Спасибо, печка.', 'Фу! Я у батюшки и пшеничных не ем!'], 'Гуси полетели к большому озеру, на юг. Я видела — с моего порога далеко видно!') },
    { label: () => (st().stage === 3 ? 'Спрятаться под Яблонькой' : 'Поговорить с Яблонькой'), pos: () => APPLE, r: 3.8, act: () => helper('apple', AP, 'Съешь моего лесного яблочка — скажу, куда гуси полетели.', ['Спасибо, яблонька! (съесть яблочко)', 'У моего батюшки и садовые не едятся!'], 'Гуси несли мальчика высоко-высоко — к той скале, что торчит посреди озера.') },
    { label: () => (st().stage === 3 ? 'Спрятаться у Речки' : 'Поговорить с Молочной речкой'), pos: () => SPRING, r: 3.8, act: () => helper('spring', RV, 'Попей моего простого киселька с молочком — скажу, куда гуси полетели.', ['Спасибо, речка! (попить киселька)', 'У моего батюшки и сливочки не в диковинку!'], 'Гнездо их — на скале. С холма у мельницы, говорят, до неё можно долететь, если ты птица.') },
    { label: 'Забрать Иванушку', pos: () => ivn.root.position, r: 3, cond: () => st().stage === 2 && player.pos.y > 6, act: takeIvanushka },
  );
  // текстовые метки интерактива могут быть функциями
  interactables.forEach((it) => { if (typeof it.label === 'function') { const f = it.label; Object.defineProperty(it, 'label', { get: f }); } });
  function objective() {
    const r = st();
    if (r.stage === 0) return [ALYO, 'к девочке у забора — она плачет'];
    if (r.stage === 1) { if (!r.help.stove) return [STOVE, 'к Печке — будь вежлив']; if (!r.help.apple) return [APPLE, 'к Яблоньке — будь вежлив']; return [SPRING, 'к Молочной речке у родника']; }
    if (r.stage === 2) { if (player.hero !== 'finist') return [HILL, 'нужен Финист (3) — взлети с холма к скале']; return player.pos.y > 6 && dist2(player.pos, LAKE) < 4 ? [LAKE, 'забери Иванушку (F)'] : [HILL, 'на вершину холма — и лети к скале (Пробел×2, держи)']; }
    if (r.stage === 3) return [ALYO, 'беги к Алёнушке! Прячься у помощников (F)'];
    return [HOME, 'домой через арку — в царство Кощея'];
  }
  function tracker() {
    const r = st(); const ck = (b) => (b ? '☑' : '☐');
    if (r.stage === 0) return '<b>🌊 Молочные реки</b><br>• Кто-то плачет у забора';
    if (r.stage <= 2) return `<b>🦢 Гуси-лебеди</b><br>${ck(r.help.stove)} Печка — пирожок<br>${ck(r.help.apple)} Яблонька — яблочко<br>${ck(r.help.spring)} Речка — кисель<br>${ck(r.stage > 2)} Гнездо на скале (Финист)`;
    if (r.stage === 3) return '<b>🦢 Погоня!</b><br>• Верни Иванушку Алёнушке<br><i style="opacity:.8">F у Печки, Яблоньки, Речки — спрятаться</i>';
    return '<b>🌊 Молочные реки ожили</b><br>☑ Иванушка дома';
  }
  function life() { const r = st(); if (r.done) return 1; if (r.stage >= 2) return 0.62; return 0.12 + Object.keys(r.help).length * 0.16; }
  let birdT = 3;
  function update(dt, canMove) {
    const T = ctx.T(), r = st(); fire.update(dt, T); group.children.forEach((c) => c.userData.update && c.userData.update(dt));
    springGlow.material.opacity = 1; springGlow.scale.setScalar(1 + Math.sin(T * 3) * 0.05);
    // озеро: не умеешь плавать — выносит на берег
    const ld = lakeD(player.pos.x, player.pos.z);
    if (ld < 10.5 && player.onGround && player.pos.y < 2 && canMove) { const d = player.pos.clone().sub(LAKE).setY(0).normalize(); player.pos.set(LAKE.x + d.x * 12.5, 0, LAKE.z + d.z * 12.5); player.pos.y = H(player.pos.x, player.pos.z); S.splash(); ui.toast('Молочное озеро глубокое — течение вынесло на берег. Сюда только по воздуху!', false, 2500); }
    if (riverD(player.pos.x, player.pos.z) < 3 && player.onGround) player.slow = 0.2;
    // Иванушка
    if (r.stage === 3) { const back = V(Math.sin(player.facing), Math.cos(player.facing)).multiplyScalar(-1.6); const tgt = player.pos.clone().add(back); ivn.root.position.lerp(tgt, Math.min(1, dt * 4)); ivn.root.position.y = H(ivn.root.position.x, ivn.root.position.z); ivn.root.rotation.y = player.facing; ivn.root.visible = !(player.hidden > 0); ivn.play(player.walk > 0.2 ? 'walk' : 'idle');
      if (near(player.pos, ALYO, 5) && !ui.busy() && !player.locked) { player.locked = true; finish().finally(() => (player.locked = false)); } }
    else if (r.stage >= 4) { ivn.root.position.set(ALYO.x + 1.4, H(ALYO.x + 1.4, ALYO.z + 0.6), ALYO.z + 0.6); ivn.play('idle'); }
    geese.forEach((e) => (e.passive = r.stage !== 3));
    birdT -= dt; if (birdT < 0 && ctx.life() > 0.6) { birdT = 3 + Math.random() * 5; S.bird(); }
    for (const c of [alyo]) if (near(player.pos, c.root.position, 8)) { const d = player.pos.clone().sub(c.root.position); c.root.rotation.y = Math.atan2(d.x, d.z); }
  }
  function surface(x, z) { return riverD(x, z) < 3 || lakeD(x, z) < 11 ? 'water' : 'grass'; }
  function init() { const r = st(); if (r.stage === 3) spawnGeese(); if (r.stage >= 3) { ivn.root.position.copy(player.pos); } }
  function onSleep() { const r = st(); if (r.stage === 3) { spawnGeese(); ivn.root.position.copy(player.pos); } }
  function onEnter() { const r = st(); if (r.stage === 3) S.setTheme('boss'); if (r.stage === 0) setTimeout(() => ui.toast('Пахнет парным молоком и киселём… но всё такое серое.', false, 3500), 2800); }
  const TP = [['Вход', () => SPAWN.clone()], ['Алёнушка', () => ALYO.clone().add(V(2, 3))], ['Печка', () => STOVE.clone().add(V(3, 3))], ['Яблонька', () => APPLE.clone().add(V(-3, 3))], ['Родник', () => SPRING.clone().add(V(3, 3))], ['Холм у мельницы', () => HILL.clone()]];
  return {
    id: 'river', name: '🌊 Молочные реки, кисельные берега', center: new THREE.Vector2(CX, CZ), radius: 54, H, group, music: 'rivers', water: false,
    sky: makeSky(THREE, 0x58a8f0, 0xfff0d8), sun: 2.4, fogNear: 40, fogFar: 160, amb: { wind: 0.03, water: 0.08 },
    mm: { bg: [60, 110, 60], land: [110, 180, 90] }, mmDraw: (c, X, Z, k, g) => { c.strokeStyle = g([200, 200, 200], [255, 248, 235]); c.lineWidth = 5 * k; c.beginPath(); for (let z = LAKE.z + 4; z < CZ + 60; z += 3) c.lineTo(X(rx(z)), Z(z)); c.stroke(); c.fillStyle = c.strokeStyle; c.beginPath(); c.arc(X(LAKE.x), Z(LAKE.z), 11 * k, 0, 7); c.fill(); },
    icons: () => [['👧', ALYO.x, ALYO.z], ['🔥', STOVE.x, STOVE.z], ['🍎', APPLE.x, APPLE.z], ['⛲', SPRING.x, SPRING.z], ['🪺', LAKE.x, LAKE.z], ['⛰', HILL.x, HILL.z], ['🌀', HOME.x, HOME.z]],
    life, spawn: () => SPAWN.clone(), surface, tp: TP, objective, tracker, update, init, onEnter, onSleep,
  };
}
