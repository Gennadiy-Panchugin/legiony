// Teaches war.js the new squads (roster-engine.js): their orders, defence, the phalanx front, ambushes in groves,
// stuns, fire, the scorpion's bolt, type icons and ▲/▼ over enemies, and the army sent in by the main game.
const fs = require('fs'); let t = fs.readFileSync('war.js', 'utf8');
const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', a.slice(0, 70)); process.exit(1); } t = t.replace(a, () => b); };

// state for fires, bolts and the scouts' reveal
rep('rains: [], tgt: null', 'rains: [], fires: [], bolts: [], reveal: null, tgt: null');
// timers; stunned squads and the hedge stand still; the scorpion needs to stand to deploy
rep('    if (s.hurt > 0) s.hurt -= dt; if (s.wedgeT > 0) s.wedgeT -= dt; if (s.slowT > 0) s.slowT -= dt;',
    '    if (s.hurt > 0) s.hurt -= dt; if (s.wedgeT > 0) s.wedgeT -= dt; if (s.slowT > 0) s.slowT -= dt; if (s.stunT > 0) s.stunT -= dt; if (s.firstT > 0) s.firstT -= dt;\n    s.stillT = s.moving ? 0 : (s.stillT || 0) + dt;');
rep('    s.moving = s.path.length > 0; if (!s.moving) continue;', "    if (s.stunT > 0 || s.cls === 'triarii' && s.sk > 0) { s.moving = false; continue; }\n    s.moving = s.path.length > 0; if (!s.moving) continue;");
// ambushers hide in groves until they strike or scouts find them
rep('  for (const a of live) {\n    a.fighting = false; if (a.moving || a.work) continue;',
    "  if (G.reveal && (G.reveal.t -= dt) <= 0) G.reveal = null;\n  for (const s of live) if (CLS[s.cls].first) { if (!s.revealed && (G.reveal && Math.hypot(s.x - G.reveal.x, s.y - G.reveal.y) < G.reveal.r || G.fires.some(f => Math.hypot(s.x - f.x, s.y - f.y) < f.r + 30))) s.revealed = true; s.hiddenA = !s.revealed && inForest(s); }\n  for (const a of live) {\n    a.fighting = false; if (a.moving || a.work || a.stunT > 0 || CLS[a.cls].deploy && a.stillT < CLS[a.cls].deploy) continue;");
rep('for (const e of live) { if (e.side === a.side) continue;', 'for (const e of live) { if (e.side === a.side || e.hiddenA) continue;');
rep("    a.fighting = true; a.face = t.x < a.x - 1 ? -1 : t.x > a.x + 1 ? 1 : a.face;",
    "    a.fighting = true; a.face = t.x < a.x - 1 ? -1 : t.x > a.x + 1 ? 1 : a.face;\n    if (CLS[a.cls].first && !a.revealed) { a.revealed = true; a.hiddenA = false; a.firstT = 2; G.warn.push({ x: a.x, y: a.y, t: 2.5 }); say('Засада!'); }");
rep("    if ((a.cls === 'eques' || a.cls === 'e_cav') && a.travel >= 90)", "    if (a.kind === CAV && a.travel >= 90)");
rep('    t.pend += v; t.hurt = 0.25;', String.raw`    const da = CLS[a.cls], dt2 = CLS[t.cls];
    if (da.weakNear && bd < MELEE) v *= da.weakNear;
    if (da.vsCav && t.kind === CAV) v *= da.vsCav * (a.sk > 0 ? 1.45 : 1);
    if (a.firstT > 0) v *= da.first || 1;
    v *= dt2.def || 1; if (t.cls === 'tiro' && t.sk > 0) v *= 0.75;
    if (t.cls === 'triarii' && t.sk > 0 && a.kind === CAV) { v *= 0.3; a.slowT = 2; a.travel = 0; }
    if (dt2.front) { const fx = t.atk ? t.atk.x - t.x : 0, fy = t.atk ? t.atk.y - t.y : 1, fl = Math.hypot(fx, fy) || 1, ax = a.x - t.x, ay = a.y - t.y, al = Math.hypot(ax, ay) || 1; v *= (fx * ax + fy * ay) / fl / al > 0.5 ? dt2.front : 1.3; }
    t.pend += v; t.hurt = 0.25;`);
