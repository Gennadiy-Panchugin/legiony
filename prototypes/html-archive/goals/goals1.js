// Turns the plan-and-execute prototype into "battle for objectives": hold the bridgehead, or escort the convoy.
const fs = require('fs'), path = require('path');
const F = path.join(__dirname, 'goals.html');
let s = fs.readFileSync(F, 'utf8');
function rep(a, b) { const i = s.indexOf(a); if (i < 0 || s.indexOf(a, i + 1) >= 0) { console.error('MISS', a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); }
function between(a, b, body) { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) { console.error('MISS range', a); process.exit(1); } s = s.slice(0, i) + body + s.slice(j); }

rep('<!-- Question: does a Frozen-Synapse-style battle (paused planning of cohort paths, then 15 s of simultaneous execution) feel less like Tower War and more like commanding a legion? -->',
    '<!-- Question: does giving each plan-and-execute battle one visible objective (hold a bridgehead, escort a convoy) make battles play differently from each other? -->');
rep('<title>План и исполнение</title>', '<title>Бой за цели</title>');
rep('.toast { position: absolute; left: 50%; top: 104px;', '.toast { position: absolute; left: 50%; top: 142px;');
rep(`  .help button { margin-top: 6px;`, `  .goals { display: flex; gap: 10px; margin-top: 4px; }
  .goals button { flex: 1 1 0; min-width: 0; height: auto !important; padding: 10px 8px; margin: 0 !important; display: flex; flex-direction: column; gap: 4px; align-items: center; text-align: center; line-height: 1.25; }
  .goals button b { color: #1e1408 !important; font-size: 16px; }
  .goals button span { font: 500 12px var(--body); color: #3a2a12; }
  .help button { margin-top: 6px;`);
rep('<small>Возьмите переправу через Анио</small>', '<small id="goalT">Удержите предмостье</small>');
rep(`    <p><b>Цель:</b> за 6 раундов разбить армию врага или войти в его лагерь, когда рядом нет охраны. Не успели — поражение.</p>
    <button type="button" id="helpOk">К плану</button>`,
`    <p><b>Выберите цель боя.</b> Разбить всю армию врага тоже победа, но обычно цель достижима быстрее.</p>
    <div class="goals">
      <button type="button" id="gBridge"><b>⚑ Предмостье</b><span>Займите круг с флагом за рекой и держите его 3 раунда подряд</span></button>
      <button type="button" id="gConvoy"><b>Обоз</b><span>Проведите повозку по дороге к форту. Без охраны она стоит</span></button>
    </div>`);
rep(`<button type="button" id="ovB">Ещё бой</button></div></div>`, `<button type="button" id="ovB">Ещё бой</button><button type="button" id="ovG">Другая цель</button></div></div>`);

// ---------------------------------------------------------------- objective data
rep(`const CAMP = { 1: { x: 270, y: 828 }, 2: { x: 270, y: 142 } };`,
`const CAMP = { 1: { x: 270, y: 828 }, 2: { x: 270, y: 142 } };
// objectives
const ZONE = { x: 410, y: 398, r: 54 }, HOLD_NEED = 3;                 // the bridgehead on the enemy bank
const ROAD = [[270, 784], [205, 700], [138, 576], [130, 500], [130, 412], [112, 330], [88, 250], [70, 176]];
const ROAD_LEN = ROAD.reduce((L, p, i) => i ? L + Math.hypot(p[0] - ROAD[i - 1][0], p[1] - ROAD[i - 1][1]) : 0, 0);
const BLOCK_D = 4 + ROAD.slice(0, 5).reduce((L, p, i) => i ? L + Math.hypot(p[0] - ROAD[i - 1][0], p[1] - ROAD[i - 1][1]) : 0, 0);
const FORT = { x: 70, y: 150 }, WAGON_SPEED = 22, WAGON_HP = 100, ESCORT = 80;
let goal = 'bridge';`);
rep(`        lost: { 1: 0, 2: 0 }, roundLoss: { 1: 0, 2: 0 } };`,
`        lost: { 1: 0, 2: 0 }, roundLoss: { 1: 0, 2: 0 }, goal, hold: 0, zone: 0, wagon: { d: 0, hp: WAGON_HP, state: 'wait', hitT: 0 } };`);

