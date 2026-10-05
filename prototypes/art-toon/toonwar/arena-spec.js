// The gladiator arena of the captured Colosseum as a CITYMAPS entry: an oval of sand, four gates, waves of gladiators.
// Appended after citymaps-spec.js in citywar.html (the page picks it by the iframe name «legwar:arena» or the hash #arena).
// Art follows production's approved sheet toon2d/arena-ui3.html; the numbers are starting values, balance is not tested.
const AR = { cx: 450, cy: 750, rx: 330, ry: 560 };
const arenaOutside = () => {   // everything outside the sand oval cannot be walked: horizontal strips either side of it
  const out = [{ rect: [0, 0, 900, AR.cy - AR.ry] }, { rect: [0, AR.cy + AR.ry, 900, 1500 - AR.cy - AR.ry] }];
  for (let y = AR.cy - AR.ry; y < AR.cy + AR.ry; y += 16) {
    const m = y + 8 - AR.cy, hw = AR.rx * Math.sqrt(Math.max(0, 1 - (m / AR.ry) ** 2));
    out.push({ rect: [0, y, AR.cx - hw, 17] }, { rect: [AR.cx + hw, y, 900 - AR.cx - hw, 17] });
  }
  return out;
};
function arenaGate(g, x, y, w, h, across) {   // stone frame, dark mouth, portcullis bars
  g.save();
  rr(g, x - w / 2 - 14, y - h / 2 - 14, w + 28, h + 28, 20); fo(g, '#bda574', 4);
  rr(g, x - w / 2, y - h / 2, w, h, 16); fo(g, '#2a1a10', 3.4);
  g.beginPath(); g.rect(x - w / 2 + 4, y - h / 2 + 4, w - 8, h - 8); g.clip();
  g.strokeStyle = '#8a8f96'; g.lineWidth = 6;
  for (let i = 1; i < 7; i++) { g.beginPath(); if (across) { g.moveTo(x - w / 2 + i * w / 7, y - h / 2); g.lineTo(x - w / 2 + i * w / 7, y + h / 2); } else { g.moveTo(x - w / 2, y - h / 2 + i * h / 7); g.lineTo(x + w / 2, y - h / 2 + i * h / 7); } g.stroke(); }
  g.restore();
}
// ---------------------------------------------------------------- obstacles: a different set of them for each city's arena
// kinds: rect (col, rack, crate, cage, plank) and oval (stump, statue, boulder, pool) ones block; mud only slows (x2).
const ARENA_CITY = (window.name.split(':')[2] || new URLSearchParams(location.search).get('city') || 'default').toLowerCase();
const ARENA_SETS = {
  default:   [['col', 605, 883, 85, 23], ['stump', 640, 560, 46, 20], ['stump', 590, 612, 46, 20], ['rack', 390, 727, 60, 27]],
  veii:      [['statue', 300, 520, 32, 22], ['statue', 600, 520, 32, 22], ['col', 450, 860, 85, 23], ['stump', 260, 960, 44, 19], ['stump', 640, 960, 44, 19], ['statue', 450, 650, 32, 22]],
  ostia:     [['pool', 300, 640, 90, 56], ['pool', 600, 880, 90, 56], ['crate', 585, 520, 34, 28], ['crate', 622, 552, 34, 28], ['crate', 280, 950, 34, 28], ['plank', 450, 780, 84, 16]],
  tibur:     [['boulder', 290, 560, 48, 34], ['boulder', 620, 600, 54, 36], ['boulder', 350, 880, 46, 32], ['boulder', 560, 940, 50, 34], ['boulder', 450, 720, 40, 30], ['mud', 300, 780, 74, 34], ['mud', 610, 770, 74, 34]],
  antium:    [['plank', 450, 690, 120, 18], ['crate', 320, 560, 34, 28], ['crate', 580, 560, 34, 28], ['pool', 300, 900, 80, 50], ['stump', 620, 920, 44, 19], ['crate', 360, 940, 34, 28]],
  praeneste: [['pool', 330, 600, 104, 62], ['pool', 580, 830, 104, 62], ['mud', 450, 700, 92, 40], ['mud', 300, 900, 74, 34], ['mud', 620, 560, 74, 34], ['stump', 450, 960, 44, 19]],
  capua:     [['rack', 310, 600, 62, 28], ['rack', 590, 600, 62, 28], ['cage', 330, 880, 42, 36], ['cage', 570, 880, 42, 36], ['stump', 450, 760, 38, 18]]
};
const ARENA_OBST = ARENA_SETS[ARENA_CITY] || ARENA_SETS.default;
const ARENA_NAME = { veii: 'Вейи', ostia: 'Остия', tibur: 'Тибур', antium: 'Анций', praeneste: 'Пренесте', capua: 'Капуя' };
const ARENA_RECT = ['col', 'rack', 'crate', 'cage', 'plank'], ARENA_SLOW = ['mud'];
const arenaFoot = ([k, x, y, a, b]) => ARENA_RECT.includes(k) ? { rect: [x - a, y - b, a * 2, b * 2] } : { ell: [x, y, a, b] };
function arenaObstacle(g, [k, x, y, a, b]) {
  g.save();
  if (k === 'col') { rr(g, x - a, y - b, a * 2, b * 2, 14); fo(g, '#cfcfcf', 4); g.beginPath(); g.ellipse(x - a, y, 16, b, 0, 0, 7); fo(g, '#e6e6e6', 4); }
  else if (k === 'stump') { g.beginPath(); g.ellipse(x, y + 12, a, b - 3, 0, 0, 7); fo(g, '#aaaaaa', 4); rr(g, x - a, y - 28, a * 2, 40, 10); fo(g, '#d6d6d6', 4); g.beginPath(); g.ellipse(x, y - 28, a, b - 3, 0, 0, 7); fo(g, '#ececec', 4); }
  else if (k === 'statue') { g.beginPath(); g.ellipse(x, y + 8, a, b - 6, 0, 0, 7); fo(g, '#9a9a9a', 4); rr(g, x - a + 4, y - 18, a * 2 - 8, 26, 6); fo(g, '#d6d6d6', 4); g.beginPath(); g.ellipse(x, y - 32, 11, 13, 0, 0, 7); fo(g, '#e2d2a8', 3.4); rr(g, x - 11, y - 20, 22, 14, 5); fo(g, '#e2d2a8', 3.4); }
  else if (k === 'rack') { rr(g, x - a, y - b, a * 2, b * 2, 10); fo(g, '#8a5a30', 4); [-0.6, 0, 0.6].forEach(f => stick(g, x + a * f, y - b, x + a * f, y - b - 52 + (f === 0 ? -10 : 0), '#a0703c', 6)); }
  else if (k === 'crate') { rr(g, x - a, y - b, a * 2, b * 2, 6); fo(g, '#b07a3e', 4); g.strokeStyle = OL; g.lineWidth = 3; g.beginPath(); g.moveTo(x - a, y - b); g.lineTo(x + a, y + b); g.moveTo(x + a, y - b); g.lineTo(x - a, y + b); g.stroke(); }
  else if (k === 'cage') { rr(g, x - a, y - b, a * 2, b * 2, 8); fo(g, '#7a7f86', 4); g.strokeStyle = '#c9ced4'; g.lineWidth = 4; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x + i * a / 2.4, y - b + 4); g.lineTo(x + i * a / 2.4, y + b - 4); g.stroke(); } }
  else if (k === 'plank') { rr(g, x - a, y - b, a * 2, b * 2, 8); fo(g, '#a0703c', 4); g.strokeStyle = 'rgba(60,30,10,.5)'; g.lineWidth = 3; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(x + i * a / 3.4, y - b + 3); g.lineTo(x + i * a / 3.4, y + b - 3); g.stroke(); } }
  else if (k === 'boulder') { g.beginPath(); g.ellipse(x, y + 8, a, b - 4, 0, 0, 7); fo(g, '#8f9aa2', 4); g.beginPath(); g.ellipse(x - 4, y - 2, a - 6, b - 8, 0, 0, 7); fo(g, '#b9c2c9', 3.4); g.beginPath(); g.ellipse(x - 12, y - 10, a / 3, b / 4, 0, 0, 7); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill(); }
  else if (k === 'pool') { g.beginPath(); g.ellipse(x, y, a + 12, b + 10, 0, 0, 7); fo(g, '#cfcfcf', 4); g.beginPath(); g.ellipse(x, y, a, b, 0, 0, 7); fo(g, '#4aa0d8', 3.4); g.beginPath(); g.ellipse(x - a / 4, y - b / 4, a / 2.4, b / 3, 0, 0, 7); g.fillStyle = 'rgba(255,255,255,.3)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2.4; g.beginPath(); g.ellipse(x + a / 5, y + b / 5, a / 2, b / 3, 0, 0, 7); g.stroke(); }
  else if (k === 'mud') { g.beginPath(); g.ellipse(x, y, a, b, 0, 0, 7); g.fillStyle = 'rgba(110,76,40,.62)'; g.fill(); g.setLineDash([7, 8]); g.lineWidth = 3; g.strokeStyle = 'rgba(70,45,20,.8)'; g.stroke(); g.setLineDash([]); for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(x + (i - 1.5) * a / 3, y + (i % 2 ? 6 : -6), 7, 3, 0, 0, 7); g.fillStyle = 'rgba(60,40,20,.55)'; g.fill(); } }
  g.restore();
}
// ---------------------------------------------------------------- spectators: little people in each city's colours; the front row is animated at run time
const ARENA_PALS = {
  default: ['#e2382c', '#3f7ae0', '#f2c14a', '#7ee05a', '#f4ecd8', '#b46bd6', '#ff8a3c'],
  veii: ['#c0392b', '#e8b63a', '#f4ecd8', '#8a4a2a', '#2f6fd6', '#d9822b'],
  ostia: ['#2f6fd6', '#5fd0f5', '#f4ecd8', '#f2c14a', '#2fa08a', '#e2382c'],
  tibur: ['#4a8a3a', '#8a9a6a', '#d9b46a', '#8a5a30', '#f4ecd8', '#c0392b'],
  antium: ['#2fa08a', '#e8c06a', '#f4ecd8', '#2f6fd6', '#c0392b', '#7a5aa8'],
  praeneste: ['#7a5aa8', '#f2c14a', '#f4ecd8', '#b46bd6', '#2f9a5a', '#e2382c'],
  capua: ['#c0392b', '#2a2a2e', '#f2c14a', '#f4ecd8', '#8a2be2', '#ff8a3c']
};
const ARENA_FLAG = { default: '#c0392b', veii: '#c0392b', ostia: '#2f6fd6', tibur: '#4a8a3a', antium: '#2fa08a', praeneste: '#7a5aa8', capua: '#8a2be2' };
const ARENA_PAL = ARENA_PALS[ARENA_CITY] || ARENA_PALS.default;
const ARENA_ROWS = [[352, 580, 1.0], [376, 608, 1.08], [400, 636, 1.16], [424, 664, 1.24]];   // row 0 is the front row, drawn live
const arenaRowN = (rx, ry) => Math.round(Math.PI * 2 * Math.sqrt((rx * rx + ry * ry) / 2) / 19);
function spectator(g, x, y, s, i, up, mouth) {   // up: 0 hands down, 1 one arm up, 2 both arms up
  const skin = ['#d9a77c', '#e9c29a', '#c98e63', '#f0c8a0'][i % 4], hair = ['#3a2414', '#6a4020', '#caa04a', '#222', '#8a8a8a'][(i * 7) % 5], tun = ARENA_PAL[i % ARENA_PAL.length];
  g.save(); g.translate(x, y); g.scale(s, s);
  if (up) { g.lineCap = 'round'; for (const d of up === 2 ? [-1, 1] : [1]) { g.strokeStyle = OL; g.lineWidth = 7; g.beginPath(); g.moveTo(d * 6, 2); g.lineTo(d * 11, -14); g.stroke(); g.strokeStyle = skin; g.lineWidth = 3.4; g.stroke(); } }
  rr(g, -8, -1, 16, 15, 6); fo(g, tun, 2.2);
  g.beginPath(); g.arc(0, -8, 7.4, 0, 7); fo(g, skin, 2.2);
  g.beginPath(); g.arc(0, -9.2, 7.4, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); fo(g, hair, 1.8);
  g.fillStyle = OL; g.beginPath(); g.arc(-2.6, -7.5, 1, 0, 7); g.arc(2.6, -7.5, 1, 0, 7); g.fill();
  if (mouth) { g.beginPath(); g.ellipse(0, -3.6, 2.4, 2, 0, 0, 7); g.fillStyle = '#5a1a14'; g.fill(); }
  g.restore();
}
function arenaPoint(rx, ry, a) { return [AR.cx + Math.cos(a) * rx, AR.cy + Math.sin(a) * ry]; }
// ---------------------------------------------------------------- the Emperor's box (four variants for the owner to pick from) and the live crowd
// variant: query ?box=A|B|C|D, or the 6th part of the frame name; default A.
const ARENA_BOXV = ((window.name.split(':')[5] || new URLSearchParams(location.search).get('box') || 'D') + '').toUpperCase();
const ARENA_BOXES = {
  A: { name: 'Пульвинар', k: 0.58, w: 190, h: 120, at: () => arenaPoint(404, 636, 0.62) },
  B: { name: 'Павильон', k: 0.58, w: 176, h: 140, at: () => arenaPoint(404, 636, 0.62) },
  C: { name: 'Триумфальная арка', k: 0.52, w: 240, h: 190, at: () => arenaPoint(398, 628, 0.58) },
  D: { name: 'Балкон над воротами', k: 0.6, w: 290, h: 124, at: () => [AR.cx, 98] }
};
const ARENA_BOX = (() => { const d = ARENA_BOXES[ARENA_BOXV] || ARENA_BOXES.A, [x, y] = d.at(); return { ...d, x, y, dw: d.w, dh: d.h, w: d.w * d.k, h: d.h * d.k }; })();   // w, h are the on-screen size after scaling
// no spectators on the frames of the gates or inside the box; above the grille they may sit
const arenaSkip = (x, y) => (Math.abs(x - AR.cx) < 118 && Math.abs(y - (AR.cy - AR.ry)) < 52) || (Math.abs(x - AR.cx) < 118 && Math.abs(y - (AR.cy + AR.ry)) < 52)
  || (Math.abs(y - AR.cy) < 118 && Math.abs(x - (AR.cx - AR.rx)) < 52) || (Math.abs(y - AR.cy) < 118 && Math.abs(x - (AR.cx + AR.rx)) < 52)
  || (Math.abs(x - ARENA_BOX.x) < ARENA_BOX.w / 2 + 14 && Math.abs(y - ARENA_BOX.y) < ARENA_BOX.h / 2 + 22);
