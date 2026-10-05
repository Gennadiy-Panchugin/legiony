// Runs after the battle engine in citywar.html: the work sites' drawing, reinforcements, the second act, the gladiators,
// and the page's title and briefing for the chosen city.
CLS.gladiators = { name: 'Гладиаторы', letter: 'Г', kind: INF, n: 5, k: 0.16, speed: 34, def: 0.8, hint: 'пятый отряд из школы' };
BOOST.fury = { name: 'Ярость толпы', text: 'урон ×2 на 6 с', kind: 'self', dur: 6, cd: 999, uses: 1 };
BOOSTS.gladiators = ['fury'];
BAN.gladiators = { col: '#8a8f98', trim: '#ffcc33', emb: 'none', shape: 'square' };
TREE_KIND.gladiators = 'INF';

function siteBar(s) { if (s.open || !(s.prog > 0)) return; rr(ctx, s.x - 40, s.y - 96, 80, 9, 4.5); ctx.fillStyle = OL; ctx.fill(); rr(ctx, s.x - 38, s.y - 94, 76 * s.prog / s.need, 5, 2.5); ctx.fillStyle = '#ffcc33'; ctx.fill(); }
function pickBadge(s) { ctx.beginPath(); ctx.arc(s.x, s.y - 50, 14, 0, 7); fo(ctx, s.ram && !G.ram ? '#9a9a9a' : '#f09a24', 2.4); ctx.font = '15px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(s.kind === 'yard' ? '🔨' : '⛏', s.x, s.y - 44); }
function openArch(x, y, sc) { ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.beginPath(); ctx.moveTo(-36, 2); ctx.lineTo(-36, -40); ctx.arc(0, -40, 36, Math.PI, 0); ctx.lineTo(36, 2); ctx.closePath(); fo(ctx, '#1a0e06', 3); ctx.restore(); }
function drawSite(s) {
  if (s.kind === 'rubble') { if (s.open) rubble(ctx, s.x, s.y, 2); else { rubble(ctx, s.x, s.y, 0); pickBadge(s); } }
  else if (s.kind === 'gate') { if (s.open) openArch(s.x, s.y + 12, s.sc || 0.7); else pickBadge(s); }
  else if (s.kind === 'arch') { if (s.open) { ctx.save(); ctx.translate(s.x, s.y + 8); ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-20, -46); ctx.arc(0, -46, 20, Math.PI, 0); ctx.lineTo(20, 0); ctx.closePath(); fo(ctx, '#1a0e06', 2.4); ctx.restore(); } else pickBadge(s); }
  else if (s.kind === 'door') { if (!s.open) { innerGate(ctx, s.x, s.y + 16); pickBadge(s); } else { for (let k = -1; k <= 1; k += 2) { rr(ctx, s.x + k * 40 - 6, s.y - 4, 12, 30, 3); fo(ctx, '#7a4a26', 2); } } }
  else if (s.kind === 'bridge') { if (!s.open) { ctx.save(); ctx.translate(0, s.y - 944); bridgeSite(ctx, s.x, s.prog / s.need); ctx.restore(); } else { const [mx, my, mw, mh] = s.mask.rect; for (let yy = my + mh - 8; yy > my - 4; yy -= 9) { rr(ctx, mx - 3, yy, mw + 6, 8, 2); fo(ctx, '#c48a4a', 2); } ctx.strokeStyle = OL; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(mx - 6, my - 4); ctx.lineTo(mx - 6, my + mh); ctx.moveTo(mx + mw + 6, my - 4); ctx.lineTo(mx + mw + 6, my + mh); ctx.stroke(); ctx.strokeStyle = '#a0703c'; ctx.lineWidth = 2.6; ctx.stroke(); } }
  else if (s.kind === 'raft') { raft(ctx, s.x, s.open ? s.y : s.y + 70); if (!s.open) pickBadge(s); }
  else if (s.kind === 'yard') { if (!s.open) pickBadge(s); else { ctx.font = '900 14px "Lilita One", sans-serif'; const tx = 'таран готов', tw = ctx.measureText(tx).width + 16; rr(ctx, s.x - tw / 2, s.y - 120, tw, 22, 11); ctx.fillStyle = 'rgba(40,24,14,.9)'; ctx.fill(); ctx.fillStyle = '#ffcc66'; ctx.textAlign = 'center'; ctx.fillText(tx, s.x, s.y - 104); } }
  siteBar(s);
}
function drawCityExtras(t) {
  for (const p of G.points) if (p.owner === 1 && p.tents) for (const [x, y] of p.tents) tent(ctx, x, y);
  for (const b of G.bonus) if (!b.done) { capRing(ctx, b.x, b.y, b.r * 0.75, b.prog / b.need); ctx.font = '900 14px "Lilita One", sans-serif'; const tw = ctx.measureText(b.name).width + 18; rr(ctx, b.x - tw / 2, b.y + b.r * 0.42, tw, 22, 11); ctx.fillStyle = 'rgba(40,24,14,.9)'; ctx.fill(); ctx.fillStyle = '#ffcc33'; ctx.textAlign = 'center'; ctx.fillText(b.name + ' · +1 отряд', b.x, b.y + b.r * 0.42 + 16); }
  if (MAP.reinf) { const left = MAP.reinf.max - G.reinfN, cut = G.act2; const tx = cut ? 'подкрепления отрезаны' : 'подкрепления ' + G.reinfN + '/' + MAP.reinf.max + (left ? ' · через ' + Math.ceil(MAP.reinf.every - G.reinfT) + ' с' : ''); ctx.font = '900 14px "Lilita One", sans-serif'; const tw = ctx.measureText(tx).width + 18; rr(ctx, MAP.reinf.x - tw / 2, MAP.reinf.y - 40, tw, 22, 11); ctx.fillStyle = 'rgba(40,24,14,.9)'; ctx.fill(); ctx.fillStyle = cut ? '#8a9aaa' : '#9ec1ff'; ctx.textAlign = 'center'; ctx.fillText(tx, MAP.reinf.x, MAP.reinf.y - 24); }
}
// the per-frame rules every city map may use
function cityTick(dt, live) {
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
  if (R && !G.act2 && G.reinfN < R.max) { G.reinfT += dt; if (G.reinfT >= R.every) { G.reinfT = 0; const cls = R.cls[G.reinfN % R.cls.length]; const s = addSq(2, cls, R.x, R.y, 'hold', 'rf'); s.home = R.home.slice(); s.path = findPath(s.x, s.y, R.home[0], R.home[1], 2) || []; G.reinfN++; G.warn.push({ x: R.x, y: R.y, t: 2.5 }); say('К врагу подошли подкрепления: ' + G.reinfN + '/' + R.max); } }
}
// the page: title, briefing
(function () { const b = document.querySelector('.ttl b'); if (b) b.textContent = MAP.title; const sp = document.querySelector('.ttl span'); if (sp) sp.firstChild.textContent = MAP.sub + ' · '; const h = $('help'); if (h) { h.querySelector('h3').textContent = MAP.title.charAt(0) + MAP.title.slice(1).toLowerCase(); h.querySelectorAll('p').forEach(p => p.remove()); h.querySelector('h3').insertAdjacentHTML('afterend', MAP.help); } document.title = MAP.title.charAt(0) + MAP.title.slice(1).toLowerCase(); })();