// ---------------------------------------------------------------- enemy general guards the objective
between('function aiPlan(side) {', '// ---------------------------------------------------------------- one round of execution', `function aiPlan(side) {
  const foe = 3 - side, mine = alive(side), theirs = alive(foe);
  if (!theirs.length) return;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const nearest = (c, list) => list.slice().sort((p, q) => dist(c, p) - dist(c, q))[0];
  const jit = () => (Math.random() - 0.5) * 30;
  // the point he defends: the bridgehead, or the road ahead of the wagon (first the bridge it must cross)
  let anchor, wag = null;
  if (G.goal === 'bridge') anchor = { x: ZONE.x, y: ZONE.y - 6 };
  else {
    const [wx, wy] = wagonAt(G.wagon.d); wag = { x: wx, y: wy };
    const [ax, ay] = wagonAt(Math.min(ROAD_LEN - 30, Math.max(BLOCK_D, G.wagon.d + 130))); anchor = { x: ax, y: ay };
  }
  const threats = theirs.filter(e => dist(e, anchor) < 170 || (wag && dist(e, wag) < 120 && bankOf(e.y) === side));
  const escorted = wag && theirs.some(e => dist(e, wag) < ESCORT + 10);
  let ii = 0, ai = 0;
  for (const c of mine) {
    if (c.kind === INF) {
      const off = (ii++ % 2 ? 1 : -1) * 34;
      if (threats.length) { const e = nearest(c, threats); order(c, route(c, e.x + jit(), e.y + jit()), 'fight'); }
      else order(c, route(c, anchor.x + off + jit(), anchor.y - 8 + jit()), 'fight');
    } else if (c.kind === ARC) {
      const close = theirs.filter(e => e.kind !== ARC && dist(c, e) < 100);
      if (close.length) {                                          // step back from melee
        const e = nearest(c, close), dx = c.x - e.x, dy = c.y - e.y, d = Math.hypot(dx, dy) || 1;
        order(c, [[c.x, c.y], [c.x + dx / d * 80, c.y + dy / d * 80]], 'fight');
      } else {
        const off = (ai++ % 2 ? 1 : -1) * 50;
        order(c, route(c, Math.max(30, Math.min(W - 30, anchor.x + off)), anchor.y + (side === 2 ? -70 : 70)), 'fight');
      }
    } else {
      const archers = theirs.filter(e => e.kind === ARC && bankOf(e.y) === side).sort((p, q) => p.n - q.n);
      const inZone = G.goal === 'bridge' && theirs.filter(e => dist(e, ZONE) < ZONE.r + 20);
      if (wag && !escorted && G.round >= 2) order(c, route(c, wag.x, wag.y), 'march');           // raid the lonely wagon
      else if (inZone && inZone.length) order(c, route(c, inZone[0].x, inZone[0].y), 'fight');
      else if (archers.length) order(c, route(c, archers[0].x, archers[0].y), 'march');
      else order(c, route(c, anchor.x + (anchor.x > W / 2 ? -90 : 90), anchor.y - 70), 'fight');
    }
    if (Math.random() < 0.1 && c.path) c.path = null;              // sometimes a cohort just holds
  }
}
`);

// ---------------------------------------------------------------- round end: score the bridgehead
rep(`  for (const c of G.coh) { c.path = null; }
  if (checkEnd(true)) return;`, `  for (const c of G.coh) { c.path = null; }
  let note = '';
  if (G.goal === 'bridge') {
    const z = zoneOwner();
    if (z === 1) { G.hold++; note = ' · предмостье ваше: ' + G.hold + ' из ' + HOLD_NEED; }
    else if (z === 2 || z === 3) { if (G.hold) note = ' · враг в круге — счёт сброшен'; G.hold = 0; }
    else note = G.hold ? ' · круг пуст, счёт ' + G.hold + ' сохранён' : '';
  }
  if (checkEnd(true)) return;`);
