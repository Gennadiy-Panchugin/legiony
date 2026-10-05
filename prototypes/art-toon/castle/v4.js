// v4: banner rail on the left, boost panel at the bottom for the selected squad (trap, rain of arrows, wedge...), pinch zoom, per-squad banners.
const fs = require('fs'), path = require('path');
const F = path.join(__dirname, 'castle.html');
let s = fs.readFileSync(F, 'utf8');
function rep(a, b) { const i = s.indexOf(a); if (i < 0 || s.indexOf(a, i + 1) >= 0) { console.error('MISS', a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); }
function between(a, b, body) { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) { console.error('MISS range', a.slice(0, 60)); process.exit(1); } s = s.slice(0, i) + body + s.slice(j); }

// ---------------------------------------------------------------- the field grows a row, terrain is drawn sharper for zoom
rep("const W = 540, H = 960, DPR = Math.min(2, window.devicePixelRatio || 1);", "const W = 540, H = 960, DPR = Math.min(2, window.devicePixelRatio || 1), RS = Math.min(3.2, DPR * 1.6);");
rep("const CS = 60, COLS = 9, ROWS = 13, OY = 90;", "const CS = 60, COLS = 9, ROWS = 14, OY = 90;");
rep("  '.........',\n  '.........'\n];", "  '.........',\n  '.........',\n  '.........'\n];");
rep("function initDecals() { DEC = document.createElement('canvas'); DEC.width = W * DPR; DEC.height = H * DPR; dctx = DEC.getContext('2d'); dctx.scale(DPR, DPR); }", "function initDecals() { DEC = document.createElement('canvas'); DEC.width = W * RS; DEC.height = H * RS; dctx = DEC.getContext('2d'); dctx.scale(RS, RS); }");
rep("const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;\n  const g = c.getContext('2d'); g.scale(DPR, DPR);\n  let sd = 5;", "const c = document.createElement('canvas'); c.width = W * RS; c.height = H * RS;\n  const g = c.getContext('2d'); g.scale(RS, RS);\n  let sd = 5;");

// ---------------------------------------------------------------- HTML: left rail, boost bar, zoom chip
between('  <div class="hud bottom">', '  <div class="toast" id="toast" hidden></div>', `  <div class="rail" id="rail">
    <button class="rb" id="rb0" type="button" aria-label="Отряд 1"><span class="in"><canvas id="rbc0" width="64" height="64"></canvas></span></button>
    <button class="rb" id="rb1" type="button" aria-label="Отряд 2"><span class="in"><canvas id="rbc1" width="64" height="64"></canvas></span></button>
    <button class="rb" id="rb2" type="button" aria-label="Отряд 3"><span class="in"><canvas id="rbc2" width="64" height="64"></canvas></span></button>
    <button class="rb" id="rb3" type="button" aria-label="Отряд 4"><span class="in"><canvas id="rbc3" width="64" height="64"></canvas></span></button>
  </div>
  <div class="boostbar" id="boosts" hidden></div>
  <button class="zchip" id="zoomchip" type="button" hidden>1,0× ⟲</button>
`);
rep("  button:focus-visible { outline: 3px solid #f6d77a; outline-offset: 2px; }", `  .rail { position: absolute; left: 8px; top: 118px; display: flex; flex-direction: column; gap: 12px; z-index: 3; }
  .rb { --hp: 100; --c: #6fd17a; width: 58px; height: 58px; border-radius: 50%; border: 0; padding: 4px; cursor: pointer; background: conic-gradient(var(--c) calc(var(--hp) * 1%), rgba(0,0,0,.6) 0); position: relative; }
  .rb .in { display: block; width: 100%; height: 100%; border-radius: 50%; background: #1e1913; border: 1.5px solid #4a3d2c; overflow: hidden; }
  .rb canvas { width: 100%; height: 100%; display: block; }
  .rb.sel { box-shadow: 0 0 0 3px #f6d77a, 0 0 14px rgba(246,215,122,.6); }
  .rb.dead { opacity: .35; }
  .rb.act::after { content: ''; position: absolute; top: 2px; right: 2px; width: 10px; height: 10px; border-radius: 50%; background: #f6d77a; border: 1.5px solid #1e1913; }
  .boostbar { position: absolute; left: 80px; right: 10px; bottom: 14px; display: flex; gap: 8px; z-index: 3; }
  .bb { flex: 1 1 0; min-width: 0; height: 68px; border-radius: 12px; border: 1px solid var(--gold); background: rgba(42,35,26,.97); color: var(--ink); font: 700 14px var(--body); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; cursor: pointer; padding: 0 4px; text-align: center; line-height: 1.15; }
  .bb small { font: 500 11px var(--body); color: var(--muted); }
  .bb em { font: 700 11px var(--body); font-style: normal; color: #f6d77a; }
  .bb:disabled { opacity: .45; cursor: not-allowed; }
  .bb.tgt { background: var(--gold); color: #1e1408; } .bb.tgt small, .bb.tgt em { color: #3a2a12; }
  .nob { flex: 1; text-align: center; padding: 22px 8px; border-radius: 12px; background: rgba(42,35,26,.95); color: var(--muted); font-size: 13px; }
  .zchip { position: absolute; right: 10px; top: 118px; height: 34px; padding: 0 12px; border-radius: 17px; border: 1px solid #4a3d2c; background: rgba(30,25,19,.95); color: #f6d77a; font: 700 13px var(--body); cursor: pointer; z-index: 3; }
  button:focus-visible { outline: 3px solid #f6d77a; outline-offset: 2px; }`);

