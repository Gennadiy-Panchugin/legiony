// Runs after city-runtime.js: the gladiator classes, their look, the wave logic and the arena HUD (only active when MAP.waves exists).
// Numbers are starting values; balance is not tested.
Object.assign(CLS, {
  mirmillo:  { name: 'Мирмиллоны', letter: '', kind: INF, n: 5, k: 0.095, speed: 28, def: 0.75 },
  thracian:  { name: 'Фракийцы', letter: '', kind: INF, n: 4, k: 0.085, speed: 46, def: 1.1 },
  retiarius: { name: 'Ретиарии', letter: '', kind: ARC, n: 4, k: 0.07, speed: 38, range: 70, def: 1.2 },
  secutor:   { name: 'Секуторы', letter: '', kind: INF, n: 5, k: 0.12, speed: 34, def: 0.9 },
  champion:  { name: 'Чемпионы арены', letter: '', kind: INF, n: 3, k: 0.2, speed: 30, def: 0.6 }
});
const GLAD = {
  mirmillo: { base: 'e_inf', sc: 1 }, thracian: { base: 'e_inf', sc: 0.95 }, retiarius: { base: 'e_inf', sc: 1 },
  secutor: { base: 'e_inf', sc: 1 }, champion: { base: 'e_inf', sc: 1.4 }
};
Object.assign(TREE_KIND, { mirmillo: 'INF', thracian: 'INF', retiarius: 'ARC', secutor: 'INF', champion: 'INF' });
Object.assign(ENEMY_NAME, { mirmillo: 'Мирмиллоны', thracian: 'Фракийцы', retiarius: 'Ретиарии', secutor: 'Секуторы', champion: 'Чемпионы арены' });
Object.assign(BAN, {
  mirmillo: { ...BAN.e_inf, col: '#c9a227' }, thracian: { ...BAN.e_inf, col: '#c0392b' }, retiarius: { ...BAN.e_inf, col: '#2f9a8a' },
  secutor: { ...BAN.e_inf, col: '#6a6f78' }, champion: { ...BAN.e_inf, col: '#8a2be2', trim: '#ffcc33' }
});
// the gladiators are the plain blue soldier plus their own gear
const unitBase = unit;
unit = function (g, x, y, cls, side, s, face) {
  const gl = GLAD[cls]; if (!gl) return unitBase(g, x, y, cls, side, s, face);
  s = s || 1; face = face || 1; const k = s * gl.sc;
  unitBase(g, x, y, gl.base, side, k, face);
  g.save(); g.translate(x, y); g.scale(k * face, k);
  if (cls === 'mirmillo') { g.beginPath(); g.moveTo(-3, -50); g.lineTo(3, -50); g.lineTo(6, -64); g.lineTo(-6, -58); g.closePath(); fo(g, '#e8c040', 2); rr(g, 7, -34, 13, 26, 3); fo(g, '#c9a227', 2.4); }
  else if (cls === 'thracian') { g.beginPath(); g.moveTo(-2, -50); g.quadraticCurveTo(-12, -62, -6, -70); g.quadraticCurveTo(0, -60, 4, -50); g.closePath(); fo(g, '#e2382c', 2); g.beginPath(); g.arc(11, -20, 7, 0, 7); fo(g, '#b9822e', 2.2); stick(g, 16, -8, 24, -34, '#cfd6dc', 2.6); }
  else if (cls === 'retiarius') { g.beginPath(); g.arc(12, -22, 10, 0, 7); g.fillStyle = 'rgba(255,255,255,.25)'; g.fill(); g.strokeStyle = '#f2f2f2'; g.lineWidth = 1.6; g.stroke(); g.beginPath(); g.moveTo(2, -22); g.lineTo(22, -22); g.moveTo(12, -32); g.lineTo(12, -12); g.moveTo(5, -29); g.lineTo(19, -15); g.moveTo(19, -29); g.lineTo(5, -15); g.stroke(); stick(g, 20, 0, 24, -52, '#a0703c', 2.8); }
  else if (cls === 'secutor') { g.beginPath(); g.arc(0, -38, 13.5, Math.PI, 0); g.closePath(); fo(g, '#555a62', 2.2); rr(g, 6, -34, 14, 26, 6); fo(g, '#8a8f98', 2.4); }
  else if (cls === 'champion') { for (const sx of [-12, 12]) { g.beginPath(); g.arc(sx, -22, 6.5, 0, 7); fo(g, '#ffcc33', 2.2); } g.beginPath(); g.moveTo(-3, -52); g.quadraticCurveTo(-14, -70, -2, -78); g.quadraticCurveTo(10, -68, 3, -52); g.closePath(); fo(g, '#e2382c', 2.2); }
  g.restore();
};

