// Builds ui.html: the interface mock-up on top of the hill-fortress diorama (reuses the diorama drawing, the banners and the generals' portraits).
const fs = require('fs'), path = require('path');
const dio = fs.readFileSync(path.join(__dirname, 'diorama.html'), 'utf8'), cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
let script = dio.match(/<script>([\s\S]*)<\/script>/)[1];
const cut = script.indexOf('// ---------------------------------------------------------------- 1. hill fortress');
let lib = script.slice(0, cut);
lib = lib.replace("function diorama(id, spec) {\n  const c = document.getElementById(id), g = c.getContext('2d'); g.scale(DPR, DPR); g.lineCap = 'round'; g.lineJoin = 'round';", "function diorama(g, spec) {\n  g.lineCap = 'round'; g.lineJoin = 'round';");
lib = lib.replace("g.fillText('Наш лагерь', ph[0], ph[1] + 37);\n}", "g.fillText(spec.campLabel || 'Наш лагерь', ph[0], ph[1] + 37);\n  return { P, nodes };\n}");
lib = lib.replace("g.fillRect(ph[0] - 42, ph[1] + 24, 84, 17);", "g.fillRect(ph[0] - 64, ph[1] + 24, 128, 17);");
// banners and portraits from the game
const a = cas.indexOf('function emblem(g, k, cx, cy, z, col) {'), b = cas.indexOf('function paintRail() {');
let gameArt = cas.slice(a, b).replace(/\bbanner\(/g, 'cbanner(');
const bs = cas.indexOf('const BAN = {'), be = cas.indexOf('const REFILL');
const BAN = cas.slice(bs, be);
const html = `<title>Интерфейс на диораме</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@600;700&family=Alegreya+Sans:wght@400;500;700&display=swap">
<style>
  /* the game's own interface drawn over the diorama: three states side by side */
  :root { --bg: #14110d; --panel: #1e1913; --ink: #efe6d2; --muted: #b8aa8c; --gold: #d9a441; --line: #3a3024;
          --display: 'Cormorant SC', Georgia, serif; --body: 'Alegreya Sans', system-ui, sans-serif; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.45; }
  .wrap { max-width: 1260px; margin: 0 auto; padding: 28px 16px 56px; }
  header { max-width: 780px; margin-bottom: 24px; }
  h1 { font-family: var(--display); font-size: 40px; line-height: 1.05; margin: 0 0 8px; text-wrap: balance; }
  header p { margin: 0 0 6px; color: var(--muted); font-size: 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 26px; }
  .card { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
  .phone { width: 100%; max-width: 380px; border-radius: 26px; overflow: hidden; background: #000; box-shadow: 0 0 0 1px var(--line), 0 18px 44px rgba(0,0,0,.6); line-height: 0; }
  canvas { display: block; width: 100%; height: auto; }
  .tag { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); }
  .card h2 { margin: 2px 0 0; font-family: var(--display); font-size: 27px; }
  .card p { margin: 0; font-size: 15px; }
  .card ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 5px; font-size: 14px; color: var(--muted); } .card li b { color: var(--ink); }
  .legend { margin-top: 30px; padding: 16px 18px; border: 1px solid var(--line); border-radius: 14px; background: var(--panel); max-width: 880px; }
  .legend h3 { margin: 0 0 8px; font-family: var(--display); font-size: 24px; }
  .legend ul { margin: 0; padding-left: 18px; color: var(--muted); display: grid; gap: 4px; } .legend b { color: var(--ink); }
</style>
<div class="wrap">
  <header>
    <h1>Интерфейс на диораме</h1>
    <p>Тот же интерфейс, что в игре (знамёна и лица слева, приказы внизу), но на новой низкополигональной карте «Холм-крепость». Три состояния боя.</p>
  </header>
  <div class="grid">
    <article class="card"><div class="phone"><canvas id="u1" width="1080" height="1920" aria-label="Обычный вид"></canvas></div><span class="tag">Экран 1</span><h2>Обычный вид</h2>
      <p>Бой идёт. Вся карта на экране, зум не нужен. Слева четыре генерала с лицами и знамёнами, сверху счёт зданий, вражеских отрядов и резерв.</p>
      <ul><li><b>Верхняя строка:</b> здания 0 из 2, вершина, враги 8, резерв 10.</li><li><b>Лагерь:</b> пополнение в палатках, подпись с резервом.</li></ul></article>
    <article class="card"><div class="phone"><canvas id="u2" width="1080" height="1920" aria-label="Выбран отряд"></canvas></div><span class="tag">Экран 2</span><h2>Выбран отряд</h2>
      <p>Коснулись знамени Тита (велиты): время замедлилось, куда можно пойти, светится плитками, внизу появились его приказы.</p>
      <ul><li><b>Плитки:</b> светятся только те, куда отряд может дойти.</li><li><b>Приказы:</b> «Залп» и «Дождь стрел» с остатком зарядов.</li></ul></article>
    <article class="card"><div class="phone"><canvas id="u3" width="1080" height="1920" aria-label="Выбор цели"></canvas></div><span class="tag">Экран 3</span><h2>Цель для «Дождя стрел»</h2>
      <p>Нажали «Дождь стрел», теперь выбираете плитку. Красный круг показывает, куда упадут стрелы, пунктир дальность.</p>
      <ul><li><b>Дальность:</b> пунктирное кольцо вокруг отряда.</li><li><b>Цель:</b> красная зона на плитке, стрелы падают на 3 секунды.</li></ul></article>
  </div>
  <section class="legend">
    <h3>Что на экране</h3>
    <ul>
      <li><b>Кружки слева:</b> лицо генерала, знамя отряда и кольцо здоровья. Золотой ободок у выбранного.</li>
      <li><b>Две кнопки сверху:</b> музыка и звуки боя включаются отдельно.</li>
      <li><b>Мини-карта и зум не нужны:</b> карта целиком на экране. Щипок остаётся «на всякий случай» и подходит, чтобы рассмотреть детали.</li>
      <li><b>Золотые флажки</b> над мельницей и амбаром, большой флаг над крепостью: точки захвата. Мельница и амбар дают +3 в резерв, главная вершина финал.</li>
    </ul>
  </section>
</div>
<script>
${lib}
${BAN}
${gameArt}
// ---------------------------------------------------------------- the hill-fortress diorama as a reusable spec
const cp1 = camp(240, 640);
const SPEC = { seed: 5, trees: 70, rocks: 14, treeMax: 0.5, camp: [240, 640], campLabel: 'Наш лагерь · резерв 10', mask: ell(240, 385, 210, 300, 3.2),
  h: (x, y) => { let v = 0.08 + E(x, y, 240, 250, 140, 120, 0.95) + E(x, y, 118, 420, 70, 60, 0.38) + E(x, y, 362, 410, 72, 60, 0.4) + E(x, y, 240, 360, 130, 50, 0.12); return v > 0.72 ? 0.72 + (v - 0.72) * 0.25 : v; },
  paths: [[[240, 640], [240, 600], [205, 565], [160, 525], [130, 470], [122, 425]], [[160, 525], [215, 485], [272, 470], [330, 440], [362, 408]], [[122, 425], [165, 385], [215, 350], [240, 312]], [[362, 408], [322, 362], [272, 328], [240, 312]], [[240, 312], [240, 272], [240, 240]]],
  objects: [...cp1.o, { t: 'mill', x: 108, y: 418, flag: GOLD, fx: 18, fh: 52, label: 'Мельница' }, { t: 'granary', x: 372, y: 404, flag: GOLD, fx: 22, fh: 40, label: 'Амбар' }, { t: 'hall', x: 240, y: 232, stone: true, flag: '#e8e0cc', fx: 26, fh: 62, label: 'Крепость', final: true }, { t: 'house', x: 150, y: 345 }, { t: 'house', x: 328, y: 330 }],
  units: [...cp1.u, inf(122, 425), arc(165, 385), inf(362, 408), arc(322, 362), cav(240, 312), inf(272, 328), inf(240, 272), inf(240, 240)] };
// ---------------------------------------------------------------- interface pieces
const UW = 540, UH = 960, SC = 1.125, OFF = 100;
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const FACE = ['hastati', 'velites', 'eques', 'eng'], HPS = [0.92, 0.7, 1, 1];
function topBar(g, strip, stripCol) {
  g.fillStyle = '#1e1913'; g.fillRect(0, 0, UW, 64); g.fillStyle = 'rgba(30,25,19,.97)'; g.fillRect(0, 64, UW, 26);
  g.fillStyle = '#2a231a'; g.strokeStyle = '#4a3d2c'; g.lineWidth = 1; rr(g, 14, 10, 44, 44, 10); g.fill(); g.stroke(); g.fillStyle = '#efe6d2'; g.font = '18px sans-serif'; g.textAlign = 'center'; g.fillText('↻', 36, 39);
  g.textAlign = 'left'; g.fillStyle = '#d9a441'; g.font = '700 11px Alegreya Sans, sans-serif'; g.fillText('ХОЛМ-КРЕПОСТЬ', 70, 22); g.fillStyle = '#efe6d2'; g.font = '700 24px Cormorant SC, serif'; g.fillText('Штурм', 70, 46); g.fillStyle = '#b8aa8c'; g.font = '12px Alegreya Sans, sans-serif'; g.fillText('Поднимитесь в крепость', 70, 60);
  for (const [x, t] of [[318, '♪'], [372, '🔊']]) { g.fillStyle = '#2a231a'; g.strokeStyle = '#4a3d2c'; rr(g, x, 10, 44, 44, 10); g.fill(); g.stroke(); g.fillStyle = '#efe6d2'; g.font = '18px sans-serif'; g.textAlign = 'center'; g.fillText(t, x + 22, 39); }
  g.fillStyle = '#2a231a'; rr(g, 428, 14, 98, 36, 18); g.fill(); g.strokeStyle = '#4a3d2c'; g.stroke(); g.fillStyle = '#efe6d2'; g.font = '700 15px Alegreya Sans, sans-serif'; g.textAlign = 'center'; g.fillText('1:12', 477, 38);
  g.fillStyle = stripCol[0]; g.fillRect(0, 64, UW, 26); g.fillStyle = stripCol[1]; g.fillRect(0, 89, UW, 1); g.fillStyle = stripCol[2]; g.font = '700 13px Alegreya Sans, sans-serif'; g.textAlign = 'center'; g.fillText(strip, UW / 2, 82);
}
const faceCache = {};
function faceCanvas(i) { const k = i + FACE[i]; if (faceCache[k]) return faceCache[k]; const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d'); x.scale(2, 2); portrait(x, i, FACE[i]); return (faceCache[k] = c); }
function rail(g, sel) {
  FACE.forEach((cls, i) => { const x = 40, y = 150 + i * 74, R = 32;
    g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill();
    g.strokeStyle = HPS[i] > 0.5 ? '#6fd17a' : '#f2c14e'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, R - 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * HPS[i]); g.stroke();
    g.save(); g.beginPath(); g.arc(x, y, R - 6, 0, 7); g.clip(); g.drawImage(faceCanvas(i), x - R + 6, y - R + 6, (R - 6) * 2, (R - 6) * 2); g.restore();
    g.strokeStyle = '#4a3d2c'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, R - 6, 0, 7); g.stroke();
    if (sel === i) { g.strokeStyle = '#f6d77a'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, R + 3, 0, 7); g.stroke(); g.shadowColor = 'rgba(246,215,122,.7)'; g.shadowBlur = 12; g.stroke(); g.shadowBlur = 0; }
  });
}
function boosts(g, items, activeIdx) {
  items.forEach(([name, text, state], i) => { const w = (UW - 90 - 16) / items.length, x = 80 + i * (w + 8), y = 872, on = activeIdx === i;
    g.fillStyle = on ? '#d9a441' : 'rgba(42,35,26,.97)'; g.strokeStyle = '#d9a441'; g.lineWidth = 1.2; rr(g, x, y, w, 68, 12); g.fill(); g.stroke();
    g.textAlign = 'center'; g.fillStyle = on ? '#1e1408' : '#efe6d2'; g.font = '700 16px Alegreya Sans, sans-serif'; g.fillText(name, x + w / 2, y + 26); g.fillStyle = on ? '#3a2a12' : '#b8aa8c'; g.font = '12px Alegreya Sans, sans-serif'; g.fillText(text, x + w / 2, y + 45); g.fillStyle = on ? '#3a2a12' : '#f6d77a'; g.font = '700 12px Alegreya Sans, sans-serif'; g.fillText(state, x + w / 2, y + 60); });
}
function plate(g, x, y, col, lw) { g.strokeStyle = col; g.lineWidth = lw || 2.5; g.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + 0.3, rr0 = 14.5 + ((k * 37 + Math.round(x)) % 3); const px = x + Math.cos(a) * rr0, py = y + Math.sin(a) * rr0 * 0.55; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); g.stroke(); }

function screen(id, mode) {
  const c = document.getElementById(id), g = c.getContext('2d'); g.scale(DPR, DPR); g.lineCap = 'round'; g.lineJoin = 'round';
  g.fillStyle = '#14110d'; g.fillRect(0, 0, UW, UH);
  g.save(); g.translate(0, OFF); g.scale(SC, SC); g.beginPath(); g.rect(0, 0, CW, CH); g.clip(); const info = diorama(g, SPEC); g.restore();
  const M = (x, y) => { const [px, py] = info.P(x, y); return [px * SC, OFF + py * SC]; };
  const me = M(240, 606), sel = mode === 'idle' ? -1 : 1;
  if (mode !== 'idle') {
    g.fillStyle = 'rgba(30,60,110,.1)'; g.fillRect(0, 90, UW, UH - 90);
    for (const [x, y] of info.nodes) { if (Math.hypot(x - 240, y - 606) > 215) continue; const [px, py] = M(x, y); g.fillStyle = 'rgba(255,244,214,.5)'; g.beginPath(); g.ellipse(px, py, 15, 8.5, 0, 0, 7); g.fill(); plate(g, px, py, '#fff6dc', 2.6); }
    g.strokeStyle = '#f6d77a'; g.lineWidth = 3; g.beginPath(); g.ellipse(me[0], me[1] + 4, 36, 20, 0, 0, 7); g.stroke();
  }
  if (mode === 'target') {
    g.strokeStyle = 'rgba(246,215,122,.9)'; g.lineWidth = 2; g.setLineDash([9, 7]); g.beginPath(); g.ellipse(me[0], me[1], 215, 130, 0, 0, 7); g.stroke(); g.setLineDash([]);
    const t = M(130, 470); g.fillStyle = 'rgba(192,38,27,.2)'; g.strokeStyle = 'rgba(192,38,27,.85)'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(t[0], t[1], 62, 38, 0, 0, 7); g.fill(); g.stroke();
    g.strokeStyle = '#5a1510'; g.lineWidth = 1.8; for (let k = 0; k < 14; k++) { const a = k * 2.4, rr0 = Math.sqrt((k + 0.5) / 14), x = t[0] + Math.cos(a) * 54 * rr0, y = t[1] + Math.sin(a) * 30 * rr0, f = (k * 0.31) % 1; g.beginPath(); g.moveTo(x - 2, y - 52 * (1 - f) - 11); g.lineTo(x, y - 52 * (1 - f)); g.stroke(); }
    plate(g, t[0], t[1], '#ffd2c8', 3);
  }
  if (mode === 'idle' || mode === 'target') { /* tents show a refill cross in the idle view */ }
  if (mode === 'idle') for (const [tx, ty] of [[170, 654], [310, 654], [240, 666]]) { const [px, py] = M(tx, ty); g.fillStyle = '#2f8f4e'; g.strokeStyle = '#eef3d2'; g.lineWidth = 2; g.beginPath(); g.arc(px + 22, py - 40, 11, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#eef3d2'; g.fillRect(px + 17, py - 42, 10, 4); g.fillRect(px + 20, py - 45, 4, 10); }
  topBar(g, mode === 'idle' ? 'Здания 0/2 · вершина · вражеских отрядов 8 · резерв 10' : mode === 'select' ? '⏳ Замедление · выберите плитку' : '🎯 Коснитесь плитки для «Дождя стрел»', mode === 'idle' ? ['#2a1f12', '#d9a441', '#d9a441'] : ['#14233a', '#5d8fbf', '#bfe0ff']);
  rail(g, sel);
  if (mode !== 'idle') boosts(g, [['Залп', 'урон ×2,5', 'готово'], ['Дождь стрел', 'по плитке и рядом', 'осталось 2']], mode === 'target' ? 1 : -1);
  g.fillStyle = 'rgba(30,25,19,.95)'; g.strokeStyle = '#4a3d2c'; g.lineWidth = 1; rr(g, 424, 104, 102, 34, 17); g.fill(); g.stroke(); g.fillStyle = '#f6d77a'; g.font = '700 14px Alegreya Sans, sans-serif'; g.textAlign = 'center'; g.fillText('1,0× ⟲', 475, 126);
}
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load("700 20px 'Cormorant SC'"), document.fonts.load("700 14px 'Alegreya Sans'")]).catch(() => 0) : Promise.resolve()).then(() => { screen('u1', 'idle'); screen('u2', 'select'); screen('u3', 'target'); });
</script>
`;
fs.writeFileSync(path.join(__dirname, 'ui.html'), html);
console.log('ok', html.length);
