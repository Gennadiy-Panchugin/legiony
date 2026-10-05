// v5: three maps (city districts, terraced hill, old castle), worlds taller than the screen with a minimap, capture points,
// active defenders (post-wide alarm, patrols, cavalry), generals' faces on the rail.
const fs = require('fs'), path = require('path');
const F = path.join(__dirname, 'castle.html');
let s = fs.readFileSync(F, 'utf8');
function rep(a, b) { const i = s.indexOf(a); if (i < 0 || s.indexOf(a, i + 1) >= 0) { console.error('MISS', a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); }
function between(a, b, body) { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) { console.error('MISS range', a.slice(0, 60), '|', b.slice(0, 40)); process.exit(1); } s = s.slice(0, i) + body + s.slice(j); }

// ---------------------------------------------------------------- sizes: the world can be taller than the screen
rep("RS = Math.min(3.2, DPR * 1.6);", "RS = Math.min(2.4, DPR * 1.3);");
rep("const CS = 60, COLS = 9, ROWS = 14, OY = 90;", "const CS = 60, COLS = 9, OY = 90; let ROWS = 14;\nconst WORLD_H = () => OY + ROWS * CS;");

// ---------------------------------------------------------------- the maps
between('// . grass · f forest', 'let T;', String.raw`// . grass · f forest · p road · h plateau · u upper plateau · C camp · a ramp (up to h) · A ramp (h to u) · w river · d ford · b bridge · R barricaded bridge
// x cliffs · W wall · G gate · K keep · T tower · H house · J house on plateau · V house on upper plateau · Q cart barricade · P palisade
// opened: g gate, B breach, t ruin, o cleared
const MAPS = {
  city: {
    id: 'city', name: 'Секции города', sub: 'Возьмите три района из четырёх', ptsWord: 'Районы', win: { count: 3 },
    goal: 'Город поделён на четыре района с флагами. Встаньте у флага и продержитесь 4 секунды без врагов рядом. Нужно взять любые три.',
    winText: 'Три района взяты, город ваш.',
    rows: ['xxxxxxxxx', 'hhhhhhhhh', 'hJhhhhhJh', 'hhhhhhhhh', 'hhhhJhahh', '.H..f.pH.', 'HHH.HHQHH', 'hhh.pp..f', 'hJh.p.H..', 'hhh.p...H', 'hhh.pp.H.', 'hah.p..f.', '...fp.f..', '...p.f...',
           'wwdwbwwRw', '.f..p..f.', '.H..p.H..', '..p.pp...', '.p..p..f.', '.........'],
    start: [[18, 3], [18, 5], [18, 1], [19, 4]],
    points: [{ r: 16, c: 4, name: 'Набережная', need: 4, kind: 'district' }, { r: 9, c: 6, name: 'Рынок', need: 4, kind: 'district' }, { r: 9, c: 1, name: 'Храмовый холм', need: 4, kind: 'district' }, { r: 2, c: 4, name: 'Цитадель', need: 4, kind: 'district' }],
    enemies: [[16, 3, 'e_inf', 4, 'hold', 'riv'], [16, 5, 'e_arc', 3, 'hold', 'riv'], [17, 7, 'e_cav', 3, 'hold', 'riv', [[17, 7], [17, 1]]],
              [9, 5, 'e_inf', 5, 'hold', 'mkt'], [8, 5, 'e_arc', 4, 'hold', 'mkt'], [10, 4, 'e_inf', 4, 'hold', 'mkt', [[10, 4], [7, 4]]], [12, 6, 'e_arc', 3, 'hold', 'mkt'],
              [9, 1, 'e_inf', 5, 'hold', 'tmp'], [8, 2, 'e_arc', 4, 'hold', 'tmp'], [10, 0, 'e_arc', 3, 'hold', 'tmp'],
              [5, 3, 'e_inf', 5, 'hold', 'gate'], [5, 5, 'e_arc', 4, 'hold', 'gate'],
              [2, 4, 'e_inf', 7, 'hold', 'cit'], [3, 3, 'e_inf', 6, 'hold', 'cit'], [3, 5, 'e_inf', 6, 'hold', 'cit'], [2, 2, 'e_arc', 4, 'hold', 'cit'], [2, 6, 'e_arc', 4, 'hold', 'cit']]
  },
  hill: {
    id: 'hill', name: 'Холм с террасами', sub: 'Поднимитесь на три яруса', ptsWord: 'Ярусы', win: { final: 2 },
    goal: 'Три яруса друг над другом, между ними обрывы и по одному пандусу. Возьмите нижнюю заставу и казармы, а главное, встаньте в зале вождя на верхнем ярусе на 6 секунд.',
    winText: 'Зал вождя взят, над холмом орёл легиона.',
    rows: ['xxxxxxxxx', 'uuuuuuuuu', 'uVuuuuuVu', 'uuuuuuuuu', 'uuuuVuuuu', 'uuuuuuuuu', 'hhhhhhhAh', 'hhhhJhhhh', 'hhhhhhhhh', 'PhPPPPPPP', 'hhhhhhhhh', 'hJhhhhhJh', 'hhhhhhhah', '...p.....',
           '.f.p.f...', '.T.p...T.', '.H.p.H...', '...pp....', '.f.p..f..', '.........', '.........', '.........'],
    start: [[19, 3], [19, 5], [19, 1], [20, 4]],
    points: [{ r: 17, c: 4, name: 'Застава', need: 4, kind: 'district' }, { r: 7, c: 2, name: 'Казармы', need: 4, kind: 'district' }, { r: 2, c: 4, name: 'Зал вождя', need: 6, kind: 'keep' }],
    enemies: [[15, 1, 'e_tower', 5, 'tower', 'wd'], [15, 7, 'e_tower', 5, 'tower', 'wd'], [17, 3, 'e_inf', 5, 'hold', 'wd'], [17, 5, 'e_inf', 5, 'hold', 'wd'], [16, 4, 'e_arc', 4, 'hold', 'wd'], [18, 6, 'e_cav', 3, 'hold', 'wd', [[18, 6], [18, 1]]],
              [11, 3, 'e_arc', 4, 'hold', 't1'], [11, 6, 'e_inf', 5, 'hold', 't1', [[11, 6], [11, 2]]], [10, 1, 'e_inf', 5, 'hold', 't1'],
              [7, 2, 'e_inf', 6, 'hold', 'br'], [7, 5, 'e_inf', 5, 'hold', 'br'], [8, 6, 'e_arc', 4, 'hold', 'br'], [7, 7, 'e_cav', 4, 'hold', 'br'],
              [2, 4, 'e_inf', 7, 'hold', 'tp'], [3, 3, 'e_inf', 6, 'hold', 'tp'], [3, 5, 'e_inf', 6, 'hold', 'tp'], [4, 2, 'e_arc', 4, 'hold', 'tp'], [4, 6, 'e_arc', 4, 'hold', 'tp']]
  },
  castle: {
    id: 'castle', name: 'Замок Вейи', sub: 'Займите донжон, враги стоят на постах', ptsWord: 'Лагеря', win: { final: 2 },
    goal: 'Старая карта: стены, ворота, две башни и два лагеря на плато. Простоите в донжоне 6 секунд без врагов рядом, и победа.',
    winText: 'Донжон взят, над замком орёл легиона.',
    rows: ['xxxxxxxxx', 'xWWWKWWWx', 'xW.....Wx', 'xW.....Wx', 'xTWWGWWTx', '.f.ppp.f.', 'hCa.p.aCh', 'hh.fpf.hh', 'wwdwRwdww', '....p....', '.ff.p.ff.', '.........', '.........', '.........'],
    start: [[11, 3], [11, 5], [11, 1], [12, 4]],
    points: [{ r: 6, c: 1, name: 'Лагерь', need: 4, kind: 'camp' }, { r: 6, c: 7, name: 'Лагерь', need: 4, kind: 'camp' }, { r: 1, c: 4, name: 'Донжон', need: 6, kind: 'keep' }],
    enemies: [[4, 1, 'e_tower', 5, 'tower', 'cs'], [4, 7, 'e_tower', 5, 'tower', 'cs'], [3, 3, 'e_inf', 7, 'hold', 'cs'], [3, 5, 'e_inf', 7, 'hold', 'cs'], [2, 4, 'e_inf', 8, 'hold', 'cs'], [2, 2, 'e_inf', 5, 'hold', 'cs'], [2, 6, 'e_inf', 5, 'hold', 'cs'],
              [6, 1, 'e_inf', 5, 'hold', 'cL'], [7, 1, 'e_arc', 4, 'hold', 'cL'], [6, 7, 'e_inf', 5, 'hold', 'cR'], [7, 7, 'e_arc', 4, 'hold', 'cR']]
  }
};
let curMap = 'city', M = MAPS.city;
`);
rep("const START = [[11, 3], [11, 5], [11, 1], [12, 4]];\n", "");

