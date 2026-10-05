// Assembles crossing.html from: the castle prototype (styles, sound, classes, boosts, banners, portraits, soldier art), the diorama (low-poly terrain and scenery) and engine.js.
const fs = require('fs'), path = require('path');
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8'), dio = fs.readFileSync(path.join('..', 'diorama', 'diorama.html'), 'utf8'), engine = fs.readFileSync(path.join(__dirname, 'engine.js'), 'utf8').replace("pine(ctx, jx, jy - lift(jx, jy), 0.75 + r() * 0.0 + (jx * 7 % 5) / 12)", "pine(ctx, jx, jy - lift(jx, jy), 0.75 + (jx * 7 % 5) / 12)");
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('missing ' + a.slice(0, 40) + ' | ' + b.slice(0, 30)); return src.slice(i, j); };
const style = between(cas, '<style>', '</style>') + '</style>';
// the sound engine
const sndStart = cas.indexOf('const SND = (() => {'), sndEnd = cas.indexOf('})();', sndStart) + 5, SND = cas.slice(sndStart, sndEnd);
const classes = between(cas, 'const INF = 0, ARC = 1, CAV = 2;', 'const TIME');
const boosts = between(cas, 'const BOOST = {', 'const REFILL');
const art = between(cas, 'function drawMan(', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
let lib = dio.match(/<script>([\s\S]*)<\/script>/)[1]; lib = lib.slice(0, lib.indexOf('function diorama(')).replace('const DPR = 2, CW = 480, CH = 720, K = 96;', 'const CW = 480, CH = 720, K = 96;');
const html = `<title>Переправа</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@600;700&family=Alegreya+Sans:wght@400;500;700&display=swap">
${style}
<div class="stage"><div class="fit" id="fit"><div class="phone" id="board">
  <canvas id="cv" width="540" height="960" aria-label="Поле боя: переправа"></canvas>
  <div class="hud top">
    <button class="ibtn" id="restart" type="button" aria-label="Начать заново" title="Начать заново">↻</button>
    <div class="tt"><small>Диорама</small><b>Переправа</b><span id="sub">Поднимитесь в форт</span></div>
    <button class="ibtn" id="mus" type="button" aria-label="Музыка" title="Музыка">♪</button>
    <button class="ibtn" id="snd" type="button" aria-label="Звуки боя" title="Звуки боя">🔊</button>
    <span class="chip" id="clock">0:00</span>
  </div>
  <div class="hud phase" id="phase">Цель: форт</div>
  <div class="rail" id="rail">
    <button class="rb" id="rb0" type="button" aria-label="Отряд 1"><span class="in"><canvas id="rbc0" width="64" height="64"></canvas></span></button>
    <button class="rb" id="rb1" type="button" aria-label="Отряд 2"><span class="in"><canvas id="rbc1" width="64" height="64"></canvas></span></button>
    <button class="rb" id="rb2" type="button" aria-label="Отряд 3"><span class="in"><canvas id="rbc2" width="64" height="64"></canvas></span></button>
    <button class="rb" id="rb3" type="button" aria-label="Отряд 4"><span class="in"><canvas id="rbc3" width="64" height="64"></canvas></span></button>
  </div>
  <div class="boostbar" id="boosts" hidden></div>
  <button class="zchip" id="zoomchip" type="button" hidden>1,0× ⟲</button>
  <div class="toast" id="toast" hidden></div>
  <div class="help" id="help">
    <h3>Переправа</h3>
    <p><b>Цель:</b> захватить форт на плато вверху: встаньте у него на 6 секунд без врагов рядом. Дозорная башня и амбар на хребтах по пути дают +3 в резерв каждый.</p>
    <p>У вас <b>4 генерала</b>, у каждого малый отряд и знамя. <b>Коснитесь знамени слева или отряда</b>: время замедлится, внизу появятся приказы. Затем коснитесь любого места: <b>на равнине отряд идёт, куда вы указали</b>. Светлые плитки на тропах, броде и подъёмах показывают места, где можно встать на склоне.</p>
    <p><b>Рельеф:</b> реку переходят по броду, на хребты и плато поднимаются по тропам. С возвышенности лучники бьют дальше. Баррикаду на перевале разбирают инженеры; обойти её можно по тропе вдоль восточного хребта. Лес прячет отряд.</p>
    <p><b>Враги</b> стоят на постах и не получают подкрепления, но тревога поднимает пост целиком. <b>Пополнение:</b> заведите отряд к палатке своего лагеря, получите по бойцу каждые 3,5 секунды, резерв 10. Колесо мыши или щипок меняют масштаб.</p>
    <p>Состав, коснитесь, чтобы сменить класс:</p>
    <div class="slots" id="slots"></div>
    <button type="button" class="go" id="helpOk">В бой</button>
  </div>
  <div class="over" id="over" hidden><div class="box"><h2 id="ovT">Победа</h2><p id="ovP"></p><button type="button" id="ovB">Ещё бой</button></div></div>
</div></div></div>
<script>
'use strict';
${lib}
${classes}
${SND}
${boosts}
${art}
${engine}
</script>
`;
fs.writeFileSync(path.join(__dirname, 'crossing.html'), html);
console.log('ok', html.length);
