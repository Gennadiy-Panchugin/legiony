// Builds citywar.html: the battle engine (war.js) driven by map data (citymaps-spec.js) for Вейи, Остия, Анций, Пренесте and Капуя.
// The city is chosen by the iframe name «legwar:<city>» (from the main game) or by the page hash (#capua) when opened alone.
const fs = require('fs'), path = require('path');
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('missing ' + a.slice(0, 50)); return src.slice(i, j); };
const T2 = f => fs.readFileSync(path.join('..', 'toon2d', f), 'utf8');
// the art: Veii's sheet (its shapes, Etruscan pieces and drawWorld) and the Capua sheet's script (all city helpers + the four maps + the Capua variants)
const veii = T2('veii.js'), veiiDraw = between(veii, "// ---------------------------------------------------------------- the map's shapes", 'const VIEW = ')
  .replace("  g.save(); g.beginPath(); g.ellipse(200, 1300, 150, 66, 0, 0, 7); g.fillStyle = 'rgba(190,140,80,.45)'; g.fill(); g.restore();\n", () => "  if (!window.NOTENT) { g.save(); g.beginPath(); g.ellipse(200, 1300, 150, 66, 0, 0, 7); g.fillStyle = 'rgba(190,140,80,.45)'; g.fill(); g.restore(); }\n")
  .replace('  for (let a = 200; a <= 340; a += 8) { const rd = a * Math.PI / 180, x = 200 + Math.cos(rd) * 150', () => '  if (!window.NOTENT) for (let a = 200; a <= 340; a += 8) { const rd = a * Math.PI / 180, x = 200 + Math.cos(rd) * 150');
const capPage = T2('capua.html'); let cityArt = capPage.slice(capPage.indexOf("<script>\n'use strict';") + "<script>\n'use strict';".length, capPage.lastIndexOf('</script>'));
cityArt = cityArt.slice(0, cityArt.indexOf('const MAPS3 = '));
{ const swapArt = (a, b) => { if (!cityArt.includes(a)) throw new Error('art missing ' + a.slice(0, 60)); cityArt = cityArt.split(a).join(b); };
  // the outer wall of Capua loses its north side (segments 1-3): the sides and the south wall stay
  swapArt("[820, 820], [700, 820], [620, 820], [530, 820], [370, 820], [280, 820], [200, 820], [80, 820]], '#d8ccb4', [2, 6, 10]);", "[820, 820], [700, 820], [620, 820], [530, 820], [370, 820], [280, 820], [200, 820], [80, 820]], '#d8ccb4', [1, 2, 3, 6, 10]);");
  swapArt('portcullis(g, 450, 276, 0.6); ', '');
  // the ram is a log carried on the shoulders, not a cart: the wheeled one is not drawn (the log itself is drawn live)
  swapArt('ram(g, 700, 1330);', '');
 }
// art helpers already come with the battle page (gen.js), so drop the duplicate gen helpers at the top of the sheet script up to its first own section
cityArt = cityArt.slice(cityArt.indexOf('// ---------------------------------------------------------------- rubble: boulders'));
// while baking the picture, labels, squads, capture rings and the dynamic objects are not drawn
cityArt = cityArt.replace('const foe = (g, list) => list.forEach(', 'const foe = (g, list) => window.NOART || list.forEach(')
  .replace("g.save(); g.globalAlpha = 0.55; for (const gx of [240, 660]) { tent(g, gx - 34, 780); tent(g, gx + 34, 780); } g.restore();", '');
