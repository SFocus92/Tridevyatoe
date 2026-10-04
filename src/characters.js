// Герои и жители сказок: модель Kenney Blocky Characters (CC0) + собственные скины (tools/skins.py) + 3D-аксессуары.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let BASE = null, CLIPS = [], GRAD = null; const SKINS = {};
const KINDS = ['ivan', 'ivanushka', 'ivan_false', 'vasilisa', 'finist', 'ded', 'yaga', 'koschei', 'morozko', 'snegurochka', 'leshy', 'alyonushka', 'ilya', 'sadko', 'seaking', 'starik', 'staruha', 'tsarevna', 'elena'];
export async function initCharacters(grad, onProgress) {
  GRAD = grad; const loader = new GLTFLoader(); const tl = new THREE.TextureLoader(); let n = 0; const tot = KINDS.length + 1;
  const g = await loader.loadAsync('assets/kits/blocky/base.glb'); BASE = g.scene; CLIPS = g.animations; onProgress && onProgress(++n / tot);
  await Promise.all(KINDS.map(async (k) => {
    const t = await tl.loadAsync(`assets/kits/blocky/skins/${k}.png`);
    t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.anisotropy = 4;
    SKINS[k] = t; onProgress && onProgress(++n / tot);
  }));
}
export const skinOf = (k) => SKINS[k];
const tm = (c, o = {}) => new THREE.MeshToonMaterial({ color: c, gradientMap: GRAD, ...o });
function add(parent, geo, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; }

