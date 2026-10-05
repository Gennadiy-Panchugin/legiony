// New drawing code for the second mock-up board: squad banners, control panels, zoom levels.
const SQ = [
  { k: 'hastati', name: 'Гастаты', role: 'тяжёлая пехота', col: '#c0261b', trim: '#d9a441', emb: 'eagle', shape: 'vex', form: 'перекладина' },
  { k: 'velites', name: 'Велиты', role: 'метатели', col: '#2f8f4e', trim: '#eef3d2', emb: 'wolf', shape: 'pennant', form: 'вымпел' },
  { k: 'eques', name: 'Всадники', role: 'конница', col: '#7b3fa0', trim: '#f2e8ff', emb: 'horse', shape: 'swallow', form: 'ласточка' },
  { k: 'eng', name: 'Инженеры', role: 'сапёры', col: '#d98a1f', trim: '#2a1c10', emb: 'pick', shape: 'square', form: 'квадрат' }
];
const NAMES = ['Марк', 'Тит', 'Гай', 'Луций'], HP = [0.9, 0.7, 1, 1];
function emblem(g, k, cx, cy, z, col) {
  g.fillStyle = col; g.strokeStyle = col; g.lineWidth = Math.max(1, z * 0.28);
  g.beginPath();
  if (k === 'eagle') { g.moveTo(cx - z, cy - z * 0.1); g.quadraticCurveTo(cx - z * 0.45, cy - z * 0.95, cx, cy - z * 0.25); g.quadraticCurveTo(cx + z * 0.45, cy - z * 0.95, cx + z, cy - z * 0.1); g.lineTo(cx + z * 0.3, cy + z * 0.6); g.lineTo(cx - z * 0.3, cy + z * 0.6); g.closePath(); g.fill(); }
  else if (k === 'wolf') { g.moveTo(cx - z * 0.8, cy - z * 0.8); g.lineTo(cx - z * 0.3, cy - z * 0.35); g.lineTo(cx + z * 0.3, cy - z * 0.35); g.lineTo(cx + z * 0.8, cy - z * 0.8); g.lineTo(cx + z * 0.7, cy + z * 0.1); g.lineTo(cx, cy + z * 0.75); g.lineTo(cx - z * 0.7, cy + z * 0.1); g.closePath(); g.fill(); }
  else if (k === 'horse') { g.moveTo(cx - z * 0.7, cy + z * 0.8); g.lineTo(cx - z * 0.5, cy - z * 0.2); g.lineTo(cx - z * 0.1, cy - z * 0.9); g.lineTo(cx + z * 0.2, cy - z * 0.7); g.lineTo(cx + z * 0.9, cy + z * 0.1); g.lineTo(cx + z * 0.6, cy + z * 0.35); g.lineTo(cx + z * 0.1, cy + z * 0.1); g.lineTo(cx + z * 0.1, cy + z * 0.8); g.closePath(); g.fill(); }
  else { g.moveTo(cx - z * 0.8, cy + z * 0.8); g.lineTo(cx + z * 0.5, cy - z * 0.5); g.stroke(); g.beginPath(); g.arc(cx + z * 0.1, cy - z * 0.1, z * 0.9, -2.5, -0.3); g.stroke(); }
}
// a squad's standard: pole, a cloth whose SHAPE, colour and emblem differ for every squad
function banner(g, x, y, s, sc, enemy) {
  sc = sc || 1; const top = y - 34 * sc, col = enemy ? '#2f6fd6' : s.col, trim = enemy ? '#dfe8ff' : s.trim;
  g.strokeStyle = '#5a3d20'; g.lineWidth = Math.max(1.4, 1.8 * sc); g.beginPath(); g.moveTo(x, y); g.lineTo(x, top - 3 * sc); g.stroke();
  g.fillStyle = '#d9a441'; g.beginPath(); g.arc(x, top - 4 * sc, 2.4 * sc, 0, 7); g.fill();
  g.fillStyle = col; g.strokeStyle = trim; g.lineWidth = Math.max(1, 1.3 * sc);
  let ex, ey; g.beginPath();
  if (s.shape === 'vex') { g.fillStyle = '#5a3d20'; g.fillRect(x - 9 * sc, top, 18 * sc, 2 * sc); g.fillStyle = col; g.beginPath(); g.rect(x - 8 * sc, top + 2 * sc, 16 * sc, 17 * sc); ex = x; ey = top + 11 * sc; g.fill(); g.stroke(); g.fillStyle = trim; for (let i = 0; i < 4; i++) g.fillRect(x - 8 * sc + i * 4.4 * sc, top + 19 * sc, 2.4 * sc, 3.4 * sc); }
  else if (s.shape === 'pennant') { g.moveTo(x, top); g.lineTo(x + 24 * sc, top + 5 * sc); g.lineTo(x, top + 10 * sc); g.closePath(); g.fill(); g.stroke(); ex = x + 7 * sc; ey = top + 5 * sc; }
  else if (s.shape === 'swallow') { g.moveTo(x, top); g.lineTo(x + 19 * sc, top); g.lineTo(x + 13 * sc, top + 8 * sc); g.lineTo(x + 19 * sc, top + 16 * sc); g.lineTo(x, top + 16 * sc); g.closePath(); g.fill(); g.stroke(); ex = x + 8 * sc; ey = top + 8 * sc; }
  else { g.rect(x, top, 16 * sc, 15 * sc); g.fill(); g.stroke(); ex = x + 8 * sc; ey = top + 7.5 * sc; }
  if (sc >= 0.8) emblem(g, s.emb, ex, ey, 4 * sc, trim);
}
function ground(g, r, y0, y1) {
  const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#9fb06e'); gr.addColorStop(1, '#b9c689'); g.fillStyle = gr; g.fillRect(0, y0, CW, y1 - y0);
  for (let i = 0; i < 46; i++) { g.fillStyle = r() < .5 ? 'rgba(110,145,65,.2)' : 'rgba(235,240,165,.24)'; g.beginPath(); g.ellipse(r() * CW, y0 + r() * (y1 - y0), 8 + r() * 26, 5 + r() * 14, r() * 3, 0, 7); g.fill(); }
}
// the district town of mock-up 3 (the map we may take), without any interface
const TOPY = FY + 16, MY = TOPY + 118;
function town(g, r, y1) {
  ground(g, r, FY, y1 || FB); const top = TOPY, my = MY;
  plateau(g, 0, top, 320, 92, 12); g.fillStyle = '#cbc1aa'; g.fillRect(70, top + 6, 180, 80);
  g.fillStyle = '#d3cab8'; g.fillRect(122, top + 12, 76, 40); g.fillStyle = '#7d756a'; g.fillRect(122, top + 44, 76, 8); g.fillStyle = '#b4562f'; g.beginPath(); g.moveTo(118, top + 14); g.lineTo(160, top - 8); g.lineTo(202, top + 14); g.fill();
  [[22, 14], [50, 38], [270, 14], [248, 40]].forEach(([x, y]) => house(g, x, top + y, 22, 18, '#9a4a2a')); ramp(g, 286, top + 92, 24, 14);
  g.fillStyle = '#cbc1aa'; g.fillRect(176, my, 144, 118); g.fillStyle = '#d6c08a'; g.beginPath(); g.arc(250, my + 60, 26, 0, 7); g.fill();
  [[184, 8], [212, 10], [290, 8], [184, 82], [214, 92], [290, 82], [292, 60]].forEach(([x, y], i) => house(g, x, my + y, 22, 17, ['#b4562f', '#a8673a'][i % 2]));
  plateau(g, 0, my, 92, 94, 10); [[8, 12], [46, 16], [14, 56]].forEach(([x, y]) => house(g, x, my + y, 22, 16, '#8a4a2a')); forest(g, r, 96, my + 4, 70, 98, 12); ramp(g, 70, my + 104, 22, 12);
  river(g, top + 258, top + 276, [90, 250], [170]); g.fillStyle = '#c8bf9e'; g.fillRect(0, top + 276, 320, 70);
  [[16, 288], [50, 292], [118, 286], [210, 290], [270, 288], [292, 308]].forEach(([x, y], i) => house(g, x, top + y, 22, 16, ['#b4562f', '#a8673a'][i % 2]));
  road(g, [[90, top + 346], [90, top + 258], [120, my + 118], [190, my + 60], [250, my + 60]], 12); road(g, [[250, top + 346], [250, top + 258]], 12); road(g, [[220, my + 60], [160, top + 60]], 12);
  if ((y1 || FB) > FB) road(g, [[90, FB], [90, y1]], 12);
  [[160, top + 30, 'Цитадель', 0], [250, my + 60, 'Рынок', 0.6], [46, my + 36, 'Храмовый холм', 0]].forEach(([x, y, l, p]) => flag(g, x, y, BLUE, l, p));
  squad(g, 224, my + 30, BLUE, 4); squad(g, 40, my + 70, BLUE, 3); squad(g, 120, top + 62, BLUE, 5); squad(g, 160, top + 76, BLUE, 5);
}
// our four squads with their own banners; sel = index of the selected squad (or -1)
function romeSquads(g, ys, sel, sc) {
  const xs = [70, 136, 206, 262]; sc = sc || 1;
  SQ.forEach((s, i) => { const x = xs[i], y = ys[i]; squad(g, x, y, s.col, [6, 5, 4, 4][i]);
    if (sel === i) { g.strokeStyle = '#f6d77a'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y + 4, 22, 14, 0, 0, 7); g.stroke(); }
    banner(g, x + 17, y + 6, s, sc); });
}
function topBar(g, title, sub, chip) {
  g.fillStyle = '#1e1913'; g.fillRect(0, 0, CW, FY);
  g.fillStyle = '#2a231a'; g.strokeStyle = '#4a3d2c'; g.lineWidth = 1; g.beginPath(); g.rect(8, 7, 30, 30); g.fill(); g.stroke(); g.fillStyle = '#efe6d2'; g.font = '14px sans-serif'; g.textAlign = 'center'; g.fillText('↻', 23, 27);
  g.textAlign = 'left'; g.fillStyle = GOLD; g.font = '700 8px Alegreya Sans, sans-serif'; g.fillText('ШТУРМ', 46, 15); g.fillStyle = '#efe6d2'; g.font = '700 15px Cormorant SC, serif'; g.fillText(title, 46, 29); g.fillStyle = '#b8aa8c'; g.font = '9px Alegreya Sans, sans-serif'; g.fillText(sub, 46, 40);
  g.fillStyle = '#2a231a'; g.strokeStyle = '#4a3d2c'; g.beginPath(); g.rect(CW - 56, 11, 48, 22); g.fill(); g.stroke(); g.fillStyle = '#efe6d2'; g.font = '700 11px Alegreya Sans, sans-serif'; g.textAlign = 'center'; g.fillText(chip, CW - 32, 26);
}
function objBar(g, y) { g.fillStyle = '#2a1f12'; g.fillRect(0, y, CW, 16); [0, 1, 2, 3].forEach(i => { g.fillStyle = i < 2 ? RED : '#3a3a52'; g.fillRect(8 + i * 77, y + 4, 72, 8); }); g.fillStyle = '#f6e7bf'; g.font = '700 9px Alegreya Sans, sans-serif'; g.textAlign = 'center'; g.fillText('Районы 2 из 4', CW / 2, y + 11); }
function skillBtn(g, x, y, w, h, label, sub, round) {
  g.fillStyle = GOLD; g.beginPath(); if (round) g.arc(x, y, w, 0, 7); else g.rect(x, y, w, h); g.fill();
  g.fillStyle = '#1e1408'; g.textAlign = 'center'; g.font = '700 ' + (round ? 11 : 12) + 'px Alegreya Sans, sans-serif'; g.fillText(label, round ? x : x + w / 2, round ? y - 1 : y + h / 2 - 2); g.font = '9px Alegreya Sans, sans-serif'; g.fillText(sub, round ? x : x + w / 2, round ? y + 11 : y + h / 2 + 11);
}
function hpRing(g, x, y, r, f, col) { g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.strokeStyle = col || '#6fd17a'; g.beginPath(); g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); g.stroke(); }
function arrowTo(g, pts) { arrowPath(g, pts); }

