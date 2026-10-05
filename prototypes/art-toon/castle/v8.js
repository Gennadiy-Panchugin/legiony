// v8: capture points sit at objects (bridge, provisions depot, market, city centre, barracks, chief's hall); mounds to shoot from;
// the final point is the city centre at the top.
const fs = require('fs'), path = require('path');
const F = path.join(__dirname, 'castle.html');
let s = fs.readFileSync(F, 'utf8');
function rep(a, b) { const i = s.indexOf(a); if (i < 0 || s.indexOf(a, i + 1) >= 0) { console.error('MISS', a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); }
function between(a, b, body) { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) { console.error('MISS range', a.slice(0, 60), '|', b.slice(0, 40)); process.exit(1); } s = s.slice(0, i) + body + s.slice(j); }

// ---------------------------------------------------------------- legend
rep("// opened: g gate, B breach, t ruin, o cleared", "// S provisions depot · M market stall · F forum (on a plateau) · Z chief's hall (on the upper plateau) · Y barracks (on a plateau) · m mound\n// opened: g gate, B breach, t ruin, o cleared");

// ---------------------------------------------------------------- the city: bridge, provisions depot, market, city centre on top (final)
between("  city: {", "  hill: {", String.raw`  city: {
    id: 'city', name: 'Секции города', sub: 'Дойдите до центра города', ptsWord: 'Пункты', win: { final: 3 },
    goal: 'Мост, склад провизии и рынок лежат по пути, каждый даёт +3 в резерв. Главное: захватить центр города на плато вверху, встав у форума на 6 секунд. С бугров стрелки бьют дальше.',
    winText: 'Центр города взят, над форумом орёл легиона.',
    rows: ['xxxxxxxxx', 'hhhhhhhhh', 'hJhhFhhJh', 'hhhhhhhhh', 'hhhhJhahh', '.H..f.pH.', 'HHH.HHQHH', 'hhh.pp..f', 'hJh.p.H..', 'hhh.p.M.H', 'hhh.ppmH.', 'hah.p..f.', '...fp.f..', '.S.p.fm..',
           'wwdwbwwRw', '.fm.p.mf.', '.H..p.H..', '..p.pp...', '.p..p..f.', '.........'],
    points: [{ r: 14, c: 4, name: 'Мост', need: 4, kind: 'bridge' }, { r: 13, c: 1, name: 'Склад провизии', need: 4, kind: 'landmark' }, { r: 9, c: 6, name: 'Рынок', need: 4, kind: 'landmark' }, { r: 2, c: 4, name: 'Центр города', need: 6, kind: 'keep' }],
    enemies: [[15, 3, 'e_inf', 4, 'hold', 'br'], [15, 5, 'e_arc', 3, 'hold', 'br'], [16, 7, 'e_cav', 3, 'hold', 'br', [[16, 7], [16, 2]]], [13, 4, 'e_inf', 4, 'hold', 'br'], [13, 6, 'e_arc', 4, 'hold', 'br'],
              [12, 1, 'e_inf', 4, 'hold', 'dep'], [12, 2, 'e_arc', 3, 'hold', 'dep'],
              [9, 5, 'e_inf', 5, 'hold', 'mkt'], [8, 5, 'e_arc', 4, 'hold', 'mkt'], [10, 4, 'e_inf', 4, 'hold', 'mkt', [[10, 4], [7, 4]]], [10, 6, 'e_arc', 4, 'hold', 'mkt'],
              [9, 1, 'e_inf', 5, 'hold', 'tmp'], [8, 2, 'e_arc', 4, 'hold', 'tmp'], [10, 0, 'e_arc', 3, 'hold', 'tmp'],
              [5, 3, 'e_inf', 5, 'hold', 'gate'], [5, 5, 'e_arc', 4, 'hold', 'gate'],
              [3, 4, 'e_inf', 7, 'hold', 'cit'], [3, 3, 'e_inf', 6, 'hold', 'cit'], [3, 5, 'e_inf', 6, 'hold', 'cit'], [2, 2, 'e_arc', 4, 'hold', 'cit'], [2, 6, 'e_arc', 4, 'hold', 'cit']]
  },
`);