// ---------------------------------------------------------------- waves
function arenaGatePos(gt) { return MAP.waves.gates[gt]; }
function arenaSpawn(k) {
  const W = MAP.waves, w = W.list[k], per = {};
  w.sp.forEach(([cls, n, gt]) => {
    const [gx, gy] = arenaGatePos(gt), j = per[gt] = (per[gt] || 0) + 1, off = (j - 1) * 70 * (j % 2 ? 1 : -1);
    const s = addSq(2, cls, gx + (gt === 'n' ? off : 0), gy + (gt === 'n' ? 0 : off), 'hold', 'wv', null, n);
    s.wave = k + 1; s.gate = gt; s.home = [AR.cx, AR.cy]; G.warn.push({ x: gx, y: gy, t: 2.5 });
  });
  G.alarm.wv = G.t + 1e9; G.aw.i = k; G.aw.t = 0;
  say('Волна ' + (k + 1) + ' из ' + W.list.length + ' · ' + w.name); SND.play('alarm', AR.cx);
}
function arenaTick(dt, live) {
  const W = MAP.waves, A = G.aw || (G.aw = { i: -1, t: W.first, th: 0, call: false });
  if (!A.zoomed) { A.zoomed = true; cam.z = 0.66; cam.x = AR.cx; cam.y = 960; clampCam(); }   // the whole oval is wider than the phone at 1:1
  const foes = live.filter(q => q.side === 2), mine = live.filter(q => q.side === 1);
  A.th -= dt;
  if (A.th <= 0) {
    A.th = 0.5;
    for (const e of foes) if (e.wave) {
      let n = null, bd = 1e9; for (const f of mine) { if (inCamp(f)) continue; const d = dist(e, f); if (d < bd) { bd = d; n = f; } }
      if (n) { e.home = [n.x, n.y]; e.atk = n; }
      if (e.cls === 'retiarius' && n && bd < 90) n.slowT = Math.max(n.slowT || 0, 1.6);
    }
  }
  const next = A.i + 1;
  if (next < W.list.length) {
    if (A.call) { A.call = false; arenaSpawn(next); }
    else if (!foes.length) { A.t -= dt; if (A.t <= 0) arenaSpawn(next); }
  } else if (!foes.length && !G.over) G.points[2].owner = 1;
  if (!foes.length && A.i >= 0 && A.t === 0 && next < W.list.length) A.t = W.pause;
}
function waveChip() { const A = G.aw, n = MAP.waves.list.length; return '⚔ Волна ' + Math.max(1, A ? A.i + 1 : 1) + '/' + n; }
function arenaNextText() {
  const W = MAP.waves, A = G.aw, k = A ? A.i + 1 : 0; if (k >= W.list.length) return 'Последняя волна — добейте гладиаторов';
  const w = W.list[k], gs = [...new Set(w.sp.map(s => W.names[s[2]]))].join(' и ');
  const left = A ? Math.ceil(Math.max(0, A.t)) : W.first;
  return 'Волна ' + (k + 1) + ': ' + w.name + ' · выходы: ' + gs + ' · ' + (alive(2).length ? 'после этой волны' : 'через ' + left + ' с');
}
// markers over the gates: next wave's timers in the pause, the live strength of each gate's squads in a fight
const _drawCityExtras = drawCityExtras;
drawCityExtras = function (t) {
  _drawCityExtras(t);
  if (!MAP.waves || G.over) return;
  const W = MAP.waves, A = G.aw || { i: -1, t: W.first }, fighting = alive(2).some(q => q.wave), list = [];
  if (fighting) { for (const gt of Object.keys(W.gates)) { const sq = alive(2).filter(q => q.wave && q.gate === gt); if (sq.length) list.push([gt, sq[0].cls, Math.round(sq.reduce((a, q) => a + q.n, 0)), sq.reduce((a, q) => a + q.n, 0) / sq.reduce((a, q) => a + q.max, 0), false]); } }
  else if (A.i + 1 < W.list.length) { const w = W.list[A.i + 1], total = A.i < 0 ? W.first : W.pause; const seen = {}; for (const [cls, n, gt] of w.sp) { if (!seen[gt]) { seen[gt] = [gt, cls, 0, 1 - Math.max(0, A.t) / total, !!w.boss]; list.push(seen[gt]); } seen[gt][2] += n; } }
  for (const [gt, cls, n, pct, hot] of list) {
    const [gx, gy] = W.gates[gt], x = gt === 'w' ? gx - 10 : gt === 'e' ? gx + 10 : gx, y = gt === 'n' ? gy - 70 : gy - 76, R = 36, col = hot ? '#ff6a4a' : '#ffcc33';
    ctx.beginPath(); ctx.arc(x, y + 5, R + 6, 0, 7); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, R + 4, 0, 7); fo(ctx, '#3a2414', 3.4);
    ctx.beginPath(); ctx.arc(x, y, R - 1, 0, 7); ctx.lineWidth = 7; ctx.strokeStyle = '#2a190d'; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, R - 1, -Math.PI / 2, -Math.PI / 2 + 6.2832 * Math.max(0.02, pct)); ctx.lineWidth = 7; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.arc(x, y, R - 10, 0, 7); fo(ctx, '#46371f', 2.4);
    typeIcon(ctx, x, y, 15, TREE_KIND[cls] || 'INF', true);
    ctx.beginPath(); ctx.arc(x + 27, y - 27, 14, 0, 7); fo(ctx, col, 3); ctx.font = '400 20px "Lilita One", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#3a1e08'; ctx.fillText('!', x + 27, y - 20);
    rr(ctx, x - 28, y + 40, 56, 26, 13); fo(ctx, '#5a3a20', 2.6); ctx.fillStyle = '#ffe6a8'; ctx.font = '400 16px "Lilita One", sans-serif'; ctx.fillText('×' + n, x, y + 59);
  }
};
const _cityTick = cityTick;
cityTick = function (dt, live) { _cityTick(dt, live); if (MAP.waves) arenaTick(dt, live); };