// terrain rules for the new tiles
rep("const HG = ch => (ch === 'h' || ch === 'C') ? 1 : ch === 'a' ? 0.5 : 0;", "const HG = ch => (ch === 'h' || ch === 'C' || ch === 'J' || ch === 'P') ? 1 : (ch === 'u' || ch === 'V') ? 2 : ch === 'a' ? 0.5 : ch === 'A' ? 1.5 : 0;");
rep("if (ch === 'x' || ch === 'W' || ch === 'T' || ch === 'R' || ch === 'w') return false;", "if (ch === 'x' || ch === 'W' || ch === 'T' || ch === 'R' || ch === 'w' || ch === 'H' || ch === 'J' || ch === 'V' || ch === 'Q' || ch === 'P') return false;");
rep("const costOf = (ch, s) => ch === 'f' ? (s && s.cls === 'eques' ? 2.5 : 2) : ch === 'd' ? (s && s.cls === 'eques' ? 3 : 2.5) : ch === 'p' ? 0.8 : ch === 'a' ? 1.4 : 1;", "const costOf = (ch, s) => ch === 'f' ? (s && s.cls === 'eques' ? 2.5 : 2) : ch === 'd' ? (s && s.cls === 'eques' ? 3 : 2.5) : ch === 'p' ? 0.8 : (ch === 'a' || ch === 'A') ? 1.4 : 1;");
rep("const WORK = { R: 5, W: 12, G: 7 };", "const WORK = { R: 5, W: 12, G: 7, Q: 5, P: 6 };");
rep("if (ch === 'R' || ch === 'W' || ch === 'G') {", "if (ch === 'R' || ch === 'W' || ch === 'G' || ch === 'Q' || ch === 'P') {");
rep("ch === 'W' ? 'Стену пробивают только инженеры' : 'Ворота выбивают только инженеры'", "ch === 'W' ? 'Стену пробивают только инженеры' : ch === 'G' ? 'Ворота выбивают только инженеры' : 'Заграждение разбирают только инженеры'");
rep("T[w.r][w.c] = ch === 'R' ? 'b' : ch === 'G' ? 'g' : 'B';", "T[w.r][w.c] = ch === 'R' ? 'b' : ch === 'G' ? 'g' : ch === 'W' ? 'B' : 'o';");
rep("say(ch === 'R' ? 'Баррикада на мосту разобрана' : ch === 'G' ? 'Ворота выбиты' : 'Стена пробита');", "say(ch === 'R' ? 'Баррикада на мосту разобрана' : ch === 'G' ? 'Ворота выбиты' : ch === 'W' ? 'Стена пробита' : 'Заграждение разобрано');");

