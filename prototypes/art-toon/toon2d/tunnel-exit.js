// Tunnel exit options (the north end opens away from the viewer): a stone collar, a timber frame, a vine grotto.
// Adds them to tibur.js (helpers + the map uses the stone collar) and to tvar.js as a third pick group.
const fs = require('fs');
const edit = (file, fn) => { let t = fs.readFileSync(file, 'utf8'); const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', file, a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); }; fn(rep); fs.writeFileSync(file, t); };

edit('tibur.js', rep => {
  rep('function caveMouth(g, x, y) {', String.raw`// the tunnel's far end, opening north (away from us): the road comes up out of the rock onto the open ground
function exitStone(g, x, y) {
  g.beginPath(); g.ellipse(x, y, 40, 22, 0, 0, 7); fo(g, '#c8bca4', 3);
  for (let a = 0; a < 6.28; a += 0.52) { g.beginPath(); g.moveTo(x + Math.cos(a) * 30, y + Math.sin(a) * 14); g.lineTo(x + Math.cos(a) * 40, y + Math.sin(a) * 22); g.strokeStyle = 'rgba(80,60,40,.55)'; g.lineWidth = 1.6; g.stroke(); }
  g.beginPath(); g.ellipse(x, y + 2, 28, 13, 0, 0, 7); g.fillStyle = '#1a0e06'; g.fill();
  for (let k = 0; k < 4; k++) { rr(g, x - 22 + k * 2, y - 2 - k * 6, 44 - k * 4, 6, 2); fo(g, '#b8ab92', 1.6); }
  const fg = g.createRadialGradient(x, y + 4, 1, x, y + 4, 26); fg.addColorStop(0, 'rgba(255,210,120,.55)'); fg.addColorStop(1, 'rgba(255,180,80,0)'); g.fillStyle = fg; g.beginPath(); g.arc(x, y + 4, 26, 0, 7); g.fill();
}
function exitTimber(g, x, y) {
  g.beginPath(); g.ellipse(x, y + 2, 32, 15, 0, 0, 7); g.fillStyle = '#1a0e06'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
  for (const dx of [-30, 30]) { rr(g, x + dx - 5, y - 26, 10, 34, 3); fo(g, '#9a6234', 2.2); }
  rr(g, x - 38, y - 32, 76, 10, 3); fo(g, '#b07a40', 2.4); rr(g, x - 30, y - 16, 60, 6, 2); fo(g, '#8a5a30', 1.8);
  g.strokeStyle = OL; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x + 22, y - 22); g.lineTo(x + 22, y - 12); g.stroke(); g.beginPath(); g.arc(x + 22, y - 8, 5, 0, 7); fo(g, '#ffcc55', 1.6);
}
function exitGrotto(g, x, y) {
  blob(g, x, y - 6, 46, 26, 5, 10); fo(g, '#8a7a68', 3);
  g.beginPath(); g.ellipse(x, y, 30, 15, 0, 0, 7); g.fillStyle = '#1a0e06'; g.fill();
  g.strokeStyle = '#3a8a2a'; g.lineWidth = 3; for (const dx of [-26, -10, 12, 26]) { g.beginPath(); g.moveTo(x + dx, y - 16); g.quadraticCurveTo(x + dx + 3, y - 6, x + dx - 1, y + 6); g.stroke(); } g.fillStyle = '#5ab83a'; for (const dx of [-26, -10, 12, 26]) { g.beginPath(); g.ellipse(x + dx + 1, y - 4, 4, 2.5, 0.5, 0, 7); g.fill(); }
  boulder(g, x - 44, y + 4, 0.6); boulder(g, x + 46, y + 2, 0.55);
}
function caveMouth(g, x, y) {`);
  rep('caveMouth(g, 450, 634);', 'exitStone(g, 450, 624);');
});

edit('tvar.js', rep => {
  rep('// ---------------------------------------------------------------- the enemy town (the final point)', String.raw`// ---------------------------------------------------------------- the tunnel's far end: the ridge fills the bottom, the exit opens north onto the grass
function northRidge(g) {
  g.beginPath(); g.moveTo(0, 420); g.lineTo(0, 200); g.lineTo(80, 190); g.lineTo(170, 200); g.lineTo(260, 188); g.lineTo(340, 198); g.lineTo(340, 420); g.closePath(); const mg = g.createLinearGradient(0, 190, 0, 420); mg.addColorStop(0, '#9a8e7e'); mg.addColorStop(1, '#bdb2a0'); fo(g, mg, 3);
  for (const [x, y, w, h, s] of [[50, 300, 90, 90, 1], [290, 290, 90, 96, 1], [70, 380, 80, 70, 0], [280, 384, 80, 70, 0]]) peak(g, x, y, w, h, s);
  path(g, [[170, 200], [170, 120], [170, 0]], 34); cutaway(g, 170, 210, 420, 44); squad(g, 170, 300, 'hastati', 1, 3, 0.6, '#e2382c', 'vex');
}
const EXITS = [
  ['tx1', 'Каменный проём', 'дорога выходит из каменного кольца со ступенями', (g, r) => { northRidge(g); exitStone(g, 170, 200); squad(g, 170, 110, 'e_inf', 2, 4, 0.7, '#3f7ae0', 'vex'); plate(g, 'Каменный проём', 'выход виден сверху: кольцо, ступени, свет'); }],
  ['tx2', 'Деревянная крепь', 'выход как из шахты: столбы, балка, фонарь', (g, r) => { northRidge(g); exitTimber(g, 170, 204); squad(g, 170, 110, 'e_inf', 2, 4, 0.7, '#3f7ae0', 'vex'); plate(g, 'Деревянная крепь', 'выход шахты: тот же стиль, что крепь в разрезе'); }],
  ['tx3', 'Грот в траве', 'выход прячется в камнях под лозой', (g, r) => { northRidge(g); exitGrotto(g, 170, 202); squad(g, 170, 110, 'e_inf', 2, 4, 0.7, '#3f7ae0', 'vex'); plate(g, 'Грот в траве', 'выход как у тайного хода, к гроту на входе'); }]
];
// ---------------------------------------------------------------- the enemy town (the final point)`);
  rep('  for (const [id, , , fn] of TOWNS) {', '  for (const [id, , , fn] of EXITS) { const { g, r } = pnl(id, id.charCodeAt(2) * 13); fn(g, r); }\n  for (const [id, , , fn] of TOWNS) {');
  rep('let pick = { tu: null, to: null };', 'let pick = { tu: null, tx: null, to: null };');
  rep('const all = TUNNELS.concat(TOWNS)', 'const all = TUNNELS.concat(EXITS, TOWNS)');
  rep("'Туннель: <b>' + (name(pick.tu) || '—') + '</b> · Город: <b>'", "'Вход: <b>' + (name(pick.tu) || '—') + '</b> · Выход: <b>' + (name(pick.tx) || '—') + '</b> · Город: <b>'");
  rep("const tun = meta(draw.slice(draw.indexOf('const TUNNELS'), draw.indexOf('const TOWNS')))", "const tun = meta(draw.slice(draw.indexOf('const TUNNELS'), draw.indexOf('const EXITS'))), exits = meta(draw.slice(draw.indexOf('const EXITS'), draw.indexOf('const TOWNS')))");
  rep('  <h2>Вражеский город — финальная точка</h2>', `  <h2>Выход из туннеля</h2>
  <p>Выход смотрит на север, от игрока, поэтому арка «лицом к нам» выглядела странно. Здесь дорога поднимается из-под земли на открытое место. На карте Тибура сейчас первый вариант.</p>
  <div class="grid">
      \${cards(exits)}
  </div>
  <h2>Вражеский город — финальная точка</h2>`);
});
console.log('ok');