const guards = "for (const nm of ['sign', 'num', 'squad', 'capRing', 'rubble', 'bridgeSite', 'raft', 'ours', 'camp', 'tent']) { const f = window[nm]; if (f) window[nm] = function () { if (window.NOART && ((nm !== 'camp' && nm !== 'tent') || window.NOTENT)) return; return f.apply(this, arguments); }; }\n";
// the gladiator arena (arena-spec.js, arena-runtime.js) is appended after the city data and the city runtime
const rd = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
// the rebellion (rebel-spec.js, rebel-runtime.js) reuses the arena's waves; the arena's crowd and its AI that chases our squads are skipped on its map
const arenaRt = (() => { let a = rd('arena-runtime.js').split(String.fromCharCode(13)).join(''); const r2 = (x, y) => { if (!a.includes(x)) throw new Error('arena patch missing: ' + x.slice(0, 50)); a = a.replace(x, () => y); };
  r2("if (n) { e.home = [n.x, n.y]; e.atk = n; }", "if (MAP.waves.town) { if (n && bd < (rebelObjLeft() ? 120 : 270) && !(e.ignoreT > G.t)) { e.home = [n.x, n.y]; e.atk = n; } else { e.atk = null; const gl = rebelGoal(e); if (e.home !== gl) { e.home = gl; e.path = []; } } } else if (n) { e.home = [n.x, n.y]; e.atk = n; }");
  r2("if (!A.zoomed) { A.zoomed = true; cam.z = 0.66; cam.x = AR.cx; cam.y = 960; clampCam(); }", "if (!A.zoomed) { A.zoomed = true; cam.z = MAP.waves.town ? 0.7 : 0.66; cam.x = MAP.waves.town ? MAP.cam.x : AR.cx; cam.y = MAP.waves.town ? MAP.cam.y : 960; clampCam(); }");
  r2("draw = function (t) { _drawSky(t); if (MAP.waves) arenaSky(t); };", "draw = function (t) { _drawSky(t); if (MAP.waves || MAP.sky) arenaSky(t); };");
  r2("    for (const [gx, gy] of [[AR.cx, AR.cy - AR.ry + 30]", "    if (MAP.waves) for (const [gx, gy] of [[AR.cx, AR.cy - AR.ry + 30]");
  r2("    for (const o of ARENA_OBST) if (o[0] === 'cage')", "    if (!MAP.waves) for (const q of alive(1)) lamp(q.x, q.y, 150, .38);\n    if (MAP.waves) for (const o of ARENA_OBST) if (o[0] === 'cage')");
  r2("    for (const [gx, gy] of [[AR.cx - 150, AR.cy - AR.ry + 6]", "    if (MAP.waves) for (const [gx, gy] of [[AR.cx - 150, AR.cy - AR.ry + 6]");
  r2("$('cRes').hidden = true;   // no reserve in the arena", "$('cRes').hidden = !MAP.waves.town;   // no reserve in the arena, but there is one in the rebellion");
  r2("drawCityExtras = function (t) {" + '\n' + "  if (MAP.waves) {", "drawCityExtras = function (t) {" + '\n' + "  if (MAP.waves && !MAP.waves.town) {");
  return a; })();
const sdSheet = fs.readFileSync(path.join(__dirname, '..', 'toon2d', 'sardinia.js'), 'utf8'), landingPieces = sdSheet.slice(sdSheet.indexOf('// ---------------------------------------------------------------- landing pieces'), sdSheet.indexOf('// ---------------------------------------------------------------- A: dawn'));
const tibSrc = T2('tibur.js'), terrSrc = T2('terrain.js');
const tibArt = between(terrSrc, 'function boulder(g, x, y, s) {', 'function swamp(g, x, y, rx, ry, seed) {') + '\n' + between(tibSrc, "// ---------------------------------------------------------------- the map's shapes", 'function stream(g, pts, w, r) {') + '\n' + between(tibSrc, 'function stream(g, pts, w, r) {', 'function drawWorld(g, labels) {');
const tiburSpec = rd('tibur-spec.js').replace('/*TIBART*/', () => tibArt);
const landing = rd('landing-spec.js').replace('/*PIECES*/', () => landingPieces) + '\n' + rd('patrol-spec.js').replace('/*PIECES*/', () => landingPieces);
const spec = rd('citymaps-spec.js') + '\n' + tiburSpec + '\n' + rd('arena-spec.js') + '\n' + rd('rebel-spec.js') + '\n' + landing, runtime = rd('city-runtime.js') + '\n' + arenaRt + '\n' + rd('rebel-runtime.js') + '\n' + rd('patrol-runtime.js') + '\n' + rd('boost-runtime.js');

