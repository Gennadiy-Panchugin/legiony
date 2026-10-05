// Heat as a sixth weather; the Colosseum and the rebellion become wave defence (Bad North style).
const fs = require('fs'), path = require('path');
let t = fs.readFileSync(path.join(__dirname, 'extras.js'), 'utf8');
function rep(a, b) { if (!t.includes(a)) { console.error('MISS', a.slice(0, 70)); process.exit(1); } t = t.replace(a, () => b); }
// helpers: heat, wave markers
rep("function torch(g, x, y) {", String.raw`function heat(g, w, h, r) {
  g.fillStyle = 'rgba(255,190,80,.22)'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) { const x = r() * w, y = 120 + r() * (h - 140); g.strokeStyle = 'rgba(140,90,30,.55)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8, y + 4); g.lineTo(x + 4, y + 10); g.moveTo(x + 8, y + 4); g.lineTo(x + 16, y + 2); g.stroke(); }
  g.strokeStyle = 'rgba(255,240,200,.55)'; g.lineWidth = 2; for (let k = 0; k < 9; k++) { const y = 70 + k * 36; g.beginPath(); for (let x = 0; x <= w; x += 10) g.lineTo(x, y + Math.sin(x * 0.08 + k) * 3); g.stroke(); }
  const sg = g.createRadialGradient(w - 40, 30, 4, w - 40, 30, 120); sg.addColorStop(0, 'rgba(255,250,200,.95)'); sg.addColorStop(0.25, 'rgba(255,220,120,.55)'); sg.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = sg; g.fillRect(0, 0, w, h);
  g.beginPath(); g.arc(w - 40, 30, 18, 0, 7); fo(g, '#ffe04a', 2.6);
}
function waveIn(g, x, y, ang, label) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); g.moveTo(-34, -10); g.lineTo(6, -10); g.lineTo(6, -20); g.lineTo(28, 0); g.lineTo(6, 20); g.lineTo(6, 10); g.lineTo(-34, 10); g.closePath(); fo(g, 'rgba(255,74,58,.9)', 2.6);
  g.restore(); g.beginPath(); g.arc(x - Math.cos(ang) * 46, y - Math.sin(ang) * 46, 15, 0, 7); fo(g, '#ff4a3a', 2.8); g.fillStyle = '#fff'; g.font = '900 18px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText('!', x - Math.cos(ang) * 46, y - Math.sin(ang) * 46 + 6);
  if (label) { g.font = '900 12px "Lilita One", sans-serif'; const lx = x - Math.cos(ang) * 46, ly = y - Math.sin(ang) * 46 + 30; const tw = g.measureText(label).width + 12; rr(g, lx - tw / 2, ly - 12, tw, 18, 9); g.fillStyle = 'rgba(40,24,14,.9)'; g.fill(); g.fillStyle = '#ffb0a6'; g.fillText(label, lx, ly + 2); }
}
function waveBar(g, cx, y, n, of, sub) {
  rr(g, cx - 120, y, 240, 48, 16); g.fillStyle = 'rgba(40,24,14,.94)'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = '#ff8a6a'; g.stroke();
  g.fillStyle = '#ffe6a8'; g.font = '900 16px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText('Волна ' + n + ' из ' + of, cx, y + 20);
  for (let k = 0; k < of; k++) { g.beginPath(); g.arc(cx - (of - 1) * 11 + k * 22, y + 34, 7, 0, 7); fo(g, k < n - 1 ? '#7ee05a' : k === n - 1 ? '#ffcc33' : '#5a3a20', 2); }
  if (sub) { g.font = '800 11px "Alegreya Sans", sans-serif'; g.fillStyle = '#e2c9a0'; g.fillText(sub, cx, y + 62); }
}
function gate(g, x, y, open) { rr(g, x - 20, y - 24, 40, 30, 10); fo(g, open ? '#1a0e06' : '#6a4020', 2.6); if (!open) { g.strokeStyle = OL; g.lineWidth = 2; for (const dx of [-10, 0, 10]) { g.beginPath(); g.moveTo(x + dx, y - 22); g.lineTo(x + dx, y + 4); g.stroke(); } } }
function torch(g, x, y) {`);
// the Colosseum: defend the centre against waves from the gates
rep("{ const { g, r } = pnl('ar2', 340, 420, 67); arena(g, 170, 240, 120, 82, r); squad(g, 150, 250, 'hastati', 1, 3, 0.85, '#e2382c', 'vex'); squad(g, 210, 230, 'e_inf', 2, 2, 0.8, '#3f7ae0', 'vex');\n  for (const [x, y] of [[60, 150], [280, 160], [90, 320], [260, 330]]) { g.font = '900 18px sans-serif'; g.textAlign = 'center'; g.fillText('👏', x, y); }\n  rr(g, 40, 40, 260, 56, 16); g.fillStyle = 'rgba(40,24,14,.94)'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = '#f2c14a'; g.stroke(); g.fillStyle = '#ffe6a8'; g.font = '900 15px \"Lilita One\", sans-serif'; g.textAlign = 'center'; g.fillText('Милость толпы', 170, 60); meter(g, 170, 68, 220, 0.7, '70%');\n  plate(g, 170, 404, '👍 Зрелище', 'эффектный бой — бонусы от толпы', '#f2c14a'); }",
String.raw`{ const { g, r } = pnl('ar2', 340, 420, 67); arena(g, 170, 250, 128, 86, r);
  gate(g, 170, 172, true); gate(g, 54, 256, false); gate(g, 286, 256, true); gate(g, 170, 338, false);
  g.beginPath(); g.ellipse(170, 252, 54, 30, 0, 0, 7); g.save(); g.setLineDash([8, 6]); g.strokeStyle = 'rgba(255,240,180,.95)'; g.lineWidth = 3; g.stroke(); g.restore();
  squad(g, 142, 252, 'hastati', 1, 3, 0.8, '#e2382c', 'vex'); squad(g, 196, 262, 'velites', 1, 3, 0.8, '#2fa04e', 'pennant');
  squad(g, 170, 200, 'e_inf', 2, 2, 0.8, '#3f7ae0', 'vex'); lion(g, 262, 254, 0.9);
  waveIn(g, 170, 150, Math.PI / 2, 'гладиаторы'); waveIn(g, 312, 250, Math.PI, 'львы · 5 с');
  waveBar(g, 170, 18, 3, 6, ''); meter(g, 170, 82, 200, 0.7, 'Милость толпы 70%');
  plate(g, 170, 404, '🛡 Держать центр', 'волны выходят из ворот арены', '#f2c14a'); }`);
