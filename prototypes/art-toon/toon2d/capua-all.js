// «Два кольца», all seven improvements: a north gate for the reinforcements, two different gates (west: vineyards and ambushes,
// east: open field, the siege yard, more archers), the act-2 signal, the walled-up arch of Capua in the outer wall (only the ram opens it),
// the gladiator school by the west road, streets / a market / burning houses between the rings, and a night version.
const fs = require('fs'); let t = fs.readFileSync('capua.js', 'utf8');
const swap = (a, b, txt) => { const i = t.indexOf(a), j = t.indexOf(b, i); if (i < 0 || j < 0) { console.error('MISS', a.slice(0, 40)); process.exit(1); } t = t.slice(0, i) + txt + t.slice(j); };
const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); };
swap('function capB(g, r) {', '// ---------------------------------------------------------------- 3.', String.raw`function stalls(g, x, y) { for (const [dx, col] of [[-36, '#e2382c'], [0, '#f2c14a'], [36, '#3fa0d8']]) { rr(g, x + dx - 15, y - 14, 30, 16, 3); fo(g, '#d8c8a4', 2); g.beginPath(); g.moveTo(x + dx - 18, y - 14); g.lineTo(x + dx - 12, y - 28); g.lineTo(x + dx + 12, y - 28); g.lineTo(x + dx + 18, y - 14); g.closePath(); fo(g, col, 2); } }
function flames(g, x, y, s) { for (const [dx, h] of [[-8, 22], [2, 30], [11, 20]]) { g.beginPath(); g.moveTo(x + dx * s - 6 * s, y); g.quadraticCurveTo(x + dx * s - 7 * s, y - h * s * 0.6, x + dx * s, y - h * s); g.quadraticCurveTo(x + dx * s + 7 * s, y - h * s * 0.6, x + dx * s + 6 * s, y); g.closePath(); fo(g, '#ffb030', 1.6); } for (const [dx, dy, rr0] of [[0, -40, 9], [6, -54, 11], [-2, -70, 13]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, rr0 * s, 0, 7); g.fillStyle = 'rgba(70,60,60,.45)'; g.fill(); } }
function burningHouse2(g, x, y) { house(g, x, y); flames(g, x, y - 24, 1); }
function sealedArch(g, x, y) { arch(g, x, y); g.save(); g.beginPath(); g.moveTo(x - 20, y); g.lineTo(x - 20, y - 46); g.arc(x, y - 46, 20, Math.PI, 0); g.lineTo(x + 20, y); g.closePath(); g.clip(); g.fillStyle = '#b8a888'; g.fillRect(x - 22, y - 70, 44, 72); g.strokeStyle = 'rgba(80,60,40,.6)'; g.lineWidth = 1.4; for (let yy = y - 64; yy < y; yy += 8) { g.beginPath(); g.moveTo(x - 22, yy); g.lineTo(x + 22, yy); g.stroke(); for (let xx = x - 22 + ((yy / 8) % 2) * 6; xx < x + 22; xx += 12) { g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy + 8); g.stroke(); } } g.restore(); }
function innerGate(g, x, y) { rr(g, x - 30, y - 34, 60, 36, 4); fo(g, '#7a4a26', 2.6); g.strokeStyle = OL; g.lineWidth = 1.6; for (let k = -20; k <= 20; k += 10) { g.beginPath(); g.moveTo(x + k, y - 32); g.lineTo(x + k, y); g.stroke(); } g.beginPath(); g.moveTo(x, y - 34); g.lineTo(x, y); g.lineWidth = 3; g.stroke(); }
function capB(g, r, night) {
  grass(g, 0, 0, WW, WH, '#8ad25c', r);
  stream(g, [[0, 110], [300, 130], [600, 100], [900, 120]], 70, r); stoneBridge(g, 450, 66, 160, 38);
  // the west approach: vineyards (cover, but ambushes); the east approach: open field with the siege yard
  vineRows(g, 40, 900, 300, 300);
  roads(g, [[[[450, 1500], [450, 1250], [240, 1100], [240, 860]], 34], [[[450, 1250], [660, 1100], [660, 860]], 34], [[[450, 1250], [450, 880]], 30],
    [[[240, 800], [240, 700], [380, 640], [450, 610]], 30, true], [[[660, 800], [660, 700], [520, 640], [450, 610]], 30, true], [[[450, 800], [450, 610]], 30, true],
    [[[230, 640], [230, 300], [670, 300], [670, 640]], 26, true], [[[450, 300], [450, 160]], 34, true]], r);
  // act 1: the outer wall — north gate (reinforcements), west and east gatehouses (capture points), the walled-up arch of Capua in the middle
  wall(g, [[80, 820], [80, 260], [420, 260], [480, 260], [820, 260], [820, 820], [700, 820], [620, 820], [530, 820], [370, 820], [280, 820], [200, 820], [80, 820]], '#d8ccb4', [2, 6, 10]);
  portcullis(g, 450, 276, 0.6); portcullis(g, 240, 836, 0.7); portcullis(g, 660, 836, 0.7); point(g, 240, 880, 70); point(g, 660, 880, 70);
  sealedArch(g, 450, 830); sign(g, 450, 870, 'замурованная арка: только таран', '#f09a24');
  arrowsIn(g, 450, 205, Math.PI / 2); sign(g, 660, 190, 'подкрепления: 1 / 75 с · всего 4', '#9ec1ff');
  // act 2: the citadel ring, its wooden gate, the breach in its west wall, the keep
  wall(g, [[290, 570], [290, 330], [610, 330], [610, 570], [520, 570], [380, 570], [290, 570]], '#e2d6bc', [4]);
  innerGate(g, 450, 590); keep(g, 450, 470); point(g, 450, 492, 84);
  g.fillStyle = '#d8ccb4'; g.fillRect(274, 410, 32, 80); rubble(g, 290, 452, 0); g.beginPath(); g.arc(290, 404, 14, 0, 7); fo(g, '#f09a24', 2.4); g.font = '15px sans-serif'; g.textAlign = 'center'; g.fillText('⛏', 290, 410);
  // between the rings: streets, a market, houses burning near the gates
  stalls(g, 330, 720); stalls(g, 570, 720);
  for (const [x, y] of [[150, 380], [750, 380], [150, 560], [750, 560], [360, 760], [540, 760]]) house(g, x, y);
  burningHouse2(g, 170, 730); burningHouse2(g, 730, 730);
  // the gladiator school right by the west road: a short detour
  ludus(g, 110, 1060); point(g, 110, 1090, 70); squad(g, 180, 1120, 'hastati', 1, 3, 0.7, '#8a8f98', 'square'); sign(g, 120, 1170, 'гладиаторы: +1 отряд', '#ffcc33');
  // the siege yard on the east field
  arsenal(g, 790, 1250); ram(g, 700, 1330); sign(g, 760, 1390, 'осадный двор: таран за 12 с', '#f09a24');
  g.save(); g.setLineDash([4, 12]); g.lineCap = 'round'; g.strokeStyle = 'rgba(240,154,36,.95)'; g.lineWidth = 6; g.beginPath(); g.moveTo(690, 1290); g.quadraticCurveTo(700, 1050, 660, 880); g.stroke(); g.beginPath(); g.moveTo(640, 1300); g.quadraticCurveTo(470, 1100, 450, 880); g.stroke(); g.restore();
  // forward camps, shown faint: they appear behind a gatehouse once it is ours
  g.save(); g.globalAlpha = 0.55; for (const gx of [240, 660]) { tent(g, gx - 34, 780); tent(g, gx + 34, 780); } g.restore();
  for (const [x, y, s] of [[820, 1000, 1], [860, 1120, 0.9], [560, 1200, 1]]) pine(g, x, y, s);
  camp(g, 450, 1410);
  foe(g, [['ambush', 140, 960, 4], ['ambush', 290, 1110, 4], ['e_cav', 520, 1040, 4], ['e_inf', 240, 760, 4], ['e_inf', 660, 760, 4], ['e_arc', 120, 820, 2], ['e_arc', 590, 820, 2], ['e_arc', 780, 820, 3], ['e_arc', 450, 800, 2], ['hoplite', 450, 640, 6], ['e_arc', 320, 400], ['e_arc', 580, 400], ['hoplite', 450, 380, 6], ['e_cav', 450, 220, 4]]);
  ours(g, 450, 1370);
  sign(g, 450, 1482, '↓ из Пренесте', '#ff8a6a'); sign(g, 760, 70, 'Вольтурн', '#9ec1ff'); sign(g, 450, 930, 'Акт 1: внешнее кольцо', '#f2c14a'); sign(g, 450, 312, 'Акт 2: цитадель', '#f2c14a');
  num(g, 450, 1310, 1); num(g, 40, 1060, 2); num(g, 170, 900, 3); num(g, 730, 900, 3); num(g, 520, 820, 4); num(g, 520, 620, 5); num(g, 560, 450, 6); num(g, 250, 404, 7); num(g, 860, 1220, 8); num(g, 520, 250, 9);
  if (night) {
    g.fillStyle = 'rgba(14,20,52,.62)'; g.fillRect(0, 0, WW, WH);
    g.save(); g.globalCompositeOperation = 'lighter';
    const L = [[240, 800, 70], [660, 800, 70], [450, 270, 60], [450, 820, 60], [170, 710, 90], [730, 710, 90], [450, 330, 50], [440, 300, 40], [462, 360, 40], [450, 1400, 120], [790, 1240, 60], [110, 1050, 60], [330, 700, 50], [570, 700, 50]];
    for (let x = 100; x < 820; x += 120) L.push([x, 262, 34], [x, 822, 34]);
    for (const [x, y, rad] of L) { const lg = g.createRadialGradient(x, y, 2, x, y, rad); lg.addColorStop(0, 'rgba(255,190,90,.75)'); lg.addColorStop(1, 'rgba(255,140,40,0)'); g.fillStyle = lg; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); }
    g.restore();
    g.fillStyle = '#fff6c8'; for (let k = 0; k < 40; k++) { const x = (k * 97) % 900, y = (k * 53) % 240; g.beginPath(); g.arc(x, y, 1.4, 0, 7); g.fill(); }
  }
}
// the act-2 signal on the phone: a banner over the citadel, the reinforcement counter out, the forward camp up
function act2(g, src) {
  g.drawImage(src, 180 * 2, 200 * 2, 540 * 2, 300 * 2, 0, 0, 540, 300);
  g.fillStyle = 'rgba(20,10,4,.35)'; g.fillRect(0, 0, 540, 300);
  rr(g, 70, 96, 400, 92, 22); g.fillStyle = 'rgba(40,24,14,.95)'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#f2c14a'; g.stroke();
  g.fillStyle = '#ffe6a8'; g.font = '400 36px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText('АКТ 2 · ЦИТАДЕЛЬ', 270, 142);
  g.font = '800 15px "Alegreya Sans", sans-serif'; g.fillStyle = '#e2c9a0'; g.fillText('обе башни ваши · подкрепления отрезаны · у ворот палатки', 270, 170);
  rr(g, 330, 16, 196, 34, 17); g.fillStyle = 'rgba(40,24,14,.92)'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#6a7a8a'; g.stroke(); g.fillStyle = '#8a9aaa'; g.font = '800 14px "Alegreya Sans", sans-serif'; g.fillText('подкрепления 2/4 · ⛔', 428, 38);
}
`);
rep("const MAPS3 = [['ca', capA, 51], ['cb', capB, 53], ['cc', capC, 57], ['cd', capD, 59]];", "const MAPS3 = [['ca', capA, 51], ['cb', capB, 53], ['cc', capC, 57], ['cd', capD, 59]];\nconst EXTRA = () => { const n = document.getElementById('cbn').getContext('2d'); n.scale(2, 2); capB(n, rng(53), true); const u = document.getElementById('cbu').getContext('2d'); u.scale(2, 2); act2(u, document.getElementById('cb')); };");
rep("fn(g, rng(seed)); } };", "fn(g, rng(seed)); } EXTRA(); };");
// the card for «Два кольца»: replace its whole item list
{ const a = t.indexOf("  ${card('cb'"), b = t.indexOf('\n', a); t = t.slice(0, a) + "  ${card('cb', '2. Два кольца', 'идея геймдизайнера · осада в два акта · доработано по всем семи пунктам', ['<b>Лагерь (1)</b> внизу; реку переходить не нужно — Вольтурн течёт за городом.', '<b>Школа гладиаторов (2)</b> прямо у западной дороги: короткий крюк — и к вам присоединяется пятый отряд, гладиаторы.', '<b>Двое разных ворот (3).</b> Западные — подход через виноградники: укрытие, но в лозе засады. Восточные — открытое поле, рядом осадный двор, но на стене больше лучников. Встать у надвратной башни — точка захвата, инженеры поднимают решётку за 8 с.', '<b>Замурованная арка Капуи (4)</b> посреди внешней стены — прямой путь к цитадели, но открыть её может только таран.', '<b>Осадный двор (8)</b> на восточном поле: таран за 12 с; он выбивает решётку, замурованную арку или ворота цитадели за 8 с.', '<b>Между кольцами</b>: мощёные улицы от всех ворот к цитадели, рынок, горящие дома у ворот; у взятых ворот появляются палатки — передовой лагерь.', '<b>Акт 2 — цитадель (5, 6)</b>: деревянные ворота под охраной фаланги или <b>пролом (7)</b> с завалом в западной стене. Донжон — финал, из него выходит гарнизон в контратаку.', '<b>Северные ворота (9)</b>: через них по мосту приходят подкрепления — 1 отряд в 75 с, всего 4, пока вы не взяли обе башни.'])}\n  <article class=\"city\"><div class=\"map\"><canvas id=\"cbn\" width=\"1800\" height=\"3000\" aria-label=\"Два кольца ночью\"></canvas></div><section><h2>2. Два кольца — ночью</h2><p class=\"sub\">финал при свете факелов</p><p>Тот же бой ночью: свет у ворот, факелы на стенах, окна донжона, горящие дома, костры лагеря. Сверху — сигнал смены актов на экране телефона:</p><div class=\"map\" style=\"margin-top:10px\"><canvas id=\"cbu\" width=\"1080\" height=\"600\" aria-label=\"Сигнал: акт 2\"></canvas></div></section></article>" + t.slice(b); }
fs.writeFileSync('capua.js', t); console.log('ok');
