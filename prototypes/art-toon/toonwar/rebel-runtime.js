// Runs after arena-runtime.js (only active when MAP.waves.town exists): the rebels, the villa under siege and its HUD bar.
// Numbers are starting values; balance is not tested.
// every battle the waves come from other sides: each wave keeps its number of entrances, but which gates they are is drawn anew
if (MAP.waves && MAP.waves.town) {
  const keys = Object.keys(MAP.waves.gates);
  MAP.waves.list = MAP.waves.list.map(w => { const used = [...new Set(w.sp.map(s => s[2]))], pool = keys.slice().sort(() => Math.random() - 0.5), to = {}; used.forEach((g, i) => { to[g] = pool[i % pool.length]; }); return { ...w, sp: w.sp.map(([c, n, g]) => [c, n, to[g]]) }; });
}
Object.assign(CLS, {
  rebel:    { name: 'Мятежники', letter: '', kind: INF, n: 7, k: 0.08, speed: 36, def: 1.0 },
  torcher:  { name: 'Поджигатели', letter: '', kind: INF, n: 5, k: 0.07, speed: 46, def: 1.1 },
  agitator: { name: 'Вожак мятежа', letter: '', kind: INF, n: 3, k: 0.15, speed: 30, def: 0.75 }
});
Object.assign(TREE_KIND, { rebel: 'INF', torcher: 'INF', agitator: 'INF' });
Object.assign(ENEMY_NAME, { rebel: 'Мятежники', torcher: 'Поджигатели', agitator: 'Вожак мятежа' });
Object.assign(BAN, {
  rebel: { col: '#c8822c', trim: '#fff3c0', emb: 'none', shape: 'square' }, torcher: { col: '#d0602a', trim: '#ffe08a', emb: 'none', shape: 'pennant' },
  agitator: { col: '#8a1a14', trim: '#ffcc33', emb: 'eagle', shape: 'vex' }
});
// the rebels are peasants: the recruit's look in orange, with a pitchfork, a torch or a red banner
const _unitRebel = unit;
unit = function (g, x, y, cls, side, s, face) {
  if (cls !== 'rebel' && cls !== 'torcher' && cls !== 'agitator') return _unitRebel(g, x, y, cls, side, s, face);
  s = s || 1; face = face || 1; const k = s * (cls === 'agitator' ? 1.3 : 1);
  _unitRebel(g, x, y, 'rec', 3, k, face);
  g.save(); g.translate(x, y); g.scale(k * face, k);
  if (cls === 'rebel') { for (const dx of [-4, 0, 4]) stick(g, 16 + dx, -34, 16 + dx, -45, '#c9ced4', 2); stick(g, 11, -35, 21, -35, '#a0703c', 2.4); }
  else if (cls === 'torcher') { stick(g, 16, -34, 19, -52, '#8a5a30', 3); const fg = g.createRadialGradient(19, -62, 1, 19, -62, 20); fg.addColorStop(0, 'rgba(255,230,140,.9)'); fg.addColorStop(1, 'rgba(255,150,40,0)'); g.fillStyle = fg; g.beginPath(); g.arc(19, -62, 20, 0, 7); g.fill(); g.beginPath(); g.moveTo(14, -52); g.quadraticCurveTo(13, -62, 19, -72); g.quadraticCurveTo(26, -62, 24, -52); g.closePath(); fo(g, '#ffb030', 2); }
  else { g.beginPath(); g.moveTo(-8, -26); g.lineTo(-20, -2); g.lineTo(0, -2); g.closePath(); fo(g, '#8a1a14', 2.2); stick(g, 16, -34, 16, -72, '#8a5a30', 3); g.beginPath(); g.moveTo(16, -72); g.lineTo(36, -66); g.lineTo(16, -56); g.closePath(); fo(g, '#c8362c', 2); }
  g.restore();
};

