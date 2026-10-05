// Assembles c3d.html: diorama helpers + the navigation part of the crossing engine + art pieces of the castle prototype + scene.js.
const fs = require('fs'), path = require('path');
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('missing ' + a.slice(0, 40)); return src.slice(i, j); };
const dio = fs.readFileSync(path.join('..', 'diorama', 'diorama.html'), 'utf8'), eng = fs.readFileSync(path.join('..', 'crossing', 'engine.js'), 'utf8'), cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
let lib = dio.match(/<script>([\s\S]*)<\/script>/)[1]; lib = lib.slice(0, lib.indexOf('// ---------------------------------------------------------------- the terrain mesh')).replace('const DPR = 2, CW = 480, CH = 720, K = 96;', 'const K = 96;');
const nav = between(eng, 'const ell = ', '// ---------------------------------------------------------------- squads');
const starts = between(eng, 'const STARTS', 'const POINTS');
const classes = between(cas, 'const INF = 0, ARC = 1, CAV = 2;', 'const TIME');
const ban = between(cas, 'const BAN = {', 'const REFILL');
const art = between(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const scene = fs.readFileSync(path.join(__dirname, 'scene.js'), 'utf8');
const style = between(cas, '<style>', '</style>').replace(/\.stage \{[^}]*\}/, '.stage { box-sizing: border-box; min-height: 100%; display: flex; justify-content: center; align-items: flex-start; padding: 16px; }')
  .replace(/\.phone \{[^}]*\}/, '.phone { position: absolute; left: 0; top: 0; width: 540px; height: 960px; transform-origin: 0 0; overflow: hidden; border-radius: 22px; background: linear-gradient(#bfe3f2, #e8f4f8); box-shadow: 0 0 0 1px var(--line), 0 18px 50px rgba(0,0,0,.6); }');
const html = `<title>Переправа 3D</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@600;700&family=Alegreya+Sans:wght@400;500;700&display=swap">
${style}
  .rail { top: 104px; }
  .rb .in { background: #1e1a24; }
  .help p { margin: 0 0 8px; }
  .styles { position: absolute; left: 8px; right: 8px; bottom: 12px; display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; z-index: 4; }
  .styles button { height: 36px; padding: 0 12px; border-radius: 18px; border: 1px solid #4a3d2c; background: rgba(30,25,19,.92); color: #efe6d2; font: 700 13px var(--body); cursor: pointer; }
  .styles button.on { background: #d9a441; color: #1e1408; border-color: #d9a441; }
</style>
<div class="stage"><div class="fit" id="fit"><div class="phone" id="board">
  <canvas id="cv" width="540" height="960" aria-label="3D сцена: переправа"></canvas>
  <div class="hud top">
    <button class="ibtn" id="reset" type="button" aria-label="Вернуть камеру" title="Вернуть камеру">⟲</button>
    <div class="tt"><small>Тест стиля · 3D</small><b>Переправа</b><span id="sub">Мультяшные воины на гранёном рельефе</span></div>
  </div>
  <div class="hud phase" id="phase"></div>
  <div class="rail" id="rail">
    <button class="rb" id="rb0" type="button" aria-label="Марк"><span class="in"><canvas id="rbc0" width="64" height="64"></canvas></span></button>
    <button class="rb" id="rb1" type="button" aria-label="Тит"><span class="in"><canvas id="rbc1" width="64" height="64"></canvas></span></button>
    <button class="rb" id="rb2" type="button" aria-label="Гай"><span class="in"><canvas id="rbc2" width="64" height="64"></canvas></span></button>
    <button class="rb" id="rb3" type="button" aria-label="Луций"><span class="in"><canvas id="rbc3" width="64" height="64"></canvas></span></button>
  </div>
  <div class="styles" id="styles"></div>
  <div class="toast" id="toast" hidden></div>
  <div class="help" id="help">
    <h3>Тест стиля</h3>
    <p>Это не бой, а проверка вида: <b>трёхмерный гранёный рельеф и мультяшные воины</b>. Карта больше экрана, воины мельче.</p>
    <p><b>Коснитесь генерала слева или отряда:</b> непроходимая земля потемнеет, светлый контур покажет, куда можно дойти, сплошная линия — куда за 5 секунд, пунктир — за 10. На компьютере путь рисуется под курсором. Коснитесь места — отряд пойдёт.</p>
    <p><b>Перетаскивание</b> двигает камеру, <b>колесо или щипок</b> — масштаб, ⟲ — вернуть вид.</p>
    <button type="button" class="go" id="helpOk">Смотреть</button>
  </div>
</div></div></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
'use strict';
${lib}
const WX = 480, WY = 720;
${nav}
${classes}
${ban}
${starts}
${art}
${scene}
</script>
`;
fs.writeFileSync(path.join(__dirname, 'c3d.html'), html);
console.log('ok', html.length);
