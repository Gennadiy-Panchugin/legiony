// A bigger world (900 × 1500) with more room to manoeuvre: the phone shows a part of it, an overview shows all of it.
const fs = require('fs');
let s = fs.readFileSync('gen.js', 'utf8');
function rep(a, b) { if (!s.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } s = s.replace(a, () => b); }
function between(a, b, body) { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) { console.error('MISS range', a.slice(0, 40)); process.exit(1); } s = s.slice(0, i) + body + s.slice(j); }

rep("const OL = '#2b1a10';", "const OL = '#2b1a10', WW = 900, WH = 1500;");
rep("for (let i = 0; i < 70; i++) { g.fillStyle = r() < .5", "const nb = Math.round(w * h / 7400), nt = Math.round(w * h / 4300);\n  for (let i = 0; i < nb; i++) { g.fillStyle = r() < .5");
rep("for (let i = 0; i < 120; i++) { const gx = x + r() * w,", "for (let i = 0; i < nt; i++) { const gx = x + r() * w,");
rep("g.clip(); grass(g, 0, 0, 540, 960, top, r); g.restore();", "g.clip(); grass(g, 0, 0, WW, WH, top, r); g.restore();");
// the river is drawn across the whole world width at a given height
rep("function river(g, r) {\n  const top = [[0, 548], [90, 538], [180, 552], [270, 540], [360, 552], [450, 538], [540, 548]], bot = [[540, 612], [450, 604], [360, 618], [270, 606], [180, 618], [90, 604], [0, 612]];",
    "function river(g, r, ry) {\n  ry = ry || 0; const top = [], bot = []; for (let x = 0; x <= WW; x += 90) top.push([x, 900 + ry + (x / 90 % 2 ? -10 : 4)]); for (let x = WW; x >= 0; x -= 90) bot.push([x, 990 + ry + (x / 90 % 2 ? -8 : 6)]);");
rep("for (let i = 0; i < 14; i++) { const x = 20 + i * 38 + r() * 10, y = 562 + r() * 34;", "for (let i = 0; i < 26; i++) { const x = 20 + i * 34 + r() * 10, y = 918 + ry + r() * 50;");
// the bridge site and its plate follow the river's new height
rep("const y0 = 532, y1 = 626, w = 34;", "const y0 = 886, y1 = 1000, w = 34;");
rep("for (const yy of [y0 + 14, y0 + 44, y0 + 74])", "for (const yy of [y0 + 14, y0 + 48, y0 + 82])");

