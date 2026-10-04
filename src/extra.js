// v1.3 «Морское царство»: сказки-квесты Лукоморья — «Сказка о рыбаке и рыбке» (А. С. Пушкин),
// «Сивка-Бурка» и «Царевна-лягушка» (русские народные сказки, свой пересказ), вход в Морское царство через Русалку,
// конь-транспорт и ковёр-самолёт. Объекты живут в группе Лукоморья; нитки для ковра — в других краях (хук onRegion).
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export function initExtra(c) {
  const { THREE, S, ui, player, M } = c; const H = c.lukH; const LUKG = c.REGIONS.luk.group;
  const V = (x, z, y) => new THREE.Vector3(x, y ?? H(x, z), z);
  const inLuk = () => c.region() === c.REGIONS.luk;
  const X = () => { const s = c.st; s.extra ||= {}; const e = s.extra; e.wish ??= 0; e.want ??= 0; e.sivka ??= 0; e.frog ??= 0; e.thr ||= {}; return e; };
  const T3 = (col, o) => c.toon(col, o || {}, true);
  const me = () => c.HERO_NAME[player.hero].split(' ')[0];
  const tint = (o, col) => { o.traverse((m) => { if (m.material) { m.material = m.material.clone(); m.material.color?.multiply(new THREE.Color(col)); } }); return o; };
  const g = new THREE.Group(); g.name = 'luk-extra'; LUKG.add(g);

  // ================= Сказка о рыбаке и рыбке =================
  const HUT = V(43, 12), OLDMAN = V(48.2, 16.4), CALL = V(51.5, 18.5, 0.15), TROUGH = V(45.6, 15.2);
  const oldman = c.npc('starik'); oldman.root.position.copy(OLDMAN); oldman.root.rotation.y = 2.2; g.add(oldman.root);
  const oldwoman = c.npc('staruha'); oldwoman.root.position.copy(V(44.6, 16.6)); oldwoman.root.rotation.y = 2.6; g.add(oldwoman.root);
  c.colliders.push({ x: OLDMAN.x, z: OLDMAN.z, r: 0.5 }, { x: oldwoman.root.position.x, z: oldwoman.root.position.z, r: 0.5 });
  // фронтон: треугольник из брёвен в торце избы (x — торец, hw — полуширина, y0 — низ, y1 — конёк)
  function gable(par, x, hw, y0, y1, mat) { const sh = new THREE.Shape(); sh.moveTo(-hw, 0); sh.lineTo(hw, 0); sh.lineTo(0, y1 - y0); sh.closePath(); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), mat); m.material.side = THREE.DoubleSide; m.position.set(x, y0, 0); m.rotation.y = Math.PI / 2; par.add(m); return m; }
  // жилища: землянка → изба → терем
  const homes = { dug: new THREE.Group(), izba: new THREE.Group(), terem: new THREE.Group() };
  Object.values(homes).forEach((h) => { h.position.copy(HUT); h.rotation.y = 2.4; g.add(h); });
  { const d = homes.dug; const sod = T3(0x7a6a44), dirt = T3(0x5a4630), wood = T3(0x8a6038);
    const mound = M(new THREE.SphereGeometry(2.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), sod, 0, -0.2, 0, d); mound.scale.y = 0.55;
    M(new THREE.BoxGeometry(1, 1.2, 0.3), dirt, 0, 0.5, 2.05, d); M(new THREE.BoxGeometry(1.2, 0.15, 0.4), wood, 0, 1.15, 2.05, d);
    M(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 6), dirt, 0.9, 1.4, -0.4, d); }
  { const z = homes.izba; const log = T3(0xa8743e), roof = T3(0x7a4a2a), win = new THREE.MeshBasicMaterial({ color: 0xffd76a });
    for (let i = 0; i < 6; i++) { const lg = M(new THREE.CylinderGeometry(0.22, 0.22, 4.2, 8), log, 0, 0.22 + i * 0.42, 1.5, z); lg.rotation.z = Math.PI / 2; const lg2 = lg.clone(); lg2.position.z = -1.5; z.add(lg2); const s1 = M(new THREE.CylinderGeometry(0.22, 0.22, 3.4, 8), log, 1.9, 0.22 + i * 0.42, 0, z); s1.rotation.x = Math.PI / 2; const s2 = s1.clone(); s2.position.x = -1.9; z.add(s2); }
    const r1 = M(new THREE.BoxGeometry(4.6, 0.15, 2.4), roof, 0, 3.15, 0.85, z); r1.rotation.x = 0.6; const r2 = M(new THREE.BoxGeometry(4.6, 0.15, 2.4), roof, 0, 3.15, -0.85, z); r2.rotation.x = -0.6; // конёк вверх
    gable(z, 1.92, 1.75, 2.5, 3.85, log); gable(z, -1.92, 1.75, 2.5, 3.85, log);
    M(new THREE.PlaneGeometry(0.7, 0.6), win, 0.9, 1.4, 1.75, z); M(new THREE.BoxGeometry(0.9, 1.6, 0.1), T3(0x6a4020), -0.8, 0.8, 1.74, z); M(new THREE.BoxGeometry(0.6, 1.2, 0.6), T3(0xeeeeee), 1.2, 3.4, -0.4, z); }
  { const t = homes.terem; const w = T3(0xf0e0c0), red = T3(0xc0392b), gold = T3(0xf2c033, { emissive: 0x3a2600 }), win = new THREE.MeshBasicMaterial({ color: 0xffd76a });
    M(new THREE.BoxGeometry(4.6, 2.6, 3.6), w, 0, 1.3, 0, t); M(new THREE.BoxGeometry(3.4, 2, 2.8), w, 0, 3.6, 0, t);
    const r = M(new THREE.ConeGeometry(2.6, 2, 4), red, 0, 5.6, 0, t); r.rotation.y = Math.PI / 4; M(new THREE.SphereGeometry(0.3, 10, 8), gold, 0, 6.8, 0, t);
    for (const x of [-1.4, 0, 1.4]) M(new THREE.PlaneGeometry(0.6, 0.8), win, x, 1.5, 1.81, t); for (const x of [-0.8, 0.8]) M(new THREE.PlaneGeometry(0.5, 0.7), win, x, 3.7, 1.41, t);
    M(new THREE.BoxGeometry(4.8, 0.2, 3.8), gold, 0, 2.62, 0, t); }
  c.colliders.push({ x: HUT.x, z: HUT.z, r: 2.4 });
  const troughOld = new THREE.Group(), troughNew = new THREE.Group(); [troughOld, troughNew].forEach((t) => { t.position.copy(TROUGH); t.rotation.y = 0.5; g.add(t); });
  { const wd = T3(0x8a8070); M(new THREE.BoxGeometry(1.4, 0.12, 0.7), wd, 0, 0.06, 0, troughOld); const a = M(new THREE.BoxGeometry(0.7, 0.4, 0.1), wd, -0.35, 0.25, 0.33, troughOld); a.rotation.z = 0.3; M(new THREE.BoxGeometry(0.6, 0.4, 0.1), wd, 0.4, 0.2, -0.33, troughOld).rotation.x = 0.5;
    const nw = T3(0xc08a4a); M(new THREE.BoxGeometry(1.4, 0.12, 0.7), nw, 0, 0.06, 0, troughNew); for (const z of [-0.33, 0.33]) M(new THREE.BoxGeometry(1.4, 0.45, 0.08), nw, 0, 0.28, z, troughNew); for (const x of [-0.68, 0.68]) M(new THREE.BoxGeometry(0.08, 0.45, 0.7), nw, x, 0.28, 0, troughNew); }
  const net = c.P('canoe', OLDMAN.x + 1.8, OLDMAN.z - 2.2, 2.6, 1.3, 0.05, g, H);
  // золотая рыбка
  const gfish = c.makePike(); gfish.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.color.set(0xffc23a); if (o.material.emissive) o.material.emissive.set(0x553300); } }); gfish.scale.setScalar(0.7); g.add(gfish); gfish.visible = false;
  const crown = new THREE.Group(); gfish.add(crown); crown.position.set(0, 0.62, 0.35); for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; M(new THREE.ConeGeometry(0.04, 0.16, 4), T3(0xffe14a, { emissive: 0x664400 }), Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1, crown); }
  function homeVis() { const e = X(); const lvl = e.fishEnd === 'old' ? 0 : e.fishEnd === 'kind' ? 1 : Math.min(2, Math.max(0, e.wish - 1)); homes.dug.visible = lvl === 0; homes.izba.visible = lvl === 1; homes.terem.visible = lvl === 2; troughOld.visible = !(e.wish >= 1 && e.fishEnd !== 'old'); troughNew.visible = !troughOld.visible; }
  homeVis();
  const OM = 'Старик', OW = 'Старуха', GF = 'Золотая рыбка';
  async function fishUp() { gfish.visible = true; gfish.position.copy(CALL).setY(-0.6); gfish.rotation.y = -2.3; S.splash(); c.burst(CALL.clone().setY(0.4), 0xbfe8ff, 40, 4, 1, 0.2); for (let i = 0; i < 30; i++) { gfish.position.y = -0.6 + (i / 30) * 0.95; await c.wait(16); } }
  async function fishDown() { S.splash(); for (let i = 0; i < 25; i++) { gfish.position.y -= 0.05; await c.wait(16); } gfish.visible = false; c.burst(CALL.clone().setY(0.3), 0xffe14a, 30, 3, 1, 0.2); }
  async function oldmanTalk() {
    const e = X();
    if (e.fishEnd) { await ui.say(OM, e.fishEnd === 'kind' ? ['Живём со старухой в новой избе, а рыбка иногда приплывает — просто поболтать.', 'Спасибо, что надоумил: и трёх чудес хватит, коли сердце довольно.'] : ['Вот и сидим опять у разбитого корыта… Сам виноват: надо было сказать «хватит».', 'Ну да ничего. Корыто починим — руки-то есть.']); return; }
    if (!e.fish) {
      await ui.say(OM, ['Жил я со старухой у самого синего моря. Тридцать лет и три года рыбачу — и раз поймал рыбку не простую, а золотую.', 'Отпустил я её в море и ничего не взял. А теперь сети пустые, море серое… Говорят, забудки опутали рыбку в Морском царстве.']);
      await ui.say(OM, [c.st.sea?.met ? 'Ты бывал в Морском царстве? Поищи там мою рыбку — в сетях у коралловых садов.' : 'Русалка на дубе знает дорогу под воду. Попроси её — она добрая.']);
      return;
    }
    if (e.want > e.wish) { await ui.say(OM, ['Опять старуха бранится… Пойдём к морю, позовём рыбку. (F у кромки воды)']); return; }
    await ui.say(OM, e.wish === 0 ? ['Рыбка вернулась! Благодарит тебя, говорит — приплывёт на зов.', 'А у старухи корыто совсем раскололось… Поговори с ней — она скажет, чего хочет.'] : ['Старуха всё недовольна. Ты бы спросил её — чего ещё ей надобно?']);
  }
  const WANTS = [
    ['Дурачина ты, простофиля! Корыто у нас раскололось. Ступай к рыбке, выпроси новое корыто!', 'Смилуйся, государыня рыбка! Разбранила меня старуха: надобно ей новое корыто.', 'Не печалься, ступай себе с Богом. Будет вам новое корыто.'],
    ['Выпросил, дурачина, корыто! Много ль в корыте корысти? Проси избу!', 'Пуще прежнего старуха бранится: хочет избу.', 'Не печалься, ступай. Так и быть: изба вам уж будет.'],
    ['Не хочу быть чёрной крестьянкой — хочу быть столбовою дворянкой, в высоком тереме жить!', 'Ещё пуще старуха бранится: хочет терем, хочет дворянкой быть.', 'Не печалься. Будет ей терем.'],
    ['Не хочу быть дворянкой! Хочу быть владычицей морскою, чтоб жить мне в Окияне-море, а рыбка была у меня на посылках!', null, null],
  ];
  async function oldwomanTalk() {
    const e = X();
    if (e.fishEnd === 'kind') { await ui.say(OW, ['Изба тёплая, корыто новое… А я, старая, чуть было всего не лишилась из-за жадности. Спасибо, что остановил.']); return; }
    if (e.fishEnd === 'old') { await ui.say(OW, ['(сидит у разбитого корыта и молчит)']); return; }
    if (!e.fish) { await ui.say(OW, ['Чего глядишь? Корыто треснуло, сети пустые, дед только вздыхает…']); return; }
    if (e.want > e.wish) { await ui.say(OW, ['Ступай, ступай к морю! Без моего желания не возвращайся!']); return; }
    e.want = e.wish + 1; c.save(); await ui.say(OW, [WANTS[e.wish][0]]);
    ui.toast('Позови золотую рыбку у кромки моря (F)', false, 3500);
  }
  async function callFish() {
    const e = X(); await fishUp();
    await ui.say(GF, ['Чего тебе надобно, старче? (рыбка смотрит и на тебя, Сказитель)']);
    if (e.wish < 3) {
      await ui.say(OM, [WANTS[e.wish][1]]); await ui.say(GF, [WANTS[e.wish][2]]);
      e.wish++; c.save(); await fishDown(); c.fade(1); await c.wait(500); homeVis(); S.magic(); c.fade(0);
      c.burst(HUT.clone().add(new THREE.Vector3(0, 2, 0)), 0xffe27a, 60, 5, 1.5, 0.25);
      ui.toast(['', 'Новое корыто! Только море чуть потемнело…', 'Изба с трубой! А море замутилось…', 'Высокий терем! А синее море почернело…'][e.wish], false, 3500);
      return;
    }
    // четвёртое желание: закон трёх
    const k = await ui.dialog(me(), 'Старуха хочет стать владычицей морской, а рыбку — себе на посылки. Что скажешь рыбке?', ['Передать просьбу старухи', 'Нет. «Хватит! Три чуда — уже целая сказка». Поговорить со старухой', 'Пока ничего не говорить']);
    if (k === 2 || k < 0) { await fishDown(); return; }
    if (k === 0) {
      await ui.say(OM, ['Смилуйся, государыня рыбка! Не хочет старуха быть дворянкой — хочет быть владычицей морскою…']);
      await ui.say(GF, ['(Ничего не сказала рыбка, лишь хвостом по воде плеснула и ушла в глубокое море.)']);
      await fishDown(); c.shake(0.4); S.dark(); c.fade(1); await c.wait(700); e.fishEnd = 'old'; c.save(); homeVis(); c.fade(0);
      await ui.say(OM, ['Глядь — опять перед нами землянка, а на пороге старуха, а пред нею разбитое корыто…']);
      c.addBook('Сказка о рыбаке и рыбке', 'Старик отпустил золотую рыбку и ничего не взял. А жадная старуха всё требовала: корыто, избу, терем — и наконец пожелала стать владычицей морскою. Рыбка ушла в море, и старуха осталась у разбитого корыта. (А. С. Пушкин. Можно начать сказку заново и сказать «хватит».)');
      return;
    }
    await ui.say(GF, ['Подожди, старче. Пусть Сказитель скажет своё слово.']); await fishDown();
    const a = await ui.dialog(OW, 'Это кто тут мне перечит?! Владычицей хочу быть!', ['Бабушка, у вас есть изба, корыто, дед рядом. Разве этого мало для счастья?', 'Рыбка не обязана служить. Добро за добро, а не жадность за добро.', 'Вы правы, просите ещё больше!']);
    if (a === 2) { S.wrong(); await ui.say(OW, ['Вот! И Сказитель за меня! …Хотя постой. Что-то тут не так. Ступай-ка, подумай ещё.']); return; }
    await ui.say(OW, ['(старуха долго молчит, потом садится на лавку)', 'И то правда… Полы в тереме мести замучаешься. Изба тёплая, корыто новое, дед рядом. Хватит с меня.', 'Скажи рыбке спасибо. От меня. Впервые за тридцать лет и три года.']);
    c.fade(1); await c.wait(600); e.fishEnd = 'kind'; c.save(); homeVis(); c.fade(0); S.restore();
    player.maxHp += 1; player.hp = player.maxHp; ui.toast('🐟 Золотая чешуйка: +1 ❤ — подарок рыбки за доброе слово', true, 4500);
    c.addBook('Сказка о рыбаке и рыбке', 'Старик отпустил золотую рыбку, а жадная старуха требовала всё больше: корыто, избу, терем. Когда она захотела стать владычицей морскою, Сказитель сказал: «Хватит — три чуда уже целая сказка». Старуха задумалась и осталась в тёплой избе. (По мотивам сказки А. С. Пушкина; у Пушкина старуха осталась у разбитого корыта.)');
  }

  // ================= Сивка-Бурка =================
  const TEREM = V(-4, 45.5), HORSE_HOME = c.STONE3.clone().add(new THREE.Vector3(2.4, 0, -1.6));
  const terem = new THREE.Group(); terem.position.copy(TEREM); terem.lookAt(0, TEREM.y, 0); g.add(terem);
  { const w = T3(0xf0e4c8), red = T3(0xc0392b), green = T3(0x2e7d32), gold = T3(0xf2c033, { emissive: 0x3a2600 }), wood = T3(0x9a6a3e), win = new THREE.MeshBasicMaterial({ color: 0xffd76a });
    M(new THREE.BoxGeometry(4.4, 4, 4), w, 0, 2, 0, terem); M(new THREE.BoxGeometry(3.6, 3.4, 3.4), wood, 0, 5.7, 0, terem); M(new THREE.BoxGeometry(2.8, 2.6, 2.8), w, 0, 8.7, 0, terem);
    const r = M(new THREE.ConeGeometry(2.4, 2.6, 8), green, 0, 11.3, 0, terem); M(new THREE.SphereGeometry(0.35, 10, 8), gold, 0, 12.8, 0, terem);
    M(new THREE.PlaneGeometry(1, 1.2), win, 0, 9, 1.41, terem); M(new THREE.BoxGeometry(1.3, 0.12, 0.3), red, 0, 8.35, 1.5, terem);
    for (const x of [-1.2, 1.2]) M(new THREE.PlaneGeometry(0.7, 0.9), win, x, 2.2, 2.01, terem); M(new THREE.BoxGeometry(1.1, 2, 0.1), T3(0x6a4020), 0, 1, 2.02, terem);
    M(new THREE.BoxGeometry(4.6, 0.2, 4.2), red, 0, 4.05, 0, terem); M(new THREE.BoxGeometry(3.8, 0.2, 3.6), red, 0, 7.45, 0, terem); }
  c.colliders.push({ x: TEREM.x, z: TEREM.z, r: 2.7 }); c.camBlockers.push(terem);
  const WIN = terem.localToWorld(new THREE.Vector3(0, 9, 2.4)); terem.updateMatrixWorld(true); WIN.copy(terem.localToWorld(new THREE.Vector3(0, 9, 2.4)));
  const DOOR = terem.localToWorld(new THREE.Vector3(0, 0, 4)); DOOR.y = H(DOOR.x, DOOR.z);
  const elena = c.npc('elena'); elena.root.position.copy(terem.localToWorld(new THREE.Vector3(0, 8.45, 1.2))); elena.root.rotation.y = terem.rotation.y; g.add(elena.root);
  const hp = c.pet('pets/deer', 1.55); const HR = tint(hp.root, 0x8a6a4a); g.add(HR); HR.position.copy(HORSE_HOME); HR.visible = false;
  // грива и хвост — чтобы олень стал конём
  { const mane = T3(0x3a2614); const m1 = M(new THREE.BoxGeometry(0.12, 0.35, 0.9), mane, 0, 1.55, 0.35, HR); m1.rotation.x = -0.5; const tl = M(new THREE.ConeGeometry(0.12, 0.8, 6), mane, 0, 1.0, -0.75, HR); tl.rotation.x = -2.4; HR.traverse((o) => { if (/antler|horn/i.test(o.name)) o.visible = false; }); }
  const SB = 'Сивка-Бурка', EL = 'Царевна Елена';
  function mount() { player.ride = true; X().horseAt = null; S.stomp(); ui.toast('🐎 Ты на Сивке-Бурке! Скорость ×1.75, Пробел — богатырский прыжок. F (вдали от всех) — спешиться', false, 4000); }
  function dismount(silent) { if (!player.ride) return; player.ride = false; const e = X(); const p = player.pos; e.horseAt = [p.x + Math.sin(player.facing + 1.6) * 1.6, p.z + Math.cos(player.facing + 1.6) * 1.6]; if (!inLuk()) e.horseAt = [HORSE_HOME.x, HORSE_HOME.z]; if (!silent) { c.save(); S.jump(); } }
  async function callHorse() {
    const e = X();
    if (e.sivka >= 2) { HR.visible = true; HR.position.copy(c.STONE3).add(new THREE.Vector3(2, 0, -2)); e.horseAt = [HR.position.x, HR.position.z]; S.stomp(); c.burst(HR.position.clone().setY(HR.position.y + 1), 0xffe27a, 40, 4, 1); await ui.say(SB, ['(Конь бежит — земля дрожит, из ушей дым столбом валит!) Здесь я, хозяин!']); return; }
    await ui.say(me(), [c.night() > 0.5 ? '(Полночь. Луна над камнем на распутье. Пора позвать чудесного коня…)' : '(Камень на распутье. Ветер стих, трава не шелохнётся. Пора позвать чудесного коня…)']);
    const opts = shuffle(['«Сивка-бурка, вещая каурка, встань передо мной, как лист перед травой!»', '«Но, лошадка, скачи сюда!»', '«По щучьему велению — конь, явись!»']);
    const k = await ui.dialog(me(), 'Какими словами позвать коня?', opts);
    if (!opts[k] || !opts[k].startsWith('«Сивка')) { S.wrong(); await ui.say(me(), ['…Тишина. Только сверчки. Видно, не те слова. (Вспомни сказку Кота!)']); return; }
    HR.visible = true; HR.position.copy(HORSE_HOME); c.shake(0.5); S.stomp(); c.burst(HR.position.clone().setY(HR.position.y + 1.2), 0xffe27a, 80, 6, 1.4, 0.25);
    await ui.say(SB, ['(Конь бежит — земля дрожит, из ноздрей пламя пышет, из ушей дым столбом валит!)', 'Чего надобно, Сказитель? Влезь мне в одно ушко, а в другое вылезь — станешь таким молодцем, что ни в сказке сказать, ни пером описать!']);
    c.fade(1); await c.wait(700); e.sivka = 1; c.save(); mount(); c.fade(0); S.fanfare();
    await ui.say(SB, ['А теперь — к терему у южного берега! Царевна Елена сидит в окошке высоко-высоко. Кто допрыгнет — тому она перстень подарит.']);
  }
  async function teremJump() {
    const e = X(); const tries = [12.5, 17.5];
    for (let i = (e.jumps || 0); i < 2; i++) {
      await ui.say(SB, [i === 0 ? 'Держись крепче! Раз…' : 'Ещё разок! Два…']);
      player.vy = tries[i]; player.onGround = false; S.stomp(); await c.wait(i === 0 ? 1200 : 1500);
      await ui.say(EL, [i === 0 ? '(из окошка) Ах! Не допрыгнул… Лишь на три бревна!' : '(из окошка) Ещё чуть-чуть — на два бревна не достал!']); e.jumps = i + 1; c.save();
    }
    await ui.say(SB, ['Третий раз — заветный! Лови миг и толкайся!']);
    const ok = await ui.timing('Прыжок Сивки-Бурки — в третий раз!', 1.15);
    if (!ok) { player.vy = 15; S.stomp(); await c.wait(1300); S.wrong(); await ui.say(SB, ['Не в лад толкнулся! Ничего — третий раз можно пробовать сколько угодно. Закон трёх нас подождёт.']); return; }
    player.vy = 22.6; player.onGround = false; S.stomp(); await c.wait(820);
    c.burst(WIN.clone(), 0xffd23f, 80, 5, 1.5, 0.3); S.chime(); await c.wait(900);
    await ui.say(EL, ['Допрыгнул! До самого окошка! (царевна прикладывает ко лбу Сказителя перстень — остаётся золотая печать)', 'Теперь узнаю тебя хоть в лохмотьях, хоть в золоте. А конь пусть служит тебе верно.']);
    e.sivka = 2; e.jumps = 0; c.save(); S.fanfare();
    c.addBook('Сивка-Бурка, вещая каурка', 'В полночь у камня на распутье Сказитель позвал чудесного коня заветными словами — и прискакал Сивка-Бурка. Раз — не допрыгнул до окошка царевны, два — чуть-чуть, а на третий раз — до самого окна! Царевна Елена приложила к его лбу перстень, а Сивка-Бурка остался верным конём.');
    ui.toast('🐎 Сивка-Бурка — твой конь в Лукоморье: F рядом — сесть, у камня — позвать', true, 5000);
  }
  async function elenaTalk() { const e = X(); if (e.sivka >= 1) { await ui.say(EL, e.sivka >= 2 ? ['Здравствуй, мой прыгун! Печать на лбу ещё блестит.'] : ['(из окошка) Ну же, на коне — прыгай! Кто допрыгнет — тому перстень.']); return; }
    const known = c.nightTales().includes('Сивка-Бурка');
    await ui.say(EL, ['(из окошка) Ах, скучно в тереме! Кто на чудесном коне до окошка допрыгнет — тому перстень подарю.', 'Пешком сюда не допрыгнуть, а простой лошадке и подавно. Нужен вещий конь — Сивка-Бурка!',
      known ? 'Ты ведь знаешь сказку — помнишь заветные слова? Ступай к вещему камню на распутье и позови коня!' : 'Как его позвать — знает Кот учёный. Попроси его вечером у костра рассказать сказку «Сивка-Бурка», а потом позови коня у вещего камня на распутье.']);
    if (!e.sivkaAsk) { e.sivkaAsk = true; c.save(); S.chime(); ui.toast(known ? '🐎 Иди к вещему камню и позови Сивку-Бурку' : '🐎 Ночью у костра Кот расскажет «Сивку-Бурку» — а потом зови коня у камня', true, 4500); } }

  // ================= Царевна-лягушка =================
  const ARROW = c.KIKI_POS.clone().add(new THREE.Vector3(5.5, 0, -4)); ARROW.y = Math.max(H(ARROW.x, ARROW.z), 0.2);
  const arrow = new THREE.Group(); arrow.position.copy(ARROW); g.add(arrow);
  { const sh = M(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), T3(0x8a5a2a), 0, 0.6, 0, arrow); sh.rotation.z = 0.35; M(new THREE.ConeGeometry(0.1, 0.25, 4), T3(0xd0d0d0), 0.25, 1.35, 0, arrow).rotation.z = 0.35; for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.02, 0.3, 0.18), T3(0xd83a2a), -0.22, -0.05, s * 0.06, arrow).rotation.z = 0.35; }
  const frog = new THREE.Group(); frog.position.copy(ARROW).add(new THREE.Vector3(1.2, 0, 0.6)); frog.position.y = H(frog.position.x, frog.position.z); g.add(frog);
  { const gm = T3(0x4caf50), wm = T3(0xffffff), km = T3(0x111111); const b = M(new THREE.SphereGeometry(0.4, 12, 10), gm, 0, 0.3, 0, frog); b.scale.set(1.2, 0.75, 1.1);
    for (const s of [-1, 1]) { M(new THREE.SphereGeometry(0.13, 8, 6), wm, s * 0.17, 0.6, 0.22, frog); M(new THREE.SphereGeometry(0.06, 6, 5), km, s * 0.17, 0.62, 0.33, frog); M(new THREE.SphereGeometry(0.16, 8, 6), gm, s * 0.42, 0.12, 0.15, frog).scale.set(1, 0.5, 1.6); }
    const cr = new THREE.Group(); cr.position.set(0, 0.68, 0.05); frog.add(cr); M(new THREE.CylinderGeometry(0.16, 0.18, 0.1, 8, 1, true), T3(0xf2c033, { emissive: 0x3a2600 }), 0, 0, 0, cr); for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; M(new THREE.ConeGeometry(0.04, 0.14, 4), T3(0xf2c033, { emissive: 0x3a2600 }), Math.cos(a) * 0.16, 0.1, Math.sin(a) * 0.16, cr); } }
  c.outline(frog, 1.06);
  const tsar = c.npc('tsarevna'); tsar.root.position.copy(frog.position); g.add(tsar.root); tsar.root.visible = false;
  const carpet = new THREE.Group(); { const cm = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 1.4), T3(0xb02a3a)); carpet.add(cm); const b = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.07, 0.12), T3(0xf2c033)); b.position.z = 0.66; carpet.add(b); const b2 = b.clone(); b2.position.z = -0.66; carpet.add(b2); const o = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.7), T3(0x2a5ab0)); carpet.add(o); }
  carpet.position.copy(frog.position).add(new THREE.Vector3(-1.6, 0.9, 1)); g.add(carpet); carpet.visible = false;
  const FR = 'Лягушка', TS = 'Царевна-лягушка';
  const THR = { forest: ['🌲 Дремучий лес', 0x3aa04a, 'зелёная, как еловая хвоя'], mount: ['🏔 Ледяные горы', 0x6ac8ff, 'голубая, как иней'], river: ['🌊 Молочные реки', 0xff8ab0, 'розовая, как кисель'] };
  const thrN = () => Object.keys(THR).filter((k) => X().thr[k]).length;
  async function frogTalk() {
    const e = X();
    if (e.frog === 0) {
      await ui.say(FR, ['Ква! Ты нашёл мою стрелу! Значит, по сказке — судьба.', 'Не пугайся: я не простая лягушка. Я царевна. Забудки Кощея закрепили на мне лягушачью кожу — и я забыла, как снимать её.']);
      await ui.say(FR, ['Помоги вспомнить мою сказку — три дела, как положено: испеки царский каравай у костра, собери нитки для ковра в трёх краях (в лесу, в горах и у молочных рек), а потом — спляши со мной на пиру.']);
      e.frog = 1; c.save(); S.chime(); ui.toast('🐸 Царевна-лягушка: каравай, три нитки, пляска', true, 4000); return;
    }
    if (e.frog >= 2) { await tsarTalk(); return; }
    if (!e.loaf || thrN() < 3) { await ui.say(FR, [`Ква-ква… ${e.loaf ? '☑' : '☐'} каравай у костра, ${thrN()}/3 ниток (лес, горы, молочные реки). Нитки лежат у входа в каждый край.`]); return; }
    await ui.say(FR, ['Каравай пышный, нитки — все три! Ковёр я сотку за ночь. А теперь — пир! Пляши со мной, Сказитель: махну левым рукавом — озеро, правым — лебеди!']);
    const r = await ui.rhythm('Пляска Царевны-лягушки', { notes: 14, speed: 1, onNote: (ln, ok) => { if (ok) S.pluck(293.66 * [1, 1.26, 1.5][ln], 0, 0.12, 0.8); else S.click(); } });
    if (r < 0.6) { S.wrong(); await ui.say(FR, [`Ква! Сбились с ноги (${Math.round(r * 100)}%). Давай ещё раз — пляска любит повторение.`]); return; }
    frog.visible = false; tsar.root.visible = true; tsar.root.position.copy(frog.position); c.burst(frog.position.clone().setY(frog.position.y + 1), 0x9ae86a, 80, 5, 1.6, 0.25); S.restore();
    await ui.say(TS, ['(Лягушачья кожа соскользнула — и перед тобой красавица в зелёном сарафане!)', 'Вспомнила! Меня тоже зовут Василисой — Василисой Прекрасной. Видишь, кожа лежит на кочке…']);
    const k = await ui.dialog(me(), '(Кожа лягушачья лежит рядом. Можно бросить её в огонь, чтобы царевна навсегда осталась человеком…)', ['Сжечь кожу — пусть не обернётся назад!', 'Не трогать. Чудо нельзя торопить — пусть решит сама']);
    if (k === 0) {
      c.burst(tsar.root.position.clone().setY(tsar.root.position.y + 1), 0xff9a2a, 50, 4, 1, 0.2); S.dark();
      await ui.say(TS, ['Ах! Что ты наделал… Ещё бы три денька — и я бы стала свободной сама. Не торопи чудо!']);
      tsar.root.visible = false; frog.visible = true; e.burned = (e.burned || 0) + 1; c.save();
      await ui.say(FR, ['Ква… Ну, Закон добра: прощаю. Кожа выросла заново. Спляшем ещё раз — и уж в этот раз не торопись.']); return;
    }
    e.frog = 2; e.carpet = true; c.save(); S.fanfare(); carpet.visible = true;
    await ui.say(TS, ['Ты не стал торопить чудо — а это мудрее любой силы. Кожу я сама сберегу: пусть лежит в сундуке, как память.', 'А из ниток трёх краёв я соткала ковёр-самолёт. Садись — он отнесёт тебя в любой край, где ты уже бывал.']);
    c.addBook('Царевна-лягушка и ковёр-самолёт', 'На болоте Сказитель нашёл стрелу и лягушку в короне. Он испёк царский каравай, собрал нитки в Дремучем лесу, в Ледяных горах и у Молочных рек и сплясал с лягушкой на пиру — и она обернулась Василисой Прекрасной. Сказитель не стал жечь лягушачью кожу и не поторопил чудо, а царевна соткала ему ковёр-самолёт.');
    ui.toast('🧞 Ковёр-самолёт: T — лететь в любой открытый край', true, 5000);
  }
  async function tsarTalk() { await ui.say(TS, ['Ковёр-самолёт ждёт тебя в меню «По щучьему велению» (T). Лети, Сказитель!', 'А я учу Кикимору печь караваи. Пока выходят… болотные.']); }
  async function bakeLoaf() {
    const e = X();
    await ui.say(me(), ['Мука, вода, соль, щепоть сказки… Замесим царский каравай! Три раза — в лад.']);
    const titles = ['Замешиваем тесто', 'Лепим каравай', 'Сажаем в печь!']; let ok = 0;
    while (ok < 3) { const hit = await ui.timing(`${titles[ok]} (${ok}/3)`, 1 + ok * 0.2); if (hit) { ok++; S.pluck(330 * (1 + ok * 0.2), 0, 0.15, 0.6); } else { S.wrong(); const k = await ui.dialog(me(), 'Тесто осело… Ещё разок?', ['Месим заново', 'Потом']); if (k !== 0) return; } }
    e.loaf = true; c.save(); S.chime(); c.burst(c.FIRE3.clone().setY(c.FIRE3.y + 1.2), 0xe0a050, 50, 4, 1.2, 0.25);
    ui.toast('🍞 Пышный белый каравай готов! (Царевна-лягушка: ' + (1 + thrN()) + '/4)', true, 3500);
  }
  // нитки в других краях
  function onRegion(id, R) {
    if (!THR[id]) return; const [, col] = THR[id]; const sp = R.spawn(); const pos = new THREE.Vector3(sp.x + 3.5, 0, sp.z - 3); pos.y = R.H(pos.x, pos.z) + 0.6;
    const spool = new THREE.Group(); spool.position.copy(pos); spool.visible = X().frog === 1 && !X().thr[id]; R.group.add(spool);
    const wm = c.toon(col, { emissive: new THREE.Color(col).multiplyScalar(0.35) }, true);
    M(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 14), wm, 0, 0, 0, spool); for (const y of [-0.28, 0.28]) M(new THREE.CylinderGeometry(0.4, 0.4, 0.07, 14), T3(0x9a6a3e), 0, y, 0, spool);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 8), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false })); spool.add(glow);
    spools[id] = { spool, R };
    c.interactables.push({ label: 'Взять нитку для ковра', pos: () => spool.position, r: 2.6, prio: 2, cond: () => c.region() === R && X().frog === 1 && !X().thr[id], act: async () => {
      X().thr[id] = true; c.save(); S.chime(); c.burst(spool.position.clone(), col, 40, 3, 1, 0.2); spool.visible = false;
      ui.toast(`🧵 Нитка ${THR[id][2]} — ${thrN()}/3 для ковра Царевны-лягушки`, true, 3500);
    } });
  }
  const spools = {};

  // ================= Русалка: вход в Морское царство =================
  async function mermaidSea() {
    const s = c.st; const EV = c.EV && c.EV(); const opts = ['Отведи меня в Морское царство', ...(EV && EV.canTell('mermaid') ? ['Пересказать сказку'] : []), 'Уйти'];
    if (!s.sea.met) await ui.say('Русалка', ['Сказитель! Послушай… Под Лукоморьем, на самом дне, — Морское царство. Там тоже всё уснуло.', 'Морской царь забыл свои песни, гусляр Садко гостит у него и не может вернуться домой, а в сетях запуталась золотая рыбка.', 'Я провожу тебя! Под водой не бойся: держи Пробел — всплывёшь, отпустишь — опустишься.']);
    const k = await ui.dialog('Русалка', s.sea.met ? 'Поплывём в Морское царство?' : 'Поплывёшь со мной?', opts);
    if (opts[k] === 'Пересказать сказку') return EV.retell('mermaid');
    if (k !== 0) return;
    s.sea.met = true; c.save(); await c.travel('sea');
  }

  // ================= интерактив =================
  c.interactables.push(
    { label: 'Поговорить с Русалкой о Морском царстве', pos: () => c.MERMAID_GROUND, r: 3.6, prio: -1.5, cond: () => inLuk() && c.st.restored && c.st.links?.mermaid, act: mermaidSea },
    { label: 'Поговорить со Стариком', pos: () => oldman.root.position, r: 3.2, cond: () => inLuk(), act: oldmanTalk },
    { label: 'Поговорить со Старухой', pos: () => oldwoman.root.position, r: 3.2, cond: () => inLuk(), act: oldwomanTalk },
    { label: 'Позвать золотую рыбку', pos: () => CALL, r: 4.2, prio: 1, cond: () => inLuk() && X().fish && !X().fishEnd && X().want > X().wish, act: callFish },
    { label: 'Позвать Сивку-Бурку', pos: () => c.STONE3, r: 3.4, prio: 1, cond: () => inLuk() && !player.ride && (X().sivka >= 2 || (X().sivka === 0 && c.nightTales().includes('Сивка-Бурка'))), act: callHorse },
    { label: 'Сесть на Сивку-Бурку', pos: () => HR.position, r: 2.8, prio: 1, cond: () => inLuk() && HR.visible && !player.ride && X().sivka >= 1, act: async () => mount() },
    { label: 'Спешиться', pos: () => player.pos, r: 1, prio: -40, cond: () => inLuk() && player.ride, act: async () => dismount() },
    { label: 'Допрыгнуть до окошка царевны', pos: () => DOOR, r: 4.5, prio: 2, cond: () => inLuk() && player.ride && X().sivka === 1, act: teremJump },
    { label: 'Поговорить с царевной в окошке', pos: () => DOOR, r: 4.5, cond: () => inLuk() && !(player.ride && X().sivka === 1), act: elenaTalk },
    { label: 'Поднять стрелу на болоте', pos: () => ARROW, r: 3, prio: 1, cond: () => inLuk() && X().frog === 0 && c.nightTales().includes('Царевна-лягушка'), act: frogTalk },
    { label: 'Поговорить с Лягушкой в короне', pos: () => frog.position, r: 3, cond: () => inLuk() && X().frog === 1, act: frogTalk },
    { label: 'Поговорить с Василисой Прекрасной', pos: () => tsar.root.position, r: 3, cond: () => inLuk() && X().frog >= 2, act: tsarTalk },
    { label: 'Испечь царский каравай', pos: () => c.FIRE3, r: 3.2, prio: 2, cond: () => inLuk() && X().frog === 1 && !X().loaf, act: bakeLoaf },
  );

  // ================= цели, трекер, обновление =================
  function objective() {
    const s = c.st, e = X();
    if (s.restored && !s.sea.done) return [c.MERMAID_GROUND, s.sea.met ? 'в Морское царство — через Русалку или портал' : 'к Русалке на дубе — она знает путь в Морское царство'];
    if (s.sea.done && s.mount.done && !s.bridge.done) return [c.PORTAL3, 'через портал — к Калинову мосту на реке Смородине'];
    if (e.fish && !e.fishEnd) return e.want > e.wish ? [CALL, 'позови золотую рыбку у моря'] : [oldwoman.root.position, 'к старухе у землянки'];
    if (e.frog === 1) return !e.loaf ? [c.FIRE3, 'испечь каравай у костра'] : thrN() < 3 ? [c.PORTAL3, 'за нитками для ковра — в лес, горы, к молочным рекам'] : [frog.position, 'к лягушке — плясать!'];
    if (e.sivka === 1) return [DOOR, 'на Сивке-Бурке — к терему царевны'];
    if (e.frog === 0 && c.nightTales().includes('Царевна-лягушка')) return [ARROW, 'на болоте лежит чья-то стрела…'];
    if (e.sivka === 0 && c.nightTales().includes('Сивка-Бурка')) return [c.STONE3, 'к вещему камню на распутье — позови Сивку-Бурку'];
    if (e.sivka === 0 && e.sivkaAsk) return [c.FIRE3, 'вечером у костра попроси Кота рассказать «Сивку-Бурку»'];
    if (s.restored && e.sivka === 0 && !e.sivkaAsk) return [DOOR, 'к терему на южном берегу — царевна Елена скучает в окошке'];
    return null;
  }
  function tracker() {
    const s = c.st, e = X(); const ck = (b) => (b ? '☑' : '☐'); let h = '';
    if (s.restored) h += `<br>${ck(s.sea.done)} 🐚 Морское царство${s.sea.met ? '' : ' — спроси Русалку'}`;
    if (s.sea.done) h += `<br>${ck(s.bridge.done)} 🔥 Калинов мост${!s.mount.done ? ' — после Ледяных гор' : s.heroes.includes('ilya') ? '' : ' — Илья Муромец'}`;
    if (s.restored) h += `<br>${ck(e.fishEnd)} 🐟 Рыбак и рыбка${e.fishEnd ? '' : !e.fish ? ' — рыбка в сетях под водой' : e.want > e.wish ? ' — позови рыбку' : ` — желаний ${e.wish}/3`}`;
    if (s.restored || c.nightTales().includes('Сивка-Бурка')) h += `<br>${ck(e.sivka >= 2)} 🐎 Сивка-Бурка${e.sivka === 0 ? (c.nightTales().includes('Сивка-Бурка') ? ' — позови у вещего камня' : e.sivkaAsk ? ' — сказка у Кота (костёр, ночь)' : ' — спроси царевну в тереме') : e.sivka === 1 ? ' — прыжок к терему' : ''}`;
    if (c.nightTales().includes('Царевна-лягушка')) h += `<br>${ck(e.frog >= 2)} 🐸 Царевна-лягушка${e.frog === 0 ? ' — стрела на болоте' : e.frog === 1 ? ` — ${e.loaf ? '🍞' : '☐🍞'} 🧵${thrN()}/3` : ''}`;
    return h;
  }
  const tp = () => { const e = X(); const out = [['Берег Старика', () => OLDMAN.clone().add(new THREE.Vector3(-3, 0, -2))]]; if (e.sivka >= 1) out.push(['Терем царевны', () => DOOR.clone().add(new THREE.Vector3(0, 0, 0))]); return out; };
  const hpBonus = () => (X().fishEnd === 'kind' ? 1 : 0);
  let fishT = 0;
  function update(dt, canMove, luk) {
    const e = X(), T = c.T(), p = player;
    // конь
    if (p.ride) { HR.visible = luk; HR.position.copy(p.pos); HR.rotation.y = p.facing; hp.play(p.walk > 0.3 && canMove ? 'walk' : 'idle'); if (hp.actions?.walk) hp.actions.walk.timeScale = 1.6; }
    else if (luk && e.sivka >= 1) { HR.visible = !!e.horseAt || e.sivka >= 1; if (e.horseAt) HR.position.set(e.horseAt[0], H(e.horseAt[0], e.horseAt[1]), e.horseAt[1]); else if (e.sivka >= 1 && !HR.userData.placed) { HR.position.copy(HORSE_HOME); } HR.userData.placed = true; hp.play('idle'); }
    else if (!p.ride && e.sivka === 0) HR.visible = HR.visible && luk;
    for (const [id, o] of Object.entries(spools)) { o.spool.visible = e.frog === 1 && !e.thr[id]; o.spool.rotation.y += dt * 1.5; } // нитки видны только во время сказки о Царевне-лягушке
    if (!luk) return;
    // рыбка-подсказка: плеск у кромки, когда её можно звать
    fishT -= dt; if (e.fish && !e.fishEnd && e.want > e.wish && fishT < 0) { fishT = 2.5; c.burst(CALL.clone().setY(0.3), 0xffe14a, 8, 1.5, 0.8, 0.15); }
    if (gfish.visible) { gfish.rotation.z = Math.sin(T * 6) * 0.2; gfish.userData.tail.rotation.y = Math.sin(T * 10) * 0.5; }
    oldman.root.rotation.z = Math.sin(T * 1.1) * 0.02;
    // терем и царевна
    elena.root.visible = true; elena.play(near2(p.pos, DOOR, 9) ? 'interact-right' : 'idle');
    // болото
    arrow.visible = e.frog === 0 && c.nightTales().includes('Царевна-лягушка');
    frog.visible = e.frog === 1 || (e.frog === 0 && arrow.visible); if (frog.visible) { frog.position.y = H(frog.position.x, frog.position.z) + Math.abs(Math.sin(T * 2.2)) * 0.12; frog.rotation.y = Math.atan2(p.pos.x - frog.position.x, p.pos.z - frog.position.z); }
    if (e.frog >= 2) { tsar.root.visible = true; carpet.visible = true; carpet.position.y = H(carpet.position.x, carpet.position.z) + 0.9 + Math.sin(T * 1.5) * 0.15; carpet.rotation.z = Math.sin(T * 1.2) * 0.05; if (near2(p.pos, tsar.root.position, 8)) tsar.root.rotation.y = Math.atan2(p.pos.x - tsar.root.position.x, p.pos.z - tsar.root.position.z); }
    else if (!frog.visible) tsar.root.visible = false;
    for (const ch of [oldman, oldwoman]) if (near2(p.pos, ch.root.position, 6)) ch.root.rotation.y = Math.atan2(p.pos.x - ch.root.position.x, p.pos.z - ch.root.position.z);
  }
  function near2(a, b, r) { return Math.hypot(a.x - b.x, a.z - b.z) < r; }
  // нитки в уже загруженных краях
  for (const id of Object.keys(THR)) if (c.REGIONS[id]) onRegion(id, c.REGIONS[id]);
  return { objective, tracker, update, onRegion, tp, hpBonus, dismount, mount: () => mount(), homeVis, horse: () => HR, X };
}
