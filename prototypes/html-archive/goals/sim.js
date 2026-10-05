// Bot battles for goals.html: passive Rome and a goal-minded Rome, per objective.
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'goals.html'), 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];
function el() { return { style: {}, hidden: false, textContent: '', innerHTML: '', className: '', disabled: false, addEventListener() {}, setPointerCapture() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 540, height: 960 }), getContext: () => ctx2d(), width: 0, height: 0, setAttribute() {} }; }
function ctx2d() { return new Proxy({}, { get: (t, k) => k in t ? t[k] : (k === 'measureText' ? () => ({ width: 10 }) : () => {}), set: (t, k, v) => (t[k] = v, true) }); }
const els = {};
const sb = { document: { getElementById: id => els[id] || (els[id] = el()), createElement: () => el() }, innerWidth: 540, innerHeight: 960, addEventListener() {},
  performance: { now: () => 0 }, requestAnimationFrame() {}, setTimeout() {}, clearTimeout() {}, Math, console };
sb.window = sb; vm.createContext(sb); vm.runInContext(src, sb);
const P = sb.__plan;
const near = (c, l) => l.slice().sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y))[0];
const D = (a, x, y) => Math.hypot(a.x - x, a.y - y);

function bridgeBot() {
  const me = P.alive(1), foe = P.alive(2), r = P.G.round, Z = { x: 410, y: 398 };
  let k = 0;
  for (const c of me) {
    if (c.kind === 0) {
      const off = [-30, 0, 30][k++ % 3];
      if (r === 1) { P.order(c, P.route(c, 410 + off, 500), 'fight'); continue; }
      const t = foe.filter(e => D(e, Z.x, Z.y) < 130);
      if (t.length) { const e = near(c, t); P.order(c, P.route(c, e.x, e.y, 1), 'fight'); }
      else P.order(c, P.route(c, Z.x + off, Z.y + 10, 1), 'fight');
    } else if (c.kind === 1) P.order(c, P.route(c, r === 1 ? 412 : 420, r === 1 ? 600 : 480), 'fight');
    else {
      const prey = foe.filter(e => e.kind === 1).sort((a, b) => a.n - b.n)[0] || near(c, foe);
      if (r >= 2) P.order(c, P.route(c, prey.x, prey.y, 0), 'march'); else c.path = null;
    }
  }
}
function convoyBot() {
  const me = P.alive(1), foe = P.alive(2), d = P.G.wagon.d;
  const [wx, wy] = P.wagonAt(d), [ax, ay] = P.wagonAt(d + 300);
  let k = 0, escort = null;
  // the slowest infantry cohort walks with the wagon; the rest clear the road ahead
  const inf = me.filter(c => c.kind === 0).sort((a, b) => D(a, wx, wy) - D(b, wx, wy));
  if (inf.length) { escort = inf[0]; const [ex, ey] = P.wagonAt(d + 320); P.order(escort, P.route(escort, ex + 20, ey), 'march'); }
  for (const c of me) {
    if (c === escort) continue;
    if (c.kind === 0) {
      const t = foe.filter(e => D(e, ax, ay) < 180 || D(e, wx, wy) < 150);
      const off = [-30, 30][k++ % 2];
      if (t.length) { const e = near(c, t); P.order(c, P.route(c, e.x, e.y, 0), 'fight'); }
      else P.order(c, P.route(c, ax + off, ay - 30, 0), 'fight');
    } else if (c.kind === 1) { const [bx, by] = P.wagonAt(d + 220); P.order(c, P.route(c, bx + 40, by + 30, 0), 'fight'); }
    else { const prey = foe.filter(e => e.kind === 1).sort((a, b) => a.n - b.n)[0] || near(c, foe); if (P.G.round >= 2) P.order(c, P.route(c, prey.x, prey.y, 0), 'march'); else c.path = null; }
  }
}
function play(goal, bot) {
  P.setGoal(goal); P.newBattle(); P.start(); let g = 0;
  while (!P.G.over && g++ < 20) { if (bot) bot(); P.startRound(); for (let i = 0; i < 400 && P.G.phase === 'run'; i++) P.step(0.05); }
  return P.G;
}
for (const [goal, bot] of [['bridge', bridgeBot], ['convoy', convoyBot]]) for (const b of [null, bot]) {
  const res = []; for (let i = 0; i < 200; i++) { const G = play(goal, b); res.push({ w: G.winner, r: G.round, hold: G.hold, wd: Math.round(G.wagon.d), hp: Math.round(G.wagon.hp), s1: P.strength(1), s2: P.strength(2) }); }
  const wins = res.filter(r => r.w === 1).length;
  console.log(goal.padEnd(7), (b ? 'smart' : 'passive').padEnd(8), 'Rome', wins, '/ 200 | avg rounds', (res.reduce((s, r) => s + r.r, 0) / 200).toFixed(1), '| sample', JSON.stringify(res.slice(0, 3)));
}
if (process.argv[2]) {                                              // trace one battle
  const goal = process.argv[2]; P.setGoal(goal); P.newBattle(); P.start(); let g = 0;
  while (!P.G.over && g++ < 20) { (goal === 'bridge' ? bridgeBot : convoyBot)(); P.startRound(); for (let i = 0; i < 400 && P.G.phase === 'run'; i++) P.step(0.05);
    console.log('r' + P.G.round, 'hold', P.G.hold, 'wagon', Math.round(P.G.wagon.d), Math.round(P.G.wagon.hp), P.G.wagon.state, '|', P.alive().map(c => (c.side === 1 ? 'R' : 'B') + c.label + 'iac'[c.kind] + Math.round(c.n) + '@' + Math.round(c.x) + ',' + Math.round(c.y)).join(' ')); }
}