// the rebellion: hold the villa, rebels come from three sides
rep("{ const { g } = pnl('rv2', 340, 420, 77); path(g, [[170, 420], [170, 0]], 34); cart(g, 130, 200, false); cart(g, 210, 196, true); for (let k = -50; k <= 50; k += 14) { if (Math.abs(k) < 8) continue; g.beginPath(); g.moveTo(170 + k - 3, 214); g.lineTo(170 + k, 194); g.lineTo(170 + k + 3, 214); g.closePath(); fo(g, '#b0783e', 2); }\n  rebels(g, 170, 150, 5, 1); squad(g, 160, 320, 'hastati', 1, 5, 1, '#e2382c', 'vex'); squad(g, 260, 340, 'velites', 1, 3, 0.95, '#2fa04e', 'pennant');\n  plate(g, 170, 50, 'Подавить мятеж', 'очаги: 1 из 3', '#ff8a2a'); bar(g, 170, 58, 150, 0.33); }",
String.raw`{ const { g } = pnl('rv2', 340, 420, 77); path(g, [[0, 250], [340, 250]], 28); path(g, [[170, 420], [170, 100]], 28);
  g.beginPath(); g.ellipse(170, 250, 70, 40, 0, 0, 7); g.fillStyle = 'rgba(214,190,130,.75)'; g.fill();
  rr(g, 132, 196, 76, 44, 4); fo(g, '#f4e2bc', 2.6); roofTri(g, 170, 198, 76, 34, '#e8643c', '#c04a28'); flag(g, 192, 140, '#e2382c', 34);
  cart(g, 96, 266, false); cart(g, 250, 270, true); grove(g, 50, 130, 50, 36, 7, 3); grove(g, 300, 360, 46, 34, 6, 6);
  squad(g, 120, 300, 'hastati', 1, 4, 0.85, '#e2382c', 'vex'); squad(g, 230, 300, 'hastati', 1, 4, 0.85, '#e2382c', 'vex'); squad(g, 170, 290, 'velites', 1, 3, 0.85, '#2fa04e', 'pennant');
  rebels(g, 40, 240, 3, 0.8); rebels(g, 300, 236, 3, 0.8);
  waveIn(g, 26, 250, 0, 'с запада'); waveIn(g, 316, 250, Math.PI, 'с востока'); waveIn(g, 170, 404, -Math.PI / 2, 'с юга · 8 с');
  waveBar(g, 170, 18, 2, 5, 'удержите виллу наместника');
  plate(g, 170, 120, '', '', '#ff8a2a'); }`);
