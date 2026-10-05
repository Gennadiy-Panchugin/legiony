// The barracks and the pre-battle screen, opened by the main game over its map (window.name 'legarmy').
// The main game owns the denarii and the army; this page asks it to retrain and to start the fight.
const $ = id => document.getElementById(id);
const EMBED = window.name === 'legarmy';
const GENS = ['Марк', 'Тит', 'Гай', 'Луций'];
let S = { mode: 'barracks', coins: 640, army: ARMY_DEFAULT.slice(), owned: ['rome', 'veii'], recon: ['hoplite', 'e_arc', 'ambush', 'e_cav'], title: 'Горный перевал', training: null };
let gi = 0, pick = null;
function fit() { const k = Math.max(0.3, Math.min(innerWidth / 540, innerHeight / 960, 1.2)); $('board').style.transform = 'scale(' + k + ')'; $('fit').style.width = 540 * k + 'px'; $('fit').style.height = 960 * k + 'px'; }
addEventListener('resize', fit);
const send = m => { if (EMBED) parent.postMessage(Object.assign({ legArmy: true }, m), '*'); };

// small canvases: a soldier, a squad, a portrait, a type icon
function cnv(w, h, drawFn) { const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; const g = c.getContext('2d'); g.scale(2, 2); drawFn(g); c.style.width = w + 'px'; c.style.height = h + 'px'; return c; }
const thumb = (cls, w, h, enemy) => cnv(w, h, g => { grass(g, 0, 0, w, h, '#86ce52', rng(cls.length * 7)); unit(g, w / 2, h - 10, cls, enemy ? 2 : 1, h / 70, enemy ? -1 : 1); });
const squadPic = (cls, w, h) => cnv(w, h, g => { grass(g, 0, 0, w, h, '#86ce52', rng(cls.length * 5)); squadOf(g, w / 2, h - 22, cls, 1, 5, h / 110, 1); });
const face = (i, cls, r) => cnv(r * 2, r * 2, g => { g.save(); g.beginPath(); g.arc(r, r, r, 0, 7); g.clip(); g.scale(r / 32, r / 32); portrait(g, i, cls); g.restore(); });
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
  if (S.mode === 'barracks') renderBarracks(); else renderPre();
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
  const go = $('retrain'); go.disabled = st !== 'open' || short; go.textContent = st === 'open' && !short ? 'Переобучить' : st === 'cur' ? 'Уже обучены' : 'Нельзя';
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
    const r = el('button', 'grow'); r.type = 'button'; r.append(face(i, cls, 34));
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
$('retrain').onclick = () => { const id = pick; if (!id || nodeState(id) !== 'open') return; send({ type: 'train', gi, cls: id, cost: TREE[id].cost }); if (!EMBED) { S.coins -= TREE[id].cost; S.army[gi] = id; pick = null; render(); } };
$('info').onclick = () => openCard(pick || S.army[gi]);
$('cclose').onclick = () => { $('card').hidden = true; };
$('close').onclick = () => { if (S.back === 'pre' && S.mode === 'barracks') { S.mode = 'pre'; S.back = null; render(); return; } send({ type: 'close' }); };
$('fight').onclick = () => send({ type: 'fight', army: S.army });
addEventListener('message', e => { const m = e.data; if (e.source !== parent || !m || !m.legArmy) return; if (m.type === 'init' || m.type === 'state') { Object.assign(S, m.state); if (m.type === 'init') { gi = 0; pick = null; } render(); } });
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load('400 20px "Lilita One"'), document.fonts.load('800 13px "Alegreya Sans"')]).catch(() => 0) : Promise.resolve()).then(() => { fit(); render(); send({ type: 'ready' }); });