let war = fs.readFileSync(path.join(__dirname, 'war.js'), 'utf8');
const rep = (a, b) => { if (!war.includes(a)) throw new Error('missing ' + a.slice(0, 70)); war = war.replace(a, () => b); };
const swap = (a, b, txt) => { const i = war.indexOf(a), j = war.indexOf(b, i); if (i < 0 || j < 0) throw new Error('missing ' + a.slice(0, 50)); war = war.slice(0, i) + txt + war.slice(j); };

// ---- the map's objects from the data
swap("// ---------------------------------------------------------------- the map's shapes", '// ---------------------------------------------------------------- navigation grid', String.raw`// ---------------------------------------------------------------- the chosen city (data in citymaps-spec.js)
const CITY = (window.name.split(':')[1] || location.hash.slice(1) || 'veii').toLowerCase();
const MAP = CITYMAPS[CITY] || CITYMAPS.veii;
const CAMP = MAP.camp, TENTS = MAP.tents.slice();
const SITES = MAP.sites.map(s => ({ ...s, open: false, prog: 0 }));
const OB = { x: -999, y: -999, stand: [-999, -999], open: true, prog: 0, need: 1 }, BR = { x: -999, y0: -999, y1: -999, stand: [-999, -999], open: true, prog: 0, need: 1 };
const FOREST = MAP.forest || [];
`);
rep('function die(s) {', 'function die(s) { if (s.carry && typeof ramDrop === \'function\') ramDrop(s);');
rep('const T = { WATER: 0, LOW: 1, HIGH: 2, RAMP: 3, FORD: 4, BRIDGE: 5, BLOCK: 6, BARR: 7, MOUND: 8 };', 'const T = { WATER: 0, LOW: 1, HIGH: 2, RAMP: 3, FORD: 4, BRIDGE: 5, BLOCK: 6, BARR: 7, MOUND: 8, SLOW: 9 };');
rep('const TY = new Uint8Array(NN).fill(T.LOW), ROADM = new Uint8Array(NN), CAMPM = new Uint8Array(NN);', 'const TY = new Uint8Array(NN).fill(T.LOW), ROADM = new Uint8Array(NN), CAMPM = new Uint8Array(NN), SITEM = new Uint8Array(NN), STEEP = new Uint8Array(NN);');
swap('  const hi = mask(gg => { poly(gg, FORT_P); poly(gg, RIGHT_P); poly(gg, LEFT_P); });', 'const cellOf = (x, y) =>', String.raw`  const shape = (gg, s) => { if (!s) return; if (s.poly) poly(gg, s.poly); else if (s.line) { gg.lineWidth = s.w; gg.beginPath(); s.line.forEach(([x, y], i) => i ? gg.lineTo(x, y) : gg.moveTo(x, y)); gg.stroke(); } else if (s.rect) gg.fillRect(s.rect[0], s.rect[1], s.rect[2], s.rect[3]); else if (s.ell) { gg.beginPath(); gg.ellipse(s.ell[0], s.ell[1], s.ell[2], s.ell[3], 0, 0, 7); gg.fill(); } };
  const M = k => mask(gg => (MAP.nav[k] || []).forEach(s => shape(gg, s)));
  const hi = M('high'), water = M('water'), ford = M('ford'), deck = M('deck'), ramp = M('ramp'), mound = M('mound'), block = M('block'), slow = M('slow'), road = M('road'), steepM = M('steep');
  const camp = mask(gg => { gg.beginPath(); gg.ellipse(CAMP.x, CAMP.y, CAMP.rx, CAMP.ry, 0, 0, 7); gg.fill(); });
  const sm = SITES.map(s => s.mask ? mask(gg => shape(gg, s.mask)) : null);
  for (let c2 = 0; c2 < NN; c2++) {
    let t = hi[c2] ? T.HIGH : T.LOW;
    if (water[c2]) t = ford[c2] ? T.FORD : T.WATER;
    if (deck[c2]) t = T.LOW;
    if (ramp[c2] && t !== T.WATER) t = T.RAMP;
    if (mound[c2] && t === T.LOW) t = T.MOUND;
    if (slow[c2] && t === T.LOW && !deck[c2]) t = T.SLOW;
    if (block[c2]) t = T.BLOCK;
    for (let i = 0; i < sm.length; i++) if (sm[i] && sm[i][c2]) { SITEM[c2] = i + 1; t = SITES[i].kind === 'bridge' || SITES[i].kind === 'raft' ? T.BRIDGE : T.BARR; }
    STEEP[c2] = steepM[c2] && t === T.MOUND ? 1 : 0; TY[c2] = t; ROADM[c2] = road[c2]; CAMPM[c2] = camp[c2];
  }
})();
`);
rep('if (t === T.BARR && !OB.open) return false; if (t === T.BRIDGE && !BR.open) return false;', 'if ((t === T.BARR || t === T.BRIDGE) && SITEM[c] && !SITES[SITEM[c] - 1].open && !(side % 10 === 2 && SITES[SITEM[c] - 1].foes)) return false;');
rep('const MULc = c => { const t = TY[c]; return ', 'const MULc = c => { const t = TY[c]; return t === T.SLOW ? 2 : ');
// ---- steep mounds: cavalry cannot climb them (the pathfinder gets side + 10 for horsemen), foot soldiers and archers can
rep('if (side === 2 && CAMPM[c]) return false;', 'if (side % 10 === 2 && CAMPM[c]) return false; if (side === 11 && STEEP[c]) return false; if (side === 21 && TY[c] === T.FORD) return false;');
war = war.replace(/findPath\(s\.x, s\.y, (.+?), (1|2|s\.side)\)/g, (m, a, b) => 'findPath(s.x, s.y, ' + a + ', ' + b + ' + (s.kind === CAV ? 10 : s.carry ? 20 : 0))');
rep('pass(n1, p.side)', 'pass(n1, p.side + (p.kind === CAV ? 10 : 0))'); rep('pass(n2, q.side)', 'pass(n2, q.side + (q.kind === CAV ? 10 : 0))');
// ---- squads, posts, points
rep('const STARTS = [[380, 1372], [470, 1366], [560, 1376], [300, 1400]];', 'const STARTS = MAP.starts;');
swap('const ENEMIES = [', 'function addSq(', 'const ENEMIES = MAP.enemies;\nconst POINTS = MAP.points;\n');
rep('rains: [], fires: [], bolts: [], reveal: null, tgt: null', 'rains: [], fires: [], bolts: [], reveal: null, ram: false, ramObj: MAP.ram ? { x: MAP.ram[0], y: MAP.ram[1], carrier: null } : null, reinfN: 0, reinfT: 0, act2: false, bonus: (MAP.bonus || []).map(b => ({ ...b, prog: 0, done: false })), tgt: null');
rep('REFILL = 3.5,', 'REFILL = 3.5 * (MAP.refillMul || 1),');
rep('  OB.open = false; OB.prog = 0; BR.open = false; BR.prog = 0;', '  for (const s of SITES) { s.open = !!(MAP.waves && MAP.waves.town); s.prog = s.open ? s.need : 0; }   // in a rebellion every obstacle is already cleared');
rep('  cam.z = 1; cam.x = 450; cam.y = 1300;', '  cam.z = 1; cam.x = MAP.cam.x; cam.y = MAP.cam.y;');
rep("addSq(2, cls, x, y, 'hold', zone, patrol, n);", "{ const q = addSq(2, cls, x, y, zone === 'wall' ? 'wall' : 'hold', zone, patrol, n); if (q.ai === 'wall') { q.range *= 1.4; q.k *= 0.5; } }");
rep('function pursue(s, dt) {\n', "function pursue(s, dt) {\n  if (s.ai === 'wall') { s.atk = null; s.path = []; return; }\n");
rep('  if (!s.atk && !s.path.length) {\n    if (s.pauseT > 0)', "  if (s.ai === 'wall') { s.atk = null; s.path = []; return; }\n  if (!s.atk && !s.path.length) {\n    if (s.pauseT > 0)");
rep("if (!p.final) { G.reserve += 3;", "if (!p.final) { G.reserve += 3; if (p.tents) TENTS.push(...p.tents);");
rep('  for (const q of live) if (q.side === 1) {\n    q.inTent', '  cityTick(dt, live);\n  for (const q of live) if (q.side === 1) {\n    q.inTent');
// one healing place per tent when the map says so (MAP.oneHeal): only the nearest standing squad gets the refill
rep('q.inTent = !q.moving && TENTS.some(([x, y]) => Math.hypot(q.x - x, q.y - (y - 14)) < 34);', 'q.inTent = !q.moving && TENTS.some(([x, y]) => { const d = Math.hypot(q.x - x, q.y - (y - 14)); if (d >= 34) return false; if (!MAP.oneHeal) return true; return !live.some(o => o !== q && o.side === 1 && !o.moving && (() => { const e = Math.hypot(o.x - x, o.y - (y - 14)); return e < 34 && (e < d || (e === d && o.id < q.id)); })()); });');
rep("why = 'Форт взят, над переправой орёл легиона.'", 'why = MAP.win');
rep("    if (a.sk > 0 && a.cls === 'velites') v *= 2.5;", "    if (a.sk > 0 && a.cls === 'velites') v *= 2.5;\n    if (a.sk > 0 && a.cls === 'gladiators') v *= 2;");
// ---- the work sites
rep('const siteAt = (x, y) => (!OB.open && Math.abs(x - OB.x) < 74 && Math.abs(y - OB.y) < 44) ? OB : (!BR.open && Math.abs(x - BR.x) < 46 && y > BR.y0 - 20 && y < BR.y1 + 16) ? BR : null;',
    'const siteAt = (x, y) => SITES.filter(s => !s.open && !s.nowork && Math.hypot(x - s.x, y - s.y) < (s.hit || 64)).sort((a, b) => Math.hypot(x - a.x, y - a.y) - Math.hypot(x - b.x, y - b.y))[0] || null;');
