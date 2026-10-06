// Builds sardinia-road.html: six ways for the road to meet the beach on the Sardinia landing map (art + level design proposals).
const fs = require('fs'), path = require('path');
const gen = fs.readFileSync('gen.js', 'utf8');
const jsAll = gen.slice(gen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, gen.indexOf('`;\nconst html'));
const helpers = jsAll.slice(0, jsAll.indexOf('function drawWorld(g) {'));

const own = String.raw`
const W = 400, H = 440, SAND = '#f2d48a', ROAD = '#e3c98a';
function line(g, pts, w, col) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = w + 7; g.strokeStyle = OL; g.stroke(); g.lineWidth = w; g.strokeStyle = col; g.stroke(); }
function pebble(g, x, y, s, c) { g.beginPath(); g.ellipse(x, y, 7 * s, 4.5 * s, 0, 0, 7); fo(g, c || '#b9ab94', 2); g.beginPath(); g.ellipse(x - 1.5 * s, y - 1.8 * s, 3 * s, 1.5 * s, 0, 0, 7); g.fillStyle = '#d6cab6'; g.fill(); }
function boulder(g, x, y, s) { g.fillStyle = 'rgba(40,30,10,.3)'; g.beginPath(); g.ellipse(x + 5 * s, y + 3 * s, 22 * s, 7 * s, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - 20 * s, y); g.lineTo(x - 15 * s, y - 22 * s); g.lineTo(x + 2 * s, y - 30 * s); g.lineTo(x + 18 * s, y - 18 * s); g.lineTo(x + 22 * s, y); g.closePath(); fo(g, '#9a8c76', 3); g.beginPath(); g.moveTo(x + 2 * s, y - 30 * s); g.lineTo(x + 18 * s, y - 18 * s); g.lineTo(x + 22 * s, y); g.lineTo(x + 6 * s, y); g.closePath(); g.fillStyle = 'rgba(60,40,20,.3)'; g.fill(); }
function pole(g, x, y, col) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 46); g.strokeStyle = OL; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#8a5a30'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(x, y - 46); g.lineTo(x + 20, y - 40); g.lineTo(x + 2, y - 30); g.closePath(); fo(g, col, 2.4); }
function stake(g, x, y) { g.beginPath(); g.moveTo(x - 3, y + 3); g.lineTo(x - 2, y - 18); g.lineTo(x, y - 23); g.lineTo(x + 2, y - 18); g.lineTo(x + 3, y + 3); g.closePath(); fo(g, '#b0783e', 2); }
function crate(g, x, y) { rr(g, x - 11, y - 18, 22, 18, 3); fo(g, '#b88a52', 2.4); g.beginPath(); g.moveTo(x - 11, y - 9); g.lineTo(x + 11, y - 9); g.moveTo(x, y - 18); g.lineTo(x, y); g.strokeStyle = 'rgba(60,30,10,.5)'; g.lineWidth = 1.6; g.stroke(); }
function barrel(g, x, y) { g.beginPath(); g.ellipse(x, y - 8, 9, 10, 0, 0, 7); fo(g, '#a8693a', 2.4); g.strokeStyle = 'rgba(40,20,10,.55)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - 9, y - 12); g.lineTo(x + 9, y - 12); g.moveTo(x - 9, y - 4); g.lineTo(x + 9, y - 4); g.stroke(); }
function dune(g, x, y, rx, ry) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI, 0); g.closePath(); fo(g, '#eecb7a', 3); g.beginPath(); g.ellipse(x + rx * 0.2, y - ry * 0.5, rx * 0.45, ry * 0.3, 0, Math.PI, 0); g.fillStyle = 'rgba(255,245,200,.55)'; g.fill(); }
function base(g, seed) {
  const r = rng(seed);
  g.fillStyle = '#7ba83a'; g.fillRect(0, 0, W, 190);
  for (let i = 0; i < 18; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,160,.14)' : 'rgba(40,90,20,.14)'; g.beginPath(); g.ellipse(r() * W, r() * 170, 24, 8, 0, 0, 7); g.fill(); }
  g.beginPath(); g.moveTo(0, 190); for (let x = 0; x <= W; x += 10) g.lineTo(x, 182 + Math.sin(x * 0.03) * 7); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); fo(g, SAND, 3.4);
  g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 14; k++) { g.beginPath(); g.ellipse(r() * W, 220 + r() * 150, 6 + r() * 12, 2.4, 0, 0, 7); g.fill(); }
  dune(g, 60, 210, 46, 16); dune(g, 340, 214, 50, 17);
  // shallows and surf at the bottom
  g.beginPath(); g.moveTo(0, 398); for (let x = 0; x <= W; x += 10) g.lineTo(x, 398 + Math.sin(x * 0.04) * 4); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fillStyle = '#86e3d2'; g.fill();
  g.beginPath(); for (let x = 0; x <= W; x += 10) { const y = 396 + Math.sin(x * 0.04) * 4; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 5; g.stroke();
  g.fillStyle = '#1fa7c9'; g.fillRect(0, 426, W, 14);
}
const TOP = [[200, -10], [208, 60], [194, 120], [200, 190]];
function V1(g) { // wet dark ground + pebbles
  base(g, 1); line(g, TOP.concat([[200, 262]]), 34, ROAD);
  const gr = g.createLinearGradient(0, 250, 0, 400); gr.addColorStop(0, ROAD); gr.addColorStop(1, '#9a7442');
  g.beginPath(); g.moveTo(183, 250); g.bezierCurveTo(180, 300, 168, 350, 160, 398); g.lineTo(242, 398); g.bezierCurveTo(232, 350, 220, 300, 217, 250); g.closePath(); g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(43,26,16,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(183, 250); g.bezierCurveTo(180, 300, 168, 350, 160, 398); g.moveTo(217, 250); g.bezierCurveTo(220, 300, 232, 350, 242, 398); g.stroke();
  for (const [x, y, rx, ry] of [[196, 318, 16, 6], [210, 356, 22, 7], [188, 380, 18, 6]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fillStyle = 'rgba(70,45,20,.5)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.6; g.stroke(); }
  for (const [x, y, s] of [[170, 276, 0.9], [232, 282, 1], [160, 330, 1], [244, 340, 0.9], [150, 370, 0.8], [254, 372, 1], [176, 300, 0.7], [226, 310, 0.7]]) pebble(g, x, y, s);
}
function V2(g) { // planked funnel with stakes and rope
  base(g, 2); line(g, TOP.concat([[200, 252]]), 34, ROAD);
  g.beginPath(); g.moveTo(183, 248); g.bezierCurveTo(180, 300, 150, 350, 124, 398); g.lineTo(276, 398); g.bezierCurveTo(250, 350, 220, 300, 217, 248); g.closePath(); fo(g, '#8a5a30', 3.4);
  for (let y = 256; y < 394; y += 10) { const k = (y - 248) / 150, hw = 17 + 55 * k * k + 8 * k; g.save(); g.translate(200, y); g.rotate(Math.sin(y) * 0.02); rr(g, -hw + 2, -4, hw * 2 - 4, 8, 2); fo(g, y % 20 ? '#a8763e' : '#c48a4a', 1.8); g.restore(); }
  const L = [], R = []; for (let y = 262; y < 396; y += 34) { const k = (y - 248) / 150, hw = 17 + 55 * k * k + 8 * k + 6; L.push([200 - hw, y]); R.push([200 + hw, y]); }
  for (const S of [L, R]) { g.beginPath(); S.forEach(([x, y], i) => i ? g.lineTo(x, y - 18) : g.moveTo(x, y - 18)); g.strokeStyle = '#e8d6a4'; g.lineWidth = 2.4; g.stroke(); S.forEach(([x, y]) => stake(g, x, y)); }
  g.fillStyle = 'rgba(242,212,138,.7)'; for (const [x, y] of [[170, 330], [236, 350], [200, 376], [152, 380]]) { g.beginPath(); g.ellipse(x, y, 12, 4, 0, 0, 7); g.fill(); }
}
function V3(g) { // stone gate
  base(g, 3); line(g, TOP.concat([[200, 296]]), 34, ROAD);
  g.beginPath(); g.moveTo(190, 296); g.lineTo(150, 396); g.lineTo(250, 396); g.lineTo(210, 296); g.closePath(); g.fillStyle = 'rgba(158,128,70,.45)'; g.fill();
  g.strokeStyle = 'rgba(120,90,40,.7)'; g.lineWidth = 3; g.setLineDash([2, 9]); g.lineCap = 'round'; for (const dx of [-8, 8]) { g.beginPath(); g.moveTo(200 + dx, 300); g.lineTo(200 + dx * 3.5, 394); g.stroke(); } g.setLineDash([]);
  boulder(g, 156, 304, 1.1); boulder(g, 244, 304, 1.1); boulder(g, 128, 322, 0.8); boulder(g, 272, 322, 0.8);
  for (const x of [172, 228]) { rr(g, x - 4, 262, 8, 46, 3); fo(g, '#8a5a30', 2.6); }
  g.beginPath(); g.moveTo(168, 266); g.lineTo(232, 266); g.strokeStyle = OL; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#c48a4a'; g.lineWidth = 3; g.stroke();
  for (const [x, y, s] of [[130, 360, 0.7], [270, 352, 0.7], [110, 300, 0.6], [300, 300, 0.6], [90, 380, 0.6], [310, 376, 0.7]]) pebble(g, x, y, s);
}
function V4(g) { // converging ruts and an unloaded wagon train
  base(g, 4); line(g, TOP.concat([[200, 262]]), 30, ROAD);
  for (const [sx, c] of [[110, 1], [200, 0], [290, -1]]) { g.beginPath(); g.moveTo(200 + (sx - 200) * 0.12, 262); g.quadraticCurveTo(200 + (sx - 200) * 0.2, 330, sx, 398); g.lineCap = 'round'; g.lineWidth = 12; g.strokeStyle = OL; g.stroke(); g.lineWidth = 8; g.strokeStyle = '#9a7442'; g.stroke(); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.3)'; g.stroke(); }
  g.fillStyle = 'rgba(190,160,100,.4)'; for (let k = 0; k < 26; k++) { const x = 130 + (k * 37) % 150, y = 290 + (k * 23) % 100; g.beginPath(); g.ellipse(x, y, 4, 1.6, 0, 0, 7); g.fill(); }
  crate(g, 140, 340); crate(g, 158, 358); barrel(g, 252, 346); barrel(g, 270, 366); crate(g, 232, 380); pole(g, 214, 300, '#e2382c');
}
function V5(g) { // gravel lane between low berms of driftwood and seaweed, start arch
  base(g, 5); line(g, TOP.concat([[200, 240]]), 34, ROAD);
  g.beginPath(); g.moveTo(183, 238); g.lineTo(168, 396); g.lineTo(232, 396); g.lineTo(217, 238); g.closePath(); g.fillStyle = '#d4b878'; g.fill();
  g.fillStyle = 'rgba(100,70,30,.5)'; for (let k = 0; k < 40; k++) { const y = 250 + (k * 41) % 140, hw = 14 + (y - 238) * 0.1; g.beginPath(); g.arc(200 + ((k * 53) % 100 - 50) / 50 * hw, y, 1.6, 0, 7); g.fill(); }
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(200 + sd * 22, 240); g.lineTo(200 + sd * 40, 396); g.lineTo(200 + sd * 52, 396); g.lineTo(200 + sd * 30, 240); g.closePath(); fo(g, '#7a5a36', 3); for (let y = 250; y < 394; y += 22) { const x = 200 + sd * (26 + (y - 240) * 0.1); g.beginPath(); g.ellipse(x, y, 7, 5, 0.4 * sd, 0, 7); fo(g, y % 44 ? '#4f7a30' : '#a07a48', 2); } }
  boulder(g, 162, 394, 0.9); boulder(g, 238, 394, 0.9); g.beginPath(); g.moveTo(150, 372); g.quadraticCurveTo(200, 340, 250, 372); g.strokeStyle = OL; g.lineWidth = 12; g.stroke(); g.strokeStyle = '#9a8c76'; g.lineWidth = 7; g.stroke();
}
function V6(g) { // poles with flags over a dark wet strip
  base(g, 6); line(g, TOP.concat([[200, 232]]), 34, ROAD);
  const gr = g.createLinearGradient(0, 232, 0, 398); gr.addColorStop(0, '#caa86a'); gr.addColorStop(1, '#b08c54');
  g.beginPath(); g.moveTo(183, 230); g.bezierCurveTo(180, 300, 168, 350, 166, 398); g.lineTo(234, 398); g.bezierCurveTo(232, 350, 220, 300, 217, 230); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(43,26,16,.55)'; g.lineWidth = 2.4; g.setLineDash([8, 6]); g.stroke(); g.setLineDash([]);
  g.fillStyle = 'rgba(120,90,50,.45)'; for (let k = 0; k < 14; k++) { g.beginPath(); g.ellipse(184 + (k * 23) % 34, 245 + (k * 31) % 140, 6, 2, 0, 0, 7); g.fill(); }
  pole(g, 160, 380, '#e2382c'); pole(g, 240, 380, '#f4f0e6'); pole(g, 168, 316, '#f4f0e6'); pole(g, 232, 316, '#e2382c'); pole(g, 176, 256, '#e2382c'); pole(g, 224, 256, '#f4f0e6');
}
const VS = [V1, V2, V3, V4, V5, V6];
document.querySelectorAll('canvas').forEach((c, i) => { const g = c.getContext('2d'); g.scale(c.width / W, c.height / H); VS[i](g); });
`;

