// Builds sardinia-more.html: the landing battle maps in the game's own map style — variant A (dawn at the nuraghes) and four new layouts.
const fs = require('fs'), path = require('path');
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); return src.slice(i, j); };
const gen = fs.readFileSync('gen.js', 'utf8');
const art = between(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const ban = between(cas, 'const BAN = {', 'const REFILL');
const jsAll = gen.slice(gen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, gen.indexOf('`;\nconst html'));
const helpers = jsAll.slice(0, jsAll.indexOf('function drawWorld(g) {'));
const sd = fs.readFileSync('sardinia.js', 'utf8');
const pieces = sd.slice(sd.indexOf('// ---------------------------------------------------------------- landing pieces'), sd.indexOf('// ---------------------------------------------------------------- B: storm'));

const own = String.raw`
const gaussX = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
function sea(g, y0, a, b) { const sg = g.createLinearGradient(0, y0, 0, 1500); sg.addColorStop(0, a); sg.addColorStop(1, b); g.fillStyle = sg; g.fillRect(0, y0, 900, 1500 - y0); }
function reedsB(g, x, y, s) { for (const [dx, h, a] of [[-5, 26, -0.15], [0, 32, 0], [5, 24, 0.18]]) { g.save(); g.translate(x + dx * s, y); g.rotate(a); g.strokeStyle = OL; g.lineWidth = 4.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -h * s); g.stroke(); g.strokeStyle = '#5a9a34'; g.lineWidth = 2.4; g.stroke(); rr(g, -3, -h * s - 8, 6, 12, 3); fo(g, '#8a5a30', 1.8); g.restore(); } }
function sandbar(g, x, y, rx, ry, seed) { blob(g, x, y + 4, rx + 6, ry + 5, seed, 12); g.fillStyle = 'rgba(70,140,150,.55)'; g.fill(); blob(g, x, y, rx, ry, seed, 12); fo(g, '#f2d48a', 3.4); g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + (k - 2) * rx * 0.3, y + (k % 2 - 0.5) * ry * 0.5, rx * 0.15, 2.4, 0, 0, 7); g.fill(); } }
function tower(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = 'rgba(20,20,10,.3)'; g.beginPath(); g.ellipse(10, 4, 34, 9, 0, 0, 7); g.fill(); for (const dx of [-22, 22]) { rr(g, dx - 4, -50, 8, 52, 2); fo(g, '#8a5a30', 2.6); } rr(g, -34, -66, 68, 20, 4); fo(g, '#a8763e', 3); for (let q = -26; q <= 26; q += 13) { g.beginPath(); g.moveTo(q, -66); g.lineTo(q, -46); g.strokeStyle = 'rgba(50,25,10,.5)'; g.lineWidth = 2; g.stroke(); } g.beginPath(); g.moveTo(-40, -66); g.lineTo(0, -92); g.lineTo(40, -66); g.closePath(); fo(g, '#b0483a', 3); g.restore(); }
function bigPlank(g, pts, w) { for (let i = 0; i < pts.length - 1; i++) plank(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w); }
function roadPath(g, pts, w) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = w + 6; g.strokeStyle = OL; g.stroke(); g.lineWidth = w; g.strokeStyle = '#e3c98a'; g.stroke(); }
function wetEnd(g, x, y0, y1, w) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#e3c98a'); gr.addColorStop(1, '#9a7442'); g.beginPath(); g.moveTo(x - w / 2, y0); g.lineTo(x - w / 2 - 12, y1); g.lineTo(x + w / 2 + 12, y1); g.lineTo(x + w / 2, y0); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(43,26,16,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - w / 2, y0); g.lineTo(x - w / 2 - 12, y1); g.moveTo(x + w / 2, y0); g.lineTo(x + w / 2 + 12, y1); g.stroke(); for (const [dx, dy, s, c] of [[-w / 2 - 10, 0.3, 1, '#b9ab94'], [w / 2 + 10, 0.5, 1.1, '#9a8c76'], [-w / 2 - 14, 0.8, 1.1, '#9a8c76'], [w / 2 + 14, 0.95, 1, '#b9ab94']]) { const yy = y0 + (y1 - y0) * dy; g.beginPath(); g.ellipse(x + dx, yy, 8 * s, 5 * s, 0, 0, 7); fo(g, c, 2.2); } }

// ---------------------------------------------------------------- C: two beaches and a fortified cape (day)
function mapC(g, t) {
  const r = rng(31), f = x => 1010 + 210 * gaussX(x, 450, 100) + 10 * Math.sin(x * 0.02);
  g.fillStyle = '#7ba83a'; g.fillRect(0, 0, 900, 1500); for (let i = 0; i < 150; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,160,.14)' : 'rgba(40,90,20,.14)'; g.beginPath(); g.ellipse(r() * 900, 100 + r() * 880, 22 + r() * 24, 8, 0, 0, 7); g.fill(); }
  sea(g, 1000, '#7fe0d0', '#1580a8'); band(g, x => f(x) + 60, 1500, '#1fa7c9'); g.beginPath(); g.moveTo(0, f(0)); for (let x = 12; x <= 900; x += 12) g.lineTo(x, f(x)); for (let x = 900; x >= 0; x -= 12) g.lineTo(x, f(x) + 60); g.closePath(); g.fillStyle = '#86e3d2'; g.fill();
  g.beginPath(); g.moveTo(0, f(0) - 90); for (let x = 12; x <= 900; x += 12) g.lineTo(x, f(x) - 90 + 14 * Math.sin(x * 0.03)); for (let x = 900; x >= 0; x -= 12) g.lineTo(x, f(x)); g.closePath(); fo(g, '#f2d48a', 3.4);
  foam(g, f, t, 0.9);
  // the cape: a rocky headland with a tower and a ballista
  g.beginPath(); g.moveTo(330, 930); g.bezierCurveTo(340, 1100, 400, 1230, 450, 1232); g.bezierCurveTo(500, 1230, 560, 1100, 570, 930); g.closePath(); fo(g, '#8c7a6b', 3.6); g.beginPath(); g.ellipse(450, 960, 112, 52, 0, 0, 7); fo(g, '#a89884', 3.4);
  for (const [x, y, s] of [[380, 1100, 1], [520, 1120, 1.1], [450, 1190, 1]]) reef(g, x, y, s, '#8c7a6b');
  tower(g, 450, 1000, 1.2); stakes(g, 380, 1020, 520, 1020); for (const [x, y] of [[400, 1040], [500, 1040]]) squad(g, x, y, 'e_arc', 2, 2, 0.8, '#7a2a8a', 'pennant', -1);
  // beaches left and right: the paths climb to the plateau and meet behind the rocks
  for (const side of [-1, 1]) { const x0 = 450 + side * 250; roadPath(g, [[x0, 960], [x0 + side * 40, 800], [x0 - side * 10, 640], [450 + side * 90, 500]], 30); wetEnd(g, x0, 940, 1040, 30); }
  ridge(g, 120, 760, 160, 110, '#8c7a6b', 'rgba(60,40,30,.28)'); ridge(g, 780, 760, 160, 110, '#8c7a6b', 'rgba(60,40,30,.28)'); ridge(g, 450, 760, 120, 90, '#8c7a6b', 'rgba(60,40,30,.28)');
  for (const [x, y, s] of [[300, 760, 1], [600, 760, 1], [60, 900, 1], [840, 900, 1]]) maquis(g, x, y, s); for (const [x, y, s] of [[260, 880, 1], [650, 880, 1], [140, 1000, 1], [760, 1000, 1]]) olive(g, x, y, s); for (const [x, y] of [[200, 1050], [700, 1050], [330, 960], [570, 960]]) agave(g, x, y, 1);
  cliff(g, [[0, 430], [200, 440], [450, 420], [700, 444], [900, 432]], 46, '#b3a37a', '#8c7a6b'); stakes(g, 160, 360, 740, 362);
  nuraghe(g, 450, 320, 2.1); for (const [x, y, s] of [[160, 220, 0.6], [740, 220, 0.6]]) nuraghe(g, x, y, s); for (const [x, y] of [[270, 330], [630, 330], [180, 300], [720, 300]]) carthTent(g, x, y);
  squad(g, 330, 420, 'e_arc', 2, 3, 0.9, '#7a2a8a', 'pennant', -1); squad(g, 570, 420, 'e_arc', 2, 3, 0.9, '#7a2a8a', 'pennant', -1); squad(g, 120, 830, 'e_inf', 2, 4, 0.9, '#7a2a8a', 'vex', -1); squad(g, 790, 830, 'e_inf', 2, 4, 0.9, '#7a2a8a', 'vex', -1);
  squad(g, 190, 1010, 'tiro', 1, 4, 0.95, '#e2382c', 'vex'); squad(g, 260, 1030, 'velites', 1, 3, 0.9, '#e2382c', 'pennant'); squad(g, 640, 1010, 'tiro', 1, 4, 0.95, '#e2382c', 'vex'); squad(g, 710, 1030, 'eng', 1, 3, 0.9, '#e2382c', 'pennant');
  for (const [x, y] of [[170, 1330], [330, 1390], [570, 1390], [730, 1330]]) trireme(g, x, y, 0.95, '#d6402e', 0); for (const x of [190, 710]) plank(g, x, 1290, x, 1080, 26);
  for (const [x, y, a] of [[300, 1190, 0.3], [600, 1190, -0.3]]) boat(g, x, y, 1, a);
  foam(g, x => f(x) + 60, t, 0.4); const dg = g.createLinearGradient(0, 0, 0, 600); dg.addColorStop(0, 'rgba(255,240,200,.25)'); dg.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = dg; g.fillRect(0, 0, 900, 600);
}
// ---------------------------------------------------------------- D: river mouth and the enemy port (golden afternoon)
function mapD(g, t) {
  const r = rng(37), f = x => 1090 + 14 * Math.sin(x * 0.012) + 8 * Math.sin(x * 0.04);
  g.fillStyle = '#7ba83a'; g.fillRect(0, 0, 900, 1500); for (let i = 0; i < 150; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,160,.14)' : 'rgba(40,90,20,.14)'; g.beginPath(); g.ellipse(r() * 900, 100 + r() * 980, 22 + r() * 24, 8, 0, 0, 7); g.fill(); }
  sea(g, 1060, '#7fe0d0', '#1580a8'); band(g, x => f(x) + 60, 1500, '#1fa7c9'); g.beginPath(); g.moveTo(0, f(0)); for (let x = 12; x <= 900; x += 12) g.lineTo(x, f(x)); for (let x = 900; x >= 0; x -= 12) g.lineTo(x, f(x) + 60); g.closePath(); g.fillStyle = '#86e3d2'; g.fill();
  // sandy left shore (our beach) and the river
  g.beginPath(); g.moveTo(0, f(0) - 140); for (let x = 12; x <= 460; x += 12) g.lineTo(x, f(x) - 130 + 14 * Math.sin(x * 0.04)); for (let x = 460; x >= 0; x -= 12) g.lineTo(x, f(x)); g.closePath(); fo(g, '#f2d48a', 3.4);
  g.beginPath(); g.moveTo(520, 440); g.bezierCurveTo(560, 640, 500, 800, 560, 1000); g.lineTo(560, 1100); g.lineTo(700, 1100); g.bezierCurveTo(690, 960, 650, 800, 690, 620); g.bezierCurveTo(700, 520, 660, 480, 640, 430); g.closePath(); fo(g, '#49b6d6', 4); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; for (let k = 0; k < 12; k++) { const y = 480 + k * 50; g.beginPath(); g.moveTo(580 + Math.sin(k) * 14, y); g.quadraticCurveTo(610, y - 6, 640 + Math.sin(k) * 10, y); g.stroke(); }
  foam(g, f, t, 0.9);
  // the enemy port on the right bank: houses, quay, a chain boom and two warships
  for (const [x, y] of [[760, 700], [830, 760], [770, 830], [840, 900], [760, 960], [830, 1010]]) house(g, x, y);
  rr(g, 700, 700, 22, 330, 3); fo(g, '#8a5a30', 3); for (let y = 710; y < 1020; y += 12) { g.beginPath(); g.moveTo(702, y); g.lineTo(720, y); g.strokeStyle = 'rgba(40,20,5,.5)'; g.lineWidth = 2; g.stroke(); }
  trireme(g, 662, 1000, 0.8, '#7a2a8a', 0); trireme(g, 662, 880, 0.8, '#7a2a8a', 0); for (const [x, y] of [[560, 1070], [590, 1074], [620, 1078], [650, 1082], [680, 1086]]) { g.beginPath(); g.arc(x, y, 8, 0, 7); fo(g, '#c9a14a', 2.4); }
  tower(g, 790, 680, 1.1); stakes(g, 730, 1060, 900, 1060);
  squad(g, 760, 1040, 'e_inf', 2, 4, 0.85, '#7a2a8a', 'vex', -1); squad(g, 800, 870, 'e_arc', 2, 3, 0.85, '#7a2a8a', 'pennant', -1);
  // the bridge, the road along the river and the plateau fort
  plank(g, 520, 620, 700, 620, 34); for (const x of [520, 700]) { rr(g, x - 6, 600, 12, 40, 3); fo(g, '#6a4220', 2.6); }
  roadPath(g, [[300, 990], [330, 860], [440, 760], [470, 640], [560, 620]], 30); wetEnd(g, 300, 960, 1060, 30); roadPath(g, [[700, 620], [790, 520], [680, 380]], 30);
  ridge(g, 150, 640, 190, 130, '#8c7a6b', 'rgba(60,40,30,.28)'); for (const [x, y, s] of [[360, 700, 1], [260, 880, 1], [440, 960, 1], [80, 860, 1]]) maquis(g, x, y, s); for (const [x, y, s] of [[220, 760, 1], [400, 880, 1]]) olive(g, x, y, s); for (const [x, y] of [[80, 1000], [380, 1040], [200, 1030]]) agave(g, x, y, 1);
  cliff(g, [[0, 330], [200, 340], [450, 320], [700, 344], [900, 332]], 46, '#b3a37a', '#8c7a6b'); stakes(g, 120, 262, 560, 262); nuraghe(g, 400, 230, 1.9); nuraghe(g, 760, 190, 0.8); for (const [x, y] of [[250, 240], [560, 240]]) carthTent(g, x, y);
  squad(g, 330, 330, 'e_arc', 2, 3, 0.9, '#7a2a8a', 'pennant', -1); squad(g, 150, 780, 'e_inf', 2, 4, 0.9, '#7a2a8a', 'vex', -1); squad(g, 430, 620, 'e_inf', 2, 4, 0.9, '#7a2a8a', 'vex', -1);
  squad(g, 150, 1010, 'tiro', 1, 4, 0.95, '#e2382c', 'vex'); squad(g, 240, 1030, 'velites', 1, 3, 0.9, '#e2382c', 'pennant'); squad(g, 320, 1040, 'eques', 1, 3, 0.95, '#e2382c', 'swallow'); squad(g, 60, 1050, 'eng', 1, 3, 0.9, '#e2382c', 'pennant');
  for (const [x, y] of [[110, 1340], [270, 1390], [430, 1350]]) trireme(g, x, y, 0.95, '#d6402e', 0); for (const x of [110, 270]) plank(g, x, 1290, x, 1130, 26); boat(g, 430, 1200, 1, 0.1);
  const dg = g.createLinearGradient(0, 0, 900, 0); dg.addColorStop(0, 'rgba(255,190,90,.0)'); dg.addColorStop(1, 'rgba(255,170,60,.32)'); g.fillStyle = dg; g.fillRect(0, 0, 900, 1500);
}
// ---------------------------------------------------------------- E: the cove between two cliffs (mist)
function mapE(g, t) {
  const r = rng(43);
  g.fillStyle = '#7ba83a'; g.fillRect(0, 0, 900, 1500); for (let i = 0; i < 150; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,160,.14)' : 'rgba(40,90,20,.14)'; g.beginPath(); g.ellipse(r() * 900, 100 + r() * 900, 22 + r() * 24, 8, 0, 0, 7); g.fill(); }
  const cove = (d) => { g.beginPath(); g.moveTo(0, 1250 - d); g.lineTo(250, 1090 - d); g.lineTo(310, 1010 - d); g.lineTo(590, 1010 - d); g.lineTo(650, 1090 - d); g.lineTo(900, 1250 - d); g.lineTo(900, 1500); g.lineTo(0, 1500); g.closePath(); };
  cove(0); g.fillStyle = '#86e3d2'; g.fill(); cove(-40); g.fillStyle = '#1fa7c9'; g.fill(); const sg = g.createLinearGradient(0, 1100, 0, 1500); sg.addColorStop(0, 'rgba(31,167,201,0)'); sg.addColorStop(1, '#1580a8'); cove(-40); g.fillStyle = sg; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 6; g.lineJoin = 'round'; cove(0); g.stroke();
  // the narrow beach at the end of the cove
  g.beginPath(); g.ellipse(450, 960, 150, 56, 0, 0, 7); fo(g, '#f2d48a', 3.6); g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 12; k++) { g.beginPath(); g.ellipse(340 + r() * 220, 940 + r() * 60, 6 + r() * 10, 2.4, 0, 0, 7); g.fill(); }
  // cliffs on both sides with ridges, nuraghes and archers on the rims
  for (const sdn of [-1, 1]) { const x = 450 + sdn * 370; g.beginPath(); g.moveTo(450 + sdn * 150, 1000); g.lineTo(450 + sdn * 240, 1060); g.lineTo(450 + sdn * 450, 1240); g.lineTo(450 + sdn * 450, 760); g.lineTo(450 + sdn * 180, 780); g.closePath(); fo(g, '#8c7a6b', 3.6); ridge(g, x, 900, 150, 120, '#9a8878', 'rgba(60,40,30,.3)'); nuraghe(g, x, 840, 0.95); stakes(g, x - 70, 880, x + 70, 880); squad(g, x - 30, 920, 'e_arc', 2, 3, 0.8, '#7a2a8a', 'pennant', -sdn); }
  // the zig-zag path up the middle, wet at the foot
  roadPath(g, [[450, 930], [370, 820], [530, 700], [380, 580], [470, 450]], 32); wetEnd(g, 450, 930, 1000, 34);
  for (const [x, y, s] of [[300, 700, 1], [600, 600, 1], [260, 560, 1], [640, 800, 1]]) maquis(g, x, y, s); for (const [x, y, s] of [[300, 620, 1], [600, 700, 1]]) olive(g, x, y, s);
  cliff(g, [[0, 400], [200, 410], [450, 390], [700, 414], [900, 402]], 46, '#b3a37a', '#8c7a6b'); stakes(g, 200, 330, 700, 332); nuraghe(g, 450, 290, 2.2); for (const [x, y] of [[250, 300], [650, 300]]) carthTent(g, x, y); for (const [x, y] of [[360, 230], [540, 230]]) { g.beginPath(); g.ellipse(x, y, 16, 7, 0, 0, 7); fo(g, '#5a4a40', 2.4); fire(g, x, y - 2, 0.55, t); }
  squad(g, 340, 390, 'e_arc', 2, 3, 0.9, '#7a2a8a', 'pennant', -1); squad(g, 560, 390, 'e_arc', 2, 3, 0.9, '#7a2a8a', 'pennant', -1); squad(g, 430, 640, 'e_inf', 2, 4, 0.9, '#7a2a8a', 'vex', -1);
  squad(g, 400, 980, 'tiro', 1, 4, 0.95, '#e2382c', 'vex'); squad(g, 500, 985, 'velites', 1, 3, 0.9, '#e2382c', 'pennant'); squad(g, 450, 1040, 'eng', 1, 3, 0.9, '#e2382c', 'pennant');
  trireme(g, 450, 1150, 0.9, '#d6402e', 0); trireme(g, 330, 1300, 0.9, '#d6402e', 0); trireme(g, 570, 1320, 0.9, '#d6402e', 0); trireme(g, 450, 1420, 0.9, '#d6402e', 0); plank(g, 450, 1070, 450, 1010, 24);
  g.fillStyle = 'rgba(225,232,240,.18)'; g.fillRect(0, 0, 900, 1500); for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(((i * 191 + t * 12) % 1100) - 100, 700 + i * 95, 160, 38, 0, 0, 7); g.fillStyle = 'rgba(235,240,246,.3)'; g.fill(); }
}
// ---------------------------------------------------------------- F: lagoon with sandbars (dusk, torches)
function mapF(g, t) {
  const r = rng(53);
  g.fillStyle = '#7ba83a'; g.fillRect(0, 0, 900, 1500); for (let i = 0; i < 120; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,160,.14)' : 'rgba(40,90,20,.14)'; g.beginPath(); g.ellipse(r() * 900, 60 + r() * 360, 22 + r() * 24, 8, 0, 0, 7); g.fill(); }
  // lagoon (shallow, slow) with a deep channel and the open sea below
  const lg = x => 440 + 12 * Math.sin(x * 0.02), sh = x => 1170 + 14 * Math.sin(x * 0.015 + 1);
  g.beginPath(); g.moveTo(0, lg(0)); for (let x = 12; x <= 900; x += 12) g.lineTo(x, lg(x)); g.lineTo(900, sh(900)); for (let x = 900; x >= 0; x -= 12) g.lineTo(x, sh(x)); g.closePath(); fo(g, '#6fd0d8', 4);
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2.5; for (let k = 0; k < 60; k++) { const x = r() * 900, y = 470 + r() * 680; g.beginPath(); g.moveTo(x - 12, y); g.quadraticCurveTo(x, y - 5, x + 12, y); g.stroke(); }
  g.beginPath(); g.moveTo(240, 520); g.bezierCurveTo(300, 700, 160, 860, 300, 1000); g.bezierCurveTo(360, 1060, 400, 1100, 420, 1180); g.lineCap = 'round'; g.lineWidth = 60; g.strokeStyle = 'rgba(31,167,201,.75)'; g.stroke();
  sea(g, 1160, '#4fc0e0', '#1580a8'); foam(g, sh, t, 0.9);
  // the sandbars are the stepping stones: south spit, three bars in the middle, the far shore
  for (const [x, y, rx, ry, s] of [[500, 1120, 150, 40, 1], [620, 940, 90, 34, 2], [420, 800, 110, 36, 3], [600, 650, 100, 34, 4], [770, 780, 70, 28, 5], [300, 560, 90, 30, 6]]) sandbar(g, x, y, rx, ry, s);
  for (const [x, y] of [[560, 1130], [470, 1115]]) agave(g, x, y, 0.8); for (const [x, y] of [[200, 1090], [330, 760], [760, 900], [700, 600], [180, 640], [830, 600]]) reedsB(g, x, y, 1.2);
  // salt pans on one bar and watchtowers on stilts
  for (const [x, y] of [[394, 790], [424, 804], [454, 790]]) { rr(g, x - 12, y - 6, 24, 12, 2); fo(g, '#fafafa', 2); } tower(g, 600, 650, 0.9); tower(g, 300, 560, 0.8); tower(g, 770, 780, 0.7);
  for (const [x, y] of [[600, 590], [300, 510], [770, 730]]) fire(g, x, y, 0.5, t);
  // the far shore: the camp and a nuraghe behind a palisade
  g.beginPath(); g.moveTo(0, 440); for (let x = 12; x <= 900; x += 12) g.lineTo(x, lg(x) + 2); g.lineTo(900, 0); g.lineTo(0, 0); g.closePath(); g.save(); g.clip(); g.fillStyle = '#7ba83a'; g.fillRect(0, 0, 900, 460); g.restore(); band(g, x => lg(x) - 30, lg(0) + 14, '#f2d48a', 0);
  g.beginPath(); g.moveTo(0, lg(0) - 40); for (let x = 12; x <= 900; x += 12) g.lineTo(x, lg(x) - 36 + 8 * Math.sin(x * 0.05)); for (let x = 900; x >= 0; x -= 12) g.lineTo(x, lg(x)); g.closePath(); fo(g, '#f2d48a', 3.4);
  stakes(g, 60, 380, 840, 380); nuraghe(g, 450, 260, 2.0); for (const [x, y, s] of [[160, 220, 0.6], [740, 210, 0.6]]) nuraghe(g, x, y, s); for (const [x, y] of [[270, 300], [630, 300], [160, 330], [740, 330]]) carthTent(g, x, y); for (const [x, y] of [[340, 240], [560, 240]]) { g.beginPath(); g.ellipse(x, y, 16, 7, 0, 0, 7); fo(g, '#5a4a40', 2.4); fire(g, x, y - 2, 0.55, t); }
  for (const [x, y, a] of [[200, 640, 0.3], [680, 520, -0.2]]) { boat(g, x, y, 1, a); squad(g, x, y - 12, 'e_arc', 2, 2, 0.55, '#7a2a8a', 'pennant', -1); }
  squad(g, 330, 430, 'e_arc', 2, 3, 0.9, '#7a2a8a', 'pennant', -1); squad(g, 570, 430, 'e_arc', 2, 3, 0.9, '#7a2a8a', 'pennant', -1); squad(g, 120, 430, 'e_inf', 2, 4, 0.9, '#7a2a8a', 'vex', -1); squad(g, 800, 430, 'e_inf', 2, 4, 0.9, '#7a2a8a', 'vex', -1);
  squad(g, 470, 1110, 'tiro', 1, 4, 0.95, '#e2382c', 'vex'); squad(g, 560, 1120, 'velites', 1, 3, 0.9, '#e2382c', 'pennant'); squad(g, 410, 1130, 'eng', 1, 3, 0.9, '#e2382c', 'pennant'); squad(g, 590, 950, 'eques', 1, 3, 0.9, '#e2382c', 'swallow');
  for (const [x, y] of [[200, 1330], [370, 1390], [560, 1380], [730, 1330]]) trireme(g, x, y, 0.95, '#d6402e', 0); for (const x of [420, 560]) plank(g, x, 1290, x, 1150, 26);
  g.fillStyle = 'rgba(70,30,90,.22)'; g.fillRect(0, 0, 900, 1500); const dg = g.createLinearGradient(0, 0, 0, 500); dg.addColorStop(0, 'rgba(255,120,50,.4)'); dg.addColorStop(1, 'rgba(255,120,50,0)'); g.fillStyle = dg; g.fillRect(0, 0, 900, 500);
  g.globalCompositeOperation = 'lighter'; for (const [x, y] of [[600, 590], [300, 510], [770, 730], [340, 240], [560, 240]]) { const lg2 = g.createRadialGradient(x, y, 4, x, y, 120); lg2.addColorStop(0, 'rgba(255,170,70,.5)'); lg2.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = lg2; g.fillRect(x - 120, y - 120, 240, 240); } g.globalCompositeOperation = 'source-over';
}
const MS = [mapA, mapC, mapD, mapE, mapF];
document.querySelectorAll('canvas').forEach((c, i) => { const g = c.getContext('2d'); MS[i](g, 0); });
`;

const cards = [
  ['A · Рассвет у нурагов', 'Ваш вариант: коса с пирсом посередине, дюны, три прохода между скалами, нураг на плато. Дорога выходит на пляж мокрым грунтом с галькой.'],
  ['C · Две бухты и мыс', 'Скалистый мыс с башней и баллистой делит берег на два пляжа. Высаживаться можно в любую бухту, дороги сходятся за скалами у лагеря. Яркий день.'],
  ['D · Устье реки и порт', 'Слева наш пляж, справа вражеский порт: причал, цепь-бон, две карфагенские триремы. Мост через реку — ключ к форту. Золотой вечер.'],
  ['E · Бухта-ущелье', 'Узкая бухта между двух высоких обрывов: корабли заходят колонной, на краях нураги с лучниками, зигзаг-тропа вверх к форту. Туман.'],
  ['F · Лагуна и косы', 'Мелкая лагуна, косы-островки как ступени, камыш, соляные ванны и сторожевые башни на сваях. Вражеские лодки в патруле. Сумерки с факелами.']
];
const html = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Десант: карты боя</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800&display=swap">
<style>
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --display: 'Lilita One', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; }
  * { box-sizing: border-box; } body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.4; }
  .wrap { max-width: 1300px; margin: 0 auto; padding: 22px 16px 44px; }
  h1 { font-family: var(--display); font-weight: 400; font-size: 36px; margin: 0 0 6px; color: #ffe6a8; }
  h2 { font-family: var(--display); font-weight: 400; font-size: 19px; margin: 8px 0 2px; color: #ffe6a8; }
  p { margin: 0 0 6px; color: var(--muted); font-size: 14px; }
  .grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
  @media (max-width: 1000px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } } @media (max-width: 640px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  canvas { display: block; width: 100%; height: auto; border-radius: 20px; border: 4px solid #1a0e06; box-shadow: 0 10px 28px rgba(0,0,0,.5); }
</style>
<div class="wrap"><h1>Десант: карты боя</h1><p>Ваш вариант «Рассвет у нурагов» и четыре новых раскладки карты в том же стиле игры (900×1500, вид сверху-под углом). Наши красные, враги фиолетовые.</p>
<div class="grid">${cards.map(c => `<section><canvas width="900" height="1500" aria-label="${c[0]}"></canvas><h2>${c[0]}</h2><p>${c[1]}</p></section>`).join('')}</div></div>
<script>
'use strict';
${ban}
${art}
${helpers}
${pieces}
${sd.slice(sd.indexOf('// ---------------------------------------------------------------- A: dawn'), sd.indexOf('// ---------------------------------------------------------------- B: storm'))}
${own}
</script>`;
fs.writeFileSync(path.join(__dirname, 'sardinia-more.html'), html);
console.log('ok', html.length);