rep("    if (s.cls !== 'eng') { if (!quiet) say(site === OB ? 'Баррикаду разбирают только инженеры' : 'Мост строят только инженеры'); return false; }",
    "    if (s.carry && site.gate) { } else if (canCarry(s) && site.gate && (s.cls !== 'eng' || site.ram) && G.ramObj && !G.ramObj.carrier) { const rp = findPath(s.x, s.y, G.ramObj.x, G.ramObj.y, 1); if (!rp) { if (!quiet) say('К тарану не подойти'); return false; } s.path = rp; s.work = { site, fetch: true }; if (!quiet) { SND.play('order'); say(s.name + ' берёт таран и идёт к воротам'); } return true; } else if (s.cls !== 'eng') { if (!quiet) say(s.carry ? 'Бревном ломают только ворота и арки' : site.gate && G.ramObj && G.ramObj.carrier ? 'Таран уже несёт ' + G.ramObj.carrier.name : site.gate && canCarry(s) ? 'Таран конница не тащит: пошлите пехоту или лучников' : (site.who || 'Это работа для инженеров')); return false; }\n    if (site.ram && !G.ram && !s.carry) { if (!quiet) say('Арку выбивает только таран: отправьте к ней пехоту или лучников'); return false; }");
rep('    site.prog += dt * (s.sk > 0 ? 3 : 1);', '    site.prog += dt * (s.carry ? site.need / ramTime(s) : (s.sk > 0 ? 3 : 1) * (G.ram && site.gate ? 3 : 1));');
rep('G.fx.push({ x: site === OB ? OB.x + (Math.random() - .5) * 90 : BR.x + (Math.random() - .5) * 30, y: site === OB ? OB.y : BR.y0 + 40 + (Math.random() - .5) * 60, t: 0.3 });', 'G.fx.push({ x: site.x + (Math.random() - .5) * 50, y: site.y + (Math.random() - .5) * 30, t: 0.3 });');
rep("say(site === OB ? 'Баррикада разобрана, перевал открыт' : 'Мост построен! Можно перейти реку у левого хребта');", "say(site.done || 'Готово'); if (site.kind === 'yard') ramSpawn(site);");
// ---- the picture
swap('function bake() {', '// ---------------------------------------------------------------- drawing', String.raw`function bake() {
  BAKE = document.createElement('canvas'); BAKE.width = WW * BS; BAKE.height = WH * BS; const g = BAKE.getContext('2d'); g.scale(BS, BS);
  window.NOART = true; window.NOTENT = !!MAP.noCamp; try { MAP.draw(g, rng(MAP.seed)); } finally { window.NOART = false; window.NOTENT = false; }
}

`);
swap('function drawBridge() {', 'function draw(t) {', 'function drawBridge() {}\nfunction drawBarricade() {}\n');