// ---------------------------------------------------------------- the hill: depot in the ward, barracks, chief's hall
between("  hill: {", "  castle: {", String.raw`  hill: {
    id: 'hill', name: 'Холм с террасами', sub: 'Поднимитесь в зал вождя', ptsWord: 'Пункты', win: { final: 2 },
    goal: 'Три яруса друг над другом, между ними обрывы и по одному пандусу. Склад провизии внизу и казармы на среднем ярусе дают +3 в резерв. Главное: встать у зала вождя на верхнем ярусе на 6 секунд. С бугров стрелки бьют дальше.',
    winText: 'Зал вождя взят, над холмом орёл легиона.',
    rows: ['xxxxxxxxx', 'uuuuuuuuu', 'uVuuZuuVu', 'uuuuuuuuu', 'uuuuVuuuu', 'uuuuuuuuu', 'hhhhhhhAh', 'hhYhJhhhh', 'hhhhhhhhh', 'PhPPPPPPP', 'hhhhhhhhh', 'hJhhhhhJh', 'hhhhhhhah', '...p.....',
           '.f.p.fm..', '.T.p...T.', '.Hmp.H...', '..Spp....', '.f.p.mf..', '.........', '.........', '.........'],
    points: [{ r: 17, c: 2, name: 'Склад провизии', need: 4, kind: 'landmark' }, { r: 7, c: 2, name: 'Казармы', need: 4, kind: 'landmark' }, { r: 2, c: 4, name: 'Зал вождя', need: 6, kind: 'keep' }],
    enemies: [[15, 1, 'e_tower', 4, 'tower', 'wd'], [15, 7, 'e_tower', 4, 'tower', 'wd'], [17, 3, 'e_inf', 4, 'hold', 'wd'], [17, 5, 'e_inf', 4, 'hold', 'wd'], [16, 4, 'e_arc', 3, 'hold', 'wd'], [16, 2, 'e_arc', 3, 'hold', 'wd'], [17, 7, 'e_cav', 3, 'hold', 'wd', [[17, 7], [17, 1]]],
              [11, 3, 'e_arc', 3, 'hold', 't1'], [11, 6, 'e_inf', 4, 'hold', 't1', [[11, 6], [11, 2]]], [10, 1, 'e_inf', 4, 'hold', 't1'],
              [8, 2, 'e_inf', 5, 'hold', 'br'], [7, 5, 'e_inf', 4, 'hold', 'br'], [8, 6, 'e_arc', 3, 'hold', 'br'], [7, 7, 'e_cav', 3, 'hold', 'br'],
              [3, 4, 'e_inf', 6, 'hold', 'tp'], [3, 3, 'e_inf', 5, 'hold', 'tp'], [3, 5, 'e_inf', 5, 'hold', 'tp'], [4, 2, 'e_arc', 3, 'hold', 'tp'], [4, 6, 'e_arc', 3, 'hold', 'tp']]
  },
`);
rep("'wwdwRwdww', '....p....', '.ff.p.ff.'", "'wwdwRwdww', '..m.p.m..', '.ff.p.ff.'");

// ---------------------------------------------------------------- tile rules: landmarks block movement, mounds are low hills
rep("'hJPCa'.includes(ch) ? 'h' : 'uVA'.includes(ch) ? 'u' : 'HQTWGKBp'.includes(ch) ? '.' : ch;", "'hJPCaFY'.includes(ch) ? 'h' : 'uVAZ'.includes(ch) ? 'u' : 'HQTWGKBpSMm'.includes(ch) ? '.' : ch;");
rep("const HG = ch => (ch === 'h' || ch === 'C' || ch === 'J' || ch === 'P') ? 1 : (ch === 'u' || ch === 'V') ? 2 : ch === 'a' ? 0.5 : ch === 'A' ? 1.5 : 0;", "const HG = ch => (ch === 'h' || ch === 'C' || ch === 'J' || ch === 'P' || ch === 'F' || ch === 'Y') ? 1 : (ch === 'u' || ch === 'V' || ch === 'Z') ? 2 : (ch === 'a' || ch === 'm') ? 0.5 : ch === 'A' ? 1.5 : 0;");
rep("|| ch === 'Q' || ch === 'P') return false;", "|| ch === 'Q' || ch === 'P' || ch === 'S' || ch === 'F' || ch === 'Z' || ch === 'Y' || ch === 'M') return false;");
rep("ch === 'p' ? 0.8 : (ch === 'a' || ch === 'A') ? 1.4 : 1;", "ch === 'p' ? 0.8 : (ch === 'a' || ch === 'A') ? 1.4 : ch === 'm' ? 1.25 : 1;");
rep("s.range * (hgt(s.r, s.c) > 0.7 ? 1.35 : 1) * 0.9 : 80;", "s.range * (hgt(s.r, s.c) > 0.4 ? 1.35 : 1) * 0.9 : 80;");
rep("const reach = a => a.range ? a.range * (hgt(a.r, a.c) > 0.7 ? 1.35 : 1) : MELEE;", "const reach = a => a.range ? a.range * (hgt(a.r, a.c) > 0.4 ? 1.35 : 1) : MELEE;");

