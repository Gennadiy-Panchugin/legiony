// Runs after the battle engine in citywar.html: the work sites' drawing, reinforcements, the second act, the gladiators,
// and the page's title and briefing for the chosen city.
CLS.gladiators = { name: 'Гладиаторы', letter: 'Г', kind: INF, n: 5, k: 0.16, speed: 34, def: 0.8, hint: 'пятый отряд из школы' };
BOOST.fury = { name: 'Ярость толпы', text: 'урон ×2 на 6 с', kind: 'self', dur: 6, cd: 999, uses: 1 };
BOOSTS.gladiators = ['fury'];
BAN.gladiators = { col: '#8a8f98', trim: '#ffcc33', emb: 'none', shape: 'square' };
TREE_KIND.gladiators = 'INF';

function siteBar(s) { if (s.open || !(s.prog > 0)) return; rr(ctx, s.x - 40, s.y - 96, 80, 9, 4.5); ctx.fillStyle = OL; ctx.fill(); rr(ctx, s.x - 38, s.y - 94, 76 * s.prog / s.need, 5, 2.5); ctx.fillStyle = '#ffcc33'; ctx.fill(); }
// the badges over the places where work is possible: crossed hammer and pickaxe for the engineers, a little ram (a log with an iron head) for a squad with the ram
function toolsIcon(x, y, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#3a1e08'; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(7, -7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(8, 8); ctx.lineTo(-7, -7); ctx.stroke();
  ctx.fillStyle = '#fff3dc'; ctx.strokeStyle = '#3a1e08'; ctx.lineWidth = 1.8;
  ctx.save(); ctx.translate(7, -7); ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.rect(-5, -3.5, 10, 7); ctx.fill(); ctx.stroke(); ctx.restore();   // the hammer head
  ctx.save(); ctx.translate(-7, -7); ctx.rotate(-Math.PI / 4); ctx.beginPath(); ctx.moveTo(-7, 2); ctx.quadraticCurveTo(0, -7, 7, 2); ctx.lineTo(4, 2); ctx.quadraticCurveTo(0, -3, -4, 2); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();   // the pickaxe head
  ctx.restore();
}
function ramIcon(x, y, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-9, -4); ctx.lineTo(7, -4); ctx.lineTo(7, 4); ctx.lineTo(-9, 4); ctx.closePath(); ctx.fillStyle = '#e0a868'; ctx.fill(); ctx.strokeStyle = '#2b1a10'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-9, 0, 2.6, 4, 0, 0, 7); ctx.fillStyle = '#c8955a'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(7, -6); ctx.lineTo(13, -6); ctx.lineTo(13, 6); ctx.lineTo(7, 6); ctx.closePath(); ctx.fillStyle = '#c8ccd2'; ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#6a4220'; ctx.lineWidth = 1.6; for (const bx of [-4, 1]) { ctx.beginPath(); ctx.moveTo(bx, -4); ctx.lineTo(bx, 4); ctx.stroke(); }
  ctx.restore();
}
function pickBadge(s) {
  const gray = s.ram && !G.ram, ram = s.gate && G.ramObj, x0 = ram ? s.x - 19 : s.x;
  ctx.beginPath(); ctx.arc(x0, s.y - 50, 17, 0, 7); fo(ctx, gray ? '#9a9a9a' : '#f09a24', 2.6); toolsIcon(x0, s.y - 50, 0.95);
  if (ram) { ctx.beginPath(); ctx.arc(s.x + 19, s.y - 50, 17, 0, 7); fo(ctx, '#b07a40', 2.6); ramIcon(s.x + 19, s.y - 50, 0.95); }
}
function openArch(x, y, sc) { ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.beginPath(); ctx.moveTo(-36, 2); ctx.lineTo(-36, -40); ctx.arc(0, -40, 36, Math.PI, 0); ctx.lineTo(36, 2); ctx.closePath(); fo(ctx, '#1a0e06', 3); ctx.restore(); }
function drawSite(s) {
  if (s.kind === 'rubble') { if (s.open) rubble(ctx, s.x, s.y, 2); else { rubble(ctx, s.x, s.y, 0); pickBadge(s); } }
  else if (s.kind === 'gate') { if (s.open) openArch(s.x, s.y + 12, s.sc || 0.7); else pickBadge(s); }
  else if (s.kind === 'arch') { if (s.open) { ctx.save(); ctx.translate(s.x, s.y + 8); ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-20, -46); ctx.arc(0, -46, 20, Math.PI, 0); ctx.lineTo(20, 0); ctx.closePath(); fo(ctx, '#1a0e06', 2.4); ctx.restore(); } else pickBadge(s); }
  else if (s.kind === 'door') { if (!s.open) { innerGate(ctx, s.x, s.y + 16); pickBadge(s); } else { for (let k = -1; k <= 1; k += 2) { rr(ctx, s.x + k * 40 - 6, s.y - 4, 12, 30, 3); fo(ctx, '#7a4a26', 2); } } }
  else if (s.kind === 'bridge') { if (!s.open) { ctx.save(); ctx.translate(0, s.y - 944); bridgeSite(ctx, s.x, s.prog / s.need); ctx.restore(); } else { const [mx, my, mw, mh] = s.mask.rect; for (let yy = my + mh - 8; yy > my - 4; yy -= 9) { rr(ctx, mx - 3, yy, mw + 6, 8, 2); fo(ctx, '#c48a4a', 2); } ctx.strokeStyle = OL; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(mx - 6, my - 4); ctx.lineTo(mx - 6, my + mh); ctx.moveTo(mx + mw + 6, my - 4); ctx.lineTo(mx + mw + 6, my + mh); ctx.stroke(); ctx.strokeStyle = '#a0703c'; ctx.lineWidth = 2.6; ctx.stroke(); } }
  else if (s.kind === 'raft') { raft(ctx, s.x, s.open ? s.y : s.y + 70); if (!s.open) pickBadge(s); }
  else if (s.kind === 'yard') { if (!s.open) pickBadge(s); else { ctx.font = '900 14px "Lilita One", sans-serif'; const tx = G.ramObj && !G.ramObj.carrier ? 'таран ждёт пехоту' : 'таран собран', tw = ctx.measureText(tx).width + 16; rr(ctx, s.x - tw / 2, s.y - 120, tw, 22, 11); ctx.fillStyle = 'rgba(40,24,14,.9)'; ctx.fill(); ctx.fillStyle = '#ffcc66'; ctx.textAlign = 'center'; ctx.fillText(tx, s.x, s.y - 104); } }
  siteBar(s);
}
function drawCityExtras(t) {
  drawRam(t);
  for (const tr of trapsE()) {
    const x = tr.x, y = tr.y, o = tr.fired > 0;
    ctx.beginPath(); ctx.ellipse(x, y + 2, tr.r * 0.78, tr.r * 0.4, 0, 0, 7); ctx.fillStyle = o ? '#2a1a10' : 'rgba(110,80,40,.55)'; ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = o ? 3 : 1.6; ctx.stroke();
    for (const dx of (o ? [-12, -4, 4, 12] : [-8, 0, 8])) { ctx.beginPath(); ctx.moveTo(x + dx - 2, y + 3); ctx.lineTo(x + dx, y - (o ? 15 : 7)); ctx.lineTo(x + dx + 2, y + 3); ctx.closePath(); ctx.fillStyle = o ? '#d9c9a0' : 'rgba(150,110,60,.8)'; ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1.4; ctx.stroke(); }
  }
  // steep mounds: a ring of rocks at the foot; with horsemen selected they are marked as closed
  for (const e of (MAP.nav.steep || [])) {
    const [mx, my, rx, ry] = e.ell, n = Math.round(rx / 5);
    for (let i = 0; i < n; i++) { const a = Math.PI * (0.05 + 0.9 * i / (n - 1)), px = mx + Math.cos(a) * (rx + 3), py = my + 6 + Math.sin(a) * (ry + 7), s = 4.5 + (i * 7 % 3);
      ctx.beginPath(); ctx.ellipse(px, py, s, s * 0.7, 0, 0, 7); ctx.fillStyle = i % 2 ? '#a9a39a' : '#8f8a82'; ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 2; ctx.stroke(); }
    if (G.sel && G.sel.alive && G.sel.kind === CAV) { ctx.font = '900 10px "Lilita One", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = OL; ctx.fillStyle = '#ff7a66'; ctx.strokeText('конным нельзя', mx, my - ry * 0.4); ctx.fillText('конным нельзя', mx, my - ry * 0.4); }
  }
  for (const p of G.points) if (p.owner === 1 && p.tents) for (const [x, y] of p.tents) tent(ctx, x, y);
  for (const b of G.bonus) if (!b.done) { capRing(ctx, b.x, b.y, b.r * 0.75, b.prog / b.need); ctx.font = '900 14px "Lilita One", sans-serif'; const tw = ctx.measureText(b.name).width + 18; rr(ctx, b.x - tw / 2, b.y + b.r * 0.42, tw, 22, 11); ctx.fillStyle = 'rgba(40,24,14,.9)'; ctx.fill(); ctx.fillStyle = '#ffcc33'; ctx.textAlign = 'center'; ctx.fillText(b.name + ' · +1 отряд', b.x, b.y + b.r * 0.42 + 16); }
  if (MAP.reinf) { const left = MAP.reinf.max - G.reinfN, cut = G.act2; const tx = cut ? 'подкрепления отрезаны' : 'подкрепления ' + G.reinfN + '/' + MAP.reinf.max + (left ? ' · через ' + Math.ceil(MAP.reinf.every - G.reinfT) + ' с' : ''); ctx.font = '900 14px "Lilita One", sans-serif'; const tw = ctx.measureText(tx).width + 18; rr(ctx, MAP.reinf.x - tw / 2, MAP.reinf.y - 40, tw, 22, 11); ctx.fillStyle = 'rgba(40,24,14,.9)'; ctx.fill(); ctx.fillStyle = cut ? '#8a9aaa' : '#9ec1ff'; ctx.textAlign = 'center'; ctx.fillText(tx, MAP.reinf.x, MAP.reinf.y - 24); }
}
// the per-frame rules every city map may use
// enemy traps (MAP.traps = [[x, y, r]]): pits with stakes that bite the first squad to step on them
const trapsE = () => G.eTraps || (G.eTraps = (MAP.traps || []).map(([x, y, r]) => ({ x, y, r: r || 22, fired: 0 })));
function cityTick(dt, live) {
  ramTick(dt, live);
  for (const q of live) if (q.side === 2 && !q.wave && q.path.length === 1 && Math.hypot(q.path[0][0] - q.x, q.path[0][1] - q.y) < 50) q.path = [];   // a crowd round the last waypoint never fits on it: close enough is arrived
  for (const tr of trapsE()) {
    if (tr.fired > 0) { tr.fired += dt; continue; }
    const v = live.find(q => q.side === 1 && Math.hypot(q.x - tr.x, q.y - tr.y) < tr.r);
    if (v) { tr.fired = 0.001; v.pend += 1.1; v.hurt = 0.4; v.stunT = 0.9; v.path = []; G.warn.push({ x: tr.x, y: tr.y, t: 1.5 }); say('Ловушка! Волчья яма'); SND.play('crash', tr.x); }
  }
  for (const b of G.bonus) if (!b.done) {
    const mine = live.some(q => q.side === 1 && !q.moving && Math.hypot(q.x - b.x, q.y - b.y) < b.r), hostile = live.some(e => e.side === 2 && Math.hypot(e.x - b.x, e.y - b.y) < b.r + 40);
    if (mine && !hostile) { b.prog += dt; if (b.prog >= b.need) { b.done = true; const s = addSq(1, b.reward, b.x, b.y + 50, 'player'); s.name = 'Гладиаторы'; SND.play('capture'); G.fx.push({ x: b.x, y: b.y, t: 0.9, big: true }); say(b.name + ' взята: гладиаторы встают в ваш строй!'); } }
    else b.prog = Math.max(0, b.prog - dt * 0.5);
  }
  if (MAP.acts && !G.act2 && G.points[0].owner === 1 && G.points[1].owner === 1) {
    G.act2 = true; say('АКТ 2 · ЦИТАДЕЛЬ — подкрепления отрезаны, у ворот палатки'); SND.play('capture');
    for (const e of live) if (e.side === 2 && e.zone === 'kp') { G.alarm.kp = G.t + 40; }
  }
  const R = MAP.reinf;
  if (R && !G.act2 && G.reinfN < R.max) { G.reinfT += dt; if (G.reinfT >= R.every) { G.reinfT = 0; const cls = R.cls[G.reinfN % R.cls.length]; const s = addSq(2, cls, R.x, R.y, 'hold', 'rf'); const hs = R.homes || [R.home], hh = hs[G.reinfN % hs.length], hm = nearestWalkable(hh[0], hh[1], 2, 90) || hh; s.home = hm.slice(); s.path = findPath(s.x, s.y, hm[0], hm[1], 2 + (s.kind === CAV ? 10 : 0)) || []; G.reinfN++; G.warn.push({ x: R.x, y: R.y, t: 2.5 }); say('К врагу подошли подкрепления: ' + G.reinfN + '/' + R.max); } }
}
// the page: title, briefing
(function () { const b = document.querySelector('.ttl b'); if (b) b.textContent = MAP.title; const sp = document.querySelector('.ttl span'); if (sp) sp.firstChild.textContent = MAP.sub + ' · '; const h = $('help'); if (h) { h.querySelector('h3').textContent = MAP.title.charAt(0) + MAP.title.slice(1).toLowerCase(); h.querySelectorAll('p').forEach(p => p.remove()); h.querySelector('h3').insertAdjacentHTML('afterend', MAP.help); } document.title = MAP.title.charAt(0) + MAP.title.slice(1).toLowerCase(); })();

// ---------------------------------------------------------------- the ram: built by the engineers at the siege yard, carried by any foot squad (not the engineers), slowly; the carrier breaks the gates himself
const canCarry = s => s.side === 1 && s.kind !== CAV;   // every foot squad, the archers and the engineers too: only the horsemen cannot
BOOST.dropram = { name: 'Бросить таран', text: 'таран брошен', kind: 'self', dur: 0, cd: 0 };
const ramTime = s => Math.min(14, Math.max(4, 6 * Math.pow(8 / Math.max(1, s.n), 0.7)));   // seconds to break a gate: 6 s for 8 men, longer for a thin squad
function ramSpawn(site) { G.ram = true; G.ramObj = { x: site.x - 40, y: site.y + 36, carrier: null }; }
function ramDrop(s) { const R = G.ramObj; if (!R) return; R.carrier = null; R.x = s.x; R.y = s.y; s.carry = false; s.work = null; s.boosts = s.boosts.filter(b => b.id !== 'dropram'); boostSel = null; }
function ramPick(q) {
  const R = G.ramObj; R.carrier = q; q.carry = true; q.path = []; q.pickT = 0; if (!q.boosts.some(b => b.id === 'dropram')) q.boosts.push({ id: 'dropram', cd: 0, left: Infinity }); boostSel = null; SND.play('crash', q.x);
  say(q.name + ' несёт таран: идёт медленнее, ворота выбивает сам');
}
function ramFetch(s) {   // the first half of «break that gate»: walk to the ram, take it, go to the gate
  const R = G.ramObj, site = s.work.site;
  if (!R || site.open) { s.work = null; return; }
  if (R.carrier && R.carrier !== s) { s.work = null; say('Таран уже несёт ' + R.carrier.name); return; }
  if (R.carrier !== s && Math.hypot(s.x - R.x, s.y - R.y) < 66) ramPick(s);
  if (R.carrier === s) { s.work.fetch = false; const p = findPath(s.x, s.y, site.stand[0], site.stand[1], 21); if (p) s.path = p; else { s.work = null; say('К воротам с тараном не пройти'); } return; }
  const p = findPath(s.x, s.y, R.x, R.y, 1); if (p && p.length) s.path = p; else s.work = null;
}
function ramTick(dt, live) {
  const R = G.ramObj; if (!R) return;
  if (R.carrier) { if (!R.carrier.alive) { ramDrop(R.carrier); say('Несущий отряд пал: таран лежит на месте'); } else { R.x = R.carrier.x; R.y = R.carrier.y; } return; }
  for (const q of live) {
    if (!canCarry(q)) continue;
    if (!q.moving && Math.hypot(q.x - R.x, q.y - R.y) < 62) {
      q.pickT = (q.pickT || 0) + dt;
      if (q.pickT >= 2) { ramPick(q); break; }
    } else q.pickT = 0;
  }
}
function drawRam(t) {
  const R = G.ramObj; if (!R) return;
  const x = R.x, y = R.carrier ? R.y - 34 : R.y, k = R.carrier ? 0.75 : 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  if (!R.carrier) { ctx.font = '900 14px "Lilita One", sans-serif'; ctx.textAlign = 'center'; const tw = ctx.measureText('таран').width + 16; rr(ctx, -tw / 2, -50, tw, 22, 11); ctx.fillStyle = 'rgba(40,24,14,.9)'; ctx.fill(); ctx.fillStyle = '#ffcc66'; ctx.fillText('таран', 0, -34); ctx.beginPath(); ctx.ellipse(0, 6, 46, 14, 0, 0, 7); ctx.fillStyle = 'rgba(20,40,10,.3)'; ctx.fill(); ctx.setLineDash([8, 7]); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,214,90,' + (0.6 + 0.3 * Math.sin(t * 4)) + ')'; ctx.beginPath(); ctx.ellipse(0, 4, 56, 24, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
  rr(ctx, -40, -12, 80, 18, 8); fo(ctx, '#9a6a3a', 3);
  for (const bx of [-24, -4, 16]) { ctx.beginPath(); ctx.moveTo(bx, -12); ctx.lineTo(bx, 6); ctx.strokeStyle = '#6a4220'; ctx.lineWidth = 2; ctx.stroke(); }
  rr(ctx, 26, -15, 18, 24, 6); fo(ctx, '#7c8088', 3);
  ctx.restore();
}
