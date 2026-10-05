// ---------------------------------------------------------------- world: a low-poly diorama 480 × 720; free movement on the plain, slabs on paths, fords and slopes
const W = 540, H = 960, DPR = Math.min(2, window.devicePixelRatio || 1);
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
cv.width = W * DPR; cv.height = H * DPR; ctx.scale(DPR, DPR);
const $ = id => document.getElementById(id);
function fit() {
  const k = Math.max(0.3, Math.min((innerWidth - 32) / W, (innerHeight - 32) / H, 1.2));
  $('board').style.transform = 'scale(' + k + ')';
  $('fit').style.width = W * k + 'px'; $('fit').style.height = H * k + 'px';
}
addEventListener('resize', fit); addEventListener('load', fit); fit();

const WX = 480, WY = 720, SCW = 1.125, VTOP = 96, VH = H - VTOP, VC = VTOP + VH / 2, RSd = Math.min(2.2, DPR * 1.4), TOPPAD = 24, BOTPAD = 60;
const ell = (cx, cy, rx, ry, p) => (x, y) => { const nx = (x - cx) / rx, ny = (y - cy) / ry, n = 1 + 0.1 * Math.sin(x * 0.045 + y * 0.03) + 0.07 * Math.sin(x * 0.11 - y * 0.07); return Math.pow(Math.abs(nx), p) + Math.pow(Math.abs(ny), p) < n; };
const E = (x, y, cx, cy, rx, ry, a) => gau(x, y, cx, cy, rx, ry, a);
const spec = {
  seed: 11, water: 0.02, mask: ell(240, 385, 210, 305, 3.4),
  h: (x, y) => {
    let v = 0.1 + E(x, y, 62, 320, 60, 150, 0.62) + E(x, y, 418, 330, 60, 150, 0.62) + sst(290, 200, y) * 0.75 + E(x, y, 158, 300, 34, 34, 0.7) + E(x, y, 322, 300, 34, 34, 0.7);
    v -= E(x, y, 240, 500, 400, 24, 0.34) * (1 - E(x, y, 240, 500, 13, 60, 0.97)); v += E(x, y, 240, 500, 12, 22, 0.1);
    return v;
  }
};
// the height grid, sampled once
const GS = 6, GW = Math.ceil(WX / GS), GH = Math.ceil(WY / GS), HW = GW + 1;
const HGR = new Float32Array(HW * (GH + 1));
for (let j = 0; j <= GH; j++) for (let i = 0; i <= GW; i++) { const x = i * GS, y = j * GS; HGR[j * HW + i] = spec.mask(x, y) ? spec.h(x, y) : -0.3; }
function hAt(x, y) {
  const fx = Math.max(0, Math.min(GW - 0.001, x / GS)), fy = Math.max(0, Math.min(GH - 0.001, y / GS)), i = fx | 0, j = fy | 0, tx = fx - i, ty = fy - j;
  const a = HGR[j * HW + i], b = HGR[j * HW + i + 1], c = HGR[(j + 1) * HW + i], d = HGR[(j + 1) * HW + i + 1];
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
}
const lift = (x, y) => Math.max(0, hAt(x, y)) * K;

// ---------------------------------------------------------------- paths (slab corridors), buildings, camp
const PATHS = [
  [[240, 650], [240, 605], [240, 560], [240, 500], [240, 450], [240, 395], [240, 345], [240, 300], [240, 262], [240, 225]],
  [[240, 450], [190, 432], [140, 392], [96, 352]],
  [[240, 450], [300, 432], [350, 395], [394, 358]],
  [[394, 358], [378, 322], [345, 280], [300, 245], [255, 225]]
];
const NODES = []; for (const line of PATHS) for (const [x, y] of line) if (!NODES.some(n => Math.hypot(n[0] - x, n[1] - y) < 6)) NODES.push([x, y]);
const CAMP = { x: 240, y: 650, r: 88 }, TENTS = [[170, 654], [310, 654], [240, 666]];
const BUILD = [{ t: 'tower', x: 84, y: 346, fx: 16, fh: 66 }, { t: 'granary', x: 404, y: 352, fx: 22, fh: 40 }, { t: 'hall', x: 240, y: 214, fx: 26, fh: 62 }];
const DECOR = [{ t: 'house', x: 300, y: 560 }, { t: 'house', x: 175, y: 275 }, { t: 'house', x: 120, y: 470 }];
const OB = { x: 240, y: 300, hw: 46, hh: 10, open: false, cells: [] };
function segDist(px, py, x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2)); return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t)); }

// ---------------------------------------------------------------- navigation grid: plain, forest, road, steep (corridor only), ford (corridor only), blocked
const NN = GW * GH, NAV = new Uint8Array(NN), MUL = new Float32Array(NN), COR = new Uint8Array(NN), CAMPM = new Uint8Array(NN), FOR = new Uint8Array(NN);
const cellOf = (x, y) => Math.min(GH - 1, Math.max(0, y / GS | 0)) * GW + Math.min(GW - 1, Math.max(0, x / GS | 0));
const cx_ = c => (c % GW + 0.5) * GS, cy_ = c => ((c / GW | 0) + 0.5) * GS;
(function buildNav() {
  const fn = (x, y) => Math.sin(x * 0.034 + 1.3) * Math.cos(y * 0.029) + Math.sin(x * 0.071 + y * 0.053) * 0.5;
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const c = j * GW + i, x = (i + 0.5) * GS, y = (j + 0.5) * GS;
    let np = 1e9; for (const line of PATHS) for (let k = 1; k < line.length; k++) np = Math.min(np, segDist(x, y, line[k - 1][0], line[k - 1][1], line[k][0], line[k][1]));
    COR[c] = np < 12 ? 1 : 0;
    if (!spec.mask(x, y)) { NAV[c] = 0; continue; }
    const h = spec.h(x, y), s = Math.hypot(spec.h(x + 4, y) - spec.h(x - 4, y), spec.h(x, y + 4) - spec.h(x, y - 4)) / 8 * K;
    if (h < spec.water) { NAV[c] = COR[c] ? 4 : 0; MUL[c] = 2.2; }
    else if (s > 2.0) NAV[c] = 0;
    else if (s > 0.6) { NAV[c] = COR[c] ? 3 : 0; MUL[c] = 1.5; }
    else { NAV[c] = 1; MUL[c] = COR[c] ? 0.8 : 1; }
    if (NAV[c] === 1 && !COR[c] && h > 0.06 && h < 0.5 && fn(x, y) > 0.38 && BUILD.every(b => Math.hypot(b.x - x, b.y - y) > 48) && Math.hypot(x - CAMP.x, y - CAMP.y) > CAMP.r + 10) { NAV[c] = 2; MUL[c] = 1.7; FOR[c] = 1; }
    if (Math.hypot(x - CAMP.x, y - CAMP.y) < CAMP.r) CAMPM[c] = 1;
    if (Math.abs(x - OB.x) < OB.hw && Math.abs(y - OB.y) < OB.hh) OB.cells.push([c, NAV[c], MUL[c]]);
  }
  for (const [c] of OB.cells) NAV[c] = 0;
})();
const pass = (c, side) => NAV[c] !== 0 && !(side === 2 && CAMPM[c]);
function nearestWalkable(x, y, side, R) {
  let best = null, bd = 1e9;
  for (let j = Math.max(0, (y - R) / GS | 0); j <= Math.min(GH - 1, (y + R) / GS | 0); j++) for (let i = Math.max(0, (x - R) / GS | 0); i <= Math.min(GW - 1, (x + R) / GS | 0); i++) {
    const c = j * GW + i; if (!pass(c, side)) continue; const d = Math.hypot(cx_(c) - x, cy_(c) - y); if (d < bd && d <= R) { bd = d; best = [cx_(c), cy_(c)]; }
  }
  return best;
}
function los(x0, y0, x1, y1, side) { const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 3); for (let k = 1; k < n; k++) { const t = k / n; if (!pass(cellOf(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t), side)) return false; } return true; }
// A* over the grid, then string-pulled into a few waypoints
const GSC = new Float32Array(NN), STAMP = new Uint32Array(NN), PREV = new Int32Array(NN); let stampN = 0;
const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
function findPath(x0, y0, x1, y1, side) {
  let s = cellOf(x0, y0), t = cellOf(x1, y1);
  if (!pass(s, side)) { const n = nearestWalkable(x0, y0, side, 40); if (!n) return null; s = cellOf(n[0], n[1]); }
  if (!pass(t, side)) { const n = nearestWalkable(x1, y1, side, 40); if (!n) return null; t = cellOf(n[0], n[1]); x1 = n[0]; y1 = n[1]; }
  if (s === t) return [[x1, y1]];
  stampN++; const fA = [], iA = [];
  const push = (f, i) => { let k = fA.length; fA.push(f); iA.push(i); while (k > 0) { const p = (k - 1) >> 1; if (fA[p] <= fA[k]) break; [fA[p], fA[k]] = [fA[k], fA[p]]; [iA[p], iA[k]] = [iA[k], iA[p]]; k = p; } };
  const pop = () => { const top = iA[0], lf = fA.pop(), li = iA.pop(); if (fA.length) { fA[0] = lf; iA[0] = li; let k = 0; for (;;) { let l = 2 * k + 1, r = l + 1, m = k; if (l < fA.length && fA[l] < fA[m]) m = l; if (r < fA.length && fA[r] < fA[m]) m = r; if (m === k) break; [fA[m], fA[k]] = [fA[k], fA[m]]; [iA[m], iA[k]] = [iA[k], iA[m]]; k = m; } } return top; };
  const tx = t % GW, ty = t / GW | 0, hh = c => { const dx = Math.abs(c % GW - tx), dy = Math.abs((c / GW | 0) - ty); return (dx + dy) + (1.414 - 2) * Math.min(dx, dy); };
  STAMP[s] = stampN; GSC[s] = 0; PREV[s] = -1; push(hh(s), s); let found = false;
  while (fA.length) {
    const c = pop(); if (c === t) { found = true; break; }
    const ci = c % GW, cj = c / GW | 0, g0 = GSC[c];
    for (const [dx, dy, st] of NB) {
      const ni = ci + dx, nj = cj + dy; if (ni < 0 || nj < 0 || ni >= GW || nj >= GH) continue; const n = nj * GW + ni; if (!pass(n, side)) continue;
      if (dx && dy && (!pass(cj * GW + ni, side) || !pass(nj * GW + ci, side))) continue;
      const ng = g0 + st * MUL[n]; if (STAMP[n] !== stampN || ng < GSC[n]) { STAMP[n] = stampN; GSC[n] = ng; PREV[n] = c; push(ng + hh(n), n); }
    }
  }
  if (!found) return null;
  const cells = []; for (let c = t; c !== -1 && c !== s; c = PREV[c]) cells.push(c); cells.reverse();
  const pts = cells.map(c => [cx_(c), cy_(c)]); const out = []; let i = 0, cur = [x0, y0];
  while (i < pts.length) { let j = pts.length - 1; while (j > i && !los(cur[0], cur[1], pts[j][0], pts[j][1], side)) j--; out.push(pts[j]); cur = pts[j]; i = j + 1; }
  out[out.length - 1] = [x1, y1]; return out;
}

