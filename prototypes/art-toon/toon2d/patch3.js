// Groves instead of lone trees (a shared helper), a wading squad that is not drowned, a forest row on the terrain sheet, groves on the battle map.
const fs = require('fs'), path = require('path');
// 1. the shared art helpers get a grove
let gen = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
if (!gen.includes('function grove(')) {
  gen = gen.replace("function tree(g, x, y, s) {", String.raw`// a grove: a mossy undergrowth mat, bushes on the rim and many trees of different size and shade
function grove(g, x, y, rx, ry, n, seed) {
  const r = rng(seed);
  blob(g, x + 6, y + 10, rx + 6, ry + 6, seed, 12); g.fillStyle = 'rgba(20,60,15,.35)'; g.fill();
  blob(g, x, y, rx, ry, seed + 1, 12); fo(g, '#3e9a3a', 2.6);
  const pts = [];
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.82; pts.push([x + Math.cos(a) * rx * d, y + Math.sin(a) * ry * d + 8, 0.62 + r() * 0.5, r()]); }
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + r(), bx = x + Math.cos(a) * rx * 0.95, by = y + Math.sin(a) * ry * 0.95; if (by < y - ry * 0.3) continue; blob(g, bx, by, 13, 9, i + seed, 8); fo(g, '#4fb84a', 2.2); g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(bx - 3, by - 3, 4, 2, -0.4, 0, 7); g.fill(); }
  pts.sort((a, b) => a[1] - b[1]).forEach(([px, py, k, sh]) => tree(g, px, py, k, sh));
}
function tree(g, x, y, s, shade) {`);
  gen = gen.replace("blob(g, x, y - 30 * s, 22 * s, 20 * s, x, 9); fo(g, '#2f9a3c', 2.6);\n  blob(g, x - 5 * s, y - 36 * s, 13 * s, 11 * s, y, 8); g.fillStyle = '#4fbf4a'; g.fill();",
    "const sh = shade === undefined ? 0.5 : shade, crown = sh < 0.33 ? ['#2a8a36', '#46b046'] : sh < 0.66 ? ['#2f9a3c', '#4fbf4a'] : ['#3aa83e', '#62cc52'];\n  blob(g, x, y - 30 * s, 22 * s, 20 * s, x, 9); fo(g, crown[0], 2.6);\n  blob(g, x - 5 * s, y - 36 * s, 13 * s, 11 * s, y, 8); g.fillStyle = crown[1]; g.fill();");
  fs.writeFileSync(path.join(__dirname, 'gen.js'), gen);
}
// 2. the terrain sheet: groves, a wading squad that stands in the water, a forest row
let t = fs.readFileSync(path.join(__dirname, 'terrain.js'), 'utf8');
function rep(a, b) { if (!t.includes(a)) { console.error('MISS', a.slice(0, 70)); process.exit(1); } t = t.replace(a, () => b); }
rep("  tree(g, 300, 120, 0.9); tree(g, 40, 320, 0.95);", "  grove(g, 300, 96, 56, 40, 9, 4); grove(g, 50, 330, 60, 44, 10, 8);");
rep("  g.save(); g.beginPath(); g.rect(0, 0, 340, 226); g.clip(); squad(g, 150, 250, 'hastati', 1, 4, 1, '#e2382c', 'vex'); g.restore();\n  g.strokeStyle = 'rgba(200,230,150,.9)'; g.lineWidth = 3; for (const x of [122, 150, 178]) { g.beginPath(); g.ellipse(x, 226, 14, 4, 0, 0, 7); g.stroke(); }",
    "  g.save(); g.beginPath(); g.rect(0, 0, 340, 234); g.clip(); squad(g, 150, 240, 'hastati', 1, 4, 1, '#e2382c', 'vex'); g.restore();\n  g.strokeStyle = 'rgba(220,240,180,.95)'; g.lineWidth = 3; for (const [x, y] of [[140, 236], [162, 236], [130, 228], [172, 228]]) { g.beginPath(); g.ellipse(x, y, 13, 4, 0, 0, 7); g.stroke(); }\n  g.strokeStyle = 'rgba(220,240,180,.6)'; g.lineWidth = 2; g.beginPath(); g.ellipse(150, 236, 44, 10, 0, 0, 7); g.stroke();");
rep("['Лес', '#4fbf4a', () => { tree(g, 652, 92, 0.9); }]", "['Лес', '#4fbf4a', () => { for (const [x, y, k, s] of [[640, 82, 0.6, 0.2], [668, 86, 0.66, 0.8], [652, 104, 0.72, 0.5]]) tree(g, x, y, k, s); }]");
rep("// ---------------------------------------------------------------- legend badges", String.raw`// ---------------------------------------------------------------- 4. forest: groves, and a squad hiding in one
{ const { g } = panel('fo1'); path(g, [[170, 420], [170, 0]], 30); grove(g, 74, 140, 74, 56, 13, 2); grove(g, 268, 250, 70, 54, 12, 6); grove(g, 90, 340, 60, 40, 8, 9); plate(g, 170, 405, 'Лес', '', '#7ee05a'); }
{ const { g } = panel('fo2'); grove(g, 170, 200, 130, 92, 22, 11);
  g.save(); g.globalAlpha = 0.6; squad(g, 160, 236, 'velites', 1, 4, 1, '#2fa04e', 'pennant'); g.restore();
  for (const [x, y, k, s] of [[110, 262, 0.7, 0.3], [212, 268, 0.75, 0.7], [160, 284, 0.68, 0.5]]) tree(g, x, y, k, s);
  plate(g, 170, 96, '🌲 Укрытие', 'стрелы −20%, враг не видит издалека', '#7ee05a'); }
// ---------------------------------------------------------------- legend badges`);
rep('  <h2>Значки местности</h2>', `  <h2>Лес</h2>
  <p>Рощи из десятков деревьев на общем подлеске, с кустами по краю. Проходим, но <b>прячет отряд</b>: стрелы бьют слабее, враг не видит издалека.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="fo1" width="680" height="840" aria-label="Рощи"></canvas></div><figcaption><b>Рощи на карте</b>Густые, разной формы, с тропой между ними.</figcaption></figure>
    <figure><div class="pic"><canvas id="fo2" width="680" height="840" aria-label="Отряд в лесу"></canvas></div><figcaption><b>Отряд в роще</b>Полупрозрачен, передние деревья перекрывают его.</figcaption></figure>
  </div>
  <h2>Значки местности</h2>`);
rep('<figcaption><b>Отряд вброд</b>Ноги скрыты водой, круги вокруг, плашка «скорость −50%».</figcaption>', '<figcaption><b>Отряд вброд</b>По щиколотку в воде, круги вокруг ног, плашка «скорость −50%».</figcaption>');
fs.writeFileSync(path.join(__dirname, 'terrain.js'), t);
console.log('ok');
