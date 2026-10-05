// v6: stone-slab tiles, relief that is lifted off the ground, our own camp at the start, worlds wider than the screen.
const fs = require('fs'), path = require('path');
const F = path.join(__dirname, 'castle.html');
let s = fs.readFileSync(F, 'utf8');
function rep(a, b) { const i = s.indexOf(a); if (i < 0 || s.indexOf(a, i + 1) >= 0) { console.error('MISS', a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); }
function between(a, b, body) { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) { console.error('MISS range', a.slice(0, 60), '|', b.slice(0, 40)); process.exit(1); } s = s.slice(0, i) + body + s.slice(j); }

// ---------------------------------------------------------------- the world is 13 cells wide: sideways panning
rep("const CS = 60, COLS = 9, OY = 90; let ROWS = 14;", "const CS = 60, COLS = 13, OY = 90, WW = COLS * CS; let ROWS = 14;");
rep("RS = Math.min(2.4, DPR * 1.3);", "RS = Math.min(2, DPR * 1.2);");
rep("DEC.width = W * RS;", "DEC.width = WW * RS;");
// maps are written 9 cells wide and padded to 13 with the same terrain continuing outward; our camp and the positions shift with them
rep("let curMap = 'city', M = MAPS.city;", String.raw`MAPS.city.camp = { r: 19, c: 4, rad: 2.6 }; MAPS.hill.camp = { r: 20, c: 4, rad: 2.6 }; MAPS.castle.camp = { r: 12, c: 4, rad: 2.6 };
MAPS.city.start = [[19, 3], [19, 5], [19, 2], [19, 4]]; MAPS.hill.start = [[20, 3], [20, 5], [21, 3], [21, 5]]; MAPS.castle.start = [[11, 3], [11, 5], [12, 3], [12, 5]];
(function padMaps(L, R) {
  for (const m of Object.values(MAPS)) {
    let sd = m.id.length * 977 + 13; const rnd = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
    const conv = ch => 'wdbR'.includes(ch) ? 'w' : 'hJPCa'.includes(ch) ? 'h' : 'uVA'.includes(ch) ? 'u' : 'HQTWGKBp'.includes(ch) ? '.' : ch;
    const edge = (ch, outer) => { const k = conv(ch); return k === '.' ? (rnd() < (outer ? 0.55 : 0.3) ? 'f' : '.') : k; };
    m.rows = m.rows.map(row => { let a = '', b = ''; for (let i = 0; i < L; i++) a += edge(row[0], i === 0); for (let i = 0; i < R; i++) b += edge(row[row.length - 1], i === R - 1); return a.split('').reverse().join('') + row + b; });
    m.start = m.start.map(([r, c]) => [r, c + L]); m.camp.c += L;
    m.points.forEach(p => { p.c += L; });
    m.enemies.forEach(e => { e[1] += L; if (e[6]) e[6] = e[6].map(([r, c]) => [r, c + L]); });
  }
})(2, 2);
let curMap = 'city', M = MAPS.city;
const inCamp = (r, c) => M.camp && Math.hypot(r - M.camp.r, c - M.camp.c) <= M.camp.rad;`);
// the enemy does not enter our camp
rep("  if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return false;\n  const ch = T[r][c];", "  if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return false;\n  if (side === 2 && inCamp(r, c)) return false;\n  const ch = T[r][c];");
rep("else if (!hostile) for (const q of mine) if (q.n < q.max) q.n = Math.min(q.max, q.n + 0.5 * dt);\n  }\n", `else if (!hostile) for (const q of mine) if (q.n < q.max) q.n = Math.min(q.max, q.n + 0.5 * dt);
  }
  if (M.camp) for (const q of live) if (q.side === 1 && !q.moving && q.n < q.max && inCamp(q.r, q.c) && !live.some(e => e.side === 2 && e.ai !== 'tower' && dist(e, q) < 130)) q.n = Math.min(q.max, q.n + 0.3 * dt);
`);
rep("cam.z = 1; cam.cx = W / 2; cam.cy = WORLD_H();", "cam.z = 1; cam.cx = cellXY(M.camp.r, M.camp.c)[0]; cam.cy = WORLD_H();");

