// v2 part A: terrain that matters (height, river, forest cover), warnings, faster pace. Drawing comes in v2b.
const fs = require('fs'), path = require('path');
const F = path.join(__dirname, 'castle.html');
let s = fs.readFileSync(F, 'utf8');
function rep(a, b) { const i = s.indexOf(a); if (i < 0 || s.indexOf(a, i + 1) >= 0) { console.error('MISS', a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); }
function between(a, b, body) { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) { console.error('MISS range', a.slice(0, 50)); process.exit(1); } s = s.slice(0, i) + body + s.slice(j); }

rep('<!-- Question: does a Bad North-style assault', '<!-- v2: relief, prettier squads, blood that stays. Question: does a Bad North-style assault');

// ---------------------------------------------------------------- the map: heights, river, ramps, forests
between('// . open · f forest · h hill', '// ---------------------------------------------------------------- squads', `// . grass · f forest · p road · h plateau · C camp (on a plateau) · a ramp · w river · d ford · b bridge · R barricaded bridge
// x cliffs · W wall · G gate · K keep · T tower · opened: g gate, B breach, t ruin
const MAP = [
  'xxxxxxxxx',
  'xWWWKWWWx',
  'xW.....Wx',
  'xW.....Wx',
  'xTWWGWWTx',
  '.f.ppp.f.',
  'hCa.p.aCh',
  'hh.fpf.hh',
  'wwdwRwdww',
  '....p....',
  '.ff.p.ff.',
  '.........',
  '.........'
];
let T;
const WORK = { R: 5, W: 12, G: 7 };                                   // seconds of engineer work
const HG = ch => (ch === 'h' || ch === 'C') ? 1 : ch === 'a' ? 0.5 : 0;
const hgt = (r, c) => HG(T[r][c]);
const canStep = (r, c, nr, nc) => Math.abs(hgt(r, c) - hgt(nr, nc)) <= 0.5;      // a cliff edge blocks; ramps join the levels
const passable = (side, r, c) => {
  if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return false;
  const ch = T[r][c];
  if (ch === 'x' || ch === 'W' || ch === 'T' || ch === 'R' || ch === 'w') return false;
  if (ch === 'G') return side === 2;                                    // the defenders use their own gate
  return true;
};
const costOf = (ch, s) => ch === 'f' ? (s && s.cls === 'eques' ? 2.5 : 2) : ch === 'd' ? (s && s.cls === 'eques' ? 3 : 2.5) : ch === 'p' ? 0.8 : ch === 'a' ? 1.4 : 1;
const hidden = s => s.side === 1 && T[s.r][s.c] === 'f' && !s.fighting;      // a squad in the trees cannot be seen from afar

`);
rep("speed: d.speed,", "speed: d.speed * 1.35,");
rep("WAVES = [80, 150, 210]", "WAVES = [70, 130, 190]");
rep("camps: [{ r: 7, c: 1, owner: 2, prog: 0, spawn: 8 }, { r: 7, c: 7, owner: 2, prog: 0, spawn: 14 }]", "camps: [{ r: 6, c: 1, owner: 2, prog: 0, spawn: 6 }, { r: 6, c: 7, owner: 2, prog: 0, spawn: 12 }], parts: [], warn: [], waveWarned: false");
rep("  T = MAP.map(r => r.split(''));", "  T = MAP.map(r => r.split('')); initDecals();");
rep("for (const cp of G.camps) { const s = addSq(2, 'e_inf', cp.r, cp.c, 'hold'); s.n = s.max = 4; }", "for (const cp of G.camps) { const s = addSq(2, 'e_inf', cp.r, cp.c, 'hold'); s.n = s.max = 4; }\n  addSq(2, 'e_arc', 7, 1, 'hold'); addSq(2, 'e_arc', 7, 7, 'hold');");

// pathing respects cliffs
rep("const nr = r + dr, nc = c + dc; if (!passable(s.side, nr, nc)) continue;", "const nr = r + dr, nc = c + dc; if (!passable(s.side, nr, nc) || !canStep(r, c, nr, nc)) continue;");
rep("      if (!passable(s.side, nr, nc)) s.path = [];", "      if (!passable(s.side, nr, nc) || !canStep(s.r, s.c, nr, nc)) s.path = [];");

// orders
rep("if (ch === 'r' || ch === 'W' || ch === 'G') {", "if (ch === 'R' || ch === 'W' || ch === 'G') {");
rep("ch === 'r' ? 'Завал разбирают только инженеры'", "ch === 'R' ? 'Баррикаду на мосту разбирают только инженеры'");
rep("if (ch === 'x') { if (!quiet) say('Скалы — туда не пройти'); return false; }", "if (ch === 'x' || ch === 'w') { if (!quiet) say(ch === 'x' ? 'Скалы — туда не пройти' : 'Река: переходите по броду или мосту'); return false; }");
rep("T[w.r][w.c] = ch === 'r' ? 'o' : ch === 'G' ? 'g' : 'B';", "T[w.r][w.c] = ch === 'R' ? 'b' : ch === 'G' ? 'g' : 'B';");
rep("say(ch === 'r' ? 'Завал расчищен'", "say(ch === 'R' ? 'Баррикада на мосту разобрана'");

// defenders do not see a squad hiding in the trees
rep("let tgt = null, bd = 1e9; for (const f of foes) { const d = dist(s, f); if (d < bd) { bd = d; tgt = f; } }",
    "let tgt = null, bd = 1e9, any = null, ad = 1e9;\n  for (const f of foes) { const d = dist(s, f); if (d < ad) { ad = d; any = f; } if (hidden(f) && d > 90) continue; if (d < bd) { bd = d; tgt = f; } }\n  if (s.ai === 'raid' && !tgt) { tgt = any; bd = ad; }");
rep("rr = s.range ? s.range * (hillAt(s) ? 1.35 : 1) * 0.9 : 80;", "rr = s.range ? s.range * (hgt(s.r, s.c) > 0.7 ? 1.35 : 1) * 0.9 : 80;");
rep("const reach = a => a.range ? a.range * (hillAt(a) && a.side === 1 ? 1.35 : 1) : MELEE;", "const reach = a => a.range ? a.range * (hgt(a.r, a.c) > 0.7 ? 1.35 : 1) : MELEE;");

// camps: spawn onto the ramp, warn 3 s before; relief waves warn at the gate
rep("      cp.spawn -= dt;\n", "      cp.spawn -= dt;\n      if (cp.spawn <= 3 && !cp.warned) { cp.warned = true; const [wx, wy] = cellXY(cp.r, cp.c); G.warn.push({ x: wx, y: wy, t: 3 }); }\n");
rep("cp.spawn = 30;", "cp.spawn = 30; cp.warned = false;");
rep("[[1, 0], [0, cp.c < 4 ? 1 : -1], [1, cp.c < 4 ? 1 : -1], [-1, 0]]", "[[0, cp.c < 4 ? 1 : -1], [1, 0], [-1, 0]]");
rep("if (passable(2, nr, nc) && !G.occ.has(key(nr, nc))) { const a = addSq(", "if (passable(2, nr, nc) && canStep(cp.r, cp.c, nr, nc) && !G.occ.has(key(nr, nc))) { const a = addSq(");
rep("  while (G.waveN < WAVES.length && G.t >= WAVES[G.waveN]) {", "  if (G.waveN < WAVES.length && G.t >= WAVES[G.waveN] - 4 && !G.waveWarned) { G.waveWarned = true; const [gx, gy] = cellXY(4, 4); G.warn.push({ x: gx, y: gy + 36, t: 4 }); }\n  while (G.waveN < WAVES.length && G.t >= WAVES[G.waveN]) {");
rep("const count = G.waveN === 2 ? 2 : 1; G.waveN++;", "const count = G.waveN === 2 ? 2 : 1; G.waveN++; G.waveWarned = false;");

// fights: height decides range and melee, trees hide, fords hurt
rep("    let t = null, bd = 1e9; const R = reach(a);\n    for (const e of live) { if (e.side === a.side) continue; const d = dist(a, e); if (d <= R && d < bd) { bd = d; t = e; } }",
    "    let t = null, bd = 1e9;\n    for (const e of live) {\n      if (e.side === a.side) continue; const d = dist(a, e);\n      const R = a.range ? a.range * (hgt(a.r, a.c) > hgt(e.r, e.c) + 0.1 ? 1.35 : 1) : MELEE;\n      if (d > R || d >= bd) continue;\n      if (a.side === 2 && hidden(e) && d > 90) continue;\n      bd = d; t = e;\n    }");
rep("    if (!ranged && T[t.r][t.c] === 'h') v *= 0.85;", "    if (!ranged && hgt(t.r, t.c) > hgt(a.r, a.c) + 0.1) v *= 0.8;          // storming a plateau\n    if (T[t.r][t.c] === 'd') v *= 1.25;                                   // caught in the ford");
rep("a.clash = ranged ? 0.5 : 0.35;", "a.clash = ranged ? 0.5 : 0.35; bleed(t);");
rep("for (const s of live) if (s.pend) { s.n -= s.pend; s.pend = 0; if (s.n <= 0.25) die(s); }",
    "for (const s of live) if (s.pend) {\n    s.n -= s.pend; s.pend = 0; if (s.shown === undefined) s.shown = Math.ceil(s.max);\n    if (s.n <= 0.25) die(s);\n    else { const c2 = Math.ceil(s.n); for (let i = c2; i < s.shown; i++) { const [px, py] = fpos(s, i, s.shown); corpse(px, py, s.side, s.kind); } s.shown = Math.min(s.shown, c2); }\n  }");
rep("for (const f of G.fx) f.t -= dt; G.fx = G.fx.filter(f => f.t > 0);\n  checkEnd();",
    "for (const f of G.fx) f.t -= dt; G.fx = G.fx.filter(f => f.t > 0);\n  for (const w of G.warn) w.t -= dt; G.warn = G.warn.filter(w => w.t > 0);\n  for (const p of G.parts) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 170 * dt; } G.parts = G.parts.filter(p => p.t > 0);\n  checkEnd();");
rep("function die(s) {\n  s.n = 0;", "function die(s) {\n  if (s.shown === undefined) s.shown = Math.ceil(s.max);\n  for (let i = 0; i < s.shown; i++) { const [px, py] = fpos(s, i, s.shown); corpse(px, py, s.side, s.kind); }\n  splat(s.x, s.y + 4, 22, 0.45); splat(s.x + 8, s.y, 14, 0.4);\n  s.n = 0;");

// the help text
rep("<p><b>Навык</b> включается кнопкой справа. <b>Завал, стены и ворота</b> проходят только инженеры: выберите их и коснитесь преграды. Лес замедляет, холм даёт лучникам дальность, всадники проносятся лесом навыком «Галоп».</p>",
    "<p><b>Навык</b> включается кнопкой справа. <b>Рельеф решает бой:</b> на плато ведёт только пандус, сверху лучники бьют дальше, а штурм вверх слабее. Реку переходят по бродам (медленно, под ударом) или по мосту, но он завален: баррикады, стены и ворота ломают только инженеры.</p>\n    <p><b>Лес</b> прячет отряд от дальнего боя и позволяет встретить врага засадой. <b>Дорога</b> быстрее. Красный знак «!» предупреждает, откуда выйдет враг.</p>");
fs.writeFileSync(F, s);
console.log('ok A', s.length);
