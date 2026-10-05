// Adds five look presets (palette, light, toon shading) and a switcher to scene.js / gen.js.
const fs = require('fs');
let s = fs.readFileSync('scene.v1.js', 'utf8');
function rep(a, b, all) { if (!s.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } s = all ? s.split(a).join(b) : s.replace(a, () => b); }
rep("const PAL = {", `const STYLES = {
  morning: { name: 'Утро', low: 0x8dbf5a, slope: 0x6e9e48, plateau: 0xa9c76a, rock: 0x9a8f84, rockDark: 0x6b625c, sand: 0xd9c48e, water: 0x4fa7c9, shallow: 0x8fd0de, trees: [0x3f7a33, 0x4e8a3a, 0x62a046], roof: 0xb4563a, sky: ['#bfe3f2', '#e8f4f8'], hemi: [0xcfe6f5, 0x7a6a4f, 0.55], sun: [0xfff1d6, 1.0], toon: false },
  pastel: { name: 'Пастель', low: 0xb5cf8e, slope: 0x9cba7c, plateau: 0xc8d9a2, rock: 0xb8b0a8, rockDark: 0x8f8a86, sand: 0xe6dcbc, water: 0x8cc4d8, shallow: 0xbfe3ea, trees: [0x6f9a6a, 0x80ab78, 0x93bc88], roof: 0xd09080, sky: ['#e6eef0', '#f6f4ee'], hemi: [0xf2f2ee, 0xa89c88, 0.8], sun: [0xffffff, 0.7], toon: false },
  toon: { name: 'Сочный мульт', low: 0x74c947, slope: 0x52a83a, plateau: 0x9fdc5c, rock: 0xa89a8a, rockDark: 0x7a6e64, sand: 0xf2d27a, water: 0x2fb2e6, shallow: 0x7fe0f2, trees: [0x2f8f3a, 0x3fa846, 0x58c454], roof: 0xe0552e, sky: ['#7fd0f5', '#d6f2ff'], hemi: [0xdff4ff, 0x80704f, 0.7], sun: [0xffffff, 0.9], toon: true },
  dusk: { name: 'Закат', low: 0xb2a24e, slope: 0x8f8a40, plateau: 0xc9b65e, rock: 0x9a7f6c, rockDark: 0x5e4a42, sand: 0xe0b87a, water: 0x4a7fa6, shallow: 0x86b2c8, trees: [0x3d5e2e, 0x4b6e34, 0x5f823c], roof: 0xa8452c, sky: ['#f0a86a', '#f8dcb0'], hemi: [0xffd2a0, 0x5a4434, 0.5], sun: [0xffb070, 1.15], toon: false },
  south: { name: 'Средиземноморье', low: 0xc2b866, slope: 0xa79f58, plateau: 0xd4c87c, rock: 0xd2c4ac, rockDark: 0xa8977c, sand: 0xeedcae, water: 0x2e9bb8, shallow: 0x7ccfd8, trees: [0x56703a, 0x657f42, 0x77904c], roof: 0xc8643a, sky: ['#a8d8f0', '#f4f0e0'], hemi: [0xf4f0e0, 0x9a8460, 0.65], sun: [0xfff4dc, 1.1], toon: false }
};
const STYLE_ID = STYLES[location.hash.slice(1)] ? location.hash.slice(1) : 'morning', ST = STYLES[STYLE_ID];
const PAL = {`);
rep("low: 0x8dbf5a, slope: 0x6e9e48, plateau: 0xa9c76a, rock: 0x9a8f84, rockDark: 0x6b625c, sand: 0xd9c48e, water: 0x4fa7c9, shallow: 0x8fd0de, red:", "low: ST.low, slope: ST.slope, plateau: ST.plateau, rock: ST.rock, rockDark: ST.rockDark, sand: ST.sand, water: ST.water, shallow: ST.shallow, red:");
rep("scene.add(new THREE.HemisphereLight(0xcfe6f5, 0x7a6a4f, 0.55));", "scene.add(new THREE.HemisphereLight(ST.hemi[0], ST.hemi[1], ST.hemi[2])); $('board').style.background = 'linear-gradient(' + ST.sky[0] + ',' + ST.sky[1] + ')'; scene.fog.color.set(ST.sky[1]);");
rep("const sun = new THREE.DirectionalLight(0xfff1d6, 1.0);", "const sun = new THREE.DirectionalLight(ST.sun[0], ST.sun[1]);");
rep("const mat = (c, extra) => new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, extra || {}));",
`const TOONG = (() => { const c = document.createElement('canvas'); c.width = 3; c.height = 1; const g = c.getContext('2d'); ['#7a7a7a', '#bdbdbd', '#ffffff'].forEach((col, i) => { g.fillStyle = col; g.fillRect(i, 0, 1, 1); }); const t = new THREE.CanvasTexture(c); t.minFilter = t.magFilter = THREE.NearestFilter; return t; })();
const mat = (c, extra) => ST.toon ? new THREE.MeshToonMaterial(Object.assign({ color: c, gradientMap: TOONG }, extra || {})) : new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, extra || {}));`);
rep("[[0.95, 1.4, 0.85, 0x3f7a33], [0.75, 1.15, 1.6, 0x4e8a3a], [0.5, 0.9, 2.25, 0x62a046]]", "[[0.95, 1.4, 0.85, ST.trees[0]], [0.75, 1.15, 1.6, ST.trees[1]], [0.5, 0.9, 2.25, ST.trees[2]]]");
rep("0xb4563a", "ST.roof", true);
rep("$('helpOk').addEventListener('click', () => { $('help').hidden = true; });", `$('helpOk').addEventListener('click', () => { $('help').hidden = true; });
$('styles').innerHTML = Object.entries(STYLES).map(([id, st]) => '<button type="button" data-s="' + id + '" class="' + (id === STYLE_ID ? 'on' : '') + '">' + st.name + '</button>').join('');
for (const b of $('styles').children) b.addEventListener('click', () => { location.hash = b.dataset.s; location.reload(); });
if (location.hash) $('help').hidden = true;`);
fs.writeFileSync('scene.js', s);
let g = fs.readFileSync('gen.js', 'utf8');
if (!g.includes('.styles {')) {
  g = g.replace("  .help p { margin: 0 0 8px; }", "  .help p { margin: 0 0 8px; }\n  .styles { position: absolute; left: 8px; right: 8px; bottom: 12px; display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; z-index: 4; }\n  .styles button { height: 36px; padding: 0 12px; border-radius: 18px; border: 1px solid #4a3d2c; background: rgba(30,25,19,.92); color: #efe6d2; font: 700 13px var(--body); cursor: pointer; }\n  .styles button.on { background: #d9a441; color: #1e1408; border-color: #d9a441; }");
  g = g.replace('  <div class="toast" id="toast" hidden></div>', '  <div class="styles" id="styles"></div>\n  <div class="toast" id="toast" hidden></div>');
  fs.writeFileSync('gen.js', g);
}
console.log('ok');
