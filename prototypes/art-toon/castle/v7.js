// v7: replenish squads in the camp's tents from a limited reserve (Bad North style), and put the first zone far from the start.
const fs = require('fs'), path = require('path');
const F = path.join(__dirname, 'castle.html');
let s = fs.readFileSync(F, 'utf8');
function rep(a, b) { const i = s.indexOf(a); if (i < 0 || s.indexOf(a, i + 1) >= 0) { console.error('MISS', a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); }
function between(a, b, body) { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) { console.error('MISS range', a.slice(0, 60), '|', b.slice(0, 40)); process.exit(1); } s = s.slice(0, i) + body + s.slice(j); }

// ---------------------------------------------------------------- the camp sits at the foot of a longer approach, with three tents
rep("MAPS.city.camp = { r: 19, c: 4, rad: 2.6 }; MAPS.hill.camp = { r: 20, c: 4, rad: 2.6 }; MAPS.castle.camp = { r: 12, c: 4, rad: 2.6 };\n", "");
rep("MAPS.city.start = [[19, 3], [19, 5], [19, 2], [19, 4]]; MAPS.hill.start = [[20, 3], [20, 5], [21, 3], [21, 5]]; MAPS.castle.start = [[11, 3], [11, 5], [12, 3], [12, 5]];\n", "");
rep("  for (const m of Object.values(MAPS)) {\n    let sd = m.id.length * 977 + 13;", String.raw`  const APPROACH = { city: 5, hill: 4, castle: 3 }, ROWS_OF = ['.f..p..f.', '....p....', '.f..p.f..', '....p...f'];
  for (const m of Object.values(MAPS)) {
    for (let i = 0; i < APPROACH[m.id] - 1; i++) m.rows.push(ROWS_OF[i % 4]);
    m.rows.push('.........');
    const lr = m.rows.length - 1;
    m.camp = { r: lr, c: 4, rad: 2.6, tents: [[lr, 2], [lr, 4], [lr, 6]] };
    m.start = [[lr - 1, 3], [lr - 1, 5], [lr - 1, 2], [lr - 1, 4]];
    m.reserve = 10;
    let sd = m.id.length * 977 + 13;`);
rep("m.start = m.start.map(([r, c]) => [r, c + L]); m.camp.c += L;", "m.start = m.start.map(([r, c]) => [r, c + L]); m.camp.c += L; m.camp.tents = m.camp.tents.map(([r, c]) => [r, c + L]);");

// ---------------------------------------------------------------- the reserve, the tents and the refill timer
rep("let G, uid = 0, started = false;", "const REFILL = 3.5;\nlet G, uid = 0, started = false;");
rep("waveN: 0, alarm: {},", "waveN: 0, alarm: {}, reserve: M.reserve || 10,");
rep("else if (!hostile) for (const q of mine) if (q.n < q.max) q.n = Math.min(q.max, q.n + 0.5 * dt);\n  }\n", "}\n");
between("  if (M.camp) for (const q of live) if (q.side === 1 && !q.moving && q.n < q.max && inCamp(q.r, q.c)", "  // timers, orders", String.raw`  // the camp: a squad standing in a tent is topped up one soldier at a time, from a limited reserve
  for (const q of live) if (q.side === 1) {
    q.inTent = !q.moving && M.camp.tents.some(([r, c]) => r === q.r && c === q.c);
    if (!q.inTent || q.n >= q.max || G.reserve <= 0 || live.some(e => e.side === 2 && e.ai !== 'tower' && dist(e, q) < 130)) { q.refT = 0; continue; }
    q.refT = (q.refT || 0) + dt;
    if (q.refT >= REFILL) {
      q.refT = 0; q.n = Math.min(q.max, q.n + 1); q.shown = Math.ceil(q.n); G.reserve--; G.fx.push({ x: q.x, y: q.y, t: 0.5, big: true }); SND.play('recruit', q.x);
      if (G.reserve === 0) say('Резерв кончился: больше пополнять нечем');
    }
  }
`);
rep("say(p.name + ' взят!');", "G.reserve += 3; say(p.name + ' взят! В резерв +3');");
rep("    alarm: () => horn([50, 50], [0, 0.22], 0.25, true),", "    alarm: () => horn([50, 50], [0, 0.22], 0.25, true),\n    recruit: p => { tone(520, 0.09, 'triangle', 0.16, { pan: p }); tone(780, 0.14, 'triangle', 0.12, { at: ac.currentTime + 0.07, pan: p }); },");
rep("GAP = { clash: 70,", "GAP = { recruit: 120, clash: 70,");
between("  for (const [dx, dy] of [[-R * 0.5, R * 0.55], [0, R * 0.72], [R * 0.5, R * 0.55]]) {", "  const fx = cx - R * 0.55", String.raw`  const hurt = alive(1).some(q => q.n < q.max) && G.reserve > 0;
  for (const [tr, tc] of M.camp.tents) {
    const [x, y] = cellXY(tr, tc); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x, y + 12, 32, 9, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#c0261b'; ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x - 30, y + 12); ctx.lineTo(x, y - 28); ctx.lineTo(x + 30, y + 12); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2a1c10'; ctx.beginPath(); ctx.moveTo(x - 9, y + 12); ctx.lineTo(x, y - 8); ctx.lineTo(x + 9, y + 12); ctx.fill();
    ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - 28); ctx.lineTo(x, y - 40); ctx.stroke(); ctx.fillStyle = '#d9a441'; ctx.beginPath(); ctx.arc(x, y - 41, 2.5, 0, 7); ctx.fill();
    if (hurt) { const k = 0.8 + 0.2 * Math.sin(t * 6); ctx.fillStyle = '#2f8f4e'; ctx.strokeStyle = '#eef3d2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 30, y - 24, 11 * k, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#eef3d2'; ctx.fillRect(x + 30 - 5, y - 26, 10, 4); ctx.fillRect(x + 28, y - 29, 4, 10); }
    const q = G.occ.get(key(tr, tc)); if (q && q.side === 1 && q.refT > 0) { ctx.strokeStyle = '#6fd17a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y - 4, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * q.refT / REFILL); ctx.stroke(); }
  }
`);
rep("ctx.fillRect(cx - 38, cy + R + 4, 76, 17); ctx.fillStyle = '#ff9a8c'; ctx.fillText('Наш лагерь', cx, cy + R + 17);", "ctx.fillRect(cx - 74, cy + R + 4, 148, 17); ctx.fillStyle = '#ff9a8c'; ctx.fillText('Наш лагерь · резерв ' + G.reserve, cx, cy + R + 17);");
rep("function drawSquad(s, t) { const l = liftAt(s); ctx.save(); ctx.translate(0, -l);", "function drawSquad(s, t) { const l = liftAt(s); ctx.save(); ctx.translate(0, -l); if (s.inTent) ctx.globalAlpha = 0.65;");
// HUD and help
rep("' · вражеских отрядов ' + foesLeft;", "' · вражеских отрядов ' + foesLeft + ' · резерв ' + G.reserve;");
rep("    <p>Состав, коснитесь, чтобы сменить класс:</p>", "    <p><b>Пополнение:</b> заведите отряд в палатку своего лагеря, и он получит по бойцу каждые 3,5 секунды. Резерв ограничен (10), за каждый взятый пункт добавляется ещё 3.</p>\n    <p>Состав, коснитесь, чтобы сменить класс:</p>");
fs.writeFileSync(F, s);
console.log('ok v7', s.length);
