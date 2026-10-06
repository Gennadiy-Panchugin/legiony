// Builds tibur-war.html: the same battle engine as war.html on the approved Tibur map (toon2d/tibur.js).
// The map's shapes and drawing helpers are taken from the art sheet, so the picture and the walkable grid never drift apart.
const fs = require('fs'), path = require('path');
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('missing ' + a.slice(0, 50)); return src.slice(i, j); };
const tib = fs.readFileSync(path.join('..', 'toon2d', 'tibur.js'), 'utf8');
const terr = fs.readFileSync(path.join('..', 'toon2d', 'terrain.js'), 'utf8');
const shapes = between(tib, "// ---------------------------------------------------------------- the map's shapes", 'function stream(g, pts, w, r) {');
const tibHelpers = between(tib, 'function stream(g, pts, w, r) {', 'function drawWorld(g, labels) {');
const rockFns = between(terr, 'function boulder(g, x, y, s) {', 'function swamp(g, x, y, rx, ry, seed) {');

let war = fs.readFileSync(path.join(__dirname, 'war.js'), 'utf8');
const rep = (a, b) => { if (!war.includes(a)) throw new Error('missing ' + a.slice(0, 60)); war = war.replace(a, () => b); };
const swap = (a, b, txt) => { const i = war.indexOf(a), j = war.indexOf(b, i); if (i < 0 || j < 0) throw new Error('missing ' + a.slice(0, 50)); war = war.slice(0, i) + txt + war.slice(j); };

// ---- map objects: the portcullis is the engineers' work site; there is no bridge to build
swap("// ---------------------------------------------------------------- the map's shapes", '// ---------------------------------------------------------------- navigation grid', String.raw`// ---------------------------------------------------------------- Тибур: the objects on the map (shapes come from the art sheet)
const CAMP = { x: 450, y: 1400, rx: 160, ry: 72 }, TENTS = [[360, 1440], [540, 1440], [450, 1466]];
const OB = { x: 450, y: 1030, stand: [450, 1070], open: false, prog: 0, need: 8 };
const BR = { x: -999, y0: -999, y1: -999, stand: [-999, -999], open: true, prog: 0, need: 1 };
const HOUSES = [[140, 210], [230, 180], [300, 280], [130, 380], [600, 200], [560, 290], [660, 140], [350, 450], [610, 420], [110, 300], [270, 250]];
const APP_P = [[770, 0], [900, 0], [900, 1330], [830, 1320], [800, 1150], [790, 640], [770, 560]];
const UPPER = [[770, 360], [740, 410], [700, 448], [690, 466]];
const FOREST = [[250, 1110, 70, 40], [50, 1340, 50, 90], [620, 1100, 70, 34]];
`);
// ---- the walkable grid
swap('  const hi = mask(gg => { poly(gg, FORT_P); poly(gg, RIGHT_P); poly(gg, LEFT_P); });', 'const cellOf = (x, y) =>', String.raw`  const line = (gg, pts) => { gg.beginPath(); pts.forEach(([x, y], i) => i ? gg.lineTo(x, y) : gg.moveTo(x, y)); gg.stroke(); };
  const hi = mask(gg => poly(gg, TOWN_P));
  const water = mask(gg => { gg.lineWidth = 34; line(gg, ANIO); gg.lineWidth = 26; line(gg, TRER); line(gg, UPPER); });
  const ford = mask(gg => { gg.beginPath(); gg.ellipse(245, 596, 30, 28, 0, 0, 7); gg.fill(); });
  const bridge = mask(gg => gg.fillRect(426, 544, 48, 60));
  const ramp = mask(gg => { gg.fillRect(244, 476, 36, 94); gg.fillRect(428, 494, 44, 52); });
  const mound = mask(gg => { for (const [x, y, rx, ry] of [[122, 870, 44, 28], [300, 1180, 44, 26]]) { gg.beginPath(); gg.ellipse(x, y, rx, ry, 0, 0, 7); gg.fill(); } });
  const massM = mask(gg => poly(gg, MASS_P));
  const block = mask(gg => { poly(gg, MASS_P); poly(gg, APP_P); gg.fillRect(392, 984, 116, 50); for (const [x, y] of HOUSES) { gg.beginPath(); gg.ellipse(x, y - 12, 28, 18, 0, 0, 7); gg.fill(); } gg.beginPath(); gg.ellipse(450, 304, 52, 28, 0, 0, 7); gg.fill(); gg.beginPath(); gg.ellipse(122, 856, 24, 14, 0, 0, 7); gg.fill(); });
  const tunnel = mask(gg => gg.fillRect(430, 596, 40, 400));
  const tunIn = mask(gg => gg.fillRect(424, 660, 52, 376));
  const trail = mask(gg => { gg.lineWidth = 22; line(gg, TRAIL); });
  const barr = mask(gg => gg.fillRect(428, 984, 44, 54));
  const road = mask(gg => { gg.lineWidth = 34; for (const l of [TUNNEL, VALLEY, WEST_ST, TOWN_ROAD, NORTH]) line(gg, l); });
  const camp = mask(gg => { gg.beginPath(); gg.ellipse(CAMP.x, CAMP.y, CAMP.rx, CAMP.ry, 0, 0, 7); gg.fill(); });
  for (let c2 = 0; c2 < NN; c2++) {
    let t = hi[c2] ? T.HIGH : T.LOW;
    if (water[c2]) t = T.WATER; if (ford[c2] && water[c2]) t = T.FORD; if (bridge[c2]) t = T.LOW;
    if (ramp[c2] && !water[c2]) t = T.RAMP; if (mound[c2] && t === T.LOW) t = T.MOUND;
    if (block[c2]) t = T.BLOCK; if (tunnel[c2] || trail[c2] && t !== T.WATER) t = T.LOW; if (barr[c2]) t = T.BARR;
    TY[c2] = t; ROADM[c2] = road[c2]; CAMPM[c2] = camp[c2]; TRAILM[c2] = trail[c2] && massM[c2] && !tunnel[c2] ? 1 : 0; TUNM[c2] = tunIn[c2];
  }
})();
`);
rep('const TY = new Uint8Array(NN).fill(T.LOW), ROADM = new Uint8Array(NN), CAMPM = new Uint8Array(NN);', 'const TY = new Uint8Array(NN).fill(T.LOW), ROADM = new Uint8Array(NN), CAMPM = new Uint8Array(NN), TRAILM = new Uint8Array(NN), TUNM = new Uint8Array(NN);\nconst inTun = s => TUNM[cellOf(s.x, s.y)] === 1;');
rep('for (const e of live) { if (e.side === a.side || e.hiddenA || noCav(a, e)) continue;', 'for (const e of live) { if (e.side === a.side || e.hiddenA || noCav(a, e) || inTun(a) !== inTun(e)) continue;');
rep('for (const e of live) if (e.side === 2 && e.alive && Math.hypot(e.x - rn.x, e.y - rn.y) < rn.r)', 'for (const e of live) if (e.side === 2 && e.alive && !inTun(e) && Math.hypot(e.x - rn.x, e.y - rn.y) < rn.r)');
rep('const MULc = c => { const t = TY[c]; return ', 'const MULc = c => { const t = TY[c]; return TRAILM[c] ? 2.4 : ');

