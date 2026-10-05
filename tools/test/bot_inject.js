window.__botLog = [];
window.__bot = async function (opts = {}) {
  const g = window.__game, ui = g.ui, THREE = g.THREE; const L = (s) => { window.__botLog.push(s); console.log('LOG ' + s); };
  const cnt = {}; const rules = opts.rules || [];
  ui.dialog = (speaker, text, choices) => {
    if (!choices) return Promise.resolve(-1);
    for (const r of rules) { const v = r(speaker, text, choices, g); if (v !== undefined && v !== null) { L(`[${speaker}] ${text.slice(0, 60)} → ${choices[v]}`); return Promise.resolve(v); } }
    const k = text; cnt[k] = (cnt[k] || 0); const v = cnt[k]++ % choices.length; L(`[${speaker}] ${text.slice(0, 60)} → ${choices[v]}`); return Promise.resolve(v);
  };
  ui.timing = () => Promise.resolve(true);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let last = '', same = 0;
  for (let step = 0; step < (opts.max || 400); step++) {
    if (opts.until && opts.until(g)) { L('UNTIL reached at step ' + step); return true; }
    while (g.player.locked || ui.busy()) await sleep(100);
    const [op, txt] = g.objective(); const R = g.region();
    const key = R.id + '|' + txt; if (key === last) same++; else { same = 0; last = key; L(`step ${step} [${R.id}] → ${txt}`); }
    if (same > (opts.stuck || 80)) { L('STUCK: ' + key); return false; }
    g.player.hp = g.player.maxHp; g.player.word = 100; g.player.cold = 0;
    // подойти к цели
    if (op && same % 3 === 0) { const a = same * 1.3; const d = 1.2 + (same % 6) * 0.3; g.player.pos.set(op.x + Math.cos(a) * d, 0, op.z + Math.sin(a) * d); g.player.pos.y = g.groundH(g.player.pos.x, g.player.pos.z) + (opts.fly ? 0 : 0); g.player.vy = 0; }
    await sleep(opts.dt || 160);
    // бой
    for (const e of g.enemies) if (e.alive && e.g.parent?.visible && e.g.position.distanceTo(g.player.pos) < 20) g.hurtEnemy(e, 5, e.g.position.clone().add(new THREE.Vector3(1, 0, 0)));
    for (const h of g.hittables) { if (h.cond && !h.cond()) continue; const p = h.pos(); if (Math.hypot(p.x - g.player.pos.x, p.z - g.player.pos.z) < (h.r || 3) + 2) { h.onHit(g.player.hero); await sleep(60); } }
    // взгляд
    if (same % 4 === 2) g.toggleSight(!g.player.sight);
    const it = g.nearest(); if (it) { L('  F: ' + it.label); await g.interact(); await sleep(100); }
    if (opts.each) await opts.each(g, step, same);
  }
  L('MAX steps'); return false;
};