// ---------------------------------------------------------------- squads
const SLOW = 0.25, MELEE = 44, REFILL = 3.5;
const slotsSave = slots; let G, uid = 0, started = false;
const inCamp = s => Math.hypot(s.x - CAMP.x, s.y - CAMP.y) < CAMP.r;
const alive = side => G.sq.filter(s => s.alive && (!side || s.side === side));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const isForest = (x, y) => FOR[cellOf(x, y)] === 1;
const hidden = s => s.side === 1 && isForest(s.x, s.y) && (s.range > 0 || !s.fighting);
function addSq(side, cls, x, y, ai, zone, patrol, n) {
  const d = CLS[cls];
  const s = { id: ++uid, side, cls, kind: d.kind, n: n || d.n, max: n || d.n, k: d.k, speed: d.speed, range: (d.range || 0) * 0.7, x, y, path: [], atk: null, atkT: 0, work: null, sk: 0, cd: 0, skill: d.skill || null,
              boosts: (BOOSTS[cls] || []).map(id => ({ id, cd: 0, left: BOOST[id].uses === undefined ? Infinity : BOOST[id].uses })), travel: 0, alive: true, ai, home: [x, y], face: side === 1 ? -1 : 1, name: d.name, thinkT: Math.random() * 0.7,
              pend: 0, moving: false, clash: 0, zone, patrol: patrol || null, hurt: 0, wedgeT: 0, slowT: 0, refT: 0 };
  G.sq.push(s); return s;
}
const STARTS = [[192, 622], [240, 606], [288, 622], [240, 634]];
const ENEMIES = [
  ['e_inf', 4, 240, 452, 'br'], ['e_arc', 3, 192, 436, 'br'], ['e_arc', 3, 298, 436, 'br', null], ['e_inf', 5, 96, 352, 'tw'], ['e_arc', 3, 140, 392, 'tw'],
  ['e_inf', 5, 394, 358, 'gr'], ['e_inf', 5, 240, 345, 'ps'], ['e_inf', 6, 240, 262, 'ft'], ['e_inf', 6, 240, 224, 'ft']
];
const POINTS = [{ name: 'Дозорная башня', b: 0, need: 4, kind: 'landmark' }, { name: 'Амбар', b: 1, need: 4, kind: 'landmark' }, { name: 'Форт', b: 2, need: 6, kind: 'keep' }];
function newBattle() {
  OB.open = false; for (const [c, n, m] of OB.cells) { NAV[c] = 0; }
  G = { t: 0, over: false, sq: [], sel: null, fx: [], volleys: [], rome: [], kills: 0, lost: 0, alarm: {}, reserve: 10, parts: [], warn: [], traps: [], rains: [], tgt: null,
        points: POINTS.map(p => ({ ...p, x: BUILD[p.b].x, y: BUILD[p.b].y, owner: 2, prog: 0 })), obWork: 0 };
  initDecals();
  slots.forEach((cls, i) => { const s = addSq(1, cls, STARTS[i][0], STARTS[i][1], 'player'); s.name = GEN[i]; G.rome.push(s); });
  for (const [cls, n, x, y, zone, patrol] of ENEMIES) addSq(2, cls, x, y, 'hold', zone, patrol, n);
  cam.z = 1; cam.cx = WX / 2; cam.cy = 376; cam.fx = undefined; clampCam();
  uiCards();
}

