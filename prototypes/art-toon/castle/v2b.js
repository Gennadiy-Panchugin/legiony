// v2 part B: volumetric terrain, detailed soldiers, blood decals.
const fs = require('fs'), path = require('path');
const F = path.join(__dirname, 'castle.html');
let s = fs.readFileSync(F, 'utf8');
function rep(a, b) { const i = s.indexOf(a); if (i < 0 || s.indexOf(a, i + 1) >= 0) { console.error('MISS', a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); }
function between(a, b, body) { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) { console.error('MISS range', a.slice(0, 50)); process.exit(1); } s = s.slice(0, i) + body + s.slice(j); }

between('let TERR = null;', 'function draw(t) {', String.raw`// ---------------------------------------------------------------- blood and bodies stay on the field
let DEC = null, dctx = null;
function initDecals() { DEC = document.createElement('canvas'); DEC.width = W * DPR; DEC.height = H * DPR; dctx = DEC.getContext('2d'); dctx.scale(DPR, DPR); }
function splat(x, y, r, a) {
  dctx.fillStyle = 'rgba(122,16,12,' + a + ')';
  for (let i = 0; i < 4; i++) { dctx.beginPath(); dctx.ellipse(x + (Math.random() - .5) * r * 1.4, y + (Math.random() - .5) * r, r * (0.4 + Math.random() * 0.6), r * (0.3 + Math.random() * 0.4), Math.random() * 3, 0, 7); dctx.fill(); }
}
function bleed(t) {
  splat(t.x + (Math.random() - .5) * 26, t.y + (Math.random() - .5) * 20, 2.5 + Math.random() * 3.5, 0.32);
  for (let i = 0; i < 3; i++) G.parts.push({ x: t.x + (Math.random() - .5) * 14, y: t.y - 10, vx: (Math.random() - .5) * 70, vy: -25 - Math.random() * 45, t: 0.4 + Math.random() * 0.15 });
}
function corpse(x, y, side, kind) {
  splat(x, y + 2, 6 + Math.random() * 4, 0.5);
  dctx.save(); dctx.translate(x, y); dctx.rotate(Math.random() * 6.28); dctx.scale(1.5, 1.5);
  if (kind === CAV) { dctx.fillStyle = '#6a3f22'; dctx.beginPath(); dctx.ellipse(0, 0, 8, 3.6, 0, 0, 7); dctx.fill(); }
  dctx.fillStyle = side === 1 ? '#c0261b' : '#2f6fd6'; dctx.fillRect(-4, -2, 7, 4);
  dctx.fillStyle = side === 1 ? '#7d1d16' : '#1d4a9a'; dctx.fillRect(-4, -2, 2, 4);
  dctx.fillStyle = '#e0b48a'; dctx.beginPath(); dctx.arc(4.6, 0, 2, 0, 7); dctx.fill();
  dctx.strokeStyle = '#2a2a2e'; dctx.lineWidth = 1; dctx.beginPath(); dctx.moveTo(-1, 3); dctx.lineTo(5, 4.5); dctx.stroke();
  dctx.restore();
}
// where soldier i of a squad of n stands inside its cell
function fpos(s, i, n) {
  const cols = s.kind === CAV ? 2 : 3, sp = s.kind === CAV ? 18 : 15, rows = Math.ceil(n / cols), col = i % cols, row = Math.floor(i / cols), inRow = Math.min(cols, n - row * cols);
  return [s.x + (col - (inRow - 1) / 2) * sp, s.y + 7 + (row - (rows - 1) / 2) * (sp - 3)];
}

// ---------------------------------------------------------------- terrain with height
let TERR = null;
function renderTerrain() {
  const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  let sd = 5; const rnd = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
  const at = (r, cc) => (r < 0 || cc < 0 || r >= ROWS || cc >= COLS) ? 'x' : T[r][cc];
  const isWater = ch => ch === 'w' || ch === 'd' || ch === 'b' || ch === 'R';
  const roadish = ch => ch === 'p' || ch === 'b' || ch === 'R' || ch === 'G' || ch === 'g' || ch === 'B' || ch === 'a';
  const wallish = ch => ch === 'W' || ch === 'T' || ch === 'G' || ch === 'g' || ch === 'K' || ch === 'B' || ch === 't';
  // grass
  const gr = g.createLinearGradient(0, OY, 0, OY + ROWS * CS); gr.addColorStop(0, '#9fb06e'); gr.addColorStop(1, '#b9c689');
  g.fillStyle = '#3f2717'; g.fillRect(0, 0, W, H); g.fillStyle = gr; g.fillRect(0, OY, W, ROWS * CS);
  for (let i = 0; i < 80; i++) { g.fillStyle = rnd() < .5 ? 'rgba(110,145,65,.2)' : 'rgba(235,240,165,.24)'; g.beginPath(); g.ellipse(rnd() * W, OY + rnd() * ROWS * CS, 14 + rnd() * 42, 8 + rnd() * 22, rnd() * 3, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(70,105,45,.4)'; g.lineWidth = 1;
  for (let i = 0; i < 260; i++) { const x = rnd() * W, y = OY + rnd() * ROWS * CS; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 1.5, y - 4); g.moveTo(x, y); g.lineTo(x + 1.5, y - 4.5); g.stroke(); }
  // pass 1: the ground itself
  for (let r = 0; r < ROWS; r++) for (let cc = 0; cc < COLS; cc++) {
    const ch = T[r][cc], x = cc * CS, y = OY + r * CS, cx = x + CS / 2, cy = y + CS / 2;
    if (isWater(ch)) {
      g.fillStyle = '#5b97c2'; g.fillRect(x, y, CS, CS);
      g.fillStyle = 'rgba(40,90,140,.25)'; g.fillRect(x, y + CS - 14, CS, 14);
      g.strokeStyle = 'rgba(190,225,245,.75)'; g.lineWidth = 1.6; g.lineCap = 'round';
      for (let k = 0; k < 3; k++) { const wx = x + 6 + rnd() * 40, wy = y + 10 + k * 17 + rnd() * 6; g.beginPath(); g.moveTo(wx, wy); g.quadraticCurveTo(wx + 7, wy - 4, wx + 14, wy); g.stroke(); }
      if (!isWater(at(r - 1, cc)) && r > 0) { g.fillStyle = '#d4d6a0'; g.fillRect(x, y, CS, 5); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, y + 5, CS, 3); }
      if (!isWater(at(r + 1, cc)) && r < ROWS - 1) { g.fillStyle = '#d4d6a0'; g.fillRect(x, y + CS - 5, CS, 5); }
    } else if (ch === 'p' || ch === 'a' || ch === 'G' || ch === 'g') {
      g.fillStyle = ch === 'a' ? '#cfb785' : '#d6c08a';
      if (ch === 'a') g.fillRect(x, y, CS, CS);
      else { g.beginPath(); g.arc(cx, cy, 19, 0, 7); g.fill();
        if (roadish(at(r - 1, cc))) g.fillRect(cx - 19, y, 38, CS / 2); if (roadish(at(r + 1, cc))) g.fillRect(cx - 19, cy, 38, CS / 2);
        if (roadish(at(r, cc - 1))) g.fillRect(x, cy - 19, CS / 2, 38); if (roadish(at(r, cc + 1))) g.fillRect(cx, cy - 19, CS / 2, 38); }
      if (ch === 'a') { g.strokeStyle = 'rgba(120,95,55,.55)'; g.lineWidth = 1.5; for (let k = -2; k < 5; k++) { g.beginPath(); g.moveTo(x + k * 14, y + CS); g.lineTo(x + k * 14 + 22, y); g.stroke(); } }
    } else if (ch === 'h' || ch === 'C') {
      g.fillStyle = '#c4cf93'; g.fillRect(x, y, CS, CS);
      g.fillStyle = 'rgba(255,255,220,.18)'; g.fillRect(x, y, CS, CS / 2);
      g.strokeStyle = 'rgba(95,115,55,.35)'; g.lineWidth = 1; for (let k = 0; k < 6; k++) { const px = x + 5 + rnd() * 50, py = y + 6 + rnd() * 40; g.beginPath(); g.moveTo(px, py); g.lineTo(px - 1.5, py - 4); g.stroke(); }
    }
    if (r >= 2 && r <= 3 && cc >= 2 && cc <= 6 || (r === 1 && cc === 4)) {              // castle yard cobbles
      g.fillStyle = '#cbc1aa'; g.fillRect(x, y, CS, CS); g.strokeStyle = 'rgba(90,80,65,.35)'; g.lineWidth = 1;
      for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x, y + k * 15); g.lineTo(x + CS, y + k * 15); g.stroke(); }
      for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) { const bx = x + (k % 2 ? 10 : 20) + j * 20; g.beginPath(); g.moveTo(bx, y + k * 15); g.lineTo(bx, y + k * 15 + 15); g.stroke(); }
    }
  }
  // pass 2: plateau edges — cliff faces, side walls, and the shadow they throw on the lower ground
  for (let r = 0; r < ROWS; r++) for (let cc = 0; cc < COLS; cc++) {
    const ch = T[r][cc]; if (ch !== 'h' && ch !== 'C') continue;
    const x = cc * CS, y = OY + r * CS;
    const lower = (nr, nc) => { const n = at(nr, nc); return n !== 'x' && !(nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) && HG(n) < 1 && n !== 'a' && !wallish(n); };
    if (lower(r + 1, cc)) {
      const cg = g.createLinearGradient(0, y + CS - 16, 0, y + CS); cg.addColorStop(0, '#a58b66'); cg.addColorStop(1, '#5d4a33');
      g.fillStyle = cg; g.fillRect(x, y + CS - 16, CS, 16);
      g.strokeStyle = 'rgba(60,45,30,.55)'; g.lineWidth = 1; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x, y + CS - 12 + k * 4); g.lineTo(x + CS, y + CS - 12 + k * 4 + (k % 2 ? 1 : -1)); g.stroke(); }
      g.fillStyle = '#d9e2a8'; g.fillRect(x, y + CS - 17, CS, 2.5);
      const sg = g.createLinearGradient(0, y + CS, 0, y + CS + 18); sg.addColorStop(0, 'rgba(25,30,10,.34)'); sg.addColorStop(1, 'rgba(25,30,10,0)'); g.fillStyle = sg; g.fillRect(x, y + CS, CS, 18);
    }
    if (lower(r, cc - 1)) { g.fillStyle = '#6b5640'; g.fillRect(x, y, 5, CS - (lower(r + 1, cc) ? 16 : 0)); g.fillStyle = '#d9e2a8'; g.fillRect(x + 5, y, 1.5, CS - 16); }
    if (lower(r, cc + 1)) { g.fillStyle = '#6b5640'; g.fillRect(x + CS - 5, y, 5, CS - (lower(r + 1, cc) ? 16 : 0)); const eg = g.createLinearGradient(x + CS, 0, x + CS + 14, 0); eg.addColorStop(0, 'rgba(25,30,10,.3)'); eg.addColorStop(1, 'rgba(25,30,10,0)'); g.fillStyle = eg; g.fillRect(x + CS, y + 4, 14, CS); }
    if (lower(r - 1, cc)) { g.fillStyle = 'rgba(80,100,45,.35)'; g.fillRect(x, y, CS, 3); }
  }
  // pass 3: standing things, row by row so the southern ones overlap
  for (let r = 0; r < ROWS; r++) for (let cc = 0; cc < COLS; cc++) {
    const ch = T[r][cc], x = cc * CS, y = OY + r * CS, cx = x + CS / 2, cy = y + CS / 2;
    if (ch === 'f') {
      const trees = []; for (let i = 0; i < 6; i++) trees.push([x + 8 + rnd() * 44, y + 16 + rnd() * 36, 0.8 + rnd() * 0.5]);
      trees.sort((a, b) => a[1] - b[1]);
      for (const [px, py, k] of trees) {
        g.fillStyle = 'rgba(20,35,10,.28)'; g.beginPath(); g.ellipse(px + 4, py + 2, 9 * k, 3.5 * k, 0, 0, 7); g.fill();
        g.fillStyle = '#5a3d20'; g.fillRect(px - 1.5, py - 4, 3, 6);
        for (let l = 0; l < 3; l++) { const w = (13 - l * 3) * k, ty = py - 4 - l * 7 * k;
          g.fillStyle = ['#2c5a33', '#37693a', '#468048'][l]; g.beginPath(); g.moveTo(px - w, ty); g.lineTo(px, ty - 12 * k); g.lineTo(px + w, ty); g.closePath(); g.fill();
          g.fillStyle = 'rgba(190,230,150,.25)'; g.beginPath(); g.moveTo(px - w, ty); g.lineTo(px, ty - 12 * k); g.lineTo(px - w * 0.2, ty); g.closePath(); g.fill(); }
      }
    } else if (ch === 'x') {
      g.fillStyle = '#6f5d47'; g.fillRect(x, y, CS, CS);
      for (let k = 0; k < 3; k++) { const bx = x + 4 + rnd() * 30, bw = 16 + rnd() * 18, bh = 22 + rnd() * 26;
        g.fillStyle = '#8c7859'; g.beginPath(); g.moveTo(bx, y + CS); g.lineTo(bx + bw * 0.3, y + CS - bh); g.lineTo(bx + bw * 0.7, y + CS - bh + 6); g.lineTo(bx + bw, y + CS); g.closePath(); g.fill();
        g.fillStyle = '#5a4936'; g.beginPath(); g.moveTo(bx + bw * 0.55, y + CS - bh + 4); g.lineTo(bx + bw * 0.7, y + CS - bh + 6); g.lineTo(bx + bw, y + CS); g.lineTo(bx + bw * 0.5, y + CS); g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,240,.5)'; g.beginPath(); g.moveTo(bx + bw * 0.3, y + CS - bh); g.lineTo(bx + bw * 0.45, y + CS - bh + 9); g.lineTo(bx + bw * 0.2, y + CS - bh + 8); g.closePath(); g.fill(); }
    } else if (ch === 'w' || ch === 'd') {
      if (ch === 'd') { g.fillStyle = 'rgba(210,225,170,.55)'; g.fillRect(x, y, CS, CS); for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#9aa0a8' : '#b4b9bf'; g.beginPath(); g.ellipse(x + 10 + (k % 3) * 20, y + 14 + Math.floor(k / 3) * 28, 7, 4.5, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(40,60,90,.5)'; g.stroke(); } }
    } else if (ch === 'b' || ch === 'R') {
      g.fillStyle = '#9b6f3d'; g.fillRect(x + 6, y, CS - 12, CS);
      g.strokeStyle = '#5a3d20'; g.lineWidth = 1; for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(x + 6, y + 3 + k * 7); g.lineTo(x + CS - 6, y + 3 + k * 7); g.stroke(); }
      g.fillStyle = '#5a3d20'; g.fillRect(x + 4, y, 4, CS); g.fillRect(x + CS - 8, y, 4, CS);
      for (let k = 0; k < 3; k++) { g.fillStyle = '#3d2a18'; g.fillRect(x + 3, y + 4 + k * 24, 6, 6); g.fillRect(x + CS - 9, y + 4 + k * 24, 6, 6); }
      if (ch === 'R') {                                                              // the barricade: crossed logs and stakes
        g.strokeStyle = '#4a3420'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 6, y + 16); g.lineTo(x + CS - 6, y + 44); g.moveTo(x + CS - 6, y + 16); g.lineTo(x + 6, y + 44); g.stroke();
        g.strokeStyle = '#8a5f33'; g.lineWidth = 3.5; g.stroke();
        g.fillStyle = '#4a3420'; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(x + 8 + k * 10, y + 30); g.lineTo(x + 12 + k * 10, y + 14); g.lineTo(x + 16 + k * 10, y + 30); g.fill(); }
      }
    } else if (wallish(ch)) {
      const front = !wallish(at(r + 1, cc)), topH = front ? CS - 16 : CS;
      if (ch === 'W' || ch === 'G' || ch === 'g' || ch === 'B') {
        g.fillStyle = '#d3cab8'; g.fillRect(x, y, CS, topH);
        if (front) { const fg = g.createLinearGradient(0, y + topH, 0, y + CS); fg.addColorStop(0, '#9b9282'); fg.addColorStop(1, '#6f675b'); g.fillStyle = fg; g.fillRect(x, y + topH, CS, 16);
          g.strokeStyle = 'rgba(50,44,36,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + topH + 8); g.lineTo(x + CS, y + topH + 8); for (let k = 0; k < 4; k++) { g.moveTo(x + 8 + k * 15, y + topH); g.lineTo(x + 8 + k * 15, y + topH + 8); g.moveTo(x + 15 + k * 15, y + topH + 8); g.lineTo(x + 15 + k * 15, y + CS); } g.stroke(); }
        g.fillStyle = '#ebe4d3'; if (!wallish(at(r - 1, cc))) for (let k = 0; k < 4; k++) g.fillRect(x + 3 + k * 15, y - 4, 9, 7);
        if (cc > 0 && !wallish(at(r, cc - 1))) { g.fillStyle = '#9b9282'; g.fillRect(x, y, 4, topH); } if (cc < COLS - 1 && !wallish(at(r, cc + 1))) { g.fillStyle = '#9b9282'; g.fillRect(x + CS - 4, y, 4, topH); }
        g.strokeStyle = 'rgba(50,44,36,.35)'; g.strokeRect(x + .5, y + .5, CS - 1, topH);
      }
      if (ch === 'G') { g.fillStyle = '#6b4a2a'; g.fillRect(x + 8, y + 12, CS - 16, CS - 12); g.strokeStyle = '#2a1c10'; g.lineWidth = 2; g.strokeRect(x + 8, y + 12, CS - 16, CS - 12); g.beginPath(); g.moveTo(cx, y + 12); g.lineTo(cx, y + CS); g.stroke();
        g.strokeStyle = '#3a2a18'; g.lineWidth = 1.5; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + 8, y + 24 + k * 12); g.lineTo(x + CS - 8, y + 24 + k * 12); g.stroke(); } g.fillStyle = '#d9a441'; g.fillRect(cx - 6, cy + 4, 3, 4); g.fillRect(cx + 3, cy + 4, 3, 4); }
      if (ch === 'g') { g.fillStyle = '#2a1c10'; g.beginPath(); g.moveTo(x + 10, y + CS); g.lineTo(x + 10, y + 28); g.quadraticCurveTo(cx, y + 6, x + CS - 10, y + 28); g.lineTo(x + CS - 10, y + CS); g.fill(); }
      if (ch === 'B') { for (let k = 0; k < 7; k++) { g.fillStyle = k % 2 ? '#8a8174' : '#a39a8b'; g.strokeStyle = '#4a4339'; g.lineWidth = 1; g.beginPath(); g.ellipse(x + 10 + rnd() * 40, y + 14 + rnd() * 34, 6 + rnd() * 7, 4 + rnd() * 4, rnd() * 3, 0, 7); g.fill(); g.stroke(); } }
      if (ch === 'T') {
        g.fillStyle = 'rgba(25,25,20,.25)'; g.beginPath(); g.ellipse(cx + 6, cy + 24, 28, 9, 0, 0, 7); g.fill();
        const bg = g.createLinearGradient(cx - 26, 0, cx + 26, 0); bg.addColorStop(0, '#b2a998'); bg.addColorStop(0.55, '#8f8678'); bg.addColorStop(1, '#6a6256');
        g.fillStyle = bg; g.fillRect(cx - 25, cy - 8, 50, 34); g.beginPath(); g.ellipse(cx, cy + 26, 25, 8, 0, 0, Math.PI); g.fill();
        g.fillStyle = '#d3cab8'; g.beginPath(); g.ellipse(cx, cy - 8, 25, 10, 0, 0, 7); g.fill();
        g.fillStyle = '#4a3d2a'; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; g.fillRect(cx + Math.cos(a) * 23 - 2.5, cy - 8 + Math.sin(a) * 9 - 6, 5, 6); }
        g.fillStyle = '#2a1c10'; g.fillRect(cx - 4, cy + 4, 8, 14);
      }
      if (ch === 't') { for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? '#8a8174' : '#a39a8b'; g.strokeStyle = '#4a4339'; g.lineWidth = 1; g.beginPath(); g.ellipse(x + 10 + rnd() * 40, y + 14 + rnd() * 34, 7 + rnd() * 8, 5 + rnd() * 5, rnd() * 3, 0, 7); g.fill(); g.stroke(); } }
      if (ch === 'K') {
        g.fillStyle = 'rgba(25,25,20,.25)'; g.beginPath(); g.ellipse(cx + 6, y + CS - 4, 30, 8, 0, 0, 7); g.fill();
        g.fillStyle = '#d3cab8'; g.fillRect(x + 2, y, CS - 4, CS - 14); const kg = g.createLinearGradient(0, y + CS - 14, 0, y + CS); kg.addColorStop(0, '#9b9282'); kg.addColorStop(1, '#6f675b'); g.fillStyle = kg; g.fillRect(x + 2, y + CS - 14, CS - 4, 14);
        g.fillStyle = '#ebe4d3'; for (let k = 0; k < 4; k++) g.fillRect(x + 4 + k * 14, y - 4, 9, 7); g.fillStyle = '#2a1c10'; g.fillRect(cx - 7, y + CS - 30, 14, 28);
        g.strokeStyle = '#4a3420'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, y); g.lineTo(cx, y - 18); g.stroke();
      }
    }
  }
  TERR = c; G.dirty = false;
}

// ---------------------------------------------------------------- soldiers
function drawMan(x, y, cls, side, face, t, seed, mode) {
  const rome = side === 1, cl = rome ? '#c0261b' : '#2f6fd6', cd = rome ? '#7d1d16' : '#1d4a9a';
  const ph = t * 11 + seed * 1.9, walk = mode === 1 ? Math.sin(ph) : 0, swing = mode === 2 ? Math.sin(t * 9 + seed * 2.3) : 0, bob = mode === 1 ? Math.abs(Math.sin(ph)) * 1.2 : 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(face * 1.55, 1.55); ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(0,0,0,.26)'; ctx.beginPath(); ctx.ellipse(0, 0.5, cls === 'eques' ? 9 : 5.2, cls === 'eques' ? 2.6 : 1.9, 0, 0, 7); ctx.fill();
  const skin = '#e0b48a';
  if (cls === 'eques') {
    ctx.strokeStyle = '#4a2c16'; ctx.lineWidth = 1.7;
    ctx.beginPath(); for (const k of [-5.5, -2.5, 2.5, 5.5]) { ctx.moveTo(k, -4.5); ctx.lineTo(k + Math.sin(ph + k) * 2.8 * (mode === 1 ? 1 : 0.2), 0.5); } ctx.stroke();
    ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.ellipse(0, -6.5 - bob * 0.6, 8.2, 3.7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#8a5a34'; ctx.beginPath(); ctx.ellipse(-1, -8, 6, 1.6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.moveTo(5, -8); ctx.lineTo(9, -14.5); ctx.lineTo(12, -13); ctx.lineTo(8.2, -5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(11.4, -13.4, 3.2, 1.8, 0.5, 0, 7); ctx.fill();
    ctx.strokeStyle = '#2f1d0e'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(5.5, -9); ctx.lineTo(8.5, -15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, -7.5); ctx.quadraticCurveTo(-12, -6, -11 + walk * 2, -2); ctx.stroke();
    ctx.fillStyle = cd; ctx.beginPath(); ctx.moveTo(-2, -15 - bob * 0.6); ctx.lineTo(-9 - walk * 1.5, -11); ctx.lineTo(-3, -8.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = cl; ctx.fillRect(-2.2, -15.5 - bob * 0.6, 5, 7.5);
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0.4, -18.2 - bob * 0.6, 2.3, 0, 7); ctx.fill();
    ctx.fillStyle = '#b4bac2'; ctx.beginPath(); ctx.arc(0.4, -18.5 - bob * 0.6, 2.8, Math.PI, 0); ctx.fill();
    ctx.fillStyle = cl; ctx.fillRect(-0.3, -23.5 - bob * 0.6, 1.4, 2.8);
    ctx.fillStyle = cd; ctx.beginPath(); ctx.ellipse(-2.8, -11, 2.3, 3.4, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#5a3d20'; ctx.lineWidth = 1.2; ctx.beginPath(); const sa = -0.55 + swing * 0.4; ctx.moveTo(2, -9); ctx.lineTo(2 + Math.cos(sa) * 14, -9 + Math.sin(sa) * 14); ctx.stroke();
    ctx.fillStyle = '#dfe3e8'; ctx.beginPath(); ctx.arc(2 + Math.cos(sa) * 14, -9 + Math.sin(sa) * 14, 1.1, 0, 7); ctx.fill();
    ctx.restore(); return;
  }
  const arch = cls === 'velites' || cls === 'e_arc', eng = cls === 'eng', tiro = cls === 'tiro';
  ctx.strokeStyle = '#3d2a18'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-1.5, -4.5 - bob); ctx.lineTo(-1.5 + walk * 2.4, 0); ctx.moveTo(1.5, -4.5 - bob); ctx.lineTo(1.5 - walk * 2.4, 0); ctx.stroke();
  if (!tiro) { ctx.fillStyle = cd; ctx.beginPath(); ctx.moveTo(-2.5, -10.5 - bob); ctx.lineTo(-6 - walk * 1.3, -3 - bob); ctx.lineTo(-1, -4 - bob); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = tiro ? '#d8c9a3' : cl; ctx.fillRect(-3, -10.8 - bob, 6, 7);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(-3, -5.9 - bob, 6, 1.1);
  if (eng) { ctx.fillStyle = '#8a5a2c'; ctx.fillRect(-2.2, -9.2 - bob, 4.4, 5.4); }
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -13.4 - bob, 2.3, 0, 7); ctx.fill();
  if (cls === 'hastati' || cls === 'e_inf') {
    ctx.fillStyle = '#b4bac2'; ctx.beginPath(); ctx.arc(0, -13.8 - bob, 2.9, Math.PI, 0); ctx.fill(); ctx.fillRect(-2.9, -13.8 - bob, 1, 2.4);
    ctx.fillStyle = cl; ctx.fillRect(-0.7, -18.8 - bob, 1.4, 2.7);
  } else if (tiro) { ctx.fillStyle = '#7a5a34'; ctx.beginPath(); ctx.arc(0, -13.8 - bob, 2.7, Math.PI, 0); ctx.fill(); }
  else if (arch) { ctx.fillStyle = rome ? '#6b4a2a' : cd; ctx.beginPath(); ctx.arc(0, -13.8 - bob, 2.8, Math.PI * 0.95, Math.PI * 0.05); ctx.fill(); }
  else if (eng) { ctx.fillStyle = '#8a5a2c'; ctx.beginPath(); ctx.arc(0, -13.8 - bob, 2.8, Math.PI, 0); ctx.fill(); ctx.fillRect(-3.2, -13.8 - bob, 6.4, 1); }
  if (cls === 'hastati') {                                                       // scutum and gladius
    ctx.fillStyle = cl; ctx.fillRect(2.2, -12.2 - bob, 3.8, 9.4); ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 0.9; ctx.strokeRect(2.2, -12.2 - bob, 3.8, 9.4);
    ctx.fillStyle = '#d9a441'; ctx.beginPath(); ctx.arc(4.1, -7.5 - bob, 1.1, 0, 7); ctx.fill();
    const a = -1.2 + swing * 1.0; ctx.strokeStyle = '#e4e8ee'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(3.2, -8 - bob); ctx.lineTo(3.2 + Math.cos(a) * 6.8, -8 - bob + Math.sin(a) * 6.8); ctx.stroke();
  } else if (cls === 'e_inf') {
    ctx.fillStyle = cd; ctx.beginPath(); ctx.arc(3.8, -7.2 - bob, 3.5, 0, 7); ctx.fill(); ctx.fillStyle = '#e8ecf2'; ctx.beginPath(); ctx.arc(3.8, -7.2 - bob, 1.1, 0, 7); ctx.fill();
    ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(1, -1 - swing * 2); ctx.lineTo(6 + swing * 3, -19); ctx.stroke();
    ctx.fillStyle = '#dfe3e8'; ctx.beginPath(); ctx.moveTo(6 + swing * 3, -19); ctx.lineTo(5.3 + swing * 3, -16); ctx.lineTo(6.9 + swing * 3, -16); ctx.fill();
  } else if (tiro) {
    ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(3.5, -1 - swing * 2); ctx.lineTo(4.5 + swing * 2, -17); ctx.stroke();
    ctx.strokeStyle = '#9aa0a8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(3 + swing * 2, -18); ctx.lineTo(3 + swing * 2, -15.5); ctx.moveTo(4.5 + swing * 2, -18.5); ctx.lineTo(4.5 + swing * 2, -15.5); ctx.moveTo(6 + swing * 2, -18); ctx.lineTo(6 + swing * 2, -15.5); ctx.stroke();
  } else if (cls === 'velites') {
    ctx.fillStyle = '#d9a441'; ctx.beginPath(); ctx.arc(-3.6, -7.5 - bob, 2.4, 0, 7); ctx.fill();
    const a = -0.6 - Math.max(0, swing) * 1.0; ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(2.5, -8 - bob); ctx.lineTo(2.5 + Math.cos(a) * 11, -8 - bob + Math.sin(a) * 11); ctx.stroke();
    ctx.fillStyle = '#dfe3e8'; ctx.beginPath(); ctx.arc(2.5 + Math.cos(a) * 11, -8 - bob + Math.sin(a) * 11, 1, 0, 7); ctx.fill();
  } else if (cls === 'e_arc') {
    const pull = mode === 2 ? (swing + 1) / 2 : 0; ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(4, -8 - bob, 4.8, -1.3, 1.3); ctx.stroke();
    ctx.strokeStyle = '#e8e2d0'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(4 + Math.cos(-1.3) * 4.8, -8 - bob + Math.sin(-1.3) * 4.8); ctx.lineTo(4 - pull * 3, -8 - bob); ctx.lineTo(4 + Math.cos(1.3) * 4.8, -8 - bob + Math.sin(1.3) * 4.8); ctx.stroke();
    if (mode === 2) { ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(4 - pull * 3, -8 - bob); ctx.lineTo(9, -8 - bob); ctx.stroke(); }
  } else if (eng) {
    const a = -1.0 + swing * 1.1; ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(2.8, -7 - bob); ctx.lineTo(2.8 + Math.cos(a) * 9, -7 - bob + Math.sin(a) * 9); ctx.stroke();
    ctx.fillStyle = '#8c939b'; ctx.save(); ctx.translate(2.8 + Math.cos(a) * 9, -7 - bob + Math.sin(a) * 9); ctx.rotate(a); ctx.fillRect(-0.8, -3, 1.8, 6); ctx.restore();
  }
  ctx.restore();
}
function drawSquad(s, t) {
  const n = Math.ceil(s.n), mode = (s.work && !s.to) ? 2 : s.fighting ? 2 : s.moving ? 1 : 0;
  const pts = []; for (let i = 0; i < n; i++) { const [px, py] = fpos(s, i, n); pts.push([i, px, py]); }
  ctx.save(); if (hidden(s)) ctx.globalAlpha = 0.6;
  ctx.fillStyle = 'rgba(0,0,0,.1)'; ctx.beginPath(); ctx.ellipse(s.x, s.y + 12, 26, 14, 0, 0, Math.PI * 2); ctx.fill();
  if (s.ai === 'tower') { for (let i = 0; i < Math.min(n, 4); i++) drawMan(s.x - 15 + i * 10, s.y - 14, 'e_arc', 2, i < 2 ? 1 : -1, t, i, s.fighting ? 2 : 0); }
  else {
    pts.sort((a, b) => a[2] - b[2]);
    const fx = s.x - s.face * 23, fy = s.y + 14, rome = s.side === 1, col = rome ? '#c0261b' : '#2f6fd6';
    ctx.strokeStyle = '#5a3d20'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - 36); ctx.stroke();
    const wv = Math.sin(t * 5 + s.id) * 2; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(fx, fy - 36); ctx.lineTo(fx + s.face * 14, fy - 35 + wv); ctx.lineTo(fx + s.face * 13, fy - 26 + wv); ctx.lineTo(fx, fy - 27); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d9a441'; ctx.fillRect(fx + (s.face > 0 ? 0 : -13), fy - 31 + wv * 0.5, 13, 2);
    ctx.beginPath(); ctx.arc(fx, fy - 38, 2.6, 0, Math.PI * 2); ctx.fill();
    for (const [i, px, py] of pts) drawMan(px, py, s.cls, s.side, s.face, t, s.id * 7 + i, mode);
  }
  ctx.restore();
  if (s.hurt > 0) { ctx.strokeStyle = 'rgba(255,255,255,' + Math.min(0.7, s.hurt * 4) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(s.x, s.y + 4, 30, 24, 0, 0, Math.PI * 2); ctx.stroke(); }
  if (s.sk > 0) { ctx.strokeStyle = 'rgba(246,215,122,.9)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(s.x, s.y + 6, 32, 26, 0, 0, Math.PI * 2); ctx.stroke(); }
  if (s.side === 1) {
    const bx = s.x, by = s.y - 46;
    ctx.fillStyle = '#1e1913'; ctx.strokeStyle = G.sel === s ? '#f6d77a' : '#d9a441'; ctx.lineWidth = G.sel === s ? 3 : 1.6;
    ctx.beginPath(); ctx.arc(bx, by, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.font = '700 13px Cormorant SC, Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f6e7bf'; ctx.fillText(s.letter, bx, by + 1); ctx.textBaseline = 'alphabetic';
  }
  const f = s.n / s.max, bw = 34, hx = s.x - bw / 2, hy = s.y + 30;
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(hx - 1, hy - 1, bw + 2, 6); ctx.fillStyle = f > 0.5 ? '#6fd17a' : f > 0.25 ? '#f2c14e' : '#ef6b5a'; ctx.fillRect(hx, hy, bw * f, 4);
  if (s.work) { const [wx, wy] = cellXY(s.work.r, s.work.c), tot = WORK[T[s.work.r][s.work.c]] || 1, p = 1 - s.work.left / tot;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(wx - 22, wy - 4, 44, 8); ctx.fillStyle = '#f6d77a'; ctx.fillRect(wx - 22, wy - 4, 44 * Math.max(0, Math.min(1, p)), 8); }
}
`);

