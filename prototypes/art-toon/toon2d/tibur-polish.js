// Polish for the Tibur map: smaller gate, nicer roads and a staircase, a proper waterfall, the watchtower off the road and river.
const fs = require('fs'); let t = fs.readFileSync('tibur.js', 'utf8');
const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); };
const swapFn = (name, txt) => { const i = t.indexOf('function ' + name + '('), j = t.indexOf('\nfunction ', i + 10); if (i < 0) { console.error('MISS fn', name); process.exit(1); } t = t.slice(0, i) + txt + t.slice(j + 1); };

swapFn('waterfall', String.raw`function waterfall(g, x, y0, y1, w) {
  // rocks framing the drop
  for (const [dx, dy, s] of [[-w * 0.9, 8, 0.9], [w * 0.9, 4, 0.85], [-w * 0.8, (y1 - y0) * 0.6, 0.7], [w * 0.85, (y1 - y0) * 0.55, 0.75]]) boulder(g, x + dx, y0 + dy, s);
  // the falling water widens as it drops
  g.beginPath(); g.moveTo(x - w / 2, y0); g.quadraticCurveTo(x - w * 0.62, (y0 + y1) / 2, x - w * 0.72, y1); g.lineTo(x + w * 0.72, y1); g.quadraticCurveTo(x + w * 0.62, (y0 + y1) / 2, x + w / 2, y0); g.closePath();
  const wg = g.createLinearGradient(0, y0, 0, y1); wg.addColorStop(0, '#3ab0e8'); wg.addColorStop(0.5, '#7fdcff'); wg.addColorStop(1, '#d8f6ff'); fo(g, wg, 3);
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineCap = 'round';
  for (const [k, a, b, lw] of [[-0.32, 0.08, 0.7, 2.6], [-0.1, 0.2, 0.95, 3], [0.12, 0.05, 0.8, 2.6], [0.33, 0.25, 0.9, 2.2], [-0.45, 0.4, 0.95, 2]]) { g.lineWidth = lw; g.beginPath(); for (let s = a; s <= b; s += 0.05) { const yy = y0 + (y1 - y0) * s, xx = x + k * w * (1 + s * 0.45) + Math.sin(s * 14 + k * 9) * 1.6; s === a ? g.moveTo(xx, yy) : g.lineTo(xx, yy); } g.stroke(); }
  // foam and mist where it lands
  for (const [dx, dy, rx, ry] of [[-w * 0.6, 2, 16, 9], [-w * 0.2, 6, 20, 11], [w * 0.25, 4, 19, 10], [w * 0.65, 1, 15, 8], [0, -4, 22, 10]]) { g.beginPath(); g.ellipse(x + dx, y1 + dy, rx, ry, 0, 0, 7); fo(g, '#ffffff', 2.2); }
  for (const [dx, dy, rr2] of [[-w * 0.9, -14, 10], [w * 0.95, -18, 12], [-w * 0.3, -22, 9], [w * 0.4, -26, 8]]) { g.beginPath(); g.arc(x + dx, y1 + dy, rr2, 0, 7); g.fillStyle = 'rgba(235,250,255,.6)'; g.fill(); }
  g.fillStyle = '#ffffff'; for (const [dx, dy] of [[-w, -6], [w * 1.05, -10], [-w * 0.5, -30], [w * 0.6, -34]]) { g.beginPath(); g.arc(x + dx, y1 + dy, 2.4, 0, 7); g.fill(); }
}`);
rep('function portcullis(g, x, y) {', 'function portcullis(g, x, y, s) { if (s && s !== 1) { g.save(); g.translate(x, y); g.scale(s, s); portcullis(g, 0, 0); g.restore(); return; }');

