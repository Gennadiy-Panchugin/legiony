const fs = require('fs'); let t = fs.readFileSync('extras.js', 'utf8');
function rep(a, b) { if (!t.includes(a)) { console.error('MISS', a.slice(0, 70)); process.exit(1); } t = t.replace(a, () => b); }
rep("const lx = x - Math.cos(ang) * 46, ly = y - Math.sin(ang) * 46 + 30; const tw = g.measureText(label).width + 12;", "const tw = g.measureText(label).width + 12, cy0 = y - Math.sin(ang) * 46, lx = Math.max(tw / 2 + 4, Math.min(336 - tw / 2, x - Math.cos(ang) * 46)), ly = cy0 + 30 > 410 ? cy0 - 26 : cy0 + 30;");
rep("waveIn(g, 170, 150, Math.PI / 2, 'гладиаторы'); waveIn(g, 312, 250, Math.PI, 'львы · 5 с');", "waveIn(g, 170, 182, Math.PI / 2, 'гладиаторы'); waveIn(g, 262, 256, Math.PI, 'львы · 5 с');");
rep("lion(g, 262, 254, 0.9);", "lion(g, 226, 214, 0.8);");
rep("meter(g, 170, 82, 200, 0.7, 'Милость толпы 70%');", "meter(g, 170, 76, 200, 0.7, 'Милость толпы 70%');");
rep("waveIn(g, 26, 250, 0, 'с запада'); waveIn(g, 316, 250, Math.PI, 'с востока'); waveIn(g, 170, 404, -Math.PI / 2, 'с юга · 8 с');", "waveIn(g, 70, 250, 0, 'с запада'); waveIn(g, 272, 250, Math.PI, 'с востока'); waveIn(g, 170, 350, -Math.PI / 2, 'с юга · 8 с');");
rep("rebels(g, 40, 240, 3, 0.8); rebels(g, 300, 236, 3, 0.8);", "rebels(g, 40, 300, 3, 0.75); rebels(g, 300, 300, 3, 0.75);");
rep("g.fillStyle = 'rgba(255,190,80,.22)'; g.fillRect(0, 0, w, h);", "g.fillStyle = 'rgba(255,170,40,.34)'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(200,170,60,.25)'; g.globalCompositeOperation = 'color'; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over';");
rep("g.strokeStyle = 'rgba(255,240,200,.55)'; g.lineWidth = 2;", "g.strokeStyle = 'rgba(255,248,220,.7)'; g.lineWidth = 2.4;");
rep("'броня утомляет · отдых у воды и в тени'", "'броня тяжелеет · отдых в тени'");
fs.writeFileSync('extras.js', t); console.log('ok');