export function makeChar(kind, { scale = 0.68, outline = true } = {}) {
  const root = new THREE.Group(); root.name = 'char-' + kind;
  const model = BASE.clone(true); root.add(model); model.scale.setScalar(scale);
  const mat = new THREE.MeshToonMaterial({ map: SKINS[kind] || SKINS.ivan, gradientMap: GRAD });
  const parts = {};
  model.traverse((o) => { parts[o.name] = parts[o.name] || o; if (o.isMesh) { o.material = mat; o.castShadow = true; o.receiveShadow = false; } });
  if (outline) {
    const om = new THREE.MeshBasicMaterial({ color: 0x1a120a, side: THREE.BackSide });
    const meshes = []; model.traverse((o) => o.isMesh && meshes.push(o));
    meshes.forEach((o) => { const c = new THREE.Mesh(o.geometry, om); c.scale.setScalar(1.06); c.userData.outline = true; o.add(c); });
  }
  const head = parts.head, torso = parts.torso, armR = parts['arm-right'], armL = parts['arm-left'];
  // аксессуары (в локальных координатах модели до масштаба: голова ~ 1.0 шириной)
  const acc = new THREE.Group(); head.add(acc); acc.scale.setScalar(10); // голова в модели масштабирована 0.1
  const hs = new THREE.Vector3(0.8, 0.8, 0.8); const top = 0.8, hw = 0.4; // голова 0.8³, pivot снизу
  const gold = tm(0xf2c033, { emissive: 0x3a2600 });
  if (kind === 'vasilisa' || kind === 'snegurochka' || kind === 'tsarevna' || kind === 'elena') { // кокошник
    const sh = new THREE.Shape(); sh.absarc(0, 0, hw * 1.05, 0, Math.PI, false); sh.lineTo(-hw * 1.05, 0);
    const k = add(acc, new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false }), kind === 'vasilisa' ? tm(0xc8302a) : kind === 'tsarevna' ? tm(0x2e8a4a) : kind === 'elena' ? tm(0xe86a9a) : tm(0xbfe6ff, { emissive: 0x10283a }), 0, top * 0.8, hs.z * 0.18);
    const rim = add(acc, new THREE.TorusGeometry(hw * 1.05, 0.04, 6, 24, Math.PI), gold, 0, top * 0.8, hs.z * 0.18 + 0.09);
    for (let i = 0; i < 7; i++) { const a = (i / 6) * Math.PI; add(acc, new THREE.SphereGeometry(0.06, 8, 6), tm(0xffffff), Math.cos(a) * hw * 0.75, top * 0.8 + Math.sin(a) * hw * 0.75, hs.z * 0.18 + 0.1); }
    const braid = new THREE.Group(); acc.add(braid); braid.position.set(0, top * 0.3, -0.44);
    const hc = kind === 'vasilisa' ? tm(0x5a3420) : kind === 'tsarevna' ? tm(0x3a2a1a) : kind === 'elena' ? tm(0xf2c860) : tm(0xf2dc8a);
    for (let i = 0; i < 7; i++) add(braid, new THREE.SphereGeometry(0.12 - i * 0.006, 8, 6), hc, 0, -i * 0.17, -0.02 * i);
    add(braid, new THREE.ConeGeometry(0.09, 0.2, 6), kind === 'vasilisa' ? tm(0xc8302a) : kind === 'tsarevna' ? tm(0x3aa04a) : tm(0x7fc8f0), 0, -1.25, -0.14).rotation.x = Math.PI;
    root.userData.braid = braid;
  }
  if (kind === 'alyonushka') { const b = add(acc, new THREE.TorusGeometry(hw * 1.02, 0.06, 6, 24), tm(0xd83a5a), 0, top * 0.62, 0); b.rotation.x = Math.PI / 2; add(acc, new THREE.BoxGeometry(0.25, 0.4, 0.05), tm(0xd83a5a), 0.2, top * 0.4, -hs.z * 0.55).rotation.z = 0.4; }
  if (kind === 'finist') {
    for (let i = 0; i < 5; i++) { const f = add(acc, new THREE.ConeGeometry(0.07, 0.6, 5), tm(i % 2 ? 0x7a4f26 : 0xd9a066), 0, top + 0.1, -0.3 + i * 0.12); f.rotation.x = -0.5 + i * 0.12; }
    const wings = new THREE.Group(); torso.add(wings); wings.position.set(0, 1.05, -0.34);
    [-1, 1].forEach((s) => { const w = new THREE.Group(); wings.add(w); w.position.x = s * 0.2; const m = add(w, new THREE.BoxGeometry(1.3, 0.07, 0.45), tm(0x8a5a2e), s * 0.65, 0, 0); for (let i = 0; i < 4; i++) add(w, new THREE.BoxGeometry(0.28, 0.05, 0.55), tm(i % 2 ? 0xd9a066 : 0x6a4020), s * (0.3 + i * 0.3), -0.04, -0.2); w.userData.s = s; });
    wings.visible = false; root.userData.wings = wings;
  }
  if (kind === 'yaga') { add(acc, new THREE.ConeGeometry(0.13, 0.5, 6), tm(0xd0a080), 0, top * 0.45, hs.z * 0.55).rotation.x = Math.PI / 2 + 0.3; add(acc, new THREE.SphereGeometry(0.06, 6, 5), tm(0x6a4a3a), 0.1, top * 0.32, hs.z * 0.58); }
  if (kind === 'koschei') {
    const cr = new THREE.Group(); acc.add(cr); cr.position.y = top;
    add(cr, new THREE.CylinderGeometry(hw * 0.9, hw * 0.95, 0.18, 8, 1, true), gold);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; add(cr, new THREE.ConeGeometry(0.07, 0.35, 4), gold, Math.cos(a) * hw * 0.88, 0.25, Math.sin(a) * hw * 0.88); }
    add(cr, new THREE.OctahedronGeometry(0.1), tm(0x9a40ff, { emissive: 0x4a10a0 }), 0, 0.05, hw * 0.95);
    const cape = add(torso, new THREE.BoxGeometry(0.95, 1.75, 0.05), tm(0x2a1040), 0, 0.35, -0.34); cape.userData.cape = true;
  }
  if (kind === 'morozko') {
    const hat = add(acc, new THREE.CylinderGeometry(hw * 0.95, hw * 1.05, 0.5, 10), tm(0x3a72c8), 0, top + 0.2, 0);
    add(acc, new THREE.TorusGeometry(hw * 1.05, 0.1, 6, 16), tm(0xf4f8ff), 0, top - 0.02, 0).rotation.x = Math.PI / 2;
    const staff = add(armR, new THREE.CylinderGeometry(0.05, 0.05, 3.0, 6), tm(0xbfe6ff, { emissive: 0x204060 }), -0.2, -0.6, 0.12);
    add(staff, new THREE.OctahedronGeometry(0.2), tm(0xe8f8ff, { emissive: 0x4080c0 }), 0, 1.6, 0);
  }
  if (kind === 'leshy') {
    [-1, 1].forEach((s) => { const br = add(acc, new THREE.CylinderGeometry(0.04, 0.07, 0.9, 5), tm(0x5a3a1e), s * hw * 0.7, top + 0.3, 0); br.rotation.z = -s * 0.5; const t2 = add(br, new THREE.CylinderGeometry(0.03, 0.04, 0.4, 5), tm(0x5a3a1e), s * 0.12, 0.3, 0); t2.rotation.z = s * 0.9; add(br, new THREE.SphereGeometry(0.16, 6, 5), tm(0x4f7a2e), 0, 0.5, 0); });
  }
  if (kind === 'ivan') { const sw = add(armR, new THREE.BoxGeometry(0.07, 1.2, 0.16), tm(0xd8dde4), -0.2, -0.95, 0.65); sw.rotation.x = Math.PI / 2; add(sw, new THREE.BoxGeometry(0.34, 0.07, 0.2), gold, 0, -0.55, 0); add(sw, new THREE.BoxGeometry(0.09, 0.3, 0.12), tm(0x6b3f22), 0, -0.72, 0); root.userData.sword = sw; }
  if (kind === 'ded') add(acc, new THREE.CylinderGeometry(hw * 0.9, hw, 0.35, 10), tm(0x8a6a4a), 0, top + 0.1, 0);
  if (kind === 'yaga' || kind === 'ded') model.rotation.x = 0.06;
  if (kind === 'ilya') { // шлем-шишак, булава, круглый щит
    const steel = tm(0xb8c0c8, { emissive: 0x101418 });
    add(acc, new THREE.CylinderGeometry(hw * 1.04, hw * 1.08, 0.22, 10), steel, 0, top * 0.92, 0);
    add(acc, new THREE.ConeGeometry(hw * 1.02, 0.62, 10), steel, 0, top + 0.3, 0); add(acc, new THREE.SphereGeometry(0.07, 6, 5), gold, 0, top + 0.64, 0);
    add(acc, new THREE.BoxGeometry(0.08, 0.36, 0.06), steel, 0, top * 0.62, hs.z * 0.52); // наносник
    const mace = add(armR, new THREE.CylinderGeometry(0.05, 0.05, 1.1, 6), tm(0x6b3f22), -0.2, -0.95, 0.5); mace.rotation.x = Math.PI / 2;
    const hd = add(mace, new THREE.IcosahedronGeometry(0.26, 0), steel, 0, -0.62, 0); for (let i = 0; i < 6; i++) { const sp = add(hd, new THREE.ConeGeometry(0.06, 0.18, 4), steel, 0, 0, 0); const a = (i / 6) * Math.PI * 2; sp.position.set(Math.cos(a) * 0.24, 0, Math.sin(a) * 0.24); sp.rotation.z = -Math.PI / 2; sp.rotation.y = -a; }
    const sh = add(armL, new THREE.CylinderGeometry(0.55, 0.55, 0.08, 16), tm(0xc8302a), 0.25, -0.7, 0); sh.rotation.z = Math.PI / 2;
    add(sh, new THREE.CylinderGeometry(0.16, 0.16, 0.1, 10), gold, 0, 0.03, 0); add(sh, new THREE.TorusGeometry(0.52, 0.04, 6, 24), gold, 0, 0.03, 0).rotation.x = Math.PI / 2;
    root.userData.mace = mace;
  }
  if (kind === 'sadko') { // шапка и гусли
    add(acc, new THREE.CylinderGeometry(hw * 0.92, hw * 1.04, 0.32, 10), tm(0x8a2a3a), 0, top + 0.08, 0);
    add(acc, new THREE.TorusGeometry(hw * 1.02, 0.08, 6, 16), tm(0xc89a5a), 0, top - 0.04, 0).rotation.x = Math.PI / 2;
    const gs = new THREE.Shape(); gs.moveTo(-0.45, 0); gs.lineTo(0.45, 0); gs.lineTo(0.25, 0.6); gs.lineTo(-0.3, 0.6); gs.lineTo(-0.45, 0);
    const gu = add(torso, new THREE.ExtrudeGeometry(gs, { depth: 0.08, bevelEnabled: false }), tm(0xc8903a), 0, 0.35, 0.36); gu.rotation.x = -0.2;
    for (let i = 0; i < 5; i++) add(gu, new THREE.BoxGeometry(0.02, 0.5, 0.02), tm(0xf2e0a0, { emissive: 0x332200 }), -0.28 + i * 0.13, 0.3, 0.1);
    root.userData.gusli = gu;
  }
  if (kind === 'seaking') { // корона с жемчугом и трезубец
    const cr = new THREE.Group(); acc.add(cr); cr.position.y = top;
    add(cr, new THREE.CylinderGeometry(hw * 0.95, hw * 1.0, 0.22, 10, 1, true), gold);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; add(cr, new THREE.ConeGeometry(0.07, 0.4, 4), gold, Math.cos(a) * hw * 0.92, 0.28, Math.sin(a) * hw * 0.92); add(cr, new THREE.SphereGeometry(0.06, 8, 6), tm(0xf8f4ff, { emissive: 0x303040 }), Math.cos(a) * hw * 0.92, 0.5, Math.sin(a) * hw * 0.92); }
    const staff = add(armR, new THREE.CylinderGeometry(0.05, 0.05, 3.2, 6), gold, -0.2, -0.6, 0.12);
    for (const x of [-0.22, 0, 0.22]) add(staff, new THREE.ConeGeometry(0.06, 0.4, 5), gold, x, 1.75, 0);
    add(staff, new THREE.BoxGeometry(0.5, 0.06, 0.06), gold, 0, 1.55, 0);
  }
  if (kind === 'starik' || kind === 'staruha') model.rotation.x = 0.06;


  const mixer = new THREE.AnimationMixer(model); const actions = {};
  CLIPS.forEach((c) => (actions[c.name] = mixer.clipAction(c)));
  const ch = { kind, root, model, mixer, actions, mat, parts, cur: null, _busy: 0 };
  ch.play = (name, fade = 0.18) => {
    if (ch._busy > 0) return; const a = actions[name]; if (!a || a === ch.cur) return;
    a.reset().setLoop(THREE.LoopRepeat).play(); if (ch.cur) ch.cur.crossFadeTo(a, fade, false); ch.cur = a;
  };
  ch.once = (name, back = 'idle', speed = 1) => {
    const a = actions[name]; if (!a) return; const prev = ch.cur;
    a.reset(); a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; a.timeScale = speed; a.play(); if (prev && prev !== a) prev.crossFadeTo(a, 0.08, false);
    ch.cur = a; ch._busy = a.getClip().duration / speed * 0.92; ch._back = back;
  };
  ch.update = (dt) => {
    if (ch._busy > 0) { ch._busy -= dt; if (ch._busy <= 0) { ch._busy = 0; const b = ch._back; ch.cur = null; const a = actions[ch._busy === 0 && b]; if (a) { a.reset().setLoop(THREE.LoopRepeat).play(); actions[ch.lastName]?.fadeOut?.(0.15); ch.cur = a; } } }
    mixer.update(dt);
  };
  ch.play('idle');
  root.userData.char = ch;
  return ch;
}
