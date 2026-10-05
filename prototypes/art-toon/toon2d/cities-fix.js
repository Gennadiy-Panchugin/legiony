// Fixes after review: rivers flow into the sea, harbours open to the sea, nobody stands in water, nicer coast,
// a readable aqueduct, two gates into Praeneste, Capua's points spread across the map.
const fs = require('fs'); let t = fs.readFileSync('cities.js', 'utf8');
const swap = (a, b, txt) => { const i = t.indexOf(a), j = t.indexOf(b, i); if (i < 0 || j < 0) { console.error('MISS', a.slice(0, 40)); process.exit(1); } t = t.slice(0, i) + txt + t.slice(j); };
swap('// ---------------------------------------------------------------- extra pieces for the coast', 'const CITIES = ', String.raw`// ---------------------------------------------------------------- extra pieces for the coast
function stick(g, x0, y0, x1, y1, col, w) { g.strokeStyle = OL; g.lineWidth = w + 2.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
function crane(g, x, y) { stick(g, x, y, x + 6, y - 70, '#8a5a30', 4); stick(g, x + 6, y - 70, x + 40, y - 60, '#8a5a30', 3); g.strokeStyle = OL; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x + 40, y - 60); g.lineTo(x + 40, y - 30); g.stroke(); rr(g, x + 32, y - 30, 16, 12, 3); fo(g, '#c8a070', 1.8); }
function raft(g, x, y) { g.setLineDash([4, 4]); g.strokeStyle = '#6a4020'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 60); g.lineTo(x, y + 60); g.stroke(); g.setLineDash([]); rr(g, x - 26, y - 14, 52, 28, 5); fo(g, '#a8783e', 2.4); g.strokeStyle = OL; g.lineWidth = 1.6; for (let k = -18; k <= 18; k += 9) { g.beginPath(); g.moveTo(x + k, y - 13); g.lineTo(x + k, y + 13); g.stroke(); } }
function oliveTerrace(g, x, y, w, rows) { for (let k = 0; k < rows; k++) { const yy = y + k * 40; rr(g, x, yy, w, 30, 8); fo(g, k % 2 ? '#a6d468' : '#9ccc5a', 2.2); rr(g, x, yy + 26, w, 8, 4); fo(g, '#c8b894', 1.8); for (let ox = x + 20; ox < x + w - 10; ox += 44) olive(g, ox, yy + 22, 0.55); } }
function lagoon(g, pts, r) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); const lg = g.createLinearGradient(0, 900, 0, 1250); lg.addColorStop(0, '#7ec8a8'); lg.addColorStop(1, '#5aa890'); fo(g, lg, 2.8); g.save(); g.clip(); for (let i = 0; i < 22; i++) { g.fillStyle = 'rgba(160,210,120,.6)'; g.beginPath(); g.ellipse(700 + r() * 200, 940 + r() * 280, 10 + r() * 12, 4 + r() * 4, 0.3, 0, 7); g.fill(); } g.restore(); for (const [x, y] of pts) reeds(g, x, y); }
// the coast: sand along the shore with breaks where rivers meet the sea; a river mouth widens and blends into the water
function shore(g, xs, from, to) { g.beginPath(); g.moveTo(xs - 6, from); for (let y = from; y <= to; y += 40) g.lineTo(xs + 46 + Math.sin(y * 0.05) * 8, y); g.lineTo(xs - 6, to); g.closePath(); fo(g, '#f2d690', 2.4); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 5; g.beginPath(); g.moveTo(xs - 4, from); g.lineTo(xs - 4, to); g.stroke(); }
function mouth(g, xs, y, w) {
  g.beginPath(); g.moveTo(xs + 90, y - w / 2); g.quadraticCurveTo(xs + 20, y - w / 2, xs - 30, y - w * 1.1); g.lineTo(xs - 30, y + w * 1.1); g.quadraticCurveTo(xs + 20, y + w / 2, xs + 90, y + w / 2); g.closePath();
  const mg = g.createLinearGradient(xs + 90, 0, xs - 30, 0); mg.addColorStop(0, '#3aa8e0'); mg.addColorStop(1, 'rgba(42,143,208,0)'); g.fillStyle = mg; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3; g.lineCap = 'round'; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(xs - 6, y + k * w * 0.45 - 6); g.quadraticCurveTo(xs - 18, y + k * w * 0.45, xs - 6, y + k * w * 0.45 + 6); g.stroke(); }
}
// a harbour basin cut into the coast, open to the sea, with two moles
function harbour(g, xs, y0, y1, depth) { g.fillStyle = '#2a8fd0'; g.fillRect(xs - 40, y0, depth + 40, y1 - y0); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2.6; for (let k = 0; k < 6; k++) { const x = xs + (k % 3) * 26, y = y0 + 18 + Math.floor(k / 3) * 50; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 7, y - 4, x + 14, y); g.stroke(); }
  g.lineWidth = 3; g.strokeStyle = OL; g.beginPath(); g.moveTo(xs + depth, y0); g.lineTo(xs + depth, y1); g.stroke();
  rr(g, xs - 70, y0 - 16, depth + 70, 16, 5); fo(g, '#b8ab92', 2.6); rr(g, xs - 70, y1, depth + 50, 16, 5); fo(g, '#b8ab92', 2.6); }
function sandWood(g, pts, r) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = '#e8d49a'; g.fill(); g.save(); g.clip(); for (let i = 0; i < 70; i++) { const x = 140 + r() * 260, y = 920 + r() * 560; g.strokeStyle = 'rgba(90,140,50,.85)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x - 6, y - 9); g.moveTo(x, y); g.lineTo(x, y - 11); g.moveTo(x + 4, y); g.lineTo(x + 6, y - 9); g.stroke(); } g.restore(); }
function hummock(g, x, y, rx) { blob(g, x, y, rx, rx * 0.5, x, 10); fo(g, '#7cb84a', 2.4); reeds(g, x - rx * 0.6, y); reeds(g, x + rx * 0.5, y - 4); }

// ---------------------------------------------------------------- ОСТИЯ · Устье Тибра · 2/5
// The Tiber splits around the Sacred Island: a bridge to the island and another into the town, or a ferry to the shipyard;
// a salt lagoon east of the town; a pine wood on the sand by the sea; the harbour open to the sea with its lighthouse.
function ostia(g, r) {
  const XS = 150;
  grass(g, 0, 0, WW, WH, '#86d05a', r); sea(g, 0, 0, XS, WH, r);
  sandWood(g, [[XS, 930], [330, 940], [380, 1120], [340, 1480], [XS, 1500]], r);
  lagoon(g, [[710, 940], [820, 920], [890, 980], [890, 1200], [800, 1240], [720, 1180]], r);
  roads(g, [[[[900, 1340], [720, 1360], [520, 1330], [420, 1240], [400, 1080], [380, 944]], 34], [[[520, 1330], [560, 1220], [590, 1160]], 26], [[[520, 1330], [640, 1100], [690, 880]], 26], [[[380, 850], [380, 660]], 30], [[[380, 560], [370, 520], [380, 420], [420, 260], [430, 0]], 34, true]], r);
  stream(g, [[900, 640], [700, 660], [520, 640], [360, 600], [220, 560]], 64, r);
  stream(g, [[900, 640], [760, 720], [600, 830], [420, 900], [260, 880], [220, 890]], 58, r);
  mouth(g, XS, 560, 64); mouth(g, XS, 890, 58);
  harbour(g, XS, 300, 440, 110);
  shore(g, XS, 0, 284); shore(g, XS, 456, 520); shore(g, XS, 604, 856); shore(g, XS, 924, 1500);
  rr(g, 60, 448, 50, 16, 5); fo(g, '#b8ab92', 2.4); lighthouse(g, 82, 452); trireme(g, 205, 370, 0.42);
  for (const [x, y, s] of [[300, 760, 1], [450, 790, 1.1], [520, 745, 0.9], [250, 720, 1]]) pine(g, x, y, s);
  rr(g, 600, 715, 90, 40, 6); fo(g, '#c8a070', 2.4); crane(g, 600, 723); trireme(g, 660, 732, 0.4);
  stoneBridge(g, 380, 560, 660, 34); stoneBridge(g, 380, 850, 944, 34); raft(g, 690, 815);
  saltPans(g, 520, 1100, 3, 2);
  wall(g, [[262, 520], [262, 140], [560, 110], [760, 200], [760, 520]], '#d8ccb4', [2]); crane(g, 272, 330);
  for (const [x, y] of [[340, 210], [500, 180], [650, 260], [330, 470], [560, 500], [680, 450]]) horrea(g, x, y);
  g.beginPath(); g.ellipse(450, 340, 96, 52, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke(); point(g, 450, 346, 80); temple(g, 450, 340, 112);
  point(g, 590, 1130, 68); point(g, 640, 740, 60);
  grove(g, 250, 1240, 56, 110, 9, 4); for (const [x, y, s] of [[300, 1060, 1], [210, 1420, 0.9], [820, 1360, 1], [620, 1420, 0.9], [840, 820, 1]]) pine(g, x, y, s);
  boat(g, 70, 1150, 0.9); boat(g, 60, 220, 0.8);
  camp(g, 720, 1400);
  foe(g, [['e_arc', 380, 720], ['e_inf', 330, 1000, 4], ['e_inf', 610, 738, 3], ['e_arc', 560, 1040], ['ambush', 250, 1230, 4], ['e_inf', 560, 560, 4], ['e_arc', 330, 490], ['e_inf', 450, 250, 5], ['e_cav', 620, 330]]);
  ours(g, 720, 1360);
  sign(g, 800, 1290, '← из Рима', '#ff8a6a'); sign(g, 470, 24, '↑ к Анцию', '#9ec1ff'); sign(g, 75, 160, 'море', '#9ec1ff'); sign(g, 430, 820, 'Священный остров', '#e2c9a0'); sign(g, 800, 1170, 'лагуна', '#b8e0e0');
  num(g, 780, 1320, 1); num(g, 650, 1170, 2); num(g, 330, 1180, 3); num(g, 430, 980, 4); num(g, 740, 810, 4); num(g, 560, 700, 5); num(g, 205, 300, 6); num(g, 540, 270, 7);
}
// ---------------------------------------------------------------- АНЦИЙ · Один мост · 3/5
// The town on a cliff headland, its harbour under the cliffs with a stone quay; the Astura with one fortified bridge,
// a sandbar ford at the mouth under the walls and a site for the engineers' bridge; the aqueduct strides across the plain on arches.
function antium(g, r) {
  const XS = 220;
  grass(g, 0, 0, WW, WH, '#80cc54', r); sea(g, 0, 0, XS, WH, r);
  oliveTerrace(g, 690, 120, 180, 5);
  roads(g, [[[[450, 1500], [450, 1240], [450, 1020], [450, 920], [450, 760], [450, 620], [440, 420], [440, 320]], 36], [[[450, 1240], [620, 1140], [740, 1000], [760, 940]], 26], [[[450, 1240], [330, 1080], [290, 940], [290, 880]], 24]], r);
  stream(g, [[900, 900], [700, 880], [560, 860], [450, 858], [320, 836], [290, 832]], 80, r);
  mouth(g, XS, 832, 80);
  for (const [x, y, s] of [[262, 836, 1], [284, 852, 1.1], [302, 828, 0.9], [270, 868, 0.8], [294, 874, 0.9]]) stone(g, x, y, s);
  // the headland: cliffs falling to the sea, the harbour and its quay below the town wall
  { const C = [[XS + 40, 0], [XS + 50, 200], [XS + 70, 390], [XS + 70, 560], [XS + 50, 640]]; g.beginPath(); C.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = C.length - 1; i >= 0; i--) g.lineTo(C[i][0] - 34, C[i][1] + 6); g.closePath(); const cg = g.createLinearGradient(XS, 0, XS + 70, 0); cg.addColorStop(0, '#8a5a30'); cg.addColorStop(1, '#c48a4a'); fo(g, cg, 2.6); }
  harbour(g, XS + 6, 410, 540, 70); rr(g, XS + 70, 410, 46, 130, 6); fo(g, '#cfc3ac', 2.6); boat(g, XS + 30, 470, 0.7); boat(g, XS + 40, 515, 0.6);
  shore(g, XS, 650, 784); shore(g, XS, 880, 1500);
  wall(g, [[340, 600], [340, 160], [500, 110], [660, 170], [670, 600]], '#d8ccb4', [1]);
  { g.save(); g.translate(330, 476); g.rotate(-Math.PI / 2); stairs(g, 0, -20, 26, 40); g.restore(); }
  stoneBridge(g, 450, 810, 906, 36);
  rr(g, 404, 740, 92, 46, 4); fo(g, '#d8ccb4', 2.6); for (let k = 0; k < 6; k++) { rr(g, 406 + k * 15, 732, 10, 10, 2); fo(g, '#d8ccb4', 2); } rr(g, 434, 756, 32, 30, 10); fo(g, '#3a2414', 2.2); point(g, 450, 790, 62);
  bridgeSite(g, 760, 0.0);
  // the aqueduct: one straight arcade across the plain; the road to the bridge site passes under an arch
  aqueduct(g, 500, 900, 1110); castellum(g, 470, 1110); point(g, 470, 1124, 60);
  for (const [x, y] of [[400, 260], [420, 480], [580, 250], [600, 480], [400, 380], [610, 370]]) house(g, x, y);
  g.beginPath(); g.ellipse(500, 330, 92, 50, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke(); point(g, 500, 336, 80); temple(g, 500, 320, 108);
  for (const [x, y] of [[640, 930], [340, 930], [700, 960], [560, 950]]) reeds(g, x, y);
  for (const [x, y, s] of [[760, 1300, 1], [300, 1200, 1.1], [600, 1360, 1], [340, 1420, 0.9], [820, 1450, 1]]) pine(g, x, y, s);
  grove(g, 820, 1200, 60, 70, 7, 3);
  camp(g, 450, 1390);
  foe(g, [['e_inf', 450, 700, 5], ['e_arc', 400, 730], ['e_arc', 500, 730], ['e_arc', 360, 640], ['e_inf', 700, 790], ['e_cav', 620, 660], ['e_inf', 540, 1170, 4], ['e_arc', 312, 450, 2], ['hoplite', 500, 440, 6], ['e_arc', 400, 330], ['e_cav', 620, 290]]);
  ours(g, 450, 1350);
  sign(g, 450, 1482, '↓ из Остии', '#ff8a6a'); sign(g, 500, 24, '↑ к Капуе', '#9ec1ff'); sign(g, 780, 80, '→ к Пренесте', '#9ec1ff'); sign(g, 100, 160, 'море', '#9ec1ff'); sign(g, 650, 900, 'Астура', '#9ec1ff');
  num(g, 450, 1300, 1); num(g, 410, 1160, 2); num(g, 510, 780, 3); num(g, 262, 790, 4); num(g, 800, 920, 5); num(g, 300, 420, 6); num(g, 590, 290, 7);
}
// ---------------------------------------------------------------- ПРЕНЕСТЕ · Крепость на холме · 4/5
// Two gates into the walled hill town: the south gate at the end of the causeway, the east gate at the end of the long way past the mill.
function praeneste(g, r) {
  grass(g, 0, 0, WW, WH, '#7cc850', r);
  plateau(g, [[120, 0], [780, 0], [760, 380], [620, 470], [450, 500], [280, 470], [140, 380]], [[140, 380], [280, 470], [450, 500], [620, 470], [760, 380]], 40, '#a6d468', r);
  const AP = []; for (let y = 40; y <= 1240; y += 70) AP.push([860 + (y * 7 % 30), y + 40, 100 + (y % 3) * 14, 90 + (y % 5) * 10, 1]); AP.sort((a, b) => a[1] - b[1]).forEach(([x, y, w, h, s]) => peak(g, x, y, w, h, s));
  swampZone(g, [[700, 520], [790, 640], [520, 1020], [260, 1140], [120, 1080], [200, 940], [470, 700]], r);
  hummock(g, 300, 880, 46); hummock(g, 610, 760, 44);
  roads(g, [[[[450, 1500], [450, 1200], [440, 1080], [450, 980]], 36], [[[450, 640], [450, 560], [450, 500], [450, 300]], 34, true], [[[450, 1200], [700, 1120], [790, 900], [800, 700], [760, 560], [690, 470], [640, 400]], 26]], r);
  stream(g, [[760, 470], [600, 640], [440, 820], [260, 1000], [0, 1180]], 30, r);
  causeway(g, [[450, 980], [450, 820], [450, 640]]);
  stairs(g, 450, 484, 34, 44); { g.save(); g.translate(676, 452); g.rotate(-0.9); stairs(g, 0, -24, 28, 48); g.restore(); }
  wall(g, [[150, 380], [280, 470], [420, 500], [480, 500], [620, 470], [700, 420], [750, 380]], '#c8b894', [2, 5]);
  terraces(g, 450, 300); point(g, 450, 330, 92);
  for (const [x, y] of [[240, 260], [660, 260], [220, 140], [680, 120], [330, 420], [570, 410]]) house(g, x, y);
  watchtower(g, 490, 620); point(g, 470, 630, 64);
  mill(g, 820, 840); point(g, 800, 850, 60);
  for (const [x, y] of [[200, 1300], [700, 1320], [120, 1200]]) olive(g, x, y, 1);
  camp(g, 450, 1380);
  foe(g, [['e_inf', 450, 700, 5], ['e_arc', 400, 600], ['e_arc', 520, 580], ['ambush', 300, 872, 4], ['ambush', 610, 752, 4], ['e_inf', 780, 760, 4], ['e_arc', 820, 640], ['hoplite', 450, 450, 6], ['e_inf', 650, 380, 4], ['e_arc', 300, 440], ['e_arc', 560, 440], ['e_inf', 260, 300], ['e_cav', 450, 150]]);
  ours(g, 450, 1340);
  sign(g, 450, 1482, '↓ из Тибура', '#ff8a6a'); sign(g, 860, 1300, 'Апеннины', '#e2c9a0'); sign(g, 330, 1100, 'болото у Трера', '#b8e0a0');
  num(g, 450, 1290, 1); num(g, 400, 860, 2); num(g, 540, 660, 3); num(g, 840, 780, 4); num(g, 240, 940, 5); num(g, 720, 400, 6); num(g, 560, 220, 7);
}
// ---------------------------------------------------------------- КАПУЯ · Столица · 5/5
// The points sit far apart: a winery in the fields south of the river, the amphitheater outside the east wall, the Capitol inside.
function capua(g, r) {
  grass(g, 0, 0, WW, WH, '#8ad25c', r);
  vineyard(g, 40, 1180, 170, 100); vineyard(g, 640, 1040, 180, 110); vineyard(g, 260, 1160, 120, 80);
  roads(g, [[[[450, 1500], [450, 1200], [300, 1020], [265, 930], [265, 760], [320, 680], [450, 660]], 34], [[[450, 1200], [620, 1040], [655, 900], [655, 740], [580, 680], [450, 660]], 34], [[[450, 660], [450, 500], [450, 300]], 38, true], [[[655, 740], [760, 620], [800, 520]], 30], [[[300, 1020], [200, 1120]], 26]], r);
  stream(g, [[900, 760], [700, 820], [500, 880], [300, 860], [0, 900]], 70, r);
  stoneBridge(g, 265, 820, 910, 36); stoneBridge(g, 655, 792, 884, 36);
  wall(g, [[180, 620], [180, 150], [450, 90], [720, 150], [720, 620], [560, 640], [340, 640], [180, 620]], '#d8ccb4', [5]);
  arch(g, 450, 670);
  arena(g, 810, 420, 80, 52, r); point(g, 810, 432, 76);
  horrea(g, 200, 1100); point(g, 200, 1124, 70);
  g.beginPath(); g.ellipse(450, 240, 110, 60, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke(); point(g, 450, 246, 90); temple(g, 450, 230, 140);
  horrea(g, 600, 420);
  for (const [x, y] of [[260, 220], [640, 230], [560, 560], [330, 560], [250, 440], [300, 330]]) house(g, x, y);
  for (const [x, y, s] of [[60, 760, 1], [840, 980, 1], [400, 1100, 0.9], [520, 1300, 1], [860, 700, 0.9]]) olive(g, x, y, s);
  camp(g, 450, 1380);
  foe(g, [['e_inf', 265, 760, 4], ['e_arc', 200, 730], ['e_inf', 655, 740, 4], ['e_arc', 740, 700], ['e_cav', 450, 990, 4], ['e_inf', 240, 1050, 4], ['e_inf', 800, 540, 4], ['e_arc', 860, 330], ['hoplite', 450, 600, 6], ['e_arc', 380, 620], ['e_arc', 520, 620], ['e_inf', 300, 460, 5], ['e_inf', 600, 500, 5], ['hoplite', 450, 330, 6], ['e_cav', 330, 260]]);
  ours(g, 450, 1340);
  sign(g, 450, 1482, '↓ из Пренесте', '#ff8a6a'); sign(g, 760, 870, 'Вольтурн', '#9ec1ff');
  num(g, 450, 1290, 1); num(g, 140, 1060, 2); num(g, 200, 860, 3); num(g, 710, 840, 3); num(g, 520, 760, 4); num(g, 880, 470, 5); num(g, 580, 180, 6);
}
`);
const swapCard = (id, txt) => { const a = t.indexOf("  ${card('" + id + "'"), b = t.indexOf('\n', a); t = t.slice(0, a) + txt + t.slice(b); };
swapCard('ostia', "  ${card('ostia', 'Остия · Устье Тибра', 'сила врага 2/5 · 9 отрядов', ['<b>Лагерь</b> на юго-востоке, на дороге из Рима.', '<b>Солеварни</b> на сухом берегу у лагуны — точка захвата, +3 в резерв. Лагуна мелкая и медленная.', '<b>Сосновый бор на песке</b> у моря — там засада.', '<b>Тибр раздваивается</b> вокруг Священного острова: мост на остров и второй мост в город. Оба рукава впадают в море.', '<b>Паром</b> через восточный рукав (точка 4 справа): инженеры перетягивают плот — короткий путь к верфи.', '<b>Верфь на острове</b> — точка захвата.', '<b>Гавань</b> открыта в море между двумя молами, маяк на конце мола — как значок Остии; вдоль улиц склады.', '<b>Форум с храмом</b> — финал.'])}");
swapCard('antium', "  ${card('antium', 'Анций · Один мост', 'сила врага 3/5 · 11 отрядов', ['<b>Лагерь</b> на юге, на дороге из Остии.', '<b>Акведук</b> — прямая аркада через равнину; ходить можно под арками. <b>Водонапорная башня</b> у его конца — точка захвата.', '<b>Единственный мост</b> через Астуру, на северном конце — предмостье: точка захвата, его держит сильный отряд.', '<b>Мель у устья</b>: перейти вброд можно, но её простреливают со стен.', '<b>Место для временного моста</b> восточнее — его наводят инженеры.', '<b>Гавань под скалами</b> открыта в море; с каменной пристани лестница ведёт в город — путь в обход ворот, на пристани лучники.', '<b>Храм Фортуны Анциатской</b> — финал, его стережёт фаланга. На холмах оливковые террасы.'])}");
swapCard('praeneste', "  ${card('praeneste', 'Пренесте · Крепость на холме', 'сила врага 4/5 · 13 отрядов', ['<b>Лагерь</b> на юге, на дороге из Тибура.', '<b>Гать</b> через болото у Трера — кратчайший путь к южным воротам.', '<b>Сторожевая башня</b> у конца гати — точка захвата.', '<b>Мельница</b> у Апеннин — точка захвата на длинном обходе.', '<b>Засады на кочках</b> в болоте — пригодятся разведчики.', '<b>Два входа в город</b>: южные ворота с гати и восточные — в конце обхода мимо мельницы, по лестнице на холм.', '<b>Святилище Фортуны</b> террасами на склоне, круглый храм наверху — финал.'])}");
swapCard('capua', "  ${card('capua', 'Капуя · Столица', 'сила врага 5/5 · 15 отрядов', ['<b>Лагерь</b> на юге, на дороге из Пренесте.', '<b>Винодельня</b> среди виноградников Кампании, на нашем берегу — первая точка захвата.', '<b>Два моста</b> через Вольтурн, оба под охраной.', '<b>Триумфальная арка</b> — главные ворота, как значок Капуи; за ней фаланга.', '<b>Амфитеатр</b> гладиаторов за восточной стеной — вторая точка, к нему ведёт дорога от восточного моста.', '<b>Капитолий</b> в центре города — финал, его держат фаланга и конница.'])}");
fs.writeFileSync('cities.js', t); console.log('ok');
