const fs = require('fs');
let s = fs.readFileSync(__dirname + '/front.html', 'utf8');
function rep(a, b) { const n = s.split(a).length - 1; if (n !== 1) { console.error('MISS', n, a.slice(0, 100)); process.exit(1); } s = s.replace(a, b); }
// defenders fight better on their own land; a bridge under fire is a death trap
rep("      let dmg = k.dps * MULT[u.kind][foe.kind] * dt;",
    "      let dmg = k.dps * MULT[u.kind][foe.kind] * dt;\n      if (ownAt(u.x, u.y) === u.owner) dmg *= HOME_BONUS;                // holding your own land\n      if (foe.y > RIVER_Y0 - 4 && foe.y < RIVER_Y1 + 4) dmg *= BRIDGE_PENALTY;   // caught on the bridge");
rep("const CHARGE = 14, SPAWN_EVERY = 1.05,", "const HOME_BONUS = 1.25, BRIDGE_PENALTY = 1.5;\nconst CHARGE = 14, SPAWN_EVERY = 1.05,");
// bridges are strongpoints: extra anchors at each bridge head
rep("    G.anchors[side] = [...bins.values()].map(list => { list.sort((a, b) => a.y - b.y); return list[Math.floor(list.length / 2)]; }).sort((a, b) => a.x - b.x);",
    "    G.anchors[side] = [...bins.values()].map(list => { list.sort((a, b) => a.y - b.y); return list[Math.floor(list.length / 2)]; }).sort((a, b) => a.x - b.x);\n" +
    "    for (const [a, b] of BRIDGES) { const x = (a + b) / 2, y = side === 1 ? RIVER_Y1 + 26 : RIVER_Y0 - 26; if (ownAt(x, y) === side) G.anchors[side].push({ x, y }, { x: x - 14, y }, { x: x + 14, y }); }");
// bigger soldiers so the mass reads on a phone
rep("function drawUnit(u) {\n  const col", "function drawUnit(u) {\n  ctx.save(); ctx.translate(u.x, u.y); ctx.scale(1.5, 1.5); ctx.translate(-u.x, -u.y);\n  const col");
rep("  if (u.hp < u.max) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(x - 3, y + 4, 6, 1.4); ctx.fillStyle = '#6fd17a'; ctx.fillRect(x - 3, y + 4, 6 * Math.max(0, u.hp / u.max), 1.4); }\n}",
    "  if (u.hp < u.max) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(x - 3, y + 4, 6, 1.4); ctx.fillStyle = '#6fd17a'; ctx.fillRect(x - 3, y + 4, 6 * Math.max(0, u.hp / u.max), 1.4); }\n  ctx.restore();\n}");
// spread: a bit more room per soldier now that they are bigger
rep("    if (d > 0 && d < 6) { const p = (6 - d) * 0.25;", "    if (d > 0 && d < 8) { const p = (8 - d) * 0.25;");
rep("  for (const u of G.units) for (const e of near(u, 8)) {", "  for (const u of G.units) for (const e of near(u, 10)) {");
fs.writeFileSync(__dirname + '/front.html', s);
console.log('ok');