// ---------------------------------------------------------------- banner sheet
{ const c = document.getElementById('sheet'), g = c.getContext('2d'); g.scale(DPR, DPR); g.lineCap = 'round'; g.lineJoin = 'round'; const SW = 960, SH = 330;
  g.fillStyle = '#1e1913'; g.fillRect(0, 0, SW, SH);
  SQ.forEach((s, i) => { const x0 = 18 + i * 232;
    g.fillStyle = '#2a231a'; g.strokeStyle = '#4a3d2c'; g.lineWidth = 1; g.beginPath(); g.rect(x0, 16, 214, 214); g.fill(); g.stroke();
    g.fillStyle = s.col; g.fillRect(x0, 16, 214, 6);
    banner(g, x0 + 34, 196, s, 2.6);
    g.fillStyle = '#f6e7bf'; g.font = '700 22px Cormorant SC, serif'; g.textAlign = 'left'; g.fillText(NAMES[i], x0 + 120, 62); g.fillStyle = GOLD; g.font = '700 11px Alegreya Sans, sans-serif'; g.fillText(s.name.toUpperCase(), x0 + 120, 80);
    g.fillStyle = '#b8aa8c'; g.font = '12px Alegreya Sans, sans-serif'; g.fillText(s.role, x0 + 120, 100); g.fillText('форма: ' + s.form, x0 + 120, 118);
    const sw = [s.col, s.trim]; sw.forEach((cc, k) => { g.fillStyle = cc; g.fillRect(x0 + 120 + k * 30, 130, 24, 24); g.strokeStyle = '#4a3d2c'; g.strokeRect(x0 + 120 + k * 30, 130, 24, 24); });
    // the same standard at field size, and as a silhouette (shape alone must tell them apart)
    banner(g, x0 + 130, 222, s, 0.85);
    g.save(); g.filter = 'grayscale(1)'; banner(g, x0 + 176, 222, s, 0.85); g.restore();
  });
  g.fillStyle = '#b8aa8c'; g.font = '700 10px Alegreya Sans, sans-serif'; g.textAlign = 'left'; g.fillText('НА ПОЛЕ И В ЧЁРНО-БЕЛОМ ТЕСТЕ', 18, 256);
  g.fillStyle = '#3a3024'; g.fillRect(18, 262, SW - 36, 1);
  g.fillStyle = '#b8aa8c'; g.font = '12px Alegreya Sans, sans-serif'; g.fillText('Враг: все знамёна синие, форма повторяет класс', 18, 284);
  [SQ[0], SQ[1], SQ[2], SQ[3]].forEach((s, i) => banner(g, 340 + i * 56, 300, s, 0.8, true));
  g.fillText('Захватываемая точка: флаг с кольцом', 580, 284); flag(g, 640, 312, BLUE, '', 0.6); flag(g, 690, 312, RED, '', 1);
}

// ---------------------------------------------------------------- panel 1: cards at the bottom
{ const g = ctxOf('u1'), r = rng(37); town(g, r); objBar(g, FY); topBar(g, 'Город Вейи', 'Возьмите три района из четырёх', '1:12'); romeSquads(g, [FB - 56, FB - 44, FB - 56, FB - 44], 1);
  g.fillStyle = '#1e1913'; g.fillRect(0, FB, CW, CH - FB);
  SQ.forEach((s, i) => { const x = 6 + i * 52; g.fillStyle = i === 1 ? '#3a2e18' : '#2a231a'; g.strokeStyle = i === 1 ? '#f6d77a' : '#4a3d2c'; g.lineWidth = 1.2; g.beginPath(); g.rect(x, FB + 8, 48, 50); g.fill(); g.stroke(); g.fillStyle = s.col; g.fillRect(x, FB + 8, 48, 4);
    banner(g, x + 14, FB + 44, s, 0.62); g.fillStyle = '#b8aa8c'; g.font = '9px Alegreya Sans, sans-serif'; g.textAlign = 'center'; g.fillText(NAMES[i], x + 33, FB + 30); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(x + 6, FB + 49, 36, 4); g.fillStyle = '#6fd17a'; g.fillRect(x + 6, FB + 49, 36 * HP[i], 4); });
  skillBtn(g, CW - 104, FB + 8, 98, 50, 'Залп', 'урон ×2,5'); }

// ---------------------------------------------------------------- panel 2: banner rail on the left, round skill button
{ const g = ctxOf('u2'), r = rng(37); town(g, r, CH); objBar(g, FY); topBar(g, 'Город Вейи', 'Возьмите три района из четырёх', '1:12'); romeSquads(g, [FB - 56, FB - 44, FB - 56, FB - 44], 1);
  SQ.forEach((s, i) => { const x = 28, y = FY + 56 + i * 62; g.fillStyle = 'rgba(30,25,19,.92)'; g.strokeStyle = i === 1 ? '#f6d77a' : '#4a3d2c'; g.lineWidth = i === 1 ? 2.5 : 1.2; g.beginPath(); g.arc(x, y, 24, 0, 7); g.fill(); g.stroke(); hpRing(g, x, y, 24, HP[i], i === 1 ? '#f2c14e' : '#6fd17a'); banner(g, x - 6, y + 17, s, 0.72); });
  skillBtn(g, CW - 44, CH - 52, 32, 0, 'Залп', 'готов', true); g.strokeStyle = '#f6d77a'; g.lineWidth = 3; g.beginPath(); g.arc(CW - 44, CH - 52, 36, 0, 7); g.stroke();
  g.fillStyle = 'rgba(30,25,19,.9)'; g.fillRect(CW - 108, CH - 38, 40, 24); g.fillStyle = '#efe6d2'; g.font = '700 10px Alegreya Sans, sans-serif'; g.textAlign = 'center'; g.fillText('Тит · 70%', CW - 88, CH - 22); }

