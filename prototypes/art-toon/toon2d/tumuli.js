// Builds tumuli.html: looks for the Etruscan burial mounds on the Veii map, as a pick sheet.
// Each option: one mound with archers on it for scale, and a cluster forming the necropolis wall by the defile.
const fs = require('fs'), path = require('path');
const gen = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
const js = gen.slice(gen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, gen.indexOf('`;\nconst html'));
const helpers = js.slice(0, js.indexOf('function drawWorld(g) {'));
const tj = fs.readFileSync(path.join(__dirname, 'terrain.js'), 'utf8');
const tsheet = tj.slice(tj.indexOf('// ---------------------------------------------------------------- rubble: boulders'), tj.indexOf('// ---------------------------------------------------------------- 1. rubble in three states'));
const tb = fs.readFileSync(path.join(__dirname, 'tibur.js'), 'utf8');
const tibHelpers = tb.slice(tb.indexOf('function stream(g, pts, w, r) {'), tb.indexOf('function drawWorld(g, labels) {'));
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
const between = (src, a, b) => src.slice(src.indexOf(a), src.indexOf(b, src.indexOf(a)));
const ban = between(cas, 'const BAN = {', 'const REFILL'), art = between(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const draw = String.raw`
function shadow(g, x, y, rx, ry) { g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 10, y, rx, ry, 0, 0, 7); g.fill(); }
function dome(g, x, y, r, h, c1, c2) { g.beginPath(); g.ellipse(x, y, r, r * 0.42, 0, 0, Math.PI); g.bezierCurveTo(x - r * 0.95, y - h, x + r * 0.95, y - h, x + r, y); g.closePath(); const mg = g.createRadialGradient(x - r * 0.35, y - h * 0.7, 2, x, y - h * 0.3, r * 1.1); mg.addColorStop(0, c1 || '#c4ec86'); mg.addColorStop(1, c2 || '#6cb83e'); fo(g, mg, 2.6); g.fillStyle = 'rgba(255,255,220,.35)'; g.beginPath(); g.ellipse(x - r * 0.3, y - h * 0.62, r * 0.26, r * 0.1, -0.3, 0, 7); g.fill(); }
function drum(g, x, y, r, h, col) { g.beginPath(); g.ellipse(x, y + h, r, r * 0.42, 0, 0, Math.PI); g.lineTo(x - r, y); g.ellipse(x, y, r, r * 0.42, 0, Math.PI, 0, true); g.closePath(); fo(g, col || '#d8c8a4', 2.6); }
function cypress(g, x, y, s) { g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 5, y + 1, 9 * s, 3 * s, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(x, y - 54 * s); g.bezierCurveTo(x + 13 * s, y - 34 * s, x + 11 * s, y - 6 * s, x, y); g.bezierCurveTo(x - 11 * s, y - 6 * s, x - 13 * s, y - 34 * s, x, y - 54 * s); fo(g, '#3e7a36', 2.4); g.fillStyle = 'rgba(160,220,120,.35)'; g.beginPath(); g.ellipse(x - 3 * s, y - 32 * s, 3 * s, 12 * s, 0, 0, 7); g.fill(); }

// 1. smooth dome on a carved drum, a small stele in front — no hole at all
function tm1(g, x, y, r) { shadow(g, x, y + r * 0.35, r * 1.05, r * 0.3); drum(g, x, y - 12, r, 12); g.strokeStyle = '#a89878'; g.lineWidth = 2.2; g.beginPath(); g.ellipse(x, y - 4, r, r * 0.42, 0, 0.12, Math.PI - 0.12); g.stroke(); dome(g, x, y - 12, r, r * 0.95); rr(g, x - 6, y + r * 0.42 - 6, 12, 18, 5); fo(g, '#e8dcc0', 2); }
// 2. a stone door slab at the end of a short sunken passage with steps
function tm2(g, x, y, r) { shadow(g, x, y + r * 0.35, r * 1.05, r * 0.3); drum(g, x, y - 12, r, 12); dome(g, x, y - 12, r, r * 0.95);
  g.beginPath(); g.moveTo(x - 12, y + r * 0.42 - 12); g.lineTo(x - 16, y + r * 0.42 + 14); g.lineTo(x + 16, y + r * 0.42 + 14); g.lineTo(x + 12, y + r * 0.42 - 12); g.closePath(); fo(g, '#b8a888', 2.2);
  for (let k = 0; k < 3; k++) { rr(g, x - 13 - k, y + r * 0.42 - 4 + k * 6, 26 + k * 2, 4, 1.5); g.fillStyle = '#d8c8a4'; g.fill(); }
  rr(g, x - 10, y + r * 0.42 - 28, 20, 20, 3); fo(g, '#8a7a62', 2.2); g.strokeStyle = 'rgba(40,30,20,.6)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y + r * 0.42 - 26); g.lineTo(x, y + r * 0.42 - 10); g.stroke(); }
// 3. a low grassy hill crowned with cypresses — reads as "sacred ground", no masonry
function tm3(g, x, y, r) { shadow(g, x, y + r * 0.3, r * 1.1, r * 0.3); blob(g, x, y, r * 1.05, r * 0.55, x, 12); fo(g, '#8ccc58', 2.6); dome(g, x, y, r * 0.85, r * 0.6, '#b8e47a', '#7cc84c'); cypress(g, x - r * 0.25, y - r * 0.35, 0.8); cypress(g, x + r * 0.2, y - r * 0.42, 0.95); }
// 4. cube tombs (tombe a dado): small stone houses with carved false doors, in a row
function tm4(g, x, y, r) { shadow(g, x, y + 6, r * 1.1, r * 0.22);
  for (const [dx, dy, w] of [[-r * 0.55, -8, r * 1.25], [r * 0.6, 4, r * 1.1]]) { const bx = x + dx, by = y + dy; rr(g, bx - w / 2, by - w * 0.6, w, w * 0.6, 3); fo(g, '#d8b888', 2.6); rr(g, bx - w / 2 - 4, by - w * 0.6 - 8, w + 8, 10, 3); fo(g, '#c8a070', 2.4);
    g.beginPath(); g.moveTo(bx - 7, by - 2); g.lineTo(bx - 5, by - w * 0.4); g.lineTo(bx + 5, by - w * 0.4); g.lineTo(bx + 7, by - 2); g.closePath(); fo(g, '#a87e50', 2); g.fillStyle = '#7cc84c'; g.beginPath(); g.ellipse(bx, by - w * 0.6 - 10, w * 0.4, 5, 0, Math.PI, 0); g.fill(); } }
// 5. a grassy mound ringed by standing stones and urns
function tm5(g, x, y, r) { shadow(g, x, y + r * 0.35, r * 1.15, r * 0.32); dome(g, x, y, r, r * 0.8);
  for (let a = 0.15; a < Math.PI - 0.1; a += 0.38) { const sx = x + Math.cos(a) * r * 1.02, sy = y + Math.sin(a) * r * 0.46; rr(g, sx - 4, sy - 16, 8, 18, 3); fo(g, '#cfc3ac', 1.8); }
  for (const dx of [-r * 0.6, r * 0.55]) { const ux = x + dx, uy = y + r * 0.5; g.beginPath(); g.ellipse(ux, uy - 8, 7, 9, 0, 0, 7); fo(g, '#c8603a', 2); rr(g, ux - 5, uy - 18, 10, 4, 2); fo(g, '#a84a2c', 1.6); } }

const OPTS = [
  ['tm1', 'Гладкий курган', 'купол на резном барабане, у подножия стела — без входа', tm1],
  ['tm2', 'Вход-плита', 'каменная дверь в конце короткого спуска со ступенями', tm2],
  ['tm3', 'Холм с кипарисами', 'просто травяной холм, кипарисы говорят: святое место', tm3],
  ['tm4', 'Гробницы-кубы', 'маленькие каменные «дома» с ложными дверями, как в Орвието', tm4],
  ['tm5', 'Курган в кольце камней', 'купол, вокруг камни и погребальные урны', tm5]
];
function panel(id, fn) {
  const c = document.getElementById(id), g = c.getContext('2d'); g.scale(2, 2); const r = rng(id.length * 31 + id.charCodeAt(2));
  grass(g, 0, 0, 340, 420, '#7ccc4e', r);
  // one mound with archers on top for scale
  fn(g, 110, 170, 58); squad(g, 112, 110, 'velites', 1, 3, 0.62, '#2fa04e', 'pennant');
  // the necropolis wall by the defile: a tight cluster, the road squeezing past, the rubble in the gap
  path(g, [[0, 330], [170, 322], [340, 318]], 28);
  [[210, 250, 30], [262, 236, 34], [306, 262, 28], [238, 278, 22]].sort((a, b) => a[1] - b[1]).forEach(([x, y, rr0]) => fn(g, x, y, rr0));
  rubble(g, 190, 322, 0); g.beginPath(); g.arc(190, 282, 12, 0, 7); fo(g, '#f09a24', 2.4); g.font = '13px sans-serif'; g.textAlign = 'center'; g.fillText('⛏', 190, 287);
  rr(g, 200, 352, 120, 50, 10); g.fillStyle = '#9ccc5a'; g.fill(); g.lineWidth = 7; g.strokeStyle = OL; g.stroke(); g.lineWidth = 4; g.strokeStyle = '#c8bca4'; g.stroke();
}
const go = () => {
  OPTS.forEach(([id, , , fn]) => panel(id, fn));
  let pick = null; try { pick = localStorage.getItem('tumuli-pick'); } catch (_) {}
  const show = () => { document.querySelectorAll('.pick').forEach(b => b.classList.toggle('on', b.dataset.id === pick)); const o = OPTS.find(x => x[0] === pick); document.getElementById('chosen').innerHTML = o ? 'Выбрано: <b>' + o[1] + '</b> — напишите в чат' : 'Нажмите на понравившийся вариант'; };
  document.querySelectorAll('.pick').forEach(b => b.addEventListener('click', () => { pick = pick === b.dataset.id ? null : b.dataset.id; try { localStorage.setItem('tumuli-pick', pick || ''); } catch (_) {} show(); }));
  show();
};
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load('900 20px "Lilita One"'), document.fonts.load('700 13px "Alegreya Sans"')]).catch(() => 0) : Promise.resolve()).then(go);
`;
const opts = [...draw.matchAll(/\['(tm\d)', '([^']+)', '([^']+)'/g)].map(m => m.slice(1));
const html = `<title>Курганы этрусков</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800;900&display=swap">
<style>
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --gold: #f2c14a; --display: 'Lilita One', 'Alegreya Sans', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.45; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 28px 16px 110px; }
  h1 { font-family: var(--display); font-weight: 400; font-size: 40px; line-height: 1.05; margin: 0 0 10px; color: #ffe6a8; }
  p { margin: 0 0 12px; color: var(--muted); max-width: 820px; } b { color: var(--ink); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 14px; margin-top: 16px; }
  .pick { position: relative; padding: 0; border: 4px solid #1a0e06; border-radius: 18px; overflow: hidden; background: #3a2414; color: inherit; font: inherit; text-align: left; cursor: pointer; }
  .pick canvas { display: block; width: 100%; height: auto; }
  .pick .cap { display: block; padding: 8px 10px 10px; font-size: 13px; color: var(--muted); line-height: 1.3; } .pick .cap b { display: block; font: 400 18px var(--display); color: #ffe6a8; margin-bottom: 2px; }
  .pick .tick { position: absolute; top: 8px; right: 8px; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #1a0e06; background: #ffcc33; color: #3a1e08; font: 400 20px var(--display); display: none; align-items: center; justify-content: center; font-style: normal; }
  .pick.on { border-color: #ffcc33; box-shadow: 0 0 0 3px #ffcc33; } .pick.on .tick { display: flex; }
  .pick:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
  .bar { position: fixed; left: 50%; bottom: 14px; transform: translateX(-50%); width: min(560px, calc(100% - 32px)); padding: 12px 16px; border-radius: 18px; background: rgba(40,24,14,.97); border: 3px solid var(--gold); color: var(--muted); text-align: center; }
</style>
<div class="wrap">
  <h1>Курганы этрусков: другой вид</h1>
  <p>Вокруг Вейи — некрополь: курганы-гробницы. В бою они работают как бугры (с них лучники бьют дальше), а скопление курганов — непроходимая стена у теснины с завалом. Сверху в каждой карточке — один курган с велитами для масштаба, снизу — как такие курганы зажимают дорогу у завала ⛏.</p>
  <div class="grid">
    ${opts.map(([id, name, sub]) => `<button class="pick" type="button" data-id="${id}"><canvas id="${id}" width="680" height="840" aria-label="${name}"></canvas><span class="cap"><b>${name}</b>${sub}</span><i class="tick" aria-hidden="true">✓</i></button>`).join('\n    ')}
  </div>
</div>
<div class="bar" id="chosen" role="status"></div>
<script>
'use strict';
${helpers}
${ban}
${art}
${tsheet}
${tibHelpers}
${draw}
</script>
`;
fs.writeFileSync(path.join(__dirname, 'tumuli.html'), html);
console.log('ok', html.length, opts.length);