// ---------------------------------------------------------------- slabs, lift and the new terrain passes
rep("let TERR = null;\nfunction renderTerrain() {", String.raw`// every vertex of the cell mesh is nudged a little, so cells are uneven stone slabs; raised cells are lifted E pixels per level
const E = 16, JIT = 8;
function jit(r, c, k) { let h = Math.imul(r + 1, 73856093) ^ Math.imul(c + 1, 19349663) ^ Math.imul(k, 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return ((h >>> 0) / 4294967296 - 0.5) * 2; }
const vx = (r, c) => c <= 0 || c >= COLS ? c * CS : c * CS + jit(r, c, 1) * JIT;
const vy = (r, c) => OY + r * CS + (r <= 0 || r >= ROWS ? 0 : jit(r, c, 2) * JIT);
function cellPoly(r, c, lift, inset) {
  const p = [[vx(r, c), vy(r, c)], [vx(r, c + 1), vy(r, c + 1)], [vx(r + 1, c + 1), vy(r + 1, c + 1)], [vx(r + 1, c), vy(r + 1, c)]];
  const cx = (p[0][0] + p[1][0] + p[2][0] + p[3][0]) / 4, cy = (p[0][1] + p[1][1] + p[2][1] + p[3][1]) / 4;
  return p.map(([x, y]) => { const dx = cx - x, dy = cy - y, d = Math.hypot(dx, dy) || 1; return [x + dx / d * inset, y + dy / d * inset - lift]; });
}
function polyPath(g, p) { g.beginPath(); p.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
function slabPath(g, p) {
  const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; g.beginPath(); const s0 = m(p[3], p[0]); g.moveTo(s0[0], s0[1]);
  for (let i = 0; i < 4; i++) { const a = p[i], e = m(p[i], p[(i + 1) % 4]); g.quadraticCurveTo(a[0], a[1], e[0], e[1]); } g.closePath();
}
function inPoly(x, y, p) { let q = 0; for (let i = 0; i < 4; i++) { const a = p[i], b = p[(i + 1) % 4], cr = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]); if (cr > 0) q++; else if (cr < 0) q--; } return Math.abs(q) === 4; }
// the cell under a point, as drawn: the southern (front) slab wins where raised cells overlap
function pickCell(x, y) {
  const r0 = Math.floor((y - OY) / CS), c0 = Math.floor(x / CS);
  for (let r = Math.min(ROWS - 1, r0 + 3); r >= Math.max(0, r0 - 2); r--) for (let c = Math.max(0, c0 - 1); c <= Math.min(COLS - 1, c0 + 1); c++) if (inPoly(x, y, cellPoly(r, c, HG(T[r][c]) * E, 0))) return [r, c];
  return cellAt(x, y);
}
// how high a squad stands above the ground, blended while it walks a ramp
function liftAt(s) {
  let h = hgt(s.r, s.c);
  if (s.to) { const [tx, ty] = cellXY(s.to[0], s.to[1]), [fx, fy] = cellXY(s.r, s.c), tot = Math.hypot(tx - fx, ty - fy) || 1, p = Math.min(1, Math.hypot(s.x - fx, s.y - fy) / tot); h += (hgt(s.to[0], s.to[1]) - h) * p; }
  return h * E;
}
let TERR = null;
function renderTerrain() {`);
rep("const c = document.createElement('canvas'); c.width = W * RS; c.height = WORLD_H() * RS;\n  const g = c.getContext('2d'); g.scale(RS, RS);\n  let sd = 5;", "const c = document.createElement('canvas'); c.width = WW * RS; c.height = WORLD_H() * RS;\n  const g = c.getContext('2d'); g.scale(RS, RS);\n  let sd = 5;");
rep("g.fillStyle = '#3f2717'; g.fillRect(0, 0, W, WORLD_H()); g.fillStyle = gr; g.fillRect(0, OY, W, ROWS * CS); g.fillStyle = '#b9c689'; g.fillRect(0, OY + ROWS * CS, W, PAD);", "g.fillStyle = '#3f2717'; g.fillRect(0, 0, WW, WORLD_H()); g.fillStyle = gr; g.fillRect(0, OY, WW, ROWS * CS); g.fillStyle = '#b9c689'; g.fillRect(0, OY + ROWS * CS, WW, PAD);");
rep("for (let i = 0; i < 80; i++) { g.fillStyle = rnd() < .5 ? 'rgba(110,145,65,.2)' : 'rgba(235,240,165,.24)'; g.beginPath(); g.ellipse(rnd() * W,", "for (let i = 0; i < 115; i++) { g.fillStyle = rnd() < .5 ? 'rgba(110,145,65,.2)' : 'rgba(235,240,165,.24)'; g.beginPath(); g.ellipse(rnd() * WW,");
rep("for (let i = 0; i < 260; i++) { const x = rnd() * W,", "for (let i = 0; i < 380; i++) { const x = rnd() * WW,");
between('  // pass 1: the ground itself', '  // pass 3: standing things', String.raw`  // pass 1: the top of every cell, an uneven slab; raised cells are lifted off the ground
  for (let r = 0; r < ROWS; r++) for (let cc = 0; cc < COLS; cc++) {
    const ch = T[r][cc], hh = HG(ch), lift = hh * E, x = cc * CS, y = OY + r * CS - lift, cx = x + CS / 2, cy = y + CS / 2;
    if (isWater(ch)) {
      const P = cellPoly(r, cc, 0, -1.5); polyPath(g, P); g.fillStyle = '#5b97c2'; g.fill();
      g.save(); polyPath(g, P); g.clip(); g.fillStyle = 'rgba(40,90,140,.25)'; g.fillRect(x, y + CS - 14, CS, 16);
      g.strokeStyle = 'rgba(190,225,245,.75)'; g.lineWidth = 1.6; g.lineCap = 'round';
      for (let k = 0; k < 3; k++) { const wx = x + 6 + rnd() * 40, wy = y + 10 + k * 17 + rnd() * 6; g.beginPath(); g.moveTo(wx, wy); g.quadraticCurveTo(wx + 7, wy - 4, wx + 14, wy); g.stroke(); }
      if (r > 0 && !isWater(at(r - 1, cc))) { g.fillStyle = '#d4d6a0'; g.fillRect(x - 2, y - 2, CS + 4, 8); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, y + 6, CS, 3); }
      if (r < ROWS - 1 && !isWater(at(r + 1, cc))) { g.fillStyle = '#d4d6a0'; g.fillRect(x - 2, y + CS - 6, CS + 4, 8); }
      g.restore();
    } else if (ch === 'p' || ch === 'a' || ch === 'A' || ch === 'G' || ch === 'g') {
      const rp = ch === 'a' || ch === 'A'; g.fillStyle = rp ? '#cfb785' : '#d6c08a';
      if (rp) {
        const P = cellPoly(r, cc, lift, -1.5); polyPath(g, P); g.fill(); g.save(); polyPath(g, P); g.clip();
        g.strokeStyle = 'rgba(120,95,55,.55)'; g.lineWidth = 1.5; for (let k = -2; k < 5; k++) { g.beginPath(); g.moveTo(x + k * 14, y + CS); g.lineTo(x + k * 14 + 22, y); g.stroke(); }
        const sg2 = g.createLinearGradient(0, y, 0, y + CS); sg2.addColorStop(0, 'rgba(255,255,230,.25)'); sg2.addColorStop(1, 'rgba(60,40,15,.25)'); g.fillStyle = sg2; g.fillRect(x, y, CS, CS); g.restore();
      } else {
        g.beginPath(); g.arc(cx, cy, 19, 0, 7); g.fill();
        if (roadish(at(r - 1, cc))) g.fillRect(cx - 19, y, 38, CS / 2); if (roadish(at(r + 1, cc))) g.fillRect(cx - 19, cy, 38, CS / 2);
        if (roadish(at(r, cc - 1))) g.fillRect(x, cy - 19, CS / 2, 38); if (roadish(at(r, cc + 1))) g.fillRect(cx, cy - 19, CS / 2, 38);
      }
    } else if (hh >= 1) {
      const P = cellPoly(r, cc, lift, -1.5); polyPath(g, P); g.fillStyle = hh >= 2 ? '#cdd69b' : '#c4cf93'; g.fill();
      g.save(); polyPath(g, P); g.clip(); g.fillStyle = 'rgba(255,255,220,.22)'; g.fillRect(x, y, CS, CS / 2); g.fillStyle = 'rgba(70,90,35,.12)'; g.fillRect(x, y + CS * 0.7, CS, CS * 0.3);
      g.strokeStyle = 'rgba(95,115,55,.4)'; g.lineWidth = 1; for (let k = 0; k < 6; k++) { const px = x + 5 + rnd() * 50, py = y + 6 + rnd() * 46; g.beginPath(); g.moveTo(px, py); g.lineTo(px - 1.5, py - 4); g.stroke(); } g.restore();
    }
    if (M.id === 'castle' && (r >= 2 && r <= 3 && cc >= 4 && cc <= 8 || (r === 1 && cc === 6))) {
      const P = cellPoly(r, cc, 0, -1.5); polyPath(g, P); g.fillStyle = '#cbc1aa'; g.fill(); g.save(); polyPath(g, P); g.clip(); g.strokeStyle = 'rgba(90,80,65,.35)'; g.lineWidth = 1;
      for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x, y + k * 15); g.lineTo(x + CS, y + k * 15); g.stroke(); }
      for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) { const bx = x + (k % 2 ? 10 : 20) + j * 20; g.beginPath(); g.moveTo(bx, y + k * 15); g.lineTo(bx, y + k * 15 + 15); g.stroke(); } g.restore();
    }
  }
  // pass 2: cliff faces under raised cells, their side edges and the shadows they throw
  for (let r = 0; r < ROWS; r++) for (let cc = 0; cc < COLS; cc++) {
    const ch = T[r][cc], hh = HG(ch); if (hh < 1 || ch === 'a' || ch === 'A') continue;
    const lift = hh * E;
    const lowerBy = (nr, nc) => { if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) return 0; const n = T[nr][nc]; if (n === 'x' || n === 'a' || n === 'A' || wallish(n)) return 0; const d = hh - HG(n); return d >= 1 ? d : 0; };
    const ds = lowerBy(r + 1, cc);
    if (ds) {
      const A = [vx(r + 1, cc), vy(r + 1, cc) - lift], B = [vx(r + 1, cc + 1), vy(r + 1, cc + 1) - lift], h2 = ds * E;
      const y0 = Math.min(A[1], B[1]), cg = g.createLinearGradient(0, y0, 0, Math.max(A[1], B[1]) + h2); cg.addColorStop(0, '#b09470'); cg.addColorStop(1, '#58442f');
      g.fillStyle = cg; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.lineTo(B[0], B[1] + h2); g.lineTo(A[0], A[1] + h2); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(48,34,20,.55)'; g.lineWidth = 1.2; for (let k = 1; k <= ds * 2; k++) { const f = k / (ds * 2 + 1); g.beginPath(); g.moveTo(A[0], A[1] + h2 * f + (k % 2 ? 1.5 : -1)); g.lineTo(B[0], B[1] + h2 * f + (k % 2 ? -1 : 1.5)); g.stroke(); }
      g.strokeStyle = 'rgba(48,34,20,.4)'; for (let k = 1; k < 5; k++) { const f = k / 5, px = A[0] + (B[0] - A[0]) * f, py = A[1] + (B[1] - A[1]) * f; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (k % 2 ? 2 : -2), py + h2 * 0.8); g.stroke(); }
      g.strokeStyle = '#dfe9ae'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke();
      const sy0 = Math.max(A[1], B[1]) + h2, sg = g.createLinearGradient(0, sy0, 0, sy0 + 22); sg.addColorStop(0, 'rgba(25,30,10,.42)'); sg.addColorStop(1, 'rgba(25,30,10,0)');
      g.fillStyle = sg; g.beginPath(); g.moveTo(A[0], A[1] + h2); g.lineTo(B[0], B[1] + h2); g.lineTo(B[0] + 6, B[1] + h2 + 22); g.lineTo(A[0] + 6, A[1] + h2 + 22); g.closePath(); g.fill();
    }
    if (lowerBy(r, cc - 1)) { const P0 = [vx(r, cc), vy(r, cc) - lift], P1 = [vx(r + 1, cc), vy(r + 1, cc) - lift]; g.strokeStyle = '#6b5640'; g.lineWidth = 5; g.beginPath(); g.moveTo(P0[0] + 2, P0[1]); g.lineTo(P1[0] + 2, P1[1]); g.stroke(); g.strokeStyle = '#dfe9ae'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(P0[0] + 5, P0[1]); g.lineTo(P1[0] + 5, P1[1]); g.stroke(); }
    if (lowerBy(r, cc + 1)) {
      const P0 = [vx(r, cc + 1), vy(r, cc + 1) - lift], P1 = [vx(r + 1, cc + 1), vy(r + 1, cc + 1) - lift]; g.strokeStyle = '#6b5640'; g.lineWidth = 5; g.beginPath(); g.moveTo(P0[0] - 2, P0[1]); g.lineTo(P1[0] - 2, P1[1] + (ds ? ds * E : 0)); g.stroke();
      const eg = g.createLinearGradient(P0[0], 0, P0[0] + 18, 0); eg.addColorStop(0, 'rgba(25,30,10,.34)'); eg.addColorStop(1, 'rgba(25,30,10,0)'); g.fillStyle = eg; g.fillRect(P0[0], P0[1] + 6, 18, CS + (ds ? ds * E : 0));
    }
    if (lowerBy(r - 1, cc)) { g.strokeStyle = 'rgba(90,110,50,.4)'; g.lineWidth = 3; g.beginPath(); g.moveTo(vx(r, cc), vy(r, cc) - lift + 1); g.lineTo(vx(r, cc + 1), vy(r, cc + 1) - lift + 1); g.stroke(); }
  }
`);
rep("    const ch = T[r][cc], x = cc * CS, y = OY + r * CS, cx = x + CS / 2, cy = y + CS / 2;\n    if (ch === 'H' || ch === 'J' || ch === 'V') {", "    const ch = T[r][cc], lift = HG(ch) * E, x = cc * CS, y = OY + r * CS - lift, cx = x + CS / 2, cy = y + CS / 2;\n    if (ch === 'H' || ch === 'J' || ch === 'V') {");

