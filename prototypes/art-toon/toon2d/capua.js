// Builds capua.html: three concepts for the finale «Столица» (5/5), from the game-designer and level-designer passes (2026-10-06).
// Reuses every drawing helper of cities.js (its draw section) and adds the keep, the gladiator school and the three maps.
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'cities.js'), 'utf8');
// run cities.js's template pieces without writing its page: take its script body as assembled by cities.html
const page = fs.readFileSync(path.join(__dirname, 'cities.html'), 'utf8');
let base = page.slice(page.indexOf("<script>\n'use strict';") + "<script>\n'use strict';".length, page.lastIndexOf('</script>'));
base = base.slice(0, base.indexOf('const CITIES = ')) ; // keep helpers and the four city functions, drop its own startup
const draw = String.raw`
// ---------------------------------------------------------------- Capua's own pieces
function keep(g, x, y) {
  g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 12, y + 6, 70, 16, 0, 0, 7); g.fill();
  rr(g, x - 60, y - 40, 120, 44, 4); fo(g, '#cfc3ac', 2.8); for (let k = 0; k < 7; k++) { rr(g, x - 58 + k * 17, y - 50, 11, 12, 2); fo(g, '#cfc3ac', 2); }
  rr(g, x - 34, y - 190, 68, 150, 4); fo(g, '#e2d6bc', 2.8); for (let k = 0; k < 4; k++) { rr(g, x - 32 + k * 17, y - 202, 11, 14, 2); fo(g, '#e2d6bc', 2); }
  for (const [dx, dy] of [[-14, -150], [14, -150], [0, -110]]) { rr(g, x + dx - 4, y + dy, 8, 16, 4); fo(g, '#2a1a10', 1.6); }
  rr(g, x - 14, y - 30, 28, 30, 12); fo(g, '#3a2414', 2.2);
  for (let k = 0; k < 5; k++) { rr(g, x - 50 + k * 4, y + 4 + k * 8, 100 - k * 8, 8, 2); fo(g, '#d8ccb4', 1.8); }
  flag(g, x + 2, y - 250, '#3f7ae0', 48);
}
function ludus(g, x, y) {
  g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 8, y + 4, 86, 16, 0, 0, 7); g.fill();
  rr(g, x - 80, y - 70, 160, 74, 6); fo(g, '#e2cfa6', 2.8); rr(g, x - 62, y - 56, 124, 48, 4); fo(g, '#e6c890', 2.2);
  for (let k = 0; k < 7; k++) { rr(g, x - 60 + k * 20, y - 66, 6, 14, 2); fo(g, '#fffaf0', 1.4); }
  for (const dx of [-30, 0, 30]) { rr(g, x + dx - 3, y - 44, 6, 26, 2); fo(g, '#8a5a30', 1.6); rr(g, x + dx - 9, y - 40, 18, 4, 2); fo(g, '#8a5a30', 1.4); }
  rr(g, x - 86, y - 80, 172, 14, 4); fo(g, '#c8603a', 2.4);
}
function ram(g, x, y) {
  g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 6, y + 6, 54, 10, 0, 0, 7); g.fill();
  for (const dx of [-34, -12, 12, 34]) { g.beginPath(); g.arc(x + dx, y, 9, 0, 7); fo(g, '#6a4020', 2.2); g.beginPath(); g.arc(x + dx, y, 3, 0, 7); g.fillStyle = OL; g.fill(); }
  rr(g, x - 46, y - 30, 92, 26, 4); fo(g, '#9a6234', 2.6); g.beginPath(); g.moveTo(x - 52, y - 28); g.lineTo(x, y - 56); g.lineTo(x + 52, y - 28); g.closePath(); fo(g, '#b07a40', 2.6);
  g.strokeStyle = 'rgba(60,30,10,.5)'; g.lineWidth = 1.6; for (let k = -40; k <= 40; k += 13) { g.beginPath(); g.moveTo(x + k, y - 29); g.lineTo(x + k * 0.1, y - 54); g.stroke(); }
  rr(g, x + 40, y - 22, 26, 12, 5); fo(g, '#8a8a8a', 2.2); rr(g, x - 60, y - 20, 104, 9, 4); fo(g, '#7a4a26', 2);
}
function arsenal(g, x, y) {
  rr(g, x - 70, y - 56, 140, 58, 4); fo(g, '#d8c8a4', 2.8); rr(g, x - 76, y - 70, 152, 16, 3); fo(g, '#c8603a', 2.4);
  for (let k = 0; k < 3; k++) { rr(g, x - 54 + k * 40, y - 40, 28, 42, 4); fo(g, '#5a3a20', 2); }
  for (let k = 0; k < 4; k++) { rr(g, x - 96, y - 10 - k * 9, 60, 9, 4); fo(g, '#a8783e', 1.8); }
}
function villa(g, x, y) { mound(g, x, y + 20, 110, 56); house(g, x - 30, y + 6); horrea(g, x + 30, y + 14); for (const [dx, dy] of [[-80, 30], [80, 26]]) pine(g, x + dx, y + dy, 0.9); }
function arrowsIn(g, x, y, ang) { g.save(); g.translate(x, y); g.rotate(ang); g.beginPath(); g.moveTo(-40, -12); g.lineTo(10, -12); g.lineTo(10, -24); g.lineTo(36, 0); g.lineTo(10, 24); g.lineTo(10, 12); g.lineTo(-40, 12); g.closePath(); fo(g, 'rgba(63,122,224,.9)', 2.6); g.restore(); }
function vineRows(g, x, y, w, h) { for (let yy = y; yy < y + h; yy += 26) { rr(g, x, yy, w, 14, 7); g.fillStyle = '#5aa83a'; g.fill(); g.lineWidth = 2; g.strokeStyle = OL; g.stroke(); for (let xx = x + 10; xx < x + w - 6; xx += 18) { g.fillStyle = '#7a3a8a'; g.beginPath(); g.arc(xx, yy + 8, 2.6, 0, 7); g.fill(); } } }

// ---------------------------------------------------------------- 1. «Аппиева ось» — everything on one vertical: camp → river → arch → keep
function capA(g, r) {
  grass(g, 0, 0, WW, WH, '#8ad25c', r);
  vineRows(g, 60, 900, 230, 180); vineRows(g, 600, 1120, 240, 150);
  roads(g, [[[[450, 1500], [450, 1200], [450, 900], [450, 700], [450, 560], [450, 420]], 40, false], [[[450, 1200], [200, 1080], [150, 800]], 26], [[[450, 1200], [700, 1060], [760, 800]], 26], [[[450, 640], [450, 420]], 40, true]], r);
  stream(g, [[0, 770], [300, 750], [600, 760], [900, 740]], 70, r);
  for (const [x, y, s] of [[140, 750, 1], [160, 770, 1.1], [130, 780, 0.9], [170, 742, 0.8]]) stone(g, x, y, s);
  stoneBridge(g, 450, 704, 806, 40); stoneBridge(g, 760, 698, 786, 26);
  wall(g, [[120, 640], [120, 300], [250, 170], [450, 120], [650, 170], [780, 300], [780, 640], [560, 640], [340, 640], [120, 640]], '#d8ccb4', [7]);
  arch(g, 450, 650);
  g.beginPath(); g.ellipse(450, 480, 150, 60, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke();
  keep(g, 450, 340); point(g, 450, 360, 92);
  for (const [x, y] of [[230, 300], [670, 300], [220, 480], [680, 480], [320, 220], [580, 220]]) house(g, x, y);
  villa(g, 180, 1000); point(g, 180, 1030, 74);
  arena(g, 740, 960, 90, 56, r); ludus(g, 740, 870); point(g, 740, 980, 80);
  camp(g, 450, 1400);
  foe(g, [['e_inf', 450, 680, 5], ['hoplite', 450, 600, 6], ['e_arc', 330, 620], ['e_arc', 570, 620], ['e_inf', 760, 650, 3], ['e_arc', 200, 640], ['e_inf', 220, 960, 4], ['ambush', 120, 940, 4], ['e_inf', 700, 1020, 4], ['e_cav', 600, 900, 4], ['hoplite', 450, 450, 6], ['e_arc', 300, 360], ['e_arc', 600, 360], ['e_cav', 260, 520], ['e_cav', 640, 520]]);
  ours(g, 450, 1360);
  sign(g, 450, 1482, '↓ из Пренесте', '#ff8a6a'); sign(g, 300, 810, 'Вольтурн', '#9ec1ff');
  num(g, 450, 1300, 1); num(g, 90, 1080, 2); num(g, 840, 1040, 3); num(g, 110, 820, 4); num(g, 520, 760, 4); num(g, 820, 760, 4); num(g, 540, 700, 5); num(g, 560, 230, 6);
}
// ---------------------------------------------------------------- 2. «Два кольца» — a siege in two acts; the Volturnus behind the city
function stalls(g, x, y) { for (const [dx, col] of [[-36, '#e2382c'], [0, '#f2c14a'], [36, '#3fa0d8']]) { rr(g, x + dx - 15, y - 14, 30, 16, 3); fo(g, '#d8c8a4', 2); g.beginPath(); g.moveTo(x + dx - 18, y - 14); g.lineTo(x + dx - 12, y - 28); g.lineTo(x + dx + 12, y - 28); g.lineTo(x + dx + 18, y - 14); g.closePath(); fo(g, col, 2); } }
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
// ---------------------------------------------------------------- 3. «Мост подкреплений» — open Campania, a race against reinforcements over the Volturnus
function capC(g, r) {
  grass(g, 0, 0, WW, WH, '#8ad25c', r);
  stream(g, [[300, 0], [420, 120], [560, 240], [720, 300], [900, 330]], 70, r);
  wall(g, [[0, 420], [180, 420], [300, 300], [300, 160], [240, 0]], '#d8ccb4');
  for (const [x, y] of [[90, 220], [170, 320], [80, 120], [200, 140]]) house(g, x, y);
  roads(g, [[[[450, 1500], [450, 1200], [430, 900], [400, 640], [340, 470]], 36], [[[450, 1200], [640, 980], [720, 700], [700, 420], [680, 330]], 30], [[[430, 900], [220, 760], [200, 680]], 26], [[[680, 330], [700, 200], [760, 0]], 30]], r);
  stoneBridge(g, 690, 236, 340, 44); arrowsIn(g, 760, 120, Math.PI * 0.62);
  rr(g, 640, 360, 100, 50, 4); fo(g, '#d8ccb4', 2.6); for (let k = 0; k < 6; k++) { rr(g, 642 + k * 16, 352, 11, 10, 2); fo(g, '#d8ccb4', 2); } point(g, 690, 410, 66);
  villa(g, 200, 640); point(g, 200, 668, 76);
  arch(g, 340, 470); point(g, 340, 494, 84);
  for (const [x, y, w, h] of [[80, 860, 200, 150], [560, 760, 120, 240], [300, 1060, 200, 120], [720, 1080, 140, 160]]) vineRows(g, x, y, w, h);
  for (const [x, y, s] of [[820, 600, 1], [500, 560, 0.9], [120, 1300, 1], [800, 1380, 1]]) pine(g, x, y, s);
  camp(g, 450, 1400);
  foe(g, [['hoplite', 420, 820, 6], ['hoplite', 640, 900, 6], ['e_cav', 560, 640, 4], ['e_cav', 260, 960, 4], ['e_arc', 240, 600], ['e_inf', 160, 700, 4], ['e_inf', 690, 450, 5], ['e_arc', 620, 400], ['e_arc', 760, 400], ['e_inf', 340, 560, 5], ['e_arc', 260, 420], ['ambush', 620, 860, 3]]);
  ours(g, 450, 1360);
  sign(g, 450, 1482, '↓ из Пренесте', '#ff8a6a'); sign(g, 820, 250, 'Вольтурн', '#9ec1ff'); sign(g, 780, 60, 'подкрепления', '#9ec1ff'); sign(g, 120, 450, 'Капуя', '#f2c14a');
  num(g, 450, 1300, 1); num(g, 110, 600, 2); num(g, 780, 420, 3); num(g, 800, 330, 4); num(g, 420, 420, 5); num(g, 500, 860, 6);
}
// ---------------------------------------------------------------- 4. «Ось и два кольца» — the mix of 1 and 2
function capD(g, r) {
  grass(g, 0, 0, WW, WH, '#8ad25c', r);
  stream(g, [[0, 80], [300, 100], [600, 70], [900, 90]], 60, r); stoneBridge(g, 450, 40, 124, 34); arrowsIn(g, 450, 170, Math.PI / 2);
  sign(g, 660, 160, 'подкрепления: 1 / 75 с · всего 4', '#9ec1ff');
  vineRows(g, 40, 1060, 220, 140); vineRows(g, 640, 1180, 220, 120);
  roads(g, [[[[450, 1500], [450, 1220], [450, 1000], [450, 900], [450, 820]], 38], [[[450, 1220], [190, 1110], [170, 960], [240, 820]], 26], [[[450, 1220], [730, 1100], [730, 960], [660, 820]], 26], [[[240, 760], [240, 690], [450, 640], [660, 690], [660, 760]], 30, true], [[[450, 640], [450, 560], [450, 440]], 36, true], [[[450, 300], [450, 130]], 32, true]], r);
  // the Volturnus in front of the city: a ford, the main bridge, a narrow footbridge
  stream(g, [[0, 920], [300, 900], [600, 910], [900, 890]], 66, r);
  for (const [x, y, s] of [[160, 900, 1], [182, 918, 1.1], [150, 930, 0.9], [190, 892, 0.8]]) stone(g, x, y, s);
  stoneBridge(g, 450, 856, 956, 40); stoneBridge(g, 730, 846, 934, 24);
  // act 1: the outer wall along the river — the arch in the middle is the strongest gate, the two gatehouses are the capture points
  wall(g, [[80, 780], [80, 240], [820, 240], [820, 780], [700, 780], [620, 780], [530, 780], [370, 780], [280, 780], [200, 780], [80, 780]], '#d8ccb4', [4, 6, 8]);
  arch(g, 450, 796); portcullis(g, 240, 794, 0.66); portcullis(g, 660, 794, 0.66); point(g, 240, 836, 66); point(g, 660, 836, 66);
  // act 2: the inner ring and the keep
  wall(g, [[290, 560], [290, 330], [610, 330], [610, 560], [520, 560], [380, 560], [290, 560]], '#e2d6bc', [4]);
  keep(g, 450, 470); point(g, 450, 492, 84);
  for (const [x, y] of [[160, 360], [740, 360], [160, 600], [740, 600], [180, 700], [720, 700]]) house(g, x, y);
  villa(g, 160, 1130); arena(g, 740, 1060, 80, 50, r); ludus(g, 740, 980);
  camp(g, 450, 1410);
  foe(g, [['e_inf', 450, 840, 5], ['hoplite', 450, 720, 6], ['e_arc', 360, 780, 2], ['e_arc', 540, 780, 2], ['e_inf', 240, 740, 4], ['e_inf', 660, 740, 4], ['e_arc', 110, 780, 2], ['e_arc', 790, 780, 2], ['ambush', 120, 1100, 4], ['e_cav', 620, 1000, 4], ['hoplite', 450, 600, 6], ['e_arc', 330, 380], ['e_arc', 570, 380], ['e_inf', 450, 380, 5], ['e_cav', 450, 200, 4]]);
  ours(g, 450, 1370);
  sign(g, 450, 1482, '↓ из Пренесте', '#ff8a6a'); sign(g, 300, 960, 'Вольтурн', '#9ec1ff'); sign(g, 450, 880, 'Акт 1: внешняя стена', '#f2c14a'); sign(g, 450, 310, 'Акт 2: цитадель', '#f2c14a');
  num(g, 450, 1310, 1); num(g, 90, 1200, 2); num(g, 840, 1120, 2); num(g, 120, 870, 3); num(g, 520, 900, 3); num(g, 790, 870, 3); num(g, 520, 740, 4); num(g, 170, 830, 5); num(g, 730, 830, 5); num(g, 560, 440, 6);
}
const MAPS3 = [['ca', capA, 51], ['cb', capB, 53], ['cc', capC, 57], ['cd', capD, 59]];
const EXTRA = () => { const n = document.getElementById('cbn').getContext('2d'); n.scale(2, 2); capB(n, rng(53), true); const u = document.getElementById('cbu').getContext('2d'); u.scale(2, 2); act2(u, document.getElementById('cb')); };
const go = () => { for (const [id, fn, seed] of MAPS3) { const c = document.getElementById(id), g = c.getContext('2d'); g.scale(2, 2); fn(g, rng(seed)); } EXTRA(); };
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load('900 20px "Lilita One"'), document.fonts.load('700 13px "Alegreya Sans"')]).catch(() => 0) : Promise.resolve()).then(go);
`;
const card = (id, title, who, items) => `<article class="city"><div class="map"><canvas id="${id}" width="1800" height="3000" aria-label="Капуя: ${title}"></canvas></div><section><h2>${title}</h2><p class="sub">${who}</p><ol>${items.map(i => '<li>' + i + '</li>').join('')}</ol></section></article>`;
const html = `<title>Капуя: варианты финала</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800;900&display=swap">
<style>
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --gold: #f2c14a; --display: 'Lilita One', 'Alegreya Sans', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.45; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 28px 16px 56px; }
  h1 { font-family: var(--display); font-weight: 400; font-size: 42px; line-height: 1.05; margin: 0 0 10px; color: #ffe6a8; }
  h2 { font-family: var(--display); font-weight: 400; font-size: 30px; margin: 0 0 4px; color: #ffe6a8; }
  p { margin: 0 0 10px; color: var(--muted); max-width: 860px; } b { color: var(--ink); } .sub { color: var(--gold); font-weight: 800; }
  .city { display: grid; grid-template-columns: minmax(0, 440px) minmax(0, 1fr); gap: 24px; align-items: start; margin: 28px 0 40px; }
  @media (max-width: 860px) { .city { grid-template-columns: minmax(0, 1fr); } }
  .map { border-radius: 22px; overflow: hidden; border: 4px solid #1a0e06; box-shadow: 0 18px 44px rgba(0,0,0,.55); line-height: 0; }
  canvas { display: block; width: 100%; height: auto; }
  ol { margin: 0; padding-left: 22px; color: var(--muted); display: grid; gap: 6px; } li::marker { color: var(--gold); font-weight: 900; }
</style>
<div class="wrap">
  <h1>Капуя: варианты финала</h1>
  <p>Финал кампании, сила врага 5/5. Три разные идеи от геймдизайнера и левел-дизайнера. Во всех — значок Капуи с карты кампании (высокая башня и триумфальная арка) и Кампания: виноградники, виллы, школа гладиаторов.</p>
  ${card('ca', '1. Аппиева ось', 'идея левел-дизайнера · всё на одной вертикали — лучше всего читается на телефоне', ['<b>Лагерь</b> внизу, дорога идёт прямо вверх — цель видна с первого экрана.', '<b>Вилла</b> на холме среди виноградников — точка захвата слева.', '<b>Школа гладиаторов и амфитеатр</b> — точка захвата справа, ~540 шагов от виллы: придётся разделиться или брать по очереди.', '<b>Три переправы</b> через Вольтурн: брод на западе (длинно, мало охраны), главный мост (коротко, самая плотная оборона), узкий мостик на востоке у амфитеатра.', '<b>Триумфальная арка</b> — главные ворота, за ней фаланга и открытый форум для манёвра.', '<b>Донжон</b> — высокая башня, видна издалека; финал на её ступенях.'])}
  ${card('cb', '2. Два кольца', 'идея геймдизайнера · осада в два акта · доработано по всем семи пунктам', ['<b>Лагерь (1)</b> внизу; реку переходить не нужно — Вольтурн течёт за городом.', '<b>Школа гладиаторов (2)</b> прямо у западной дороги: короткий крюк — и к вам присоединяется пятый отряд, гладиаторы.', '<b>Двое разных ворот (3).</b> Западные — подход через виноградники: укрытие, но в лозе засады. Восточные — открытое поле, рядом осадный двор, но на стене больше лучников. Встать у надвратной башни — точка захвата, инженеры поднимают решётку за 8 с.', '<b>Замурованная арка Капуи (4)</b> посреди внешней стены — прямой путь к цитадели, но открыть её может только таран.', '<b>Осадный двор (8)</b> на восточном поле: таран за 12 с; он выбивает решётку, замурованную арку или ворота цитадели за 8 с.', '<b>Между кольцами</b>: мощёные улицы от всех ворот к цитадели, рынок, горящие дома у ворот; у взятых ворот появляются палатки — передовой лагерь.', '<b>Акт 2 — цитадель (5, 6)</b>: деревянные ворота под охраной фаланги или <b>пролом (7)</b> с завалом в западной стене. Донжон — финал, из него выходит гарнизон в контратаку.', '<b>Северные ворота (9)</b>: через них по мосту приходят подкрепления — 1 отряд в 75 с, всего 4, пока вы не взяли обе башни.'])}
  <article class="city"><div class="map"><canvas id="cbn" width="1800" height="3000" aria-label="Два кольца ночью"></canvas></div><section><h2>2. Два кольца — ночью</h2><p class="sub">финал при свете факелов</p><p>Тот же бой ночью: свет у ворот, факелы на стенах, окна донжона, горящие дома, костры лагеря. Сверху — сигнал смены актов на экране телефона:</p><div class="map" style="margin-top:10px"><canvas id="cbu" width="1080" height="600" aria-label="Сигнал: акт 2"></canvas></div></section></article>
  ${card('cc', '3. Мост подкреплений', 'идея геймдизайнера · гонка на открытой равнине Кампании', ['<b>Лагерь</b> внизу, перед вами открытое поле с коридорами виноградников.', '<b>Вилла</b> на холме — точка захвата.', '<b>Предмостное укрепление</b> — точка захвата. Пока враг держит мост через Вольтурн, каждые 60 с к нему приходит новый отряд; после захвата инженеры могут обрушить мост.', '<b>Мост</b>, по которому идут подкрепления (синяя стрелка).', '<b>Триумфальная арка</b> на Аппиевой дороге у стены Капуи — финал.', '<b>Две фаланги в поле</b> — первая карта, где их правда можно обойти с фланга конницей.'])}
  ${card('cd', '4. Ось и два кольца — смесь 1 и 2', 'по вашей просьбе: что взяли из первого и из второго', ['<b>Из первого:</b> всё на одной оси — лагерь, главный мост, арка, донжон; Вольтурн перед городом с тремя переправами (брод, мост, мостик); вилла и школа гладиаторов на нашем берегу (2) — побочные цели.', '<b>Переправы (3)</b>: брод на западе — длинно, мост — коротко и прямо к арке, мостик на востоке — к восточной башне.', '<b>Арка (4)</b> — самые сильные ворота: фаланга и лучники на стене. Её можно не штурмовать.', '<b>Из второго:</b> две надвратные башни (5) — точки захвата, решётки поднимают инженеры; взяв обе, вы отрезаете подкрепления (1 отряд / 75 с, всего 4) и заходите в город с двух сторон.', '<b>Акт 2 — цитадель (6)</b>: внутреннее кольцо, донжон — финал; при входе гарнизон выходит в контратаку.'])}
  <p><b>Рекомендации команды:</b> левел-дизайнер советует «Аппиеву ось» — лагерь, дорога, мост, арка и донжон на одной линии, задача видна без прокрутки. Геймдизайнер советует «Два кольца» — единственный вариант, где финал ощущается кульминацией: второй акт, штурм цитадели. Можно соединить: ось из первого варианта и второй акт из второго.</p>
</div>
<script>
'use strict';
${base}
${draw}
</script>
`;
fs.writeFileSync(path.join(__dirname, 'capua.html'), html);
console.log('ok', html.length);