// new unit: enemy cavalry
rep("  e_tower: { name: 'Башня', letter: '', kind: ARC, n: 5, k: 0.07, speed: 0, range: 170 }", "  e_tower: { name: 'Башня', letter: '', kind: ARC, n: 5, k: 0.07, speed: 0, range: 170 },\n  e_cav:   { name: 'Конница', letter: '', kind: CAV, n: 4, k: 0.11, speed: 64 }");
rep("e_tower: { col: '#2f6fd6', trim: '#dfe8ff', emb: 'none', shape: 'pennant' }\n};", "e_tower: { col: '#2f6fd6', trim: '#dfe8ff', emb: 'none', shape: 'pennant' }, e_cav: { col: '#2f6fd6', trim: '#dfe8ff', emb: 'horse', shape: 'swallow' }\n};");
rep("if (a.cls === 'eques' && a.travel >= 100) {", "if ((a.cls === 'eques' || a.cls === 'e_cav') && a.travel >= 100) {");
rep("if (cls === 'eques') {\n    ctx.strokeStyle = '#4a2c16';", "if (cls === 'eques' || cls === 'e_cav') {\n    ctx.strokeStyle = '#4a2c16';");
rep("cls === 'eques' ? 9 : 5.2, cls === 'eques' ? 2.6 : 1.9", "(cls === 'eques' || cls === 'e_cav') ? 9 : 5.2, (cls === 'eques' || cls === 'e_cav') ? 2.6 : 1.9");
rep("else if (n === 'eques') { play('clash', a.x); play('hoof', a.x); }", "else if (n === 'eques' || n === 'e_cav') { play('clash', a.x); play('hoof', a.x); }");
rep("    wedge: p =>", "    alarm: () => horn([50, 50], [0, 0.22], 0.25, true),\n    wedge: p =>");

// ---------------------------------------------------------------- a battle starts from a map
between('function newBattle() {', 'function addSq(', String.raw`function newBattle() {
  M = MAPS[curMap]; ROWS = M.rows.length;
  T = M.rows.map(r => r.split('')); initDecals();
  G = { t: 0, over: false, sq: [], occ: new Map(), sel: null, fx: [], volleys: [], rome: [], dirty: true, kills: 0, lost: 0, waveN: 0, alarm: {},
        points: M.points.map(p => ({ ...p, owner: 2, prog: 0 })), parts: [], warn: [], waveWarned: false, traps: [], rains: [], tgt: null };
  slots.forEach((cls, i) => { const s = addSq(1, cls, M.start[i][0], M.start[i][1], 'player'); s.name = GEN[i]; G.rome.push(s); });
  for (const [r, c, cls, n, ai, zone, patrol] of M.enemies) { const e = addSq(2, cls, r, c, ai); e.n = e.max = n; e.zone = zone; e.patrol = patrol || null; }
  if (typeof cam !== 'undefined') { cam.z = 1; cam.cx = W / 2; cam.cy = WORLD_H(); cam.fx = undefined; clampCam(); }
  uiCards();
}
`);

// ---------------------------------------------------------------- capture points and the win rule
between('  // camps: spawn defenders until captured', '  // timers, orders', String.raw`  // capture points: stand by the flag with nobody hostile near; a captured point heals the squads standing on it
  for (const p of G.points) {
    const [px, py] = cellXY(p.r, p.c);
    const mine = live.filter(q => q.side === 1 && !q.moving && Math.hypot(q.x - px, q.y - py) < 62);
    const hostile = live.some(e => e.side === 2 && Math.hypot(e.x - px, e.y - py) < (p.kind === 'keep' ? 130 : 110));
    if (p.owner === 2) {
      if (mine.length && !hostile) { p.prog += dt; if (p.prog >= p.need) { p.owner = 1; p.prog = 0; SND.play('capture'); G.fx.push({ x: px, y: py, t: 0.8, big: true }); say(p.name + ' взят!'); } }
      else { const was = p.prog; p.prog = Math.max(0, p.prog - dt * 0.5); if (was > 0 && p.prog === 0) SND.play('lost'); }
    } else if (!hostile) for (const q of mine) if (q.n < q.max) q.n = Math.min(q.max, q.n + 0.5 * dt);
  }
`);
rep("  if (G.keep.prog >= KEEP_NEED) { win = 1; why = 'Донжон взят, над замком орёл легиона.'; }", "  if (M.win.final !== undefined ? G.points[M.win.final].owner === 1 : G.points.filter(p => p.owner === 1).length >= M.win.count) { win = 1; why = M.winText; }");

