// Общие помощники для глав-островов Тридевятого царства
export const v3 = (THREE, x, y, z) => new THREE.Vector3(x, y, z);
export const near = (p, q, r) => Math.hypot(p.x - q.x, p.z - q.z) < r;
export const dist2 = (p, q) => Math.hypot(p.x - q.x, p.z - q.z);
export function makeSky(THREE, top, bot) {
  return { topLive: new THREE.Color(top), botLive: new THREE.Color(bot), topGray: new THREE.Color(0x7d858c), botGray: new THREE.Color(0xb4b9bd), topSight: new THREE.Color(0x3b2a5a), botSight: new THREE.Color(0x7a5a9a) };
}
// каменная арка-портал домой
export function arch(ctx, parent, x, z, hf, ry = 0, color = 0x2f9e5a) {
  const { THREE, toon, M, colliders } = ctx; const g = new THREE.Group(); g.position.set(x, hf(x, z), z); g.rotation.y = ry; parent.add(g);
  const st = toon(0x9a958c);
  M(new THREE.BoxGeometry(0.9, 4.6, 0.9), st, -2, 2.3, 0, g); M(new THREE.BoxGeometry(0.9, 4.6, 0.9), st, 2, 2.3, 0, g); M(new THREE.BoxGeometry(5.4, 0.9, 1.1), st, 0, 4.9, 0, g);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.75, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, side: THREE.DoubleSide })); disc.position.y = 2.3; g.add(disc);
  const sw = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.06, 6, 40, 5), new THREE.MeshBasicMaterial({ color: 0xbfffd0, transparent: true, opacity: 0.8 })); sw.position.y = 2.3; g.add(sw);
  const c = Math.cos(ry), s = Math.sin(ry);
  colliders.push({ x: x - 2 * c, z: z + 2 * s, r: 0.7 }, { x: x + 2 * c, z: z - 2 * s, r: 0.7 });
  g.userData.update = (dt) => { disc.rotation.z += dt; sw.rotation.z -= dt * 2; };
  return g;
}
export function homePortal(ctx, parent, x, z, hf, ry = 0) {
  const g = arch(ctx, parent, x, z, hf, ry);
  ctx.interactables.push({ label: 'Вернуться в Лукоморье', pos: () => g.position, r: 3.5, act: () => ctx.travel('luk', ctx.LUK_PORTAL_POS()) });
  return g;
}
// буква-руна, светящаяся надпись
export function letterSprite(THREE, text, color = '#ffe27a', size = 1.6) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.font = 'bold 92px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = color; x.shadowBlur = 24; x.fillStyle = color; x.fillText(text, 64, 70); x.fillText(text, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); sp.scale.setScalar(size); return sp;
}
// костёр: восполняет здоровье и Слово
export function campfire(ctx, parent, x, z, hf) {
  const { THREE, kit, burst, player } = ctx; const y = hf(x, z);
  kit('survival/campfire-pit', x, z, 5, 0, 0, parent, hf);
  const fm = new THREE.MeshBasicMaterial({ color: 0xff9a2a, transparent: true, opacity: 0.9 }), fm2 = new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.9 });
  const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.2, 7), fm); f1.position.set(x, y + 0.9, z); parent.add(f1);
  const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 7), fm2); f2.position.set(x, y + 0.75, z); parent.add(f2);
  const L = new THREE.PointLight(0xff8a30, 16, 13, 1.6); L.position.set(x, y + 1.5, z); parent.add(L);
  const pos = new THREE.Vector3(x, y, z); let acc = 0;
  return { pos, update(dt, T) {
    f1.scale.set(1 + Math.sin(T * 13) * 0.08, 1 + Math.sin(T * 9) * 0.15, 1); f2.scale.y = 1 + Math.sin(T * 17) * 0.2; L.intensity = 14 + Math.sin(T * 11) * 3;
    if (Math.random() < dt * 4) burst(pos.clone().setY(y + 1.1), 0xffa040, 3, 1.2, 1, 0.12);
    if (near(player.pos, pos, 4)) { player.word = Math.min(100, player.word + dt * 30); acc += dt; if (acc > 1.5) { acc = 0; player.hp = Math.min(player.maxHp, player.hp + 1); } player.cold = Math.max(0, (player.cold || 0) - dt * 25); }
  } };
}
// дерево-препятствие (коллайдер + блок камеры)
export function solidTree(ctx, parent, path, x, z, s, hf, r = 0.5) {
  const o = ctx.kit(path, x, z, s, Math.random() * 6.28, -0.1, parent, hf); ctx.colliders.push({ x, z, r }); ctx.camBlockers.push(o); return o;
}
export function ringFx(ctx, parent, color = 0xffe27a) {
  const { THREE } = ctx; const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; parent.add(m); let t = -1, sp = 10;
  return { fire(pos, speed = 10) { m.position.copy(pos).setY(pos.y + 0.2); t = 0; sp = speed; }, update(dt) { if (t < 0) return; t += dt; m.scale.setScalar(0.5 + t * sp); m.material.opacity = Math.max(0, 0.85 - t * 1.2); if (t > 0.8) { t = -1; m.material.opacity = 0; } } };
}
export function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }
