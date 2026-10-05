// Builds citywar.html: the battle engine (war.js) driven by map data (citymaps-spec.js) for Вейи, Остия, Анций, Пренесте and Капуя.
// The city is chosen by the iframe name «legwar:<city>» (from the main game) or by the page hash (#capua) when opened alone.
const fs = require('fs'), path = require('path');
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('missing ' + a.slice(0, 50)); return src.slice(i, j); };
const T2 = f => fs.readFileSync(path.join('..', 'toon2d', f), 'utf8');
// the art: Veii's sheet (its shapes, Etruscan pieces and drawWorld) and the Capua sheet's script (all city helpers + the four maps + the Capua variants)
const veii = T2('veii.js'), veiiDraw = between(veii, "// ---------------------------------------------------------------- the map's shapes", 'const VIEW = ');
const capPage = T2('capua.html'); let cityArt = capPage.slice(capPage.indexOf("<script>\n'use strict';") + "<script>\n'use strict';".length, capPage.lastIndexOf('</script>'));
cityArt = cityArt.slice(0, cityArt.indexOf('const MAPS3 = '));
// art helpers already come with the battle page (gen.js), so drop the duplicate gen helpers at the top of the sheet script up to its first own section
cityArt = cityArt.slice(cityArt.indexOf('// ---------------------------------------------------------------- rubble: boulders'));
// while baking the picture, labels, squads, capture rings and the dynamic objects are not drawn
cityArt = cityArt.replace('const foe = (g, list) => list.forEach(', 'const foe = (g, list) => window.NOART || list.forEach(')
  .replace("g.save(); g.globalAlpha = 0.55; for (const gx of [240, 660]) { tent(g, gx - 34, 780); tent(g, gx + 34, 780); } g.restore();", '');
const guards = "for (const nm of ['sign', 'num', 'squad', 'capRing', 'rubble', 'bridgeSite', 'raft', 'ours']) { const f = window[nm]; if (f) window[nm] = function () { if (window.NOART) return; return f.apply(this, arguments); }; }\n";
// the gladiator arena (arena-spec.js, arena-runtime.js) is appended after the city data and the city runtime
const rd = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const spec = rd('citymaps-spec.js') + '\n' + rd('arena-spec.js'), runtime = rd('city-runtime.js') + '\n' + rd('arena-runtime.js');

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
rep('const T = { WATER: 0, LOW: 1, HIGH: 2, RAMP: 3, FORD: 4, BRIDGE: 5, BLOCK: 6, BARR: 7, MOUND: 8 };', 'const T = { WATER: 0, LOW: 1, HIGH: 2, RAMP: 3, FORD: 4, BRIDGE: 5, BLOCK: 6, BARR: 7, MOUND: 8, SLOW: 9 };');
rep('const TY = new Uint8Array(NN).fill(T.LOW), ROADM = new Uint8Array(NN), CAMPM = new Uint8Array(NN);', 'const TY = new Uint8Array(NN).fill(T.LOW), ROADM = new Uint8Array(NN), CAMPM = new Uint8Array(NN), SITEM = new Uint8Array(NN);');
swap('  const hi = mask(gg => { poly(gg, FORT_P); poly(gg, RIGHT_P); poly(gg, LEFT_P); });', 'const cellOf = (x, y) =>', String.raw`  const shape = (gg, s) => { if (!s) return; if (s.poly) poly(gg, s.poly); else if (s.line) { gg.lineWidth = s.w; gg.beginPath(); s.line.forEach(([x, y], i) => i ? gg.lineTo(x, y) : gg.moveTo(x, y)); gg.stroke(); } else if (s.rect) gg.fillRect(s.rect[0], s.rect[1], s.rect[2], s.rect[3]); else if (s.ell) { gg.beginPath(); gg.ellipse(s.ell[0], s.ell[1], s.ell[2], s.ell[3], 0, 0, 7); gg.fill(); } };
  const M = k => mask(gg => (MAP.nav[k] || []).forEach(s => shape(gg, s)));
  const hi = M('high'), water = M('water'), ford = M('ford'), deck = M('deck'), ramp = M('ramp'), mound = M('mound'), block = M('block'), slow = M('slow'), road = M('road');
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
    TY[c2] = t; ROADM[c2] = road[c2]; CAMPM[c2] = camp[c2];
  }
})();
`);
rep('if (t === T.BARR && !OB.open) return false; if (t === T.BRIDGE && !BR.open) return false;', 'if ((t === T.BARR || t === T.BRIDGE) && SITEM[c] && !SITES[SITEM[c] - 1].open && !(side === 2 && SITES[SITEM[c] - 1].foes)) return false;');
rep('const MULc = c => { const t = TY[c]; return ', 'const MULc = c => { const t = TY[c]; return t === T.SLOW ? 2 : ');
// ---- squads, posts, points
rep('const STARTS = [[380, 1372], [470, 1366], [560, 1376], [300, 1400]];', 'const STARTS = MAP.starts;');
swap('const ENEMIES = [', 'function addSq(', 'const ENEMIES = MAP.enemies;\nconst POINTS = MAP.points;\n');
rep('rains: [], fires: [], bolts: [], reveal: null, tgt: null', 'rains: [], fires: [], bolts: [], reveal: null, ram: false, reinfN: 0, reinfT: 0, act2: false, bonus: (MAP.bonus || []).map(b => ({ ...b, prog: 0, done: false })), tgt: null');
rep('  OB.open = false; OB.prog = 0; BR.open = false; BR.prog = 0;', '  for (const s of SITES) { s.open = false; s.prog = 0; }');
rep('  cam.z = 1; cam.x = 450; cam.y = 1300;', '  cam.z = 1; cam.x = MAP.cam.x; cam.y = MAP.cam.y;');
rep("addSq(2, cls, x, y, 'hold', zone, patrol, n);", "{ const q = addSq(2, cls, x, y, zone === 'wall' ? 'wall' : 'hold', zone, patrol, n); if (q.ai === 'wall') { q.range *= 1.4; q.k *= 0.5; } }");
rep('function pursue(s, dt) {\n', "function pursue(s, dt) {\n  if (s.ai === 'wall') { s.atk = null; s.path = []; return; }\n");
rep('  if (!s.atk && !s.path.length) {\n    if (s.pauseT > 0)', "  if (s.ai === 'wall') { s.atk = null; s.path = []; return; }\n  if (!s.atk && !s.path.length) {\n    if (s.pauseT > 0)");
rep("if (!p.final) { G.reserve += 3;", "if (!p.final) { G.reserve += 3; if (p.tents) TENTS.push(...p.tents);");
rep('  for (const q of live) if (q.side === 1) {\n    q.inTent', '  cityTick(dt, live);\n  for (const q of live) if (q.side === 1) {\n    q.inTent');
rep("why = 'Форт взят, над переправой орёл легиона.'", 'why = MAP.win');
rep("    if (a.sk > 0 && a.cls === 'velites') v *= 2.5;", "    if (a.sk > 0 && a.cls === 'velites') v *= 2.5;\n    if (a.sk > 0 && a.cls === 'gladiators') v *= 2;");
// ---- the work sites
rep('const siteAt = (x, y) => (!OB.open && Math.abs(x - OB.x) < 74 && Math.abs(y - OB.y) < 44) ? OB : (!BR.open && Math.abs(x - BR.x) < 46 && y > BR.y0 - 20 && y < BR.y1 + 16) ? BR : null;',
    'const siteAt = (x, y) => SITES.filter(s => !s.open && !s.nowork && Math.hypot(x - s.x, y - s.y) < (s.hit || 64)).sort((a, b) => Math.hypot(x - a.x, y - a.y) - Math.hypot(x - b.x, y - b.y))[0] || null;');
