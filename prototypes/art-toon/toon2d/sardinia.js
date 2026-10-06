// Builds sardinia.html: two art concepts for the landing battle on Sardinia (A: calm dawn, B: storm at dusk), 900x1500 each.
const fs = require('fs'), path = require('path');
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); return src.slice(i, j); };
const gen = fs.readFileSync('gen.js', 'utf8');
const art = between(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const ban = between(cas, 'const BAN = {', 'const REFILL');
const jsAll = gen.slice(gen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, gen.indexOf('`;\nconst html'));
const helpers = jsAll.slice(0, jsAll.indexOf('function drawWorld(g) {'));

const own = String.raw`
// ---------------------------------------------------------------- landing pieces
const shoreY = (x, base, amp, k, ph) => base + amp * Math.sin(x * k + ph) + amp * 0.5 * Math.sin(x * k * 2.3 + ph * 2);
function band(g, f, y1, fill, lw) { g.beginPath(); g.moveTo(0, f(0)); for (let x = 12; x <= 900; x += 12) g.lineTo(x, f(x)); g.lineTo(900, y1); g.lineTo(0, y1); g.closePath(); if (lw) fo(g, fill, lw); else { g.fillStyle = fill; g.fill(); } }
function foam(g, f, t, a) { g.save(); g.lineCap = 'round'; for (let k = 0; k < 3; k++) { g.beginPath(); for (let x = 0; x <= 900; x += 10) { const y = f(x) - 4 + k * 7 + Math.sin(x * 0.05 + k * 2 + t) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.strokeStyle = 'rgba(255,255,255,' + (a - k * 0.18) + ')'; g.lineWidth = 5 - k * 1.3; g.stroke(); } g.restore(); }
function trireme(g, x, y, s, sail, ang, burn) {
  g.save(); g.translate(x, y); g.rotate(ang || 0); g.scale(s, s);
  g.fillStyle = 'rgba(10,40,60,.28)'; g.beginPath(); g.ellipse(8, 8, 36, 98, 0, 0, 7); g.fill();
  for (let yy = -54; yy <= 62; yy += 15) for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 22, yy); g.lineTo(sd * 52, yy + 12); g.strokeStyle = OL; g.lineWidth = 5; g.lineCap = 'round'; g.stroke(); g.strokeStyle = '#d9b27a'; g.lineWidth = 2.4; g.stroke(); }
  g.beginPath(); g.moveTo(0, -96); g.bezierCurveTo(30, -62, 30, 40, 18, 92); g.lineTo(-18, 92); g.bezierCurveTo(-30, 40, -30, -62, 0, -96); g.closePath(); fo(g, '#a8693a', 3.4);
  g.beginPath(); g.moveTo(0, -84); g.bezierCurveTo(21, -56, 21, 40, 12, 82); g.lineTo(-12, 82); g.bezierCurveTo(-21, 40, -21, -56, 0, -84); g.closePath(); fo(g, '#d9a566', 2.4);
  g.strokeStyle = 'rgba(80,40,10,.5)'; g.lineWidth = 2; for (let yy = -60; yy < 80; yy += 12) { g.beginPath(); g.moveTo(-14, yy); g.lineTo(14, yy); g.stroke(); }
  g.beginPath(); g.moveTo(-7, -98); g.lineTo(0, -116); g.lineTo(7, -98); g.closePath(); fo(g, '#c9a14a', 2.4);
  g.beginPath(); g.arc(-12, -62, 4.5, 0, 7); fo(g, '#fff', 2); g.beginPath(); g.arc(12, -62, 4.5, 0, 7); fo(g, '#fff', 2);
  g.beginPath(); g.moveTo(0, -30); g.lineTo(0, 34); g.strokeStyle = OL; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#8a5a30'; g.lineWidth = 3; g.stroke();
  if (!burn) { rr(g, -34, -28, 68, 40, 8); fo(g, sail, 3); g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(-34, -14, 68, 9); g.strokeStyle = OL; g.lineWidth = 2; g.strokeRect(-34, -14, 68, 9); }
  else { g.beginPath(); g.moveTo(-30, -26); g.lineTo(-12, -10); g.lineTo(-24, 8); g.lineTo(6, 4); g.lineTo(28, -20); g.closePath(); fo(g, '#3a2a22', 2.6); }
  g.restore();
}
function plank(g, x0, y0, x1, y1, w) { const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); g.save(); g.translate(x0, y0); g.rotate(a); rr(g, 0, -w / 2 - 3, L, w + 6, 3); fo(g, '#8a5a30', 3); for (let k = 4; k < L - 4; k += 11) { rr(g, k, -w / 2, 8, w, 2); fo(g, '#e2b878', 2); } g.restore(); }
function boat(g, x, y, s, ang) { g.save(); g.translate(x, y); g.rotate(ang || 0); g.scale(s, s); g.beginPath(); g.moveTo(0, -30); g.bezierCurveTo(14, -14, 13, 18, 8, 30); g.lineTo(-8, 30); g.bezierCurveTo(-13, 18, -14, -14, 0, -30); g.closePath(); fo(g, '#b0743c', 3); g.beginPath(); g.ellipse(0, 2, 6, 17, 0, 0, 7); fo(g, '#e0b070', 2); g.restore(); }
function nuraghe(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(20,20,10,.3)'; g.beginPath(); g.ellipse(14, 4, 62, 14, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(-50, 0); g.lineTo(-36, -88); g.lineTo(36, -88); g.lineTo(50, 0); g.closePath(); fo(g, '#6f6258', 3.6);
  g.save(); g.clip(); g.fillStyle = 'rgba(255,230,190,.14)'; g.fillRect(-60, -100, 50, 110); g.restore();
  g.strokeStyle = 'rgba(25,15,10,.45)'; g.lineWidth = 2; for (let k = 1; k < 5; k++) { const yy = -k * 18, hw = 50 - k * 3.4; g.beginPath(); g.moveTo(-hw, yy); g.lineTo(hw, yy); g.stroke(); for (let q = -hw + 9 + (k % 2) * 9; q < hw - 6; q += 18) { g.beginPath(); g.moveTo(q, yy); g.lineTo(q, yy - 18); g.stroke(); } }
  rr(g, -42, -106, 84, 20, 7); fo(g, '#857669', 3.2); g.strokeStyle = 'rgba(25,15,10,.4)'; g.lineWidth = 2; for (let q = -30; q <= 30; q += 15) { g.beginPath(); g.moveTo(q, -106); g.lineTo(q, -86); g.stroke(); }
  rr(g, -9, -30, 18, 30, 9); g.fillStyle = '#1d130e'; g.fill(); g.strokeStyle = OL; g.lineWidth = 2.6; g.stroke();
  g.restore();
}
function agave(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); for (let k = -3; k <= 3; k++) { g.save(); g.rotate(k * 0.34); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-7, -18, 0, -34); g.quadraticCurveTo(7, -18, 0, 0); fo(g, k % 2 ? '#6aa86a' : '#85bd7a', 2.2); g.restore(); } g.restore(); }
function olive(g, x, y, s) { g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 6 * s, y + 2, 22 * s, 6 * s, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - 3 * s, y); g.lineTo(x - 5 * s, y - 20 * s); g.lineTo(x + 5 * s, y - 20 * s); g.lineTo(x + 3 * s, y); g.closePath(); fo(g, '#7a5a36', 2.2); for (const [dx, dy, r] of [[-12, -30, 13], [10, -32, 14], [0, -42, 14]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 7); fo(g, '#8aa56a', 2.6); } }
function maquis(g, x, y, s, c) { for (const [dx, dy, r] of [[-12, 0, 10], [0, -5, 13], [13, 0, 10]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 7); fo(g, c || '#6b9a34', 2.4); } }
function cliff(g, pts, h, top, side) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0], pts[i][1] + h); g.closePath(); fo(g, side, 3.4); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1] - 70); g.lineTo(pts[0][0], pts[0][1] - 70); g.closePath(); fo(g, top, 3.4); }
function stakes(g, x0, y0, x1, y1) { const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 13); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; g.beginPath(); g.moveTo(x - 4, y + 4); g.lineTo(x - 2, y - 22); g.lineTo(x, y - 29); g.lineTo(x + 2, y - 22); g.lineTo(x + 4, y + 4); g.closePath(); fo(g, '#b0783e', 2); } }
function fire(g, x, y, s, t) { for (let k = 0; k < 4; k++) { const w = Math.sin(t * 6 + k * 1.7); g.beginPath(); g.moveTo(x + (k - 1.5) * 8 * s, y); g.quadraticCurveTo(x + (k - 1.5) * 10 * s + w * 4, y - 20 * s, x + (k - 1.5) * 6 * s + w * 6, y - (34 + k % 2 * 14) * s); g.quadraticCurveTo(x + (k - 1.5) * 4 * s + 8 * s, y - 14 * s, x + (k - 1.5) * 8 * s + 8, y); g.closePath(); fo(g, k % 2 ? '#ffb02e' : '#ff6a2a', 2); } g.beginPath(); g.ellipse(x, y - 4 * s, 9 * s, 12 * s, 0, 0, 7); g.fillStyle = '#ffe9a0'; g.fill(); }
function smoke(g, x, y, n, col) { for (let i = 0; i < n; i++) { g.beginPath(); g.arc(x + Math.sin(i * 1.3) * 12 + i * 4, y - i * 26, 14 + i * 4, 0, 7); g.fillStyle = col; g.fill(); } }
function carthTent(g, x, y) { tent(g, x, y); g.save(); g.translate(x, y - 40); flag(g, 0, 0, '#7a2a8a', 30); g.restore(); }
function ridge(g, x, y, rx, ry, c1, c2) { for (let k = 0; k < 3; k++) { const dx = (k - 1) * rx * 0.55, r = rx * (k === 1 ? 0.62 : 0.48); g.beginPath(); g.moveTo(x + dx - r, y + ry * 0.2); g.lineTo(x + dx - r * 0.5, y - ry * (k === 1 ? 1 : 0.7)); g.lineTo(x + dx + r * 0.1, y - ry * (k === 1 ? 1.25 : 0.9)); g.lineTo(x + dx + r * 0.6, y - ry * 0.5); g.lineTo(x + dx + r, y + ry * 0.2); g.closePath(); fo(g, c1, 3.2); g.beginPath(); g.moveTo(x + dx + r * 0.1, y - ry * (k === 1 ? 1.25 : 0.9)); g.lineTo(x + dx + r * 0.6, y - ry * 0.5); g.lineTo(x + dx + r, y + ry * 0.2); g.lineTo(x + dx + r * 0.2, y + ry * 0.2); g.closePath(); g.fillStyle = c2; g.fill(); } }
function rockBand(g, f, y1, fill) { band(g, f, y1, fill, 3.4); }
function reef(g, x, y, s, rock) { for (const [dx, dy, r] of [[-14, 3, 12], [4, -3, 16], [20, 4, 11]]) { g.beginPath(); g.moveTo(x + (dx - r) * s, y + dy * s); g.lineTo(x + (dx - r * 0.4) * s, y + (dy - r) * s); g.lineTo(x + (dx + r * 0.5) * s, y + (dy - r * 0.8) * s); g.lineTo(x + (dx + r) * s, y + dy * s); g.closePath(); fo(g, rock, 2.8); } g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y + 4 * s, 32 * s, 9 * s, 0, 0, 7); g.stroke(); }

// ---------------------------------------------------------------- A: dawn at the nuraghes
function mapA(g, t) {
  const r = rng(11);
  const wl = x => shoreY(x, 1130, 16, 0.012, 0), dp = x => shoreY(x, 1240, 14, 0.01, 1);
  g.fillStyle = '#7ba83a'; g.fillRect(0, 0, 900, 1500);
  // grass texture
  for (let i = 0; i < 160; i++) { const x = r() * 900, y = 120 + r() * 980; g.fillStyle = r() < 0.5 ? 'rgba(255,255,160,.14)' : 'rgba(40,90,20,.14)'; g.beginPath(); g.ellipse(x, y, 20 + r() * 26, 8 + r() * 8, 0, 0, 7); g.fill(); }
  // sea
  const sg = g.createLinearGradient(0, 1130, 0, 1500); sg.addColorStop(0, '#7fe0d0'); sg.addColorStop(0.3, '#1fa7c9'); sg.addColorStop(1, '#1580a8'); g.fillStyle = sg; g.fillRect(0, 1100, 900, 400);
  band(g, dp, 1500, '#1fa7c9'); g.fillStyle = sg; g.fillRect(0, 1100, 0, 0);
  // shallows (walkable, slow) lighter band with ripples
  g.beginPath(); g.moveTo(0, wl(0)); for (let x = 12; x <= 900; x += 12) g.lineTo(x, wl(x)); for (let x = 900; x >= 0; x -= 12) g.lineTo(x, dp(x)); g.closePath(); g.fillStyle = '#86e3d2'; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2.5; for (let k = 0; k < 40; k++) { const x = r() * 900, y = wl(x) + 14 + r() * 80; g.beginPath(); g.moveTo(x - 14, y); g.quadraticCurveTo(x, y - 5, x + 14, y); g.stroke(); }
  // deep sea waves
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; for (let k = 0; k < 36; k++) { const x = r() * 900, y = 1260 + r() * 230; g.beginPath(); g.moveTo(x - 20, y); g.quadraticCurveTo(x, y - 7, x + 20, y); g.stroke(); }
  // sand beach
  band(g, x => shoreY(x, 930, 30, 0.009, 2), 1200, '#f2d48a'); // top edge sand, drawn then covered by water band
  g.beginPath(); g.moveTo(0, wl(0)); for (let x = 12; x <= 900; x += 12) g.lineTo(x, wl(x)); for (let x = 900; x >= 0; x -= 12) g.lineTo(x, shoreY(x, 930, 30, 0.009, 2)); g.closePath(); fo(g, '#f2d48a', 3.4);
  g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 40; k++) { const x = r() * 900, y = 960 + r() * 150; g.beginPath(); g.ellipse(x, y, 6 + r() * 14, 2.5, 0, 0, 7); g.fill(); }
  foam(g, wl, t, 0.9);
  // the spit: a sand tongue into the sea with a pier
  g.beginPath(); g.moveTo(380, 1110); g.quadraticCurveTo(396, 1230, 430, 1300); g.lineTo(470, 1300); g.quadraticCurveTo(504, 1230, 520, 1110); g.closePath(); fo(g, '#f2d48a', 3.4);
  g.beginPath(); g.moveTo(420, 1240); g.quadraticCurveTo(450, 1300, 480, 1240); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; g.stroke();
  plank(g, 450, 1300, 450, 1170, 26);
  for (const [x, y] of [[434, 1300], [466, 1300], [434, 1230], [466, 1230]]) { rr(g, x - 4, y - 4, 8, 12, 2); fo(g, '#6a4220', 2); }
  // dunes
  for (const [x, y, rx, ry] of [[150, 860, 80, 26], [330, 800, 70, 22], [640, 830, 84, 26], [800, 900, 70, 24], [90, 980, 60, 20]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI, 0); g.closePath(); fo(g, '#eecb7a', 3); g.beginPath(); g.ellipse(x + rx * 0.2, y - ry * 0.5, rx * 0.45, ry * 0.3, 0, Math.PI, 0); g.fillStyle = 'rgba(255,245,200,.55)'; g.fill(); }
  // rock ridges with passes: left x 0-300, right x 600-900, small central outcrop
  ridge(g, 150, 650, 200, 130, '#8c7a6b', 'rgba(60,40,30,.28)'); ridge(g, 760, 640, 190, 130, '#8c7a6b', 'rgba(60,40,30,.28)');
  g.beginPath(); g.ellipse(450, 560, 52, 22, 0, 0, 7); fo(g, '#9a8878', 3); reef(g, 450, 560, 0.9, '#8c7a6b');
  // path up through the central pass
  g.beginPath(); g.moveTo(420, 930); g.bezierCurveTo(430, 800, 380, 700, 430, 560); g.bezierCurveTo(470, 500, 430, 440, 450, 400); g.lineWidth = 34; g.strokeStyle = OL; g.lineCap = 'round'; g.stroke(); g.lineWidth = 28; g.strokeStyle = '#e3c98a'; g.stroke();
  // the road meets the beach: wet dark ground with puddles and pebbles along the edge
  { const gr = g.createLinearGradient(0, 900, 0, 1120); gr.addColorStop(0, '#e3c98a'); gr.addColorStop(1, '#9a7442');
    g.beginPath(); g.moveTo(404, 900); g.bezierCurveTo(396, 980, 380, 1040, 372, 1118); g.lineTo(492, 1118); g.bezierCurveTo(482, 1040, 466, 980, 442, 900); g.closePath(); g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(43,26,16,.8)'; g.lineWidth = 3.2; g.beginPath(); g.moveTo(404, 900); g.bezierCurveTo(396, 980, 380, 1040, 372, 1118); g.moveTo(442, 900); g.bezierCurveTo(466, 980, 482, 1040, 492, 1118); g.stroke();
    for (const [x, y, rx, ry] of [[424, 980, 18, 7], [440, 1030, 26, 8], [410, 1080, 22, 7]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fillStyle = 'rgba(70,45,20,.5)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.8; g.stroke(); }
    for (const [x, y, s, c] of [[392, 940, 1, '#b9ab94'], [458, 950, 1.1, '#9a8c76'], [384, 1000, 1.1, '#9a8c76'], [470, 1010, 1, '#b9ab94'], [372, 1060, 0.9, '#b9ab94'], [486, 1070, 1.2, '#9a8c76'], [398, 970, 0.7, '#b9ab94'], [452, 990, 0.7, '#b9ab94']]) { g.beginPath(); g.ellipse(x, y, 8 * s, 5 * s, 0, 0, 7); fo(g, c, 2.2); g.beginPath(); g.ellipse(x - 2 * s, y - 2 * s, 3.4 * s, 1.7 * s, 0, 0, 7); g.fillStyle = '#d6cab6'; g.fill(); } }
  // scrub and trees
  for (const [x, y, s] of [[260, 920, 1], [560, 900, 1.1], [700, 760, 1], [250, 780, 1], [480, 820, 0.9], [60, 780, 1], [850, 780, 1]]) maquis(g, x, y, s);
  for (const [x, y, s] of [[300, 700, 1], [600, 700, 1.1], [60, 880, 1], [840, 1000, 1], [200, 1040, 0.9]]) olive(g, x, y, s);
  for (const [x, y] of [[120, 1040], [790, 1060], [700, 980], [330, 1050], [570, 1060]]) agave(g, x, y, 1);
  // plateau with the nuraghe and the camp
  cliff(g, [[0, 430], [90, 420], [200, 440], [330, 424], [450, 436], [580, 424], [700, 444], [820, 420], [900, 432]], 46, '#b3a37a', '#8c7a6b');
  g.fillStyle = 'rgba(255,255,255,.1)'; for (let k = 0; k < 14; k++) { g.beginPath(); g.ellipse(r() * 900, 140 + r() * 220, 30 + r() * 30, 10, 0, 0, 7); g.fill(); }
  stakes(g, 120, 360, 340, 362); stakes(g, 560, 362, 790, 360);
  nuraghe(g, 450, 330, 1.9);
  for (const [x, y, s] of [[200, 250, 0.6], [700, 240, 0.6], [110, 150, 0.5], [800, 140, 0.5]]) nuraghe(g, x, y, s);
  for (const [x, y] of [[250, 330], [650, 330], [160, 220], [740, 210]]) carthTent(g, x, y);
  for (const [x, y] of [[330, 250], [570, 250], [450, 120]]) { g.beginPath(); g.ellipse(x, y, 16, 7, 0, 0, 7); fo(g, '#5a4a40', 2.4); fire(g, x, y - 2, 0.55, t); }
  smoke(g, 330, 240, 5, 'rgba(70,60,60,.35)'); smoke(g, 570, 240, 5, 'rgba(70,60,60,.35)');
  // squads: enemies on the plateau and the dunes, ours on the spit
  squad(g, 340, 420, 'e_arc', 2, 3, 0.9, '#7a2a8a', 'pennant', -1); squad(g, 560, 420, 'e_arc', 2, 3, 0.9, '#7a2a8a', 'pennant', -1);
  squad(g, 330, 900, 'e_arc', 2, 3, 0.85, '#7a2a8a', 'pennant', -1); squad(g, 640, 880, 'e_inf', 2, 4, 0.9, '#7a2a8a', 'vex', -1); squad(g, 150, 880, 'e_inf', 2, 4, 0.9, '#7a2a8a', 'vex', -1);
  squad(g, 400, 1100, 'tiro', 1, 4, 0.95, '#e2382c', 'vex'); squad(g, 500, 1110, 'velites', 1, 3, 0.9, '#e2382c', 'pennant'); squad(g, 330, 1170, 'eques', 1, 3, 0.95, '#e2382c', 'swallow'); squad(g, 580, 1170, 'eng', 1, 3, 0.9, '#e2382c', 'pennant');
  // ships, gangways, boats
  for (const x of [200, 700]) plank(g, x, 1300, x, 1190, 26);
  for (const [x, y, c] of [[140, 1370, '#d6402e'], [330, 1400, '#d6402e'], [570, 1400, '#d6402e'], [760, 1370, '#d6402e']]) trireme(g, x, y, 0.95, c, 0);
  for (const [x, y, a] of [[250, 1230, 0.3], [650, 1236, -0.3], [95, 1210, 0.1]]) boat(g, x, y, 1, a);
  trireme(g, 840, 1230, 0.7, '#d6402e', 0.5, true); fire(g, 836, 1226, 0.9, t); smoke(g, 832, 1200, 6, 'rgba(60,55,60,.4)');
  foam(g, dp, t, 0.4);
  // dawn light
  const dg = g.createLinearGradient(0, 0, 0, 700); dg.addColorStop(0, 'rgba(255,170,120,.42)'); dg.addColorStop(1, 'rgba(255,170,120,0)'); g.fillStyle = dg; g.fillRect(0, 0, 900, 700);
  const sun = g.createRadialGradient(450, 40, 10, 450, 40, 360); sun.addColorStop(0, 'rgba(255,230,160,.65)'); sun.addColorStop(1, 'rgba(255,230,160,0)'); g.fillStyle = sun; g.fillRect(0, 0, 900, 460);
  g.fillStyle = 'rgba(255,220,230,.12)'; g.fillRect(0, 700, 900, 420);
}

// ---------------------------------------------------------------- B: storm at dusk, diagonal coast
function mapB(g, t) {
  const r = rng(29);
  // diagonal coast: the sea is the lower left, the line runs from (0,900) to (900,1500) rotated: land above-right
  const coast = x => 720 + x * 0.72 + 18 * Math.sin(x * 0.02), edge = x => coast(x) + 60;
  const sg = g.createLinearGradient(0, 700, 400, 1500); sg.addColorStop(0, '#2a7aa8'); sg.addColorStop(1, '#123e66'); g.fillStyle = sg; g.fillRect(0, 0, 900, 1500);
  g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(900, 0); g.lineTo(900, 1500); for (let x = 900; x >= 0; x -= 12) g.lineTo(x, coast(x)); g.lineTo(0, coast(0)); g.closePath(); g.clip();
  g.fillStyle = '#5c8a3a'; g.fillRect(0, 0, 900, 1500);
  for (let i = 0; i < 160; i++) { const x = r() * 900, y = r() * 1200; g.fillStyle = r() < 0.5 ? 'rgba(200,220,120,.1)' : 'rgba(20,50,20,.16)'; g.beginPath(); g.ellipse(x, y, 20 + r() * 26, 8 + r() * 8, 0, 0, 7); g.fill(); }
  g.restore();
  g.beginPath(); g.moveTo(0, coast(0) - 62); for (let x = 12; x <= 900; x += 12) g.lineTo(x, coast(x) - 62); for (let x = 900; x >= 0; x -= 12) g.lineTo(x, coast(x)); g.closePath(); fo(g, '#b8955a', 3.4);
  g.fillStyle = 'rgba(40,30,20,.18)'; for (let k = 0; k < 40; k++) { const x = r() * 900, y = coast(x) - 8 - r() * 44; g.beginPath(); g.ellipse(x, y, 8 + r() * 14, 2.6, 0, 0, 7); g.fill(); }
  // the wave: a tide line that moves over the wet sand (animated by t)
  const tide = (Math.sin(t * 0.9) + 1) / 2; g.beginPath(); g.moveTo(0, coast(0) - 62 * tide); for (let x = 12; x <= 900; x += 12) g.lineTo(x, coast(x) - 62 * tide + Math.sin(x * 0.05 + t * 3) * 3); for (let x = 900; x >= 0; x -= 12) g.lineTo(x, coast(x)); g.closePath(); g.fillStyle = 'rgba(70,150,190,.55)'; g.fill();
  foam(g, x => coast(x) - 62 * tide, t, 0.95);
  // surf ridges and reefs (impassable): foam dark patches
  for (const [x, y, s] of [[150, 1000, 1.3], [260, 1150, 1.4], [380, 1260, 1.2], [90, 1160, 1.1], [520, 1350, 1.2], [200, 1330, 1.3]]) reef(g, x, y, s, '#4d4a55');
  for (let k = 0; k < 40; k++) { const x = r() * 520, y = 1000 + r() * 500; if (y < coast(x) + 30) continue; g.strokeStyle = 'rgba(232,244,248,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 20, y); g.quadraticCurveTo(x, y - 9, x + 20, y); g.stroke(); }
  // the bay: a narrow lagoon notch with a pier
  g.beginPath(); g.moveTo(560, coast(560) - 62); g.quadraticCurveTo(600, coast(600) + 90, 660, coast(660) + 20); g.lineTo(700, coast(700) - 62); g.closePath(); fo(g, '#2f86b0', 3);
  plank(g, 610, coast(610) + 30, 640, coast(640) - 100, 26);
  // rocks, scrub, a path winding up to the heights
  g.beginPath(); g.moveTo(640, coast(640) - 100); g.bezierCurveTo(660, 900, 560, 780, 600, 640); g.bezierCurveTo(640, 520, 540, 420, 540, 280); g.lineWidth = 34; g.strokeStyle = OL; g.lineCap = 'round'; g.stroke(); g.lineWidth = 28; g.strokeStyle = '#c9a76a'; g.stroke();
  ridge(g, 250, 640, 230, 150, '#4d4a55', 'rgba(255,176,46,.0)'); ridge(g, 130, 330, 200, 130, '#4d4a55', 'rgba(0,0,0,.25)'); ridge(g, 820, 520, 160, 120, '#4d4a55', 'rgba(0,0,0,.25)');
  g.strokeStyle = 'rgba(255,176,46,.65)'; g.lineWidth = 2.4; for (const [x, y] of [[250, 520], [130, 230], [820, 420], [180, 560]]) { g.beginPath(); g.moveTo(x - 16, y + 20); g.lineTo(x - 4, y - 8); g.lineTo(x + 12, y - 14); g.stroke(); }
  for (const [x, y, s] of [[480, 900, 1], [760, 880, 1.1], [400, 740, 0.9], [560, 640, 1], [860, 700, 1]]) maquis(g, x, y, s, '#4f7a30');
  for (const [x, y, s] of [[480, 760, 1], [760, 780, 1.1], [330, 880, 0.9]]) olive(g, x, y, s);
  for (const [x, y] of [[540, 1000], [800, 1040], [700, 1120]]) agave(g, x, y, 1);
  // heights: three nuraghes and the fort at the top
  cliff(g, [[300, 270], [430, 250], [560, 270], [700, 250], [900, 270]], 40, '#9a8f70', '#4d4a55');
  stakes(g, 400, 224, 680, 224);
  nuraghe(g, 560, 190, 2.0); nuraghe(g, 280, 110, 0.9); nuraghe(g, 820, 150, 0.9);
  for (const [x, y] of [[700, 180], [420, 170]]) carthTent(g, x, y);
  // catapult on the rock
  g.save(); g.translate(790, 330); rr(g, -30, -6, 60, 14, 3); fo(g, '#8a5a30', 3); g.beginPath(); g.moveTo(-14, -6); g.lineTo(16, -52); g.strokeStyle = OL; g.lineWidth = 8; g.stroke(); g.strokeStyle = '#c48a4a'; g.lineWidth = 4; g.stroke(); g.beginPath(); g.arc(16, -52, 8, 0, 7); fo(g, '#6a4a30', 2.4); g.restore();
  fire(g, 360, 140, 0.7, t); fire(g, 640, 120, 0.7, t); smoke(g, 640, 100, 5, 'rgba(40,36,44,.4)');
  // ships: some beached, some sinking and burning
  trireme(g, 200, 1250 - 40, 0.9, '#a8332a', -0.6); trireme(g, 330, 1360, 0.85, '#a8332a', -0.5); trireme(g, 100, 1130, 0.8, '#a8332a', -0.65, true); fire(g, 96, 1120, 0.9, t); smoke(g, 90, 1090, 7, 'rgba(30,28,34,.45)');
  for (const [x, y, a] of [[420, 1170, -0.7], [470, 1120, -0.8], [360, 1230, -0.6]]) boat(g, x, y, 1, a);
  for (const [x, y] of [[330, 1180], [250, 1330], [440, 1290]]) { g.save(); g.translate(x, y); g.rotate(0.6); rr(g, -18, -3, 36, 6, 2); fo(g, '#8a5a30', 2.4); g.restore(); }
  // squads in the bay
  squad(g, 640, 930, 'tiro', 1, 4, 0.95, '#e2382c', 'vex'); squad(g, 700, 960, 'velites', 1, 3, 0.9, '#e2382c', 'pennant'); squad(g, 590, 960, 'eng', 1, 3, 0.9, '#e2382c', 'pennant');
  squad(g, 560, 700, 'e_inf', 2, 4, 0.9, '#7a2a8a', 'vex', -1); squad(g, 760, 760, 'e_arc', 2, 3, 0.9, '#7a2a8a', 'pennant', -1); squad(g, 450, 440, 'e_arc', 2, 3, 0.9, '#7a2a8a', 'pennant', -1);
  // storm: dusk tint, rain, lightning flash on the left, wind streaks
  g.fillStyle = 'rgba(30,24,60,.38)'; g.fillRect(0, 0, 900, 1500);
  const gl = g.createRadialGradient(150, 60, 10, 150, 60, 480); gl.addColorStop(0, 'rgba(255,230,160,.5)'); gl.addColorStop(1, 'rgba(255,230,160,0)'); g.fillStyle = gl; g.fillRect(0, 0, 900, 700);
  g.strokeStyle = 'rgba(255,248,220,.95)'; g.lineWidth = 5; g.lineJoin = 'miter'; g.beginPath(); g.moveTo(170, 0); g.lineTo(140, 60); g.lineTo(168, 66); g.lineTo(122, 150); g.stroke();
  g.strokeStyle = 'rgba(220,235,255,.5)'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i < 150; i++) { const x = r() * 960, y = r() * 1500; g.moveTo(x, y); g.lineTo(x - 12, y + 36); } g.stroke();
}
`;

const html = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Десант на Сардинию</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800;900&display=swap">
<style>
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --display: 'Lilita One', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.45; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 24px 16px 48px; }
  h1 { font-family: var(--display); font-weight: 400; font-size: 38px; margin: 0 0 6px; color: #ffe6a8; }
  h2 { font-family: var(--display); font-weight: 400; font-size: 24px; margin: 0 0 4px; color: #ffe6a8; }
  p { margin: 0 0 10px; color: var(--muted); }
  .row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-top: 18px; }
  @media (max-width: 760px) { .row { grid-template-columns: minmax(0, 1fr); } }
  .card canvas { display: block; width: 100%; height: auto; border-radius: 22px; border: 4px solid #1a0e06; box-shadow: 0 14px 36px rgba(0,0,0,.55); }
  ul { margin: 6px 0 0; padding-left: 18px; color: var(--muted); font-size: 14px; }
</style>
<div class="wrap">
  <h1>Десант на Сардинию</h1>
  <p>Два арт-концепта карты боя 900×1500: внизу — море и корабли, наверху — нураги и карфагенский лагерь. Наши отряды красные, враги фиолетовые.</p>
  <div class="row">
    <section class="card"><h2>A · Рассвет у нурагов</h2><canvas id="a" width="900" height="1500" aria-label="Карта A"></canvas>
      <ul><li>Бирюзовое мелководье — проходимо, но медленно; тёмная глубина — нет.</li><li>Белая линия прибоя — граница берега; скалы с толстой обводкой — стены, три прохода.</li><li>Коса с пирсом и сходни трирем — места высадки. Горящий корабль справа.</li></ul></section>
    <section class="card"><h2>B · Буря над Сардинией</h2><canvas id="b" width="900" height="1500" aria-label="Карта B"></canvas>
      <ul><li>Берег по диагонали: рифы с пеной — непроходимы, мокрый песок заливает приливная волна (анимация).</li><li>Узкая бухта с пирсом, тропа вверх к трём нурагам и форту, катапульта на скале.</li><li>Сумерки, дождь, вспышка молнии, горящий корабль.</li></ul></section>
  </div>
</div>
<script>
'use strict';
${ban}
${art}
${helpers}
${own}
const cA = document.getElementById('a'), cB = document.getElementById('b'), gA = cA.getContext('2d'), gB = cB.getContext('2d');
let T = 0; function frame() { T += 0.016; gA.clearRect(0, 0, 900, 1500); mapA(gA, T); gB.clearRect(0, 0, 900, 1500); mapB(gB, T); requestAnimationFrame(frame); }
mapA(gA, 0); mapB(gB, 0); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(frame);
</script>
`;
fs.writeFileSync(path.join(__dirname, 'sardinia.html'), html);
console.log('ok', html.length);
