// Assembles war.html: cartoon art helpers (toon2d) + sound/classes/boosts/banners/portraits (castle) + war.js.
const fs = require('fs'), path = require('path');
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('missing ' + a.slice(0, 40)); return src.slice(i, j); };
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
const toonGen = fs.readFileSync(path.join('..', 'toon2d', 'gen.js'), 'utf8');
const toonJs = toonGen.slice(toonGen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, toonGen.indexOf('`;\nconst html'));
const artHelpers = toonJs.slice(0, toonJs.indexOf('function drawWorld(g) {'));
const classes = between(cas, 'const INF = 0, ARC = 1, CAV = 2;', 'const TIME');
const sndStart = cas.indexOf('const SND = (() => {'), SND = cas.slice(sndStart, cas.indexOf('})();', sndStart) + 5);
const boosts = between(cas, 'const BOOST = {', 'const REFILL');
const portraits = between(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const war = fs.readFileSync(path.join(__dirname, 'war.js'), 'utf8');
const html = `<title>Переправа</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800;900&display=swap">
<style>
  /* the cartoon battle: wooden plates, chunky yellow buttons, thick dark outlines; one committed look */
  :root { --bg: #2a1a10; --wood: #3a2414; --ink: #fff3dc; --muted: #e2c9a0; --gold: #f2c14a; --ol: #2b1a10; --display: 'Lilita One', 'Alegreya Sans', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; color-scheme: dark; }
  [hidden] { display: none !important; }
  html, body { height: 100%; margin: 0; } body { background: var(--bg); color: var(--ink); font-family: var(--body); }
  .stage { box-sizing: border-box; min-height: 100%; display: flex; justify-content: center; align-items: flex-start; padding: 16px; }
  .fit { position: relative; flex: none; }
  .phone { position: absolute; left: 0; top: 0; width: 540px; height: 960px; transform-origin: 0 0; overflow: hidden; border-radius: 28px; border: 4px solid #1a0e06; box-sizing: border-box; background: #4a7a2a; box-shadow: 0 18px 44px rgba(0,0,0,.55); }
  canvas#cv { display: block; width: 100%; height: 100%; touch-action: none; user-select: none; -webkit-user-select: none; }
  .top { position: absolute; left: 8px; right: 8px; top: 8px; height: 64px; display: flex; align-items: center; gap: 8px; padding: 0 10px; border-radius: 18px; background: rgba(40,24,14,.94); border: 3px solid var(--gold); box-sizing: border-box; z-index: 3; }
  .ttl { flex: 1; min-width: 0; line-height: 1.05; } .ttl b { display: block; font: 400 20px var(--display); color: #ffe6a8; letter-spacing: .01em; } .ttl span { font: 700 12px var(--body); color: var(--gold); }
  .chip { height: 32px; min-width: 44px; padding: 0 7px; border-radius: 17px; background: #5a3a20; border: 2.5px solid var(--ol); display: flex; align-items: center; justify-content: center; font: 400 14px var(--display); white-space: nowrap; }
  .ib { width: 32px; height: 32px; border-radius: 12px; background: #5a3a20; border: 2.5px solid var(--ol); color: #ffe6a8; font-size: 17px; cursor: pointer; padding: 0; }
  .ib.off { opacity: .45; }
  .phase { position: absolute; left: 50%; top: 80px; transform: translateX(-50%); padding: 7px 16px; border-radius: 16px; background: rgba(40,24,14,.92); border: 2.5px solid var(--gold); font: 800 15px var(--body); color: #ffe6a8; white-space: nowrap; z-index: 3; }
  .rail { position: absolute; left: 8px; top: 92px; display: flex; flex-direction: column; gap: 12px; z-index: 3; }
  .rb { --hp: 100; --c: #7ee05a; width: 70px; height: 70px; border-radius: 50%; border: 3px solid var(--ol); padding: 4px; cursor: pointer; background: conic-gradient(var(--c) calc(var(--hp) * 1%), #3a2414 0); }
  .rb .in { display: block; width: 100%; height: 100%; border-radius: 50%; overflow: hidden; border: 3px solid var(--ol); background: #46371f; } .rb canvas { width: 100%; height: 100%; display: block; }
  .rb.sel { box-shadow: 0 0 0 4px #ffcc33, 0 0 16px rgba(255,204,51,.7); } .rb.dead { filter: grayscale(1); opacity: .45; }
  #mini { position: absolute; right: 12px; top: 84px; width: 84px; border: 3px solid var(--ol); border-radius: 10px; background: #3a2414; z-index: 3; cursor: pointer; }
  .bbar { position: absolute; left: 0; right: 0; bottom: 0; height: 92px; background: linear-gradient(#4a2e18, #2e1c0e); border-top: 3px solid var(--gold); box-shadow: 0 -6px 14px rgba(0,0,0,.35); z-index: 2; display: flex; align-items: center; padding: 0 96px 0 18px; box-sizing: border-box; }
  .bbar span { font: 800 15px var(--body); color: var(--muted); }
  .boostbar { position: absolute; left: 14px; right: 92px; bottom: 16px; display: flex; justify-content: center; gap: 10px; z-index: 3; }
  .bb { flex: 0 1 150px; min-width: 0; height: 56px; border-radius: 18px; border: 3.4px solid var(--ol); background: #ffc93c; box-shadow: 0 6px 0 #7a4a1c; color: #3a1e08; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.1; }
  .bb b { font: 400 17px var(--display); } .bb small { font: 800 12px var(--body); }
  .fast { position: absolute; right: 14px; bottom: 13px; width: 64px; height: 64px; border-radius: 50%; border: 3.4px solid var(--ol); background: #5a3a20; box-shadow: 0 5px 0 #1a0e06; color: #ffe6a8; font: 400 22px var(--display); cursor: pointer; z-index: 3; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: .95; padding: 0; }
  .fast small { font: 400 15px var(--display); } .fast.on { background: #ff8a3c; color: #3a1e08; }
  .bb.tgt { background: #ff8a3c; } .bb:disabled { filter: grayscale(.8); opacity: .6; cursor: not-allowed; }
  .nob { flex: 1; text-align: center; padding: 20px; border-radius: 20px; background: rgba(40,24,14,.9); border: 2.5px solid var(--gold); color: var(--muted); font-weight: 800; }
  .toast { position: absolute; left: 50%; top: 124px; transform: translateX(-50%); max-width: calc(100% - 40px); width: max-content; padding: 9px 16px; border-radius: 16px; background: rgba(40,24,14,.95); border: 2.5px solid #ff8a6a; color: #ffe6a8; font: 800 15px var(--body); text-align: center; pointer-events: none; z-index: 7; }
  .help, .over .box { position: absolute; left: 14px; right: 14px; top: 90px; padding: 16px 18px; border-radius: 20px; background: rgba(40,24,14,.97); border: 3px solid var(--gold); font-size: 15px; line-height: 1.42; z-index: 6; }
  .help h3, .box h2 { margin: 0 0 6px; font: 400 30px var(--display); color: #ffe6a8; } .help p { margin: 0 0 8px; color: var(--muted); } .help b { color: var(--ink); }
  .go, .box button { width: 100%; height: 54px; margin-top: 6px; border-radius: 18px; border: 3.4px solid var(--ol); background: #ffc93c; box-shadow: 0 5px 0 #7a4a1c; font: 400 22px var(--display); color: #3a1e08; cursor: pointer; }
  .slots { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 6px 0; }
  .slots button { padding: 8px; border-radius: 14px; border: 2.5px solid var(--ol); background: #5a3a20; color: #ffe6a8; font: 800 14px var(--body); cursor: pointer; display: flex; flex-direction: column; align-items: center; line-height: 1.2; } .slots button small { font-weight: 600; color: var(--muted); font-size: 12px; }
  .over { position: absolute; inset: 0; background: rgba(20,10,4,.6); z-index: 6; } .over .box { top: 30%; text-align: center; } .box p { color: var(--muted); }
  button:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
</style>
<div class="stage"><div class="fit" id="fit"><div class="phone" id="board">
  <canvas id="cv" width="540" height="960" aria-label="Поле боя: переправа"></canvas>
  <div class="top">
    <button class="ib" id="restart" type="button" aria-label="Заново" title="Заново">↻</button>
    <div class="ttl"><b>ПЕРЕПРАВА</b><span>Форт · <span id="clock">0:00</span></span></div>
    <span class="chip" id="cFlags" style="color:#ffcc33">⚑ 0/3</span><span class="chip" id="cFoes" style="color:#9ec1ff">⚔ 12</span><span class="chip" id="cRes" style="color:#9fe08a">+ 10</span>
    <button class="ib" id="mus" type="button" aria-label="Музыка" title="Музыка">♪</button><button class="ib" id="snd" type="button" aria-label="Звуки" title="Звуки">🔊</button>
  </div>
  <div class="phase" id="phase" hidden></div>
  <div class="rail">
    <button class="rb" id="rb0" type="button" aria-label="Марк"><span class="in"><canvas id="rbc0" width="64" height="64"></canvas></span></button>
    <button class="rb" id="rb1" type="button" aria-label="Тит"><span class="in"><canvas id="rbc1" width="64" height="64"></canvas></span></button>
    <button class="rb" id="rb2" type="button" aria-label="Гай"><span class="in"><canvas id="rbc2" width="64" height="64"></canvas></span></button>
    <button class="rb" id="rb3" type="button" aria-label="Луций"><span class="in"><canvas id="rbc3" width="64" height="64"></canvas></span></button>
  </div>
  <canvas id="mini" width="84" height="140" aria-label="Мини-карта"></canvas>
  <div class="bbar"><span id="bhint">Коснитесь генерала слева, чтобы отдать приказ</span></div>
  <div class="boostbar" id="boosts" hidden></div>
  <button class="fast" id="fast" type="button" aria-label="Скорость боя" title="Скорость боя">⏩<small>×1</small></button>
  <div class="toast" id="toast" hidden></div>
  <div class="help" id="help">
    <h3>Переправа</h3>
    <p><b>Цель:</b> захватить форт на плато вверху — встаньте у него на 6 секунд без врагов рядом. Башня и амбар на хребтах дают +3 в резерв.</p>
    <p><b>Коснитесь генерала слева или отряда</b>: время замедлится, тёмным станет то, куда не пройти, жёлтая линия — куда дойдёте за 5 секунд. Коснитесь места — отряд пойдёт, на врага — атакует.</p>
    <p><b>Инженеры</b> строят мост под левым хребтом и разбирают баррикаду на перевале — коснитесь стройки. Реку переходят по двум бродам. С холмов и бугров лучники бьют дальше. <b>Палатки</b> в лагере пополняют отряд.</p>
    <p>Карту двигайте пальцем, масштаб — щипком или колесом, мини-карта справа.</p>
    <div class="slots" id="slots"></div>
    <button type="button" class="go" id="helpOk">В бой!</button>
  </div>
  <div class="over" id="over" hidden><div class="box"><h2 id="ovT">Победа</h2><p id="ovP"></p><button type="button" id="ovB">Ещё бой</button></div></div>
</div></div></div>
<script>
'use strict';
${artHelpers}
${classes}
${SND}
${boosts}
${portraits}
${war}
</script>
`;
fs.writeFileSync(path.join(__dirname, 'war.html'), html);
console.log('ok', html.length);
