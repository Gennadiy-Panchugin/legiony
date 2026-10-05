// Six kinds of mound on the terrain sheet, plus archers on a mound with their longer reach.
const fs = require('fs'), path = require('path');
let t = fs.readFileSync(path.join(__dirname, 'terrain.js'), 'utf8');
function rep(a, b) { if (!t.includes(a)) { console.error('MISS', a.slice(0, 70)); process.exit(1); } t = t.replace(a, () => b); }
rep("// ---------------------------------------------------------------- legend badges", String.raw`// ---------------------------------------------------------------- 5. mounds: a raised grassy top over an earthen slope
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
// ---------------------------------------------------------------- legend badges`);
rep('  <h2>Значки местности</h2>', `  <h2>Бугры</h2>
  <p>Шесть вариантов: у всех видна высота — земляной склон под травяной макушкой. Разная макушка даёт разную пользу.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="mo1" width="680" height="840" aria-label="Травяной холм"></canvas></div><figcaption><b>Травяной</b>Простой бугор: лучники бьют дальше, штурм вверх слабее.</figcaption></figure>
    <figure><div class="pic"><canvas id="mo2" width="680" height="840" aria-label="Каменистый бугор"></canvas></div><figcaption><b>Каменистый</b>Валуны на макушке — укрытие от стрел.</figcaption></figure>
    <figure><div class="pic"><canvas id="mo3" width="680" height="840" aria-label="Двухъярусный бугор"></canvas></div><figcaption><b>Двухъярусный</b>Два уступа и тропа, самая дальняя стрельба.</figcaption></figure>
    <figure><div class="pic"><canvas id="mo4" width="680" height="840" aria-label="Бугор с рощицей"></canvas></div><figcaption><b>С рощицей</b>Деревья прячут отряд — засада с высоты.</figcaption></figure>
    <figure><div class="pic"><canvas id="mo5" width="680" height="840" aria-label="Укреплённый бугор"></canvas></div><figcaption><b>Укреплённый</b>Частокол с проёмом: держать долго, выйти тяжело.</figcaption></figure>
    <figure><div class="pic"><canvas id="mo6" width="680" height="840" aria-label="Бугор с древними камнями"></canvas></div><figcaption><b>Древние камни</b>Святилище — место под будущий бонус (дух, лечение).</figcaption></figure>
    <figure><div class="pic"><canvas id="mo7" width="680" height="840" aria-label="Лучники на бугре"></canvas></div><figcaption><b>Лучники на бугре</b>Жёлтое кольцо — обычная дальность, белое — с высоты.</figcaption></figure>
  </div>
  <h2>Значки местности</h2>`);
fs.writeFileSync(path.join(__dirname, 'terrain.js'), t);
console.log('ok');