// ---------------------------------------------------------------- panel 3: radial menu at the squad, tokens on top
{ const g = ctxOf('u3'), r = rng(37); town(g, r, CH); topBar(g, 'Город Вейи', 'Возьмите три района из четырёх', '1:12'); objBar(g, FY);
  g.fillStyle = 'rgba(30,60,110,.1)'; g.fillRect(0, FY + 16, CW, CH - FY - 16);
  const sy = [FB - 20, FB - 4, FB - 20, FB - 4]; romeSquads(g, sy, 1);
  // tokens along the top edge
  SQ.forEach((s, i) => { const x = 40 + i * 78, y = FY + 34; g.fillStyle = 'rgba(30,25,19,.92)'; g.strokeStyle = i === 1 ? '#f6d77a' : '#4a3d2c'; g.lineWidth = i === 1 ? 2 : 1; g.beginPath(); g.rect(x - 30, y - 12, 62, 24); g.fill(); g.stroke(); banner(g, x - 22, y + 10, s, 0.42); g.fillStyle = '#b8aa8c'; g.font = '9px Alegreya Sans, sans-serif'; g.textAlign = 'left'; g.fillText(NAMES[i], x - 12, y - 1); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(x - 12, y + 3, 38, 4); g.fillStyle = '#6fd17a'; g.fillRect(x - 12, y + 3, 38 * HP[i], 4); });
  // the radial menu around the selected squad (Велиты)
  const cx = 136, cy = sy[1] - 6; g.strokeStyle = 'rgba(246,215,122,.6)'; g.lineWidth = 1; g.setLineDash([3, 3]); g.beginPath(); g.arc(cx, cy, 54, 0, 7); g.stroke(); g.setLineDash([]);
  [[-90, 'Залп', GOLD, '#1e1408'], [-18, 'Стоять', '#2a231a', '#efe6d2'], [-162, 'Назад', '#2a231a', '#efe6d2']].forEach(([a, t, bg, fg]) => { const x = cx + Math.cos(a * Math.PI / 180) * 54, y = cy + Math.sin(a * Math.PI / 180) * 54; g.fillStyle = bg; g.strokeStyle = GOLD; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 19, 0, 7); g.fill(); g.stroke(); g.fillStyle = fg; g.font = '700 10px Alegreya Sans, sans-serif'; g.textAlign = 'center'; g.fillText(t, x, y + 3); });
  g.fillStyle = 'rgba(30,25,19,.9)'; g.fillRect(14, CH - 30, 140, 20); g.fillStyle = '#bfe0ff'; g.font = '700 10px Alegreya Sans, sans-serif'; g.textAlign = 'left'; g.fillText('⏳ Замедление · выберите действие', 20, CH - 16); }