rep('function caveMouth(g, x, y) {', String.raw`// a dirt road with pebbles and tufts along its edges
function dirtRoad(g, pts, w, r) {
  path(g, pts, w);
  g.save(); g.setLineDash([14, 22]); g.lineCap = 'round'; g.strokeStyle = 'rgba(160,110,50,.35)'; g.lineWidth = 3; wave(g, pts); g.stroke(); g.restore();
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
    for (let d = 10; d < L; d += 28) { const side = (Math.floor(d / 28) + i) % 2 ? 1 : -1, px = x0 + (x1 - x0) * d / L + nx * side * (w / 2 + 5), py = y0 + (y1 - y0) * d / L + ny * side * (w / 2 + 5);
      if (r() < 0.55) stone(g, px, py, 0.45 + r() * 0.25); else { g.strokeStyle = 'rgba(40,110,30,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(px - 3, py); g.lineTo(px - 1, py - 7); g.moveTo(px + 1, py); g.lineTo(px + 3, py - 8); g.stroke(); } } }
}
// a paved road near the town: grey stone with joints
function pavedRoad(g, pts, w) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  wave(g, pts); g.strokeStyle = OL; g.lineWidth = w + 5; g.stroke();
  wave(g, pts); g.strokeStyle = '#a89c8a'; g.lineWidth = w + 1; g.stroke();
  wave(g, pts); g.strokeStyle = '#ddd2bc'; g.lineWidth = w - 6; g.stroke();
  g.save(); g.setLineDash([2, 13]); wave(g, pts); g.strokeStyle = '#b4a890'; g.lineWidth = w - 6; g.lineCap = 'butt'; g.stroke(); g.restore();
  g.save(); g.setLineDash([16, 10]); wave(g, pts); g.strokeStyle = 'rgba(150,135,110,.6)'; g.lineWidth = 2; g.stroke(); g.restore();
}
// a stone staircase up a cliff: risers, treads and low side walls
function stairs(g, x, yTop, w, len) {
  const n = 7, sh = len / n;
  rr(g, x - w / 2 - 10, yTop - 4, w + 20, len + 8, 4); g.fillStyle = '#8a7e6c'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke();
  for (let k = 0; k < n; k++) { const y = yTop + k * sh; rr(g, x - w / 2, y, w, sh, 2); g.fillStyle = k % 2 ? '#e2d6bc' : '#efe6d2'; g.fill(); g.fillStyle = '#b8ab92'; g.fillRect(x - w / 2, y + sh - 3, w, 3); }
  g.lineWidth = 2; g.strokeStyle = OL; rr(g, x - w / 2, yTop, w, len, 2); g.stroke();
  for (const sx of [-1, 1]) { rr(g, x + sx * (w / 2 + 6) - 5, yTop - 8, 10, len + 10, 3); fo(g, '#cfc3ac', 2.2); for (const y of [yTop - 10, yTop + len - 2]) { rr(g, x + sx * (w / 2 + 6) - 7, y, 14, 9, 3); fo(g, '#d8ccb4', 2); } }
}
function caveMouth(g, x, y) {`);

// the river runs along the west edge; the tower stands on a knoll between it and the road
rep('const ANIO = [[686, 530], [600, 566], [450, 572], [320, 576], [210, 610], [130, 700], [96, 840], [80, 1000], [50, 1150], [0, 1240]];',
    'const ANIO = [[686, 530], [600, 566], [450, 572], [320, 576], [200, 600], [110, 660], [58, 780], [48, 960], [38, 1120], [0, 1220]];');
rep('  waterfall(g, 690, 462, 528, 40); stream(g, ANIO, 34, r);', '  stream(g, [[770, 360], [740, 410], [700, 448], [690, 466]], 26, r); stream(g, ANIO, 34, r); waterfall(g, 690, 462, 530, 34);');
rep('  path(g, VALLEY, 30); path(g, TUNNEL, 38); path(g, TOWN_ROAD, 38); path(g, NORTH, 34);', '  dirtRoad(g, VALLEY, 30, r); dirtRoad(g, TUNNEL, 36, r); pavedRoad(g, TOWN_ROAD, 38); pavedRoad(g, NORTH, 34);');
rep('  ramp(g, 262, 506, 40, 46);', '  stairs(g, 268, 500, 40, 58);');
rep('portcullis(g, 450, 1030);', 'portcullis(g, 450, 1030, 0.62);');
rep('capRing(g, 450, 1070, 70, 0);', 'capRing(g, 450, 1060, 60, 0);');
rep('  mound(g, 140, 860, 60, 36); capRing(g, 140, 860, 56, 0); watchtower(g, 140, 858);', '  mound(g, 122, 870, 44, 28); capRing(g, 122, 870, 46, 0); watchtower(g, 122, 868);');
rep("squad(g, 100, 920, 'e_arc', 2, 3, 1, '#3f7ae0', 'pennant'); squad(g, 190, 940, 'e_inf', 2, 4, 1, '#3f7ae0', 'vex');", "squad(g, 112, 940, 'e_arc', 2, 3, 0.9, '#3f7ae0', 'pennant'); squad(g, 132, 800, 'e_inf', 2, 4, 0.9, '#3f7ae0', 'vex');");
rep('num(g, 60, 790, 5);', 'num(g, 90, 836, 5);');
fs.writeFileSync('tibur.js', t); console.log('ok');
