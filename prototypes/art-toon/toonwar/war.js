// ---------------------------------------------------------------- board
const W = 540, H = 960, BAR = 92, DPR = Math.min(2, window.devicePixelRatio || 1), VCY = (H - BAR) / 2 + 30;
const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d'); cv.width = W * DPR; cv.height = H * DPR;
function fit() { const k = Math.max(0.3, Math.min((innerWidth - 32) / W, (innerHeight - 32) / H, 1.2)); $('board').style.transform = 'scale(' + k + ')'; $('fit').style.width = W * k + 'px'; $('fit').style.height = H * k + 'px'; }
addEventListener('resize', fit); addEventListener('load', fit); fit();

// ---------------------------------------------------------------- the map's shapes (the same as the art board)
const FORT_P = [[0, 0], [900, 0], [900, 430], [700, 440], [520, 436], [505, 470], [395, 470], [380, 436], [200, 444], [0, 432]];
const RIGHT_P = [[520, 436], [700, 440], [900, 430], [900, 764], [780, 774], [640, 766], [620, 600]];
const LEFT_P = [[0, 432], [200, 444], [380, 436], [300, 520], [296, 760], [160, 774], [0, 764]];
const RAMPS = [[56, 740, 104, 822], [202, 744, 250, 820], [696, 746, 744, 824], [276, 598, 344, 642], [578, 618, 646, 662], [392, 436, 508, 506]];
const FORDS = [[452, 940, 46], [772, 938, 44]];
const MOUNDS = [[360, 640, 46, 30], [560, 650, 46, 30], [300, 1110, 40, 26]];
const ROADS = [[[450, 1500], [450, 1300], [440, 1150], [450, 1040], [450, 900], [450, 760], [450, 600], [450, 470], [450, 330]], [[450, 820], [350, 760], [250, 700], [160, 660]], [[450, 820], [560, 760], [660, 700], [740, 664]],
  [[420, 1360], [300, 1250], [190, 1120], [150, 1004]], [[150, 886], [120, 840], [80, 812]], [[150, 886], [200, 850], [226, 812]], [[480, 1360], [620, 1250], [740, 1160], [770, 1000]], [[770, 890], [740, 840], [720, 816]]];
const HOUSES = [[690, 1150], [760, 1220], [640, 1240], [230, 1180]];
const CAMP = { x: 450, y: 1400, rx: 160, ry: 72 }, TENTS = [[360, 1440], [540, 1440], [450, 1466]];
const OB = { x: 450, y: 464, stand: [450, 502], open: false, prog: 0, need: 6 };
const BR = { x: 150, y0: 886, y1: 1000, stand: [150, 1024], open: false, prog: 0, need: 10 };
function riverPoly() { const top = [], bot = []; for (let x = 0; x <= WW; x += 90) top.push([x, 900 + (x / 90 % 2 ? -10 : 4)]); for (let x = WW; x >= 0; x -= 90) bot.push([x, 990 + (x / 90 % 2 ? -8 : 6)]); return top.concat(bot); }

// ---------------------------------------------------------------- navigation grid: 6 px cells; levels low / high, ramps join them
const GS = 6, GW = WW / GS, GH = WH / GS, NN = GW * GH;
const T = { WATER: 0, LOW: 1, HIGH: 2, RAMP: 3, FORD: 4, BRIDGE: 5, BLOCK: 6, BARR: 7, MOUND: 8 };
const TY = new Uint8Array(NN).fill(T.LOW), ROADM = new Uint8Array(NN), CAMPM = new Uint8Array(NN);
(function buildNav() {
  const c = document.createElement('canvas'); c.width = WW; c.height = WH; const g = c.getContext('2d');
  const mask = draw => { g.clearRect(0, 0, WW, WH); g.fillStyle = '#000'; g.strokeStyle = '#000'; g.lineCap = 'round'; g.lineJoin = 'round'; draw(g); const d = g.getImageData(0, 0, WW, WH).data, m = new Uint8Array(NN); for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) m[j * GW + i] = d[((j * GS + 3) * WW + i * GS + 3) * 4 + 3] > 127 ? 1 : 0; return m; };
  const poly = (gg, pts) => { gg.beginPath(); pts.forEach(([x, y], i) => i ? gg.lineTo(x, y) : gg.moveTo(x, y)); gg.closePath(); gg.fill(); };
  const hi = mask(gg => { poly(gg, FORT_P); poly(gg, RIGHT_P); poly(gg, LEFT_P); });
  const water = mask(gg => poly(gg, riverPoly()));
  const ford = mask(gg => { for (const [x, y, r] of FORDS) { gg.beginPath(); gg.ellipse(x, y, r, 60, 0, 0, 7); gg.fill(); } });
  const bridge = mask(gg => gg.fillRect(BR.x - 20, BR.y0 - 8, 40, BR.y1 - BR.y0 + 16));
  const ramp = mask(gg => { for (const [a, b, c2, d] of RAMPS) gg.fillRect(a, b, c2 - a, d - b); });
  const mound = mask(gg => { for (const [x, y, rx, ry] of MOUNDS) { gg.beginPath(); gg.ellipse(x, y, rx, ry, 0, 0, 7); gg.fill(); } });
  const block = mask(gg => { gg.beginPath(); gg.arc(160, 652, 28, 0, 7); gg.fill(); gg.beginPath(); gg.ellipse(740, 650, 44, 26, 0, 0, 7); gg.fill(); gg.fillRect(352, 220, 196, 118); for (const [x, y] of HOUSES) { gg.beginPath(); gg.ellipse(x, y - 12, 28, 18, 0, 0, 7); gg.fill(); } gg.beginPath(); gg.ellipse(600, 1070, 38, 20, 0, 0, 7); gg.fill(); });
  const barr = mask(gg => gg.fillRect(OB.x - 72, OB.y - 22, 144, 32));
  const road = mask(gg => { gg.lineWidth = 34; for (const line of ROADS) { gg.beginPath(); line.forEach(([x, y], i) => i ? gg.lineTo(x, y) : gg.moveTo(x, y)); gg.stroke(); } });
  const camp = mask(gg => { gg.beginPath(); gg.ellipse(CAMP.x, CAMP.y, CAMP.rx, CAMP.ry, 0, 0, 7); gg.fill(); });
  for (let c2 = 0; c2 < NN; c2++) {
    let t = hi[c2] ? T.HIGH : T.LOW;
    if (water[c2]) t = T.WATER; if (ford[c2] && water[c2]) t = T.FORD; if (bridge[c2] && water[c2]) t = T.BRIDGE;
    if (ramp[c2] && !water[c2]) t = T.RAMP; if (mound[c2] && t === T.LOW) t = T.MOUND;
    if (block[c2]) t = T.BLOCK; if (barr[c2]) t = T.BARR;
    TY[c2] = t; ROADM[c2] = road[c2]; CAMPM[c2] = camp[c2];
  }
})();
const cellOf = (x, y) => Math.min(GH - 1, Math.max(0, y / GS | 0)) * GW + Math.min(GW - 1, Math.max(0, x / GS | 0));
const cx_ = c => (c % GW + 0.5) * GS, cy_ = c => ((c / GW | 0) + 0.5) * GS;
const lev = t => t === T.HIGH ? 1 : (t === T.RAMP || t === T.BARR) ? -1 : 0;
const canStep = (a, b) => { const la = lev(TY[a]), lb = lev(TY[b]); return la < 0 || lb < 0 || la === lb; };
function pass(c, side) { const t = TY[c]; if (t === T.WATER || t === T.BLOCK) return false; if (t === T.BARR && !OB.open) return false; if (t === T.BRIDGE && !BR.open) return false; if (side === 2 && CAMPM[c]) return false; return true; }
const MULc = c => { const t = TY[c]; return t === T.FORD ? 2.2 : t === T.RAMP || t === T.BARR ? 1.4 : t === T.MOUND ? 1.25 : ROADM[c] ? 0.8 : 1; };
const hAt = (x, y) => { const t = TY[cellOf(x, y)]; return t === T.HIGH ? 0.7 : t === T.MOUND ? 0.45 : (t === T.RAMP || t === T.BARR) ? 0.35 : t === T.FORD ? 0 : 0.1; };
const WATERH = 0.05;
function nearestWalkable(x, y, side, R) { let best = null, bd = 1e9; for (let j = Math.max(0, (y - R) / GS | 0); j <= Math.min(GH - 1, (y + R) / GS | 0); j++) for (let i = Math.max(0, (x - R) / GS | 0); i <= Math.min(GW - 1, (x + R) / GS | 0); i++) { const c = j * GW + i; if (!pass(c, side)) continue; const d = Math.hypot(cx_(c) - x, cy_(c) - y); if (d < bd && d <= R) { bd = d; best = [cx_(c), cy_(c)]; } } return best; }
function los(x0, y0, x1, y1, side) { const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 3); let prev = cellOf(x0, y0); for (let k = 1; k <= n; k++) { const t = k / n, c = cellOf(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t); if (c === prev) continue; if (!pass(c, side) || !canStep(prev, c)) return false; prev = c; } return true; }
const GSC = new Float32Array(NN), STAMP = new Uint32Array(NN), PREV = new Int32Array(NN), CLOSED = new Uint32Array(NN), HF = new Float32Array(NN * 8), HI = new Int32Array(NN * 8); let stampN = 0;
const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
function stepOk(c, n, dx, dy, side) { if (!pass(n, side) || !canStep(c, n)) return false; if (dx && dy) { const a = c + dx, b = c + dy * GW; if (!pass(a, side) || !pass(b, side) || !canStep(c, a) || !canStep(c, b)) return false; } return true; }
function findPath(x0, y0, x1, y1, side) {
  let s = cellOf(x0, y0), t = cellOf(x1, y1);
  if (!pass(s, side)) { const n = nearestWalkable(x0, y0, side, 40); if (!n) return null; s = cellOf(n[0], n[1]); }
  if (!pass(t, side)) { const n = nearestWalkable(x1, y1, side, 40); if (!n) return null; t = cellOf(n[0], n[1]); x1 = n[0]; y1 = n[1]; }
  if (s === t) return [[x1, y1]];
  stampN++; let hn = 0;
  const push = (f, i) => { let k = hn++; HF[k] = f; HI[k] = i; while (k > 0) { const p = (k - 1) >> 1; if (HF[p] <= HF[k]) break; const tf = HF[p]; HF[p] = HF[k]; HF[k] = tf; const ti = HI[p]; HI[p] = HI[k]; HI[k] = ti; k = p; } };
  const pop = () => { const top = HI[0]; hn--; if (hn > 0) { HF[0] = HF[hn]; HI[0] = HI[hn]; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < hn && HF[l] < HF[m]) m = l; if (r < hn && HF[r] < HF[m]) m = r; if (m === k) break; const tf = HF[m]; HF[m] = HF[k]; HF[k] = tf; const ti = HI[m]; HI[m] = HI[k]; HI[k] = ti; k = m; } } return top; };
  const tx = t % GW, ty = t / GW | 0, hh = c => { const dx = Math.abs(c % GW - tx), dy = Math.abs((c / GW | 0) - ty); return (dx + dy) + (1.414 - 2) * Math.min(dx, dy); };
  STAMP[s] = stampN; GSC[s] = 0; PREV[s] = -1; push(hh(s), s); let found = false;
  while (hn > 0) {
    const c = pop(); if (c === t) { found = true; break; } if (CLOSED[c] === stampN) continue; CLOSED[c] = stampN;
    const ci = c % GW, cj = c / GW | 0, g0 = GSC[c];
    for (const [dx, dy, st] of NB) { const ni = ci + dx, nj = cj + dy; if (ni < 0 || nj < 0 || ni >= GW || nj >= GH) continue; const n = nj * GW + ni; if (!stepOk(c, n, dx, dy, side)) continue;
      const ng = g0 + st * MULc(n); if (STAMP[n] !== stampN || ng < GSC[n]) { STAMP[n] = stampN; GSC[n] = ng; PREV[n] = c; push(ng + hh(n), n); } }
  }
  if (!found) return null;
  const cells = []; for (let c = t; c !== -1 && c !== s; c = PREV[c]) cells.push(c); cells.reverse();
  const pts = cells.map(c => [cx_(c), cy_(c)]); const out = []; let i = 0, cur = [x0, y0];
  while (i < pts.length) { let j = Math.min(pts.length - 1, i + 24); while (j > i && !los(cur[0], cur[1], pts[j][0], pts[j][1], side)) j--; out.push(pts[j]); cur = pts[j]; i = j + 1; }
  out[out.length - 1] = [x1, y1]; return out;
}