// ---- swamp: ambushers hide in the reeds on the hummocks; squads that wade through the bog sink, heave and churn the mud
rep('s.hiddenA = !s.revealed && inForest(s); }', 's.hiddenA = !s.revealed && (inForest(s) || inReeds(s)); }');
rep('const inForest = s =>', 'const inReeds = s => (MAP.reeds || []).some(([x, y, rx, ry]) => ((s.x - x) / (rx + 6)) ** 2 + ((s.y - y) / (ry + 6)) ** 2 < 1);\nconst inForest = s =>');
rep('function drawSquad(s, t) {', String.raw`const inBog = s => TY[cellOf(s.x, s.y)] === T.SLOW;
const WADE = {
  swamp: { pool: 'rgba(70,86,40,.88)', ring: '210,225,150', drop: '#4a3a22', text: 'вязнут…', tcol: '#d6e29a', reeds: true },
  sea: { pool: 'rgba(60,175,200,.6)', shine: 'rgba(255,255,255,.5)', ring: '255,255,255', drop: 'rgba(255,255,255,.95)', big: true, text: 'бредут…', tcol: '#d6f3ff', reeds: false },
  lagoon: { pool: 'rgba(96,176,166,.62)', shine: 'rgba(240,250,245,.4)', ring: '230,250,240', drop: 'rgba(240,250,245,.9)', big: true, text: 'бредут…', tcol: '#d6f3ea', reeds: true },
  mud: { pool: 'rgba(95,65,35,.92)', ring: '190,140,90', drop: '#5a3a1c', big: true, text: 'вязнут…', tcol: '#e2c9a0', reeds: false } };
function drawSquad(s, t) {
  const st = WADE[MAP.wade] || WADE.swamp;
  if (s.hiddenA || !inBog(s)) { s.wade = 0; return drawSquadBase(s, t); }
  s.wade = Math.min(1, (s.wade || 0) + 0.04);
  const w = s.wade, mv = s.moving ? 1 : 0.35, n = Math.ceil(s.n), ph = t * 2.6 + s.id;
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(Math.sin(ph) * 0.035 * mv); ctx.translate(-s.x, -s.y + 5 * w);
  drawSquadBase(s, t * 0.4);
  ctx.restore();
  ctx.save();
  for (let i = 0; i < n; i++) {
    const [ox, oy] = fposT(n, i), px = s.x + ox, py = s.y + oy + 5 * w + 2, k = (t * 0.9 + i * 0.37 + s.id) % 1;
    ctx.beginPath(); ctx.ellipse(px, py - 1, 15, 6.5, 0, 0, 7); ctx.fillStyle = st.pool; ctx.fill();
    if (st.shine) { ctx.beginPath(); ctx.ellipse(px - 3, py - 3, 8, 2.6, 0, 0, 7); ctx.fillStyle = st.shine; ctx.fill(); }
    ctx.strokeStyle = 'rgba(' + st.ring + ',' + (0.55 * (1 - k) * mv + 0.12) + ')'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(px, py - 1, 15 + k * 12, 6.5 + k * 5, 0, 0, 7); ctx.stroke();
    if (s.moving && (i + (t * 6 | 0)) % 5 === 0) { ctx.fillStyle = st.drop; for (const [dx, dy] of [[-9, -7], [10, -9], [2, -13]]) { ctx.beginPath(); ctx.arc(px + dx, py + dy - (t * 40 + i * 9) % 7, st.big ? 2.6 : 2, 0, 7); ctx.fill(); } }
  }
  if (s.moving) { ctx.font = '900 12px "Lilita One", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = OL; ctx.fillStyle = st.tcol; ctx.strokeText(st.text, s.x, s.y - 64 + Math.sin(ph) * 2); ctx.fillText(st.text, s.x, s.y - 64 + Math.sin(ph) * 2); }
  ctx.restore();
  if (st.reeds) { ctx.save(); const rs = Math.floor(s.id * 7.3); for (const dx of [-30, 32]) { ctx.save(); ctx.translate(s.x + dx, s.y + 20 + (rs + dx) % 4); ctx.scale(0.42, 0.42); ctx.rotate(Math.sin(t * 2 + dx) * 0.05); reeds(ctx, 0, 0); ctx.restore(); } ctx.restore(); }
}
function drawSquadBase(s, t) {`);
rep('  const items = [{ y: OB.y, f: drawBarricade }];', '  const items = SITES.map(s => ({ y: s.y, f: () => drawSite(s) })); items.push({ y: -1e9, f: () => drawCityExtras(t) });');
rep("  else if (!alive(1).length) { win = 2; why = 'Все четыре отряда выбиты.'; }", "  else if (G.lostVilla) { win = 2; why = 'Вилла наместника сожжена мятежниками.'; }\n  else if (!alive(1).length) { win = 2; why = 'Все четыре отряда выбиты.'; }");
rep("$('cFlags').textContent = '⚑ ' + caps + '/3';", "$('cFlags').textContent = MAP.waves ? waveChip() : '⚑ ' + caps + '/3';");
rep('const EMBED = window.name === \'legwar\';', "const EMBED = window.name.startsWith('legwar');");