// ---------------------------------------------------------------- panel 4: banners hung on a rope across the top
{ const g = ctxOf('u4'), r = rng(37); town(g, r, CH); topBar(g, 'Город Вейи', 'Возьмите три района из четырёх', '1:12'); objBar(g, FY);
  romeSquads(g, [FB - 20, FB - 4, FB - 20, FB - 4], 1);
  g.strokeStyle = '#5a3d20'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, FY + 24); g.quadraticCurveTo(CW / 2, FY + 34, CW, FY + 24); g.stroke();
  SQ.forEach((s, i) => { const x = 48 + i * 74, y = FY + 52 + (i === 1 ? -4 : 0); g.fillStyle = 'rgba(30,25,19,.9)'; if (i === 1) { g.fillStyle = 'rgba(246,215,122,.25)'; g.beginPath(); g.arc(x + 6, y - 6, 30, 0, 7); g.fill(); } banner(g, x, y + 16, s, 1.1); hpRing(g, x + 8, y + 22, 8, HP[i], i === 1 ? '#f2c14e' : '#6fd17a'); g.fillStyle = '#f6e7bf'; g.font = '700 9px Alegreya Sans, sans-serif'; g.textAlign = 'center'; g.fillText(NAMES[i], x + 8, y + 40); });
  g.fillStyle = 'rgba(30,25,19,.92)'; g.strokeStyle = '#4a3d2c'; g.fillRect(8, CH - 44, 68, 32); g.strokeRect(8, CH - 44, 68, 32); g.fillStyle = '#efe6d2'; g.font = '700 10px Alegreya Sans, sans-serif'; g.textAlign = 'center'; g.fillText('Пауза', 42, CH - 24);
  skillBtn(g, CW - 112, CH - 56, 104, 44, 'Залп', 'двойное касание'); }

// ---------------------------------------------------------------- panel 5: compact bar with a minimap and zoom
{ const g = ctxOf('u5'), r = rng(37); town(g, r); objBar(g, FY); topBar(g, 'Город Вейи', 'Возьмите три района из четырёх', '1:12'); romeSquads(g, [FB - 56, FB - 44, FB - 56, FB - 44], 1);
  g.fillStyle = '#1e1913'; g.fillRect(0, FB, CW, CH - FB);
  // minimap with the viewport frame
  g.fillStyle = '#9fb06e'; g.fillRect(8, FB + 10, 80, 100 > CH - FB - 20 ? CH - FB - 20 : 100); g.strokeStyle = GOLD; g.lineWidth = 1.2; g.strokeRect(8, FB + 10, 80, CH - FB - 20);
  g.fillStyle = '#7d756a'; g.fillRect(20, FB + 14, 56, 16); g.fillStyle = '#5b97c2'; g.fillRect(8, FB + 60, 80, 6); g.fillStyle = BLUE; [[30, 20], [60, 36], [20, 46], [48, 22]].forEach(([x, y]) => g.fillRect(8 + x, FB + y, 4, 3)); SQ.forEach((s, i) => { g.fillStyle = s.col; g.fillRect(24 + i * 14, FB + 80, 5, 4); }); g.strokeStyle = '#fff3d6'; g.strokeRect(10, FB + 12, 76, 62);
  SQ.forEach((s, i) => { const x = 96 + i * 44; g.fillStyle = i === 1 ? '#3a2e18' : '#2a231a'; g.strokeStyle = i === 1 ? '#f6d77a' : '#4a3d2c'; g.lineWidth = 1.2; g.beginPath(); g.rect(x, FB + 10, 40, 56); g.fill(); g.stroke(); g.fillStyle = s.col; g.fillRect(x, FB + 10, 40, 4); banner(g, x + 12, FB + 50, s, 0.6); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(x + 5, FB + 56, 30, 4); g.fillStyle = '#6fd17a'; g.fillRect(x + 5, FB + 56, 30 * HP[i], 4); });
  skillBtn(g, CW - 46, FB + 38, 30, 0, 'Залп', '', true);
  // zoom controls on the right edge of the field
  [['+', FY + 160], ['−', FY + 196]].forEach(([t, y]) => { g.fillStyle = 'rgba(30,25,19,.92)'; g.strokeStyle = '#4a3d2c'; g.lineWidth = 1; g.beginPath(); g.rect(CW - 38, y, 30, 30); g.fill(); g.stroke(); g.fillStyle = '#efe6d2'; g.font = '700 18px sans-serif'; g.textAlign = 'center'; g.fillText(t, CW - 23, y + 21); });
  g.fillStyle = 'rgba(30,25,19,.92)'; g.fillRect(CW - 52, FY + 236, 44, 18); g.fillStyle = '#f6d77a'; g.font = '700 10px Alegreya Sans, sans-serif'; g.fillText('1,0×', CW - 30, FY + 249); }