// help text
rep("<p>У вас <b>4 генерала</b>, у каждого малый отряд. <b>Коснитесь отряда</b> — время замедлится. Затем <b>коснитесь клетки</b>: отряд пойдёт туда. На врага — атакует его.</p>",
    "<p>У вас <b>4 генерала</b>, у каждого малый отряд и своё знамя. <b>Коснитесь знамени слева или отряда</b>: время замедлится, а внизу появятся его приказы. Затем <b>коснитесь клетки</b>: отряд пойдёт туда. На врага: атакует.</p>\n    <p>Приказы вроде <b>«Ловушка»</b> и <b>«Дождь стрел»</b> просят выбрать клетку. <b>Щипок двумя пальцами</b> приближает карту, перетаскивание сдвигает её.</p>");
rep("<b>Навык</b> включается кнопкой справа.", "<b>Приказы</b> внизу есть не у всех.");

// ---------------------------------------------------------------- boosts
rep("let G, uid = 0, started = false;", `const BOOST = {
  turtle: { name: 'Черепаха', text: 'стрелы ×0,35', kind: 'self', dur: 8, cd: 24 },
  wedge:  { name: 'Клин', text: 'разгон и мощный удар', kind: 'self', dur: 5, cd: 30, uses: 2 },
  volley: { name: 'Залп', text: 'урон ×2,5', kind: 'self', dur: 4, cd: 18 },
  rain:   { name: 'Дождь стрел', text: 'по клетке и рядом', kind: 'target', range: 250, cd: 28, uses: 2 },
  gallop: { name: 'Галоп', text: 'скорость, лес не мешает', kind: 'self', dur: 5, cd: 20 },
  rush:   { name: 'Спешка', text: 'работа ×3', kind: 'self', dur: 8, cd: 25 },
  trap:   { name: 'Ловушка', text: 'яма: урон и замедление', kind: 'target', range: 190, cd: 14, uses: 3 }
};
const BOOSTS = { tiro: [], hastati: ['turtle', 'wedge'], velites: ['volley', 'rain'], eques: ['gallop', 'wedge'], eng: ['rush', 'trap'] };
const BAN = {
  tiro: { col: '#8a8f98', trim: '#e8e0c8', emb: 'none', shape: 'square' }, hastati: { col: '#c0261b', trim: '#d9a441', emb: 'eagle', shape: 'vex' },
  velites: { col: '#2f8f4e', trim: '#eef3d2', emb: 'wolf', shape: 'pennant' }, eques: { col: '#7b3fa0', trim: '#f2e8ff', emb: 'horse', shape: 'swallow' },
  eng: { col: '#d98a1f', trim: '#2a1c10', emb: 'pick', shape: 'square' },
  e_inf: { col: '#2f6fd6', trim: '#dfe8ff', emb: 'eagle', shape: 'vex' }, e_arc: { col: '#2f6fd6', trim: '#dfe8ff', emb: 'wolf', shape: 'pennant' }, e_tower: { col: '#2f6fd6', trim: '#dfe8ff', emb: 'none', shape: 'pennant' }
};
let G, uid = 0, started = false;`);
rep("skill: d.skill || null,", "skill: d.skill || null, boosts: (BOOSTS[cls] || []).map(id => ({ id, cd: 0, left: BOOST[id].uses === undefined ? Infinity : BOOST[id].uses })),");
rep("parts: [], warn: [], waveWarned: false,", "parts: [], warn: [], waveWarned: false, traps: [], rains: [], tgt: null,");
between('function useSkill(s, quiet) {', '// one command for a squad', `function useBoost(s, idx, quiet, tr, tc) {
  if (!s || !s.alive) return false;
  const b = s.boosts[idx]; if (!b) { if (!quiet) say('У этого отряда нет такого приказа'); return false; }
  const d = BOOST[b.id];
  if (b.left <= 0) { if (!quiet) say('«' + d.name + '» закончилась'); return false; }
  if (b.cd > 0) { if (!quiet) say('«' + d.name + '»: ещё ' + Math.ceil(b.cd) + ' с'); return false; }
  if (d.kind === 'target') {
    if (tr === undefined) return false;
    const [cx, cy] = cellXY(tr, tc);
    if (Math.hypot(cx - s.x, cy - s.y) > d.range) { if (!quiet) say('Слишком далеко для «' + d.name + '»'); return false; }
    if (b.id === 'trap') {
      if (!passable(1, tr, tc) || G.occ.has(key(tr, tc)) || G.traps.some(t => t.r === tr && t.c === tc)) { if (!quiet) say('Сюда ловушку не поставить'); return false; }
      G.traps.push({ r: tr, c: tc, t: 90 }); SND.play('tool', cx);
    } else { G.rains.push({ x: cx, y: cy, t: 0, dur: 3, r: 80 }); SND.play('volley', cx); }
  } else {
    if (b.id === 'wedge') { s.wedgeT = d.dur; s.wedged = false; if (s.cls === 'eques') s.travel = 999; SND.play('wedge', s.x); }
    else { s.sk = d.dur; if (b.id === 'gallop') s.travel = 999; SND.play({ turtle: 'shield', volley: 'volley', gallop: 'gallop', rush: 'rush' }[b.id], s.x); }
  }
  b.cd = d.cd; if (b.left !== Infinity) b.left--;
  G.fx.push({ x: s.x, y: s.y, t: 0.6, big: true });
  if (!quiet) say('«' + d.name + '»: ' + d.text);
  return true;
}
const useSkill = (s, quiet) => useBoost(s, 0, quiet);
`);
rep("G.sel = s; SND.play('select');", "G.sel = s; G.tgt = null; SND.play('select');");
rep("if (s.cd > 0) s.cd = Math.max(0, s.cd - dt); if (s.hurt > 0) s.hurt -= dt;", "for (const b of s.boosts) if (b.cd > 0) b.cd = Math.max(0, b.cd - dt); s.cd = s.boosts.length ? s.boosts[0].cd : 0; if (s.hurt > 0) s.hurt -= dt; if (s.wedgeT > 0) s.wedgeT -= dt; if (s.slowT > 0) s.slowT -= dt;");
rep("let sp = s.speed * (s.sk > 0 && s.cls === 'hastati' ? 0.5 : 1) * (s.sk > 0 && s.cls === 'eques' ? 1.8 : 1);", "let sp = s.speed * (s.sk > 0 && s.cls === 'hastati' ? 0.5 : 1) * (s.sk > 0 && s.cls === 'eques' ? 1.8 : 1) * (s.wedgeT > 0 ? (s.cls === 'eques' ? 1.4 : 1.3) : 1) * (s.slowT > 0 ? 0.4 : 1);");
rep("v += 0.8 * a.n * MULT[CAV][t.kind] * (a.sk > 0 ? 1.4 : 1);", "v += 0.8 * a.n * MULT[CAV][t.kind] * (a.sk > 0 ? 1.4 : 1) * (a.wedgeT > 0 ? 1.5 : 1);");
rep("    a.clash -= dt; if (a.clash <= 0) { a.clash = ranged ? 0.5 : 0.35;", "    if (!ranged && a.wedgeT > 0 && !a.wedged && a.cls !== 'eques') { a.wedged = true; v += 0.5 * a.n * MULT[a.kind][t.kind]; G.fx.push({ x: (a.x + t.x) / 2, y: (a.y + t.y) / 2, t: 0.5, big: true }); SND.play('charge', a.x); }\n    t.pend += 0;\n    a.clash -= dt; if (a.clash <= 0) { a.clash = ranged ? 0.5 : 0.35;");
// traps and rains of arrows act on the defenders
rep("for (const f of G.fx) f.t -= dt; G.fx = G.fx.filter(f => f.t > 0);\n  for (const w of G.warn)", `for (const tr of G.traps) {
    tr.t -= dt; const [tx, ty] = cellXY(tr.r, tr.c);
    for (const e of live) if (e.side === 2 && e.ai !== 'tower' && e.alive && Math.hypot(e.x - tx, e.y - ty) < 26) { e.pend += 1.8; e.slowT = 4; tr.t = 0; G.fx.push({ x: tx, y: ty, t: 0.6, big: true }); for (let i = 0; i < 4; i++) bleed(e); SND.play('crash', tx); break; }
  }
  G.traps = G.traps.filter(t => t.t > 0);
  for (const rn of G.rains) { rn.t += dt; for (const e of live) if (e.side === 2 && e.alive && Math.hypot(e.x - rn.x, e.y - rn.y) < rn.r) { e.pend += (e.ai === 'tower' ? 0.2 : 0.55) * dt; e.hurt = 0.25; } if (Math.random() < dt * 6) SND.play('arrow', rn.x); }
  G.rains = G.rains.filter(r => r.t < r.dur);
  for (const f of G.fx) f.t -= dt; G.fx = G.fx.filter(f => f.t > 0);
  for (const w of G.warn)`);