// ---- squads, posts and the capture points
rep('const STARTS = [[380, 1372], [470, 1366], [560, 1376], [300, 1400]];', 'const STARTS = [[400, 1372], [480, 1366], [320, 1390], [560, 1380]];');
swap('const ENEMIES = [', 'function addSq(', String.raw`const ENEMIES = [['e_arc', 2, 372, 990, 'gt'], ['e_arc', 2, 528, 990, 'gt'], ['e_inf', 3, 450, 780, 'tn'], ['e_inf', 5, 450, 650, 'ex'],
  ['e_arc', 3, 112, 940, 'tw'], ['e_inf', 4, 132, 800, 'tw'], ['ambush', 5, 250, 1110, 'am'], ['e_cav', 3, 190, 1060, 'vl', [[190, 1060], [186, 820]]], ['e_arc', 2, 660, 696, 'tr'],
  ['hoplite', 6, 450, 420, 'tc'], ['e_arc', 3, 300, 350, 'tc'], ['e_cav', 3, 600, 350, 'tc']];
const POINTS = [{ name: 'Крепость в скале', x: 450, y: 1072, r: 72, need: 4 }, { name: 'Сторожевая башня', x: 122, y: 880, r: 70, need: 4 }, { name: 'Храм Весты', x: 450, y: 330, r: 84, need: 6, final: true }];
`);
rep('BR.open = false; BR.prog = 0;', 'BR.open = true; BR.prog = 0;');
// archers on the fortress walls stand on the rock: they never move, only shoot whoever comes in range
rep("addSq(2, cls, x, y, 'hold', zone, patrol, n);", "{ const q = addSq(2, cls, x, y, zone === 'gt' ? 'wall' : 'hold', zone, patrol, n); if (q.ai === 'wall') { q.range *= 1.4; q.k *= 0.5; } }");
rep('function pursue(s, dt) {\n', "function pursue(s, dt) {\n  if (s.ai === 'wall') { s.atk = null; s.path = []; return; }\n");
rep('  if (!s.atk && !s.path.length) {\n    if (s.pauseT > 0)', "  if (s.ai === 'wall') { s.atk = null; s.path = []; return; }\n  if (!s.atk && !s.path.length) {\n    if (s.pauseT > 0)");
rep("say(site === OB ? 'Баррикаду разбирают только инженеры' : 'Мост строят только инженеры')", "say('Решётку поднимают только инженеры')");
rep("say(site === OB ? 'Баррикада разобрана, перевал открыт' : 'Мост построен! Можно перейти реку у левого хребта')", "say('Решётка поднята — туннель открыт')");
rep("why = 'Форт взят, над переправой орёл легиона.'", "why = 'Храм Весты взят, над Тибуром орёл легиона.'");
rep("TY[cellOf(tx, ty)] === T.WATER ? 'Реку переходят по бродам или мосту' : 'Туда не пройти'", "TY[cellOf(tx, ty)] === T.WATER ? 'Реку переходят вброд или по мосту' : 'Туда не пройти: гора'");