// ---------------------------------------------------------------- zoom levels
function zoomScene(id, z, cx, cy, mode) {
  const g = ctxOf(id), r = rng(37); topBar(g, 'Город Вейи', 'Возьмите три района из четырёх', '1:12'); objBar(g, FY);
  g.save(); g.beginPath(); g.rect(0, FY + 16, CW, FH - 16); g.clip(); g.translate(CW / 2, FY + 16 + (FH - 16) / 2); g.scale(z, z); g.translate(-cx, -cy);
  town(g, r); river(g, TOPY + 258, TOPY + 276, [90, 250], [170]);
  const yy = [TOPY + 322, TOPY + 332, TOPY + 322, TOPY + 332]; romeSquads(g, yy, 1, mode === 'far' ? 1.5 : 1);
  if (mode === 'near') { const s = SQ[1]; g.strokeStyle = 'rgba(246,215,122,.9)'; g.lineWidth = 1.5; g.setLineDash([5, 4]); g.beginPath(); g.arc(136, yy[1], 40, 0, 7); g.stroke(); g.setLineDash([]); arrowTo(g, [[136, yy[1] - 10], [150, TOPY + 270], [170, TOPY + 220]]); }
  g.restore();
  g.fillStyle = '#1e1913'; g.fillRect(0, FB, CW, CH - FB);
  SQ.forEach((s, i) => { const x = 6 + i * 52; g.fillStyle = i === 1 ? '#3a2e18' : '#2a231a'; g.strokeStyle = i === 1 ? '#f6d77a' : '#4a3d2c'; g.lineWidth = 1.2; g.beginPath(); g.rect(x, FB + 8, 48, 50); g.fill(); g.stroke(); g.fillStyle = s.col; g.fillRect(x, FB + 8, 48, 4); banner(g, x + 14, FB + 44, s, 0.62); g.fillStyle = '#b8aa8c'; g.font = '9px Alegreya Sans, sans-serif'; g.textAlign = 'center'; g.fillText(NAMES[i], x + 33, FB + 30); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(x + 6, FB + 49, 36, 4); g.fillStyle = '#6fd17a'; g.fillRect(x + 6, FB + 49, 36 * HP[i], 4); });
  skillBtn(g, CW - 104, FB + 8, 98, 50, 'Залп', 'урон ×2,5');
  g.fillStyle = 'rgba(30,25,19,.92)'; g.fillRect(CW - 52, FY + 24, 44, 18); g.fillStyle = '#f6d77a'; g.font = '700 10px Alegreya Sans, sans-serif'; g.textAlign = 'center'; g.fillText(z.toFixed(1).replace('.', ',') + '×', CW - 30, FY + 37);
  return g;
}
{ zoomScene('z1', 1, 160, FY + 16 + 215, 'far'); }
{ const g = zoomScene('z2', 1.6, 150, TOPY + 270, 'mid'); }
{ const g = zoomScene('z3', 2.4, 150, TOPY + 290, 'near'); }
