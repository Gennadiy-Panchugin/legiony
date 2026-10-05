// Builds units.html: the new squad roster as UI mockups — barracks tree, squad card, pre-battle assignment, in-battle additions.
// Roster and numbers from the game-designer pass; layout from the UX pass (2026-10-05).
const fs = require('fs'), path = require('path');
const gen = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
const js = gen.slice(gen.indexOf('const js = String.raw`') + 'const js = String.raw`'.length, gen.indexOf('`;\nconst html'));
const helpers = js.slice(0, js.indexOf('function drawWorld(g) {'));
const cas = fs.readFileSync(path.join('..', 'castle', 'castle.html'), 'utf8');
const between = (src, a, b) => src.slice(src.indexOf(a), src.indexOf(b, src.indexOf(a)));
const ban = between(cas, 'const BAN = {', 'const REFILL'), art = between(cas, 'function emblem(g, k, cx, cy, z, col) {', 'function paintRail() {').replace(/\bbanner\(/g, 'cbanner(');
const draw = String.raw`
// ---------------------------------------------------------------- the new soldiers: a plain chibi plus their own gear
const KIND = { rec: 'INF', hastati: 'INF', principes: 'INF', triarii: 'INF', velites: 'ARC', slingers: 'ARC', cretans: 'ARC', eques: 'CAV', scouts: 'CAV', eng: 'SPEC', scorpion: 'SPEC', hoplite: 'INF', ambush: 'INF', e_cav: 'CAV', e_arc: 'ARC', e_inf: 'INF' };
const NAME = { rec: 'Новобранцы', hastati: 'Гастаты', principes: 'Принципы', triarii: 'Триарии', velites: 'Велиты', slingers: 'Пращники', cretans: 'Критяне', eques: 'Всадники', scouts: 'Разведчики', eng: 'Инженеры', scorpion: 'Скорпион', hoplite: 'Фаланга', ambush: 'Засадники', e_cav: 'Конница', e_arc: 'Лучники', e_inf: 'Копейщики' };
function stick(g, x0, y0, x1, y1, col, w) { g.strokeStyle = OL; g.lineWidth = (w || 2.4) + 2.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = col || '#a0703c'; g.lineWidth = w || 2.4; g.stroke(); }
function tip(g, x, y, a) { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, -8); g.lineTo(-3.5, 2); g.lineTo(3.5, 2); g.closePath(); fo(g, '#e6ebf0', 1.8); g.restore(); }
function unit(g, x, y, cls, side, s, face) {
  if (cls === 'tiro') cls = 'rec';
  const base = { principes: 'hastati', triarii: 'hastati', scouts: 'eques', cretans: 'plain', slingers: 'plain', rec: 'plain', ambush: 'plain', hoplite: 'plain', scorpion: 'eng' }[cls] || cls;
  if (cls === 'scorpion') { scorpionEngine(g, x + 16 * s * (face || 1), y, s, face || 1); chibi(g, x - 18 * s * (face || 1), y + 2, 'eng', side, s * 0.85, face); return; }
  chibi(g, x, y, base, side, s, face);
  s = s || 1; face = face || 1; const cav = base === 'eques', by = cav ? -20 : 0, hy = by - 36;
  g.save(); g.translate(x, y); g.scale(s * face, s);
  if (cls === 'rec') { g.beginPath(); g.arc(0, hy - 3, 13.5, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); fo(g, '#9a7a52', 2.2); stick(g, 8, by - 10, 16, by - 34, '#8a5a30', 3.4); }
  if (cls === 'principes') { g.beginPath(); g.ellipse(-1, hy - 18, 4, 10, 0.35, 0, 7); fo(g, '#2b2b2b', 2.2); g.strokeStyle = 'rgba(40,40,40,.45)'; g.lineWidth = 1.2; for (let k = by - 22; k < by - 9; k += 3) { g.beginPath(); g.moveTo(-8, k); g.lineTo(8, k); g.stroke(); } stick(g, 14, by - 6, 22, by - 50, '#a0703c', 2.2); tip(g, 22, by - 52, 0.17); stick(g, 18, by - 6, 27, by - 46, '#a0703c', 2.2); tip(g, 27, by - 48, 0.2); }
  if (cls === 'triarii') { g.beginPath(); g.moveTo(-4, hy - 14); g.quadraticCurveTo(-10, hy - 26, 4, hy - 30); g.quadraticCurveTo(10, hy - 22, 4, hy - 14); g.closePath(); fo(g, '#f4f0e4', 2); stick(g, -6, by - 4, 40, by - 46, '#8a5a30', 2.8); tip(g, 42, by - 48, 0.83); }
  if (cls === 'slingers') { rr(g, -14, hy - 6, 28, 5, 2.5); fo(g, '#f2f0e8', 1.8); g.strokeStyle = OL; g.lineWidth = 2; g.beginPath(); g.moveTo(8, by - 18); g.quadraticCurveTo(26, hy - 26, 2, hy - 30); g.stroke(); g.beginPath(); g.arc(2, hy - 30, 3.4, 0, 7); fo(g, '#b4aa9a', 1.6); rr(g, -14, by - 16, 8, 9, 3); fo(g, '#c8a070', 1.6); }
  if (cls === 'cretans') { g.beginPath(); g.arc(0, hy - 1, 14.5, Math.PI * 0.92, Math.PI * 2.08); g.closePath(); fo(g, '#3a8a4a', 2.4); g.beginPath(); g.arc(14, by - 20, 15, -1.2, 1.2); g.strokeStyle = OL; g.lineWidth = 5; g.stroke(); g.strokeStyle = '#a0703c'; g.lineWidth = 2.6; g.stroke(); rr(g, -16, by - 32, 7, 20, 3); fo(g, '#8a5a30', 1.8); for (const dx of [-15, -12]) { g.fillStyle = '#ff6a3a'; g.beginPath(); g.arc(dx, by - 34, 2.4, 0, 7); g.fill(); } }
  if (cls === 'scouts') { g.beginPath(); g.ellipse(0, hy - 6, 15, 7, 0, Math.PI, 0); fo(g, '#3a8a4a', 2.2); g.beginPath(); g.ellipse(6, hy - 16, 3, 9, 0.6, 0, 7); fo(g, '#f2c14a', 1.8); stick(g, 10, by - 14, 34, by - 34, '#a0703c', 2.2); tip(g, 35, by - 36, 0.9); }
  if (cls === 'hoplite') { g.beginPath(); g.arc(0, hy - 2, 14, Math.PI * 1.0, Math.PI * 2.0); g.lineTo(14, hy + 6); g.lineTo(6, hy + 6); g.lineTo(6, hy - 2); g.lineTo(-6, hy - 2); g.lineTo(-6, hy + 6); g.lineTo(-14, hy + 6); g.closePath(); fo(g, '#d8a84a', 2.4); g.beginPath(); g.moveTo(-14, hy - 12); g.quadraticCurveTo(0, hy - 34, 14, hy - 12); g.lineWidth = 6; g.strokeStyle = OL; g.stroke(); g.lineWidth = 3.6; g.strokeStyle = '#3f7ae0'; g.stroke(); stick(g, 14, by + 2, 14, by - 74, '#a0703c', 2.4); tip(g, 14, by - 78, 0); g.beginPath(); g.arc(6, by - 18, 17, 0, 7); fo(g, '#d8a84a', 2.8); g.beginPath(); g.arc(6, by - 18, 9, 0, 7); fo(g, '#3f7ae0', 2); }
  if (cls === 'ambush') { g.beginPath(); g.moveTo(-15, hy + 6); g.quadraticCurveTo(-16, hy - 20, 0, hy - 22); g.quadraticCurveTo(16, hy - 20, 15, hy + 6); g.lineTo(10, hy + 2); g.quadraticCurveTo(0, hy - 14, -10, hy + 2); g.closePath(); fo(g, '#4a7a2a', 2.4); for (const [dx, dy] of [[-10, -14], [8, -18], [12, -6]]) { g.fillStyle = '#7cc04a'; g.beginPath(); g.ellipse(dx, hy + dy, 5, 3, 0.6, 0, 7); g.fill(); } stick(g, 10, by - 6, 22, by - 50, '#a0703c', 2.2); tip(g, 22, by - 52, 0.25); }
  g.restore();
}
function scorpionEngine(g, x, y, s, face) {
  g.save(); g.translate(x, y); g.scale(s * face, s);
  g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(0, 2, 26, 6, 0, 0, 7); g.fill();
  for (const dx of [-14, 14]) { stick(g, dx, 0, 0, -22, '#8a5a30', 3); }
  rr(g, -26, -30, 52, 9, 3); fo(g, '#9a6234', 2.4);
  g.strokeStyle = OL; g.lineWidth = 4.5; g.beginPath(); g.moveTo(-6, -26); g.quadraticCurveTo(-18, -44, -30, -40); g.moveTo(-6, -26); g.quadraticCurveTo(-18, -10, -30, -14); g.stroke(); g.strokeStyle = '#a0703c'; g.lineWidth = 2.6; g.stroke();
  g.strokeStyle = '#f4f0e4'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(-30, -40); g.lineTo(-30, -14); g.stroke();
  stick(g, -28, -26, 30, -26, '#c48a4a', 2); tip(g, 32, -26, Math.PI / 2);
  g.restore();
}
function squadOf(g, x, y, cls, side, n, s, face) { const pos = [[-16, -6], [16, -6], [0, 4], [-24, 10], [24, 10], [0, -14]].slice(0, n).sort((a, b) => a[1] - b[1]); for (const [dx, dy] of pos) unit(g, x + dx * s, y + dy * s, cls, side, s * 0.62, face); }

// ---------------------------------------------------------------- type icons: frame shape + glyph, readable without colour
function typeIcon(g, x, y, r, kind, enemy) {
  const col = enemy ? '#3f7ae0' : '#e2382c';
  g.beginPath();
  if (kind === 'INF') rr(g, x - r, y - r, r * 2, r * 2, r * 0.3);
  else if (kind === 'ARC') { g.moveTo(x, y - r * 1.15); g.lineTo(x + r * 1.1, y + r * 0.85); g.lineTo(x - r * 1.1, y + r * 0.85); g.closePath(); }
  else if (kind === 'CAV') g.arc(x, y, r, 0, 7);
  else for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; k ? g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  g.closePath(); fo(g, col, Math.max(2, r * 0.16));
  g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineWidth = r * 0.16; const k = r / 14;
  if (kind === 'INF') { g.beginPath(); g.moveTo(x - 7 * k, y - 7 * k); g.lineTo(x + 7 * k, y - 7 * k); g.lineTo(x + 6 * k, y + 2 * k); g.quadraticCurveTo(x, y + 9 * k, x - 6 * k, y + 2 * k); g.closePath(); g.fill(); }
  else if (kind === 'ARC') { g.beginPath(); g.arc(x - 3 * k, y + 2 * k, 7 * k, -1.2, 1.2); g.stroke(); g.beginPath(); g.moveTo(x - 3 * k, y + 2 * k); g.lineTo(x + 7 * k, y + 2 * k); g.stroke(); }
  else if (kind === 'CAV') { g.beginPath(); g.moveTo(x - 6 * k, y + 8 * k); g.lineTo(x - 4 * k, y - 4 * k); g.lineTo(x + 2 * k, y - 8 * k); g.lineTo(x + 8 * k, y - 2 * k); g.lineTo(x + 5 * k, y + 1 * k); g.lineTo(x + 1 * k, y - 1 * k); g.lineTo(x + 2 * k, y + 8 * k); g.closePath(); g.fill(); }
  else { g.beginPath(); g.arc(x, y, 5 * k, 0, 7); g.stroke(); for (let a = 0; a < 6.28; a += 1.047) { g.beginPath(); g.moveTo(x + Math.cos(a) * 6 * k, y + Math.sin(a) * 6 * k); g.lineTo(x + Math.cos(a) * 9 * k, y + Math.sin(a) * 9 * k); g.stroke(); } }
}
function mark(g, x, y, up, r) { r = r || 12; g.beginPath(); if (up) { g.moveTo(x, y - r); g.lineTo(x + r, y + r * 0.7); g.lineTo(x - r, y + r * 0.7); } else { g.moveTo(x, y + r); g.lineTo(x + r, y - r * 0.7); g.lineTo(x - r, y - r * 0.7); } g.closePath(); fo(g, up ? '#ffcc33' : '#ff6a5a', 2.6); }

// ---------------------------------------------------------------- shared phone chrome
const F = (w, s) => w + ' ' + s + 'px "Lilita One", "Alegreya Sans", sans-serif', B = (w, s) => w + ' ' + s + 'px "Alegreya Sans", sans-serif';
function phone(id) { const c = document.getElementById(id), g = c.getContext('2d'); g.scale(2, 2); g.fillStyle = '#3a2414'; g.fillRect(0, 0, 540, 960); const wg = g.createLinearGradient(0, 0, 0, 960); wg.addColorStop(0, '#4a2e18'); wg.addColorStop(1, '#2e1c0e'); g.fillStyle = wg; g.fillRect(0, 0, 540, 960); return g; }
function plateR(g, x, y, w, h, r, col) { rr(g, x, y, w, h, r); g.fillStyle = 'rgba(40,24,14,.94)'; g.fill(); g.lineWidth = 3; g.strokeStyle = col || '#f2c14a'; g.stroke(); }
function yBtn(g, x, y, w, h, t, sub, grey) { rr(g, x, y + 6, w, h, 18); g.fillStyle = grey ? '#555' : '#7a4a1c'; g.fill(); rr(g, x, y, w, h, 18); g.fillStyle = grey ? '#9a9a9a' : '#ffc93c'; g.fill(); g.lineWidth = 3.4; g.strokeStyle = OL; g.stroke(); g.fillStyle = 'rgba(255,255,255,.35)'; rr(g, x + 8, y + 6, w - 16, 14, 7); g.fill(); g.fillStyle = '#3a1e08'; g.textAlign = 'center'; g.font = F(400, sub ? 22 : 26); g.fillText(t, x + w / 2, y + (sub ? h / 2 + 2 : h / 2 + 9)); if (sub) { g.font = B(800, 13); g.fillText(sub, x + w / 2, y + h / 2 + 20); } }
function text(g, t, x, y, font, col, align) { g.font = font; g.fillStyle = col || '#ffe6a8'; g.textAlign = align || 'left'; g.fillText(t, x, y); }
function header(g, title, right) { plateR(g, 8, 8, 524, 56, 16); text(g, title, 26, 46, F(400, 30)); if (right) { rr(g, 380, 18, 140, 36, 18); g.fillStyle = '#5a3a20'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke(); g.beginPath(); g.arc(400, 36, 11, 0, 7); fo(g, '#f2c14a', 2.2); text(g, right, 418, 44, F(400, 20), '#ffe6a8'); } }
function tabs(g, on) { g.fillStyle = '#1e120a'; g.fillRect(0, 876, 540, 84); ['Технологии', 'Казарма', 'Библиотека', 'Наёмники'].forEach((t, i) => { const x = 8 + i * 132; rr(g, x, 890, 124, 52, 14); g.fillStyle = i === on ? '#5a3a20' : '#2e1c0e'; g.fill(); g.lineWidth = 2; g.strokeStyle = i === on ? '#f2c14a' : '#5a3a20'; g.stroke(); text(g, t, x + 62, 922, B(800, 16), i === on ? '#ffe6a8' : '#c9b08a', 'center'); }); }
const GEN = ['Марк', 'Тит', 'Гай', 'Луций'];
function face(g, x, y, r, i, cls) { const pc = document.createElement('canvas'); pc.width = 128; pc.height = 128; const pg = pc.getContext('2d'); pg.scale(2, 2); portrait(pg, i, cls); g.beginPath(); g.arc(x, y, r + 4, 0, 7); g.fillStyle = OL; g.fill(); g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip(); g.drawImage(pc, x - r, y - r, r * 2, r * 2); g.restore(); g.beginPath(); g.arc(x, y, r, 0, 7); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke(); }
function node(g, x, y, cls, state, price) {
  const lock = state === 'lock', grey = lock;
  rr(g, x - 42, y - 42, 84, 84, 18); g.fillStyle = grey ? '#4a3a2c' : state === 'own' ? '#7a5434' : '#5a3a20'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
  if (state === 'open') { rr(g, x - 47, y - 47, 94, 94, 22); g.lineWidth = 4; g.strokeStyle = '#ffcc33'; g.stroke(); }
  if (state === 'cur') { rr(g, x - 47, y - 47, 94, 94, 22); g.lineWidth = 4; g.strokeStyle = '#ff8a6a'; g.stroke(); }
  g.save(); rr(g, x - 40, y - 40, 80, 80, 16); g.clip(); g.fillStyle = grey ? '#6a5a4a' : '#86ce52'; g.fillRect(x - 40, y - 12, 80, 60); if (grey) g.globalAlpha = 0.45; unit(g, x, y + 30, cls, 1, 1.05, 1); g.restore();
  if (lock) { g.save(); g.setLineDash([5, 5]); rr(g, x - 42, y - 42, 84, 84, 18); g.lineWidth = 2; g.strokeStyle = '#c9b08a'; g.stroke(); g.restore(); rr(g, x - 11, y - 6, 22, 18, 4); fo(g, '#c9b08a', 2.4); g.beginPath(); g.arc(x, y - 6, 7, Math.PI, 0); g.lineWidth = 3; g.strokeStyle = OL; g.stroke(); }
  typeIcon(g, x + 32, y + 32, 11, KIND[cls]);
  if (state === 'own') { g.beginPath(); g.arc(x - 32, y - 32, 12, 0, 7); fo(g, '#7ee05a', 2.4); g.strokeStyle = OL; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 38, y - 32); g.lineTo(x - 33, y - 27); g.lineTo(x - 26, y - 37); g.stroke(); }
  text(g, NAME[cls], x, y + 60, F(400, 16), lock ? '#a89478' : '#ffe6a8', 'center');
  if (price) text(g, price, x, y + 78, B(800, 14), state === 'open' ? '#ffcc33' : '#a89478', 'center');
}
function link(g, x0, y0, x1, y1, on) { g.lineCap = 'round'; g.strokeStyle = OL; g.lineWidth = 10; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = on ? '#ffcc33' : '#8a6a4a'; g.lineWidth = 5; g.stroke(); }

// ---------------------------------------------------------------- A. barracks: generals strip + training tree + action panel
function screenA() {
  const g = phone('sa'); header(g, 'Казарма', '640');
  const cur = ['triarii', 'velites', 'eques', 'eng'];
  GEN.forEach((n, i) => { const x = 14 + i * 130; rr(g, x, 72, 122, 100, 16); g.fillStyle = i === 0 ? '#6a4626' : '#4a2e18'; g.fill(); g.lineWidth = i === 0 ? 4 : 2.4; g.strokeStyle = i === 0 ? '#ffcc33' : OL; g.stroke();
    face(g, x + 40, 112, 28, i, cur[i] === 'triarii' ? 'hastati' : cur[i]); typeIcon(g, x + 62, 132, 11, KIND[cur[i]]); text(g, n, x + 92, 104, F(400, 18), '#ffe6a8', 'center'); text(g, NAME[cur[i]], x + 61, 162, B(800, 13), '#e2c9a0', 'center');
    if (i === 2) { g.beginPath(); g.arc(x + 40, 112, 31, -Math.PI / 2, -Math.PI / 2 + 4.2); g.strokeStyle = '#ffcc33'; g.lineWidth = 5; g.stroke(); text(g, '⏳ 01:24', x + 92, 128, B(800, 14), '#ffcc33', 'center'); } });
  // the root column and the branches
  rr(g, 14, 186, 80, 590, 18); g.fillStyle = '#5a3a20'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
  g.save(); rr(g, 18, 300, 72, 120, 14); g.clip(); g.fillStyle = '#86ce52'; g.fillRect(18, 340, 72, 80); unit(g, 54, 410, 'rec', 1, 1.1, 1); g.restore();
  text(g, 'Ново-', 54, 448, F(400, 17), '#ffe6a8', 'center'); text(g, 'бранцы', 54, 468, F(400, 17), '#ffe6a8', 'center'); text(g, 'найм 60', 54, 490, B(800, 13), '#e2c9a0', 'center'); typeIcon(g, 54, 520, 12, 'INF');
  const rows = [[250, 'Пехота', 'INF', 'hastati', [['principes', 'open', '⊙350 · 5 мин'], ['triarii', 'cur', '']]], [420, 'Стрелки', 'ARC', 'velites', [['slingers', 'open', '⊙350 · 5 мин'], ['cretans', 'lock', 'нужен порт']]],
    [580, 'Конница', 'CAV', 'eques', [['scouts', 'lock', 'откроется в Самнии']]], [720, 'Особые', 'SPEC', 'eng', [['scorpion', 'lock', 'Мастерская II']]]];
  for (const [y, label, kind, t1, t2] of rows) {
    const mid = t2.length === 2 ? [y - 52, y + 52] : [y];
    link(g, 94, y, 170, y, true); mid.forEach((yy, k) => link(g, 212, y, 380, yy, t2[k][1] === 'cur'));
    typeIcon(g, 126, y - 54, 10, kind); text(g, label, 142, y - 49, B(800, 15), '#e2c9a0');
    node(g, 220, y, t1, 'own', ''); mid.forEach((yy, k) => node(g, 400, yy, t2[k][0], t2[k][1], t2[k][2]));
  }
  // Марк's ribbon over his current node
  rr(g, 444, 170, 82, 30, 15); g.fillStyle = '#e2382c'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = OL; g.stroke(); text(g, 'Марк', 485, 191, F(400, 15), '#fff', 'center');
  // action panel
  plateR(g, 8, 794, 524, 76, 18); g.save(); rr(g, 20, 804, 56, 56, 12); g.clip(); g.fillStyle = '#86ce52'; g.fillRect(20, 804, 56, 56); unit(g, 48, 856, 'principes', 1, 0.8, 1); g.restore();
  text(g, 'Принципы', 88, 826, F(400, 20)); text(g, '⊙ 350   ⏳ 5 мин', 88, 850, B(800, 15), '#e2c9a0');
  yBtn(g, 330, 802, 190, 58, 'Переобучить'); tabs(g, 1);
}

// ---------------------------------------------------------------- B. squad card as a bottom sheet over the barracks
function stars(g, x, y, n) { for (let k = 0; k < 5; k++) { rr(g, x + k * 26, y, 22, 18, 5); g.fillStyle = k < n ? '#ffcc33' : '#3a2414'; g.fill(); g.lineWidth = 2; g.strokeStyle = OL; g.stroke(); } }
function screenB() {
  const g = phone('sb'); header(g, 'Казарма', '640'); g.fillStyle = 'rgba(10,5,2,.6)'; g.fillRect(0, 72, 540, 900);
  rr(g, 0, 200, 540, 790, 30); const sg = g.createLinearGradient(0, 200, 0, 960); sg.addColorStop(0, '#5a3a20'); sg.addColorStop(1, '#3a2414'); g.fillStyle = sg; g.fill(); g.lineWidth = 3; g.strokeStyle = '#f2c14a'; g.stroke();
  rr(g, 240, 212, 60, 6, 3); g.fillStyle = '#c9b08a'; g.fill(); g.beginPath(); g.arc(500, 240, 22, 0, 7); fo(g, '#5a3a20', 2.6); text(g, '✕', 500, 248, F(400, 22), '#ffe6a8', 'center');
  g.save(); rr(g, 18, 236, 220, 196, 18); g.clip(); g.fillStyle = '#9ad660'; g.fillRect(18, 236, 220, 196); grass(g, 18, 330, 220, 110, '#86ce52', rng(3)); squadOf(g, 128, 410, 'triarii', 1, 5, 2, 1); g.restore(); rr(g, 18, 236, 220, 196, 18); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
  text(g, 'Триарии', 254, 280, F(400, 34)); typeIcon(g, 482, 270, 15, 'INF');
  for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(262 + k * 22, 304, 7, 0, 7); fo(g, k < 2 ? '#ffcc33' : '#3a2414', 2); } text(g, 'ступень 2 из 2', 334, 309, B(800, 14), '#e2c9a0');
  text(g, 'Якорь против конницы:', 254, 344, B(800, 18), '#fff3dc'); text(g, 'встают стеной копий', 254, 368, B(800, 18), '#fff3dc');
  text(g, '6 воинов', 254, 404, B(800, 16), '#e2c9a0'); for (let k = 0; k < 6; k++) unit(g, 260 + k * 22, 428, 'triarii', 1, 0.4, 1);
  [['⚔', 'Атака', 3], ['🛡', 'Защита', 5], ['👢', 'Скорость', 1], ['🏹', 'Дальность', 1]].forEach(([ic, n, v], i) => { const y = 452 + i * 38; text(g, ic, 24, y + 20, '22px sans-serif', '#fff', 'left'); text(g, n, 58, y + 20, B(800, 18), '#fff3dc'); stars(g, 200, y + 4, v); text(g, v + '/5', 340, y + 20, F(400, 18)); });
  // the special order
  plateR(g, 16, 610, 508, 92, 20); g.beginPath(); g.arc(64, 656, 34, 0, 7); fo(g, '#ffc93c', 3.4); g.beginPath(); g.arc(64, 656, 38, 0, 7); g.lineWidth = 3; g.strokeStyle = '#ffcc33'; g.stroke();
  for (let a = -2.6; a <= -0.5; a += 0.42) stick(g, 64, 668, 64 + Math.cos(a) * 26, 668 + Math.sin(a) * 26, '#8a5a30', 2);
  text(g, 'Ёж', 114, 646, F(400, 24)); text(g, 'Конница ×2 урона и стоп на 2 с,', 114, 672, B(800, 16), '#fff3dc'); text(g, 'сам отряд не двигается', 114, 692, B(800, 16), '#fff3dc'); text(g, '⏱ 20 с', 510, 646, B(800, 16), '#e2c9a0', 'right');
  // counters: icons, not text walls
  text(g, 'Сильнее против', 24, 736, B(800, 17), '#ffcc33'); mark(g, 196, 730, true, 11);
  [['e_cav', 'Конница'], ['hoplite', 'Колесницы'], ['ambush', 'Слоны']].forEach(([c, n], i) => { const x = 250 + i * 92; g.beginPath(); g.arc(x, 730, 26, 0, 7); fo(g, '#fff', 2.6); typeIcon(g, x, 730, 15, i === 0 ? 'CAV' : 'SPEC', true); text(g, n, x, 772, B(800, 13), '#e2c9a0', 'center'); });
  text(g, 'Слабее против', 24, 812, B(800, 17), '#ff8a7a'); mark(g, 196, 806, false, 11);
  [['Пращники', 'ARC'], ['Лучники', 'ARC']].forEach(([n, k], i) => { const x = 250 + i * 92; g.beginPath(); g.arc(x, 806, 26, 0, 7); fo(g, '#fff', 2.6); typeIcon(g, x, 806, 15, k, true); text(g, n, x, 848, B(800, 13), '#e2c9a0', 'center'); });
  yBtn(g, 120, 870, 300, 64, 'Назначить Марку');
}

// ---------------------------------------------------------------- C. before the battle: scouting report + four generals
function screenC() {
  const g = phone('sc'); header(g, '← Горный перевал', '');
  plateR(g, 8, 72, 524, 150, 18); text(g, 'Разведка: кого ждать', 24, 102, F(400, 20));
  [['hoplite', 'много'], ['e_arc', 'много'], ['ambush', 'мало'], ['e_cav', 'мало']].forEach(([c, n], i) => { const x = 60 + i * 112; g.save(); rr(g, x - 30, 114, 60, 60, 12); g.clip(); g.fillStyle = '#86ce52'; g.fillRect(x - 30, 114, 60, 60); unit(g, x, 172, c, 2, 0.75, -1); g.restore(); rr(g, x - 30, 114, 60, 60, 12); g.lineWidth = 2.4; g.strokeStyle = '#3f7ae0'; g.stroke(); typeIcon(g, x + 26, 118, 10, KIND[c], true); text(g, NAME[c] + ' · ' + n, x, 192, B(800, 13), '#b8d0ff', 'center'); });
  text(g, '💡 Пращники ▲ против Фаланги и Лучников', 24, 214, B(800, 15), '#ffe6a8');
  const pick = [['triarii', '▲ против Конницы', true], ['slingers', '▲ против Фаланги', true], ['eques', '▲ против Лучников', true], ['eng', '', null]];
  GEN.forEach((n, i) => { const y = 236 + i * 138, [cls, badge, up] = pick[i];
    rr(g, 8, y, 524, 128, 20); g.fillStyle = '#4a2e18'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = OL; g.stroke();
    face(g, 60, y + 52, 36, i, cls === 'triarii' ? 'hastati' : cls === 'slingers' ? 'velites' : cls); text(g, n, 60, y + 116, F(400, 18), '#ffe6a8', 'center');
    g.save(); rr(g, 112, y + 12, 104, 104, 14); g.clip(); g.fillStyle = '#86ce52'; g.fillRect(112, y + 12, 104, 104); squadOf(g, 164, y + 96, cls, 1, 4, 0.75, 1); g.restore(); rr(g, 112, y + 12, 104, 104, 14); g.lineWidth = 2.4; g.strokeStyle = OL; g.stroke();
    typeIcon(g, 238, y + 30, 11, KIND[cls]); text(g, NAME[cls], 256, y + 37, F(400, 20));
    const st = { triarii: [3, 5, 1, 1], slingers: [2, 1, 3, 5], eques: [4, 3, 5, 1], eng: [1, 2, 3, 1] }[cls];
    ['А', 'З', 'С', 'Д'].forEach((l, k) => { text(g, l, 238 + k * 52, y + 66, B(800, 14), '#e2c9a0'); for (let q = 0; q < 5; q++) { rr(g, 252 + k * 52 + q * 7, y + 56, 5, 12, 2); g.fillStyle = q < st[k] ? '#ffcc33' : '#2e1c0e'; g.fill(); } });
    if (badge) { rr(g, 238, y + 82, 200, 32, 16); g.fillStyle = 'rgba(255,204,51,.18)'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#ffcc33'; g.stroke(); text(g, badge, 338, y + 104, B(800, 15), '#ffcc33', 'center'); }
    else text(g, 'чинит ворота, поднимает решётку', 238, y + 104, B(800, 14), '#c9b08a');
    text(g, '›', 510, y + 74, F(400, 34), '#c9b08a', 'center'); });
  yBtn(g, 110, 800, 320, 70, 'В бой!');
}

// ---------------------------------------------------------------- D. in battle: type badges, the special order button, enemy banners with ▲/▼
function screenD() {
  const c = document.getElementById('sd'), g = c.getContext('2d'); g.scale(2, 2); const r = rng(7);
  grass(g, 0, 0, 540, 960, '#76c64a', r); path(g, [[300, 960], [300, 600], [280, 300], [300, 0]], 40); grove(g, 90, 520, 70, 50, 7, 3);
  // enemies with type banners; triarii are selected, so cavalry is marked ▲ and the slingers ▼
  const foes = [['e_cav', 380, 360, true], ['hoplite', 220, 300, null], ['slingers', 420, 520, false]];
  for (const [cls, x, y, up] of foes) { squadOf(g, x, y, cls === 'slingers' ? 'e_arc' : cls, 2, 4, 1, -1); stick(g, x + 34, y + 10, x + 34, y - 56, '#8a5a30', 2.6); rr(g, x + 34, y - 56, 34, 40, 4); fo(g, '#3f7ae0', 2.4); typeIcon(g, x + 51, y - 37, 11, KIND[cls === 'slingers' ? 'e_arc' : cls], true); if (up !== null) mark(g, x + 51, y - 78, up, 14); }
  g.save(); g.beginPath(); g.ellipse(300, 690, 48, 22, 0, 0, 7); g.strokeStyle = OL; g.lineWidth = 7; g.stroke(); g.strokeStyle = '#ffcc33'; g.lineWidth = 4; g.stroke(); g.restore();
  squadOf(g, 300, 690, 'triarii', 1, 5, 1, 1);
  // a mini card from a long press on the cavalry
  plateR(g, 330, 220, 196, 92, 14, '#3f7ae0'); typeIcon(g, 354, 248, 12, 'CAV', true); text(g, 'Конница · 5', 374, 254, F(400, 17)); text(g, '▲ бьёт стрелков', 346, 280, B(800, 14), '#ffcc33'); text(g, '▼ боится Ежа', 346, 300, B(800, 14), '#ff8a7a');
  // top bar and the rail
  plateR(g, 8, 8, 524, 64, 18); text(g, 'ТИБУР', 26, 40, F(400, 22)); text(g, 'Храм Весты · 1:12', 28, 60, B(700, 13), '#f2c14a');
  const cls = ['triarii', 'slingers', 'eques', 'eng'];
  cls.forEach((k, i) => { const y = 130 + i * 86; face(g, 46, y, 30, i, k === 'triarii' ? 'hastati' : k === 'slingers' ? 'velites' : k); g.beginPath(); g.arc(46, y, 36, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * [0.9, 0.7, 1, 1][i]); g.strokeStyle = '#7ee05a'; g.lineWidth = 5; g.stroke();
    if (i === 0) { g.beginPath(); g.arc(46, y, 41, 0, 7); g.strokeStyle = '#ffcc33'; g.lineWidth = 4; g.stroke(); }
    typeIcon(g, 70, y + 22, 11, KIND[k]); if (i !== 1) { g.beginPath(); g.arc(70, y - 24, 7, 0, 7); fo(g, '#ffcc33', 2); } });
  // the bottom bar: squad name, ordinary orders, one round special order, speed
  const bg = g.createLinearGradient(0, 868, 0, 960); bg.addColorStop(0, '#4a2e18'); bg.addColorStop(1, '#2e1c0e'); g.fillStyle = bg; g.fillRect(0, 868, 540, 92); g.fillStyle = '#f2c14a'; g.fillRect(0, 868, 540, 3);
  text(g, 'Марк · Триарии', 18, 892, B(800, 16), '#e2c9a0');
  [['Стоять', 'держать место'], ['Отход', 'к палаткам']].forEach(([t, s], i) => yBtn(g, 18 + i * 132, 900, 122, 48, t, s));
  g.beginPath(); g.arc(352, 912, 38, 0, 7); fo(g, '#ffc93c', 3.4); g.beginPath(); g.arc(352, 912, 43, 0, 7); g.lineWidth = 4; g.strokeStyle = '#ffcc33'; g.stroke();
  for (let a = -2.6; a <= -0.5; a += 0.42) stick(g, 352, 926, 352 + Math.cos(a) * 26, 926 + Math.sin(a) * 26, '#8a5a30', 2); typeIcon(g, 382, 884, 10, 'INF'); text(g, 'Ёж', 352, 948, F(400, 15), '#3a1e08', 'center');
  g.beginPath(); g.arc(486, 912, 34, 0, 7); fo(g, '#5a3a20', 3.4); text(g, '⏩', 486, 908, '22px sans-serif', '#ffe6a8', 'center'); text(g, '×1', 486, 932, F(400, 16), '#ffe6a8', 'center');
}
// ---------------------------------------------------------------- the roster sheet
function roster() {
  const c = document.getElementById('roster'), g = c.getContext('2d'); g.scale(2, 2); grass(g, 0, 0, 1080, 300, '#76c64a', rng(9));
  const list = ['rec', 'hastati', 'principes', 'triarii', 'velites', 'slingers', 'cretans', 'eques', 'scouts', 'eng', 'scorpion'];
  list.forEach((cls, i) => { const x = 50 + i * 90, y = 150; unit(g, x, y, cls, 1, 1.5, 1); typeIcon(g, x, y + 24, 10, KIND[cls]); text(g, NAME[cls], x, y + 56, F(400, 15), '#fff', 'center'); });
  [['hoplite', 330], ['ambush', 420], ['e_inf', 510], ['e_arc', 600], ['e_cav', 690]].forEach(([cls, x]) => { const y = 272; unit(g, x + 150, y - 6, cls, 2, 1.1, -1); });
  text(g, 'Враги первой партии:', 210, 270, F(400, 18), '#fff', 'left');
}
const go = () => { screenA(); screenB(); screenC(); screenD(); roster(); };
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load('400 20px "Lilita One"'), document.fonts.load('800 13px "Alegreya Sans"')]).catch(() => 0) : Promise.resolve()).then(go);
`;
const html = `<title>Отряды и казарма</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Alegreya+Sans:wght@500;700;800;900&display=swap">
<style>
  :root { --bg: #2a1a10; --ink: #fff3dc; --muted: #e2c9a0; --gold: #f2c14a; --display: 'Lilita One', 'Alegreya Sans', sans-serif; --body: 'Alegreya Sans', system-ui, sans-serif; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.45; }
  .wrap { max-width: 1240px; margin: 0 auto; padding: 28px 16px 56px; }
  h1 { font-family: var(--display); font-weight: 400; font-size: 40px; line-height: 1.05; margin: 0 0 10px; color: #ffe6a8; }
  h2 { font-family: var(--display); font-weight: 400; font-size: 22px; margin: 0 0 6px; color: #ffe6a8; }
  p, li { color: var(--muted); } b { color: var(--ink); } p { margin: 0 0 12px; max-width: 860px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 18px; margin: 18px 0; }
  .phone { border-radius: 26px; overflow: hidden; border: 4px solid #1a0e06; box-shadow: 0 14px 34px rgba(0,0,0,.5); line-height: 0; }
  canvas { display: block; width: 100%; height: auto; }
  figure { margin: 0; } figcaption { margin-top: 8px; font-size: 14px; color: var(--muted); line-height: 1.35; } figcaption b { display: block; font: 400 18px var(--display); color: #ffe6a8; }
  .sheet { border-radius: 18px; overflow: hidden; border: 4px solid #1a0e06; line-height: 0; margin: 8px 0 18px; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; } td, th { border-bottom: 1px solid #5a3a20; padding: 6px 8px; text-align: left; vertical-align: top; color: var(--muted); } th { color: #ffe6a8; font-family: var(--display); font-weight: 400; }
  .cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; } @media (max-width: 860px) { .cols { grid-template-columns: minmax(0, 1fr); } }
</style>
<div class="wrap">
  <h1>Отряды и казарма</h1>
  <p>Макет от геймдизайнера и UX-дизайнера. Каждый отряд начинает <b>новобранцами</b> и переучивается в казарме в одну из четырёх веток. <b>Род войск читается формой рамки</b>, а не только цветом: квадрат — пехота, треугольник — стрелки, круг — конница, шестиугольник — особые. ▲ — сильнее против, ▼ — слабее против.</p>
  <div class="sheet"><canvas id="roster" width="2160" height="600" aria-label="Все новые отряды"></canvas></div>
  <div class="grid">
    <figure><div class="phone"><canvas id="sa" width="1080" height="1920" aria-label="Казарма"></canvas></div><figcaption><b>A. Казарма</b>Генералы сверху (Гай на обучении, 01:24). Дерево: от новобранцев четыре ветки, у пехоты и стрелков развилка. Золотая рамка — можно учить, пунктир и замок — закрыто, оранжевая — текущий отряд Марка.</figcaption></figure>
    <figure><div class="phone"><canvas id="sb" width="1080" height="1920" aria-label="Карточка отряда"></canvas></div><figcaption><b>B. Карточка отряда</b>Шторка снизу: отряд, роль одной строкой, четыре характеристики, особый приказ с перезарядкой, контры иконками.</figcaption></figure>
    <figure><div class="phone"><canvas id="sc" width="1080" height="1920" aria-label="Выбор перед боем"></canvas></div><figcaption><b>C. Перед боем</b>Разведка показывает, кого ждать. У каждого генерала его отряд и значок ▲, если он хорош против ожидаемых врагов.</figcaption></figure>
    <figure><div class="phone"><canvas id="sd" width="1080" height="1920" aria-label="В бою"></canvas></div><figcaption><b>D. В бою</b>Бейдж рода на портрете, искра — приказ готов. Внизу одна круглая кнопка особого приказа. Над врагами знамя с родом, при выбранных триариях ▲ над конницей и ▼ над стрелками.</figcaption></figure>
  </div>
  <div class="cols">
    <section><h2>Дерево обучения (11 отрядов)</h2>
      <table><tr><th>Отряд</th><th>Из кого · цена</th><th>Приказ</th></tr>
        <tr><td><b>Новобранцы</b></td><td>найм 60</td><td>Сомкнуть ряды: −25% урона 6 с</td></tr>
        <tr><td><b>Гастаты</b></td><td>Новобранцы · 120</td><td>Черепаха: −50% от стрел</td></tr>
        <tr><td><b>Принципы</b></td><td>Гастаты · 350</td><td>Пилумы: ×1,5, снимают строй</td></tr>
        <tr><td><b>Триарии</b></td><td>Гастаты · 450</td><td>Ёж: конница ×2 и стоп 2 с</td></tr>
        <tr><td><b>Велиты</b></td><td>Новобранцы · 120</td><td>Двойной залп</td></tr>
        <tr><td><b>Пращники</b></td><td>Велиты · 350</td><td>Камень в шлем: оглушение 3 с</td></tr>
        <tr><td><b>Критяне</b></td><td>Велиты · 500, порт</td><td>Огненные стрелы: поджог рощи, ворот</td></tr>
        <tr><td><b>Всадники</b></td><td>Новобранцы · 200, конюшня</td><td>Клин: ×1,6, сквозь строй</td></tr>
        <tr><td><b>Разведчики</b></td><td>Всадники · 400, Самний</td><td>Разведка: открыть засады 8 с</td></tr>
        <tr><td><b>Инженеры</b></td><td>Новобранцы · 180, мастерская</td><td>Мост, ворота, ловушка</td></tr>
        <tr><td><b>Скорпион</b></td><td>Инженеры · 550</td><td>Пробой: болт сквозь 4 цели</td></tr>
      </table></section>
    <section><h2>Решения команды</h2>
      <ul>
        <li><b>Знаменосец</b> стал перком генерала «Орёл»: раз за бой 10 с без бегства и +20% к удару.</li>
        <li><b>Капсарии</b> стали постройкой «Валетудинарий»: палатки лечат на 40% быстрее.</li>
        <li><b>Принципы и Триарии</b> — развилка от Гастатов, а не цепочка.</li>
        <li>В бою <b>4 отряда, не больше одного особого</b>, у каждого <b>одна кнопка приказа</b>.</li>
        <li>У каждого врага <b>одна слабость, видная силуэтом</b>: щит фаланги спереди, капюшон засадника в листве.</li>
      </ul>
      <h2>Нужно решить вам</h2>
      <ul>
        <li>Время обучения — минуты реального времени или ходы кампании?</li>
        <li>Сгорает ли опыт при смене ветки?</li>
        <li>Отряд навсегда привязан к своему генералу или их можно менять местами перед боем?</li>
        <li>Критяне — в казарме или во вкладке «Наёмники»?</li>
      </ul></section>
  </div>
</div>
<script>
'use strict';
${helpers}
${ban}
${art}
${draw}
</script>
`;
fs.writeFileSync(path.join(__dirname, 'units.html'), html);
console.log('ok', html.length);