// ---------------------------------------------------------------- blood and bodies (decals live in the lifted drawing space)
let DEC = null, dctx = null;
function initDecals() { DEC = document.createElement('canvas'); DEC.width = WX * RSd; DEC.height = (WY + BOTPAD + TOPPAD) * RSd; dctx = DEC.getContext('2d'); dctx.scale(RSd, RSd); dctx.translate(0, TOPPAD); }
function splat(x, y, r, a) { y -= lift(x, y); dctx.fillStyle = 'rgba(122,16,12,' + a + ')'; for (let i = 0; i < 4; i++) { dctx.beginPath(); dctx.ellipse(x + (Math.random() - .5) * r * 1.4, y + (Math.random() - .5) * r, r * (0.4 + Math.random() * 0.6), r * (0.3 + Math.random() * 0.4), Math.random() * 3, 0, 7); dctx.fill(); } }
function bleed(t) { splat(t.x + (Math.random() - .5) * 20, t.y + (Math.random() - .5) * 14, 2 + Math.random() * 3, 0.32); for (let i = 0; i < 3; i++) G.parts.push({ x: t.x + (Math.random() - .5) * 12, y: t.y - lift(t.x, t.y) - 8, vx: (Math.random() - .5) * 60, vy: -20 - Math.random() * 40, t: 0.4 + Math.random() * 0.15 }); }
function corpse(x, y, side, kind) {
  splat(x, y + 2, 5 + Math.random() * 3, 0.5); const ly = y - lift(x, y);
  dctx.save(); dctx.translate(x, ly); dctx.rotate(Math.random() * 6.28); dctx.scale(1.1, 1.1);
  if (kind === CAV) { dctx.fillStyle = '#6a3f22'; dctx.beginPath(); dctx.ellipse(0, 0, 8, 3.6, 0, 0, 7); dctx.fill(); }
  dctx.fillStyle = side === 1 ? '#c0261b' : '#2f6fd6'; dctx.fillRect(-4, -2, 7, 4); dctx.fillStyle = side === 1 ? '#7d1d16' : '#1d4a9a'; dctx.fillRect(-4, -2, 2, 4);
  dctx.fillStyle = '#e0b48a'; dctx.beginPath(); dctx.arc(4.6, 0, 2, 0, 7); dctx.fill(); dctx.restore();
}
const FSC = 0.8;                                                        // squads are drawn at 0.8 of the library size
function fpos(s, i, n) { const cols = s.kind === CAV ? 2 : 3, sp = s.kind === CAV ? 18 : 15, rows = Math.ceil(n / cols), col = i % cols, row = Math.floor(i / cols), inRow = Math.min(cols, n - row * cols); return [(col - (inRow - 1) / 2) * sp, 4 + (row - (rows - 1) / 2) * (sp - 3)]; }

// ---------------------------------------------------------------- boosts
function select(s) { if (G.sel === s) { G.sel = null; G.tgt = null; return; } G.sel = s; G.tgt = null; SND.play('select'); }
function useBoost(s, idx, quiet, tx, ty) {
  if (!s || !s.alive) return false;
  const b = s.boosts[idx]; if (!b) { if (!quiet) say('У этого отряда нет такого приказа'); return false; }
  const d = BOOST[b.id];
  if (b.left <= 0) { if (!quiet) say('«' + d.name + '» закончилась'); return false; }
  if (b.cd > 0) { if (!quiet) say('«' + d.name + '»: ещё ' + Math.ceil(b.cd) + ' с'); return false; }
  if (d.kind === 'target') {
    if (tx === undefined) return false;
    if (Math.hypot(tx - s.x, ty - s.y) > d.range * 0.7) { if (!quiet) say('Слишком далеко для «' + d.name + '»'); return false; }
    if (b.id === 'trap') { if (!pass(cellOf(tx, ty), 1)) { if (!quiet) say('Сюда ловушку не поставить'); return false; } G.traps.push({ x: tx, y: ty, t: 90 }); SND.play('tool', tx); }
    else { G.rains.push({ x: tx, y: ty, t: 0, dur: 3, r: 52 }); SND.play('volley', tx); }
  } else {
    if (b.id === 'wedge') { s.wedgeT = d.dur; s.wedged = false; if (s.cls === 'eques') s.travel = 999; SND.play('wedge', s.x); }
    else { s.sk = d.dur; if (b.id === 'gallop') s.travel = 999; SND.play({ turtle: 'shield', volley: 'volley', gallop: 'gallop', rush: 'rush' }[b.id], s.x); }
  }
  b.cd = d.cd; if (b.left !== Infinity) b.left--;
  G.fx.push({ x: s.x, y: s.y, t: 0.6, big: true });
  if (!quiet) say('«' + d.name + '»: ' + d.text);
  return true;
}
const useSkill = (s, quiet) => useBoost(s, 0, quiet);

// ---------------------------------------------------------------- orders
function groundAt(wx, wy) { let gy = wy; for (let i = 0; i < 4; i++) gy = wy + lift(wx, gy); return [wx, gy]; }
function cmd(s, tx, ty, quiet) {
  s.work = null; s.atk = null;
  if (Math.hypot(tx - OB.x, ty - OB.y) < 54 && !OB.open && Math.abs(ty - OB.y) < 40) {
    if (s.cls !== 'eng') { if (!quiet) say('Баррикаду на перевале разбирают только инженеры'); return false; }
    const ax = OB.x + Math.max(-OB.hw + 10, Math.min(OB.hw - 10, s.x - OB.x)), ay = OB.y + 24;
    const p = findPath(s.x, s.y, ax, ay, 1); if (!p) { if (!quiet) say('К баррикаде не подойти'); return false; }
    s.path = p; s.work = { left: 5 }; return true;
  }
  let gx = tx, gy = ty;
  for (const [nx, ny] of NODES) if (Math.hypot(nx - tx, ny - ty) < 16) { gx = nx; gy = ny; break; }
  const w = nearestWalkable(gx, gy, 1, 28); if (!w) { if (!quiet) say(hAt(gx, gy) < spec.water ? 'Реку переходят по броду' : 'Туда не пройти'); return false; }
  const p = findPath(s.x, s.y, w[0], w[1], 1); if (!p) { if (!quiet) say('Путь закрыт'); return false; }
  s.path = p; if (!quiet) SND.play('order'); return true;
}
function attack(s, foe, quiet) { s.work = null; s.atk = foe; s.atkT = 0; const p = findPath(s.x, s.y, foe.x, foe.y, s.side); s.path = p || []; if (!p && !quiet) say('К ним не подойти'); return !!p; }

// ---------------------------------------------------------------- the defenders: a post-wide alarm, patrols, leashes
function raise(zone, who, secs) {
  if (!zone) return; const was = (G.alarm[zone] || 0) > G.t;
  G.alarm[zone] = Math.max(G.alarm[zone] || 0, G.t + secs);
  if (!was) { G.warn.push({ x: who.x, y: who.y - lift(who.x, who.y), t: 2.5 }); SND.play('alarm', who.x); }
}
function think(s, dt) {
  s.thinkT -= dt; if (s.thinkT > 0 || s.ai === 'tower' || s.ai === 'player') return; s.thinkT = 0.6;
  const foes = alive(1); if (!foes.length) return;
  let tgt = null, bd = 1e9;
  for (const f of foes) { if (inCamp(f)) continue; const d = dist(s, f); if (hidden(f) && d > 60) continue; if (d < bd) { bd = d; tgt = f; } }
  const [hx, hy] = s.home, alarm = (G.alarm[s.zone] || 0) > G.t, aggro = alarm ? 250 : 130, leash = alarm ? 360 : 220;
  if (tgt && bd < aggro) raise(s.zone, s, 12);
  if (tgt && bd < aggro && Math.hypot(tgt.x - hx, tgt.y - hy) < leash) { s.atk = tgt; s.pauseT = 0; }
  else if (s.atk && (!s.atk.alive || Math.hypot(s.atk.x - hx, s.atk.y - hy) > leash + 50)) { s.atk = null; s.path = []; }
  if (!s.atk && !s.path.length) {
    if (s.pauseT > 0) s.pauseT--;
    else if (s.patrol && !alarm) { s.pi = ((s.pi || 0) + 1) % s.patrol.length; s.path = findPath(s.x, s.y, s.patrol[s.pi][0], s.patrol[s.pi][1], 2) || []; s.pauseT = 4; }
    else if (Math.hypot(s.x - hx, s.y - hy) > 14) s.path = findPath(s.x, s.y, hx, hy, 2) || [];
  }
}
function pursue(s, dt) {
  if (s.atk && !s.atk.alive) { s.atk = null; s.path = []; }
  if (!s.atk) return;
  s.atkT -= dt; if (s.atkT > 0) return; s.atkT = 0.5;
  const t = s.atk, d = dist(s, t), rr = s.range ? s.range * (hAt(s.x, s.y) > hAt(t.x, t.y) + 0.08 ? 1.35 : 1) * 0.9 : MELEE - 6;
  if (d <= rr) { s.path = []; return; }
  s.path = findPath(s.x, s.y, t.x, t.y, s.side) || [];
}

