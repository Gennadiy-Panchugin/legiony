// Veii: the rubble moves to chokepoints so it is a real choice (level-designer + game-designer pass, 2026-10-05).
// 1) on the bridge over the Cremera — bypass via the far ford is long but safe; 2) in a defile between the necropolis
// tumuli and a walled vineyard — bypass is short but passes under the west-gate archers. Nobody guards the rubble itself.
const fs = require('fs'); let t = fs.readFileSync('veii.js', 'utf8');
const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); };
rep('const NORTH_RD = [[200, 1250], [190, 1080], [176, 860], [200, 640], [260, 470], [340, 400], [430, 390]];',
    'const NORTH_RD = [[200, 1250], [190, 1080], [176, 860], [170, 680], [150, 600], [205, 500], [285, 494], [350, 486], [390, 410], [434, 392]];');
rep('const RUBBLE = [[188, 860], [662, 900]];', 'const RUBBLE = [[668, 1214], [285, 494]];\nconst NECRO = [[214, 424, 34], [270, 404, 38], [322, 436, 32], [246, 458, 24], [300, 462, 22]];');
// the walled vineyard south of the defile and the necropolis north of it
rep('  vineyard(g, 40, 1040, 150, 92); vineyard(g, 250, 1130, 130, 76);', String.raw`  vineyard(g, 40, 1040, 150, 92); vineyard(g, 250, 1130, 130, 76);
  vineyard(g, 222, 522, 122, 88); { g.lineJoin = 'round'; rr(g, 216, 516, 134, 100, 12); g.lineWidth = 9; g.strokeStyle = OL; g.stroke(); g.lineWidth = 6; g.strokeStyle = '#c8bca4'; g.stroke(); g.strokeStyle = 'rgba(80,60,40,.5)'; g.lineWidth = 1.4; for (let x = 226; x < 346; x += 12) { g.beginPath(); g.moveTo(x, 513); g.lineTo(x, 519); g.moveTo(x + 6, 613); g.lineTo(x + 6, 619); g.stroke(); } }`);
rep('  for (const [x, y, rd] of TUMULI) tumulus(g, x, y, rd);', '  for (const [x, y, rd] of TUMULI) tumulus(g, x, y, rd);\n  NECRO.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y, rd]) => tumulus(g, x, y, rd));');
// a pick badge over each rubble: tap it to send the engineers
rep('  for (const [x, y] of RUBBLE) rubble(g, x, y, 0);', "  for (const [x, y] of RUBBLE) { rubble(g, x, y, 0); g.beginPath(); g.arc(x, y - 44, 15, 0, 7); fo(g, '#f09a24', 2.6); g.font = '16px sans-serif'; g.textAlign = 'center'; g.fillText('⛏', x, y - 38); }");
// nobody stands on the rubble: the quarry guard and the gate archers keep their distance; the bridge picket waits past the mill
rep("squad(g, 200, 800, 'e_inf', 2, 4, 0.95, '#3f7ae0', 'vex');", "squad(g, 96, 660, 'e_inf', 2, 4, 0.95, '#3f7ae0', 'vex');");
rep("squad(g, 790, 1250, 'e_arc', 2, 3, 0.9, '#3f7ae0', 'pennant', -1); squad(g, 420, 440, 'e_arc', 2, 3, 0.9,", "squad(g, 860, 1130, 'e_arc', 2, 3, 0.9, '#3f7ae0', 'pennant', -1); squad(g, 480, 352, 'e_arc', 2, 3, 0.9,");
rep("num(g, 250, 860, 2); num(g, 720, 900, 2);", "num(g, 640, 1150, 2); num(g, 330, 540, 2);");
// the phone shows the bridge: the engineers clear it, the path preview offers the long way round
rep('const VIEW = { x: 0, y: 540 };', 'const VIEW = { x: 300, y: 540 };');
rep("else { squad(g, 200, 912, 'eng', 1, 3, 1, '#f09a24', 'square');", "else { squad(g, 630, 1236, 'eng', 1, 3, 1, '#f09a24', 'square');");
rep("  sign(g, 270, 100, '⛏ Луций разбирает завал · 3/6', '#f09a24');", String.raw`  sign(g, 270, 100, '⏳ Марк · гастаты · куда идти?', '#f2c14a');
  const S = (x, y) => [x - VIEW.x, y - VIEW.y];
  g.save(); g.setLineDash([3, 12]); g.lineCap = 'round'; g.lineWidth = 7; g.strokeStyle = 'rgba(255,255,255,.95)'; g.beginPath(); [[560, 1250], [668, 1214], [740, 1150], [780, 1080]].map(p => S(...p)).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
  g.strokeStyle = 'rgba(200,200,200,.75)'; g.lineWidth = 6; g.beginPath(); [[560, 1250], [520, 1060], [470, 860], [440, 640]].map(p => S(...p)).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.restore();
  { const [x, y] = S(780, 1080); g.beginPath(); g.ellipse(x, y, 22, 11, 0, 0, 7); g.strokeStyle = OL; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#ffcc33'; g.lineWidth = 3.5; g.stroke(); }
  { const [x, y] = S(700, 1300); sign(g, x, y, '⛏ Инженеры разберут за 6 с', '#f09a24'); }
  { const [x, y] = S(470, 760); sign(g, x, y, 'в обход через брод: +40 с', '#9a9a9a'); }`);
rep("<li><b>Два завала</b>: на северной дороге и на главной, у подъёма к южным воротам. Инженеры Луция разбирают каждый за 6 с, остальные обходят по полям — медленнее.</li>", "<li><b>Два завала в узких местах</b> (значок ⛏: коснитесь — пойдут инженеры). <b>На мосту</b> через Кремеру обход только через дальний брод: +40 с, зато безопасно. <b>В теснине у некрополя</b>, между курганами и оградой виноградника, обход короткий, но вдоль берега под стрелами с западных ворот. Сами завалы никто не охраняет: это первый бой, инженеры разбирают их спокойно.</li>");
fs.writeFileSync('veii.js', t); console.log('ok');