// ---------------------------------------------------------------- HUD: wave pips, the call button, the herald line
if (MAP.waves) (function () {
  const board = $('board'), N = MAP.waves.list.length;
  $('cRes').hidden = true;   // no reserve in the arena
  const pips = document.createElement('div');
  pips.style.cssText = 'display:flex;gap:7px;padding:6px 12px;border-radius:17px;background:rgba(40,24,14,.92);border:2.5px solid #f2c14a';
  // (the pips are not shown: the top bar's chip counts the waves)
  const call = document.createElement('button');
  call.type = 'button'; call.className = 'cw'; call.title = 'Позвать следующую волну сразу'; call.setAttribute('aria-label', 'Позвать следующую волну');
  call.innerHTML = '<span class="cwi"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12M6 21h12M7 3c0 5 3 6.5 5 9-2 2.5-5 4-5 9M17 3c0 5-3 6.5-5 9 2 2.5 5 4 5 9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 18.5h5L12 15.5z" fill="currentColor"/></svg></span><em id="cwn"></em>';
  call.onclick = () => { if (G.aw && G.aw.i + 1 < N && !G.over) { G.aw.call = true; } else if (!G.aw) { G.aw = { i: -1, t: 0, th: 0, call: true }; } };
  board.appendChild(call);
  const hint = $('bhint');
  setInterval(() => {
    const A = G.aw, cur = A ? A.i + 1 : 0, boss = i => MAP.waves.list[i].boss;
    pips.innerHTML = MAP.waves.list.map((w, i) => { const done = i < cur - (alive(2).some(q => q.wave) ? 1 : 0), now = i === cur - 1 && alive(2).some(q => q.wave) || (!alive(2).some(q => q.wave) && i === cur);
      return '<span style="width:20px;height:20px;border-radius:50%;border:2.5px solid #2b1a10;display:flex;align-items:center;justify-content:center;font:400 12px \'Lilita One\',sans-serif;background:' + (done ? '#7ee05a' : now ? '#ffcc33' : '#4a3a2c') + ';color:' + (done ? '#1e3a10' : now ? '#3a1e08' : '#c9b08a') + '">' + (done ? '✓' : boss(i) ? '★' : i + 1) + '</span>'; }).join('');
    call.hidden = !!(G.over || !started) || (A && A.i + 1 >= N);
    { const W = MAP.waves, fighting = alive(2).some(q => q.wave); let pct = 100, txt = '⚔'; if (!fighting) { const total = A && A.i >= 0 ? W.pause : W.first, left = A ? Math.max(0, A.t) : W.first; pct = 100 * (1 - left / total); txt = String(Math.ceil(left)); } call.style.setProperty('--p', pct.toFixed(1)); $('cwn').textContent = txt; }
    if (!G.sel) hint.textContent = arenaNextText();
  }, 200);
})();