rep("    lose: () => horn([62, 59, 55, 50, 43], [0, 0.4, 0.8, 1.2, 1.7], 0.8, true)", "    lose: () => horn([62, 59, 55, 50, 43], [0, 0.4, 0.8, 1.2, 1.7], 0.8, true),\n    wedge: p => { tone(70, 0.4, 'sine', 0.5, { to: 40, pan: p }); horn([57, 64], [0, 0.1], 0.3); }");

// ---------------------------------------------------------------- banners instead of letter badges
rep("function drawSquad(s, t) {", String.raw`function emblem(g, k, cx, cy, z, col) {
  if (k === 'none') return;
  g.fillStyle = col; g.strokeStyle = col; g.lineWidth = Math.max(1, z * 0.28); g.beginPath();
  if (k === 'eagle') { g.moveTo(cx - z, cy - z * 0.1); g.quadraticCurveTo(cx - z * 0.45, cy - z * 0.95, cx, cy - z * 0.25); g.quadraticCurveTo(cx + z * 0.45, cy - z * 0.95, cx + z, cy - z * 0.1); g.lineTo(cx + z * 0.3, cy + z * 0.6); g.lineTo(cx - z * 0.3, cy + z * 0.6); g.closePath(); g.fill(); }
  else if (k === 'wolf') { g.moveTo(cx - z * 0.8, cy - z * 0.8); g.lineTo(cx - z * 0.3, cy - z * 0.35); g.lineTo(cx + z * 0.3, cy - z * 0.35); g.lineTo(cx + z * 0.8, cy - z * 0.8); g.lineTo(cx + z * 0.7, cy + z * 0.1); g.lineTo(cx, cy + z * 0.75); g.lineTo(cx - z * 0.7, cy + z * 0.1); g.closePath(); g.fill(); }
  else if (k === 'horse') { g.moveTo(cx - z * 0.7, cy + z * 0.8); g.lineTo(cx - z * 0.5, cy - z * 0.2); g.lineTo(cx - z * 0.1, cy - z * 0.9); g.lineTo(cx + z * 0.2, cy - z * 0.7); g.lineTo(cx + z * 0.9, cy + z * 0.1); g.lineTo(cx + z * 0.6, cy + z * 0.35); g.lineTo(cx + z * 0.1, cy + z * 0.1); g.lineTo(cx + z * 0.1, cy + z * 0.8); g.closePath(); g.fill(); }
  else { g.moveTo(cx - z * 0.8, cy + z * 0.8); g.lineTo(cx + z * 0.5, cy - z * 0.5); g.stroke(); g.beginPath(); g.arc(cx + z * 0.1, cy - z * 0.1, z * 0.9, -2.5, -0.3); g.stroke(); }
}
// a squad's standard: the shape of the cloth, its colour and its emblem differ for every squad
function banner(g, x, y, st, sc, wv) {
  sc = sc || 1; wv = wv || 0; const top = y - 34 * sc, col = st.col, trim = st.trim;
  g.strokeStyle = '#5a3d20'; g.lineWidth = Math.max(1.4, 1.8 * sc); g.beginPath(); g.moveTo(x, y); g.lineTo(x, top - 3 * sc); g.stroke();
  g.fillStyle = '#d9a441'; g.beginPath(); g.arc(x, top - 4 * sc, 2.4 * sc, 0, 7); g.fill();
  g.fillStyle = col; g.strokeStyle = trim; g.lineWidth = Math.max(1, 1.3 * sc);
  let ex, ey; g.beginPath();
  if (st.shape === 'vex') { g.fillStyle = '#5a3d20'; g.fillRect(x - 9 * sc, top, 18 * sc, 2 * sc); g.fillStyle = col; g.beginPath(); g.rect(x - 8 * sc, top + 2 * sc, 16 * sc, 17 * sc); ex = x; ey = top + 11 * sc; g.fill(); g.stroke(); g.fillStyle = trim; for (let i = 0; i < 4; i++) g.fillRect(x - 8 * sc + i * 4.4 * sc, top + 19 * sc, 2.4 * sc, 3.4 * sc); }
  else if (st.shape === 'pennant') { g.moveTo(x, top); g.lineTo(x + 24 * sc, top + 5 * sc + wv); g.lineTo(x, top + 10 * sc); g.closePath(); g.fill(); g.stroke(); ex = x + 7 * sc; ey = top + 5 * sc; }
  else if (st.shape === 'swallow') { g.moveTo(x, top); g.lineTo(x + 19 * sc, top + wv * 0.5); g.lineTo(x + 13 * sc, top + 8 * sc); g.lineTo(x + 19 * sc, top + 16 * sc + wv * 0.5); g.lineTo(x, top + 16 * sc); g.closePath(); g.fill(); g.stroke(); ex = x + 8 * sc; ey = top + 8 * sc; }
  else { g.rect(x, top, 16 * sc, 15 * sc); g.fill(); g.stroke(); ex = x + 8 * sc; ey = top + 7.5 * sc; }
  if (sc >= 0.8) emblem(g, st.emb, ex, ey, 4 * sc, trim);
}
function paintRail() {
  G.rome.forEach((s, i) => { const g = $('rbc' + i).getContext('2d'); g.clearRect(0, 0, 64, 64); banner(g, 20, 58, BAN[s.cls], 1.4); });
}
function drawSquad(s, t) {`);
between("    const fx = s.x - s.face * 23", "    for (const [i, px, py] of pts) drawMan(", "    banner(ctx, s.x - s.face * 23, s.y + 14, BAN[s.cls] || BAN.e_inf, 0.95, Math.sin(t * 5 + s.id) * 1.6);\n");
between("  if (s.side === 1) {\n    const bx = s.x, by = s.y - 46;", "  const f = s.n / s.max, bw = 34,", "  if (G.sel === s) { ctx.strokeStyle = '#f6d77a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(s.x, s.y + 8, 34, 26, 0, 0, Math.PI * 2); ctx.stroke(); }\n");