// ---------------------------------------------------------------- drawing the objects
rep("    if (ch === 'H' || ch === 'J' || ch === 'V') {\n      const k = (r * 7 + cc * 3) % 3,", String.raw`    if (ch === 'S') {                                                              // provisions depot
      g.fillStyle = 'rgba(25,25,10,.28)'; g.beginPath(); g.ellipse(cx + 5, cy + 27, 38, 8, 0, 0, 7); g.fill();
      g.fillStyle = '#a77a45'; g.fillRect(cx - 29, cy - 6, 58, 31); g.strokeStyle = '#5a3d20'; g.lineWidth = 1.2; for (let q = 1; q < 6; q++) { g.beginPath(); g.moveTo(cx - 29 + q * 9.7, cy - 6); g.lineTo(cx - 29 + q * 9.7, cy + 25); g.stroke(); }
      g.fillStyle = '#d7b668'; g.beginPath(); g.moveTo(cx - 36, cy - 4); g.lineTo(cx, cy - 36); g.lineTo(cx + 36, cy - 4); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.moveTo(cx - 36, cy - 4); g.lineTo(cx, cy - 36); g.lineTo(cx, cy - 4); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(110,80,30,.6)'; g.lineWidth = 1; for (let q = 1; q < 5; q++) { g.beginPath(); g.moveTo(cx - 36 + q * 14, cy - 4 - q * 2); g.lineTo(cx - 18 + q * 7, cy - 30); g.stroke(); }
      g.fillStyle = '#4a3420'; g.fillRect(cx - 10, cy + 4, 20, 21); g.strokeStyle = '#2a1c10'; g.lineWidth = 1.4; g.strokeRect(cx - 10, cy + 4, 20, 21); g.beginPath(); g.moveTo(cx, cy + 4); g.lineTo(cx, cy + 25); g.stroke();
      for (const [bx, by] of [[cx - 24, cy + 22], [cx + 23, cy + 24], [cx + 14, cy + 27]]) { g.fillStyle = '#7a5530'; g.beginPath(); g.ellipse(bx, by, 7, 8, 0, 0, 7); g.fill(); g.strokeStyle = '#3d2a18'; g.lineWidth = 1; g.stroke(); g.beginPath(); g.moveTo(bx - 7, by - 2); g.lineTo(bx + 7, by - 2); g.moveTo(bx - 7, by + 3); g.lineTo(bx + 7, by + 3); g.stroke(); }
    } else if (ch === 'M') {                                                      // market stall
      g.fillStyle = 'rgba(25,25,10,.25)'; g.beginPath(); g.ellipse(cx + 3, cy + 24, 30, 7, 0, 0, 7); g.fill();
      g.fillStyle = '#7a5530'; g.fillRect(cx - 24, cy + 4, 48, 18); g.fillStyle = '#5a3d20'; g.fillRect(cx - 24, cy + 18, 48, 5);
      for (let q = 0; q < 6; q++) { g.fillStyle = q % 2 ? '#efe6d2' : '#c0261b'; g.beginPath(); g.moveTo(cx - 30 + q * 10, cy - 16); g.lineTo(cx - 20 + q * 10, cy - 16); g.lineTo(cx - 22 + q * 10, cy + 2); g.lineTo(cx - 32 + q * 10, cy + 2); g.closePath(); g.fill(); }
      g.strokeStyle = '#4a3420'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 27, cy - 16); g.lineTo(cx - 27, cy + 20); g.moveTo(cx + 27, cy - 16); g.lineTo(cx + 27, cy + 20); g.stroke();
      for (const [bx, col] of [[cx - 14, '#c0261b'], [cx - 2, '#d9a441'], [cx + 10, '#6fa33a'], [cx + 20, '#d9792b']]) { g.fillStyle = col; g.beginPath(); g.arc(bx, cy + 7, 4.5, 0, 7); g.fill(); }
    } else if (ch === 'F' || ch === 'Z') {                                         // forum / chief's hall
      const stone = ch === 'F';
      g.fillStyle = 'rgba(25,25,10,.3)'; g.beginPath(); g.ellipse(cx + 6, cy + 27, 40, 8, 0, 0, 7); g.fill();
      g.fillStyle = '#cfc6b2'; g.fillRect(cx - 34, cy + 15, 68, 9); g.fillStyle = '#ddd4c0'; g.fillRect(cx - 30, cy + 8, 60, 8);
      g.fillStyle = stone ? '#ebe4d1' : '#a98259'; g.fillRect(cx - 27, cy - 14, 54, 23);
      for (let q = 0; q < 5; q++) { g.fillStyle = stone ? '#f6f1e2' : '#6b4a2a'; g.fillRect(cx - 25 + q * 12, cy - 14, 5, 23); g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(cx - 21 + q * 12, cy - 14, 1.5, 23); }
      g.fillStyle = stone ? '#c0613a' : '#6b3a22'; g.beginPath(); g.moveTo(cx - 36, cy - 12); g.lineTo(cx, cy - 36); g.lineTo(cx + 36, cy - 12); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(cx - 36, cy - 12); g.lineTo(cx, cy - 36); g.lineTo(cx, cy - 12); g.closePath(); g.fill();
      g.fillStyle = '#d9a441'; g.beginPath(); g.arc(cx, cy - 20, 4, 0, 7); g.fill();
    } else if (ch === 'Y') {                                                       // barracks: a long hall with a shield rack
      g.fillStyle = 'rgba(25,25,10,.28)'; g.beginPath(); g.ellipse(cx + 5, cy + 26, 38, 8, 0, 0, 7); g.fill();
      g.fillStyle = '#8e7a5c'; g.fillRect(cx - 29, cy - 6, 58, 30); g.fillStyle = '#a89270'; g.fillRect(cx - 29, cy - 6, 58, 6);
      g.fillStyle = '#8a3a2a'; g.beginPath(); g.moveTo(cx - 36, cy - 4); g.lineTo(cx - 20, cy - 26); g.lineTo(cx + 20, cy - 26); g.lineTo(cx + 36, cy - 4); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.16)'; g.beginPath(); g.moveTo(cx - 36, cy - 4); g.lineTo(cx - 20, cy - 26); g.lineTo(cx, cy - 26); g.lineTo(cx, cy - 4); g.closePath(); g.fill();
      for (let q = 0; q < 4; q++) { g.fillStyle = '#2f6fd6'; g.beginPath(); g.arc(cx - 21 + q * 14, cy + 12, 6, 0, 7); g.fill(); g.strokeStyle = '#d9a441'; g.lineWidth = 1.4; g.stroke(); g.fillStyle = '#e8ecf2'; g.beginPath(); g.arc(cx - 21 + q * 14, cy + 12, 1.8, 0, 7); g.fill(); }
      g.fillStyle = '#4a3420'; g.fillRect(cx - 5, cy + 4, 10, 20);
    } else if (ch === 'm') {                                                       // a mound to shoot from
      g.fillStyle = 'rgba(25,30,10,.32)'; g.beginPath(); g.ellipse(cx + 5, cy + 24, 31, 9, 0, 0, 7); g.fill();
      const rg = g.createRadialGradient(cx - 9, cy - 8, 3, cx, cy + 4, 35); rg.addColorStop(0, '#dbe7a8'); rg.addColorStop(0.55, '#b7c880'); rg.addColorStop(1, '#8aa058');
      g.fillStyle = rg; g.beginPath(); g.ellipse(cx, cy + 4, 31, 24, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(60,80,30,.5)'; g.lineWidth = 1.4; g.stroke();
      g.fillStyle = '#a4a69c'; g.beginPath(); g.ellipse(cx + 14, cy + 14, 5, 3.5, 0, 0, 7); g.ellipse(cx - 17, cy + 10, 4, 3, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(70,100,35,.5)'; g.lineWidth = 1; for (let q = 0; q < 8; q++) { const px = cx - 22 + rnd() * 44, py = cy - 8 + rnd() * 24; g.beginPath(); g.moveTo(px, py); g.lineTo(px - 1.5, py - 5); g.stroke(); }
    } else if (ch === 'H' || ch === 'J' || ch === 'V') {
      const k = (r * 7 + cc * 3) % 3,`);
// flags stand above buildings
rep("y = y0 - hgt(p.r, p.c) * E, mine = p.owner === 1,", "y = y0 - hgt(p.r, p.c) * E, ud = (p.kind === 'landmark' || p.kind === 'keep') ? 26 : 0, mine = p.owner === 1,");
rep("ctx.moveTo(x, y + 8); ctx.lineTo(x, y - 36); ctx.stroke();", "ctx.moveTo(x, y + 8); ctx.lineTo(x, y - 36 - ud); ctx.stroke();");
rep("ctx.moveTo(x, y - 36); ctx.lineTo(x + 22, y - 31 + Math.sin(t * 4 + p.r) * 1.8); ctx.lineTo(x, y - 23); ctx.fill();", "ctx.moveTo(x, y - 36 - ud); ctx.lineTo(x + 22, y - 31 - ud + Math.sin(t * 4 + p.r) * 1.8); ctx.lineTo(x, y - 23 - ud); ctx.fill();");
fs.writeFileSync(F, s);
console.log('ok v8', s.length);