// ---------------------------------------------------------------- weather, time of day and the live front row of spectators
const ARENA_WX = (window.name.split(':')[3] || new URLSearchParams(location.search).get('wx') || 'clear').toLowerCase();
const ARENA_TOD = (window.name.split(':')[4] || new URLSearchParams(location.search).get('tod') || 'day').toLowerCase();
const WX_NAME = { clear: 'ясно', heat: 'жара', rain: 'дождь', fog: 'туман' }, TOD_NAME = { dawn: 'рассвет', day: 'день', dusk: 'вечер', night: 'ночь' };
const WX_TEXT = { heat: 'жара: отряды медленнее на 8%', rain: 'дождь: стрелки бьют на 25% ближе', fog: 'туман: врагов видно только вблизи' };
const TOD_TEXT = { night: 'ночь: врагов видно только рядом с вашими отрядами' };
function arenaSky(t) {
  const W0 = W, H0 = H, z = cam.z;
  ctx.save();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const tint = { dawn: 'rgba(255,150,130,.20)', dusk: 'rgba(255,110,40,.24)', night: 'rgba(12,20,62,.58)' }[ARENA_TOD];
  if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, W0, H0); }
  if (ARENA_TOD === 'dawn' || ARENA_TOD === 'dusk') { const g = ctx.createLinearGradient(0, 0, 0, 220); g.addColorStop(0, ARENA_TOD === 'dawn' ? 'rgba(255,200,150,.35)' : 'rgba(255,90,30,.32)'); g.addColorStop(1, 'rgba(255,200,150,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W0, 220); }
  if (ARENA_WX === 'heat') { ctx.fillStyle = 'rgba(255,170,40,.15)'; ctx.fillRect(0, 0, W0, H0); ctx.strokeStyle = 'rgba(255,248,220,.35)'; ctx.lineWidth = 2; for (let k = 0; k < 7; k++) { const y = 140 + k * 90; ctx.beginPath(); for (let x = 0; x <= W0; x += 12) ctx.lineTo(x, y + Math.sin(x * 0.05 + t * 2 + k) * 3); ctx.stroke(); } }
  if (ARENA_WX === 'rain') { ctx.fillStyle = 'rgba(40,60,90,.2)'; ctx.fillRect(0, 0, W0, H0); }
  if (ARENA_TOD === 'night') {   // light of the gate torches and of our squads on top of the dark
    ctx.setTransform(DPR * z, 0, 0, DPR * z, DPR * (W0 / 2 - cam.x * z), DPR * (VCY - cam.y * z));
    ctx.globalCompositeOperation = 'lighter';
    const lamp = (x, y, r, a) => { const lg = ctx.createRadialGradient(x, y, 6, x, y, r); lg.addColorStop(0, 'rgba(255,190,90,' + a + ')'); lg.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = lg; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
    for (const [gx, gy] of [[AR.cx, AR.cy - AR.ry + 30], [AR.cx, AR.cy + AR.ry - 30], [AR.cx - AR.rx + 30, AR.cy], [AR.cx + AR.rx - 30, AR.cy]]) lamp(gx, gy, 230 + Math.sin(t * 9 + gx) * 8, .55);
    for (const o of ARENA_OBST) if (o[0] === 'cage') { lamp(o[1], o[2] - 20, 170 + Math.sin(t * 7 + o[1]) * 6, .5); }   // light hangs over the cages
    ctx.globalCompositeOperation = 'source-over';
    for (const [gx, gy] of [[AR.cx - 150, AR.cy - AR.ry + 6], [AR.cx + 150, AR.cy - AR.ry + 6], [AR.cx - 150, AR.cy + AR.ry - 6], [AR.cx + 150, AR.cy + AR.ry - 6]]) {   // torches
      ctx.beginPath(); ctx.moveTo(gx, gy + 30); ctx.lineTo(gx, gy); ctx.lineWidth = 8; ctx.strokeStyle = OL; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#8a5a30'; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(gx, gy - 8, 9 + Math.sin(t * 14 + gx) * 1.5, 14, 0, 0, 7); fo(ctx, '#ffb43a', 2.4); ctx.beginPath(); ctx.ellipse(gx, gy - 6, 4, 8, 0, 0, 7); ctx.fillStyle = '#ffe9a0'; ctx.fill();
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  if (ARENA_WX === 'rain') { ctx.strokeStyle = 'rgba(220,235,255,.7)'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i < 130; i++) { const x = (i * 53.7) % W0, y = ((i * 91.3 + t * 560) % (H0 + 60)) - 30; ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 17); } ctx.stroke(); }
  if (ARENA_WX === 'fog') { ctx.fillStyle = 'rgba(230,236,240,.20)'; ctx.fillRect(0, 0, W0, H0); for (let i = 0; i < 12; i++) { const x = ((i * 137 + t * (8 + i % 4 * 3)) % (W0 + 240)) - 120, y = 90 + (i * 83) % (H0 - 160); ctx.beginPath(); ctx.ellipse(x, y, 110, 34, 0, 0, 7); ctx.fillStyle = 'rgba(240,244,248,.34)'; ctx.fill(); } }
  ctx.restore();
}
const _drawSky = draw;
draw = function (t) { _drawSky(t); if (MAP.waves) arenaSky(t); };
// the front row of the crowd: cheers louder after kills and when a wave comes out
const _drawFront = drawCityExtras;
drawCityExtras = function (t) {
  if (MAP.waves) {
    const ch = Math.min(1, G.cheer || 0); arenaCrowdLive(ctx, t, ch);
    if (ARENA_BOXV === 'A' || ARENA_BOXV === 'D') { ctx.save(); ctx.translate(ARENA_BOX.x, ARENA_BOX.y); ctx.scale(ARENA_BOX.k, ARENA_BOX.k); (ARENA_BOXV === 'D' ? boxDPeople : boxAPeople)(ctx, 0, 0, t, ch); ctx.restore(); }   // the people in the box
    if (ch > 0.55 && ARENA_BOXV !== 'D') {   // the emperor's thumb (not on the balcony: its sides are under the minimap and the portraits)
 const side = ARENA_BOXV === 'D', bx = side ? ARENA_BOX.x + ARENA_BOX.w / 2 + 44 : ARENA_BOX.x, by = (side ? ARENA_BOX.y + 8 : ARENA_BOX.y - ARENA_BOX.h / 2 - 66) - Math.sin(t * 6) * 3;   // beside the balcony: above it is off the map ctx.beginPath(); ctx.arc(bx, by, 24, 0, 7); fo(ctx, '#ffe6a8', 3); ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#000'; ctx.fillText('👍', bx, by + 9);
    }
  }
  _drawFront(t);
};
const _arenaTick = arenaTick;
arenaTick = function (dt, live) {
  _arenaTick(dt, live);
  const A = G.aw; if (!A) return;
  if (!A.wxInit) { A.wxInit = true; A.k0 = G.kills; G.cheer = 0.2; const tx = [TOD_TEXT[ARENA_TOD], WX_TEXT[ARENA_WX]].filter(Boolean).join(' · '); if (tx) setTimeout(() => say(tx[0].toUpperCase() + tx.slice(1)), 600); }
  for (const q of live) if (!q.wxDone) { q.wxDone = true; if (ARENA_WX === 'rain' && q.range) q.range *= 0.75; if (ARENA_WX === 'heat') q.speed *= 0.92; if (q.wave && A.i + 1 > (A.cheerWave || 0)) { A.cheerWave = A.i + 1; G.cheer = Math.min(1.2, (G.cheer || 0) + 0.5); } }
  if (G.kills > A.k0) { G.cheer = Math.min(1.2, (G.cheer || 0) + 0.2 * (G.kills - A.k0)); A.k0 = G.kills; }
  G.cheer = Math.max(0, (G.cheer || 0) - dt * 0.12);
  const R = ARENA_WX === 'fog' ? (ARENA_TOD === 'night' ? 240 : 300) : ARENA_TOD === 'night' ? 380 : 0;
  if (R) { const mine = live.filter(q => q.side === 1); for (const e of live) if (e.side === 2 && e.wave) e.hiddenA = !mine.some(f => dist(e, f) < R); }
};
if (MAP.waves) (function () {   // the header line: place · time of day · weather
  const sp = document.querySelector('.ttl span'); if (sp) sp.firstChild.textContent = MAP.sub + ' · ' + TOD_NAME[ARENA_TOD] + (ARENA_WX !== 'clear' ? ' · ' + WX_NAME[ARENA_WX] : '') + ' · ';
})();
