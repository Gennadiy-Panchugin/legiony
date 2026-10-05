// Squads inside a grove are drawn in shade under the canopy (the health bar stays bright).
const fs = require('fs');
const edit = (file, fn) => { let t = fs.readFileSync(file, 'utf8'); const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', file, a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); }; fn(rep); fs.writeFileSync(file, t); };
edit('war.js', rep => {
  rep("const CAMP = { x: 450, y: 1400, rx: 160, ry: 72 }, TENTS = [[360, 1440], [540, 1440], [450, 1466]];\nconst OB = { x: 450, y: 464,",
      "const CAMP = { x: 450, y: 1400, rx: 160, ry: 72 }, TENTS = [[360, 1440], [540, 1440], [450, 1466]];\nconst FOREST = [[42, 1130, 46, 150], [862, 1150, 44, 150], [572, 1214, 48, 40], [298, 1248, 50, 40], [96, 540, 64, 40], [842, 566, 52, 42], [326, 864, 34, 22], [604, 864, 34, 22], [92, 240, 72, 96], [792, 220, 72, 104], [230, 150, 50, 40], [680, 140, 50, 40]];\nconst OB = { x: 450, y: 464,");
  rep("const inCamp = s =>", "const inForest = s => FOREST.some(([x, y, rx, ry]) => ((s.x - x) / (rx + 6)) ** 2 + ((s.y - y) / (ry + 6)) ** 2 < 1);\nconst inCamp = s =>");
  rep("  ctx.save(); if (s.inTent) ctx.globalAlpha = 0.7;", "  ctx.save(); if (s.inTent) ctx.globalAlpha = 0.7; const shade = inForest(s); if (shade) { ctx.filter = 'brightness(0.5) saturate(0.7)'; ctx.globalAlpha *= 0.9; }");
  rep("  const f = s.n / s.max; rr(ctx, s.x - 21,", "  if (shade) { ctx.filter = 'none'; ctx.globalAlpha = 1; }\n  const f = s.n / s.max; rr(ctx, s.x - 21,");
});
edit('tibur-gen.js', rep => {
  rep("const UPPER = [[770, 360], [740, 410], [700, 448], [690, 466]];", "const UPPER = [[770, 360], [740, 410], [700, 448], [690, 466]];\nconst FOREST = [[250, 1110, 70, 40], [50, 1340, 50, 90], [620, 1100, 70, 34]];");
  rep("  grove(g, 250, 1110, 70, 40, 6, 5); grove(g, 50, 1340, 50, 90, 7, 8); grove(g, 620, 1100, 70, 34, 5, 4);", "  FOREST.forEach(([x, y, rx, ry], i) => grove(g, x, y, rx, ry, [6, 7, 5][i], [5, 8, 4][i]));");
});
console.log('ok');