// draw(): blood under the squads, warnings, particles
rep("  ctx.drawImage(TERR, 0, 0, W, H);\n", "  ctx.drawImage(TERR, 0, 0, W, H);\n  ctx.drawImage(DEC, 0, 0, W, H);\n");
rep("      else if (sel.cls === 'eng' && (ch === 'r' || ch === 'W' || ch === 'G')) {", "      else if (sel.cls === 'eng' && (ch === 'R' || ch === 'W' || ch === 'G')) {");
rep("  for (const v of G.volleys) {\n    const x = v.x", "  for (const p of G.parts) { ctx.fillStyle = 'rgba(150,18,12,' + Math.min(1, p.t * 3) + ')'; ctx.fillRect(p.x - 1.2, p.y - 1.2, 2.6, 2.6); }\n  for (const w of G.warn) {\n    const k = 0.6 + 0.4 * Math.sin(t * 12), a = Math.min(1, w.t);\n    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#c0261b'; ctx.strokeStyle = '#fff3d6'; ctx.lineWidth = 2.5;\n    ctx.beginPath(); ctx.arc(w.x, w.y - 44, 13 * (0.9 + 0.1 * k), 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n    ctx.fillStyle = '#fff3d6'; ctx.font = '700 17px Alegreya Sans, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', w.x, w.y - 38); ctx.restore();\n  }\n  for (const v of G.volleys) {\n    const x = v.x");
fs.writeFileSync(F, s);
console.log('ok B', s.length);
