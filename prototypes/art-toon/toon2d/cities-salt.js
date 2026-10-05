// Ostia: real salt works on the lagoon's edge; Praeneste: the empty east side gets an oak wood, a shepherds' hamlet and a rock shrine.
const fs = require('fs'); let t = fs.readFileSync('cities.js', 'utf8');
const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); };
rep('// ---------------------------------------------------------------- ОСТИЯ · Устье Тибра · 2/5', String.raw`// salt works: a channel from the lagoon feeds shallow evaporation ponds on earth dykes; heaps of white salt and the salter's hut
function saltworks(g, x, y, cols, rows, chY) {
  const W = cols * 44 + 12, H = rows * 38 + 12;
  rr(g, x, y, W, H, 8); fo(g, '#cdb88a', 2.6);
  rr(g, x + W - 6, chY - 7, 42, 14, 4); g.fillStyle = '#6ec0d8'; g.fill(); g.lineWidth = 2; g.strokeStyle = OL; g.stroke();
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const px = x + 8 + i * 44, py = y + 8 + j * 38; rr(g, px, py, 38, 32, 4); const pg = g.createLinearGradient(px, py, px + 38, py + 32); const dry = (i + j) % 3; pg.addColorStop(0, dry === 2 ? '#f4fbff' : '#9ad8ec'); pg.addColorStop(1, dry === 2 ? '#dfeff6' : '#bfe8f4'); g.fillStyle = pg; g.fill(); g.lineWidth = 1.8; g.strokeStyle = 'rgba(90,70,40,.7)'; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.95)'; for (let k = 0; k < (dry === 2 ? 7 : 3); k++) { g.beginPath(); g.ellipse(px + 6 + ((k * 13) % 28), py + 6 + ((k * 7) % 20), 3, 1.8, 0, 0, 7); g.fill(); } }
  for (const [dx, s] of [[12, 1], [40, 0.8], [66, 1.1]]) { const hx = x + dx, hy = y + H + 22; g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(hx + 6, hy + 2, 18 * s, 5 * s, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(hx - 16 * s, hy); g.quadraticCurveTo(hx, hy - 30 * s, hx + 16 * s, hy); g.closePath(); fo(g, '#ffffff', 2.4); g.fillStyle = '#dfe8ee'; g.beginPath(); g.moveTo(hx, hy - 15 * s); g.quadraticCurveTo(hx + 10 * s, hy - 8 * s, hx + 16 * s, hy); g.lineTo(hx, hy); g.closePath(); g.fill(); }
  const hx = x + W - 34, hy = y + H + 30; rr(g, hx - 18, hy - 22, 36, 24, 3); fo(g, '#e2cfa6', 2.2); g.beginPath(); g.moveTo(hx - 24, hy - 20); g.lineTo(hx, hy - 38); g.lineTo(hx + 24, hy - 20); g.closePath(); fo(g, '#d9a441', 2.2);
  sign(g, x + W / 2, y - 14, 'соль', '#ffffff');
}
// ---------------------------------------------------------------- ОСТИЯ · Устье Тибра · 2/5`);
rep('  saltPans(g, 520, 1100, 3, 2);', '  saltworks(g, 568, 990, 3, 3, 1040);');
rep('  point(g, 590, 1130, 68); point(g, 640, 740, 60);', '  point(g, 640, 1180, 62); point(g, 640, 740, 60);');
rep('[[520, 1330], [560, 1220], [590, 1160]]', '[[520, 1330], [580, 1260], [630, 1200]]');
rep("['e_arc', 560, 1040]", "['e_arc', 520, 1060]");
rep('num(g, 650, 1170, 2);', 'num(g, 560, 1200, 2);');
// Praeneste: the east side under the Apennines
rep("  for (const [x, y] of [[200, 1300], [700, 1320], [120, 1200]]) olive(g, x, y, 1);", String.raw`  for (const [x, y] of [[200, 1300], [120, 1200]]) olive(g, x, y, 1);
  // an oak wood on the foothills (cover for both sides), a shepherds' hamlet with its pen, a shrine on a rock above the mill road
  grove(g, 700, 1090, 90, 70, 12, 7);
  for (const [x, y] of [[620, 1290], [700, 1330], [770, 1280]]) etrHouse(g, x, y);
  g.beginPath(); g.ellipse(700, 1220, 58, 26, 0, 0, 7); g.fillStyle = '#c8e08a'; g.fill(); g.setLineDash([3, 5]); g.lineWidth = 4; g.strokeStyle = '#8a5a30'; g.stroke(); g.setLineDash([]);
  for (const [dx, dy] of [[-30, -6], [-10, 6], [12, -8], [30, 4], [0, -16]]) { blob(g, 700 + dx, 1220 + dy, 9, 6, dx, 8); fo(g, '#fbfaf2', 1.8); g.fillStyle = OL; g.beginPath(); g.arc(700 + dx + 8, 1220 + dy - 2, 3, 0, 7); g.fill(); }
  blob(g, 790, 560, 46, 28, 3, 10); fo(g, '#a59a8c', 2.6); blob(g, 790, 552, 38, 20, 4, 10); fo(g, '#9ccc5a', 2.2); temple(g, 790, 556, 46);
  for (const [x, y] of [[760, 680], [640, 1000]]) rock(g, x, y, 1);`);
rep("['e_inf', 780, 760, 4], ['e_arc', 820, 640]", "['e_inf', 780, 760, 4], ['e_arc', 760, 600], ['ambush', 700, 1100, 3]");
fs.writeFileSync('cities.js', t); console.log('ok');
