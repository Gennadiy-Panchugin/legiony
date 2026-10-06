// The barracks and the pre-battle screen, opened by the main game over its map (window.name 'legarmy').
// The main game owns the denarii and the army; this page asks it to retrain and to start the fight.
const $ = id => document.getElementById(id);
const EMBED = window.name === 'legarmy';
const GENS = ['Марк', 'Тит', 'Гай', 'Луций'];
let S = { mode: 'barracks', coins: 640, army: ARMY_DEFAULT.slice(), owned: ['rome', 'veii'], recon: ['hoplite', 'e_arc', 'ambush', 'e_cav'], title: 'Горный перевал', training: null };
let gi = 0, pick = null, whyT = 0, whyText = '';
function fit() { const k = Math.max(0.3, Math.min(innerWidth / 540, innerHeight / 960, 1.2)); $('board').style.transform = 'scale(' + k + ')'; $('fit').style.width = 540 * k + 'px'; $('fit').style.height = 960 * k + 'px'; }
addEventListener('resize', fit);
const send = m => { if (EMBED) parent.postMessage(Object.assign({ legArmy: true }, m), '*'); };

// small canvases: a soldier, a squad, a portrait, a type icon
function cnv(w, h, drawFn) { const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; const g = c.getContext('2d'); g.scale(2, 2); drawFn(g); c.style.width = w + 'px'; c.style.height = h + 'px'; return c; }
const thumb = (cls, w, h, enemy) => cnv(w, h, g => { grass(g, 0, 0, w, h, '#86ce52', rng(cls.length * 7)); unit(g, w / 2, h - 7, cls, enemy ? 2 : 1, h / 112, enemy ? -1 : 1); });
const squadPic = (cls, w, h) => cnv(w, h, g => { grass(g, 0, 0, w, h, '#86ce52', rng(cls.length * 5)); squadOf(g, w / 2, h - 22, cls, 1, 5, h / 110, 1); });
const face = (i, cls, r) => cnv(r * 2, r * 2, g => { g.save(); g.beginPath(); g.arc(r, r, r, 0, 7); g.clip(); g.scale(r / 32, r / 32); portrait(g, i, cls); g.restore(); });
// the pre-battle screen only: the general's portrait with the squad type's own gear, in a gold ring
const TYPE_BAN = { principes: { col: '#8a1a14', trim: '#d9a441', emb: 'eagle', shape: 'vex' }, triarii: { col: '#5a1410', trim: '#f4f0e4', emb: 'eagle', shape: 'vex' }, slingers: { col: '#3a7a3e', trim: '#eef3d2', emb: 'wolf', shape: 'pennant' }, cretans: { col: '#2a6a5a', trim: '#ffcc66', emb: 'wolf', shape: 'pennant' }, scouts: { col: '#5a3a8a', trim: '#f2e8ff', emb: 'horse', shape: 'swallow' }, scorpion: { col: '#b0701a', trim: '#2a1c10', emb: 'pick', shape: 'square' } };
for (const k in TYPE_BAN) if (!BAN[k]) BAN[k] = TYPE_BAN[k];
const PBASE = { principes: 'hastati', triarii: 'hastati', scouts: 'eques', scorpion: 'eng' };
const PGEAR = {
  tiro: g => { g.strokeStyle = '#8a5a30'; g.lineWidth = 3; g.beginPath(); g.moveTo(52, 12); g.lineTo(46, 58); g.stroke(); },
  principes: g => { g.fillStyle = '#161616'; g.beginPath(); g.ellipse(32, 10, 16, 4.6, 0, 0, 7); g.fill(); g.fillStyle = '#d9a441'; g.fillRect(16, 12, 32, 2); },
  triarii: g => { g.fillStyle = '#f4f0e4'; g.fillRect(28, 0, 8, 13); g.fillStyle = '#d8d2c0'; g.fillRect(33, 0, 3, 13); g.strokeStyle = '#a0703c'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(53, 12); g.lineTo(53, 54); g.stroke(); g.fillStyle = '#e6ebf0'; g.beginPath(); g.moveTo(53, 3); g.lineTo(50, 13); g.lineTo(56, 13); g.closePath(); g.fill(); },
  slingers: g => { g.fillStyle = '#f2f0e8'; g.fillRect(19, 21, 26, 5); g.beginPath(); g.arc(45, 23, 3.4, 0, 7); g.fill(); g.fillRect(46, 24, 5, 8); g.strokeStyle = '#e8dcc0'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(8, 62); g.quadraticCurveTo(10, 40, 22, 46); g.stroke(); g.fillStyle = '#b4aa9a'; g.beginPath(); g.arc(8, 50, 3.6, 0, 7); g.fill(); },
  cretans: g => { g.fillStyle = '#3a8a4a'; g.beginPath(); g.moveTo(17, 26); g.lineTo(32, 3); g.lineTo(47, 26); g.closePath(); g.fill(); g.fillStyle = '#ffcc66'; g.fillRect(17, 24, 30, 3); g.strokeStyle = '#8a5a30'; g.lineWidth = 2.6; g.beginPath(); g.arc(50, 38, 12, -1.15, 1.15); g.stroke(); g.strokeStyle = '#f4f0e4'; g.lineWidth = 1; g.beginPath(); g.moveTo(50 + Math.cos(-1.15) * 12, 38 + Math.sin(-1.15) * 12); g.lineTo(50 + Math.cos(1.15) * 12, 38 + Math.sin(1.15) * 12); g.stroke(); },
  scouts: g => { g.fillStyle = '#3a8a4a'; g.beginPath(); g.arc(32, 27, 13.5, Math.PI, 0); g.fill(); g.fillRect(18.5, 27, 3.5, 11); g.fillRect(42, 27, 3.5, 11); g.fillStyle = '#f2c14a'; g.beginPath(); g.ellipse(45, 12, 2.6, 9, 0.7, 0, 7); g.fill(); },
  scorpion: g => { g.strokeStyle = '#a0703c'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(8, 58); g.lineTo(50, 16); g.stroke(); g.fillStyle = '#e6ebf0'; g.beginPath(); g.moveTo(54, 12); g.lineTo(46, 14); g.lineTo(52, 20); g.closePath(); g.fill(); g.strokeStyle = '#b4bcc4'; g.lineWidth = 2; g.beginPath(); g.arc(13, 50, 5, 0, 7); g.stroke(); }
};
function typePortrait(g, i, cls) {
  const base = PBASE[cls] || cls, saved = BAN[base]; if (base !== cls && BAN[cls]) BAN[base] = BAN[cls];
  portrait(g, i, base); if (base !== cls) BAN[base] = saved;
  if (PGEAR[cls]) PGEAR[cls](g);
}
const avatar = (i, cls, r) => { const c = cnv(r * 2 + 8, r * 2 + 8, g => { const m = r + 4, ri = r - 1; g.beginPath(); g.arc(m, m, r + 4, 0, 7); g.fillStyle = OL; g.fill(); g.beginPath(); g.arc(m, m, r + 1.5, 0, 7); g.fillStyle = '#d9a441'; g.fill(); g.beginPath(); g.arc(m, m, ri + 1, 0, 7); g.fillStyle = OL; g.fill(); g.save(); g.beginPath(); g.arc(m, m, ri, 0, 7); g.clip(); g.translate(m - ri, m - ri); g.scale(ri * 2 / 64, ri * 2 / 64); typePortrait(g, i, cls); g.restore(); }); c.className = 'av'; return c; };
const icon = (kind, r, enemy) => cnv(r * 2 + 6, r * 2 + 6, g => typeIcon(g, r + 3, r + 3, r, kind, enemy));
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };

function nodeState(id) {
  const cur = S.army[gi];
  if (id === cur) return 'cur';
  if (!unlockedNow(id, S.owned)) return 'lock';
  if (canRetrain(cur, id)) return 'open';
  return 'far';
}
function render() {
  fit();
  $('coins').textContent = S.coins; $('ttl').textContent = S.mode === 'barracks' ? 'Казарма' : S.title;
  $('barracks').hidden = S.mode !== 'barracks'; $('pre').hidden = S.mode !== 'pre';
  if (S.mode === 'barracks' && tutShown && Tutor.active() && !tutBarShown) Tutor.end();
  if (S.mode === 'barracks') renderBarracks(); else renderPre();
  armyTutBar();
}
function renderBarracks() {
  const strip = $('gens'); strip.innerHTML = '';
  S.army.forEach((cls, i) => { const b = el('button', 'gen' + (i === gi ? ' on' : '')); b.type = 'button'; b.append(face(i, cls, 26), icon(TREE_KIND[cls], 9)); b.append(el('b', '', GENS[i]), el('small', '', TREE[cls].name)); b.onclick = () => { gi = i; pick = null; render(); }; strip.append(b); });
  const tree = $('tree'); tree.innerHTML = '';
  const rows = [['Пехота', 'INF', 'hastati', ['principes', 'triarii']], ['Стрелки', 'ARC', 'velites', ['slingers', 'cretans']], ['Конница', 'CAV', 'eques', ['scouts']], ['Особые', 'SPEC', 'eng', ['scorpion']]];
  const root = el('div', 'root'); root.append(nodeBtn('tiro')); root.append(el('span', 'rootcap', 'Новобранцы — начало каждой ветки')); tree.append(root);
  for (const [label, kind, t1, t2] of rows) {
    const row = el('div', 'row'); const cap = el('div', 'cap'); cap.append(icon(kind, 8), el('span', '', label)); row.append(cap);
    const line = el('div', 'line'); line.append(nodeBtn(t1)); const arrow = el('span', 'arr', '→'); line.append(arrow);
    const fork = el('div', 'fork'); t2.forEach(id => fork.append(nodeBtn(id))); line.append(fork); row.append(line); tree.append(row);
  }
  const sel = pick || S.army[gi], st = nodeState(sel), d = TREE[sel];
  $('apic').innerHTML = ''; $('apic').append(thumb(sel, 56, 56)); $('aname').textContent = d.name;
  const short = S.coins < d.cost;
  $('ainfo').textContent = st === 'cur' ? 'Сейчас у ' + GENS[gi] : st === 'lock' ? '🔒 ' + d.unlock.why : st === 'far' ? 'Сначала: ' + (TREE[d.from] ? TREE[d.from].name : 'Новобранцы') : '⊙ ' + d.cost + (short ? ' · не хватает ' + (d.cost - S.coins) : '');
  const go = $('retrain'), gray = st !== 'open' || short; go.classList.toggle('dis', gray); go.setAttribute('aria-disabled', gray ? 'true' : 'false'); go.textContent = !gray ? 'Переобучить' : st === 'cur' ? 'Уже обучены' : 'Нельзя';
  const why = $('why'); why.hidden = true; clearTimeout(whyT); whyText = '';
  if (gray) whyText = '💡 ' + (st === 'cur' ? GENS[gi] + ' уже ведёт «' + d.name + '» — выберите другой отряд в дереве.'
    : st === 'lock' ? d.unlock.why + ' — тогда этот отряд откроется для обучения.'
    : st === 'far' ? 'Переобучать можно только по ветке: сначала обучите «' + (TREE[d.from] ? TREE[d.from].name : 'Новобранцы') + '», затем «' + d.name + '». Новобранцы открывают любую ветку заново.'
    : 'Не хватает ' + (d.cost - S.coins) + ' денариев на обучение «' + d.name + '». Деньги дают победы и награды.');
}
function nodeBtn(id) {
  const st = nodeState(id), d = TREE[id], b = el('button', 'node ' + st + ((pick || S.army[gi]) === id ? ' sel' : '')); b.type = 'button';
  b.append(thumb(id, 70, 70)); const ic = icon(TREE_KIND[id], 8); ic.className = 'ic'; b.append(ic);
  if (st === 'lock') b.append(el('i', 'lk', '🔒')); if (st === 'cur') b.append(el('i', 'who', GENS[gi]));
  b.append(el('b', '', d.name)); b.append(el('small', '', st === 'open' ? '⊙' + d.cost : st === 'lock' ? 'закрыто' : st === 'cur' ? 'сейчас' : ''));
  b.onclick = () => { pick = id; render(); }; b.oncontextmenu = e => { e.preventDefault(); openCard(id); };
  let lt = 0; b.onpointerdown = () => { lt = setTimeout(() => openCard(id), 550); }; b.onpointerup = b.onpointerleave = () => clearTimeout(lt);
  return b;
}
function openCard(id) {
  const d = TREE[id], c = $('card'); c.hidden = false; const box = $('cbody'); box.innerHTML = '';
  const top = el('div', 'ctop'); top.append(squadPic(id, 190, 160)); const side = el('div', 'cside');
  const h = el('h3'); h.append(document.createTextNode(d.name + ' ')); h.append(icon(TREE_KIND[id], 11)); side.append(h);
  side.append(el('p', 'tier', 'ступень ' + d.tier + ' · ' + d.n + ' воинов')); side.append(el('p', 'role', d.role)); top.append(side); box.append(top);
  const stats = el('div', 'stats'); ['⚔ Атака', '🛡 Защита', '👢 Скорость', '🏹 Дальность'].forEach((n, k) => { const r = el('div', 'st'); r.append(el('span', '', n)); const bar = el('span', 'pips'); for (let q = 0; q < 5; q++) bar.append(el('i', q < d.stats[k] ? 'on' : '')); r.append(bar, el('b', '', d.stats[k] + '/5')); stats.append(r); }); box.append(stats);
  const ord = el('div', 'ord'); ord.append(el('span', 'ob', '★')); const ot = el('div'); ot.append(el('b', '', d.order.name), el('p', '', d.order.text + ' · перезарядка ' + d.order.cd + ' с')); ord.append(ot); box.append(ord);
  for (const [lab, list, up] of [['Сильнее против', d.strong, true], ['Слабее против', d.weak, false]]) { if (!list.length) continue; const r = el('div', 'ctr ' + (up ? 'up' : 'down')); r.append(el('span', 'cl', (up ? '▲ ' : '▼ ') + lab)); for (const [n, k] of list) { const t = el('span', 'tag'); if (k !== 'ALL') t.append(icon(k, 8, true)); t.append(el('small', '', n)); r.append(t); } box.append(r); }
}
function renderPre() {
  const rc = $('recon'); rc.innerHTML = '';
  const uniq = [...new Set(S.recon)];
  uniq.forEach(c => { const t = el('div', 'foe'); t.append(thumb(c, 56, 56, true)); const ic = icon(TREE_KIND[c], 8, true); ic.className = 'ic'; t.append(ic); t.append(el('small', '', ENEMY_NAME[c] || c)); rc.append(t); });
  // the advice: the open squad type that beats most of the expected enemies
  let best = null, bs = 0; for (const id of Object.keys(TREE)) { if (!unlockedNow(id, S.owned) || id === 'tiro') continue; const sc = uniq.reduce((a, f) => a + verdict(id, f), 0); if (sc > bs) { bs = sc; best = id; } }
  $('advice').textContent = best ? '💡 ' + TREE[best].name + ' ▲ против: ' + uniq.filter(f => verdict(best, f) > 0).map(f => ENEMY_NAME[f]).join(', ') : '💡 Обычный бой: держите строй';
  const list = $('rows'); list.innerHTML = '';
  S.army.forEach((cls, i) => {
    const r = el('button', 'grow'); r.type = 'button'; r.append(avatar(i, cls, 36));
    const mid = el('div', 'gmid'); const nm = el('div', 'gnm'); nm.append(icon(TREE_KIND[cls], 8), el('b', '', GENS[i] + ' · ' + TREE[cls].name)); mid.append(nm);
    const pros = uniq.filter(f => verdict(cls, f) > 0), cons = uniq.filter(f => verdict(cls, f) < 0);
    if (pros.length) mid.append(el('span', 'bd up', '▲ против: ' + pros.map(f => ENEMY_NAME[f]).join(', ')));
    if (cons.length) mid.append(el('span', 'bd down', '▼ уязвимы: ' + cons.map(f => ENEMY_NAME[f]).join(', ')));
    if (!pros.length && !cons.length) mid.append(el('span', 'bd', TREE[cls].role));
    r.append(squadPic(cls, 96, 84), mid, el('span', 'chev', '›'));
    r.onclick = () => { gi = i; pick = null; S.mode = 'barracks'; S.back = 'pre'; render(); };
    list.append(r);
  });
}
$('retrain').onclick = () => { const id = pick || S.army[gi]; const w = $('why'); if (!id || nodeState(id) !== 'open' || S.coins < TREE[id].cost) { if (whyText) { w.textContent = whyText; w.hidden = false; w.classList.remove('pulse'); void w.offsetWidth; w.classList.add('pulse'); clearTimeout(whyT); whyT = setTimeout(() => { w.hidden = true; }, 5000); } return; } send({ type: 'train', gi, cls: id, cost: TREE[id].cost }); if (!EMBED) { S.coins -= TREE[id].cost; S.army[gi] = id; pick = null; render(); } };
$('info').onclick = () => openCard(pick || S.army[gi]);
$('cclose').onclick = () => { $('card').hidden = true; };
$('close').onclick = () => { if (S.back === 'pre' && S.mode === 'barracks') { S.mode = 'pre'; S.back = null; render(); return; } send({ type: 'close' }); };
$('fight').onclick = () => { if (Tutor.active()) Tutor.end(); send({ type: 'fight', army: S.army }); };
// the first time the pre-battle screen is shown it explains itself: the scouting, the four squads, the button
let tutShown = false, tutBarShown = false;
function armyTutBar() {   // the barracks (opened from a province): the generals, the training tree, the retraining, the denarii
  if (tutBarShown || !S.barTut || S.mode !== 'barracks' || Tutor.active()) return; tutBarShown = true;
  Tutor.start([
    { text: 'Это <b>казарма</b>. Вверху четыре <b>генерала</b>, у каждого свой отряд. Коснитесь генерала, чтобы выбрать его. Коснитесь ряда, чтобы продолжить.', target: () => $('gens'), catch: true },
    { text: 'Ниже <b>древо обучения</b>: пехота, лучники, конница, инженеры. Открытые отряды можно взять, закрытые ждут технологий и построек. Коснитесь древа, чтобы продолжить.', target: () => $('tree'), catch: true },
    { text: 'Здесь выбранный отряд: <b>ⓘ</b> открывает его карточку, а кнопка <b>«Переобучить»</b> меняет отряд генерала за денарии.', target: () => document.querySelector('#barracks .act'), btn: true },
    { text: 'Денарии в углу тратятся на переобучение. Их дают победы, дозоры и события.', target: () => $('coins'), btn: true, last: true }
  ], { end: () => send({ type: 'tutDone', which: 'bar' }) });
}
function armyTut() {
  if (tutShown || !S.tut || S.mode !== 'pre') return; tutShown = true;
  Tutor.start([
    { text: 'Это <b>разведка</b>: какие войска ждут вас в бою. Под ней совет, какой отряд против них сильнее ▲.', target: () => document.querySelector('#pre .rc'), btn: true },
    { text: 'Ваши <b>четыре отряда</b>. Под каждым видно, против кого он силён ▲ и кто его побьёт ▼. Коснитесь отряда, чтобы переобучить его в казарме. Коснитесь списка, чтобы продолжить.', target: () => $('rows'), catch: true },
    { text: 'Готовы? Нажмите <b>«В бой!»</b>.', target: () => $('fight'), real: true, last: true }
  ], { end: () => send({ type: 'tutDone' }) });
}
addEventListener('message', e => { const m = e.data; if (e.source !== parent || !m || !m.legArmy) return; if (m.type === 'init' || m.type === 'state') { Object.assign(S, m.state); if (m.type === 'init') { gi = 0; pick = null; } render(); armyTut(); } });
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load('400 20px "Lilita One"'), document.fonts.load('800 13px "Alegreya Sans"')]).catch(() => 0) : Promise.resolve()).then(() => { fit(); render(); send({ type: 'ready' }); });
