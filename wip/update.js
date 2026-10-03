function update(dt) {
  T += dt;
  const Rg = region; const inLuk = Rg === LUK;
  // жизнь мира
  lifeTarget = lifeOverride ?? (inLuk ? baseLife() : Rg.life());
  if (Math.abs(life - lifeTarget) > 0.002) { life += Math.sign(lifeTarget - life) * Math.min(Math.abs(lifeTarget - life), dt * (lifeTarget === 1 ? 0.28 : 0.4)); }
  if (Math.abs(life - lifeShown) > 0.004) { applyLife(life); lifeShown = life; }
  const SK0 = Rg.sky || SKY; const sk = Math.min(1, dt * 4);
  const top = SK0.topGray.clone().lerp(SK0.topLive, life), bot = SK0.botGray.clone().lerp(SK0.botLive, life);
  if (player.sight) { top.lerp(SK0.topSight, 0.6); bot.lerp(SK0.botSight, 0.5); }
  skyMat.uniforms.top.value.lerp(top, sk); skyMat.uniforms.bottom.value.lerp(bot, sk);
  scene.background.copy(skyMat.uniforms.bottom.value); scene.fog.color.copy(scene.background);
  skyDome.position.copy(camera.position);
  if (inLuk) clouds.forEach((c) => { c.position.x += dt * c.userData.sp; if (c.position.x > 130) c.position.x = -130; });

  // игрок
  const p = player; const canMove = started && !ui.busy() && !p.locked;
  const hero = heroes[p.hero];
  const blocking = (keys.has('KeyK') || mouseBlock) && canMove;
  let moving = false, speed = 0;
  if (canMove) {
    if (keys.has('ArrowLeft')) camYaw += dt * 2; if (keys.has('ArrowRight')) camYaw -= dt * 2;
    let ix = 0, iz = 0;
    if (keys.has('KeyW') || keys.has('ArrowUp')) iz -= 1; if (keys.has('KeyS') || keys.has('ArrowDown')) iz += 1; if (keys.has('KeyA')) ix -= 1; if (keys.has('KeyD')) ix += 1;
    if (joy.id !== null) { ix += joy.x; iz += joy.y; }
    const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || Math.hypot(joy.x, joy.y) > 0.85;
    speed = (run ? 9.5 : 6) * (p.speedT > 0 ? 1.6 : 1) * (blocking ? 0.45 : 1) * (p.hero === 'finist' ? 1.08 : 1) * (p.slow > 0 ? 0.6 : 1);
    if (p.dashT > 0) speed = 26;
    if (ix || iz || p.dashT > 0) {
      let dx, dz;
      if (ix || iz) { const l = Math.hypot(ix, iz); ix /= l; iz /= l; const sx = Math.sin(camYaw), cz = Math.cos(camYaw); dx = ix * cz + iz * sx; dz = -ix * sx + iz * cz; }
      else { dx = Math.sin(p.facing); dz = Math.cos(p.facing); }
      p.pos.x += dx * speed * dt; p.pos.z += dz * speed * dt; moving = true;
      const tf = Math.atan2(dx, dz); let df = tf - p.facing; df = Math.atan2(Math.sin(df), Math.cos(df)); p.facing += df * Math.min(1, dt * 12);
      p.walk += dt * speed * 1.6;
    } else p.walk *= 0.85;
  }
  for (const c of colliders) { if (Math.abs(p.pos.x - c.x) > 6 || Math.abs(p.pos.z - c.z) > 6) continue; if (c.h !== undefined && p.pos.y > c.h) continue; const dx = p.pos.x - c.x, dz = p.pos.z - c.z, d = Math.hypot(dx, dz), m = c.r + 0.4; if (d < m && d > 0.0001) { p.pos.x = c.x + (dx / d) * m; p.pos.z = c.z + (dz / d) * m; } }
  { const cx = p.pos.x - Rg.center.x, cz = p.pos.z - Rg.center.y, r = Math.hypot(cx, cz); if (r > Rg.radius) { p.pos.x = Rg.center.x + (cx * Rg.radius) / r; p.pos.z = Rg.center.y + (cz * Rg.radius) / r; } }
  const gh = Math.max(groundH(p.pos.x, p.pos.z), Rg.water === false ? -99 : 0.05);
  const gliding = p.hero === 'finist' && !p.onGround && keys.has('Space') && p.vy < 0 && canMove;
  p.vy -= (gliding ? 6 : 26) * dt; if (gliding) p.vy = Math.max(p.vy, -2.2);
  p.pos.y += p.vy * dt;
  if (p.pos.y <= gh) { if (!p.onGround && p.vy < -8) { S.land(); burst(p.pos.clone(), 0xd8d0c0, 8, 2, 0.4, 0.15); } p.pos.y = gh; p.vy = 0; p.onGround = true; p.jumps = 0; } else if (p.pos.y > gh + 0.05) p.onGround = false;
  if (gliding && Math.random() < dt * 20) burst(p.pos.clone().setY(p.pos.y + 1.2), 0xffe0a0, 1, 0.5, 0.6, 0.12);
  p.attackT = Math.max(0, p.attackT - dt); p.hurtT = Math.max(0, p.hurtT - dt); p.buffT = Math.max(0, p.buffT - dt); p.speedT = Math.max(0, p.speedT - dt); p.luckCd = Math.max(0, p.luckCd - dt);
  p.dashT = Math.max(0, p.dashT - dt); p.hidden = Math.max(0, p.hidden - dt); p.slow = Math.max(0, p.slow - dt);
  if (p.sight) { p.word -= dt * 9 * p.sightCost; if (p.word <= 0) { p.word = 0; toggleSight(false); ui.toast('Слово иссякло. Отдохни у костра.'); } }
  else p.word = Math.min(100, p.word + dt * (st.feathers.every(Boolean) ? 6 : 2.5));
  if (inLuk && p.pos.distanceTo(FIRE3) < 4) { p.word = Math.min(100, p.word + dt * 30); if (T % 1.5 < dt) p.hp = Math.min(p.maxHp, p.hp + 1); }
  // шаги
  if (moving && p.onGround) { p.stepPh += dt * speed * 0.42; if (p.stepPh > 1) { p.stepPh = 0; S.step(Rg.surface ? Rg.surface(p.pos.x, p.pos.z) : inLuk ? lukSurface(p.pos.x, p.pos.z) : 'grass'); } }

  // герой: позиция и анимация
  const hr = hero.root; hr.position.copy(p.pos); hr.rotation.y = p.facing; hr.scale.setScalar(p.buffT > 0 ? 1.15 : 1);
  hr.visible = !(p.hidden > 0 && p.hiddenModel);
  if (!hero._busy) hero.play(!p.onGround ? (gliding ? 'holding-both' : 'sprint') : blocking ? 'holding-both' : moving ? (speed > 8 ? 'sprint' : 'walk') : 'idle');
  const anim = hero.cur; if (anim) anim.timeScale = !p.onGround && !gliding ? 0.4 : moving ? Math.max(0.8, speed / 7) : 1;
  if (hr.userData.wings) { const w = hr.userData.wings; w.visible = gliding || p.dashT > 0 || (!p.onGround && p.jumps >= 2); w.children.forEach((c) => (c.rotation.z = c.userData.s * (gliding ? Math.sin(T * 3) * 0.12 : Math.sin(T * 18) * 0.5))); }
  if (hr.userData.braid) hr.userData.braid.rotation.x = moving ? 0.25 + Math.sin(T * 10) * 0.08 : 0.05;
  hero.update(dt);
  for (const c of chars) if (c.root.parent && c.root.parent.visible !== false && c.root.visible) c.update(dt);
  for (const m of mixers) { const r = m.getRoot(); if (r.parent && r.parent.parent?.visible !== false) m.update(dt); }
  document.getElementById('hurtFx').style.opacity = p.hurtT > 0 ? 1 : 0;

  // враги
  for (const e of enemies) {
    if (e.dying > 0) { e.dying -= dt; e.g.scale.setScalar(Math.max(0.01, e.dying) * (e.scale || 1)); e.g.position.y += dt; if (e.dying <= 0) e.g.visible = false; continue; }
    if (!e.alive || !e.g.parent?.visible) continue;
    const d = p.pos.clone().sub(e.g.position); d.y = 0; const dist = d.length();
    const aggro = !e.passive && dist < (e.aggroR || 13) && canMove && !(p.hidden > 0);
    const target = aggro ? p.pos : e.home;
    const to = new THREE.Vector3(target.x - e.g.position.x, 0, target.z - e.g.position.z);
    if (!e.still && to.length() > (aggro ? (e.reach || 1.1) : 0.5)) { to.normalize().multiplyScalar((aggro ? (e.speed || 3.4) : 1.5) * dt); e.g.position.add(to); }
    e.g.position.addScaledVector(e.kb, dt); e.kb.multiplyScalar(Math.pow(0.02, dt));
    e.g.position.y = groundH(e.g.position.x, e.g.position.z) + (e.fly ?? 1.3) + Math.sin(T * 2 + e.ph) * 0.25;
    e.g.lookAt(p.pos.x, e.g.position.y, p.pos.z);
    e.cd -= dt; if (aggro && dist < (e.reach || 1.1) + 0.4 && e.cd <= 0) { e.cd = e.rate || 1.3; damagePlayer(e); }
    e.flash -= dt; e.custom && e.custom(e, dt);
    const m = e.g.userData.mat;
    if (m && m.emissive) m.emissive.setHex(e.flash > 0 ? 0xffffff : p.sight ? 0x806010 : e.glow || 0x000000);
  }
  // огоньки Василисы
  for (let i = orbs.length - 1; i >= 0; i--) {
    const o = orbs[i]; o.t += dt;
    if (o.tgt) o.v.lerp(o.tgt.clone().sub(o.m.position).normalize().multiplyScalar(18), Math.min(1, dt * 6));
    o.m.position.addScaledVector(o.v, dt); o.m.scale.setScalar(1 + Math.sin(o.t * 30) * 0.1);
    if (Math.random() < dt * 30) burst(o.m.position.clone(), 0x9fe8ff, 1, 0.5, 0.4, 0.12);
    let hit = o.t > 1.2;
    for (const e of enemies) { if (!e.alive || hit || !e.g.parent?.visible) continue; if (e.g.position.distanceTo(o.m.position) < 1.3 + (e.big || 0)) { hurtEnemy(e, 1.5 * (p.sight ? 2 : 1), o.m.position.clone().sub(o.v)); S.hit(); hit = true; } }
    for (const h of hittables) { if (hit || (h.cond && !h.cond())) continue; const hp = h.pos(); if (hp.distanceTo(o.m.position) < (h.r || 3)) { h.onHit('vasilisa'); hit = true; } }
    if (hit) { burst(o.m.position, 0x9fe8ff, 16, 3, 0.5, 0.2); scene.remove(o.m); orbs.splice(i, 1); }
  }
  // море следует за игроком
  sea.position.x = Math.round(p.pos.x / 10) * 10; sea.position.z = Math.round(p.pos.z / 10) * 10;
  const sp = seaGeo.attributes.position; for (let i = 0; i < sp.count; i++) { const x = seaBaseY[i * 3] + sea.position.x, z = seaBaseY[i * 3 + 2] + sea.position.z; sp.setY(i, Math.sin(x * 0.12 + T * 1.3) * 0.15 + Math.cos(z * 0.1 + T) * 0.15); }
  sp.needsUpdate = true;

  // частицы
  for (let i = bursts.length - 1; i >= 0; i--) {
    const bs = bursts[i]; bs.t += dt; const arr = bs.pts.geometry.attributes.position.array;
    bs.v.forEach((v, j) => { v.y -= 2.5 * dt; arr[j * 3] += v.x * dt; arr[j * 3 + 1] += v.y * dt; arr[j * 3 + 2] += v.z * dt; });
    bs.pts.geometry.attributes.position.needsUpdate = true; bs.pts.material.opacity = 1 - bs.t / bs.life;
    if (bs.t >= bs.life) { scene.remove(bs.pts); bs.pts.geometry.dispose(); bs.pts.material.dispose(); bursts.splice(i, 1); }
  }

  if (inLuk) {
    // нити и тайники
    for (const k in threads) { const th = threads[k]; th.g.visible = p.sight && st.stage >= 1 && !st.links[k]; th.glow.material.opacity = 0.18 + 0.12 * Math.sin(T * 4); }
    GROVE_LINK.visible = st.groveCleared && !st.links.grove && p.sight;
    GROVE_LINK.rotation.y += dt * 2;
    if (st.groveCleared && !st.links.grove && !p.sight && !st.seenGroveHint && Math.hypot(p.pos.x - GROVE.x, p.pos.z - GROVE.y) < 5) { st.seenGroveHint = true; ui.toast('Здесь что-то есть… Попробуй Сказительский взгляд (Q).'); }
    flame.scale.set(1 + Math.sin(T * 13) * 0.08, 1 + Math.sin(T * 9) * 0.15, 1); flame2.scale.y = 1 + Math.sin(T * 17) * 0.2;
    fireLight.intensity = 16 + Math.sin(T * 11) * 3 + Math.sin(T * 7.3) * 2;
    if (Math.random() < dt * 4) burst(FIRE3.clone().setY(FIRE3.y + 1.2), 0xffa040, 3, 1.2, 1, 0.12);
    portalDisc.rotation.z += dt; swirl.rotation.z -= dt * 2;
    if (st.restored) { portalMat.color.lerp(new THREE.Color(0x2f9e5a), dt); portalMat.opacity = Math.min(0.75, portalMat.opacity + dt * 0.3); swirl.material.opacity = Math.min(0.9, swirl.material.opacity + dt * 0.3); }
    mermaid.userData.tail.rotation.x = Math.sin(T * 1.6) * 0.25;
    kiki.position.y = KIKI_POS.y + Math.sin(T * 1.2) * 0.05; if (kiki.userData.giggle > 0) { kiki.userData.giggle -= dt; kiki.rotation.z = Math.sin(T * 30) * 0.08; } else kiki.rotation.z = 0;
    if (st.restored && !ui.dialogOpen && !st.festival) {
      const a = T * 0.35; const rr = 2.7; cat.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); cat.position.y = H(cat.position.x, cat.position.z); cat.rotation.y = -a; catPet.play('walk');
    } else { if (!st.restored) cat.position.copy(CAT_HOME); catPet.play(ui.dialogOpen && p.pos.distanceTo(cat.position) < 4 ? 'gesture-positive' : st.festival ? 'dance' : 'idle'); }
    if (ui.dialogOpen) { const d = p.pos.clone().sub(cat.position); if (d.length() < 4) cat.rotation.y = Math.atan2(d.x, d.z); }
    chainLinks.forEach((l) => l.material.emissive.setHex(st.restored ? 0x553300 : 0x221100));
    const bk = smooth(0.8, 1, life);
    butterflies.forEach((b) => { b.g.visible = bk > 0.01; if (!b.g.visible) return; const t = T * 0.6 + b.ph; b.g.position.set(b.home.x + Math.sin(t) * 3, H(b.home.x, b.home.z) + 1.2 + Math.sin(t * 2.3) * 0.6, b.home.z + Math.cos(t * 0.8) * 3); b.g.rotation.y = t; const fl = Math.sin(T * 18 + b.ph) * 0.9; b.p1.rotation.y = fl; b.p2.rotation.y = -fl; b.g.scale.setScalar(bk); });
    if (ringT >= 0) { ringT += dt; const s = ringT * 28; ring.scale.setScalar(s); ring.material.opacity = Math.max(0, 0.8 - ringT * 0.27); if (ringT > 3) ringT = -1; }
    if (life > 0.9 && Math.random() < dt * 0.25) S.bird();
    updateTales(dt, canMove);
    if (st.festival) updateFestival(dt);
  } else Rg.update && Rg.update(dt, canMove);

  // камера
  const tgt = p.pos.clone().add(new THREE.Vector3(0, 1.7, 0));
  const cp = new THREE.Vector3(Math.sin(camYaw) * Math.cos(camPitch) * camDist, Math.sin(camPitch) * camDist, Math.cos(camYaw) * Math.cos(camPitch) * camDist).add(tgt);
  { // «пружинная» камера: не прячемся за деревьями
    const dir = cp.clone().sub(tgt); const len = dir.length(); dir.normalize();
    ray.set(tgt, dir); ray.far = len;
    const near = camBlockers.filter((o) => o.parent && o.parent.visible !== false && Math.hypot(o.position.x - p.pos.x, o.position.z - p.pos.z) < len + 8);
    const hit = ray.intersectObjects(near, true)[0];
    if (hit) cp.copy(tgt).addScaledVector(dir, Math.max(1.6, hit.distance - 0.4));
  }
  cp.y = Math.max(cp.y, groundH(cp.x, cp.z) + 0.6, 0.6);
  if (camOverride) cp.copy(camOverride.pos);
  camera.position.lerp(cp, Math.min(1, dt * (camOverride ? 2.5 : 10))); camera.lookAt(camOverride ? camOverride.look : tgt);
  if (shakeT > 0 && OPT.shake) { shakeT -= dt; camera.position.x += (Math.random() - 0.5) * shakeT; camera.position.y += (Math.random() - 0.5) * shakeT; }
  sun.position.copy(p.pos).add(new THREE.Vector3(25, 45, 18)); sun.target.position.copy(p.pos);

  // HUD
  if (started) {
    ui.hud(p, heroLabel()); ui.tracker(trackerHtml());
    const it = canMove ? nearest() : null; ui.prompt(it ? `F — ${it.label}` : '');
    if (T - lastMM > 0.1) { lastMM = T; drawMinimap(); }
  }
}
let loopErr = 0;
function loop() { requestAnimationFrame(loop); const dt = Math.min(0.05, clock.getDelta()); try { update(dt); } catch (e) { if (loopErr++ < 5) console.error('update', e); } renderer.render(scene, camera); }
