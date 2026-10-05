// Map checks and a generic bot for the three maps of castle.html.
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'castle.html'), 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];
function el() { return { style: {}, hidden: false, textContent: '', innerHTML: '', className: '', disabled: false, children: [], addEventListener() {}, setPointerCapture() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 540, height: 960 }), getContext: () => ctx2d(), width: 0, height: 0, setAttribute() {}, setProperty() {} }; }
function ctx2d() { return new Proxy({}, { get: (t, k) => k in t ? t[k] : (k === 'measureText' ? () => ({ width: 10 }) : (k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {})), set: (t, k, v) => (t[k] = v, true) }); }
const els = {};
const sb = { document: { addEventListener() {}, hidden: false, getElementById: id => els[id] || (els[id] = el()), createElement: () => el() }, innerWidth: 540, innerHeight: 960, addEventListener() {},
  performance: { now: () => 0 }, requestAnimationFrame() {}, setTimeout() {}, clearTimeout() {}, Math, console };
sb.window = sb; vm.createContext(sb); vm.runInContext(src, sb);
const P = sb.__cs;
const COLS = P.COLS;
const D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const WORKABLE = 'RQPWG';

// ---------------------------------------------------------------- static checks
let bad = 0;
for (const id of Object.keys(P.MAPS)) {
  P.setMap(id); P.newBattle(); P.start();
  const M = P.M, T = P.T, rows = M.rows, R = rows.length;
  rows.forEach((r, i) => { if (r.length !== COLS) { console.log(id, 'row', i, 'has length', r.length); bad++; } });
  const seen = new Set();
  const walk = (r, c) => r >= 0 && c >= 0 && r < R && c < COLS && (P.passable(1, r, c) || WORKABLE.includes(T[r][c]) || T[r][c] === 'G');
  const reach = new Set(); const q = [];
  M.start.forEach(([r, c]) => { if (!P.passable(1, r, c)) { console.log(id, 'start blocked', r, c); bad++; } q.push([r, c]); reach.add(r * COLS + c); });
  while (q.length) { const [r, c] = q.shift(); for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nr = r + dr, nc = c + dc; if (!walk(nr, nc) || reach.has(nr * COLS + nc) || !P.canStep(r, c, nr, nc)) continue; reach.add(nr * COLS + nc); q.push([nr, nc]); } }
  M.points.forEach(p => { const own = reach.has(p.r * COLS + p.c), near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dr, dc]) => reach.has((p.r + dr) * COLS + p.c + dc)); if (!own && !(near && !P.passable(1, p.r, p.c))) { console.log(id, 'point unreachable', p.name); bad++; } });
  M.enemies.forEach(([r, c, cls, n, ai]) => { const k = r * COLS + c; if (seen.has(k)) { console.log(id, 'two enemies on', r, c); bad++; } seen.add(k);
    if (ai !== 'tower' && !P.passable(2, r, c)) { console.log(id, 'enemy on blocked cell', r, c, T[r][c]); bad++; } if (ai !== 'tower' && !reach.has(k)) { console.log(id, 'enemy cell not reachable', r, c); bad++; } });
  console.log(id.padEnd(7), 'rows', R, 'enemies', M.enemies.length, 'reachable cells', reach.size);
}
console.log(bad ? 'PROBLEMS: ' + bad : 'maps ok');