// ---------------------------------------------------------------- squads and the battle
const SLOW = 0.25, MELEE = 58, REFILL = 3.5, SPD = 1.5, RNG = 0.85;
let G, uid = 0, started = false, GSPEED = 1;
const inCamp = s => ((s.x - CAMP.x) / CAMP.rx) ** 2 + ((s.y - CAMP.y) / CAMP.ry) ** 2 < 1;
const alive = side => G.sq.filter(s => s.alive && (!side || s.side === side));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const hidden = () => false;
const STARTS = [[380, 1372], [470, 1366], [560, 1376], [300, 1400]];
const ENEMIES = [['e_inf', 5, 450, 836, 'fd'], ['e_arc', 3, 360, 628, 'vl'], ['e_arc', 3, 560, 638, 'vl'], ['e_inf', 4, 220, 700, 'tw'], ['e_arc', 3, 150, 600, 'tw'], ['e_inf', 4, 680, 712, 'gr'],
  ['e_inf', 5, 450, 560, 'ps'], ['e_cav', 3, 600, 770, 'vl', [[600, 770], [340, 770]]], ['e_inf', 3, 760, 846, 'ef'], ['e_inf', 6, 410, 392, 'ft'], ['e_inf', 6, 500, 392, 'ft'], ['e_cav', 3, 600, 410, 'ft']];