// ---------------------------------------------------------------- the villa: rebels near it set it on fire; when it is not threatened the fire dies down
const DEF = MAP.waves && MAP.waves.def;   // the building the legions defend: its position, radius, name and the height of its health bar
function villaTick(dt, live) {
  const V = G.villa || (G.villa = { hp: 100 }); if (!V.init) { V.init = true; G.reserve = 16; }   // a defence needs a deeper reserve than an attack
  if (G.over) return;
  let d = 0;
  for (const e of live) if (e.side === 2 && e.wave && !(e.stunT > 0) && Math.hypot(e.x - DEF.x, e.y - DEF.y) < DEF.r) d += e.n * 0.3 * (e.cls === 'torcher' ? 2.4 : 1);
  V.hp = d > 0 ? Math.max(0, V.hp - d * dt) : Math.min(100, V.hp + 1.2 * dt);
  if (V.hp <= 0 && !G.lostVilla) { G.lostVilla = true; SND.play('lose'); }
  if (d > 0 && !V.warned && V.hp < 70) { V.warned = true; say('Мятежники поджигают: ' + DEF.name + '!'); }
  if (V.hp > 90) V.warned = false;
}
const _cityTickRebel = cityTick;
function rebelUnstick(dt, live) {
  for (const q of live) if (q.side === 2 && q.wave) {
    if (q.path.length === 1 && Math.hypot(q.path[0][0] - q.x, q.path[0][1] - q.y) < 50) q.path = [];
    if (q.moving || q.fighting || (q.home && Math.hypot(q.x - q.home[0], q.y - q.home[1]) < 40)) { q.idleT = 0; continue; }
    q.idleT = (q.idleT || 0) + dt; if (q.idleT > 3) { q.idleT = 0; q.ignoreT = G.t + 12; q.atk = null; q.path = []; }
  }
}
cityTick = function (dt, live) { _cityTickRebel(dt, live); if (MAP.waves && MAP.waves.town) { villaTick(dt, live); objsTick(dt, live); rebelUnstick(dt, live); } };
// the other buildings (the capture battle's points) are held in a rebellion too: rebels walk to the nearest standing one first and burn it; it gives supplies while it stands
const OBJ_HP = 35;   // the other buildings are far weaker than the main one (100)
const objsOf = () => G.objs || (G.objs = (MAP.waves && MAP.waves.objs || []).map(o => ({ ...o, hp: OBJ_HP, max: OBJ_HP, dead: false })));
const rebelObjLeft = () => !!(MAP.waves && MAP.waves.town) && objsOf().some(o => !o.dead);
function rebelGoal(e) {
  let best = null, bd = 1e9; for (const o of objsOf()) { if (o.dead) continue; const d = Math.hypot(o.x - e.x, o.y - e.y); if (d < bd) { bd = d; best = o; } }
  if (best) return best.go || (best.go = nearestWalkable(best.x, best.y, 2, 150) || [best.x, best.y]);
  return G.townGo || (G.townGo = nearestWalkable(MAP.waves.town[0], MAP.waves.town[1], 2, 150) || MAP.waves.town);
}
function objsTick(dt, live) {
  const V = G.villa; let up = 0;
  for (const o of objsOf()) {
    if (o.dead) continue; up++;
    let d = 0; for (const e of live) if (e.side === 2 && e.wave && !(e.stunT > 0) && Math.hypot(e.x - o.x, e.y - o.y) < o.r + 24) d += e.n * 0.3 * (e.cls === 'torcher' ? 2.4 : 1);
    if (d > 0) { o.hp = Math.max(0, o.hp - d * dt); if (!o.warned && o.hp < o.max * 0.7) { o.warned = true; say('Горит: ' + o.name); } }
    if (o.hp <= 0) { o.dead = true; SND.play('lose'); G.fx.push({ x: o.x, y: o.y, t: 1, big: true }); say('Потеряно: ' + o.name + '. Мятежники идут к следующей цели'); }
  }
  if (V && up) { V.sup = (V.sup || 0) + dt * up; if (V.sup >= 20) { V.sup -= 20; G.reserve += 1; } }
}
const _drawExtrasRebel = drawCityExtras;
drawCityExtras = function (t) {
  _drawExtrasRebel(t);
  if (MAP.noCamp) infirmaryCamp(ctx, MAP.camp, MAP.tents);
  if (!(MAP.waves && MAP.waves.town) || !G.villa) return;
  for (const o of objsOf()) {
    if (o.dead) { ctx.beginPath(); ctx.ellipse(o.x, o.y + 8, 48, 20, 0, 0, 7); ctx.fillStyle = 'rgba(30,20,12,.5)'; ctx.fill(); flames(ctx, o.x - 20, o.y + 2, 1.1); flames(ctx, o.x + 18, o.y - 4, 1.4); continue; }
    const q = o.hp / o.max; ctx.save(); ctx.setLineDash([10, 8]); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,214,90,.75)'; ctx.beginPath(); ctx.ellipse(o.x, o.y + 8, o.r, o.r * 0.5, 0, 0, 7); ctx.stroke(); ctx.restore();
    if (q < 0.85) flames(ctx, o.x + 14, o.y - 14, q < 0.4 ? 1.4 : 1);
    rr(ctx, o.x - 48, o.y - 86, 96, 16, 8); ctx.fillStyle = OL; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff3dc'; ctx.stroke(); rr(ctx, o.x - 43, o.y - 81, 86 * Math.max(0.04, q), 6, 3); ctx.fillStyle = q > 0.5 ? '#7ee05a' : q > 0.25 ? '#ffcc33' : '#ff5a4a'; ctx.fill();
  }
  const f = G.villa.hp / 100;
  if (f < 0.85) for (const [dx, dy, s] of [[-80, -30, 1.1], [34, -60, 1.5], [84, -14, 0.95]].slice(0, f < 0.35 ? 3 : f < 0.6 ? 2 : 1)) flames(ctx, DEF.x + dx, DEF.y + dy, s);
  rr(ctx, DEF.x - 64, DEF.y + DEF.bar, 128, 13, 6.5); ctx.fillStyle = OL; ctx.fill(); rr(ctx, DEF.x - 61, DEF.y + DEF.bar + 3, 122 * f, 7, 3.5); ctx.fillStyle = f > 0.5 ? '#7ee05a' : f > 0.25 ? '#ffcc33' : '#ff5a4a'; ctx.fill();
};
if (false) (function () {
  const bar = document.createElement('div');
  bar.style.cssText = 'padding:6px 14px;border-radius:14px;background:rgba(40,24,14,.92);border:2.5px solid #f2c14a;font:400 13px "Lilita One",sans-serif;color:#ffe6a8;display:flex;flex-direction:column;gap:3px;box-sizing:border-box';
  bar.innerHTML = '<span>🏛 ' + DEF.name + ' <b id="vhp" style="float:right;margin-left:10px">100%</b></span>';
  $('hstack').insertBefore(bar, $('phase'));
  setInterval(() => { const f = G.villa ? G.villa.hp : 100, el = $('vhp'); el.textContent = Math.ceil(f) + '%'; el.style.color = f > 50 ? '#9fe08a' : f > 25 ? '#ffcc33' : '#ff7a6a'; }, 200);
})();