// ---------------------------------------------------------------- a generic bot
function bfsPath(from, to) {
  const T = P.T, R = P.ROWS, key = (r, c) => r * COLS + c; const prev = new Map([[key(from[0], from[1]), null]]); const q = [from];
  const walk = (r, c) => r >= 0 && c >= 0 && r < R && c < COLS && (P.passable(1, r, c) || WORKABLE.includes(T[r][c]) || (r === to[0] && c === to[1]));
  while (q.length) { const [r, c] = q.shift(); if (r === to[0] && c === to[1]) break;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nr = r + dr, nc = c + dc; if (!walk(nr, nc) || prev.has(key(nr, nc)) || !P.canStep(r, c, nr, nc)) continue; prev.set(key(nr, nc), [r, c]); q.push([nr, nc]); } }
  if (!prev.has(key(to[0], to[1]))) return null; const out = []; for (let k = [to[0], to[1]]; k; k = prev.get(key(k[0], k[1]))) out.push(k); return out.reverse();
}
function bot() {
  const G = P.G, T = P.T, M = P.M, me = P.alive(1), foes = P.alive(2).filter(e => e.ai !== 'tower');
  const fighters = me.filter(s => s.cls !== 'eng'), eng = me.find(s => s.cls === 'eng');
  if (!fighters.length) return;
  const open = G.points.filter(p => p.owner === 2); if (!open.length) return;
  const start = M.start[0], pd = p => Math.hypot(p.r - start[0], p.c - start[1]);
  const finalIdx = M.win.final;
  const todo = open.slice().sort((a, b) => (G.points.indexOf(a) === finalIdx) - (G.points.indexOf(b) === finalIdx) || pd(a) - pd(b));
  const target = todo[0];
  const cen = { x: fighters.reduce((a, s) => a + s.x, 0) / fighters.length, y: fighters.reduce((a, s) => a + s.y, 0) / fighters.length };
  const focus = foes.filter(e => D(cen, e) < 330).sort((a, b) => D(cen, a) - D(cen, b))[0];
  // the road to the target and the first thing on it that needs the engineers
  const lead = fighters.slice().sort((a, b) => Math.hypot(a.r - target.r, a.c - target.c) - Math.hypot(b.r - target.r, b.c - target.c))[0];
  const road = bfsPath([lead.r, lead.c], [target.r, target.c]) || [];
  const blockI = road.findIndex(([r, c]) => WORKABLE.includes(T[r][c]));
  fighters.forEach((s, i) => {
    if (s.fighting && s.boosts.length && s.boosts[0].cd <= 0) P.useBoost(s, 0, true);
    if (s.to) return;
    const coming = foes.filter(e => e.atk && D(cen, e) < 460).sort((x, y) => D(s, x) - D(s, y))[0];
    if (coming) { const d = D(s, coming); if (s.cls === 'eques' && coming.kind !== 1) return; if (d <= 130 || (s.kind === 1 && d <= 200)) { if (s.atk !== coming) P.cmd(s, coming.r, coming.c, true); } return; }
    if (focus && D(cen, focus) < 260 && !(blockI >= 0 && D(cen, focus) > 200)) { if (s.cls === 'eques' && focus.kind !== 1) return; if (s.atk !== focus) P.cmd(s, focus.r, focus.c, true); return; }
    if (s.path.length || s.fighting) return;
    let goal;
    if (blockI > 1) goal = road[blockI - 2]; else if (blockI >= 0) goal = road[Math.max(0, blockI - 1)]; else goal = [target.r + (i % 2 ? 1 : 0), target.c + (i % 3) - 1];
    if (!P.passable(1, goal[0], goal[1])) goal = [target.r, target.c];
    if (s.r !== goal[0] || s.c !== goal[1]) P.cmd(s, goal[0], goal[1], true);
  });
  if (eng && !eng.to && !eng.path.length && !eng.work) {
    if (blockI >= 0 && !focus) P.cmd(eng, road[blockI][0], road[blockI][1], true);
    else { const f = fighters[0], g = road.length > 3 ? road[Math.max(0, road.findIndex(([r, c]) => r === f.r && c === f.c) - 2)] : [f.r, f.c]; if (g && (eng.r !== g[0] || eng.c !== g[1])) P.cmd(eng, g[0], g[1], true); }
  }
}
function play(id, mode, limit) {
  P.setMap(id); P.setSlots(['hastati', 'velites', 'eques', 'eng']); P.newBattle(); P.start(); let acc = 0, firstContact = null;
  while (!P.G.over && P.G.t < limit) { acc += 0.05; if (mode === 'bot' && acc >= 0.5) { acc = 0; bot(); } P.step(0.05); if (firstContact === null && P.alive().some(s => s.fighting)) firstContact = P.G.t; }
  const G = P.G; return { w: G.winner || 0, t: Math.round(G.t), kills: G.kills, lost: G.lost, caps: G.points.filter(p => p.owner === 1).length, contact: firstContact === null ? -1 : Math.round(firstContact), alarms: Object.keys(G.alarm).length };
}
const N = +process.argv[2] || 12;
for (const id of Object.keys(P.MAPS)) {
  const passive = play(id, 'passive', 200);
  const res = []; for (let i = 0; i < N; i++) res.push(play(id, 'bot', 600));
  const avg = k => (res.reduce((a, r) => a + r[k], 0) / res.length).toFixed(1);
  console.log(id.padEnd(7), 'passive: contact', passive.contact, 'lost', passive.lost, 'kills', passive.kills, '| bot wins', res.filter(r => r.w === 1).length + '/' + N, 'avg t', avg('t'), 'caps', avg('caps'), 'kills', avg('kills'), 'lost', avg('lost'), 'zones alarmed', avg('alarms'));
}
if (process.argv[3] === 'trace') {
  const id = process.argv[4] || 'city'; P.setMap(id); P.setSlots(['hastati', 'velites', 'eques', 'eng']); P.newBattle(); P.start(); let acc = 0, last = -10;
  while (!P.G.over && P.G.t < 150) { acc += 0.05; if (acc >= 0.5) { acc = 0; bot(); } P.step(0.05);
    if (P.G.t - last >= 6) { last = P.G.t; console.log(Math.round(P.G.t), P.alive().filter(s => s.ai !== 'tower').map(s => (s.side === 1 ? 'R' : 'B') + s.cls.slice(0, 3) + Math.round(s.n * 10) / 10 + '@' + s.r + ',' + s.c + (s.fighting ? '*' : '')).join(' ')); } }
}