// heat in the weather row
rep("const WEATHER = [['wx1', 'Ясно', 'всё как обычно', null],", "const WEATHER = [['wx1', 'Ясно', 'всё как обычно', null], ['wx6', '☀ Жара', 'броня утомляет · отдых у воды и в тени', heat],");
rep("  plate(g, 170, 404, name, sub, i === 4 ? '#9ec1ff' : '#f2c14a'); });", "  plate(g, 170, 404, name, sub, fx === 'night' ? '#9ec1ff' : fx === heat ? '#ffb03a' : '#f2c14a'); });");
// texts
rep('<p>Арена с песком, трибуны с толпой и ложа императора. Бои гладиаторов и зверей. Идея механики: <b>милость толпы</b> — эффектные приёмы её поднимают, толпа даёт бонусы.</p>', '<p>Режим обороны, как в Bad North: наши отряды держат центр арены, а из <b>четырёх ворот</b> выходят волны — гладиаторы, звери. Знак «!» и стрелка за несколько секунд показывают, откуда пойдут. <b>Милость толпы</b> растёт от эффектных приёмов и даёт бонусы.</p>');
rep('<figcaption><b>Милость толпы</b>Шкала над ареной, аплодисменты трибун.</figcaption>', '<figcaption><b>Оборона центра</b>Волна 3 из 6: открытые ворота, стрелки атак, шкала толпы.</figcaption>');
rep('<p>Мятеж в провинции: горят дома, бунтари с вилами и факелами (оранжевые — отдельная сторона). Подавить — погасить очаги и разбить баррикаду из телег.</p>', '<p>Тоже оборона: мятежники (оранжевые, с вилами и факелами) идут волнами с разных сторон на <b>виллу наместника</b>. Отбить все волны — провинция успокоится.</p>');
rep('<figcaption><b>Подавление</b>Баррикада из телег, счётчик очагов.</figcaption>', '<figcaption><b>Удержать виллу</b>Волна 2 из 5, атаки с запада, востока и юга.</figcaption>');
rep('<figure><div class="pic"><canvas id="wx2"', '<figure><div class="pic"><canvas id="wx6" width="680" height="840" aria-label="Жара"></canvas></div><figcaption><b>Жара</b>Марево, трещины, слепящее солнце. Тяжёлая пехота устаёт, отдых у воды и в тени.</figcaption></figure>\n    <figure><div class="pic"><canvas id="wx2"');
rep('<p>Одна и та же вылазка в пять погод.', '<p>Одна и та же вылазка в шесть погод.');
fs.writeFileSync(path.join(__dirname, 'extras.js'), t);
console.log('ok');
