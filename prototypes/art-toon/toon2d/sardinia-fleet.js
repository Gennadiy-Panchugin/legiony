// Builds sardinia-fleet.html: four art concepts for the global "landing" screen (Ostia -> Sardinia), 540x960 phone screens.
const fs = require('fs'), path = require('path');
const gen = fs.readFileSync('gen.js', 'utf8');
const jsAll = gen.slice(gen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, gen.indexOf('`;\nconst html'));
const helpers = jsAll.slice(0, jsAll.indexOf('function drawWorld(g) {'));

const own = String.raw`
const W = 540, H = 960, INK = '#1b1a2e';
function txt(g, s, x, y, size, col, al) { g.font = '400 ' + size + 'px "Lilita One", sans-serif'; g.textAlign = al || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = size / 4; g.strokeStyle = INK; g.strokeText(s, x, y); g.fillStyle = col || '#fff3dc'; g.fillText(s, x, y); }
function btn(g, x, y, w, h, label, col) { rr(g, x, y + 5, w, h, 14); g.fillStyle = '#a8761a'; g.fill(); rr(g, x, y, w, h, 14); fo(g, col || '#f2b632', 4); txt(g, label, x + w / 2, y + h / 2 + 1, 26, '#2a1a10'); g.fillStyle = 'rgba(255,255,255,.35)'; rr(g, x + 8, y + 6, w - 16, 8, 4); g.fill(); }
function plankUI(g, x, y, w, h) { rr(g, x, y, w, h, 14); fo(g, '#7a4c26', 4); rr(g, x + 5, y + 5, w - 10, h - 10, 10); g.fillStyle = '#a06a38'; g.fill(); g.strokeStyle = 'rgba(60,30,10,.35)'; g.lineWidth = 2; for (let yy = y + 20; yy < y + h - 8; yy += 22) { g.beginPath(); g.moveTo(x + 8, yy); g.lineTo(x + w - 8, yy); g.stroke(); } }
function ship(g, x, y, s, sail, ang) {
  g.save(); g.translate(x, y); g.rotate(ang || 0); g.scale(s, s);
  for (let yy = -46; yy <= 52; yy += 14) for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 18, yy); g.lineTo(sd * 44, yy + 10); g.strokeStyle = INK; g.lineWidth = 5; g.lineCap = 'round'; g.stroke(); g.strokeStyle = '#e0bd88'; g.lineWidth = 2.4; g.stroke(); }
  g.beginPath(); g.moveTo(0, -80); g.bezierCurveTo(26, -52, 26, 34, 15, 78); g.lineTo(-15, 78); g.bezierCurveTo(-26, 34, -26, -52, 0, -80); g.closePath(); fo(g, '#a8693a', 3.4);
  g.beginPath(); g.moveTo(0, -70); g.bezierCurveTo(18, -48, 18, 34, 10, 68); g.lineTo(-10, 68); g.bezierCurveTo(-18, 34, -18, -48, 0, -70); g.closePath(); fo(g, '#d9a566', 2.4);
  g.beginPath(); g.moveTo(-6, -82); g.lineTo(0, -98); g.lineTo(6, -82); g.closePath(); fo(g, '#c9a14a', 2.4);
  g.beginPath(); g.moveTo(0, -26); g.lineTo(0, 30); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#8a5a30'; g.lineWidth = 3; g.stroke();
  rr(g, -28, -24, 56, 34, 7); fo(g, sail, 3); g.fillStyle = '#f7ebc8'; g.fillRect(-28, -12, 56, 8); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(-28, -12, 56, 8);
  g.restore();
}
function wake(g, x, y, s, len) { g.save(); g.translate(x, y); g.scale(s, s); for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 12, 70); g.quadraticCurveTo(sd * 26, 70 + len * 0.5, sd * 52, 70 + len); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 6; g.lineCap = 'round'; g.stroke(); } g.beginPath(); g.moveTo(0, 74); g.lineTo(0, 74 + len * 0.8); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 14; g.stroke(); g.restore(); }
function ticks(g, r, n, y0, y1, col, a) { g.strokeStyle = col; g.globalAlpha = a; g.lineWidth = 3; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const x = r() * W, y = y0 + r() * (y1 - y0); g.beginPath(); g.moveTo(x - 12, y); g.lineTo(x, y + 6); g.lineTo(x + 12, y); g.stroke(); } g.globalAlpha = 1; }
function island(g, x, y, rx, ry, seed, grass, rock) { blob(g, x, y + 7, rx + 4, ry + 4, seed, 12); g.fillStyle = 'rgba(0,30,60,.3)'; g.fill(); blob(g, x, y, rx, ry, seed, 12); fo(g, '#e9d49a', 4); blob(g, x, y - 3, rx * 0.86, ry * 0.84, seed + 1, 12); fo(g, grass, 3); for (let k = 0; k < 4; k++) { const a = k * 1.7 + seed; const px = x + Math.cos(a) * rx * 0.35, py = y + Math.sin(a) * ry * 0.3; g.beginPath(); g.moveTo(px - 18, py + 8); g.lineTo(px - 4, py - 20); g.lineTo(px + 6, py - 12); g.lineTo(px + 20, py + 8); g.closePath(); fo(g, rock, 2.6); } }
function port(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = 'rgba(0,30,60,.3)'; g.beginPath(); g.ellipse(6, 8, 70, 20, 0, 0, 7); g.fill(); rr(g, -62, -10, 124, 20, 8); fo(g, '#c98a52', 3.4); for (const dx of [-40, 0, 40]) { rr(g, dx - 18, -40, 36, 32, 4); fo(g, '#e07a50', 3); g.beginPath(); g.moveTo(dx - 22, -40); g.lineTo(dx, -58); g.lineTo(dx + 22, -40); g.closePath(); fo(g, '#b0483a', 3); } rr(g, 52, -72, 18, 64, 4); fo(g, '#f4eee0', 3); rr(g, 49, -84, 24, 14, 4); fo(g, '#f2b632', 3); g.restore(); }
function compass(g, x, y, r) { g.save(); g.translate(x, y); g.beginPath(); g.arc(0, 0, r, 0, 7); fo(g, '#f7ebc8', 3.4); for (let k = 0; k < 4; k++) { g.save(); g.rotate(k * Math.PI / 2); g.beginPath(); g.moveTo(0, -r * 1.25); g.lineTo(r * 0.22, 0); g.lineTo(-r * 0.22, 0); g.closePath(); fo(g, k ? '#7a4c26' : '#d9402b', 2.6); g.restore(); } txt(g, 'С', 0, -r * 1.45, 18, '#fff3dc'); g.restore(); }
function routeDash(g, pts, col, w) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash([2, 16]); g.lineWidth = w + 6; g.strokeStyle = INK; g.stroke(); g.lineWidth = w; g.strokeStyle = col; g.stroke(); g.setLineDash([]); }
function anchorDot(g, x, y) { g.beginPath(); g.arc(x, y, 11, 0, 7); fo(g, '#f7ebc8', 3.4); g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x, y + 6); g.moveTo(x - 5, y + 2); g.quadraticCurveTo(x, y + 9, x + 5, y + 2); g.strokeStyle = INK; g.lineWidth = 2.4; g.stroke(); }
function slots(g, x, y, w, n, labels) { const cw = (w - (n - 1) * 8) / n; for (let i = 0; i < n; i++) { rr(g, x + i * (cw + 8), y, cw, 78, 10); fo(g, '#3a2414', 3.4); rr(g, x + i * (cw + 8) + 4, y + 4, cw - 8, 70, 7); g.fillStyle = '#5a3a20'; g.fill(); ship(g, x + i * (cw + 8) + cw / 2, y + 40, 0.3, '#c8372d', 0); txt(g, labels[i], x + i * (cw + 8) + cw / 2, y + 66, 14, '#ffe6a8'); } }
function chip(g, x, y, w, label, col) { rr(g, x, y, w, 34, 17); fo(g, '#3a2414', 3.4); txt(g, label, x + w / 2, y + 18, 18, col || '#ffe6a8'); }

// 1 · captain's parchment chart
function C1(g, t) {
  const r = rng(5); g.fillStyle = '#f0dda8'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(160,110,50,.18)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(r() * W, r() * H, 20 + r() * 40, 8 + r() * 12, 0, 0, 7); g.fill(); }
  g.beginPath(); g.moveTo(20, 110); for (let x = 20; x <= 520; x += 20) g.lineTo(x, 110 + (x % 40 ? 5 : -3)); for (let y = 110; y <= 790; y += 20) g.lineTo(520 + (y % 40 ? -4 : 3), y); for (let x = 520; x >= 20; x -= 20) g.lineTo(x, 790 + (x % 40 ? -3 : 5)); for (let y = 790; y >= 110; y -= 20) g.lineTo(20 + (y % 40 ? 4 : -3), y); g.closePath(); fo(g, '#49b6d6', 5);
  ticks(g, r, 70, 130, 780, '#2b7fa8', 0.9); ticks(g, r, 40, 130, 780, '#ffffff', 0.55);
  island(g, 400, 220, 120, 70, 3, '#7ba83a', '#9a8c76'); island(g, 440, 400, 70, 110, 7, '#7ba83a', '#9a8c76'); txt(g, 'КОРСИКА', 390, 160, 18, '#fff3dc'); txt(g, 'САРДИНИЯ', 452, 400, 20, '#fff3dc');
  // bays marks on Sardinia
  for (const [x, y, c] of [[392, 470, '#6fbf4a'], [472, 504, '#f2b632'], [415, 330, '#d9402b']]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 30); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x + 20, y - 24); g.lineTo(x, y - 16); g.closePath(); fo(g, c, 2.4); }
  port(g, 130, 700, 1); txt(g, 'ОСТИЯ', 130, 745, 22, '#fff3dc');
  const route = [[160, 680], [220, 600], [190, 500], [260, 440], [350, 470], [392, 480]]; routeDash(g, route, '#d9402b', 6); for (const [x, y] of [[190, 500], [260, 440]]) anchorDot(g, x, y);
  ship(g, 215, 603, 0.32, '#c8372d', 0.2); ship(g, 190, 640, 0.26, '#c8372d', 0.2); ship(g, 242, 575, 0.26, '#c8372d', 0.2);
  compass(g, 460, 690, 38);
  // scroll title
  rr(g, 40, 22, 460, 68, 18); fo(g, '#f7ebc8', 4.4); rr(g, 24, 32, 30, 48, 10); fo(g, '#e6cf96', 4); rr(g, 486, 32, 30, 48, 10); fo(g, '#e6cf96', 4); txt(g, 'ДЕСАНТ НА САРДИНИЮ', 270, 50, 30, '#7a2a1a'); txt(g, 'путь: 3 дня · ветер попутный', 270, 76, 17, '#7a4c26');
  plankUI(g, 0, 800, 540, 160); slots(g, 20, 812, 500, 4, ['Трирема', 'Трирема', 'Грузовой', 'Конный']); btn(g, 130, 898, 280, 50, 'ОТПЛЫТЬ');
}
// 2 · fleet from above
function C2(g, t) {
  const r = rng(8); const sg = g.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, '#9fd6e6'); sg.addColorStop(0.18, '#49b6d6'); sg.addColorStop(0.6, '#1f8ab8'); sg.addColorStop(1, '#1f6fa0'); g.fillStyle = sg; g.fillRect(0, 0, W, H);
  ticks(g, r, 90, 140, 900, '#ffffff', 0.4);
  g.globalAlpha = 0.55; island(g, 150, 120, 120, 40, 4, '#8fb870', '#9aa0a8'); island(g, 400, 100, 150, 46, 9, '#8fb870', '#9aa0a8'); g.globalAlpha = 1; g.fillStyle = 'rgba(230,245,250,.5)'; g.fillRect(0, 60, W, 120);
  g.beginPath(); g.moveTo(270, 870); g.bezierCurveTo(240, 700, 330, 520, 280, 200); g.lineCap = 'round'; g.lineWidth = 34; g.strokeStyle = 'rgba(255,210,63,.28)'; g.stroke(); g.lineWidth = 10; g.strokeStyle = 'rgba(255,210,63,.9)'; g.setLineDash([22, 16]); g.stroke(); g.setLineDash([]);
  for (const [x, y, s] of [[290, 420, 0.9], [190, 520, 0.8], [380, 540, 0.8], [250, 650, 0.7], [330, 680, 0.7]]) { wake(g, x, y, s, 130); ship(g, x, y, s, y % 2 ? '#c8372d' : '#f7ebc8', 0.04); }
  // harbour at the bottom
  g.beginPath(); g.moveTo(0, 860); for (let x = 0; x <= W; x += 20) g.lineTo(x, 856 + Math.sin(x * 0.05) * 5); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); fo(g, '#e9d49a', 4.4);
  for (let x = 40; x < 520; x += 70) { rr(g, x - 10, 826, 20, 40, 3); fo(g, '#7a4c26', 3); } for (const [x, y] of [[90, 900], [130, 915], [410, 905], [450, 920]]) { rr(g, x - 14, y - 22, 28, 22, 3); fo(g, '#b88a52', 2.6); }
  rr(g, 24, 20, 492, 56, 14); fo(g, '#3a2414', 4); txt(g, 'Флот: 5 судов · 14 отрядов', 190, 48, 22, '#ffe6a8'); rr(g, 370, 30, 130, 36, 18); fo(g, '#5a3a20', 3); txt(g, '× 1  ▶ ▶', 435, 49, 20);
  for (const [x, y, l] of [[190, 470, 'Трир. 3/4'], [380, 592, 'Конн. 2/2']]) { rr(g, x - 44, y, 88, 24, 12); fo(g, '#3a2414', 3); txt(g, l, x, y + 13, 15, '#ffe6a8'); }
  btn(g, 130, 880, 280, 54, 'К БЕРЕГУ');
}
// 3 · sunset to dawn along the voyage
function C3(g, t) {
  const r = rng(12); const sg = g.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, '#ffc1a0'); sg.addColorStop(0.2, '#59b8d9'); sg.addColorStop(0.42, '#14194a'); sg.addColorStop(0.7, '#3b2a6a'); sg.addColorStop(0.88, '#7a3e8e'); sg.addColorStop(1, '#ff8a4c'); g.fillStyle = sg; g.fillRect(0, 0, W, H);
  g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.beginPath(); g.arc(r() * W, 250 + r() * 260, 1 + r() * 1.8, 0, 7); g.fill(); } g.globalAlpha = 1;
  g.beginPath(); g.arc(110, 330, 34, 0, 7); fo(g, '#f4efc0', 3.4); g.beginPath(); g.arc(122, 322, 30, 0, 7); g.fillStyle = '#14194a'; g.fill();
  ticks(g, r, 80, 250, 940, '#ffffff', 0.25);
  island(g, 330, 120, 190, 54, 3, '#6a9a3a', '#7a7a80'); g.beginPath(); g.moveTo(300, 100); g.lineTo(300, 60); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.beginPath(); g.moveTo(300, 60); g.lineTo(326, 70); g.lineTo(300, 80); g.closePath(); fo(g, '#d9402b', 2.6);
  island(g, 90, 520, 70, 60, 14, '#4a6a3a', '#5a5a64'); txt(g, 'Корсика', 90, 600, 18);
  port(g, 270, 880, 0.9);
  const route = [[270, 840], [330, 760], [230, 660], [310, 560], [250, 440], [330, 330], [300, 190]]; routeDash(g, route, '#ffd23f', 6);
  // storm cloud and events
  for (const [x, y] of [[250, 560], [360, 480], [220, 430]]) { g.beginPath(); g.arc(x, y, 24, 0, 7); g.arc(x + 26, y + 6, 20, 0, 7); g.arc(x - 24, y + 8, 18, 0, 7); fo(g, '#4a5470', 3); }
  g.beginPath(); g.moveTo(262, 590); g.lineTo(250, 620); g.lineTo(266, 622); g.lineTo(254, 652); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); g.strokeStyle = '#ffe45c'; g.lineWidth = 4; g.stroke();
  for (const [x, y, ic] of [[330, 760, '⚓'], [310, 560, '⛈'], [330, 330, '☀']]) { g.beginPath(); g.arc(x, y, 18, 0, 7); fo(g, '#f7ebc8', 3.4); g.font = '20px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK; g.fillText(ic, x, y + 1); }
  ship(g, 300, 790, 0.3, '#c8372d', 0.3); ship(g, 330, 810, 0.24, '#c8372d', 0.3);
  rr(g, 14, 120, 40, 700, 20); fo(g, 'rgba(27,26,46,.75)', 3.4); for (const [y, l] of [[170, '6:00'], [320, '3:00'], [480, '0:00'], [640, '21:00'], [790, '18:00']]) txt(g, l, 34, y, 13, '#ffe6a8');
  rr(g, 462, 120, 64, 110, 16); fo(g, 'rgba(27,26,46,.75)', 3.4); g.beginPath(); g.moveTo(494, 190); g.lineTo(494, 140); g.lineTo(484, 152); g.moveTo(494, 140); g.lineTo(504, 152); g.strokeStyle = '#ffd23f'; g.lineWidth = 5; g.stroke(); txt(g, 'ветер', 494, 210, 14, '#ffe6a8');
  btn(g, 40, 884, 220, 52, 'ГРЕСТИ'); btn(g, 280, 884, 220, 52, 'ДЕРЖАТЬ СТРОЙ', '#9ed7ff');
}
// 4 · commander's table
function C4(g, t) {
  const r = rng(21); g.fillStyle = '#8a5a33'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(50,25,8,.35)'; g.lineWidth = 2; for (let y = 6; y < H; y += 26) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= W; x += 40) g.lineTo(x, y + Math.sin(x * 0.02 + y) * 3); g.stroke(); }
  rr(g, 24, 100, 492, 690, 18); g.fillStyle = 'rgba(40,20,5,.35)'; g.fill(); rr(g, 20, 94, 492, 690, 18); fo(g, '#2e86c1', 5);
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 3; g.setLineDash([6, 8]); for (let i = 0; i < 12; i++) { g.beginPath(); const y = 130 + i * 56; g.moveTo(40, y); for (let x = 40; x <= 490; x += 10) g.lineTo(x, y + Math.sin(x * 0.08 + i) * 5); g.stroke(); } g.setLineDash([]);
  island(g, 380, 230, 110, 80, 3, '#9bc46a', '#b9ab94'); island(g, 410, 400, 66, 100, 7, '#9bc46a', '#b9ab94'); island(g, 120, 680, 80, 50, 15, '#e0b070', '#b9ab94'); port(g, 120, 680, 0.8);
  for (const [x, y, c, l] of [[390, 480, '#6fbf4a', 'Пляж'], [458, 420, '#f2b632', 'Скалы'], [360, 330, '#d9402b', 'Устье']]) { g.beginPath(); g.arc(x, y, 14, 0, 7); fo(g, c, 3.4); g.beginPath(); g.arc(x, y, 5, 0, 7); g.fillStyle = INK; g.fill(); txt(g, l, x, y + 28, 16); }
  g.beginPath(); g.moveTo(150, 650); g.bezierCurveTo(200, 560, 150, 520, 260, 500); g.bezierCurveTo(330, 490, 340, 480, 376, 480); g.lineWidth = 6; g.strokeStyle = '#e8d9b0'; g.lineCap = 'round'; g.stroke(); g.lineWidth = 1.5; g.strokeStyle = '#9a8a60'; g.stroke();
  for (const [x, y] of [[230, 560], [190, 600], [290, 520]]) { g.fillStyle = 'rgba(40,20,5,.35)'; g.beginPath(); g.ellipse(x + 4, y + 10, 24, 8, 0, 0, 7); g.fill(); rr(g, x - 20, y - 8, 40, 14, 4); fo(g, '#7a4c26', 3); ship(g, x, y - 26, 0.22, '#c8372d', 0); }
  rr(g, 20, 20, 500, 60, 14); fo(g, '#5a3a20', 4); txt(g, 'Тактический стол · Сардиния', 270, 50, 26, '#ffe6a8');
  for (let i = 0; i < 4; i++) { const x = 28 + i * 124; g.save(); g.translate(x + 56, 860); g.rotate((i - 1.5) * 0.04); rr(g, -56, -64, 112, 128, 10); fo(g, '#f7ebc8', 3.4); rr(g, -48, -56, 96, 112, 6); g.fillStyle = ['#c8372d', '#3f7ae0', '#6fbf4a', '#f2b632'][i]; g.fill(); txt(g, ['Легион I', 'Лучники', 'Конница', 'Инженеры'][i], 0, 36, 15, '#fff3dc'); g.beginPath(); g.arc(0, -8, 22, 0, 7); fo(g, '#fff3dc', 3); g.restore(); }
  g.beginPath(); g.arc(270, 796, 40, 0, 7); fo(g, '#b0231a', 4.4); g.beginPath(); g.arc(270, 796, 30, 0, 7); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 3; g.stroke(); txt(g, 'СТАРТ', 270, 798, 20);
}
const CS = [C1, C2, C3, C4];
const draw = () => document.querySelectorAll('canvas').forEach((c, i) => { const g = c.getContext('2d'); g.setTransform(c.width / W, 0, 0, c.width / W, 0, 0); CS[i](g, 0); });
draw(); if (document.fonts) document.fonts.load('26px "Lilita One"').then(draw);
`;

