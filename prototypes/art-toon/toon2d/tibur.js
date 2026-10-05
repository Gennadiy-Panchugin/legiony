// Builds tibur.html: the battle map for Тибур («Горный перевал», 3/5) in the cartoon style, for approval before it goes into war.js.
const fs = require('fs'), path = require('path');
const gen = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
const js = gen.slice(gen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, gen.indexOf('`;\nconst html'));
const helpers = js.slice(0, js.indexOf('function drawWorld(g) {'));
const tj = fs.readFileSync(path.join(__dirname, 'terrain.js'), 'utf8');
const tsheet = tj.slice(tj.indexOf('// ---------------------------------------------------------------- rubble: boulders'), tj.indexOf('// ---------------------------------------------------------------- 1. rubble in three states'));
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
const between = (src, a, b) => src.slice(src.indexOf(a), src.indexOf(b, src.indexOf(a)));
const ban = between(cas, 'const BAN = {', 'const REFILL'), art = between(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const draw = String.raw`
// ---------------------------------------------------------------- the map's shapes (north up, as on the campaign map)
const TOWN_P = [[0, 0], [760, 0], [760, 500], [640, 516], [560, 504], [450, 520], [330, 508], [200, 520], [0, 506]];
const MASS_P = [[900, 610], [780, 590], [640, 612], [520, 600], [400, 616], [300, 640], [270, 790], [292, 990], [380, 1014], [450, 1002], [560, 1016], [700, 994], [900, 1012]];
const ANIO = [[686, 530], [600, 566], [450, 572], [320, 576], [200, 600], [110, 660], [58, 780], [48, 960], [38, 1120], [0, 1220]];
const TRER = [[330, 0], [250, 56], [140, 92], [0, 118]];
const VALLEY = [[450, 1292], [380, 1262], [270, 1210], [200, 1110], [180, 960], [186, 800], [214, 680], [240, 610], [262, 566], [262, 520]];
const WEST_ST = [[262, 500], [206, 448], [188, 384], [204, 330], [262, 316], [340, 320]];
const TUNNEL = [[450, 1500], [450, 1300], [450, 1120], [450, 1030]], TOWN_ROAD = [[450, 620], [450, 470], [450, 360]], NORTH = [[450, 270], [450, 0]];
const TRAIL = [[540, 1340], [660, 1220], [720, 1080], [680, 990], [730, 900], [670, 810], [700, 720], [620, 672], [530, 652], [476, 640]];
function stream(g, pts, w, r) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  wave(g, pts); g.strokeStyle = OL; g.lineWidth = w + 6; g.stroke();
  wave(g, pts); g.strokeStyle = '#2a9fd8'; g.lineWidth = w; g.stroke();
  wave(g, pts); g.strokeStyle = '#5fd0f5'; g.lineWidth = w * 0.55; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2.6; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; for (let k = 0; k < 2; k++) { const t = r(), x = x0 + (x1 - x0) * t + (r() - 0.5) * w * 0.4, y = y0 + (y1 - y0) * t; g.beginPath(); g.moveTo(x - 6, y); g.quadraticCurveTo(x, y - 4, x + 6, y); g.stroke(); } }
}
function waterfall(g, x, y0, y1, w) {
  // rocks framing the drop
  for (const [dx, dy, s] of [[-w * 0.9, 8, 0.9], [w * 0.9, 4, 0.85], [-w * 0.8, (y1 - y0) * 0.6, 0.7], [w * 0.85, (y1 - y0) * 0.55, 0.75]]) boulder(g, x + dx, y0 + dy, s);
  // the falling water widens as it drops
  g.beginPath(); g.moveTo(x - w / 2, y0); g.quadraticCurveTo(x - w * 0.62, (y0 + y1) / 2, x - w * 0.72, y1); g.lineTo(x + w * 0.72, y1); g.quadraticCurveTo(x + w * 0.62, (y0 + y1) / 2, x + w / 2, y0); g.closePath();
  const wg = g.createLinearGradient(0, y0, 0, y1); wg.addColorStop(0, '#3ab0e8'); wg.addColorStop(0.5, '#7fdcff'); wg.addColorStop(1, '#d8f6ff'); fo(g, wg, 3);
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineCap = 'round';
  for (const [k, a, b, lw] of [[-0.32, 0.08, 0.7, 2.6], [-0.1, 0.2, 0.95, 3], [0.12, 0.05, 0.8, 2.6], [0.33, 0.25, 0.9, 2.2], [-0.45, 0.4, 0.95, 2]]) { g.lineWidth = lw; g.beginPath(); for (let s = a; s <= b; s += 0.05) { const yy = y0 + (y1 - y0) * s, xx = x + k * w * (1 + s * 0.45) + Math.sin(s * 14 + k * 9) * 1.6; s === a ? g.moveTo(xx, yy) : g.lineTo(xx, yy); } g.stroke(); }
  // foam and mist where it lands
  for (const [dx, dy, rx, ry] of [[-w * 0.6, 2, 16, 9], [-w * 0.2, 6, 20, 11], [w * 0.25, 4, 19, 10], [w * 0.65, 1, 15, 8], [0, -4, 22, 10]]) { g.beginPath(); g.ellipse(x + dx, y1 + dy, rx, ry, 0, 0, 7); fo(g, '#ffffff', 2.2); }
  for (const [dx, dy, rr2] of [[-w * 0.9, -14, 10], [w * 0.95, -18, 12], [-w * 0.3, -22, 9], [w * 0.4, -26, 8]]) { g.beginPath(); g.arc(x + dx, y1 + dy, rr2, 0, 7); g.fillStyle = 'rgba(235,250,255,.6)'; g.fill(); }
  g.fillStyle = '#ffffff'; for (const [dx, dy] of [[-w, -6], [w * 1.05, -10], [-w * 0.5, -30], [w * 0.6, -34]]) { g.beginPath(); g.arc(x + dx, y1 + dy, 2.4, 0, 7); g.fill(); }
}function massif(g, r) {
  g.save(); g.beginPath(); MASS_P.forEach(([x, y], i) => i ? g.lineTo(x, y + 34) : g.moveTo(x, y + 34)); g.closePath(); g.fillStyle = '#6a5a4a'; g.fill(); g.restore();
  g.beginPath(); MASS_P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); const mg = g.createLinearGradient(0, 560, 0, 1010); mg.addColorStop(0, '#b8ad9c'); mg.addColorStop(1, '#9a8e7e'); fo(g, mg, 3);
  // the south cliff face
  const front = MASS_P.filter(p => p[1] > 900).sort((a, b) => a[0] - b[0]);
  g.beginPath(); front.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = front.length - 1; i >= 0; i--) g.lineTo(front[i][0], front[i][1] + 34); g.closePath(); g.fillStyle = '#7a6a58'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke();
  const P = [[830, 720, 120, 120, 1], [700, 660, 100, 100, 1], [570, 720, 130, 140, 1], [340, 710, 120, 120, 1], [300, 800, 80, 80, 0], [660, 840, 110, 110, 0], [330, 900, 100, 90, 0], [820, 900, 100, 90, 0], [570, 900, 90, 80, 0], [450, 780, 80, 70, 1], [760, 990, 70, 60, 0], [360, 990, 70, 56, 0]];
  P.sort((a, b) => a[1] - b[1]).forEach(([x, y, w, h, s]) => peak(g, x, y, w, h, s));
}
function rockGate(g, x, y, prog) {
  // walls carved into the cliff, two square towers and an arched gate into the tunnel
  for (const tx of [x - 78, x + 78]) { rr(g, tx - 26, y - 92, 52, 96, 4); fo(g, '#c8bca4', 2.8); for (let k = 0; k < 3; k++) { rr(g, tx - 24 + k * 18, y - 102, 12, 12, 2); fo(g, '#c8bca4', 2.2); } rr(g, tx - 6, y - 70, 12, 20, 6); fo(g, '#2a1a10', 2); }
  rr(g, x - 54, y - 64, 108, 66, 4); fo(g, '#d8ccb4', 2.8); for (let k = 0; k < 7; k++) { rr(g, x - 52 + k * 15.5, y - 74, 10, 11, 2); fo(g, '#d8ccb4', 2.2); }
  g.beginPath(); g.moveTo(x - 30, y + 2); g.lineTo(x - 30, y - 30); g.arc(x, y - 30, 30, Math.PI, 0); g.lineTo(x + 30, y + 2); g.closePath(); fo(g, '#1a0e06', 2.8);
  g.beginPath(); g.moveTo(x - 26, y + 2); g.lineTo(x - 26, y - 28); g.arc(x, y - 28, 26, Math.PI, 0); g.lineTo(x + 26, y + 2); g.closePath(); g.fillStyle = '#6a4020'; g.fill();
  g.strokeStyle = OL; g.lineWidth = 2.4; for (const dx of [-16, -5, 6, 17]) { g.beginPath(); g.moveTo(x + dx, y + 2); g.lineTo(x + dx, y - 44); g.stroke(); } for (const dy of [-12, -30]) { g.beginPath(); g.moveTo(x - 26, y + dy); g.lineTo(x + 26, y + dy); g.stroke(); }
  flag(g, x - 74, y - 150, '#3f7ae0', 46); flag(g, x + 82, y - 150, '#3f7ae0', 46);
  if (prog != null) { rr(g, x - 64, y + 16, 128, 30, 15); g.fillStyle = 'rgba(40,24,14,.94)'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#f09a24'; g.stroke(); rr(g, x - 54, y + 34, 108, 7, 4); g.fillStyle = '#3a2414'; g.fill(); rr(g, x - 54, y + 34, 108 * prog, 7, 4); g.fillStyle = '#f09a24'; g.fill(); g.fillStyle = '#ffe6a8'; g.font = '900 13px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText('ворота · таран ' + Math.round(prog * 8) + '/8', x, y + 30); }
}
function apennines(g) { const P = []; for (let y = 30; y <= 1260; y += 62) P.push([850 + (y * 7 % 40) - 10, y + 40, 110 + (y % 3) * 14, 100 + (y % 5) * 10, 1]); for (let y = 60; y <= 560; y += 90) P.push([790, y + 40, 80, 70, 0]); P.sort((a, b) => a[1] - b[1]).forEach(([x, y, w, h, s]) => peak(g, x, y, w, h, s)); }
// the tunnel seen through the rock: a dark gallery with timber props and torches, from y0 (far end) down to y1 (the entrance)
function cutaway(g, x, y0, y1, w) {
  w = w || 40; const h = w / 2;
  g.beginPath(); g.moveTo(x - h - 8, y1); g.lineTo(x - h - 4, y0 + 10); g.quadraticCurveTo(x, y0 - 10, x + h + 4, y0 + 10); g.lineTo(x + h + 8, y1); g.closePath(); g.fillStyle = '#4a3020'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
  g.beginPath(); g.moveTo(x - h, y1); g.lineTo(x - h, y0 + 14); g.lineTo(x + h, y0 + 14); g.lineTo(x + h, y1); g.closePath(); g.fillStyle = '#7a5434'; g.fill();
  for (let y = y0 + 30; y < y1 - 12; y += 36) { rr(g, x - h - 4, y, 6, 22, 2); fo(g, '#b07a40', 1.6); rr(g, x + h - 2, y, 6, 22, 2); fo(g, '#b07a40', 1.6); rr(g, x - h - 4, y - 4, w + 8, 6, 2); fo(g, '#c48a4a', 1.6); }
  for (let y = y0 + 60; y < y1 - 20; y += 110) { const fg = g.createRadialGradient(x, y, 1, x, y, w * 0.7); fg.addColorStop(0, 'rgba(255,220,140,.7)'); fg.addColorStop(1, 'rgba(255,180,80,0)'); g.fillStyle = fg; g.beginPath(); g.arc(x, y, w * 0.7, 0, 7); g.fill(); }
}
// the entrance as a natural grotto: hanging stalactites and vines, a brook running out
function grotto(g, x, y, r) {
  blob(g, x, y - 34, 60, 44, 3, 12); fo(g, '#8a7a68', 3);
  g.beginPath(); g.moveTo(x - 48, y + 4); g.quadraticCurveTo(x - 54, y - 66, x, y - 78); g.quadraticCurveTo(x + 54, y - 66, x + 48, y + 4); g.closePath(); fo(g, '#1a0e06', 3);
  for (let dx = -38; dx <= 38; dx += 13) { const yy = y - 66 + Math.abs(dx) * 0.5; g.beginPath(); g.moveTo(x + dx - 5, yy); g.lineTo(x + dx, yy + 14 + ((dx + 40) % 3) * 4); g.lineTo(x + dx + 5, yy); g.closePath(); fo(g, '#b4aa9a', 1.6); }
  g.strokeStyle = '#3a8a2a'; g.lineWidth = 3; for (const dx of [-44, -30, 30, 44]) { g.beginPath(); g.moveTo(x + dx, y - 70); g.quadraticCurveTo(x + dx + 4, y - 46, x + dx - 2, y - 22); g.stroke(); g.fillStyle = '#5ab83a'; for (let yy = y - 60; yy < y - 22; yy += 12) { g.beginPath(); g.ellipse(x + dx + 2, yy, 4, 2.5, 0.5, 0, 7); g.fill(); } }
  boulder(g, x - 58, y + 6, 0.9); boulder(g, x + 62, y + 8, 0.8);
}
// the entrance as a fortress cut into the rock: loopholes and a portcullis
function portcullis(g, x, y, s) { if (s && s !== 1) { g.save(); g.translate(x, y); g.scale(s, s); portcullis(g, 0, 0); g.restore(); return; }
  g.beginPath(); g.moveTo(x - 90, y); g.lineTo(x - 86, y - 112); g.lineTo(x + 86, y - 112); g.lineTo(x + 90, y); g.closePath(); g.fillStyle = '#a89c8a'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
  for (const [dx, dy] of [[-66, -86], [66, -86], [-66, -48], [66, -48], [-30, -96], [30, -96]]) { rr(g, x + dx - 5, y + dy - 9, 10, 18, 5); fo(g, '#1a0e06', 2); }
  g.beginPath(); g.moveTo(x - 36, y + 2); g.lineTo(x - 36, y - 40); g.arc(x, y - 40, 36, Math.PI, 0); g.lineTo(x + 36, y + 2); g.closePath(); fo(g, '#1a0e06', 3);
  g.strokeStyle = '#8a8a8a'; g.lineWidth = 3.2; for (let dx = -28; dx <= 28; dx += 11) { g.beginPath(); g.moveTo(x + dx, y - 66); g.lineTo(x + dx, y - 10); g.stroke(); } for (let yy = y - 54; yy <= y - 14; yy += 12) { g.beginPath(); g.moveTo(x - 32, yy); g.lineTo(x + 32, yy); g.stroke(); }
  flag(g, x - 78, y - 160, '#3f7ae0', 46); flag(g, x + 78, y - 160, '#3f7ae0', 46);
}
// the tunnel's far end, opening north (away from us): the road comes up out of the rock onto the open ground
function exitStone(g, x, y) {
  g.beginPath(); g.ellipse(x, y, 40, 22, 0, 0, 7); fo(g, '#c8bca4', 3);
  for (let a = 0; a < 6.28; a += 0.52) { g.beginPath(); g.moveTo(x + Math.cos(a) * 30, y + Math.sin(a) * 14); g.lineTo(x + Math.cos(a) * 40, y + Math.sin(a) * 22); g.strokeStyle = 'rgba(80,60,40,.55)'; g.lineWidth = 1.6; g.stroke(); }
  g.beginPath(); g.ellipse(x, y + 2, 28, 13, 0, 0, 7); g.fillStyle = '#1a0e06'; g.fill();
  for (let k = 0; k < 4; k++) { rr(g, x - 22 + k * 2, y - 2 - k * 6, 44 - k * 4, 6, 2); fo(g, '#b8ab92', 1.6); }
  const fg = g.createRadialGradient(x, y + 4, 1, x, y + 4, 26); fg.addColorStop(0, 'rgba(255,210,120,.55)'); fg.addColorStop(1, 'rgba(255,180,80,0)'); g.fillStyle = fg; g.beginPath(); g.arc(x, y + 4, 26, 0, 7); g.fill();
}
function exitTimber(g, x, y) {
  g.beginPath(); g.ellipse(x, y + 2, 32, 15, 0, 0, 7); g.fillStyle = '#1a0e06'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
  for (const dx of [-30, 30]) { rr(g, x + dx - 5, y - 26, 10, 34, 3); fo(g, '#9a6234', 2.2); }
  rr(g, x - 38, y - 32, 76, 10, 3); fo(g, '#b07a40', 2.4); rr(g, x - 30, y - 16, 60, 6, 2); fo(g, '#8a5a30', 1.8);
  g.strokeStyle = OL; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x + 22, y - 22); g.lineTo(x + 22, y - 12); g.stroke(); g.beginPath(); g.arc(x + 22, y - 8, 5, 0, 7); fo(g, '#ffcc55', 1.6);
}
function exitGrotto(g, x, y) {
  blob(g, x, y - 6, 46, 26, 5, 10); fo(g, '#8a7a68', 3);
  g.beginPath(); g.ellipse(x, y, 30, 15, 0, 0, 7); g.fillStyle = '#1a0e06'; g.fill();
  g.strokeStyle = '#3a8a2a'; g.lineWidth = 3; for (const dx of [-26, -10, 12, 26]) { g.beginPath(); g.moveTo(x + dx, y - 16); g.quadraticCurveTo(x + dx + 3, y - 6, x + dx - 1, y + 6); g.stroke(); } g.fillStyle = '#5ab83a'; for (const dx of [-26, -10, 12, 26]) { g.beginPath(); g.ellipse(x + dx + 1, y - 4, 4, 2.5, 0.5, 0, 7); g.fill(); }
  boulder(g, x - 44, y + 4, 0.6); boulder(g, x + 46, y + 2, 0.55);
}
// a dirt road with pebbles and tufts along its edges
function dirtRoad(g, pts, w, r) {
  path(g, pts, w);
  g.save(); g.setLineDash([14, 22]); g.lineCap = 'round'; g.strokeStyle = 'rgba(160,110,50,.35)'; g.lineWidth = 3; wave(g, pts); g.stroke(); g.restore();
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
    for (let d = 10; d < L; d += 28) { const side = (Math.floor(d / 28) + i) % 2 ? 1 : -1, px = x0 + (x1 - x0) * d / L + nx * side * (w / 2 + 5), py = y0 + (y1 - y0) * d / L + ny * side * (w / 2 + 5);
      if (r() < 0.55) stone(g, px, py, 0.45 + r() * 0.25); else { g.strokeStyle = 'rgba(40,110,30,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(px - 3, py); g.lineTo(px - 1, py - 7); g.moveTo(px + 1, py); g.lineTo(px + 3, py - 8); g.stroke(); } } }
}
// a paved road near the town: grey stone with joints
function pavedRoad(g, pts, w) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  wave(g, pts); g.strokeStyle = OL; g.lineWidth = w + 5; g.stroke();
  wave(g, pts); g.strokeStyle = '#a89c8a'; g.lineWidth = w + 1; g.stroke();
  wave(g, pts); g.strokeStyle = '#ddd2bc'; g.lineWidth = w - 6; g.stroke();
  g.save(); g.setLineDash([2, 13]); wave(g, pts); g.strokeStyle = '#b4a890'; g.lineWidth = w - 6; g.lineCap = 'butt'; g.stroke(); g.restore();
  g.save(); g.setLineDash([16, 10]); wave(g, pts); g.strokeStyle = 'rgba(150,135,110,.6)'; g.lineWidth = 2; g.stroke(); g.restore();
}
// a stone staircase up a cliff: risers, treads and low side walls
function stairs(g, x, yTop, w, len) {
  const n = 7, sh = len / n;
  rr(g, x - w / 2 - 10, yTop - 4, w + 20, len + 8, 4); g.fillStyle = '#8a7e6c'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke();
  for (let k = 0; k < n; k++) { const y = yTop + k * sh; rr(g, x - w / 2, y, w, sh, 2); g.fillStyle = k % 2 ? '#e2d6bc' : '#efe6d2'; g.fill(); g.fillStyle = '#b8ab92'; g.fillRect(x - w / 2, y + sh - 3, w, 3); }
  g.lineWidth = 2; g.strokeStyle = OL; rr(g, x - w / 2, yTop, w, len, 2); g.stroke();
  for (const sx of [-1, 1]) { rr(g, x + sx * (w / 2 + 6) - 5, yTop - 8, 10, len + 10, 3); fo(g, '#cfc3ac', 2.2); for (const y of [yTop - 10, yTop + len - 2]) { rr(g, x + sx * (w / 2 + 6) - 7, y, 14, 9, 3); fo(g, '#d8ccb4', 2); } }
}
// every road in two passes: outlines, then fills, so forks and joins merge cleanly
function roads(g, list, r) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [pts, w] of list) { wave(g, pts); g.strokeStyle = OL; g.lineWidth = w + 5; g.stroke(); }
  for (const [pts, w, paved] of list) { wave(g, pts); g.strokeStyle = paved ? '#a89c8a' : '#c99a58'; g.lineWidth = w + 1; g.stroke(); }
  for (const [pts, w, paved] of list) { wave(g, pts); g.strokeStyle = paved ? '#ddd2bc' : '#efd08a'; g.lineWidth = w - 6; g.stroke(); }
  for (const [pts, w, paved] of list) {
    if (paved) { g.save(); g.setLineDash([2, 13]); wave(g, pts); g.strokeStyle = '#b4a890'; g.lineWidth = w - 6; g.lineCap = 'butt'; g.stroke(); g.restore(); continue; }
    g.save(); g.setLineDash([14, 22]); g.lineCap = 'round'; g.strokeStyle = 'rgba(160,110,50,.35)'; g.lineWidth = 3; wave(g, pts); g.stroke(); g.restore();
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
      for (let d = 14; d < L - 10; d += 28) { const side = (Math.floor(d / 28) + i) % 2 ? 1 : -1, px = x0 + (x1 - x0) * d / L + nx * side * (w / 2 + 5), py = y0 + (y1 - y0) * d / L + ny * side * (w / 2 + 5);
        if (r() < 0.55) stone(g, px, py, 0.45 + r() * 0.25); else { g.strokeStyle = 'rgba(40,110,30,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(px - 3, py); g.lineTo(px - 1, py - 7); g.moveTo(px + 1, py); g.lineTo(px + 3, py - 8); g.stroke(); } } }
  }
}
// a stone bridge across a river running east-west: paved deck, parapets with posts, arch shadows on the water
function stoneBridge(g, x, y0, y1, w) {
  for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(x + sx * (w / 2 + 12), (y0 + y1) / 2, 7, (y1 - y0) * 0.32, 0, 0, 7); g.fillStyle = 'rgba(10,40,70,.45)'; g.fill(); }
  rr(g, x - w / 2 - 4, y0, w + 8, y1 - y0, 4); fo(g, '#d8ccb4', 2.8);
  g.strokeStyle = 'rgba(120,105,85,.6)'; g.lineWidth = 1.6; for (let y = y0 + 8; y < y1 - 4; y += 9) { g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.stroke(); }
  for (const sx of [-1, 1]) { const px = x + sx * (w / 2 + 6); rr(g, px - 5, y0 - 6, 10, y1 - y0 + 12, 4); fo(g, '#c8bca4', 2.4); for (const y of [y0 - 8, y1 - 2]) { rr(g, px - 7, y, 14, 10, 3); fo(g, '#e2d6bc', 2.2); } }
}
function caveMouth(g, x, y) { g.beginPath(); g.ellipse(x, y, 40, 26, 0, Math.PI, 0); g.lineTo(x + 40, y + 8); g.lineTo(x - 40, y + 8); g.closePath(); fo(g, '#1a0e06', 2.8); for (const dx of [-30, 0, 30]) boulder(g, x + dx, y - 26 - (dx ? 0 : 6), 0.7); }
function tunnelMark(g) { g.save(); g.setLineDash([4, 14]); g.lineCap = 'round'; g.strokeStyle = 'rgba(30,18,10,.75)'; g.lineWidth = 16; g.beginPath(); g.moveTo(450, 990); g.lineTo(450, 640); g.stroke(); g.restore();
  g.fillStyle = 'rgba(40,24,14,.9)'; rr(g, 380, 770, 140, 30, 15); g.fill(); g.fillStyle = '#ffe6a8'; g.font = '900 15px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText('туннель · 400 шагов', 450, 791); }
function roundTemple(g, x, y) {
  g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 8, y + 6, 56, 14, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(x, y, 52, 16, 0, 0, 7); fo(g, '#d8ccb4', 2.6); rr(g, x - 46, y - 52, 92, 52, 6); fo(g, '#f4ead6', 2.6);
  for (let k = 0; k < 7; k++) { rr(g, x - 42 + k * 13.3, y - 50, 8, 48, 3); fo(g, '#fffaf0', 1.8); }
  g.beginPath(); g.ellipse(x, y - 52, 52, 14, 0, 0, 7); fo(g, '#e2d6bc', 2.6); g.beginPath(); g.ellipse(x, y - 58, 40, 30, 0, Math.PI, 0); fo(g, '#e8a04c', 2.6);
  g.fillStyle = '#ffd36a'; g.beginPath(); g.arc(x, y - 22, 6, 0, 7); g.fill();
}
function sign(g, x, y, t, col) { g.font = '900 15px "Lilita One", sans-serif'; const w = g.measureText(t).width + 18; rr(g, x - w / 2, y - 15, w, 26, 13); g.fillStyle = 'rgba(40,24,14,.92)'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = col || '#f2c14a'; g.stroke(); g.fillStyle = '#ffe6a8'; g.textAlign = 'center'; g.fillText(t, x, y + 4); }
function num(g, x, y, n) { g.beginPath(); g.arc(x, y, 17, 0, 7); fo(g, '#ffcc33', 3); g.fillStyle = '#3a1e08'; g.font = '900 20px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText(n, x, y + 7); }

function drawWorld(g, labels) {
  const r = rng(11);
  grass(g, 0, 0, WW, WH, '#76c64a', r);
  plateau(g, TOWN_P, TOWN_P.slice(2).sort((a, b) => a[0] - b[0]), 30, '#8fd457', r);
  // roads first; the rivers run over them, so the ford reads as water with stones and the bridge sits on top
  roads(g, [[TUNNEL, 36], [VALLEY, 30], [WEST_ST, 30, true], [TOWN_ROAD, 36, true], [NORTH, 36, true]], r);
  stream(g, TRER, 26, r);
  // the Anio falls off the crag by the temple and runs west, then down the western valley
  stream(g, [[770, 360], [740, 410], [700, 448], [690, 466]], 26, r); stream(g, ANIO, 34, r); waterfall(g, 690, 462, 530, 34);
  for (const [x, y, s] of [[232, 586, 0.95], [246, 594, 1.05], [258, 588, 0.9], [240, 604, 0.85], [252, 606, 0.8]]) stone(g, x, y, s);
  stoneBridge(g, 450, 550, 598, 36);
  stairs(g, 262, 488, 32, 70);
  massif(g, r); apennines(g);
  g.save(); g.setLineDash([3, 11]); g.lineCap = 'round'; g.strokeStyle = '#fff3c0'; g.lineWidth = 6; wave(g, TRAIL); g.stroke(); g.restore();
  cutaway(g, 450, 640, 930, 44); squad(g, 450, 760, 'e_inf', 2, 3, 0.62, '#3f7ae0', 'vex'); exitStone(g, 450, 624);
  // the town: houses, the acropolis (final point), the temple of Vesta on its crag to the east
  for (const [x, y] of [[140, 210], [230, 180], [300, 280], [130, 380], [600, 200], [560, 290], [660, 140], [350, 450], [610, 420], [110, 300], [270, 250]]) house(g, x, y);
  rock(g, 640, 486, 1.2); tree(g, 620, 470, 0.9);
  for (const [x, y, k] of [[40, 200, 1], [360, 140, 0.9], [540, 120, 0.9], [60, 470, 0.9]]) tree(g, x, y, k);
  g.beginPath(); g.ellipse(450, 320, 130, 70, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; for (const [a0, a1] of [[-Math.PI / 2 + 0.17, Math.PI / 2 - 0.17], [Math.PI / 2 + 0.17, Math.PI - 0.3], [Math.PI + 0.3, Math.PI * 1.5 - 0.17]]) { g.beginPath(); g.ellipse(450, 320, 130, 70, 0, a0, a1); g.stroke(); }
  for (let a = 0; a < 6.28; a += 0.5) { g.beginPath(); g.ellipse(450 + Math.cos(a) * 100, 320 + Math.sin(a) * 52, 14, 7, 0, 0, 7); g.strokeStyle = 'rgba(150,120,80,.5)'; g.lineWidth = 1.4; g.stroke(); }
  capRing(g, 450, 326, 92, 0); roundTemple(g, 450, 320); flag(g, 490, 220, '#3f7ae0', 40);
  // the rock fortress over the gate; the watchtower on a knoll in the western valley
  capRing(g, 450, 1060, 60, 0); portcullis(g, 450, 1030, 0.62);
  mound(g, 122, 870, 44, 28); capRing(g, 122, 870, 46, 0); watchtower(g, 122, 868);
  grove(g, 250, 1110, 70, 40, 6, 5); grove(g, 50, 1340, 50, 90, 7, 8); grove(g, 620, 1100, 70, 34, 5, 4);
  for (const [x, y, k] of [[340, 1260, 0.9], [570, 1260, 1], [30, 1460, 0.9], [870, 1440, 1]]) rock(g, x, y, k);
  mound(g, 300, 1180, 44, 26);
  // our camp, on the road from Veii
  g.save(); g.beginPath(); g.ellipse(450, 1400, 160, 72, 0, 0, 7); g.fillStyle = 'rgba(190,140,80,.45)'; g.fill(); g.restore();
  for (let a = 200; a <= 340; a += 8) { const rd = a * Math.PI / 180, x = 450 + Math.cos(rd) * 160, y = 1400 + Math.sin(rd) * 72; if (Math.abs(a - 270) < 13) continue; g.beginPath(); g.moveTo(x - 4, y + 6); g.lineTo(x - 3, y - 14); g.lineTo(x, y - 20); g.lineTo(x + 3, y - 14); g.lineTo(x + 4, y + 6); g.closePath(); fo(g, '#b0783e', 2); }
  tent(g, 360, 1440); tent(g, 540, 1440); tent(g, 450, 1466);
  // the enemy: 12 squads, 3/5
  squad(g, 372, 990, 'e_arc', 2, 3, 0.9, '#3f7ae0', 'pennant', -1); squad(g, 528, 990, 'e_arc', 2, 3, 0.9, '#3f7ae0', 'pennant');
  squad(g, 380, 700, 'e_inf', 2, 5, 1, '#3f7ae0', 'vex'); squad(g, 520, 520, 'e_inf', 2, 4, 1, '#3f7ae0', 'vex');
  squad(g, 112, 940, 'e_arc', 2, 3, 0.9, '#3f7ae0', 'pennant'); squad(g, 132, 800, 'e_inf', 2, 4, 0.9, '#3f7ae0', 'vex');
  squad(g, 220, 660, 'e_inf', 2, 4, 1, '#3f7ae0', 'vex'); squad(g, 190, 1060, 'e_cav', 2, 3, 1, '#3f7ae0', 'swallow', -1);
  squad(g, 700, 690, 'e_arc', 2, 2, 0.85, '#3f7ae0', 'pennant', -1);
  squad(g, 450, 420, 'e_inf', 2, 5, 1, '#3f7ae0', 'vex'); squad(g, 300, 350, 'e_arc', 2, 3, 1, '#3f7ae0', 'pennant', -1); squad(g, 600, 350, 'e_cav', 2, 3, 1, '#3f7ae0', 'swallow');
  // ours
  if (labels) { squad(g, 390, 1340, 'hastati', 1, 5, 1, '#e2382c', 'vex'); squad(g, 500, 1340, 'velites', 1, 4, 1, '#2fa04e', 'pennant'); squad(g, 300, 1330, 'eques', 1, 3, 1, '#8e4cc4', 'swallow', -1); squad(g, 600, 1360, 'eng', 1, 3, 1, '#f09a24', 'square'); }
  else { squad(g, 420, 1100, 'eng', 1, 3, 1, '#f09a24', 'square'); squad(g, 500, 1130, 'hastati', 1, 5, 1, '#e2382c', 'vex'); squad(g, 560, 1180, 'velites', 1, 4, 1, '#2fa04e', 'pennant'); squad(g, 300, 1200, 'eques', 1, 3, 1, '#8e4cc4', 'swallow', -1); }
  if (labels) {
    sign(g, 450, 1482, '↓ дорога из Вейи', '#ff8a6a'); sign(g, 540, 24, '↑ к Пренесте', '#9ec1ff'); sign(g, 120, 150, 'Трер', '#9ec1ff'); sign(g, 838, 1300, 'Апеннины', '#e2c9a0');
    num(g, 450, 1300, 1); num(g, 560, 1060, 2); num(g, 520, 820, 3); num(g, 196, 1170, 4); num(g, 90, 836, 5); num(g, 760, 760, 6); num(g, 560, 290, 7); num(g, 720, 400, 8);
  }
}
const VIEW = { x: 180, y: 760 };
function phone(world) {
  const c = document.getElementById('scr'), g = c.getContext('2d'); g.scale(2, 2);
  g.drawImage(world, VIEW.x * 2, VIEW.y * 2, 1080, 1920, 0, 0, 540, 960);
  g.fillStyle = 'rgba(40,24,14,.94)'; rr(g, 8, 8, 524, 64, 18); g.fill(); g.lineWidth = 3; g.strokeStyle = '#f2c14a'; g.stroke();
  g.fillStyle = '#ffe6a8'; g.font = '900 24px "Lilita One", sans-serif'; g.textAlign = 'left'; g.fillText('ТИБУР', 26, 44); g.font = '700 13px "Alegreya Sans", sans-serif'; g.fillStyle = '#f2c14a'; g.fillText('Горный перевал · сила врага 3/5', 28, 62);
  for (const [x, txt, col] of [[300, '⚑ 0/3', '#ffcc33'], [384, '⚔ 12', '#9ec1ff'], [454, '+ 10', '#9fe08a']]) { rr(g, x, 22, 70, 36, 18); g.fillStyle = '#5a3a20'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke(); g.fillStyle = col; g.font = '900 18px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText(txt, x + 35, 47); }
  sign(g, 270, 100, '⛏ Луций поднимает решётку · в туннеле враг', '#f09a24');
  const mw = 96, mh = mw * WH / WW, mx = 540 - mw - 14, my = 124; rr(g, mx - 4, my - 4, mw + 8, mh + 8, 10); g.fillStyle = '#3a2414'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
  g.drawImage(world, 0, 0, WW * 2, WH * 2, mx, my, mw, mh); g.strokeStyle = '#ffcc33'; g.lineWidth = 2.5; g.strokeRect(mx + VIEW.x * mw / WW, my + VIEW.y * mh / WH, 540 * mw / WW, 960 * mh / WH);
}
const go = () => {
  const mk = labels => { const w = document.createElement('canvas'); w.width = WW * 2; w.height = WH * 2; const wg = w.getContext('2d'); wg.scale(2, 2); drawWorld(wg, labels); return w; };
  phone(mk(false)); const m = document.getElementById('map'); m.getContext('2d').drawImage(mk(true), 0, 0, m.width, m.height);
};
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load('900 20px "Lilita One"'), document.fonts.load('700 13px "Alegreya Sans"')]).catch(() => 0) : Promise.resolve()).then(go);
`;
const html = `<title>Тибур — горный перевал</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800;900&display=swap">
<style>
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --gold: #f2c14a; --display: 'Lilita One', 'Alegreya Sans', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.45; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 28px 16px 56px; display: grid; grid-template-columns: minmax(0, 520px) minmax(0, 1fr); gap: 28px; align-items: start; }
  @media (max-width: 900px) { .wrap { grid-template-columns: minmax(0, 1fr); } }
  h1 { font-family: var(--display); font-weight: 400; font-size: 42px; line-height: 1.05; margin: 0 0 10px; color: #ffe6a8; }
  h2 { font-family: var(--display); font-weight: 400; font-size: 24px; margin: 18px 0 8px; color: #ffe6a8; }
  p { margin: 0 0 10px; color: var(--muted); } b { color: var(--ink); }
  .card { width: 100%; border-radius: 22px; overflow: hidden; border: 4px solid #1a0e06; box-shadow: 0 18px 44px rgba(0,0,0,.55); line-height: 0; }
  .phone { max-width: 400px; border-radius: 28px; margin-top: 8px; }
  canvas { display: block; width: 100%; height: auto; }
  ol { margin: 0; padding-left: 22px; color: var(--muted); display: grid; gap: 6px; } li::marker { color: var(--gold); font-weight: 900; }
</style>
<div class="wrap">
  <div class="card"><canvas id="map" width="1800" height="3000" aria-label="Вся карта боя за Тибур с номерами"></canvas></div>
  <section>
    <h1>Тибур — горный перевал</h1>
    <p>Карта повторяет карту кампании: <b>с юга</b> мы приходим по дороге из Вейи, <b>на севере</b> дорога уходит к Пренесте, за городом течёт Трер, <b>с востока</b> стоят Апеннины, а от них к городу тянется отрог. Как в описании провинции: <b>сплошной хребет</b>, короткая дорога — <b>туннелем через крепость в скале</b>, длинная — <b>в обход по долине</b>. Сила врага <b>3 из 5</b>: 12 отрядов против наших 4 генералов.</p>
    <ol>
      <li><b>Наш лагерь</b> внизу, палатки пополняют отряды.</li>
      <li><b>Крепость в скале</b> — ворота с опускной решёткой и бойницами прямо в скале. Инженеры Луция поднимают решётку (8 с), потом это точка захвата: +3 в резерв.</li>
      <li><b>Туннель</b> показан в разрезе: сквозь гору видно ход с крепью и факелами и отряды внутри. Самый короткий путь, но узкий, внутри ждут копейщики. Дождь стрел там не работает.</li>
      <li><b>Западная долина</b> — длинный обход слева, по равнине вдоль Анио. Простор для конницы Гая, брод под городом, лес у подножия для засады.</li>
      <li><b>Сторожевая башня</b> на холме в западной долине: точка захвата, +3 в резерв. С холма лучники бьют дальше.</li>
      <li><b>Козья тропа</b> справа, у самых Апеннин: только пешие, медленно, наверху пост лучников. Выводит велитов Тита к выходу из туннеля, в тыл защитникам ворот.</li>
      <li><b>Храм Весты на площади</b> — финал, как значок Тибура на карте кампании. Встать у храма 6 с без врагов рядом.</li>
      <li><b>Водопад Анио</b> срывается со скалы на восточном краю города и течёт на запад, под стенами.</li>
    </ol>
    <h2>Как выглядит на телефоне</h2>
    <div class="card phone"><canvas id="scr" width="1080" height="1920" aria-label="Экран телефона: штурм ворот"></canvas></div>
  </section>
</div>
<script>
'use strict';
${helpers}
${ban}
${art}
${tsheet}
${draw}
</script>
`;
fs.writeFileSync(path.join(__dirname, 'tibur.html'), html);
console.log('ok', html.length);