// ---------------------------------------------------------------- camera: pinch to zoom, drag to pan
rep("  ctx.clearRect(0, 0, W, H);\n  if (G.dirty || !TERR) renderTerrain();", "  ctx.clearRect(0, 0, W, H);\n  if (G.dirty || !TERR) renderTerrain();\n  ctx.save(); ctx.beginPath(); ctx.rect(0, OY, W, VH); ctx.clip(); ctx.translate(W / 2, OY + VH / 2); ctx.scale(cam.z, cam.z); ctx.translate(-cam.cx, -cam.cy);");
rep("  ctx.drawImage(TERR, 0, 0, W, H);\n  ctx.drawImage(DEC, 0, 0, W, H);", "  ctx.fillStyle = '#3f2717'; ctx.fillRect(0, OY - 400, W, OY + ROWS * CS + 800); ctx.drawImage(TERR, 0, 0, W, H);\n  ctx.drawImage(DEC, 0, 0, W, H);");
rep("  if (sel) { ctx.fillStyle = 'rgba(30,60,110,.07)'; ctx.fillRect(0, OY, W, ROWS * CS); }\n  hud();", "  if (sel) { ctx.fillStyle = 'rgba(30,60,110,.07)'; ctx.fillRect(0, OY, W, ROWS * CS); }\n  ctx.restore();\n  hud();");
// traps, rains and the targeting ring, under the squads
rep("  for (const s of G.sq.filter(s => s.alive).sort((a, b) => a.y - b.y)) drawSquad(s, t);", `  for (const tr of G.traps) { const [x, y] = cellXY(tr.r, tr.c); ctx.fillStyle = 'rgba(40,25,10,.55)'; ctx.beginPath(); ctx.ellipse(x, y + 4, 22, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#c9c2b0'; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(x + i * 7 - 3, y + 6); ctx.lineTo(x + i * 7, y - 8); ctx.lineTo(x + i * 7 + 3, y + 6); ctx.fill(); } }
  for (const rn of G.rains) { ctx.fillStyle = 'rgba(192,38,27,.12)'; ctx.strokeStyle = 'rgba(192,38,27,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(rn.x, rn.y, rn.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#5a1510'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 20; i++) { const a = i * 2.39996 + rn.t, rr = rn.r * Math.sqrt((i + 0.5) / 20), x = rn.x + Math.cos(a) * rr, y = rn.y + Math.sin(a) * rr, f = ((t * 3 + i * 0.37) % 1); ctx.beginPath(); ctx.moveTo(x - 2, y - 46 * (1 - f) - 8); ctx.lineTo(x, y - 46 * (1 - f)); ctx.stroke(); } }
  if (G.tgt && G.tgt.s.alive) { const d = BOOST[G.tgt.s.boosts[G.tgt.idx].id]; ctx.strokeStyle = 'rgba(246,215,122,.85)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -t * 14; ctx.beginPath(); ctx.arc(G.tgt.s.x, G.tgt.s.y, d.range, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
  for (const s of G.sq.filter(s => s.alive).sort((a, b) => a.y - b.y)) drawSquad(s, t);`);
