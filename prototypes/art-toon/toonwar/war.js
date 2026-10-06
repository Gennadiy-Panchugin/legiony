// ---------------------------------------------------------------- board
const W = 540, H = 960, BAR = 68, DPR = Math.min(2, window.devicePixelRatio || 1), VCY = (H - BAR) / 2 + 30;
const $ = id => document.getElementById(id);
// ==== tutor-ui begin
// The tutorial coach shared by the battle and the pre-battle screen. Look and feel are those of the map tutorial of the main game:
// a dark bubble with a gold edge and the «Обучение · 1 из 5» line, the same pointing hand, a dimmed screen with a spotlight on the element it talks about.
// A step: { text, target: () => element | box, points: () => [{ x, y, r, world }], point: [x, y], catch, btn, last, real, done, skipIf, onEnter, onLeave }
//   catch: tapping the lit zone only moves on (nothing is activated); btn: «Понятно» and the rest of the screen is locked; done: moves on by itself when it returns true;
//   real: the lit element is really pressable (the last step); points: rings round map spots, the hand visits them one by one (hooks.focus pans the map to the next).
const Tutor = (() => {
  const CSS = `
  #tutor { position: absolute; inset: 0; z-index: 60; pointer-events: none; font-family: 'Alegreya Sans', 'Segoe UI', Roboto, sans-serif; }
  #tutor [hidden] { display: none !important; }
  #tutor .td-dim { position: absolute; inset: 0; background: rgba(10,6,2,.6); }
  #tutor .td-ring { position: absolute; border: 3px solid #d9a441; box-shadow: 0 0 14px #d9a441, 0 0 0 1600px rgba(10,6,2,.7); }
  #tutor .td-pt.cur { border-color: #fff3a0; box-shadow: 0 0 22px rgba(255,243,160,.95); }
  #tutor .td-pt { position: absolute; border: 3px dashed #ffd76a; border-radius: 50%; box-shadow: 0 0 14px rgba(255,215,106,.8); animation: tdpt .9s ease-in-out infinite alternate; }
  @keyframes tdpt { from { transform: scale(.94); } to { transform: scale(1.06); } }
  #tutor .td-block { position: absolute; inset: 0; pointer-events: auto; }
  #tutor .td-hand { position: absolute; width: 34px; height: 50px; pointer-events: none; filter: drop-shadow(0 3px 4px rgba(0,0,0,.5)); animation: tdup .8s ease-in-out infinite alternate; }
  #tutor .td-hand svg { width: 100%; height: 100%; display: block; } #tutor .td-hand.dn svg { transform: scaleY(-1); } #tutor .td-hand.dn { animation-name: tddn; }
  @keyframes tdup { from { transform: translateY(10px); } to { transform: translateY(0); } } @keyframes tddn { from { transform: translateY(0); } to { transform: translateY(-10px); } }
  #tutor .td-bub { position: absolute; left: 12px; right: 12px; top: 78px; padding: 12px 14px; border-radius: 12px; background: rgba(30,25,19,.96); border: 1px solid #d9a441; box-shadow: 0 10px 26px rgba(0,0,0,.5); display: flex; flex-direction: column; gap: 6px; pointer-events: auto; animation: tdpop .35s cubic-bezier(.2,1.3,.4,1); }
  @keyframes tdpop { from { opacity: 0; transform: translateY(16px) scale(.94); } }
  #tutor .td-eb { color: #a99c82; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
  #tutor .td-bub p { margin: 0; font-size: 15px; line-height: 1.35; color: #efe6d2; }
  #tutor .td-row { display: flex; justify-content: flex-end; gap: 8px; }
  #tutor .td-btn { font: 700 15px/1 'Alegreya Sans', 'Segoe UI', sans-serif; letter-spacing: .04em; text-transform: uppercase; color: #17140f; background: #d9a441; border: 1px solid #d9a441; border-radius: 10px; min-width: 150px; min-height: 48px; padding: 12px 22px; cursor: pointer; }
  #tutor .td-btn.ghost { background: transparent; color: #efe6d2; border-color: #3b3226; }
  @media (prefers-reduced-motion: reduce) { #tutor .td-hand, #tutor .td-pt { animation: none; } }`;
  const HAND = '<svg viewBox="0 0 24 36" aria-hidden="true"><path d="M8 2l4-1v16l5-2 4 1 4 2 1 11c-4 8-12 8-16 6L1 27l-2-7 5-1z" fill="#ffe2b0" stroke="#28190a" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  let el = null, board = null, T = null;
  const q = s => el.querySelector(s);
  function build() {
    if (el) return;
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    board = document.getElementById('board') || document.body;
    el = document.createElement('div'); el.id = 'tutor';
    el.innerHTML = '<div class="td-dim" hidden></div><div class="td-pts"></div><div class="td-ring" hidden></div><div class="td-block" hidden></div><div class="td-hand" hidden>' + HAND + '</div>'
      + '<div class="td-bub" hidden><span class="td-eb"></span><p></p><div class="td-row"><button type="button" class="td-btn" data-a="ok">Понятно</button></div></div>';
    board.appendChild(el);
    q('.td-bub').addEventListener('click', e => { if (e.target.dataset && e.target.dataset.a === 'ok') next(); });
    q('.td-block').addEventListener('click', e => {
      if (!T) return; const st = T.steps[T.i], bd = board.getBoundingClientRect(), k = bd.width / 540, x = (e.clientX - bd.left) / k, y = (e.clientY - bd.top) / k;
      if ((st.catch || st.real) && T.box) { const b = T.box; if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { if (st.real) { const tg = st.target && st.target(); if (tg && tg.click) tg.click(); } else next(); } }
      else if (st.points && T.list && T.list.length) {   // a touch on the lit spot: on to the next one, after the last one the tutorial is over
        const c = T.list[T.pi]; if (!c) return; const r = Math.max(34, c.r), dx = (x - c.x) / r, dy = (y - c.y) / (r * 0.7);
        if (dx * dx + dy * dy <= 1.5) { if (T.pi + 1 >= T.list.length) next(); else { T.pi++; if (T.hooks.focus && T.list[T.pi].world) T.hooks.focus(T.list[T.pi].world); } }
      }
    });
  }
  function boxOf(tg) {   // an element or a ready box -> a box in the 540x960 board's pixels
    if (!tg) return null; if (tg.getBoundingClientRect) { if (tg.hidden || tg.offsetParent === null) return null; const bd = board.getBoundingClientRect(), r = tg.getBoundingClientRect(), k = bd.width / 540; return { x: (r.left - bd.left) / k, y: (r.top - bd.top) / k, w: r.width / k, h: r.height / k, round: tg.id && tg.id.startsWith('rb') }; } return tg;
  }
  function place(hand, box, pad) {   // the hand comes from below and points up at a target in the upper half, otherwise from above and points down
    const below = box.y + box.h / 2 < 480; hand.className = 'td-hand' + (below ? '' : ' dn'); hand.style.left = (box.x + box.w / 2 - 14) + 'px'; hand.style.top = (below ? box.y + box.h + pad - 3 : box.y - pad - 50 + 3) + 'px'; hand.hidden = false;
  }
  function render() {
    const st = T.steps[T.i]; q('.td-eb').textContent = 'Обучение · ' + (T.i + 1) + ' из ' + T.steps.length; q('.td-bub p').innerHTML = st.text;
    q('[data-a=ok]').hidden = !st.btn; q('.td-bub').hidden = false; T.pi = 0; T.pt = performance.now();
    if (st.onEnter) st.onEnter(); if (T.hooks.pause) T.hooks.pause(!st.real);
  }
  function next() {
    if (!T) return; const old = T.steps[T.i]; if (old && old.onLeave) old.onLeave();
    T.i++; while (T.i < T.steps.length && T.steps[T.i].skipIf && T.steps[T.i].skipIf()) T.i++;
    if (T.i >= T.steps.length) return end(); render();
  }
  function end() {
    if (!T) return; const old = T.steps[T.i]; if (old && old.onLeave) old.onLeave(); const h = T.hooks; T = null;
    for (const s of ['.td-dim', '.td-ring', '.td-block', '.td-hand', '.td-bub']) q(s).hidden = true; q('.td-pts').innerHTML = '';
    if (h.pause) h.pause(false); if (h.end) h.end();
  }
  function frame() {
    if (!T) return; requestAnimationFrame(frame); const st = T.steps[T.i]; if (!st) return;
    if (st.done && st.done()) { next(); return; }
    const ring = q('.td-ring'), hand = q('.td-hand'), dim = q('.td-dim'), pts = q('.td-pts'), pad = 6;
    let box = boxOf(st.target && st.target()), list = st.points ? st.points() : null, spot = null; T.list = list;
    if (!box && st.point) box = { x: st.point[0] - 24, y: st.point[1] - 24, w: 48, h: 48 };
    T.box = box;
    if (st.target && box) { ring.style.left = (box.x - pad) + 'px'; ring.style.top = (box.y - pad) + 'px'; ring.style.width = (box.w + pad * 2) + 'px'; ring.style.height = (box.h + pad * 2) + 'px'; ring.style.borderRadius = box.round ? '50%' : '16px'; ring.hidden = false; dim.hidden = true; }
    else { ring.hidden = true; dim.hidden = false; dim.style.background = st.point ? 'rgba(10,6,2,.38)' : list ? 'rgba(10,6,2,.5)' : 'rgba(10,6,2,.6)'; }
    if (list && list.length) {   // map spots: a ring on each, the hand on one of them, moving on every 2.6 s while the map pans to it
      while (pts.children.length < list.length) { const d = document.createElement('div'); d.className = 'td-pt'; pts.appendChild(d); }
      [...pts.children].forEach((d, i) => { d.classList.toggle('cur', i === T.pi); const p = list[i]; if (!p || p.x < -40 || p.x > 580 || p.y < 60 || p.y > 900) { d.hidden = true; return; } d.hidden = false; const r = Math.max(30, p.r); d.style.left = (p.x - r) + 'px'; d.style.top = (p.y - r * 0.6) + 'px'; d.style.width = (r * 2) + 'px'; d.style.height = (r * 1.2) + 'px'; d.style.borderRadius = '50%'; });
      const c = list[T.pi]; if (c && c.x > -40 && c.x < 580 && c.y > 60 && c.y < 900) spot = { x: c.x - 6, y: c.y - 40, w: 12, h: 12 };
    }
    const hb = spot || (st.target || st.point ? box : null);
    if (hb) place(hand, hb, pad); else hand.hidden = true;
    q('.td-block').hidden = !(st.catch || st.real || st.btn); q('[data-a=ok]').hidden = !st.btn || !!(list && list.length);
    const bub = q('.td-bub'), lo = hb && hb.y < 330; bub.style.top = lo ? 'auto' : '78px'; bub.style.bottom = lo ? '150px' : 'auto';
  }
  function start(steps, hooks) {
    build(); steps = steps.filter(s => !(s.skipIf && s.skipIf())); if (!steps.length) return;
    T = { i: -1, steps, hooks: hooks || {}, box: null, pi: 0, pt: 0 }; next(); requestAnimationFrame(frame);
  }
  return { start, end, active: () => !!T, tick: frame };
})();
// ==== tutor-ui end
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
const FOREST = [[42, 1130, 46, 150], [862, 1150, 44, 150], [572, 1214, 48, 40], [298, 1248, 50, 40], [96, 540, 64, 40], [842, 566, 52, 42], [326, 864, 34, 22], [604, 864, 34, 22], [92, 240, 72, 96], [792, 220, 72, 104], [230, 150, 50, 40], [680, 140, 50, 40]];
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
const inForest = s => FOREST.some(([x, y, rx, ry]) => ((s.x - x) / (rx + 6)) ** 2 + ((s.y - y) / (ry + 6)) ** 2 < 1);
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
  G = { t: 0, over: false, sq: [], sel: null, fx: [], volleys: [], rome: [], kills: 0, lost: 0, alarm: {}, reserve: 10, parts: [], warn: [], traps: [], rains: [], fires: [], bolts: [], reveal: null, tgt: null, points: POINTS.map(p => ({ ...p, owner: 2, prog: 0 })) };
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
    else if (b.id === 'stun') { const e = G.sq.filter(q => q.alive && q.side === 2 && !q.hiddenA).sort((p, q) => Math.hypot(p.x - tx, p.y - ty) - Math.hypot(q.x - tx, q.y - ty))[0];
      if (!e || Math.hypot(e.x - tx, e.y - ty) > 80) { if (!quiet) say('Коснитесь вражеского отряда'); return false; }
      e.stunT = 3; e.path = []; e.atk = null; G.volleys.push({ x: s.x, y: s.y - 20, tx: e.x, ty: e.y - 14, t: 0, side: 1 }); G.warn.push({ x: e.x, y: e.y, t: 1 }); SND.play('crash', e.x); }
    else if (b.id === 'fire') { G.fires.push({ x: tx, y: ty, t: 0, dur: 6, r: 64 }); SND.play('volley', tx); }
    else if (b.id === 'pierce') { const L = Math.hypot(tx - s.x, ty - s.y) || 1, ux = (tx - s.x) / L, uy = (ty - s.y) / L, ex = s.x + ux * d.range, ey = s.y + uy * d.range;
      const hit = G.sq.filter(q => q.alive && q.side === 2 && !q.hiddenA).map(q => { const k = (q.x - s.x) * ux + (q.y - s.y) * uy; return { q, k, off: Math.abs((q.x - s.x) * uy - (q.y - s.y) * ux) }; }).filter(h => h.k > 0 && h.k < d.range && h.off < 34).sort((p, q) => p.k - q.k).slice(0, 4);
      for (const h of hit) { h.q.pend += 1.6; h.q.hurt = 0.4; bleed(h.q); raise(h.q.zone, h.q, 14); } G.bolts.push({ x0: s.x, y0: s.y - 24, x1: ex, y1: ey - 24, t: 0 }); SND.play('crash', s.x); }
    else { G.rains.push({ x: tx, y: ty, t: 0, dur: 3, r: 72 }); SND.play('volley', tx); }
  } else {
    if (s.carry && (b.id === 'wedge' || b.id === 'gallop')) { if (!quiet) say('С тараном так не побежишь'); return false; }
    if (b.id === 'dropram') { if (typeof ramDrop === 'function') ramDrop(s); if (!quiet) say('Таран брошен: его может поднять любой пеший отряд'); return true; }
    if (b.id === 'wedge') { s.wedgeT = d.dur; s.wedged = false; if (s.cls === 'eques') s.travel = 999; SND.play('wedge', s.x); }
    else if (b.id === 'pila') { const e = G.sq.filter(q => q.alive && q.side === 2 && !q.hiddenA && dist(q, s) < 150).sort((p, q) => dist(p, s) - dist(q, s))[0];
      if (!e) { if (!quiet) say('Пилумы летят на 150 шагов — подойдите ближе'); return false; }
      e.pend += s.n * 0.22; e.sk = 0; e.hurt = 0.4; for (let i = 0; i < 3; i++) G.volleys.push({ x: s.x + (i - 1) * 12, y: s.y - 20, tx: e.x, ty: e.y - 14, t: -i * 0.1, side: 1 }); SND.play('volley', s.x); }
    else if (b.id === 'scout') { G.reveal = { x: s.x, y: s.y, r: 260, t: d.dur }; s.sk = d.dur; SND.play('gallop', s.x); }
    else { s.sk = d.dur; if (b.id === 'gallop') s.travel = 999; if (b.id === 'hedge') s.path = []; SND.play({ turtle: 'shield', volley: 'volley', gallop: 'gallop', rush: 'rush', close: 'shield', hedge: 'shield' }[b.id] || 'order', s.x); }
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
const noCav = (a, t) => a.kind === CAV && !a.range && typeof STEEP !== 'undefined' && !!STEEP[cellOf(t.x, t.y)];
function attack(s, foe, quiet) { if (noCav(s, foe)) { s.atk = null; s.path = []; if (!quiet) say('Конница не заберётся на крутой бугор — туда ударят только пешие и стрелки'); return false; } s.work = null; s.atk = foe; s.atkT = 0; const p = findPath(s.x, s.y, foe.x, foe.y, s.side); s.path = p || []; if (!p && !quiet) say('К ним не подойти'); return !!p; }

// ---------------------------------------------------------------- the defenders: one alarm per post, patrols, leashes
function raise(zone, who, secs) { if (!zone) return; const was = (G.alarm[zone] || 0) > G.t; G.alarm[zone] = Math.max(G.alarm[zone] || 0, G.t + secs); if (!was) { G.warn.push({ x: who.x, y: who.y, t: 2.5 }); SND.play('alarm', who.x); } }
function think(s, dt) {
  s.thinkT -= dt; if (s.thinkT > 0 || s.ai === 'player') return; s.thinkT = 0.6;
  const foes = alive(1); if (!foes.length) return;
  let tgt = null, bd = 1e9; for (const f of foes) { if (inCamp(f) || noCav(s, f)) continue; const d = dist(s, f); if (d < bd) { bd = d; tgt = f; } }
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
  if (s.atk && noCav(s, s.atk)) { s.atk = null; s.path = []; }
  if (!s.atk) return; s.atkT -= dt; if (s.atkT > 0) return; s.atkT = 0.5;
  const t = s.atk, d = dist(s, t), rr0 = s.range ? s.range * (hAt(s.x, s.y) > hAt(t.x, t.y) + 0.08 ? 1.35 : 1) * 0.9 : MELEE - 8;
  if (d <= rr0) { s.path = []; return; }
  s.path = findPath(s.x, s.y, t.x, t.y, s.side) || [];
}
function step(raw) {
  if (G.over || !started || G.paused) return;
  const dt = raw * GSPEED * (G.sel && G.sel.alive || G.bstTgt ? SLOW : 1); G.t += dt; if (G.cryT > 0) G.cryT -= dt; if (G.wallT > 0) G.wallT -= dt;
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
    if (s.hurt > 0) s.hurt -= dt; if (s.wedgeT > 0) s.wedgeT -= dt; if (s.slowT > 0) s.slowT -= dt; if (s.stunT > 0) s.stunT -= dt; if (s.firstT > 0) s.firstT -= dt;
    s.stillT = s.moving ? 0 : (s.stillT || 0) + dt;
    if (s.side === 2) { think(s, dt); pursue(s, dt); } else if (s.atk) pursue(s, dt);
  }
  for (const s of live) {
    if (s.stunT > 0 || s.cls === 'triarii' && s.sk > 0) { s.moving = false; continue; }
    s.moving = s.path.length > 0; if (!s.moving) continue;
    const [tx, ty] = s.path[0], dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy);
    const sp = s.speed / MULc(cellOf(s.x, s.y)) * (s.sk > 0 && s.cls === 'hastati' ? 0.5 : 1) * (s.sk > 0 && s.cls === 'eques' ? 1.8 : 1) * (s.wedgeT > 0 ? 1.35 : 1) * (s.slowT > 0 ? 0.4 : 1) * (G.cryT > 0 && s.side === 1 ? 1.25 : 1) * (s.carry ? 0.65 : 1);
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
    const site = s.work.site; if (s.work.fetch && typeof ramFetch === 'function') { ramFetch(s); continue; }
    if (site.open || Math.hypot(s.x - site.stand[0], s.y - site.stand[1]) > 46) { s.work = null; continue; }
    site.prog += dt * (s.sk > 0 ? 3 : 1); s.clash -= dt;
    if (s.clash <= 0) { s.clash = 0.35; G.fx.push({ x: site === OB ? OB.x + (Math.random() - .5) * 90 : BR.x + (Math.random() - .5) * 30, y: site === OB ? OB.y : BR.y0 + 40 + (Math.random() - .5) * 60, t: 0.3 }); SND.play('tool', s.x); }
    if (site.prog >= site.need) { site.open = true; s.work = null; SND.play('crash', s.x); G.fx.push({ x: s.x, y: s.y - 30, t: 0.8, big: true }); say(site === OB ? 'Баррикада разобрана, перевал открыт' : 'Мост построен! Можно перейти реку у левого хребта'); if (G.sel) paintOverlay(G.sel); }
  }
  G.volleys = G.volleys.filter(v => (v.t += dt * 2.2) < 1);
  if (G.reveal && (G.reveal.t -= dt) <= 0) G.reveal = null;
  for (const s of live) if (CLS[s.cls].first) { if (!s.revealed && (G.reveal && Math.hypot(s.x - G.reveal.x, s.y - G.reveal.y) < G.reveal.r || G.fires.some(f => Math.hypot(s.x - f.x, s.y - f.y) < f.r + 30))) s.revealed = true; s.hiddenA = !s.revealed && inForest(s); }
  for (const a of live) {
    a.fighting = false; if (a.moving || a.work || a.stunT > 0 || CLS[a.cls].deploy && a.stillT < CLS[a.cls].deploy) continue;
    let t = null, bd = 1e9;
    for (const e of live) { if (e.side === a.side || e.hiddenA || noCav(a, e)) continue; const d = dist(a, e), R = a.range ? a.range * (hAt(a.x, a.y) > hAt(e.x, e.y) + 0.08 ? 1.35 : 1) : MELEE; if (d > R || d >= bd) continue; bd = d; t = e; }
    if (!t) continue;
    a.fighting = true; a.face = t.x < a.x - 1 ? -1 : t.x > a.x + 1 ? 1 : a.face;
    if (CLS[a.cls].first && !a.revealed) { a.revealed = true; a.hiddenA = false; a.firstT = 2; G.warn.push({ x: a.x, y: a.y, t: 2.5 }); say('Засада!'); }
    let v = a.n * a.k * MULT[a.kind][t.kind] * dt; const ranged = a.range > 0;
    if (a.sk > 0 && a.cls === 'velites') v *= 2.5;
    if (t.sk > 0 && t.cls === 'hastati') v *= ranged ? 0.35 : 0.85;
    if (!ranged && hAt(t.x, t.y) > hAt(a.x, a.y) + 0.08) v *= 0.8;
    if (hAt(t.x, t.y) < WATERH) v *= 1.25;
    if (a.kind === CAV && a.travel >= 90) { v += 0.8 * a.n * MULT[CAV][t.kind] * (a.sk > 0 ? 1.4 : 1) * (a.wedgeT > 0 ? 1.5 : 1); a.travel = 0; SND.play('charge', a.x); G.fx.push({ x: (a.x + t.x) / 2, y: (a.y + t.y) / 2, t: 0.5, big: true }); }
    if (!ranged && a.wedgeT > 0 && !a.wedged && a.cls !== 'eques') { a.wedged = true; v += 0.5 * a.n * MULT[a.kind][t.kind]; SND.play('charge', a.x); G.fx.push({ x: (a.x + t.x) / 2, y: (a.y + t.y) / 2, t: 0.5, big: true }); }
    const da = CLS[a.cls], dt2 = CLS[t.cls];
    if (da.weakNear && bd < MELEE) v *= da.weakNear;
    if (da.vsCav && t.kind === CAV) v *= da.vsCav * (a.sk > 0 ? 1.45 : 1);
    if (a.firstT > 0) v *= da.first || 1;
    v *= dt2.def || 1; if (t.cls === 'tiro' && t.sk > 0) v *= 0.75;
    if (t.cls === 'triarii' && t.sk > 0 && a.kind === CAV) { v *= 0.3; a.slowT = 2; a.travel = 0; }
    if (dt2.front) { const fx = t.atk ? t.atk.x - t.x : 0, fy = t.atk ? t.atk.y - t.y : 1, fl = Math.hypot(fx, fy) || 1, ax = a.x - t.x, ay = a.y - t.y, al = Math.hypot(ax, ay) || 1; v *= (fx * ax + fy * ay) / fl / al > 0.5 ? dt2.front : 1.3; }
    if (t.side === 1 && G.wallT > 0) v *= 0.7;
    if (t.carry) v *= 1.2;
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
  for (const f of G.fires) { f.t += dt; for (const e of live) if (e.side === 2 && Math.hypot(e.x - f.x, e.y - f.y) < f.r) { e.pend += 0.7 * dt; e.hurt = 0.25; raise(e.zone, e, 14); } } G.fires = G.fires.filter(f => f.t < f.dur);
  for (const b of G.bolts) b.t += dt * 3; G.bolts = G.bolts.filter(b => b.t < 1);
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
const EMBED = window.name === 'legwar';
if (EMBED) { addEventListener('message', e => { const m = e.data; if (e.source === parent && m && m.legWar === 'init' && Array.isArray(m.slots)) { slots = m.slots.slice(0, 4).map(c => CLS[c] ? c : 'tiro'); if (m.boosts) STOCK = Object.assign({ cry: 0, reinf: 0, wall: 0, merc: 0, pont: 0 }, m.boosts); TUT_WANT = !!m.tut; renderSlots(); newBattle(); tutAuto(); } }); setTimeout(() => parent.postMessage({ legWar: 'ready' }, '*'), 0); }
function report(win, surrendered) { parent.postMessage({ legWar: 'end', win, surrendered: !!surrendered, t: G.t, kills: G.kills, lost: G.lost, flags: G.points.filter(p => p.owner === 1).length }, '*'); }
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
  if (s.hiddenA) return;
  const n = Math.ceil(s.n), pts = []; for (let i = 0; i < n; i++) pts.push(fposT(n, i)); pts.sort((a, b) => a[1] - b[1]);
  ctx.save(); if (s.inTent) ctx.globalAlpha = 0.7; const shade = inForest(s); if (shade) { ctx.filter = 'brightness(0.5) saturate(0.7)'; ctx.globalAlpha *= 0.9; }
  if (G.sel === s) { ctx.beginPath(); ctx.ellipse(s.x, s.y + 4, 44, 20, 0, 0, 7); ctx.strokeStyle = OL; ctx.lineWidth = 7; ctx.stroke(); ctx.strokeStyle = '#ffcc33'; ctx.lineWidth = 4; ctx.stroke(); }
  if (s.sk > 0 || s.wedgeT > 0) { ctx.beginPath(); ctx.ellipse(s.x, s.y + 4, 40, 18, 0, 0, 7); ctx.strokeStyle = 'rgba(255,230,120,.9)'; ctx.lineWidth = 3; ctx.stroke(); }
  pts.forEach(([ox, oy], i) => { const bob = s.moving ? Math.abs(Math.sin(t * 12 + i * 1.7)) * 3 : s.fighting ? Math.sin(t * 18 + i) * 1.2 : 0; unit(ctx, s.x + ox, s.y + oy - bob, s.cls, s.side, 0.6, s.face); });
  if (s.side === 2) typeIcon(ctx, s.x - s.face * 34, s.y - 42, 9, TREE_KIND[s.cls] || 'INF', true);
  if (s.stunT > 0) { ctx.font = '900 20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('💫', s.x, s.y - 58 + Math.sin(t * 8) * 3); }
  const st = BAN[s.cls] || BAN.e_inf; ctx.save(); ctx.translate(s.x - s.face * 34, s.y + 12); ctx.scale(1.2, 1.2); cbanner(ctx, 0, 0, st, 1, Math.sin(t * 5 + s.id) * 1.6); ctx.restore();
  if (s.hurt > 0) { ctx.beginPath(); ctx.ellipse(s.x, s.y - 14, 40, 30, 0, 0, 7); ctx.strokeStyle = 'rgba(255,255,255,' + Math.min(0.8, s.hurt * 4) + ')'; ctx.lineWidth = 3; ctx.stroke(); }
  if (shade) { ctx.filter = 'none'; ctx.globalAlpha = 1; }
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
  for (const f of G.fires) { const k = 1 - f.t / f.dur; ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r, f.r * 0.55, 0, 0, 7); ctx.fillStyle = 'rgba(255,120,30,' + (0.25 * k + 0.1) + ')'; ctx.fill();
    for (let i = 0; i < 7; i++) { const a = i * 0.9 + f.t, x = f.x + Math.cos(a) * f.r * 0.55, y = f.y + Math.sin(a) * f.r * 0.3, h = 16 + 8 * Math.sin(t * 9 + i); ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.quadraticCurveTo(x - 7, y - h * 0.6, x, y - h); ctx.quadraticCurveTo(x + 7, y - h * 0.6, x + 6, y); ctx.closePath(); fo(ctx, '#ffb030', 1.6); } }
  for (const b of G.bolts) { ctx.strokeStyle = 'rgba(255,240,200,' + (1 - b.t) + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(b.x0, b.y0); ctx.lineTo(b.x0 + (b.x1 - b.x0) * Math.min(1, b.t * 2), b.y0 + (b.y1 - b.y0) * Math.min(1, b.t * 2)); ctx.stroke(); }
  if (G.reveal) { ctx.save(); ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.ellipse(G.reveal.x, G.reveal.y, G.reveal.r, G.reveal.r * 0.6, 0, 0, 7); ctx.strokeStyle = 'rgba(180,230,255,.8)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
  for (const rn of G.rains) { ctx.beginPath(); ctx.ellipse(rn.x, rn.y, rn.r, rn.r * 0.55, 0, 0, 7); ctx.fillStyle = 'rgba(226,56,44,.16)'; ctx.fill(); ctx.strokeStyle = 'rgba(226,56,44,.8)'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = OL; ctx.lineWidth = 2;
    for (let i = 0; i < 16; i++) { const a = i * 2.39996 + rn.t, rr0 = rn.r * Math.sqrt((i + 0.5) / 16), x = rn.x + Math.cos(a) * rr0, y = rn.y + Math.sin(a) * rr0 * 0.55, f = ((t * 3 + i * 0.37) % 1); ctx.beginPath(); ctx.moveTo(x - 2, y - 56 * (1 - f) - 10); ctx.lineTo(x, y - 56 * (1 - f)); ctx.stroke(); } }
  for (const tr of G.traps) { ctx.beginPath(); ctx.ellipse(tr.x, tr.y, 20, 9, 0, 0, 7); fo(ctx, '#4a2a14', 2.2); for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(tr.x + i * 7 - 3, tr.y + 2); ctx.lineTo(tr.x + i * 7, tr.y - 12); ctx.lineTo(tr.x + i * 7 + 3, tr.y + 2); ctx.closePath(); fo(ctx, '#e6ebf0', 1.6); } }
  const items = [{ y: OB.y, f: drawBarricade }];
  for (const s of G.sq) if (s.alive) items.push({ y: s.y, f: () => drawSquad(s, t) });
  for (const p of G.points) items.push({ y: p.y - 70, f: () => { flag(ctx, p.x + (p.final ? 0 : 36), p.y - (p.final ? 210 : 130), p.owner === 1 ? '#e2382c' : '#3f7ae0', 40); } });
  items.sort((a, b) => a.y - b.y); for (const it of items) it.f();
  if (G.sel && G.sel.alive) for (const e of G.sq) if (e.alive && e.side === 2 && !e.hiddenA) { const v = verdict(G.sel.cls, e.cls); if (v) mark(ctx, e.x, e.y - 76, v > 0, 11); }
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
function paintRail() { G.rome.forEach((s, i) => { const g = $('rbc' + i).getContext('2d'); g.clearRect(0, 0, 64, 64); portrait(g, i, s.cls); const b = $('rb' + i); let k = b.querySelector('.rk'); if (!k) { k = document.createElement('canvas'); k.className = 'rk'; k.width = k.height = 52; b.appendChild(k); } const kg = k.getContext('2d'); kg.clearRect(0, 0, 52, 52); typeIcon(kg, 26, 26, 17, TREE_KIND[s.cls] || 'INF'); }); }
function hud() {
  const caps = G.points.filter(p => p.owner === 1).length, foes = G.sq.filter(s => s.alive && s.side === 2).length;
  $('clock').textContent = clock(G.t); $('cFlags').textContent = '⚑ ' + caps + '/3'; $('cFoes').textContent = '⚔ ' + foes; $('cRes').textContent = '+ ' + G.reserve;
  SND.slow(!!G.sel); SND.level(G.sq.filter(s => s.alive && s.fighting).length / 3);
  const ph = $('phase'); ph.hidden = !G.sel && !G.tgt && !G.bstTgt;
  ph.textContent = G.bstTgt ? '🏗 Куда послать строителей? Коснитесь преграды' : G.tgt ? '🎯 Куда «' + BOOST[G.tgt.s.boosts[G.tgt.idx].id].name + '»?' : G.sel ? '⏳ ' + G.sel.name + ' · ' + CLS[G.sel.cls].name.toLowerCase() + ' · куда идти?' : '';
  uiCards();
}
// ---- the boosts the player bought (the stock comes from the main game); a map file may narrow BOOST_ALLOW
let STOCK = window.name.startsWith('legwar') ? null : { cry: 2, reinf: 1, wall: 2, merc: 1, pont: 2 }, BOOST_ALLOW = ['cry', 'reinf', 'wall', 'merc', 'pont'], trayKey = '', fxKey = '';
const SV = p => '<svg viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>';
const BST = {
  cry: { name: 'Клич', full: 'Боевой клич', ico: SV('<path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="currentColor"/>'), act: 'cryT' },
  reinf: { name: 'Резерв', full: 'Подкрепление', ico: SV('<path d="M12 3l7 8h-4v9H9v-9H5z" fill="currentColor"/><path d="M5 21h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>') },
  wall: { name: 'Щиты', full: 'Стена щитов', ico: SV('<path d="M12 2.5l8 3.2v5.6c0 5.2-3.4 8.6-8 10.2-4.6-1.6-8-5-8-10.2V5.7z" fill="currentColor"/>'), act: 'wallT' },
  merc: { name: 'Наёмники', full: 'Наёмники', ico: SV('<path d="M2.5 20.5L12 4l9.5 16.5z" fill="currentColor"/><path d="M12 20.5v-6l-2.6 6" fill="none" stroke="#17140f" stroke-width="1.6"/>') },
  pont: { name: 'Строители', full: 'Вольные строители', ico: SV('<path d="M3 15h18M5 15v5M19 15v5M7 15V9h10v6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>') }
};
const BB = document.querySelector('.bbar'), trayOn = () => !!(STOCK && BOOST_ALLOW.length) && !G.over;
function paintTray() {
  const on = trayOn(); $('tray').hidden = !on; BB.classList.toggle('tr', on);
  const act = id => { const k = BST[id].act; return k && G[k] > 0 ? Math.ceil(G[k]) : 0; };
  const key = on ? BOOST_ALLOW.map(id => id + ':' + (STOCK[id] || 0) + ':' + act(id)).join() : '';
  if (key !== trayKey) { trayKey = key; $('tray').innerHTML = on ? BOOST_ALLOW.map(id => { const a = act(id), n = STOCK[id] || 0; return '<button class="bl' + (a ? ' on' : n <= 0 ? ' zero' : '') + '" type="button" data-b="' + id + '">' + BST[id].ico + '<b>' + BST[id].name + '</b><em>' + (a ? a + ' с' : n) + '</em></button>'; }).join('') : ''; }
  let fk = ''; for (const id of ['cry', 'wall']) if (act(id)) fk += id + act(id) + ',';
  if (fk !== fxKey) { fxKey = fk; $('fxc').innerHTML = ['cry', 'wall'].filter(act).map(id => '<span class="fxc">' + BST[id].ico + act(id) + ' с</span>').join(''); $('glow').style.boxShadow = G.cryT > 0 ? 'inset 0 0 70px 6px rgba(242,193,74,.35)' : G.wallT > 0 ? 'inset 0 0 70px 6px rgba(90,140,255,.35)' : ''; }
}
function useBst(id) {
  if (G.over || !started || !STOCK) return; const B = BST[id], n = STOCK[id] || 0;
  if (id === 'merc') { say('Наёмники придут в одном из следующих обновлений боя'); return; }
  if (id === 'pont' && G.bstTgt) { G.bstTgt = null; say('Отменено'); paintTray(); return; }
  if (n <= 0) { say('«' + B.full + '»: запаса нет — купите в магазине или изучите в библиотеке'); return; }
  if (B.act && G[B.act] > 0) { say('«' + B.full + '» уже действует'); return; }
  if (id === 'cry') { G.cryT = 15; say('Боевой клич: войска быстрее на 25% 15 с'); SND.play('rush'); }
  else if (id === 'wall') { G.wallT = 15; say('Стена щитов: урон по вам меньше на 30% 15 с'); SND.play('shield'); }
  else if (id === 'reinf') { G.reserve += 12; say('Подкрепление: +12 в резерв'); SND.play('recruit'); }
  else if (id === 'pont') {
    if (G.bstTgt) { G.bstTgt = null; say('Отменено'); paintTray(); return; }
    const r = typeof bstPont === 'function' ? bstPont() : false;
    if (r === 'pick') { G.bstTgt = 'pont'; G.sel = null; G.tgt = null; overlayOn = false; say('Вольные строители: коснитесь преграды'); SND.play('select'); paintTray(); return; }
    if (!r) return;
  }
  spendBst(id);
}
function spendBst(id) {
  STOCK[id] = Math.max(0, (STOCK[id] || 0) - 1); for (const q of alive(1)) G.fx.push({ x: q.x, y: q.y, t: 0.6, big: true });
  if (EMBED) parent.postMessage({ legWar: 'boost', id }, '*');
  paintTray();
}
$('tray').addEventListener('click', e => { const b = e.target.closest('[data-b]'); if (b) useBst(b.dataset.b); });
function fitChip(el) { const sp = el.querySelector('span'), b = el.querySelector('b'); if (!sp || !b) return; let px = 17; b.style.fontSize = px + 'px'; while (sp.scrollWidth > sp.clientWidth + 1 && px > 10) { px--; b.style.fontSize = px + 'px'; } }
function uiCards() {
  if (railPainted !== G) { railPainted = G; paintRail(); boostSel = null; trayKey = fxKey = ''; }
  G.rome.forEach((s, i) => { const b = $('rb' + i), f = Math.max(0, s.n) / s.max; b.className = 'rb' + (G.sel === s ? ' sel' : '') + (!s.alive ? ' dead' : ''); b.style.setProperty('--hp', Math.round(f * 100)); b.style.setProperty('--c', f > 0.5 ? '#7ee05a' : f > 0.25 ? '#ffcc33' : '#ff5a4a'); });
  const sel = G.sel && G.sel.alive ? G.sel : null, bar = $('boosts');
  paintTray(); $('bhint').hidden = !!sel || trayOn();
  if (!sel) { if (boostSel !== null) { bar.hidden = true; bar.innerHTML = ''; boostSel = null; } return; }
  if (boostSel !== sel) {
    boostSel = sel; bar.hidden = false;
    bar.innerHTML = '<div class="av"><canvas id="avc" width="64" height="64"></canvas>' + sel.name + '<small>' + CLS[sel.cls].name + '</small></div>' + (sel.boosts.length ? sel.boosts.map((b, i) => '<button class="chipo" id="bb' + i + '" type="button"></button>').join('') : '<span class="nob" style="flex:1;padding:14px">Нет приказов</span>');
    const ix = G.rome.indexOf(sel); if (ix >= 0) { const g = $('avc').getContext('2d'); portrait(g, ix, sel.cls); }
    sel.boosts.forEach((b, i) => $('bb' + i).addEventListener('click', () => boostPress(i)));
  }
  let chg = false;
  sel.boosts.forEach((b, i) => {
    const d = BOOST[b.id], el = $('bb' + i), st = b.left <= 0 ? 'закончилась' : b.cd > 0 ? 'ещё ' + Math.ceil(b.cd) + ' с' : (b.left !== Infinity ? '×' + b.left : 'готово');
    const h = (d.kind === 'target' ? SV('<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/>') : SV('<path d="M12 3l8 17H4z" fill="currentColor"/>')) + '<span><b>' + d.name + '</b><small>' + st + '</small></span>', cls = 'chipo' + (G.tgt && G.tgt.idx === i ? ' tgt' : '');
    if (el._h !== h) { el.innerHTML = h; el._h = h; chg = true; } if (el._c !== cls) { el.className = cls; el._c = cls; } el.disabled = b.cd > 0 || b.left <= 0;
  });
  if (chg) sel.boosts.forEach((b, i) => fitChip($('bb' + i)));
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
  if (G.bstTgt) { const ok = typeof bstPick === 'function' && bstPick(wx, wy); G.bstTgt = null; if (ok) spendBst('pont'); else say('Отменено: коснитесь самой преграды'); paintTray(); return; }
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
$('restart').addEventListener('click', () => { if (!EMBED) return restart(); if (G.over || !started) return; G.paused = true; $('giveup').hidden = false; });
$('gyStay').addEventListener('click', () => { G.paused = false; $('giveup').hidden = true; });
$('gyGo').addEventListener('click', () => { G.paused = false; $('giveup').hidden = true; if (G.over) return; G.over = true; report(2, true); });
$('ovB').addEventListener('click', () => EMBED ? (G.winner && report(G.winner)) : restart());
if (EMBED) { $('restart').textContent = '⚑'; $('restart').title = 'Отступить'; $('restart').setAttribute('aria-label', 'Отступить'); $('ovB').textContent = 'Дальше'; }
let TUT_WANT = !window.name.startsWith('legwar') && /[?&]tut\b/.test(location.search);
let TUT_MAP = 'Это <b>поле боя</b>. Ваши отряды <b>красные</b>, враги <b>синие</b>. <b>Кольца</b> на карте — точки захвата, в лагере с палатками лечат раненых, а завалы и ворота открывают инженеры. Карту двигайте пальцем, масштаб — щипком.';
let TUT_GOAL = 'Цель боя: захватите <b>точки</b> (в каждой +3 в резерв), а затем главную. Раненых лечит лагерь, но резерв ограничен, так что берегите отряды.';
let TUT_GOAL_FIXED = false;
let TUT_POINTS = () => G.points.filter(p => p.x > -500).map(p => ({ x: p.x, y: p.y, r: p.r }));
const tutNote = i => { const ps = [...$('help').querySelectorAll(':scope > p')]; return ps[i] ? ps[i].innerHTML : ''; };   // the map's own notes from its rules pop-up
const tutGoal = () => { const p = $('help').querySelector(':scope > p'); return !TUT_GOAL_FIXED && p && /^Цель/.test(p.textContent) ? p.innerHTML : TUT_GOAL; };
function tutSteps() {
  const ordersSquad = () => G.rome.find(s => s.alive && s.boosts.length);
  return [
    { text: TUT_MAP, btn: true },
    { text: 'Коснитесь <b>портрета генерала</b> слева: время замедлится, отряд выделится. Значок в углу показывает класс войска.', target: () => $('rb0'), done: () => !!G.sel },
    { text: '<b>Тёмным</b> закрашено то, куда не пройти, <b>жёлтая линия</b> — куда дойдёте за 5 секунд. Коснитесь места на карте, и отряд пойдёт; коснитесь врага, и он атакует.', point: [300, 560], done: () => !G.sel && G.rome.some(q => q.alive && q.path.length) },
    { text: 'У выбранного отряда над бустами появляются его <b>особые приказы</b>: у каждого класса свои. Коснитесь этой полосы, чтобы продолжить.', target: () => $('boosts'), catch: true, skipIf: () => !ordersSquad(),
      onEnter: () => { const q = ordersSquad(); if (q && G.sel !== q) select(q); uiCards(); }, onLeave: () => { G.sel = null; G.tgt = null; overlayOn = false; uiCards(); } },
    { text: 'Внизу <b>бусты</b> из вашего запаса: они действуют на весь бой. Серая кнопка — запас кончился. Коснитесь лотка, чтобы продолжить.', target: () => $('tray'), catch: true, skipIf: () => !trayOn() },
    { text: tutNote(2), btn: true, skipIf: () => !tutNote(2) },
    { get text() { const n = TUT_POINTS().length; return tutGoal() + (n > 1 ? ' <b>Коснитесь подсвеченной точки</b>, чтобы перейти к следующей.' : n === 1 ? ' <b>Коснитесь подсвеченной точки</b>, чтобы закончить.' : ''); }, points: () => TUT_POINTS().map(p => ({ x: (p.x - cam.x) * cam.z + W / 2, y: (p.y - cam.y) * cam.z + VCY, r: p.r * cam.z, world: p })), btn: true, last: true,
      onEnter: () => { const p = TUT_POINTS()[0]; if (p) { cam.fx = p.x; cam.fy = p.y; } } }
  ];
}
function tutAuto() {   // the first time the tutorial takes the place of the rules pop-up
  if (!TUT_WANT) return; $('help').hidden = true; started = true; addEventListener('pointerdown', () => SND.init(), { once: true }); tutStart();
}
function tutStart() {
  if (!TUT_WANT) return; TUT_WANT = false;
  Tutor.start(tutSteps(), { pause: v => { G.paused = v || !$('giveup').hidden; }, focus: p => { cam.fx = p.x; cam.fy = p.y; }, end: () => { if (EMBED) parent.postMessage({ legWar: 'tut' }, '*'); } });
}
$('helpOk').addEventListener('click', () => { $('help').hidden = true; started = true; SND.init(); tutStart(); });
$('mus').addEventListener('click', () => { SND.toggleMusic(); $('mus').classList.toggle('off', !SND.isMus()); });
$('snd').addEventListener('click', () => { SND.toggleSfx(); $('snd').classList.toggle('off', !SND.isSfx()); });
// inside the game the music and sound switches live in its settings: hide the HUD buttons and follow the game's messages
if (EMBED) { $('mus').style.display = $('snd').style.display = 'none'; addEventListener('message', e => { const m = e.data; if (e.source !== parent || !m || m.legWar !== 'audio') return; if (SND.isMus() !== !!m.music) SND.toggleMusic(); if (SND.isSfx() !== !!m.sfx) SND.toggleSfx(); }); }
document.addEventListener('visibilitychange', () => SND.visible(!document.hidden));
function renderSlots() { $('slots').innerHTML = slots.map((c, i) => '<button type="button" data-i="' + i + '">' + GEN[i] + ' · ' + CLS[c].name + '<small>' + CLS[c].hint + '</small></button>').join(''); for (const b of $('slots').children) b.addEventListener('click', () => { const i = +b.dataset.i; if (EMBED) return; slots[i] = ORDER_ALL[(ORDER_ALL.indexOf(slots[i]) + 1) % ORDER_ALL.length]; renderSlots(); newBattle(); }); }
function restart() { newBattle(); $('over').hidden = true; $('help').hidden = true; started = true; SND.init(); }

// ---------------------------------------------------------------- loop
newBattle(); renderSlots();
let last = performance.now();
function loop(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; step(dt); easeCam(); draw(now / 1000); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
window.__tw = { get G() { return G; }, step, cmd, attack, select, useBoost, findPath, TY, T, cellOf, pass, canStep, OB, BR, alive, setSlots: v => { slots = v; }, start: () => { started = true; }, cam, ENEMIES, POINTS, STARTS };