// ---------------------------------------------------------------- simulation
function step(raw) {
  if (G.over || !started) return;
  const dt = raw * (G.sel && G.sel.alive ? SLOW : 1); G.t += dt;
  const live = alive();
  // capture points: stand by the building with nobody hostile near
  for (const p of G.points) {
    const mine = live.filter(q => q.side === 1 && !q.moving && Math.hypot(q.x - p.x, q.y - p.y) < 58), hostile = live.some(e => e.side === 2 && Math.hypot(e.x - p.x, e.y - p.y) < 95);
    if (p.owner === 2) {
      if (mine.length && !hostile) { p.prog += dt; if (p.prog >= p.need) { p.owner = 1; p.prog = 0; SND.play('capture'); G.fx.push({ x: p.x, y: p.y, t: 0.8, big: true }); G.reserve += 3; say(p.name + ' взят! В резерв +3'); } }
      else { const was = p.prog; p.prog = Math.max(0, p.prog - dt * 0.5); if (was > 0 && p.prog === 0) SND.play('lost'); }
    }
  }
  // the camp: a squad standing at a tent is topped up one soldier at a time from a limited reserve
  for (const q of live) if (q.side === 1) {
    q.inTent = !q.moving && TENTS.some(([x, y]) => Math.hypot(q.x - x, q.y - y) < 26);
    if (!q.inTent || q.n >= q.max || G.reserve <= 0 || live.some(e => e.side === 2 && dist(e, q) < 110)) { q.refT = 0; continue; }
    q.refT += dt;
    if (q.refT >= REFILL) { q.refT = 0; q.n = Math.min(q.max, q.n + 1); q.shown = Math.ceil(q.n); G.reserve--; G.fx.push({ x: q.x, y: q.y, t: 0.5, big: true }); SND.play('recruit', q.x); if (G.reserve === 0) say('Резерв кончился: больше пополнять нечем'); }
  }
  for (const s of live) {
    if (s.sk > 0) s.sk = Math.max(0, s.sk - dt);
    for (const b of s.boosts) if (b.cd > 0) b.cd = Math.max(0, b.cd - dt); s.cd = s.boosts.length ? s.boosts[0].cd : 0;
    if (s.hurt > 0) s.hurt -= dt; if (s.wedgeT > 0) s.wedgeT -= dt; if (s.slowT > 0) s.slowT -= dt;
    if (s.side === 2) { think(s, dt); pursue(s, dt); } else if (s.atk) pursue(s, dt);
  }
  // movement
  for (const s of live) {
    s.moving = s.path.length > 0;
    if (s.ai === 'tower' || !s.moving) continue;
    const [tx, ty] = s.path[0], dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy), c = cellOf(s.x, s.y);
    let sp = s.speed * Math.max(0.45, Math.min(1.25, 1 / MUL[c])) * (s.sk > 0 && s.cls === 'hastati' ? 0.5 : 1) * (s.sk > 0 && s.cls === 'eques' ? 1.8 : 1) * (s.wedgeT > 0 ? (s.cls === 'eques' ? 1.4 : 1.3) : 1) * (s.slowT > 0 ? 0.4 : 1);
    if (s.sk > 0 && s.cls === 'eques' && FOR[c]) sp *= 1.6;
    const mv = Math.min(d, sp * dt);
    if (d > 0.01) { s.x += dx / d * mv; s.y += dy / d * mv; if (Math.abs(dx) > 1) s.face = dx < 0 ? -1 : 1; s.travel += mv; }
    if (d - mv < 2.5) s.path.shift();
  }
  // squads keep apart (and stand a fighting distance from the enemy)
  for (let a = 0; a < live.length; a++) for (let b = a + 1; b < live.length; b++) {
    const p = live[a], q = live[b], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 0.01, min = p.side === q.side ? 30 : 38;
    if (d >= min) continue; const push = (min - d) / 2 * 0.7, ux = dx / d, uy = dy / d;
    if (p.ai !== 'tower' && !(q.ai === 'tower')) { const nx = p.x - ux * push, ny = p.y - uy * push; if (pass(cellOf(nx, ny), p.side)) { p.x = nx; p.y = ny; } const mx = q.x + ux * push, my = q.y + uy * push; if (pass(cellOf(mx, my), q.side)) { q.x = mx; q.y = my; } }
  }
  // engineers at the barricade
  for (const s of live) if (s.work && !s.path.length) {
    if (OB.open || Math.hypot(s.x - OB.x, Math.max(0, Math.abs(s.y - OB.y) - 8)) > 60) { s.work = null; continue; }
    s.work.left -= dt * (s.sk > 0 ? 3 : 1); s.clash -= dt; if (s.clash <= 0) { s.clash = 0.35; G.fx.push({ x: OB.x + (Math.random() - .5) * 70, y: OB.y + (Math.random() - .5) * 10, t: 0.3 }); SND.play('tool', OB.x); }
    if (s.work.left <= 0) { OB.open = true; for (const [c, n, m] of OB.cells) { NAV[c] = n; } s.work = null; SND.play('crash', OB.x); G.fx.push({ x: OB.x, y: OB.y, t: 0.8, big: true }); say('Баррикада на перевале разобрана'); }
  }
  // fights: only squads standing still hit
  G.volleys = G.volleys.filter(v => (v.t += dt * 2.2) < 1);
  for (const a of live) {
    a.fighting = false;
    if (a.moving || a.work) continue;
    let t = null, bd = 1e9;
    for (const e of live) {
      if (e.side === a.side) continue; const d = dist(a, e);
      const R = a.range ? a.range * (hAt(a.x, a.y) > hAt(e.x, e.y) + 0.08 ? 1.35 : 1) : MELEE;
      if (d > R || d >= bd) continue;
      if (a.side === 2 && hidden(e) && d > 60) continue;
      bd = d; t = e;
    }
    if (!t) continue;
    a.fighting = true; a.face = t.x < a.x - 1 ? -1 : t.x > a.x + 1 ? 1 : a.face;
    let v = a.n * a.k * MULT[a.kind][t.kind] * dt; const ranged = a.range > 0;
    if (a.sk > 0 && a.cls === 'velites') v *= 2.5;
    if (t.sk > 0 && t.cls === 'hastati') v *= ranged ? 0.35 : 0.85;
    if (ranged && isForest(t.x, t.y) && !(a.sk > 0)) v *= 0.8;
    if (!ranged && hAt(t.x, t.y) > hAt(a.x, a.y) + 0.08) v *= 0.8;
    if (hAt(t.x, t.y) < spec.water) v *= 1.25;
    if ((a.cls === 'eques' || a.cls === 'e_cav') && a.travel >= 70) { v += 0.8 * a.n * MULT[CAV][t.kind] * (a.sk > 0 ? 1.4 : 1) * (a.wedgeT > 0 ? 1.5 : 1); a.travel = 0; SND.play('charge', a.x); G.fx.push({ x: (a.x + t.x) / 2, y: (a.y + t.y) / 2, t: 0.5, big: true }); }
    if (!ranged && a.wedgeT > 0 && !a.wedged && a.cls !== 'eques') { a.wedged = true; v += 0.5 * a.n * MULT[a.kind][t.kind]; SND.play('charge', a.x); G.fx.push({ x: (a.x + t.x) / 2, y: (a.y + t.y) / 2, t: 0.5, big: true }); }
    t.pend += v; t.hurt = 0.25; if (t.side === 2) raise(t.zone, t, 14);
    if (a.side === 1 && ranged && hidden(a) && t.side === 2 && t.ai === 'hold' && t.kind !== ARC) t.atk = a;
    a.clash -= dt; if (a.clash <= 0) { a.clash = ranged ? 0.5 : 0.35; bleed(t); SND.hit(a); if (ranged) G.volleys.push({ x: a.x, y: a.y - lift(a.x, a.y), tx: t.x, ty: t.y - lift(t.x, t.y), t: 0, side: a.side }); else G.fx.push({ x: (a.x + t.x) / 2 + (Math.random() - .5) * 14, y: (a.y + t.y) / 2, t: 0.3 }); }
  }
  for (const s of live) if (s.pend) {
    s.n -= s.pend; s.pend = 0; if (s.shown === undefined) s.shown = Math.ceil(s.max);
    if (s.n <= 0.25) die(s);
    else { const c2 = Math.ceil(s.n); for (let i = c2; i < s.shown; i++) { const [lx, ly] = fpos(s, i, s.shown); corpse(s.x + lx * FSC, s.y + ly * FSC, s.side, s.kind); } s.shown = Math.min(s.shown, c2); }
  }
  // traps and rains of arrows
  for (const tr of G.traps) { tr.t -= dt; for (const e of live) if (e.side === 2 && e.alive && Math.hypot(e.x - tr.x, e.y - tr.y) < 20) { e.pend += 1.8; e.slowT = 4; tr.t = 0; raise(e.zone, e, 14); G.fx.push({ x: tr.x, y: tr.y, t: 0.6, big: true }); for (let i = 0; i < 4; i++) bleed(e); SND.play('crash', tr.x); break; } }
  G.traps = G.traps.filter(t => t.t > 0);
  for (const rn of G.rains) { rn.t += dt; for (const e of live) if (e.side === 2 && e.alive && Math.hypot(e.x - rn.x, e.y - rn.y) < rn.r) { e.pend += 0.55 * dt; e.hurt = 0.25; raise(e.zone, e, 14); } if (Math.random() < dt * 6) SND.play('arrow', rn.x); }
  G.rains = G.rains.filter(r => r.t < r.dur);
  for (const f of G.fx) f.t -= dt; G.fx = G.fx.filter(f => f.t > 0);
  for (const w of G.warn) w.t -= dt; G.warn = G.warn.filter(w => w.t > 0);
  for (const p of G.parts) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 170 * dt; } G.parts = G.parts.filter(p => p.t > 0);
  checkEnd();
}
function die(s) {
  if (s.shown === undefined) s.shown = Math.ceil(s.max);
  for (let i = 0; i < s.shown; i++) { const [lx, ly] = fpos(s, i, s.shown); corpse(s.x + lx * FSC, s.y + ly * FSC, s.side, s.kind); }
  splat(s.x, s.y + 4, 18, 0.45); splat(s.x + 7, s.y, 12, 0.4);
  s.n = 0; s.alive = false; s.path = []; G.fx.push({ x: s.x, y: s.y, t: 0.9, big: true, rout: true });
  SND.play(s.side === 1 ? 'death' : 'kill', s.x);
  if (G.sel === s) { G.sel = null; G.tgt = null; }
  if (s.side === 1) { G.lost++; say('Генерал ' + s.name + ' ранен, отряд выбыл из боя'); } else G.kills++;
}
const clock = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
function checkEnd() {
  let win = 0, why = '';
  if (G.points[2].owner === 1) { win = 1; why = 'Форт взят, над долиной орёл легиона.'; }
  else if (!alive(1).length) { win = 2; why = 'Все четыре отряда выбиты.'; }
  if (!win) return;
  G.over = true; G.sel = null; G.tgt = null; SND.play(win === 1 ? 'win' : 'lose');
  $('ovT').textContent = win === 1 ? 'Победа!' : 'Поражение';
  $('ovP').textContent = why + ' Время ' + clock(G.t) + ' · врагов выбито ' + G.kills + ' · генералов потеряно ' + G.lost + '.';
  $('over').hidden = false; G.winner = win;
}

