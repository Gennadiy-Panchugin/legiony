// Builds sardinia-landing.html: five art takes on the landing itself (ships unloading troops onto the Sardinian beach), 540x960 each.
const fs = require('fs'), path = require('path');
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); return src.slice(i, j); };
const gen = fs.readFileSync('gen.js', 'utf8');
const art = between(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const ban = between(cas, 'const BAN = {', 'const REFILL');
const jsAll = gen.slice(gen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, gen.indexOf('`;\nconst html'));
const helpers = jsAll.slice(0, jsAll.indexOf('function drawWorld(g) {'));

const own = String.raw`
const W = 540, H = 960;
function waveRow(g, r, n, y0, y1, a) { g.strokeStyle = 'rgba(255,255,255,' + a + ')'; g.lineWidth = 3; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const x = r() * W, y = y0 + r() * (y1 - y0); g.beginPath(); g.moveTo(x - 14, y); g.quadraticCurveTo(x, y - 6, x + 14, y); g.stroke(); } }
function shoreLine(g, y, amp) { return x => y + amp * Math.sin(x * 0.02) + amp * 0.5 * Math.sin(x * 0.047 + 1); }
function scene(g, seed, o) { // sea on top, sand below, surf in between
  const r = rng(seed), f = shoreLine(g, o.shore, 14);
  const sg = g.createLinearGradient(0, 0, 0, o.shore); sg.addColorStop(0, o.deep); sg.addColorStop(1, o.mid); g.fillStyle = sg; g.fillRect(0, 0, W, H);
  waveRow(g, r, 60, 20, o.shore - 30, 0.35);
  g.beginPath(); g.moveTo(0, f(0) - 70); for (let x = 0; x <= W; x += 10) g.lineTo(x, f(x) - 70 + Math.sin(x * 0.04) * 4); g.lineTo(W, f(W)); for (let x = W; x >= 0; x -= 10) g.lineTo(x, f(x)); g.closePath(); g.fillStyle = o.shallow; g.fill();
  g.beginPath(); g.moveTo(0, f(0)); for (let x = 12; x <= W; x += 12) g.lineTo(x, f(x)); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); fo(g, o.sand, 4);
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); for (let x = 0; x <= W; x += 10) { const y = f(x) - 3; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 40; k++) { g.beginPath(); g.ellipse(r() * W, o.shore + 30 + r() * (H - o.shore - 40), 6 + r() * 14, 2.4, 0, 0, 7); g.fill(); }
  return f;
}
function ship(g, x, y, s, sail, ang) {
  g.save(); g.translate(x, y); g.rotate(ang || 0); g.scale(s, s);
  g.fillStyle = 'rgba(10,40,60,.28)'; g.beginPath(); g.ellipse(8, 8, 36, 92, 0, 0, 7); g.fill();
  for (let yy = -46; yy <= 52; yy += 14) for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 18, yy); g.lineTo(sd * 46, yy + 10); g.strokeStyle = OL; g.lineWidth = 5; g.lineCap = 'round'; g.stroke(); g.strokeStyle = '#e0bd88'; g.lineWidth = 2.4; g.stroke(); }
  g.beginPath(); g.moveTo(0, -82); g.bezierCurveTo(26, -54, 26, 36, 15, 80); g.lineTo(-15, 80); g.bezierCurveTo(-26, 36, -26, -54, 0, -82); g.closePath(); fo(g, '#a8693a', 3.4);
  g.beginPath(); g.moveTo(0, -72); g.bezierCurveTo(18, -50, 18, 36, 10, 70); g.lineTo(-10, 70); g.bezierCurveTo(-18, 36, -18, -50, 0, -72); g.closePath(); fo(g, '#d9a566', 2.4);
  g.beginPath(); g.moveTo(-6, -84); g.lineTo(0, -100); g.lineTo(6, -84); g.closePath(); fo(g, '#c9a14a', 2.4);
  if (sail) { g.beginPath(); g.moveTo(0, -26); g.lineTo(0, 30); g.strokeStyle = OL; g.lineWidth = 6; g.stroke(); rr(g, -28, -24, 56, 34, 7); fo(g, sail, 3); g.fillStyle = '#f7ebc8'; g.fillRect(-28, -12, 56, 8); g.strokeStyle = OL; g.lineWidth = 2; g.strokeRect(-28, -12, 56, 8); }
  g.restore();
}
function plank(g, x0, y0, x1, y1, w) { const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); g.save(); g.translate(x0, y0); g.rotate(a); rr(g, 0, -w / 2 - 3, L, w + 6, 3); fo(g, '#8a5a30', 3); for (let k = 4; k < L - 4; k += 11) { rr(g, k, -w / 2, 8, w, 2); fo(g, '#e2b878', 2); } g.restore(); }
function splash(g, x, y, s) { g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 3.4 * s; g.lineCap = 'round'; for (const a of [-1, -0.5, 0, 0.5, 1]) { g.beginPath(); g.moveTo(x + a * 6 * s, y); g.quadraticCurveTo(x + a * 14 * s, y - 16 * s, x + a * 20 * s, y - 6 * s); g.stroke(); } g.beginPath(); g.ellipse(x, y + 2 * s, 18 * s, 6 * s, 0, 0, 7); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2.4 * s; g.stroke(); }
function arrows(g, list) { for (const [x0, y0, x1, y1, h] of list) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - h, x1, y1); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.setLineDash([6, 6]); g.stroke(); g.setLineDash([]); const a = Math.atan2(y1 - (Math.min(y0, y1) - h) * 0.3 - y0 * 0.7, x1 - x0); g.save(); g.translate(x1, y1); g.rotate(Math.PI / 2 + (x1 - x0) * 0.002); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -22); g.strokeStyle = OL; g.lineWidth = 4; g.stroke(); g.strokeStyle = '#d9c9a0'; g.lineWidth = 2; g.stroke(); g.beginPath(); g.moveTo(-4, -22); g.lineTo(0, -30); g.lineTo(4, -22); g.closePath(); fo(g, '#fff', 1.6); g.restore(); } }
function stakes(g, x0, y0, x1, y1) { const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 14); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; g.beginPath(); g.moveTo(x - 4, y + 4); g.lineTo(x - 2, y - 24); g.lineTo(x, y - 32); g.lineTo(x + 2, y - 24); g.lineTo(x + 4, y + 4); g.closePath(); fo(g, '#b0783e', 2); } }
function fire(g, x, y, s, t) { for (let k = 0; k < 4; k++) { const w = Math.sin(t * 6 + k * 1.7); g.beginPath(); g.moveTo(x + (k - 1.5) * 8 * s, y); g.quadraticCurveTo(x + (k - 1.5) * 10 * s + w * 4, y - 20 * s, x + (k - 1.5) * 6 * s + w * 6, y - (34 + k % 2 * 14) * s); g.quadraticCurveTo(x + (k - 1.5) * 4 * s + 8 * s, y - 14 * s, x + (k - 1.5) * 8 * s + 8, y); g.closePath(); fo(g, k % 2 ? '#ffc04d' : '#ff7a1a', 2); } }
function smoke(g, x, y, n, col) { for (let i = 0; i < n; i++) { g.beginPath(); g.arc(x + Math.sin(i * 1.3) * 12 + i * 5, y - i * 28, 15 + i * 4, 0, 7); g.fillStyle = col; g.fill(); } }
function boat(g, x, y, s, ang, n) { g.save(); g.translate(x, y); g.rotate(ang || 0); g.scale(s, s); g.fillStyle = 'rgba(10,40,60,.25)'; g.beginPath(); g.ellipse(6, 6, 16, 32, 0, 0, 7); g.fill(); for (const sd of [-1, 1]) for (const yy of [-8, 8]) { g.beginPath(); g.moveTo(sd * 12, yy); g.lineTo(sd * 32, yy + 8); g.strokeStyle = OL; g.lineWidth = 4; g.lineCap = 'round'; g.stroke(); g.strokeStyle = '#e0bd88'; g.lineWidth = 2; g.stroke(); } g.beginPath(); g.moveTo(0, -36); g.bezierCurveTo(17, -16, 16, 22, 10, 36); g.lineTo(-10, 36); g.bezierCurveTo(-16, 22, -17, -16, 0, -36); g.closePath(); fo(g, '#b0743c', 3); g.beginPath(); g.ellipse(0, 2, 8, 22, 0, 0, 7); fo(g, '#e0b070', 2); g.restore(); }
const man = (g, x, y, s, f, cls) => chibi(g, x, y, cls || 'tiro', 1, s, f || 1);
const foe = (g, x, y, s) => chibi(g, x, y, 'e_arc', 2, s, -1);
function dunes(g, y, seed) { const r = rng(seed); for (let x = 30; x < W; x += 100) { const rx = 50 + r() * 20, ry = 14 + r() * 8; g.beginPath(); g.ellipse(x + r() * 30, y + r() * 24, rx, ry, 0, Math.PI, 0); g.closePath(); fo(g, '#eecb7a', 3); } }

// 1 · gangways: the classic
function L1(g, t) {
  const f = scene(g, 1, { shore: 590, deep: '#1b6f9a', mid: '#2fa7c9', shallow: 'rgba(134,227,210,.6)', sand: '#f2d48a' });
  const ships = [[120, 500, 0.9], [290, 440, 0.9], [440, 380, 0.9]];
  for (const [x, y, s] of ships) ship(g, x, y, s, '#d2362f', Math.PI / 2);
  for (const [x, y] of ships) { plank(g, x, y + 34, x + 6, f(x) + 18, 22); for (let k = 0; k < 4; k++) { const yy = y + 50 + k * ((f(x) - y - 40) / 4); man(g, x + 4, yy, 0.5, 1); } }
  // formed squads on the sand with turtles of shields
  for (const [x, y] of [[110, 670], [220, 700], [330, 670], [440, 700], [165, 760], [380, 770]]) { for (const [dx, dy] of [[-14, -6], [14, -6], [0, 6], [-26, 8], [26, 8], [0, -16]]) man(g, x + dx, y + dy, 0.5, 1); }
  for (const [x, y] of [[70, 640], [270, 720], [490, 650]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 60); g.strokeStyle = OL; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#8a5a30'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(x, y - 60); g.lineTo(x + 24, y - 52); g.lineTo(x, y - 42); g.closePath(); fo(g, '#d2362f', 2.6); }
  dunes(g, 860, 3); stakes(g, 20, 880, 520, 880);
  for (const x of [60, 150, 240, 330, 420, 500]) foe(g, x, 874, 0.5);
  arrows(g, [[150, 850, 130, 640, 160], [330, 850, 300, 600, 180], [440, 850, 440, 560, 150], [230, 850, 180, 700, 120]]);
}
// 2 · jumping into the water: chaos
function L2(g, t) {
  const f = scene(g, 2, { shore: 640, deep: '#14527a', mid: '#35c2c9', shallow: 'rgba(255,255,255,.28)', sand: '#f2d48a' });
  for (const [x, y, a] of [[90, 130, 0.5], [260, 100, 0.1], [440, 150, -0.5]]) ship(g, x, y, 0.95, '#e0403a', Math.PI / 2 + a);
  const r = rng(9);
  for (let row = 0; row < 9; row++) for (let i = 0; i < 6; i++) { const x = 40 + r() * 460, y = 260 + row * 44 + r() * 20; if (y > f(x) - 6) continue; splash(g, x, y + 16, 0.6); man(g, x, y + 10, 0.42, 1, r() < 0.2 ? 'velites' : 'tiro'); g.fillStyle = 'rgba(53,194,201,.55)'; g.fillRect(x - 14, y + 4, 28, 16); }
  for (const [x, y] of [[120, 420], [300, 500], [420, 380]]) { g.beginPath(); g.ellipse(x, y, 16, 8, 0, 0, 7); fo(g, '#e0403a', 3); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y + 4, 24, 9, 0, 0, 7); g.stroke(); }
  for (const [x, y] of [[80, 700], [200, 730], [330, 700], [450, 740]]) { for (const [dx, dy] of [[-14, -6], [14, -6], [0, 6]]) man(g, x + dx, y + dy, 0.5, 1); }
  dunes(g, 880, 4); stakes(g, 20, 900, 520, 900); for (const x of [50, 130, 210, 290, 370, 450]) foe(g, x, 894, 0.5);
  arrows(g, [[120, 870, 140, 330, 260], [250, 870, 280, 400, 240], [380, 870, 360, 300, 260], [450, 870, 460, 470, 200], [60, 870, 90, 520, 200]]);
  for (const [x, y] of [[170, 330], [330, 360], [400, 440], [110, 480]]) splash(g, x, y, 0.9);
}
// 3 · the big ship runs aground
function L3(g, t) {
  const f = scene(g, 3, { shore: 520, deep: '#2a8fb8', mid: '#38a9cf', shallow: 'rgba(255,255,255,.3)', sand: '#e8c77a' });
  for (const [x, y] of [[90, 90], [250, 60], [440, 100]]) ship(g, x, y, 0.4, '#d2362f', Math.PI);
  g.fillStyle = 'rgba(200,150,80,.5)'; for (let k = 0; k < 14; k++) { g.beginPath(); g.ellipse(120 + k * 22 % 300, 640 + (k * 37) % 120, 14, 6, 0, 0, 7); g.fill(); }
  g.save(); g.translate(270, 450); g.rotate(Math.PI); g.scale(2.3, 2.3); g.translate(-0, 0); g.restore();
  ship(g, 270, 440, 2.2, '#d2362f', Math.PI);
  // the beached prow: bronze ram and the gangway ramp
  g.beginPath(); g.moveTo(262, 640); g.lineTo(240, 800); g.lineTo(300, 800); g.lineTo(278, 640); g.closePath(); fo(g, '#8a5a30', 3.4); for (let y = 660; y < 800; y += 12) { g.beginPath(); g.moveTo(246 + (y - 640) * 0.02, y); g.lineTo(294 - (y - 640) * 0.02, y); g.strokeStyle = 'rgba(40,20,5,.5)'; g.lineWidth = 2; g.stroke(); }
  for (let k = 0; k < 7; k++) { man(g, 252 + (k % 2) * 26, 660 + k * 22, 0.6, k % 2 ? 1 : -1); }
  for (const [x, y] of [[170, 780], [370, 790], [140, 700], [400, 710], [210, 850], [330, 850]]) for (const [dx, dy] of [[-12, -4], [12, -4], [0, 6]]) man(g, x + dx, y + dy, 0.5, x < 270 ? 1 : -1);
  // fire on deck and sand spray
  fire(g, 230, 430, 1.4, t); fire(g, 310, 470, 1.2, t); smoke(g, 236, 380, 7, 'rgba(60,50,48,.45)'); for (const [x, y] of [[190, 760], [350, 770], [270, 830]]) splash(g, x, y, 0.8);
  dunes(g, 900, 5); stakes(g, 20, 920, 520, 920); for (const x of [70, 170, 370, 470]) foe(g, x, 914, 0.5);
  arrows(g, [[100, 890, 200, 420, 200], [440, 890, 340, 450, 200], [170, 890, 235, 560, 120], [380, 890, 310, 540, 140]]);
  for (const [x, y] of [[100, 560], [440, 580]]) { g.save(); g.translate(x, y); g.rotate(x < 270 ? 0.4 : -0.4); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -50); g.strokeStyle = OL; g.lineWidth = 5; g.stroke(); g.strokeStyle = '#d9c9a0'; g.lineWidth = 2.4; g.stroke(); fire(g, 0, -50, 0.5, t); g.restore(); }
}
// 4 · boats and rafts
function L4(g, t) {
  const f = scene(g, 4, { shore: 640, deep: '#2c8fb0', mid: '#3bb4d6', shallow: 'rgba(255,255,255,.3)', sand: '#f4dc9c' });
  for (const [x, y, a] of [[100, 50, 0], [260, 40, 0], [430, 55, 0]]) ship(g, x, y, 0.45, '#f7c948', Math.PI + a);
  const r = rng(14);
  for (let row = 0; row < 6; row++) for (let i = 0; i < 4; i++) { const x = 60 + i * 120 + (row % 2) * 50 + r() * 14, y = 190 + row * 70 + r() * 10; if (y > f(x) - 30) continue; boat(g, x, y, 0.8, Math.PI + (r() - 0.5) * 0.2); man(g, x - 6, y - 4, 0.36, 1); man(g, x + 6, y + 6, 0.36, 1); }
  // rafts
  for (const [x, y] of [[150, 560], [330, 590]]) { rr(g, x - 38, y - 18, 76, 36, 6); fo(g, '#a9743a', 3); for (let k = -30; k <= 30; k += 15) { g.beginPath(); g.moveTo(x + k, y - 18); g.lineTo(x + k, y + 18); g.strokeStyle = 'rgba(60,30,10,.5)'; g.lineWidth = 2; g.stroke(); } man(g, x - 14, y - 4, 0.4, 1); man(g, x + 14, y - 4, 0.4, 1); }
  for (const [x, y, a] of [[430, 520, 2.4], [60, 480, 0.7]]) { boat(g, x, y, 0.8, a); splash(g, x, y + 6, 0.8); }
  for (const [x, y] of [[100, 700], [210, 720], [330, 700], [440, 730]]) { for (const [dx, dy] of [[-12, -4], [12, -4], [0, 6]]) man(g, x + dx, y + dy, 0.5, 1); }
  // the tower with a ballista
  g.save(); g.translate(440, 850); g.fillStyle = 'rgba(40,20,10,.3)'; g.beginPath(); g.ellipse(10, 6, 50, 12, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-40, 0); g.lineTo(-30, -110); g.lineTo(30, -110); g.lineTo(40, 0); g.closePath(); fo(g, '#4a3a33', 3.4); rr(g, -36, -128, 72, 22, 5); fo(g, '#6a5a52', 3); g.beginPath(); g.moveTo(-16, -128); g.lineTo(22, -170); g.strokeStyle = OL; g.lineWidth = 9; g.stroke(); g.strokeStyle = '#c48a4a'; g.lineWidth = 4.4; g.stroke(); g.restore();
  dunes(g, 900, 6); stakes(g, 20, 925, 380, 925); for (const x of [60, 130, 200, 270, 340]) foe(g, x, 920, 0.5);
  arrows(g, [[160, 890, 150, 330, 240], [300, 890, 330, 400, 220], [60, 890, 80, 460, 200], [410, 700, 330, 330, 200]]);
  for (const [x, y] of [[250, 300], [370, 280], [90, 380]]) { g.beginPath(); g.arc(x, y, 12, 0, 7); fo(g, '#8a5a30', 2.6); fire(g, x, y - 6, 0.5, t); }
}
// 5 · siege landing with machines
function L5(g, t) {
  const f = scene(g, 5, { shore: 600, deep: '#1f6f9a', mid: '#3b9ec4', shallow: 'rgba(255,255,255,.28)', sand: '#ebcb84' });
  for (const x of [110, 270, 430]) { g.fillStyle = 'rgba(10,40,60,.28)'; g.beginPath(); g.ellipse(x + 6, 520, 66, 14, 0, 0, 7); g.fill(); rr(g, x - 64, 480, 128, 44, 8); fo(g, '#7a4e26', 3.6); rr(g, x - 52, 488, 104, 20, 4); fo(g, '#a9743a', 2.4); rr(g, x - 30, 520, 60, 70, 3); fo(g, '#9a6a34', 3.2); for (let y = 530; y < 590; y += 12) { g.beginPath(); g.moveTo(x - 30, y); g.lineTo(x + 30, y); g.strokeStyle = 'rgba(40,20,5,.5)'; g.lineWidth = 2; g.stroke(); } }
  for (const x of [110, 270, 430]) ship(g, x, 360, 0.7, '#c92e2e', Math.PI);
  // siege tower on wheels
  g.save(); g.translate(110, 700); g.fillStyle = 'rgba(40,20,5,.3)'; g.beginPath(); g.ellipse(8, 8, 52, 12, 0, 0, 7); g.fill(); rr(g, -44, -120, 88, 120, 5); fo(g, '#7a4e26', 3.6); rr(g, -36, -112, 72, 38, 4); fo(g, '#b5784a', 2.6); rr(g, -22, -100, 44, 14, 3); g.fillStyle = '#2a1a10'; g.fill(); for (const dx of [-26, 26]) { g.beginPath(); g.arc(dx, -2, 14, 0, 7); fo(g, '#5a3a20', 3.2); } g.restore();
  // ram under a hide roof
  g.save(); g.translate(270, 720); g.fillStyle = 'rgba(40,20,5,.3)'; g.beginPath(); g.ellipse(8, 8, 56, 12, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-50, 0); g.lineTo(-38, -56); g.lineTo(38, -56); g.lineTo(50, 0); g.closePath(); fo(g, '#b5784a', 3.6); for (let k = -30; k <= 30; k += 20) { g.beginPath(); g.moveTo(k, -56); g.lineTo(k, 0); g.strokeStyle = 'rgba(70,40,20,.5)'; g.lineWidth = 2; g.stroke(); } rr(g, -8, 0, 16, 56, 6); fo(g, '#c9a14a', 3); for (const dx of [-34, 34]) { g.beginPath(); g.arc(dx, 4, 11, 0, 7); fo(g, '#5a3a20', 3); } g.restore();
  // onager
  g.save(); g.translate(430, 700); g.fillStyle = 'rgba(40,20,5,.3)'; g.beginPath(); g.ellipse(8, 8, 46, 10, 0, 0, 7); g.fill(); rr(g, -40, -14, 80, 20, 4); fo(g, '#7a4e26', 3); g.beginPath(); g.moveTo(-12, -14); g.lineTo(26, -80); g.strokeStyle = OL; g.lineWidth = 11; g.stroke(); g.strokeStyle = '#c48a4a'; g.lineWidth = 6; g.stroke(); g.beginPath(); g.arc(26, -80, 11, 0, 7); fo(g, '#6a6a70', 2.6); g.restore();
  for (const [x, y] of [[60, 790], [170, 780], [230, 800], [320, 790], [380, 800], [490, 780]]) { for (const [dx, dy] of [[-12, -4], [12, -4], [0, 6]]) man(g, x + dx, y + dy, 0.48, 1); }
  // the enemy wall
  rr(g, 0, 850, 540, 110, 6); fo(g, '#8e8a99', 4.4); g.strokeStyle = 'rgba(40,40,60,.5)'; g.lineWidth = 2; for (let y = 872; y < 950; y += 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(540, y); g.stroke(); } for (let x = 6; x < 540; x += 54) { rr(g, x, 828, 38, 28, 3); fo(g, '#a7a3b2', 3.2); }
  for (const x of [40, 120, 200, 360, 440, 510]) foe(g, x, 846, 0.5);
  g.beginPath(); g.moveTo(270, 838); g.lineTo(270, 790); g.strokeStyle = OL; g.lineWidth = 6; g.stroke(); g.beginPath(); g.moveTo(270, 790); g.lineTo(300, 800); g.lineTo(270, 812); g.closePath(); fo(g, '#7a2a8a', 2.6);
  for (const [x, y] of [[200, 826], [330, 826]]) { g.beginPath(); g.ellipse(x, y, 20, 8, 0, 0, 7); fo(g, '#3a2a22', 2.6); fire(g, x, y - 2, 0.7, t); }
  arrows(g, [[120, 835, 120, 600, 120], [400, 835, 420, 640, 130], [270, 835, 270, 690, 110]]);
  for (const [x, y] of [[110, 660], [430, 650]]) { g.beginPath(); g.arc(x, y, 12, 0, 7); fo(g, '#ff7a1a', 2.6); fire(g, x, y - 2, 0.5, t); }
}
const LS = [L1, L2, L3, L4, L5];
const draw = () => document.querySelectorAll('canvas').forEach((c, i) => { const g = c.getContext('2d'); g.setTransform(c.width / W, 0, 0, c.width / W, 0, 0); LS[i](g, 0); });
draw();
`;

const cards = [
  ['1 · Сходни на борт', 'Три галеры стоят бортом к берегу, отряды по двое сходят по сходням и строятся с щитами на песке. Лучники на дюнах за частоколом. Порядок и мощь легиона.'],
  ['2 · Прыжок в воду', 'Галеры на глубине по пояс: легионеры прыгают за борт и бредут к берегу под градом стрел. Брызги, плоты-щиты, хаос и опасность.'],
  ['3 · Таран на берег', 'Одна большая трирема выскакивает на песок, на палубе огонь, отряды бегут вниз по носовому трапу. Остальные корабли — вдали. Один эффектный момент.'],
  ['4 · Шлюпки и плоты', 'Корабли далеко, к берегу идёт рой шлюпок и плотов. Береговая башня с баллистой, перевёрнутые лодки, горшки с огнём.'],
  ['5 · Осадный десант', 'Плоскодонные баржи сгружают башню, таран и онагр, легионеры строятся позади. Стена врага с лучниками и котлами смолы.']
];
const html = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Десантирование на берег</title>
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
<div class="wrap"><h1>Десантирование на берег</h1><p>Пять вариантов самой сцены высадки: корабли у берега, отряды выходят на песок, оборона врага отвечает. Идеи арт-директора. Наши красные, враги синие.</p>
<div class="grid">${cards.map(c => `<section><canvas width="540" height="960" aria-label="${c[0]}"></canvas><h2>${c[0]}</h2><p>${c[1]}</p></section>`).join('')}</div></div>
<script>
'use strict';
${ban}
${art}
${helpers}
${own}
</script>`;
fs.writeFileSync(path.join(__dirname, 'sardinia-landing.html'), html);
console.log('ok', html.length);