between('function screen() {', 'function ui(g) {', String.raw`// a mound for archers: a small grassy hill with a cliff lip
function mound(g, x, y, rx, ry) {
  g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 8, y + ry * 0.7, rx, ry * 0.5, 0, 0, 7); g.fill();
  blob(g, x, y + 10, rx, ry, x, 12); fo(g, '#a46e40', 2.6);
  blob(g, x, y, rx * 0.94, ry * 0.8, x, 12); const mg = g.createLinearGradient(0, y - ry, 0, y + ry); mg.addColorStop(0, '#a6e06a'); mg.addColorStop(1, '#7cc84c'); fo(g, mg, 2.6);
  g.fillStyle = 'rgba(255,255,220,.4)'; g.beginPath(); g.ellipse(x - rx * 0.3, y - ry * 0.35, rx * 0.35, ry * 0.18, -0.3, 0, 7); g.fill();
}
function ruin(g, x, y) { for (const [dx, h] of [[-26, 34], [-8, 22], [10, 40], [28, 18]]) { rr(g, x + dx - 8, y - h, 16, h, 3); fo(g, '#cfc3ac', 2.4); } rr(g, x - 36, y - 6, 72, 10, 4); fo(g, '#b8ab92', 2.4); }
function drawWorld(g) {
  const r = rng(5);
  grass(g, 0, 0, WW, WH, '#76c64a', r);
  // the fort's plateau, the two ridges with their ramps
  plateau(g, [[0, 0], [900, 0], [900, 430], [700, 440], [520, 436], [505, 470], [395, 470], [380, 436], [200, 444], [0, 432]], [[0, 432], [200, 444], [380, 436]], 32, '#8fd457', r);
  plateau(g, [[520, 436], [700, 440], [900, 430], [900, 764], [780, 774], [640, 766], [620, 600]], [[640, 766], [780, 774], [900, 764]], 30, '#86ce52', r);
  plateau(g, [[0, 432], [200, 444], [380, 436], [300, 520], [296, 760], [160, 774], [0, 764]], [[0, 764], [160, 774], [296, 760]], 30, '#86ce52', r);
  ramp(g, 80, 762, 36, 50); ramp(g, 226, 766, 36, 46); ramp(g, 720, 768, 36, 48);
  g.save(); g.translate(296, 620); g.rotate(-Math.PI / 2); ramp(g, 0, 0, 34, 38); g.restore();
  g.save(); g.translate(624, 640); g.rotate(Math.PI / 2); ramp(g, 0, 0, 34, 38); g.restore();
  river(g, r, 0);
  // roads and trails
  path(g, [[450, 1500], [450, 1300], [440, 1150], [450, 1040], [450, 900], [450, 760], [450, 600], [450, 470], [450, 330]], 38);
  path(g, [[450, 820], [350, 760], [250, 700], [160, 660]], 28); path(g, [[450, 820], [560, 760], [660, 700], [740, 664]], 28);
  path(g, [[420, 1360], [300, 1250], [190, 1120], [150, 1004]], 26); path(g, [[150, 886], [120, 840], [80, 812]], 22); path(g, [[150, 886], [200, 850], [226, 812]], 22);
  path(g, [[480, 1360], [620, 1250], [740, 1160], [770, 1000]], 26); path(g, [[770, 890], [740, 840], [720, 816]], 22);
  for (const [x, y] of [[432, 924], [462, 944], [444, 966], [470, 914]]) stone(g, x, y, 1.15);
  for (const [x, y] of [[752, 920], [780, 940], [764, 962], [790, 912]]) stone(g, x, y, 1.0);
  bridgeSite(g, 150, 0.45);
  // archers' mounds in the valley and on the south bank
  mound(g, 360, 640, 46, 30); mound(g, 560, 650, 46, 30); mound(g, 300, 1110, 40, 26);
  ruin(g, 600, 1080);
  // forests
  const trees = [[30, 830, 1], [20, 1000, 1.1], [60, 1060, 1], [30, 1180, 1.1], [80, 1240, 0.9], [40, 1320, 1], [870, 830, 1], [880, 1020, 1], [860, 1110, 1.1], [880, 1260, 1], [840, 1340, 0.9],
    [580, 1180, 0.9], [560, 1240, 1], [330, 1200, 0.9], [270, 1280, 1], [600, 860, 0.9], [330, 860, 0.9], [360, 540, 0.95], [540, 540, 0.9], [310, 470, 0.9], [130, 520, 1], [70, 560, 0.9], [820, 540, 1], [860, 600, 0.9],
    [120, 280, 1], [60, 340, 0.9], [760, 260, 1], [830, 320, 1], [220, 200, 0.9], [690, 160, 1], [100, 120, 1], [820, 120, 1]];
  trees.sort((a, b) => a[1] - b[1]).forEach(([x, y, k]) => tree(g, x, y, k));
  for (const [x, y, k] of [[200, 560, 1], [700, 560, 1.1], [520, 1300, 0.8], [380, 1420, 0.9], [160, 380, 0.9], [740, 380, 0.8]]) rock(g, x, y, k);
  house(g, 690, 1150); house(g, 760, 1220); house(g, 640, 1240); house(g, 230, 1180);
  // capture points
  capRing(g, 160, 662, 56, 0); watchtower(g, 160, 660); flag(g, 196, 548, '#3f7ae0', 40);
  capRing(g, 740, 664, 62, 0.35); granary(g, 740, 662); flag(g, 778, 590, '#3f7ae0', 40);
  capRing(g, 450, 330, 94, 0); fort(g, 450, 330);
  barricade(g, 450, 464);
  // our camp
  g.save(); g.beginPath(); g.ellipse(450, 1400, 160, 72, 0, 0, 7); g.fillStyle = 'rgba(190,140,80,.45)'; g.fill(); g.restore();
  for (let a = 200; a <= 340; a += 8) { const rd = a * Math.PI / 180, x = 450 + Math.cos(rd) * 160, y = 1400 + Math.sin(rd) * 72; if (Math.abs(a - 270) < 13) continue; g.beginPath(); g.moveTo(x - 4, y + 6); g.lineTo(x - 3, y - 14); g.lineTo(x, y - 20); g.lineTo(x + 3, y - 14); g.lineTo(x + 4, y + 6); g.closePath(); fo(g, '#b0783e', 2); }
  tent(g, 360, 1440); tent(g, 540, 1440); tent(g, 450, 1466);
  // the enemy on posts
  squad(g, 450, 836, 'e_inf', 2, 4, 1, '#3f7ae0', 'vex'); squad(g, 360, 630, 'e_arc', 2, 3, 1, '#3f7ae0', 'pennant', -1); squad(g, 560, 640, 'e_arc', 2, 3, 1, '#3f7ae0', 'pennant');
  squad(g, 220, 700, 'e_inf', 2, 4, 1, '#3f7ae0', 'vex'); squad(g, 680, 704, 'e_inf', 2, 4, 1, '#3f7ae0', 'vex'); squad(g, 450, 560, 'e_inf', 2, 5, 1, '#3f7ae0', 'vex');
  squad(g, 500, 400, 'e_cav', 2, 3, 1, '#3f7ae0', 'swallow'); squad(g, 760, 840, 'e_inf', 2, 3, 1, '#3f7ae0', 'vex'); squad(g, 600, 760, 'e_cav', 2, 3, 1, '#3f7ae0', 'swallow');
  // ours; Тит's velites selected: reach area, trail and target
  g.save(); g.beginPath(); g.ellipse(470, 1240, 270, 150, 0, 0, 7); g.fillStyle = 'rgba(255,250,200,.16)'; g.fill(); g.setLineDash([12, 8]); g.strokeStyle = 'rgba(255,255,230,.95)'; g.lineWidth = 3.5; g.stroke(); g.restore();
  g.save(); g.setLineDash([2, 12]); g.lineCap = 'round'; g.strokeStyle = '#ffffff'; g.lineWidth = 7; wave(g, [[500, 1330], [460, 1250], [380, 1160], [312, 1112]]); g.stroke(); g.restore();
  g.beginPath(); g.ellipse(312, 1112, 24, 12, 0, 0, 7); g.strokeStyle = OL; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#ffcc33'; g.lineWidth = 3.5; g.stroke();
  squad(g, 390, 1340, 'hastati', 1, 5, 1, '#e2382c', 'vex');
  g.beginPath(); g.ellipse(500, 1340, 46, 20, 0, 0, 7); g.strokeStyle = OL; g.lineWidth = 7; g.stroke(); g.strokeStyle = '#ffcc33'; g.lineWidth = 4; g.stroke();
  squad(g, 500, 1340, 'velites', 1, 4, 1, '#2fa04e', 'pennant'); squad(g, 600, 1330, 'eques', 1, 3, 1, '#8e4cc4', 'swallow');
  squad(g, 150, 1030, 'eng', 1, 3, 1, '#f09a24', 'square');
}
const VIEW = { x: 180, y: 540 };                                   // what the phone shows: a 540 × 960 window of the world
function screen(world) {
  const c = document.getElementById('scr'), g = c.getContext('2d'); g.scale(2, 2);
  g.drawImage(world, VIEW.x * 2, VIEW.y * 2, 1080, 1920, 0, 0, 540, 960);
  // the edge of the map is off screen: a small mini-map in the corner shows where we are
  const mw = 96, mh = mw * WH / WW, mx = 540 - mw - 14, my = 124;
  rr(g, mx - 4, my - 4, mw + 8, mh + 8, 10); g.fillStyle = '#3a2414'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
  g.drawImage(world, 0, 0, WW * 2, WH * 2, mx, my, mw, mh);
  g.strokeStyle = '#ffcc33'; g.lineWidth = 2.5; g.strokeRect(mx + VIEW.x * mw / WW, my + VIEW.y * mh / WH, 540 * mw / WW, 960 * mh / WH);
  ui(g);
}
function overview(world) {
  const c = document.getElementById('map'), g = c.getContext('2d'); g.drawImage(world, 0, 0, c.width, c.height);
  const k = c.width / WW; g.save(); g.setLineDash([16, 10]); g.strokeStyle = '#ffcc33'; g.lineWidth = 8; g.strokeRect(VIEW.x * k, VIEW.y * k, 540 * k, 960 * k); g.restore();
  g.fillStyle = 'rgba(40,24,14,.9)'; rr(g, VIEW.x * k + 12, VIEW.y * k + 12, 300, 54, 14); g.fill(); g.fillStyle = '#ffcc33'; g.font = '900 30px "Lilita One", sans-serif'; g.textAlign = 'left'; g.fillText('экран телефона', VIEW.x * k + 28, VIEW.y * k + 50);
}
`);
rep("const go = () => { screen(); sheet(); };", "const go = () => { const w = document.createElement('canvas'); w.width = WW * 2; w.height = WH * 2; const wg = w.getContext('2d'); wg.scale(2, 2); drawWorld(wg); screen(w); overview(w); sheet(); };");
// the page: add the overview, update the text
rep('    <div class="sheet"><canvas id="units"', '    <div class="sheet"><canvas id="map" width="1800" height="3000" aria-label="Вся карта"></canvas></div>\n    <div class="sheet"><canvas id="units"');
rep("Вид сверху под углом, всё на одном экране.</p>", "Вид сверху под углом. <b>Карта больше экрана</b> в 1,7 раза по ширине и в 1,6 по высоте: экран телефона показывает часть, карту двигают пальцем, мини-карта в углу показывает, где вы. Ниже вся карта, жёлтая рамка — то, что видно на телефоне.</p>");
rep("<li><b>Левый хребет:</b>", "<li><b>Пути для манёвра:</b> главная дорога через центральный брод; мост, который строят инженеры, под левым хребтом; второй брод на востоке мимо деревни; спуски с обоих хребтов. В долине два бугра для лучников, на южном берегу ещё один и руины для засады.</li>\n      <li><b>Левый хребет:</b>");
s = s.replace(".sheet { width: 100%;", ".sheet { width: 100%; max-width: 640px;");
fs.writeFileSync('gen.js', s);
console.log('ok');