// ---- assemble the page from gen.js, with the city art, the data and the runtime around the engine
let gen = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
const grep = (a, b) => { if (!gen.includes(a)) throw new Error('gen missing ' + a.slice(0, 60)); gen = gen.replace(a, () => b); };
grep("const war = fs.readFileSync(path.join(__dirname, 'war.js'), 'utf8');", 'const war = WAR;');
grep("const artHelpers = toonJs.slice(0, toonJs.indexOf('function drawWorld(g) {'));", "const artHelpers = toonJs.slice(0, toonJs.indexOf('function drawWorld(g) {')).replace(\"const team = side === 1 ? '#e2382c' : '#3f7ae0', dark = side === 1 ? '#a8241c' : '#2a56b0';\", \"const team = side === 1 ? '#e2382c' : side === 3 ? '#c8822c' : '#3f7ae0', dark = side === 1 ? '#a8241c' : side === 3 ? '#8a5418' : '#2a56b0';\");");
grep('${war}\n</script>', '${cityArt}\n${guards}\n${spec}\n${war}\n${runtime}\n</script>');
grep("fs.writeFileSync(path.join(__dirname, 'war.html'), html);", "fs.writeFileSync(path.join(__dirname, 'citywar.html'), html);");
new Function('require', '__dirname', 'WAR', 'cityArt', 'guards', 'spec', 'runtime', gen)(require, __dirname, war, veiiDraw + '\n' + cityArt, guards, spec, runtime);