// ---------------------------------------------------------------- drawing
let TERR = null, STATIC = null;
function bakeTerrain() {
  TERR = document.createElement('canvas'); TERR.width = WX * RSd; TERR.height = (WY + BOTPAD + TOPPAD) * RSd;
  const g = TERR.getContext('2d'); g.scale(RSd, RSd); g.translate(0, TOPPAD); g.lineCap = 'round'; g.lineJoin = 'round';
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(WX / 2, WY - 20, 200, 26, 0, 0, 7); g.fill();
  terrain(g, spec, rng(spec.seed));
  const P = (x, y) => [x, y - lift(x, y)];
  g.strokeStyle = 'rgba(214,190,140,.9)'; g.lineWidth = 10; for (const line of PATHS) { g.beginPath(); line.forEach(([x, y], i) => { const [px, py] = P(x, y); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke(); }
  g.strokeStyle = 'rgba(120,95,55,.35)'; g.lineWidth = 1; g.setLineDash([3, 6]); for (const line of PATHS) { g.beginPath(); line.forEach(([x, y], i) => { const [px, py] = P(x, y); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke(); } g.setLineDash([]);
  for (const [x, y] of NODES) { const [px, py] = P(x, y); g.fillStyle = 'rgba(15,20,8,.3)'; g.beginPath(); g.ellipse(px + 3, py + 4, 12, 5, 0, 0, 7); g.fill(); plateShape(g, px, py, '#b9b5a8', '#d3cfc2'); }
  // forest, rocks, houses are static scenery
  STATIC = []; const r = rng(77);
  for (let y = 40; y < WY - 30; y += 11) for (let x = 30; x < WX - 20; x += 11) { const jx = x + (r() - .5) * 9, jy = y + (r() - .5) * 9; if (FOR[cellOf(jx, jy)] && r() < 0.6) STATIC.push({ y: jy, f: () => { pine(ctx, jx, jy - lift(jx, jy), 0.75 + r() * 0.0 + (jx * 7 % 5) / 12); } }); }
  for (let i = 0; i < 20; i++) { const x = 40 + r() * (WX - 80), y = 60 + r() * (WY - 140); if (!spec.mask(x, y) || NAV[cellOf(x, y)] !== 1 || COR[cellOf(x, y)] || Math.hypot(x - CAMP.x, y - CAMP.y) < CAMP.r) continue; const k = 0.7 + r() * 0.6; STATIC.push({ y, f: () => rock(ctx, x, y - lift(x, y), k) }); }
  for (const d of DECOR) STATIC.push({ y: d.y, f: () => house(ctx, d.x, d.y - lift(d.x, d.y), 1) });
  for (const [x, y] of TENTS) STATIC.push({ y, f: () => tent(ctx, x, y - lift(x, y)) });
}
function plateShape(g, px, py, c1, c2) {
  const pts = []; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + 0.3, rr = 11 + ((k * 37 + Math.round(px)) % 3); pts.push([px + Math.cos(a) * rr, py + Math.sin(a) * rr * 0.55]); }
  g.fillStyle = c1; g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.closePath(); g.fill();
  g.fillStyle = c2; g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(a, b - 2) : g.moveTo(a, b - 2)); g.closePath(); g.fill(); g.strokeStyle = 'rgba(60,55,45,.55)'; g.lineWidth = 1; g.stroke();
}
function drawSquad(s, t) {
  const l = lift(s.x, s.y), n = Math.ceil(s.n), mode = (s.work && !s.path.length) ? 2 : s.fighting ? 2 : s.moving ? 1 : 0, rome = s.side === 1, st = BAN[s.cls] || BAN.e_inf;
  ctx.save(); ctx.translate(s.x, s.y - l); ctx.scale(FSC, FSC); if (hidden(s) || s.inTent) ctx.globalAlpha = hidden(s) ? 0.6 : 0.65;
  ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.ellipse(0, 12, 26, 12, 0, 0, Math.PI * 2); ctx.fill();
  cbanner(ctx, -s.face * 23, 14, st, 0.95, Math.sin(t * 5 + s.id) * 1.6);
  const pts = []; for (let i = 0; i < n; i++) { const [px, py] = fpos(s, i, n); pts.push([i, px, py]); } pts.sort((a, b) => a[2] - b[2]);
  for (const [i, px, py] of pts) drawMan(px, py, s.cls, s.side, s.face, t, s.id * 7 + i, mode);
  ctx.globalAlpha = 1;
  if (s.hurt > 0) { ctx.strokeStyle = 'rgba(255,255,255,' + Math.min(0.7, s.hurt * 4) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 4, 30, 24, 0, 0, Math.PI * 2); ctx.stroke(); }
  if (s.sk > 0) { ctx.strokeStyle = 'rgba(246,215,122,.9)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, 6, 32, 26, 0, 0, Math.PI * 2); ctx.stroke(); }
  if (G.sel === s) { ctx.strokeStyle = '#f6d77a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 8, 34, 26, 0, 0, Math.PI * 2); ctx.stroke(); }
  const f = s.n / s.max, bw = 34; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(-bw / 2 - 1, 29, bw + 2, 6); ctx.fillStyle = f > 0.5 ? '#6fd17a' : f > 0.25 ? '#f2c14e' : '#ef6b5a'; ctx.fillRect(-bw / 2, 30, bw * f, 4);
  if (s.refT > 0) { ctx.strokeStyle = '#6fd17a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 36, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.refT / REFILL); ctx.stroke(); }
  ctx.restore();
}
function drawBuilding(b, t) {
  const l = lift(b.x, b.y), y = b.y - l; ({ tower: () => tower(ctx, b.x, y), granary: () => granary(ctx, b.x, y), hall: () => hall(ctx, b.x, y, true) })[b.t]();
}
function draw(t) {
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#14110d'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.beginPath(); ctx.rect(0, VTOP, W, VH); ctx.clip();
  const bg = ctx.createLinearGradient(0, VTOP, 0, H); bg.addColorStop(0, '#2a241b'); bg.addColorStop(1, '#14110d'); ctx.fillStyle = bg; ctx.fillRect(0, VTOP, W, VH);
  const k = SCW * cam.z; ctx.translate(W / 2, VC); ctx.scale(k, k); ctx.translate(-cam.cx, -cam.cy);
  if (!TERR) bakeTerrain();
  ctx.drawImage(TERR, 0, -TOPPAD, WX, WY + BOTPAD + TOPPAD); ctx.drawImage(DEC, 0, -TOPPAD, WX, WY + BOTPAD + TOPPAD);
  // our camp: a ring of stakes, a fire, the standard
  { const cl = lift(CAMP.x, CAMP.y), cy = CAMP.y - cl; ctx.fillStyle = 'rgba(122,92,52,.3)'; ctx.beginPath(); ctx.ellipse(CAMP.x, cy, CAMP.r, CAMP.r * 0.62, 0, 0, 7); ctx.fill();
    for (let a = 0; a < 360; a += 9) { if (Math.abs(a - 270) < 16) continue; const rd = a * Math.PI / 180, x = CAMP.x + Math.cos(rd) * CAMP.r, y = CAMP.y + Math.sin(rd) * CAMP.r * 0.62 - lift(CAMP.x + Math.cos(rd) * CAMP.r, CAMP.y + Math.sin(rd) * CAMP.r * 0.62); ctx.fillStyle = '#8a6a3c'; ctx.fillRect(x - 1.6, y - 8, 3.2, 9); ctx.fillStyle = '#5a3d20'; ctx.beginPath(); ctx.moveTo(x - 1.6, y - 8); ctx.lineTo(x, y - 12); ctx.lineTo(x + 1.6, y - 8); ctx.fill(); } }
  // the selected squad: slabs light up where it can stand on the paths
  const sel = G.sel && G.sel.alive ? G.sel : null;
  if (sel) {
    for (const [x, y] of NODES) { if (Math.hypot(x - sel.x, y - sel.y) > 230) continue; const py = y - lift(x, y); ctx.fillStyle = 'rgba(255,244,214,.5)'; ctx.beginPath(); ctx.ellipse(x, py, 13, 7, 0, 0, 7); ctx.fill(); plateShape(ctx, x, py, 'rgba(255,246,220,.0)', 'rgba(255,246,220,.0)'); ctx.strokeStyle = '#fff6dc'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(x, py, 13, 7, 0, 0, 7); ctx.stroke(); }
    if (G.tgt) { const d = BOOST[G.tgt.s.boosts[G.tgt.idx].id]; ctx.strokeStyle = 'rgba(246,215,122,.9)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -t * 14; ctx.beginPath(); ctx.ellipse(sel.x, sel.y - lift(sel.x, sel.y), d.range * 0.7, d.range * 0.7 * 0.62, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    else if (sel.range) { ctx.strokeStyle = 'rgba(192,38,27,.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.ellipse(sel.x, sel.y - lift(sel.x, sel.y), sel.range, sel.range * 0.62, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
  }
  // paths of every moving squad of ours
  for (const s of G.sq) if (s.alive && s.side === 1 && s.path.length) {
    ctx.save(); ctx.strokeStyle = 'rgba(192,38,27,.9)'; ctx.lineWidth = 2.6; ctx.setLineDash([7, 5]); ctx.lineDashOffset = -t * 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(s.x, s.y - lift(s.x, s.y));
    for (const [x, y] of s.path) ctx.lineTo(x, y - lift(x, y)); ctx.stroke(); ctx.setLineDash([]); const e = s.path[s.path.length - 1]; ctx.strokeStyle = '#c0261b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(e[0], e[1] - lift(e[0], e[1]), 11, 6, 0, 0, 7); ctx.stroke(); ctx.restore();
  }
  // rains and traps
  for (const rn of G.rains) { const ry = rn.y - lift(rn.x, rn.y); ctx.fillStyle = 'rgba(192,38,27,.14)'; ctx.strokeStyle = 'rgba(192,38,27,.65)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(rn.x, ry, rn.r, rn.r * 0.62, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#5a1510'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 16; i++) { const a = i * 2.39996 + rn.t, rr = rn.r * Math.sqrt((i + 0.5) / 16), x = rn.x + Math.cos(a) * rr, y = ry + Math.sin(a) * rr * 0.62, f = ((t * 3 + i * 0.37) % 1); ctx.beginPath(); ctx.moveTo(x - 2, y - 46 * (1 - f) - 8); ctx.lineTo(x, y - 46 * (1 - f)); ctx.stroke(); } }
  // everything that stands, back to front
  const items = STATIC.slice();
  for (const b of BUILD) items.push({ y: b.y, f: () => drawBuilding(b, t) });
  items.push({ y: OB.y, f: () => drawBarricade() });
  for (const tr of G.traps) items.push({ y: tr.y, f: () => { const y = tr.y - lift(tr.x, tr.y); ctx.fillStyle = 'rgba(40,25,10,.55)'; ctx.beginPath(); ctx.ellipse(tr.x, y + 2, 15, 7, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#c9c2b0'; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(tr.x + i * 5 - 2, y + 3); ctx.lineTo(tr.x + i * 5, y - 6); ctx.lineTo(tr.x + i * 5 + 2, y + 3); ctx.fill(); } } });
  for (const s of G.sq) if (s.alive) items.push({ y: s.y + 1, f: () => drawSquad(s, t) });
  items.sort((a, b) => a.y - b.y); for (const it of items) it.f();
  // capture flags above the buildings, with a progress ring
  for (const p of G.points) {
    const b = BUILD[p.b], y = b.y - lift(b.x, b.y), mine = p.owner === 1, col = mine ? '#c0261b' : '#3b66c4';
    if (p.prog > 0) { ctx.strokeStyle = '#f6d77a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(b.x, y + 6, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p.prog / p.need); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x, y + 6, 30, 0, 7); ctx.stroke();
    flag(ctx, b.x + b.fx, y - b.fh, col);
    ctx.font = '700 12px Alegreya Sans, sans-serif'; ctx.textAlign = 'center'; const tw = ctx.measureText(p.name).width + 12; ctx.fillStyle = 'rgba(25,20,14,.85)'; ctx.fillRect(b.x - tw / 2, y + 12, tw, 17); ctx.fillStyle = p.kind === 'keep' ? '#ffd27a' : (mine ? '#ff9a8c' : '#f6e7bf'); ctx.fillText(p.name, b.x, y + 25);
  }
  ctx.font = '700 12px Alegreya Sans, sans-serif'; ctx.textAlign = 'center'; { const l = CAMP.y - lift(CAMP.x, CAMP.y), txt = 'Наш лагерь · резерв ' + G.reserve, tw = ctx.measureText(txt).width + 14; ctx.fillStyle = 'rgba(25,20,14,.85)'; ctx.fillRect(CAMP.x - tw / 2, l + 56, tw, 17); ctx.fillStyle = '#ff9a8c'; ctx.fillText(txt, CAMP.x, l + 69); }
  // refill hints on the tents
  if (alive(1).some(q => q.n < q.max) && G.reserve > 0) for (const [x, y] of TENTS) { const py = y - lift(x, y), kk = 0.8 + 0.2 * Math.sin(t * 6); ctx.fillStyle = '#2f8f4e'; ctx.strokeStyle = '#eef3d2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 24, py - 28, 9 * kk, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#eef3d2'; ctx.fillRect(x + 20, py - 30, 8, 3.5); ctx.fillRect(x + 22, py - 33, 3.5, 8); }
  for (const p of G.parts) { ctx.fillStyle = 'rgba(150,18,12,' + Math.min(1, p.t * 3) + ')'; ctx.fillRect(p.x - 1, p.y - 1, 2.2, 2.2); }
  for (const w of G.warn) { const kk = 0.6 + 0.4 * Math.sin(t * 12), a = Math.min(1, w.t); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#c0261b'; ctx.strokeStyle = '#fff3d6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w.x, w.y - 38, 11 * (0.9 + 0.1 * kk), 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff3d6'; ctx.font = '700 15px Alegreya Sans, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', w.x, w.y - 33); ctx.restore(); }
  for (const v of G.volleys) { const x = v.x + (v.tx - v.x) * v.t, y = v.y + (v.ty - v.y) * v.t - Math.sin(v.t * Math.PI) * 22; ctx.strokeStyle = v.side === 1 ? '#5a1510' : '#163a7a'; ctx.lineWidth = 1.4; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x + i * 4, y - 3); ctx.lineTo(x + i * 4 + (v.tx - v.x) * 0.03, y + 3); ctx.stroke(); } }
  for (const f of G.fx) { const y = f.y - lift(f.x, f.y); ctx.strokeStyle = f.rout ? 'rgba(42,28,16,' + f.t + ')' : 'rgba(255,215,106,' + Math.min(1, f.t * 3) + ')'; ctx.lineWidth = f.big ? 3 : 2; ctx.beginPath(); ctx.arc(f.x, y, (f.big ? 26 : 9) * (1 - f.t), 0, Math.PI * 2); ctx.stroke(); }
  if (sel) { ctx.fillStyle = 'rgba(30,60,110,.07)'; ctx.fillRect(-100, -100, WX + 200, WY + 300); }
  ctx.restore();
  hud();
}
function drawBarricade() {
  const y = OB.y - lift(OB.x, OB.y);
  if (OB.open) { for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#8a8174' : '#6f675c'; ctx.beginPath(); ctx.ellipse(OB.x - 40 + i * 16, y + 4 + (i % 2) * 3, 6, 3.5, 0, 0, 7); ctx.fill(); } return; }
  ctx.fillStyle = 'rgba(15,20,8,.3)'; ctx.beginPath(); ctx.ellipse(OB.x + 4, y + 8, OB.hw + 4, 8, 0, 0, 7); ctx.fill();
  for (let x = OB.x - OB.hw; x <= OB.x + OB.hw; x += 7) { ctx.fillStyle = '#8a6a3c'; ctx.fillRect(x - 2, y - 14, 4, 22); ctx.fillStyle = '#5a3d20'; ctx.beginPath(); ctx.moveTo(x - 2, y - 14); ctx.lineTo(x, y - 21); ctx.lineTo(x + 2, y - 14); ctx.fill(); }
  ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(OB.x - OB.hw, y - 4); ctx.lineTo(OB.x + OB.hw, y + 3); ctx.moveTo(OB.x + OB.hw, y - 4); ctx.lineTo(OB.x - OB.hw, y + 3); ctx.stroke(); ctx.strokeStyle = '#8a5f33'; ctx.lineWidth = 3; ctx.stroke();
  const w = G.sq.find(s => s.alive && s.work && !s.path.length); if (w) { const p = 1 - w.work.left / 5; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(OB.x - 24, y - 32, 48, 7); ctx.fillStyle = '#f6d77a'; ctx.fillRect(OB.x - 24, y - 32, 48 * Math.max(0, Math.min(1, p)), 7); }
}

// ---------------------------------------------------------------- the interface
let boostSel = null, railPainted = null;
function paintRail() { G.rome.forEach((s, i) => { const g = $('rbc' + i).getContext('2d'); g.clearRect(0, 0, 64, 64); portrait(g, i, s.cls); }); }
function hud() {
  const caps = G.points.filter(p => p.owner === 1).length, foes = G.sq.filter(s => s.alive && s.side === 2).length;
  $('clock').textContent = clock(G.t); SND.slow(!!G.sel); SND.level(G.sq.filter(s => s.alive && s.fighting).length / 3);
  const ph = $('phase'); ph.className = 'hud phase' + (G.sel ? ' slow' : '');
  ph.textContent = G.tgt ? '🎯 Коснитесь места для «' + BOOST[G.tgt.s.boosts[G.tgt.idx].id].name + '»' : G.sel ? '⏳ Замедление · коснитесь места' : 'Здания ' + Math.min(2, G.points.slice(0, 2).filter(p => p.owner === 1).length) + '/2 · форт · вражеских отрядов ' + foes + ' · резерв ' + G.reserve;
  const cp = G.points.find(p => p.prog > 0); $('sub').textContent = cp ? cp.name + ': ещё ' + Math.ceil(cp.need - cp.prog) + ' с' : 'Поднимитесь в форт';
  $('zoomchip').hidden = cam.z < 1.02; $('zoomchip').textContent = cam.z.toFixed(1).replace('.', ',') + '× ⟲';
  uiCards();
}
function uiCards() {
  if (railPainted !== G) { railPainted = G; paintRail(); boostSel = null; }
  G.rome.forEach((s, i) => {
    const b = $('rb' + i), f = Math.max(0, s.n) / s.max;
    b.className = 'rb' + (G.sel === s ? ' sel' : '') + (!s.alive ? ' dead' : '') + (s.sk > 0 || s.wedgeT > 0 ? ' act' : '');
    if (b.style.setProperty) { b.style.setProperty('--hp', Math.round(f * 100)); b.style.setProperty('--c', f > 0.5 ? '#6fd17a' : f > 0.25 ? '#f2c14e' : '#ef6b5a'); }
    b.title = s.name + ' · ' + CLS[s.cls].name;
  });
  const sel = G.sel && G.sel.alive ? G.sel : null, bar = $('boosts');
  if (!sel) { if (boostSel) { bar.hidden = true; bar.innerHTML = ''; boostSel = null; } return; }
  if (boostSel !== sel) {
    boostSel = sel; bar.hidden = false;
    bar.innerHTML = sel.boosts.length ? sel.boosts.map((b, i) => '<button class="bb" id="bb' + i + '" type="button"></button>').join('') : '<span class="nob">У ' + CLS[sel.cls].name.toLowerCase() + ' нет приказов</span>';
    sel.boosts.forEach((b, i) => $('bb' + i).addEventListener('click', () => boostPress(i)));
  }
  sel.boosts.forEach((b, i) => {
    const d = BOOST[b.id], el = $('bb' + i);
    const st = b.left <= 0 ? 'закончилась' : b.cd > 0 ? 'ещё ' + Math.ceil(b.cd) + ' с' : (b.left !== Infinity ? 'осталось ' + b.left : (i === 0 && sel.sk > 0 ? 'действует' : 'готово'));
    const h = '<span>' + d.name + '</span><small>' + d.text + '</small><em>' + st + '</em>', cls = 'bb' + (G.tgt && G.tgt.idx === i ? ' tgt' : '');
    if (el._h !== h) { el.innerHTML = h; el._h = h; } if (el._c !== cls) { el.className = cls; el._c = cls; }
    el.disabled = b.cd > 0 || b.left <= 0;
  });
}
function boostPress(i) {
  const s = G.sel; if (!s || !s.alive || G.over) return; const b = s.boosts[i]; if (!b) return; const d = BOOST[b.id];
  if (d.kind === 'target') { if (b.cd > 0 || b.left <= 0) { useBoost(s, i); return; } G.tgt = G.tgt && G.tgt.idx === i ? null : { s, idx: i }; if (G.tgt) say('Коснитесь места для «' + d.name + '»'); }
  else { G.tgt = null; useBoost(s, i); }
  uiCards();
}

// ---------------------------------------------------------------- camera and input
const cam = { z: 1, cx: WX / 2, cy: 376 };
function clampCam() {
  const k = SCW * cam.z, hw = W / 2 / k, hh = VH / 2 / k, y0 = -TOPPAD, y1 = WY + 40;
  cam.cx = hw * 2 >= WX ? WX / 2 : Math.max(hw, Math.min(WX - hw, cam.cx)); cam.cy = hh * 2 >= y1 - y0 ? (y0 + y1) / 2 : Math.max(y0 + hh, Math.min(y1 - hh, cam.cy));
}
const toWorld = (sx, sy) => { const k = SCW * cam.z; return [(sx - W / 2) / k + cam.cx, (sy - VC) / k + cam.cy]; };
const scr = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
function tapAt(wx, wsy) {
  const [gx, gy] = groundAt(wx, wsy);
  if (G.tgt) { const { s: ts, idx } = G.tgt; if (useBoost(ts, idx, false, gx, gy)) { G.tgt = null; G.sel = null; } uiCards(); return; }
  const mine = alive(1).map(s => [s, Math.hypot(s.x - wx, s.y - lift(s.x, s.y) - 6 - wsy)]).filter(([, d]) => d < 32).sort((a, b) => a[1] - b[1])[0];
  if (mine) { select(mine[0]); uiCards(); return; }
  const sel = G.sel; if (!sel || !sel.alive) { say('Коснитесь своего отряда или его знамени слева'); return; }
  const foe = alive(2).map(s => [s, Math.hypot(s.x - wx, s.y - lift(s.x, s.y) - 6 - wsy)]).filter(([, d]) => d < 28).sort((a, b) => a[1] - b[1])[0];
  G.sel = null; G.tgt = null;
  if (foe) { attack(sel, foe[0]); SND.play('order'); } else cmd(sel, gx, gy);
  uiCards();
}
const ptrs = new Map(); let gest = null;
cv.addEventListener('pointerdown', e => {
  if (G.over || !started) return; const p = scr(e); if (p[1] < VTOP) return;
  ptrs.set(e.pointerId, { x: p[0], y: p[1], sx: p[0], sy: p[1] }); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  if (ptrs.size === 1) gest = { moved: false, pinch: false };
  else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; gest = { moved: true, pinch: true, d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: cam.z, w0: toWorld((a.x + b.x) / 2, (a.y + b.y) / 2) }; }
});
cv.addEventListener('pointermove', e => {
  const q = ptrs.get(e.pointerId); if (!q || !gest) return; const p = scr(e), dx = p[0] - q.x, dy = p[1] - q.y; q.x = p[0]; q.y = p[1];
  if (gest.pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y); cam.z = Math.max(1, Math.min(2.6, gest.z0 * d / gest.d0)); const k = SCW * cam.z; cam.cx = gest.w0[0] - ((a.x + b.x) / 2 - W / 2) / k; cam.cy = gest.w0[1] - ((a.y + b.y) / 2 - VC) / k; clampCam(); }
  else if (ptrs.size === 1) { if (!gest.moved && Math.hypot(q.x - q.sx, q.y - q.sy) > 9) gest.moved = true; if (gest.moved) { cam.fx = undefined; const k = SCW * cam.z; cam.cx -= dx / k; cam.cy -= dy / k; clampCam(); } }
});
const endPtr = e => { const q = ptrs.get(e.pointerId); if (!q) return; ptrs.delete(e.pointerId); if (gest && !gest.moved && !gest.pinch && ptrs.size === 0 && e.type === 'pointerup') { const [x, y] = toWorld(q.x, q.y); tapAt(x, y); } if (ptrs.size === 0) gest = null; };
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', e => { e.preventDefault(); const p = scr(e), w0 = toWorld(p[0], p[1]); cam.z = Math.max(1, Math.min(2.6, cam.z * Math.pow(1.0015, -e.deltaY))); const k = SCW * cam.z; cam.cx = w0[0] - (p[0] - W / 2) / k; cam.cy = w0[1] - (p[1] - VC) / k; clampCam(); }, { passive: false });
$('zoomchip').addEventListener('click', () => { cam.z = 1; cam.cx = WX / 2; cam.cy = 376; clampCam(); });
const focusOn = s => { cam.fx = s.x; cam.fy = s.y - lift(s.x, s.y); };
function easeCam() { if (cam.fx === undefined) return; if (cam.z <= 1.02) { cam.fx = undefined; return; } cam.cx += (cam.fx - cam.cx) * 0.18; cam.cy += (cam.fy - cam.cy) * 0.18; clampCam(); if (Math.hypot(cam.fx - cam.cx, cam.fy - cam.cy) < 2) cam.fx = undefined; }
for (let i = 0; i < 4; i++) $('rb' + i).addEventListener('click', () => { if (G.over || !started) return; const s = G.rome[i]; if (!s.alive) { say('Генерал ' + s.name + ' ранен'); return; } select(s); focusOn(s); uiCards(); });
$('restart').addEventListener('click', () => restart()); $('ovB').addEventListener('click', () => restart());
$('helpOk').addEventListener('click', () => { $('help').hidden = true; started = true; SND.init(); });
$('mus').addEventListener('click', () => { SND.toggleMusic(); $('mus').textContent = SND.isMus() ? '♪' : '♪̸'; $('mus').style.opacity = SND.isMus() ? 1 : 0.45; });
$('snd').addEventListener('click', () => { SND.toggleSfx(); $('snd').textContent = SND.isSfx() ? '🔊' : '🔇'; $('snd').style.opacity = SND.isSfx() ? 1 : 0.45; });
document.addEventListener('visibilitychange', () => SND.visible(!document.hidden));
function renderSlots() {
  $('slots').innerHTML = slots.map((c, i) => '<button type="button" data-i="' + i + '">' + GEN[i] + ' · ' + CLS[c].name + '<small>' + CLS[c].hint + '</small></button>').join('');
  for (const b of $('slots').children) b.addEventListener('click', () => { const i = +b.dataset.i; slots[i] = ORDER[(ORDER.indexOf(slots[i]) + 1) % ORDER.length]; renderSlots(); newBattle(); });
}
function restart() { newBattle(); $('over').hidden = true; $('help').hidden = true; started = true; SND.init(); }
let toastT = 0;
function say(text) { const t = $('toast'); t.textContent = text; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); }

// ---------------------------------------------------------------- loop
newBattle(); renderSlots();
let last = performance.now();
function loop(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; step(dt); easeCam(); draw(now / 1000); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
window.__cr = { get G() { return G; }, step, cmd, attack, useBoost, newBattle, findPath, NAV, COR, FOR, MUL, CAMPM, GW, GH, GS, OB, BUILD, STARTS, PATHS, NODES, ENEMIES, alive, cellOf, nearestWalkable, hAt, spec, setSlots: s => { slots = s; }, start: () => { started = true; }, pass };