const cards = [
  ['1 · Мокрый грунт и галька', 'Арт', 'Дорога темнеет к воде: градиент, лужицы, галька по кромке закрывает обрыв контура.'],
  ['2 · Дощатая воронка', 'ГД + арт', 'Настил расширяется веером от косы, по краям колья с верёвкой. Узкое горло для высадки.'],
  ['3 · Каменные ворота', 'ГД', 'Валуны и столбы с перекладиной — рубеж «пляж → дорога». Плацдарм-сбор перед проёмом.'],
  ['4 · Сходящиеся колеи', 'ГД', 'Три колеи от прибоя сходятся в одну дорогу, брошенный обоз даёт укрытия.'],
  ['5 · Гравий с валами', 'ГД + арт', 'Щебёнка между валами из водорослей и плавника, арка из камней у воды — читается на мини-карте.'],
  ['6 · Вехи с флагами', 'ГД', 'Цепочка вех над тёмной полосой утрамбованного песка; настоящая дорога начинается у дюн.']
];
const html = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Дорога и пляж</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800&display=swap">
<style>
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --display: 'Lilita One', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; }
  * { box-sizing: border-box; } body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.4; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 22px 16px 44px; }
  h1 { font-family: var(--display); font-weight: 400; font-size: 36px; margin: 0 0 6px; color: #ffe6a8; }
  h2 { font-family: var(--display); font-weight: 400; font-size: 20px; margin: 8px 0 2px; color: #ffe6a8; }
  p { margin: 0 0 6px; color: var(--muted); font-size: 14px; }
  .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 16px; }
  @media (max-width: 860px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } } @media (max-width: 520px) { .grid { grid-template-columns: minmax(0, 1fr); } }
  canvas { display: block; width: 100%; height: auto; border-radius: 18px; border: 4px solid #1a0e06; box-shadow: 0 10px 28px rgba(0,0,0,.5); }
  .tag { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #f2c14a; }
</style>
<div class="wrap"><h1>Дорога и пляж</h1><p>Шесть вариантов, как дорога выходит на песок. Предложили арт-директор и дизайнер уровней; внизу везде мелководье и прибой.</p>
<div class="grid">${cards.map(c => `<section><canvas width="800" height="880" aria-label="${c[0]}"></canvas><h2>${c[0]}</h2><span class="tag">${c[1]}</span><p>${c[2]}</p></section>`).join('')}</div></div>
<script>
'use strict';
${helpers}
${own}
</script>`;
fs.writeFileSync(path.join(__dirname, 'sardinia-road.html'), html);
console.log('ok', html.length);
