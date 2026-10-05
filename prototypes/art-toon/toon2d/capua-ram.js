// «Два кольца»: the arsenal with the battering ram between the rings, forward camps at the gatehouses,
// the gladiator school as a side point that gives a fifth squad.
const fs = require('fs'); let t = fs.readFileSync('capua.js', 'utf8');
const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); };
rep('function villa(g, x, y) {', String.raw`function ram(g, x, y) {
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
function villa(g, x, y) {`);
rep("  ludus(g, 140, 1300); for (const [x, y] of [[760, 1320], [300, 1380]]) house(g, x, y);", String.raw`  ludus(g, 150, 1180); point(g, 150, 1210, 74); squad(g, 230, 1230, 'hastati', 1, 3, 0.75, '#8a8f98', 'square'); sign(g, 150, 1290, 'школа гладиаторов: +1 отряд', '#ffcc33');
  for (const [x, y] of [[760, 1320], [300, 1380]]) house(g, x, y);
  // the arsenal between the rings: engineers assemble a ram (12 s) and push it to the inner gate (8 s to break it)
  arsenal(g, 720, 480); ram(g, 700, 560); sign(g, 700, 610, 'арсенал: таран за 12 с', '#f09a24');
  g.save(); g.setLineDash([4, 12]); g.lineCap = 'round'; g.strokeStyle = 'rgba(240,154,36,.95)'; g.lineWidth = 6; g.beginPath(); g.moveTo(660, 580); g.quadraticCurveTo(560, 640, 470, 600); g.stroke(); g.restore();
  // forward camps behind each gatehouse once it is ours: tents refill squads there
  for (const gx of [240, 660]) { tent(g, gx - 34, 760); tent(g, gx + 34, 760); } sign(g, 450, 740, 'передовой лагерь у взятых ворот', '#ff8a6a');`);
rep("num(g, 70, 1300, 6); num(g, 40, 470, 7);", "num(g, 70, 1190, 6); num(g, 40, 470, 7); num(g, 800, 500, 8);");
rep("'<b>Школа гладиаторов</b> в пригороде — необязательная цель: возьмёте — гладиаторы ненадолго бьются за вас. По мосту за городом к врагу идут подкрепления.'", "'<b>Арсенал (8)</b> между кольцами: инженеры собирают таран за 12 с и толкают его к воротам цитадели — он выбивает их за 8 с, и фаланга в арке перестаёт быть стеной. Таран не обязателен: арку можно взять и в лоб.', '<b>Передовой лагерь</b>: у взятых ворот появляются палатки — пополняться можно там, а не бегать в тыл.', '<b>Школа гладиаторов (6)</b> — побочная точка: взяли — к вам присоединяется пятый отряд, гладиаторы (5 бойцов, «Ярость толпы» раз в бою), без пополнения. Не тронули — ничего не случится.'");
fs.writeFileSync('capua.js', t); console.log('ok');