rep(`  say('Раунд ' + (G.round - 1) + ': потери Рима ' + l1 + ', врага ' + l2);`, `  say('Раунд ' + (G.round - 1) + ': потери Рима ' + l1 + ', врага ' + l2 + note);`);
rep(`  if (checkEnd(false)) return;`, `  if (G.goal === 'convoy') moveWagon(dt, list);
  G.zone = G.goal === 'bridge' ? zoneOwner() : 0;
  if (checkEnd(false)) return;`);

between('function checkEnd(roundOver) {', '// ---------------------------------------------------------------- drawing', `// 0 empty, 1 Rome alone, 2 enemy alone, 3 contested
function zoneOwner() {
  const r = alive(1).some(c => Math.hypot(c.x - ZONE.x, c.y - ZONE.y) < ZONE.r), b = alive(2).some(c => Math.hypot(c.x - ZONE.x, c.y - ZONE.y) < ZONE.r);
  return r && b ? 3 : r ? 1 : b ? 2 : 0;
}
const wagonAt = d => along(ROAD, Math.max(0, Math.min(ROAD_LEN, d)));
// the wagon rolls only with an escort beside it and no enemy in reach; unescorted enemies burn it
function moveWagon(dt, list) {
  const w = G.wagon, [x, y] = wagonAt(w.d);
  const esc = list.some(c => c.side === 1 && Math.hypot(c.x - x, c.y - y) < ESCORT);
  const foes = list.filter(c => c.side === 2 && Math.hypot(c.x - x, c.y - y) < ESCORT);
  w.state = foes.length ? 'stop' : esc ? 'go' : 'wait';
  if (w.state === 'go') w.d = Math.min(ROAD_LEN, w.d + WAGON_SPEED * dt);
  let burn = 0;
  for (const e of foes) {
    const busy = e.target && Math.hypot(e.target.x - e.x, e.target.y - e.y) < CONTACT;
    if (!busy && Math.hypot(e.x - x, e.y - y) < 52) burn += e.n * 0.25;
  }
  if (burn) {
    w.hp = Math.max(0, w.hp - burn * dt);
    w.hitT -= dt; if (w.hitT <= 0) { w.hitT = 0.4; G.fx.push({ x: x + (Math.random() - .5) * 16, y: y - 6, t: 0.4 }); }
  }
}
function checkEnd(roundOver) {
  let win = 0, why = '';
  if (!alive(2).length) { win = 1; why = 'Армия врага разбита.'; }
  else if (!alive(1).length) { win = 2; why = 'Легион разбит.'; }
  else if (G.goal === 'convoy' && G.wagon.hp <= 0) { win = 2; why = 'Враг сжёг обоз.'; }
  else if (G.goal === 'convoy' && G.wagon.d >= ROAD_LEN) { win = 1; why = 'Обоз дошёл до форта союзников.'; }
  else if (G.goal === 'bridge' && G.hold >= HOLD_NEED) { win = 1; why = 'Предмостье удержано три раунда подряд.'; }
  if (!win && roundOver && G.round >= ROUNDS) { win = 2; why = G.goal === 'bridge' ? 'Раунды кончились, а предмостье не удержано.' : 'Раунды кончились, обоз не дошёл.'; }
  if (!win) return false;
  G.over = true; G.phase = 'over'; G.winner = win;
  $('ovT').textContent = win === 1 ? 'Победа!' : 'Поражение';
  $('ovP').textContent = why + ' Раундов: ' + G.round + ' · врагов пало ' + G.lost[2] + ' · наши потери ' + G.lost[1] + '.';
  $('over').hidden = false; ui();
  return true;
}

`);

