// Assembles army.html: the barracks training tree, the squad card and the pre-battle screen.
const fs = require('fs'), path = require('path');
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('missing ' + a.slice(0, 40)); return src.slice(i, j); };
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
const toonGen = fs.readFileSync(path.join('..', 'toon2d', 'gen.js'), 'utf8');
const toonJs = toonGen.slice(toonGen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, toonGen.indexOf('`;\nconst html'));
const artHelpers = toonJs.slice(0, toonJs.indexOf('function drawWorld(g) {'));
const ban = between(cas, 'const BAN = {', 'const REFILL');
const portraits = between(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const unitsSrc = fs.readFileSync(path.join('..', 'toon2d', 'units.js'), 'utf8');
const unitsArt = between(unitsSrc, '// ---------------------------------------------------------------- the new soldiers', '// ---------------------------------------------------------------- shared phone chrome');
const warSrc = fs.readFileSync(path.join(__dirname, 'war.js'), 'utf8'), tutorUi = between(warSrc, '// ==== tutor-ui begin', '// ==== tutor-ui end');
const data = fs.readFileSync(path.join(__dirname, 'roster-data.js'), 'utf8'), app = fs.readFileSync(path.join(__dirname, 'army.js'), 'utf8');
const html = `<title>Казарма</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800;900&display=swap">
<style>
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --gold: #f2c14a; --ol: #2b1a10; --display: 'Lilita One', 'Alegreya Sans', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; color-scheme: dark; }
  [hidden] { display: none !important; }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; } body { background: var(--bg); color: var(--ink); font-family: var(--body); display: flex; justify-content: center; align-items: flex-start; overflow: hidden; }
  .fit { position: relative; flex: none; }
  .phone { position: absolute; left: 0; top: 0; width: 540px; height: 960px; transform-origin: 0 0; overflow: hidden; background: linear-gradient(#4a2e18, #2e1c0e); display: flex; flex-direction: column; }
  button { font: inherit; color: inherit; cursor: pointer; }
  button:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
  .top { margin: 8px; height: 60px; display: flex; align-items: center; gap: 10px; padding: 0 12px; border-radius: 18px; background: rgba(40,24,14,.94); border: 3px solid var(--gold); flex: none; }
  .x { width: 44px; height: 44px; border-radius: 14px; background: #5a3a20; border: 2.5px solid var(--ol); font: 400 22px var(--display); color: #ffe6a8; }
  .top h1 { flex: 1; margin: 0; font: 400 28px var(--display); color: #ffe6a8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .coins { height: 40px; padding: 0 14px 0 8px; border-radius: 20px; background: #5a3a20; border: 2.5px solid var(--ol); display: flex; align-items: center; gap: 8px; font: 400 20px var(--display); color: #ffe6a8; }
  .coins::before { content: ''; width: 22px; height: 22px; border-radius: 50%; background: var(--gold); border: 2px solid var(--ol); }
  .gens { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 0 12px; flex: none; }
  .gen { position: relative; height: 110px; border-radius: 16px; background: #4a2e18; border: 2.5px solid var(--ol); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 4px; }
  .gen.on { background: #6a4626; border: 4px solid #ffcc33; transform: translateY(-3px); }
  .gen canvas:first-child { border-radius: 50%; border: 3px solid var(--ol); } .gen canvas:nth-child(2) { position: absolute; left: 50%; top: 38px; margin-left: 10px; }
  .grow > canvas.av { border: 0; border-radius: 0; }
  .gen b { font: 400 17px var(--display); color: #ffe6a8; } .gen small { font: 800 12px var(--body); color: var(--muted); }
  .tree { flex: 1; overflow-y: auto; padding: 10px 12px 6px; display: flex; flex-direction: column; gap: 6px; }
  .root { display: flex; align-items: center; gap: 12px; padding: 6px 10px; border-radius: 16px; background: #5a3a20; border: 2.5px solid var(--ol); }
  .rootcap { font: 800 14px var(--body); color: var(--muted); }
  .row { padding: 4px 0 2px; } .cap { display: flex; align-items: center; gap: 6px; font: 800 15px var(--body); color: var(--muted); margin: 0 0 2px 4px; }
  .line { display: flex; align-items: center; gap: 8px; } .arr { font: 400 26px var(--display); color: #ffcc33; } .fork { display: flex; gap: 8px; }
  .node { position: relative; width: 110px; padding: 6px 4px 6px; border-radius: 16px; background: #5a3a20; border: 3px solid var(--ol); display: flex; flex-direction: column; align-items: center; line-height: 1.1; }
  .node canvas:first-child { border-radius: 12px; border: 2px solid var(--ol); } .node .ic { position: absolute; right: 8px; top: 56px; }
  .node b { font: 400 15px var(--display); color: #ffe6a8; margin-top: 3px; } .node small { font: 800 12px var(--body); color: #ffcc33; min-height: 13px; }
  .node.open { border-color: #ffcc33; box-shadow: 0 0 0 2px rgba(255,204,51,.35); animation: pulse 1.4s ease-in-out infinite alternate; }
  @keyframes pulse { to { box-shadow: 0 0 0 5px rgba(255,204,51,.15); } }
  .node.cur { border-color: #ff8a6a; background: #7a5434; } .node.cur small { color: #ffb0a6; }
  .node.lock, .node.far { filter: grayscale(.85); opacity: .62; } .node.lock { border-style: dashed; border-color: #c9b08a; } .node.lock small { color: #c9b08a; }
  .node.sel { outline: 4px solid #fff; outline-offset: 1px; }
  .lk { position: absolute; left: 50%; top: 24px; transform: translateX(-50%); font-style: normal; font-size: 22px; } .who { position: absolute; left: -4px; top: -10px; font: 400 13px var(--display); font-style: normal; background: #e2382c; color: #fff; padding: 2px 8px; border-radius: 10px; border: 2px solid var(--ol); }
  .act { margin: 6px 8px 8px; padding: 8px 10px; display: flex; align-items: center; gap: 10px; border-radius: 18px; background: rgba(40,24,14,.94); border: 3px solid var(--gold); flex: none; }
  .act canvas { border-radius: 12px; border: 2px solid var(--ol); } .act .t { flex: 1; min-width: 0; } .act .t b { display: block; font: 400 20px var(--display); color: #ffe6a8; } .act .t span { font: 800 14px var(--body); color: var(--muted); }
  .yb { height: 58px; padding: 0 18px; border-radius: 18px; border: 3.4px solid var(--ol); background: #ffc93c; box-shadow: 0 5px 0 #7a4a1c; font: 400 21px var(--display); color: #3a1e08; }
  .yb:disabled, .yb.dis { filter: grayscale(.9); opacity: .6; cursor: not-allowed; }
  .why { margin: 6px 8px 0; padding: 9px 12px; border-radius: 14px; background: rgba(255,230,168,.14); border: 2px solid #f2c14a; color: #ffe6a8; font: 700 15px var(--body); line-height: 1.3; flex: none; }
  .why[hidden] { display: none; } .why.pulse { animation: whyp .6s; } @keyframes whyp { 0%, 100% { background: rgba(255,230,168,.14); } 40% { background: rgba(242,193,74,.5); } }
  .ib { width: 48px; height: 48px; border-radius: 14px; background: #5a3a20; border: 2.5px solid var(--ol); font: 400 22px var(--display); color: #ffe6a8; }
  .card { position: absolute; inset: 0; background: rgba(10,5,2,.6); display: flex; align-items: flex-end; z-index: 5; }
  .sheet { position: relative; width: 100%; max-height: 82%; overflow-y: auto; padding: 18px 16px 22px; border-radius: 28px 28px 0 0; background: linear-gradient(#5a3a20, #3a2414); border-top: 3px solid var(--gold); }
  .sheet .x { position: absolute; right: 14px; top: 12px; }
  .ctop { display: flex; gap: 12px; } .ctop > canvas { border-radius: 16px; border: 3px solid var(--ol); flex: none; }
  .cside h3 { margin: 4px 0 2px; font: 400 30px var(--display); color: #ffe6a8; display: flex; align-items: center; gap: 6px; } .tier { margin: 0; font: 800 14px var(--body); color: var(--muted); } .role { margin: 8px 0 0; font: 800 18px var(--body); color: #fff3dc; line-height: 1.25; }
  .stats { margin: 14px 0 6px; display: grid; gap: 6px; } .st { display: grid; grid-template-columns: 140px 1fr 44px; align-items: center; font: 800 17px var(--body); } .st b { font: 400 17px var(--display); color: #ffe6a8; text-align: right; }
  .pips { display: flex; gap: 5px; } .pips i { width: 26px; height: 16px; border-radius: 5px; background: #2e1c0e; border: 2px solid var(--ol); } .pips i.on { background: #ffcc33; }
  .ord { margin: 10px 0; display: flex; gap: 12px; align-items: center; padding: 10px; border-radius: 18px; background: rgba(40,24,14,.9); border: 2.5px solid var(--gold); }
  .ob { flex: none; width: 60px; height: 60px; border-radius: 50%; background: #ffc93c; border: 3.4px solid var(--ol); box-shadow: 0 0 0 3px #ffcc33; display: grid; place-items: center; font: 400 26px var(--display); color: #3a1e08; }
  .ord b { font: 400 21px var(--display); color: #ffe6a8; } .ord p { margin: 2px 0 0; font: 800 16px var(--body); color: #fff3dc; }
  .ctr { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 6px 0; } .cl { font: 800 17px var(--body); min-width: 170px; } .ctr.up .cl { color: #ffcc33; } .ctr.down .cl { color: #ff9a8a; }
  .tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px 3px 4px; border-radius: 14px; background: #fff; color: #2b1a10; } .tag small { font: 800 14px var(--body); }
  .pre { flex: 1; display: flex; flex-direction: column; padding: 0 8px 8px; gap: 8px; min-height: 0; }
  .rc { padding: 10px 12px; border-radius: 18px; background: rgba(40,24,14,.94); border: 3px solid var(--gold); } .rc h2 { margin: 0 0 6px; font: 400 20px var(--display); color: #ffe6a8; }
  .recon { display: flex; gap: 10px; } .foe { position: relative; display: flex; flex-direction: column; align-items: center; } .foe canvas:first-child { border-radius: 12px; border: 2.5px solid #3f7ae0; } .foe .ic { position: absolute; right: -6px; top: -6px; } .foe small { font: 800 13px var(--body); color: #b8d0ff; }
  .advice { margin: 8px 0 0; font: 800 16px var(--body); color: #ffe6a8; }
  .rows { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
  .grow { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 18px; background: #4a2e18; border: 2.5px solid var(--ol); text-align: left; }
  .grow > canvas:first-child { border-radius: 50%; border: 3px solid var(--ol); flex: none; } .grow > canvas:nth-child(2) { border-radius: 12px; border: 2px solid var(--ol); flex: none; }
  .gmid { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; } .gnm { display: flex; align-items: center; gap: 4px; } .gnm b { font: 400 19px var(--display); color: #ffe6a8; }
  .bd { font: 800 14px var(--body); color: var(--muted); padding: 2px 8px; border-radius: 12px; border: 2px solid transparent; } .bd.up { color: #ffcc33; border-color: #ffcc33; background: rgba(255,204,51,.12); } .bd.down { color: #ff9a8a; border-color: #ff9a8a; }
  .chev { font: 400 32px var(--display); color: #c9b08a; }
  .go { align-self: center; width: 320px; height: 70px; font-size: 28px; }
</style>
<div class="fit" id="fit"><div class="phone" id="board">
  <div class="top"><button class="x" id="close" type="button" aria-label="Назад">←</button><h1 id="ttl">Казарма</h1><span class="coins" id="coins">0</span></div>
  <section id="barracks" style="display:flex;flex-direction:column;flex:1;min-height:0">
    <div class="gens" id="gens"></div>
    <div class="tree" id="tree"></div>
    <div class="why" id="why" role="status" hidden></div>
    <div class="act"><span id="apic"></span><div class="t"><b id="aname"></b><span id="ainfo"></span></div><button class="ib" id="info" type="button" aria-label="Карточка отряда">ⓘ</button><button class="yb" id="retrain" type="button">Переобучить</button></div>
  </section>
  <section class="pre" id="pre" hidden>
    <div class="rc"><h2>Разведка: кого ждать</h2><div class="recon" id="recon"></div><p class="advice" id="advice"></p></div>
    <div class="rows" id="rows"></div>
    <button class="yb go" id="fight" type="button">В бой!</button>
  </section>
  <div class="card" id="card" hidden><div class="sheet"><button class="x" id="cclose" type="button" aria-label="Закрыть">✕</button><div id="cbody"></div></div></div>
</div></div>
<script>
'use strict';
${artHelpers}
${ban}
${portraits}
${unitsArt}
${data}
${tutorUi}
${app}
</script>
`;
fs.writeFileSync(path.join(__dirname, 'army.html'), html);
console.log('ok', html.length);
