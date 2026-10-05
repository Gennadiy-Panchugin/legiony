// Clean road joins on the Tibur map: all road outlines first and fills after (forks merge), rivers over roads with a stone ford,
// a real stone bridge, the valley road running straight up the staircase, the fork near the camp.
const fs = require('fs'); let t = fs.readFileSync('tibur.js', 'utf8');
const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); };
rep('const VALLEY = [[420, 1360], [270, 1240], [190, 1110], [176, 960], [186, 800], [214, 680], [236, 600], [250, 540], [300, 470], [400, 400]];',
    'const VALLEY = [[450, 1292], [380, 1262], [270, 1210], [200, 1110], [180, 960], [186, 800], [214, 680], [240, 610], [262, 566], [262, 486], [300, 446], [400, 400]];');
rep('function caveMouth(g, x, y) {', String.raw`// every road in two passes: outlines, then fills, so forks and joins merge cleanly
function roads(g, list, r) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [pts, w] of list) { wave(g, pts); g.strokeStyle = OL; g.lineWidth = w + 5; g.stroke(); }
  for (const [pts, w, paved] of list) { wave(g, pts); g.strokeStyle = paved ? '#a89c8a' : '#c99a58'; g.lineWidth = w + 1; g.stroke(); }
  for (const [pts, w, paved] of list) { wave(g, pts); g.strokeStyle = paved ? '#ddd2bc' : '#efd08a'; g.lineWidth = w - 6; g.stroke(); }
  for (const [pts, w, paved] of list) {
    if (paved) { g.save(); g.setLineDash([2, 13]); wave(g, pts); g.strokeStyle = '#b4a890'; g.lineWidth = w - 6; g.lineCap = 'butt'; g.stroke(); g.restore(); continue; }
    g.save(); g.setLineDash([14, 22]); g.lineCap = 'round'; g.strokeStyle = 'rgba(160,110,50,.35)'; g.lineWidth = 3; wave(g, pts); g.stroke(); g.restore();
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
      for (let d = 14; d < L - 10; d += 28) { const side = (Math.floor(d / 28) + i) % 2 ? 1 : -1, px = x0 + (x1 - x0) * d / L + nx * side * (w / 2 + 5), py = y0 + (y1 - y0) * d / L + ny * side * (w / 2 + 5);
        if (r() < 0.55) stone(g, px, py, 0.45 + r() * 0.25); else { g.strokeStyle = 'rgba(40,110,30,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(px - 3, py); g.lineTo(px - 1, py - 7); g.moveTo(px + 1, py); g.lineTo(px + 3, py - 8); g.stroke(); } } }
  }
}
// a stone bridge across a river running east-west: paved deck, parapets with posts, arch shadows on the water
function stoneBridge(g, x, y0, y1, w) {
  for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(x + sx * (w / 2 + 12), (y0 + y1) / 2, 7, (y1 - y0) * 0.32, 0, 0, 7); g.fillStyle = 'rgba(10,40,70,.45)'; g.fill(); }
  rr(g, x - w / 2 - 4, y0, w + 8, y1 - y0, 4); fo(g, '#d8ccb4', 2.8);
  g.strokeStyle = 'rgba(120,105,85,.6)'; g.lineWidth = 1.6; for (let y = y0 + 8; y < y1 - 4; y += 9) { g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.stroke(); }
  for (const sx of [-1, 1]) { const px = x + sx * (w / 2 + 6); rr(g, px - 5, y0 - 6, 10, y1 - y0 + 12, 4); fo(g, '#c8bca4', 2.4); for (const y of [y0 - 8, y1 - 2]) { rr(g, px - 7, y, 14, 10, 3); fo(g, '#e2d6bc', 2.2); } }
}
function caveMouth(g, x, y) {`);
rep(`  stream(g, TRER, 26, r);
  // the Anio falls off the crag by the temple and runs west, then down the western valley
  stream(g, [[770, 360], [740, 410], [700, 448], [690, 466]], 26, r); stream(g, ANIO, 34, r); waterfall(g, 690, 462, 530, 34);
  for (const [x, y] of [[226, 596], [250, 612], [238, 628], [214, 618]]) stone(g, x, y, 1.05);
  dirtRoad(g, VALLEY, 30, r); dirtRoad(g, TUNNEL, 36, r); pavedRoad(g, TOWN_ROAD, 38); pavedRoad(g, NORTH, 34);
  rr(g, 426, 552, 48, 40, 6); fo(g, '#cfc3ac', 2.6); g.strokeStyle = OL; g.lineWidth = 2; for (const dx of [-14, 0, 14]) { g.beginPath(); g.moveTo(450 + dx, 552); g.lineTo(450 + dx, 592); g.stroke(); }
  stairs(g, 268, 500, 40, 58);`, `  // roads first; the rivers run over them, so the ford reads as water with stones and the bridge sits on top
  roads(g, [[TUNNEL, 36], [VALLEY, 30], [TOWN_ROAD, 38, true], [NORTH, 34, true]], r);
  stream(g, TRER, 26, r);
  // the Anio falls off the crag by the temple and runs west, then down the western valley
  stream(g, [[770, 360], [740, 410], [700, 448], [690, 466]], 26, r); stream(g, ANIO, 34, r); waterfall(g, 690, 462, 530, 34);
  for (const [x, y, s] of [[232, 586, 0.95], [246, 594, 1.05], [258, 588, 0.9], [240, 604, 0.85], [252, 606, 0.8]]) stone(g, x, y, s);
  stoneBridge(g, 450, 550, 598, 36);
  stairs(g, 262, 488, 32, 70);`);
fs.writeFileSync('tibur.js', t); console.log('ok');
