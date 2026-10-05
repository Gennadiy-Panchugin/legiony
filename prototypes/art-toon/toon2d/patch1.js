// Ramps down from the left ridge and an engineers' bridge being built across the river.
const fs = require('fs');
let s = fs.readFileSync('gen.js', 'utf8');
function rep(a, b) { if (!s.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } s = s.replace(a, () => b); }
rep("function stone(g, x, y, s) {", String.raw`// a ramp cut through the cliff: a sandy slope with steps, outlined
function ramp(g, x, yTop, w, len) {
  g.beginPath(); g.moveTo(x - w / 2, yTop - 6); g.lineTo(x + w / 2, yTop - 6); g.lineTo(x + w / 2 + 8, yTop + len); g.lineTo(x - w / 2 - 8, yTop + len); g.closePath();
  const rg = g.createLinearGradient(0, yTop, 0, yTop + len); rg.addColorStop(0, '#f2d690'); rg.addColorStop(1, '#d9b46c'); fo(g, rg, 2.6);
  g.strokeStyle = 'rgba(120,80,30,.55)'; g.lineWidth = 2; for (let k = 1; k < 5; k++) { const t = k / 5, yy = yTop - 6 + (len + 6) * t, hw = w / 2 + 8 * t; g.beginPath(); g.moveTo(x - hw + 3, yy); g.lineTo(x + hw - 3, yy); g.stroke(); }
  g.fillStyle = '#b0794a'; g.beginPath(); g.moveTo(x - w / 2 - 8, yTop + len); g.lineTo(x - w / 2, yTop - 6); g.lineTo(x - w / 2 - 6, yTop - 6); g.lineTo(x - w / 2 - 14, yTop + len); g.closePath(); g.fill();
}
// the bridge the engineers are building: posts across the river, planks laid from the south bank, scaffold and a progress plate
function bridgeSite(g, x, prog) {
  const y0 = 532, y1 = 626, w = 34;
  g.save(); g.setLineDash([8, 6]); rr(g, x - w / 2, y0, w, y1 - y0, 6); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 3; g.stroke(); g.restore();
  for (const yy of [y0 + 14, y0 + 44, y0 + 74]) for (const dx of [-w / 2 + 3, w / 2 - 3]) { rr(g, x + dx - 3, yy - 4, 6, 22, 2); fo(g, '#7a4a26', 2); }
  const laid = y1 - (y1 - y0) * prog;
  for (let yy = y1 - 8; yy > laid; yy -= 9) { rr(g, x - w / 2 - 3, yy, w + 6, 8, 2); fo(g, '#c48a4a', 2); }
  g.strokeStyle = OL; g.lineWidth = 5; g.beginPath(); g.moveTo(x - w / 2 - 6, laid + 4); g.lineTo(x - w / 2 - 6, y1); g.moveTo(x + w / 2 + 6, laid + 4); g.lineTo(x + w / 2 + 6, y1); g.stroke(); g.strokeStyle = '#a0703c'; g.lineWidth = 2.6; g.stroke();
  for (let k = 0; k < 3; k++) { rr(g, x + 26 + k * 5, y1 + 8 - k * 7, 30, 7, 2); fo(g, '#c48a4a', 2); }
  // the plate: what is being built and how far
  rr(g, x - 50, y0 - 44, 100, 34, 12); g.fillStyle = 'rgba(40,24,14,.92)'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#f2c14a'; g.stroke();
  g.fillStyle = '#ffe6a8'; g.font = '900 14px "Lilita One", "Alegreya Sans", sans-serif'; g.textAlign = 'center'; g.fillText('🔨 Мост', x, y0 - 28);
  rr(g, x - 38, y0 - 22, 76, 7, 3.5); g.fillStyle = '#3a2414'; g.fill(); rr(g, x - 38, y0 - 22, 76 * prog, 7, 3.5); g.fillStyle = '#ffcc33'; g.fill();
}
function stone(g, x, y, s) {`);
// ramps on the left ridge: two down to the river bank, one to the valley
rep("  g.save(); g.beginPath(); g.moveTo(206, 294); g.lineTo(206, 300); g.lineTo(0, 296); g.closePath(); g.restore();", "  ramp(g, 50, 470, 34, 44); ramp(g, 132, 474, 34, 40);\n  g.save(); g.translate(168, 402); g.rotate(-Math.PI / 2); ramp(g, 0, 0, 32, 34); g.restore();");
rep("for (const [x, y, sc] of [[30, 520, 1], [70, 506, 1.1], [120, 520, 0.9],", "for (const [x, y, sc] of [[14, 520, 0.9], [176, 520, 0.8],");
rep("  for (const [x, y] of [[250, 566], [276, 584], [262, 602], [288, 560]]) stone(g, x, y, 1.1);", "  for (const [x, y] of [[250, 566], [276, 584], [262, 602], [288, 560]]) stone(g, x, y, 1.1);\n  path(g, [[50, 512], [70, 526], [92, 530]], 22); path(g, [[132, 516], [112, 526], [92, 530]], 22);\n  path(g, [[92, 632], [100, 700], [170, 790], [230, 840]], 24);\n  bridgeSite(g, 92, 0.45);");
rep("  squad(g, 250, 866, 'eng', 1, 3, 1, '#f09a24', 'square');", "  squad(g, 92, 668, 'eng', 1, 3, 1, '#f09a24', 'square');\n  for (const [x, y] of [[74, 640], [110, 642]]) { g.fillStyle = '#ffe6a8'; g.font = '900 16px sans-serif'; g.textAlign = 'center'; g.fillText('✦', x, y); }");
rep("<li><b>Точки захвата</b>", "<li><b>Левый хребет:</b> два спуска к реке и один в долину. Инженеры Луция строят мост под ним: настил уложен почти наполовину, плашка показывает прогресс. Когда мост готов, к башне можно зайти с фланга, минуя брод.</li>\n      <li><b>Точки захвата</b>");
fs.writeFileSync('gen.js', s);
console.log('ok');
