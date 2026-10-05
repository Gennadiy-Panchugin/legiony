// Builds extras.html: more obstacles, the sea landing and patrol weather, in the cartoon style.
const fs = require('fs'), path = require('path');
const gen = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
const js = gen.slice(gen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, gen.indexOf('`;\nconst html'));
const helpers = js.slice(0, js.indexOf('function drawWorld(g) {')).replace("const team = side === 1 ? '#e2382c' : '#3f7ae0', dark = side === 1 ? '#a8241c' : '#2a56b0';", "const team = side === 1 ? '#e2382c' : side === 3 ? '#c8822c' : '#3f7ae0', dark = side === 1 ? '#a8241c' : side === 3 ? '#8a5418' : '#2a56b0';");
const tj = fs.readFileSync(path.join(__dirname, 'terrain.js'), 'utf8');
const tsheet = tj.slice(tj.indexOf('// ---------------------------------------------------------------- rubble: boulders'), tj.indexOf('// ---------------------------------------------------------------- 1. rubble in three states'));
const hillFn = tj.slice(tj.indexOf('function hill(g, x, y, rx, ry, h, top) {'), tj.indexOf('function tuft('));
const stakeFn = tj.slice(tj.indexOf('function stake(g, x, y) {'), tj.indexOf('function menhir('));
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
const between = (src, a, b) => src.slice(src.indexOf(a), src.indexOf(b, src.indexOf(a)));
const ban = between(cas, 'const BAN = {', 'const REFILL'), art = between(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const draw = String.raw`
// ---------------------------------------------------------------- obstacles
function ditch(g, x, y, w) {
  g.beginPath(); g.moveTo(x - w / 2, y - 14); g.quadraticCurveTo(x, y - 22, x + w / 2, y - 14); g.lineTo(x + w / 2, y + 14); g.quadraticCurveTo(x, y + 22, x - w / 2, y + 14); g.closePath(); fo(g, '#5a3a20', 2.8);
  g.beginPath(); g.moveTo(x - w / 2 + 6, y - 6); g.quadraticCurveTo(x, y - 12, x + w / 2 - 6, y - 6); g.lineTo(x + w / 2 - 6, y + 8); g.quadraticCurveTo(x, y + 14, x - w / 2 + 6, y + 8); g.closePath(); g.fillStyle = '#2e1c0e'; g.fill();
  rr(g, x - w / 2, y - 26, w, 10, 5); fo(g, '#9a6a3c', 2.4); rr(g, x - w / 2, y + 16, w, 10, 5); fo(g, '#9a6a3c', 2.4);
  for (let k = -w / 2 + 12; k < w / 2; k += 16) { g.save(); g.translate(x + k, y - 22); g.rotate(-0.5); g.beginPath(); g.moveTo(-3, 6); g.lineTo(0, -16); g.lineTo(3, 6); g.closePath(); fo(g, '#c48a4a', 2); g.restore(); }
}
function ravine(g, x, y, w, open) {
  g.beginPath(); g.moveTo(x - w / 2, y - 30); for (let k = 0; k <= 8; k++) g.lineTo(x - w / 2 + k * w / 8, y - 30 + (k % 2 ? 8 : -4)); g.lineTo(x + w / 2, y + 26); for (let k = 8; k >= 0; k--) g.lineTo(x - w / 2 + k * w / 8, y + 26 + (k % 2 ? -6 : 6)); g.closePath();
  const rg = g.createLinearGradient(0, y - 30, 0, y + 26); rg.addColorStop(0, '#5e3a22'); rg.addColorStop(0.5, '#1e120a'); rg.addColorStop(1, '#3a2414'); fo(g, rg, 3);
  g.fillStyle = '#9a6a3c'; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(x - w / 2 + k * w / 8, y - 30 + (k % 2 ? 8 : -4)); g.lineTo(x - w / 2 + (k + 1) * w / 8, y - 30 + ((k + 1) % 2 ? 8 : -4)); g.lineTo(x - w / 2 + (k + 0.5) * w / 8, y - 16); g.closePath(); g.fill(); }
  if (open) { for (let yy = y - 34; yy < y + 30; yy += 8) { rr(g, x - 18, yy, 36, 6, 2); fo(g, '#c48a4a', 1.8); } g.strokeStyle = OL; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 22, y - 40); g.quadraticCurveTo(x - 26, y, x - 22, y + 36); g.moveTo(x + 22, y - 40); g.quadraticCurveTo(x + 26, y, x + 22, y + 36); g.stroke(); g.strokeStyle = '#d6b07a'; g.lineWidth = 1.6; g.stroke(); }
}
function flame(g, x, y, s, t) { g.beginPath(); g.moveTo(x - 9 * s, y); g.quadraticCurveTo(x - 12 * s, y - 18 * s, x, y - 34 * s); g.quadraticCurveTo(x + 12 * s, y - 18 * s, x + 9 * s, y); g.closePath(); fo(g, '#ff8a2a', 2.2); g.beginPath(); g.moveTo(x - 5 * s, y); g.quadraticCurveTo(x - 6 * s, y - 12 * s, x, y - 22 * s); g.quadraticCurveTo(x + 6 * s, y - 12 * s, x + 5 * s, y); g.closePath(); g.fillStyle = '#ffd23a'; g.fill(); }
function smoke(g, x, y, s) { for (const [dx, dy, r] of [[0, 0, 14], [10, -18, 18], [-6, -38, 22], [8, -60, 26]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 7); g.fillStyle = 'rgba(70,64,60,.55)'; g.fill(); } }
function burningGrove(g, x, y) { grove(g, x, y, 100, 64, 14, 12); g.fillStyle = 'rgba(60,30,10,.35)'; blob(g, x, y + 4, 96, 60, 3, 12); g.fill(); smoke(g, x - 20, y - 70, 1.2); smoke(g, x + 46, y - 60, 0.9); for (const [dx, dy, s] of [[-50, -10, 1.1], [-14, -26, 1.3], [30, -6, 1.2], [60, 14, 0.9], [-30, 22, 0.9], [10, 26, 1]]) flame(g, x + dx, y + dy, s); }
function palisadeGate(g, x, y, w) {
  for (let k = -w / 2; k <= w / 2; k += 11) { if (Math.abs(k) < 26) continue; g.beginPath(); g.moveTo(x + k - 5, y + 6); g.lineTo(x + k - 4, y - 40); g.lineTo(x + k, y - 50); g.lineTo(x + k + 4, y - 40); g.lineTo(x + k + 5, y + 6); g.closePath(); fo(g, '#b0783e', 2.2); }
  rr(g, x - w / 2 - 4, y - 24, w + 8, 8, 4); fo(g, '#8a5a30', 2.2);
  rr(g, x - 26, y - 48, 52, 54, 4); fo(g, '#7a4a26', 2.8); g.strokeStyle = OL; g.lineWidth = 2; for (const yy of [y - 34, y - 14]) { g.beginPath(); g.moveTo(x - 26, yy); g.lineTo(x + 26, yy); g.stroke(); } g.beginPath(); g.moveTo(x, y - 48); g.lineTo(x, y + 6); g.stroke();
  for (const sx of [-34, 34]) { rr(g, x + sx - 10, y - 74, 20, 80, 4); fo(g, '#9a6a3c', 2.6); rr(g, x + sx - 14, y - 82, 28, 12, 3); fo(g, '#7a4a26', 2.4); }
}
// ---------------------------------------------------------------- the sea and ships
function sea(g, x0, y0, w, h, r) { const sg = g.createLinearGradient(0, y0, 0, y0 + h); sg.addColorStop(0, '#2a8fd0'); sg.addColorStop(1, '#5fd0f5'); g.fillStyle = sg; g.fillRect(x0, y0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; g.lineCap = 'round'; for (let i = 0; i < w * h / 2600; i++) { const x = x0 + r() * w, y = y0 + r() * h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8, y - 5, x + 16, y); g.stroke(); } }
function beach(g, pts, r) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); fo(g, '#f2d690', 3); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 5; g.beginPath(); pts.slice(0, Math.ceil(pts.length / 2)).forEach(([x, y], i) => i ? g.lineTo(x, y + 4) : g.moveTo(x, y + 4)); g.stroke(); }
function trireme(g, x, y, s, flip) {
  g.save(); g.translate(x, y); g.scale(s * (flip ? -1 : 1), s);
  g.fillStyle = 'rgba(20,60,100,.3)'; g.beginPath(); g.ellipse(6, 18, 96, 14, 0, 0, 7); g.fill();
  for (let k = -60; k <= 50; k += 14) { g.strokeStyle = OL; g.lineWidth = 4; g.beginPath(); g.moveTo(k, 6); g.lineTo(k - 10, 30); g.stroke(); g.strokeStyle = '#c48a4a'; g.lineWidth = 2; g.stroke(); }
  g.beginPath(); g.moveTo(-86, -8); g.quadraticCurveTo(-96, -26, -80, -30); g.lineTo(-70, -10); g.lineTo(70, -10); g.quadraticCurveTo(92, -12, 98, 4); g.lineTo(80, 14); g.quadraticCurveTo(0, 22, -74, 12); g.closePath(); fo(g, '#9a5a2c', 3);
  g.fillStyle = '#c47a3c'; g.fillRect(-70, -10, 140, 7); for (let k = -56; k <= 56; k += 16) { g.beginPath(); g.arc(k, -2, 6, 0, 7); fo(g, '#e2382c', 2); g.fillStyle = '#f2c14a'; g.beginPath(); g.arc(k, -2, 2, 0, 7); g.fill(); }
  g.strokeStyle = OL; g.lineWidth = 5; g.beginPath(); g.moveTo(0, -10); g.lineTo(0, -96); g.stroke(); g.strokeStyle = '#8a5a30'; g.lineWidth = 3; g.stroke();
  g.beginPath(); g.moveTo(-40, -86); g.quadraticCurveTo(0, -78, 40, -86); g.lineTo(44, -26); g.quadraticCurveTo(0, -18, -44, -26); g.closePath(); fo(g, '#e2382c', 3); g.fillStyle = '#f2c14a'; g.beginPath(); g.moveTo(-10, -62); g.quadraticCurveTo(0, -72, 10, -62); g.lineTo(6, -46); g.lineTo(-6, -46); g.closePath(); g.fill();
  g.restore();
}
function boat(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = 'rgba(20,60,100,.3)'; g.beginPath(); g.ellipse(4, 10, 44, 8, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-40, -4); g.lineTo(40, -4); g.lineTo(30, 10); g.lineTo(-32, 10); g.closePath(); fo(g, '#9a5a2c', 2.6); g.restore(); }
// ---------------------------------------------------------------- the arena
function arena(g, cx, cy, rx, ry, r) {
  g.beginPath(); g.ellipse(cx, cy + 10, rx + 40, ry + 34, 0, 0, 7); fo(g, '#cfc3ac', 3);
  for (let row = 0; row < 3; row++) { const k = 1 - row * 0.1; g.beginPath(); g.ellipse(cx, cy + 6, (rx + 34) * k, (ry + 28) * k, 0, 0, 7); g.strokeStyle = 'rgba(120,100,80,.6)'; g.lineWidth = 2; g.stroke(); }
  const cols = ['#e2382c', '#3f7ae0', '#f2c14a', '#7ee05a', '#f4e2bc', '#b06ad8', '#ff8a3c'];
  for (let i = 0; i < 160; i++) { const a = r() * Math.PI * 2, d = 0.78 + r() * 0.2, x = cx + Math.cos(a) * (rx + 34) * d, y = cy + 6 + Math.sin(a) * (ry + 28) * d; g.beginPath(); g.arc(x, y, 3.4, 0, 7); g.fillStyle = cols[i % cols.length]; g.fill(); g.beginPath(); g.arc(x, y - 4, 2.6, 0, 7); g.fillStyle = '#ffd2a6'; g.fill(); }
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); const sg = g.createRadialGradient(cx, cy - ry * 0.3, 10, cx, cy, rx); sg.addColorStop(0, '#f6e2a6'); sg.addColorStop(1, '#d8b870'); fo(g, sg, 3);
  rr(g, cx - 36, cy - ry - 46, 72, 26, 6); fo(g, '#efe6d2', 2.6); g.beginPath(); g.moveTo(cx - 42, cy - ry - 46); g.quadraticCurveTo(cx, cy - ry - 64, cx + 42, cy - ry - 46); g.closePath(); fo(g, '#a8241c', 2.4);
  chibi(g, cx, cy - ry - 22, 'eques', 1, 0.45, 1);
  for (const sx of [-1, 1]) { rr(g, cx + sx * (rx + 12) - 12, cy - 18, 24, 36, 8); fo(g, '#5a3a20', 2.4); }
}
function lion(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(0, 4, 26, 6, 0, 0, 7); g.fill(); for (const lx of [-14, -6, 8, 15]) { rr(g, lx - 3, -12, 6, 14, 3); fo(g, '#d8962c', 2); }
  g.beginPath(); g.ellipse(0, -16, 22, 11, 0, 0, 7); fo(g, '#f0b04a', 2.6); g.beginPath(); g.moveTo(-20, -18); g.quadraticCurveTo(-34, -24, -30, -36); g.strokeStyle = OL; g.lineWidth = 4; g.stroke(); g.strokeStyle = '#f0b04a'; g.lineWidth = 2; g.stroke();
  blob(g, 18, -28, 16, 15, 3, 10); fo(g, '#a8601c', 2.6); g.beginPath(); g.arc(20, -28, 9, 0, 7); fo(g, '#f0b04a', 2.2); g.fillStyle = OL; g.beginPath(); g.arc(23, -30, 1.6, 0, 7); g.arc(17, -30, 1.6, 0, 7); g.fill(); g.restore(); }
function meter(g, x, y, w, p, label) { rr(g, x - w / 2, y, w, 20, 10); g.fillStyle = OL; g.fill(); rr(g, x - w / 2 + 3, y + 3, (w - 6) * p, 14, 7); const mg = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); mg.addColorStop(0, '#ff5a4a'); mg.addColorStop(0.5, '#ffcc33'); mg.addColorStop(1, '#7ee05a'); g.fillStyle = mg; g.fill(); g.font = '900 13px "Lilita One", sans-serif'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(label, x, y + 15); }
// ---------------------------------------------------------------- rebellion
function rebels(g, x, y, n, s) { const pos = [[-18, -6], [16, -8], [0, 6], [-26, 12], [26, 10]].slice(0, n).sort((a, b) => a[1] - b[1]); for (const [dx, dy] of pos) { chibi(g, x + dx * s, y + dy * s, 'rebel', 3, 0.6 * s, dx < 0 ? 1 : -1);
  g.strokeStyle = OL; g.lineWidth = 4; g.beginPath(); g.moveTo(x + dx * s + 9, y + dy * s - 2); g.lineTo(x + dx * s + 13, y + dy * s - 44 * s); g.stroke(); g.strokeStyle = '#a0703c'; g.lineWidth = 2; g.stroke();
  if (dx % 2) { flame(g, x + dx * s + 13, y + dy * s - 42 * s, 0.45); } else { g.strokeStyle = '#b4bcc4'; g.lineWidth = 2; for (const fx of [-3, 0, 3]) { g.beginPath(); g.moveTo(x + dx * s + 13 + fx, y + dy * s - 44 * s); g.lineTo(x + dx * s + 13 + fx, y + dy * s - 52 * s); g.stroke(); } } } }
function cart(g, x, y, flip) { g.save(); g.translate(x, y); if (flip) g.scale(-1, 1); rr(g, -26, -22, 52, 18, 3); fo(g, '#9a6a3c', 2.4); for (const wx of [-16, 16]) { g.beginPath(); g.arc(wx, -2, 9, 0, 7); fo(g, '#6a4020', 2.2); g.beginPath(); g.arc(wx, -2, 2.5, 0, 7); g.fillStyle = OL; g.fill(); } g.beginPath(); g.moveTo(26, -14); g.lineTo(44, -4); g.strokeStyle = OL; g.lineWidth = 4; g.stroke(); g.restore(); }
function burningHouse(g, x, y) { house(g, x, y); g.fillStyle = 'rgba(40,20,10,.35)'; g.fillRect(x - 24, y - 30, 48, 32); smoke(g, x + 6, y - 66, 0.8); for (const [dx, dy, s] of [[-12, -40, 0.7], [8, -46, 0.85], [20, -30, 0.6]]) flame(g, x + dx, y + dy, s); }
// ---------------------------------------------------------------- campaign biomes
function haze(g, r) { for (let i = 0; i < 6; i++) { blob(g, r() * 340, 40 + r() * 170, 60 + r() * 40, 14 + r() * 10, i, 10); g.fillStyle = 'rgba(240,244,248,.32)'; g.fill(); } }
function biome(id, base, draw) { const c = document.getElementById(id), g = c.getContext('2d'); g.scale(2, 2); const r = rng(id.length * 13 + base.length); grass(g, 0, 0, 340, 240, base, r); draw(g, r); }
function olive(g, x, y) { g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 4, y + 2, 18, 5, 0, 0, 7); g.fill(); rr(g, x - 3, y - 14, 6, 16, 2); fo(g, '#8a6a4a', 2); blob(g, x, y - 24, 18, 12, x, 9); fo(g, '#8a9a5a', 2.4); g.fillStyle = '#a8b878'; blob(g, x - 4, y - 28, 9, 5, y, 7); g.fill(); }
function column(g, x, y, h) { rr(g, x - 7, y - h, 14, h, 2); fo(g, '#f4efe2', 2.2); rr(g, x - 10, y - h - 6, 20, 7, 2); fo(g, '#f4efe2', 2); g.strokeStyle = 'rgba(120,110,90,.5)'; g.lineWidth = 1.2; for (const dx of [-3, 0, 3]) { g.beginPath(); g.moveTo(x + dx, y - h + 2); g.lineTo(x + dx, y - 2); g.stroke(); } }
function heather(g, x, y) { for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#b06ad8' : '#8a4ab8'; g.beginPath(); g.arc(x + (k - 3) * 5, y - (k % 3) * 3, 4, 0, 7); g.fill(); } }
// ---------------------------------------------------------------- weather
function rain(g, w, h, r) { g.fillStyle = 'rgba(40,60,90,.25)'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(220,235,255,.75)'; g.lineWidth = 2; g.lineCap = 'round'; for (let i = 0; i < 140; i++) { const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 18); g.stroke(); } for (let i = 0; i < 14; i++) { const x = r() * w, y = 160 + r() * (h - 170); g.beginPath(); g.ellipse(x, y, 8, 3, 0, 0, 7); g.strokeStyle = 'rgba(220,235,255,.6)'; g.lineWidth = 1.6; g.stroke(); } }
function fog(g, w, h, r) { for (let i = 0; i < 26; i++) { blob(g, r() * w, 60 + r() * (h - 80), 50 + r() * 70, 24 + r() * 26, i, 10); g.fillStyle = 'rgba(240,244,248,.42)'; g.fill(); } g.fillStyle = 'rgba(230,236,240,.25)'; g.fillRect(0, 0, w, h); }
function snow(g, w, h, r) { g.fillStyle = 'rgba(240,248,255,.42)'; g.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { blob(g, r() * w, r() * h, 20 + r() * 40, 10 + r() * 16, i, 9); g.fillStyle = 'rgba(255,255,255,.7)'; g.fill(); } for (let i = 0; i < 120; i++) { g.beginPath(); g.arc(r() * w, r() * h, 1.5 + r() * 2.2, 0, 7); g.fillStyle = '#fff'; g.fill(); } }
function night(g, w, h, lights) { g.fillStyle = 'rgba(16,24,60,.62)'; g.fillRect(0, 0, w, h); g.save(); g.globalCompositeOperation = 'lighter'; for (const [x, y, r] of lights) { const lg = g.createRadialGradient(x, y, 4, x, y, r); lg.addColorStop(0, 'rgba(255,190,90,.55)'); lg.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = lg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.restore(); for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(255,255,230,.8)'; g.beginPath(); g.arc((i * 97) % w, (i * 53) % 60 + 6, 1.4, 0, 7); g.fill(); } }
function heat(g, w, h, r) {
  g.fillStyle = 'rgba(255,160,30,.26)'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) { const x = r() * w, y = 120 + r() * (h - 140); g.strokeStyle = 'rgba(140,90,30,.55)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8, y + 4); g.lineTo(x + 4, y + 10); g.moveTo(x + 8, y + 4); g.lineTo(x + 16, y + 2); g.stroke(); }
  g.strokeStyle = 'rgba(255,248,220,.7)'; g.lineWidth = 2.4; for (let k = 0; k < 9; k++) { const y = 70 + k * 36; g.beginPath(); for (let x = 0; x <= w; x += 10) g.lineTo(x, y + Math.sin(x * 0.08 + k) * 3); g.stroke(); }
  const sg = g.createRadialGradient(w - 40, 30, 4, w - 40, 30, 120); sg.addColorStop(0, 'rgba(255,250,200,.95)'); sg.addColorStop(0.25, 'rgba(255,220,120,.55)'); sg.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = sg; g.fillRect(0, 0, w, h);
  g.beginPath(); g.arc(w - 40, 30, 18, 0, 7); fo(g, '#ffe04a', 2.6);
}
function waveIn(g, x, y, ang, label) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); g.moveTo(-34, -10); g.lineTo(6, -10); g.lineTo(6, -20); g.lineTo(28, 0); g.lineTo(6, 20); g.lineTo(6, 10); g.lineTo(-34, 10); g.closePath(); fo(g, 'rgba(255,74,58,.9)', 2.6);
  g.restore(); g.beginPath(); g.arc(x - Math.cos(ang) * 46, y - Math.sin(ang) * 46, 15, 0, 7); fo(g, '#ff4a3a', 2.8); g.fillStyle = '#fff'; g.font = '900 18px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText('!', x - Math.cos(ang) * 46, y - Math.sin(ang) * 46 + 6);
  if (label) { g.font = '900 12px "Lilita One", sans-serif'; const tw = g.measureText(label).width + 12, cy0 = y - Math.sin(ang) * 46, lx = Math.max(tw / 2 + 4, Math.min(336 - tw / 2, x - Math.cos(ang) * 46)), ly = cy0 + 30 > 410 ? cy0 - 26 : cy0 + 30; rr(g, lx - tw / 2, ly - 12, tw, 18, 9); g.fillStyle = 'rgba(40,24,14,.9)'; g.fill(); g.fillStyle = '#ffb0a6'; g.fillText(label, lx, ly + 2); }
}
function waveBar(g, cx, y, n, of, sub) {
  rr(g, cx - 120, y, 240, 48, 16); g.fillStyle = 'rgba(40,24,14,.94)'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = '#ff8a6a'; g.stroke();
  g.fillStyle = '#ffe6a8'; g.font = '900 16px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText('Волна ' + n + ' из ' + of, cx, y + 20);
  for (let k = 0; k < of; k++) { g.beginPath(); g.arc(cx - (of - 1) * 11 + k * 22, y + 34, 7, 0, 7); fo(g, k < n - 1 ? '#7ee05a' : k === n - 1 ? '#ffcc33' : '#5a3a20', 2); }
  if (sub) { g.font = '800 11px "Alegreya Sans", sans-serif'; g.fillStyle = '#e2c9a0'; g.fillText(sub, cx, y + 62); }
}
function gate(g, x, y, open) { rr(g, x - 20, y - 24, 40, 30, 10); fo(g, open ? '#1a0e06' : '#6a4020', 2.6); if (!open) { g.strokeStyle = OL; g.lineWidth = 2; for (const dx of [-10, 0, 10]) { g.beginPath(); g.moveTo(x + dx, y - 22); g.lineTo(x + dx, y + 4); g.stroke(); } } }
function torch(g, x, y) { g.strokeStyle = OL; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 30); g.stroke(); g.strokeStyle = '#8a5a30'; g.lineWidth = 2; g.stroke(); flame(g, x, y - 28, 0.6); }

// ---------------------------------------------------------------- panels
function pnl(id, w, h, seed) { const c = document.getElementById(id), g = c.getContext('2d'); g.scale(2, 2); const r = rng(seed || id.length * 17); grass(g, 0, 0, w || 340, h || 420, '#76c64a', r); return { g, r }; }
// obstacles
{ const { g } = pnl('ob1'); path(g, [[170, 420], [170, 0]], 34); ditch(g, 170, 220, 300); plate(g, 170, 120, 'Ров с кольями', 'медленно и больно · настил кладут инженеры', '#ff8a6a'); squad(g, 170, 340, 'hastati', 1, 4, 1, '#e2382c', 'vex'); }
{ const { g } = pnl('ob2'); path(g, [[170, 420], [170, 0]], 34); ravine(g, 170, 210, 340, true); plate(g, 170, 120, 'Овраг', 'не пройти · верёвочный мост инженеров', '#f2c14a'); squad(g, 170, 330, 'eng', 1, 3, 1, '#f09a24', 'square'); }
{ const { g } = pnl('ob3'); burningGrove(g, 170, 220); plate(g, 170, 92, '🔥 Пожар', 'обойти или ждать · можно поджечь стрелами', '#ff8a2a'); squad(g, 130, 380, 'velites', 1, 4, 1, '#2fa04e', 'pennant'); }
{ const { g } = pnl('ob4'); path(g, [[170, 420], [170, 0]], 34); palisadeGate(g, 170, 210, 320); plate(g, 170, 98, 'Частокол с воротами', 'ворота таранят или открывают изнутри', '#f2c14a'); squad(g, 150, 340, 'hastati', 1, 5, 1, '#e2382c', 'vex'); squad(g, 170, 150, 'e_inf', 2, 3, 0.9, '#3f7ae0', 'vex'); }
// sea landing: the approach and the beachhead
{ const { g, r } = pnl('sea1', 340, 420, 5); sea(g, 0, 0, 340, 420, r); beach(g, [[0, 330], [80, 316], [180, 324], [260, 312], [340, 322], [340, 420], [0, 420]], r);
  grove(g, 60, 400, 60, 26, 7, 3); grove(g, 290, 396, 54, 24, 6, 8); squad(g, 170, 380, 'e_inf', 2, 4, 0.9, '#3f7ae0', 'vex');
  trireme(g, 150, 150, 1, false); trireme(g, 290, 240, 0.7, true); boat(g, 100, 270, 1); for (const dx of [-18, 0, 18]) chibi(g, 100 + dx, 266, 'hastati', 1, 0.5, 1);
  plate(g, 170, 42, '⛵ Подход с моря', 'корабли выбирают место высадки', '#5fd0f5'); }
{ const { g, r } = pnl('sea2', 340, 420, 9); sea(g, 0, 0, 340, 170, r); beach(g, [[0, 170], [340, 150], [340, 230], [0, 240]], r);
  trireme(g, 120, 140, 0.9, false); g.beginPath(); g.moveTo(120, 160); g.lineTo(140, 228); g.lineTo(162, 228); g.lineTo(150, 158); g.closePath(); fo(g, '#c48a4a', 2.6); for (let k = 0; k < 5; k++) { g.strokeStyle = OL; g.lineWidth = 1.6; g.beginPath(); g.moveTo(124 + k * 4, 170 + k * 12); g.lineTo(152 + k * 2, 168 + k * 12); g.stroke(); }
  squad(g, 160, 270, 'hastati', 1, 5, 1, '#e2382c', 'vex'); squad(g, 250, 250, 'velites', 1, 4, 1, '#2fa04e', 'pennant');
  hill(g, 250, 350, 70, 34, 24); squad(g, 250, 352, 'e_arc', 2, 3, 0.9, '#3f7ae0', 'pennant'); squad(g, 80, 360, 'e_inf', 2, 4, 0.9, '#3f7ae0', 'vex');
  plate(g, 170, 42, '🛶 Высадка', 'трап, плацдарм на пляже · лагеря нет', '#5fd0f5'); }
// patrol weather: one scene, five skies
const PATROL = (g, r) => { path(g, [[0, 300], [120, 260], [220, 250], [340, 210]], 30); grove(g, 70, 150, 70, 46, 10, 4); grove(g, 280, 340, 64, 40, 9, 7); house(g, 270, 150); squad(g, 230, 236, 'e_inf', 2, 4, 0.95, '#3f7ae0', 'vex'); squad(g, 90, 300, 'hastati', 1, 4, 0.95, '#e2382c', 'vex'); squad(g, 150, 360, 'velites', 1, 3, 0.95, '#2fa04e', 'pennant'); };
// the Colosseum: a fight in the sand, the crowd's favour
{ const { g, r } = pnl('ar1', 340, 420, 61); arena(g, 170, 230, 120, 82, r); squad(g, 120, 236, 'hastati', 1, 3, 0.85, '#e2382c', 'vex'); lion(g, 220, 250, 1.1); squad(g, 210, 204, 'e_inf', 2, 2, 0.8, '#3f7ae0', 'vex');
  plate(g, 170, 404, '🏟 Колизей', 'гладиаторы, звери, толпа', '#f2c14a'); }
{ const { g, r } = pnl('ar2', 340, 420, 67); arena(g, 170, 250, 128, 86, r);
  gate(g, 170, 172, true); gate(g, 54, 256, false); gate(g, 286, 256, true); gate(g, 170, 338, false);
  g.beginPath(); g.ellipse(170, 252, 54, 30, 0, 0, 7); g.save(); g.setLineDash([8, 6]); g.strokeStyle = 'rgba(255,240,180,.95)'; g.lineWidth = 3; g.stroke(); g.restore();
  squad(g, 142, 252, 'hastati', 1, 3, 0.8, '#e2382c', 'vex'); squad(g, 196, 262, 'velites', 1, 3, 0.8, '#2fa04e', 'pennant');
  squad(g, 170, 200, 'e_inf', 2, 2, 0.8, '#3f7ae0', 'vex'); lion(g, 226, 214, 0.8);
  waveIn(g, 170, 182, Math.PI / 2, 'гладиаторы'); waveIn(g, 262, 256, Math.PI, 'львы · 5 с');
  waveBar(g, 170, 18, 3, 6, ''); meter(g, 170, 76, 200, 0.7, 'Милость толпы 70%');
  plate(g, 170, 404, '🛡 Держать центр', 'волны выходят из ворот арены', '#f2c14a'); }
// the rebellion: a burning province, then the suppression
{ const { g } = pnl('rv1', 340, 420, 71); path(g, [[0, 300], [170, 260], [340, 300]], 30); burningHouse(g, 90, 200); burningHouse(g, 230, 170); house(g, 280, 280); burningHouse(g, 150, 330);
  rebels(g, 200, 260, 5, 1); plate(g, 170, 404, '🔥 Восстание', 'провинция горит · доход стоит', '#ff8a2a'); }
{ const { g } = pnl('rv2', 340, 420, 77); path(g, [[0, 250], [340, 250]], 28); path(g, [[170, 420], [170, 100]], 28);
  g.beginPath(); g.ellipse(170, 250, 70, 40, 0, 0, 7); g.fillStyle = 'rgba(214,190,130,.75)'; g.fill();
  rr(g, 132, 196, 76, 44, 4); fo(g, '#f4e2bc', 2.6); roofTri(g, 170, 198, 76, 34, '#e8643c', '#c04a28'); flag(g, 192, 140, '#e2382c', 34);
  cart(g, 96, 266, false); cart(g, 250, 270, true); grove(g, 50, 130, 50, 36, 7, 3); grove(g, 300, 360, 46, 34, 6, 6);
  squad(g, 120, 300, 'hastati', 1, 4, 0.85, '#e2382c', 'vex'); squad(g, 230, 300, 'hastati', 1, 4, 0.85, '#e2382c', 'vex'); squad(g, 170, 290, 'velites', 1, 3, 0.85, '#2fa04e', 'pennant');
  rebels(g, 40, 300, 3, 0.75); rebels(g, 300, 300, 3, 0.75);
  waveIn(g, 70, 250, 0, 'с запада'); waveIn(g, 272, 250, Math.PI, 'с востока'); waveIn(g, 170, 350, -Math.PI / 2, 'с юга · 8 с');
  waveBar(g, 170, 18, 2, 5, 'удержите виллу наместника');
 }
// campaign biomes
biome('bi1', '#76c64a', (g, r) => { grove(g, 80, 120, 70, 44, 9, 2); grove(g, 270, 170, 60, 40, 8, 5); house(g, 200, 110); path(g, [[0, 200], [340, 180]], 24); });
biome('bi2', '#4f9a3c', (g, r) => { grove(g, 80, 110, 90, 70, 16, 3); grove(g, 260, 130, 90, 80, 16, 6); grove(g, 170, 220, 110, 30, 10, 9); haze(g, r); });
biome('bi3', '#c8b56a', (g, r) => { for (const [x, y] of [[60, 120], [120, 180], [250, 100], [300, 190], [200, 150]]) olive(g, x, y); for (const [x, y, s] of [[160, 90, 1], [280, 150, 0.8], [40, 200, 0.9]]) rock(g, x, y, s); path(g, [[0, 220], [340, 200]], 22); });
biome('bi4', '#8aa86a', (g, r) => { for (const [x, y] of [[50, 90], [120, 150], [240, 110], [290, 190], [180, 210], [60, 200]]) heather(g, x, y); for (const [x, y, s] of [[200, 70, 1], [100, 120, 0.8]]) rock(g, x, y, s); haze(g, r); });
biome('bi5', '#a8c272', (g, r) => { sea(g, 220, 0, 120, 240, r); beach(g, [[200, 0], [230, 0], [250, 240], [214, 240]], r); for (const [x, y] of [[50, 110], [110, 180]]) olive(g, x, y); for (const [x, h] of [[120, 52], [146, 40], [172, 52]]) column(g, x, 120, h); rr(g, 108, 128, 76, 8, 3); fo(g, '#f4efe2', 2); });
biome('bi6', '#d4c070', (g, r) => { const rg = g.createLinearGradient(0, 120, 0, 170); rg.addColorStop(0, '#5fd0f5'); rg.addColorStop(1, '#2a9fd8'); g.beginPath(); g.moveTo(0, 116); g.quadraticCurveTo(170, 90, 340, 130); g.lineTo(340, 178); g.quadraticCurveTo(170, 150, 0, 172); g.closePath(); fo(g, rg, 2.8); grove(g, 280, 210, 50, 22, 6, 4); for (let i = 0; i < 40; i++) { const x = r() * 340, y = 190 + r() * 50; g.strokeStyle = 'rgba(140,110,40,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 9); g.stroke(); } house(g, 90, 80); });
const WEATHER = [['wx1', 'Ясно', 'всё как обычно', null], ['wx6', '☀ Жара', 'броня тяжелеет · отдых в тени', heat], ['wx2', '🌧 Дождь', 'луки −30%, броды глубже', rain], ['wx3', '🌫 Туман', 'видно на 2 клетки · засады', fog], ['wx4', '❄ Снег', 'все медленнее на 20%', snow], ['wx5', '🌙 Ночь', 'видно у факелов · вылазка тише', 'night']];
WEATHER.forEach(([id, name, sub, fx], i) => { const { g, r } = pnl(id, 340, 420, 40 + i); PATROL(g, r);
  if (fx === 'night') { torch(g, 250, 200); torch(g, 296, 172); night(g, 340, 420, [[250, 172, 80], [296, 144, 70], [270, 150, 60]]); } else if (fx) fx(g, 340, 420, r);
  plate(g, 170, 404, name, sub, fx === 'night' ? '#9ec1ff' : fx === heat ? '#ffb03a' : '#f2c14a'); });
`;
const html = `<title>Преграды, режимы, земли</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800;900&display=swap">
<style>
  /* the same wooden art board as the terrain sheet */
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --gold: #f2c14a; --display: 'Lilita One', 'Alegreya Sans', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; color-scheme: dark; }
  * { box-sizing: border-box; } body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.45; }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 28px 16px 56px; }
  h1 { font: 400 42px var(--display); margin: 0 0 6px; color: #ffe6a8; } h2 { font: 400 28px var(--display); margin: 30px 0 4px; color: #ffe6a8; }
  p { margin: 0 0 12px; color: var(--muted); max-width: 780px; } b { color: var(--ink); }
  .row { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
  figure { margin: 0; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .pic { border-radius: 18px; overflow: hidden; border: 4px solid #1a0e06; line-height: 0; max-width: 340px; }
  canvas { display: block; width: 100%; height: auto; }
  figcaption { font-size: 14px; color: var(--muted); } figcaption b { font: 400 17px var(--display); color: #ffe6a8; display: block; }
</style>
<div class="wrap">
  <h1>Преграды, режимы, земли</h1>
  <p>Ещё четыре преграды, морской десант и вылазки в разную погоду — в том же мультяшном стиле, что «Переправа». Это арт, в бой ещё не встроено.</p>
  <h2>Преграды</h2>
  <p>Каждая ставит свой вопрос: <b>ров</b> — терпеть потери или ждать настил; <b>овраг</b> — обход или мост инженеров; <b>пожар</b> — ждать или обойти (а свой огонь можно пустить на врага); <b>частокол</b> — таран или вылазка внутрь.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="ob1" width="680" height="840" aria-label="Ров с кольями"></canvas></div><figcaption><b>Ров с кольями</b>Пройти можно, но медленно и с потерями. Инженеры кладут настил.</figcaption></figure>
    <figure><div class="pic"><canvas id="ob2" width="680" height="840" aria-label="Овраг"></canvas></div><figcaption><b>Овраг</b>Непроходим. Инженеры перекидывают верёвочный мост.</figcaption></figure>
    <figure><div class="pic"><canvas id="ob3" width="680" height="840" aria-label="Пожар в лесу"></canvas></div><figcaption><b>Горящий лес</b>Прогорает за время. Лучники могут поджечь рощу с врагом.</figcaption></figure>
    <figure><div class="pic"><canvas id="ob4" width="680" height="840" aria-label="Частокол с воротами"></canvas></div><figcaption><b>Частокол с воротами</b>Мини-крепость с башенками. Таран или инженеры.</figcaption></figure>
  </div>
  <h2>Морской десант</h2>
  <p>Бой начинается с моря: корабли с красными парусами подходят к берегу, по трапу высаживаются отряды. <b>Лагеря нет</b> — сначала нужно удержать плацдарм на пляже.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="sea1" width="680" height="840" aria-label="Подход с моря"></canvas></div><figcaption><b>Подход</b>Триремы и лодка с гастатами, на берегу ждёт враг.</figcaption></figure>
    <figure><div class="pic"><canvas id="sea2" width="680" height="840" aria-label="Высадка на пляж"></canvas></div><figcaption><b>Высадка</b>Трап на песок, отряды строятся, лучники врага на бугре.</figcaption></figure>
  </div>
  <h2>Колизей</h2>
  <p>Режим обороны, как в Bad North: наши отряды держат центр арены, а из <b>четырёх ворот</b> выходят волны — гладиаторы, звери. Знак «!» и стрелка за несколько секунд показывают, откуда пойдут. <b>Милость толпы</b> растёт от эффектных приёмов и даёт бонусы.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="ar1" width="680" height="840" aria-label="Колизей"></canvas></div><figcaption><b>Бой на арене</b>Гастаты против гладиаторов и льва.</figcaption></figure>
    <figure><div class="pic"><canvas id="ar2" width="680" height="840" aria-label="Милость толпы"></canvas></div><figcaption><b>Оборона центра</b>Волна 3 из 6: открытые ворота, стрелки атак, шкала толпы.</figcaption></figure>
  </div>
  <h2>Восстание</h2>
  <p>Тоже оборона: мятежники (оранжевые, с вилами и факелами) идут волнами с разных сторон на <b>виллу наместника</b>. Отбить все волны — провинция успокоится.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="rv1" width="680" height="840" aria-label="Восстание"></canvas></div><figcaption><b>Провинция горит</b>Пока восстание идёт, доход провинции стоит.</figcaption></figure>
    <figure><div class="pic"><canvas id="rv2" width="680" height="840" aria-label="Подавление"></canvas></div><figcaption><b>Удержать виллу</b>Волна 2 из 5, атаки с запада, востока и юга.</figcaption></figure>
  </div>
  <h2>Земли кампаний</h2>
  <p>Каждая кампания — свой облик поля боя: цвет травы, деревья, особая местность.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="bi1" width="680" height="480" aria-label="Италия и Галлия"></canvas></div><figcaption><b>Италия · Галлия</b>Сочные луга, рощи, деревни.</figcaption></figure>
    <figure><div class="pic"><canvas id="bi2" width="680" height="480" aria-label="Германия"></canvas></div><figcaption><b>Германия</b>Тёмный густой лес и туман — Тевтобург.</figcaption></figure>
    <figure><div class="pic"><canvas id="bi3" width="680" height="480" aria-label="Иберия"></canvas></div><figcaption><b>Иберия</b>Сухие холмы, оливы, камни.</figcaption></figure>
    <figure><div class="pic"><canvas id="bi4" width="680" height="480" aria-label="Британия"></canvas></div><figcaption><b>Британия</b>Вересковые пустоши, валуны, вечная дымка.</figcaption></figure>
    <figure><div class="pic"><canvas id="bi5" width="680" height="480" aria-label="Греция"></canvas></div><figcaption><b>Греция</b>Оливы, белые колонны, море рядом.</figcaption></figure>
    <figure><div class="pic"><canvas id="bi6" width="680" height="480" aria-label="Дунай"></canvas></div><figcaption><b>Дунай</b>Жёлтая степь и широкая река.</figcaption></figure>
  </div>
  <h2>Вылазки и погода</h2>
  <p>Одна и та же вылазка в шесть погод. Погода не только красит сцену, но и меняет правила.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="wx1" width="680" height="840" aria-label="Ясно"></canvas></div><figcaption><b>Ясно</b>Базовые правила.</figcaption></figure>
    <figure><div class="pic"><canvas id="wx6" width="680" height="840" aria-label="Жара"></canvas></div><figcaption><b>Жара</b>Марево, трещины, слепящее солнце. Тяжёлая пехота устаёт, отдых у воды и в тени.</figcaption></figure>
    <figure><div class="pic"><canvas id="wx2" width="680" height="840" aria-label="Дождь"></canvas></div><figcaption><b>Дождь</b>Косые струи, лужи. Луки слабее, броды глубже.</figcaption></figure>
    <figure><div class="pic"><canvas id="wx3" width="680" height="840" aria-label="Туман"></canvas></div><figcaption><b>Туман</b>Клочья тумана, враг виден только вблизи — время засад.</figcaption></figure>
    <figure><div class="pic"><canvas id="wx4" width="680" height="840" aria-label="Снег"></canvas></div><figcaption><b>Снег</b>Сугробы и снежинки, все идут медленнее.</figcaption></figure>
    <figure><div class="pic"><canvas id="wx5" width="680" height="840" aria-label="Ночь"></canvas></div><figcaption><b>Ночь</b>Темно, свет только у факелов врага — тихая вылазка.</figcaption></figure>
  </div>
</div>
<script>
'use strict';
${helpers}
${ban}
${art}
${tsheet}
${hillFn}
${stakeFn}
const go = () => {
${draw}
};
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load('900 20px "Lilita One"'), document.fonts.load('800 12px "Alegreya Sans"')]).catch(() => 0) : Promise.resolve()).then(go);
</script>
`;
fs.writeFileSync(path.join(__dirname, 'extras.html'), html);
console.log('ok', html.length);