rep("    if (s.cls !== 'eng') { if (!quiet) say(site === OB ? 'Баррикаду разбирают только инженеры' : 'Мост строят только инженеры'); return false; }",
    "    if (s.cls !== 'eng') { if (!quiet) say(site.who || 'Это работа для инженеров'); return false; }\n    if (site.ram && !G.ram) { if (!quiet) say('Арку откроет только таран — соберите его в осадном дворе'); return false; }");
rep('    site.prog += dt * (s.sk > 0 ? 3 : 1);', '    site.prog += dt * (s.sk > 0 ? 3 : 1) * (G.ram && site.gate ? 3 : 1);');
rep('G.fx.push({ x: site === OB ? OB.x + (Math.random() - .5) * 90 : BR.x + (Math.random() - .5) * 30, y: site === OB ? OB.y : BR.y0 + 40 + (Math.random() - .5) * 60, t: 0.3 });', 'G.fx.push({ x: site.x + (Math.random() - .5) * 50, y: site.y + (Math.random() - .5) * 30, t: 0.3 });');
rep("say(site === OB ? 'Баррикада разобрана, перевал открыт' : 'Мост построен! Можно перейти реку у левого хребта');", "say(site.done || 'Готово'); if (site.kind === 'yard') G.ram = true;");
// ---- the picture
swap('function bake() {', '// ---------------------------------------------------------------- drawing', String.raw`function bake() {
  BAKE = document.createElement('canvas'); BAKE.width = WW * BS; BAKE.height = WH * BS; const g = BAKE.getContext('2d'); g.scale(BS, BS);
  window.NOART = true; try { MAP.draw(g, rng(MAP.seed)); } finally { window.NOART = false; }
}

`);
swap('function drawBridge() {', 'function draw(t) {', 'function drawBridge() {}\nfunction drawBarricade() {}\n');
rep('  const items = [{ y: OB.y, f: drawBarricade }];', '  const items = SITES.map(s => ({ y: s.y, f: () => drawSite(s) })); items.push({ y: -1e9, f: () => drawCityExtras(t) });');
rep("$('cFlags').textContent = '⚑ ' + caps + '/3';", "$('cFlags').textContent = MAP.waves ? waveChip() : '⚑ ' + caps + '/3';");
rep('const EMBED = window.name === \'legwar\';', "const EMBED = window.name.startsWith('legwar');");

// ---- assemble the page from gen.js, with the city art, the data and the runtime around the engine
let gen = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
const grep = (a, b) => { if (!gen.includes(a)) throw new Error('gen missing ' + a.slice(0, 60)); gen = gen.replace(a, () => b); };
grep("const war = fs.readFileSync(path.join(__dirname, 'war.js'), 'utf8');", 'const war = WAR;');
grep('${war}\n</script>', '${cityArt}\n${guards}\n${spec}\n${war}\n${runtime}\n</script>');
grep("fs.writeFileSync(path.join(__dirname, 'war.html'), html);", "fs.writeFileSync(path.join(__dirname, 'citywar.html'), html);");
new Function('require', '__dirname', 'WAR', 'cityArt', 'guards', 'spec', 'runtime', gen)(require, __dirname, war, veiiDraw + '\n' + cityArt, guards, spec, runtime);
