// Глава 1. Дремучий лес — Баба-Яга забыла своё имя
import { near, dist2, makeSky, homePortal, letterSprite, campfire, solidTree, ringFx, rng } from './common.js';
export default function forest(ctx) {
  const { THREE, S, ui, toon, kit, npc, M, burst, player, colliders, interactables, enemies, wait, heroes } = ctx;
  const CX = 600, CZ = 0; const V = (x, z, y = 0) => new THREE.Vector3(x, y, z);
  const group = new THREE.Group(); group.name = 'forest';
  const R = rng(77);
  const HUT = V(CX, CZ - 6), YAGA = V(CX + 5, CZ + 3), STUMP = V(CX - 26, CZ - 20), GLADE = V(CX + 27, CZ - 24), LESHY = V(CX + 27, CZ + 22), FIRE = V(CX - 9, CZ + 30), SPAWN = V(CX, CZ + 44);
  const FIRS = [V(CX + 36, CZ + 30), V(CX + 21, CZ + 35), V(CX + 39, CZ + 16)];
  const zones = [[HUT, 13], [YAGA, 4], [STUMP, 6], [GLADE, 9], [LESHY, 7], [FIRE, 5], [SPAWN, 15], ...FIRS.map((f) => [f, 3])];
  const flat = (x, z) => zones.reduce((m, [p, r]) => Math.max(m, 1 - Math.min(1, Math.max(0, (Math.hypot(x - p.x, z - p.z) - r * 0.6) / (r * 0.6)))), 0);
  const H = (x, z) => { const lx = x - CX, lz = z - CZ, r = Math.hypot(lx, lz); const n = 0.7 * Math.sin(lx * 0.08) * Math.cos(lz * 0.07) + 0.35 * Math.sin(lx * 0.21 + lz * 0.13); return 0.3 + n * (1 - flat(x, z) * 0.8) + ctx.smooth(48, 66, r) * 9; };
  const pathD = (x, z) => { const segs = [[SPAWN, V(CX, CZ + 8)], [V(CX, CZ + 8), STUMP], [V(CX, CZ + 8), GLADE], [V(CX, CZ + 8), LESHY], [V(CX - 2, CZ + 36), FIRE]]; let d = 99; for (const [a, b] of segs) { const abx = b.x - a.x, abz = b.z - a.z; const t = Math.max(0, Math.min(1, ((x - a.x) * abx + (z - a.z) * abz) / (abx * abx + abz * abz))); d = Math.min(d, Math.hypot(x - a.x - abx * t, z - a.z - abz * t)); } return d; };
  ctx.makeTerrain(CX, CZ, 150, 130, H, (x, z, y, c) => { const p = pathD(x, z); if (p < 1.8) c.setRGB(0.55, 0.42, 0.26); else { const k = Math.sin(x * 0.3) * Math.cos(z * 0.27) * 0.05; c.setRGB(0.2 + k, 0.42 + k + Math.min(0.1, y * 0.01), 0.18); } if (Math.hypot(x - GLADE.x, z - GLADE.z) < 7 && p > 1.8) c.setRGB(0.42, 0.55, 0.22); }, group);
  // лес
  const free = (x, z) => zones.every(([p, r]) => Math.hypot(x - p.x, z - p.z) > r + 2) && pathD(x, z) > 3;
  const TREES = ['graveyard/pine', 'graveyard/pine-crooked', 'graveyard/pine', 'survival/tree-tall', 'graveyard/pine-fall-crooked'];
  for (let i = 0; i < 330; i++) {
    const a = R() * 6.28, r = 6 + Math.sqrt(R()) * 64; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (!free(x, z)) continue;
    const path = TREES[Math.floor(R() * TREES.length)]; const s = (path.startsWith('survival') ? 5 : 3.6) + R() * 1.8;
    if (r < 54) solidTree(ctx, group, path, x, z, s, H, 0.55); else kit(path, x, z, s * 1.2, R() * 6.28, -0.2, group, H);
  }
  for (let i = 0; i < 90; i++) { const a = R() * 6.28, r = 4 + R() * 50; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (pathD(x, z) < 2.2) continue; const n = ['mushroom_redGroup', 'mushroom_tanGroup', 'plant_bushDetailed', 'grass_large', 'stump_old', 'log'][Math.floor(R() * 6)]; ctx.P(n, x, z, n.startsWith('plant') || n.startsWith('grass') ? 4 : 3, R() * 6.28, 0, group, H); }
  for (let i = 0; i < 14; i++) { const a = R() * 6.28, r = 10 + R() * 40; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (!free(x, z)) continue; kit(R() < 0.5 ? 'graveyard/rocks-tall' : 'survival/rock-b', x, z, 3 + R() * 2, R() * 6, 0, group, H); colliders.push({ x, z, r: 1.2 }); }
  // светлячки
  const flyGeo = new THREE.BufferGeometry(); const fp = new Float32Array(240 * 3); const fBase = [];
  for (let i = 0; i < 240; i++) { const a = R() * 6.28, r = R() * 50; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; fBase.push([x, H(x, z) + 0.6 + R() * 3, z, R() * 6]); }
  flyGeo.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  const flies = new THREE.Points(flyGeo, new THREE.PointsMaterial({ color: 0xd8ff7a, size: 0.18, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); group.add(flies);
  homePortal(ctx, group, SPAWN.x + 8, SPAWN.z + 1, H, -0.3); const HOME = V(SPAWN.x + 8, SPAWN.z + 1);
  const fire = campfire(ctx, group, FIRE.x, FIRE.z, H);
  for (let i = 0; i < 3; i++) kit('graveyard/trunk-long', FIRE.x + Math.cos(i * 2.1) * 2.6, FIRE.z + Math.sin(i * 2.1) * 2.6, 2.4, i * 2.1, -0.2, group, H).rotation.z = Math.PI / 2;

  // ----- избушка на курьих ножках -----
  const hut = new THREE.Group(); hut.position.copy(HUT).setY(H(HUT.x, HUT.z)); group.add(hut);
  const body = new THREE.Group(); hut.add(body); body.position.y = 3.6;
  const logM = toon(0x7a4f2a), logD = toon(0x5a3a1e), roofM = toon(0x8a6a3a), legM = toon(0xe8a84a), clawM = toon(0x6b5a3a);
  for (let i = 0; i < 7; i++) { const y = i * 0.5 + 0.25; for (const [w, d, x, z, ry] of [[4.8, 0, 0, 2, 0], [4.8, 0, 0, -2, 0], [4.4, 0, 2.2, 0, Math.PI / 2], [4.4, 0, -2.2, 0, Math.PI / 2]]) { const l = M(new THREE.CylinderGeometry(0.27, 0.27, w, 8), i % 2 ? logM : logD, x, y, z, body); l.rotation.set(0, ry, Math.PI / 2); l.castShadow = true; } }
  const roof = M(new THREE.CylinderGeometry(3.4, 3.4, 5.4, 3, 1), roofM, 0, 4.4, 0, body); roof.rotation.set(Math.PI / 2, 0, Math.PI / 2); roof.scale.set(1, 1, 0.55);
  M(new THREE.BoxGeometry(0.7, 1.6, 0.7), toon(0x8a8580), 1.3, 5.2, -0.8, body);
  const winM = new THREE.MeshBasicMaterial({ color: 0xffd060 }); M(new THREE.PlaneGeometry(1, 0.9), winM, 0, 2, 2.3, body); M(new THREE.PlaneGeometry(1, 0.9), winM, 0, 2, -2.31, body).rotation.y = Math.PI;
  M(new THREE.BoxGeometry(1.4, 0.15, 0.15), toon(0xc8302a), 0, 2.5, 2.36, body); M(new THREE.BoxGeometry(1.4, 0.15, 0.15), toon(0xc8302a), 0, 1.52, 2.36, body);
  const legs = [];
  for (const sx of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(sx * 1.1, 3.6, 0); hut.add(hip);
    const th = M(new THREE.CylinderGeometry(0.45, 0.3, 2, 8), legM, 0, -1, 0, hip); th.castShadow = true;
    const knee = new THREE.Group(); knee.position.y = -2; hip.add(knee);
    M(new THREE.CylinderGeometry(0.22, 0.2, 1.6, 8), legM, 0, -0.8, 0, knee);
    const foot = new THREE.Group(); foot.position.y = -1.6; knee.add(foot);
    for (const a of [-0.5, 0, 0.5]) { const t = M(new THREE.ConeGeometry(0.13, 1.1, 6), clawM, Math.sin(a) * 0.55, 0, Math.cos(a) * 0.55, foot); t.rotation.set(Math.PI / 2, a, 0); }
    const back = M(new THREE.ConeGeometry(0.12, 0.7, 6), clawM, 0, 0, -0.4, foot); back.rotation.x = -Math.PI / 2;
    legs.push({ hip, knee, sx });
  }
  ctx.outline && ctx.outline(body, 1.03);
  const hutCol = { x: HUT.x, z: HUT.z, r: 3 }; colliders.push(hutCol); ctx.camBlockers.push(body);
  const ring = ringFx(ctx, group, 0xffc070);
  const B = { mode: 'calm', t: 0, stomps: 0, calms: 0, ph: 0, vel: new THREE.Vector3(), yaw: 0 };

  // ----- жители -----
  const yaga = npc('yaga'); yaga.root.position.copy(YAGA).setY(H(YAGA.x, YAGA.z)); group.add(yaga.root);
  const leshy = npc('leshy', { scale: 0.9 }); leshy.root.position.copy(LESHY).setY(H(LESHY.x, LESHY.z)); group.add(leshy.root);
  const vas = npc('vasilisa'); vas.root.visible = false; group.add(vas.root);
  const eyes = new THREE.Group(); const eyeM = new THREE.MeshBasicMaterial({ color: 0xfff27a }); M(new THREE.SphereGeometry(0.09, 6, 6), eyeM, -0.15, 0, 0, eyes); M(new THREE.SphereGeometry(0.09, 6, 6), eyeM, 0.15, 0, 0, eyes); group.add(eyes); eyes.visible = false;
  FIRS.forEach((f) => { const o = kit('holiday/tree-snow-c', f.x, f.z, 4.2, R() * 6, 0, group, H); o.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.color = new THREE.Color(0x3a7a3a); } }); colliders.push({ x: f.x, z: f.z, r: 1 }); });
  // пень с руной А
  ctx.P('stump_round', STUMP.x, STUMP.z, 7, 0.3, 0, group, H); colliders.push({ x: STUMP.x, z: STUMP.z, r: 1.2 });
  const runeA = letterSprite(THREE, 'А'); runeA.position.set(STUMP.x, H(STUMP.x, STUMP.z) + 2.6, STUMP.z); group.add(runeA);
  const runeG = letterSprite(THREE, 'Г', '#c7a6ff'); runeG.position.set(GLADE.x, H(GLADE.x, GLADE.z) + 1.8, GLADE.z); group.add(runeG);
  const runeY = letterSprite(THREE, 'Я'); runeY.visible = false; group.add(runeY);
  for (let i = 0; i < 9; i++) { const a = i * 0.7; ctx.P(i % 2 ? 'mushroom_redGroup' : 'mushroom_red', GLADE.x + Math.cos(a) * 5, GLADE.z + Math.sin(a) * 5, 4, a, 0, group, H); }
  kit('graveyard/hay-bale', GLADE.x - 4, GLADE.z + 3, 3, 0.5, 0, group, H);
  kit('graveyard/lantern-candle', YAGA.x + 2, YAGA.z + 1, 3, 0, 0, group, H);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.28; kit('graveyard/iron-fence', HUT.x + Math.cos(a) * 11, HUT.z + Math.sin(a) * 11, 2.2, -a + Math.PI / 2, 0, group, H).visible = i % 3 !== 0; }
  [0, 1, 2, 3].forEach((i) => { const a = i * 1.57 + 0.4; kit('graveyard/pumpkin', HUT.x + Math.cos(a) * 9, HUT.z + Math.sin(a) * 9, 3, a, 0, group, H); });

  // ----- состояние -----
  const F = () => ctx.st.forest; const fs = () => { const f = F(); f.runes = f.runes || {}; f.stage = f.stage || 0; return f; };
  const runeCount = () => Object.values(fs().runes).filter(Boolean).length;
  const me = () => ctx.HERO_NAME[player.hero].split(' ')[0];
  const bats = []; const stumpGuards = [];
  function spawn() {
    ctx.removeEnemies('bats'); ctx.removeEnemies('stump'); bats.length = 0; stumpGuards.length = 0; const f = fs();
    if (!f.runes.g && !f.batsDone) for (let i = 0; i < 4; i++) {
      const a = i * 1.57; const p = V(GLADE.x + Math.cos(a) * 5, GLADE.z + Math.sin(a) * 5, H(GLADE.x, GLADE.z) + 2.5);
      bats.push(ctx.spawnEnemy(group, p, { model: makeBat, hp: 2, fly: 2.4, speed: 4.4, aggroR: 12, group: 'bats', name: 'Летучая мышь', rate: 1.1, custom: (e) => { const w = e.g.userData.wings; w[0].rotation.z = Math.sin(ctx.T() * 20 + e.ph) * 0.7; w[1].rotation.z = -w[0].rotation.z; }, onDeath: () => { if (bats.every((b) => !b.alive)) { fs().batsDone = true; ctx.save(); ui.toast('Летучие мыши уснули. На поляне что-то мерцает… но глазом не видно (Q).', false, 3500); } } }));
    }
    if (!f.runes.a) for (let i = 0; i < 2; i++) { const p = V(STUMP.x + (i ? 3 : -3), STUMP.z + 3, 0); stumpGuards.push(ctx.spawnEnemy(group, p, { hp: 3, group: 'stump', name: 'Забудка' })); }
  }
  function makeBat() {
    const g = new THREE.Group(); const mat = new THREE.MeshToonMaterial({ color: 0x4a3a5a, gradientMap: ctx.grad, emissive: 0x000000 });
    M(new THREE.SphereGeometry(0.35, 10, 8), mat, 0, 0, 0, g); M(new THREE.ConeGeometry(0.1, 0.25, 4), mat, -0.17, 0.35, 0, g); M(new THREE.ConeGeometry(0.1, 0.25, 4), mat, 0.17, 0.35, 0, g);
    const em = new THREE.MeshBasicMaterial({ color: 0xff5a4a }); M(new THREE.SphereGeometry(0.06, 6, 6), em, -0.12, 0.08, 0.3, g); M(new THREE.SphereGeometry(0.06, 6, 6), em, 0.12, 0.08, 0.3, g);
    const wm = new THREE.MeshToonMaterial({ color: 0x3a2a4a, gradientMap: ctx.grad, side: THREE.DoubleSide });
    const w = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.x = s * 0.25; M(new THREE.BoxGeometry(0.9, 0.06, 0.5), wm, s * 0.45, 0, 0, p); g.add(p); return p; });
    g.userData.mat = mat; g.userData.wings = w; return g;
  }

  // ----- диалоги -----
  const YG = 'Баба-Яга', LS = 'Леший', VS = 'Василиса Премудрая';
  async function yagaTalk() {
    const f = fs();
    if (f.stage === 0) {
      await ui.say(YG, ['Фу-фу-фу! Русским духом пахнет… Кто таков? Зачем пожаловал — дело пытаешь аль от дела лытаешь?', 'Ох… а сама-то я кто? Стою, помню — костяная нога, ступа, помело… а имени не помню! Забудки съели.', 'Без имени и избушка меня не слушает, и лес серый, как зола.']);
      const c = await ui.dialog(YG, 'Поможешь бабушке?', ['Помогу, бабушка! Что искать?', 'А ты меня не съешь?']);
      if (c === 1) await ui.say(YG, ['Хе-хе! Раньше бы съела. А теперь и рецепт забыла. Не бойся, касатик.']);
      await ui.say(YG, ['Имя моё рассыпалось на три буквы-руны. Одна — у старого пня, его забудки стерегут.', 'Другая — на мышиной поляне, там нынче летучие мыши шалят. Её только Сказительским взглядом углядишь.', 'А третью Леший уволок — он тут хозяин. Только смотри: Леший водит, с тропы сбивает!']);
      f.stage = 1; ctx.save(); S.chime(); return;
    }
    if (f.stage === 1) {
      if (runeCount() < 3) { const miss = [!f.runes.a && 'у старого пня', !f.runes.g && 'на мышиной поляне', !f.runes.ya && 'у Лешего'].filter(Boolean).join(', '); await ui.say(YG, [`Принёс руны? Вижу ${runeCount()} из трёх. Ищи ещё: ${miss}.`]); return; }
      await ui.say(YG, ['Три руны! Ну-ка, сложи их в имя, а я послушаю — откликнется ли сердце.']);
      for (;;) {
        const c = await ui.dialog(YG, 'Как меня зовут?', ['Гая', 'Агя', 'Яга', 'Яаг']);
        if (c === 2) break; S.wrong(); await ui.say(YG, ['Не то… не моё. Попробуй иначе.']);
      }
      S.restore(); burst(yaga.root.position.clone().setY(yaga.root.position.y + 2), 0xffe27a, 60, 5, 1.4);
      await ui.say(YG, ['Яга! Баба-Яга, костяная нога! ВСПОМНИЛА! Ох, как в голове-то звонко!', 'Ой… а избушка-то моя! Она ведь тоже меня забыла — слышишь, как топочет? Сорвалась с места!', 'А в ней гостья моя заперта — Василиса Премудрая. Пришла мне помочь, да избушка её не выпускает!', 'Избушку не бей — она не злая, напуганная. Как топнет три раза — устанет и присядет. Тут подбеги и скажи заветные слова (F)!']);
      f.stage = 2; B.mode = 'wild'; B.t = 1.5; B.stomps = 0; B.calms = 0; ctx.save(); S.setTheme('boss'); shakeHut(); return;
    }
    if (f.stage === 2) { await ui.say(YG, ['Успокой избушку! Три топота — присядет — тогда F и слова: «Избушка, избушка, повернись к лесу задом, ко мне передом!»']); return; }
    await ui.say(YG, ['Спасибо, касатик. Заходи на пироги — печь я вспомнила как топить. А портал теперь ведёт и в Ледяные горы — к Морозко.']);
  }
  function shakeHut() { ctx.shake(0.4); S.stomp(); }
  async function leshyTalk() {
    const f = fs();
    if (f.runes.ya) { await ui.say(LS, ['Ух-ху-ху! Весело было! Заходи ещё — в прятки поиграем.']); return; }
    if (f.leshy === 'hide') { ui.toast('Леший спрятался за одной из трёх елей. Ищи его глаза (Q)!'); return; }
    if (!f.leshy) {
      await ui.say(LS, ['У-у-у! Кто по моему лесу ходит? Руну ищешь? Ха! Пойдём, покажу тропинку… налево… направо… кругом…']);
      f.leshy = 'led'; ctx.save(); await lead(); return;
    }
    await ui.say(LS, ['Опять ты? Пойдём, пойдём… я тропинку знаю…']);
    const c = await ui.dialog(me(), 'Что делать? Леший опять водит…', ['Вывернуть рубаху наизнанку', 'Попросить: «Пусти, пожалуйста!»', 'Пригрозить мечом']);
    if (c !== 0) { await ui.say(LS, [c === 1 ? 'Пущу, пущу… вон туда… ху-ху!' : 'Мечом? Деревья мечом не испугаешь! Ху-ху-ху!']); await lead(); return; }
    S.laugh(); await ui.say(LS, ['Ох-хо-хо! Рубаху наизнанку вывернул! Знаешь старое правило — теперь меня не обманешь.', 'Ладно, руна твоя… если найдёшь меня! Я спрячусь за одной из трёх елей у Лесной опушки. Глаза мои только Сказительский взгляд видит!']);
    f.leshy = 'hide'; f.leshyFir = Math.floor(Math.random() * 3); ctx.save(); leshy.root.visible = false; S.owl();
  }
  async function lead() {
    ctx.fade(1); S.owl(); await wait(900); player.pos.set(SPAWN.x - 2, H(SPAWN.x, SPAWN.z), SPAWN.z - 3); await wait(300); ctx.fade(0);
    ui.toast('Тропинка вильнула… и ты снова у входа в лес! Леший водит. Говорят, от Лешего спасает рубаха наизнанку…', false, 5000);
  }
  async function firCheck(i) {
    const f = fs(); if (f.leshy !== 'hide') return;
    if (i !== f.leshyFir) { S.wrong(); ui.toast('Тут только шишки… Где-то хихикают. (Q — взгляд)'); return; }
    leshy.root.visible = true; leshy.root.position.copy(FIRS[i]).add(V(1.6, 1.6)).setY(H(FIRS[i].x + 1.6, FIRS[i].z + 1.6)); leshy.once('emote-yes'); S.laugh();
    await ui.say(LS, ['Нашёл! Ох, глазастый! Ну, держи руну — честно выиграл.']);
    f.leshy = 'done'; f.runes.ya = true; ctx.save(); takeRune('Я', leshy.root.position);
    ctx.addBook('Леший и рубаха наизнанку', 'Леший — хозяин леса — любит водить путников по кругу. Старое правило гласит: выверни рубаху наизнанку — и Леший тебя не обманет. Сказитель так и сделал, а потом нашёл Лешего в прятках Сказительским взглядом и получил руну «Я».');
  }
  function takeRune(ch, pos) { S.chime(); burst(pos.clone().setY(pos.y + 2), 0xffe27a, 40, 4, 1); ui.toast(`Руна «${ch}» найдена! (${runeCount()}/3)`, true); if (runeCount() === 3) setTimeout(() => ui.toast('Все три руны! Неси их Бабе-Яге.'), 2400); }
  async function calmHut() {
    const f = fs(); player.locked = true;
    const ok = await ui.timing('«Избушка, избушка! Повернись к лесу задом, ко мне передом!»', 1 + B.calms * 0.3);
    if (!ok) { S.wrong(); ui.toast('Сбился на слове… Избушка вскочила!'); B.mode = 'wild'; B.t = 1.2; B.stomps = 0; return; }
    B.calms++; S.chime(); burst(body.getWorldPosition(V(0, 0)), 0xffe27a, 50, 5, 1.2);
    if (B.calms < 3) { ui.toast(`Избушка слушает! (${B.calms}/3) — ещё разок…`, true); B.mode = 'wild'; B.t = 2; B.stomps = 0; return; }
    B.mode = 'done'; f.stage = 3; ctx.save(); S.setTheme('forest'); S.restore();
    await ui.say('Избушка', ['(избушка поворачивается к лесу задом, к тебе передом, и с облегчением приседает)']);
    vas.root.visible = true; vas.root.position.copy(HUT).add(V(0, 5)).setY(H(HUT.x, HUT.z + 5)); vas.once('emote-yes');
    await ui.say(VS, ['Наконец-то! Спасибо тебе. Я — Василиса Премудрая. Шла Бабе-Яге имя вернуть, да избушка испугалась и заперла меня.', 'Вижу — ты Сказитель. Ты помнишь сказки, и они оживают. Я пойду с тобой: у меня волшебные огоньки-клубочки — они сами найдут цель.', 'А ещё я знаю Премудрость (R): подлечу и подскажу дорогу.']);
    await ui.say(YG, ['Вот тебе за доброту слово заветное — «Навь». Так зовётся тот край, где живут сказки и предки наши. Без него Сказителю никак.']);
    ctx.addWord('Навь', 'мир сказок, духов и предков. Подарок Бабы-Яги, вспомнившей своё имя.');
    ctx.addBook('Баба-Яга', 'В Дремучем лесу Баба-Яга забыла своё имя, и избушка на курьих ножках перестала её слушаться. Сказитель собрал три руны — А, Г и Я — и сложил имя «Яга». А заветные слова «Избушка, избушка, повернись к лесу задом, ко мне передом» успокоили избушку. Из неё вышла Василиса Премудрая.');
    vas.root.visible = false; ctx.unlockHero('vasilisa'); f.done = true; ctx.save();
    setTimeout(() => ui.toast('Портал в Лукоморье теперь ведёт и в Ледяные горы.', false, 4000), 5200);
  }

  // ----- интерактив -----
  interactables.push(
    { label: 'Поговорить с Бабой-Ягой', pos: () => yaga.root.position, r: 3.4, act: yagaTalk },
    { label: 'Поговорить с Лешим', pos: () => leshy.root.position, r: 3.4, cond: () => leshy.root.visible, act: leshyTalk },
    { label: 'Взять руну «А»', pos: () => STUMP, r: 3.4, cond: () => fs().stage >= 1 && !fs().runes.a && stumpGuards.every((e) => !e.alive), act: async () => { fs().runes.a = true; ctx.save(); takeRune('А', STUMP); } },
    { label: 'Взять руну «Г»', pos: () => GLADE, r: 3.4, cond: () => fs().stage >= 1 && fs().batsDone && !fs().runes.g && player.sight, act: async () => { fs().runes.g = true; ctx.save(); takeRune('Г', GLADE); } },
    ...FIRS.map((p, i) => ({ label: 'Заглянуть за ель', pos: () => p, r: 3.2, cond: () => fs().leshy === 'hide', act: () => firCheck(i) })),
    { label: 'Успокоить избушку!', pos: () => hut.position, r: 6.5, prio: 5, cond: () => B.mode === 'squat', act: calmHut },
  );
  ctx.hittables.push({ pos: () => body.getWorldPosition(V(0, 0)), r: 3.6, ry: 6, cond: () => B.mode === 'wild', onHit: () => { if (!B.warned) { B.warned = true; ui.toast('Избушку бить нельзя — она напугана! Дождись, пока присядет.', false, 3000); } } });

  function objective() {
    const f = fs();
    if (f.stage === 0) return [YAGA, 'к избушке — там кто-то ворчит'];
    if (f.stage === 1) {
      if (!f.runes.a) return [STUMP, stumpGuards.some((e) => e.alive) ? 'к старому пню — усыпи забудок' : 'к старому пню — взять руну'];
      if (!f.runes.g) return [GLADE, f.batsDone ? 'на мышиную поляну — руна видна только взглядом (Q)' : 'на мышиную поляну — летучие мыши'];
      if (!f.runes.ya) { if (f.leshy === 'hide') return player.sight ? [FIRS[f.leshyFir], 'вот они, глаза Лешего! Загляни за эту ель'] : [LESHY, 'найди Лешего за одной из трёх елей (Q)']; return [leshy.root.position, f.leshy ? 'к Лешему — как не дать ему водить?' : 'к Лешему у опушки']; }
      return [YAGA, 'к Бабе-Яге — сложить имя'];
    }
    if (f.stage === 2) return [hut.position, (B.mode === 'squat' ? 'избушка присела — скорее F!' : 'увернись от топота и жди, пока избушка присядет') + ` (${B.calms}/3)`];
    return [HOME, 'домой через арку — и дальше, в Ледяные горы'];
  }
  function tracker() {
    const f = fs(); const ck = (b) => (b ? '☑' : '☐');
    if (f.stage === 0) return '<b>🌲 Дремучий лес</b><br>• Найди, кто ворчит у избушки';
    if (f.stage === 1) return `<b>🌲 Имя Бабы-Яги</b><br>${ck(f.runes.a)} Руна у старого пня<br>${ck(f.runes.g)} Руна на мышиной поляне<br>${ck(f.runes.ya)} Руна Лешего<br>${runeCount() === 3 ? '• Сложи имя у Яги' : ''}`;
    if (f.stage === 2) return `<b>🏚 Избушка на курьих ножках</b><br>• Успокоено: ${B.calms}/3<br><i style="opacity:.8">Прыгай (Пробел), когда избушка топает</i>`;
    return '<b>🌲 Дремучий лес ожил</b><br>☑ Имя вспомнено<br>☑ Василиса с тобой (2)';
  }
  function life() { const f = fs(); if (f.done) return 1; if (f.stage >= 2) return 0.72; return 0.14 + runeCount() * 0.17; }

  let owlT = 8;
  function update(dt, canMove) {
    const T = ctx.T(), f = fs(); fire.update(dt, T); group.children.forEach((c) => c.userData.update && c.userData.update(dt));
    // светлячки
    const L = ctx.life(); flies.material.opacity = ctx.smooth(0.3, 1, L) * 0.9 + (player.sight ? 0.3 : 0);
    const pa = flyGeo.attributes.position.array; fBase.forEach(([x, y, z, ph], i) => { pa[i * 3] = x + Math.sin(T * 0.5 + ph) * 1.2; pa[i * 3 + 1] = y + Math.sin(T * 0.8 + ph * 2) * 0.5; pa[i * 3 + 2] = z + Math.cos(T * 0.4 + ph) * 1.2; }); flyGeo.attributes.position.needsUpdate = true;
    owlT -= dt; if (owlT < 0) { owlT = 10 + Math.random() * 14; S.owl(); }
    // руны
    runeA.visible = !f.runes.a; runeA.material.opacity = stumpGuards.some((e) => e.alive) ? 0.35 : 0.8 + Math.sin(T * 3) * 0.2;
    runeG.visible = !f.runes.g && !!f.batsDone && player.sight; runeG.position.y = H(GLADE.x, GLADE.z) + 1.8 + Math.sin(T * 2) * 0.2;
    eyes.visible = f.leshy === 'hide' && player.sight; if (eyes.visible) { const p = FIRS[f.leshyFir]; eyes.position.set(p.x + 0.9, H(p.x, p.z) + 2.4, p.z + 0.9); eyes.lookAt(player.pos.x, eyes.position.y, player.pos.z); eyes.scale.y = Math.sin(T * 3) > 0.95 ? 0.1 : 1; }
    if (f.leshy !== 'hide' && !leshy.root.visible) leshy.root.visible = true;
    // Яга поворачивается к игроку
    if (near(player.pos, yaga.root.position, 8)) { const d = player.pos.clone().sub(yaga.root.position); yaga.root.rotation.y = Math.atan2(d.x, d.z); }
    if (near(player.pos, leshy.root.position, 8)) { const d = player.pos.clone().sub(leshy.root.position); leshy.root.rotation.y = Math.atan2(d.x, d.z); }
    // избушка
    updateHut(dt, T, canMove);
  }
  function updateHut(dt, T, canMove) {
    const hp = hut.position; let walkAmt = 0;
    if (B.mode === 'wild' && canMove) {
      B.t -= dt; const to = player.pos.clone().sub(hp); to.y = 0; const d = to.length();
      if (B.t > 0.6) { if (d > 4) { to.normalize(); B.vel.lerp(to.multiplyScalar(2.6), dt * 2); } else B.vel.multiplyScalar(0.9); walkAmt = 1; }
      else { B.vel.multiplyScalar(0.8); body.position.y = 3.6 + Math.sin((0.6 - Math.max(0, B.t)) / 0.6 * Math.PI) * 2.2; }
      if (B.t <= 0) { // ТОП!
        body.position.y = 3.6; S.stomp(); ctx.shake(0.5); ring.fire(hp, 11); burst(hp.clone().setY(hp.y + 0.3), 0xc8b090, 30, 6, 0.8, 0.3);
        if (d < 7.5 && player.onGround && player.pos.y < H(player.pos.x, player.pos.z) + 0.4) ctx.hurtPlayer(1, 'Топ! Подпрыгни в момент удара (Пробел).');
        B.stomps++; B.t = 2.4 - B.calms * 0.3;
        if (B.stomps >= 3) { B.mode = 'squat'; B.t = 4.5; ui.toast('Избушка устала и присела! Скорее — F!', true, 2200); S.chime(); }
      }
      hp.addScaledVector(B.vel, dt); const r = dist2(hp, V(CX, CZ)); if (r > 30) { hp.x = CX + (hp.x - CX) * 30 / r; hp.z = CZ + (hp.z - CZ) * 30 / r; }
      hp.y = H(hp.x, hp.z); if (B.vel.length() > 0.2) { const yaw = Math.atan2(B.vel.x, B.vel.z); let dd = yaw - hut.rotation.y; dd = Math.atan2(Math.sin(dd), Math.cos(dd)); hut.rotation.y += dd * dt * 3; }
    } else if (B.mode === 'squat') {
      B.t -= dt; body.position.y += (1.8 - body.position.y) * Math.min(1, dt * 6);
      if (B.t <= 0 && !ui.busy()) { B.mode = 'wild'; B.t = 1.5; B.stomps = 0; ui.toast('Не успел! Избушка снова вскочила.'); }
    } else { body.position.y += (B.mode === 'done' ? 2.4 - body.position.y : 3.6 - body.position.y) * Math.min(1, dt * 3); if (B.mode === 'done') { const d = player.pos.clone().sub(hp); const yaw = Math.atan2(d.x, d.z); let dd = yaw - hut.rotation.y; dd = Math.atan2(Math.sin(dd), Math.cos(dd)); hut.rotation.y += dd * dt; } }
    B.ph += dt * (walkAmt ? 7 : 1.5);
    const crouch = (3.6 - body.position.y) / 1.8; // 0..1 приседание
    legs.forEach((l, i) => { const s = walkAmt ? Math.sin(B.ph + i * Math.PI) * 0.5 : Math.sin(B.ph + i) * 0.05; l.hip.position.y = body.position.y; l.hip.rotation.x = s - crouch * 0.9; l.knee.rotation.x = Math.max(0, -s) * 0.8 + crouch * 1.8; });
    body.rotation.z = walkAmt ? Math.sin(B.ph) * 0.05 : 0;
    hutCol.x = hp.x; hutCol.z = hp.z; ring.update(dt);
  }
  function onSleep() { if (B.mode !== 'done' && fs().stage === 2) { B.mode = 'wild'; B.t = 2; B.stomps = 0; hut.position.copy(HUT).setY(H(HUT.x, HUT.z)); } spawn(); }
  function init() { const f = fs(); spawn(); if (f.stage === 2) { B.mode = 'wild'; B.t = 3; } if (f.stage >= 3) B.mode = 'done'; if (f.runes.ya) leshy.root.visible = true; }
  function onEnter() { const f = fs(); if (f.stage === 2 && B.mode !== 'done') S.setTheme('boss'); if (f.stage === 0) setTimeout(() => ui.toast('Тёмный лес… Где-то впереди скрипят куриные ноги.', false, 3500), 2800); }
  const TP = [['Вход в лес', () => SPAWN.clone()], ['Изба Бабы-Яги', () => YAGA.clone().add(V(2, 4))], ['Старый пень', () => STUMP.clone().add(V(3, 4))], ['Мышиная поляна', () => GLADE.clone().add(V(-4, 6))], ['Опушка Лешего', () => LESHY.clone().add(V(-4, -3))], ['Костёр', () => FIRE.clone().add(V(2, 3))]];
  return {
    id: 'forest', name: '🌲 Дремучий лес', center: new THREE.Vector2(CX, CZ), radius: 54, H, group, music: 'forest', water: false,
    sky: makeSky(THREE, 0x3f7a9a, 0xbfe0b8), sun: 1.8, fogNear: 25, fogFar: 120, amb: { wind: 0.05, windFreq: 300, water: 0 },
    mm: { bg: [30, 60, 35], land: [55, 110, 55] }, icons: () => [['🏚', hut.position.x, hut.position.z], ['🧙', YAGA.x, YAGA.z], ['🪵', STUMP.x, STUMP.z], ['🍄', GLADE.x, GLADE.z], ['🌿', LESHY.x, LESHY.z], ['🔥', FIRE.x, FIRE.z], ['🌀', SPAWN.x + 8, SPAWN.z + 1]],
    life, spawn: () => SPAWN.clone(), surface: () => 'grass', tp: TP, objective, tracker, update, init, onEnter, onSleep,
  };
}
