// Builds cities.html: battle maps for the remaining cities — Остия, Анций, Пренесте, Капуя — matched to the campaign map
// (where we come from, the sea, the rivers, each city's landmark) and to each province's battle description and difficulty.
const fs = require('fs'), path = require('path');
const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const gen = read('gen.js'), js = gen.slice(gen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, gen.indexOf('`;\nconst html'));
const helpers = js.slice(0, js.indexOf('function drawWorld(g) {'));
const cut = (src, a, b) => src.slice(src.indexOf(a), src.indexOf(b, src.indexOf(a)));
const tsheet = cut(read('terrain.js'), '// ---------------------------------------------------------------- rubble: boulders', '// ---------------------------------------------------------------- 1. rubble in three states');
const tibHelpers = cut(read('tibur.js'), 'function stream(g, pts, w, r) {', 'function drawWorld(g, labels) {');
const veii = read('veii.js'), veiiHelpers = cut(veii, '// ---------------------------------------------------------------- Etruscan pieces', 'function drawWorld(g, labels) {');
const ex = read('extras.js'), seaFns = cut(ex, 'function sea(g, x0, y0, w, h, r) {', '// ---------------------------------------------------------------- the arena'), arenaFn = cut(ex, 'function arena(g, cx, cy, rx, ry, r) {', 'function lion(');
const templeFn = cut(read('tvar.js'), 'function temple(g, x, y, w) {', 'function thatch(');
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
const ban = cut(cas, 'const BAN = {', 'const REFILL'), art = cut(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const draw = String.raw`
// ---------------------------------------------------------------- shared pieces for the four cities
function wall(g, pts, col, gaps) {
  const seg = (a, b) => { g.lineCap = 'butt'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.strokeStyle = OL; g.lineWidth = 18; g.stroke(); g.strokeStyle = col || '#d8ccb4'; g.lineWidth = 12; g.stroke(); g.setLineDash([6, 6]); g.strokeStyle = 'rgba(80,60,40,.45)'; g.lineWidth = 3; g.stroke(); g.setLineDash([]); };
  for (let i = 0; i < pts.length - 1; i++) { if (gaps && gaps.includes(i)) continue; seg(pts[i], pts[i + 1]); }
  for (const [x, y] of pts) { rr(g, x - 15, y - 26, 30, 30, 4); fo(g, col || '#d8ccb4', 2.6); for (let k = 0; k < 3; k++) { rr(g, x - 14 + k * 10, y - 33, 8, 8, 2); fo(g, col || '#d8ccb4', 2); } }
}
function pine(g, x, y, s) { s = s || 1; g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 8, y + 2, 26 * s, 7 * s, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - 3 * s, y); g.quadraticCurveTo(x - 2 * s, y - 24 * s, x + 4 * s, y - 40 * s); g.lineTo(x + 8 * s, y - 38 * s); g.quadraticCurveTo(x + 4 * s, y - 22 * s, x + 4 * s, y); g.closePath(); fo(g, '#8a5a30', 2); blob(g, x + 6 * s, y - 46 * s, 30 * s, 13 * s, x, 11); fo(g, '#4a8a3a', 2.4); g.fillStyle = 'rgba(180,230,140,.3)'; g.beginPath(); g.ellipse(x, y - 52 * s, 14 * s, 4 * s, 0, 0, 7); g.fill(); }
function saltPans(g, x, y, cols, rows) { for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { rr(g, x + i * 46, y + j * 36, 40, 30, 4); fo(g, j % 2 ? '#e8f6fa' : '#d2eef6', 2.2); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(x + i * 46 + 14, y + j * 36 + 18, 6, 3, 0, 0, 7); g.fill(); } }
function lighthouse(g, x, y) { rr(g, x - 40, y - 8, 80, 22, 6); fo(g, '#b8ab92', 2.6); g.beginPath(); g.moveTo(x - 24, y); g.lineTo(x - 16, y - 110); g.lineTo(x + 16, y - 110); g.lineTo(x + 24, y); g.closePath(); fo(g, '#efe4cc', 2.8); for (let k = 1; k < 4; k++) { rr(g, x - 24 + k * 2.3, y - k * 28, 48 - k * 4.6, 5, 2); fo(g, '#d8ccb4', 1.8); } const fg = g.createRadialGradient(x, y - 124, 2, x, y - 124, 44); fg.addColorStop(0, 'rgba(255,240,160,1)'); fg.addColorStop(1, 'rgba(255,160,40,0)'); g.fillStyle = fg; g.beginPath(); g.arc(x, y - 124, 44, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - 9, y - 112); g.quadraticCurveTo(x - 10, y - 128, x, y - 140); g.quadraticCurveTo(x + 10, y - 128, x + 9, y - 112); g.closePath(); fo(g, '#ffb030', 2); }
function horrea(g, x, y) { g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 8, y + 3, 70, 12, 0, 0, 7); g.fill(); rr(g, x - 64, y - 46, 128, 48, 4); fo(g, '#e2c89a', 2.8); for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(x - 54 + k * 26, y + 2); g.lineTo(x - 54 + k * 26, y - 22); g.arc(x - 44 + k * 26, y - 22, 10, Math.PI, 0); g.lineTo(x - 34 + k * 26, y + 2); g.closePath(); fo(g, '#8a5a30', 2); } rr(g, x - 70, y - 60, 140, 16, 4); fo(g, '#c8603a', 2.6); }
function aqueduct(g, x0, x1, y) { rr(g, Math.min(x0, x1) - 6, y - 70, Math.abs(x1 - x0) + 12, 14, 3); fo(g, '#d8ccb4', 2.6); for (let x = Math.min(x0, x1); x < Math.max(x0, x1); x += 36) { rr(g, x, y - 58, 10, 58, 2); fo(g, '#cfc3ac', 2.2); g.beginPath(); g.moveTo(x + 10, y - 30); g.arc(x + 23, y - 30, 13, Math.PI, 0); g.strokeStyle = OL; g.lineWidth = 2.2; g.stroke(); } g.fillStyle = '#7fd0f0'; g.fillRect(Math.min(x0, x1) - 4, y - 69, Math.abs(x1 - x0) + 8, 4); }
function castellum(g, x, y) { rr(g, x - 34, y - 70, 68, 72, 4); fo(g, '#d8ccb4', 2.8); rr(g, x - 40, y - 82, 80, 14, 3); fo(g, '#c8bca4', 2.4); g.beginPath(); g.arc(x, y - 36, 14, 0, 7); fo(g, '#5fd0f5', 2.2); }
function arch(g, x, y) { rr(g, x - 50, y - 92, 100, 92, 4); fo(g, '#efe4cc', 2.8); g.beginPath(); g.moveTo(x - 20, y); g.lineTo(x - 20, y - 46); g.arc(x, y - 46, 20, Math.PI, 0); g.lineTo(x + 20, y); g.closePath(); fo(g, '#3a2414', 2.4); rr(g, x - 56, y - 104, 112, 16, 3); fo(g, '#d9cbaa', 2.4); rr(g, x - 30, y - 128, 60, 24, 3); fo(g, '#f2c14a', 2.4); for (const dx of [-38, 38]) { rr(g, x + dx - 5, y - 88, 10, 84, 3); fo(g, '#fffaf0', 1.8); } }
function terraces(g, x, y) {
  for (let k = 0; k < 4; k++) { const w = 340 - k * 66, yy = y - k * 52; rr(g, x - w / 2, yy - 44, w, 48, 4); fo(g, k % 2 ? '#d8ccb4' : '#cfc3ac', 2.8); for (let ax = x - w / 2 + 12; ax < x + w / 2 - 18; ax += 24) { g.beginPath(); g.moveTo(ax, yy - 2); g.lineTo(ax, yy - 22); g.arc(ax + 8, yy - 22, 8, Math.PI, 0); g.lineTo(ax + 16, yy - 2); g.strokeStyle = 'rgba(80,60,40,.55)'; g.lineWidth = 1.6; g.stroke(); } }
  rr(g, x - 20, y - 200, 40, 204, 3); fo(g, '#efe6d2', 2.4); for (let yy = y - 194; yy < y; yy += 9) { g.strokeStyle = 'rgba(80,60,40,.45)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - 18, yy); g.lineTo(x + 18, yy); g.stroke(); }
  roundTemple(g, x, y - 214);
}
function swampZone(g, pts, r) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); const sg = g.createLinearGradient(0, 400, 0, 1100); sg.addColorStop(0, '#5f7a46'); sg.addColorStop(1, '#3f5a34'); fo(g, sg, 3);
  g.save(); g.clip(); for (let i = 0; i < 40; i++) { const x = 100 + r() * 700, y = 380 + r() * 760; g.fillStyle = r() < 0.5 ? 'rgba(124,192,74,.7)' : 'rgba(200,230,150,.35)'; g.beginPath(); g.ellipse(x, y, 10 + r() * 14, 5 + r() * 6, 0.3, 0, 7); g.fill(); } g.restore();
  for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i]; reeds(g, x + 6, y + 4); } }
function causeway(g, pts) { g.lineCap = 'butt'; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L; for (let d = 0; d < L; d += 10) { const x = x0 + (x1 - x0) * d / L, y = y0 + (y1 - y0) * d / L; g.beginPath(); g.moveTo(x - nx * 20, y - ny * 20); g.lineTo(x + nx * 20, y + ny * 20); g.strokeStyle = OL; g.lineWidth = 8; g.stroke(); g.strokeStyle = d % 20 ? '#a8783e' : '#c48a4a'; g.lineWidth = 5; g.stroke(); } } }
function camp(g, x, y) { g.save(); g.beginPath(); g.ellipse(x, y, 150, 66, 0, 0, 7); g.fillStyle = 'rgba(190,140,80,.45)'; g.fill(); g.restore(); for (let a = 200; a <= 340; a += 8) { const rd = a * Math.PI / 180, px = x + Math.cos(rd) * 150, py = y + Math.sin(rd) * 66; if (Math.abs(a - 270) < 13) continue; g.beginPath(); g.moveTo(px - 4, py + 6); g.lineTo(px - 3, py - 14); g.lineTo(px, py - 20); g.lineTo(px + 3, py - 14); g.lineTo(px + 4, py + 6); g.closePath(); fo(g, '#b0783e', 2); } tent(g, x - 80, y + 38); tent(g, x + 80, y + 38); tent(g, x, y + 62); }
function ours(g, x, y) { squad(g, x - 60, y - 30, 'hastati', 1, 5, 1, '#e2382c', 'vex'); squad(g, x + 50, y - 30, 'velites', 1, 4, 1, '#2fa04e', 'pennant'); squad(g, x + 130, y, 'eques', 1, 3, 1, '#8e4cc4', 'swallow'); squad(g, x - 130, y, 'eng', 1, 3, 1, '#f09a24', 'square'); }
const foe = (g, list) => list.forEach(([cls, x, y, n]) => squad(g, x, y, cls, 2, n || 3, 0.95, '#3f7ae0', cls === 'e_arc' ? 'pennant' : cls === 'e_cav' ? 'swallow' : 'vex', x > 450 ? -1 : 1));
const point = (g, x, y, r) => capRing(g, x, y, r || 64, 0);

// ---------------------------------------------------------------- extra pieces for the coast
function stick(g, x0, y0, x1, y1, col, w) { g.strokeStyle = OL; g.lineWidth = w + 2.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
function crane(g, x, y) { stick(g, x, y, x + 6, y - 70, '#8a5a30', 4); stick(g, x + 6, y - 70, x + 40, y - 60, '#8a5a30', 3); g.strokeStyle = OL; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x + 40, y - 60); g.lineTo(x + 40, y - 30); g.stroke(); rr(g, x + 32, y - 30, 16, 12, 3); fo(g, '#c8a070', 1.8); }
function raft(g, x, y) { g.setLineDash([4, 4]); g.strokeStyle = '#6a4020'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 60); g.lineTo(x, y + 60); g.stroke(); g.setLineDash([]); rr(g, x - 26, y - 14, 52, 28, 5); fo(g, '#a8783e', 2.4); g.strokeStyle = OL; g.lineWidth = 1.6; for (let k = -18; k <= 18; k += 9) { g.beginPath(); g.moveTo(x + k, y - 13); g.lineTo(x + k, y + 13); g.stroke(); } }
function oliveTerrace(g, x, y, w, rows) { for (let k = 0; k < rows; k++) { const yy = y + k * 40; rr(g, x, yy, w, 30, 8); fo(g, k % 2 ? '#a6d468' : '#9ccc5a', 2.2); rr(g, x, yy + 26, w, 8, 4); fo(g, '#c8b894', 1.8); for (let ox = x + 20; ox < x + w - 10; ox += 44) olive(g, ox, yy + 22, 0.55); } }
function lagoon(g, pts, r) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); const lg = g.createLinearGradient(0, 900, 0, 1250); lg.addColorStop(0, '#7ec8a8'); lg.addColorStop(1, '#5aa890'); fo(g, lg, 2.8); g.save(); g.clip(); for (let i = 0; i < 22; i++) { g.fillStyle = 'rgba(160,210,120,.6)'; g.beginPath(); g.ellipse(700 + r() * 200, 940 + r() * 280, 10 + r() * 12, 4 + r() * 4, 0.3, 0, 7); g.fill(); } g.restore(); for (const [x, y] of pts) reeds(g, x, y); }
// the coast: sand along the shore with breaks where rivers meet the sea; a river mouth widens and blends into the water
function shore(g, xs, from, to) { g.beginPath(); g.moveTo(xs - 6, from); for (let y = from; y <= to; y += 40) g.lineTo(xs + 46 + Math.sin(y * 0.05) * 8, y); g.lineTo(xs - 6, to); g.closePath(); fo(g, '#f2d690', 2.4); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 5; g.beginPath(); g.moveTo(xs - 4, from); g.lineTo(xs - 4, to); g.stroke(); }
function mouth(g, xs, y, w) {
  g.beginPath(); g.moveTo(xs + 90, y - w / 2); g.quadraticCurveTo(xs + 20, y - w / 2, xs - 30, y - w * 1.1); g.lineTo(xs - 30, y + w * 1.1); g.quadraticCurveTo(xs + 20, y + w / 2, xs + 90, y + w / 2); g.closePath();
  const mg = g.createLinearGradient(xs + 90, 0, xs - 30, 0); mg.addColorStop(0, '#3aa8e0'); mg.addColorStop(1, 'rgba(42,143,208,0)'); g.fillStyle = mg; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3; g.lineCap = 'round'; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(xs - 6, y + k * w * 0.45 - 6); g.quadraticCurveTo(xs - 18, y + k * w * 0.45, xs - 6, y + k * w * 0.45 + 6); g.stroke(); }
}
// a harbour basin cut into the coast, open to the sea, with two moles
function harbour(g, xs, y0, y1, depth) { g.fillStyle = '#2a8fd0'; g.fillRect(xs - 40, y0, depth + 40, y1 - y0); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2.6; for (let k = 0; k < 6; k++) { const x = xs + (k % 3) * 26, y = y0 + 18 + Math.floor(k / 3) * 50; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 7, y - 4, x + 14, y); g.stroke(); }
  g.lineWidth = 3; g.strokeStyle = OL; g.beginPath(); g.moveTo(xs + depth, y0); g.lineTo(xs + depth, y1); g.stroke();
  rr(g, xs - 70, y0 - 16, depth + 70, 16, 5); fo(g, '#b8ab92', 2.6); rr(g, xs - 70, y1, depth + 50, 16, 5); fo(g, '#b8ab92', 2.6); }
function sandWood(g, pts, r) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = '#e8d49a'; g.fill(); g.save(); g.clip(); for (let i = 0; i < 70; i++) { const x = 140 + r() * 260, y = 920 + r() * 560; g.strokeStyle = 'rgba(90,140,50,.85)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x - 6, y - 9); g.moveTo(x, y); g.lineTo(x, y - 11); g.moveTo(x + 4, y); g.lineTo(x + 6, y - 9); g.stroke(); } g.restore(); }
function hummock(g, x, y, rx) { blob(g, x, y, rx, rx * 0.5, x, 10); fo(g, '#7cb84a', 2.4); reeds(g, x - rx * 0.6, y); reeds(g, x + rx * 0.5, y - 4); }

// salt works: a channel from the lagoon feeds shallow evaporation ponds on earth dykes; heaps of white salt and the salter's hut
function saltworks(g, x, y, cols, rows, chY) {
  const W = cols * 44 + 12, H = rows * 38 + 12;
  rr(g, x, y, W, H, 8); fo(g, '#cdb88a', 2.6);
  rr(g, x + W - 6, chY - 7, 42, 14, 4); g.fillStyle = '#6ec0d8'; g.fill(); g.lineWidth = 2; g.strokeStyle = OL; g.stroke();
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const px = x + 8 + i * 44, py = y + 8 + j * 38; rr(g, px, py, 38, 32, 4); const pg = g.createLinearGradient(px, py, px + 38, py + 32); const dry = (i + j) % 3; pg.addColorStop(0, dry === 2 ? '#f4fbff' : '#9ad8ec'); pg.addColorStop(1, dry === 2 ? '#dfeff6' : '#bfe8f4'); g.fillStyle = pg; g.fill(); g.lineWidth = 1.8; g.strokeStyle = 'rgba(90,70,40,.7)'; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.95)'; for (let k = 0; k < (dry === 2 ? 7 : 3); k++) { g.beginPath(); g.ellipse(px + 6 + ((k * 13) % 28), py + 6 + ((k * 7) % 20), 3, 1.8, 0, 0, 7); g.fill(); } }
  for (const [dx, s] of [[12, 1], [40, 0.8], [66, 1.1]]) { const hx = x + dx, hy = y + H + 22; g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(hx + 6, hy + 2, 18 * s, 5 * s, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(hx - 16 * s, hy); g.quadraticCurveTo(hx, hy - 30 * s, hx + 16 * s, hy); g.closePath(); fo(g, '#ffffff', 2.4); g.fillStyle = '#dfe8ee'; g.beginPath(); g.moveTo(hx, hy - 15 * s); g.quadraticCurveTo(hx + 10 * s, hy - 8 * s, hx + 16 * s, hy); g.lineTo(hx, hy); g.closePath(); g.fill(); }
  const hx = x + W - 34, hy = y + H + 30; rr(g, hx - 18, hy - 22, 36, 24, 3); fo(g, '#e2cfa6', 2.2); g.beginPath(); g.moveTo(hx - 24, hy - 20); g.lineTo(hx, hy - 38); g.lineTo(hx + 24, hy - 20); g.closePath(); fo(g, '#d9a441', 2.2);
  sign(g, x + W / 2, y - 14, 'соль', '#ffffff');
}
// ---------------------------------------------------------------- ОСТИЯ · Устье Тибра · 2/5
// The Tiber splits around the Sacred Island: a bridge to the island and another into the town, or a ferry to the shipyard;
// a salt lagoon east of the town; a pine wood on the sand by the sea; the harbour open to the sea with its lighthouse.
function ostia(g, r) {
  const XS = 150;
  grass(g, 0, 0, WW, WH, '#86d05a', r); sea(g, 0, 0, XS, WH, r);
  sandWood(g, [[XS, 930], [330, 940], [380, 1120], [340, 1480], [XS, 1500]], r);
  lagoon(g, [[710, 940], [820, 920], [890, 980], [890, 1200], [800, 1240], [720, 1180]], r);
  roads(g, [[[[900, 1340], [720, 1360], [520, 1330], [420, 1240], [400, 1080], [380, 944]], 34], [[[520, 1330], [580, 1260], [630, 1200]], 26], [[[520, 1330], [540, 1160], [560, 960], [690, 880]], 26], [[[380, 850], [380, 660]], 30], [[[380, 560], [370, 520], [380, 420], [420, 260], [430, 0]], 34, true]], r);
  stream(g, [[900, 640], [700, 660], [520, 640], [360, 600], [220, 560]], 64, r);
  stream(g, [[900, 640], [760, 720], [600, 830], [420, 900], [260, 880], [220, 890]], 58, r);
  mouth(g, XS, 560, 64); mouth(g, XS, 890, 58);
  harbour(g, XS, 300, 440, 110);
  shore(g, XS, 0, 284); shore(g, XS, 456, 520); shore(g, XS, 604, 856); shore(g, XS, 924, 1500);
  rr(g, 60, 448, 50, 16, 5); fo(g, '#b8ab92', 2.4); lighthouse(g, 82, 452); trireme(g, 205, 370, 0.42);
  for (const [x, y, s] of [[300, 760, 1], [450, 790, 1.1], [520, 745, 0.9], [250, 720, 1]]) pine(g, x, y, s);
  rr(g, 600, 715, 90, 40, 6); fo(g, '#c8a070', 2.4); crane(g, 600, 723); trireme(g, 660, 732, 0.4);
  stoneBridge(g, 380, 560, 660, 34); stoneBridge(g, 380, 850, 944, 34); raft(g, 690, 815);
  saltworks(g, 568, 990, 3, 3, 1040);
  wall(g, [[262, 520], [262, 140], [560, 110], [760, 200], [760, 520]], '#d8ccb4', [2]); crane(g, 272, 330);
  for (const [x, y] of [[340, 210], [500, 180], [650, 260], [330, 470], [560, 500], [680, 450]]) horrea(g, x, y);
  g.beginPath(); g.ellipse(450, 340, 96, 52, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke(); point(g, 450, 346, 80); temple(g, 450, 340, 112);
  point(g, 640, 1180, 62); point(g, 640, 740, 60);
  grove(g, 250, 1240, 56, 110, 9, 4); for (const [x, y, s] of [[300, 1060, 1], [210, 1420, 0.9], [820, 1360, 1], [620, 1420, 0.9], [840, 820, 1]]) pine(g, x, y, s);
  boat(g, 70, 1150, 0.9); boat(g, 60, 220, 0.8);
  camp(g, 720, 1400);
  foe(g, [['e_arc', 380, 720], ['e_inf', 330, 1000, 4], ['e_inf', 610, 738, 3], ['e_arc', 520, 1060], ['ambush', 250, 1230, 4], ['e_inf', 560, 560, 4], ['e_arc', 330, 490], ['e_inf', 450, 250, 5], ['e_cav', 620, 330]]);
  ours(g, 720, 1360);
  sign(g, 800, 1290, '← из Рима', '#ff8a6a'); sign(g, 470, 24, '↑ к Анцию', '#9ec1ff'); sign(g, 75, 160, 'море', '#9ec1ff'); sign(g, 430, 820, 'Священный остров', '#e2c9a0'); sign(g, 800, 1170, 'лагуна', '#b8e0e0');
  num(g, 780, 1320, 1); num(g, 560, 1200, 2); num(g, 330, 1180, 3); num(g, 430, 980, 4); num(g, 740, 810, 4); num(g, 560, 700, 5); num(g, 205, 300, 6); num(g, 540, 270, 7);
}
// ---------------------------------------------------------------- АНЦИЙ · Один мост · 3/5
// The town on a cliff headland, its harbour under the cliffs with a stone quay; the Astura with one fortified bridge,
// a sandbar ford at the mouth under the walls and a site for the engineers' bridge; the aqueduct strides across the plain on arches.
function antium(g, r) {
  const XS = 220;
  grass(g, 0, 0, WW, WH, '#80cc54', r); sea(g, 0, 0, XS, WH, r);
  oliveTerrace(g, 690, 120, 180, 5);
  roads(g, [[[[450, 1500], [450, 1240], [450, 1020], [450, 920], [450, 760], [450, 620], [440, 420], [440, 320]], 36], [[[450, 1240], [620, 1140], [740, 1000], [760, 940]], 26], [[[450, 1240], [330, 1080], [290, 940], [290, 880]], 24]], r);
  stream(g, [[900, 900], [700, 880], [560, 860], [450, 858], [320, 836], [290, 832]], 80, r);
  mouth(g, XS, 832, 80);
  for (const [x, y, s] of [[262, 836, 1], [284, 852, 1.1], [302, 828, 0.9], [270, 868, 0.8], [294, 874, 0.9]]) stone(g, x, y, s);
  // the headland: cliffs falling to the sea, the harbour and its quay below the town wall
  { const C = [[XS + 40, 0], [XS + 50, 200], [XS + 70, 390], [XS + 70, 560], [XS + 50, 640]]; g.beginPath(); C.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = C.length - 1; i >= 0; i--) g.lineTo(C[i][0] - 34, C[i][1] + 6); g.closePath(); const cg = g.createLinearGradient(XS, 0, XS + 70, 0); cg.addColorStop(0, '#8a5a30'); cg.addColorStop(1, '#c48a4a'); fo(g, cg, 2.6); }
  harbour(g, XS + 6, 410, 540, 70); rr(g, XS + 70, 410, 46, 130, 6); fo(g, '#cfc3ac', 2.6); boat(g, XS + 30, 470, 0.7); boat(g, XS + 40, 515, 0.6);
  shore(g, XS, 650, 784); shore(g, XS, 880, 1500);
  wall(g, [[340, 600], [340, 160], [500, 110], [660, 170], [670, 600]], '#d8ccb4', [1]);
  { g.save(); g.translate(330, 476); g.rotate(-Math.PI / 2); stairs(g, 0, -20, 26, 40); g.restore(); }
  stoneBridge(g, 450, 810, 906, 36);
  rr(g, 404, 740, 92, 46, 4); fo(g, '#d8ccb4', 2.6); for (let k = 0; k < 6; k++) { rr(g, 406 + k * 15, 732, 10, 10, 2); fo(g, '#d8ccb4', 2); } rr(g, 434, 756, 32, 30, 10); fo(g, '#3a2414', 2.2); point(g, 450, 790, 62);
  bridgeSite(g, 760, 0.0);
  // the aqueduct: one straight arcade across the plain; the road to the bridge site passes under an arch
  aqueduct(g, 500, 900, 1110); castellum(g, 470, 1110); point(g, 470, 1124, 60);
  for (const [x, y] of [[400, 260], [420, 480], [580, 250], [600, 480], [400, 380], [610, 370]]) house(g, x, y);
  g.beginPath(); g.ellipse(500, 330, 92, 50, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke(); point(g, 500, 336, 80); temple(g, 500, 320, 108);
  for (const [x, y] of [[640, 930], [340, 930], [700, 960], [560, 950]]) reeds(g, x, y);
  for (const [x, y, s] of [[760, 1300, 1], [300, 1200, 1.1], [600, 1360, 1], [340, 1420, 0.9], [820, 1450, 1]]) pine(g, x, y, s);
  grove(g, 820, 1200, 60, 70, 7, 3);
  camp(g, 450, 1390);
  foe(g, [['e_inf', 450, 700, 5], ['e_arc', 400, 730], ['e_arc', 500, 730], ['e_arc', 360, 640], ['e_inf', 700, 790], ['e_cav', 620, 660], ['e_inf', 540, 1170, 4], ['e_arc', 312, 450, 2], ['hoplite', 500, 440, 6], ['e_arc', 400, 330], ['e_cav', 620, 290]]);
  ours(g, 450, 1350);
  sign(g, 450, 1482, '↓ из Остии', '#ff8a6a'); sign(g, 500, 24, '↑ к Капуе', '#9ec1ff'); sign(g, 780, 80, '→ к Пренесте', '#9ec1ff'); sign(g, 100, 160, 'море', '#9ec1ff'); sign(g, 650, 900, 'Астура', '#9ec1ff');
  num(g, 450, 1300, 1); num(g, 410, 1160, 2); num(g, 510, 780, 3); num(g, 262, 790, 4); num(g, 800, 920, 5); num(g, 300, 420, 6); num(g, 590, 290, 7);
}
// ---------------------------------------------------------------- ПРЕНЕСТЕ · Крепость на холме · 4/5
// Two gates into the walled hill town: the south gate at the end of the causeway, the east gate at the end of the long way past the mill.
function praeneste(g, r) {
  grass(g, 0, 0, WW, WH, '#7cc850', r);
  plateau(g, [[120, 0], [780, 0], [760, 380], [620, 470], [450, 500], [280, 470], [140, 380]], [[140, 380], [280, 470], [450, 500], [620, 470], [760, 380]], 40, '#a6d468', r);
  const AP = []; for (let y = 40; y <= 1240; y += 70) AP.push([860 + (y * 7 % 30), y + 40, 100 + (y % 3) * 14, 90 + (y % 5) * 10, 1]); AP.sort((a, b) => a[1] - b[1]).forEach(([x, y, w, h, s]) => peak(g, x, y, w, h, s));
  swampZone(g, [[700, 520], [790, 640], [520, 1020], [260, 1140], [120, 1080], [200, 940], [470, 700]], r);
  hummock(g, 300, 880, 46); hummock(g, 610, 760, 44);
  roads(g, [[[[450, 1500], [450, 1200], [440, 1080], [450, 980]], 36], [[[450, 640], [450, 560], [450, 500], [450, 300]], 34, true], [[[450, 1200], [700, 1120], [790, 900], [800, 700], [760, 560], [748, 452], [726, 404], [690, 370]], 26]], r);
  stream(g, [[760, 470], [600, 640], [440, 820], [260, 1000], [0, 1180]], 30, r);
  causeway(g, [[450, 980], [450, 820], [450, 640]]);
  stairs(g, 450, 484, 34, 44); { g.save(); g.translate(724, 414); g.rotate(-0.7); stairs(g, 0, -24, 28, 48); g.restore(); }
  wall(g, [[150, 380], [280, 470], [420, 500], [480, 500], [620, 470], [700, 420], [750, 380]], '#c8b894', [2, 5]);
  terraces(g, 450, 300); point(g, 450, 330, 92);
  for (const [x, y] of [[240, 260], [660, 260], [220, 140], [680, 120], [330, 420], [570, 410]]) house(g, x, y);
  watchtower(g, 490, 620); point(g, 470, 630, 64);
  mill(g, 820, 840); point(g, 800, 850, 60);
  // the west side: a limestone quarry under the hill, charcoal burners in a pine wood, a farm with a vineyard below the swamp
  quarry(g, 110, 560);
  grove(g, 90, 760, 70, 60, 9, 11); for (const [dx, dy] of [[150, 800], [40, 860]]) pine(g, dx, dy, 0.9);
  rr(g, 150, 690, 34, 22, 6); fo(g, '#6a4a30', 2); for (const [sx, sy] of [[167, 680], [172, 666], [165, 652]]) { g.beginPath(); g.arc(sx, sy, 6, 0, 7); g.fillStyle = 'rgba(230,230,225,.75)'; g.fill(); }
  vineyard(g, 40, 1240, 180, 100); etrHouse(g, 270, 1300); etrHouse(g, 230, 1250); olive(g, 300, 1220, 1); olive(g, 60, 1380, 0.9);
  path(g, [[200, 1240], [230, 1100], [200, 940], [150, 760], [120, 600]], 18);
  // an oak wood on the foothills (cover for both sides), a shepherds' hamlet with its pen, a shrine on a rock above the mill road
  grove(g, 700, 1090, 90, 70, 12, 7);
  for (const [x, y] of [[620, 1290], [700, 1330], [770, 1280]]) etrHouse(g, x, y);
  g.beginPath(); g.ellipse(700, 1220, 58, 26, 0, 0, 7); g.fillStyle = '#c8e08a'; g.fill(); g.setLineDash([3, 5]); g.lineWidth = 4; g.strokeStyle = '#8a5a30'; g.stroke(); g.setLineDash([]);
  for (const [dx, dy] of [[-30, -6], [-10, 6], [12, -8], [30, 4], [0, -16]]) { blob(g, 700 + dx, 1220 + dy, 9, 6, dx, 8); fo(g, '#fbfaf2', 1.8); g.fillStyle = OL; g.beginPath(); g.arc(700 + dx + 8, 1220 + dy - 2, 3, 0, 7); g.fill(); }
  blob(g, 790, 560, 46, 28, 3, 10); fo(g, '#a59a8c', 2.6); blob(g, 790, 552, 38, 20, 4, 10); fo(g, '#9ccc5a', 2.2); temple(g, 790, 556, 46);
  for (const [x, y] of [[760, 680], [640, 1000]]) rock(g, x, y, 1);
  camp(g, 450, 1380);
  foe(g, [['e_inf', 450, 700, 5], ['e_arc', 400, 600], ['e_arc', 520, 580], ['ambush', 300, 872, 4], ['ambush', 610, 752, 4], ['e_inf', 780, 760, 4], ['e_arc', 760, 600], ['ambush', 700, 1100, 3], ['hoplite', 450, 450, 6], ['e_inf', 650, 380, 4], ['e_arc', 300, 440], ['e_arc', 560, 440], ['e_inf', 150, 620, 3], ['e_inf', 260, 300], ['e_cav', 450, 150]]);
  ours(g, 450, 1340);
  sign(g, 450, 1482, '↓ из Тибура', '#ff8a6a'); sign(g, 860, 1300, 'Апеннины', '#e2c9a0'); sign(g, 330, 1100, 'болото у Трера', '#b8e0a0');
  num(g, 450, 1290, 1); num(g, 400, 860, 2); num(g, 540, 660, 3); num(g, 840, 780, 4); num(g, 240, 940, 5); num(g, 720, 400, 6); num(g, 560, 220, 7);
}
// ---------------------------------------------------------------- КАПУЯ · Столица · 5/5
// The points sit far apart: a winery in the fields south of the river, the amphitheater outside the east wall, the Capitol inside.
function capua(g, r) {
  grass(g, 0, 0, WW, WH, '#8ad25c', r);
  vineyard(g, 40, 1180, 170, 100); vineyard(g, 640, 1040, 180, 110); vineyard(g, 260, 1160, 120, 80);
  roads(g, [[[[450, 1500], [450, 1200], [300, 1020], [265, 930], [265, 760], [320, 680], [450, 660]], 34], [[[450, 1200], [620, 1040], [655, 900], [655, 740], [580, 680], [450, 660]], 34], [[[450, 660], [450, 500], [450, 300]], 38, true], [[[655, 740], [760, 620], [800, 520]], 30], [[[300, 1020], [200, 1120]], 26]], r);
  stream(g, [[900, 760], [700, 820], [500, 880], [300, 860], [0, 900]], 70, r);
  stoneBridge(g, 265, 820, 910, 36); stoneBridge(g, 655, 792, 884, 36);
  wall(g, [[180, 620], [180, 150], [450, 90], [720, 150], [720, 620], [560, 640], [340, 640], [180, 620]], '#d8ccb4', [5]);
  arch(g, 450, 670);
  arena(g, 810, 420, 80, 52, r); point(g, 810, 432, 76);
  horrea(g, 200, 1100); point(g, 200, 1124, 70);
  g.beginPath(); g.ellipse(450, 240, 110, 60, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke(); point(g, 450, 246, 90); temple(g, 450, 230, 140);
  horrea(g, 600, 420);
  for (const [x, y] of [[260, 220], [640, 230], [560, 560], [330, 560], [250, 440], [300, 330]]) house(g, x, y);
  for (const [x, y, s] of [[60, 760, 1], [840, 980, 1], [400, 1100, 0.9], [520, 1300, 1], [860, 700, 0.9]]) olive(g, x, y, s);
  camp(g, 450, 1380);
  foe(g, [['e_inf', 265, 760, 4], ['e_arc', 200, 730], ['e_inf', 655, 740, 4], ['e_arc', 740, 700], ['e_cav', 450, 990, 4], ['e_inf', 240, 1050, 4], ['e_inf', 800, 540, 4], ['e_arc', 860, 330], ['hoplite', 450, 600, 6], ['e_arc', 380, 620], ['e_arc', 520, 620], ['e_inf', 300, 460, 5], ['e_inf', 600, 500, 5], ['hoplite', 450, 330, 6], ['e_cav', 330, 260]]);
  ours(g, 450, 1340);
  sign(g, 450, 1482, '↓ из Пренесте', '#ff8a6a'); sign(g, 760, 870, 'Вольтурн', '#9ec1ff');
  num(g, 450, 1290, 1); num(g, 140, 1060, 2); num(g, 200, 860, 3); num(g, 710, 840, 3); num(g, 520, 760, 4); num(g, 880, 470, 5); num(g, 580, 180, 6);
}
const CITIES = [['ostia', ostia, 31], ['antium', antium, 37], ['praeneste', praeneste, 41], ['capua', capua, 43]];
const go = () => { for (const [id, fn, seed] of CITIES) { const c = document.getElementById(id), g = c.getContext('2d'); g.scale(2, 2); fn(g, rng(seed)); } };
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load('900 20px "Lilita One"'), document.fonts.load('700 13px "Alegreya Sans"')]).catch(() => 0) : Promise.resolve()).then(go);
`;
const card = (id, title, sub, items) => `<article class="city"><div class="map"><canvas id="${id}" width="1800" height="3000" aria-label="Карта боя: ${title}"></canvas></div><section><h2>${title}</h2><p class="sub">${sub}</p><ol>${items.map(i => '<li>' + i + '</li>').join('')}</ol></section></article>`;
const html = `<title>Карты городов</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800;900&display=swap">
<style>
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --gold: #f2c14a; --display: 'Lilita One', 'Alegreya Sans', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.45; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 28px 16px 56px; }
  h1 { font-family: var(--display); font-weight: 400; font-size: 42px; line-height: 1.05; margin: 0 0 10px; color: #ffe6a8; }
  h2 { font-family: var(--display); font-weight: 400; font-size: 30px; margin: 0 0 4px; color: #ffe6a8; }
  p { margin: 0 0 10px; color: var(--muted); max-width: 860px; } b { color: var(--ink); } .sub { color: var(--gold); font-weight: 800; }
  .city { display: grid; grid-template-columns: minmax(0, 440px) minmax(0, 1fr); gap: 24px; align-items: start; margin: 28px 0 40px; }
  @media (max-width: 860px) { .city { grid-template-columns: minmax(0, 1fr); } }
  .map { border-radius: 22px; overflow: hidden; border: 4px solid #1a0e06; box-shadow: 0 18px 44px rgba(0,0,0,.55); line-height: 0; }
  canvas { display: block; width: 100%; height: auto; }
  ol { margin: 0; padding-left: 22px; color: var(--muted); display: grid; gap: 6px; } li::marker { color: var(--gold); font-weight: 900; }
</style>
<div class="wrap">
  <h1>Карты городов Лация</h1>
  <p>Ещё четыре карты в том же стиле, что Тибур и Вейи. Каждая повторяет карту кампании — откуда приходим, где море, реки и горы, какой у города значок — и описание боя провинции. Сила врага растёт от Остии к Капуе.</p>
  ${card('ostia', 'Остия · Устье Тибра', 'сила врага 2/5 · 9 отрядов', ['<b>Лагерь</b> на юго-востоке, на дороге из Рима.', '<b>Солеварни</b> на сухом берегу у лагуны — точка захвата, +3 в резерв. Лагуна мелкая и медленная.', '<b>Сосновый бор на песке</b> у моря — там засада.', '<b>Тибр раздваивается</b> вокруг Священного острова: мост на остров и второй мост в город. Оба рукава впадают в море.', '<b>Паром</b> через восточный рукав (точка 4 справа): инженеры перетягивают плот — короткий путь к верфи.', '<b>Верфь на острове</b> — точка захвата.', '<b>Гавань</b> открыта в море между двумя молами, маяк на конце мола — как значок Остии; вдоль улиц склады.', '<b>Форум с храмом</b> — финал.'])}
  ${card('antium', 'Анций · Один мост', 'сила врага 3/5 · 11 отрядов', ['<b>Лагерь</b> на юге, на дороге из Остии.', '<b>Акведук</b> — прямая аркада через равнину; ходить можно под арками. <b>Водонапорная башня</b> у его конца — точка захвата.', '<b>Единственный мост</b> через Астуру, на северном конце — предмостье: точка захвата, его держит сильный отряд.', '<b>Мель у устья</b>: перейти вброд можно, но её простреливают со стен.', '<b>Место для временного моста</b> восточнее — его наводят инженеры.', '<b>Гавань под скалами</b> открыта в море; с каменной пристани лестница ведёт в город — путь в обход ворот, на пристани лучники.', '<b>Храм Фортуны Анциатской</b> — финал, его стережёт фаланга. На холмах оливковые террасы.'])}
  ${card('praeneste', 'Пренесте · Крепость на холме', 'сила врага 4/5 · 13 отрядов', ['<b>Лагерь</b> на юге, на дороге из Тибура.', '<b>Гать</b> через болото у Трера — кратчайший путь к южным воротам.', '<b>Сторожевая башня</b> у конца гати — точка захвата.', '<b>Мельница</b> у Апеннин — точка захвата на длинном обходе.', '<b>Засады на кочках</b> в болоте — пригодятся разведчики.', '<b>Два входа в город</b>: южные ворота с гати и восточные — в конце обхода мимо мельницы, по лестнице на холм.', '<b>Святилище Фортуны</b> террасами на склоне, круглый храм наверху — финал.'])}
  ${card('capua', 'Капуя · Столица', 'сила врага 5/5 · 15 отрядов', ['<b>Лагерь</b> на юге, на дороге из Пренесте.', '<b>Винодельня</b> среди виноградников Кампании, на нашем берегу — первая точка захвата.', '<b>Два моста</b> через Вольтурн, оба под охраной.', '<b>Триумфальная арка</b> — главные ворота, как значок Капуи; за ней фаланга.', '<b>Амфитеатр</b> гладиаторов за восточной стеной — вторая точка, к нему ведёт дорога от восточного моста.', '<b>Капитолий</b> в центре города — финал, его держат фаланга и конница.'])}
</div>
<script>
'use strict';
${helpers}
${ban}
${art}
${tsheet}
${tibHelpers}
${veiiHelpers}
${seaFns}
${arenaFn}
${templeFn}
${draw}
</script>
`;
fs.writeFileSync(path.join(__dirname, 'cities.html'), html);
console.log('ok', html.length);