// ---------------------------------------------------------------- drawing: widths, lift, slab tiles, our camp
rep("ctx.fillRect(0, OY - 600, W, WORLD_H() + 1200); ctx.drawImage(TERR, 0, 0, W, WORLD_H());\n  ctx.drawImage(DEC, 0, 0, W, WORLD_H());", "ctx.fillRect(-800, OY - 600, WW + 1600, WORLD_H() + 1200); ctx.drawImage(TERR, 0, 0, WW, WORLD_H());\n  ctx.drawImage(DEC, 0, 0, WW, WORLD_H());\n  drawCamp(t);");
rep("function drawSquad(s, t) {", "function drawCamp(t) {\n  if (!M.camp) return; const [cx, cy] = cellXY(M.camp.r, M.camp.c), R = M.camp.rad * CS;\n  ctx.save(); ctx.fillStyle = 'rgba(122,92,52,.3)'; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.92, 0, 0, 7); ctx.fill();\n  ctx.strokeStyle = 'rgba(90,64,34,.4)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]);\n  for (let a = 0; a < 360; a += 8) { if (Math.abs(a - 270) < 14) continue; const rd = a * Math.PI / 180, x = cx + Math.cos(rd) * R, y = cy + Math.sin(rd) * R * 0.92;\n    ctx.fillStyle = '#8a6a3c'; ctx.fillRect(x - 2, y - 11, 4, 12); ctx.fillStyle = '#5a3d20'; ctx.beginPath(); ctx.moveTo(x - 2, y - 11); ctx.lineTo(x, y - 17); ctx.lineTo(x + 2, y - 11); ctx.fill(); }\n  for (const [dx, dy] of [[-R * 0.5, R * 0.55], [0, R * 0.72], [R * 0.5, R * 0.55]]) { const x = cx + dx, y = cy + dy; ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x, y + 8, 28, 8, 0, 0, 7); ctx.fill();\n    ctx.fillStyle = '#c0261b'; ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - 24, y + 8); ctx.lineTo(x, y - 24); ctx.lineTo(x + 24, y + 8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#2a1c10'; ctx.beginPath(); ctx.moveTo(x - 7, y + 8); ctx.lineTo(x, y - 8); ctx.lineTo(x + 7, y + 8); ctx.fill(); }\n  const fx = cx - R * 0.55, fy = cy + R * 0.35; ctx.fillStyle = '#4a3420'; ctx.fillRect(fx - 9, fy + 2, 18, 4); const fl = 8 + Math.sin(t * 14) * 2; ctx.fillStyle = '#f08a24'; ctx.beginPath(); ctx.moveTo(fx - 6, fy + 2); ctx.quadraticCurveTo(fx, fy - fl * 2, fx + 6, fy + 2); ctx.fill(); ctx.fillStyle = '#ffd35a'; ctx.beginPath(); ctx.moveTo(fx - 3, fy + 2); ctx.quadraticCurveTo(fx, fy - fl, fx + 3, fy + 2); ctx.fill();\n  banner(ctx, cx + R * 0.15, cy + R * 0.9, BAN.hastati, 1.1, Math.sin(t * 4) * 1.5);\n  ctx.font = '700 12px Alegreya Sans, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(30,25,19,.88)'; ctx.fillRect(cx - 38, cy - R - 26, 76, 17); ctx.fillStyle = '#ff9a8c'; ctx.fillText('Наш лагерь', cx, cy - R - 13);\n  ctx.restore();\n}\nfunction drawSquad(s, t) { const l = liftAt(s); ctx.save(); ctx.translate(0, -l); drawSquadBase(s, t); ctx.restore(); }\nfunction drawSquadBase(s, t) {");
rep("const [x, y] = cellXY(p.r, p.c), mine = p.owner === 1,", "const [x, y0] = cellXY(p.r, p.c), y = y0 - hgt(p.r, p.c) * E, mine = p.owner === 1,");
rep("for (const tr of G.traps) { const [x, y] = cellXY(tr.r, tr.c);", "for (const tr of G.traps) { const [x, y0] = cellXY(tr.r, tr.c), y = y0 - hgt(tr.r, tr.c) * E;");
between("    const { D } = dijkstra(sel);\n    ctx.save(); ctx.lineWidth = 1;", "    const R = reach(sel);", String.raw`    const { D } = dijkstra(sel);
    ctx.save(); ctx.lineJoin = 'round';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const ch = T[r][c], P = cellPoly(r, c, HG(ch) * E, 5);
      if (D[key(r, c)] < 1e8 && !(r === sel.r && c === sel.c)) {
        slabPath(ctx, P); ctx.fillStyle = 'rgba(255,248,226,.3)'; ctx.fill(); ctx.strokeStyle = 'rgba(70,52,30,.35)'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,252,238,.7)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(P[3][0] + 3, P[3][1] - 2); ctx.lineTo(P[0][0] + 3, P[0][1] + 3); ctx.lineTo(P[1][0] - 3, P[1][1] + 3); ctx.stroke();
      } else if (sel.cls === 'eng' && (ch === 'R' || ch === 'W' || ch === 'G' || ch === 'Q' || ch === 'P')) {
        slabPath(ctx, cellPoly(r, c, HG(ch) * E, 3)); ctx.strokeStyle = '#f6d77a'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 4]); ctx.lineDashOffset = -t * 12; ctx.stroke(); ctx.setLineDash([]);
      }
    }
`);
rep("ctx.fillStyle = 'rgba(30,60,110,.07)'; ctx.fillRect(0, OY, W, ROWS * CS); }", "ctx.fillStyle = 'rgba(30,60,110,.07)'; ctx.fillRect(0, OY, WW, ROWS * CS); }");