// ---- the baked world: the art sheet's map without labels, squads, the gate's grille state or capture rings
swap('function bake() {', '// ---------------------------------------------------------------- drawing', String.raw`function bake() {
  BAKE = document.createElement('canvas'); BAKE.width = WW * BS; BAKE.height = WH * BS; const g = BAKE.getContext('2d'); g.scale(BS, BS); const r = rng(11);
  grass(g, 0, 0, WW, WH, '#76c64a', r);
  plateau(g, TOWN_P, TOWN_P.slice(2).sort((a, b) => a[0] - b[0]), 30, '#8fd457', r);
  roads(g, [[TUNNEL, 36], [VALLEY, 30], [WEST_ST, 30, true], [TOWN_ROAD, 36, true], [NORTH, 36, true]], r);
  stream(g, TRER, 26, r); stream(g, UPPER, 26, r); stream(g, ANIO, 34, r); waterfall(g, 690, 462, 530, 34);
  for (const [x, y, s] of [[232, 586, 0.95], [246, 594, 1.05], [258, 588, 0.9], [240, 604, 0.85], [252, 606, 0.8]]) stone(g, x, y, s);
  stoneBridge(g, 450, 550, 598, 36); stairs(g, 262, 488, 32, 70);
  massif(g, r); apennines(g);
  g.save(); g.setLineDash([3, 11]); g.lineCap = 'round'; g.strokeStyle = '#fff3c0'; g.lineWidth = 6; wave(g, TRAIL); g.stroke(); g.restore();
  cutaway(g, 450, 640, 1034, 44); exitStone(g, 450, 624);
  for (const [x, y] of HOUSES) house(g, x, y);
  rock(g, 640, 486, 1.2); tree(g, 620, 470, 0.9);
  for (const [x, y, k] of [[40, 200, 1], [360, 140, 0.9], [540, 120, 0.9], [60, 470, 0.9]]) tree(g, x, y, k);
  g.beginPath(); g.ellipse(450, 320, 130, 70, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL;
  for (const [a0, a1] of [[-Math.PI / 2 + 0.17, Math.PI / 2 - 0.17], [Math.PI / 2 + 0.17, Math.PI - 0.3], [Math.PI + 0.3, Math.PI * 1.5 - 0.17]]) { g.beginPath(); g.ellipse(450, 320, 130, 70, 0, a0, a1); g.stroke(); }
  for (let a = 0; a < 6.28; a += 0.5) { g.beginPath(); g.ellipse(450 + Math.cos(a) * 100, 320 + Math.sin(a) * 52, 14, 7, 0, 0, 7); g.strokeStyle = 'rgba(150,120,80,.5)'; g.lineWidth = 1.4; g.stroke(); }
  roundTemple(g, 450, 320);
  mound(g, 122, 870, 44, 28); watchtower(g, 122, 868);
  FOREST.forEach(([x, y, rx, ry], i) => grove(g, x, y, rx, ry, [6, 7, 5][i], [5, 8, 4][i]));
  for (const [x, y, k] of [[340, 1260, 0.9], [570, 1260, 1], [30, 1460, 0.9], [870, 1440, 1]]) rock(g, x, y, k);
  mound(g, 300, 1180, 44, 26);
  g.save(); g.beginPath(); g.ellipse(CAMP.x, CAMP.y, CAMP.rx, CAMP.ry, 0, 0, 7); g.fillStyle = 'rgba(190,140,80,.45)'; g.fill(); g.restore();
  for (let a = 200; a <= 340; a += 8) { const rd = a * Math.PI / 180, x = CAMP.x + Math.cos(rd) * CAMP.rx, y = CAMP.y + Math.sin(rd) * CAMP.ry; if (Math.abs(a - 270) < 13) continue; g.beginPath(); g.moveTo(x - 4, y + 6); g.lineTo(x - 3, y - 14); g.lineTo(x, y - 20); g.lineTo(x + 3, y - 14); g.lineTo(x + 4, y + 6); g.closePath(); fo(g, '#b0783e', 2); }
  for (const [x, y] of TENTS) tent(g, x, y);
}

`);
// the gate is drawn live over the tunnel: it fades while anyone is passing under it, so the gallery shows through;
// once the grille is raised the arch stands open
swap('function drawBridge() {', 'function draw(t) {', String.raw`function drawBridge() {}
let gateA = 1;
function drawBarricade() {
  const inside = G.sq.some(s => s.alive && Math.abs(s.x - OB.x) < 64 && s.y > OB.y - 130 && s.y < OB.y + 8);
  gateA += ((inside ? 0.28 : 1) - gateA) * 0.18;
  ctx.save(); ctx.globalAlpha = gateA; portcullis(ctx, OB.x, OB.y, 0.62);
  if (OB.open) { ctx.translate(OB.x, OB.y); ctx.scale(0.62, 0.62); ctx.beginPath(); ctx.moveTo(-36, 2); ctx.lineTo(-36, -40); ctx.arc(0, -40, 36, Math.PI, 0); ctx.lineTo(36, 2); ctx.closePath(); fo(ctx, '#1a0e06', 3);
    ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 3.2; for (let dx = -28; dx <= 28; dx += 11) { ctx.beginPath(); ctx.moveTo(dx, -70); ctx.lineTo(dx, -62); ctx.stroke(); } }
  ctx.restore();
  if (!OB.open && OB.prog > 0) { rr(ctx, OB.x - 40, OB.y - 92, 80, 9, 4.5); ctx.fillStyle = OL; ctx.fill(); rr(ctx, OB.x - 38, OB.y - 90, 76 * OB.prog / OB.need, 5, 2.5); ctx.fillStyle = '#ffcc33'; ctx.fill(); }
}
`);
// the hired builders raise the portcullis at once (the only obstacle on this map)
rep('function useBst(id) {', String.raw`function bstPont() { if (OB.open) { say('Решётка уже поднята'); return false; } OB.open = true; OB.prog = OB.need; SND.play('crash', OB.x); G.fx.push({ x: OB.x, y: OB.y, t: 0.9, big: true }); say('Вольные строители подняли решётку'); if (G.sel) paintOverlay(G.sel); return true; }
function useBst(id) {`);
rep('const cam = { x: 450, y: 1180, z: 1 };', 'const cam = { x: 450, y: 1300, z: 1 };');

