// v1.4–v1.6 «Новые сказки в старых краях»: русские народные сказки (свой пересказ) —
// Лукоморье: «Вершки и корешки», «Каша из топора», «Петушок — золотой гребешок», «Иван-царевич и Серый волк»;
// лес: «Маша и медведь», «Волк и семеро козлят»; горы: «Лиса и волк», «Зимовье зверей»; реки: «Крошечка-Хаврошечка»;
// Кощеево царство: «Марья Моревна»; Калинов мост: «Илья Муромец и Соловей-разбойник». Награды — в «Сундуке чудес».
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export function initTales(c) {
  const { THREE, S, ui, player, M } = c; const H = c.lukH; const LUKG = c.REGIONS.luk.group;
  const V = (x, z, dy = 0) => new THREE.Vector3(x, H(x, z) + dy, z);
  const inLuk = () => c.region() === c.REGIONS.luk;
  const TS = () => { const s = c.st; s.tales ||= {}; const t = s.tales; t.items ||= {}; return t; };
  const T3 = (col, o) => c.toon(col, o || {}, true);
  const me = () => c.HERO_NAME[player.hero].split(' ')[0];
  const near = (a, b, r) => Math.hypot(a.x - b.x, a.z - b.z) < r;
  const look = (o, p) => { o.rotation.y = Math.atan2(p.x - o.position.x, p.z - o.position.z); };
  const tint = (o, col) => { o.traverse((m) => { if (m.material) { m.material = m.material.clone(); m.material.color?.multiply(new THREE.Color(col)); } }); return o; };
  const blob = (par, col, r, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = M(new THREE.SphereGeometry(r, 12, 10), typeof col === 'number' ? T3(col) : col, x, y, z, par); m.scale.set(sx, sy, sz); return m; };
  const g = new THREE.Group(); g.name = 'luk-tales'; LUKG.add(g);
  const legsAnim = (o, ph, amp = 0.5) => o.userData.legs?.forEach((l, i) => (l.rotation.x = Math.sin(ph + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0)) * amp));
  // ---------- звери ----------
  function makeBear(s = 1) {
    const o = new THREE.Group(), b = T3(0x7a4a26), mz = 0xc89a6a;
    blob(o, b, 0.9, 0, 1.15, 0, 1, 0.95, 1.3); blob(o, b, 0.52, 0, 1.95, 1.0); blob(o, mz, 0.24, 0, 1.82, 1.45, 1, 0.8, 1); blob(o, 0x111111, 0.08, 0, 1.9, 1.67);
    for (const sx of [-1, 1]) { blob(o, b, 0.17, sx * 0.34, 2.38, 0.9); blob(o, 0x111111, 0.06, sx * 0.18, 2.06, 1.43); }
    const legs = []; for (const [x, z] of [[-0.45, 0.6], [0.45, 0.6], [-0.45, -0.6], [0.45, -0.6]]) { const p = new THREE.Group(); p.position.set(x, 0.85, z); o.add(p); M(new THREE.CylinderGeometry(0.22, 0.2, 0.85, 8), T3(0x6a3e1e), 0, -0.42, 0, p); legs.push(p); }
    o.userData.legs = legs; o.scale.setScalar(s); return o;
  }
  c.makeBear = makeBear; // тот же медведь — в вечернем театре («Теремок», «Зимовье зверей»)
  function makeGoose(s = 1) {
    const o = new THREE.Group(), w = T3(0xf6f6f2), or = T3(0xff9a2a);
    blob(o, w, 0.42, 0, 0.6, 0, 1, 0.8, 1.4); const n = M(new THREE.CylinderGeometry(0.07, 0.1, 0.6, 8), w, 0, 1.0, 0.42, o); n.rotation.x = 0.25; blob(o, w, 0.15, 0, 1.33, 0.52);
    const bk = M(new THREE.ConeGeometry(0.06, 0.25, 6), or, 0, 1.3, 0.72, o); bk.rotation.x = Math.PI / 2; for (const sx of [-1, 1]) { M(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 5), or, sx * 0.15, 0.17, 0, o); blob(o, 0x111111, 0.03, sx * 0.08, 1.38, 0.62); }
    o.scale.setScalar(s); return o;
  }
  function makeBird(s = 1, col = 0x7a5a3a) { // дрозд
    const o = new THREE.Group(); blob(o, col, 0.22, 0, 0.3, 0, 1, 0.9, 1.3); blob(o, col, 0.14, 0, 0.5, 0.2); blob(o, 0xe8d8b0, 0.15, 0, 0.26, 0.12, 0.9, 0.8, 0.9);
    const bk = M(new THREE.ConeGeometry(0.04, 0.14, 5), T3(0xffc23a), 0, 0.5, 0.36, o); bk.rotation.x = Math.PI / 2; M(new THREE.BoxGeometry(0.16, 0.04, 0.3), T3(col), 0, 0.34, -0.36, o).rotation.x = 0.4;
    for (const sx of [-1, 1]) blob(o, 0x111111, 0.025, sx * 0.07, 0.54, 0.31); o.scale.setScalar(s); return o;
  }
  function makeRooster(s = 1) {
    const o = new THREE.Group(), gold = T3(0xf2a83a, { emissive: 0x3a2000 }), red = T3(0xe0302a);
    blob(o, gold, 0.32, 0, 0.55, 0, 1, 1, 1.15); blob(o, gold, 0.2, 0, 0.92, 0.2); for (let i = 0; i < 3; i++) blob(o, red, 0.07, 0, 1.12 + (i === 1 ? 0.04 : 0), 0.12 + i * 0.08);
    blob(o, red, 0.06, 0, 0.78, 0.36, 1, 1.4, 1); const bk = M(new THREE.ConeGeometry(0.05, 0.15, 5), T3(0xffd23a), 0, 0.9, 0.42, o); bk.rotation.x = Math.PI / 2;
    [[0x2a6a3a, 0.4], [0xc0392b, 0], [0x2a4a8a, -0.4]].forEach(([col, a]) => { const t = M(new THREE.ConeGeometry(0.1, 0.7, 5), T3(col), a * 0.3, 0.9, -0.38, o); t.rotation.x = -0.6; t.rotation.z = a; });
    for (const sx of [-1, 1]) { M(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 5), T3(0xffa02a), sx * 0.12, 0.15, 0, o); blob(o, 0x111111, 0.03, sx * 0.09, 0.97, 0.36); }
    o.scale.setScalar(s); return o;
  }
  function makeSheep(s = 1) {
    const o = new THREE.Group(), w = T3(0xf2eee0), d = T3(0x3a3330);
    for (let i = 0; i < 9; i++) blob(o, w, 0.32, ((i % 3) - 1) * 0.28, 0.75 + (i % 2) * 0.12, (Math.floor(i / 3) - 1) * 0.35);
    blob(o, d, 0.22, 0, 0.9, 0.62, 0.9, 1, 1.2); for (const sx of [-1, 1]) { const h = M(new THREE.TorusGeometry(0.12, 0.05, 6, 12), T3(0xc8b890), sx * 0.2, 1.0, 0.55, o); h.rotation.y = Math.PI / 2; }
    const legs = []; for (const [x, z] of [[-0.25, 0.3], [0.25, 0.3], [-0.25, -0.3], [0.25, -0.3]]) { const p = new THREE.Group(); p.position.set(x, 0.5, z); o.add(p); M(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 6), d, 0, -0.25, 0, p); legs.push(p); }
    o.userData.legs = legs; o.scale.setScalar(s); return o;
  }
  const noHorns = (o) => { o.traverse((m) => { if (/antler|horn/i.test(m.name)) m.visible = false; }); return o; };
  const makeGoat = (s = 1) => { const p = c.pet('pets/deer', s); tint(p.root, 0xf4f0e8); noHorns(p.root); return p; };
  // волк: собака из набора с обесцвеченной (серой) текстурой
  const grayCache = new Map();
  const grayMap = (map) => { if (grayCache.has(map)) return grayCache.get(map); let t = map; try { const im = map.image; const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const x = cv.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, cv.width, cv.height); for (let i = 0; i < d.data.length; i += 4) { const l = d.data[i] * 0.3 + d.data[i + 1] * 0.59 + d.data[i + 2] * 0.11; d.data[i] = l * 0.95; d.data[i + 1] = l * 0.98; d.data[i + 2] = l * 1.06; } x.putImageData(d, 0, 0); t = map.clone(); t.image = cv; t.needsUpdate = true; } catch (e) { t = map; } grayCache.set(map, t); return t; };
  const makeWolf = (s = 1.35) => { const p = c.pet('pets/dog', s); p.root.traverse((m) => { if (m.material) { m.material = m.material.clone(); if (m.material.map) { m.material.map = grayMap(m.material.map); m.material.color?.set(0xb8bcc4); } else m.material.color?.multiply(new THREE.Color(0x8a909c)); } }); return p; };
  // изба из брёвен с двускатной крышей коньком вверх
  function gable(par, x, hw, y0, y1, mat) { const sh = new THREE.Shape(); sh.moveTo(-hw, 0); sh.lineTo(hw, 0); sh.lineTo(0, y1 - y0); sh.closePath(); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), mat); m.material.side = THREE.DoubleSide; m.position.set(x, y0, 0); m.rotation.y = Math.PI / 2; par.add(m); return m; }
  function izba(par, pos, ry = 0, s = 1, logCol = 0xa8743e, roofCol = 0x7a4a2a) {
    const z = new THREE.Group(); z.position.copy(pos); z.rotation.y = ry; z.scale.setScalar(s); par.add(z); const log = T3(logCol), roof = T3(roofCol), win = new THREE.MeshBasicMaterial({ color: 0xffd76a });
    for (let i = 0; i < 6; i++) { const lg = M(new THREE.CylinderGeometry(0.22, 0.22, 4.2, 8), log, 0, 0.22 + i * 0.42, 1.5, z); lg.rotation.z = Math.PI / 2; const lg2 = lg.clone(); lg2.position.z = -1.5; z.add(lg2); const s1 = M(new THREE.CylinderGeometry(0.22, 0.22, 3.4, 8), log, 1.9, 0.22 + i * 0.42, 0, z); s1.rotation.x = Math.PI / 2; const s2 = s1.clone(); s2.position.x = -1.9; z.add(s2); }
    M(new THREE.BoxGeometry(4.6, 0.15, 2.4), roof, 0, 3.15, 0.85, z).rotation.x = 0.6; M(new THREE.BoxGeometry(4.6, 0.15, 2.4), roof, 0, 3.15, -0.85, z).rotation.x = -0.6;
    gable(z, 1.92, 1.75, 2.5, 3.85, log); gable(z, -1.92, 1.75, 2.5, 3.85, log);
    M(new THREE.PlaneGeometry(0.7, 0.6), win, 0.9, 1.4, 1.75, z); M(new THREE.BoxGeometry(0.9, 1.6, 0.1), T3(0x6a4020), -0.8, 0.8, 1.74, z); M(new THREE.BoxGeometry(0.5, 1.1, 0.5), T3(0x9a8a7a), 1.2, 3.5, -0.4, z);
    c.colliders.push({ x: pos.x, z: pos.z, r: 2.3 * s }); c.camBlockers.push(z);
    z.updateMatrixWorld(true); z.userData.door = z.localToWorld(new THREE.Vector3(-0.8, 0, 2.9)); return z;
  }
  const npcAt = (par, kind, pos, ry = 0, opts) => { const ch = c.npc(kind, opts); ch.root.position.copy(pos); ch.root.rotation.y = ry; par.add(ch.root); return ch; };
  const petAt = (par, p, pos, ry = 0) => { p.root.position.copy(pos); p.root.rotation.y = ry; par.add(p.root); return p; };
  const objAt = (par, o, pos, ry = 0) => { o.position.copy(pos); o.rotation.y = ry; par.add(o); return o; };
  const items = () => TS().items;
  const book = (t, txt) => c.addBook(t, txt);
  const lukOk = () => inLuk() && c.st.restored;

  // ================= Вершки и корешки =================
  const FIELD = V(18, 31);
  const field = new THREE.Group(); field.position.copy(FIELD); g.add(field);
  { const soil = T3(0x6a4a2a), dk = T3(0x553a20); M(new THREE.BoxGeometry(9, 0.2, 6), soil, 0, 0.02, 0, field); for (let i = 0; i < 6; i++) M(new THREE.BoxGeometry(8.6, 0.16, 0.35), dk, 0, 0.16, -2.5 + i, field);
    for (const z of [-3.2, 3.2]) for (let x = -4.4; x <= 4.4; x += 1.1) M(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 5), T3(0x8a6a3e), x, 0.4, z, field); }
  const crops = { turnip: new THREE.Group(), wheat: new THREE.Group(), tops: new THREE.Group(), roots: new THREE.Group() }; Object.values(crops).forEach((k) => { field.add(k); k.visible = false; });
  for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) { const x = -3.6 + j * 1.8, z = -2.5 + i;
    const tp = new THREE.Group(); tp.position.set(x, 0.2, z); crops.turnip.add(tp); blob(tp, 0xf0e8f0, 0.22, 0, 0.05, 0, 1, 0.9, 1); blob(tp, 0xb04a8a, 0.12, 0, 0.17, 0); for (let k = 0; k < 3; k++) { const l = M(new THREE.ConeGeometry(0.1, 0.5, 4), T3(0x4caf50), Math.cos(k * 2.1) * 0.08, 0.45, Math.sin(k * 2.1) * 0.08, tp); l.rotation.z = Math.cos(k * 2.1) * 0.4; l.rotation.x = Math.sin(k * 2.1) * 0.4; l.userData.top = true; }
    const wh = new THREE.Group(); wh.position.set(x, 0.2, z); crops.wheat.add(wh); for (let k = 0; k < 3; k++) { const st = M(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 4), T3(0xd8b84a), (k - 1) * 0.12, 0.55, 0, wh); const ear = M(new THREE.BoxGeometry(0.07, 0.3, 0.07), T3(0xf2c84a), (k - 1) * 0.12, 1.2, 0, wh); ear.userData.top = st.userData.top = true; } }
  const muzhik = npcAt(g, 'muzhik', FIELD.clone().add(new THREE.Vector3(-5.6, 0, -1)), 1.4);
  const bear1 = objAt(g, makeBear(1), V(FIELD.x + 6.4, FIELD.z + 1.5), -1.6); c.colliders.push({ x: muzhik.root.position.x, z: muzhik.root.position.z, r: 0.5 }, { x: bear1.position.x, z: bear1.position.z, r: 1.1 });
  const honey = new THREE.Group(); blob(honey, 0xc8803a, 0.32, 0, 0.32, 0, 1, 1.1, 1); blob(honey, T3(0xffc23a, { emissive: 0x553300 }), 0.2, 0, 0.62, 0, 1, 0.4, 1); objAt(g, honey, V(FIELD.x + 5, FIELD.z - 0.5)); honey.visible = false;
  function showCrop(kind, bearTook) { crops.turnip.visible = kind === 'turnip' || kind === 'both'; crops.wheat.visible = kind === 'wheat' || kind === 'both';
    for (const k of [crops.turnip, crops.wheat]) k.traverse((m) => { if (m.userData.top !== undefined) m.visible = !(bearTook === 'tops'); }); }
  const MZ = 'Мужик', BR = 'Медведь';
  async function vegTalk() {
    const t = TS(); t.veg ||= 0;
    if (t.veg >= 3) { await ui.say(MZ, ['Теперь мы с Мишкой соседи: я пашу, он пчёл стережёт. Всё — пополам, и вершки, и корешки!']); return; }
    if (t.veg === 0) {
      await ui.say(MZ, ['Здравствуй, Сказитель! Поехал я в лес, вспахал полянку — а тут медведь: «Мужик, я тебя заломаю!»', 'Договорились мы: я пашу и сею, а урожай делим. Медведь говорит: «Мне — вершки, тебе — корешки».']);
      await ui.say(BR, ['Р-р-р! Так и быть: мне вершки, ему корешки. Медведь своё слово держит!']);
    } else if (t.veg === 1) await ui.say(BR, ['Обманул ты меня, мужик! Ботва горькая, а репа сладкая… Нынче — наоборот: мне корешки, тебе вершки!']);
    if (t.veg < 2) {
      const want = t.veg === 0 ? 'tops' : 'roots';
      const opts = shuffle(['Репу', 'Пшеницу', 'Горох']); const k = await ui.dialog(MZ, `Медведь хочет ${want === 'tops' ? 'вершки' : 'корешки'}. Что посеем, Сказитель, чтобы мужику не остаться голодным?`, [...opts, 'Подумать потом']);
      if (k < 0 || k >= 3) return; const right = want === 'tops' ? 'Репу' : 'Пшеницу';
      if (opts[k] !== right) { S.wrong(); await ui.say(MZ, [opts[k] === 'Горох' ? 'Горох? У него и вершки, и стручки — всё наверху… Медведь всё заберёт!' : want === 'tops' ? 'У пшеницы зерно наверху — медведь его и заберёт. Думай ещё!' : 'У репы самое вкусное — в земле. А медведь-то корешки просит!']); return; }
      const ok = await ui.timing(`Сеем ${right === 'Репу' ? 'репу' : 'пшеницу'} — ровными рядами`, 1 + t.veg * 0.15); if (!ok) { S.wrong(); ui.toast('Семена рассыпались — попробуй ещё раз', false, 2200); return; }
      c.fade(1); await c.wait(700); showCrop(right === 'Репу' ? 'turnip' : 'wheat', want); S.chime(); c.fade(0); c.burst(FIELD.clone().setY(FIELD.y + 1), 0x9ae86a, 50, 4, 1.2, 0.2);
      if (want === 'tops') await ui.say(MZ, ['Выросла репа! Медведю — вершки, ботву зелёную. А мне — корешки, репку сладкую!']);
      else await ui.say(MZ, ['Уродилась пшеница! Мне — колосья с зерном, а медведю — корешки, солому одну.']);
      t.veg++; c.save();
      if (t.veg === 2) await ui.say(BR, ['(медведь сердито рычит) Ну, мужик! Опять обманул! Рассержусь — уйду в лес, и больше ты мою полянку не вспашешь!']);
      return;
    }
    const k = await ui.dialog(me(), 'Медведь обижен, мужик хитрит. Как сыграть третий раз?', ['Обмануть ещё раз — посеять кукурузу', 'Поделить честно: посеять и репу, и пшеницу — каждому лучшее пополам', 'Прогнать медведя с поля']);
    if (k !== 1) { S.wrong(); await ui.say(MZ, [k === 0 ? 'Сколько ни хитри — дружбы не нахитришь. Он и так уже обижен…' : 'Прогнать? Это же его полянка была… Нехорошо.']); return; }
    await ui.say(MZ, ['И то правда. Хитрость два раза сработала — а третий раз пусть будет честным!']);
    for (let i = 0; i < 2; i++) { let ok = false; while (!ok) { ok = await ui.timing(i ? 'Сеем пшеницу — вместе с Мишкой' : 'Сеем репу — вместе с Мишкой', 1.1); if (!ok) S.wrong(); } S.pluck(330 + i * 80, 0, 0.15, 0.6); }
    c.fade(1); await c.wait(700); showCrop('both'); honey.visible = true; c.fade(0); S.fanfare();
    await ui.say(BR, ['Р-р… Репа — пополам, зерно — пополам. Вот это дележ! Не сержусь больше, мужик.', 'А тебе, Сказитель, — бочонок лесного мёду. Медок силы прибавляет.']);
    t.veg = 3; c.save(); items().honey = true; player.maxHp += 1; player.hp = player.maxHp; ui.toast('🍯 Бочонок мёда: +1 ❤ — в Сундуке чудес', true, 4500);
    book('Вершки и корешки', 'Мужик вспахал медвежью полянку. Медведь выбрал вершки — мужик посеял репу; медведь выбрал корешки — мужик посеял пшеницу. А в третий раз Сказитель уговорил поделить урожай честно: и репу, и зерно — пополам. Медведь перестал сердиться и подарил бочонок мёду.');
  }

  // ================= Каша из топора =================
  const SOLD = V(-37, -8);
  const bHut = izba(g, V(SOLD.x - 3.5, SOLD.z - 3), 0.5, 0.9);
  const soldat = npcAt(g, 'soldat', V(SOLD.x + 1.6, SOLD.z + 1.2), -2.4); const babka = npcAt(g, 'babka', V(SOLD.x - 1.6, SOLD.z + 0.6), 2.2);
  const POT = V(SOLD.x, SOLD.z + 2.2); c.kit('survival/campfire-pit', POT.x, POT.z, 3.2, 0, 0, g, H);
  const pot = new THREE.Group(); objAt(g, pot, POT.clone().setY(POT.y + 0.35)); M(new THREE.CylinderGeometry(0.45, 0.35, 0.6, 12), T3(0x2a2a2e), 0, 0.3, 0, pot); const kasha = M(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 12), T3(0xe8c070), 0, 0.5, 0, pot); kasha.visible = false;
  const axeInPot = new THREE.Group(); pot.add(axeInPot); M(new THREE.CylinderGeometry(0.035, 0.035, 0.8, 6), T3(0x8a5a2a), 0.1, 0.75, 0, axeInPot).rotation.z = 0.3; M(new THREE.BoxGeometry(0.06, 0.25, 0.3), T3(0xb8c0c8), 0.0, 0.42, 0, axeInPot); axeInPot.visible = false;
  for (const sx of [-1, 1]) M(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 5), T3(0x5a3a1a), sx * 0.7, 0.3, 0, pot).rotation.z = sx * 0.2;
  const skat = new THREE.Group(); objAt(g, skat, V(SOLD.x - 1.2, SOLD.z + 3.4, 0.05)); M(new THREE.BoxGeometry(1.4, 0.04, 1), T3(0xf4f0e6), 0, 0, 0, skat); for (const z of [-0.45, 0.45]) M(new THREE.BoxGeometry(1.4, 0.05, 0.08), T3(0xc0392b), 0, 0.01, z, skat); skat.visible = false;
  c.colliders.push({ x: POT.x, z: POT.z, r: 0.8 });
  const SO = 'Солдат', BA = 'Бабка';
  const ASKS = [['…только б крупы горсточку', 'крупы', ['…мешок крупы да окорок в придачу', '…ничего больше не надо']], ['…посолить бы щепоткой', 'соли', ['…бочку соли да осетра', '…и так сойдёт, без соли']], ['…маслица бы ложечку', 'масла', ['…кадку масла и пирогов', '…масла не надо — топор жирный']]];
  async function axeTalk() {
    const t = TS(); t.axe ||= 0;
    if (t.axe >= 5) { await ui.say(SO, ['Служба — службой, а каша — по расписанию! Бабка теперь сама зазывает прохожих: «Сварю кашу хоть из топора!»']); return; }
    if (t.axe === 0) {
      await ui.say(SO, ['Здравия желаю, Сказитель! Иду со службы домой, проголодался. Попросился к бабке: «Дай, хозяюшка, перекусить».']);
      await ui.say(BA, ['(бабка прячет глаза) Ох, служивый, и рада бы — да в доме хоть шаром покати. Сама третий день не ела!']);
      await ui.say(SO, ['(шёпотом) В погребе у неё и крупа, и масло… Хитрит бабка. Ну, а мы похитрее! Сварим кашу… из топора!']);
      t.axe = 1; c.save(); ui.toast('🪓 Каша из топора: помоги солдату у котелка', true, 3500); return;
    }
    if (t.axe === 1) {
      const k = await ui.dialog(SO, 'Топорик-то у меня есть. Ну что, Сказитель, — в котёл его?', ['Кладём топор в котёл!', 'Погодите…']); if (k !== 0) return;
      axeInPot.visible = true; S.splash(); await ui.say(BA, ['Каша из топора?! Сроду не видала. Ну-ка, ну-ка… (бабка садится поближе)']); t.axe = 2; c.save();
    }
    while (t.axe >= 2 && t.axe < 5) {
      const i = t.axe - 2; const [right, what, wrong] = ASKS[i]; const opts = shuffle([right, ...wrong]);
      const k = await ui.dialog(SO, `(пробует ложкой) Хороша каша, ${['да жидковата', 'да пресновата', 'да суховата'][i]}… Что сказать бабке похитрее?`, [...opts, 'Отойти']);
      if (k < 0 || k >= 3) return;
      if (opts[k] !== right) { S.wrong(); await ui.say(BA, [opts[k].includes('…ничего') || opts[k].includes('сойдёт') || opts[k].includes('не надо') ? 'Ну и ешьте сами вашу топорную кашу!' : 'Ишь чего захотел! Нету у меня такого, нету!']); continue; }
      await ui.say(BA, [`Ну, ${what} горсточку найду… (бабка бежит в погреб)`]); S.click();
      let ok = false; while (!ok) { ok = await ui.timing(`Помешиваем кашу (${i + 1}/3)`, 1 + i * 0.2); if (!ok) { S.wrong(); const q = await ui.dialog(SO, 'Пригорает! Ещё помешаем?', ['Мешаем!', 'Потом']); if (q !== 0) return; } }
      S.pluck(300 + i * 60, 0, 0.12, 0.6); c.burst(POT.clone().setY(POT.y + 1.2), 0xffffff, 16, 1.5, 1.2, 0.2); t.axe++; c.save();
    }
    kasha.visible = true; axeInPot.visible = false; S.fanfare();
    await ui.say(BA, ['Ай да каша! Из топора — а вкусная, наваристая!', 'А топор-то когда есть будем?']);
    await ui.say(SO, ['Топор-то, бабушка, не доварился. В дороге доварю да на привале доем! (подмигивает Сказителю)']);
    await ui.say(BA, ['(смеётся) Ох и хитрец! А ведь и я хитрила… Стыдно мне. Возьми, Сказитель, скатерть-самобранку — у меня в сундуке лежала без дела. Расстелешь — и сыт, и весел.']);
    skat.visible = true; items().skat = true; c.save();
    ui.toast('🧺 Скатерть-самобранка — в Сундуке чудес. T → «Скатерть-самобранка»: подкрепиться', true, 5000);
    book('Каша из топора', 'Шёл солдат со службы и попросился к жадной бабке поесть. «Нечего!» — говорит бабка. Тогда солдат со Сказителем сварили кашу… из топора: то крупы горсточку, то соли щепотку, то маслица ложечку. Бабка смеялась, а потом устыдилась своей жадности и подарила Сказителю скатерть-самобранку.');
  }

  // ================= Петушок — золотой гребешок =================
  const RHUT = V(32, -4), DEN = V(41, -14);
  const rHut = izba(g, RHUT, -0.9, 0.85, 0xb88a4e, 0x6a4a2a); const RDOOR = rHut.userData.door.clone(); RDOOR.y = H(RDOOR.x, RDOOR.z);
  const cat2 = petAt(g, c.pet('pets/cat', 1.0), V(RDOOR.x + 1.2, RDOOR.z + 0.6), 0.5); tint(cat2.root, 0xffc080);
  const thrush = objAt(g, makeBird(1.2), V(RDOOR.x - 1.4, RDOOR.z + 0.4), 0.3);
  const rooster = objAt(g, makeRooster(0.9), V(RDOOR.x, RDOOR.z + 1.2), 0.4);
  const den = new THREE.Group(); objAt(g, den, DEN); { const mound = blob(den, 0x6a5a3a, 1.6, 0, 0, 0, 1.2, 0.6, 1); mound.position.y = -0.2; const hole = M(new THREE.CircleGeometry(0.55, 14), new THREE.MeshBasicMaterial({ color: 0x120c06 }), 0, 0.4, 1.55, den); hole.rotation.x = -0.25; } den.lookAt(RHUT.x, DEN.y, RHUT.z);
  c.colliders.push({ x: DEN.x, z: DEN.z, r: 1.5 });
  const fox = petAt(g, c.pet('pets/fox', 1.0), V(DEN.x, DEN.z + 2)); fox.root.visible = false;
  let chase = null; // {round, fast}
  const CT = 'Кот', RO = 'Петушок', FX = 'Лиса';
  const rHome = () => { rooster.position.copy(RDOOR).add(new THREE.Vector3(0, 0, 1.2)); rooster.position.y = H(rooster.position.x, rooster.position.z); rooster.visible = true; };
  async function cockTalk() {
    const t = TS(); t.cock ||= 0; t.cr ||= 0;
    if (t.cock >= 2) { await ui.say(CT, ['Мур-р! Живём втроём, дрова рубим по очереди. А Петушок теперь в окошко не выглядывает — сначала спрашивает Дрозда.']); return; }
    await ui.say(CT, ['Здравствуй, Сказитель! Живём мы втроём: я, Дрозд да Петушок — золотой гребешок.', 'Нам с Дроздом пора в лес — дрова рубить. А тут лиса повадилась: всё зовёт Петушка в окошко.', 'Покарауль его, а? Коли лиса утащит — догоняй! А если в нору унесёт — сыграй у норы на гуслях: лиса любит музыку.']);
    t.cock = 1; c.save(); cat2.root.visible = false; thrush.visible = false; S.chime(); ui.toast('🐓 Петушок: покарауль избушку (F у двери)', true, 3500);
  }
  async function guard() {
    const t = TS(); fox.root.visible = true; fox.root.position.copy(RDOOR).add(new THREE.Vector3(-4, 0, 3)); fox.root.position.y = H(fox.root.position.x, fox.root.position.z); look(fox.root, rooster.position);
    await ui.say(FX, ['(лиса под окошком поёт сладким голосом) Петушок, петушок, золотой гребешок, масляна головушка, шёлкова бородушка! Выгляни в окошко — дам тебе горошку!']);
    const k = await ui.dialog(me(), 'Петушок вертит головой — так и тянется к окошку…', ['«Петя, не выглядывай! Это лиса!»', 'Промолчать']);
    await ui.say(RO, [k === 0 ? (t.cr === 0 ? 'Ку-ка… Я только одним глазком! Горошку хочется…' : t.cr === 1 ? 'Я помню, помню… Но горошек такой круглый!' : 'Ну совсем-совсем чуточку!') : 'Горошку? Мне? Ку-ка-ре-ку!']);
    S.laugh(); c.burst(rooster.position.clone().setY(rooster.position.y + 0.8), 0xffc23a, 20, 3, 0.8, 0.15);
    await ui.say(RO, ['Несёт меня лиса за тёмные леса, за быстрые реки, за высокие горы! Сказитель, выручи меня!']);
    fox.root.position.copy(rooster.position); chase = { fast: t.cr >= 2 }; ui.toast(chase.fast ? '🦊 Лиса мчится к норе! Беги следом — у норы сыграешь на гуслях' : '🦊 Догони лису! (Shift — бегом)', true, 3200);
  }
  async function gusli() {
    const t = TS();
    await ui.say(me(), ['(Сказитель садится у норы и берёт гусли, как Кот в сказке) Трень-брень, гусельки, золотые струночки… Ещё ли дома Лисафья-кума? Выйди, лиса, послушай!']);
    const r = await ui.rhythm('Гусли у лисьей норы', { notes: 12, speed: 0.95, onNote: (ln, ok) => { if (ok) S.pluck(392 * [1, 1.25, 1.5][ln], 0, 0.14, 0.8); else S.click(); } });
    if (r < 0.6) { S.wrong(); await ui.say(FX, [`(из норы) Фальшиво играешь (${Math.round(r * 100)}%)! Не выйду!`]); return; }
    fox.root.visible = true; fox.root.position.copy(DEN).add(new THREE.Vector3(0, 0, 2)); S.laugh();
    await ui.say(FX, ['(лиса высовывает нос) Кто это так славно играет?..', '(Сказитель подхватывает Петушка, а лиса — шмыг в кусты, только хвост мелькнул!)']);
    fox.root.visible = false; t.den = false; t.cr++; rHome(); c.save(); S.chime();
    if (t.cr >= 3) await cockFinale(); else ui.toast(`🐓 Петушок спасён (${t.cr}/3). Лиса ещё вернётся…`, false, 3000);
  }
  async function cockFinale() {
    const t = TS(); cat2.root.visible = true; thrush.visible = true; t.cock = 2; items().gusli = true; c.save(); S.fanfare();
    await ui.say(CT, ['Вернулись мы из лесу — а Петушок цел-невредим! Трижды лиса его уносила — и трижды ты выручал.', 'Возьми мои гусли-самогуды: сами подсказывают пальцам, куда бить. Любая пляска и песня с ними — легче!']);
    ui.toast('🪕 Гусли-самогуды — в Сундуке чудес: ритм-игры медленнее и проще', true, 5000);
    book('Петушок — золотой гребешок', 'Кот и Дрозд ушли в лес рубить дрова и попросили Сказителя покараулить Петушка. Трижды лиса пела под окошком, трижды Петушок выглядывал — и трижды Сказитель его выручал: догонял лису, а у норы играл на гуслях, пока лиса не высунулась. Кот подарил Сказителю гусли-самогуды.');
  }
  function updChase(dt) {
    if (!chase) return; const t = TS(); const fp = fox.root.position, sp = chase.fast ? 11 : 5.4;
    const to = new THREE.Vector3(DEN.x - fp.x, 0, DEN.z - fp.z); const d = to.length();
    if (d < 1.6) { chase = null; fox.root.visible = false; rooster.visible = false; t.den = true; c.save(); S.dark(); ui.toast('🦊 Лиса унесла Петушка в нору! Сыграй у норы на гуслях (F)', true, 3500); return; }
    to.normalize(); fp.addScaledVector(to, sp * dt); fp.y = H(fp.x, fp.z); fox.root.rotation.y = Math.atan2(to.x, to.z); fox.play('run'); if (!fox.actions?.run) fox.play('walk');
    rooster.position.copy(fp).add(new THREE.Vector3(0, 0.7, 0)); rooster.rotation.z = Math.sin(c.T() * 20) * 0.3;
    if (!chase.fast && near(player.pos, fp, 1.9)) { chase = null; fox.root.visible = false; t.cr++; rHome(); rooster.rotation.z = 0; c.save(); S.chime(); c.burst(fp.clone().setY(fp.y + 1), 0xffc23a, 30, 3, 1, 0.2);
      ui.toast(`🐓 Догнал! Лиса бросила Петушка и удрала (${t.cr}/3)`, true, 3000); if (t.cr >= 3) setTimeout(() => cockFinale(), 600); }
  }

  // ================= Иван-царевич и Серый волк (Лукоморье) =================
  const TSV = c.STONE3.clone().add(new THREE.Vector3(3, 0, 2)); TSV.y = H(TSV.x, TSV.z);
  const tsarevich = npcAt(g, 'tsarevich', TSV, -2.4); c.colliders.push({ x: TSV.x, z: TSV.z, r: 0.5 });
  const wolfLuk = petAt(g, makeWolf(1.35), TSV.clone().add(new THREE.Vector3(1.6, 0, -1)), -2); wolfLuk.root.visible = false;
  const TV = 'Иван-царевич', SW = 'Серый волк';
  const allFeathers = () => (c.st.feathers || []).length && c.st.feathers.every(Boolean);
  async function tsarevichTalk() {
    const t = TS(); t.wolf ||= 0;
    if (t.wolf >= 4) { await ui.say(TV, ['Батюшка-царь радуется перу Жар-птицы: в палатах светло и без свечей. А Серый волк теперь и тебе служит — позови его (T).']); return; }
    if (t.wolf === 0) {
      await ui.say(TV, ['Здравствуй, Сказитель! Я Иван-царевич. Батюшка мой захворал: снится ему Жар-птица, что клевала золотые яблоки в нашем саду.', 'Поехал я её искать, да у этого камня беда: «Направо поедешь — коня потеряешь». Налетел Серый волк — и коня моего съел!', 'Говорят, волк убежал в Дремучий лес. Сыщи его… только не обижай: не со зла он, верно.']);
      t.wolf = 1; c.save(); S.chime(); ui.toast('🐺 Иван-царевич: найди Серого волка в Дремучем лесу', true, 4000); return;
    }
    if (t.wolf === 1) { await ui.say(TV, ['Серый волк в Дремучем лесу, в логове у северной опушки. Ступай через портал!']); return; }
    if (t.wolf === 2) { await ui.say(TV, ['Волк повинился? Чудно! Жар-птица ночью садится на дуб у Лукоморья. Дождись ночи у костра…']); return; }
    wolfLuk.root.visible = true; c.burst(wolfLuk.root.position.clone().setY(wolfLuk.root.position.y + 1), 0xbfc8d8, 40, 4, 1, 0.2);
    await ui.say(TV, ['Перо Жар-птицы! Сама отдала — без клетки, без погони… Вот это чудо так чудо.']);
    await ui.say(SW, ['Служил я царевичу — послужу и тебе, Сказитель. Садись на меня верхом: я бегаю быстрее ветра — хоть в лесу, хоть в горах, хоть за Калиновым мостом.']);
    t.wolf = 4; items().wolf = true; c.save(); S.fanfare(); ui.toast('🐺 Серый волк — твой скакун в любом крае: T → «Позвать Серого волка»', true, 5500);
    book('Иван-царевич и Серый волк', 'Серый волк съел коня Ивана-царевича у камня на распутье. Сказитель отыскал волка в Дремучем лесу и простил его, а волк поклялся служить. Ночью у дуба Сказитель не стал хватать Жар-птицу вместе с золотой клеткой — и птица сама отдала перо для больного царя. А Серый волк стал верным скакуном.');
  }
  async function firebirdAsk() {
    const t = TS();
    await ui.say('Жар-птица', ['Курлы… Ты пришёл от Ивана-царевича? Я слышала: царь хворает и видит меня во сне.']);
    const k = await ui.dialog(me(), 'Рядом на ветке висит золотая клетка — словно сама в руки просится…', ['Посадить Жар-птицу в золотую клетку и отнести царю', 'Не трогать клетку. Попросить одно перо — для больного царя']);
    if (k !== 1) { S.wrong(); S.bell(880, 0, 0.12); S.bell(1320, 0.15, 0.1); c.shake(0.2); await ui.say('Жар-птица', ['(Дзинь-дзинь! Клетка зазвенела на всё Лукоморье.) Ах! В клетке и солнце погаснет. Не надо так, Сказитель…', '(Серый волк предупреждал: бери без клетки!) Подумай ещё.']); return; }
    S.magic(); c.burst(player.pos.clone().setY(player.pos.y + 1.5), 0xffa030, 60, 5, 1.4, 0.25);
    await ui.say('Жар-птица', ['Добрый ты. Возьми моё перо — пусть светит у царского изголовья. А я — вольная птица, мне в клетке не жить.']);
    t.wolf = 3; c.save(); ui.toast('🪶 Перо Жар-птицы для царя — отнеси Ивану-царевичу к камню', true, 4000);
  }
  // Серый волк-скакун: в любом крае
  const rideWolf = makeWolf(1.05); c.scene.add(rideWolf.root); rideWolf.root.visible = false;
  function wolfMount() { if (c.region()?.swim) { ui.toast('Под водой волку не бегать…'); return; } c.XT && c.XT()?.dismount?.(true); player.ride = 'wolf'; S.stomp(); c.burst(player.pos.clone().setY(player.pos.y + 1), 0xbfc8d8, 30, 3, 0.8, 0.2); ui.toast('🐺 Ты на Сером волке! Скорость ×1.75, F (вдали от всех) — спешиться', false, 3500); }
  function dismount() { if (player.ride !== 'wolf') return; player.ride = false; rideWolf.root.visible = false; }

  // ================= края: сказки появляются, когда край уже расколдован =================
  const SITES = {};
  const regDone = (id) => !!c.st[id]?.done;
  function onRegion(id, R) {
    if (SITES[id] || !BUILD[id]) return;
    const grp = new THREE.Group(); grp.name = 'tales-' + id; R.group.add(grp);
    const L = (x, z, dy = 0) => new THREE.Vector3(R.center.x + x, R.H(R.center.x + x, R.center.y + z) + dy, R.center.y + z);
    const here = () => c.region() === R && regDone(id);
    try { SITES[id] = Object.assign({ grp, R }, BUILD[id](grp, L, here, R)); } catch (e) { console.error('tales', id, e); }
  }
  // убрать деревья и камни-коллайдеры с площадки сказки (персонажи, порталы и костры остаются)
  function clearSpot(R, p, r) {
    for (let i = c.colliders.length - 1; i >= 0; i--) { const q = c.colliders[i]; if (Math.hypot(q.x - p.x, q.z - p.z) < r && !q.keep) c.colliders.splice(i, 1); }
    const treeish = (o) => { let hit = c.camBlockers.includes(o); if (!hit) o.traverse((q) => { if (!hit && /tree|pine|trunk|rock|bush|birch|stump|fir|crooked/i.test(q.name || '')) hit = true; }); return hit; };
    const kill = []; R.group.children.forEach((o) => { if (/^tales-/.test(o.name) || o.userData.char || o.userData.update || o.isLight || o.isInstancedMesh) return; const w = o.position; if (Math.hypot(w.x - p.x, w.z - p.z) < r && treeish(o)) kill.push(o); });
    kill.forEach((o) => (o.visible = false));
  }
  const BUILD = {};

  // ----- Дремучий лес: «Маша и медведь», «Волк и семеро козлят», логово Серого волка -----
  BUILD.forest = (grp, L, here, R) => {
    const HUT = L(-30, 6), VIL = L(-16, 38), GOAT = L(30, 2), LAIR = L(10, -34);
    [[HUT, 7], [VIL, 7], [GOAT, 7], [LAIR, 4]].forEach(([p, r]) => clearSpot(R, p, r));
    const bHut = izba(grp, HUT, 0.4, 1, 0x8a5a2e, 0x5a3a1e); const HD = bHut.userData.door.clone(); HD.y = R.H(HD.x, HD.z);
    const masha = npcAt(grp, 'masha', HD.clone().add(new THREE.Vector3(1, 0, 0.8)), 0.4);
    const bear = objAt(grp, makeBear(1), HD.clone().add(new THREE.Vector3(-2.2, 0, 1.2)), 0.6);
    const korob = new THREE.Group(); bear.add(korob); korob.position.set(0, 1.9, -0.6); M(new THREE.BoxGeometry(1, 0.9, 0.8), T3(0xc8a060), 0, 0, 0, korob); for (let i = 0; i < 4; i++) M(new THREE.BoxGeometry(1.02, 0.06, 0.82), T3(0x9a7a40), 0, -0.35 + i * 0.25, 0, korob); korob.visible = false;
    const vHut = izba(grp, VIL, -2.6, 0.9); const VD = vHut.userData.door.clone(); VD.y = R.H(VD.x, VD.z);
    const ded = npcAt(grp, 'ded', VD.clone().add(new THREE.Vector3(1.4, 0, 1.2)), -2.6), bab = npcAt(grp, 'babka', VD.clone().add(new THREE.Vector3(-1.2, 0, 1.4)), -2.6);
    const dog = petAt(grp, c.pet('pets/dog', 0.9), VD.clone().add(new THREE.Vector3(0.2, 0, 3)), -2.6);
    const STUMPS = [0.28, 0.52, 0.76].map((k, i) => { const p = HUT.clone().lerp(VIL, k); p.x += (i % 2 ? 2.5 : -2.5); p.y = R.H(p.x, p.z); const s = objAt(grp, new THREE.Group(), p); M(new THREE.CylinderGeometry(0.5, 0.6, 0.6, 10), T3(0x8a6a3e), 0, 0.3, 0, s); M(new THREE.CylinderGeometry(0.5, 0.5, 0.02, 10), T3(0xd8b880), 0, 0.61, 0, s); return p; });
    const PATH = [HD.clone().add(new THREE.Vector3(-1, 0, 2.5)), ...STUMPS, VD.clone().add(new THREE.Vector3(0, 0, 5))];
    let walk = null; // {i, wait}
    const MA = 'Маша', BE = 'Медведь', DE = 'Дедушка';
    async function mashaTalk() {
      const t = TS(); t.masha ||= 0;
      if (t.masha >= 2) { await ui.say(MA, ['Дедушка с бабушкой меня теперь одну в лес не пускают. А Мишке я пирожки сама отношу — с Жучкой!']); return; }
      if (walk) return;
      await ui.say(MA, ['Ой, здравствуй! Я Маша. Пошла с подружками по грибы, отстала да заблудилась… А тут избушка — и в ней медведь!', 'Говорит: «Будешь у меня жить: печку топить, кашу варить». А я домой хочу, к дедушке с бабушкой!']);
      await ui.say(MA, ['Я придумала: напеку пирожков и попрошу Мишку отнести их в деревню. А сама — в короб спрячусь, под пирожки!', 'Ты иди рядом. Как медведь захочет на пенёк сесть да пирожок съесть, — крикни моим голоском: «Вижу-вижу!»']);
      const k = await ui.dialog(MA, 'Ну что, сажаешь меня в короб?', ['Полезай в короб, Маша!', 'Потом']); if (k !== 0) return;
      masha.root.visible = false; korob.visible = true; c.fade(1); await c.wait(500); c.fade(0);
      await ui.say(BE, ['Отнесу пирожки старикам — и сразу назад. Смотри, Машенька, не балуй!']);
      t.masha = 1; c.save(); walk = { i: 1, busy: false }; ui.toast('🐻 Иди за медведем! У пеньков жми в такт «Вижу-вижу!»', true, 3500);
    }
    async function atStump(i) {
      walk.busy = true; c.lockPlayer(true); look(bear, player.pos);
      await ui.say(BE, ['(медведь устал) Сяду на пенёк, съем пирожок…']);
      let ok = false; while (!ok) { ok = await ui.timing(`«Вижу-вижу! Не садись на пенёк, не ешь пирожок!» (${i}/3)`, 1 + i * 0.15); if (!ok) { S.wrong(); await ui.say(BE, ['(медведь опускается на пенёк и тянется к коробу…) Хм, а что это короб такой тяжёлый?']); } }
      S.chime(); await ui.say(BE, [['Ишь ты, какая глазастая! Высоко сидит, далеко глядит…', 'Всё видит! Ну и Маша!', 'И отсюда видит! Пойду уж скорей…'][i - 1]]);
      c.lockPlayer(false); walk.busy = false; walk.i++;
    }
    async function arrive() {
      walk.busy = true; c.lockPlayer(true); const t = TS();
      S.stomp(); await ui.say('Жучка', ['Гав-гав-гав! Р-р-р! (собаки выскочили со двора!)']);
      bear.position.copy(PATH[PATH.length - 1]); await ui.say(BE, ['Ой-ой! Собаки! (медведь бросил короб — и бежать в лес без оглядки!)']);
      masha.root.visible = true; masha.root.position.copy(VD).add(new THREE.Vector3(0, 0, 2)); korob.visible = false;
      c.fade(1); await c.wait(500); bear.position.copy(HD).add(new THREE.Vector3(-2.2, 0, 1.2)); bear.position.y = R.H(bear.position.x, bear.position.z); c.fade(0);
      await ui.say(DE, ['Глядь — короб у ворот! Открыли, а там — Машенька, жива-здорова!', 'Спасибо, Сказитель. Заходи в гости — бабка пирожков напечёт.']);
      walk = null; t.masha = 2; c.save(); S.fanfare(); c.lockPlayer(false);
      book('Маша и медведь', 'Маша заблудилась в лесу и попала в избушку к медведю. Она напекла пирожков, спряталась в короб, и медведь сам понёс её в деревню. Только присядет на пенёк — Маша кричит: «Вижу-вижу! Не садись на пенёк, не ешь пирожок!» У деревни залаяли собаки, медведь убежал, а Маша вернулась к дедушке и бабушке.');
    }
    // --- Волк и семеро козлят ---
    const gHut = izba(grp, GOAT, -1.2, 0.9, 0xc09a5a, 0x7a5a2a); const GD = gHut.userData.door.clone(); GD.y = R.H(GD.x, GD.z);
    const mom = petAt(grp, makeGoat(1.2), GD.clone().add(new THREE.Vector3(1.6, 0, 1.6)), -1.2);
    const kids = []; for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; kids.push(petAt(grp, makeGoat(0.55), GD.clone().add(new THREE.Vector3(Math.cos(a) * 2.2 - 1, 0, Math.sin(a) * 1.8 + 2.4)), a)); }
    kids.forEach((k) => (k.root.position.y = R.H(k.root.position.x, k.root.position.z)));
    const gwolf = petAt(grp, makeWolf(1.35), GD.clone().add(new THREE.Vector3(-4, 0, 4)), 2); gwolf.root.visible = false;
    const GO = 'Коза', WO = 'Волк';
    const SONG = '«Козлятушки, ребятушки, отопритеся, отворитеся! Ваша мать пришла — молочка принесла!»';
    async function goatTalk() {
      const t = TS(); t.goats ||= 0;
      if (t.goats >= 2) { await ui.say(GO, ['Все семеро дома, все целы! Спасибо, что не отпер серому. Ме-е!']); return; }
      if (t.goats === 1) { await ui.say(GO, ['Я в лесу травку щиплю… Стереги дверь!']); return; }
      await ui.say(GO, ['Ме-е! Здравствуй, Сказитель. Ухожу я в лес — травку щипать, молочко копить. Козлятки мои одни остаются.', `Отпирать — только мне. А я пою тоненько: ${SONG}`, 'Покарауль у двери, а? Волк тут ходит, хитрый да голодный.']);
      t.goats = 1; t.knock = 0; c.save(); mom.root.visible = false; kids.forEach((k) => (k.root.visible = false)); ui.toast('🐐 Стереги дверь козьей избушки (F)', true, 3000);
    }
    async function wolfIn() { S.dark(); c.shake(0.3); await ui.say(WO, ['Ага-а! (волк вломился в избушку — козлята кто под стол, кто под лавку, а самый маленький — в печку!)']);
      c.fade(1); await c.wait(700); c.fade(0); gwolf.root.visible = false; await ui.say(me(), ['(Сказитель стукнул книгой по полу — и сказка отмоталась назад, к первому стуку.) Сказка — дело поправимое. Попробуем ещё раз, внимательнее!']); TS().knock = 0; c.save(); }
    async function knock() {
      const t = TS(); const r = t.knock || 0; S.thump && S.thump(80, 0.1, 0.15, 0.3);
      if (r < 2) { gwolf.root.visible = true; gwolf.root.position.copy(GD).add(new THREE.Vector3(0.5, 0, 1.6)); look(gwolf.root, GD); }
      if (r === 0) {
        await ui.say('Тук-тук!', ['(за дверью — грубый, толстый голос) Козлятушки, ребятушки, отопритеся, отворитеся! Ваша мать пришла — молочка принесла!']);
        const k = await ui.dialog(me(), 'Голос вроде слова те же… а голос толстый.', ['Отпереть', '«Слышим, слышим! Не матушкин голосок: матушка поёт тоненько!»']);
        if (k !== 1) return wolfIn(); await ui.say(WO, ['(волку делать нечего — пошёл он к кузнецу, велел себе горло перековать, чтоб петь тоненько)']);
      } else if (r === 1) {
        await ui.say('Тук-тук!', [`(за дверью — тоненький голосок) ${SONG}`]);
        const k = await ui.dialog(me(), 'Голосок тоненький, песня верная… Но ведь волк хитёр.', ['Отпереть', '«Покажи лапку в окошко!»']);
        if (k !== 1) return wolfIn();
        await ui.say(me(), ['(в окошко просунулась лапа — серая, когтистая!)']); const k2 = await ui.dialog(me(), 'Лапа серая…', ['Всё равно отпереть', '«Лапа серая — не матушкина! Уходи, волк!»']);
        if (k2 !== 1) return wolfIn(); await ui.say(WO, ['Р-р! Раскусили… (волк уходит, поджав хвост)']);
      } else {
        await ui.say('Тук-тук!', [`(тоненький голос) ${SONG}`]); const k = await ui.dialog(me(), 'Опять стучат…', ['«Покажи лапку!»', 'Не отпирать никому, даже маме']);
        if (k === 1) { await ui.say(GO, ['Ме-е! Да это же я, ваша мать! Покажу лапку — проверьте!']); }
        await ui.say(me(), ['(в окошке — белое копытце, а за ним — знакомые рожки!)']);
        const k2 = await ui.dialog(me(), 'Копытце белое, рожки родные…', ['Отпереть матушке!', 'Подождать ещё']); if (k2 !== 0) return;
        mom.root.visible = true; kids.forEach((kk) => (kk.root.visible = true)); gwolf.root.visible = false; t.goats = 2; c.save(); S.fanfare();
        await ui.say(GO, ['Ме-е-е! Все семеро целы! Не отперли серому — ни грубому голосу, ни серой лапе.', 'Вот и молочко — пейте, козлятушки. А волк пусть знает: в нашу дверь хитростью не войти!']);
        book('Волк и семеро козлят', 'Коза ушла в лес и наказала козлятам отпирать только на её тоненькую песенку. Волк пришёл с грубым голосом — Сказитель не отпер. Перековал волк горло и запел тоненько — но в окошке показалась серая лапа. И лишь когда пришла настоящая мать с белым копытцем, дверь открылась. (Народная сказка; в Книге — со счастливым концом.)');
        return;
      }
      gwolf.root.visible = false; t.knock = r + 1; c.save(); S.chime(); ui.toast(`🐐 Не отперли! (${r + 1}/3) Стучат снова…`, false, 2500);
    }
    // --- логово Серого волка ---
    const lwolf = petAt(grp, makeWolf(1.35), LAIR, 0); const lair = objAt(grp, new THREE.Group(), LAIR.clone().add(new THREE.Vector3(0, 0, -2))); for (let i = 0; i < 5; i++) M(new THREE.DodecahedronGeometry(0.9 + (i % 2) * 0.4, 0), T3(0x6a6a70), Math.cos(i * 1.2) * 1.6, 0.4, Math.sin(i * 1.2) * 1.2 - 0.5, lair);
    async function lairTalk() {
      const t = TS();
      if (t.wolf >= 2) { await ui.say(SW, ['Ступай, Сказитель. Ночью Жар-птица на дубе в Лукоморье. Бери без клетки!']); return; }
      await ui.say(SW, ['(волк лежит, положив морду на лапы) Знаю, зачем пришёл… Съел я коня Ивана-царевича. Забудки весь лес выели — три дня не ел. Стыдно мне.']);
      const k = await ui.dialog(me(), 'Что скажешь Серому волку?', ['Прогнать: «Злодей! Уходи из сказки!»', 'Простить: «Беда не оправдание — но ты повинился. Послужи царевичу вместо коня»']);
      if (k !== 1) { S.wrong(); await ui.say(SW, ['(волк вздыхает) Прогонишь — а кто царевичу поможет?.. Подумай, Сказитель.']); return; }
      await ui.say(SW, ['Прощаешь? Тогда слушай. Жар-птица ночью прилетает на дуб в Лукоморье. Рядом висит золотая клетка — не трогай её! Бери без клетки, по-доброму.', 'А я побегу к царевичу — повинюсь и ему.']);
      t.wolf = 2; c.save(); S.chime(); lwolf.root.visible = false; ui.toast('🐺 Ночью у дуба в Лукоморье попроси Жар-птицу (без клетки!)', true, 4500);
    }
    c.interactables.push(
      { label: 'Поговорить с Машей', pos: () => masha.root.position, r: 3, cond: () => here() && masha.root.visible && !walk, act: mashaTalk },
      { label: 'Поговорить с Козой', pos: () => mom.root.position, r: 3.2, cond: () => here() && mom.root.visible, act: goatTalk },
      { label: 'Стеречь дверь — стучат!', pos: () => GD, r: 3.2, prio: 1, cond: () => here() && TS().goats === 1, act: knock },
      { label: 'Поговорить с Серым волком', pos: () => lwolf.root.position, r: 3.5, prio: 1, cond: () => here() && lwolf.root.visible && TS().wolf === 1, act: lairTalk },
      { label: 'Поговорить с дедушкой', pos: () => ded.root.position, r: 3, cond: () => here(), act: async () => ui.say(DE, TS().masha >= 2 ? ['Машенька дома — и нам радость!'] : ['Внучка наша Машенька в лесу заблудилась… Ищем, ищем — найти не можем.']) },
    );
    return {
      update(dt) { const t = TS(); const T = c.T();
        lwolf.root.visible = t.wolf === 1; korob.visible = !!walk;
        if (walk && !walk.busy) { const tgt = PATH[walk.i]; const to = new THREE.Vector3(tgt.x - bear.position.x, 0, tgt.z - bear.position.z); const d = to.length();
          const far = !near(player.pos, bear.position, 16);
          if (d < 0.6) { if (walk.i >= PATH.length - 1) { if (near(player.pos, bear.position, 14)) arrive(); } else if (!far) atStump(walk.i); }
          else if (!far) { to.normalize(); bear.position.addScaledVector(to, 2.6 * dt); bear.position.y = R.H(bear.position.x, bear.position.z); bear.rotation.y = Math.atan2(to.x, to.z); legsAnim(bear, T * 7, 0.45); } }
        if (!walk && !near(player.pos, bear.position, 3)) legsAnim(bear, 0, 0);
        if (t.masha === 1 && !walk) { walk = { i: 1, busy: false }; masha.root.visible = false; }
        if (t.goats === 1 && mom.root.visible) { mom.root.visible = false; kids.forEach((k) => (k.root.visible = false)); }
        dog.play(near(player.pos, dog.root.position, 6) ? 'gesture-positive' : 'idle');
        for (const ch of [masha, ded, bab]) if (ch.root.visible && near(player.pos, ch.root.position, 6)) look(ch.root, player.pos);
      },
      objective() { const t = TS();
        if (t.wolf === 1) return [LAIR, 'Серый волк — в логове у северной опушки'];
        if ((t.masha || 0) < 2) return walk ? [bear.position, 'иди за медведем, кричи «Вижу-вижу!» у пеньков'] : [HD, 'к избушке медведя — там Маша'];
        if ((t.goats || 0) < 2) return t.goats === 1 ? [GD, 'стереги дверь козьей избушки'] : [GD, 'к козьей избушке — Коза уходит в лес'];
        return null; },
      tracker() { const t = TS(); const ck = (b) => (b ? '☑' : '☐'); return `<br><b style="font-size:13px">Сказки леса</b><br>${ck(t.masha >= 2)} 🐻 Маша и медведь<br>${ck(t.goats >= 2)} 🐐 Волк и семеро козлят${t.goats === 1 ? ` — стук ${(t.knock || 0) + 1}/3` : ''}` + (t.wolf >= 1 ? `<br>${ck(t.wolf >= 2)} 🐺 Серый волк в логове` : ''); },
      dbg: () => ({ walk, bear: bear.position, path: PATH }),
      tp: () => [['Избушка медведя', () => HD.clone().add(new THREE.Vector3(2, 0, 3))], ['Козья избушка', () => GD.clone().add(new THREE.Vector3(0, 0, 3.5))]],
    };
  };

  // ----- Ледяные горы: «Лиса и волк», «Зимовье зверей» -----
  BUILD.mount = (grp, L, here, R) => {
    const HOLE = L(16, 4), ZIM = L(-24, -16); [[ZIM, 8]].forEach(([p, r]) => clearSpot(R, p, r));
    const hole = M(new THREE.CircleGeometry(0.8, 18), new THREE.MeshBasicMaterial({ color: 0x0a2a4a }), HOLE.x, HOLE.y + 0.04, HOLE.z, grp); hole.rotation.x = -Math.PI / 2;
    const ice = new THREE.Group(); objAt(grp, ice, HOLE); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; M(new THREE.DodecahedronGeometry(0.32, 0), new THREE.MeshToonMaterial({ color: 0xcfefff, transparent: true, opacity: 0.85, gradientMap: c.grad }), Math.cos(a) * 0.75, 0.2, Math.sin(a) * 0.75, ice); } ice.visible = false;
    const wolf = petAt(grp, makeWolf(1.35), HOLE.clone().add(new THREE.Vector3(0, 0, -1.3)), Math.PI); const mfox = petAt(grp, c.pet('pets/fox', 1.0), HOLE.clone().add(new THREE.Vector3(2.4, 0, 0.6)), -1.8);
    const fish = new THREE.Group(); objAt(grp, fish, HOLE.clone().add(new THREE.Vector3(-1.6, 0, -0.8))); fish.visible = false;
    const LI = 'Лиса', VO = 'Волк';
    async function foxTalk() {
      const t = TS(); t.fw ||= 0;
      if (t.fw >= 3) { await ui.say(VO, ['Теперь я с удочкой! Хвост — для красоты, а рыба — для ухи. Спасибо, Сказитель.']); return; }
      if (t.fw === 0) {
        await ui.say(LI, ['(лиса хихикает) Здравствуй! А я Волчка-братца рыбу ловить учу. Опусти, говорю, хвост в прорубь и приговаривай: «Ловись, рыбка, и мала, и велика!»']);
        const k = await ui.dialog(me(), 'Мороз трещит, прорубь затягивает ледком…', ['Предупредить волка: «Хвост примёрзнет! Лиса хитрит»', 'Промолчать — пусть сам разбирается']);
        await ui.say(VO, k === 0 ? ['Не мешай! Лиса дело говорит — вон сколько рыбы натаскала… (волк упрямо сидит у проруби)'] : ['Ловись, рыбка, и мала, и велика…']);
        if (k === 0) t.warned = true;
        c.fade(1); await c.wait(900); c.fade(0); ice.visible = true; mfox.root.visible = false; S.freeze && S.freeze();
        await ui.say(VO, ['(наступило утро) Ой-ой! Хвост в прорубь вмёрз! А лиса — убежала… Сказитель, выручай: отбей лёд!']);
        t.fw = 1; t.fwI = 0; c.save(); ui.toast('🧊 Отбей лёд вокруг проруби — 3 удара', true, 3000); return;
      }
      if (t.fw === 1) { await ui.say(VO, ['Отбей лёд! Бей посильнее — три раза!']); return; }
      await ui.say(me(), ['Хвостом рыбу не ловят. Давай-ка смастерим удочку — и в лад, без спешки!']);
      for (let i = t.fwF || 0; i < 3; i++) { const ok = await ui.timing(`Подсекаем рыбу (${i}/3)`, 1 + i * 0.15); if (!ok) { S.wrong(); await ui.say(VO, ['Сорвалась! Ещё разок?']); const q = await ui.dialog(VO, 'Ловим дальше?', ['Ловим!', 'Потом']); if (q !== 0) return; i--; continue; } t.fwF = i + 1; c.save(); S.splash(); c.burst(HOLE.clone().setY(HOLE.y + 0.6), 0xbfe8ff, 20, 3, 0.8, 0.15); M(new THREE.SphereGeometry(0.2, 8, 6), T3(0x8ab0c8), i * 0.5, 0.15, 0, fish).scale.set(1, 0.6, 2.2); fish.visible = true; }
      t.fw = 3; c.save(); S.fanfare(); mfox.root.visible = true;
      await ui.say(VO, ['Три рыбины! Своими лапами — да честной удочкой. Вот это рыбалка!']);
      await ui.say(LI, ['(лиса выглядывает из-за сугроба) Ну… я ж пошутить хотела… (и смущённо прячет нос в хвост)']);
      book('Лиса и волк', 'Хитрая лиса научила волка ловить рыбу хвостом в проруби — и хвост вмёрз в лёд. Сказитель отбил лёд, освободил волка и научил его рыбачить честной удочкой. Три рыбины поймал волк сам, а лиса устыдилась своей шутки.');
    }
    c.hittables.push({ pos: () => HOLE, r: 1.6, cond: () => here() && TS().fw === 1, onHit: () => { const t = TS(); t.fwI = (t.fwI || 0) + 1; S.crack(); c.burst(HOLE.clone().setY(HOLE.y + 0.5), 0xcfefff, 24, 4, 0.7, 0.15); c.shake(0.15);
      if (t.fwI >= 3) { t.fw = 2; ice.visible = false; c.save(); S.chime(); ui.toast('🐺 Хвост свободен! Научи волка ловить рыбу удочкой (F)', true, 3500); } else ui.toast(`🧊 Трещит лёд… ${t.fwI}/3`, false, 1200); } });
    // --- Зимовье зверей ---
    const bull = petAt(grp, c.pet('pets/cow', 1.1), ZIM.clone().add(new THREE.Vector3(-1, 0, 2.6)), 0.4); tint(bull.root, 0x8a6a5a);
    const sheep = objAt(grp, makeSheep(1), ZIM.clone().add(new THREE.Vector3(1.6, 0, 2.8)), -0.4); const pig = petAt(grp, c.pet('pets/hog', 1.0), ZIM.clone().add(new THREE.Vector3(3, 0, 1.4)), -0.9);
    const goose = objAt(grp, makeGoose(1), ZIM.clone().add(new THREE.Vector3(-2.8, 0, 1.2)), 0.8); const cock = objAt(grp, makeRooster(0.9), ZIM.clone().add(new THREE.Vector3(0.4, 0, 4)), 0);
    [bull.root, sheep, pig.root, goose, cock].forEach((o) => (o.position.y = R.H(o.position.x, o.position.z)));
    const zHut = izba(grp, ZIM.clone().add(new THREE.Vector3(0, 0, -2.5)), 0, 0.85, 0x9a6a3a, 0x8a8a7a); zHut.visible = false; c.colliders.pop(); const ZC = { x: zHut.position.x, z: zHut.position.z, r: 2 };
    const MATS = [['log', 4, -6], ['log', 9, 3], ['log', -8, 4], ['moss', 6, -9], ['moss', -10, -4], ['clay', 11, 8]].map(([k, x, z], i) => { const p = ZIM.clone().add(new THREE.Vector3(x, 0, z)); p.y = R.H(p.x, p.z); const o = objAt(grp, new THREE.Group(), p);
      if (k === 'log') { const l = M(new THREE.CylinderGeometry(0.25, 0.25, 2.2, 8), T3(0x9a6a3a), 0, 0.25, 0, o); l.rotation.z = Math.PI / 2; } else if (k === 'moss') { blob(o, 0x5a9a3a, 0.35, 0, 0.2, 0, 1.3, 0.6, 1); blob(o, 0x7aba4a, 0.25, 0.3, 0.3, 0.1, 1, 0.6, 1); } else blob(o, 0xa8583a, 0.4, 0, 0.25, 0, 1.2, 0.7, 1);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff0a0, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false })); glow.position.y = 0.3; o.add(glow); return { k, o, i }; });
    const NM = { log: 'бревно', moss: 'мох', clay: 'глину' };
    const got = () => TS().zimM || (TS().zimM = []);
    MATS.forEach((m) => c.interactables.push({ label: `Взять ${NM[m.k]}`, pos: () => m.o.position, r: 2.4, prio: 1, cond: () => here() && TS().zim === 1 && !got().includes(m.i), act: async () => { got().push(m.i); c.save(); S.click(); c.burst(m.o.position.clone().setY(m.o.position.y + 0.5), 0xfff0a0, 16, 2, 0.6, 0.15); m.o.visible = false; ui.toast(`🪵 ${cnt()}`, false, 2000); } }));
    const cnt = () => { const g2 = got(); const n = (k) => MATS.filter((m) => m.k === k && g2.includes(m.i)).length; return `Брёвна ${n('log')}/3 · мох ${n('moss')}/2 · глина ${n('clay')}/1`; };
    let wolves = [];
    const BU = 'Бык';
    function spawnWolves() { if (wolves.some((w) => w.alive)) return; wolves = [0, 1, 2].map((i) => { const p = ZIM.clone().add(new THREE.Vector3(-10 + i * 10, 0, -12)); return c.spawnEnemy(grp, p, { model: () => { const w = makeWolf(1.3); w.root.userData.mat = null; w.root.traverse((m) => { if (!w.root.userData.mat && m.material?.emissive) w.root.userData.mat = m.material; }); w.root.userData.pet = w; return w.root; }, hp: 3, fly: 0, speed: 3.6, aggroR: 16, group: 'zimwolf', name: 'Волк-забудка', custom: (e) => e.g.userData.pet.play('walk'), onDeath: () => { if (wolves.every((w) => !w.alive)) zimWin(); } }); }); }
    async function zimWin() { const t = TS(); if (t.zim >= 3) return; t.zim = 3; items().tulup = true; player.maxHp += 1; player.hp = player.maxHp; c.save(); S.fanfare();
      await ui.say(BU, ['Бык — рогами, баран — лбом, свинья — визгом, гусь — щипком, петух — криком! А Сказитель — словом. Прогнали забудок!', 'Держи овчинный тулуп — баран свою шерсть не пожалел. В тулупе хоть какая зима — не страшна!']);
      ui.toast('🧥 Тёплый тулуп: +1 ❤ — в Сундуке чудес', true, 4500);
      book('Зимовье зверей', 'Бык, Баран, Свинья, Гусь и Петух ушли от хозяина и решили строить зимовье. Сказитель собрал брёвна, мох и глину, и звери выстроили тёплую избушку. Пришли волки-забудки — да звери вместе со Сказителем их прогнали: кто рогами, кто лбом, кто визгом, кто криком. Баран подарил тёплый тулуп.'); }
    async function bullTalk() {
      const t = TS(); t.zim ||= 0;
      if (t.zim >= 3) { await ui.say(BU, ['Зимуем! Тепло, сухо, и петух по утрам будит. Заходи погреться!']); return; }
      if (t.zim === 2) { spawnWolves(); await ui.say(BU, ['Волки-забудки близко! Бей их, Сказитель, — мы поможем!']); return; }
      if (t.zim === 0) {
        await ui.say(BU, ['Му-у! Зима на носу. Ушли мы от хозяина: я, Баран, Свинья, Гусь да Петух. Давайте, говорю, зимовье строить!', 'Баран: «У меня шуба тёплая». Свинья: «Я в землю зароюсь». Гусь: «Я в ель заберусь». Петух: «И я».', 'Ну и ладно — построю сам. Только помоги собрать: три бревна, два клочка мха да ком глины.']);
        t.zim = 1; c.save(); ui.toast('🪵 Собери: 3 бревна, 2 мха, 1 глину', true, 3500); return;
      }
      if (got().length < MATS.length) { await ui.say(BU, [`Ещё не всё… ${cnt()}`]); return; }
      const parts = ['Кладём брёвна в сруб', 'Конопатим щели мхом', 'Обмазываем глиной'];
      for (let i = t.zimB || 0; i < 3; i++) { const ok = await ui.timing(`${parts[i]} (${i}/3)`, 1 + i * 0.15); if (!ok) { S.wrong(); const q = await ui.dialog(BU, 'Брёвна раскатились! Ещё раз?', ['Строим!', 'Потом']); if (q !== 0) return; i--; continue; } t.zimB = i + 1; c.save(); S.thump && S.thump(110, 0.1, 0.2, 0.3); }
      c.fade(1); await c.wait(700); zHut.visible = true; c.colliders.push(ZC); c.fade(0); S.chime();
      await ui.say(BU, ['Готово зимовье! Тут и Баран прибежал, и Свинья, и Гусь с Петухом: «Пусти погреться!» — «Пущу, да все вместе и защищать будем!»', '(слышен вой…) Волки-забудки идут! Встанем дружно!']);
      t.zim = 2; c.save(); spawnWolves();
    }
    c.interactables.push(
      { label: 'Поговорить с Лисой', pos: () => mfox.root.position, r: 3, cond: () => here() && mfox.root.visible && TS().fw !== 2 && (TS().fw || 0) < 3, act: foxTalk },
      { label: 'Поговорить с Волком', pos: () => wolf.root.position, r: 3, cond: () => here() && ((TS().fw || 0) >= 1), act: foxTalk },
      { label: 'Поговорить с Быком', pos: () => bull.root.position, r: 3.4, cond: () => here(), act: bullTalk },
    );
    return {
      update() { const t = TS(); if (t.zim >= 2 && !zHut.visible) { zHut.visible = true; c.colliders.push(ZC); } MATS.forEach((m) => (m.o.visible = t.zim === 1 && !got().includes(m.i))); if (t.zim === 2 && here()) spawnWolves();
        ice.visible = t.fw === 1; if (t.fw === 1 || t.fw === 2) mfox.root.visible = false; },
      objective() { const t = TS();
        if ((t.fw || 0) < 3) return t.fw === 1 ? [HOLE, 'отбей лёд у проруби — хвост волка вмёрз'] : t.fw === 2 ? [wolf.root.position, 'научи волка ловить рыбу удочкой'] : [mfox.root.position, 'на озере у проруби лиса что-то затевает'];
        if ((t.zim || 0) < 3) return t.zim === 1 ? (got().length < MATS.length ? [MATS.find((m) => !got().includes(m.i)).o.position, `собери для зимовья: ${cnt()}`] : [bull.root.position, 'к Быку — строить зимовье']) : t.zim === 2 ? [bull.root.position, 'прогони волков-забудок от зимовья'] : [bull.root.position, 'к Быку — зима на носу'];
        return null; },
      tracker() { const t = TS(); const ck = (b) => (b ? '☑' : '☐'); return `<br><b style="font-size:13px">Сказки гор</b><br>${ck(t.fw >= 3)} 🦊 Лиса и волк${t.fw === 1 ? ` — лёд ${t.fwI || 0}/3` : t.fw === 2 ? ' — рыбалка' : ''}<br>${ck(t.zim >= 3)} 🐂 Зимовье зверей${t.zim === 1 ? ' — ' + cnt() : t.zim === 2 ? ' — волки!' : ''}`; },
      tp: () => [['Прорубь на озере', () => HOLE.clone().add(new THREE.Vector3(0, 0, 4))], ['Зимовье зверей', () => ZIM.clone().add(new THREE.Vector3(0, 0, 6))]],
    };
  };

  // ----- Молочные реки: «Крошечка-Хаврошечка» -----
  BUILD.river = (grp, L, here, R) => {
    const P0 = L(32, -26); clearSpot(R, P0, 8);
    const hav = npcAt(grp, 'havrosh', P0.clone(), 0); const cow = petAt(grp, c.pet('pets/cow', 1.1), P0.clone().add(new THREE.Vector3(-2.2, 0, 1)), 0.8);
    const sis = [1, 2, 3].map((n, i) => { const ch = npcAt(grp, 'masha', P0.clone().add(new THREE.Vector3(3 + i * 1.6, 0, -1.5 + i * 1.4)), -1.4); tint(ch.root, [0xffd0d0, 0xd0e0ff, 0xe0ffd0][i]);
      const acc = new THREE.Group(); ch.parts.head.add(acc); acc.scale.setScalar(10); const ew = T3(0xffffff), ek = T3(0x111111);
      const eye = (x, y, r) => { const e = M(new THREE.SphereGeometry(r, 10, 8), ew, x, y, 0.41, acc); e.scale.z = 0.4; M(new THREE.SphereGeometry(r * 0.5, 8, 6), ek, x, y, 0.45, acc); return e; };
      if (n === 1) { M(new THREE.BoxGeometry(0.72, 0.18, 0.04), T3(0xffe0c0), 0, 0.42, 0.41, acc); eye(0, 0.42, 0.13); } if (n === 3) eye(0, 0.66, 0.08);
      ch.root.position.y = R.H(ch.root.position.x, ch.root.position.z); return { ch, n }; });
    const rolls = new THREE.Group(); objAt(grp, rolls, P0.clone().add(new THREE.Vector3(1.2, 0, 1.6))); for (let i = 0; i < 5; i++) { const r = M(new THREE.CylinderGeometry(0.18, 0.18, 1, 10), T3(0xf8f4ea), (i - 2) * 0.4, 0.18, 0, rolls); r.rotation.x = Math.PI / 2; } rolls.visible = false;
    const tree = new THREE.Group(); objAt(grp, tree, P0.clone().add(new THREE.Vector3(-1, 0, -3.5))); M(new THREE.CylinderGeometry(0.2, 0.3, 2.4, 8), T3(0x7a5030), 0, 1.2, 0, tree); for (let i = 0; i < 4; i++) blob(tree, 0x58b04a, 1.0, Math.cos(i * 1.6) * 0.7, 2.8 + (i % 2) * 0.5, Math.sin(i * 1.6) * 0.7);
    for (let i = 0; i < 9; i++) blob(tree, i % 2 ? T3(0xffd23a, { emissive: 0x553300 }) : T3(0xe0e8f0, { emissive: 0x202830 }), 0.16, Math.cos(i * 2.3) * 1.2, 2.5 + (i % 3) * 0.5, Math.sin(i * 2.3) * 1.2); tree.visible = false; tree.scale.setScalar(0.01);
    const KH = 'Крошечка-Хаврошечка', KO = 'Бурёнушка', NM = ['Одноглазка', 'Двуглазка', 'Трёхглазка'];
    const LINES = [['«Спи, глазок!»', ['«Гляди, глазок, в оба!»', '«Просыпайся, солнышко встало!»']], ['«Спи, глазок, спи, другой!»', ['«Спи, глазок!» — а второй пусть смотрит', '«Не спи, гляди за Хаврошечкой!»']], ['«Спи, глазок, спи, другой… и третий спи!»', ['«Спи, глазок, спи, другой!» — про третий забыть', '«Спи, глазок!»']]];
    async function havTalk() {
      const t = TS(); t.hav ||= 0;
      if (t.hav >= 3) { await ui.say(KH, ['Яблонька моя растёт, золотые и серебряные яблочки светятся. Сёстры теперь со мной дружат — не подглядывают!']); return; }
      if (t.hav === 0) {
        await ui.say(KH, ['Здравствуй! Я Крошечка-Хаврошечка. Живу у мачехи, работы — на троих: соткать, выбелить, в трубы скатать.', 'Выручает меня коровушка Бурёнушка: влезу ей в одно ушко, вылезу в другое — и всё готово!', 'Да мачеха шлёт своих дочек подглядывать: Одноглазку, Двуглазку и Трёхглазку. Убаюкай их песенкой, а? Только все глаза — до единого!']);
        t.hav = 1; t.sleep = []; c.save(); ui.toast('😴 Убаюкай трёх сестёр (F рядом с каждой)', true, 3500); return;
      }
      if (t.hav === 1) { await ui.say(KH, [`Спят: ${(t.sleep || []).length}/3. Как уснут все три — я к коровушке.`]); return; }
      await ui.say(KH, ['Коровушка шепнула: посади у ворот зёрнышко — вырастет яблонька, всем на радость.']);
      const ok = await ui.timing('Сажаем яблочное зёрнышко', 1); if (!ok) { S.wrong(); return; }
      t.hav = 3; c.save(); tree.visible = true; S.fanfare(); c.burst(tree.position.clone().setY(tree.position.y + 2), 0x9ae86a, 60, 4, 1.5, 0.25);
      await ui.say(KH, ['Выросла! Листья серебряные, яблочки наливные — и золотые, и серебряные. Сорвать никто силой не может, а добрым рукам — само в ладони падает.', '(сёстры проснулись — и вместо того чтобы бранить, просят яблочка. Хаврошечка угощает всех)']);
      book('Крошечка-Хаврошечка', 'Мачеха задавала сироте Хаврошечке непосильную работу, а коровушка помогала: влезет девочка ей в одно ушко, вылезет в другое — и всё готово. Мачеха послала дочерей подглядывать, но Сказитель убаюкал всех: «Спи, глазок, спи, другой…» — и третий глаз Трёхглазки тоже. Из зёрнышка выросла яблонька с золотыми и серебряными яблочками. (Свой пересказ со светлым концом.)');
    }
    async function lull(i) {
      const t = TS(); t.sleep ||= []; if (t.sleep.length !== i) { await ui.say(NM[i], [i > t.sleep.length ? `(${NM[i]} хихикает) Сначала сестрицу убаюкай!` : 'Хр-р…']); return; }
      const [right, wrong] = LINES[i]; const opts = shuffle([right, ...wrong]);
      const k = await ui.dialog(NM[i], `(${NM[i]} уставилась на Хаврошечку ${['единственным глазом', 'обоими глазами', 'всеми тремя глазами'][i]}) Чего тебе?`, [...opts, 'Отойти']);
      if (k < 0 || k >= 3) return;
      if (opts[k] !== right) { S.wrong(); await ui.say(NM[i], [i === 2 && opts[k].includes('другой!') ? '(два глаза уснули… а третий, на лбу, всё видит!) Ага, расскажу матушке!' : 'Не-ет, не сплю! Всё вижу!']); return; }
      S.sleep(); t.sleep.push(i); c.save(); const ch = sis[i].ch; ch.root.rotation.z = 1.35; ch.root.position.y += 0.35; c.burst(ch.root.position.clone().setY(ch.root.position.y + 1), 0xbfd8ff, 16, 1.2, 1.4, 0.15); ui.toast(`💤 ${NM[i]} уснула (${t.sleep.length}/3)`, false, 2200);
    }
    async function cowEar() {
      const t = TS(); await ui.say(KO, ['Му-у… Все спят? Ну, Хаврошечка, полезай в одно ушко, а в другое вылезай!']);
      c.fade(1); await c.wait(900); rolls.visible = true; c.fade(0); S.magic(); c.burst(rolls.position.clone().setY(rolls.position.y + 0.6), 0xffffff, 40, 3, 1, 0.2);
      await ui.say(KH, ['Соткано, выбелено, в трубы скатано! Спасибо, Бурёнушка! И тебе, Сказитель.']); t.hav = 2; c.save();
    }
    sis.forEach((s, i) => c.interactables.push({ label: `Убаюкать ${['Одноглазку', 'Двуглазку', 'Трёхглазку'][i]}`, pos: () => s.ch.root.position, r: 2.6, prio: 1, cond: () => here() && TS().hav === 1 && !(TS().sleep || []).includes(i), act: () => lull(i) }));
    c.interactables.push({ label: 'Поговорить с Хаврошечкой', pos: () => hav.root.position, r: 3, cond: () => here(), act: havTalk },
      { label: 'Хаврошечке — в ушко коровушке', pos: () => cow.root.position, r: 3, prio: 1, cond: () => here() && TS().hav === 1 && (TS().sleep || []).length >= 3, act: cowEar });
    return {
      update(dt) { const t = TS(); if (t.hav >= 3 && tree.scale.x < 1) { tree.visible = true; tree.scale.setScalar(Math.min(1, tree.scale.x + dt * 0.8)); } if (t.hav >= 2) rolls.visible = true;
        sis.forEach((s, i) => { const sl = (t.sleep || []).includes(i) && t.hav < 3; s.ch.root.rotation.z = sl ? 1.35 : 0; s.ch.root.position.y = R.H(s.ch.root.position.x, s.ch.root.position.z) + (sl ? 0.35 : 0); if (!sl && near(player.pos, s.ch.root.position, 6)) look(s.ch.root, player.pos); });
        if (near(player.pos, hav.root.position, 6)) look(hav.root, player.pos); },
      objective() { const t = TS(); if ((t.hav || 0) >= 3) return null;
        if (t.hav === 1) { const i = (t.sleep || []).length; return i < 3 ? [sis[i].ch.root.position, `убаюкай ${['Одноглазку', 'Двуглазку', 'Трёхглазку'][i]} — верными словами`] : [cow.root.position, 'к коровушке — все уснули!']; }
        return [hav.root.position, t.hav === 2 ? 'к Хаврошечке — посадить зёрнышко' : 'к Крошечке-Хаврошечке у молочной реки']; },
      tracker() { const t = TS(); const ck = (b) => (b ? '☑' : '☐'); return `<br><b style="font-size:13px">Сказки рек</b><br>${ck(t.hav >= 3)} 🐄 Крошечка-Хаврошечка${t.hav === 1 ? ` — спят ${(t.sleep || []).length}/3` : t.hav === 2 ? ' — яблонька' : ''}`; },
      tp: () => [['Двор Хаврошечки', () => P0.clone().add(new THREE.Vector3(0, 0, 4))]],
    };
  };

  // ----- Царство Кощея: «Марья Моревна» -----
  BUILD.kosh = (grp, L, here, R) => {
    const TENT = L(-28, -6), CH = L(-22, -12), CHEST = L(-24, -30); [[TENT, 6], [CH, 3], [CHEST, 4]].forEach(([p, r]) => clearSpot(R, p, r));
    c.kit('survival/tent', TENT.x, TENT.z, 3.2, 0.6, 0, grp, R.H); c.colliders.push({ x: TENT.x, z: TENT.z, r: 1.8 });
    const marya = npcAt(grp, 'marya', TENT.clone().add(new THREE.Vector3(1.6, 0, 2.2)), 0.6);
    const shed = new THREE.Group(); objAt(grp, shed, CH); shed.lookAt(TENT.x, CH.y, TENT.z); M(new THREE.BoxGeometry(2.4, 2.4, 2.2), T3(0x4a4048), 0, 1.2, 0, shed); const door = M(new THREE.BoxGeometry(0.9, 1.6, 0.08), T3(0x2a2026), 0, 0.8, 1.12, shed); M(new THREE.BoxGeometry(2.8, 0.2, 2.6), T3(0x2a2a30), 0, 2.5, 0, shed);
    for (let i = 0; i < 3; i++) M(new THREE.TorusGeometry(0.12, 0.03, 6, 10), T3(0x8a8a90), 0.3, 0.9 + i * 0.18, 1.17, shed); c.colliders.push({ x: CH.x, z: CH.z, r: 1.5 }); shed.updateMatrixWorld(true); const SHD = shed.localToWorld(new THREE.Vector3(0, 0, 2.2));
    const chest = c.kit('survival/chest', CHEST.x, CHEST.z, 3, 0.4, 0, grp, R.H); c.colliders.push({ x: CHEST.x, z: CHEST.z, r: 0.8 });
    const sword = new THREE.Group(); objAt(grp, sword, CHEST.clone().add(new THREE.Vector3(0, 1.4, 0))); M(new THREE.BoxGeometry(0.08, 1.2, 0.02), T3(0xdde4ea, { emissive: 0x203040 }), 0, 0.6, 0, sword); M(new THREE.BoxGeometry(0.36, 0.06, 0.06), T3(0xf2c033), 0, 0, 0, sword); sword.visible = false;
    let shadows = [];
    const shadowModel = () => { const m = c.makeForgetling(); tint(m, 0x5a4a7a); return m; };
    function spawnShadows(at, n) { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; shadows.push(c.spawnEnemy(grp, at.clone().add(new THREE.Vector3(Math.cos(a) * 3, 0, Math.sin(a) * 3)), { model: shadowModel, hp: 3, group: 'marya', name: 'Тень Кощея', aggroR: 12 })); } }
    const MR = 'Марья Моревна';
    async function maryaTalk() {
      const t = TS(); t.mar ||= 0;
      if (t.mar >= 3) { await ui.say(MR, ['Меч при мне, тени разбежались. Носи шапку-невидимку с честью, Сказитель!']); return; }
      if (t.mar === 0) {
        await ui.say(MR, ['Я — Марья Моревна, прекрасная королевна. Ехала я на забудок войной, да пока спала в шатре, Кощеевы тени утащили мой меч!', 'Заперли его в сундук у замка и сторожат втроём. Принеси мне меч, Сказитель.', 'Только запомни: в чулан мой — не заглядывай! Что бы оттуда ни просили.']);
        t.mar = 1; c.save(); ui.toast('⚔ Марья Моревна: меч в сундуке у замка (3 тени). В чулан — не заглядывать!', true, 4500); return;
      }
      if (t.mar === 1) { await ui.say(MR, ['Меч в сундуке у замка. Тени стерегут его — одолей их!']); return; }
      t.mar = 3; items().shapka = true; c.save(); S.fanfare(); sword.visible = false;
      await ui.say(MR, [t.marC === 'open' ? 'Ты всё-таки заглянул в чулан… Ну да ты же и справился с тенью. Запомни: запрет в сказке — не просто так.' : 'Ты не заглянул в чулан — сдержал слово! Там томилась Кощеева тень: дай ей воды — она бы силу набрала.', 'Мой меч снова со мной. А тебе — шапка-невидимка: надень, и враги заметят тебя только вблизи.']);
      ui.toast('🎩 Шапка-невидимка — в Сундуке чудес: враги замечают тебя вдвое ближе', true, 5000);
      book('Марья Моревна', 'Прекрасная королевна Марья Моревна попросила Сказителя вернуть меч, который Кощеевы тени заперли в сундук. «Только в чулан мой не заглядывай!» — сказала она. ' + (t.marC === 'open' ? 'Сказитель заглянул — и выпустил тень, но справился и с ней.' : 'Сказитель сдержал слово и не открыл чулан, где томилась Кощеева тень.') + ' Он одолел трёх теней, вернул меч, и Марья подарила ему шапку-невидимку.');
    }
    async function shedAct() {
      const t = TS(); await ui.say('Голос из чулана', ['(из-за двери — слабый шёпот) Добрый молодец… дай водицы испить… третий год без воды…']);
      const k = await ui.dialog(me(), 'Марья Моревна велела в чулан не заглядывать…', ['Открыть дверь и дать воды', 'Не открывать: «Обещал Марье — не загляну»']);
      if (k === 0) { door.visible = false; S.dark(); c.shake(0.3); t.marC = 'open'; c.save(); spawnShadows(SHD, 2); await ui.say('Кощеева тень', ['Ха-ха! Испил водицы — силы набрался! (тень вырвалась на волю)']); ui.toast('Это была Кощеева тень! Одолей её…', false, 3000); }
      else { t.marC = 'kept'; c.save(); S.chime(); ui.toast('🤐 Слово сдержано — чулан закрыт', false, 2500); }
    }
    async function chestOpen() {
      const t = TS(); if (shadows.some((e) => e.alive && e.g.parent)) { await ui.say(me(), ['Тени ещё стерегут сундук…']); return; }
      S.crack(); sword.visible = true; c.burst(sword.position.clone().add(new THREE.Vector3(0, 0.6, 0)), 0xdde4ea, 40, 4, 1, 0.2); t.mar = 2; c.save(); S.chime(); ui.toast('⚔ Меч Марьи Моревны! Отнеси его к шатру', true, 3000);
    }
    c.interactables.push({ label: 'Поговорить с Марьей Моревной', pos: () => marya.root.position, r: 3.2, cond: () => here(), act: maryaTalk },
      { label: 'Заглянуть в чулан?', pos: () => SHD, r: 2.6, prio: 1, cond: () => here() && TS().mar >= 1 && TS().mar < 3 && !TS().marC, act: shedAct },
      { label: 'Открыть сундук', pos: () => CHEST, r: 2.6, prio: 1, cond: () => here() && TS().mar === 1, act: chestOpen });
    return {
      update() { const t = TS(); if (here() && t.mar === 1 && !shadows.length) spawnShadows(CHEST, 3); door.visible = t.marC !== 'open'; if (near(player.pos, marya.root.position, 7)) look(marya.root, player.pos); sword.visible = t.mar === 2; if (sword.visible) sword.rotation.y += 0.02; },
      objective() { const t = TS(); if ((t.mar || 0) >= 3) return null; if (t.mar === 1) return [CHEST, shadows.some((e) => e.alive) ? 'одолей теней у сундука — в чулан не заглядывай!' : 'открой сундук с мечом']; return [marya.root.position, t.mar === 2 ? 'отнеси меч Марье Моревне' : 'к шатру Марьи Моревны']; },
      tracker() { const t = TS(); const ck = (b) => (b ? '☑' : '☐'); return `<br><b style="font-size:13px">Сказки Кощеева царства</b><br>${ck(t.mar >= 3)} ⚔ Марья Моревна${t.mar === 1 ? ' — меч в сундуке' : t.mar === 2 ? ' — отнеси меч' : ''}`; },
      tp: () => [['Шатёр Марьи Моревны', () => TENT.clone().add(new THREE.Vector3(3, 0, 4))]],
    };
  };

  // ----- Калинов мост: «Илья Муромец и Соловей-разбойник» -----
  BUILD.bridge = (grp, L, here, R) => {
    const OAKS = L(26, 24); clearSpot(R, OAKS, 6);
    const oak = new THREE.Group(); objAt(grp, oak, OAKS); M(new THREE.CylinderGeometry(0.9, 1.3, 9, 10), T3(0x5a3e24), 0, 4.5, 0, oak); for (let i = 0; i < 9; i++) { const a = i * 0.7; blob(oak, i % 2 ? 0x2e6a2a : 0x3a7a32, 1.8 + (i % 3) * 0.3, Math.cos(a) * 2.2, 8.8 + (i % 3) * 0.8, Math.sin(a) * 2.2); }
    for (let i = 0; i < 9; i++) blob(oak, 0x6a4a2a, 0.5, Math.cos(i * 0.7) * 1, 5.2, Math.sin(i * 0.7) * 1, 1.6, 0.4, 0.6); // гнездо
    c.colliders.push({ x: OAKS.x, z: OAKS.z, r: 1.4 });
    const sol = npcAt(grp, 'solovei', OAKS.clone().add(new THREE.Vector3(0, 5.3, 1.1)), 0);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; grp.add(ring);
    let wave = -1, cd = 2, kb = new THREE.Vector3(), warned = false, hitThis = false;
    const SO2 = 'Соловей-разбойник', IL = 'Илья Муромец';
    async function solFinale() {
      const t = TS(); t.sol = 3; c.save(); c.shake(0.5); S.stomp(); sol.root.position.copy(OAKS).add(new THREE.Vector3(0, 0, 2.6)); sol.root.position.y = R.H(sol.root.position.x, sol.root.position.z);
      c.lockPlayer(true); try {
        await ui.say(SO2, ['(Соловей кубарем слетел с дуба) Ой-ой! Пощади, богатырь! Тридцать лет свищу — никто дуб мой не качнул!']);
        const k = await ui.dialog(IL, 'Что скажет Илья Муромец Соловью-разбойнику?', ['«Свисти не по-разбойничьи, а по-соловьиному — людей радуй. Ступай с миром»', '«Поедешь со мной в стольный Киев-град, к князю — там и посвистишь»']);
        await ui.say(SO2, k === 0 ? ['Простишь?! (Соловей тихонько насвистывает — и в лесу запели настоящие соловьи)', 'Возьми мои сапоги-скороходы, богатырь. Я в них от погони уходил — а ты в них к добру поспевай.'] : ['Эх, в Киев так в Киев… Только князю я по-соловьиному свистну, не по-разбойничьи. А сапоги-скороходы — тебе, богатырь: мне в Киеве бегать некуда.']);
      } finally { c.lockPlayer(false); }
      items().sapogi = true; c.save(); S.fanfare(); ui.toast('👢 Сапоги-скороходы — в Сундуке чудес: ходишь на 20% быстрее', true, 5000);
      book('Илья Муромец и Соловей-разбойник', 'На прямоезжей дороге у реки Смородины засел в гнезде на дубу Соловей-разбойник: засвистит по-соловьиному, закричит по-звериному — травы-муравы заплетаются, всё живое замертво падает. Илья Муромец прикрылся щитом от свиста и трижды ударил по дубу — и Соловей слетел наземь. Богатырь велел ему свистеть только на радость людям, а Соловей отдал сапоги-скороходы.');
    }
    c.hittables.push({ pos: () => OAKS, r: 2.2, ry: 4, heavy: true, cond: () => here() && (TS().sol || 0) < 3, onHit: (hero) => {
      if (hitThis) return; hitThis = true; setTimeout(() => (hitThis = false), 400);
      if (hero !== 'ilya') { S.click(); ui.toast(c.st.heroes.includes('ilya') ? 'Дуб и не шелохнулся… Только Илья Муромец сдюжит (клавиша героя)' : 'Дуб и не шелохнулся… Нужна богатырская сила', false, 2200); return; }
      const t = TS(); t.solH = (t.solH || 0) + 1; c.save(); c.shake(0.35); S.stomp(); c.burst(OAKS.clone().setY(OAKS.y + 6), 0x3a7a32, 40, 5, 1.2, 0.25);
      if (t.solH >= 3) solFinale(); else ui.toast(`🌳 Дуб качается! ${t.solH}/3 — Соловей держится за ветки`, false, 1800); } });
    return {
      update(dt) {
        const t = TS(); const p = player; const T = c.T();
        if (p.pos && kb.lengthSq() > 0.01) { p.pos.addScaledVector(kb, dt); kb.multiplyScalar(Math.pow(0.03, dt)); }
        if ((t.sol || 0) >= 3) { ring.material.opacity = 0; if (near(p.pos, sol.root.position, 7)) look(sol.root, p.pos); return; }
        sol.root.rotation.y = Math.atan2(p.pos.x - OAKS.x, p.pos.z - OAKS.z); sol.root.position.set(OAKS.x + Math.sin(sol.root.rotation.y) * 1.1, OAKS.y + 5.3, OAKS.z + Math.cos(sol.root.rotation.y) * 1.1);
        const d = Math.hypot(p.pos.x - OAKS.x, p.pos.z - OAKS.z);
        if (!here() || d > 24 || c.player.locked) { wave = -1; ring.material.opacity = 0; return; }
        if (!warned) { warned = true; ui.toast('🌪 Соловей-разбойник свистит! Закрывайся (ПКМ / K), а Илья Муромец пусть ударит по дубу 3 раза', true, 5000); }
        if (wave < 0) { cd -= dt; if (cd <= 0) { wave = 0; S.noise && S.noise(0, 0.6, 2400, 0.25); sol.once && sol.once('interact-right'); } }
        else { const prev = wave * 14; wave += dt; const rr = wave * 14; ring.position.set(OAKS.x, R.H(p.pos.x, p.pos.z) + 0.4, OAKS.z); ring.scale.setScalar(Math.max(0.5, rr)); ring.material.opacity = Math.max(0, 0.8 - wave * 0.4);
          if (prev < d && rr >= d) { if (c.mouseBlock()) { S.click(); ui.toast('🛡 Выдержал свист!', false, 1000); } else { kb.set(p.pos.x - OAKS.x, 0, p.pos.z - OAKS.z).normalize().multiplyScalar(14); c.hurtPlayer(1, 'Свист сбивает с ног! Закрывайся (ПКМ / K)'); } }
          if (wave > 2) { wave = -1; cd = 3.2; } }
      },
      objective() { const t = TS(); if ((t.sol || 0) >= 3) return null; return [OAKS, c.st.heroes.includes('ilya') ? (player.hero === 'ilya' ? `Соловей-разбойник на дубу: закрывайся от свиста и бей дуб (${t.solH || 0}/3)` : 'к дубу Соловья-разбойника — смени героя на Илью Муромца') : 'Соловей-разбойник на дубу — нужен богатырь']; },
      tracker() { const t = TS(); const ck = (b) => (b ? '☑' : '☐'); return `<br><b style="font-size:13px">Былины</b><br>${ck(t.sol >= 3)} 🌪 Илья и Соловей-разбойник${(t.sol || 0) < 3 ? ` — дуб ${t.solH || 0}/3` : ''}`; },
      tp: () => [['Дуб Соловья-разбойника', () => OAKS.clone().add(new THREE.Vector3(0, 0, 12))]],
    };
  };

  // ================= Лукоморье: взаимодействия =================
  const fbPos = () => { const fb = c.EV && c.EV()?.fb(); const v = new THREE.Vector3(); if (fb) fb.getWorldPosition(v); return v; };
  c.interactables.push(
    { label: 'Поговорить с Мужиком', pos: () => muzhik.root.position, r: 3.2, cond: lukOk, act: vegTalk },
    { label: 'Поговорить с Медведем', pos: () => bear1.position, r: 3.4, cond: lukOk, act: vegTalk },
    { label: 'Поговорить с Солдатом', pos: () => soldat.root.position, r: 3, cond: lukOk, act: axeTalk },
    { label: 'Поговорить с Бабкой', pos: () => babka.root.position, r: 3, cond: () => lukOk() && (TS().axe || 0) !== 1, act: axeTalk },
    { label: 'Варить кашу из топора', pos: () => POT, r: 3, prio: 1, cond: () => lukOk() && (TS().axe || 0) >= 1 && TS().axe < 5, act: axeTalk },
    { label: 'Поговорить с Котом', pos: () => cat2.root.position, r: 3, cond: () => lukOk() && cat2.root.visible, act: cockTalk },
    { label: 'Караулить Петушка', pos: () => RDOOR, r: 3.4, prio: 1, cond: () => lukOk() && TS().cock === 1 && !chase && !TS().den, act: guard },
    { label: 'Сыграть на гуслях у лисьей норы', pos: () => DEN, r: 3.6, prio: 2, cond: () => lukOk() && TS().cock === 1 && TS().den && !chase, act: gusli },
    { label: 'Поговорить с Иваном-царевичем', pos: () => TSV, r: 3, prio: 0.5, cond: () => lukOk() && tsarevich.root.visible, act: tsarevichTalk },
    { label: 'Попросить Жар-птицу помочь царевичу', pos: fbPos, r: 5, prio: 4, cond: () => inLuk() && TS().wolf === 2 && c.night() > 0.5 && c.EV?.()?.fb()?.visible, act: firebirdAsk },
    { label: 'Спешиться с волка', pos: () => player.pos, r: 1, prio: -40, cond: () => player.ride === 'wolf', act: async () => { dismount(); S.jump(); } },
  );
  // ================= цели, трекер, меню T, Сундук чудес =================
  const RN = { forest: '🌲 Дремучий лес', mount: '🏔 Ледяные горы', river: '🌊 Молочные реки', kosh: '💀 Царство Кощея', bridge: '🔥 Калинов мост' };
  const REG_TALES = { forest: [['masha', 2, 'Маша и медведь'], ['goats', 2, 'Волк и семеро козлят']], mount: [['fw', 3, 'Лиса и волк'], ['zim', 3, 'Зимовье зверей']], river: [['hav', 3, 'Крошечка-Хаврошечка']], kosh: [['mar', 3, 'Марья Моревна']], bridge: [['sol', 3, 'Илья и Соловей-разбойник']] };
  const regLeft = () => { const t = TS(); const out = []; for (const [id, ls] of Object.entries(REG_TALES)) if (regDone(id)) for (const [k, n, nm] of ls) if ((t[k] || 0) < n) out.push([id, nm]); return out; };
  function objective() {
    const t = TS(); if (!c.st.restored) return null;
    if (chase) return [fox.root.position, chase.fast ? 'беги за лисой к норе!' : 'догони лису с Петушком!'];
    if (t.cock === 1 && t.den) return [DEN, 'сыграй на гуслях у лисьей норы'];
    if (t.wolf === 2) return c.night() > 0.5 ? [c.EV?.()?.fb()?.visible ? fbPos() : c.OAK, 'на дубе — Жар-птица: попроси её помочь царевичу (без клетки!)'] : [c.FIRE3, 'дождись ночи у костра — Жар-птица прилетит на дуб'];
    if (t.wolf === 3) return [TSV, 'отнеси перо Жар-птицы Ивану-царевичу к камню'];
    if (t.wolf === 1) return regDone('forest') ? [c.PORTAL3, 'через портал — в Дремучий лес: найди Серого волка'] : null;
    if ((t.veg || 0) < 3) return [muzhik.root.position, 'к мужику на поле — «Вершки и корешки»'];
    if ((t.axe || 0) < 5) return [soldat.root.position, (t.axe || 0) ? 'к котелку — варить кашу из топора' : 'к солдату у бабкиной избы — «Каша из топора»'];
    if ((t.cock || 0) < 2) return [t.cock === 1 ? RDOOR : cat2.root.position, t.cock === 1 ? 'карауль Петушка у избушки' : 'к избушке Кота, Дрозда и Петушка'];
    if (allFeathers() && !t.wolf) return [TSV, 'у вещего камня — Иван-царевич в беде'];
    const left = regLeft(); if (left.length) return [c.PORTAL3, `через портал — ${RN[left[0][0]]}: «${left[0][1]}»`];
    return null;
  }
  function objectiveRegion(id) { const t = TS(); if (id === 'forest' && t.wolf === 1 && regDone('forest')) return SITES.forest?.objective(); return regDone(id) ? SITES[id]?.objective() || null : null; }
  function tracker(id) {
    const t = TS(); const ck = (b) => (b ? '☑' : '☐');
    if (id && id !== 'luk') return regDone(id) && SITES[id] ? SITES[id].tracker() : '';
    if (!c.st.restored) return '';
    let h = `<br><b style="font-size:13px">Сказки Лукоморья</b><br>${ck(t.veg >= 3)} 🥕 Вершки и корешки${t.veg && t.veg < 3 ? ` — раунд ${t.veg + 1}/3` : ''}<br>${ck(t.axe >= 5)} 🪓 Каша из топора${t.axe >= 2 && t.axe < 5 ? ` — ${t.axe - 2}/3` : ''}<br>${ck(t.cock >= 2)} 🐓 Петушок — золотой гребешок${t.cock === 1 ? ` — спасён ${t.cr || 0}/3` : ''}`;
    if (allFeathers() || t.wolf) h += `<br>${ck(t.wolf >= 4)} 🐺 Иван-царевич и Серый волк`;
    const all = Object.entries(REG_TALES).flatMap(([rid, ls]) => ls.map(([k, n]) => [rid, (t[k] || 0) >= n])); const open = all.filter(([rid]) => regDone(rid));
    if (open.length) h += `<br>${ck(open.every((x) => x[1]) && open.length === all.length)} 📚 Сказки краёв: ${all.filter((x) => x[1]).length}/${all.length}`;
    return h;
  }
  const curSite = () => { const R = c.region(); return R && SITES[R.id] && regDone(R.id) ? SITES[R.id] : null; };
  const tp = () => { const s = curSite(); const out = []; if (inLuk()) { out.push(['Поле мужика', () => FIELD.clone().add(new THREE.Vector3(-8, 0, 0))], ['Изба бабки', () => SOLD.clone().add(new THREE.Vector3(2, 0, 5))]); if (TS().cock) out.push(['Избушка Петушка', () => RDOOR.clone().add(new THREE.Vector3(0, 0, 3))]); } else if (s?.tp) out.push(...s.tp()); return out; };
  let skatT = -999;
  function menu() {
    const it = items(); const out = [];
    if (it.skat) out.push(['🧺 Скатерть-самобранка — подкрепиться', { act: async () => { const left = Math.ceil(60 - (c.T() - skatT)); if (left > 0) { ui.toast(`Скатерть ещё сворачивается… (${left} с)`); return; } skatT = c.T(); player.hp = player.maxHp; player.word = 100; S.magic(); c.burst(player.pos.clone().setY(player.pos.y + 1), 0xffe08a, 40, 3, 1, 0.2); ui.toast('🧺 Скатерть, развернись! Пироги, каша, кисель — здоровье и Слово полны', true, 3000); } }]);
    if (it.wolf && player.ride !== 'wolf' && !c.region()?.swim) out.push(['🐺 Позвать Серого волка', { act: async () => wolfMount() }]);
    if (player.ride === 'wolf') out.push(['🐺 Отпустить Серого волка', { act: async () => dismount() }]);
    return out;
  }
  const CHEST = [['honey', '🍯', 'Бочонок мёда', '+1 ❤ — от медведя за честный дележ'], ['skat', '🧺', 'Скатерть-самобранка', 'T: здоровье и Слово — раз в минуту'], ['gusli', '🪕', 'Гусли-самогуды', 'ритм-игры медленнее и проще'], ['tulup', '🧥', 'Тёплый тулуп', '+1 ❤ — подарок зверей из зимовья'], ['shapka', '🎩', 'Шапка-невидимка', 'враги замечают тебя вдвое ближе'], ['sapogi', '👢', 'Сапоги-скороходы', 'ходишь и бегаешь на 20% быстрее'], ['wolf', '🐺', 'Серый волк', 'T: скакун в любом крае']];
  function chestHtml() { const it = items(); const n = CHEST.filter((x) => it[x[0]]).length;
    return `<h3>Сундук чудес (${n}/${CHEST.length})</h3>` + CHEST.map(([k, ic, nm, tx]) => (it[k] ? `<div class="entry"><b>${ic} ${nm}</b> — ${tx}</div>` : '<div class="entry muted">🔒 ??? — найдётся в новой сказке</div>')).join('') + '<p class="muted small">Чудесные вещи дарят герои новых сказок в Лукоморье и в расколдованных краях.</p>'; }
  const hpBonus = () => (items().honey ? 1 : 0) + (items().tulup ? 1 : 0);
  // гусли-самогуды: ритм медленнее
  const rhythm0 = ui.rhythm.bind(ui); ui.rhythm = (title, o = {}) => rhythm0(title, items().gusli ? { ...o, speed: (o.speed || 1) * 0.82 } : o);

  // ================= обновление =================
  function update(dt, canMove, luk) {
    const t = TS(), T = c.T(), p = player, it = items();
    p.speedMul = it.sapogi ? 1.2 : 1; p.stealthMul = it.shapka ? 0.5 : 1;
    if (p.ride === 'wolf') { if (c.region()?.swim) dismount(); else { rideWolf.root.visible = true; rideWolf.root.position.copy(p.pos); rideWolf.root.rotation.y = p.facing; rideWolf.play(p.walk > 0.3 && canMove ? 'run' : 'idle'); if (!rideWolf.actions?.run && p.walk > 0.3) rideWolf.play('walk'); } } else rideWolf.root.visible = false;
    for (const [id, s] of Object.entries(SITES)) { s.grp.visible = regDone(id); if (s.grp.visible && c.region() === s.R) try { s.update && s.update(dt); } catch (e) { console.error('tales', id, e); } }
    if (!luk) return;
    updChase(dt);
    tsarevich.root.visible = allFeathers() || !!t.wolf; wolfLuk.root.visible = t.wolf >= 4; if (tsarevich.root.visible && near(p.pos, TSV, 7)) look(tsarevich.root, p.pos);
    if (t.cock === 1 && !chase) { cat2.root.visible = false; thrush.visible = false; rooster.visible = !t.den; }
    honey.visible = t.veg >= 3; kasha.visible = t.axe >= 5; skat.visible = t.axe >= 5; axeInPot.visible = t.axe >= 2 && t.axe < 5;
    if ((t.veg || 0) >= 3) showCrop('both'); else if (t.veg === 2) showCrop('wheat', 'roots'); else if (t.veg === 1) showCrop('turnip', 'tops');
    bear1.rotation.y = Math.atan2(p.pos.x - bear1.position.x, p.pos.z - bear1.position.z) * (near(p.pos, bear1.position, 8) ? 1 : 0) || -1.6;
    for (const ch of [muzhik, soldat, babka]) if (near(p.pos, ch.root.position, 6)) look(ch.root, p.pos);
    if (rooster.visible && !chase) rooster.position.y = H(rooster.position.x, rooster.position.z) + Math.abs(Math.sin(T * 3)) * 0.08;
    if (!chase && fox.root.visible && !(t.cock === 1 && t.den)) fox.root.visible = false;
  }
  for (const id of Object.keys(BUILD)) if (c.REGIONS[id]) onRegion(id, c.REGIONS[id]);
  return { objective, objectiveRegion, tracker, update, onRegion, tp, menu, hpBonus, chestHtml, dismount, TS, SITES };
}