function eagle(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(0, -10); g.quadraticCurveTo(-26, -28, -36, -6); g.quadraticCurveTo(-20, -8, -8, 2); g.lineTo(0, 13); g.lineTo(8, 2); g.quadraticCurveTo(20, -8, 36, -6); g.quadraticCurveTo(26, -28, 0, -10); g.closePath(); fo(g, '#ffcc33', 3); g.beginPath(); g.arc(0, -12, 5.5, 0, 7); fo(g, '#ffcc33', 2.4); g.restore(); }
function standard(g, x, y, h) { g.strokeStyle = OL; g.lineWidth = 8; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.stroke(); g.strokeStyle = '#a0703c'; g.lineWidth = 4; g.stroke(); rr(g, x - 18, y - h + 14, 36, 26, 4); fo(g, '#c0392b', 2.8); g.fillStyle = '#ffcc33'; g.font = '400 10px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText('SPQR', x, y - h + 31); eagle(g, x, y - h + 4, 0.5); }
function person(g, x, y, toga, i, big, up, look) {   // up: 0 hands down, 1 one arm raised, 2 both; look: -1..1 turns the head
  const s = big ? 1.35 : 1, skin = ['#e9c29a', '#d9a77c', '#f0c8a0'][i % 3]; g.save(); g.translate(x, y); g.scale(s, s);
  if (up) { g.lineCap = 'round'; for (const d of up === 2 ? [-1, 1] : [1]) { g.strokeStyle = OL; g.lineWidth = 7; g.beginPath(); g.moveTo(d * 8, 2); g.lineTo(d * 13, -14); g.stroke(); g.strokeStyle = skin; g.lineWidth = 3.4; g.stroke(); } }
  rr(g, -10, -2, 20, 20, 7); fo(g, toga, 2.4); g.strokeStyle = '#8a2be2'; g.lineWidth = 3; g.beginPath(); g.moveTo(-4, 0); g.lineTo(-6, 17); g.stroke();
  const lx = (look || 0) * 1.6; g.save(); g.translate(lx, 0);
  g.beginPath(); g.arc(0, -10, 8.4, 0, 7); fo(g, skin, 2.4);
  g.beginPath(); g.arc(0, -11.4, 8.4, Math.PI * 1.04, Math.PI * 1.96); g.closePath(); fo(g, ['#d8d8d8', '#3a2414', '#8a8a8a', '#6a4020'][i % 4], 2);
  g.fillStyle = OL; g.beginPath(); g.arc(-3 + (look || 0), -9.4, 1.1, 0, 7); g.arc(3 + (look || 0), -9.4, 1.1, 0, 7); g.fill();
  if (big) { g.strokeStyle = '#4a9a3a'; g.lineWidth = 3.2; g.beginPath(); g.arc(0, -13, 9, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); }
  g.restore(); g.restore();
}
function guardP(g, x, y, d) { g.beginPath(); g.moveTo(x + d * 10, y + 38); g.lineTo(x + d * 10, y - 30); g.lineWidth = 6; g.strokeStyle = OL; g.stroke(); g.lineWidth = 3; g.strokeStyle = '#a0703c'; g.stroke(); rr(g, x - 8, y + 10, 16, 26, 6); fo(g, '#c0392b', 2.4); g.beginPath(); g.arc(x, y + 2, 8, 0, 7); fo(g, '#e9c29a', 2.4); g.beginPath(); g.arc(x, y - 1, 8.6, Math.PI, 0); g.closePath(); fo(g, '#b4bec8', 2.2); g.beginPath(); g.moveTo(x - 3, y - 8); g.lineTo(x, y - 18); g.lineTo(x + 3, y - 8); g.closePath(); fo(g, '#e2382c', 1.8); }
function throne(g, x, y) { rr(g, x - 24, y - 14, 48, 46, 10); fo(g, '#ffcc33', 3); rr(g, x - 18, y + 2, 36, 22, 6); fo(g, '#8a2be2', 2.4); }
const boxA = (g, bx, by, w, h, skipPeople) => {   // Pulvinar: marble podium, columns, awning, senators and guards
  const L = bx - w / 2, T = by - h / 2;
  rr(g, L - 8, T + 22, w + 16, h - 14, 12); fo(g, '#bda574', 4); rr(g, L, T + 32, w, h - 30, 8); fo(g, '#7a1f2a', 3.2);
  if (!skipPeople) [-70, -42, 42, 70].forEach((dx, i) => person(g, bx + dx, T + 54, i % 2 ? '#f4efe2' : '#ece4d0', i + 1, false));
  throne(g, bx, T + 62); if (!skipPeople) person(g, bx, T + 56, '#8a2be2', 7, true);
  guardP(g, bx - 84, T + 60, -1); guardP(g, bx + 84, T + 60, 1);
  rr(g, L - 4, T + 86, w + 8, 18, 6); fo(g, '#e8d9a8', 3.4); for (let i = 0; i <= 8; i++) { rr(g, L + 2 + i * (w - 12) / 8, T + 88, 8, 14, 3); fo(g, '#ffcc33', 2); }
  for (const d of [-1, 1]) { rr(g, bx + d * (w / 2 + 2) - 7, T - 18, 14, 108, 4); fo(g, '#f4efe2', 3.2); rr(g, bx + d * (w / 2 + 2) - 11, T - 24, 22, 10, 3); fo(g, '#ffcc33', 2.6); }
  g.beginPath(); g.moveTo(L - 22, T - 16); g.lineTo(L + 14, T - 62); g.lineTo(L + w - 14, T - 62); g.lineTo(L + w + 22, T - 16); g.closePath(); fo(g, '#8a2be2', 4);
  for (let i = 0; i < 7; i++) { const sx = L - 22 + i * (w + 44) / 7; g.beginPath(); g.moveTo(sx, T - 16); g.lineTo(sx + (w + 44) / 14, T - 2); g.lineTo(sx + (w + 44) / 7, T - 16); g.closePath(); fo(g, i % 2 ? '#ffcc33' : '#8a2be2', 2.6); }
  eagle(g, bx, T - 42, 0.9); standard(g, L - 30, T + 90, 92); standard(g, L + w + 30, T + 90, 92);
};
function boxAPeople(g, bx, by, t, ch) {   // the people in the Pulvinar, drawn live: they sway, glance about, clap when the crowd roars; the emperor raises a hand
  const T = by - 60;
  [-70, -42, 42, 70].forEach((dx, i) => {
    const h = arenaHash(i + 5, 2), ph = t * (1.1 + h * 0.9) + h * 9, bob = Math.max(0, Math.sin(ph)) * 1.6;
    const clap = ch > 0.4 && Math.sin(t * (7 + h * 3) + i) > 0.2, hand = Math.sin(t * 0.6 + h * 20) > 0.88;
    person(g, bx + dx, T + 54 - bob, i % 2 ? '#f4efe2' : '#ece4d0', i + 1, false, clap ? 2 : hand ? 1 : 0, Math.sin(t * 0.5 + h * 13));
  });
  const eb = Math.max(0, Math.sin(t * 1.3)) * 1.2, wave = ch > 0.55 || Math.sin(t * 0.35) > 0.93;
  person(g, bx, T + 56 - eb, '#8a2be2', 7, true, wave ? 1 : 0, Math.sin(t * 0.4) * 0.7);
}
const boxB = (g, bx, by, w, h) => {   // open golden pavilion with a dome, fan-bearers and drapes
  const L = bx - w / 2, T = by - h / 2;
  rr(g, L, T + 70, w, 62, 10); fo(g, '#bda574', 4); rr(g, L + 8, T + 78, w - 16, 44, 8); fo(g, '#7a1f2a', 3);
  for (let i = 0; i < 3; i++) { rr(g, bx - 40 - i * 10, T + 118 + i * 5, 80 + i * 20, 6, 3); fo(g, '#e8d9a8', 2); }
  throne(g, bx, T + 74); person(g, bx, T + 68, '#8a2be2', 7, true);
  for (const d of [-1, 1]) {
    const fx = bx + d * 52; person(g, fx, T + 82, '#f4efe2', 3 + d, false);
    g.beginPath(); g.moveTo(fx + d * 6, T + 82); g.lineTo(fx + d * 20, T + 48); g.lineWidth = 4; g.strokeStyle = '#a0703c'; g.stroke();
    for (let k = -2; k <= 2; k++) { g.beginPath(); g.ellipse(fx + d * 22 + k * 5, T + 38 - Math.abs(k) * 2, 4, 14, k * 0.3, 0, 7); fo(g, k % 2 ? '#f4efe2' : '#ffcc33', 1.8); }
  }
  for (const d of [-1, 1]) for (const e of [0.52, 0.98]) { rr(g, bx + d * w * e / 2 - 5, T + 26, 10, 100, 3); fo(g, '#ffcc33', 3); }
  for (const d of [-1, 1]) { g.beginPath(); g.moveTo(bx + d * w * 0.49 - 5 * d, T + 30); g.quadraticCurveTo(bx + d * w * 0.3, T + 52, bx + d * w * 0.34, T + 98); g.lineTo(bx + d * w * 0.47, T + 98); g.closePath(); fo(g, '#c0392b', 2.6); }
  g.beginPath(); g.moveTo(L - 8, T + 28); g.quadraticCurveTo(L + 6, T - 30, bx, T - 36); g.quadraticCurveTo(L + w - 6, T - 30, L + w + 8, T + 28); g.closePath(); fo(g, '#ffcc33', 4);
  for (let i = 0; i < 6; i++) { const sx = L - 8 + i * (w + 16) / 6; g.beginPath(); g.arc(sx + (w + 16) / 12, T + 28, (w + 16) / 12, 0, Math.PI); fo(g, i % 2 ? '#8a2be2' : '#c0392b', 2.4); }
  g.beginPath(); g.moveTo(bx, T - 36); g.lineTo(bx, T - 54); g.lineWidth = 4; g.strokeStyle = OL; g.stroke(); g.beginPath(); g.arc(bx, T - 56, 7, 0, 7); fo(g, '#ffcc33', 2.6);
};
const boxC = (g, bx, by, w, h) => {   // triumphal arch with a gilded quadriga, the emperor in the opening
  const L = bx - w / 2, T = by - h / 2;
  rr(g, L, T + 54, w, h - 54, 8); fo(g, '#e8dcc0', 4);
  g.beginPath(); g.moveTo(bx - 56, T + h); g.lineTo(bx - 56, T + 100); g.arc(bx, T + 100, 56, Math.PI, 0); g.lineTo(bx + 56, T + h); g.closePath(); fo(g, '#3a2418', 3.4);
  for (let i = 0; i < 4; i++) { rr(g, bx - 48 + i * 4, T + h - 8 - i * 8, 96 - i * 8, 8, 2); fo(g, '#7a1f2a', 2); }
  throne(g, bx, T + 114); person(g, bx, T + 106, '#8a2be2', 7, true);
  for (const d of [-1, 1]) { rr(g, bx + d * 84 - 11, T + 66, 22, 90, 4); fo(g, '#f4efe2', 3); rr(g, bx + d * 84 - 15, T + 60, 30, 10, 3); fo(g, '#ffcc33', 2.4); guardP(g, bx + d * 100, T + 120, d); }
  rr(g, L - 8, T + 34, w + 16, 24, 6); fo(g, '#ffcc33', 3.4); g.fillStyle = '#7a1f2a'; g.font = '400 13px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText('S P Q R', bx, T + 52);
  rr(g, bx - 70, T + 14, 140, 22, 4); fo(g, '#e8dcc0', 3.4);
  g.beginPath(); g.arc(bx + 6, T + 8, 17, 0, 7); fo(g, '#ffcc33', 3);
  for (let k = 0; k < 4; k++) { const hx = bx - 52 + k * 26; g.beginPath(); g.ellipse(hx + 26, T + 6, 9, 14, -0.5, 0, 7); fo(g, '#ffcc33', 2.6); g.beginPath(); g.ellipse(hx + 34, T - 6, 7, 5, -0.4, 0, 7); fo(g, '#ffe28a', 2.2); }
  standard(g, L - 18, T + h, 100); standard(g, L + w + 18, T + h, 100);
};
function boxDPeople(g, bx, by, t, ch) {   // the people on the balcony, drawn live: they sway, glance about and clap; the emperor raises a hand when the crowd roars
  const T = by - 62, L = bx - 145;
  const lively = (x, y, toga, i, big, k) => {
    const h = arenaHash(k + 17, 4), ph = t * (1.1 + h * 0.9) + h * 9, bob = Math.max(0, Math.sin(ph)) * (big ? 1.2 : 1.6);
    const clap = !big && ch > 0.4 && Math.sin(t * (7 + h * 3) + k) > 0.2, hand = big ? (ch > 0.55 || Math.sin(t * 0.35) > 0.93) : Math.sin(t * 0.6 + h * 20) > 0.88;
    person(g, x, y - bob, toga, i, big, clap ? 2 : hand ? 1 : 0, Math.sin(t * (big ? 0.4 : 0.5) + h * 13) * (big ? 0.7 : 1));
  };
  for (let i = 0; i < 3; i++) {
    const ax = L + 290 * (0.2 + i * 0.3);
    if (i === 1) lively(ax, T + 72, '#8a2be2', 7, true, 9);
    else { lively(ax - 8, T + 86, '#f4efe2', i + 2, false, i * 2); lively(ax + 12, T + 90, '#ece4d0', i + 4, false, i * 2 + 1); }
  }
}
const boxD = (g, bx, by, w, h, skipPeople) => {   // a balcony cut into the wall above the north gate: three arches, banners hanging down
  const L = bx - w / 2, T = by - h / 2;
  rr(g, L, T + 18, w, h - 18, 10); fo(g, '#dccb9f', 4); rr(g, L - 8, T + 6, w + 16, 20, 6); fo(g, '#bda574', 3.6);
  for (let i = 0; i < 3; i++) {
    const ax = L + w * (0.2 + i * 0.3), aw = i === 1 ? 50 : 38;
    g.beginPath(); g.moveTo(ax - aw, T + h - 8); g.lineTo(ax - aw, T + 62); g.arc(ax, T + 62, aw, Math.PI, 0); g.lineTo(ax + aw, T + h - 8); g.closePath(); fo(g, '#3a2418', 3);
    if (i === 1) { throne(g, ax, T + 78); if (!skipPeople) person(g, ax, T + 72, '#8a2be2', 7, true); } else if (!skipPeople) { person(g, ax - 8, T + 86, '#f4efe2', i + 2, false); person(g, ax + 12, T + 90, '#ece4d0', i + 4, false); }
  }
  rr(g, L - 4, T + h - 12, w + 8, 14, 5); fo(g, '#e8d9a8', 3.2); for (let i = 0; i <= 14; i++) { rr(g, L + 2 + i * (w - 12) / 14, T + h - 10, 7, 10, 2); fo(g, '#ffcc33', 1.8); }
  eagle(g, bx, T - 8, 1.1);
  for (const d of [-1, 1]) { g.beginPath(); g.moveTo(bx + d * (w / 2 - 6), T + 10); g.lineTo(bx + d * (w / 2 + 34), T + 10); g.lineTo(bx + d * (w / 2 + 34), T + 96); g.lineTo(bx + d * (w / 2 + 14), T + 84); g.lineTo(bx + d * (w / 2 - 6), T + 96); g.closePath(); fo(g, '#8a2be2', 3.2); g.fillStyle = '#ffcc33'; g.beginPath(); g.arc(bx + d * (w / 2 + 14), T + 44, 8, 0, 7); g.fill(); }
};
function arenaDecor(g) {   // the city's banners on the stands and the Emperor's box
  const flag = ARENA_FLAG[ARENA_CITY] || ARENA_FLAG.default;
  for (const a of [-0.7, Math.PI + 0.7, Math.PI - 0.7]) {
    const [x, y] = arenaPoint(414, 646, a);
    if (Math.abs(x - ARENA_BOX.x) < 170 && Math.abs(y - ARENA_BOX.y) < 170) continue;
    g.strokeStyle = OL; g.lineWidth = 9; g.beginPath(); g.moveTo(x, y + 20); g.lineTo(x, y - 86); g.stroke(); g.strokeStyle = '#a0703c'; g.lineWidth = 5; g.stroke();
    g.beginPath(); g.moveTo(x, y - 86); g.lineTo(x + 52, y - 74); g.lineTo(x + 40, y - 56); g.lineTo(x + 52, y - 40); g.lineTo(x, y - 46); g.closePath(); fo(g, flag, 3.4);
    g.beginPath(); g.arc(x + 20, y - 64, 6, 0, 7); fo(g, '#ffcc33', 2.4);
  }
  g.save(); g.translate(ARENA_BOX.x, ARENA_BOX.y); g.scale(ARENA_BOX.k, ARENA_BOX.k);
  ({ A: boxA, B: boxB, C: boxC, D: boxD }[ARENA_BOXV] || boxA)(g, 0, 0, ARENA_BOX.dw, ARENA_BOX.dh, ARENA_BOXV === 'A' || ARENA_BOXV === 'D');
  g.restore();
}
// the live crowd: every row is drawn each frame from cached sprites, with a wave running round the oval; louder after kills
const ARENA_SPR = {};
function spectatorSprite(i, up, mouth, s) {
  const key = (i % 12) + ',' + up + ',' + (mouth ? 1 : 0) + ',' + s;
  if (!ARENA_SPR[key]) { const c = document.createElement('canvas'); c.width = 64; c.height = 88; const g = c.getContext('2d'); g.scale(2, 2); spectator(g, 16, 26, s, i % 12, up, mouth); ARENA_SPR[key] = c; }
  return ARENA_SPR[key];
}
const arenaHash = (i, r) => Math.abs((Math.sin(i * 12.9898 + r * 78.233) * 43758.5453) % 1);
function arenaCrowdLive(c, t, ch) {
  for (let row = ARENA_ROWS.length - 1; row >= 0; row--) {
    const [rx, ry, s] = ARENA_ROWS[row], n = arenaRowN(rx, ry);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.2832 + row * 0.5, [x, y] = arenaPoint(rx, ry, a); if (arenaSkip(x, y)) continue;
      const h1 = arenaHash(i, row), h2 = arenaHash(i + 71, row + 3), h3 = arenaHash(i + 13, row + 9);   // every spectator has its own rhythm
      const cyc = (2.2 + h1 * 4.5) / (1 + 1.6 * ch), win = 0.28 + 0.18 * ch, ph = ((t + h2 * 20) % cyc) / cyc;
      const act = ph < win ? Math.sin(ph / win * Math.PI) : 0;   // a short jump now and then, at random
      const bob = act * (3 + 6 * ch) + (Math.sin(t * (1.2 + h3 * 1.5) + h1 * 6) * 0.5 + 0.5) * 0.8 + (ch > 0.3 ? Math.max(0, Math.sin(t * (6 + h3 * 4) + h2 * 9)) * ch * 2.5 : 0);
      const up = act > 0.55 ? 2 : act > 0.15 ? 1 : (ch > 0.4 && h3 > 0.6) ? 1 : 0;
      c.drawImage(spectatorSprite(i, up, act > 0.2 || (ch > 0.2 && h2 > 0.5), s), x - 16, y - bob - 26, 32, 44);
    }
  }
}
function arenaWorld(g, r) {
  g.fillStyle = '#3a2414'; g.fillRect(0, 0, 900, 1500);
  const wg = g.createLinearGradient(0, 0, 0, 1500); wg.addColorStop(0, '#4a2e18'); wg.addColorStop(1, '#2e1c0e'); g.fillStyle = wg; g.fillRect(0, 0, 900, 1500);
  // travertine wall and three stepped tiers
  [['#cdb98c', 446, 700], ['#dccb9f', 424, 672], ['#c9b283', 402, 644], ['#d6c496', 380, 616]].forEach(([c, rx, ry]) => { g.beginPath(); g.ellipse(AR.cx, AR.cy, rx, ry, 0, 0, 7); fo(g, c, 4); });
  // the sand
  g.beginPath(); g.ellipse(AR.cx, AR.cy, AR.rx + 4, AR.ry + 4, 0, 0, 7); fo(g, '#ecd49a', 5);
  g.beginPath(); g.ellipse(AR.cx, AR.cy, AR.rx - 24, AR.ry - 24, 0, 0, 7); g.setLineDash([6, 16]); g.lineWidth = 4; g.strokeStyle = '#c9a15a'; g.stroke(); g.setLineDash([]);
  for (let i = 0; i < 70; i++) { const a = r() * 6.28, d = Math.sqrt(r()), x = AR.cx + Math.cos(a) * (AR.rx - 40) * d, y = AR.cy + Math.sin(a) * (AR.ry - 40) * d; g.beginPath(); g.ellipse(x, y, 24 + r() * 26, 7 + r() * 6, 0, 0, 7); g.fillStyle = 'rgba(190,150,80,.35)'; g.fill(); }
  ARENA_OBST.slice().sort((p, q) => p[2] - q[2]).forEach(o => arenaObstacle(g, o));
  // the four gates
  arenaGate(g, AR.cx, AR.cy - AR.ry - 2, 190, 66, true); arenaGate(g, AR.cx, AR.cy + AR.ry + 2, 190, 66, true);
  arenaGate(g, AR.cx - AR.rx - 2, AR.cy, 66, 190, false); arenaGate(g, AR.cx + AR.rx + 2, AR.cy, 66, 190, false);
  arenaDecor(g);
}
const ARENA_WAVES = [
  { name: 'Фракийцы', sp: [['thracian', 4, 'n']] },
  { name: 'Фракийцы', sp: [['thracian', 4, 'w'], ['thracian', 3, 'e']] },
  { name: 'Мирмиллоны', sp: [['mirmillo', 5, 'n'], ['thracian', 3, 'w']] },
  { name: 'Чемпион арены', boss: true, sp: [['champion', 3, 'n'], ['mirmillo', 4, 'w']] },
  { name: 'Сетчатые бойцы', sp: [['retiarius', 4, 'w'], ['retiarius', 4, 'e'], ['mirmillo', 4, 'n']] },
  { name: 'Ретиарии и фракийцы', sp: [['retiarius', 4, 'n'], ['thracian', 5, 'w'], ['thracian', 5, 'e']] },
  { name: 'Секуторы', sp: [['secutor', 5, 'n'], ['secutor', 4, 'w'], ['retiarius', 4, 'e']] },
  { name: 'Чемпионы арены', boss: true, sp: [['champion', 3, 'n'], ['champion', 3, 'w'], ['secutor', 5, 'e'], ['mirmillo', 5, 'n']] }
];
CITYMAPS.arena = {
  title: 'АРЕНА', sub: 'Колизей' + (ARENA_NAME[ARENA_CITY] ? ' · ' + ARENA_NAME[ARENA_CITY] : ''), seed: 91, draw: (g, r) => arenaWorld(g, r), win: 'Все волны отбиты — толпа ревёт от восторга!',
  help: '<p><b>Цель:</b> отбить <b>8 волн гладиаторов</b>. Они выходят из решётчатых ворот: над воротами маркер с типом бойцов, числом и таймером. Выбиты все четыре отряда — игры проиграны.</p>'
    + ARMY_HELP + '<p><b>Гладиаторы:</b> фракийцы быстрые, мирмиллоны за большими щитами, ретиарии сетью замедляют, секуторы бьют в упор, чемпион — один сильный боец. Перед каждой волной глашатай называет состав, кнопка «Позвать волну» вызывает её раньше.</p>',
  // no camp on the sand: nothing heals or shelters squads there
  camp: { x: -900, y: -900, rx: 1, ry: 1 }, tents: [], starts: [[360, 1120], [450, 1150], [540, 1120], [450, 1070]], cam: { x: 450, y: 1000 },
  nav: {
    block: [...arenaOutside(), ...ARENA_OBST.filter(o => !ARENA_SLOW.includes(o[0])).map(arenaFoot)],
    slow: ARENA_OBST.filter(o => ARENA_SLOW.includes(o[0])).map(arenaFoot)
  },
  sites: [],
  points: [{ name: '-', x: -900, y: -900, r: 1, need: 99 }, { name: '-', x: -900, y: -900, r: 1, need: 99 }, { name: 'Арена', x: -900, y: -900, r: 1, need: 99, final: true }],
  enemies: [],
  waves: { first: 18, pause: 12, gates: { n: [450, 300], w: [200, 750], e: [700, 750] }, names: { n: 'север', w: 'запад', e: 'восток' }, list: ARENA_WAVES }
};