// ---- assemble with the same page as war.html, with Tibur's title and briefing
let gen = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
const grep = (a, b) => { if (!gen.includes(a)) throw new Error('gen missing ' + a.slice(0, 60)); gen = gen.replace(a, () => b); };
grep("const war = fs.readFileSync(path.join(__dirname, 'war.js'), 'utf8');", 'const war = WAR;');
grep('<title>Переправа</title>', '<title>Тибур</title>');
grep('<b>ПЕРЕПРАВА</b><span>Форт ·', '<b>ТИБУР</b><span>Храм Весты ·');
grep('aria-label="Поле боя: переправа"', 'aria-label="Поле боя: Тибур"');
grep('<h3>Переправа</h3>', '<h3>Тибур · горный перевал</h3>');
grep(between(gen, '<p><b>Цель:</b>', '<p>Карту двигайте'), `<p><b>Цель:</b> взять храм Весты на площади Тибура — встаньте у него на 6 секунд без врагов рядом. Крепость в скале и сторожевая башня дают +3 в резерв.</p>
    <p><b>Коснитесь генерала слева или отряда</b>: время замедлится, тёмным станет то, куда не пройти, жёлтая линия — куда дойдёте за 5 секунд. Коснитесь места — отряд пойдёт, на врага — атакует.</p>
    <p><b>Короткий путь</b> — туннелем сквозь гору: решётку поднимают только <b>инженеры</b> (коснитесь ворот), со стен бьют лучники. <b>Длинный</b> — по западной долине, вброд через Анио и по лестнице в город. <b>Козья тропа</b> справа медленная, но выводит к выходу из туннеля, в тыл защитникам.</p>
    `);
grep("${war}\n</script>", '${war}\n</script>'.replace('${war}', '${tibExtra}\n${war}'));
grep("fs.writeFileSync(path.join(__dirname, 'war.html'), html);", "fs.writeFileSync(path.join(__dirname, 'tibur-war.html'), html);");
new Function('require', '__dirname', 'WAR', 'tibExtra', gen)(require, __dirname, war, rockFns + '\n' + shapes + '\n' + tibHelpers);
