// Re-lays the Tibur map to match the campaign map: Apennines east, valley detour west, Praeneste road north, the Трер north-west.
const fs = require('fs'); let t = fs.readFileSync('tibur.js', 'utf8');
const swap = (a, b, txt) => { const i = t.indexOf(a), j = t.indexOf(b, i); if (i < 0 || j < 0) { console.error('MISS', a); process.exit(1); } t = t.slice(0, i) + txt + t.slice(j); };
const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); };
swap("// ---------------------------------------------------------------- the map's shapes", "function stream(g, pts, w, r) {", `// ---------------------------------------------------------------- the map's shapes (north up, as on the campaign map)
const TOWN_P = [[0, 0], [760, 0], [760, 500], [640, 516], [560, 504], [450, 520], [330, 508], [200, 520], [0, 506]];
const MASS_P = [[900, 610], [780, 590], [640, 612], [520, 600], [400, 616], [300, 640], [270, 790], [292, 990], [380, 1014], [450, 1002], [560, 1016], [700, 994], [900, 1012]];
const ANIO = [[686, 530], [600, 566], [450, 572], [320, 576], [210, 610], [130, 700], [96, 840], [80, 1000], [50, 1150], [0, 1240]];
const TRER = [[330, 0], [250, 56], [140, 92], [0, 118]];
const VALLEY = [[420, 1360], [270, 1240], [190, 1110], [176, 960], [186, 800], [214, 680], [236, 600], [250, 540], [300, 470], [400, 400]];
const TUNNEL = [[450, 1500], [450, 1300], [450, 1120], [450, 1030]], TOWN_ROAD = [[450, 620], [450, 470], [450, 380]], NORTH = [[450, 230], [450, 0]];
const TRAIL = [[540, 1340], [660, 1220], [720, 1080], [680, 990], [730, 900], [670, 810], [720, 720], [660, 650], [640, 560]];
`);
swap("  const front = MASS_P", "  P.sort(", `  const front = MASS_P.filter(p => p[1] > 900).sort((a, b) => a[0] - b[0]);
  g.beginPath(); front.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = front.length - 1; i >= 0; i--) g.lineTo(front[i][0], front[i][1] + 34); g.closePath(); g.fillStyle = '#7a6a58'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke();
  const P = [[830, 720, 120, 120, 1], [700, 660, 100, 100, 1], [570, 720, 130, 140, 1], [340, 710, 120, 120, 1], [300, 800, 80, 80, 0], [660, 840, 110, 110, 0], [330, 900, 100, 90, 0], [820, 900, 100, 90, 0], [570, 900, 90, 80, 0], [450, 780, 80, 70, 1], [760, 990, 70, 60, 0], [360, 990, 70, 56, 0]];
`);
rep("g.moveTo(450, 990); g.lineTo(450, 590);", "g.moveTo(450, 990); g.lineTo(450, 640);");
rep("function caveMouth(g, x, y) {", `function apennines(g) { const P = []; for (let y = 30; y <= 1260; y += 62) P.push([850 + (y * 7 % 40) - 10, y + 40, 110 + (y % 3) * 14, 100 + (y % 5) * 10, 1]); for (let y = 60; y <= 560; y += 90) P.push([790, y + 40, 80, 70, 0]); P.sort((a, b) => a[1] - b[1]).forEach(([x, y, w, h, s]) => peak(g, x, y, w, h, s)); }
function caveMouth(g, x, y) {`);
swap("function drawWorld(g, labels) {", "const VIEW = ", `function drawWorld(g, labels) {
  const r = rng(11);
  grass(g, 0, 0, WW, WH, '#76c64a', r);
  plateau(g, TOWN_P, TOWN_P.slice(2).sort((a, b) => a[0] - b[0]), 30, '#8fd457', r);
  stream(g, TRER, 26, r);
  // the Anio falls off the crag by the temple and runs west, then down the western valley
  waterfall(g, 690, 462, 528, 40); stream(g, ANIO, 34, r);
  for (const [x, y] of [[226, 596], [250, 612], [238, 628], [214, 618]]) stone(g, x, y, 1.05);
  path(g, VALLEY, 30); path(g, TUNNEL, 38); path(g, TOWN_ROAD, 38); path(g, NORTH, 34);
  rr(g, 426, 552, 48, 40, 6); fo(g, '#cfc3ac', 2.6); g.strokeStyle = OL; g.lineWidth = 2; for (const dx of [-14, 0, 14]) { g.beginPath(); g.moveTo(450 + dx, 552); g.lineTo(450 + dx, 592); g.stroke(); }
  ramp(g, 262, 506, 40, 46);
  massif(g, r); apennines(g);
  g.save(); g.setLineDash([3, 11]); g.lineCap = 'round'; g.strokeStyle = '#fff3c0'; g.lineWidth = 6; wave(g, TRAIL); g.stroke(); g.restore();
  tunnelMark(g); caveMouth(g, 450, 634);
  // the town: houses, the acropolis (final point), the temple of Vesta on its crag to the east
  for (const [x, y] of [[140, 210], [230, 180], [300, 280], [130, 380], [600, 200], [560, 290], [660, 140], [240, 440], [610, 420]]) house(g, x, y);
  roundTemple(g, 650, 470);
  for (const [x, y, k] of [[40, 200, 1], [360, 140, 0.9], [540, 120, 0.9], [60, 470, 0.9]]) tree(g, x, y, k);
  capRing(g, 450, 320, 96, 0); fort(g, 450, 320);
  // the rock fortress over the gate; the watchtower on a knoll in the western valley
  capRing(g, 450, 1070, 70, 0); rockGate(g, 450, 1030, labels ? null : 0.5);
  mound(g, 140, 860, 60, 36); capRing(g, 140, 860, 56, 0); watchtower(g, 140, 858);
  grove(g, 760, 1150, 110, 60, 9, 2); grove(g, 250, 1110, 70, 40, 6, 5); grove(g, 50, 1340, 50, 90, 7, 8); grove(g, 620, 1100, 70, 34, 5, 4);
  for (const [x, y, k] of [[340, 1260, 0.9], [570, 1260, 1], [30, 1460, 0.9], [870, 1440, 1]]) rock(g, x, y, k);
  mound(g, 300, 1180, 44, 26);
  // our camp, on the road from Veii
  g.save(); g.beginPath(); g.ellipse(450, 1400, 160, 72, 0, 0, 7); g.fillStyle = 'rgba(190,140,80,.45)'; g.fill(); g.restore();
  for (let a = 200; a <= 340; a += 8) { const rd = a * Math.PI / 180, x = 450 + Math.cos(rd) * 160, y = 1400 + Math.sin(rd) * 72; if (Math.abs(a - 270) < 13) continue; g.beginPath(); g.moveTo(x - 4, y + 6); g.lineTo(x - 3, y - 14); g.lineTo(x, y - 20); g.lineTo(x + 3, y - 14); g.lineTo(x + 4, y + 6); g.closePath(); fo(g, '#b0783e', 2); }
  tent(g, 360, 1440); tent(g, 540, 1440); tent(g, 450, 1466);
  // the enemy: 12 squads, 3/5
  squad(g, 372, 990, 'e_arc', 2, 3, 0.9, '#3f7ae0', 'pennant', -1); squad(g, 528, 990, 'e_arc', 2, 3, 0.9, '#3f7ae0', 'pennant');
  squad(g, 450, 690, 'e_inf', 2, 5, 1, '#3f7ae0', 'vex'); squad(g, 520, 520, 'e_inf', 2, 4, 1, '#3f7ae0', 'vex');
  squad(g, 100, 920, 'e_arc', 2, 3, 1, '#3f7ae0', 'pennant'); squad(g, 190, 940, 'e_inf', 2, 4, 1, '#3f7ae0', 'vex');
  squad(g, 220, 660, 'e_inf', 2, 4, 1, '#3f7ae0', 'vex'); squad(g, 190, 1060, 'e_cav', 2, 3, 1, '#3f7ae0', 'swallow', -1);
  squad(g, 700, 690, 'e_arc', 2, 2, 0.85, '#3f7ae0', 'pennant', -1);
  squad(g, 450, 420, 'e_inf', 2, 5, 1, '#3f7ae0', 'vex'); squad(g, 300, 350, 'e_arc', 2, 3, 1, '#3f7ae0', 'pennant', -1); squad(g, 600, 350, 'e_cav', 2, 3, 1, '#3f7ae0', 'swallow');
  // ours
  if (labels) { squad(g, 390, 1340, 'hastati', 1, 5, 1, '#e2382c', 'vex'); squad(g, 500, 1340, 'velites', 1, 4, 1, '#2fa04e', 'pennant'); squad(g, 300, 1330, 'eques', 1, 3, 1, '#8e4cc4', 'swallow', -1); squad(g, 600, 1360, 'eng', 1, 3, 1, '#f09a24', 'square'); }
  else { squad(g, 420, 1100, 'eng', 1, 3, 1, '#f09a24', 'square'); squad(g, 500, 1130, 'hastati', 1, 5, 1, '#e2382c', 'vex'); squad(g, 560, 1180, 'velites', 1, 4, 1, '#2fa04e', 'pennant'); squad(g, 300, 1200, 'eques', 1, 3, 1, '#8e4cc4', 'swallow', -1); }
  if (labels) {
    sign(g, 450, 1482, '↓ дорога из Вейи', '#ff8a6a'); sign(g, 540, 24, '↑ к Пренесте', '#9ec1ff'); sign(g, 120, 150, 'Трер', '#9ec1ff'); sign(g, 838, 1300, 'Апеннины', '#e2c9a0');
    num(g, 450, 1300, 1); num(g, 560, 1060, 2); num(g, 520, 820, 3); num(g, 196, 1170, 4); num(g, 60, 790, 5); num(g, 760, 760, 6); num(g, 560, 290, 7); num(g, 720, 400, 8);
  }
}
`);
rep("<b>Долина Аниена</b> — длинный обход справа. Простор для конницы Гая, брод через реку, лес у подножия для засады.", "<b>Западная долина</b> — длинный обход слева, по равнине вдоль Анио. Простор для конницы Гая, брод под городом, лес у подножия для засады.");
rep("<b>Сторожевая башня</b> на холме в долине", "<b>Сторожевая башня</b> на холме в западной долине");
rep("<b>Козья тропа</b> через гору слева: только пешие, медленно, наверху пост лучников. Можно провести велитов Тита в тыл.", "<b>Козья тропа</b> справа, у самых Апеннин: только пешие, медленно, наверху пост лучников. Выводит велитов Тита к храму, в тыл городу.");
rep("<b>Храм Весты над водопадом</b> — украшение и ориентир. Взвоз из долины поднимается к городу рядом с ним.", "<b>Храм Весты на скале над водопадом</b>, как на карте кампании. С него Анио падает вниз и течёт на запад, под стенами города.");
rep("<p>Карта под описание провинции из кампании:", "<p>Карта повторяет карту кампании: <b>с юга</b> мы приходим по дороге из Вейи, <b>на севере</b> дорога уходит к Пренесте, за городом течёт Трер, <b>с востока</b> стоят Апеннины, а от них к городу тянется отрог. Как в описании провинции:");
fs.writeFileSync('tibur.js', t); console.log('ok');