// ---------------------------------------------------------------- drawing the objective
rep(`  const list = alive();
  if (G.sel && G.phase === 'plan') {`, `  drawGoal(t);
  const list = alive();
  if (G.sel && G.phase === 'plan') {`);
rep(`function hud() {`, `function drawGoal(t) {
  if (G.goal === 'bridge') {
    const z = G.zone, col = z === 1 ? '192,38,27' : z === 2 ? '47,111,214' : z === 3 ? '217,164,65' : '74,52,32';
    ctx.save();
    ctx.fillStyle = 'rgba(' + col + ',.16)'; ctx.beginPath(); ctx.arc(ZONE.x, ZONE.y, ZONE.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(' + col + ',.9)'; ctx.lineWidth = 3; ctx.setLineDash([10, 7]); ctx.lineDashOffset = -t * 14; ctx.stroke(); ctx.setLineDash([]);
    const fx = ZONE.x + ZONE.r - 10, fy = ZONE.y - ZONE.r + 6, pen = z === 1 ? '#c0261b' : z === 2 ? '#2f6fd6' : '#d9a441';
    ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(fx, fy + 30); ctx.lineTo(fx, fy - 8); ctx.stroke();
    ctx.fillStyle = pen; ctx.beginPath(); ctx.moveTo(fx, fy - 8); ctx.quadraticCurveTo(fx + 12, fy - 4 + Math.sin(t * 4) * 2, fx + 24, fy - 2); ctx.lineTo(fx, fy + 6); ctx.fill();
    ctx.restore();
  } else {
    // the road, the travelled part, the allied fort and the wagon
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(150,112,64,.55)'; ctx.lineWidth = 16;
    ctx.beginPath(); ROAD.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    ctx.strokeStyle = 'rgba(74,52,32,.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.stroke(); ctx.setLineDash([]);
    const done = [ROAD[0]]; let acc = 0;
    for (let i = 1; i < ROAD.length; i++) { const s = Math.hypot(ROAD[i][0] - ROAD[i - 1][0], ROAD[i][1] - ROAD[i - 1][1]); if (acc + s < G.wagon.d) { done.push(ROAD[i]); acc += s; } else break; }
    done.push(wagonAt(G.wagon.d));
    ctx.strokeStyle = 'rgba(192,38,27,.55)'; ctx.lineWidth = 6; ctx.beginPath(); done.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    // fort
    const { x: fx, y: fy } = FORT;
    ctx.fillStyle = '#b9a27a'; ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 2;
    ctx.fillRect(fx - 26, fy - 16, 52, 30); ctx.strokeRect(fx - 26, fy - 16, 52, 30);
    for (let i = 0; i < 5; i++) { ctx.fillRect(fx - 26 + i * 12, fy - 23, 7, 7); ctx.strokeRect(fx - 26 + i * 12, fy - 23, 7, 7); }
    ctx.fillStyle = '#2a1c10'; ctx.fillRect(fx - 6, fy, 12, 14);
    ctx.beginPath(); ctx.moveTo(fx, fy - 23); ctx.lineTo(fx, fy - 44); ctx.stroke();
    ctx.fillStyle = '#c0261b'; ctx.beginPath(); ctx.moveTo(fx, fy - 44); ctx.lineTo(fx + 16, fy - 39); ctx.lineTo(fx, fy - 34); ctx.fill();
    ctx.font = '700 12px Alegreya Sans, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(42,28,16,.9)'; ctx.fillText('Форт союзников', fx + 14, fy + 30);
    // wagon
    const w = G.wagon, [x, y] = wagonAt(w.d), [nx, ny] = wagonAt(w.d + 6), a = Math.atan2(ny - y, nx - x);
    if (G.phase === 'plan') { ctx.strokeStyle = 'rgba(192,38,27,.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.arc(x, y, ESCORT, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
    ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
    const roll = w.state === 'go' ? Math.sin(t * 10) * 0.8 : 0;
    ctx.fillStyle = '#2a1c10'; for (const [wx, wy] of [[-11, -8], [11, -8], [-11, 9], [11, 9]]) { ctx.beginPath(); ctx.ellipse(wx, wy + roll, 3, 5, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#8a5a2c'; ctx.fillRect(-9, -14, 18, 30); ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 1.5; ctx.strokeRect(-9, -14, 18, 30);
    ctx.fillStyle = '#efe2c0'; ctx.beginPath(); ctx.ellipse(0, 2, 10, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#6b4a2a'; ctx.beginPath(); ctx.ellipse(0, -24, 5, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const f = w.hp / WAGON_HP; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x - 18, y + 22, 36, 5);
    ctx.fillStyle = f > 0.5 ? '#6fd17a' : f > 0.25 ? '#f2c14e' : '#ef6b5a'; ctx.fillRect(x - 18, y + 22, 36 * f, 5);
    const lbl = w.state === 'go' ? 'едет' : w.state === 'stop' ? 'враг рядом — стоит' : 'ждёт охрану';
    ctx.font = '700 11px Alegreya Sans, sans-serif'; ctx.textAlign = 'center';
    const tw = ctx.measureText(lbl).width + 12; ctx.fillStyle = 'rgba(30,25,19,.85)'; ctx.fillRect(x - tw / 2, y + 30, tw, 16);
    ctx.fillStyle = w.state === 'stop' ? '#ff8a80' : '#f6e7bf'; ctx.fillText(lbl, x, y + 42);
    ctx.restore();
  }
  // the objective banner: one line, always visible
  const txt = G.goal === 'bridge'
    ? '⚑ Предмостье: ' + '■'.repeat(G.hold) + '□'.repeat(HOLD_NEED - G.hold) + '  удержано ' + G.hold + ' из ' + HOLD_NEED + ' раундов подряд'
    : 'Обоз: ' + Math.round(G.wagon.d / ROAD_LEN * 100) + '% пути · целость ' + Math.ceil(G.wagon.hp) + '%';
  ctx.font = '700 14px Alegreya Sans, sans-serif'; ctx.textAlign = 'center';
  const bw = ctx.measureText(txt).width + 28;
  ctx.fillStyle = 'rgba(30,25,19,.92)'; ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(W / 2 - bw / 2, 100, bw, 30, 15) : ctx.rect(W / 2 - bw / 2, 100, bw, 30); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f6d77a'; ctx.fillText(txt, W / 2, 120);
}
function hud() {`);