const POINTS = [{ name: 'Дозорная башня', x: 160, y: 672, r: 82, need: 4 }, { name: 'Амбар', x: 740, y: 676, r: 88, need: 4 }, { name: 'Форт', x: 450, y: 374, r: 84, need: 6, final: true }];
function addSq(side, cls, x, y, ai, zone, patrol, n) {
  const d = CLS[cls];
  const s = { id: ++uid, side, cls, kind: d.kind, n: n || d.n, max: n || d.n, k: d.k, speed: d.speed * SPD, range: (d.range || 0) * RNG, x, y, path: [], atk: null, atkT: 0, work: null, sk: 0, cd: 0,
              boosts: (BOOSTS[cls] || []).map(id => ({ id, cd: 0, left: BOOST[id].uses === undefined ? Infinity : BOOST[id].uses })), travel: 0, alive: true, ai, home: [x, y], face: side === 1 ? 1 : -1, name: d.name, thinkT: Math.random() * 0.7,
              pend: 0, moving: false, clash: 0, zone, patrol: patrol || null, hurt: 0, wedgeT: 0, slowT: 0, refT: 0 };
  G.sq.push(s); return s;
}
function newBattle() {
  OB.open = false; OB.prog = 0; BR.open = false; BR.prog = 0;
  G = { t: 0, over: false, sq: [], sel: null, fx: [], volleys: [], rome: [], kills: 0, lost: 0, alarm: {}, reserve: 10, parts: [], warn: [], traps: [], rains: [], tgt: null, points: POINTS.map(p => ({ ...p, owner: 2, prog: 0 })) };
  initDecals();
  slots.forEach((cls, i) => { const s = addSq(1, cls, STARTS[i][0], STARTS[i][1], 'player'); s.name = GEN[i]; G.rome.push(s); });
  for (const [cls, n, x, y, zone, patrol] of ENEMIES) addSq(2, cls, x, y, 'hold', zone, patrol, n);
  cam.z = 1; cam.x = 450; cam.y = 1300; clampCam(); railPainted = null; uiCards();
}
// blood and the fallen stay where they fell
let DEC = null, dctx = null;
function initDecals() { DEC = document.createElement('canvas'); DEC.width = WW; DEC.height = WH; dctx = DEC.getContext('2d'); }
function splat(x, y, r, a) { dctx.fillStyle = 'rgba(150,20,14,' + a + ')'; for (let i = 0; i < 4; i++) { dctx.beginPath(); dctx.ellipse(x + (Math.random() - .5) * r * 1.4, y + (Math.random() - .5) * r * 0.8, r * (0.4 + Math.random() * 0.6), r * (0.25 + Math.random() * 0.35), Math.random() * 3, 0, 7); dctx.fill(); } }
function bleed(t) { splat(t.x + (Math.random() - .5) * 30, t.y + (Math.random() - .5) * 16, 2.5 + Math.random() * 3, 0.35); for (let i = 0; i < 3; i++) G.parts.push({ x: t.x + (Math.random() - .5) * 16, y: t.y - 18, vx: (Math.random() - .5) * 70, vy: -30 - Math.random() * 50, t: 0.45 + Math.random() * 0.15 }); }
function corpse(x, y, side) {
  splat(x, y + 2, 6 + Math.random() * 3, 0.5);
  dctx.save(); dctx.translate(x, y); dctx.rotate(Math.random() * 6.28); dctx.lineWidth = 1.6; dctx.strokeStyle = OL;
  dctx.fillStyle = side === 1 ? '#e2382c' : '#3f7ae0'; dctx.beginPath(); dctx.ellipse(0, 0, 7, 4, 0, 0, 7); dctx.fill(); dctx.stroke();
  dctx.fillStyle = SKIN; dctx.beginPath(); dctx.arc(8, 0, 4, 0, 7); dctx.fill(); dctx.stroke(); dctx.restore();
}
function fposT(n, i) { const cols = n <= 4 ? 2 : 3, row = Math.floor(i / cols), inRow = Math.min(cols, n - row * cols), col = i % cols, rows = Math.ceil(n / cols); return [(col - (inRow - 1) / 2) * 22, (row - (rows - 1) / 2) * 13]; }

// ---------------------------------------------------------------- boosts and orders
function select(s) { if (G.sel === s) { G.sel = null; G.tgt = null; overlayOn = false; return; } G.sel = s; G.tgt = null; paintOverlay(s); SND.play('select'); }
function useBoost(s, idx, quiet, tx, ty) {
  if (!s || !s.alive) return false;
  const b = s.boosts[idx]; if (!b) { if (!quiet) say('У этого отряда нет такого приказа'); return false; }
  const d = BOOST[b.id];
  if (b.left <= 0) { if (!quiet) say('«' + d.name + '» закончилась'); return false; }
  if (b.cd > 0) { if (!quiet) say('«' + d.name + '»: ещё ' + Math.ceil(b.cd) + ' с'); return false; }
  if (d.kind === 'target') {
    if (tx === undefined) return false;
    if (Math.hypot(tx - s.x, ty - s.y) > d.range) { if (!quiet) say('Слишком далеко для «' + d.name + '»'); return false; }
    if (b.id === 'trap') { if (!pass(cellOf(tx, ty), 1)) { if (!quiet) say('Сюда ловушку не поставить'); return false; } G.traps.push({ x: tx, y: ty, t: 90 }); SND.play('tool', tx); }
    else { G.rains.push({ x: tx, y: ty, t: 0, dur: 3, r: 72 }); SND.play('volley', tx); }
  } else {
    if (b.id === 'wedge') { s.wedgeT = d.dur; s.wedged = false; if (s.cls === 'eques') s.travel = 999; SND.play('wedge', s.x); }
    else { s.sk = d.dur; if (b.id === 'gallop') s.travel = 999; SND.play({ turtle: 'shield', volley: 'volley', gallop: 'gallop', rush: 'rush' }[b.id], s.x); }
  }
  b.cd = d.cd; if (b.left !== Infinity) b.left--; G.fx.push({ x: s.x, y: s.y, t: 0.6, big: true });
  if (!quiet) say('«' + d.name + '»: ' + d.text); return true;
}
const siteAt = (x, y) => (!OB.open && Math.abs(x - OB.x) < 74 && Math.abs(y - OB.y) < 44) ? OB : (!BR.open && Math.abs(x - BR.x) < 46 && y > BR.y0 - 20 && y < BR.y1 + 16) ? BR : null;
function cmd(s, tx, ty, quiet) {
  s.work = null; s.atk = null;
  const site = siteAt(tx, ty);
  if (site) {
    if (s.cls !== 'eng') { if (!quiet) say(site === OB ? 'Баррикаду разбирают только инженеры' : 'Мост строят только инженеры'); return false; }
    const p = findPath(s.x, s.y, site.stand[0], site.stand[1], 1); if (!p) { if (!quiet) say('К стройке не подойти'); return false; }
    s.path = p; s.work = { site }; if (!quiet) SND.play('order'); return true;
  }
  const w = nearestWalkable(tx, ty, 1, 34); if (!w || RT[cellOf(w[0], w[1])] >= 1e8 && G.sel !== null) { if (!quiet) say(TY[cellOf(tx, ty)] === T.WATER ? 'Реку переходят по бродам или мосту' : 'Туда не пройти'); if (!w) return false; }
  const p = findPath(s.x, s.y, w[0], w[1], 1); if (!p) { if (!quiet) say('Путь закрыт'); return false; }
  s.path = p; if (!quiet) SND.play('order'); return true;
}
function attack(s, foe, quiet) { s.work = null; s.atk = foe; s.atkT = 0; const p = findPath(s.x, s.y, foe.x, foe.y, s.side); s.path = p || []; if (!p && !quiet) say('К ним не подойти'); return !!p; }