// fire burns whoever stands in it
rep('  G.rains = G.rains.filter(r => r.t < r.dur);', "  G.rains = G.rains.filter(r => r.t < r.dur);\n  for (const f of G.fires) { f.t += dt; for (const e of live) if (e.side === 2 && Math.hypot(e.x - f.x, e.y - f.y) < f.r) { e.pend += 0.7 * dt; e.hurt = 0.25; raise(e.zone, e, 14); } } G.fires = G.fires.filter(f => f.t < f.dur);\n  for (const b of G.bolts) b.t += dt * 3; G.bolts = G.bolts.filter(b => b.t < 1);");

// the new orders
rep("    else { G.rains.push({ x: tx, y: ty, t: 0, dur: 3, r: 72 }); SND.play('volley', tx); }", String.raw`    else if (b.id === 'stun') { const e = G.sq.filter(q => q.alive && q.side === 2 && !q.hiddenA).sort((p, q) => Math.hypot(p.x - tx, p.y - ty) - Math.hypot(q.x - tx, q.y - ty))[0];
      if (!e || Math.hypot(e.x - tx, e.y - ty) > 80) { if (!quiet) say('Коснитесь вражеского отряда'); return false; }
      e.stunT = 3; e.path = []; e.atk = null; G.volleys.push({ x: s.x, y: s.y - 20, tx: e.x, ty: e.y - 14, t: 0, side: 1 }); G.warn.push({ x: e.x, y: e.y, t: 1 }); SND.play('crash', e.x); }
    else if (b.id === 'fire') { G.fires.push({ x: tx, y: ty, t: 0, dur: 6, r: 64 }); SND.play('volley', tx); }
    else if (b.id === 'pierce') { const L = Math.hypot(tx - s.x, ty - s.y) || 1, ux = (tx - s.x) / L, uy = (ty - s.y) / L, ex = s.x + ux * d.range, ey = s.y + uy * d.range;
      const hit = G.sq.filter(q => q.alive && q.side === 2 && !q.hiddenA).map(q => { const k = (q.x - s.x) * ux + (q.y - s.y) * uy; return { q, k, off: Math.abs((q.x - s.x) * uy - (q.y - s.y) * ux) }; }).filter(h => h.k > 0 && h.k < d.range && h.off < 34).sort((p, q) => p.k - q.k).slice(0, 4);
      for (const h of hit) { h.q.pend += 1.6; h.q.hurt = 0.4; bleed(h.q); raise(h.q.zone, h.q, 14); } G.bolts.push({ x0: s.x, y0: s.y - 24, x1: ex, y1: ey - 24, t: 0 }); SND.play('crash', s.x); }
    else { G.rains.push({ x: tx, y: ty, t: 0, dur: 3, r: 72 }); SND.play('volley', tx); }`);
rep("    else { s.sk = d.dur; if (b.id === 'gallop') s.travel = 999; SND.play({ turtle: 'shield', volley: 'volley', gallop: 'gallop', rush: 'rush' }[b.id], s.x); }", String.raw`    else if (b.id === 'pila') { const e = G.sq.filter(q => q.alive && q.side === 2 && !q.hiddenA && dist(q, s) < 150).sort((p, q) => dist(p, s) - dist(q, s))[0];
      if (!e) { if (!quiet) say('Пилумы летят на 150 шагов — подойдите ближе'); return false; }
      e.pend += s.n * 0.22; e.sk = 0; e.hurt = 0.4; for (let i = 0; i < 3; i++) G.volleys.push({ x: s.x + (i - 1) * 12, y: s.y - 20, tx: e.x, ty: e.y - 14, t: -i * 0.1, side: 1 }); SND.play('volley', s.x); }
    else if (b.id === 'scout') { G.reveal = { x: s.x, y: s.y, r: 260, t: d.dur }; s.sk = d.dur; SND.play('gallop', s.x); }
    else { s.sk = d.dur; if (b.id === 'gallop') s.travel = 999; if (b.id === 'hedge') s.path = []; SND.play({ turtle: 'shield', volley: 'volley', gallop: 'gallop', rush: 'rush', close: 'shield', hedge: 'shield' }[b.id] || 'order', s.x); }`);

