// Builds terrain.html: an art sheet of rubble, mountains and swamp in the cartoon style, with their in-battle UI.
const fs = require('fs'), path = require('path');
const gen = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
const js = gen.slice(gen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, gen.indexOf('`;\nconst html'));
const helpers = js.slice(0, js.indexOf('function drawWorld(g) {'));
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
const between = (src, a, b) => src.slice(src.indexOf(a), src.indexOf(b, src.indexOf(a)));
const ban = between(cas, 'const BAN = {', 'const REFILL'), art = between(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const sheet = String.raw`
// ---------------------------------------------------------------- rubble: boulders and logs across the road
function rubble(g, x, y, state) {
  if (state === 2) { for (const [dx, dy, s] of [[-58, 14, 0.8], [56, 10, 0.9], [-48, -16, 0.6], [62, -14, 0.7]]) boulder(g, x + dx, y + dy, s); rr(g, x + 40, y + 24, 46, 10, 5); fo(g, '#8a5a30', 2.2); return; }
  g.fillStyle = 'rgba(20,40,10,.32)'; g.beginPath(); g.ellipse(x + 8, y + 16, 66, 16, 0, 0, 7); g.fill();
  g.save(); g.translate(x - 6, y + 4); g.rotate(-0.25); rr(g, -48, -7, 96, 14, 7); fo(g, '#9a6234', 2.6); g.fillStyle = '#c48a4a'; g.beginPath(); g.ellipse(48, 0, 5, 7, 0, 0, 7); g.fill(); g.restore();
  for (const [dx, dy, s] of [[-34, 6, 1.1], [26, 8, 1.25], [-4, -6, 1.35], [44, -8, 0.9], [-50, -6, 0.8], [8, 14, 0.9]].sort((a, b) => a[1] - b[1])) boulder(g, x + dx, y + dy, s);
  g.save(); g.translate(x + 14, y - 14); g.rotate(0.35); rr(g, -36, -6, 72, 12, 6); fo(g, '#8a5a30', 2.4); g.restore();
}
function boulder(g, x, y, s) { g.beginPath(); g.moveTo(x - 18 * s, y + 8 * s); g.lineTo(x - 15 * s, y - 8 * s); g.lineTo(x - 2 * s, y - 16 * s); g.lineTo(x + 14 * s, y - 9 * s); g.lineTo(x + 18 * s, y + 6 * s); g.closePath(); fo(g, '#b4aa9a', 2.6);
  g.beginPath(); g.moveTo(x - 2 * s, y - 16 * s); g.lineTo(x + 14 * s, y - 9 * s); g.lineTo(x + 18 * s, y + 6 * s); g.lineTo(x + 2 * s, y + 8 * s); g.closePath(); g.fillStyle = '#8a8070'; g.fill();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(x - 8 * s, y - 8 * s, 5 * s, 2.5 * s, -0.4, 0, 7); g.fill(); }
// ---------------------------------------------------------------- mountains: a ridge of cartoon peaks with snow caps, impassable
function peak(g, x, y, w, h, snow) {
  g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 10, y + 4, w * 0.62, 12, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w * 0.08, y - h); g.lineTo(x + w * 0.06, y - h * 0.94); g.lineTo(x + w / 2, y); g.closePath(); fo(g, '#a59a8c', 3);
  g.beginPath(); g.moveTo(x - w * 0.08, y - h); g.lineTo(x + w * 0.06, y - h * 0.94); g.lineTo(x + w / 2, y); g.lineTo(x + w * 0.02, y); g.closePath(); g.fillStyle = '#7a7064'; g.fill();
  g.strokeStyle = 'rgba(60,50,40,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - w * 0.2, y - h * 0.45); g.lineTo(x - w * 0.12, y - h * 0.25); g.moveTo(x + w * 0.18, y - h * 0.4); g.lineTo(x + w * 0.24, y - h * 0.2); g.stroke();
  if (snow) { g.beginPath(); g.moveTo(x - w * 0.08, y - h); g.lineTo(x - w * 0.22, y - h * 0.62); g.lineTo(x - w * 0.12, y - h * 0.68); g.lineTo(x - w * 0.04, y - h * 0.58); g.lineTo(x + w * 0.06, y - h * 0.7); g.lineTo(x + w * 0.16, y - h * 0.6); g.lineTo(x + w * 0.06, y - h * 0.94); g.closePath(); fo(g, '#fbfdff', 2.6); g.beginPath(); g.moveTo(x + w * 0.06, y - h * 0.94); g.lineTo(x + w * 0.16, y - h * 0.6); g.lineTo(x + w * 0.04, y - h * 0.66); g.closePath(); g.fillStyle = '#d6e4f0'; g.fill(); }
  g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w * 0.08, y - h); g.lineTo(x + w * 0.06, y - h * 0.94); g.lineTo(x + w / 2, y); g.strokeStyle = OL; g.lineWidth = 3; g.stroke();
}
// ---------------------------------------------------------------- swamp: murky pools, reeds, lily pads, bubbles
function swamp(g, x, y, rx, ry, seed) {
  blob(g, x, y, rx + 10, ry + 8, seed, 14); g.fillStyle = '#6a8a3a'; g.fill();
  blob(g, x, y, rx, ry, seed + 1, 14); const sg = g.createLinearGradient(0, y - ry, 0, y + ry); sg.addColorStop(0, '#5f7a46'); sg.addColorStop(1, '#3f5a34'); fo(g, sg, 2.6);
  g.strokeStyle = 'rgba(200,230,150,.45)'; g.lineWidth = 2.5; g.lineCap = 'round'; for (let k = 0; k < 5; k++) { const wx = x - rx * 0.6 + k * rx * 0.3, wy = y - ry * 0.3 + (k % 2) * ry * 0.4; g.beginPath(); g.moveTo(wx, wy); g.quadraticCurveTo(wx + 8, wy - 4, wx + 16, wy); g.stroke(); }
  for (const [dx, dy] of [[-0.4, 0.2], [0.35, -0.25], [0.1, 0.4]]) { const px = x + dx * rx, py = y + dy * ry; g.beginPath(); g.ellipse(px, py, 11, 6, 0.3, 0.4, Math.PI * 2 - 0.2); g.lineTo(px, py); g.closePath(); fo(g, '#7cc04a', 2); }
  g.fillStyle = '#ff8ab0'; g.beginPath(); g.arc(x + 0.1 * rx + 4, y + 0.4 * ry - 3, 3, 0, 7); g.fill();
  for (const [dx, dy, r] of [[-0.2, -0.1, 3], [0.5, 0.2, 2.4], [0.2, -0.45, 2]]) { g.beginPath(); g.arc(x + dx * rx, y + dy * ry, r, 0, 7); g.strokeStyle = 'rgba(230,250,200,.8)'; g.lineWidth = 1.6; g.stroke(); }
  for (const [dx, dy] of [[-0.95, -0.2], [-0.85, 0.35], [0.9, 0.1], [0.75, -0.55], [-0.5, -0.8], [0.3, 0.85]]) reeds(g, x + dx * rx, y + dy * ry);
}
function reeds(g, x, y) { for (const [dx, h, a] of [[-5, 26, -0.15], [0, 32, 0], [5, 24, 0.18]]) { g.save(); g.translate(x + dx, y); g.rotate(a); g.strokeStyle = OL; g.lineWidth = 4.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -h); g.stroke(); g.strokeStyle = '#5a9a34'; g.lineWidth = 2.4; g.stroke(); rr(g, -3, -h - 8, 6, 12, 3); fo(g, '#8a5a30', 1.8); g.restore(); } }
// ---------------------------------------------------------------- UI pieces
function plate(g, x, y, text, sub, col) { g.font = '900 15px "Lilita One", sans-serif'; const w = Math.max(g.measureText(text).width, sub ? g.measureText(sub).width * 0.8 : 0) + 24, h = sub ? 42 : 26;
  rr(g, x - w / 2, y - h, w, h, 13); g.fillStyle = 'rgba(40,24,14,.94)'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = col || '#f2c14a'; g.stroke();
  g.fillStyle = '#ffe6a8'; g.textAlign = 'center'; g.fillText(text, x, y - h + 18); if (sub) { g.font = '800 12px "Alegreya Sans", sans-serif'; g.fillStyle = '#e2c9a0'; g.fillText(sub, x, y - 9); } }
function bar(g, x, y, w, p) { rr(g, x - w / 2, y, w, 10, 5); g.fillStyle = OL; g.fill(); rr(g, x - w / 2 + 2, y + 2, (w - 4) * p, 6, 3); g.fillStyle = '#ffcc33'; g.fill(); }
function badge(g, x, y, r, col, draw) { g.beginPath(); g.arc(x, y, r, 0, 7); fo(g, col, 3); g.save(); g.beginPath(); g.arc(x, y, r - 4, 0, 7); g.clip(); draw(); g.restore(); g.beginPath(); g.arc(x, y, r - 4, 0, 7); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.stroke(); }
function noEntry(g, x, y) { g.beginPath(); g.arc(x, y, 15, 0, 7); fo(g, '#ff4a3a', 2.8); g.strokeStyle = '#fff'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y + 6); g.moveTo(x + 6, y - 6); g.lineTo(x - 6, y + 6); g.stroke(); }
function panel(id, title) { const c = document.getElementById(id), g = c.getContext('2d'); g.scale(2, 2); const r = rng(id.length * 31); grass(g, 0, 0, 340, 420, '#76c64a', r); return { g, r }; }

// ---------------------------------------------------------------- 1. rubble in three states
{ const { g } = panel('rb1');
  path(g, [[170, 420], [170, 0]], 40); rubble(g, 170, 200, 0); noEntry(g, 232, 150);
  plate(g, 170, 120, 'Завал', 'разбирают только инженеры', '#ff8a6a');
  squad(g, 150, 330, 'hastati', 1, 4, 1, '#e2382c', 'vex'); }
{ const { g } = panel('rb2');
  path(g, [[170, 420], [170, 0]], 40); rubble(g, 170, 200, 0);
  plate(g, 170, 116, '🔨 Расчистка', '3 с из 5', '#f2c14a'); bar(g, 170, 124, 120, 0.4);
  for (const [x, y] of [[132, 224], [210, 222]]) { g.fillStyle = '#ffe6a8'; g.font = '900 18px sans-serif'; g.textAlign = 'center'; g.fillText('✦', x, y - 30); }
  squad(g, 170, 270, 'eng', 1, 3, 1, '#f09a24', 'square'); }
{ const { g } = panel('rb3');
  path(g, [[170, 420], [170, 0]], 40); rubble(g, 170, 200, 2);
  plate(g, 170, 120, 'Путь открыт', '', '#7ee05a');
  squad(g, 170, 230, 'hastati', 1, 5, 1, '#e2382c', 'vex'); }

// ---------------------------------------------------------------- 2. mountains: a range with a pass, and the selection overlay
{ const { g } = panel('mt1');
  path(g, [[170, 420], [170, 260], [176, 170], [170, 0]], 34);
  for (const [x, y, w, h, s] of [[40, 150, 130, 120, true], [110, 130, 110, 96, false], [270, 140, 140, 130, true], [330, 170, 100, 80, false], [60, 230, 100, 70, false], [290, 236, 96, 66, false]].sort((a, b) => a[1] - b[1])) peak(g, x, y, w, h, s);
  plate(g, 170, 330, 'Горы', 'не пройти · обход по перевалу', '#f2c14a');
  squad(g, 170, 390, 'velites', 1, 4, 1, '#2fa04e', 'pennant'); }
{ const { g } = panel('mt2');
  path(g, [[170, 420], [170, 260], [176, 170], [170, 0]], 34);
  const P = [[40, 150, 130, 120, true], [110, 130, 110, 96, false], [270, 140, 140, 130, true], [330, 170, 100, 80, false], [60, 230, 100, 70, false], [290, 236, 96, 66, false]];
  for (const [x, y, w, h, s] of P.sort((a, b) => a[1] - b[1])) peak(g, x, y, w, h, s);
  g.fillStyle = 'rgba(30,20,40,.5)'; for (const [x, y, w, h] of P) { g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w * 0.08, y - h); g.lineTo(x + w / 2, y); g.closePath(); g.fill(); }
  g.save(); g.setLineDash([10, 7]); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(130, 420); g.lineTo(140, 250); g.quadraticCurveTo(150, 170, 140, 60); g.moveTo(210, 420); g.lineTo(206, 250); g.quadraticCurveTo(200, 170, 210, 60); g.stroke(); g.restore();
  g.save(); g.setLineDash([2, 12]); g.lineCap = 'round'; g.strokeStyle = '#fff'; g.lineWidth = 7; g.beginPath(); g.moveTo(170, 380); g.lineTo(172, 250); g.lineTo(176, 120); g.stroke(); g.restore();
  g.beginPath(); g.ellipse(176, 110, 20, 10, 0, 0, 7); g.strokeStyle = OL; g.lineWidth = 5; g.stroke(); g.strokeStyle = '#ffcc33'; g.lineWidth = 3; g.stroke();
  g.beginPath(); g.ellipse(170, 392, 42, 18, 0, 0, 7); g.strokeStyle = OL; g.lineWidth = 7; g.stroke(); g.strokeStyle = '#ffcc33'; g.lineWidth = 4; g.stroke();
  squad(g, 170, 390, 'velites', 1, 4, 1, '#2fa04e', 'pennant');
  plate(g, 170, 330, '⏳ Тит · куда идти?', '', '#f2c14a'); }

// ---------------------------------------------------------------- 3. swamp: slows everyone, hides archers
{ const { g } = panel('sw1');
  swamp(g, 120, 160, 96, 60, 3); swamp(g, 250, 280, 80, 52, 7);
  grove(g, 300, 96, 56, 40, 9, 4); grove(g, 50, 330, 60, 44, 10, 8);
  plate(g, 170, 405, 'Болото', '', '#9fe08a'); }
{ const { g } = panel('sw2');
  swamp(g, 170, 210, 130, 82, 5);
  // a squad wading: the legs are hidden under the water line
  g.save(); g.beginPath(); g.rect(0, 0, 340, 234); g.clip(); squad(g, 150, 240, 'hastati', 1, 4, 1, '#e2382c', 'vex'); g.restore();
  g.strokeStyle = 'rgba(220,240,180,.95)'; g.lineWidth = 3; for (const [x, y] of [[140, 236], [162, 236], [130, 228], [172, 228]]) { g.beginPath(); g.ellipse(x, y, 13, 4, 0, 0, 7); g.stroke(); }
  g.strokeStyle = 'rgba(220,240,180,.6)'; g.lineWidth = 2; g.beginPath(); g.ellipse(150, 236, 44, 10, 0, 0, 7); g.stroke();
  plate(g, 170, 98, '🐌 Вязко', 'скорость −50%', '#9fe08a'); }
{ const { g } = panel('sw3');
  swamp(g, 170, 200, 130, 82, 9);
  g.save(); g.globalAlpha = 0.55; squad(g, 170, 220, 'velites', 1, 4, 1, '#2fa04e', 'pennant'); g.restore();
  for (const [x, y] of [[96, 230], [244, 200], [200, 150]]) reeds(g, x, y);
  plate(g, 170, 98, '🌾 Засада', 'лучников не видно издалека', '#9fe08a'); }

// ---------------------------------------------------------------- 4. forest: groves, and a squad hiding in one
{ const { g } = panel('fo1'); path(g, [[170, 420], [170, 0]], 30); grove(g, 74, 140, 74, 56, 13, 2); grove(g, 268, 250, 70, 54, 12, 6); grove(g, 90, 340, 60, 40, 8, 9); plate(g, 170, 405, 'Лес', '', '#7ee05a'); }
{ const { g } = panel('fo2'); grove(g, 170, 200, 130, 92, 22, 11);
  g.save(); g.globalAlpha = 0.6; squad(g, 160, 236, 'velites', 1, 4, 1, '#2fa04e', 'pennant'); g.restore();
  for (const [x, y, k, s] of [[110, 262, 0.7, 0.3], [212, 268, 0.75, 0.7], [160, 284, 0.68, 0.5]]) tree(g, x, y, k, s);
  plate(g, 170, 96, '🌲 Укрытие', 'стрелы −20%, враг не видит издалека', '#7ee05a'); }
// ---------------------------------------------------------------- 5. mounds: a raised grassy top over an earthen slope
function hill(g, x, y, rx, ry, h, top) {
  g.fillStyle = 'rgba(20,40,10,.32)'; g.beginPath(); g.ellipse(x + 10, y + h + ry * 0.55, rx * 1.05, ry * 0.6, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(x, y + h, rx, ry, 0, 0, Math.PI); g.lineTo(x - rx, y); g.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); g.closePath();
  const eg = g.createLinearGradient(0, y, 0, y + h + ry); eg.addColorStop(0, '#b47a46'); eg.addColorStop(1, '#7a4a2a'); fo(g, eg, 2.8);
  g.strokeStyle = 'rgba(70,40,20,.5)'; g.lineWidth = 2; for (let k = -3; k <= 3; k++) { const px = x + k * rx * 0.26; g.beginPath(); g.moveTo(px, y + ry * Math.sqrt(Math.max(0, 1 - (k * 0.26) ** 2)) + 4); g.lineTo(px + k * 2, y + h + ry * Math.sqrt(Math.max(0, 1 - (k * 0.26) ** 2)) - 4); g.stroke(); }
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); const tg = g.createLinearGradient(0, y - ry, 0, y + ry); tg.addColorStop(0, top ? top[0] : '#b2e86e'); tg.addColorStop(1, top ? top[1] : '#7ec84c'); fo(g, tg, 2.8);
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.95); g.strokeStyle = 'rgba(255,255,220,.75)'; g.lineWidth = 3; g.stroke();
}
function tuft(g, x, y) { g.strokeStyle = 'rgba(40,110,30,.7)'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x - 1, y - 6); g.moveTo(x + 1, y); g.lineTo(x + 3, y - 7); g.stroke(); }
function stake(g, x, y) { g.beginPath(); g.moveTo(x - 4, y + 4); g.lineTo(x - 3, y - 14); g.lineTo(x, y - 20); g.lineTo(x + 3, y - 14); g.lineTo(x + 4, y + 4); g.closePath(); fo(g, '#b0783e', 2); }
function menhir(g, x, y, h) { g.beginPath(); g.moveTo(x - 8, y); g.lineTo(x - 6, y - h); g.quadraticCurveTo(x, y - h - 8, x + 6, y - h + 2); g.lineTo(x + 8, y); g.closePath(); fo(g, '#b8b0a2', 2.4); g.beginPath(); g.moveTo(x + 1, y - h - 2); g.lineTo(x + 6, y - h + 2); g.lineTo(x + 8, y); g.lineTo(x + 1, y); g.closePath(); g.fillStyle = '#8f8778'; g.fill(); }
const MOUNDS = [
  ['mo1', 'Травяной холм', 'Простой бугор: лучники бьют дальше, пехоте тяжелее штурмовать вверх.', g => { hill(g, 170, 190, 110, 60, 34); for (const [dx, dy] of [[-40, -10], [30, 14], [10, -30], [-60, 20], [64, -6]]) tuft(g, 170 + dx, 190 + dy); }],
  ['mo2', 'Каменистый', 'Валуны на макушке — укрытие: стрелы по стоящим на нём бьют слабее.', g => { hill(g, 170, 196, 110, 58, 38, ['#c4d890', '#98b866']); for (const [dx, dy, s] of [[-50, -4, 1], [44, 6, 1.2], [-6, -26, 0.9], [20, 26, 0.8], [-34, 26, 0.7]].sort((a, b) => a[1] - b[1])) boulder(g, 170 + dx, 196 + dy, s); }],
  ['mo3', 'Двухъярусный', 'Высокий бугор в два уступа, с тропой: сверху видно дальше всех.', g => { hill(g, 170, 220, 120, 62, 26); hill(g, 182, 172, 76, 40, 30, ['#c2f07a', '#8ed256']); path(g, [[96, 240], [128, 208], [146, 196], [170, 180]], 14); }],
  ['mo4', 'С рощицей', 'Деревья на вершине прячут отряд: засада с высоты.', g => { hill(g, 170, 200, 112, 58, 32); grove(g, 162, 192, 70, 34, 9, 5); }],
  ['mo5', 'Укреплённый', 'Частокол по краю: держать долго, но выйти можно только через проём.', g => { hill(g, 170, 200, 114, 60, 34, ['#c8d886', '#a4c068']); for (let a = 200; a <= 520; a += 16) { if (Math.abs(a - 450) < 14) continue; const rd = a * Math.PI / 180; stake(g, 170 + Math.cos(rd) * 104, 200 + Math.sin(rd) * 52); } }],
  ['mo6', 'Древние камни', 'Святилище на холме: бонус к духу, пока стоишь рядом (идея на будущее).', g => { hill(g, 170, 200, 110, 58, 34, ['#bde27a', '#86c650']); for (const [dx, dy, h] of [[-56, 0, 30], [-24, -26, 36], [20, -28, 34], [56, -2, 30], [30, 24, 28], [-30, 24, 26]].sort((a, b) => a[1] - b[1])) menhir(g, 170 + dx, 200 + dy, h); }]
];
for (const [id, name, , draw] of MOUNDS) { const { g } = panel(id); draw(g); plate(g, 170, 400, name, '', '#a6e06a'); }
{ const { g } = panel('mo7'); hill(g, 170, 230, 100, 52, 34);
  g.save(); g.setLineDash([12, 8]); g.strokeStyle = 'rgba(255,255,230,.95)'; g.lineWidth = 3; g.beginPath(); g.ellipse(170, 216, 150, 90, 0, 0, 7); g.stroke(); g.restore();
  g.save(); g.setLineDash([4, 8]); g.strokeStyle = 'rgba(255,220,90,.8)'; g.lineWidth = 3; g.beginPath(); g.ellipse(170, 216, 112, 66, 0, 0, 7); g.stroke(); g.restore();
  squad(g, 160, 228, 'velites', 1, 4, 1, '#2fa04e', 'pennant');
  plate(g, 170, 92, '⛰ Дальность +35%', 'жёлтый — обычная, белый — с бугра', '#a6e06a'); }
// ---------------------------------------------------------------- legend badges, as they appear in tooltips and the help
{ const c = document.getElementById('icons'), g = c.getContext('2d'); g.scale(2, 2); g.fillStyle = '#3a2414'; g.fillRect(0, 0, 900, 150);
  const items = [['Завал', '#c8b8a0', () => { boulder(g, 52, 70, 1.3); }], ['Горы', '#9fd0f0', () => { peak(g, 172, 92, 70, 60, true); }], ['Болото', '#7cc04a', () => { swamp(g, 292, 66, 34, 20, 4); }],
    ['Брод', '#5fd0f5', () => { for (const [x, y] of [[400, 60], [420, 74], [410, 50]]) stone(g, x, y, 0.8); }], ['Мост', '#c48a4a', () => { for (let k = 0; k < 5; k++) { rr(g, 512 + k * 9, 50, 8, 34, 2); fo(g, '#c48a4a', 1.6); } }],
    ['Лес', '#4fbf4a', () => { for (const [x, y, k, s] of [[640, 82, 0.6, 0.2], [668, 86, 0.66, 0.8], [652, 104, 0.72, 0.5]]) tree(g, x, y, k, s); }], ['Бугор', '#a6e06a', () => { blob(g, 772, 68, 30, 18, 2, 10); fo(g, '#a6e06a', 2.4); }]];
  items.forEach(([name, col, draw], i) => { const x = 52 + i * 120; badge(g, x, 64, 44, col, draw); g.fillStyle = '#ffe6a8'; g.font = '900 16px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText(name, x, 134); }); }
`;
const html = `<title>Завал, горы, болото</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800;900&display=swap">
<style>
  /* an art sheet on a wooden table: three rows of cartoon vignettes and a strip of legend badges */
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --gold: #f2c14a; --display: 'Lilita One', 'Alegreya Sans', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; color-scheme: dark; }
  * { box-sizing: border-box; } body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.45; }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 28px 16px 56px; }
  h1 { font: 400 42px var(--display); margin: 0 0 6px; color: #ffe6a8; } h2 { font: 400 28px var(--display); margin: 30px 0 4px; color: #ffe6a8; }
  p { margin: 0 0 12px; color: var(--muted); max-width: 760px; } b { color: var(--ink); }
  .row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  @media (max-width: 760px) { .row { grid-template-columns: minmax(0, 1fr); } }
  figure { margin: 0; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .pic { border-radius: 18px; overflow: hidden; border: 4px solid #1a0e06; line-height: 0; max-width: 340px; }
  canvas { display: block; width: 100%; height: auto; }
  figcaption { font-size: 14px; color: var(--muted); } figcaption b { font: 400 17px var(--display); color: #ffe6a8; display: block; }
  .pick { cursor: pointer; position: relative; border-radius: 22px; padding: 6px; transition: transform .12s; }
  .pick:hover { transform: translateY(-3px); }
  .pick .pic { transition: box-shadow .12s, border-color .12s; }
  .pick.on .pic { border-color: #ffcc33; box-shadow: 0 0 0 4px #ffcc33, 0 0 22px rgba(255,204,51,.55); }
  .pick.on::after { content: '✓'; position: absolute; top: 14px; right: 14px; width: 40px; height: 40px; border-radius: 50%; background: #ffcc33; border: 3px solid #2b1a10; color: #2b1a10; font: 400 24px var(--display); display: flex; align-items: center; justify-content: center; }
  .pick:focus-visible { outline: 3px solid #fff; }
  .chosen { margin-top: 14px; padding: 12px 16px; border-radius: 16px; background: #3a2414; border: 2.5px solid var(--gold); color: #ffe6a8; font-weight: 800; max-width: 760px; }
  .strip { border-radius: 18px; overflow: hidden; border: 4px solid #1a0e06; line-height: 0; margin-top: 10px; }
</style>
<div class="wrap">
  <h1>Завал, горы, болото</h1>
  <p>Три вида местности для «Переправы» в мультяшном стиле: как они выглядят на карте и что видит игрок, когда выбирает отряд. Это арт-макет, в бой ещё не встроено.</p>
  <h2>Завал</h2>
  <p>Камни и брёвна поперёк дороги. Пройти нельзя, пока <b>инженеры</b> не разберут. Обычный отряд, которому дали сюда приказ, получит подсказку.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="rb1" width="680" height="840" aria-label="Завал закрыт"></canvas></div><figcaption><b>Закрыт</b>Красный знак и плашка: «разбирают только инженеры».</figcaption></figure>
    <figure><div class="pic"><canvas id="rb2" width="680" height="840" aria-label="Расчистка"></canvas></div><figcaption><b>Инженеры работают</b>Плашка с молотком и полоской прогресса, искры над камнями.</figcaption></figure>
    <figure><div class="pic"><canvas id="rb3" width="680" height="840" aria-label="Путь открыт"></canvas></div><figcaption><b>Расчищено</b>Камни отброшены на обочину, зелёная плашка «путь открыт» на пару секунд.</figcaption></figure>
  </div>
  <h2>Горы</h2>
  <p>Хребет из пиков со снежными шапками. <b>Непроходимы</b> совсем, зато закрывают фланги и делают перевал узким местом.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="mt1" width="680" height="840" aria-label="Горы и перевал"></canvas></div><figcaption><b>Горы и перевал</b>Тропа идёт через узкий проход между пиками.</figcaption></figure>
    <figure><div class="pic"><canvas id="mt2" width="680" height="840" aria-label="Горы при выборе отряда"></canvas></div><figcaption><b>При выборе отряда</b>Пики затемнены, белая граница — коридор перевала, пунктир — путь.</figcaption></figure>
  </div>
  <h2>Болото</h2>
  <p>Мутная вода, камыш, кувшинки. Проходимо, но <b>вязко</b>: все идут вдвое медленнее, зато <b>лучники в камышах</b> не видны издалека — место для засады.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="sw1" width="680" height="840" aria-label="Болото"></canvas></div><figcaption><b>На карте</b>Два топких пятна у леса.</figcaption></figure>
    <figure><div class="pic"><canvas id="sw2" width="680" height="840" aria-label="Отряд в болоте"></canvas></div><figcaption><b>Отряд вброд</b>По щиколотку в воде, круги вокруг ног, плашка «скорость −50%».</figcaption></figure>
    <figure><div class="pic"><canvas id="sw3" width="680" height="840" aria-label="Засада в болоте"></canvas></div><figcaption><b>Засада</b>Лучники в камышах полупрозрачны, враг их не видит.</figcaption></figure>
  </div>
  <h2>Лес</h2>
  <p>Рощи из десятков деревьев на общем подлеске, с кустами по краю. Проходим, но <b>прячет отряд</b>: стрелы бьют слабее, враг не видит издалека.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="fo1" width="680" height="840" aria-label="Рощи"></canvas></div><figcaption><b>Рощи на карте</b>Густые, разной формы, с тропой между ними.</figcaption></figure>
    <figure><div class="pic"><canvas id="fo2" width="680" height="840" aria-label="Отряд в лесу"></canvas></div><figcaption><b>Отряд в роще</b>Полупрозрачен, передние деревья перекрывают его.</figcaption></figure>
  </div>
  <h2>Бугры</h2>
  <p>Шесть вариантов: у всех видна высота — земляной склон под травяной макушкой. Разная макушка даёт разную пользу.</p>
  <div class="row">
    <figure class="pick" data-n="1" tabindex="0" role="button" aria-pressed="false"><div class="pic"><canvas id="mo1" width="680" height="840" aria-label="Травяной холм"></canvas></div><figcaption><b>Травяной</b>Простой бугор: лучники бьют дальше, штурм вверх слабее.</figcaption></figure>
    <figure class="pick" data-n="2" tabindex="0" role="button" aria-pressed="false"><div class="pic"><canvas id="mo2" width="680" height="840" aria-label="Каменистый бугор"></canvas></div><figcaption><b>Каменистый</b>Валуны на макушке — укрытие от стрел.</figcaption></figure>
    <figure class="pick" data-n="3" tabindex="0" role="button" aria-pressed="false"><div class="pic"><canvas id="mo3" width="680" height="840" aria-label="Двухъярусный бугор"></canvas></div><figcaption><b>Двухъярусный</b>Два уступа и тропа, самая дальняя стрельба.</figcaption></figure>
    <figure class="pick" data-n="4" tabindex="0" role="button" aria-pressed="false"><div class="pic"><canvas id="mo4" width="680" height="840" aria-label="Бугор с рощицей"></canvas></div><figcaption><b>С рощицей</b>Деревья прячут отряд — засада с высоты.</figcaption></figure>
    <figure class="pick" data-n="5" tabindex="0" role="button" aria-pressed="false"><div class="pic"><canvas id="mo5" width="680" height="840" aria-label="Укреплённый бугор"></canvas></div><figcaption><b>Укреплённый</b>Частокол с проёмом: держать долго, выйти тяжело.</figcaption></figure>
    <figure class="pick" data-n="6" tabindex="0" role="button" aria-pressed="false"><div class="pic"><canvas id="mo6" width="680" height="840" aria-label="Бугор с древними камнями"></canvas></div><figcaption><b>Древние камни</b>Святилище — место под будущий бонус (дух, лечение).</figcaption></figure>
    <figure><div class="pic"><canvas id="mo7" width="680" height="840" aria-label="Лучники на бугре"></canvas></div><figcaption><b>Лучники на бугре</b>Жёлтое кольцо — обычная дальность, белое — с высоты.</figcaption></figure>
  </div>
  <p class="chosen" id="chosen">Коснитесь вариантов, которые нравятся: можно выбрать несколько.</p>
  <h2>Значки местности</h2>
  <p>Круглые значки для подсказок и справки: сразу видно, что за место.</p>
  <div class="strip"><canvas id="icons" width="1800" height="300" aria-label="Значки местности"></canvas></div>
</div>
<script>
'use strict';
${helpers}
${ban}
${art}
const go = () => {
${sheet}
};
const picks = [...document.querySelectorAll('.pick')], showChosen = () => { const on = picks.filter(p => p.classList.contains('on')).map(p => p.querySelector('figcaption b').textContent); document.getElementById('chosen').textContent = on.length ? 'Вы выбрали: ' + on.join(', ') + '. Напишите мне — добавлю их на карту.' : 'Коснитесь вариантов, которые нравятся: можно выбрать несколько.'; try { localStorage.setItem('mounds', JSON.stringify(picks.map(p => p.classList.contains('on')))); } catch (_) {} };
try { const saved = JSON.parse(localStorage.getItem('mounds') || '[]'); picks.forEach((p, i) => { if (saved[i]) { p.classList.add('on'); p.setAttribute('aria-pressed', 'true'); } }); } catch (_) {}
picks.forEach(p => { const tog = () => { p.classList.toggle('on'); p.setAttribute('aria-pressed', String(p.classList.contains('on'))); showChosen(); }; p.addEventListener('click', tog); p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } }); });
showChosen();
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load('900 20px "Lilita One"'), document.fonts.load('800 12px "Alegreya Sans"')]).catch(() => 0) : Promise.resolve()).then(go);
</script>
`;
fs.writeFileSync(path.join(__dirname, 'terrain.html'), html);
console.log('ok', html.length);