// ---------------------------------------------------------------- active defenders
between('function think(s, dt) {', 'function pursue(', String.raw`// one alarm per post (zone): spot or hit anybody and the whole post wakes up and goes for the intruders
function raise(zone, who, secs) {
  if (!zone) return; const was = (G.alarm[zone] || 0) > G.t;
  G.alarm[zone] = Math.max(G.alarm[zone] || 0, G.t + secs);
  if (!was) { G.warn.push({ x: who.x, y: who.y, t: 2.5 }); SND.play('alarm', who.x); }
}
function think(s, dt) {
  s.thinkT -= dt; if (s.thinkT > 0 || s.ai === 'tower' || s.ai === 'player') return; s.thinkT = 0.6;
  const foes = alive(1); if (!foes.length) return;
  let tgt = null, bd = 1e9, any = null, ad = 1e9;
  for (const f of foes) { const d = dist(s, f); if (d < ad) { ad = d; any = f; } if (hidden(f) && d > 90) continue; if (d < bd) { bd = d; tgt = f; } }
  const [hx, hy] = cellXY(s.home[0], s.home[1]);
  const alarm = (G.alarm[s.zone] || 0) > G.t, aggro = alarm ? 400 : 250, leash = alarm ? 560 : 360;
  if (tgt && bd < aggro) raise(s.zone, s, 12);
  if (s.ai === 'raid') { s.atk = tgt || any; return; }
  if (tgt && bd < aggro && Math.hypot(tgt.x - hx, tgt.y - hy) < leash) { s.atk = tgt; s.pauseT = 0; }
  else if (s.atk && (!s.atk.alive || Math.hypot(s.atk.x - hx, s.atk.y - hy) > leash + 60)) s.atk = null;
  if (!s.atk && !s.to && !s.path.length) {
    if (s.pauseT > 0) s.pauseT--;
    else if (s.patrol && !alarm) { s.pi = ((s.pi || 0) + 1) % s.patrol.length; s.path = pathTo(s, s.patrol[s.pi][0], s.patrol[s.pi][1]) || []; s.pauseT = 4; }
    else if (s.r !== s.home[0] || s.c !== s.home[1]) s.path = pathTo(s, s.home[0], s.home[1]) || [];
  }
}
`);
rep("t.pend += v; t.hurt = 0.25;\n", "t.pend += v; t.hurt = 0.25; if (t.side === 2) raise(t.zone, t, 14);\n");
rep("e.pend += 1.8; e.slowT = 4; tr.t = 0;", "e.pend += 1.8; e.slowT = 4; tr.t = 0; raise(e.zone, e, 14);");
rep("e.pend += (e.ai === 'tower' ? 0.2 : 0.55) * dt; e.hurt = 0.25;", "e.pend += (e.ai === 'tower' ? 0.2 : 0.55) * dt; e.hurt = 0.25; raise(e.zone, e, 14);");