rep("  ph.textContent = G.sel ? '⏳ Замедление · выберите клетку' :", "  ph.textContent = G.tgt ? '🎯 Коснитесь клетки для «' + BOOST[G.tgt.s.boosts[G.tgt.idx].id].name + '»' : G.sel ? '⏳ Замедление · выберите клетку' :");
rep("  uiCards();\n}\nfunction uiCards() {", "  $('zoomchip').hidden = cam.z < 1.02; $('zoomchip').textContent = cam.z.toFixed(1).replace('.', ',') + '× ⟲';\n  uiCards();\n}\nfunction uiCards() {");

// ---------------------------------------------------------------- the rail and the boost bar
between('function uiCards() {', '// ---------------------------------------------------------------- input', `let boostSel = null, railPainted = null;
function uiCards() {
  if (railPainted !== G) { railPainted = G; paintRail(); boostSel = null; }
  G.rome.forEach((s, i) => {
    const b = $('rb' + i), f = Math.max(0, s.n) / s.max;
    b.className = 'rb' + (G.sel === s ? ' sel' : '') + (!s.alive ? ' dead' : '') + (s.sk > 0 || s.wedgeT > 0 ? ' act' : '');
    if (b.style.setProperty) { b.style.setProperty('--hp', Math.round(f * 100)); b.style.setProperty('--c', f > 0.5 ? '#6fd17a' : f > 0.25 ? '#f2c14e' : '#ef6b5a'); }
    b.title = s.name + ' · ' + CLS[s.cls].name;
  });
  const sel = G.sel && G.sel.alive ? G.sel : null, bar = $('boosts');
  if (!sel) { if (boostSel) { bar.hidden = true; bar.innerHTML = ''; boostSel = null; } return; }
  if (boostSel !== sel) {
    boostSel = sel; bar.hidden = false;
    bar.innerHTML = sel.boosts.length ? sel.boosts.map((b, i) => '<button class="bb" id="bb' + i + '" type="button"></button>').join('') : '<span class="nob">У ' + CLS[sel.cls].name.toLowerCase() + ' нет приказов</span>';
    sel.boosts.forEach((b, i) => $('bb' + i).addEventListener('click', () => boostPress(i)));
  }
  sel.boosts.forEach((b, i) => {
    const d = BOOST[b.id], el = $('bb' + i);
    const st = b.left <= 0 ? 'закончилась' : b.cd > 0 ? 'ещё ' + Math.ceil(b.cd) + ' с' : (b.left !== Infinity ? 'осталось ' + b.left : (i === 0 && sel.sk > 0 ? 'действует' : 'готово'));
    const h = '<span>' + d.name + '</span><small>' + d.text + '</small><em>' + st + '</em>', cls = 'bb' + (G.tgt && G.tgt.idx === i ? ' tgt' : '');
    if (el._h !== h) { el.innerHTML = h; el._h = h; } if (el._c !== cls) { el.className = cls; el._c = cls; }
    el.disabled = b.cd > 0 || b.left <= 0;
  });
}
function boostPress(i) {
  const s = G.sel; if (!s || !s.alive || G.over) return; const b = s.boosts[i]; if (!b) return; const d = BOOST[b.id];
  if (d.kind === 'target') { if (b.cd > 0 || b.left <= 0) { useBoost(s, i); return; } G.tgt = G.tgt && G.tgt.idx === i ? null : { s, idx: i }; if (G.tgt) say('Коснитесь клетки для «' + d.name + '»'); }
  else { G.tgt = null; useBoost(s, i); }
  uiCards();
}

`);

