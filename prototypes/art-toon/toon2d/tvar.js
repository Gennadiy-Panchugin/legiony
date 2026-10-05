// Builds tvar.html: design options for Тибур — the tunnel through the ridge and the enemy town (the final point), as a pick sheet.
const fs = require('fs'), path = require('path');
const gen = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
const js = gen.slice(gen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, gen.indexOf('`;\nconst html'));
const helpers = js.slice(0, js.indexOf('function drawWorld(g) {'));
const tj = fs.readFileSync(path.join(__dirname, 'terrain.js'), 'utf8');
const tsheet = tj.slice(tj.indexOf('// ---------------------------------------------------------------- rubble: boulders'), tj.indexOf('// ---------------------------------------------------------------- 1. rubble in three states'));
const tb = fs.readFileSync(path.join(__dirname, 'tibur.js'), 'utf8');
const tibHelpers = tb.slice(tb.indexOf('function stream(g, pts, w, r) {'), tb.indexOf('function drawWorld(g, labels) {'));
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
const between = (src, a, b) => src.slice(src.indexOf(a), src.indexOf(b, src.indexOf(a)));
const ban = between(cas, 'const BAN = {', 'const REFILL'), art = between(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const draw = String.raw`
// ---------------------------------------------------------------- panel scaffolding
function pnl(id, seed) { const c = document.getElementById(id), g = c.getContext('2d'); g.scale(2, 2); const r = rng(seed); grass(g, 0, 0, 340, 420, '#76c64a', r); return { g, r }; }
function plate(g, t, sub) { rr(g, 20, 372, 300, 40, 14); g.fillStyle = 'rgba(40,24,14,.94)'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = '#f2c14a'; g.stroke(); g.fillStyle = '#ffe6a8'; g.font = '900 16px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText(t, 170, 390); g.font = '800 11px "Alegreya Sans", sans-serif'; g.fillStyle = '#e2c9a0'; g.fillText(sub, 170, 405); }
// the ridge across the top of a panel: rock top, a cliff face at y≈250, a few peaks
const EDGE = [[0, 246], [60, 258], [120, 250], [170, 256], [230, 248], [290, 258], [340, 250]];
function ridge(g, peaks) {
  g.beginPath(); g.moveTo(0, 0); g.lineTo(340, 0); for (let i = EDGE.length - 1; i >= 0; i--) g.lineTo(EDGE[i][0], EDGE[i][1] + 36); g.closePath(); g.fillStyle = '#6a5a4a'; g.fill();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(340, 0); for (let i = EDGE.length - 1; i >= 0; i--) g.lineTo(EDGE[i][0], EDGE[i][1]); g.closePath(); const mg = g.createLinearGradient(0, 0, 0, 260); mg.addColorStop(0, '#bdb2a0'); mg.addColorStop(1, '#9a8e7e'); fo(g, mg, 3);
  g.beginPath(); EDGE.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = EDGE.length - 1; i >= 0; i--) g.lineTo(EDGE[i][0], EDGE[i][1] + 36); g.closePath(); g.fillStyle = '#7a6a58'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke();
  (peaks || [[50, 120, 90, 90, 1], [290, 110, 90, 96, 1], [60, 230, 70, 60, 0], [290, 232, 70, 60, 0]]).sort((a, b) => a[1] - b[1]).forEach(([x, y, w, h, s]) => peak(g, x, y, w, h, s));
}
function torchAt(g, x, y) { g.strokeStyle = OL; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 18); g.stroke(); g.strokeStyle = '#8a5a30'; g.lineWidth = 2; g.stroke(); const fg = g.createRadialGradient(x, y - 24, 1, x, y - 24, 22); fg.addColorStop(0, 'rgba(255,240,170,.95)'); fg.addColorStop(1, 'rgba(255,150,40,0)'); g.fillStyle = fg; g.beginPath(); g.arc(x, y - 24, 22, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - 5, y - 18); g.quadraticCurveTo(x - 6, y - 28, x, y - 34); g.quadraticCurveTo(x + 6, y - 28, x + 5, y - 18); g.closePath(); fo(g, '#ffb030', 1.8); }
function smoke(g, x, y) { for (const [dx, dy, rr2] of [[0, 0, 7], [5, -12, 9], [-2, -26, 11]]) { g.beginPath(); g.arc(x + dx, y + dy, rr2, 0, 7); g.fillStyle = 'rgba(240,240,235,.75)'; g.fill(); } }
function road(g) { path(g, [[170, 430], [170, 330], [170, 262]], 34); }
function ours(g) { squad(g, 120, 330, 'hastati', 1, 4, 0.8, '#e2382c', 'vex'); squad(g, 222, 318, 'eng', 1, 3, 0.8, '#f09a24', 'square'); }

// ---------------------------------------------------------------- tunnels
const TUNNELS = [
  ['tu6', 'Грот + разрез', 'вход-пещера, а сквозь гору виден ход с крепью и факелами', (g, r) => {
    ridge(g); road(g); cutaway(g, 170, 14, 200, 44); squad(g, 170, 120, 'e_inf', 2, 3, 0.6, '#3f7ae0', 'vex');
    grotto(g, 170, 266, r); stream(g, [[214, 270], [250, 300], [300, 330], [340, 350]], 14, r); torchAt(g, 140, 272);
    ours(g); plate(g, 'Грот + разрез', 'тайный ход: видно, кто прячется под горой');
  }],
  ['tu7', 'Решётка + разрез', 'крепость в скале, а сквозь гору виден ход · для Тибура', (g, r) => {
    ridge(g); road(g); cutaway(g, 170, 14, 160, 44); squad(g, 170, 90, 'e_inf', 2, 3, 0.6, '#3f7ae0', 'vex');
    portcullis(g, 170, 266);
    ours(g); plate(g, 'Решётка + разрез', 'крепость в скале с видимым туннелем · для Тибура');
  }],
  ['tu1', 'Римский портал', 'тёсаный камень, фронтон, факелы · выход виден по дымкам шахт', (g, r) => {
    ridge(g); road(g);
    rr(g, 104, 176, 132, 90, 4); fo(g, '#e2d6bc', 2.8);
    g.beginPath(); g.moveTo(96, 180); g.lineTo(170, 140); g.lineTo(244, 180); g.closePath(); fo(g, '#efe6d2', 2.8); g.beginPath(); g.moveTo(118, 174); g.lineTo(170, 150); g.lineTo(222, 174); g.closePath(); g.strokeStyle = 'rgba(80,60,40,.5)'; g.lineWidth = 1.6; g.stroke();
    for (const x of [116, 210]) { rr(g, x, 184, 14, 80, 3); fo(g, '#fffaf0', 2.2); }
    g.beginPath(); g.moveTo(138, 266); g.lineTo(138, 222); g.arc(170, 222, 32, Math.PI, 0); g.lineTo(202, 266); g.closePath(); fo(g, '#1a0e06', 2.8);
    rr(g, 140, 186, 60, 14, 3); fo(g, '#c8bca4', 2); g.fillStyle = '#5a3a20'; g.font = '900 10px serif'; g.textAlign = 'center'; g.fillText('TIBVR', 170, 197);
    torchAt(g, 96, 268); torchAt(g, 244, 268);
    for (const y of [110, 60]) { g.beginPath(); g.ellipse(170, y, 10, 6, 0, 0, 7); fo(g, '#2a1a10', 2.2); smoke(g, 172, y - 8); }
    ours(g); plate(g, 'Римский портал', 'туннель строили римляне: дымки шахт показывают путь');
  }],
  ['tu2', 'Ущелье с воротами', 'не туннель, а узкий каньон · всё видно сверху, лучники на кромке', (g, r) => {
    ridge(g, [[44, 90, 80, 80, 1], [296, 80, 80, 86, 1], [50, 236, 60, 50, 0], [290, 238, 60, 50, 0]]);
    const L = [[112, 0], [122, 90], [106, 180], [114, 262]], R = [[228, 0], [218, 90], [234, 180], [226, 262]];
    g.beginPath(); L.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath(); g.fillStyle = '#c99a58'; g.fill();
    path(g, [[170, 430], [170, 262], [170, 0]], 22);
    for (const [side, dx] of [[L, 1], [R, -1]]) { g.beginPath(); side.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = side.length - 1; i >= 0; i--) g.lineTo(side[i][0] + dx * 18, side[i][1]); g.closePath(); g.fillStyle = '#7a6a58'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke(); g.strokeStyle = 'rgba(40,30,20,.45)'; g.lineWidth = 2; for (let y = 20; y < 260; y += 34) { g.beginPath(); g.moveTo(side[0][0] + dx * 4, y); g.lineTo(side[0][0] + dx * 14, y + 12); g.stroke(); } }
    for (let k = -50; k <= 50; k += 10) { if (Math.abs(k) < 12) continue; g.beginPath(); g.moveTo(170 + k - 4, 266); g.lineTo(170 + k - 3, 238); g.lineTo(170 + k, 230); g.lineTo(170 + k + 3, 238); g.lineTo(170 + k + 4, 266); g.closePath(); fo(g, '#b0783e', 2.2); }
    rr(g, 156, 236, 28, 30, 4); fo(g, '#6a4020', 2.4); g.strokeStyle = OL; g.lineWidth = 1.6; g.beginPath(); g.moveTo(170, 238); g.lineTo(170, 264); g.stroke(); rr(g, 104, 250, 132, 9, 4); fo(g, '#8a5a30', 2.2);
    squad(g, 170, 120, 'e_inf', 2, 3, 0.6, '#3f7ae0', 'vex');
    squad(g, 72, 150, 'e_arc', 2, 3, 0.7, '#3f7ae0', 'pennant'); squad(g, 270, 150, 'e_arc', 2, 3, 0.7, '#3f7ae0', 'pennant', -1);
    ours(g); plate(g, 'Ущелье с воротами', 'проход виден целиком, но сверху бьют лучники');
  }],
  ['tu3', 'Разрез горы', 'гора «прозрачная» над туннелем · отряды видно внутри, крепь и факелы', (g, r) => {
    ridge(g); road(g);
    g.beginPath(); g.moveTo(140, 262); g.lineTo(144, 20); g.quadraticCurveTo(170, 4, 196, 20); g.lineTo(200, 262); g.closePath(); g.fillStyle = '#4a3020'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
    g.beginPath(); g.moveTo(148, 262); g.lineTo(150, 30); g.lineTo(190, 30); g.lineTo(192, 262); g.closePath(); g.fillStyle = '#7a5434'; g.fill();
    for (let y = 50; y < 260; y += 36) { rr(g, 146, y, 6, 22, 2); fo(g, '#b07a40', 1.6); rr(g, 188, y, 6, 22, 2); fo(g, '#b07a40', 1.6); rr(g, 146, y - 4, 48, 6, 2); fo(g, '#c48a4a', 1.6); }
    for (const y of [90, 200]) { const fg = g.createRadialGradient(170, y, 1, 170, y, 26); fg.addColorStop(0, 'rgba(255,220,140,.7)'); fg.addColorStop(1, 'rgba(255,180,80,0)'); g.fillStyle = fg; g.beginPath(); g.arc(170, y, 26, 0, 7); g.fill(); }
    squad(g, 170, 150, 'hastati', 1, 3, 0.62, '#e2382c', 'vex'); squad(g, 170, 60, 'e_inf', 2, 3, 0.62, '#3f7ae0', 'vex');
    rr(g, 132, 236, 76, 30, 4); g.strokeStyle = OL; g.lineWidth = 3; g.stroke(); rr(g, 136, 238, 8, 28, 2); fo(g, '#b07a40', 2); rr(g, 196, 238, 8, 28, 2); fo(g, '#b07a40', 2); rr(g, 132, 232, 76, 8, 2); fo(g, '#c48a4a', 2);
    ours(g); plate(g, 'Разрез горы', 'видно, кто в туннеле: бой в узком проходе');
  }],
  ['tu4', 'Грот с лозой', 'природная пещера в скале · лоза, сталактиты, ручей из грота', (g, r) => {
    ridge(g); road(g);
    blob(g, 170, 228, 60, 44, 3, 12); fo(g, '#8a7a68', 3);
    g.beginPath(); g.moveTo(122, 266); g.quadraticCurveTo(116, 200, 170, 188); g.quadraticCurveTo(224, 200, 218, 266); g.closePath(); fo(g, '#1a0e06', 3);
    for (let x = 132; x <= 208; x += 13) { g.beginPath(); g.moveTo(x - 5, 200 + Math.abs(x - 170) * 0.5); g.lineTo(x, 214 + (x % 3) * 4 + Math.abs(x - 170) * 0.5); g.lineTo(x + 5, 200 + Math.abs(x - 170) * 0.5); g.closePath(); fo(g, '#b4aa9a', 1.6); }
    g.strokeStyle = '#3a8a2a'; g.lineWidth = 3; for (const x of [126, 140, 200, 214]) { g.beginPath(); g.moveTo(x, 196); g.quadraticCurveTo(x + 4, 220, x - 2, 244); g.stroke(); g.fillStyle = '#5ab83a'; for (let y = 206; y < 244; y += 12) { g.beginPath(); g.ellipse(x + 2, y, 4, 2.5, 0.5, 0, 7); g.fill(); } }
    stream(g, [[210, 262], [250, 300], [300, 330], [340, 350]], 14, r);
    boulder(g, 112, 268, 0.9); boulder(g, 232, 270, 0.8); torchAt(g, 140, 270);
    ours(g); plate(g, 'Грот с лозой', 'старая пещера: тайный ход под горой к храму');
  }],
  ['tu5', 'Решётка в скале', 'крепость вырублена прямо в скале · окна-бойницы, опускная решётка', (g, r) => {
    ridge(g); road(g);
    g.beginPath(); g.moveTo(80, 262); g.lineTo(84, 150); g.lineTo(256, 150); g.lineTo(260, 262); g.closePath(); g.fillStyle = '#a89c8a'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
    for (const [x, y] of [[104, 176], [236, 176], [104, 214], [236, 214], [140, 166], [200, 166]]) { rr(g, x - 5, y - 9, 10, 18, 5); fo(g, '#1a0e06', 2); }
    g.beginPath(); g.moveTo(134, 264); g.lineTo(134, 222); g.arc(170, 222, 36, Math.PI, 0); g.lineTo(206, 264); g.closePath(); fo(g, '#1a0e06', 3);
    g.strokeStyle = '#8a8a8a'; g.lineWidth = 3.2; for (let x = 142; x <= 198; x += 11) { g.beginPath(); g.moveTo(x, 196); g.lineTo(x, 252); g.stroke(); } for (let y = 208; y <= 248; y += 12) { g.beginPath(); g.moveTo(138, y); g.lineTo(202, y); g.stroke(); }
    flag(g, 92, 104, '#3f7ae0', 46); flag(g, 248, 104, '#3f7ae0', 46);
    ours(g); plate(g, 'Решётка в скале', 'без стен-коробки: ворота и бойницы в самой скале');
  }]
];
// ---------------------------------------------------------------- the tunnel's far end: the ridge fills the bottom, the exit opens north onto the grass
function northRidge(g) {
  g.beginPath(); g.moveTo(0, 420); g.lineTo(0, 200); g.lineTo(80, 190); g.lineTo(170, 200); g.lineTo(260, 188); g.lineTo(340, 198); g.lineTo(340, 420); g.closePath(); const mg = g.createLinearGradient(0, 190, 0, 420); mg.addColorStop(0, '#9a8e7e'); mg.addColorStop(1, '#bdb2a0'); fo(g, mg, 3);
  for (const [x, y, w, h, s] of [[50, 300, 90, 90, 1], [290, 290, 90, 96, 1], [70, 380, 80, 70, 0], [280, 384, 80, 70, 0]]) peak(g, x, y, w, h, s);
  path(g, [[170, 200], [170, 120], [170, 0]], 34); cutaway(g, 170, 210, 420, 44); squad(g, 170, 300, 'hastati', 1, 3, 0.6, '#e2382c', 'vex');
}
const EXITS = [
  ['tx1', 'Каменный проём', 'дорога выходит из каменного кольца со ступенями', (g, r) => { northRidge(g); exitStone(g, 170, 200); squad(g, 170, 110, 'e_inf', 2, 4, 0.7, '#3f7ae0', 'vex'); plate(g, 'Каменный проём', 'выход виден сверху: кольцо, ступени, свет'); }],
  ['tx2', 'Деревянная крепь', 'выход как из шахты: столбы, балка, фонарь', (g, r) => { northRidge(g); exitTimber(g, 170, 204); squad(g, 170, 110, 'e_inf', 2, 4, 0.7, '#3f7ae0', 'vex'); plate(g, 'Деревянная крепь', 'выход шахты: тот же стиль, что крепь в разрезе'); }],
  ['tx3', 'Грот в траве', 'выход прячется в камнях под лозой', (g, r) => { northRidge(g); exitGrotto(g, 170, 202); squad(g, 170, 110, 'e_inf', 2, 4, 0.7, '#3f7ae0', 'vex'); plate(g, 'Грот в траве', 'выход как у тайного хода, к гроту на входе'); }]
];
// ---------------------------------------------------------------- the enemy town (the final point)
function temple(g, x, y, w) { const h = w * 0.62; rr(g, x - w / 2 - 8, y - 10, w + 16, 14, 3); fo(g, '#d8ccb4', 2.6); rr(g, x - w / 2 - 4, y - 18, w + 8, 10, 3); fo(g, '#e2d6bc', 2.4); rr(g, x - w / 2, y - h, w, h - 18, 3); fo(g, '#f4ead6', 2.6); for (let k = 0; k < 6; k++) { rr(g, x - w / 2 + 4 + k * (w - 14) / 5, y - h + 4, 7, h - 24, 3); fo(g, '#fffaf0', 1.8); } g.beginPath(); g.moveTo(x - w / 2 - 6, y - h + 2); g.lineTo(x, y - h - w * 0.28); g.lineTo(x + w / 2 + 6, y - h + 2); g.closePath(); fo(g, '#e8643c', 2.8); }
function thatch(g, x, y) { g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 5, y + 2, 26, 7, 0, 0, 7); g.fill(); rr(g, x - 20, y - 22, 40, 24, 4); fo(g, '#e2c89a', 2.4); g.beginPath(); g.moveTo(x - 26, y - 18); g.quadraticCurveTo(x, y - 52, x + 26, y - 18); g.closePath(); fo(g, '#d9a441', 2.6); g.strokeStyle = 'rgba(120,80,20,.6)'; g.lineWidth = 1.4; for (let k = -16; k <= 16; k += 8) { g.beginPath(); g.moveTo(x + k, y - 20); g.lineTo(x + k * 0.5, y - 36); g.stroke(); } rr(g, x - 5, y - 14, 10, 16, 4); fo(g, '#5a3a20', 1.8); }
function enemyTown(g) { squad(g, 92, 300, 'e_inf', 2, 4, 0.75, '#3f7ae0', 'vex'); squad(g, 250, 300, 'e_arc', 2, 3, 0.75, '#3f7ae0', 'pennant', -1); }
const TOWNS = [
  ['to1', 'Храм Весты на площади', 'круглый храм, как значок Тибура на карте кампании', (g, r) => {
    for (const [x, y] of [[50, 100], [290, 90], [60, 190], [290, 200], [110, 60], [230, 56]]) house(g, x, y);
    g.beginPath(); g.ellipse(170, 230, 130, 70, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke();
    for (let a = 0; a < 6.28; a += 0.5) { g.beginPath(); g.ellipse(170 + Math.cos(a) * 100, 230 + Math.sin(a) * 52, 14, 7, 0, 0, 7); g.strokeStyle = 'rgba(150,120,80,.5)'; g.lineWidth = 1.4; g.stroke(); }
    capRing(g, 170, 236, 92, 0); roundTemple(g, 170, 230); enemyTown(g); flag(g, 210, 140, '#3f7ae0', 40);
    plate(g, 'Храм Весты на площади', 'встать у храма 6 с · вокруг жилые дома');
  }],
  ['to2', 'Святилище Геркулеса', 'большой храм на террасах с лестницей · исторический Тибур', (g, r) => {
    for (let k = 0; k < 3; k++) { const w = 300 - k * 60, y = 280 - k * 50; rr(g, 170 - w / 2, y - 40, w, 44, 4); fo(g, k % 2 ? '#d8ccb4' : '#cfc3ac', 2.8); for (let x = 170 - w / 2 + 12; x < 170 + w / 2 - 8; x += 22) { g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x, y - 6); g.arc(x + 7, y - 6, 7, Math.PI, 0); g.lineTo(x + 14, y - 30); g.strokeStyle = 'rgba(80,60,40,.55)'; g.lineWidth = 1.6; g.stroke(); } }
    rr(g, 150, 150, 40, 134, 3); fo(g, '#efe6d2', 2.4); for (let y = 158; y < 282; y += 9) { g.strokeStyle = 'rgba(80,60,40,.45)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(152, y); g.lineTo(188, y); g.stroke(); }
    temple(g, 170, 150, 110); capRing(g, 170, 316, 80, 0); enemyTown(g); flag(g, 236, 60, '#3f7ae0', 40);
    plate(g, 'Святилище Геркулеса', 'брать лестницу снизу: лучники на террасах');
  }],
  ['to3', 'Латинский городок', 'частокол и соломенные крыши · враги — латины, а не римляне', (g, r) => {
    g.beginPath(); g.ellipse(170, 210, 150, 120, 0, 0, 7); g.fillStyle = 'rgba(190,150,90,.4)'; g.fill();
    for (let a = 0; a < 6.28; a += 0.13) { if (Math.abs(a - 1.57) < 0.18) continue; const x = 170 + Math.cos(a) * 150, y = 210 + Math.sin(a) * 120; g.beginPath(); g.moveTo(x - 4, y + 6); g.lineTo(x - 3, y - 16); g.lineTo(x, y - 22); g.lineTo(x + 3, y - 16); g.lineTo(x + 4, y + 6); g.closePath(); fo(g, '#b0783e', 2); }
    rr(g, 148, 290, 44, 56, 4); fo(g, '#9a6a38', 2.6); g.beginPath(); g.moveTo(140, 292); g.lineTo(170, 266); g.lineTo(200, 292); g.closePath(); fo(g, '#d9a441', 2.6); rr(g, 160, 316, 20, 30, 8); fo(g, '#3a2414', 2);
    for (const [x, y] of [[90, 150], [250, 150], [80, 240], [260, 236], [130, 110], [210, 104]]) thatch(g, x, y);
    g.beginPath(); g.arc(170, 196, 18, 0, 7); fo(g, '#b4aa9a', 2.6); torchAt(g, 170, 200); capRing(g, 170, 200, 60, 0);
    enemyTown(g); plate(g, 'Латинский городок', 'ворота в частоколе · в центре святой очаг');
  }],
  ['to4', 'Вилла с садом', 'виллы Тибура славятся: двор, бассейн, сад', (g, r) => {
    rr(g, 50, 70, 240, 220, 6); fo(g, '#e8dcc0', 2.8);
    rr(g, 90, 110, 160, 140, 4); g.fillStyle = '#86ce52'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = OL; g.stroke();
    rr(g, 130, 150, 80, 50, 8); const pg = g.createLinearGradient(0, 150, 0, 200); pg.addColorStop(0, '#7fdcff'); pg.addColorStop(1, '#3aa8e0'); fo(g, pg, 2.4);
    for (const [x, y] of [[106, 126], [234, 126], [106, 232], [234, 232]]) tree(g, x, y + 6, 0.55);
    for (const [x, y, w, h] of [[50, 50, 240, 30], [50, 270, 90, 30], [200, 270, 90, 30]]) { rr(g, x, y, w, h, 3); fo(g, '#e8643c', 2.6); g.strokeStyle = 'rgba(120,30,10,.5)'; g.lineWidth = 1.4; for (let k = x + 8; k < x + w; k += 10) { g.beginPath(); g.moveTo(k, y + 2); g.lineTo(k, y + h - 2); g.stroke(); } }
    capRing(g, 170, 176, 70, 0); enemyTown(g); flag(g, 276, 10, '#3f7ae0', 40);
    plate(g, 'Вилла с садом', 'бой во дворе виллы · бассейн непроходим');
  }],
  ['to5', 'Акрополь на скале', 'скала посреди города, лестница вверх, храм и низкая стена', (g, r) => {
    for (const [x, y] of [[50, 300], [290, 300], [60, 220], [286, 220]]) house(g, x, y);
    blob(g, 170, 200, 120, 110, 7, 12); fo(g, '#a59a8c', 3); blob(g, 170, 180, 100, 86, 8, 12); fo(g, '#8fd457', 2.6);
    for (let a = 0; a < 6.28; a += 0.2) { if (Math.abs(a - 1.57) < 0.25) continue; rr(g, 170 + Math.cos(a) * 96 - 6, 180 + Math.sin(a) * 80 - 6, 12, 10, 2); fo(g, '#d8ccb4', 1.8); }
    for (let k = 0; k < 6; k++) { rr(g, 156, 262 + k * 9, 28, 8, 2); fo(g, '#d8ccb4', 1.8); }
    temple(g, 170, 190, 90); capRing(g, 170, 210, 70, 0); enemyTown(g); flag(g, 226, 92, '#3f7ae0', 40);
    plate(g, 'Акрополь на скале', 'один подъём по лестнице · сверху бьют дальше');
  }]
];
const go = () => {
  for (const [id, , , fn] of TUNNELS) { const { g, r } = pnl(id, id.charCodeAt(2) * 7); fn(g, r); }
  for (const [id, , , fn] of EXITS) { const { g, r } = pnl(id, id.charCodeAt(2) * 13); fn(g, r); }
  for (const [id, , , fn] of TOWNS) { const { g, r } = pnl(id, id.charCodeAt(2) * 11); fn(g, r); }
  let pick = { tu: null, tx: null, to: null }; try { pick = Object.assign(pick, JSON.parse(localStorage.getItem('tibur-pick') || '{}')); } catch (_) {}
  const all = TUNNELS.concat(EXITS, TOWNS), name = id => (all.find(x => x[0] === id) || [])[1];
  const show = () => { document.querySelectorAll('.pick').forEach(b => b.classList.toggle('on', pick[b.dataset.id.slice(0, 2)] === b.dataset.id)); document.getElementById('chosen').innerHTML = 'Вход: <b>' + (name(pick.tu) || '—') + '</b> · Выход: <b>' + (name(pick.tx) || '—') + '</b> · Город: <b>' + (name(pick.to) || '—') + '</b>'; };
  document.querySelectorAll('.pick').forEach(b => b.addEventListener('click', () => { const k = b.dataset.id.slice(0, 2); pick[k] = pick[k] === b.dataset.id ? null : b.dataset.id; try { localStorage.setItem('tibur-pick', JSON.stringify(pick)); } catch (_) {} show(); }));
  show();
};
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load('900 20px "Lilita One"'), document.fonts.load('700 13px "Alegreya Sans"')]).catch(() => 0) : Promise.resolve()).then(go);
`;
const meta = src => [...src.matchAll(/\['(t[uox]\d)', '([^']+)', '([^']+)'/g)].map(m => m.slice(1));
const cards = list => list.map(([id, name, sub]) => `<button class="pick" type="button" data-id="${id}"><canvas id="${id}" width="680" height="840" aria-label="${name}"></canvas><span class="cap"><b>${name}</b>${sub}</span><i class="tick" aria-hidden="true">✓</i></button>`).join('\n      ');
const tun = meta(draw.slice(draw.indexOf('const TUNNELS'), draw.indexOf('const EXITS'))), exits = meta(draw.slice(draw.indexOf('const EXITS'), draw.indexOf('const TOWNS'))), town = meta(draw.slice(draw.indexOf('const TOWNS')));
const html = `<title>Тибур: туннель и город</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800;900&display=swap">
<style>
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --gold: #f2c14a; --display: 'Lilita One', 'Alegreya Sans', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.45; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 28px 16px 120px; }
  h1 { font-family: var(--display); font-weight: 400; font-size: 40px; line-height: 1.05; margin: 0 0 10px; color: #ffe6a8; }
  h2 { font-family: var(--display); font-weight: 400; font-size: 26px; margin: 26px 0 6px; color: #ffe6a8; }
  p { margin: 0 0 12px; color: var(--muted); max-width: 760px; } b { color: var(--ink); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
  .pick { position: relative; padding: 0; border: 4px solid #1a0e06; border-radius: 18px; overflow: hidden; background: #3a2414; color: inherit; font: inherit; text-align: left; cursor: pointer; }
  .pick canvas { display: block; width: 100%; height: auto; }
  .pick .cap { display: block; padding: 8px 10px 10px; font-size: 13px; color: var(--muted); line-height: 1.3; } .pick .cap b { display: block; font: 400 17px var(--display); color: #ffe6a8; margin-bottom: 2px; }
  .pick .tick { position: absolute; top: 8px; right: 8px; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #1a0e06; background: #ffcc33; color: #3a1e08; font: 400 20px var(--display); display: none; align-items: center; justify-content: center; font-style: normal; }
  .pick.on { border-color: #ffcc33; box-shadow: 0 0 0 3px #ffcc33, 0 10px 26px rgba(0,0,0,.5); } .pick.on .tick { display: flex; }
  .pick:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
  .bar { position: fixed; left: 50%; bottom: 14px; transform: translateX(-50%); width: min(720px, calc(100% - 32px)); padding: 12px 16px; border-radius: 18px; background: rgba(40,24,14,.97); border: 3px solid var(--gold); color: var(--muted); font-size: 15px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,.6); }
</style>
<div class="wrap">
  <h1>Тибур: туннель и город</h1>
  <p>Варианты от дизайнера для двух мест, которые на карте смотрелись неудачно. Нажмите на понравившийся вариант, появится ✓. Выбор сохранится, внизу будет итог — его можно написать в чат.</p>
  <h2>Туннель через отрог</h2>
  <p>Главное — чтобы игрок с первого взгляда понял: здесь проход сквозь гору и короткий путь. <b>Новые</b> — первые два: вход, который вам понравился, плюс туннель в разрезе.</p>
  <div class="grid">
      ${cards(tun)}
  </div>
  <h2>Выход из туннеля</h2>
  <p>Выход смотрит на север, от игрока, поэтому арка «лицом к нам» выглядела странно. Здесь дорога поднимается из-под земли на открытое место. На карте Тибура сейчас первый вариант.</p>
  <div class="grid">
      ${cards(exits)}
  </div>
  <h2>Вражеский город — финальная точка</h2>
  <p>Вместо «замка-коробки». Для Тибура — храм Весты на площади, остальные (кроме виллы) пойдут в другие города кампании.</p>
  <div class="grid">
      ${cards(town)}
  </div>
</div>
<div class="bar" id="chosen" role="status"></div>
<script>
'use strict';
${helpers}
${ban}
${art}
${tsheet}
${tibHelpers}
${draw}
</script>
`;
fs.writeFileSync(path.join(__dirname, 'tvar.html'), html);
console.log('ok', html.length, tun.length, town.length);
