// Adds the cutaway tunnel with a grotto or a portcullis entrance (the approved look) to tibur.js and tvar.js,
// and puts the temple of Vesta on a square in place of the castle as Тибур's final point.
const fs = require('fs');
const edit = (file, fn) => { let t = fs.readFileSync(file, 'utf8'); const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', file, a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); }; fn(rep); fs.writeFileSync(file, t); };

edit('tibur.js', rep => {
  rep('function caveMouth(g, x, y) {', String.raw`// the tunnel seen through the rock: a dark gallery with timber props and torches, from y0 (far end) down to y1 (the entrance)
function cutaway(g, x, y0, y1, w) {
  w = w || 40; const h = w / 2;
  g.beginPath(); g.moveTo(x - h - 8, y1); g.lineTo(x - h - 4, y0 + 10); g.quadraticCurveTo(x, y0 - 10, x + h + 4, y0 + 10); g.lineTo(x + h + 8, y1); g.closePath(); g.fillStyle = '#4a3020'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
  g.beginPath(); g.moveTo(x - h, y1); g.lineTo(x - h, y0 + 14); g.lineTo(x + h, y0 + 14); g.lineTo(x + h, y1); g.closePath(); g.fillStyle = '#7a5434'; g.fill();
  for (let y = y0 + 30; y < y1 - 12; y += 36) { rr(g, x - h - 4, y, 6, 22, 2); fo(g, '#b07a40', 1.6); rr(g, x + h - 2, y, 6, 22, 2); fo(g, '#b07a40', 1.6); rr(g, x - h - 4, y - 4, w + 8, 6, 2); fo(g, '#c48a4a', 1.6); }
  for (let y = y0 + 60; y < y1 - 20; y += 110) { const fg = g.createRadialGradient(x, y, 1, x, y, w * 0.7); fg.addColorStop(0, 'rgba(255,220,140,.7)'); fg.addColorStop(1, 'rgba(255,180,80,0)'); g.fillStyle = fg; g.beginPath(); g.arc(x, y, w * 0.7, 0, 7); g.fill(); }
}
// the entrance as a natural grotto: hanging stalactites and vines, a brook running out
function grotto(g, x, y, r) {
  blob(g, x, y - 34, 60, 44, 3, 12); fo(g, '#8a7a68', 3);
  g.beginPath(); g.moveTo(x - 48, y + 4); g.quadraticCurveTo(x - 54, y - 66, x, y - 78); g.quadraticCurveTo(x + 54, y - 66, x + 48, y + 4); g.closePath(); fo(g, '#1a0e06', 3);
  for (let dx = -38; dx <= 38; dx += 13) { const yy = y - 66 + Math.abs(dx) * 0.5; g.beginPath(); g.moveTo(x + dx - 5, yy); g.lineTo(x + dx, yy + 14 + ((dx + 40) % 3) * 4); g.lineTo(x + dx + 5, yy); g.closePath(); fo(g, '#b4aa9a', 1.6); }
  g.strokeStyle = '#3a8a2a'; g.lineWidth = 3; for (const dx of [-44, -30, 30, 44]) { g.beginPath(); g.moveTo(x + dx, y - 70); g.quadraticCurveTo(x + dx + 4, y - 46, x + dx - 2, y - 22); g.stroke(); g.fillStyle = '#5ab83a'; for (let yy = y - 60; yy < y - 22; yy += 12) { g.beginPath(); g.ellipse(x + dx + 2, yy, 4, 2.5, 0.5, 0, 7); g.fill(); } }
  boulder(g, x - 58, y + 6, 0.9); boulder(g, x + 62, y + 8, 0.8);
}
// the entrance as a fortress cut into the rock: loopholes and a portcullis
function portcullis(g, x, y) {
  g.beginPath(); g.moveTo(x - 90, y); g.lineTo(x - 86, y - 112); g.lineTo(x + 86, y - 112); g.lineTo(x + 90, y); g.closePath(); g.fillStyle = '#a89c8a'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
  for (const [dx, dy] of [[-66, -86], [66, -86], [-66, -48], [66, -48], [-30, -96], [30, -96]]) { rr(g, x + dx - 5, y + dy - 9, 10, 18, 5); fo(g, '#1a0e06', 2); }
  g.beginPath(); g.moveTo(x - 36, y + 2); g.lineTo(x - 36, y - 40); g.arc(x, y - 40, 36, Math.PI, 0); g.lineTo(x + 36, y + 2); g.closePath(); fo(g, '#1a0e06', 3);
  g.strokeStyle = '#8a8a8a'; g.lineWidth = 3.2; for (let dx = -28; dx <= 28; dx += 11) { g.beginPath(); g.moveTo(x + dx, y - 66); g.lineTo(x + dx, y - 10); g.stroke(); } for (let yy = y - 54; yy <= y - 14; yy += 12) { g.beginPath(); g.moveTo(x - 32, yy); g.lineTo(x + 32, yy); g.stroke(); }
  flag(g, x - 78, y - 160, '#3f7ae0', 46); flag(g, x + 78, y - 160, '#3f7ae0', 46);
}
function caveMouth(g, x, y) {`);
  // the map: a cutaway gallery under the spur, the portcullis at the south end, a small grotto mouth at the north end
  rep('  tunnelMark(g); caveMouth(g, 450, 634);', '  cutaway(g, 450, 640, 930, 44); squad(g, 450, 760, \'e_inf\', 2, 3, 0.62, \'#3f7ae0\', \'vex\'); caveMouth(g, 450, 634);');
  rep('rockGate(g, 450, 1030, labels ? null : 0.5);', 'portcullis(g, 450, 1030);');
  rep("squad(g, 450, 690, 'e_inf', 2, 5, 1, '#3f7ae0', 'vex');", "squad(g, 380, 700, 'e_inf', 2, 5, 1, '#3f7ae0', 'vex');");
  // the final point: the temple of Vesta on a paved square instead of the castle
  rep('  capRing(g, 450, 320, 96, 0); fort(g, 450, 320);', `  g.beginPath(); g.ellipse(450, 320, 130, 70, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke();
  for (let a = 0; a < 6.28; a += 0.5) { g.beginPath(); g.ellipse(450 + Math.cos(a) * 100, 320 + Math.sin(a) * 52, 14, 7, 0, 0, 7); g.strokeStyle = 'rgba(150,120,80,.5)'; g.lineWidth = 1.4; g.stroke(); }
  capRing(g, 450, 326, 92, 0); roundTemple(g, 450, 320); flag(g, 490, 220, '#3f7ae0', 40);`);
  rep('  roundTemple(g, 650, 470);', '  rock(g, 640, 486, 1.2); tree(g, 620, 470, 0.9);');
  rep('<b>Крепость в скале</b> — ворота туннеля. Лучники на стенах. Инженеры Луция тараном ломают ворота (8 с), потом это точка захвата: +3 в резерв и ворота наши.', '<b>Крепость в скале</b> — ворота с опускной решёткой и бойницами прямо в скале. Инженеры Луция поднимают решётку (8 с), потом это точка захвата: +3 в резерв.');
  rep('<b>Туннель</b> — самый короткий путь, но узкий: на выходе ждёт сильный отряд копейщиков. Внутри дождь стрел не работает.', '<b>Туннель</b> показан в разрезе: сквозь гору видно ход с крепью и факелами и отряды внутри. Самый короткий путь, но узкий, внутри ждут копейщики. Дождь стрел там не работает.');
  rep('<b>Акрополь Тибура</b> — финал. Встать у него 6 с без врагов рядом.', '<b>Храм Весты на площади</b> — финал, как значок Тибура на карте кампании. Встать у храма 6 с без врагов рядом.');
  rep('<b>Храм Весты на скале над водопадом</b>, как на карте кампании. С него Анио падает вниз и течёт на запад, под стенами города.', '<b>Водопад Анио</b> срывается со скалы на восточном краю города и течёт на запад, под стенами.');
});

edit('tvar.js', rep => {
  rep("  ['tu1', 'Римский портал'", String.raw`  ['tu6', 'Грот + разрез', 'вход-пещера, а сквозь гору виден ход с крепью и факелами', (g, r) => {
    ridge(g); road(g); cutaway(g, 170, 14, 200, 44); squad(g, 170, 120, 'e_inf', 2, 3, 0.6, '#3f7ae0', 'vex');
    grotto(g, 170, 266, r); stream(g, [[214, 270], [250, 300], [300, 330], [340, 350]], 14, r); torchAt(g, 140, 272);
    ours(g); plate(g, 'Грот + разрез', 'тайный ход: видно, кто прячется под горой');
  }],
  ['tu7', 'Решётка + разрез', 'крепость в скале, а сквозь гору виден ход · для Тибура', (g, r) => {
    ridge(g); road(g); cutaway(g, 170, 14, 160, 44); squad(g, 170, 90, 'e_inf', 2, 3, 0.6, '#3f7ae0', 'vex');
    portcullis(g, 170, 266);
    ours(g); plate(g, 'Решётка + разрез', 'крепость в скале с видимым туннелем · для Тибура');
  }],
  ['tu1', 'Римский портал'`);
  rep("<p>Главное — чтобы игрок с первого взгляда понял: здесь проход сквозь гору и короткий путь.</p>", "<p>Главное — чтобы игрок с первого взгляда понял: здесь проход сквозь гору и короткий путь. <b>Новые</b> — первые два: вход, который вам понравился, плюс туннель в разрезе.</p>");
  rep("<p>Вместо «замка-коробки»: Тибур — латинский город с храмами и виллами. Точка захвата — кольцо у главного здания.</p>", "<p>Вместо «замка-коробки». Для Тибура — храм Весты на площади, остальные (кроме виллы) пойдут в другие города кампании.</p>");
});
console.log('ok');
