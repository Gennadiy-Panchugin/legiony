// Colosseum, rebellion and campaign biomes on the extras sheet.
const fs = require('fs'), path = require('path');
let t = fs.readFileSync(path.join(__dirname, 'extras.js'), 'utf8');
function rep(a, b) { if (!t.includes(a)) { console.error('MISS', a.slice(0, 70)); process.exit(1); } t = t.replace(a, () => b); }
// rebels get their own colour (side 3)
rep("const helpers = js.slice(0, js.indexOf('function drawWorld(g) {'));", "const helpers = js.slice(0, js.indexOf('function drawWorld(g) {')).replace(\"const team = side === 1 ? '#e2382c' : '#3f7ae0', dark = side === 1 ? '#a8241c' : '#2a56b0';\", \"const team = side === 1 ? '#e2382c' : side === 3 ? '#c8822c' : '#3f7ae0', dark = side === 1 ? '#a8241c' : side === 3 ? '#8a5418' : '#2a56b0';\");");
rep("// ---------------------------------------------------------------- weather\n", String.raw`// ---------------------------------------------------------------- the arena
function arena(g, cx, cy, rx, ry, r) {
  g.beginPath(); g.ellipse(cx, cy + 10, rx + 40, ry + 34, 0, 0, 7); fo(g, '#cfc3ac', 3);
  for (let row = 0; row < 3; row++) { const k = 1 - row * 0.1; g.beginPath(); g.ellipse(cx, cy + 6, (rx + 34) * k, (ry + 28) * k, 0, 0, 7); g.strokeStyle = 'rgba(120,100,80,.6)'; g.lineWidth = 2; g.stroke(); }
  const cols = ['#e2382c', '#3f7ae0', '#f2c14a', '#7ee05a', '#f4e2bc', '#b06ad8', '#ff8a3c'];
  for (let i = 0; i < 160; i++) { const a = r() * Math.PI * 2, d = 0.78 + r() * 0.2, x = cx + Math.cos(a) * (rx + 34) * d, y = cy + 6 + Math.sin(a) * (ry + 28) * d; g.beginPath(); g.arc(x, y, 3.4, 0, 7); g.fillStyle = cols[i % cols.length]; g.fill(); g.beginPath(); g.arc(x, y - 4, 2.6, 0, 7); g.fillStyle = '#ffd2a6'; g.fill(); }
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); const sg = g.createRadialGradient(cx, cy - ry * 0.3, 10, cx, cy, rx); sg.addColorStop(0, '#f6e2a6'); sg.addColorStop(1, '#d8b870'); fo(g, sg, 3);
  rr(g, cx - 36, cy - ry - 46, 72, 26, 6); fo(g, '#efe6d2', 2.6); g.beginPath(); g.moveTo(cx - 42, cy - ry - 46); g.quadraticCurveTo(cx, cy - ry - 64, cx + 42, cy - ry - 46); g.closePath(); fo(g, '#a8241c', 2.4);
  chibi(g, cx, cy - ry - 22, 'eques', 1, 0.45, 1);
  for (const sx of [-1, 1]) { rr(g, cx + sx * (rx + 12) - 12, cy - 18, 24, 36, 8); fo(g, '#5a3a20', 2.4); }
}
function lion(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(0, 4, 26, 6, 0, 0, 7); g.fill(); for (const lx of [-14, -6, 8, 15]) { rr(g, lx - 3, -12, 6, 14, 3); fo(g, '#d8962c', 2); }
  g.beginPath(); g.ellipse(0, -16, 22, 11, 0, 0, 7); fo(g, '#f0b04a', 2.6); g.beginPath(); g.moveTo(-20, -18); g.quadraticCurveTo(-34, -24, -30, -36); g.strokeStyle = OL; g.lineWidth = 4; g.stroke(); g.strokeStyle = '#f0b04a'; g.lineWidth = 2; g.stroke();
  blob(g, 18, -28, 16, 15, 3, 10); fo(g, '#a8601c', 2.6); g.beginPath(); g.arc(20, -28, 9, 0, 7); fo(g, '#f0b04a', 2.2); g.fillStyle = OL; g.beginPath(); g.arc(23, -30, 1.6, 0, 7); g.arc(17, -30, 1.6, 0, 7); g.fill(); g.restore(); }
function meter(g, x, y, w, p, label) { rr(g, x - w / 2, y, w, 20, 10); g.fillStyle = OL; g.fill(); rr(g, x - w / 2 + 3, y + 3, (w - 6) * p, 14, 7); const mg = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); mg.addColorStop(0, '#ff5a4a'); mg.addColorStop(0.5, '#ffcc33'); mg.addColorStop(1, '#7ee05a'); g.fillStyle = mg; g.fill(); g.font = '900 13px "Lilita One", sans-serif'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(label, x, y + 15); }
// ---------------------------------------------------------------- rebellion
function rebels(g, x, y, n, s) { const pos = [[-18, -6], [16, -8], [0, 6], [-26, 12], [26, 10]].slice(0, n).sort((a, b) => a[1] - b[1]); for (const [dx, dy] of pos) { chibi(g, x + dx * s, y + dy * s, 'rebel', 3, 0.6 * s, dx < 0 ? 1 : -1);
  g.strokeStyle = OL; g.lineWidth = 4; g.beginPath(); g.moveTo(x + dx * s + 9, y + dy * s - 2); g.lineTo(x + dx * s + 13, y + dy * s - 44 * s); g.stroke(); g.strokeStyle = '#a0703c'; g.lineWidth = 2; g.stroke();
  if (dx % 2) { flame(g, x + dx * s + 13, y + dy * s - 42 * s, 0.45); } else { g.strokeStyle = '#b4bcc4'; g.lineWidth = 2; for (const fx of [-3, 0, 3]) { g.beginPath(); g.moveTo(x + dx * s + 13 + fx, y + dy * s - 44 * s); g.lineTo(x + dx * s + 13 + fx, y + dy * s - 52 * s); g.stroke(); } } } }
function cart(g, x, y, flip) { g.save(); g.translate(x, y); if (flip) g.scale(-1, 1); rr(g, -26, -22, 52, 18, 3); fo(g, '#9a6a3c', 2.4); for (const wx of [-16, 16]) { g.beginPath(); g.arc(wx, -2, 9, 0, 7); fo(g, '#6a4020', 2.2); g.beginPath(); g.arc(wx, -2, 2.5, 0, 7); g.fillStyle = OL; g.fill(); } g.beginPath(); g.moveTo(26, -14); g.lineTo(44, -4); g.strokeStyle = OL; g.lineWidth = 4; g.stroke(); g.restore(); }
function burningHouse(g, x, y) { house(g, x, y); g.fillStyle = 'rgba(40,20,10,.35)'; g.fillRect(x - 24, y - 30, 48, 32); smoke(g, x + 6, y - 66, 0.8); for (const [dx, dy, s] of [[-12, -40, 0.7], [8, -46, 0.85], [20, -30, 0.6]]) flame(g, x + dx, y + dy, s); }
// ---------------------------------------------------------------- campaign biomes
function biome(id, base, draw) { const c = document.getElementById(id), g = c.getContext('2d'); g.scale(2, 2); const r = rng(id.length * 13 + base.length); grass(g, 0, 0, 340, 240, base, r); draw(g, r); }
function olive(g, x, y) { g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 4, y + 2, 18, 5, 0, 0, 7); g.fill(); rr(g, x - 3, y - 14, 6, 16, 2); fo(g, '#8a6a4a', 2); blob(g, x, y - 24, 18, 12, x, 9); fo(g, '#8a9a5a', 2.4); g.fillStyle = '#a8b878'; blob(g, x - 4, y - 28, 9, 5, y, 7); g.fill(); }
function column(g, x, y, h) { rr(g, x - 7, y - h, 14, h, 2); fo(g, '#f4efe2', 2.2); rr(g, x - 10, y - h - 6, 20, 7, 2); fo(g, '#f4efe2', 2); g.strokeStyle = 'rgba(120,110,90,.5)'; g.lineWidth = 1.2; for (const dx of [-3, 0, 3]) { g.beginPath(); g.moveTo(x + dx, y - h + 2); g.lineTo(x + dx, y - 2); g.stroke(); } }
function heather(g, x, y) { for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#b06ad8' : '#8a4ab8'; g.beginPath(); g.arc(x + (k - 3) * 5, y - (k % 3) * 3, 4, 0, 7); g.fill(); } }
// ---------------------------------------------------------------- weather
`);
rep("const WEATHER = [", String.raw`// the Colosseum: a fight in the sand, the crowd's favour
{ const { g, r } = pnl('ar1', 340, 420, 61); arena(g, 170, 230, 120, 82, r); squad(g, 120, 236, 'hastati', 1, 3, 0.85, '#e2382c', 'vex'); lion(g, 220, 250, 1.1); squad(g, 210, 204, 'e_inf', 2, 2, 0.8, '#3f7ae0', 'vex');
  plate(g, 170, 404, '🏟 Колизей', 'гладиаторы, звери, толпа', '#f2c14a'); }
{ const { g, r } = pnl('ar2', 340, 420, 67); arena(g, 170, 240, 120, 82, r); squad(g, 150, 250, 'hastati', 1, 3, 0.85, '#e2382c', 'vex'); squad(g, 210, 230, 'e_inf', 2, 2, 0.8, '#3f7ae0', 'vex');
  for (const [x, y] of [[60, 150], [280, 160], [90, 320], [260, 330]]) { g.font = '900 18px sans-serif'; g.textAlign = 'center'; g.fillText('👏', x, y); }
  rr(g, 40, 40, 260, 56, 16); g.fillStyle = 'rgba(40,24,14,.94)'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = '#f2c14a'; g.stroke(); g.fillStyle = '#ffe6a8'; g.font = '900 15px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText('Милость толпы', 170, 60); meter(g, 170, 68, 220, 0.7, '70%');
  plate(g, 170, 404, '👍 Зрелище', 'эффектный бой — бонусы от толпы', '#f2c14a'); }
// the rebellion: a burning province, then the suppression
{ const { g } = pnl('rv1', 340, 420, 71); path(g, [[0, 300], [170, 260], [340, 300]], 30); burningHouse(g, 90, 200); burningHouse(g, 230, 170); house(g, 280, 280); burningHouse(g, 150, 330);
  rebels(g, 200, 260, 5, 1); plate(g, 170, 404, '🔥 Восстание', 'провинция горит · доход стоит', '#ff8a2a'); }
{ const { g } = pnl('rv2', 340, 420, 77); path(g, [[170, 420], [170, 0]], 34); cart(g, 130, 200, false); cart(g, 210, 196, true); for (let k = -50; k <= 50; k += 14) { if (Math.abs(k) < 8) continue; g.beginPath(); g.moveTo(170 + k - 3, 214); g.lineTo(170 + k, 194); g.lineTo(170 + k + 3, 214); g.closePath(); fo(g, '#b0783e', 2); }
  rebels(g, 170, 150, 5, 1); squad(g, 160, 320, 'hastati', 1, 5, 1, '#e2382c', 'vex'); squad(g, 260, 340, 'velites', 1, 3, 0.95, '#2fa04e', 'pennant');
  plate(g, 170, 50, 'Подавить мятеж', 'очаги: 1 из 3', '#ff8a2a'); bar(g, 170, 58, 150, 0.33); }
// campaign biomes
biome('bi1', '#76c64a', (g, r) => { grove(g, 80, 120, 70, 44, 9, 2); grove(g, 270, 170, 60, 40, 8, 5); house(g, 200, 110); path(g, [[0, 200], [340, 180]], 24); });
biome('bi2', '#4f9a3c', (g, r) => { grove(g, 80, 110, 90, 70, 16, 3); grove(g, 260, 130, 90, 80, 16, 6); grove(g, 170, 220, 110, 30, 10, 9); fog(g, 340, 240, r); });
biome('bi3', '#c8b56a', (g, r) => { for (const [x, y] of [[60, 120], [120, 180], [250, 100], [300, 190], [200, 150]]) olive(g, x, y); for (const [x, y, s] of [[160, 90, 1], [280, 150, 0.8], [40, 200, 0.9]]) rock(g, x, y, s); path(g, [[0, 220], [340, 200]], 22); });
biome('bi4', '#8aa86a', (g, r) => { for (const [x, y] of [[50, 90], [120, 150], [240, 110], [290, 190], [180, 210], [60, 200]]) heather(g, x, y); for (const [x, y, s] of [[200, 70, 1], [100, 120, 0.8]]) rock(g, x, y, s); fog(g, 340, 240, r); });
biome('bi5', '#a8c272', (g, r) => { sea(g, 220, 0, 120, 240, r); beach(g, [[200, 0], [230, 0], [250, 240], [214, 240]], r); for (const [x, y] of [[50, 110], [110, 180]]) olive(g, x, y); for (const [x, h] of [[120, 52], [146, 40], [172, 52]]) column(g, x, 120, h); rr(g, 108, 128, 76, 8, 3); fo(g, '#f4efe2', 2); });
biome('bi6', '#d4c070', (g, r) => { const rg = g.createLinearGradient(0, 120, 0, 170); rg.addColorStop(0, '#5fd0f5'); rg.addColorStop(1, '#2a9fd8'); g.beginPath(); g.moveTo(0, 116); g.quadraticCurveTo(170, 90, 340, 130); g.lineTo(340, 178); g.quadraticCurveTo(170, 150, 0, 172); g.closePath(); fo(g, rg, 2.8); grove(g, 280, 210, 50, 22, 6, 4); for (let i = 0; i < 40; i++) { const x = r() * 340, y = 190 + r() * 50; g.strokeStyle = 'rgba(140,110,40,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 9); g.stroke(); } house(g, 90, 80); });
const WEATHER = [`);
rep("  <h2>Вылазки и погода</h2>", `  <h2>Колизей</h2>
  <p>Арена с песком, трибуны с толпой и ложа императора. Бои гладиаторов и зверей. Идея механики: <b>милость толпы</b> — эффектные приёмы её поднимают, толпа даёт бонусы.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="ar1" width="680" height="840" aria-label="Колизей"></canvas></div><figcaption><b>Бой на арене</b>Гастаты против гладиаторов и льва.</figcaption></figure>
    <figure><div class="pic"><canvas id="ar2" width="680" height="840" aria-label="Милость толпы"></canvas></div><figcaption><b>Милость толпы</b>Шкала над ареной, аплодисменты трибун.</figcaption></figure>
  </div>
  <h2>Восстание</h2>
  <p>Мятеж в провинции: горят дома, бунтари с вилами и факелами (оранжевые — отдельная сторона). Подавить — погасить очаги и разбить баррикаду из телег.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="rv1" width="680" height="840" aria-label="Восстание"></canvas></div><figcaption><b>Провинция горит</b>Пока восстание идёт, доход провинции стоит.</figcaption></figure>
    <figure><div class="pic"><canvas id="rv2" width="680" height="840" aria-label="Подавление"></canvas></div><figcaption><b>Подавление</b>Баррикада из телег, счётчик очагов.</figcaption></figure>
  </div>
  <h2>Земли кампаний</h2>
  <p>Каждая кампания — свой облик поля боя: цвет травы, деревья, особая местность.</p>
  <div class="row">
    <figure><div class="pic"><canvas id="bi1" width="680" height="480" aria-label="Италия и Галлия"></canvas></div><figcaption><b>Италия · Галлия</b>Сочные луга, рощи, деревни.</figcaption></figure>
    <figure><div class="pic"><canvas id="bi2" width="680" height="480" aria-label="Германия"></canvas></div><figcaption><b>Германия</b>Тёмный густой лес и туман — Тевтобург.</figcaption></figure>
    <figure><div class="pic"><canvas id="bi3" width="680" height="480" aria-label="Иберия"></canvas></div><figcaption><b>Иберия</b>Сухие холмы, оливы, камни.</figcaption></figure>
    <figure><div class="pic"><canvas id="bi4" width="680" height="480" aria-label="Британия"></canvas></div><figcaption><b>Британия</b>Вересковые пустоши, валуны, вечная дымка.</figcaption></figure>
    <figure><div class="pic"><canvas id="bi5" width="680" height="480" aria-label="Греция"></canvas></div><figcaption><b>Греция</b>Оливы, белые колонны, море рядом.</figcaption></figure>
    <figure><div class="pic"><canvas id="bi6" width="680" height="480" aria-label="Дунай"></canvas></div><figcaption><b>Дунай</b>Жёлтая степь и широкая река.</figcaption></figure>
  </div>
  <h2>Вылазки и погода</h2>`);
rep('<title>Преграды, десант, погода</title>', '<title>Преграды, режимы, земли</title>');
rep('<h1>Преграды, десант, погода</h1>', '<h1>Преграды, режимы, земли</h1>');
fs.writeFileSync(path.join(__dirname, 'extras.js'), t);
console.log('ok');