// ---------------------------------------------------------------- terrain drawing for the new tiles and a taller world
rep("const c = document.createElement('canvas'); c.width = W * RS; c.height = H * RS;\n  const g = c.getContext('2d'); g.scale(RS, RS);\n  let sd = 5;", "const c = document.createElement('canvas'); c.width = W * RS; c.height = WORLD_H() * RS;\n  const g = c.getContext('2d'); g.scale(RS, RS);\n  let sd = 5;");
rep("g.fillStyle = '#3f2717'; g.fillRect(0, 0, W, H); g.fillStyle = gr;", "g.fillStyle = '#3f2717'; g.fillRect(0, 0, W, WORLD_H()); g.fillStyle = gr;");
rep("const roadish = ch => ch === 'p' || ch === 'b' || ch === 'R' || ch === 'G' || ch === 'g' || ch === 'B' || ch === 'a';", "const roadish = ch => ch === 'p' || ch === 'b' || ch === 'R' || ch === 'G' || ch === 'g' || ch === 'B' || ch === 'a' || ch === 'A' || ch === 'Q';");
rep("} else if (ch === 'p' || ch === 'a' || ch === 'G' || ch === 'g') {", "} else if (ch === 'p' || ch === 'a' || ch === 'A' || ch === 'G' || ch === 'g') {");
rep("g.fillStyle = ch === 'a' ? '#cfb785' : '#d6c08a';", "const rp = ch === 'a' || ch === 'A'; g.fillStyle = rp ? '#cfb785' : '#d6c08a';");
rep("if (ch === 'a') g.fillRect(x, y, CS, CS);\n      else {", "if (rp) g.fillRect(x, y, CS, CS);\n      else {");
rep("if (ch === 'a') { g.strokeStyle = 'rgba(120,95,55,.55)';", "if (rp) { g.strokeStyle = 'rgba(120,95,55,.55)';");
rep("} else if (ch === 'h' || ch === 'C') {\n      g.fillStyle = '#c4cf93'; g.fillRect(x, y, CS, CS);", "} else if (HG(ch) >= 1 && ch !== 'a' && ch !== 'A') {\n      g.fillStyle = HG(ch) >= 2 ? '#cdd69b' : '#c4cf93'; g.fillRect(x, y, CS, CS);");
rep("if (r >= 2 && r <= 3 && cc >= 2 && cc <= 6 || (r === 1 && cc === 4)) {", "if (M.id === 'castle' && (r >= 2 && r <= 3 && cc >= 2 && cc <= 6 || (r === 1 && cc === 4))) {");
rep("const ch = T[r][cc]; if (ch !== 'h' && ch !== 'C') continue;", "const ch = T[r][cc], hh = HG(ch); if (hh < 1 || ch === 'a' || ch === 'A') continue;");
rep("const lower = (nr, nc) => { const n = at(nr, nc); return n !== 'x' && !(nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) && HG(n) < 1 && n !== 'a' && !wallish(n); };", "const lower = (nr, nc) => { const n = at(nr, nc); return n !== 'x' && !(nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) && HG(n) <= hh - 1 && n !== 'a' && n !== 'A' && !wallish(n); };");
rep("    if (ch === 'f') {\n      const trees = [];", String.raw`    if (ch === 'H' || ch === 'J' || ch === 'V') {
      const k = (r * 7 + cc * 3) % 3, hw = 38 + k * 3, hy = cy - 2, hx = cx - hw / 2, roof = ['#b4562f', '#9a4a2a', '#a8673a'][k];
      g.fillStyle = 'rgba(25,25,10,.28)'; g.beginPath(); g.ellipse(cx + 4, hy + 24, hw * 0.62, 6, 0, 0, 7); g.fill();
      g.fillStyle = '#ddd0b0'; g.fillRect(hx, hy, hw, 22); g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(hx, hy + 16, hw, 6);
      g.fillStyle = roof; g.beginPath(); g.moveTo(hx - 4, hy + 3); g.lineTo(cx, hy - 24); g.lineTo(hx + hw + 4, hy + 3); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.moveTo(hx - 4, hy + 3); g.lineTo(cx, hy - 24); g.lineTo(cx, hy + 3); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(60,35,20,.5)'; g.lineWidth = 1; for (let q = 1; q < 4; q++) { g.beginPath(); g.moveTo(hx + q * hw / 4 - 2, hy + 3 - q * 1.5); g.lineTo(cx + (q - 2) * 3, hy - 18 + q); g.stroke(); }
      g.fillStyle = '#4a3420'; g.fillRect(cx - 4, hy + 9, 8, 13); g.fillStyle = '#7fb0d8'; g.fillRect(hx + 5, hy + 7, 7, 7); g.fillRect(hx + hw - 12, hy + 7, 7, 7);
    } else if (ch === 'Q') {
      g.fillStyle = 'rgba(25,25,10,.25)'; g.beginPath(); g.ellipse(cx + 3, cy + 18, 26, 6, 0, 0, 7); g.fill();
      g.fillStyle = '#7a5530'; g.fillRect(x + 6, cy - 2, CS - 12, 14); g.strokeStyle = '#3d2a18'; g.lineWidth = 1.5; g.strokeRect(x + 6, cy - 2, CS - 12, 14);
      g.strokeStyle = '#4a3420'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 6, cy - 14); g.lineTo(x + CS - 6, cy + 14); g.moveTo(x + CS - 6, cy - 14); g.lineTo(x + 6, cy + 14); g.stroke(); g.strokeStyle = '#8a5f33'; g.lineWidth = 3.5; g.stroke();
      g.fillStyle = '#4a3420'; for (let q = 0; q < 5; q++) { g.beginPath(); g.moveTo(x + 8 + q * 10, cy - 4); g.lineTo(x + 12 + q * 10, cy - 20); g.lineTo(x + 16 + q * 10, cy - 4); g.fill(); }
    } else if (ch === 'P') {
      g.fillStyle = 'rgba(25,25,10,.25)'; g.fillRect(x, cy + 14, CS, 4);
      for (let q = 0; q < 7; q++) { const sx = x + 4 + q * 8.5; g.fillStyle = '#8a6a3c'; g.fillRect(sx - 2.5, cy - 16, 5, 32); g.fillStyle = '#5a3d20'; g.beginPath(); g.moveTo(sx - 2.5, cy - 16); g.lineTo(sx, cy - 24); g.lineTo(sx + 2.5, cy - 16); g.fill(); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(sx + 0.5, cy - 16, 2, 32); }
      g.fillStyle = '#6b4a2a'; g.fillRect(x, cy - 4, CS, 4);
    } else if (ch === 'f') {
      const trees = [];`);

