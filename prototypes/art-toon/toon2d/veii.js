// Builds veii.html: the battle map for Вейи («Первая кровь», 1/5) in the cartoon style, for approval before it goes into the battle engine.
// Matches the campaign map: we march from Rome in the west, the Tiber runs to the south, the road north leads to Tibur.
const fs = require('fs'), path = require('path');
const gen = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
const js = gen.slice(gen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, gen.indexOf('`;\nconst html'));
const helpers = js.slice(0, js.indexOf('function drawWorld(g) {'));
const tj = fs.readFileSync(path.join(__dirname, 'terrain.js'), 'utf8');
const tsheet = tj.slice(tj.indexOf('// ---------------------------------------------------------------- rubble: boulders'), tj.indexOf('// ---------------------------------------------------------------- 1. rubble in three states'));
const tb = fs.readFileSync(path.join(__dirname, 'tibur.js'), 'utf8');
const tibHelpers = tb.slice(tb.indexOf('function stream(g, pts, w, r) {'), tb.indexOf('function drawWorld(g, labels) {'));
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
const between = (src, a, b) => src.slice(src.indexOf(a), src.indexOf(b, src.indexOf(a)));
const ban = between(cas, 'const BAN = {', 'const REFILL'), art = between(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const draw = String.raw`
// ---------------------------------------------------------------- the map's shapes (north up, as on the campaign map)
const TOWN_P = [[440, 0], [900, 0], [900, 640], [780, 676], [640, 690], [520, 640], [470, 520], [436, 380], [420, 200]];
const TIBER = [[0, 1440], [180, 1416], [400, 1446], [620, 1418], [900, 1440]];
const CREMERA = [[372, 0], [366, 180], [384, 380], [440, 610], [520, 800], [610, 980], [690, 1200], [760, 1424]];
const MAIN = [[0, 1290], [200, 1300], [420, 1268], [600, 1236], [690, 1210], [740, 1150], [700, 980], [660, 820], [650, 700]];
const NORTH_RD = [[200, 1250], [190, 1080], [176, 860], [170, 680], [150, 600], [205, 500], [285, 494], [350, 486], [390, 410], [434, 392]];
const TOWN_RD = [[650, 700], [640, 560], [620, 420], [640, 300], [650, 150], [650, 0]];
const WEST_ST = [[430, 390], [520, 380], [600, 330], [640, 300]];
const RUBBLE = [[668, 1214], [285, 494]];
const NECRO = [[40, 420, 30], [96, 400, 34], [150, 430, 30], [120, 452, 22], [180, 404, 26], [214, 424, 34], [270, 404, 38], [322, 436, 32], [246, 458, 24], [300, 462, 22]];
const TUMULI = [[330, 960, 54], [450, 1110, 46], [90, 980, 40], [520, 1300, 38]];

// ---------------------------------------------------------------- Etruscan pieces
function tumulus(g, x, y, r) {
  g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 10, y + r * 0.32, r * 1.05, r * 0.3, 0, 0, 7); g.fill();
  // the stone drum
  g.beginPath(); g.ellipse(x, y + 2, r, r * 0.42, 0, 0, Math.PI); g.lineTo(x - r, y - 14); g.ellipse(x, y - 14, r, r * 0.42, 0, Math.PI, 0, true); g.closePath(); fo(g, '#d8c8a4', 2.6);
  g.strokeStyle = 'rgba(80,60,40,.55)'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, y - 6, r, r * 0.42, 0, 0.15, Math.PI - 0.15); g.stroke();
  for (let k = -0.85; k <= 0.85; k += 0.24) { const yy = Math.sqrt(1 - k * k) * r * 0.42; g.beginPath(); g.moveTo(x + k * r, y - 14 + yy); g.lineTo(x + k * r, y + 2 + yy); g.stroke(); }
  // the grassy dome
  g.beginPath(); g.ellipse(x, y - 14, r, r * 0.42, 0, 0, Math.PI); g.bezierCurveTo(x - r * 0.95, y - 14 - r * 0.9, x + r * 0.95, y - 14 - r * 0.9, x + r, y - 14); g.closePath();
  const mg = g.createRadialGradient(x - r * 0.35, y - r * 0.75, 2, x, y - r * 0.3, r * 1.1); mg.addColorStop(0, '#c4ec86'); mg.addColorStop(1, '#6cb83e'); fo(g, mg, 2.6);
  g.fillStyle = 'rgba(255,255,220,.35)'; g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.62, r * 0.28, r * 0.12, -0.3, 0, 7); g.fill();
  rr(g, x - 8, y + r * 0.42 - 16, 16, 18, 7); fo(g, '#3a2414', 2.2);
}
function etruscanTemple(g, x, y) {
  g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 10, y + 6, 92, 18, 0, 0, 7); g.fill();
  rr(g, x - 76, y - 22, 152, 26, 4); fo(g, '#b8ab92', 2.8); for (let k = 0; k < 4; k++) { rr(g, x - 30 + k * 2, y - 2 + k * 5 - 20, 60 - k * 4, 6, 2); }
  rr(g, x - 64, y - 82, 128, 62, 3); fo(g, '#efe4cc', 2.6); rr(g, x - 64, y - 82, 128, 22, 3); fo(g, '#d9cbaa', 2.2);
  for (let k = 0; k < 4; k++) { rr(g, x - 54 + k * 34, y - 60, 12, 40, 4); fo(g, '#fffaf0', 2); }
  g.beginPath(); g.moveTo(x - 84, y - 80); g.lineTo(x, y - 124); g.lineTo(x + 84, y - 80); g.closePath(); fo(g, '#c8603a', 3);
  g.beginPath(); g.moveTo(x, y - 124); g.lineTo(x + 84, y - 80); g.lineTo(x + 2, y - 80); g.closePath(); g.fillStyle = '#a84a2c'; g.fill();
  g.strokeStyle = 'rgba(90,30,10,.5)'; g.lineWidth = 1.6; for (let k = -70; k <= 70; k += 14) { g.beginPath(); g.moveTo(x + k, y - 80); g.lineTo(x + k * 0.1, y - 120); g.stroke(); }
  rr(g, x - 86, y - 84, 172, 7, 3); fo(g, '#8e3d22', 2.2);
  // terracotta statues on the ridge, as at Portonaccio
  for (const dx of [-46, 0, 46]) { const sy = y - 124 + Math.abs(dx) * 0.52; rr(g, x + dx - 5, sy - 20, 10, 18, 4); fo(g, '#d8783e', 2); g.beginPath(); g.arc(x + dx, sy - 24, 5, 0, 7); fo(g, '#d8783e', 2); }
}
function etrHouse(g, x, y) { g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 6, y + 2, 32, 8, 0, 0, 7); g.fill(); rr(g, x - 26, y - 26, 52, 28, 3); fo(g, '#e2cfa6', 2.6); g.beginPath(); g.moveTo(x - 32, y - 24); g.lineTo(x - 22, y - 42); g.lineTo(x + 22, y - 42); g.lineTo(x + 32, y - 24); g.closePath(); fo(g, '#c8603a', 2.6); rr(g, x - 6, y - 16, 12, 18, 3); fo(g, '#5a3a20', 2); }
function olive(g, x, y, s) { g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 6, y + 2, 20 * s, 6 * s, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - 3 * s, y); g.quadraticCurveTo(x - 6 * s, y - 12 * s, x, y - 18 * s); g.quadraticCurveTo(x + 4 * s, y - 10 * s, x + 3 * s, y); g.closePath(); fo(g, '#8a6a4a', 2); blob(g, x, y - 26 * s, 20 * s, 14 * s, x, 9); fo(g, '#9ab86a', 2.4); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(x - 6 * s, y - 30 * s, 7 * s, 4 * s, 0, 0, 7); g.fill(); }
function vineyard(g, x, y, w, h) { rr(g, x, y, w, h, 10); g.fillStyle = '#9ccc5a'; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(60,90,30,.5)'; g.stroke(); for (let yy = y + 12; yy < y + h - 4; yy += 16) { g.strokeStyle = '#8a5a30'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 8, yy); g.lineTo(x + w - 8, yy); g.stroke(); for (let xx = x + 12; xx < x + w - 8; xx += 14) { g.beginPath(); g.arc(xx, yy - 3, 5, 0, 7); fo(g, '#5aa83a', 1.4); g.fillStyle = '#7a3a8a'; g.beginPath(); g.arc(xx + 2, yy + 1, 2, 0, 7); g.fill(); } } }
function quarry(g, x, y) { blob(g, x, y, 70, 40, 4, 10); g.fillStyle = '#d9a86a'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke(); for (const [dx, dy] of [[-30, -8], [10, -16], [30, 8], [-6, 12]]) { rr(g, x + dx - 12, y + dy - 8, 24, 16, 3); fo(g, '#e8c08a', 2); } rr(g, x + 34, y - 30, 8, 30, 2); fo(g, '#8a5a30', 2); rr(g, x + 20, y - 34, 36, 6, 2); fo(g, '#8a5a30', 2); }
function mill(g, x, y) { g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 8, y + 3, 40, 9, 0, 0, 7); g.fill(); rr(g, x - 30, y - 40, 60, 42, 4); fo(g, '#e2cfa6', 2.6); g.beginPath(); g.moveTo(x - 36, y - 38); g.lineTo(x, y - 62); g.lineTo(x + 36, y - 38); g.closePath(); fo(g, '#c8603a', 2.6); g.beginPath(); g.arc(x - 40, y - 14, 20, 0, 7); fo(g, '#8a5a30', 2.6); for (let a = 0; a < 6.28; a += 0.785) { g.strokeStyle = OL; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 40, y - 14); g.lineTo(x - 40 + Math.cos(a) * 20, y - 14 + Math.sin(a) * 20); g.stroke(); } }

function drawWorld(g, labels) {
  const r = rng(23);
  grass(g, 0, 0, WW, WH, '#7ccc4e', r);
  // the town's tufa plateau with its cliffs, two ramps up to the gates
  // the tufa cliff on the west side faces us at an angle: a band pushed down-left from the edge
  { const W = [[420, 200], [436, 380], [470, 520], [520, 640], [640, 690]], S = W.map(([x, y]) => [x - 26, y + 22]).reverse(); g.beginPath(); W.concat(S).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); const cg = g.createLinearGradient(380, 0, 470, 0); cg.addColorStop(0, '#9a5a30'); cg.addColorStop(1, '#c9874a'); fo(g, cg, 2.6);
    g.strokeStyle = 'rgba(70,35,15,.45)'; g.lineWidth = 2; for (let i = 0; i < W.length - 1; i++) { const [x0, y0] = W[i], [x1, y1] = W[i + 1]; for (let k = 0.2; k < 1; k += 0.3) { const x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k; g.beginPath(); g.moveTo(x - 4, y + 4); g.lineTo(x - 18, y + 16); g.stroke(); } } }
  plateau(g, TOWN_P, TOWN_P.slice(3).sort((a, b) => a[0] - b[0]), 44, '#c4d878', r);
  for (const [x, y] of [[90, 120], [180, 70], [260, 200], [60, 300], [300, 60]]) olive(g, x, y, 1);
  vineyard(g, 40, 1040, 150, 92); vineyard(g, 250, 1130, 130, 76);
  vineyard(g, 222, 522, 122, 88); { g.lineJoin = 'round'; rr(g, 216, 516, 134, 100, 12); g.lineWidth = 9; g.strokeStyle = OL; g.stroke(); g.lineWidth = 6; g.strokeStyle = '#c8bca4'; g.stroke(); g.strokeStyle = 'rgba(80,60,40,.5)'; g.lineWidth = 1.4; for (let x = 226; x < 346; x += 12) { g.beginPath(); g.moveTo(x, 513); g.lineTo(x, 519); g.moveTo(x + 6, 613); g.lineTo(x + 6, 619); g.stroke(); } }
  roads(g, [[MAIN, 36], [NORTH_RD, 30], [TOWN_RD, 34, true], [WEST_ST, 30, true]], r);
  stream(g, CREMERA, 30, r); stream(g, TIBER, 70, r);
  for (const [x, y, s] of [[382, 392, 0.95], [396, 404, 1.05], [370, 408, 0.85], [390, 382, 0.8]]) stone(g, x, y, s);
  const at = (x, y, ang, fn) => { g.save(); g.translate(x, y); g.rotate(ang); fn(); g.restore(); };
  at(690, 1208, Math.atan2(-86, 140) - Math.PI / 2, () => stoneBridge(g, 0, -40, 40, 34));
  stairs(g, 650, 650, 34, 64); at(434, 388, -Math.PI / 2, () => stairs(g, 0, -30, 30, 60));
  for (const [x, y, rd] of TUMULI) tumulus(g, x, y, rd);
  NECRO.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y, rd]) => tumulus(g, x, y, rd));
  quarry(g, 120, 560);
  for (const [x, y] of RUBBLE) { rubble(g, x, y, 0); g.beginPath(); g.arc(x, y - 44, 15, 0, 7); fo(g, '#f09a24', 2.6); g.font = '16px sans-serif'; g.textAlign = 'center'; g.fillText('⛏', x, y - 38); }
  // the town
  for (const [x, y] of [[520, 100], [800, 120], [560, 200], [820, 260], [520, 470], [800, 420], [760, 560], [580, 560], [860, 520]]) etrHouse(g, x, y);
  g.beginPath(); g.ellipse(680, 290, 120, 64, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke();
  capRing(g, 680, 296, 90, 0); etruscanTemple(g, 680, 290);
  for (const [x, y, k] of [[860, 60, 1], [460, 40, 0.9], [880, 640, 0.9]]) tree(g, x, y, k);
  // the posts: the quarry on the north road, the mill by the bridge
  capRing(g, 120, 570, 64, 0); capRing(g, 800, 1200, 60, 0); mill(g, 812, 1196);
  for (const [x, y, s] of [[30, 760, 1], [320, 760, 0.9], [560, 1050, 0.9], [860, 900, 1], [870, 1100, 0.9], [40, 1380, 0.9]]) olive(g, x, y, s);
  grove(g, 560, 1090, 50, 30, 5, 3); grove(g, 860, 820, 40, 70, 6, 6);
  // our camp, on the road from Rome
  g.save(); g.beginPath(); g.ellipse(200, 1300, 150, 66, 0, 0, 7); g.fillStyle = 'rgba(190,140,80,.45)'; g.fill(); g.restore();
  for (let a = 200; a <= 340; a += 8) { const rd = a * Math.PI / 180, x = 200 + Math.cos(rd) * 150, y = 1300 + Math.sin(rd) * 66; if (Math.abs(a - 270) < 13) continue; g.beginPath(); g.moveTo(x - 4, y + 6); g.lineTo(x - 3, y - 14); g.lineTo(x, y - 20); g.lineTo(x + 3, y - 14); g.lineTo(x + 4, y + 6); g.closePath(); fo(g, '#b0783e', 2); }
  tent(g, 120, 1338); tent(g, 280, 1338); tent(g, 200, 1362);
  // the enemy: 8 squads, 1/5
  squad(g, 96, 660, 'e_inf', 2, 4, 0.95, '#3f7ae0', 'vex'); squad(g, 650, 860, 'e_inf', 2, 4, 0.95, '#3f7ae0', 'vex');
  squad(g, 860, 1130, 'e_arc', 2, 3, 0.9, '#3f7ae0', 'pennant', -1); squad(g, 480, 352, 'e_arc', 2, 3, 0.9, '#3f7ae0', 'pennant', -1);
  squad(g, 330, 930, 'e_arc', 2, 2, 0.85, '#3f7ae0', 'pennant', -1); squad(g, 470, 900, 'e_cav', 2, 3, 0.9, '#3f7ae0', 'swallow', -1);
  squad(g, 600, 380, 'e_inf', 2, 5, 1, '#3f7ae0', 'vex'); squad(g, 760, 380, 'e_arc', 2, 3, 1, '#3f7ae0', 'pennant', -1);
  // ours
  if (labels) { squad(g, 150, 1270, 'hastati', 1, 5, 1, '#e2382c', 'vex'); squad(g, 250, 1270, 'velites', 1, 4, 1, '#2fa04e', 'pennant'); squad(g, 330, 1300, 'eques', 1, 3, 1, '#8e4cc4', 'swallow'); squad(g, 80, 1300, 'eng', 1, 3, 1, '#f09a24', 'square'); }
  else { squad(g, 630, 1236, 'eng', 1, 3, 1, '#f09a24', 'square'); squad(g, 150, 990, 'hastati', 1, 5, 1, '#e2382c', 'vex'); squad(g, 260, 1010, 'velites', 1, 4, 1, '#2fa04e', 'pennant'); squad(g, 380, 1240, 'eques', 1, 3, 1, '#8e4cc4', 'swallow'); }
  if (labels) {
    sign(g, 70, 1260, '← из Рима', '#ff8a6a'); sign(g, 720, 24, '↑ к Тибуру', '#9ec1ff'); sign(g, 470, 1470, 'Тибр', '#9ec1ff'); sign(g, 330, 260, 'ручей Кремера', '#9ec1ff');
    num(g, 200, 1220, 1); num(g, 640, 1150, 2); num(g, 330, 540, 2); num(g, 60, 520, 3); num(g, 860, 1180, 4); num(g, 395, 960, 5); num(g, 340, 420, 6); num(g, 790, 220, 7);
  }
}
const VIEW = { x: 300, y: 540 };
function phone(world) {
  const c = document.getElementById('scr'), g = c.getContext('2d'); g.scale(2, 2);
  g.drawImage(world, VIEW.x * 2, VIEW.y * 2, 1080, 1920, 0, 0, 540, 960);
  g.fillStyle = 'rgba(40,24,14,.94)'; rr(g, 8, 8, 524, 64, 18); g.fill(); g.lineWidth = 3; g.strokeStyle = '#f2c14a'; g.stroke();
  g.fillStyle = '#ffe6a8'; g.font = '900 24px "Lilita One", sans-serif'; g.textAlign = 'left'; g.fillText('ВЕЙИ', 26, 44); g.font = '700 13px "Alegreya Sans", sans-serif'; g.fillStyle = '#f2c14a'; g.fillText('Первая кровь · сила врага 1/5', 28, 62);
  for (const [x, txt, col] of [[300, '⚑ 0/3', '#ffcc33'], [384, '⚔ 8', '#9ec1ff'], [454, '+ 10', '#9fe08a']]) { rr(g, x, 22, 70, 36, 18); g.fillStyle = '#5a3a20'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke(); g.fillStyle = col; g.font = '900 18px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText(txt, x + 35, 47); }
  sign(g, 270, 100, '⏳ Марк · гастаты · куда идти?', '#f2c14a');
  const S = (x, y) => [x - VIEW.x, y - VIEW.y];
  g.save(); g.setLineDash([3, 12]); g.lineCap = 'round'; g.lineWidth = 7; g.strokeStyle = 'rgba(255,255,255,.95)'; g.beginPath(); [[560, 1250], [668, 1214], [740, 1150], [780, 1080]].map(p => S(...p)).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
  g.strokeStyle = 'rgba(200,200,200,.75)'; g.lineWidth = 6; g.beginPath(); [[560, 1250], [520, 1060], [470, 860], [440, 640]].map(p => S(...p)).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.restore();
  { const [x, y] = S(780, 1080); g.beginPath(); g.ellipse(x, y, 22, 11, 0, 0, 7); g.strokeStyle = OL; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#ffcc33'; g.lineWidth = 3.5; g.stroke(); }
  { const [x, y] = S(700, 1300); sign(g, x, y, '⛏ Инженеры разберут за 6 с', '#f09a24'); }
  { const [x, y] = S(470, 760); sign(g, x, y, 'в обход через брод: +40 с', '#9a9a9a'); }
  const mw = 96, mh = mw * WH / WW, mx = 540 - mw - 14, my = 124; rr(g, mx - 4, my - 4, mw + 8, mh + 8, 10); g.fillStyle = '#3a2414'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
  g.drawImage(world, 0, 0, WW * 2, WH * 2, mx, my, mw, mh); g.strokeStyle = '#ffcc33'; g.lineWidth = 2.5; g.strokeRect(mx + VIEW.x * mw / WW, my + VIEW.y * mh / WH, 540 * mw / WW, 960 * mh / WH);
}
const go = () => {
  const mk = labels => { const w = document.createElement('canvas'); w.width = WW * 2; w.height = WH * 2; const wg = w.getContext('2d'); wg.scale(2, 2); drawWorld(wg, labels); return w; };
  phone(mk(false)); const m = document.getElementById('map'); m.getContext('2d').drawImage(mk(true), 0, 0, m.width, m.height);
};
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load('900 20px "Lilita One"'), document.fonts.load('700 13px "Alegreya Sans"')]).catch(() => 0) : Promise.resolve()).then(go);
`;
const html = `<title>Вейи — первая кровь</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800;900&display=swap">
<style>
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --gold: #f2c14a; --display: 'Lilita One', 'Alegreya Sans', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.45; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 28px 16px 56px; display: grid; grid-template-columns: minmax(0, 520px) minmax(0, 1fr); gap: 28px; align-items: start; }
  @media (max-width: 900px) { .wrap { grid-template-columns: minmax(0, 1fr); } }
  h1 { font-family: var(--display); font-weight: 400; font-size: 42px; line-height: 1.05; margin: 0 0 10px; color: #ffe6a8; }
  h2 { font-family: var(--display); font-weight: 400; font-size: 24px; margin: 18px 0 8px; color: #ffe6a8; }
  p { margin: 0 0 10px; color: var(--muted); } b { color: var(--ink); }
  .card { width: 100%; border-radius: 22px; overflow: hidden; border: 4px solid #1a0e06; box-shadow: 0 18px 44px rgba(0,0,0,.55); line-height: 0; }
  .phone { max-width: 400px; border-radius: 28px; margin-top: 8px; }
  canvas { display: block; width: 100%; height: auto; }
  ol { margin: 0; padding-left: 22px; color: var(--muted); display: grid; gap: 6px; } li::marker { color: var(--gold); font-weight: 900; }
</style>
<div class="wrap">
  <div class="card"><canvas id="map" width="1800" height="3000" aria-label="Вся карта боя за Вейи с номерами"></canvas></div>
  <section>
    <h1>Вейи — первая кровь</h1>
    <p>Первый бой кампании, сила врага <b>1 из 5</b>: 8 отрядов против наших 4 генералов. Как на карте кампании: <b>с запада</b> мы приходим по дороге из Рима, <b>с юга</b> течёт Тибр, <b>на север</b> дорога уходит к Тибуру. Этрусский город стоит на <b>туфовом плато</b> за ручьём Кремера. Как в описании провинции: две дороги завалены камнями — обходите их или расчистите инженерами.</p>
    <ol>
      <li><b>Наш лагерь</b> у Тибра, палатки пополняют отряды.</li>
      <li><b>Два завала в узких местах</b> (значок ⛏: коснитесь — пойдут инженеры). <b>На мосту</b> через Кремеру обход только через дальний брод: +40 с, зато безопасно. <b>В теснине у некрополя</b>, между курганами и оградой виноградника, обход короткий, но вдоль берега под стрелами с западных ворот. Сами завалы никто не охраняет: это первый бой, инженеры разбирают их спокойно.</li>
      <li><b>Каменоломня туфа</b> на северной дороге: точка захвата, +3 в резерв.</li>
      <li><b>Мельница у моста</b> через Кремеру: точка захвата, +3 в резерв. Мост держат лучники.</li>
      <li><b>Курганы-гробницы</b> этрусков посреди полей: с них лучники бьют дальше, вокруг виноградники и оливы.</li>
      <li><b>Брод через Кремеру</b> к западным воротам: короткий путь в город, но вода замедляет, на том берегу лучники.</li>
      <li><b>Храм Портоначчо</b> — финал: широкая терракотовая крыша со статуями на коньке, как значок Вейи на карте кампании. Встать у храма 6 с без врагов рядом.</li>
    </ol>
    <h2>Как выглядит на телефоне</h2>
    <div class="card phone"><canvas id="scr" width="1080" height="1920" aria-label="Экран телефона: инженеры разбирают завал"></canvas></div>
  </section>
</div>
<script>
'use strict';
${helpers}
${ban}
${art}
${tsheet}
${tibHelpers}
${draw}
</script>
`;
fs.writeFileSync(path.join(__dirname, 'veii.html'), html);
console.log('ok', html.length);
