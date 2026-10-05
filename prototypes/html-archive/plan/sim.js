// Bot battles for plan.html: passive Rome vs mirrored-AI Rome.
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'plan.html'), 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];
function el() { return { style: {}, hidden: false, textContent: '', innerHTML: '', className: '', disabled: false, addEventListener() {}, setPointerCapture() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 540, height: 960 }), getContext: () => ctx2d(), width: 0, height: 0, setAttribute() {} }; }
function ctx2d() { return new Proxy({}, { get: (t, k) => k in t ? t[k] : (k === 'createImageData' ? () => ({ data: [] }) : () => {}), set: (t, k, v) => (t[k] = v, true) }); }
const els = {};
const sb = { window: {}, document: { getElementById: id => els[id] || (els[id] = el()), createElement: () => el() }, innerWidth: 540, innerHeight: 960, addEventListener() {},
  performance: { now: () => 0 }, requestAnimationFrame() {}, setTimeout() {}, clearTimeout() {}, Math, console };
sb.window = sb; vm.createContext(sb); vm.runInContext(src, sb);
const P = sb.__plan;
function play(mode) {
  P.newBattle(); P.start();
  let guard = 0;
  while (!P.G.over && guard++ < 20) {
    if (mode === 'bot') P.aiPlan(1);
    P.startRound();
    for (let i = 0; i < 15 / 0.05 + 2 && P.G.phase === 'run'; i++) P.step(0.05);
  }
  return { w: P.G.winner, r: P.G.round, s1: P.strength(1), s2: P.strength(2) };
}
for (const mode of ['passive', 'bot']) {
  const res = []; for (let i = 0; i < 200; i++) res.push(play(mode));
  const wins = [1, 2, 3].map(w => res.filter(r => r.w === w).length);
  const avgR = (res.reduce((s, r) => s + r.r, 0) / res.length).toFixed(2);
  console.log(mode.padEnd(8), 'Rome', wins[0], 'enemy', wins[1], 'draw', wins[2], '| avg rounds', avgR, '| sample', JSON.stringify(res.slice(0, 4)));
}
// a deliberate player: mass the infantry on one bridge, archers cover from the hill, cavalry hunts archers
function smart() {
  const me = P.alive(1), foe = P.alive(2), r = P.G.round;
  const near = (c, l) => l.slice().sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y))[0];
  for (const c of me) {
    if (c.kind === 0) {
      if (r === 1) P.order(c, P.route(c, 410 + (c.x - 270) * 0.3, 500), 'fight');
      else { const melee = foe.filter(e => e.kind !== 1); if (r >= 3 && !melee.length) P.order(c, P.route(c, 270, 150, 1), 'march'); else { const e = near(c, foe); P.order(c, P.route(c, e.x, e.y, 1), 'fight'); } }
    } else if (c.kind === 1) {
      if (r === 1) P.order(c, P.route(c, 412, 600), 'fight');
      else { const inf = me.filter(m => m.kind === 0); const m = inf.length ? near(c, inf) : c; P.order(c, P.route(c, m.x, m.y + 60, 1), 'fight'); }
    } else {
      const prey = foe.filter(e => e.kind === 1).sort((a, b) => a.n - b.n)[0] || near(c, foe);
      if (r >= 2) P.order(c, P.route(c, prey.x, prey.y, 0), 'march'); else c.path = null;
    }
  }
}
function play2() {
  P.newBattle(); P.start(); let g = 0;
  while (!P.G.over && g++ < 20) { smart(); P.startRound(); for (let i = 0; i < 400 && P.G.phase === 'run'; i++) P.step(0.05); }
  return P.G.winner;
}
{ const res = []; for (let i = 0; i < 200; i++) res.push(play2()); console.log('smart    Rome', res.filter(w => w === 1).length, 'enemy', res.filter(w => w === 2).length); }
{ P.newBattle(); P.start(); let g = 0;
  while (!P.G.over && g++ < 20) { smart(); P.startRound(); for (let i = 0; i < 400 && P.G.phase === 'run'; i++) P.step(0.05);
    console.log('after round', P.G.round - (P.G.over ? 0 : 1), P.alive().map(c => (c.side === 1 ? 'R' : 'B') + c.label + ['i', 'a', 'c'][c.kind] + Math.round(c.n) + '@' + Math.round(c.x) + ',' + Math.round(c.y)).join(' ')); } }
