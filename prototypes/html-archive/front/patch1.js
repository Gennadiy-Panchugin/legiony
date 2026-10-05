const fs = require('fs');
let s = fs.readFileSync(__dirname + '/front.html', 'utf8');
function rep(a, b) { const n = s.split(a).length - 1; if (n !== 1) { console.error('MISS', n, a.slice(0, 100)); process.exit(1); } s = s.replace(a, b); }
// 1. arrows muster first: troops gather at the tail, then strike together
rep("  const a = { owner, pts, grabT: 0, done: false, id: Math.random() };", "  const a = { owner, pts, grabT: 0, done: false, id: Math.random(), launch: G.t + GATHER };");
rep("const CHARGE = 14, SPAWN_EVERY = 1.05, MAX_UNITS = 130, MAX_ARROWS = 3;", "const CHARGE = 14, SPAWN_EVERY = 1.05, MAX_UNITS = 130, MAX_ARROWS = 3, GATHER = 3;   // seconds an offensive musters before it moves");
rep("    if (u.arrow) {\n      const a = u.arrow, p = a.pts[Math.min(u.wp, a.pts.length - 1)];",
    "    if (u.arrow && G.t < u.arrow.launch) {                            // mustering at the tail of the arrow\n      const p = u.arrow.pts[0]; tx = p[0] + Math.sin(u.id * 50) * 18; ty = p[1] + Math.cos(u.id * 50) * 12 + (u.owner === 1 ? 12 : -12);\n    } else if (u.arrow) {\n      const a = u.arrow, p = a.pts[Math.min(u.wp, a.pts.length - 1)];");
// tail grabs during the muster pick from further away
rep("  for (const a of G.arrows) { a.grabT -= dt; if (a.grabT <= 0 && !a.done) { a.grabT = 2; grab(a, 110); } }",
    "  for (const a of G.arrows) { a.grabT -= dt; if (a.grabT <= 0 && !a.done) { a.grabT = G.t < a.launch ? 0.5 : 2; grab(a, G.t < a.launch ? 160 : 110); } }");
// 2. idle troops hold the front in clumps at a few anchor points
rep("    G.front[side] = out;\n  }\n}", `    G.front[side] = out;
    // anchors: one point per 60 px of front width, so idle troops stand in visible groups
    const bins = new Map();
    for (const p of out) { const k = Math.floor(p.x / 60); (bins.get(k) || bins.set(k, []).get(k)).push(p); }
    G.anchors[side] = [...bins.values()].map(list => { list.sort((a, b) => a.y - b.y); return list[Math.floor(list.length / 2)]; }).sort((a, b) => a.x - b.x);
  }
}`);
rep("        stats: { 1: 0, 2: 0 } };", "        stats: { 1: 0, 2: 0 }, anchors: { 1: [], 2: [] } };");
rep(`      else if (fr.length) {
        const p = fr[Math.floor((i * 7919 + Math.floor(u.id * 97)) % fr.length)];
        const back = u.kind === ARC ? 28 : 6;                          // archers stand a little behind the line
        u.hold = [p.x, p.y + (side === 1 ? back : -back)];
      }`, `      else if (G.anchors[side].length) {
        const an = G.anchors[side], p = an[i % an.length];
        const back = u.kind === ARC ? 30 : 10;                         // archers stand a little behind the line
        u.hold = [p.x + Math.sin(u.id * 77) * 18, p.y + (side === 1 ? back : -back) + Math.cos(u.id * 77) * 8];
      }`);
// 3. stronger territory tint and a bolder front line
rep("img.data[i * 4 + 3] = 46;", "img.data[i * 4 + 3] = 78;");
rep("  fg.strokeStyle = 'rgba(42,28,16,.9)'; fg.lineWidth = 3;", "  fg.strokeStyle = 'rgba(42,28,16,.95)'; fg.lineWidth = 4;");
// a mustering arrow shows a gathering ring at its tail
rep("  for (const a of G.arrows) drawArrow(a.pts, a.owner === 1 ? '#c0261b' : '#2f6fd6', a.owner === 1 ? 0.8 : 0.45, a.owner === 1 ? 11 : 8, t);",
    `  for (const a of G.arrows) {
    drawArrow(a.pts, a.owner === 1 ? '#c0261b' : '#2f6fd6', a.owner === 1 ? 0.8 : 0.45, a.owner === 1 ? 11 : 8, t);
    if (G.t < a.launch) {
      const [x, y] = a.pts[0], k = (a.launch - G.t) / GATHER;
      ctx.strokeStyle = a.owner === 1 ? 'rgba(192,38,27,.9)' : 'rgba(47,111,214,.8)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - k)); ctx.stroke();
      if (a.owner === 1) { ctx.font = '700 12px Alegreya Sans, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#2a1c10'; ctx.fillText('сбор', x, y - 36); }
    }
  }`);
rep("say(n ? 'В наступление! Идут ' + n + ' воинов' : 'Рядом нет свободных войск — подтянутся с фронта');", "say(n ? 'Сбор! ' + n + ' воинов ударят через 3 секунды' : 'Рядом нет свободных войск — подтянутся с фронта');");
fs.writeFileSync(__dirname + '/front.html', s);
console.log('ok');