// ---------------------------------------------------------------- drawing: world size, capture flags
rep("ctx.fillRect(0, OY - 400, W, OY + ROWS * CS + 800); ctx.drawImage(TERR, 0, 0, W, H);\n  ctx.drawImage(DEC, 0, 0, W, H);", "ctx.fillRect(0, OY - 600, W, WORLD_H() + 1200); ctx.drawImage(TERR, 0, 0, W, WORLD_H());\n  ctx.drawImage(DEC, 0, 0, W, WORLD_H());");
between('  // camps and the keep banner', '  // when a squad is selected: the grid', String.raw`  // capture points: a flag with a ring that fills while you hold it
  for (const p of G.points) {
    const [x, y] = cellXY(p.r, p.c), mine = p.owner === 1, col = mine ? '#c0261b' : '#2f6fd6';
    if (p.kind === 'camp') { ctx.fillStyle = col; ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 22, y + 18); ctx.lineTo(x, y - 14); ctx.lineTo(x + 22, y + 18); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#2a1c10'; ctx.beginPath(); ctx.moveTo(x - 7, y + 18); ctx.lineTo(x, y + 2); ctx.lineTo(x + 7, y + 18); ctx.fill(); }
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y + 4, 28, 0, Math.PI * 2); ctx.stroke();
    if (p.prog > 0) { ctx.strokeStyle = '#f6d77a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y + 4, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p.prog / p.need); ctx.stroke(); }
    ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x, y - 36); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - 36); ctx.lineTo(x + 22, y - 31 + Math.sin(t * 4 + p.r) * 1.8); ctx.lineTo(x, y - 23); ctx.fill();
    ctx.font = '700 12px Alegreya Sans, sans-serif'; ctx.textAlign = 'center'; const tw = ctx.measureText(p.name).width + 12; ctx.fillStyle = 'rgba(30,25,19,.88)'; ctx.fillRect(x - tw / 2, y + 34, tw, 17); ctx.fillStyle = mine ? '#ff9a8c' : '#a9c4ff'; ctx.fillText(p.name, x, y + 47);
  }
`);
rep("ctx.fillStyle = 'rgba(30,60,110,.07)'; ctx.fillRect(0, OY, W, ROWS * CS); }", "ctx.fillStyle = 'rgba(30,60,110,.07)'; ctx.fillRect(0, OY, W, ROWS * CS); }");
rep("else if (sel.cls === 'eng' && (ch === 'R' || ch === 'W' || ch === 'G')) {", "else if (sel.cls === 'eng' && (ch === 'R' || ch === 'W' || ch === 'G' || ch === 'Q' || ch === 'P')) {");

// ---------------------------------------------------------------- HUD, minimap, camera
between('function hud() {', 'let boostSel = null', String.raw`function hud() {
  const caps = G.points.filter(p => p.owner === 1).length, foesLeft = G.sq.filter(s => s.alive && s.side === 2 && s.ai !== 'tower').length;
  $('clock').textContent = clock(G.t);
  SND.slow(!!G.sel); SND.level(G.sq.filter(s => s.alive && s.fighting).length / 3);
  const ph = $('phase');
  ph.className = 'hud phase' + (G.sel ? ' slow' : '');
  ph.textContent = G.tgt ? '🎯 Коснитесь клетки для «' + BOOST[G.tgt.s.boosts[G.tgt.idx].id].name + '»' : G.sel ? '⏳ Замедление · выберите клетку' : M.ptsWord + ' ' + caps + '/' + G.points.length + (M.win.count ? ' (нужно ' + M.win.count + ')' : '') + ' · вражеских отрядов ' + foesLeft;
  const cp = G.points.find(p => p.prog > 0);
  $('sub').textContent = cp ? cp.name + ': ещё ' + Math.ceil(cp.need - cp.prog) + ' с' : M.sub;
  $('mapName').textContent = M.name;
  const big = ROWS * CS > VH * 1.02;
  $('zoomchip').hidden = !(big || cam.z > 1.02); $('zoomchip').textContent = cam.z.toFixed(1).replace('.', ',') + '× ⟲';
  drawMini(); uiCards();
}
const MW = 56;
function drawMini() {
  const mini = $('mini'), show = ROWS * CS * cam.z > VH * 1.02 || cam.z > 1.02;
  mini.hidden = !show; if (!show) return;
  const k = MW / W, mh = Math.round(ROWS * CS * k);
  if (mini.height !== mh) { mini.width = MW; mini.height = mh; }
  const g = mini.getContext('2d'); g.clearRect(0, 0, MW, mh);
  g.drawImage(TERR, 0, OY * RS, W * RS, ROWS * CS * RS, 0, 0, MW, mh);
  for (const p of G.points) { const [x, y] = cellXY(p.r, p.c); g.fillStyle = p.owner === 1 ? '#c0261b' : '#fff3d6'; g.fillRect(x * k - 2, (y - OY) * k - 2, 4, 4); }
  for (const q of G.sq) if (q.alive && q.ai !== 'tower') { g.fillStyle = q.side === 1 ? (BAN[q.cls] || BAN.hastati).col : '#2f6fd6'; g.fillRect(q.x * k - 1.5, (q.y - OY) * k - 1.5, 3, 3); }
  const [x0, y0] = toWorld(0, OY), [x1, y1] = toWorld(W, H); g.strokeStyle = '#fff3d6'; g.lineWidth = 1.2; g.strokeRect(Math.max(0, x0 * k), Math.max(0, (y0 - OY) * k), Math.min(MW, (x1 - x0) * k), Math.min(mh, (y1 - y0) * k));
}
`);
rep("cam.z = Math.max(1, Math.min(2.6, gest.z0 * d / gest.d0));", "cam.z = Math.max(zMin(), Math.min(2.6, gest.z0 * d / gest.d0));");
rep("cam.z = Math.max(1, Math.min(2.6, cam.z * Math.pow(1.0015, -e.deltaY)));", "cam.z = Math.max(zMin(), Math.min(2.6, cam.z * Math.pow(1.0015, -e.deltaY)));");
rep("if (gest.moved && cam.z > 1.01) { cam.cx -= dx / cam.z; cam.cy -= dy / cam.z; clampCam(); }", "if (gest.moved) { cam.fx = undefined; cam.cx -= dx / cam.z; cam.cy -= dy / cam.z; clampCam(); }");
rep("const cam = { z: 1, cx: W / 2, cy: OY + ROWS * CS / 2 }, VH = H - OY;", "const cam = { z: 1, cx: W / 2, cy: OY + ROWS * CS / 2 }, VH = H - OY;\nconst zMin = () => Math.min(1, VH / (ROWS * CS));");
rep("$('zoomchip').addEventListener('click', () => { cam.z = 1; clampCam(); });", `$('zoomchip').addEventListener('click', () => {
  if (cam.z > zMin() + 0.03 && ROWS * CS > VH * 1.02 && cam.z <= 1.02) { cam.z = zMin(); cam.fx = undefined; }
  else { cam.z = 1; const m = alive(1); if (m.length) { cam.cx = m.reduce((a, q) => a + q.x, 0) / m.length; cam.cy = m.reduce((a, q) => a + q.y, 0) / m.length; } }
  clampCam();
});
const miniGo = e => { const r = $('mini').getBoundingClientRect(); cam.fx = undefined; cam.cx = (e.clientX - r.left) / r.width * W; cam.cy = OY + (e.clientY - r.top) / r.height * ROWS * CS; clampCam(); };
$('mini').addEventListener('pointerdown', e => { e.stopPropagation(); miniGo(e); try { $('mini').setPointerCapture(e.pointerId); } catch (_) {} });
$('mini').addEventListener('pointermove', e => { if (e.buttons) miniGo(e); });
const focusOn = s => { cam.fx = s.x; cam.fy = s.y; };
function easeCam() { if (cam.fx === undefined) return; cam.cx += (cam.fx - cam.cx) * 0.18; cam.cy += (cam.fy - cam.cy) * 0.18; clampCam(); if (Math.hypot(cam.fx - cam.cx, cam.fy - cam.cy) < 2) cam.fx = undefined; }`);
rep("step(dt); draw(now / 1000);", "step(dt); easeCam(); draw(now / 1000);");
rep("select(s); uiCards(); });\n", "select(s); focusOn(s); uiCards(); });\n");