// ---------------------------------------------------------------- the defenders: one alarm per post, patrols, leashes
function raise(zone, who, secs) { if (!zone) return; const was = (G.alarm[zone] || 0) > G.t; G.alarm[zone] = Math.max(G.alarm[zone] || 0, G.t + secs); if (!was) { G.warn.push({ x: who.x, y: who.y, t: 2.5 }); SND.play('alarm', who.x); } }
function think(s, dt) {
  s.thinkT -= dt; if (s.thinkT > 0 || s.ai === 'player') return; s.thinkT = 0.6;
  const foes = alive(1); if (!foes.length) return;
  let tgt = null, bd = 1e9; for (const f of foes) { if (inCamp(f)) continue; const d = dist(s, f); if (d < bd) { bd = d; tgt = f; } }
  const [hx, hy] = s.home, alarm = (G.alarm[s.zone] || 0) > G.t, aggro = alarm ? 320 : 180, leash = alarm ? 460 : 300;
  if (tgt && bd < aggro) raise(s.zone, s, 12);
  if (tgt && bd < aggro && Math.hypot(tgt.x - hx, tgt.y - hy) < leash) { s.atk = tgt; s.pauseT = 0; }
  else if (s.atk && (!s.atk.alive || Math.hypot(s.atk.x - hx, s.atk.y - hy) > leash + 60)) { s.atk = null; s.path = []; }
  if (!s.atk && !s.path.length) {
    if (s.pauseT > 0) s.pauseT--;
    else if (s.patrol && !alarm) { s.pi = ((s.pi || 0) + 1) % s.patrol.length; s.path = findPath(s.x, s.y, s.patrol[s.pi][0], s.patrol[s.pi][1], 2) || []; s.pauseT = 4; }
    else if (Math.hypot(s.x - hx, s.y - hy) > 16) s.path = findPath(s.x, s.y, hx, hy, 2) || [];
  }
}
function pursue(s, dt) {
  if (s.atk && !s.atk.alive) { s.atk = null; s.path = []; }
  if (!s.atk) return; s.atkT -= dt; if (s.atkT > 0) return; s.atkT = 0.5;
  const t = s.atk, d = dist(s, t), rr0 = s.range ? s.range * (hAt(s.x, s.y) > hAt(t.x, t.y) + 0.08 ? 1.35 : 1) * 0.9 : MELEE - 8;
  if (d <= rr0) { s.path = []; return; }
  s.path = findPath(s.x, s.y, t.x, t.y, s.side) || [];
}
function step(raw) {
  if (G.over || !started) return;
  const dt = raw * GSPEED * (G.sel && G.sel.alive ? SLOW : 1); G.t += dt;
  const live = alive();
  for (const p of G.points) {
    const mine = live.filter(q => q.side === 1 && !q.moving && Math.hypot(q.x - p.x, q.y - p.y) < p.r), hostile = live.some(e => e.side === 2 && Math.hypot(e.x - p.x, e.y - p.y) < p.r + 40);
    if (p.owner === 2) {
      if (mine.length && !hostile) { p.prog += dt; if (p.prog >= p.need) { p.owner = 1; p.prog = 0; SND.play('capture'); G.fx.push({ x: p.x, y: p.y, t: 0.8, big: true }); if (!p.final) { G.reserve += 3; say(p.name + ' взят! В резерв +3'); } } }
      else { const was = p.prog; p.prog = Math.max(0, p.prog - dt * 0.5); if (was > 0 && p.prog === 0) SND.play('lost'); }
    }
  }
  for (const q of live) if (q.side === 1) {
    q.inTent = !q.moving && TENTS.some(([x, y]) => Math.hypot(q.x - x, q.y - (y - 14)) < 34);
    if (!q.inTent || q.n >= q.max || G.reserve <= 0 || live.some(e => e.side === 2 && dist(e, q) < 140)) { q.refT = 0; continue; }
    q.refT += dt; if (q.refT >= REFILL) { q.refT = 0; q.n = Math.min(q.max, q.n + 1); q.shown = Math.ceil(q.n); G.reserve--; G.fx.push({ x: q.x, y: q.y, t: 0.5, big: true }); SND.play('recruit', q.x); if (G.reserve === 0) say('Резерв кончился: больше пополнять нечем'); }
  }
  for (const s of live) {
    if (s.sk > 0) s.sk = Math.max(0, s.sk - dt);
    for (const b of s.boosts) if (b.cd > 0) b.cd = Math.max(0, b.cd - dt);
    if (s.hurt > 0) s.hurt -= dt; if (s.wedgeT > 0) s.wedgeT -= dt; if (s.slowT > 0) s.slowT -= dt;
    if (s.side === 2) { think(s, dt); pursue(s, dt); } else if (s.atk) pursue(s, dt);
  }
  for (const s of live) {
    s.moving = s.path.length > 0; if (!s.moving) continue;
    const [tx, ty] = s.path[0], dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy);
    const sp = s.speed / MULc(cellOf(s.x, s.y)) * (s.sk > 0 && s.cls === 'hastati' ? 0.5 : 1) * (s.sk > 0 && s.cls === 'eques' ? 1.8 : 1) * (s.wedgeT > 0 ? 1.35 : 1) * (s.slowT > 0 ? 0.4 : 1);
    const mv = Math.min(d, sp * dt);
    if (d > 0.01) { s.x += dx / d * mv; s.y += dy / d * mv; if (Math.abs(dx) > 1) s.face = dx < 0 ? -1 : 1; s.travel += mv; }
    if (d - mv < 3) s.path.shift();
  }
  for (let a = 0; a < live.length; a++) for (let b = a + 1; b < live.length; b++) {
    const p = live[a], q = live[b], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 0.01, min = p.side === q.side ? 44 : 50;
    if (d >= min) continue; const push = (min - d) / 2 * 0.7, ux = dx / d, uy = dy / d;
    const pc = cellOf(p.x, p.y), qc = cellOf(q.x, q.y);
    const nx = p.x - ux * push, ny = p.y - uy * push, n1 = cellOf(nx, ny); if (pass(n1, p.side) && canStep(pc, n1)) { p.x = nx; p.y = ny; }
    const mx = q.x + ux * push, my = q.y + uy * push, n2 = cellOf(mx, my); if (pass(n2, q.side) && canStep(qc, n2)) { q.x = mx; q.y = my; }
  }
  for (const s of live) if (s.work && !s.path.length) {
    const site = s.work.site; if (site.open || Math.hypot(s.x - site.stand[0], s.y - site.stand[1]) > 46) { s.work = null; continue; }
    site.prog += dt * (s.sk > 0 ? 3 : 1); s.clash -= dt;
    if (s.clash <= 0) { s.clash = 0.35; G.fx.push({ x: site === OB ? OB.x + (Math.random() - .5) * 90 : BR.x + (Math.random() - .5) * 30, y: site === OB ? OB.y : BR.y0 + 40 + (Math.random() - .5) * 60, t: 0.3 }); SND.play('tool', s.x); }
    if (site.prog >= site.need) { site.open = true; s.work = null; SND.play('crash', s.x); G.fx.push({ x: s.x, y: s.y - 30, t: 0.8, big: true }); say(site === OB ? 'Баррикада разобрана, перевал открыт' : 'Мост построен! Можно перейти реку у левого хребта'); if (G.sel) paintOverlay(G.sel); }
  }
  G.volleys = G.volleys.filter(v => (v.t += dt * 2.2) < 1);
  for (const a of live) {
    a.fighting = false; if (a.moving || a.work) continue;
    let t = null, bd = 1e9;
    for (const e of live) { if (e.side === a.side) continue; const d = dist(a, e), R = a.range ? a.range * (hAt(a.x, a.y) > hAt(e.x, e.y) + 0.08 ? 1.35 : 1) : MELEE; if (d > R || d >= bd) continue; bd = d; t = e; }
    if (!t) continue;
    a.fighting = true; a.face = t.x < a.x - 1 ? -1 : t.x > a.x + 1 ? 1 : a.face;
    let v = a.n * a.k * MULT[a.kind][t.kind] * dt; const ranged = a.range > 0;
    if (a.sk > 0 && a.cls === 'velites') v *= 2.5;
    if (t.sk > 0 && t.cls === 'hastati') v *= ranged ? 0.35 : 0.85;
    if (!ranged && hAt(t.x, t.y) > hAt(a.x, a.y) + 0.08) v *= 0.8;
    if (hAt(t.x, t.y) < WATERH) v *= 1.25;
    if ((a.cls === 'eques' || a.cls === 'e_cav') && a.travel >= 90) { v += 0.8 * a.n * MULT[CAV][t.kind] * (a.sk > 0 ? 1.4 : 1) * (a.wedgeT > 0 ? 1.5 : 1); a.travel = 0; SND.play('charge', a.x); G.fx.push({ x: (a.x + t.x) / 2, y: (a.y + t.y) / 2, t: 0.5, big: true }); }
    if (!ranged && a.wedgeT > 0 && !a.wedged && a.cls !== 'eques') { a.wedged = true; v += 0.5 * a.n * MULT[a.kind][t.kind]; SND.play('charge', a.x); G.fx.push({ x: (a.x + t.x) / 2, y: (a.y + t.y) / 2, t: 0.5, big: true }); }
    t.pend += v; t.hurt = 0.25; if (t.side === 2) raise(t.zone, t, 14);
    a.clash -= dt; if (a.clash <= 0) { a.clash = ranged ? 0.5 : 0.35; bleed(t); SND.hit(a); if (ranged) G.volleys.push({ x: a.x, y: a.y - 20, tx: t.x, ty: t.y - 14, t: 0, side: a.side }); else G.fx.push({ x: (a.x + t.x) / 2 + (Math.random() - .5) * 16, y: (a.y + t.y) / 2 - 10, t: 0.3 }); }
  }
  for (const s of live) if (s.pend) {
    s.n -= s.pend; s.pend = 0; if (s.shown === undefined) s.shown = Math.ceil(s.max);
    if (s.n <= 0.25) die(s);
    else { const c2 = Math.ceil(s.n); for (let i = c2; i < s.shown; i++) { const [lx, ly] = fposT(s.shown, i); corpse(s.x + lx, s.y + ly, s.side); } s.shown = Math.min(s.shown, c2); }
  }
  for (const tr of G.traps) { tr.t -= dt; for (const e of live) if (e.side === 2 && e.alive && Math.hypot(e.x - tr.x, e.y - tr.y) < 26) { e.pend += 1.8; e.slowT = 4; tr.t = 0; raise(e.zone, e, 14); G.fx.push({ x: tr.x, y: tr.y, t: 0.6, big: true }); for (let i = 0; i < 4; i++) bleed(e); SND.play('crash', tr.x); break; } }
  G.traps = G.traps.filter(t => t.t > 0);
  for (const rn of G.rains) { rn.t += dt; for (const e of live) if (e.side === 2 && e.alive && Math.hypot(e.x - rn.x, e.y - rn.y) < rn.r) { e.pend += 0.55 * dt; e.hurt = 0.25; raise(e.zone, e, 14); } if (Math.random() < dt * 6) SND.play('arrow', rn.x); }
  G.rains = G.rains.filter(r => r.t < r.dur);
  for (const f of G.fx) f.t -= dt; G.fx = G.fx.filter(f => f.t > 0);
  for (const w of G.warn) w.t -= dt; G.warn = G.warn.filter(w => w.t > 0);
  for (const p of G.parts) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 190 * dt; } G.parts = G.parts.filter(p => p.t > 0);
  checkEnd();
}
function die(s) {
  if (s.shown === undefined) s.shown = Math.ceil(s.max);
  for (let i = 0; i < s.shown; i++) { const [lx, ly] = fposT(s.shown, i); corpse(s.x + lx, s.y + ly, s.side); }
  splat(s.x, s.y + 4, 20, 0.45); s.n = 0; s.alive = false; s.path = []; G.fx.push({ x: s.x, y: s.y, t: 0.9, big: true, rout: true });
  SND.play(s.side === 1 ? 'death' : 'kill', s.x);
  if (G.sel === s) { G.sel = null; G.tgt = null; overlayOn = false; }
  if (s.side === 1) { G.lost++; say('Генерал ' + s.name + ' ранен, отряд выбыл из боя'); } else G.kills++;
}
const clock = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
function checkEnd() {
  let win = 0, why = '';
  if (G.points[2].owner === 1) { win = 1; why = 'Форт взят, над переправой орёл легиона.'; }
  else if (!alive(1).length) { win = 2; why = 'Все четыре отряда выбиты.'; }
  if (!win) return;
  G.over = true; G.sel = null; G.tgt = null; overlayOn = false; SND.play(win === 1 ? 'win' : 'lose');
  $('ovT').textContent = win === 1 ? 'Победа!' : 'Поражение';
  $('ovP').textContent = why + ' Время ' + clock(G.t) + ' · врагов выбито ' + G.kills + ' · генералов потеряно ' + G.lost + '.';
  $('over').hidden = false; G.winner = win;
}