const cards = [
  ['1 · Карта-пергамент капитана', 'Старая морская карта: Остия, Корсика и Сардиния, красный пунктир маршрута с якорями, флажки бухт. Внизу доска со слотами кораблей. Дешевле всего и ближе к карте Лация.'],
  ['2 · Флот сверху', 'Камера над морем: клином идут триремы, за ними пенные следы, золотая дорожка маршрута. Острова в дымке на горизонте, порт внизу. Самый эффектный.'],
  ['3 · От заката до рассвета', 'Вертикальный путь: закат у Остии, ночь с луной, рассвет у Сардинии. События на пути — штиль, шторм. Шкала часов слева, ветер справа.'],
  ['4 · Стол полководца', 'Деревянный стол, карта из картона и синей ткани, корабли-фигурки на подставках, три бухты цветными метками, карточки отрядов и печать «Старт».']
];
const html = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Десант: глобальный экран</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800&display=swap">
<style>
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --display: 'Lilita One', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; }
  * { box-sizing: border-box; } body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.4; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 22px 16px 44px; }
  h1 { font-family: var(--display); font-weight: 400; font-size: 36px; margin: 0 0 6px; color: #ffe6a8; }
  h2 { font-family: var(--display); font-weight: 400; font-size: 20px; margin: 8px 0 2px; color: #ffe6a8; }
  p { margin: 0 0 6px; color: var(--muted); font-size: 14px; }
  .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-top: 16px; }
  @media (max-width: 980px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } } @media (max-width: 520px) { .grid { grid-template-columns: minmax(0, 1fr); } }
  canvas { display: block; width: 100%; height: auto; border-radius: 22px; border: 4px solid #1a0e06; box-shadow: 0 10px 28px rgba(0,0,0,.5); }
</style>
<div class="wrap"><h1>Десант: глобальный экран</h1><p>Четыре арт-концепта экрана, где игрок собирает флот в Остии и плывёт к Сардинии. Предложения арт-директора, гейм-дизайнера и UX-дизайнера.</p>
<div class="grid">${cards.map(c => `<section><canvas width="540" height="960" aria-label="${c[0]}"></canvas><h2>${c[0]}</h2><p>${c[1]}</p></section>`).join('')}</div></div>
<script>
'use strict';
${helpers}
${own}
</script>`;
fs.writeFileSync(path.join(__dirname, 'sardinia-fleet.html'), html);
console.log('ok', html.length);
