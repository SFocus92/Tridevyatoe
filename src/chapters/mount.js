// Глава 2. Ледяные горы — Морозко забыл, что он добрый
import { near, makeSky, homePortal, letterSprite, campfire, rng } from './common.js';
export default function mount(ctx) {
  const { THREE, S, ui, toon, kit, npc, M, burst, player, colliders, interactables, wait } = ctx;
  const CX = 0, CZ = 600; const V = (x, z, y = 0) => new THREE.Vector3(x, y, z);
  const group = new THREE.Group(); group.name = 'mount'; const R = rng(313);
  const SPAWN = V(CX, CZ + 44), SNEG = V(CX - 5, CZ + 32), MOROZ = V(CX - 2, CZ - 26), LAKE = V(CX + 22, CZ + 8), SLED = V(CX - 30, CZ + 6);
  const FIRES = [V(CX + 7, CZ + 36), V(CX + 9, CZ + 20), V(CX - 12, CZ - 12), V(CX - 22, CZ + 14)];
  const bump = (x, z, p, r, h) => h * Math.exp(-((x - p.x) ** 2 + (z - p.z) ** 2) / (r * r));
  const H = (x, z) => {
    const lx = x - CX, lz = z - CZ, r = Math.hypot(lx, lz);
    const lake = Math.hypot(x - LAKE.x, z - LAKE.z);
    let h = 0.8 + 1.2 * Math.sin(lx * 0.07) * Math.cos(lz * 0.06) + 0.5 * Math.sin(lx * 0.17 + lz * 0.11);
    h *= 1 - ctx.smooth(14, 9, lake) * 0.9; h *= 1 - ctx.smooth(10, 5, Math.hypot(x - SPAWN.x, z - SPAWN.z)) * 0.7;
    h += bump(x, z, MOROZ, 13, 6) + ctx.smooth(44, 64, r) * 26 * (0.8 + 0.2 * Math.sin(Math.atan2(lz, lx) * 5));
    if (lake < 11) h = Math.min(h, 0.25);
    return h;
  };
  ctx.makeTerrain(CX, CZ, 160, 140, H, (x, z, y, c) => { const lake = Math.hypot(x - LAKE.x, z - LAKE.z); if (lake < 11) c.setRGB(0.62, 0.8, 0.92); else if (y > 9) c.setRGB(0.95, 0.97, 1); else { const k = Math.sin(x * 0.4) * Math.cos(z * 0.33) * 0.03; c.setRGB(0.88 + k, 0.92 + k, 0.98); } }, group);
  const ice = new THREE.Mesh(new THREE.CircleGeometry(11, 40), ctx.lifeify(new THREE.MeshToonMaterial({ color: 0xbfe4ff, gradientMap: ctx.grad, transparent: true, opacity: 0.8 }))); ice.rotation.x = -Math.PI / 2; ice.position.set(LAKE.x, 0.3, LAKE.z); group.add(ice);
  const zones = [[SPAWN, 12], [SNEG, 4], [MOROZ, 12], [LAKE, 13], [SLED, 5], ...FIRES.map((f) => [f, 4])];
  const free = (x, z) => zones.every(([p, r]) => Math.hypot(x - p.x, z - p.z) > r + 2);
  for (let i = 0; i < 230; i++) { const a = R() * 6.28, r = 8 + Math.sqrt(R()) * 62; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (!free(x, z)) continue; const n = ['holiday/tree-snow-a', 'holiday/tree-snow-b', 'holiday/tree-snow-c'][Math.floor(R() * 3)]; const s = 3.2 + R() * 2; const o = kit(n, x, z, s * (r > 52 ? 1.4 : 1), R() * 6.28, -0.1, group, H); if (r < 52) { colliders.push({ x, z, r: 0.7 }); ctx.camBlockers.push(o); } }
  for (let i = 0; i < 30; i++) { const a = R() * 6.28, r = 8 + R() * 44; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (!free(x, z)) continue; kit(R() < 0.5 ? 'holiday/rocks-large' : 'holiday/snow-pile', x, z, 1.5 + R(), R() * 6, -0.1, group, H); colliders.push({ x, z, r: 1.6 }); }
  [[8, 40], [-12, 26], [16, -4]].forEach(([x, z], i) => kit(i % 2 ? 'holiday/snowman-hat' : 'holiday/snowman', CX + x, CZ + z, 2.4, R() * 6, 0, group, H));
  [[-26, 18], [-34, 0], [4, 10]].forEach(([x, z]) => { const d = ctx.pet('pets/deer', 1.2); d.root.position.set(CX + x, H(CX + x, CZ + z), CZ + z); d.root.rotation.y = R() * 6; group.add(d.root); d.play('eat'); });
  homePortal(ctx, group, SPAWN.x + 8, SPAWN.z + 1, H, -0.3); const HOME = V(SPAWN.x + 8, SPAWN.z + 1);
  const fires = FIRES.map((f) => campfire(ctx, group, f.x, f.z, H));
  // ледяной терем Морозко
  const iceMat = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0xcfeaff, gradientMap: ctx.grad, emissive: 0x15304a })); const iceTint = (o) => { o.traverse((m) => { if (m.isMesh) m.material = iceMat; }); return o; };
  const PAL = V(MOROZ.x, MOROZ.z - 9);
  [[-7, 0, 'castle/tower-hexagon-base'], [7, 0, 'castle/tower-hexagon-base'], [0, -3, 'castle/tower-square']].forEach(([dx, dz, n]) => {
    const x = PAL.x + dx, z = PAL.z + dz; const y = H(x, z) - 0.2; const s = 4.2;
    const b = iceTint(kit(n, x, z, s, 0, -0.2, group, H)); const mid = iceTint(kit(n === 'castle/tower-square' ? 'castle/tower-square-mid' : 'castle/tower-hexagon-mid', x, z, s, 0, 0, group, () => y + 1.31 * s));
    iceTint(kit(n === 'castle/tower-square' ? 'castle/tower-square-top-roof-high' : 'castle/tower-hexagon-roof', x, z, s, 0, 0, group, () => y + 1.31 * s + (n === 'castle/tower-square' ? 1.01 : 0.46) * s));
    colliders.push({ x, z, r: 2.4 }); ctx.camBlockers.push(b, mid);
  });
  for (const dx of [-3.5, 3.5]) { iceTint(kit('castle/wall', PAL.x + dx, PAL.z + 0.5, 3.6, 0, -0.2, group, H)); colliders.push({ x: PAL.x + dx, z: PAL.z + 0.5, r: 1.9 }); }
  iceTint(kit('castle/gate', PAL.x, PAL.z + 1.4, 3.6, Math.PI / 2, -0.2, group, H));
  // сани и варежки
  kit('holiday/sled-long', SLED.x, SLED.z, 3, 0.6, 0, group, H); kit('holiday/present-a-round', SLED.x + 2.5, SLED.z - 1, 1.6, 0.3, 0, group, H); colliders.push({ x: SLED.x, z: SLED.z, r: 1.6 });
  const mitt = new THREE.Group(); const mm = toon(0xd23a2a), mw = toon(0xffffff, {}, true);
  for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.x = s * 0.35; mitt.add(g); M(new THREE.BoxGeometry(0.42, 0.55, 0.2), mm, 0, 0.28, 0, g); M(new THREE.BoxGeometry(0.16, 0.22, 0.18), mm, s * 0.26, 0.3, 0, g); M(new THREE.BoxGeometry(0.46, 0.12, 0.24), mw, 0, 0.02, 0, g); g.rotation.z = s * 0.2; }
  mitt.position.set(SLED.x - 2.2, H(SLED.x - 2.2, SLED.z + 1.5) + 0.25, SLED.z + 1.5); group.add(mitt);
  // жители
  const sneg = npc('snegurochka'); sneg.root.position.copy(SNEG).setY(H(SNEG.x, SNEG.z)); sneg.root.rotation.y = 0.4; group.add(sneg.root);
  const moroz = npc('morozko', { scale: 0.85 }); moroz.root.position.copy(MOROZ).setY(H(MOROZ.x, MOROZ.z)); group.add(moroz.root);
  const finist = npc('finist'); finist.root.position.set(LAKE.x, 0.3, LAKE.z); group.add(finist.root); finist.play('static');
  const block = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3, 2.2), new THREE.MeshToonMaterial({ color: 0x9fd8ff, gradientMap: ctx.grad, transparent: true, opacity: 0.55, emissive: 0x103050 })); block.position.set(LAKE.x, 1.6, LAKE.z); group.add(block);
  const blockCol = { x: LAKE.x, z: LAKE.z, r: 1.4 }; colliders.push(blockCol);
  // снег
  const snowGeo = new THREE.BufferGeometry(); const sn = new Float32Array(900 * 3); for (let i = 0; i < 900; i++) { sn[i * 3] = (R() - 0.5) * 60; sn[i * 3 + 1] = R() * 25; sn[i * 3 + 2] = (R() - 0.5) * 60; }
  snowGeo.setAttribute('position', new THREE.BufferAttribute(sn, 3));
  const snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.16, transparent: true, opacity: 0.85, depthWrite: false })); group.add(snow);
  // холод
  const coldFx = document.createElement('div'); coldFx.style.cssText = 'position:fixed;inset:0;pointer-events:none;box-shadow:inset 0 0 140px 50px rgba(200,235,255,.95);opacity:0;transition:opacity .3s;z-index:3'; document.body.appendChild(coldFx);

  const st = () => { const m = ctx.st.mount; m.stage = m.stage || 0; return m; };
  const me = () => ctx.HERO_NAME[player.hero].split(' ')[0];
  const guards = [];
  function spawn() {
    ctx.removeEnemies('ice'); guards.length = 0; const m = st();
    if (m.stage <= 2 && !m.iceDone) for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.6; guards.push(ctx.spawnEnemy(group, V(LAKE.x + Math.cos(a) * 8, LAKE.z + Math.sin(a) * 8), { hp: 3, group: 'ice', name: 'Ледяная забудка', glow: 0x1a4060, speed: 3.6, passive: m.stage < 2, onDeath: () => { if (guards.every((e) => !e.alive)) { st().iceDone = true; ctx.save(); ui.toast('Ледяные забудки уснули. Разбей лёд — три удара!', false, 3000); } }, model: iceModel })); }
  }
  function iceModel() { const g = ctx.makeForgetling(); g.userData.mat.color.setHex(0xa8dcff); g.userData.mat.emissive?.setHex(0x1a4060); const sp = new THREE.MeshBasicMaterial({ color: 0xe8f8ff }); for (let i = 0; i < 5; i++) { const c = M(new THREE.ConeGeometry(0.12, 0.6, 4), sp, Math.cos(i * 1.25) * 0.4, 0.45, Math.sin(i * 1.25) * 0.4, g); c.rotation.set(Math.sin(i) * 0.5, 0, Math.cos(i) * 0.5); } return g; }

  const SN = 'Снегурочка', MZ = 'Морозко', FN = 'Финист — Ясный Сокол';
  async function snegTalk() {
    const m = st();
    if (m.stage === 0) {
      await ui.say(SN, ['Ой, путник! Как ты сюда дошёл — тут ведь всё замёрзло…', 'Я Снегурочка, внучка Морозко. Дедушка мой всегда был строгий, но добрый: кто к нему с уважением — того одарит.', 'А теперь забудки выстудили ему память. Он забыл, что он добрый, — и заморозил горы. И сокола ясного, Финиста, во льду у озера запер!', 'Иди к дедушке, к ледяному терему. Только помни: тут лютый холод — грейся у костров!']);
      m.stage = 1; ctx.save(); S.chime(); return;
    }
    if (m.stage === 1) { await ui.say(SN, ['Дедушка в ледяном тереме, наверху. Он будет испытывать тебя — отвечай, как в сказке отвечала падчерица: кротко и с уважением.']); return; }
    if (m.stage === 2) { await ui.say(SN, ['Финист во льду, на озере. Ледяные забудки его сторожат!']); return; }
    if (m.stage === 3) {
      await ui.say(SN, ['Финист свободен! Ой, спасибо! Спой со мной весеннюю песенку — пусть горы вспомнят, что за зимой всегда приходит весна.']);
      let ok = 0; for (let i = 0; i < 3; i++) { const r = await ui.timing(['«Весна, весна красная…»', '«…приди, весна, с радостью…»', '«…с великою милостью!»'][i], 0.9 + i * 0.2); if (r) { ok++; S.chime(); } else { S.wrong(); i--; ui.toast('Сбился — ещё разок!'); } }
      burst(sneg.root.position.clone().setY(sneg.root.position.y + 2), 0xbfffd0, 60, 5, 1.4); S.restore();
      await ui.say(SN, ['Слышишь? Ручьи под снегом зажурчали! Держи заветное слово — «Весна». Оно растопит любую стужу.', 'А ещё дедушка в санях свои волшебные варежки обронил — без них он не может ни холод отогнать, ни тепло подарить. Их только Сказительским взглядом увидишь.']);
      ctx.addWord('Весна', 'то, что всегда приходит после зимы. Песня Снегурочки.'); m.stage = 4; ctx.save(); return;
    }
    if (m.stage === 4) { await ui.say(SN, ['Варежки — у саней на западном склоне. Смотри Сказительским взглядом (Q)!']); return; }
    await ui.say(SN, ['Весна придёт, а я — растаю? Нет, Сказитель: в сказке я каждую зиму возвращаюсь. Спасибо тебе!']);
  }
  async function morozTalk() {
    const m = st();
    if (m.stage === 0) { await ui.say(MZ, ['(холодный ветер) Кто тут? Уходи… Холодно…']); return; }
    if (m.stage === 1) {
      await ui.say(MZ, ['Кто посмел прийти в мои горы? Я — Морозко! Я… я уж и не помню, зачем тут всё заморозил. Поглядим, каков ты.']);
      let good = m.test || 0;
      while (good < 3) {
        S.freeze(); burst(player.pos.clone().setY(player.pos.y + 1.5), 0xe8f8ff, 30, 3, 1);
        const c = await ui.dialog(MZ, ['Тепло ли тебе, путник? Тепло ли тебе, красный?', 'А теперь — тепло ли тебе? (мороз крепчает, трещат ели)', 'Тепло ли тебе, путник? Тепло ли, касатик? (иней на ресницах)'][good], ['Тепло, Морозушко, тепло, батюшка.', 'Холодно! Прекрати сейчас же!', 'Отстань, старик, без тебя тошно.']);
        if (c === 0) { good++; m.test = good; ctx.save(); S.chime(); player.cold = Math.max(0, (player.cold || 0) - 30); }
        else { S.wrong(); ctx.hurtPlayer(1, 'Морозко рассердился и дохнул стужей!', true); await ui.say(MZ, ['Ишь какой! Грубых я не жалую. А ну-ка ещё раз…']); good = 0; m.test = 0; if (player.hp <= 0) return; }
      }
      S.restore(); moroz.once('emote-yes');
      await ui.say(MZ, ['Ох-хо… «Тепло, батюшка»… Так мне падчерица отвечала когда-то. Кроткая, добрая. Я ей сундук приданого подарил — помню!', 'Значит, я… добрый? Добрый! Вспомнил! На, укутайся в мою шубу — теперь холод тебя меньше берёт.', 'А Финиста-сокола я во льду запер, сам не знаю зачем. Лёд мой забудки сторожат — разбей его, а я уж не помешаю.']);
      m.stage = 2; m.coat = true; ctx.save(); spawn(); ui.toast('Шуба Морозко: холод вдвое слабее', true); return;
    }
    if (m.stage === 2 || m.stage === 3) { await ui.say(MZ, [m.stage === 2 ? 'Озеро — к востоку. Разбей лёд и освободи сокола!' : 'Внучка моя хотела с тобой спеть. Ступай к ней.']); return; }
    if (m.stage === 4) {
      if (!m.mitt) { await ui.say(MZ, ['Варежки мои потерялись… Без них я не могу ни холод отогнать, ни тепло вернуть. У саней, кажется, обронил.']); return; }
      await ui.say(MZ, ['Мои варежки! Ну, теперь держись, зима — пора и честь знать!', '(Морозко хлопает варежками — снег осыпается, вершины розовеют, и в горах становится светло и тихо)']);
      S.restore(); burst(moroz.root.position.clone().setY(moroz.root.position.y + 3), 0xffffff, 90, 7, 1.6);
      await ui.say(MZ, ['Возьми за это слово заветное — «Правь». Это закон, по которому живёт всё на свете: зима сменяет осень, весна — зиму, а добро возвращается добром.']);
      ctx.addWord('Правь', 'закон мира: всё идёт своим чередом, и добро возвращается добром. Подарок Морозко.');
      ctx.addBook('Морозко', 'В Ледяных горах Морозко забыл, что он добрый. Сказитель, как падчерица в старой сказке, на вопрос «Тепло ли тебе?» трижды кротко ответил: «Тепло, батюшка». Морозко вспомнил себя, а найденные варежки вернули горам свет.');
      m.stage = 5; m.done = true; ctx.save();
      setTimeout(() => ui.toast('Портал в Лукоморье теперь ведёт и к Молочным рекам.', false, 4000), 1200); return;
    }
    await ui.say(MZ, ['Ступай, добрый молодец. Будешь мёрзнуть — вспомни: «Тепло, батюшка!» — и согреешься.']);
  }
  async function freeFinist() {
    const m = st(); S.crack(); burst(block.position.clone(), 0xe8f8ff, 80, 6, 1.3, 0.3); block.visible = false; blockCol.r = 0; finist.play('idle'); finist.once('emote-yes');
    await ui.say(FN, ['Свобода! Я — Финист, Ясный Сокол. Меня заморозили, когда я летел за помощью для Тридевятого царства.', 'Ты — Сказитель? Тогда я с тобой! Я быстрый: рывок (R), двойной прыжок, а если держать прыжок — парю, как птица.']);
    ctx.addBook('Финист — Ясный Сокол', 'Финист — Ясный Сокол летел за подмогой, но Морозко, забывший доброту, заморозил его в ледяной глыбе у озера. Сказитель усыпил ледяных забудок и тремя ударами разбил лёд. Финист обернулся добрым молодцем и стал спутником Сказителя.');
    finist.root.visible = false; ctx.unlockHero('finist'); player.maxHp += 1; player.hp = player.maxHp; ui.toast('+1 ❤ — Финист делится силой', false, 3000);
    m.stage = 3; m.finist = true; ctx.save();
  }
  interactables.push(
    { label: 'Поговорить со Снегурочкой', pos: () => sneg.root.position, r: 3.4, act: snegTalk },
    { label: 'Поговорить с Морозко', pos: () => moroz.root.position, r: 3.6, act: morozTalk },
    { label: 'Поднять варежки', pos: () => mitt.position, r: 2.8, cond: () => st().stage === 4 && !st().mitt && player.sight, act: async () => { st().mitt = true; ctx.save(); S.chime(); ui.toast('Варежки Морозко найдены! Неси их хозяину.', true); } },
  );
  ctx.hittables.push({ pos: () => block.position, r: 2.4, ry: 4, cond: () => st().stage === 2 && block.visible, onHit: () => {
    const m = st(); if (guards.some((e) => e.alive)) { ui.toast('Сначала усыпи ледяных забудок!', false, 1500); return; }
    m.ice = (m.ice || 0) + 1; S.crack(); ctx.shake(0.2); burst(block.position.clone(), 0xe8f8ff, 20, 4, 0.6); block.scale.setScalar(1 - m.ice * 0.08);
    if (m.ice >= 3) freeFinist(); else ui.toast(`Лёд трещит! (${m.ice}/3)`, false, 1200);
  } });
  function objective() {
    const m = st();
    if (m.stage === 0) return [SNEG, 'к девушке в голубой шубке'];
    if (m.stage === 1) return [MOROZ, 'к Морозко в ледяной терем — отвечай кротко'];
    if (m.stage === 2) return [LAKE, guards.some((e) => e.alive) ? 'на озеро — усыпи ледяных забудок' : 'разбей лёд — три удара!'];
    if (m.stage === 3) return [SNEG, 'к Снегурочке — спеть весеннюю песню'];
    if (m.stage === 4) return m.mitt ? [MOROZ, 'отнеси варежки Морозко'] : [mitt.position, 'к саням — варежки видны только взглядом (Q)'];
    return [HOME, 'домой через арку — к Молочным рекам'];
  }
  function tracker() {
    const m = st(); const ck = (b) => (b ? '☑' : '☐'); const cold = Math.round(player.cold || 0);
    const t = `<b>🏔 Ледяные горы</b><br>${ck(m.stage > 0)} Узнать, что случилось<br>${ck(m.stage > 1)} Испытание Морозко${m.stage === 1 ? ` (${m.test || 0}/3)` : ''}<br>${ck(m.stage > 2)} Освободить Финиста<br>${ck(m.stage > 3)} Песня Снегурочки<br>${ck(m.done)} Варежки Морозко`;
    return t + (m.done ? '' : `<br><span style="color:${cold > 70 ? '#ff9a8a' : '#bfe6ff'}">🥶 Холод: ${cold}%${m.coat ? ' (шуба)' : ''}</span>`);
  }
  function life() { const m = st(); return m.done ? 1 : [0.12, 0.28, 0.45, 0.6, 0.75][m.stage] ?? 0.75; }
  function update(dt, canMove) {
    const T = ctx.T(), m = st();
    fires.forEach((f) => f.update(dt, T)); group.children.forEach((c) => c.userData.update && c.userData.update(dt));
    // снегопад вокруг игрока
    snow.position.set(player.pos.x, player.pos.y - 4, player.pos.z); const a = snowGeo.attributes.position.array;
    for (let i = 0; i < 900; i++) { a[i * 3 + 1] -= dt * (m.done ? 1.2 : 3); a[i * 3] += Math.sin(T + i) * dt * 0.5; if (a[i * 3 + 1] < 0) a[i * 3 + 1] = 25; }
    snowGeo.attributes.position.needsUpdate = true; snow.material.opacity = m.done ? 0.4 : 0.85;
    // холод
    if (canMove && !m.done) {
      const warm = FIRES.some((f) => near(player.pos, f, 4));
      if (!warm) player.cold = Math.min(100, (player.cold || 0) + dt * (m.coat ? 1.3 : 2.6));
      if (player.cold >= 100) { player.cold = 55; ctx.hurtPlayer(1, 'Ты замерзаешь! Беги к костру 🔥', true); }
    }
    coldFx.style.opacity = m.done ? 0 : Math.max(0, ((player.cold || 0) - 40) / 60);
    mitt.visible = m.stage === 4 && !m.mitt && player.sight; mitt.rotation.y += dt;
    block.material.emissive.setHex(player.sight ? 0x305080 : 0x103050);
    for (const c of [sneg, moroz]) if (near(player.pos, c.root.position, 8)) { const d = player.pos.clone().sub(c.root.position); c.root.rotation.y = Math.atan2(d.x, d.z); }
    if (m.stage === 2) guards.forEach((e) => (e.passive = false));
  }
  function surface(x, z) { return Math.hypot(x - LAKE.x, z - LAKE.z) < 11 ? 'stone' : 'snow'; }
  function init() { const m = st(); spawn(); if (m.finist) { block.visible = false; blockCol.r = 0; finist.root.visible = false; } }
  function onSleep() { player.cold = 0; spawn(); }
  function onLeave() { coldFx.style.opacity = 0; }
  function onEnter() { if (st().stage === 0) setTimeout(() => ui.toast('Бр-р-р! Лютый холод. Держись поближе к кострам.', false, 3500), 2800); }
  const TP = [['Вход в горы', () => SPAWN.clone()], ['Снегурочка', () => SNEG.clone().add(V(2, 3))], ['Ледяной терем', () => MOROZ.clone().add(V(2, 5))], ['Замёрзшее озеро', () => LAKE.clone().add(V(-12, 2))], ['Сани', () => SLED.clone().add(V(3, 4))]];
  return {
    id: 'mount', name: '🏔 Ледяные горы', center: new THREE.Vector2(CX, CZ), radius: 54, H, group, music: 'mountains', water: false,
    sky: makeSky(THREE, 0x6aa8e8, 0xe8f4ff), sun: 2.4, fogNear: 30, fogFar: 140, amb: { wind: 0.12, windFreq: 520, water: 0 },
    mm: { bg: [150, 170, 190], land: [225, 235, 245] }, mmDraw: (c, X, Z, k, g) => { c.fillStyle = g([160, 170, 180], [150, 200, 240]); c.beginPath(); c.arc(X(LAKE.x), Z(LAKE.z), 11 * k, 0, 7); c.fill(); },
    icons: () => [['❄', MOROZ.x, MOROZ.z], ['👧', SNEG.x, SNEG.z], ['🛷', SLED.x, SLED.z], ['🔥', FIRES[0].x, FIRES[0].z], ['🔥', FIRES[1].x, FIRES[1].z], ['🔥', FIRES[2].x, FIRES[2].z], ['🔥', FIRES[3].x, FIRES[3].z], ['🌀', HOME.x, HOME.z]],
    life, spawn: () => SPAWN.clone(), surface, tp: TP, objective, tracker, update, init, onEnter, onSleep, onLeave,
  };
}