// ---------------------------------------------------------------- input: pick the slab that is drawn under the finger
rep("const mine = alive(1).map(s => [s, Math.hypot(s.x - x, s.y - y)])", "const mine = alive(1).map(s => [s, Math.hypot(s.x - x, s.y - liftAt(s) - y)])");
rep("const { s: ts, idx } = G.tgt, [r, c] = cellAt(x, y);", "const { s: ts, idx } = G.tgt, [r, c] = pickCell(x, y);");
rep("const [r, c] = cellAt(x, y); G.sel = null;", "const [r, c] = pickCell(x, y); G.sel = null;");

// ---------------------------------------------------------------- camera and minimap use the world width
rep("const cam = { z: 1, cx: W / 2, cy: OY + ROWS * CS / 2 }, VH = H - OY;", "const cam = { z: 1, cx: WW / 2, cy: OY + ROWS * CS / 2 }, VH = H - OY;");
rep("cam.cx = hw * 2 >= W ? W / 2 : Math.max(hw, Math.min(W - hw, cam.cx));", "cam.cx = hw * 2 >= WW ? WW / 2 : Math.max(hw, Math.min(WW - hw, cam.cx));");
rep("const zMin = () => Math.min(1, VH / (ROWS * CS + PAD));", "const zMin = () => Math.min(1, VH / (ROWS * CS + PAD), W / WW);");
rep("const MW = 56;", "const MW = 64;");
rep("const k = MW / W, mh = Math.round(ROWS * CS * k);", "const k = MW / WW, mh = Math.round(ROWS * CS * k);");
rep("g.drawImage(TERR, 0, OY * RS, W * RS, ROWS * CS * RS, 0, 0, MW, mh);", "g.drawImage(TERR, 0, OY * RS, WW * RS, ROWS * CS * RS, 0, 0, MW, mh);");
rep("mini.hidden = !show; if (!show) return;", "mini.hidden = !show; if (!show) return;");
rep("const mini = $('mini'), show = ROWS * CS * cam.z > VH * 1.02 || cam.z > 1.02;", "const mini = $('mini'), show = ROWS * CS * cam.z > VH * 1.02 || WW * cam.z > W * 1.02 || cam.z > 1.02;");
rep("const big = ROWS * CS + PAD > VH * 1.02;", "const big = ROWS * CS + PAD > VH * 1.02 || WW > W * 1.02;");
rep("if (cam.z > zMin() + 0.03 && ROWS * CS > VH * 1.02 && cam.z <= 1.02) {", "if (cam.z > zMin() + 0.03 && cam.z <= 1.02) {");
rep("cam.cx = (e.clientX - r.left) / r.width * W;", "cam.cx = (e.clientX - r.left) / r.width * WW;");
rep("#mini { position: absolute; right: 10px; top: 160px; width: 56px; height: auto;", "#mini { position: absolute; right: 10px; top: 160px; width: 64px; height: auto;");
rep("window.__cs = { useBoost,", "window.__cs = { COLS, useBoost,");
fs.writeFileSync(F, s);
console.log('ok v6', s.length);
