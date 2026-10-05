// «Два кольца»: the ram moves outside the walls (a siege yard in the suburb), the breach with rubble moves to the inner ring's wall.
const fs = require('fs'); let t = fs.readFileSync('capua.js', 'utf8');
const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); };
// the old breach in the outer west wall goes away
rep("  g.fillStyle = '#8ad25c'; g.fillRect(64, 480, 34, 90); rubble(g, 80, 530, 0); g.beginPath(); g.arc(80, 480, 14, 0, 7); fo(g, '#f09a24', 2.4); g.font = '15px sans-serif'; g.textAlign = 'center'; g.fillText('⛏', 80, 486);\n", "");
// the siege yard outside the walls, the ram's two possible routes: to an outer gate, or on to the citadel gate
rep("  arsenal(g, 720, 480); ram(g, 700, 560); sign(g, 700, 610, 'арсенал: таран за 12 с', '#f09a24');\n  g.save(); g.setLineDash([4, 12]); g.lineCap = 'round'; g.strokeStyle = 'rgba(240,154,36,.95)'; g.lineWidth = 6; g.beginPath(); g.moveTo(660, 580); g.quadraticCurveTo(560, 640, 470, 600); g.stroke(); g.restore();",
    String.raw`  arsenal(g, 790, 1250); ram(g, 700, 1330); sign(g, 760, 1390, 'осадный двор: таран за 12 с', '#f09a24');
  g.save(); g.setLineDash([4, 12]); g.lineCap = 'round'; g.strokeStyle = 'rgba(240,154,36,.95)'; g.lineWidth = 6; g.beginPath(); g.moveTo(690, 1290); g.quadraticCurveTo(700, 1050, 660, 880); g.stroke(); g.beginPath(); g.moveTo(640, 760); g.quadraticCurveTo(560, 680, 470, 610); g.stroke(); g.restore();
  // the breach in the citadel's west wall: rubble the engineers clear in 10 s — a way into act 2 around the phalanx in the arch
  g.fillStyle = '#8ad25c'; g.fillRect(274, 410, 32, 80); rubble(g, 290, 452, 0); g.beginPath(); g.arc(290, 404, 14, 0, 7); fo(g, '#f09a24', 2.4); g.font = '15px sans-serif'; g.textAlign = 'center'; g.fillText('⛏', 290, 410);`);
rep("  for (const [x, y] of [[760, 1320], [300, 1380]]) house(g, x, y);", "  for (const [x, y] of [[860, 1440], [300, 1380]]) house(g, x, y);");
rep("num(g, 40, 470, 7); num(g, 800, 500, 8);", "num(g, 250, 404, 7); num(g, 860, 1220, 8);");
// texts
rep("Или пролом в старой западной стене (⛏, 7): инженеры разбирают завал за 10 с, там стрелять некому — но путь длинный.", "Или выбить ворота тараном (8) — быстрее и без подъёма решётки под стрелами.");
rep("Внутреннее кольцо открыто аркой, её держит фаланга; войдя с двух сторон, бьёте ей во фланг.", "Внутреннее кольцо открыто аркой, её держит фаланга; войдя с двух сторон, бьёте ей во фланг. Или через <b>пролом (7)</b> в западной стене цитадели: инженеры разбирают завал за 10 с и заходят мимо фаланги.");
rep("'<b>Арсенал (8)</b> между кольцами: инженеры собирают таран за 12 с и толкают его к воротам цитадели — он выбивает их за 8 с, и фаланга в арке перестаёт быть стеной. Таран не обязателен: арку можно взять и в лоб.'", "'<b>Осадный двор (8)</b> за стенами, у нашего лагеря: инженеры собирают таран за 12 с. Его можно пустить на внешние ворота или дотащить до ворот цитадели — выбивает любые ворота за 8 с. Таран не обязателен.'");
fs.writeFileSync('capua.js', t); console.log('ok');