// ---------------------------------------------------------------- the rail shows the general's face as well as the banner
rep("function paintRail() {\n  G.rome.forEach((s, i) => { const g = $('rbc' + i).getContext('2d'); g.clearRect(0, 0, 64, 64); banner(g, 20, 58, BAN[s.cls], 1.4); });\n}", String.raw`// a general's portrait: face by person, helmet by squad, the squad's banner at the corner
function portrait(g, i, cls) {
  const st = BAN[cls] || BAN.hastati, skin = ['#d9a77c', '#e9c29a', '#c98e63', '#dcae82'][i % 4];
  const bg = g.createLinearGradient(0, 0, 0, 64); bg.addColorStop(0, '#46371f'); bg.addColorStop(1, '#251b10'); g.fillStyle = bg; g.fillRect(0, 0, 64, 64);
  g.fillStyle = st.col; g.beginPath(); g.moveTo(2, 64); g.quadraticCurveTo(6, 46, 22, 44); g.lineTo(40, 44); g.quadraticCurveTo(56, 46, 60, 64); g.fill();
  g.fillStyle = '#d9a441'; g.fillRect(27, 45, 10, 4);
  g.fillStyle = skin; g.fillRect(28, 38, 8, 9); g.beginPath(); g.ellipse(32, 30, 11, 13, 0, 0, 7); g.fill();
  g.fillStyle = '#2a1c10'; g.beginPath(); g.ellipse(27.5, 30, 1.7, 2.1, 0, 0, 7); g.ellipse(36.5, 30, 1.7, 2.1, 0, 0, 7); g.fill();
  g.strokeStyle = '#3a2615'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(24, 26); g.lineTo(30, 25); g.moveTo(34, 25); g.lineTo(40, 26); g.stroke();
  g.strokeStyle = 'rgba(80,45,25,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(32, 30); g.lineTo(31, 34); g.lineTo(33, 34); g.stroke();
  g.strokeStyle = '#8a3a2a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(29, 38.5); g.quadraticCurveTo(32, 40, 35, 38.5); g.stroke();
  if (i === 0) { g.fillStyle = '#b8b2a6'; g.beginPath(); g.moveTo(22, 34); g.quadraticCurveTo(32, 54, 42, 34); g.quadraticCurveTo(32, 42, 22, 34); g.fill(); }      // grey beard
  if (i === 2) { g.strokeStyle = '#a14a3a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(24, 28); g.lineTo(29, 36); g.stroke(); }                              // scar
  if (i === 3) { g.fillStyle = '#3a2615'; g.beginPath(); g.moveTo(26, 37); g.quadraticCurveTo(32, 34, 38, 37); g.quadraticCurveTo(32, 39, 26, 37); g.fill(); }  // moustache
  if (cls === 'hastati') { g.fillStyle = '#b4bac2'; g.beginPath(); g.arc(32, 27, 13.5, Math.PI, 0); g.fill(); g.fillRect(18.5, 27, 3.5, 11); g.fillRect(42, 27, 3.5, 11); g.fillStyle = st.col; g.fillRect(29, 6, 6, 10); g.fillStyle = '#7d1d16'; g.fillRect(29, 6, 6, 3); }
  else if (cls === 'velites') { g.fillStyle = '#6b4a2a'; g.beginPath(); g.arc(32, 26, 13.5, Math.PI * 0.95, Math.PI * 0.05); g.fill(); g.beginPath(); g.moveTo(20, 20); g.lineTo(17, 8); g.lineTo(27, 15); g.moveTo(44, 20); g.lineTo(47, 8); g.lineTo(37, 15); g.fill(); }
  else if (cls === 'eques') { g.fillStyle = '#b4bac2'; g.beginPath(); g.arc(32, 27, 13.5, Math.PI, 0); g.fill(); g.fillStyle = st.col; g.beginPath(); g.moveTo(30, 14); g.quadraticCurveTo(44, 2, 56, 18); g.quadraticCurveTo(44, 10, 34, 16); g.fill(); }
  else if (cls === 'eng') { g.fillStyle = '#8a5a2c'; g.beginPath(); g.arc(32, 26, 13.5, Math.PI, 0); g.fill(); g.fillRect(18, 25, 28, 3); }
  else { g.fillStyle = '#b0904c'; g.beginPath(); g.arc(32, 25, 14, Math.PI, 0); g.fill(); g.fillRect(14, 24, 36, 3); }
  banner(g, 52, 62, st, 0.6);
}
function paintRail() {
  G.rome.forEach((s, i) => { const g = $('rbc' + i).getContext('2d'); g.clearRect(0, 0, 64, 64); portrait(g, i, s.cls); });
}`);
rep(".rb { --hp: 100; --c: #6fd17a; width: 58px; height: 58px;", ".rb { --hp: 100; --c: #6fd17a; width: 64px; height: 64px;");
rep(".rail { position: absolute; left: 8px; top: 118px; display: flex; flex-direction: column; gap: 12px; z-index: 3; }", ".rail { position: absolute; left: 8px; top: 118px; display: flex; flex-direction: column; gap: 10px; z-index: 3; }");
rep(".zchip { position: absolute; right: 10px; top: 118px;", "#mini { position: absolute; right: 10px; top: 160px; width: 56px; border: 1px solid #4a3d2c; border-radius: 6px; background: #1e1913; z-index: 3; opacity: .94; cursor: pointer; touch-action: none; }\n  .maps { display: grid; gap: 6px; margin: 4px 0 8px; }\n  .maps button { text-align: left; padding: 8px 12px; border-radius: 10px; border: 1px solid #4a3d2c; background: var(--btn); color: var(--ink); font: 700 14px var(--body); cursor: pointer; height: auto !important; }\n  .maps button small { display: block; font: 500 12px var(--body); color: var(--muted); }\n  .maps button.on { border-color: var(--gold); background: #3a2e18; }\n  .zchip { position: absolute; right: 10px; top: 118px;");
rep('  <button class="zchip" id="zoomchip" type="button" hidden>1,0× ⟲</button>', '  <canvas id="mini" width="56" height="140" hidden></canvas>\n  <button class="zchip" id="zoomchip" type="button" hidden>1,0× ⟲</button>');
rep("<div class=\"tt\"><small>Замок Вейи</small>", "<div class=\"tt\"><small id=\"mapName\">Вейи</small>");

