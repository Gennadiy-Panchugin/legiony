// Adds "Bad North" and "Northgard" looks; Northgard also shows territories with borders.
const fs = require('fs');
let s = fs.readFileSync('scene.js', 'utf8');
function rep(a, b) { if (!s.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } s = s.replace(a, () => b); }
rep("  morning: { name: 'Утро',", `  badnorth: { name: 'Bad North', low: 0x9fbf7a, slope: 0x8aa86c, plateau: 0xb3cc8c, rock: 0xb4b2ac, rockDark: 0x8e8c88, sand: 0xe4dcc4, water: 0x9fc8d4, shallow: 0xd2e8ec, trees: [0x56795a, 0x668a68, 0x789c76], roof: 0x8a5a4a, sky: ['#f4f5f2', '#e9ecea'], hemi: [0xffffff, 0xb8b4a8, 0.9], sun: [0xffffff, 0.55], toon: false, fogNear: 70 },
  northgard: { name: 'Northgard', low: 0x6f9a4a, slope: 0x587e3c, plateau: 0x86ad58, rock: 0x7d7f84, rockDark: 0x55565c, sand: 0xc8b07a, water: 0x2f6f96, shallow: 0x5f9ec0, trees: [0x2c5a34, 0x386a3c, 0x4a7e46], roof: 0x6b4a3a, sky: ['#9fb8c8', '#dfe6e6'], hemi: [0xd8e4f0, 0x5a4a3a, 0.6], sun: [0xfff0d8, 1.05], toon: false, territory: true },
  morning: { name: 'Утро',`);
rep("scene.fog.color.set(ST.sky[1]);", "scene.fog.color.set(ST.sky[1]); if (ST.fogNear) { scene.fog.near = ST.fogNear; scene.fog.far = 170; }");
// territories: nearest centre over walkable land, a light tint and a bold dashed border per region
rep("function select(q) {", `const ZONES = [{ x: 240, y: 640, c: [200, 40, 30], name: 'Лагерь' }, { x: 240, y: 505, c: [210, 200, 170], name: 'Брод' }, { x: 100, y: 370, c: [47, 111, 214], name: 'Башня' },
  { x: 395, y: 370, c: [47, 111, 214], name: 'Амбар' }, { x: 240, y: 340, c: [47, 111, 214], name: 'Перевал' }, { x: 240, y: 235, c: [47, 111, 214], name: 'Форт' }];
const ZID = new Int8Array(GW * GH).fill(-1);
for (let c = 0; c < GW * GH; c++) { if (!spec.mask(cx_(c), cy_(c))) continue; let b = -1, bd = 1e9; ZONES.forEach((z, i) => { const d = Math.hypot(cx_(c) - z.x, (cy_(c) - z.y) * 1.15); if (d < bd) { bd = d; b = i; } }); ZID[c] = b; }
function paintTerritory() {
  const g = overlayCanvas.getContext('2d'), C = 4; g.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  for (let c = 0; c < GW * GH; c++) { const z = ZID[c]; if (z < 0) continue; const [r, gg, b] = ZONES[z].c; g.fillStyle = 'rgba(' + r + ',' + gg + ',' + b + ',0.13)'; g.fillRect((c % GW) * C, (c / GW | 0) * C, C, C); }
  g.lineCap = 'round';
  for (const [w, col, dash] of [[5, 'rgba(20,24,30,0.35)', []], [2.6, null, [7, 5]]]) {
    g.lineWidth = w; g.setLineDash(dash);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const c = j * GW + i, a = ZID[c]; if (a < 0) continue;
      for (const [n, x1, y1, x2, y2] of [[i < GW - 1 ? c + 1 : -1, (i + 1) * C, j * C, (i + 1) * C, (j + 1) * C], [j < GH - 1 ? c + GW : -1, i * C, (j + 1) * C, (i + 1) * C, (j + 1) * C]]) {
        if (n < 0 || ZID[n] < 0 || ZID[n] === a) continue; const [r, gg, b] = ZONES[a].c;
        g.strokeStyle = col || 'rgba(' + Math.min(255, r + 60) + ',' + Math.min(255, gg + 60) + ',' + Math.min(255, b + 60) + ',0.95)'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); } } }
  g.setLineDash([]); overlayTex.needsUpdate = true; overlayMesh.visible = true;
}
function select(q) {`);
rep("  if (SEL) { SEL.ring.visible = true; paintOverlay(SEL); }", "  if (SEL) { SEL.ring.visible = true; paintOverlay(SEL); } else if (ST.territory) paintTerritory();");
rep("if (location.hash) $('help').hidden = true;", "if (location.hash) $('help').hidden = true;\nif (ST.territory) paintTerritory();");
fs.writeFileSync('scene.js', s);
console.log('ok');
