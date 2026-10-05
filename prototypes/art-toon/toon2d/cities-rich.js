// Richer Ostia and Antium: more terrain, more routes, real choices (the first versions were too plain).
const fs = require('fs'); let t = fs.readFileSync('cities.js', 'utf8');
const swap = (a, b, txt) => { const i = t.indexOf(a), j = t.indexOf(b, i); if (i < 0 || j < 0) { console.error('MISS', a.slice(0, 40)); process.exit(1); } t = t.slice(0, i) + txt + t.slice(j); };
swap('// ---------------------------------------------------------------- ОСТИЯ', '// ---------------------------------------------------------------- ПРЕНЕСТЕ', String.raw`// ---------------------------------------------------------------- extra pieces for the coast
function dunes(g, x, y, w, h, r) { for (let i = 0; i < 9; i++) { const dx = x + r() * w, dy = y + r() * h; g.beginPath(); g.ellipse(dx, dy, 34 + r() * 20, 14 + r() * 6, -0.2, Math.PI, 0); g.closePath(); fo(g, '#f2d690', 2.2); g.strokeStyle = 'rgba(160,120,50,.5)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(dx - 16, dy - 6); g.quadraticCurveTo(dx, dy - 12, dx + 16, dy - 6); g.stroke(); } }
function lagoon(g, pts, r) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); const lg = g.createLinearGradient(0, 900, 0, 1250); lg.addColorStop(0, '#7ec8a8'); lg.addColorStop(1, '#5aa890'); fo(g, lg, 2.8); g.save(); g.clip(); for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(160,210,120,.6)'; g.beginPath(); g.ellipse(560 + r() * 300, 920 + r() * 330, 10 + r() * 12, 4 + r() * 4, 0.3, 0, 7); g.fill(); } g.restore(); for (const [x, y] of pts) reeds(g, x, y); }
function raft(g, x, y) { rr(g, x - 26, y - 14, 52, 28, 5); fo(g, '#a8783e', 2.4); g.strokeStyle = OL; g.lineWidth = 1.6; for (let k = -18; k <= 18; k += 9) { g.beginPath(); g.moveTo(x + k, y - 13); g.lineTo(x + k, y + 13); g.stroke(); } g.setLineDash([4, 4]); g.strokeStyle = '#6a4020'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 60); g.lineTo(x, y + 60); g.stroke(); g.setLineDash([]); }
function crane(g, x, y) { stick(g, x, y, x + 6, y - 70, '#8a5a30', 4); stick(g, x + 6, y - 70, x + 40, y - 60, '#8a5a30', 3); g.strokeStyle = OL; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x + 40, y - 60); g.lineTo(x + 40, y - 30); g.stroke(); rr(g, x + 32, y - 30, 16, 12, 3); fo(g, '#c8a070', 1.8); }
function stick(g, x0, y0, x1, y1, col, w) { g.strokeStyle = OL; g.lineWidth = w + 2.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
function cliffCoast(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0] - 30, pts[i][1] + 8); g.closePath(); const cg = g.createLinearGradient(0, 0, 300, 0); cg.addColorStop(0, '#8a5a30'); cg.addColorStop(1, '#c48a4a'); fo(g, cg, 2.6); }
function oliveTerrace(g, x, y, w, rows) { for (let k = 0; k < rows; k++) { const yy = y + k * 40; rr(g, x, yy, w, 30, 8); fo(g, k % 2 ? '#a6d468' : '#9ccc5a', 2.2); rr(g, x, yy + 26, w, 8, 4); fo(g, '#c8b894', 1.8); for (let ox = x + 20; ox < x + w - 10; ox += 44) olive(g, ox, yy + 22, 0.55); } }

// ---------------------------------------------------------------- ОСТИЯ · Устье Тибра · 2/5
// The Tiber splits around the Sacred Island: two bridges and a ferry on the island; salt lagoon east of the town; dunes and a pine wood by the sea.
function ostia(g, r) {
  grass(g, 0, 0, WW, WH, '#86d05a', r); sea(g, 0, 0, 150, WH, r); beach(g, [[130, 0], [210, 0], [200, 300], [220, 640], [200, 960], [220, 1250], [190, 1500], [130, 1500]], r);
  dunes(g, 150, 1000, 110, 420, r);
  // the salt lagoon south-east of the river
  lagoon(g, [[560, 930], [740, 900], [880, 960], [880, 1200], [760, 1250], [600, 1210], [540, 1080]], r); saltPans(g, 620, 980, 4, 3);
  roads(g, [[[[900, 1340], [720, 1360], [520, 1330], [420, 1240], [400, 1080], [380, 940]], 34], [[[520, 1330], [500, 1200], [520, 1060], [600, 960]], 26], [[[380, 860], [380, 740]], 30], [[[380, 640], [370, 540], [380, 420], [420, 260], [430, 0]], 34, true], [[[690, 640], [600, 520], [500, 460], [420, 420]], 30, true], [[[690, 880], [690, 760]], 28]], r);
  // two arms of the Tiber around the Sacred Island
  stream(g, [[900, 640], [700, 660], [520, 640], [360, 600], [150, 560]], 64, r);
  stream(g, [[900, 640], [760, 720], [600, 830], [420, 900], [260, 880], [150, 900]], 58, r);
  for (const [x, y, s] of [[300, 760, 1], [440, 780, 1.1], [520, 740, 0.9], [240, 720, 1]]) pine(g, x, y, s);
  rr(g, 600, 720, 90, 40, 6); fo(g, '#c8a070', 2.4); crane(g, 600, 728); trireme(g, 660, 736, 0.4);
  stoneBridge(g, 380, 560, 660, 34); raft(g, 690, 810); stoneBridge(g, 380, 850, 944, 34);
  // the town inside its wall, the harbour basin with ships and cranes
  wall(g, [[220, 520], [220, 140], [560, 110], [760, 200], [760, 520]], '#d8ccb4', [2]);
  rr(g, 150, 300, 70, 160, 10); fo(g, '#3aa0d8', 2.6); trireme(g, 186, 380, 0.45); crane(g, 228, 330);
  for (const [x, y] of [[300, 210], [480, 180], [640, 250], [300, 470], [520, 500], [660, 450]]) horrea(g, x, y);
  rr(g, 120, 470, 70, 18, 6); fo(g, '#b8ab92', 2.4); lighthouse(g, 110, 470);
  g.beginPath(); g.ellipse(430, 340, 96, 52, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke(); point(g, 430, 346, 80); temple(g, 430, 340, 112);
  point(g, 700, 1070, 70); point(g, 640, 740, 60);
  grove(g, 260, 1260, 60, 120, 9, 4); for (const [x, y, s] of [[300, 1100, 1], [820, 1360, 1], [620, 1420, 0.9], [840, 820, 1]]) pine(g, x, y, s);
  boat(g, 70, 1150, 0.9); boat(g, 60, 220, 0.8);
  camp(g, 720, 1400);
  foe(g, [['e_arc', 380, 700], ['e_inf', 330, 900, 4], ['e_inf', 690, 700, 3], ['e_arc', 520, 1000], ['ambush', 270, 1220, 4], ['e_inf', 560, 560, 4], ['e_arc', 320, 560], ['e_inf', 430, 250, 5], ['e_cav', 600, 330]]);
  ours(g, 720, 1360);
  sign(g, 800, 1290, '← из Рима', '#ff8a6a'); sign(g, 470, 24, '↑ к Анцию', '#9ec1ff'); sign(g, 75, 160, 'море', '#9ec1ff'); sign(g, 420, 820, 'Священный остров', '#e2c9a0'); sign(g, 700, 1180, 'солёная лагуна', '#b8e0e0');
  num(g, 780, 1320, 1); num(g, 760, 1040, 2); num(g, 330, 1180, 3); num(g, 430, 980, 4); num(g, 740, 800, 4); num(g, 560, 720, 5); num(g, 300, 640, 6); num(g, 520, 270, 7);
}
// ---------------------------------------------------------------- АНЦИЙ · Один мост · 3/5
// The town on a cliff headland over its harbour; the Astura with one fortified bridge, a sandbar ford at the mouth under the walls,
// a site for the engineers' bridge; the aqueduct strides across the plain as a wall pierced by arches; olive terraces on the hills.
function antium(g, r) {
  grass(g, 0, 0, WW, WH, '#80cc54', r); sea(g, 0, 0, 220, WH, r);
  cliffCoast(g, [[250, 0], [260, 200], [300, 420], [280, 600]]); beach(g, [[200, 640], [260, 620], [250, 1000], [230, 1500], [200, 1500]], r);
  rr(g, 150, 420, 110, 120, 12); fo(g, '#3aa0d8', 2.6); boat(g, 190, 470, 0.8); boat(g, 220, 510, 0.7); stairs(g, 268, 420, 26, 70);
  wall(g, [[300, 600], [300, 160], [480, 110], [640, 170], [660, 600]], '#d8ccb4', [1]);
  oliveTerrace(g, 690, 120, 180, 5);
  roads(g, [[[[450, 1500], [450, 1240], [450, 1020], [450, 920], [450, 760], [450, 620], [440, 420], [440, 320]], 36], [[[450, 1240], [620, 1140], [740, 1000], [760, 940]], 26], [[[450, 1240], [330, 1080], [280, 940], [290, 860]], 24]], r);
  stream(g, [[900, 900], [700, 880], [560, 860], [450, 858], [320, 836], [220, 830]], 80, r);
  for (const [x, y, s] of [[260, 836, 1], [282, 852, 1.1], [300, 830, 0.9], [270, 868, 0.8], [292, 874, 0.9]]) stone(g, x, y, s);
  stoneBridge(g, 450, 810, 906, 36);
  // the bridgehead: a small fort on the north end of the bridge
  rr(g, 404, 740, 92, 46, 4); fo(g, '#d8ccb4', 2.6); for (let k = 0; k < 6; k++) { rr(g, 406 + k * 15, 732, 10, 10, 2); fo(g, '#d8ccb4', 2); } rr(g, 434, 756, 32, 30, 10); fo(g, '#3a2414', 2.2); point(g, 450, 790, 62);
  bridgeSite(g, 760, 0.0);
  // the aqueduct across the plain: a wall with passable arches
  for (let x = 480; x < 900; x += 60) { rr(g, x, 1060 - (x - 480) * 0.5, 14, 64, 3); fo(g, '#cfc3ac', 2.2); }
  g.lineWidth = 16; g.strokeStyle = OL; g.beginPath(); g.moveTo(480, 1000); g.lineTo(900, 790); g.stroke(); g.lineWidth = 11; g.strokeStyle = '#d8ccb4'; g.stroke(); g.lineWidth = 3; g.strokeStyle = '#7fd0f0'; g.stroke();
  castellum(g, 520, 1010); point(g, 520, 1024, 60);
  for (const [x, y] of [[360, 260], [380, 480], [560, 250], [580, 480], [360, 380], [600, 370]]) house(g, x, y);
  g.beginPath(); g.ellipse(470, 330, 92, 50, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke(); point(g, 470, 336, 80); temple(g, 470, 320, 108);
  point(g, 205, 480, 54);
  for (const [x, y] of [[640, 930], [330, 930], [700, 960], [560, 950]]) reeds(g, x, y);
  for (const [x, y, s] of [[760, 1280, 1], [300, 1200, 1.1], [600, 1320, 1], [340, 1400, 0.9], [820, 1440, 1]]) pine(g, x, y, s);
  grove(g, 820, 1140, 60, 80, 7, 3);
  camp(g, 450, 1390);
  foe(g, [['e_inf', 450, 700, 5], ['e_arc', 400, 730], ['e_arc', 500, 730], ['e_arc', 320, 620], ['e_inf', 700, 790], ['e_cav', 620, 660], ['e_inf', 560, 1060, 4], ['e_arc', 210, 440, 2], ['hoplite', 470, 440, 6], ['e_arc', 360, 330], ['e_cav', 600, 290]]);
  ours(g, 450, 1350);
  sign(g, 450, 1482, '↓ из Остии', '#ff8a6a'); sign(g, 470, 24, '↑ к Капуе', '#9ec1ff'); sign(g, 780, 80, '→ к Пренесте', '#9ec1ff'); sign(g, 100, 160, 'море', '#9ec1ff'); sign(g, 650, 900, 'Астура', '#9ec1ff');
  num(g, 450, 1300, 1); num(g, 600, 1080, 2); num(g, 510, 780, 3); num(g, 260, 800, 4); num(g, 800, 920, 5); num(g, 150, 560, 6); num(g, 560, 290, 7);
}
`);
const swapCard = (id, txt) => { const a = t.indexOf("  ${card('" + id + "'"), b = t.indexOf('\n', a); t = t.slice(0, a) + txt + t.slice(b); };
swapCard('ostia', "  ${card('ostia', 'Остия · Устье Тибра', 'сила врага 2/5 · 9 отрядов', ['<b>Лагерь</b> на юго-востоке, на дороге из Рима.', '<b>Солеварни в солёной лагуне</b>: точка захвата, +3 в резерв; по лагуне идти медленно.', '<b>Сосновый бор в дюнах</b> у моря — там засада; дюны замедляют.', '<b>Тибр раздваивается</b> вокруг Священного острова: западный мост к острову, с острова — второй мост в город. Или в обход по восточному рукаву.', '<b>Паром</b> через восточный рукав: инженеры перетягивают плот — короткий путь к складам.', '<b>Верфь на острове</b> с кораблём на стапеле — точка захвата.', '<b>Гавань</b> за городской стеной: корабли, краны, маяк на молу — как значок Остии; вдоль улиц склады-горреи.', '<b>Форум с храмом</b> — финал.'])}");
swapCard('antium', "  ${card('antium', 'Анций · Один мост', 'сила врага 3/5 · 11 отрядов', ['<b>Лагерь</b> на юге, на дороге из Остии.', '<b>Акведук</b> идёт через равнину стеной: пройти можно только под арками. У водонапорной башни — точка захвата.', '<b>Единственный мост</b> через Астуру, на северном конце — укрепление-предмостье: точка захвата, его держит сильный отряд.', '<b>Мель у устья</b>: перейти реку вброд можно, но её простреливают со стен над гаванью.', '<b>Место для временного моста</b> восточнее: инженеры наводят его, как в описании.', '<b>Гавань под скалами</b> с лодками и лестницей в город — точка захвата, путь в обход стены.', '<b>Храм Фортуны Анциатской</b> в городе на мысу — финал, его стережёт фаланга. На холмах — оливковые террасы.'])}");
fs.writeFileSync('cities.js', t); console.log('ok');