// drawing: the new soldiers, hidden ambushers, enemy type icons, stuns
rep('  const n = Math.ceil(s.n), pts = [];', '  if (s.hiddenA) return;\n  const n = Math.ceil(s.n), pts = [];');
rep('chibi(ctx, s.x + ox', 'unit(ctx, s.x + ox');
rep('  const st = BAN[s.cls] || BAN.e_inf;', "  if (s.side === 2) typeIcon(ctx, s.x - s.face * 34, s.y - 42, 9, TREE_KIND[s.cls] || 'INF', true);\n  if (s.stunT > 0) { ctx.font = '900 20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('💫', s.x, s.y - 58 + Math.sin(t * 8) * 3); }\n  const st = BAN[s.cls] || BAN.e_inf;");
rep('  for (const rn of G.rains) { ctx.beginPath();', String.raw`  for (const f of G.fires) { const k = 1 - f.t / f.dur; ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r, f.r * 0.55, 0, 0, 7); ctx.fillStyle = 'rgba(255,120,30,' + (0.25 * k + 0.1) + ')'; ctx.fill();
    for (let i = 0; i < 7; i++) { const a = i * 0.9 + f.t, x = f.x + Math.cos(a) * f.r * 0.55, y = f.y + Math.sin(a) * f.r * 0.3, h = 16 + 8 * Math.sin(t * 9 + i); ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.quadraticCurveTo(x - 7, y - h * 0.6, x, y - h); ctx.quadraticCurveTo(x + 7, y - h * 0.6, x + 6, y); ctx.closePath(); fo(ctx, '#ffb030', 1.6); } }
  for (const b of G.bolts) { ctx.strokeStyle = 'rgba(255,240,200,' + (1 - b.t) + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(b.x0, b.y0); ctx.lineTo(b.x0 + (b.x1 - b.x0) * Math.min(1, b.t * 2), b.y0 + (b.y1 - b.y0) * Math.min(1, b.t * 2)); ctx.stroke(); }
  if (G.reveal) { ctx.save(); ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.ellipse(G.reveal.x, G.reveal.y, G.reveal.r, G.reveal.r * 0.6, 0, 0, 7); ctx.strokeStyle = 'rgba(180,230,255,.8)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
  for (const rn of G.rains) { ctx.beginPath();`);
// ▲/▼ over enemies while one of ours is selected
rep('  for (const p of G.points) { ctx.font = \'900 15px "Lilita One", sans-serif\';', "  if (G.sel && G.sel.alive) for (const e of G.sq) if (e.alive && e.side === 2 && !e.hiddenA) { const v = verdict(G.sel.cls, e.cls); if (v) mark(ctx, e.x, e.y - 76, v > 0, 11); }\n  for (const p of G.points) { ctx.font = '900 15px \"Lilita One\", sans-serif';");
// the rail: a type badge on each general
rep("portrait(g, i, s.cls); }); }", "portrait(g, i, s.cls); typeIcon(g, 52, 52, 9, TREE_KIND[s.cls] || 'INF'); }); }");
// help screen slots cycle through the whole roster; inside the main game the army comes from the barracks
rep("slots[i] = ORDER[(ORDER.indexOf(slots[i]) + 1) % ORDER.length];", "if (EMBED) return; slots[i] = ORDER_ALL[(ORDER_ALL.indexOf(slots[i]) + 1) % ORDER_ALL.length];");
rep('function report(win, surrendered) {', "if (EMBED) { addEventListener('message', e => { const m = e.data; if (e.source === parent && m && m.legWar === 'init' && Array.isArray(m.slots)) { slots = m.slots.slice(0, 4).map(c => CLS[c] ? c : 'tiro'); renderSlots(); newBattle(); } }); setTimeout(() => parent.postMessage({ legWar: 'ready' }, '*'), 0); }\nfunction report(win, surrendered) {");
fs.writeFileSync('war.js', t); console.log('ok');