// ---------------------------------------------------------------- where can I walk
const RT = new Float32Array(NN).fill(1e9), OV = document.createElement('canvas'); OV.width = GW * 4; OV.height = GH * 4; let overlayOn = false;
function paintOverlay(q) {
  RT.fill(1e9); const s0 = cellOf(q.x, q.y); RT[s0] = 0; const open = [s0], inQ = new Uint8Array(NN); inQ[s0] = 1;
  while (open.length) { let bi = 0; for (let k = 1; k < open.length; k++) if (RT[open[k]] < RT[open[bi]]) bi = k; const c = open[bi]; open[bi] = open[open.length - 1]; open.pop(); inQ[c] = 0;
    const ci = c % GW, cj = c / GW | 0; if (RT[c] > 30) continue;
    for (const [dx, dy, st] of NB) { const ni = ci + dx, nj = cj + dy; if (ni < 0 || nj < 0 || ni >= GW || nj >= GH) continue; const n = nj * GW + ni; if (!stepOk(c, n, dx, dy, 1)) continue; const t = RT[c] + st * GS * MULc(n) / q.speed; if (t < RT[n]) { RT[n] = t; if (!inQ[n]) { inQ[n] = 1; open.push(n); } } } }
  const g = OV.getContext('2d'), C = 4; g.clearRect(0, 0, OV.width, OV.height);
  g.fillStyle = 'rgba(30,20,40,0.52)'; for (let c = 0; c < NN; c++) if (RT[c] >= 1e8) g.fillRect((c % GW) * C, (c / GW | 0) * C, C, C);
  g.fillStyle = 'rgba(255,250,200,0.13)'; for (let c = 0; c < NN; c++) if (RT[c] <= 10) g.fillRect((c % GW) * C, (c / GW | 0) * C, C, C);
  const edge = (pred, style, w, dash) => { g.strokeStyle = style; g.lineWidth = w; g.setLineDash(dash || []); g.beginPath(); for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const c = j * GW + i, a = pred(c); if (i < GW - 1 && a !== pred(c + 1)) { g.moveTo((i + 1) * C, j * C); g.lineTo((i + 1) * C, (j + 1) * C); } if (j < GH - 1 && a !== pred(c + GW)) { g.moveTo(i * C, (j + 1) * C); g.lineTo((i + 1) * C, (j + 1) * C); } } g.stroke(); g.setLineDash([]); };
  edge(c => RT[c] < 1e8, 'rgba(255,255,240,0.95)', 2.6); edge(c => RT[c] <= 5, 'rgba(255,220,90,0.9)', 2.4); edge(c => RT[c] <= 10, 'rgba(255,240,180,0.7)', 2, [5, 5]);
  overlayOn = true;
}

// ---------------------------------------------------------------- the baked world (terrain, roads, trees, buildings)
let BAKE = null; const BS = 1.5;
function bake() {
  BAKE = document.createElement('canvas'); BAKE.width = WW * BS; BAKE.height = WH * BS; const g = BAKE.getContext('2d'); g.scale(BS, BS); const r = rng(5);
  grass(g, 0, 0, WW, WH, '#76c64a', r);
  plateau(g, FORT_P, [[0, 432], [200, 444], [380, 436]], 32, '#8fd457', r);
  plateau(g, RIGHT_P, [[640, 766], [780, 774], [900, 764]], 30, '#86ce52', r);
  plateau(g, LEFT_P, [[0, 764], [160, 774], [296, 760]], 30, '#86ce52', r);
  ramp(g, 80, 762, 36, 50); ramp(g, 226, 766, 36, 46); ramp(g, 720, 768, 36, 48);
  g.save(); g.translate(296, 620); g.rotate(-Math.PI / 2); ramp(g, 0, 0, 34, 38); g.restore();
  g.save(); g.translate(624, 640); g.rotate(Math.PI / 2); ramp(g, 0, 0, 34, 38); g.restore();
  river(g, r, 0);
  for (const line of ROADS) path(g, line, line === ROADS[0] ? 38 : 26);
  for (const [x, y] of [[432, 924], [462, 944], [444, 966], [470, 914], [752, 920], [780, 940], [764, 962], [790, 912]]) stone(g, x, y, 1.1);
  for (const [x, y, rx, ry] of MOUNDS) mound(g, x, y, rx, ry);
  ruin(g, 600, 1080);
  const groves = [[42, 1130, 46, 150, 18], [862, 1150, 44, 150, 18], [572, 1214, 48, 40, 8], [298, 1248, 50, 40, 8], [96, 540, 64, 40, 10], [842, 566, 52, 42, 9], [326, 864, 34, 22, 5], [604, 864, 34, 22, 5], [92, 240, 72, 96, 14], [792, 220, 72, 104, 14], [230, 150, 50, 40, 8], [680, 140, 50, 40, 8]];
  groves.sort((a, b) => a[1] - b[1]).forEach(([x, y, rx, ry, n], i) => grove(g, x, y, rx, ry, n, i * 7 + 3));
  for (const [x, y, k] of [[200, 560, 1], [700, 560, 1.1], [520, 1300, 0.8], [380, 1440, 0.9], [160, 380, 0.9], [740, 380, 0.8]]) rock(g, x, y, k);
  for (const [x, y] of HOUSES) house(g, x, y);
  watchtower(g, 160, 660); granary(g, 740, 662); fort(g, 450, 330);
  g.save(); g.beginPath(); g.ellipse(CAMP.x, CAMP.y, CAMP.rx, CAMP.ry, 0, 0, 7); g.fillStyle = 'rgba(190,140,80,.45)'; g.fill(); g.restore();
  for (let a = 200; a <= 340; a += 8) { const rd = a * Math.PI / 180, x = CAMP.x + Math.cos(rd) * CAMP.rx, y = CAMP.y + Math.sin(rd) * CAMP.ry; if (Math.abs(a - 270) < 13) continue; g.beginPath(); g.moveTo(x - 4, y + 6); g.lineTo(x - 3, y - 14); g.lineTo(x, y - 20); g.lineTo(x + 3, y - 14); g.lineTo(x + 4, y + 6); g.closePath(); fo(g, '#b0783e', 2); }
  for (const [x, y] of TENTS) tent(g, x, y);
}

