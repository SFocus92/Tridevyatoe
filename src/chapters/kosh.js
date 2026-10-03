// Глава 4. Царство Кощея Бессмертного — игла, загадка и три финала
import { near, dist2, makeSky, homePortal, campfire, rng, letterSprite } from './common.js';
export default function kosh(ctx) {
  const { THREE, S, ui, toon, kit, npc, M, burst, player, colliders, interactables, wait } = ctx;
  const CX = 0, CZ = -600; const V = (x, z, y = 0) => new THREE.Vector3(x, y, z);
  const group = new THREE.Group(); group.name = 'kosh'; const R = rng(999);
  const SPAWN = V(CX, CZ + 44), VIL = V(CX - 20, CZ + 22), OAKP = V(CX + 22, CZ + 15), LAKE = V(CX + 32, CZ - 6), CAS = V(CX, CZ - 28), GATE = V(CX, CZ - 15), FIRE = V(CX + 6, CZ + 34);
  const lakeD = (x, z) => Math.hypot(x - LAKE.x, z - LAKE.z);
  const H = (x, z) => {
    const lx = x - CX, lz = z - CZ, r = Math.hypot(lx, lz);
    let h = 0.6 + 0.7 * Math.sin(lx * 0.09) * Math.cos(lz * 0.08) + 0.3 * Math.sin(lx * 0.23 - lz * 0.17);
    h *= ctx.smooth(9, 15, Math.hypot(x - CAS.x, z - CAS.z)) * ctx.smooth(6, 12, Math.hypot(x - VIL.x, z - VIL.z)) * ctx.smooth(4, 9, Math.hypot(x - SPAWN.x, z - SPAWN.z));
    h += ctx.smooth(46, 64, r) * 16;
    const ld = lakeD(x, z); h = h * ctx.smooth(7, 10, ld) - 1 * (1 - ctx.smooth(7, 10, ld));
    return h + 0.2;
  };
  ctx.makeTerrain(CX, CZ, 150, 130, H, (x, z, y, c) => { const ld = lakeD(x, z); const cd = Math.hypot(x - CAS.x, z - CAS.z); if (ld < 9) c.setRGB(0.25, 0.22, 0.28); else if (cd < 13) c.setRGB(0.42, 0.4, 0.44); else { const k = Math.sin(x * 0.3) * Math.cos(z * 0.33) * 0.04; c.setRGB(0.3 + k, 0.33 + k, 0.24); } }, group);
  const lakeM = new THREE.Mesh(new THREE.CircleGeometry(8.5, 32), ctx.lifeify(new THREE.MeshToonMaterial({ color: 0x2a3a5a, gradientMap: ctx.grad, transparent: true, opacity: 0.85 }))); lakeM.rotation.x = -Math.PI / 2; lakeM.position.set(LAKE.x, 0.15, LAKE.z); group.add(lakeM);
  const zones = [[SPAWN, 12], [VIL, 12], [OAKP, 8], [LAKE, 11], [CAS, 18], [FIRE, 4]];
  const free = (x, z) => zones.every(([p, r]) => Math.hypot(x - p.x, z - p.z) > r + 2);
  const TREES = ['graveyard/pine-crooked', 'graveyard/pine-fall-crooked', 'town/tree-crooked', 'graveyard/pine-crooked'];
  for (let i = 0; i < 170; i++) { const a = R() * 6.28, r = 8 + Math.sqrt(R()) * 62; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (!free(x, z)) continue; const n = TREES[Math.floor(R() * 4)]; const s = 3.4 + R() * 1.6; const o = kit(n, x, z, s * (r > 52 ? 1.3 : 1), R() * 6.28, -0.1, group, H); if (r < 52) { colliders.push({ x, z, r: 0.6 }); ctx.camBlockers.push(o); } }
  for (let i = 0; i < 40; i++) { const a = R() * 6.28, r = 6 + R() * 46; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (!free(x, z)) continue; kit(['graveyard/rocks-tall', 'graveyard/debris-wood', 'graveyard/pumpkin', 'graveyard/candle-multiple'][i % 4], x, z, 3, R() * 6, 0, group, H); }
  for (let i = 0; i < 6; i++) { const a = R() * 6.28, r = 20 + R() * 25; const gh = kit('graveyard/character-ghost', CX + Math.cos(a) * r, CZ + Math.sin(a) * r, 2.4, R() * 6, 1, group, H); gh.userData.ghost = { a, r, ph: R() * 6 }; }
  homePortal(ctx, group, SPAWN.x + 8, SPAWN.z + 1, H, -0.3); const HOME = V(SPAWN.x + 8, SPAWN.z + 1);
  const fire = campfire(ctx, group, FIRE.x, FIRE.z, H);
  // замок
  const darkT = (o, c = 0x6a6070) => { o.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.color = new THREE.Color(c); ctx.lifeify(m.material); } }); return o; };
  const WR = 13, gateA = Math.atan2(GATE.x - CAS.x, GATE.z - CAS.z); const gateParts = [];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2; let da = a - gateA; da = Math.atan2(Math.sin(da), Math.cos(da)); const x = CAS.x + Math.sin(a) * WR, z = CAS.z + Math.cos(a) * WR;
    if (Math.abs(da) < 0.2) { const g = darkT(kit('castle/gate', x, z, 4, a + Math.PI / 2, 0, group, H), 0x5a4a3a); const col = { x, z, r: 2.2 }; colliders.push(col); gateParts.push({ g, col }); continue; }
    darkT(kit('castle/wall', x, z, 4, a, 0, group, H)); colliders.push({ x, z, r: 2.1 });
  }
  for (const a of [0.8, 2.35, 3.9, 5.5]) { const x = CAS.x + Math.sin(a) * WR, z = CAS.z + Math.cos(a) * WR, y = H(x, z); const s = 4.4; darkT(kit('castle/tower-square', x, z, s, a, 0, group, H)); darkT(kit('castle/tower-square-mid', x, z, s, a, 0, group, () => y + 1.31 * s)); darkT(kit('castle/tower-square-top-roof-high', x, z, s, a, 0, group, () => y + 2.32 * s), 0x4a3a5a); colliders.push({ x, z, r: 2.6 }); }
  for (const dx of [-3, 3]) { kit('castle/flag-banner-long', CAS.x + dx, CAS.z - 6, 3, 0, 0, group, H); }
  const throne = darkT(kit('graveyard/altar-stone', CAS.x, CAS.z - 6, 3.4, 0, 0, group, H), 0x3a3040); colliders.push({ x: CAS.x, z: CAS.z - 6, r: 1.5 });
  const baskets = [[-6, 2], [6, 2], [-8, -5], [8, -5]].map(([dx, dz]) => { const x = CAS.x + dx, z = CAS.z + dz; kit('graveyard/fire-basket', x, z, 4, 0, 0, group, H); const L = new THREE.PointLight(0x9a5aff, 10, 12, 1.6); L.position.set(x, H(x, z) + 1.4, z); group.add(L); return L; });
  // фальшивая деревня
  [[-8, -4, 'town/stall-red'], [6, -6, 'town/stall-green'], [-4, 8, 'survival/tent'], [8, 6, 'town/stall-red']].forEach(([dx, dz, n], i) => { const x = VIL.x + dx, z = VIL.z + dz; kit(n, x, z, n.includes('tent') ? 7 : 3.2, Math.atan2(-dx, -dz), 0, group, H); colliders.push({ x, z, r: 1.8 }); });
  kit('town/fountain-round', VIL.x, VIL.z, 2.2, 0, 0, group, H); colliders.push({ x: VIL.x, z: VIL.z, r: 2 });
  for (let i = 0; i < 6; i++) kit('town/lantern', VIL.x + Math.cos(i) * 11, VIL.z + Math.sin(i) * 11, 2.6, 0, 0, group, H);
  const elder = npc('ded'); elder.root.position.set(VIL.x + 3.5, H(VIL.x + 3.5, VIL.z + 2), VIL.z + 2); group.add(elder.root); elder.root.visible = false;
  const fakes = [[-6, 3], [5, 3], [-2, -6], [2, 9]].map(([dx, dz], i) => { const c = npc(i === 3 ? 'ivan' : 'ivan_false'); const x = VIL.x + dx, z = VIL.z + dz; c.root.position.set(x, H(x, z), z); c.root.rotation.y = R() * 6; group.add(c.root); c.play(i % 2 ? 'idle' : 'walk');
    const aura = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 10), new THREE.MeshBasicMaterial({ color: 0x9a3aff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })); aura.position.y = 1.2; aura.scale.y = 1.4; c.root.add(aura); aura.visible = false;
    return { c, aura, fake: i !== 3, i }; });
  // дуб с сундуком
  const oak = ctx.P('tree_oak', OAKP.x, OAKP.z, 13, 0.7, 0, group, H); colliders.push({ x: OAKP.x, z: OAKP.z, r: 1.6 }); ctx.camBlockers.push(oak);
  const CH = V(OAKP.x + 3.4, OAKP.z + 1, H(OAKP.x, OAKP.z) + 7);
  const chest = kit('survival/chest', 0, 0, 6, 0.4, 0, group, () => 0); chest.position.copy(CH); darkT(chest, 0xb08a5a);
  const chainM = toon(0x4a4a50); const chains = [-0.5, 0.5].map((dx) => M(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 5), chainM, CH.x + dx, CH.y + 3.1, CH.z, group));
  const bunny = ctx.pet('pets/bunny', 0.8); bunny.root.visible = false; group.add(bunny.root);
  const egg = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 12), new THREE.MeshToonMaterial({ color: 0xfff4d8, gradientMap: ctx.grad, emissive: 0x332a10 })); egg.scale.y = 1.3; egg.visible = false; group.add(egg);
  const eggPos = V(LAKE.x - 9.5, LAKE.z + 2); egg.position.set(eggPos.x, H(eggPos.x, eggPos.z) + 0.5, eggPos.z);
  const needle = letterSprite(THREE, '✦', '#ffe27a', 1.2); needle.visible = false; group.add(needle);
  // Кощей
  const ko = npc('koschei', { scale: 0.9 }); ko.root.position.set(CAS.x, H(CAS.x, CAS.z - 4), CAS.z - 4); group.add(ko.root);
  const darks = [];
  const st = () => { const k = ctx.st.kosh; k.stage = k.stage || 0; k.fakes = k.fakes || []; return k; };
  const me = () => ctx.HERO_NAME[player.hero].split(' ')[0];
  const hare = { on: false, pos: V(0, 0), vel: V(0, 0) };
  let duck = null, wave = 0, shadows = [], darkT0 = 3;
  function duckModel() {
    const g = new THREE.Group(); const mat = new THREE.MeshToonMaterial({ color: 0x6a8a4a, gradientMap: ctx.grad, emissive: 0x000000 });
    const b = M(new THREE.SphereGeometry(0.45, 12, 10), mat, 0, 0, 0, g); b.scale.set(0.8, 0.7, 1.2); M(new THREE.SphereGeometry(0.25, 10, 8), toon(0x2a6a3a), 0, 0.35, 0.45, g);
    const bk = M(new THREE.BoxGeometry(0.2, 0.06, 0.25), toon(0xf2a03a), 0, 0.32, 0.72, g);
    const w = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(s * 0.3, 0.1, 0); M(new THREE.BoxGeometry(0.9, 0.05, 0.5), mat, s * 0.45, 0, 0, p); g.add(p); return p; });
    g.userData.mat = mat; g.userData.wings = w; return g;
  }
  function shadowModel() { const g = ctx.makeForgetling(); g.userData.mat.color.setHex(0x3a2a4a); g.scale.setScalar(1.15); return g; }
  function spawnDuck() {
    ctx.removeEnemies('duck');
    duck = ctx.spawnEnemy(group, V(OAKP.x, OAKP.z + 4), { model: duckModel, hp: 2, group: 'duck', name: 'Утка', fly: 4.6, passive: true, still: true, cond: () => player.hero === 'vasilisa' || (player.hero === 'finist' && !player.onGround), immune: 'Утка высоко! Огонёк Василисы (2) или Финист в прыжке (3)',
      custom: (e, dt) => { const t = ctx.T() * 0.6; e.g.position.x = OAKP.x + Math.cos(t) * 7; e.g.position.z = OAKP.z + 4 + Math.sin(t) * 7; e.g.position.y = H(e.g.position.x, e.g.position.z) + 4.6 + Math.sin(ctx.T() * 3) * 0.3; e.g.rotation.y = -t; const w = e.g.userData.wings; w[0].rotation.z = Math.sin(ctx.T() * 16) * 0.6; w[1].rotation.z = -w[0].rotation.z; },
      onDeath: (e) => duckDown(e.g.position.clone()) });
  }
  function spawnWave(n) {
    ctx.removeEnemies('shadow'); wave = n; shadows = [];
    const cnt = n === 1 ? 4 : 5; for (let i = 0; i < cnt; i++) { const a = (i / cnt) * 6.28; shadows.push(ctx.spawnEnemy(group, V(CAS.x + Math.cos(a) * 8, CAS.z + Math.sin(a) * 8), { model: shadowModel, hp: n === 1 ? 3 : 4, group: 'shadow', name: 'Тень Кощея', speed: 3.9 + n * 0.3, aggroR: 30, glow: 0x301040, scale: 1.15, onDeath: waveCheck })); }
    ui.toast(n === 1 ? 'Тени Кощея! Волна 1/2' : 'Ещё тени! Волна 2/2', true, 2000); S.dark();
  }
  function waveCheck() { if (!shadows.every((e) => !e.alive)) return; if (wave === 1) setTimeout(() => st().stage === 7 && spawnWave(2), 1500); else if (wave === 2) { const k = st(); k.stage = 8; ctx.save(); ko.once('sit', 'sit'); ui.toast('Кощей ослаб! Подойди к нему с иглой (F).', true, 3500); S.setTheme('koschei'); } }
  function duckDown(p) {
    const k = st(); k.stage = 5; ctx.save(); S.splash(); burst(p, 0xffffff, 30, 4, 1);
    ui.toast('Из утки выпало яйцо — и булькнуло в озеро!', true, 2500);
    if (ctx.st.pike) setTimeout(() => { if (st().stage === 5) pikeHelp(); }, 1800);
    else setTimeout(() => ui.toast('Яйцо выкатилось на берег… его видно только Сказительским взглядом (Q)', false, 4000), 2600);
  }
  async function pikeHelp() {
    if (ui.busy() || player.locked) { setTimeout(pikeHelp, 800); return; }
    player.locked = true;
    await ui.say('Щука', ['(из чёрной воды высовывается знакомая щука) Иван! Помнишь, ты меня в море отпустил? Долг платежом красен — держи яйцо!']);
    player.locked = false; takeEgg();
  }
  function takeEgg() {
    const k = st(); k.stage = 6; egg.visible = false; ctx.save(); S.chime(); burst(player.pos.clone().setY(player.pos.y + 1.5), 0xffe27a, 50, 4, 1.2);
    ui.toast('Игла Кощея у тебя! Теперь — в замок.', true, 3500);
    ctx.addBook('Кощей Бессмертный', 'Смерть Кощея — на конце иглы, игла — в яйце, яйцо — в утке, утка — в зайце, заяц — в сундуке, а сундук висит на высоком дубе. Сказитель сбил сундук, Финист догнал зайца, утку сбили в небе, а яйцо вернула из озера благодарная щука — или нашёл Сказительский взгляд.');
  }
  // ---- диалоги ----
  const KO = 'Кощей Бессмертный', EL = 'Старый селянин';
  async function fakeTalk(f) {
    const k = st(); if (k.fakes.includes(f.i)) return;
    if (!player.sight) { await ui.say('Иван?', [['Я — Иван! Самый настоящий!', 'Иван я, Иван. Не видишь, что ли?', 'Кто, я? Иван. А ты кто?', 'Здравствуй! Я — Иван, хозяин этих мест.'][f.i], '(что-то здесь не так… Сказительский взгляд — Q)']); return; }
    if (!f.fake) { await ui.say('Иван', ['Не смотри на меня так! Я… я правда Иван. Местный. Меня Кощей не тронул — я ему сказки рассказывал.']); return; }
    S.magic(); burst(f.c.root.position.clone().setY(f.c.root.position.y + 1.2), 0x9a3aff, 50, 4, 1.2); f.c.root.visible = false; k.fakes.push(f.i); ctx.save();
    const n = k.fakes.length; ui.toast(`Морок развеян! (${n}/3)`, true);
    if (n === 3) { elder.root.visible = true; elder.once('emote-yes'); setTimeout(() => ui.toast('Из-за прилавка выглянул старый селянин…'), 1500); }
  }
  async function elderTalk() {
    const k = st();
    if (k.stage <= 1) {
      await ui.say(EL, ['Ох, спасибо, Сказитель! Кощей наслал на деревню мороков — двойников, чтоб никто не знал, кто настоящий. Мы и сами забыли, кто мы.', 'Даже имя нашего царства забыли! Да я вспомнил — от тебя, видать, память вернулась: «Тридевятое»! За тридевять земель, в тридесятом царстве…']);
      ctx.addWord('Тридевятое', 'имя нашего царства — «за тридевять земель». Его вспомнил старик в деревне у замка Кощея.');
      await ui.say(EL, ['А Кощея не победить, пока смерть его цела. Смерть его — на конце иглы, игла — в яйце, яйцо — в утке, утка — в зайце, заяц — в сундуке, а сундук на дубе висит. Вон тот дуб, к востоку!']);
      k.stage = 2; ctx.save(); S.chime(); return;
    }
    await ui.say(EL, ['Сундук — на дубе, к востоку. Бей по нему, пока не упадёт!']);
  }
  async function riddle() {
    const k = st();
    await ui.say(KO, ['(Кощей тяжело дышит, глядя на иглу в твоих руках) Ну… вот и всё. Ломай. Все ломают. Сказка всегда так кончается.', 'Но сперва ответь, Сказитель… Я тысячу лет искал ответ. Что сильнее смерти?']);
    for (;;) {
      const c = await ui.dialog(KO, 'Что сильнее смерти?', ['Меч-кладенец', 'Золото и богатство', 'Память — сказка, которую рассказывают', 'Страх']);
      if (c === 2) break; S.wrong(); await ui.say(KO, ['Нет… Это я пробовал. Не то.']);
    }
    S.chime(); await ui.say(KO, ['Память… Сказка, которую рассказывают… Пока сказку помнят — её герои живы. Даже я.', 'Я наслал забудок, потому что боялся: забудут меня — и я исчезну. А вышло, что забыли всё.', 'Что ж, Сказитель. Решай, чем кончится моя сказка.']);
    const words = ctx.st.words.length; const opts = ['Сломать иглу — пусть Кощей сгинет', 'Спрятать иглу обратно — пусть спит', words >= 7 ? 'Рассказать Кощею его сказку (7 заветных слов)' : `Рассказать Кощею его сказку (нужно 7 слов, у тебя ${words})`];
    let c;
    for (;;) { c = await ui.dialog(me(), 'Чем кончится сказка?', opts); if (c === 2 && words < 7) { S.wrong(); ui.toast('Не хватает заветных слов. Поищи их по всему Тридевятому (Кот учёный, перья Жар-птицы…)', false, 4500); continue; } break; }
    await ending(['break', 'cycle', 'new'][c]);
  }
  async function ending(kind) {
    const k = st(); ctx.st.ending = kind; k.stage = 9; k.done = true; ctx.save(); ctx.removeEnemies('shadow'); darks.forEach((d) => group.remove(d.m)); darks.length = 0;
    if (kind === 'break') {
      S.crack(); burst(ko.root.position.clone().setY(ko.root.position.y + 2), 0x9a3aff, 120, 7, 1.6); ko.root.visible = false;
      await ui.say('Сказитель', ['Игла хрустнула. Кощей рассыпался серой пылью, и забудки разлетелись, как дым.', 'Краски вернулись в Тридевятое царство. Только где-то в глубине сказки стало тихо: историю Кощея больше некому рассказать…']);
    } else if (kind === 'cycle') {
      S.sleep(); ko.play('sit');
      await ui.say('Сказитель', ['Ты вложил иглу в яйцо, яйцо — в утку, утку — в зайца, зайца — в сундук, а сундук повесил на дуб.', 'Кощей уснул на своём троне. Забудки ушли вслед за ним в сон. Царство свободно — до тех пор, пока кто-нибудь снова не забудет сказку…']);
    } else {
      S.restore(); ko.once('emote-yes');
      await ui.say('Сказитель', [ctx.st.words.map((w) => w.word).join('. ') + '. — Ты сложил семь заветных слов в сказку и рассказал её Кощею.', 'Сказку о молодом царе, который так боялся умереть, что спрятал свою смерть на краю света — и разучился жить.']);
      await ui.say(KO, ['Я… помню. Меня звали… неважно. Важно, что теперь меня будут рассказывать. А значит, я буду жить — по-настоящему.', 'Забудки — это мой страх. Пусть станут тем, чем должны были быть: снами и сказками на ночь.']);
      burst(ko.root.position.clone().setY(ko.root.position.y + 2), 0xffe27a, 150, 8, 2);
    }
    await credits(kind);
    ctx.st.festival = true; ctx.save(); await ctx.travel('luk', V(4, 6)); startFestival();
  }
  function credits(kind) {
    return new Promise((res) => {
      const d = document.createElement('div'); d.id = 'credits';
      const title = { break: 'Финал «Сломанная игла»', cycle: 'Финал «Вечный сон»', new: 'Финал «Новая сказка»' }[kind];
      d.innerHTML = `<div class="crIn"><h1>Тридевятое: Сказитель</h1><h2>${title}</h2><p>Сказки не умирают — их рассказывают.</p><br><p><b>Герои</b><br>Иван · Василиса Премудрая · Финист — Ясный Сокол</p><p><b>По мотивам русских народных сказок</b><br>«Баба-Яга», «Морозко», «Финист — Ясный Сокол», «Гуси-лебеди», «Кощей Бессмертный», «Репка», «Колобок», «По щучьему веленью», стихи А. С. Пушкина «У лукоморья дуб зелёный»</p><p><b>3D-модели</b><br>Kenney.nl (CC0): Nature Kit, Blocky Characters, Cube Pets, Castle Kit, Survival Kit, Graveyard Kit, Holiday Kit, Fantasy Town Kit</p><p><b>Музыка и звуки</b><br>синтезированы прямо в браузере (Web Audio)</p><p><b>Движок</b><br>three.js</p><br><p>Спасибо, что играли!</p><p class="muted">Клик или Пробел — продолжить</p></div>`;
      d.style.cssText = 'position:fixed;inset:0;z-index:50;background:radial-gradient(#2a1d3a,#0a0610);color:#fff3d6;display:flex;align-items:center;justify-content:center;text-align:center;font-family:Georgia,serif;overflow:hidden';
      document.body.appendChild(d); S.setTheme('finale'); document.exitPointerLock?.();
      const inner = d.firstChild; inner.style.cssText = 'max-width:640px;line-height:1.6;transform:translateY(60vh);transition:transform 28s linear'; requestAnimationFrame(() => requestAnimationFrame(() => (inner.style.transform = 'translateY(-10vh)')));
      let done = false; const close = () => { if (done) return; done = true; d.remove(); removeEventListener('keydown', key); res(); };
      const key = (e) => { if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') close(); };
      setTimeout(() => { d.addEventListener('click', close); addEventListener('keydown', key); }, 1200); setTimeout(close, 32000);
      if (window.__skipCredits) setTimeout(close, 300);
    });
  }
  function startFestival() {
    S.setTheme('finale'); const L = ctx.REGIONS.luk.group; const ring = [];
    const kinds = ['yaga', 'morozko', 'snegurochka', 'alyonushka', 'ivanushka', 'leshy', ...(ctx.st.ending === 'new' ? ['koschei'] : [])];
    kinds.forEach((kd, i) => { const c = npc(kd, { scale: kd === 'ivanushka' ? 0.48 : 0.68 }); L.add(c.root); c.play('walk'); ring.push({ c, a: (i / kinds.length) * 6.28 }); });
    let fwT = 0;
    ctx.setFestival((dt) => {
      const T = ctx.T(); ring.forEach((r) => { const a = r.a + T * 0.25; const x = Math.cos(a) * 9, z = Math.sin(a) * 9; r.c.root.position.set(x, ctx.REGIONS.luk.H(x, z), z); r.c.root.rotation.y = -a; });
      fwT -= dt; if (fwT < 0) { fwT = 0.7 + Math.random(); const p = V((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, 18 + Math.random() * 10); burst(p, [0xffd23f, 0xff5a7a, 0x7affc8, 0x9fb8ff][Math.floor(Math.random() * 4)], 70, 9, 1.6, 0.4); S.bell && S.bell(600 + Math.random() * 600, 0, 0.05, 1.5, 'sfx'); }
    });
    ui.toast('🎉 Праздник в Лукоморье! Поговори с Котом учёным.', true, 5000);
  }
  // ---- интерактив ----
  fakes.forEach((f) => interactables.push({ label: player.sight ? 'Развеять морок' : 'Поговорить с Иваном', get labelX() { return 0; }, pos: () => f.c.root.position, r: 2.8, cond: () => st().stage >= 1 && f.c.root.visible, act: () => fakeTalk(f) }));
  interactables.forEach((it) => { if (it.label === 'Развеять морок' || it.label === 'Поговорить с Иваном') Object.defineProperty(it, 'label', { get: () => (player.sight ? 'Развеять морок (взгляд)' : 'Поговорить с Иваном') }); });
  interactables.push(
    { label: 'Поговорить со старым селянином', pos: () => elder.root.position, r: 3.2, cond: () => elder.root.visible, act: elderTalk },
    { label: 'Поднять яйцо', pos: () => egg.position, r: 2.6, cond: () => st().stage === 5 && egg.visible && player.sight, act: async () => takeEgg() },
    { label: 'Ворота замка', pos: () => GATE, r: 4.5, cond: () => gateParts[0].col.r > 0, act: async () => { if (st().stage < 6) { await ui.say(me(), ['Ворота заперты. Без иглы Кощея туда соваться нечего.']); return; } openGate(); } },
    { label: 'Иглу — Кощею', pos: () => ko.root.position, r: 4, prio: 5, cond: () => st().stage === 8, act: riddle },
    { label: 'Поговорить с Кощеем', pos: () => ko.root.position, r: 4, cond: () => st().stage === 9, act: async () => { await ui.say(KO, [ctx.st.ending === 'new' ? 'Расскажи мою сказку ещё кому-нибудь, ладно?' : '…']); } },
  );
  ctx.hittables.push({ pos: () => chest.position, r: 3.4, ry: 9, cond: () => st().stage === 2, onHit: () => {
    const k = st(); k.chest = (k.chest || 0) + 1; ctx.save(); S.crack(); ctx.shake(0.2); burst(chest.position.clone(), 0xc8a070, 20, 3, 0.6); chest.rotation.z = Math.sin(k.chest) * 0.3;
    if (k.chest < 3) { ui.toast(`Цепи трещат! (${k.chest}/3)`, false, 1200); return; }
    k.stage = 3; ctx.save(); chains.forEach((c) => (c.visible = false)); dropChest = 1; S.stomp();
    ui.toast('Сундук рухнул и раскололся! Из него выскочил заяц! Догони — нужен рывок Финиста (3, затем R)', true, 5000);
  } });
  let dropChest = 0;
  function openGate() { gateParts.forEach((p) => { p.g.visible = false; p.col.r = 0; }); S.dark(); ui.toast('Ворота со скрипом отворились…', true); st().gate = true; ctx.save(); }
  function objective() {
    const k = st();
    if (k.stage === 0) return [VIL, 'в деревню у дороги'];
    if (k.stage === 1) { if (k.fakes.length < 3) { const f = fakes.find((f) => f.fake && !k.fakes.includes(f.i)); return player.sight ? [f.c.root.position, `развей морок — фальшивый Иван светится (${k.fakes.length}/3)`] : [VIL, `найди фальшивых Иванов Сказительским взглядом (Q) (${k.fakes.length}/3)`]; } return [elder.root.position, 'к старому селянину']; }
    if (k.stage === 2) return [CH, `сбей сундук с дуба — бей по нему (${k.chest || 0}/3)`];
    if (k.stage === 3) return [hare.pos, player.hero === 'finist' ? 'догони зайца рывком (R)!' : 'зайца догонит только Финист (3) — рывок R'];
    if (k.stage === 4) return [duck ? duck.g.position : OAKP, 'сбей утку: огонёк Василисы (2) или Финист в прыжке (3)'];
    if (k.stage === 5) return [ctx.st.pike ? LAKE : eggPos, ctx.st.pike ? 'к озеру — щука поможет' : 'на берег озера — яйцо видно только взглядом (Q)'];
    if (k.stage === 6) return k.gate ? [CAS, 'во двор замка — к Кощею'] : [GATE, 'к воротам замка'];
    if (k.stage === 7) return [CAS, `одолей тени Кощея — волна ${wave}/2 · блок от тёмных шаров — ПКМ/K`];
    if (k.stage === 8) return [ko.root.position, 'подойди к Кощею с иглой (F)'];
    return [HOME, 'домой, в Лукоморье — на праздник'];
  }
  function tracker() {
    const k = st(); const ck = (b) => (b ? '☑' : '☐');
    if (k.stage <= 1) return `<b>💀 Царство Кощея</b><br>${ck(k.fakes.length >= 3)} Морок над деревней (${k.fakes.length}/3)<br>${ck(k.stage > 1)} Узнать, где смерть Кощея`;
    if (k.stage <= 6) return `<b>🪡 Смерть Кощеева</b><br>${ck(k.stage > 2)} Сундук на дубе<br>${ck(k.stage > 3)} Заяц<br>${ck(k.stage > 4)} Утка<br>${ck(k.stage > 5)} Яйцо<br>${ck(k.stage > 6)} Игла — в замок!`;
    if (k.stage <= 8) return `<b>👑 Кощей Бессмертный</b><br>${ck(k.stage > 7)} Тени Кощея (волна ${wave}/2)<br>${ck(false)} Решить судьбу сказки<br><i style="opacity:.8">ПКМ/K — блок, шары можно отбить</i>`;
    return '<b>✨ Сказка рассказана</b><br>• Праздник в Лукоморье!';
  }
  function life() { const k = st(); if (k.done) return ctx.st.ending === 'cycle' ? 0.85 : 1; return [0.08, 0.15, 0.25, 0.32, 0.4, 0.48, 0.55, 0.55, 0.6][k.stage] ?? 0.6; }
  function update(dt, canMove) {
    const T = ctx.T(), k = st(); fire.update(dt, T); group.children.forEach((c) => c.userData.update && c.userData.update(dt));
    group.children.forEach((o) => { const g = o.userData.ghost; if (g) { const a = g.a + T * 0.08; o.position.set(CX + Math.cos(a) * g.r, H(CX + Math.cos(a) * g.r, CZ + Math.sin(a) * g.r) + 1 + Math.sin(T + g.ph) * 0.4, CZ + Math.sin(a) * g.r); o.rotation.y = -a; } });
    baskets.forEach((L, i) => (L.intensity = 9 + Math.sin(T * 9 + i) * 2.5));
    fakes.forEach((f) => { f.aura.visible = player.sight && f.fake; f.aura.material.opacity = 0.25 + Math.sin(T * 5) * 0.08; });
    if (dropChest > 0) { chest.position.y = Math.max(H(CH.x, CH.z) + 0.1, chest.position.y - dt * 14); if (chest.position.y <= H(CH.x, CH.z) + 0.11 && dropChest === 1) { dropChest = 2; burst(chest.position.clone(), 0xc8a070, 40, 5, 0.8); ctx.shake(0.4); startHare(); } }
    // заяц
    if (hare.on) {
      const d = hare.pos.clone().sub(player.pos); d.y = 0; const dist = d.length();
      if (dist < 9) hare.vel.lerp(d.normalize().multiplyScalar(10.5), dt * 4); else hare.vel.lerp(V(Math.cos(T * 0.7), Math.sin(T * 0.7)).multiplyScalar(3), dt * 2);
      hare.pos.addScaledVector(hare.vel, dt); const r = dist2(hare.pos, OAKP); if (r > 22) { hare.pos.x = OAKP.x + (hare.pos.x - OAKP.x) * 22 / r; hare.pos.z = OAKP.z + (hare.pos.z - OAKP.z) * 22 / r; hare.vel.set(-hare.vel.z, 0, hare.vel.x); }
      hare.pos.y = H(hare.pos.x, hare.pos.z); bunny.root.position.copy(hare.pos); bunny.root.rotation.y = Math.atan2(hare.vel.x, hare.vel.z); bunny.play(hare.vel.length() > 4 ? 'run' : 'walk');
      if (dist < 2.4 && canMove) { if (player.dashT > 0 || player.speedT > 0) catchHare(); else if (!hare.warn || T - hare.warn > 4) { hare.warn = T; ui.toast('Заяц увернулся! Нужен рывок Финиста (3, затем R)', false, 2000); } }
    }
    if (k.stage === 5 && !ctx.st.pike) { egg.visible = player.sight; egg.rotation.y += dt; }
    if (needle.visible) needle.position.copy(player.pos).add(V(0, 0, 2.6));
    // босс
    if (k.stage === 6 && k.gate && dist2(player.pos, CAS) < 10 && canMove) startBoss();
    if (k.stage === 7 && canMove) {
      darkT0 -= dt; if (darkT0 < 0) { darkT0 = wave === 2 ? 1.9 : 2.6; throwDark(); }
    }
    for (let i = darks.length - 1; i >= 0; i--) {
      const o = darks[i]; o.t += dt; o.m.position.addScaledVector(o.v, dt); o.m.rotation.y += dt * 5; if (Math.random() < dt * 20) burst(o.m.position.clone(), 0x9a3aff, 1, 0.5, 0.5, 0.15);
      const chestP = player.pos.clone().setY(player.pos.y + 1.2);
      if (!o.back && o.m.position.distanceTo(chestP) < 1.2) {
        const fwd = V(Math.sin(player.facing), Math.cos(player.facing)); const toO = o.m.position.clone().sub(player.pos).setY(0).normalize();
        if (ctx.mouseBlock() && fwd.dot(toO) > 0.1) { o.back = true; o.v.multiplyScalar(-1.2); S.hit(); ui.toast('Отбил тёмный шар!', false, 900); }
        else { ctx.hurtPlayer(1, 'Тёмный шар Кощея! Блок — ПКМ/K'); group.remove(o.m); darks.splice(i, 1); continue; }
      }
      if (o.back) { const kp = ko.root.position.clone().setY(ko.root.position.y + 2); if (o.m.position.distanceTo(kp) < 1.5) { burst(kp, 0x9a3aff, 30, 4, 0.8); S.hit(); ko.once('emote-no'); o.t = 9; } }
      if (o.t > 4) { group.remove(o.m); darks.splice(i, 1); }
    }
    if (near(player.pos, ko.root.position, 14) && k.stage !== 7) { const d = player.pos.clone().sub(ko.root.position); ko.root.rotation.y = Math.atan2(d.x, d.z); }
    if (k.stage === 7) { const d = player.pos.clone().sub(ko.root.position); ko.root.rotation.y = Math.atan2(d.x, d.z); }
    if (k.stage === 0 && dist2(player.pos, VIL) < 14) { k.stage = 1; ctx.save(); ui.toast('Странная деревня… все жители — на одно лицо. Попробуй Сказительский взгляд (Q).', false, 4500); }
  }
  function throwDark() {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), new THREE.MeshBasicMaterial({ color: 0x2a0a3a })); const gl = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 8), new THREE.MeshBasicMaterial({ color: 0x9a3aff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); m.add(gl);
    m.position.copy(ko.root.position).setY(ko.root.position.y + 2.4); group.add(m); ko.once('attack-melee-right');
    const v = player.pos.clone().setY(player.pos.y + 1.2).sub(m.position).normalize().multiplyScalar(11); darks.push({ m, v, t: 0 }); S.magic();
  }
  function startHare() { const k = st(); hare.on = true; hare.pos.copy(chest.position).setY(0); bunny.root.visible = true; hare.vel.set(5, 0, 3); }
  function catchHare() {
    const k = st(); hare.on = false; bunny.root.visible = false; burst(hare.pos.clone().setY(hare.pos.y + 0.8), 0xffffff, 40, 4, 1); S.chime();
    k.stage = 4; ctx.save(); spawnDuck(); ui.toast('Поймал зайца! Но из него вылетела утка — высоко над дубом!', true, 4000); S.honk();
  }
  async function startBoss() {
    const k = st(); k.stage = 7; ctx.save(); player.locked = true; S.setTheme('boss');
    await ui.say(KO, ['Ха-ха-ха! Явился, Сказитель! Думаешь, иголкой меня напугаешь? Я — Кощей Бессмертный!', 'Это я наслал забудок. Пусть всё забудется — тогда никто не вспомнит и сказку о моей смерти!', 'Тени мои! Взять его!']);
    player.locked = false; spawnWave(1); darkT0 = 3;
  }
  function init() { const k = st(); if (k.gate) openGate(); if (k.fakes) k.fakes.forEach((i) => (fakes[i].c.root.visible = false)); if (k.fakes.length >= 3) elder.root.visible = true; if (k.stage >= 3) { chains.forEach((c) => (c.visible = false)); chest.position.y = H(CH.x, CH.z) + 0.1; } if (k.stage === 3) startHare(); if (k.stage === 4) spawnDuck(); if (k.stage === 7) { k.stage = 6; } if (k.stage === 8) ko.play('sit'); if (k.done && ctx.st.ending === 'break') ko.root.visible = false; }
  function onSleep() { const k = st(); if (k.stage === 7) { ctx.removeEnemies('shadow'); darks.forEach((d) => group.remove(d.m)); darks.length = 0; k.stage = 6; ctx.save(); player.pos.set(GATE.x, H(GATE.x, GATE.z + 6), GATE.z + 6); S.setTheme('koschei'); } if (k.stage === 4) spawnDuck(); }
  function onEnter() { const k = st(); if (k.stage === 0) setTimeout(() => ui.toast('Здесь холодно и тихо. Даже ветер боится шуметь…', false, 3500), 2800); }
  const TP = [['Вход', () => SPAWN.clone()], ['Деревня', () => VIL.clone().add(V(0, 10))], ['Дуб с сундуком', () => OAKP.clone().add(V(-4, 6))], ['Чёрное озеро', () => LAKE.clone().add(V(-11, 4))], ['Ворота замка', () => GATE.clone().add(V(0, 5))]];
  return {
    id: 'kosh', name: '💀 Царство Кощея Бессмертного', center: new THREE.Vector2(CX, CZ), radius: 54, H, group, music: 'koschei', water: false,
    sky: makeSky(THREE, 0x4a3a7a, 0xb8a8c8), sun: 1.6, fogNear: 28, fogFar: 130, amb: { wind: 0.08, windFreq: 220, water: 0 },
    mm: { bg: [40, 30, 50], land: [80, 85, 70] }, mmDraw: (c, X, Z, k, g) => { c.fillStyle = g([90, 90, 100], [40, 60, 100]); c.beginPath(); c.arc(X(LAKE.x), Z(LAKE.z), 8.5 * k, 0, 7); c.fill(); c.strokeStyle = '#555'; c.lineWidth = 3; c.beginPath(); c.arc(X(CAS.x), Z(CAS.z), 13 * k, 0, 7); c.stroke(); },
    icons: () => [['🏰', CAS.x, CAS.z], ['🏘', VIL.x, VIL.z], ['🌳', OAKP.x, OAKP.z], ['🔥', FIRE.x, FIRE.z], ['🌀', HOME.x, HOME.z]],
    life, spawn: () => SPAWN.clone(), surface: (x, z) => (dist2({ x, z }, CAS) < 13 ? 'stone' : 'grass'), tp: TP, objective, tracker, update, init, onEnter, onSleep, startFestival,
  };
}
