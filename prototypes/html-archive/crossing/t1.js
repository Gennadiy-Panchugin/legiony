const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync('crossing.html', 'utf8'), src = html.match(/<script>([\s\S]*)<\/script>/)[1];
function el() { return { style: {}, hidden: false, textContent: '', innerHTML: '', className: '', disabled: false, children: [], addEventListener() {}, setPointerCapture() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 540, height: 960 }), getContext: () => ctx2d(), width: 0, height: 0, setAttribute() {}, setProperty() {} }; }
function ctx2d() { return new Proxy({}, { get: (t, k) => k in t ? t[k] : (k === 'measureText' ? () => ({ width: 10 }) : (k === 'createLinearGradient' || k === 'createRadialGradient' ? () => ({ addColorStop() {} }) : () => {})), set: (t, k, v) => (t[k] = v, true) }); }
const els = {};
const sb = { document: { addEventListener() {}, hidden: false, getElementById: id => els[id] || (els[id] = el()), createElement: () => el() }, innerWidth: 540, innerHeight: 960, addEventListener() {}, performance: { now: () => 0 }, requestAnimationFrame() {}, setTimeout() {}, clearTimeout() {}, Math, console };
sb.window = sb; vm.createContext(sb); vm.runInContext(src, sb);
const P = sb.__cr;
const cnt = {}; for (let i = 0; i < P.NAV.length; i++) cnt[P.NAV[i]] = (cnt[P.NAV[i]] || 0) + 1;
console.log('nav classes (0 blocked,1 plain,2 forest,3 steep corridor,4 ford):', JSON.stringify(cnt), 'corridor cells', Array.from(P.COR).reduce((a, b) => a + b, 0));
P.newBattle(); P.start();
const G = P.G, me = G.rome[0];
const to = (x, y) => { const p = P.findPath(me.x, me.y, x, y, 1); return p ? 'ok ' + p.length + ' wp' : 'NO PATH'; };
for (const b of P.BUILD) console.log('start -> ' + b.t + ':', to(b.x, b.y + 12));
console.log('start -> fort via closed barricade (should use the east trail):', (() => { const p = P.findPath(me.x, me.y, 240, 224, 1); if (!p) return 'NO PATH'; return 'ok, passes x range ' + Math.min(...p.map(a => a[0])).toFixed(0) + '..' + Math.max(...p.map(a => a[0])).toFixed(0); })());
console.log('river cross away from the ford (should fail):', to(120, 520));
console.log('plain, north bank:', to(150, 420), '| plateau top (255,230):', to(255, 232));
for (const [cls, n, x, y] of P.ENEMIES) { const c = P.cellOf(x, y); if (!P.pass(c, 2)) console.log('enemy on blocked cell', cls, x, y); }
for (const s of G.sq) if (s.side === 1) if (!P.pass(P.cellOf(s.x, s.y), 1)) console.log('our squad on blocked cell', s.x, s.y);
// the barricade
console.log('barricade closed, fort via centre:', P.findPath(240, 330, 240, 262, 1) ? 'path' : 'closed');
P.OB.open = true; for (const [c, n] of P.OB.cells) P.NAV[c] = n;
console.log('barricade open, fort via centre:', P.findPath(240, 330, 240, 262, 1) ? 'path' : 'closed');
// 60 s of nothing
P.newBattle(); P.start(); for (let i = 0; i < 1200; i++) P.step(0.05);
console.log('passive 60 s: lost', P.G.lost, 'kills', P.G.kills, 'alarms', Object.keys(P.G.alarm).length);
const len = p => { let l = 0, c = [240, 330]; for (const q of p) { l += Math.hypot(q[0] - c[0], q[1] - c[1]); c = q; } return l; };
P.newBattle(); P.start();
const closed = P.findPath(240, 330, 240, 262, 1), closedLen = len(closed);
for (const [c, n] of P.OB.cells) P.NAV[c] = n; const open = P.findPath(240, 330, 240, 262, 1), openLen = len(open);
console.log('pass 330 -> fort 262: closed', closedLen.toFixed(0), 'px; open', openLen.toFixed(0), 'px');
for (const [c] of P.OB.cells) P.NAV[c] = 0;
let row = ''; for (let x = 150; x <= 330; x += 6) row += P.NAV[P.cellOf(x, 298)]; console.log('NAV along y=298, x 150..330:', row);
row = ''; for (let x = 150; x <= 330; x += 6) row += P.NAV[P.cellOf(x, 280)]; console.log('NAV along y=280:', row);
row = ''; for (let x = 150; x <= 330; x += 6) row += P.NAV[P.cellOf(x, 320)]; console.log('NAV along y=320:', row);