// ---------------------------------------------------------------- drawing
function drawSquad(s, t) {
  const n = Math.ceil(s.n), pts = []; for (let i = 0; i < n; i++) pts.push(fposT(n, i)); pts.sort((a, b) => a[1] - b[1]);
  ctx.save(); if (s.inTent) ctx.globalAlpha = 0.7;
  if (G.sel === s) { ctx.beginPath(); ctx.ellipse(s.x, s.y + 4, 44, 20, 0, 0, 7); ctx.strokeStyle = OL; ctx.lineWidth = 7; ctx.stroke(); ctx.strokeStyle = '#ffcc33'; ctx.lineWidth = 4; ctx.stroke(); }
  if (s.sk > 0 || s.wedgeT > 0) { ctx.beginPath(); ctx.ellipse(s.x, s.y + 4, 40, 18, 0, 0, 7); ctx.strokeStyle = 'rgba(255,230,120,.9)'; ctx.lineWidth = 3; ctx.stroke(); }
  pts.forEach(([ox, oy], i) => { const bob = s.moving ? Math.abs(Math.sin(t * 12 + i * 1.7)) * 3 : s.fighting ? Math.sin(t * 18 + i) * 1.2 : 0; chibi(ctx, s.x + ox, s.y + oy - bob, s.cls, s.side, 0.6, s.face); });
  const st = BAN[s.cls] || BAN.e_inf; ctx.save(); ctx.translate(s.x - s.face * 34, s.y + 12); ctx.scale(1.2, 1.2); cbanner(ctx, 0, 0, st, 1, Math.sin(t * 5 + s.id) * 1.6); ctx.restore();
  if (s.hurt > 0) { ctx.beginPath(); ctx.ellipse(s.x, s.y - 14, 40, 30, 0, 0, 7); ctx.strokeStyle = 'rgba(255,255,255,' + Math.min(0.8, s.hurt * 4) + ')'; ctx.lineWidth = 3; ctx.stroke(); }
  const f = s.n / s.max; rr(ctx, s.x - 21, s.y + 16, 42, 7, 3.5); ctx.fillStyle = OL; ctx.fill(); rr(ctx, s.x - 19.5, s.y + 17.5, 39 * Math.max(0, f), 4, 2); ctx.fillStyle = f > 0.5 ? '#7ee05a' : f > 0.25 ? '#ffcc33' : '#ff5a4a'; ctx.fill();
  if (s.refT > 0) { ctx.beginPath(); ctx.arc(s.x, s.y - 16, 38, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.refT / REFILL); ctx.strokeStyle = '#7ee05a'; ctx.lineWidth = 5; ctx.stroke(); }
  if (s.work && !s.path.length) { ctx.font = '900 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe6a8'; ctx.fillText('🔨', s.x + 18, s.y - 44 + Math.abs(Math.sin(t * 8)) * -6); }
  ctx.restore();
}
function drawBridge() {
  if (!BR.open) { bridgeSite(ctx, BR.x, BR.prog / BR.need); return; }
  const w = 34; for (let yy = BR.y1 - 8; yy > BR.y0 - 4; yy -= 9) { rr(ctx, BR.x - w / 2 - 3, yy, w + 6, 8, 2); fo(ctx, '#c48a4a', 2); }
  ctx.strokeStyle = OL; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(BR.x - w / 2 - 6, BR.y0 - 4); ctx.lineTo(BR.x - w / 2 - 6, BR.y1); ctx.moveTo(BR.x + w / 2 + 6, BR.y0 - 4); ctx.lineTo(BR.x + w / 2 + 6, BR.y1); ctx.stroke(); ctx.strokeStyle = '#a0703c'; ctx.lineWidth = 2.6; ctx.stroke();
}
function drawBarricade() {
  if (OB.open) { for (let k = -40; k <= 40; k += 20) { rr(ctx, OB.x + k - 8, OB.y + 20 + (k % 40 ? 4 : 0), 22, 6, 3); fo(ctx, '#8a5a30', 2); } return; }
  barricade(ctx, OB.x, OB.y);
  if (OB.prog > 0) { rr(ctx, OB.x - 40, OB.y - 52, 80, 9, 4.5); ctx.fillStyle = OL; ctx.fill(); rr(ctx, OB.x - 38, OB.y - 50, 76 * OB.prog / OB.need, 5, 2.5); ctx.fillStyle = '#ffcc33'; ctx.fill(); }
}
function draw(t) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = '#76c64a'; ctx.fillRect(0, 0, W, H);
  const z = cam.z; ctx.setTransform(DPR * z, 0, 0, DPR * z, DPR * (W / 2 - cam.x * z), DPR * (VCY - cam.y * z));
  if (!BAKE) bake();
  ctx.drawImage(BAKE, 0, 0, WW, WH); ctx.drawImage(DEC, 0, 0, WW, WH);
  drawBridge();
  if (overlayOn && G.sel) ctx.drawImage(OV, 0, 0, WW, WH);
  for (const p of G.points) { const mine = p.owner === 1; capRing(ctx, p.x, p.y, p.r * 0.75, p.prog / p.need); }
  // paths of our moving squads
  for (const s of G.sq) if (s.alive && s.side === 1 && s.path.length) {
    ctx.save(); ctx.setLineDash([2, 12]); ctx.lineCap = 'round'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.lineDashOffset = -t * 20; ctx.beginPath(); ctx.moveTo(s.x, s.y); for (const [x, y] of s.path) ctx.lineTo(x, y); ctx.stroke(); ctx.restore();
    const e = s.path[s.path.length - 1]; ctx.beginPath(); ctx.ellipse(e[0], e[1], 20, 10, 0, 0, 7); ctx.strokeStyle = OL; ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = '#ffcc33'; ctx.lineWidth = 3; ctx.stroke();
  }
  for (const rn of G.rains) { ctx.beginPath(); ctx.ellipse(rn.x, rn.y, rn.r, rn.r * 0.55, 0, 0, 7); ctx.fillStyle = 'rgba(226,56,44,.16)'; ctx.fill(); ctx.strokeStyle = 'rgba(226,56,44,.8)'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = OL; ctx.lineWidth = 2;
    for (let i = 0; i < 16; i++) { const a = i * 2.39996 + rn.t, rr0 = rn.r * Math.sqrt((i + 0.5) / 16), x = rn.x + Math.cos(a) * rr0, y = rn.y + Math.sin(a) * rr0 * 0.55, f = ((t * 3 + i * 0.37) % 1); ctx.beginPath(); ctx.moveTo(x - 2, y - 56 * (1 - f) - 10); ctx.lineTo(x, y - 56 * (1 - f)); ctx.stroke(); } }
  for (const tr of G.traps) { ctx.beginPath(); ctx.ellipse(tr.x, tr.y, 20, 9, 0, 0, 7); fo(ctx, '#4a2a14', 2.2); for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(tr.x + i * 7 - 3, tr.y + 2); ctx.lineTo(tr.x + i * 7, tr.y - 12); ctx.lineTo(tr.x + i * 7 + 3, tr.y + 2); ctx.closePath(); fo(ctx, '#e6ebf0', 1.6); } }
  const items = [{ y: OB.y, f: drawBarricade }];
  for (const s of G.sq) if (s.alive) items.push({ y: s.y, f: () => drawSquad(s, t) });
  for (const p of G.points) items.push({ y: p.y - 70, f: () => { flag(ctx, p.x + (p.final ? 0 : 36), p.y - (p.final ? 210 : 130), p.owner === 1 ? '#e2382c' : '#3f7ae0', 40); } });
  items.sort((a, b) => a.y - b.y); for (const it of items) it.f();
  for (const p of G.points) { ctx.font = '900 15px "Lilita One", sans-serif'; ctx.textAlign = 'center'; const tw = ctx.measureText(p.name).width + 18; rr(ctx, p.x - tw / 2, p.y + p.r * 0.42, tw, 24, 12); ctx.fillStyle = 'rgba(40,24,14,.9)'; ctx.fill(); ctx.strokeStyle = p.owner === 1 ? '#ff7a6a' : '#f2c14a'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = p.owner === 1 ? '#ffb0a6' : '#ffe6a8'; ctx.fillText(p.name, p.x, p.y + p.r * 0.42 + 17); }
  if (alive(1).some(q => q.n < q.max) && G.reserve > 0) for (const [x, y] of TENTS) { const k = 0.85 + 0.15 * Math.sin(t * 6); ctx.beginPath(); ctx.arc(x + 30, y - 46, 12 * k, 0, 7); fo(ctx, '#3fbf4a', 2.4); ctx.fillStyle = '#fff'; ctx.fillRect(x + 25, y - 48, 10, 4); ctx.fillRect(x + 28, y - 51, 4, 10); }
  ctx.font = '900 15px "Lilita One", sans-serif'; ctx.textAlign = 'center'; { const txt = 'Наш лагерь · резерв ' + G.reserve, tw = ctx.measureText(txt).width + 18; rr(ctx, CAMP.x - tw / 2, CAMP.y + CAMP.ry - 4, tw, 24, 12); ctx.fillStyle = 'rgba(40,24,14,.9)'; ctx.fill(); ctx.fillStyle = '#ffb0a6'; ctx.fillText(txt, CAMP.x, CAMP.y + CAMP.ry + 13); }
  for (const v of G.volleys) { const x = v.x + (v.tx - v.x) * v.t, y = v.y + (v.ty - v.y) * v.t - Math.sin(v.t * Math.PI) * 34; ctx.strokeStyle = OL; ctx.lineWidth = 2; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x + i * 5, y - 4); ctx.lineTo(x + i * 5 + (v.tx - v.x) * 0.04, y + 4); ctx.stroke(); } }
  for (const p of G.parts) { ctx.fillStyle = 'rgba(200,30,20,' + Math.min(1, p.t * 3) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 7); ctx.fill(); }
  for (const f of G.fx) { ctx.beginPath(); ctx.arc(f.x, f.y - 10, (f.big ? 32 : 12) * (1 - f.t), 0, 7); ctx.strokeStyle = f.rout ? 'rgba(43,26,16,' + f.t + ')' : 'rgba(255,230,120,' + Math.min(1, f.t * 3) + ')'; ctx.lineWidth = f.big ? 4 : 3; ctx.stroke(); }
  for (const w of G.warn) { const k = 0.85 + 0.15 * Math.sin(t * 12); ctx.save(); ctx.globalAlpha = Math.min(1, w.t); ctx.beginPath(); ctx.arc(w.x, w.y - 64, 14 * k, 0, 7); fo(ctx, '#ff4a3a', 2.8); ctx.fillStyle = '#fff'; ctx.font = '900 18px "Lilita One", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', w.x, w.y - 57); ctx.restore(); }
  if (G.tgt && G.sel) { const d = BOOST[G.tgt.s.boosts[G.tgt.idx].id]; ctx.save(); ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.ellipse(G.sel.x, G.sel.y, d.range, d.range * 0.6, 0, 0, 7); ctx.strokeStyle = 'rgba(255,220,90,.95)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  hud(); drawMini();
}