// ---------------------------------------------------------------- input
between('const pos = e => {', "$('restart').addEventListener('click'", `const cam = { z: 1, cx: W / 2, cy: OY + ROWS * CS / 2 }, VH = H - OY;
function clampCam() {
  const hw = W / 2 / cam.z, hh = VH / 2 / cam.z, y0 = OY, y1 = OY + ROWS * CS;
  cam.cx = hw * 2 >= W ? W / 2 : Math.max(hw, Math.min(W - hw, cam.cx));
  cam.cy = hh * 2 >= y1 - y0 ? (y0 + y1) / 2 : Math.max(y0 + hh, Math.min(y1 - hh, cam.cy));
}
const toWorld = (sx, sy) => [(sx - W / 2) / cam.z + cam.cx, (sy - (OY + VH / 2)) / cam.z + cam.cy];
const scr = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
function tapAt(x, y) {
  if (G.tgt) {
    const { s: ts, idx } = G.tgt, [r, c] = cellAt(x, y);
    if (useBoost(ts, idx, false, r, c)) { G.tgt = null; G.sel = null; }
    uiCards(); return;
  }
  const mine = alive(1).map(s => [s, Math.hypot(s.x - x, s.y - y)]).filter(([, d]) => d < 34).sort((a, b) => a[1] - b[1])[0];
  if (mine) { select(mine[0]); uiCards(); return; }
  const sel = G.sel; if (!sel || !sel.alive) { say('Коснитесь своего отряда или его знамени слева'); return; }
  const [r, c] = cellAt(x, y); G.sel = null;
  cmd(sel, r, c); uiCards();
}
const ptrs = new Map(); let gest = null;
cv.addEventListener('pointerdown', e => {
  if (G.over || !started) return; const p = scr(e); if (p[1] < OY) return;
  ptrs.set(e.pointerId, { x: p[0], y: p[1], sx: p[0], sy: p[1] }); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  if (ptrs.size === 1) gest = { moved: false, pinch: false };
  else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; gest = { moved: true, pinch: true, d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: cam.z, w0: toWorld((a.x + b.x) / 2, (a.y + b.y) / 2) }; }
});
cv.addEventListener('pointermove', e => {
  const q = ptrs.get(e.pointerId); if (!q || !gest) return; const p = scr(e), dx = p[0] - q.x, dy = p[1] - q.y; q.x = p[0]; q.y = p[1];
  if (gest.pinch && ptrs.size >= 2) {
    const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y); cam.z = Math.max(1, Math.min(2.6, gest.z0 * d / gest.d0));
    cam.cx = gest.w0[0] - ((a.x + b.x) / 2 - W / 2) / cam.z; cam.cy = gest.w0[1] - ((a.y + b.y) / 2 - (OY + VH / 2)) / cam.z; clampCam();
  } else if (ptrs.size === 1) {
    if (!gest.moved && Math.hypot(q.x - q.sx, q.y - q.sy) > 9) gest.moved = true;
    if (gest.moved && cam.z > 1.01) { cam.cx -= dx / cam.z; cam.cy -= dy / cam.z; clampCam(); }
  }
});
const endPtr = e => {
  const q = ptrs.get(e.pointerId); if (!q) return; ptrs.delete(e.pointerId);
  if (gest && !gest.moved && !gest.pinch && ptrs.size === 0 && e.type === 'pointerup') { const [x, y] = toWorld(q.x, q.y); if (y >= OY && y <= OY + ROWS * CS) tapAt(x, y); }
  if (ptrs.size === 0) gest = null;
};
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', e => { e.preventDefault(); const p = scr(e), w0 = toWorld(p[0], p[1]); cam.z = Math.max(1, Math.min(2.6, cam.z * Math.pow(1.0015, -e.deltaY))); cam.cx = w0[0] - (p[0] - W / 2) / cam.z; cam.cy = w0[1] - (p[1] - (OY + VH / 2)) / cam.z; clampCam(); }, { passive: false });
$('zoomchip').addEventListener('click', () => { cam.z = 1; clampCam(); });
for (let i = 0; i < 4; i++) $('rb' + i).addEventListener('click', () => { if (G.over || !started) return; const s = G.rome[i]; if (!s.alive) { say('Генерал ' + s.name + ' ранен'); return; } select(s); uiCards(); });
`);
fs.writeFileSync(F, s);
console.log('ok v4', s.length);