// ---------------------------------------------------------------- texts and input
rep(`'Проведите путь от когорты. Когда все готовы — «В бой»';
  }`, `goalHint();
  }
  $('goalT').textContent = G.goal === 'bridge' ? 'Удержите предмостье' : 'Проведите обоз к форту';`);
rep(`function ui() {`, `const goalHint = () => G.goal === 'bridge'
  ? 'Займите круг с флагом за рекой и держите его 3 раунда подряд. Враг в круге сбрасывает счёт'
  : 'Обоз едет, только когда рядом ваша когорта и нет врага. Проведите его через мост к форту';
function ui() {`);
rep(`$('helpOk').addEventListener('click', () => { $('help').hidden = true; started = true; ui(); });`,
`const pick = g => { goal = g; newBattle(); $('help').hidden = true; $('over').hidden = true; started = true; ui(); };
$('gBridge').addEventListener('click', () => pick('bridge'));
$('gConvoy').addEventListener('click', () => pick('convoy'));
$('ovG').addEventListener('click', () => { $('over').hidden = true; $('help').hidden = false; started = false; });`);
rep(`window.__plan = { get G() { return G; },`, `window.__plan = { setGoal: g => { goal = g; }, wagonAt, zoneOwner, ROAD_LEN, get G() { return G; },`);
fs.writeFileSync(F, s);
console.log('ok', s.length);