// ---------------------------------------------------------------- the interface
let railPainted = null, boostSel = null;
function paintRail() { G.rome.forEach((s, i) => { const g = $('rbc' + i).getContext('2d'); g.clearRect(0, 0, 64, 64); portrait(g, i, s.cls); }); }
function hud() {
  const caps = G.points.filter(p => p.owner === 1).length, foes = G.sq.filter(s => s.alive && s.side === 2).length;
  $('clock').textContent = clock(G.t); $('cFlags').textContent = '⚑ ' + caps + '/3'; $('cFoes').textContent = '⚔ ' + foes; $('cRes').textContent = '+ ' + G.reserve;
  SND.slow(!!G.sel); SND.level(G.sq.filter(s => s.alive && s.fighting).length / 3);
  const ph = $('phase'); ph.hidden = !G.sel && !G.tgt;
  ph.textContent = G.tgt ? '🎯 Куда «' + BOOST[G.tgt.s.boosts[G.tgt.idx].id].name + '»?' : G.sel ? '⏳ ' + G.sel.name + ' · ' + CLS[G.sel.cls].name.toLowerCase() + ' · куда идти?' : '';
  uiCards();
}
function uiCards() {
  if (railPainted !== G) { railPainted = G; paintRail(); boostSel = null; }
  G.rome.forEach((s, i) => { const b = $('rb' + i), f = Math.max(0, s.n) / s.max; b.className = 'rb' + (G.sel === s ? ' sel' : '') + (!s.alive ? ' dead' : ''); b.style.setProperty('--hp', Math.round(f * 100)); b.style.setProperty('--c', f > 0.5 ? '#7ee05a' : f > 0.25 ? '#ffcc33' : '#ff5a4a'); });
  const sel = G.sel && G.sel.alive ? G.sel : null, bar = $('boosts');
  $('bhint').hidden = !!sel;
  if (!sel) { if (boostSel !== null) { bar.hidden = true; bar.innerHTML = ''; boostSel = null; } return; }
  if (boostSel !== sel) {
    boostSel = sel; bar.hidden = false;
    bar.innerHTML = sel.boosts.length ? sel.boosts.map((b, i) => '<button class="bb" id="bb' + i + '" type="button"></button>').join('') : '<span class="nob">Нет приказов</span>';
    sel.boosts.forEach((b, i) => $('bb' + i).addEventListener('click', () => boostPress(i)));
  }
  sel.boosts.forEach((b, i) => {
    const d = BOOST[b.id], el = $('bb' + i), st = b.left <= 0 ? 'закончилась' : b.cd > 0 ? 'ещё ' + Math.ceil(b.cd) + ' с' : (b.left !== Infinity ? '×' + b.left : 'готово');
    const h = '<b>' + d.name + '</b><small>' + st + '</small>', cls = 'bb' + (G.tgt && G.tgt.idx === i ? ' tgt' : '');
    if (el._h !== h) { el.innerHTML = h; el._h = h; } if (el._c !== cls) { el.className = cls; el._c = cls; } el.disabled = b.cd > 0 || b.left <= 0;
  });
}
function boostPress(i) {
  const s = G.sel; if (!s || !s.alive || G.over) return; const b = s.boosts[i]; if (!b) return; const d = BOOST[b.id];
  if (d.kind === 'target') { if (b.cd > 0 || b.left <= 0) { useBoost(s, i); return; } G.tgt = G.tgt && G.tgt.idx === i ? null : { s, idx: i }; if (G.tgt) say('Коснитесь места для «' + d.name + '»'); }
  else { G.tgt = null; useBoost(s, i); }
  uiCards();
}
function drawMini() {
  const m = $('mini'), g = m.getContext('2d'), w = m.width, h = m.height; g.drawImage(BAKE, 0, 0, w, h);
  const k = w / WW; for (const s of G.sq) if (s.alive) { g.fillStyle = s.side === 1 ? '#ff4a3a' : '#3f7ae0'; g.fillRect(s.x * k - 2, s.y * k - 2, 4, 4); }
  const z = cam.z, x0 = cam.x - W / 2 / z, y0 = cam.y - VCY / z; g.strokeStyle = '#ffcc33'; g.lineWidth = 2; g.strokeRect(x0 * k, y0 * k, W / z * k, (H - BAR) / z * k);
}
let toastT = 0; function say(t) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2600); }

