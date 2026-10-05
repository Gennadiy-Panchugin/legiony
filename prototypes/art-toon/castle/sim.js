// Bot battles for castle.html: passive Rome vs a deliberate player bot.
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'castle.html'), 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];
function el() { return { style: {}, hidden: false, textContent: '', innerHTML: '', className: '', disabled: false, children: [], addEventListener() {}, getContext: undefined, setPointerCapture() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 540, height: 960 }), getContext: () => ctx2d(), width: 0, height: 0, setAttribute() {} }; }
function ctx2d() { return new Proxy({}, { get: (t, k) => k in t ? t[k] : (k === 'measureText' ? () => ({ width: 10 }) : (k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {})), set: (t, k, v) => (t[k] = v, true) }); }
const els = {};
const sb = { document: { addEventListener() {}, hidden: false, getElementById: id => els[id] || (els[id] = el()), createElement: () => el() }, innerWidth: 540, innerHeight: 960, addEventListener() {},
  performance: { now: () => 0 }, requestAnimationFrame() {}, setTimeout() {}, clearTimeout() {}, Math, console };
sb.window = sb; vm.createContext(sb); vm.runInContext(src, sb);
const P = sb.__cs;
const D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function bot() {
  const G = P.G, T = P.T, me = P.alive(1), foes = P.alive(2).filter(e => e.ai !== 'tower');
  const fighters = me.filter(s => s.cls !== 'eng'), eng = me.filter(s => s.cls === 'eng');
  const camps = G.camps.filter(c => c.owner === 2);
  const gateOpen = T[4][4] === 'g';
  const bridgeBlocked = T[8][4] === 'R';
  const stage = bridgeBlocked ? 'bridge' : (camps.length && G.t < 150) ? 'camps' : gateOpen ? 'keep' : 'gate';
  const cen = fighters.length ? { x: fighters.reduce((s, f) => s + f.x, 0) / fighters.length, y: fighters.reduce((s, f) => s + f.y, 0) / fighters.length } : null;
  const staged = [[5, 3], [6, 4], [5, 5], [5, 2], [5, 6]];
  // one shared target: the enemy nearest to the group
  const focus = cen ? foes.filter(e => D(cen, e) < 300).sort((x, y) => D(cen, x) - D(cen, y))[0] : null;
  fighters.forEach((s, i) => {
    if (s.fighting && s.skill && s.cd <= 0) P.useSkill(s, true);
    if (s.to) return;
    if (stage === 'bridge') {
      const foe2 = foes.filter(e => e.r >= 9 && D(s, e) < 260).sort((x, y) => D(s, x) - D(s, y))[0];
      if (foe2 && s.kind !== 2) { if (s.atk !== foe2) P.cmd(s, foe2.r, foe2.c, true); return; }
      if (s.path.length || s.fighting) return;
      const [r, c] = s.kind === 1 ? [9, 2] : [[9, 3], [9, 5], [10, 4], [10, 3]][i % 4]; if (s.r !== r || s.c !== c) P.cmd(s, r, c, true); return;
    }
    if (focus && stage !== 'gate') {
      let tgt = focus;
      if (s.cls === 'eques' && focus.kind !== 1) tgt = foes.filter(e => e.kind === 1 && D(s, e) < 400)[0] || null;
      if (tgt) { if (s.atk !== tgt) P.cmd(s, tgt.r, tgt.c, true); return; }
      if (s.fighting) return;
    }
    if (s.path.length) return;
    if (s.fighting) return;
    if (stage === 'camps') { const cp = camps.slice().sort((x, y) => x.c - y.c)[0]; const spots = [[cp.r, cp.c], [cp.r + 1, cp.c], [cp.r + 1, cp.c + (cp.c < 4 ? 1 : -1)], [cp.r + 2, cp.c]]; const [r, c] = spots[i % spots.length]; if ((s.r !== r || s.c !== c) && !(s.path.length && s.path[s.path.length - 1][0] === r && s.path[s.path.length - 1][1] === c)) P.cmd(s, r, c, true); }
    else if (stage === 'gate') { const [r, c] = staged[i % staged.length]; if (s.r !== r || s.c !== c) P.cmd(s, r, c, true); }
    else { const tgt = foes.filter(e => e.r <= 4).sort((x, y) => D(s, x) - D(s, y))[0]; if (tgt && !s.atk) P.cmd(s, tgt.r, tgt.c, true); else if (i === 0 || !fighters.some((f, j) => j < i && f.r <= 2)) { if (!(s.r === 1 && s.c === 4)) P.cmd(s, 1, 4, true); } else if (!(s.r === 2 && s.c === 3)) P.cmd(s, 2, 3, true); }
  });
  eng.forEach(s => {
    if (s.skill && s.work && s.cd <= 0) P.useSkill(s, true);
    if (s.to || s.path.length || s.work) return;
    if (stage === 'bridge') { P.cmd(s, 8, 4, true); return; }
    if (stage === 'gate') { const ready = fighters.every(f => f.r <= 7 && f.r >= 4) || G.t > 100; if (ready) P.cmd(s, 4, 4, true); else if (cen) { const [r, c] = [Math.min(11, Math.round((cen.y - 90 - 30) / 60) + 2), Math.round((cen.x - 30) / 60)]; if (s.r !== r || s.c !== c) P.cmd(s, r, c, true); } }
    else if (stage === 'keep') { if (s.r !== 5 || s.c !== 4) P.cmd(s, 5, 4, true); }
    else if (cen) { const [r, c] = [Math.min(11, Math.round((cen.y - 90 - 30) / 60) + 2), Math.round((cen.x - 30) / 60)]; if (s.r !== r || s.c !== c) P.cmd(s, r, c, true); }
  });
}
function play(mode, slots) {
  P.setSlots(slots); P.newBattle(); P.start();
  let acc = 0;
  while (!P.G.over) { acc += 0.05; if (mode === 'bot' && acc >= 0.5) { acc = 0; bot(); } P.step(0.05); if (P.G.t > 300) break; }
  const G = P.G;
  return { w: G.winner || 2, t: Math.round(G.t), camps: G.camps.filter(c => c.owner === 1).length, towers: P.alive(2).filter(s => s.ai === 'tower').length, kills: G.kills, lost: G.lost, gate: P.T[4][4] };
}
const SL = ['hastati', 'velites', 'eques', 'eng'];
const N = +process.argv[2] || 100;
if (process.argv[3] === 'trace') {
  P.setSlots(SL); P.newBattle(); P.start(); let acc = 0, lastT = -10;
  while (!P.G.over && P.G.t < 200) { acc += 0.05; if (acc >= 0.5) { acc = 0; bot(); } P.step(0.05);
    if (P.G.t - lastT >= 8) { lastT = P.G.t; console.log(Math.round(P.G.t), P.G.camps.map(c => c.owner + ':' + c.prog.toFixed(1)).join('/'), P.alive().filter(s => s.ai !== 'tower').map(s => (s.side === 1 ? 'R' : 'B') + s.cls.slice(0, 3) + Math.round(s.n * 10) / 10 + '@' + s.r + ',' + s.c + (s.fighting ? '*' : '')).join(' ')); } }
  process.exit(0);
}
for (const mode of ['passive', 'bot']) {
  const res = []; for (let i = 0; i < N; i++) res.push(play(mode, SL));
  const wins = res.filter(r => r.w === 1).length;
  const avg = k => (res.reduce((s, r) => s + r[k], 0) / res.length).toFixed(1);
  console.log(mode.padEnd(8), 'Rome', wins, '/', N, '| avg t', avg('t'), 'camps', avg('camps'), 'towers left', avg('towers'), 'kills', avg('kills'), 'lost', avg('lost'), '| gate open', res.filter(r => r.gate === 'g').length);
}
if (process.argv[3] === 'dbg') {
  P.setSlots(SL); P.newBattle(); P.start(); let acc = 0;
  while (!P.G.over && P.G.t < 130) { acc += 0.05; if (acc >= 0.5) { acc = 0; bot(); } P.step(0.05); }
  const e = P.alive(1).find(s => s.cls === 'eng');
  console.log('eng', e.r, e.c, 'path', JSON.stringify(e.path), 'work', JSON.stringify(e.work), 'to', e.to, 'sk', e.sk);
  console.log('cmd result', P.cmd(e, 4, 4, false), JSON.stringify(e.path), JSON.stringify(e.work));
  console.log('occ (5,4)', P.G.occ.get(P.key(5, 4)) && P.G.occ.get(P.key(5, 4)).cls);
}
if (process.argv[3] === 'keep') {
  P.setSlots(SL); P.newBattle(); P.start(); let acc = 0;
  while (!P.G.over && P.G.t < 260) { acc += 0.05; if (acc >= 0.5) { acc = 0; bot(); } P.step(0.05); }
  console.log('t', P.G.t.toFixed(0), 'keep', P.G.keep.prog.toFixed(1), P.alive().map(s => s.cls + '@' + s.r + ',' + s.c + ' path' + JSON.stringify(s.path) + ' to' + JSON.stringify(s.to)).join(' | '));
}
