// Which of the player's boosts a battle allows: none in the arena (skill only), shields and reinforcements in the rebellion, no mercenaries in the landing; the builders only where a map has obstacles.
BOOST_ALLOW = MAP.waves ? (MAP.waves.town ? ['reinf', 'wall'] : []) : CITY === 'sardinia' ? ['cry', 'reinf', 'wall', 'pont'] : ['cry', 'reinf', 'wall', 'merc', 'pont'];
if (!SITES.some(s => !s.nowork)) BOOST_ALLOW = BOOST_ALLOW.filter(id => id !== 'pont');

if (MAP.waves) {
  const reb = !!MAP.waves.town;
  TUT_MAP = reb ? 'Это <b>город</b>. Ваши отряды <b>красные</b>, мятежники <b>оранжевые</b>. Они идут по дорогам с разных сторон, а лазарет с носилками лечит раненых. Карту двигайте пальцем, масштаб — щипком.' : 'Это <b>арена</b>. Ваши отряды <b>красные</b>, гладиаторы выходят из ворот по краям. Карту двигайте пальцем, масштаб — щипком.';
  TUT_GOAL_FIXED = true;
  TUT_GOAL = reb ? 'Цель: удержать <b>главное здание</b> от пяти волн. Мятежники сначала жгут <b>дополнительные постройки</b>, а пока они стоят, в резерв идёт +1 каждые 20 секунд. Волну можно позвать раньше кнопкой с часами.' : 'Цель: отбить все <b>волны гладиаторов</b>. Волну можно позвать раньше кнопкой с часами.';
  TUT_POINTS = reb ? () => [...objsOf().filter(o => !o.dead).map(o => ({ x: o.x, y: o.y, r: o.r })), { x: DEF.x, y: DEF.y, r: 90 }] : () => [];
}

// The hired builders open one obstacle at once, with no engineers: the work site is finished as if the sappers had been at it.
const bstClosed = () => SITES.filter(s => !s.open && !s.nowork);
function bstOpen(site) {
  site.open = true; site.prog = site.need; SND.play('crash', site.x); G.fx.push({ x: site.x, y: site.y, t: 0.9, big: true });
  say(site.done || 'Готово'); if (site.kind === 'yard') ramSpawn(site); if (G.sel) paintOverlay(G.sel);
}
// returns true when the only obstacle was opened, 'pick' when the player has to touch one, false when nothing can be done
function bstPont() {
  const list = bstClosed();
  if (!list.length) { say('Все преграды уже открыты'); return false; }
  const ok = list.filter(s => !s.ram || G.ram);
  if (!ok.length) { say('Арку выбивает только таран: отправьте к ней пехоту или лучников'); return false; }
  if (ok.length === 1 && list.length === 1) { bstOpen(ok[0]); return true; }
  return 'pick';
}
function bstPick(x, y) {
  const s = bstClosed().sort((a, b) => Math.hypot(x - a.x, y - a.y) - Math.hypot(x - b.x, y - b.y))[0];
  if (!s || Math.hypot(x - s.x, y - s.y) > Math.max(120, (s.hit || 64) + 40)) return false;
  if (s.ram && !G.ram) { say('Арку выбивает только таран'); return false; }
  bstOpen(s); return true;
}
{
  const _dce = drawCityExtras;
  drawCityExtras = function (t) {
    _dce(t);
    if (!G.bstTgt) return;
    ctx.save(); ctx.lineWidth = 4; ctx.setLineDash([12, 8]); ctx.strokeStyle = 'rgba(255,138,60,' + (0.65 + 0.3 * Math.sin(t * 5)) + ')'; ctx.fillStyle = 'rgba(255,138,60,.16)';
    for (const s of bstClosed()) { ctx.beginPath(); ctx.ellipse(s.x, s.y, 74, 48, 0, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  };
}