// ---------------------------------------------------------------- camera and input
const cam = { x: 450, y: 1180, z: 1 };
const ZMIN = W / WW, ZMAX = 1.7;
function clampCam() { cam.z = Math.max(ZMIN, Math.min(ZMAX, cam.z)); const hw = W / 2 / cam.z; cam.x = Math.max(hw, Math.min(WW - hw, cam.x)); const top = VCY / cam.z - 70 / cam.z, bot = (H - BAR - VCY) / cam.z; cam.y = Math.max(top, Math.min(WH - bot + 10, cam.y)); }
const toWorld = (sx, sy) => [(sx - W / 2) / cam.z + cam.x, (sy - VCY) / cam.z + cam.y];
const scr = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
function tapAt(wx, wy) {
  if (G.tgt) { const { s: ts, idx } = G.tgt; if (useBoost(ts, idx, false, wx, wy)) { G.tgt = null; G.sel = null; overlayOn = false; } uiCards(); return; }
  const mine = alive(1).map(s => [s, Math.hypot(s.x - wx, s.y - 12 - wy)]).filter(([, d]) => d < 40).sort((a, b) => a[1] - b[1])[0];
  if (mine) { select(mine[0]); uiCards(); return; }
  const sel = G.sel; if (!sel || !sel.alive) { say('Коснитесь своего отряда или генерала слева'); return; }
  const foe = alive(2).map(s => [s, Math.hypot(s.x - wx, s.y - 12 - wy)]).filter(([, d]) => d < 36).sort((a, b) => a[1] - b[1])[0];
  G.sel = null; G.tgt = null; overlayOn = false;
  if (foe) { attack(sel, foe[0]); SND.play('order'); } else cmd(sel, wx, wy);
  uiCards();
}
const ptrs = new Map(); let gest = null;
cv.addEventListener('pointerdown', e => { if (G.over || !started) return; const p = scr(e); ptrs.set(e.pointerId, { x: p[0], y: p[1], sx: p[0], sy: p[1] }); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  if (ptrs.size === 1) gest = { moved: false }; else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; gest = { moved: true, pinch: true, d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: cam.z, w0: toWorld((a.x + b.x) / 2, (a.y + b.y) / 2) }; } });
cv.addEventListener('pointermove', e => { const q = ptrs.get(e.pointerId); if (!q || !gest) return; const p = scr(e), dx = p[0] - q.x, dy = p[1] - q.y; q.x = p[0]; q.y = p[1];
  if (gest.pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()]; cam.z = gest.z0 * Math.hypot(a.x - b.x, a.y - b.y) / gest.d0; clampCam(); cam.x = gest.w0[0] - ((a.x + b.x) / 2 - W / 2) / cam.z; cam.y = gest.w0[1] - ((a.y + b.y) / 2 - VCY) / cam.z; clampCam(); }
  else if (ptrs.size === 1) { if (!gest.moved && Math.hypot(q.x - q.sx, q.y - q.sy) > 9) gest.moved = true; if (gest.moved) { cam.fx = undefined; cam.x -= dx / cam.z; cam.y -= dy / cam.z; clampCam(); } } });
const endPtr = e => { const q = ptrs.get(e.pointerId); if (!q) return; ptrs.delete(e.pointerId); if (gest && !gest.moved && !gest.pinch && ptrs.size === 0 && e.type === 'pointerup') { const [x, y] = toWorld(q.x, q.y); tapAt(x, y); } if (!ptrs.size) gest = null; };
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', e => { e.preventDefault(); const p = scr(e), w0 = toWorld(p[0], p[1]); cam.z *= Math.pow(1.0015, -e.deltaY); clampCam(); cam.x = w0[0] - (p[0] - W / 2) / cam.z; cam.y = w0[1] - (p[1] - VCY) / cam.z; clampCam(); }, { passive: false });
$('mini').addEventListener('pointerdown', e => { e.stopPropagation(); const r = $('mini').getBoundingClientRect(); cam.fx = undefined; cam.x = (e.clientX - r.left) / r.width * WW; cam.y = (e.clientY - r.top) / r.height * WH; clampCam(); });
function easeCam() { if (cam.fx === undefined) return; cam.x += (cam.fx - cam.x) * 0.15; cam.y += (cam.fy - cam.y) * 0.15; clampCam(); if (Math.hypot(cam.fx - cam.x, cam.fy - cam.y) < 3) cam.fx = undefined; }
for (let i = 0; i < 4; i++) $('rb' + i).addEventListener('click', () => { if (G.over || !started) return; const s = G.rome[i]; if (!s.alive) { say('Генерал ' + s.name + ' ранен'); return; } select(s); cam.fx = s.x; cam.fy = s.y - 80; uiCards(); });
$('fast').addEventListener('click', () => { GSPEED = GSPEED >= 3 ? 1 : GSPEED + 1; $('fast').innerHTML = '⏩<small>×' + GSPEED + '</small>'; $('fast').classList.toggle('on', GSPEED > 1); SND.play('select'); });
$('restart').addEventListener('click', () => restart()); $('ovB').addEventListener('click', () => restart());
$('helpOk').addEventListener('click', () => { $('help').hidden = true; started = true; SND.init(); });
$('mus').addEventListener('click', () => { SND.toggleMusic(); $('mus').classList.toggle('off', !SND.isMus()); });
$('snd').addEventListener('click', () => { SND.toggleSfx(); $('snd').classList.toggle('off', !SND.isSfx()); });
document.addEventListener('visibilitychange', () => SND.visible(!document.hidden));
function renderSlots() { $('slots').innerHTML = slots.map((c, i) => '<button type="button" data-i="' + i + '">' + GEN[i] + ' · ' + CLS[c].name + '<small>' + CLS[c].hint + '</small></button>').join(''); for (const b of $('slots').children) b.addEventListener('click', () => { const i = +b.dataset.i; slots[i] = ORDER[(ORDER.indexOf(slots[i]) + 1) % ORDER.length]; renderSlots(); newBattle(); }); }
function restart() { newBattle(); $('over').hidden = true; $('help').hidden = true; started = true; SND.init(); }

// ---------------------------------------------------------------- loop
newBattle(); renderSlots();
let last = performance.now();
function loop(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; step(dt); easeCam(); draw(now / 1000); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
window.__tw = { get G() { return G; }, step, cmd, attack, select, useBoost, findPath, TY, T, cellOf, pass, canStep, OB, BR, alive, setSlots: v => { slots = v; }, start: () => { started = true; }, cam, ENEMIES, POINTS, STARTS };