// ---------------------------------------------------------------- start screen: choose a map
between('    <h3>Штурм замка</h3>', '    <button type="button" class="go" id="helpOk">В бой</button>', String.raw`    <h3>Штурм</h3>
    <div class="maps" id="maps"></div>
    <p id="goalText"></p>
    <p>У вас <b>4 генерала</b>, у каждого малый отряд и знамя. <b>Коснитесь знамени слева или отряда</b>: время замедлится, внизу появятся приказы. Затем коснитесь клетки. <b>Колесо мыши или щипок</b> меняют масштаб, перетаскивание двигает карту, справа мини-карта.</p>
    <p><b>Рельеф решает:</b> на плато поднимаются по пандусу, сверху лучники бьют дальше. Реку переходят по броду или мосту. Баррикады, палисад, стены и ворота ломают инженеры. Лес прячет отряд. Враги не получают подкрепления, но тревога поднимает весь пост сразу.</p>
    <p>Состав, коснитесь, чтобы сменить класс:</p>
    <div class="slots" id="slots"></div>
`);
rep("function renderSlots() {", `function renderMaps() {
  $('maps').innerHTML = Object.values(MAPS).map(m => '<button type="button" data-m="' + m.id + '" class="' + (m.id === curMap ? 'on' : '') + '">' + m.name + '<small>' + m.sub + '</small></button>').join('');
  for (const b of $('maps').children) b.addEventListener('click', () => { curMap = b.dataset.m; newBattle(); renderMaps(); });
  $('goalText').innerHTML = '<b>Цель:</b> ' + MAPS[curMap].goal;
}
function renderSlots() {`);
rep("newBattle(); renderSlots();", "newBattle(); renderMaps(); renderSlots();");
rep("window.__cs = { get G() { return G; }, get T() { return T; },", "window.__cs = { setMap: id => { curMap = id; }, get M() { return M; }, get ROWS() { return ROWS; }, passable, canStep, MAPS, get G() { return G; }, get T() { return T; },");
fs.writeFileSync(F, s);
console.log('ok v5', s.length);
