// Глава 5. Морское царство — «Садко» (былина), «Чудо-юдо Рыба-кит» (по мотивам П. П. Ершова), золотая рыбка (А. С. Пушкин).
// Подводный край: плавание (Пробел — гребок/всплыть), Русалка-проводник, грот с медузами-забудками, затонувший корабль,
// дворец Морского царя, гусли Садко (ритм-игра), босс — Рыба-кит; награда — живая вода для Ильи Муромца.
import { near, dist2, makeSky, arch, letterSprite, rng, ringFx } from './common.js';
export default function sea(ctx) {
  const { THREE, S, ui, toon, kit, npc, M, burst, player, colliders, interactables, hittables, wait } = ctx;
  const CX = 600, CZ = 600; const V = (x, z, y = 0) => new THREE.Vector3(x, y, z);
  const group = new THREE.Group(); group.name = 'sea'; const R = rng(5150);
  const SPAWN = V(CX + 2, CZ + 46), PAL = V(CX, CZ - 26), CORAL = V(CX + 30, CZ + 10), SHIP = V(CX - 30, CZ + 8), GROT = V(CX - 26, CZ - 30), KELP = V(CX + 18, CZ + 32), WHALE = V(CX + 28, CZ - 22), FIRE = V(CX - 6, CZ + 36);
  const TOP = 19; // поверхность воды
  const WA = 0.5; const wc = Math.cos(WA), ws = Math.sin(WA); // кит лежит наискосок
  const whaleLocal = (x, z) => { const dx = x - WHALE.x, dz = z - WHALE.z; return [dx * wc + dz * ws, -dx * ws + dz * wc]; };
  const whaleBump = (x, z) => { const [u, v] = whaleLocal(x, z); const q = 1 - (u / 15) ** 2 - (v / 5.6) ** 2; return q > 0 ? 6.2 * Math.sqrt(q) : 0; };
  const baseH = (x, z) => {
    const lx = x - CX, lz = z - CZ, r = Math.hypot(lx, lz);
    let h = 0.6 + 0.9 * Math.sin(lx * 0.07) * Math.cos(lz * 0.06) + 0.35 * Math.sin(lx * 0.21 + lz * 0.17) + ctx.smooth(46, 62, r) * 12;
    h -= 1.4 * Math.exp(-((x - WHALE.x) ** 2 + (z - WHALE.z) ** 2) / 260); // впадина кита
    h += 2.2 * Math.exp(-((x - PAL.x) ** 2 + (z - PAL.z) ** 2) / 120); // холм дворца
    return h;
  };
  const H = (x, z) => baseH(x, z) + whaleBump(x, z) * (whaleSolid ? 1 : 0);
  let whaleSolid = true;
  ctx.makeTerrain(CX, CZ, 170, 150, baseH, (x, z, y, c) => { const k = Math.sin(x * 0.3) * Math.cos(z * 0.27) * 0.05; const rg = Math.hypot(x - GROT.x, z - GROT.z); if (rg < 9) c.setRGB(0.32, 0.36, 0.42); else if (y > 6) c.setRGB(0.55 + k, 0.5 + k, 0.42); else c.setRGB(0.86 + k, 0.78 + k, 0.56 + k); }, group);
  // поверхность воды над головой, лучи света, пузыри
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(220, 220, 40, 40), new THREE.MeshBasicMaterial({ color: 0x8fdcff, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }));
  surf.rotation.x = -Math.PI / 2; surf.position.set(CX, TOP + 1.2, CZ); group.add(surf); const surfBase = Float32Array.from(surf.geometry.attributes.position.array);
  const rays = []; for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 2.6, TOP + 2, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xcff6ff, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); const a = R() * 6.28, r = 6 + R() * 40; m.position.set(CX + Math.cos(a) * r, (TOP + 2) / 2, CZ + Math.sin(a) * r); m.rotation.z = 0.12; group.add(m); rays.push(m); }
  const BN = 260, bGeo = new THREE.BufferGeometry(), bPos = new Float32Array(BN * 3); for (let i = 0; i < BN; i++) { bPos[i * 3] = CX + (R() - 0.5) * 110; bPos[i * 3 + 1] = R() * TOP; bPos[i * 3 + 2] = CZ + (R() - 0.5) * 110; }
  bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3)); const bubbles = new THREE.Points(bGeo, new THREE.PointsMaterial({ color: 0xeaffff, size: 0.18, transparent: true, opacity: 0.7, depthWrite: false })); bubbles.frustumCulled = false; group.add(bubbles);
  // водоросли и кораллы
  const kelpM = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0x2f9a5a, gradientMap: ctx.grad })), kelpM2 = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0x5ab04a, gradientMap: ctx.grad }));
  const kelps = [];
  const zones = [[SPAWN, 7], [PAL, 14], [CORAL, 7], [SHIP, 9], [GROT, 10], [WHALE, 17], [FIRE, 4]];
  const free = (x, z) => zones.every(([p, r]) => Math.hypot(x - p.x, z - p.z) > r);
  function kelp(x, z, hgt) { const k = new THREE.Group(); k.position.set(x, baseH(x, z) - 0.1, z); group.add(k); const n = Math.round(hgt / 0.9); let prev = k; for (let i = 0; i < n; i++) { const seg = new THREE.Group(); seg.position.y = i ? 0.9 : 0; prev.add(seg); const m = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.06), i % 2 ? kelpM : kelpM2); m.position.y = 0.45; seg.add(m); prev = seg; } k.userData.ph = R() * 6; kelps.push(k); return k; }
  for (let i = 0; i < 120; i++) { const a = R() * 6.28, r = 6 + Math.sqrt(R()) * 46; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (!free(x, z)) continue; kelp(x, z, 3 + R() * 6); }
  for (let i = 0; i < 26; i++) { const a = R() * 6.28, r = R() * 6; kelp(KELP.x + Math.cos(a) * r, KELP.z + Math.sin(a) * r, 6 + R() * 5); }
  const CCOL = [0xff6b8a, 0xffa04a, 0xc86bff, 0xffe14a, 0x4ad8c8];
  function coral(x, z, s = 1) { const g = new THREE.Group(); g.position.set(x, baseH(x, z), z); group.add(g); const m = ctx.lifeify(new THREE.MeshToonMaterial({ color: CCOL[Math.floor(R() * 5)], gradientMap: ctx.grad }));
    const kind = Math.floor(R() * 3);
    if (kind === 0) for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * s, 0.14 * s, 1.4 * s, 6), m); b.position.set((R() - 0.5) * 0.6 * s, 0.6 * s, (R() - 0.5) * 0.6 * s); b.rotation.set((R() - 0.5) * 0.9, 0, (R() - 0.5) * 0.9); g.add(b); }
    else if (kind === 1) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.7 * s, 10, 8), m); b.scale.y = 0.6; b.position.y = 0.3 * s; g.add(b); }
    else for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.ConeGeometry(0.25 * s, 1.6 * s, 6), m); b.position.set((i - 1) * 0.35 * s, 0.8 * s, 0); b.rotation.z = (i - 1) * 0.35; g.add(b); }
    return g; }
  for (let i = 0; i < 70; i++) { const a = R() * 6.28, r = 5 + Math.sqrt(R()) * 44; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (!free(x, z)) continue; coral(x, z, 0.8 + R() * 0.8); }
  for (let i = 0; i < 22; i++) { const a = R() * 6.28, r = 2.5 + R() * 6; coral(CORAL.x + Math.cos(a) * r, CORAL.z + Math.sin(a) * r, 1 + R()); }
  for (let i = 0; i < 26; i++) { const a = R() * 6.28, r = 8 + R() * 44; const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (!free(x, z)) continue; ctx.P(i % 2 ? 'rock_largeA' : 'rock_smallA', x, z, 2 + R() * 2, R() * 6, -0.2, group, baseH); }
  // рыбки
  const fishes = []; const FCOL = [0xffb03a, 0x6ad0ff, 0xff7ab0, 0xfff07a];
  for (let s = 0; s < 7; s++) { const sch = new THREE.Group(); group.add(sch); const col = FCOL[s % 4]; const fm = ctx.lifeify(new THREE.MeshToonMaterial({ color: col, gradientMap: ctx.grad }));
    for (let i = 0; i < 7; i++) { const f = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), fm); b.scale.set(0.5, 0.8, 1.3); f.add(b); const t = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 4), fm); t.rotation.x = -Math.PI / 2; t.position.z = -0.35; t.scale.x = 0.3; f.add(t); f.position.set((R() - 0.5) * 3, (R() - 0.5) * 1.5, (R() - 0.5) * 3); sch.add(f); }
    fishes.push({ g: sch, a: R() * 6, r: 10 + R() * 30, y: 3 + R() * 10, sp: 0.12 + R() * 0.1 }); }
  // ===== дворец Морского царя =====
  const pearl = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0xe8f4ff, gradientMap: ctx.grad, emissive: 0x10304a })), pearl2 = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0x7fd8d0, gradientMap: ctx.grad, emissive: 0x0a2a30 }));
  const tintP = (o, m = pearl) => { o.traverse((q) => { if (q.isMesh) q.material = m; }); return o; };
  [[-9, 2, 'castle/tower-hexagon-base'], [9, 2, 'castle/tower-hexagon-base'], [0, -3, 'castle/tower-square']].forEach(([dx, dz, n]) => {
    const x = PAL.x + dx, z = PAL.z + dz; const y = baseH(x, z) - 0.2; const s = 4.4;
    const b = tintP(kit(n, x, z, s, 0, -0.2, group, baseH)); const mid = tintP(kit(n === 'castle/tower-square' ? 'castle/tower-square-mid' : 'castle/tower-hexagon-mid', x, z, s, 0, 0, group, () => y + 1.31 * s), pearl2);
    tintP(kit(n === 'castle/tower-square' ? 'castle/tower-square-top-roof-high' : 'castle/tower-hexagon-roof', x, z, s, 0, 0, group, () => y + 1.31 * s + (n === 'castle/tower-square' ? 1.01 : 0.46) * s));
    colliders.push({ x, z, r: 2.5 }); ctx.camBlockers.push(b, mid);
  });
  for (const dx of [-4.6, 4.6]) { tintP(kit('castle/wall', PAL.x + dx, PAL.z + 2.5, 3.8, 0, -0.2, group, baseH)); colliders.push({ x: PAL.x + dx, z: PAL.z + 2.5, r: 2, h: 6 }); }
  tintP(kit('castle/gate', PAL.x, PAL.z + 3.4, 3.8, Math.PI / 2, -0.2, group, baseH), pearl2);
  const shellM = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0xffc8d8, gradientMap: ctx.grad, emissive: 0x2a1018 }));
  const throne = new THREE.Group(); throne.position.set(PAL.x, baseH(PAL.x, PAL.z + 7), PAL.z + 7); group.add(throne);
  { const sh = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 8, 0, Math.PI, 0, Math.PI / 2), shellM); sh.rotation.x = -Math.PI / 2; sh.rotation.z = Math.PI; sh.position.set(0, 0.1, -0.8); sh.scale.set(1, 1, 1.4); throne.add(sh); M(new THREE.CylinderGeometry(0.9, 1, 0.7, 14), pearl2, 0, 0.35, 0, throne); }
  // ===== затонувший корабль =====
  const ship = new THREE.Group(); ship.position.set(SHIP.x, baseH(SHIP.x, SHIP.z) + 0.4, SHIP.z); ship.rotation.set(0.12, 0.8, 0.22); group.add(ship);
  { const wd = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0x6a4a2e, gradientMap: ctx.grad })), wd2 = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0x8a6440, gradientMap: ctx.grad })), sail = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0xd8ccb0, gradientMap: ctx.grad, side: THREE.DoubleSide }));
    M(new THREE.BoxGeometry(3.6, 1.6, 10), wd, 0, 0.8, 0, ship); M(new THREE.BoxGeometry(3.8, 0.2, 10.2), wd2, 0, 1.7, 0, ship);
    const bow = M(new THREE.ConeGeometry(1.9, 3, 4), wd, 0, 0.9, 6.3, ship); bow.rotation.x = Math.PI / 2; bow.scale.set(1, 1, 0.5);
    for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.2, 1, 10), wd2, s * 1.85, 2.2, 0, ship);
    const mast = M(new THREE.CylinderGeometry(0.18, 0.22, 7, 8), wd2, 0, 5, 0.5, ship); mast.rotation.z = 0.5;
    const sl = M(new THREE.PlaneGeometry(3, 2.6), sail, -1.3, 5.6, 0.5, ship); sl.rotation.z = 0.5; sl.rotation.y = 0.2;
    M(new THREE.BoxGeometry(2.4, 1.6, 0.2), new THREE.MeshBasicMaterial({ color: 0x1a1410 }), 0, 1, -5.05, ship); }
  colliders.push({ x: SHIP.x, z: SHIP.z, r: 3, h: 3 }); { const a = 0.8; for (const k of [-3.2, 3.2]) colliders.push({ x: SHIP.x + Math.sin(a) * k, z: SHIP.z + Math.cos(a) * k, r: 2.2, h: 3 }); }
  const CHEST = V(SHIP.x - Math.sin(0.8) * 7.2, SHIP.z - Math.cos(0.8) * 7.2); CHEST.y = baseH(CHEST.x, CHEST.z);
  const chest = kit('survival/chest', CHEST.x, CHEST.z, 2.2, 0.8 + Math.PI, 0, group, baseH);
  // ===== тёмный грот =====
  const grot = new THREE.Group(); grot.position.set(GROT.x, baseH(GROT.x, GROT.z), GROT.z); group.add(grot);
  const rockM = ctx.lifeify(new THREE.MeshToonMaterial({ color: 0x4a5560, gradientMap: ctx.grad }));
  for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a - 0.9), Math.cos(a - 0.9))) < 0.42) continue; const r = 8.2; const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(2 + (i % 3) * 0.5, 0), rockM); rk.position.set(Math.cos(a) * r, 1.6 + (i % 2) * 1.2, Math.sin(a) * r); rk.scale.y = 1.8; rk.rotation.set(i, i * 2, 0); grot.add(rk); colliders.push({ x: GROT.x + Math.cos(a) * r, z: GROT.z + Math.sin(a) * r, r: 2, h: 5.5 + baseH(GROT.x, GROT.z) }); }
  for (const s of [-1, 1]) { const a = 0.9 + s * 0.5; const p = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.4, 8, 7), rockM); p.position.set(Math.cos(a) * 8.6, 4, Math.sin(a) * 8.6); grot.add(p); }
  { const a = 0.9; const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 8), rockM); lintel.position.set(Math.cos(a) * 8.6, 8.2, Math.sin(a) * 8.6); lintel.rotation.y = -a; grot.add(lintel); }
  const anem = []; for (let i = 0; i < 9; i++) { const a = R() * 6.28, r = 2 + R() * 4.5; const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: [0x7affd8, 0xff7ad8, 0xb07aff][i % 3] })); m.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r); grot.add(m); anem.push(m); }
  const grotL = new THREE.PointLight(0x7affd8, 8, 16); grotL.position.set(0, 3, 0); grot.add(grotL);
  // ===== коралловый сад: сеть с золотой рыбкой =====
  const netG = new THREE.Group(); netG.position.set(CORAL.x, baseH(CORAL.x, CORAL.z) + 2.4, CORAL.z); group.add(netG);
  { const nm = new THREE.MeshBasicMaterial({ color: 0x9aa0a8, wireframe: true, transparent: true, opacity: 0.8 }); const n = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 8), nm); netG.add(n); netG.userData.net = n;
    for (const s of [-1, 1]) { const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 4), toon(0x8a7a5a)); rope.position.set(s * 1.4, -1.2, 0); rope.rotation.z = s * 0.4; netG.add(rope); } }
  const gfish = ctx.makePike(); gfish.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.color.set(0xffc23a); if (o.material.emissive) o.material.emissive.set(0x553300); } }); gfish.scale.setScalar(0.65); gfish.position.y = -0.3; netG.add(gfish);
  // ===== Рыба-кит =====
  const whale = new THREE.Group(); whale.position.set(WHALE.x, baseH(WHALE.x, WHALE.z) - 0.6, WHALE.z); whale.rotation.y = -WA + Math.PI / 2; group.add(whale);
  const wMat = new THREE.MeshToonMaterial({ color: 0x4a6a8a, gradientMap: ctx.grad, emissive: 0x000000 }), wBelly = toon(0xc8d8e0);
  { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), wMat); b.scale.set(5.6, 6.4, 15.2); whale.add(b); const bl = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), wBelly); bl.scale.set(5, 3.6, 13.6); bl.position.y = -1.6; whale.add(bl);
    const tail = new THREE.Group(); tail.position.z = -14.5; whale.add(tail); const fl = new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 2.6), wMat); fl.position.set(0, 1.2, -1.4); tail.add(fl); whale.userData.tail = tail;
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); e.position.set(s * 4.6, 1.6, 10.2); whale.add(e); const pu = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshBasicMaterial({ color: 0x101820 })); pu.position.set(s * 4.95, 1.6, 10.35); whale.add(pu); whale.userData['eye' + s] = e; }
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.18, 6, 24, Math.PI * 0.8), new THREE.MeshBasicMaterial({ color: 0x1a2a3a })); mouth.rotation.set(0, Math.PI / 2, Math.PI + 0.3); mouth.position.set(0, -0.6, 11.4); whale.add(mouth);
    // деревушка на спине кита (как у Ершова)
    for (const [x, z] of [[-1.5, 2], [1.6, -3], [0, -7]]) { const y = Math.sqrt(Math.max(0, 1 - (x / 5.6) ** 2 - (z / 15.2) ** 2)) * 6.4; const hut = new THREE.Group(); hut.position.set(x, y - 0.3, z); whale.add(hut); M(new THREE.BoxGeometry(1.2, 0.9, 1), toon(0xa8743e), 0, 0.45, 0, hut); const rf = M(new THREE.ConeGeometry(0.95, 0.7, 4), toon(0x8a3a2a), 0, 1.25, 0, hut); rf.rotation.y = Math.PI / 4; }
    for (let i = 0; i < 10; i++) { const x = (R() - 0.5) * 6, z = (R() - 0.5) * 20; const y = Math.sqrt(Math.max(0, 1 - (x / 5.6) ** 2 - (z / 15.2) ** 2)) * 6.4; if (y < 2) continue; const t = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.4, 6), kelpM2); t.position.set(x, y + 0.5, z); whale.add(t); } }
  const wl = (lx, lz) => { const v = new THREE.Vector3(lx, 0, lz).applyAxisAngle(new THREE.Vector3(0, 1, 0), whale.rotation.y).add(whale.position); v.y = H(v.x, v.z); return v; };
  // ===== жители =====
  const king = npc('seaking', { scale: 0.86 }); king.root.position.copy(throne.position).add(V(0, 0, 0.7)); group.add(king.root);
  const sadko = npc('sadko'); sadko.root.position.set(PAL.x + 3, baseH(PAL.x + 3, PAL.z + 9.5), PAL.z + 9.5); sadko.root.rotation.y = -0.6; group.add(sadko.root); sadko.play('sit');
  const mer = ctx.makeMermaid(); mer.rotation.order = 'YXZ'; mer.scale.setScalar(1.3); group.add(mer); ctx.outline(mer); mer.position.copy(SPAWN).add(V(-3, -2, 2.4));
  colliders.push({ x: throne.position.x, z: throne.position.z, r: 1.4 });
  // струны-нити гуслей
  const strings = [0, 1, 2].map((i) => { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 6, 24), new THREE.MeshBasicMaterial({ color: 0xffe27a })); g.add(t); const t2 = t.clone(); t2.rotation.y = Math.PI / 2; g.add(t2); const gl = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(gl); group.add(g); g.visible = false; return g; });
  const SPOT = [GROT.clone(), CHEST.clone().add(V(0, 0, 1.6)), KELP.clone()]; SPOT.forEach((p, i) => { strings[i].position.set(p.x, baseH(p.x, p.z) + 1.4, p.z); });
  const fire = (() => { // подводный «костёр» — тёплый гейзер с пузырями
    const y = baseH(FIRE.x, FIRE.z); kit('holiday/rocks-medium', FIRE.x, FIRE.z, 1.4, 0, -0.1, group, baseH); const L = new THREE.PointLight(0xffd08a, 10, 10); L.position.set(FIRE.x, y + 1.2, FIRE.z); group.add(L);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff0b0 })); glow.position.set(FIRE.x, y + 0.6, FIRE.z); group.add(glow); let acc = 0; const pos = V(FIRE.x, FIRE.z, y);
    return { update(dt, T) { glow.scale.setScalar(1 + Math.sin(T * 5) * 0.1); if (Math.random() < dt * 8) burst(pos.clone().setY(y + 0.8), 0xeaffff, 2, 1.5, 1.2, 0.14); if (near(player.pos, pos, 4) && player.pos.y < y + 5) { player.word = Math.min(100, player.word + dt * 30); acc += dt; if (acc > 1.5) { acc = 0; player.hp = Math.min(player.maxHp, player.hp + 1); } } } };
  })();
  const homeArch = arch(ctx, group, SPAWN.x + 7, SPAWN.z + 2, baseH, -0.3, 0x3aa0d8); const HOME = V(SPAWN.x + 7, SPAWN.z + 2);
  interactables.push({ label: 'Вернуться в Лукоморье', pos: () => homeArch.position, r: 3.5, act: () => ctx.travel('luk', ctx.LUK_PORTAL_POS()) });
  const ring = ringFx(ctx, group, 0xcff6ff);
  // ===== состояние =====
  const st = () => { const s = ctx.st.sea; s.stage ??= 0; s.str ||= [false, false, false]; s.shells ||= [false, false, false]; return s; };
  const me = () => ctx.HERO_NAME[player.hero].split(' ')[0];
  const MR = 'Русалка', KG = 'Морской царь', SD = 'Садко', GF = 'Золотая рыбка', WH = 'Чудо-юдо Рыба-кит';
  // медузы-забудки
  function jellyModel() { const g = new THREE.Group(); const mat = new THREE.MeshToonMaterial({ color: 0xb8a8d8, gradientMap: ctx.grad, transparent: true, opacity: 0.75, emissive: 0x000000 }); const d = new THREE.Mesh(new THREE.SphereGeometry(0.7, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat); g.add(d);
    const tm = new THREE.MeshBasicMaterial({ color: 0xd8c8ff, transparent: true, opacity: 0.6 }); const ts = []; for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.28; const t = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 1.3, 4), tm); t.position.set(Math.cos(a) * 0.4, -0.65, Math.sin(a) * 0.4); g.add(t); ts.push(t); }
    const e = new THREE.MeshBasicMaterial({ color: 0x20222a }); for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), e); m.position.set(s * 0.22, 0.25, 0.6); g.add(m); }
    g.userData.mat = mat; g.userData.ts = ts; return g; }
  const jellyCustom = (e, dt) => { const k = Math.sin(ctx.T() * 3 + e.ph); e.g.scale.set(1 + k * 0.08, 1 - k * 0.1, 1 + k * 0.08); e.g.userData.ts.forEach((t, i) => (t.rotation.x = Math.sin(ctx.T() * 4 + i) * 0.3)); };
  let jellies = [];
  function spawnJellies() { ctx.removeEnemies('jelly'); jellies = []; if (st().str[0]) return; for (let i = 0; i < 3; i++) { const a = i * 2.1; jellies.push(ctx.spawnEnemy(group, V(GROT.x + Math.cos(a) * 3.5, GROT.z + Math.sin(a) * 3.5), { model: jellyModel, hp: 3, group: 'jelly', name: 'Медуза-забудка', fly: 2.2 + i * 0.5, speed: 2.6, aggroR: 9, reach: 1.4, custom: jellyCustom, onDeath: () => { if (jellies.every((j) => !j.alive)) { strings[0].visible = true; ui.toast('Медузы уснули — в гроте блеснула золотая струна!', true, 3000); } } })); } }
  let whaleJ = [];
  function spawnWhaleJellies() { ctx.removeEnemies('wjelly'); whaleJ = []; for (let i = 0; i < 3; i++) { const p = wl((i - 1) * 7, 13); whaleJ.push(ctx.spawnEnemy(group, V(p.x, p.z), { model: jellyModel, hp: 2, group: 'wjelly', name: 'Медуза-забудка', fly: 3 + i, speed: 3, aggroR: 14, reach: 1.4, custom: jellyCustom })); } }
  // ракушки-забудки на спине кита
  const SHELLP = [[0, 4], [-1.5, -2.5], [1.2, -9]];
  const shells = SHELLP.map(([lx, lz], i) => { const g = new THREE.Group(); const m = new THREE.MeshToonMaterial({ color: 0x8a8a96, gradientMap: ctx.grad, emissive: 0x000000 }); const a = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), m); a.scale.y = 0.7; g.add(a); const b = a.clone(); b.rotation.x = Math.PI; b.position.y = 0.05; g.add(b);
    const e = new THREE.MeshBasicMaterial({ color: 0xbfa0ff }); for (const s of [-1, 1]) { const q = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), e); q.position.set(s * 0.25, 0.3, 0.68); g.add(q); }
    const p = wl(lx, lz); g.position.copy(p).setY(p.y + 0.3); group.add(g); g.userData.m = m; g.userData.hp = 3; return g; });
  shells.forEach((sh, i) => hittables.push({ pos: () => sh.position, r: 1.8, ry: 3, heavy: true, cond: () => ctx.region().id === 'sea' && sh.visible && st().stage === 4, onHit: (hero) => hitShell(i, hero === 'ilya' ? 2 : 1) }));
  function hitShell(i, dmg) { const sh = shells[i]; sh.userData.hp -= dmg; sh.userData.flash = 0.2; burst(sh.position.clone().setY(sh.position.y + 0.5), 0xd8c8ff, 14, 3, 0.6, 0.18); S.crack();
    if (sh.userData.hp <= 0) { sh.visible = false; st().shells[i] = true; ctx.save(); burst(sh.position.clone(), 0xffe27a, 40, 4, 1.2); const n = st().shells.filter(Boolean).length; ui.toast(`Ракушка-забудка рассыпалась! ${n}/3`, true, 2500); if (n === 3) { player.locked = true; whaleWakes().finally(() => (player.locked = false)); } } }
  // сундук и сеть
  let chestHits = 0, netHits = 0;
  hittables.push({ pos: () => CHEST.clone().setY(CHEST.y + 0.6), r: 2, ry: 3, cond: () => ctx.region().id === 'sea' && st().stage >= 2 && !st().str[1] && !strings[1].visible, onHit: () => { chestHits++; S.hit(); chest.rotation.z = 0.1 * (chestHits % 2 ? 1 : -1); if (chestHits >= 3) { strings[1].visible = true; S.chime(); burst(CHEST.clone().setY(CHEST.y + 1), 0xffe27a, 40, 3, 1); ui.toast('Сундук раскрылся — внутри золотая струна!', true, 2800); chest.rotation.x = -0.4; } else ui.toast('Сундук заржавел… ещё удар!', false, 1200); } });
  hittables.push({ pos: () => netG.position, r: 2.2, ry: 3.5, cond: () => ctx.region().id === 'sea' && !ctx.st.extra?.fish, onHit: (hero) => { netHits += hero === 'ilya' ? 2 : 1; S.hit(); netG.userData.net.scale.setScalar(1 - netHits * 0.08); burst(netG.position.clone(), 0xffe14a, 12, 2, 0.6, 0.15); if (netHits >= 3) { player.locked = true; freeFish().finally(() => (player.locked = false)); } else ui.toast('Сеть забудок трещит! Ещё!', false, 1200); } });
  async function freeFish() {
    netG.userData.net.visible = false; S.chime(); burst(netG.position.clone(), 0xffe14a, 60, 4, 1.4, 0.25);
    const e = (ctx.st.extra ||= {}); e.fish = 1; ctx.save();
    await ui.say(GF, ['Спасибо, добрый Сказитель! Забудки сплели сеть из серых снов — а ты её разорвал.', 'Есть на берегу Лукоморья старик со старухой. Старик меня когда-то отпустил и ничего не взял. Передай ему: приплыву на зов.']);
    ui.toast('🐟 Золотая рыбка свободна! Старик ждёт на восточном берегу Лукоморья', true, 4500);
  }
  // ===== диалоги =====
  async function merTalk() {
    const s = st();
    if (s.stage === 0) {
      await ui.say(MR, ['Вот оно — Морское царство! Видишь, какое серое… Раньше тут кораллы горели, как жар, а рыбы пели.', 'Под водой держи Пробел — всплывёшь, отпусти — опустишься. Тут тепло, не бойся.', 'Плыви за мной — к перламутровому дворцу Морского царя. Я покажу дорогу!']);
      s.stage = 1; ctx.save(); S.chime(); return;
    }
    const [, txt] = objective(); await ui.say(MR, [`Плыви ${txt}! Я рядом.`, ...(!ctx.st.extra?.fish ? ['А в коралловом саду, на востоке, кто-то бьётся в сети… Помоги!'] : [])]);
  }
  async function kingTalk() {
    const s = st();
    if (s.stage <= 1) {
      await ui.say(KG, ['Кто тут? Сухопутный? Ко мне во дворец?! (Морской царь хмурится, борода колышется)', 'Скучно мне, Сказитель. Забыл я, как море поёт. Был у меня гусляр — Садко из Новгорода, да гусли его онемели.', 'Спой мне — или ступай прочь!']);
      s.stage = 2; ctx.save(); return;
    }
    if (s.stage === 2 || s.stage === 3) { await ui.say(KG, ['Где мои песни? Почини Садковы гусли — тогда поговорим.']); return; }
    if (s.stage === 4) { await ui.say(KG, ['Пока Рыба-кит спит поперёк моря, волны не пляшут. Разбуди его — разбей ракушки-забудки у него на спине! А от его вздохов — всплывай повыше (держи Пробел).']); return; }
    if (s.stage === 5) { await reward(); return; }
    await ui.say(KG, ['Заходи в гости, Сказитель! Море помнит твою песню.']);
  }
  async function sadkoTalk() {
    const s = st(); const n = s.str.filter(Boolean).length;
    if (s.stage < 2) { await ui.say(SD, ['Я Садко, гусляр новгородский. Гощу у Морского царя… да вот загостился. Поговори с царём — он у трона.']); return; }
    if (s.stage === 2) {
      await ui.say(SD, ['Морскому царю играть надобно, а у гуслей три струны порвались — забудки утащили золотые нити!', 'Одна — в тёмном гроте у медуз, на северо-западе. Другая — в сундуке на затонувшем корабле. А третья спряталась в водорослях на юго-востоке — её видно лишь Сказительским взглядом (Q).']);
      s.stage = 3; ctx.save(); return;
    }
    if (s.stage === 3 && n < 3) { await ui.say(SD, [`Струн у меня ${n} из 3. ${!s.str[0] ? 'В гроте медузы… ' : ''}${!s.str[1] ? 'Сундук на корабле крепкий — бей сильнее. ' : ''}${!s.str[2] ? 'А в водорослях смотри взглядом (Q).' : ''}`]); return; }
    if (s.stage === 3) {
      await ui.say(SD, ['Все три струны! Натянем… Вот! Гусли звенят!', 'Сыграем царю вместе? Я веду, а ты подхватывай: где нота у черты — бей по струне. Только не громко — у царя пляска бурная, наверху корабли качает.']);
      for (let tries = 0; ; tries++) {
        const easy = tries >= 2; // после двух неудач — медленнее и прощает больше
        const r = await ui.rhythm('Гусли Садко — песня для Морского царя', { notes: easy ? 12 : 16, speed: easy ? 0.8 : 1.05, hint: 'чем чище — тем добрее море', onNote: (ln, ok) => { if (ok) S.pluck(293.66 * [1, 1.335, 1.68][ln] * (1 + 0.5 * (Math.random() < 0.3)), 0, 0.14, 1.6); else S.click(); } });
        if (r >= (easy ? 0.45 : 0.6)) { king.play('emote-yes'); break; }
        S.wrong(); const k = await ui.dialog(SD, `Сбились (${Math.round(r * 100)}%)… Царь зевает. Ещё раз?${tries >= 1 ? ' Сыграю помедленнее.' : ''}`, ['Играем снова', 'Потом']); if (k !== 0) return;
      }
      await ui.say(KG, ['(Морской царь пускается в пляс! Кораллы вспыхивают, рыбы поют, вода светлеет…)', 'Вспомнил! Вспомнил, как море поёт! Ай да Садко, ай да Сказитель!']);
      ctx.addBook('Садко', 'Гусляр Садко из Новгорода гостил у Морского царя, да гусли его онемели: забудки утащили три золотые струны. Сказитель нашёл их в тёмном гроте, в сундуке затонувшего корабля и в водорослях — и вместе с Садко сыграл царю. Морской царь пустился в пляс и вспомнил, как поёт море.');
      await ui.say(KG, ['Да только волны мои не пляшут: поперёк моря лежит Чудо-юдо Рыба-кит. Тридцать кораблей проглотил, забудками оброс — и всё забыл.', 'Разбей три ракушки-забудки у него на спине — он и проснётся. А как вздохнёт — всплывай повыше, чтоб волной не задело!']);
      s.stage = 4; ctx.save(); spawnWhaleJellies(); S.setTheme('boss'); ui.toast('🐋 Плыви к Рыбе-киту на северо-востоке! Разбей 3 ракушки на его спине', true, 4500); return;
    }
    await ui.say(SD, s.stage >= 6 ? ['Домой, в Новгород! Буду петь про тебя на всех пирах, Сказитель.'] : ['Иди к Рыбе-киту, я тут подыграю для храбрости!']);
  }
  async function whaleWakes() {
    const s = st(); ctx.removeEnemies('wjelly'); S.setTheme('sea');
    for (let i = 0; i < 20; i++) { whale.position.y += 0.03; await wait(30); } burst(wl(0, 13).setY(whale.position.y + 4), 0xcff6ff, 80, 6, 1.6, 0.25); S.stomp();
    await ui.say(WH, ['Ох-хо-хо… Что это? Вода светлая… Ракушки серые с меня спали — и в голове прояснилось!', 'Я ведь Чудо-юдо Рыба-кит. Это я тридцать кораблей проглотил… Забыл, зачем. Стыдно-то как!', 'Плывите, кораблики, домой!']);
    for (let k = 0; k < 3; k++) { const sh = boats[k]; sh.visible = true; sh.position.copy(wl(0, 15)).setY(whale.position.y + 2); sh.userData.v = new THREE.Vector3((k - 1) * 1.5, 2.6, 2 + k * 0.4).applyAxisAngle(new THREE.Vector3(0, 1, 0), whale.rotation.y); }
    S.chime(); await wait(1500);
    await ui.say(WH, ['А тебе, Сказитель, — заветное слово. На краю моря есть остров. На нём камень Алатырь, бел-горюч, а за ним — все дороги сказок. Зовут тот остров — «Буян».']);
    ctx.addWord('Буян', 'чудесный остров посреди моря-Окияна, где лежит камень Алатырь. Слово подарил Рыба-кит, когда вспомнил себя.');
    ctx.addBook('Чудо-юдо Рыба-кит', 'Поперёк моря лежал Чудо-юдо Рыба-кит: проглотил тридцать кораблей и оброс ракушками-забудками. Сказитель разбил три ракушки, уворачиваясь от китовых вздохов, — и кит проснулся, вспомнил себя и отпустил корабли домой. (По мотивам «Конька-Горбунка» П. П. Ершова.)');
    s.stage = 5; ctx.save(); ui.toast('Вернись к Морскому царю — он ждёт с наградой', false, 4000);
  }
  async function reward() {
    const s = st();
    await ui.say(KG, ['Корабли плывут, волны пляшут, кит поёт! Проси, чего хочешь, Сказитель.']);
    const k = await ui.dialog(KG, 'Сундук жемчуга? Терем из янтаря? Или…', ['Отпусти Садко домой, в Новгород', 'Мне бы сундук жемчуга!']);
    if (k === 1) await ui.say(KG, ['Ха! Жемчуга у тебя и так — целая Книга Сказов. А Садко я отпущу и без просьбы: ты меня научил, что гостей не держат силой.']);
    else await ui.say(KG, ['Доброе сердце: просишь не для себя. Отпускаю Садко!']);
    await ui.say(KG, ['А тебе — подарок со дна морского: фляга живой воды. Капля — и сил прибавится, а кто сиднем сидел — тот встанет.', 'Говорят, на реке Смородине, у Калинова моста, богатырь тридцать лет и три года сиднем сидит… Не ему ли она нужна?']);
    s.water = true; s.stage = 6; s.done = true; ctx.save(); S.fanfare(); S.restore(); player.hp = player.maxHp;
    await ui.say(SD, ['Спасибо, Сказитель! Поплыву домой — буду про тебя былину петь.']);
    ui.toast('💧 Живая вода! Портал Лукоморья открыл дорогу к Калинову мосту', true, 5000);
  }
  const boats = [0, 1, 2].map(() => { const g = new THREE.Group(); const wd = toon(0x8a6440); M(new THREE.BoxGeometry(1.2, 0.6, 3), wd, 0, 0, 0, g); const m = M(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), wd, 0, 1.2, 0, g); M(new THREE.PlaneGeometry(1.2, 1), toon(0xf4ecd8, { side: THREE.DoubleSide }), 0, 1.4, 0.05, g); g.visible = false; group.add(g); return g; });
  interactables.push(
    { label: 'Поговорить с Русалкой', pos: () => mer.position, r: 4, act: merTalk },
    { label: 'Поговорить с Морским царём', pos: () => king.root.position, r: 4, act: kingTalk },
    { label: 'Поговорить с Садко', pos: () => sadko.root.position, r: 3.6, act: sadkoTalk },
    ...strings.map((g, i) => ({ label: 'Взять золотую струну', pos: () => g.position, r: 2.4, prio: 2, cond: () => g.visible && (i !== 2 || player.sight), act: async () => { st().str[i] = true; ctx.save(); g.visible = false; S.chime(); burst(g.position.clone(), 0xffe27a, 40, 3, 1); ui.toast(`🎵 Золотая струна ${st().str.filter(Boolean).length}/3`, true); } })),
  );
  // ===== цель, трекер, жизнь =====
  function objective() {
    const s = st();
    if (s.stage === 0) return [mer.position, 'к Русалке — она проводит'];
    if (s.stage === 1) return [king.root.position, 'к дворцу Морского царя (на север)'];
    if (s.stage === 2) return [sadko.root.position, 'к Садко у трона'];
    if (s.stage === 3) { if (!s.str[0]) return [GROT, jellies.some((j) => j.alive) ? 'в тёмный грот — усыпи медуз-забудок' : 'в грот — возьми струну']; if (!s.str[1]) return [CHEST, 'на затонувший корабль — разбей сундук']; if (!s.str[2]) return [KELP, 'в водоросли — струну видно только взглядом (Q)']; return [sadko.root.position, 'к Садко — играть на гуслях!']; }
    if (s.stage === 4) { const i = s.shells.findIndex((b) => !b); return [i >= 0 ? shells[i].position : WHALE, 'на спину Рыбы-кита — разбей ракушки (всплывай от вздохов!)']; }
    if (s.stage === 5) return [king.root.position, 'к Морскому царю за наградой'];
    if (!ctx.st.extra?.fish) return [netG.position, 'в коралловый сад — помоги золотой рыбке'];
    return [HOME, ctx.st.bridge?.done ? 'домой через арку — Тридевятое ждёт новых сказок' : 'домой через арку — к Калинову мосту'];
  }
  function tracker() {
    const s = st(); const ck = (b) => (b ? '☑' : '☐'); const fish = `<br>${ck(ctx.st.extra?.fish)} 🐟 Золотая рыбка в сетях`;
    if (s.stage <= 1) return '<b>🐚 Морское царство</b><br>• Плыви к дворцу Морского царя<br><i style="opacity:.8">Пробел (держи) — всплыть</i>' + fish;
    if (s.stage <= 3) return `<b>🎵 Садко</b><br>${ck(s.str[0])} Струна в гроте (медузы)<br>${ck(s.str[1])} Струна в сундуке корабля<br>${ck(s.str[2])} Струна в водорослях (Q)<br>${ck(false)} Сыграть царю на гуслях` + fish;
    if (s.stage === 4) return `<b>🐋 Чудо-юдо Рыба-кит</b><br>${s.shells.map((b, i) => `${ck(b)} Ракушка-забудка ${i + 1}`).join('<br>')}<br><i style="opacity:.8">Кит вздыхает — всплывай (держи Пробел)</i>` + fish;
    if (s.stage === 5) return '<b>🐚 Морское царство</b><br>• Вернись к Морскому царю' + fish;
    return '<b>🐚 Морское царство поёт</b><br>☑ Садко свободен<br>☑ Живая вода' + fish;
  }
  function life() { const s = st(); if (s.done) return 1; return [0.3, 0.34, 0.38, 0.42 + s.str.filter(Boolean).length * 0.06, 0.62 + s.shells.filter(Boolean).length * 0.08, 0.95][s.stage] ?? 1; }
  // ===== обновление =====
  let breathT = 6, warned = false;
  function update(dt, canMove) {
    const T = ctx.T(), s = st(); fire.update(dt, T); ring.update(dt); group.children.forEach((c) => c.userData.update && c.userData.update(dt));
    kelps.forEach((k) => { let o = k.children[0], i = 0; while (o) { o.rotation.z = Math.sin(T * 1.2 + k.userData.ph + i * 0.6) * 0.12; o.rotation.x = Math.cos(T * 0.9 + k.userData.ph + i * 0.4) * 0.08; o = o.children[1]; i++; } });
    const bp = bGeo.attributes.position; for (let i = 0; i < BN; i++) { let y = bp.getY(i) + dt * (0.8 + (i % 5) * 0.25); if (y > TOP) y = baseH(bp.getX(i), bp.getZ(i)); bp.setY(i, y); bp.setX(i, bp.getX(i) + Math.sin(T * 2 + i) * dt * 0.2); } bp.needsUpdate = true;
    const sp = surf.geometry.attributes.position; for (let i = 0; i < sp.count; i++) { const x = surfBase[i * 3], y = surfBase[i * 3 + 1]; sp.setZ(i, Math.sin(x * 0.15 + T) * 0.4 + Math.cos(y * 0.12 + T * 0.8) * 0.4); } sp.needsUpdate = true;
    rays.forEach((r, i) => (r.material.opacity = 0.04 + 0.04 * Math.sin(T * 0.7 + i) * ctx.life()));
    fishes.forEach((f) => { f.a += dt * f.sp; f.g.position.set(CX + Math.cos(f.a) * f.r, f.y + Math.sin(f.a * 3) * 0.8, CZ + Math.sin(f.a) * f.r); f.g.rotation.y = -f.a; f.g.children.forEach((c, i) => (c.children[1].rotation.y = Math.sin(T * 12 + i) * 0.4)); });
    anem.forEach((a, i) => a.scale.setScalar(1 + Math.sin(T * 2 + i) * 0.2));
    strings.forEach((g, i) => { if (!g.visible) return; g.rotation.y += dt * 2; g.position.y = baseH(g.position.x, g.position.z) + 1.4 + Math.sin(T * 2 + i) * 0.2; g.children.forEach((c) => (c.visible = i !== 2 || player.sight)); });
    if (!s.str[0] && !jellies.some((j) => j.alive) && jellies.length) strings[0].visible = true;
    if (s.str[0]) strings[0].visible = false; if (s.str[1]) strings[1].visible = false; strings[2].visible = !s.str[2] && s.stage >= 3;
    // золотая рыбка в сети
    if (!ctx.st.extra?.fish) { gfish.rotation.z = Math.sin(T * 7) * 0.4; gfish.userData.tail.rotation.y = Math.sin(T * 12) * 0.6; } else { netG.visible = true; netG.userData.net.visible = false; gfish.position.set(Math.cos(T * 0.8) * 2.5, Math.sin(T * 1.3) * 0.6, Math.sin(T * 0.8) * 2.5); gfish.rotation.y = -T * 0.8; }
    // Русалка-проводник: плывёт чуть впереди к цели
    { const [op] = objective(); const p = player.pos; let tgt;
      if (s.stage === 0) tgt = SPAWN.clone().add(V(-3, -2, 2.6)); else { const d = V(op.x - p.x, op.z - p.z); const far = d.length() > 9; d.normalize(); tgt = p.clone().addScaledVector(far ? d : V(1, 0.5), far ? 4.5 : 2.6); tgt.y = Math.max(baseH(tgt.x, tgt.z) + 1.5, p.y + 1.6); }
      const prev = mer.position.clone(); mer.position.lerp(tgt, Math.min(1, dt * 1.6)); const mv = mer.position.clone().sub(prev); if (mv.lengthSq() > 1e-5) mer.rotation.y = Math.atan2(mv.x, mv.z);
      mer.rotation.x = mv.length() > dt * 0.8 ? 0.9 : 0.1; mer.userData.tail.rotation.x = Math.sin(T * 4) * 0.35; }
    // царь, Садко
    if (near(player.pos, king.root.position, 9)) { const d = player.pos.clone().sub(king.root.position); king.root.rotation.y = Math.atan2(d.x, d.z); } else king.root.rotation.y = 0;
    if (s.stage >= 5) { king.play('emote-yes'); king.root.position.y = throne.position.y + 0.7 + Math.abs(Math.sin(T * 3)) * 0.15; } else if (!ui.busy()) king.play('idle');
    if (s.stage >= 6) { sadko.root.position.y = baseH(sadko.root.position.x, sadko.root.position.z); sadko.play('idle'); }
    // кит
    whale.userData.tail.rotation.x = Math.sin(T * (s.stage >= 5 ? 1.6 : 0.4)) * (s.stage >= 5 ? 0.35 : 0.08); whale.scale.y = 1 + Math.sin(T * 0.8) * 0.015;
    wMat.color.setHex(s.stage >= 5 ? 0x3a7ac8 : 0x4a6a8a);
    shells.forEach((sh, i) => { sh.visible = !s.shells[i]; const u = sh.userData; u.flash = Math.max(0, (u.flash || 0) - dt); u.m.emissive.setHex(u.flash > 0 ? 0xffffff : player.sight ? 0x806010 : 0x000000); sh.rotation.y = Math.sin(T * 2 + i) * 0.3; sh.children[0].rotation.x = -Math.abs(Math.sin(T * 3 + i)) * 0.4; });
    if (s.stage === 4 && canMove) {
      breathT -= dt; const wtop = whale.position.y + 6.4;
      if (breathT < 1.6 && !warned) { warned = true; ui.toast('🐋 Рыба-кит набирает воду… Всплывай повыше! (держи Пробел)', false, 1600); S.noise(0, 1.2, 400, 0.12); }
      if (breathT < 0) { breathT = 5.5 + Math.random() * 2; warned = false; ring.fire(V(WHALE.x, WHALE.z, wtop - 1), 18); S.stomp(); ctx.shake(0.3); burst(wl(0, 3).setY(wtop + 1), 0xcff6ff, 60, 8, 1.2, 0.25);
        const d = Math.hypot(player.pos.x - WHALE.x, player.pos.z - WHALE.z); if (d < 19 && player.pos.y < wtop + 2.5) { ctx.hurtPlayer(1, 'Волна от китового вздоха! Всплывай выше!'); const k = V(player.pos.x - WHALE.x, player.pos.z - WHALE.z).normalize(); player.pos.x += k.x * 4; player.pos.z += k.z * 4; player.vy = 4; } }
    }
    boats.forEach((b) => { if (!b.visible || !b.userData.v) return; b.position.addScaledVector(b.userData.v, dt); b.rotation.y = Math.atan2(b.userData.v.x, b.userData.v.z); if (b.position.y > TOP + 1) { b.userData.v.y = 0; b.position.y = TOP + 1 + Math.sin(T * 2) * 0.2; } if (Math.hypot(b.position.x - CX, b.position.z - CZ) > 70) b.visible = false; });
  }
  function surface() { return 'sand'; }
  function init() { const s = st(); spawnJellies(); if (s.stage === 4) spawnWhaleJellies(); if (ctx.st.extra?.fish) netG.userData.net.visible = false; if (s.str[1]) chest.rotation.x = -0.4; if (s.stage >= 5) whale.position.y += 0.6; }
  function onSleep() { const s = st(); spawnJellies(); if (s.stage === 4) spawnWhaleJellies(); }
  function onEnter() { const s = st(); if (s.stage === 4) S.setTheme('boss'); if (s.stage === 0) setTimeout(() => ui.toast('Пузырьки щекочут нос… Держи Пробел — всплывёшь, отпусти — опустишься.', false, 4500), 2600); }
  const TP = [['Вход', () => SPAWN.clone()], ['Дворец Морского царя', () => PAL.clone().add(V(0, 12))], ['Коралловый сад', () => CORAL.clone().add(V(-4, 4))], ['Затонувший корабль', () => SHIP.clone().add(V(5, 5))], ['Тёмный грот', () => GROT.clone().add(V(10, 8))], ['Рыба-кит', () => WHALE.clone().add(V(-10, 14))]];
  return {
    id: 'sea', name: '🐚 Морское царство', center: new THREE.Vector2(CX, CZ), radius: 56, H, group, music: 'sea', water: false, swim: true, swimTop: TOP,
    sky: { topLive: new THREE.Color(0x1a6aa8), botLive: new THREE.Color(0x3fa8c8), topGray: new THREE.Color(0x3a4a58), botGray: new THREE.Color(0x5a6a74), topSight: new THREE.Color(0x2a1850), botSight: new THREE.Color(0x5a4a8a) }, sun: 1.7, fogNear: 12, fogFar: 85, amb: { wind: 0, water: 0.12 },
    mm: { bg: [20, 60, 110], land: [200, 180, 130] }, mmDraw: (c, X, Z, k, g) => { c.fillStyle = g([90, 96, 100], [70, 110, 160]); c.save(); c.translate(X(WHALE.x), Z(WHALE.z)); c.rotate(WA); c.beginPath(); c.ellipse(0, 0, 15 * k, 5.6 * k, 0, 0, 7); c.fill(); c.restore(); c.fillStyle = g([80, 84, 90], [60, 66, 80]); c.beginPath(); c.arc(X(GROT.x), Z(GROT.z), 8 * k, 0, 7); c.fill(); },
    icons: () => [['🏰', PAL.x, PAL.z], ['🧜', mer.position.x, mer.position.z], ['🪸', CORAL.x, CORAL.z], ['⛵', SHIP.x, SHIP.z], ['🕳', GROT.x, GROT.z], ['🌿', KELP.x, KELP.z], ['🐋', WHALE.x, WHALE.z], ['🌀', HOME.x, HOME.z]],
    life, spawn: () => SPAWN.clone(), surface, tp: TP, objective, tracker, update, init, onEnter, onSleep,
  };
}
