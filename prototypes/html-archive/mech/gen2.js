// Second row: five more battle-mechanic mock-ups (6–10), drawn with the same helpers as gen.js,
// and the canvas index merged onto the version the user last saved.
var fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
eval(src.slice(0, src.indexOf('// ================================================================ 1. Front line')).replace(/^const /gm, 'var '));   // helpers: crowd, block, page, ico…

// ================================================================ 6. Setup and auto-battle
{
  let grid = '';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) grid += `<rect x="${30 + c * 56}" y="${330 + r * 56}" width="50" height="50" rx="6" fill="#fff8e6" fill-opacity=".35" stroke="${INK}" stroke-opacity=".35" stroke-dasharray="3 3"/>`;
  const svg = `
  <path d="M10 300 H380" stroke="#2a1c10" stroke-width="2" stroke-dasharray="8 6"/>
  ${label(195, 300, 'ваша половина поля')}
  <path d="${block(55, 70, 6, 3, 7)}${block(160, 60, 7, 3, 7)}${block(280, 75, 6, 3, 7)}${wedge(95, 190, 5, 7, -1)}${wedge(300, 190, 5, 7, -1)}" fill="${BLUE}"/>
  ${label(195, 30, 'Строй врага виден заранее', '#c7d6ff')}
  ${grid}
  <path d="${block(37, 340, 6, 5, 7)}" fill="${RED}"/>
  <path d="${block(149, 340, 6, 5, 7)}" fill="${RED}"/>
  <path d="${block(205, 452, 6, 5, 7)}" fill="${RED}"/>
  <path d="${wedge(310, 390, 6, 7, -1)}" fill="${RED}"/>
  <rect x="254" y="384" width="50" height="50" rx="6" fill="none" stroke="${GOLD}" stroke-width="2.5"/>
  ${label(279, 448, 'тащите сюда')}
  <path d="M279 600 C279 540 279 500 279 440" stroke="${GOLD}" stroke-width="3" fill="none" stroke-dasharray="6 5" marker-end="url(#arG)"/>
  `;
  const deck = `<div style="height: 74px; flex: none; display: flex; gap: 8px; padding: 8px 12px; background: #221c14; border-top: 1px solid #3a3024">
    ${['Пехота ×2', 'Лучники', 'Конница', 'Ветераны'].map((t, i) => `<div style="flex: 1 1 0; border-radius: 10px; border: 1px solid ${i === 2 ? GOLD : '#4a3d2c'}; background: #2a231a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #efe6d2"><span style="width: 22px; height: 22px; border-radius: 50%; background: ${RED}; display: block; margin-bottom: 3px"></span>${t}</div>`).join('')}
  </div>`;
  fs.writeFileSync(path.join(out, 'Setup.dc.html'), page('Расстановка и автобой', 'Вариант 6', 'Расстановка', 'Раунд 1 из 3 · затем автобой', '3 карты', svg,
    'Расставьте когорты на сетке. «В бой» — армии сходятся сами, решает расстановка',
    [{ label: 'Очистить', icon: ico('<path d="M6 6l12 12M18 6 6 18"/>') }, { label: 'В бой', icon: ico('<path d="M7 4v16l13-8z"/>'), primary: true }], '').replace('<div style="height: 86px; flex: none;', deck + '\n  <div style="height: 86px; flex: none;'));
}

// ================================================================ 7. Hold the shore (Bad North)
{
  const island = 'M70 170 C120 120 260 110 320 160 C370 200 365 330 330 400 C300 460 200 490 130 450 C70 420 40 330 45 260 C48 220 55 190 70 170 Z';
  const boat = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-18 0 H18 L12 8 H-12 Z" fill="#6b4424" stroke="${INK}" stroke-width="1"/><path d="M0 0 V-18" stroke="${INK}" stroke-width="1.6"/><path d="M-9 -16 H9 L7 -5 H-7 Z" fill="#dfe8f5"/><path d="M-9 -12 H9" stroke="${BLUE}" stroke-width="2"/></g>`;
  const warn = (x, y) => `<g><circle cx="${x}" cy="${y}" r="13" fill="${RED_D}"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="16" font-weight="700" fill="#fff" font-family="Alegreya Sans, sans-serif">!</text></g>`;
  const svg = `
  <rect x="0" y="0" width="390" height="630" fill="#5d8fbf" opacity=".55"/>
  <path d="${island}" fill="#d8c48e" stroke="#c9b277" stroke-width="10"/>
  <path d="${island}" fill="#cbb98a"/>
  <path d="M120 230 C160 200 250 200 280 240 C300 290 260 360 200 370 C150 370 110 320 120 230 Z" fill="#b7a46f"/>
  ${peak(205, 290, 22)}
  <path d="M195 300h20v20h-20z" fill="#9e2a20" stroke="${INK}" stroke-width="1.4"/>
  ${label(205, 340, 'Деревня — защитить')}
  <path d="${block(90, 210, 4, 3, 6)}" fill="${RED}"/>${label(100, 240, 'I')}
  <path d="${block(270, 190, 4, 3, 6)}" fill="${RED}"/>${label(280, 220, 'II')}
  <path d="${block(150, 410, 4, 3, 6)}" fill="${RED}"/>${label(160, 440, 'III')}
  <path d="${wedge(300, 360, 4, 6, -1)}" fill="${RED}"/>${label(300, 382, 'IV')}
  <circle cx="160" cy="418" r="22" fill="none" stroke="${GOLD}" stroke-width="2.5" stroke-dasharray="5 4"/>
  <path d="M175 420 C230 450 290 440 330 412" stroke="${GOLD}" stroke-width="3" fill="none" stroke-dasharray="6 5" marker-end="url(#arG)"/>
  ${boat(40, 90, 30)}${boat(350, 470, -150)}${boat(370, 250, -90)}
  ${warn(80, 130)}${warn(338, 440)}${warn(355, 290)}
  <path d="${crowd(345, 440, 14, 8, 12, 31)}" fill="${BLUE}"/>
  ${label(195, 565, 'Высадка с трёх сторон — волна 3 из 5', '#c7d6ff')}
  `;
  fs.writeFileSync(path.join(out, 'Shore.dc.html'), page('Оборона берега', 'Вариант 7', 'Оборона Сардинии', 'Четыре отряда · волны с моря', 'Волна 3/5', svg,
    'Коснитесь отряда, затем места на острове. Корабли подходят с разных сторон',
    [{ label: 'Отступить', icon: ico('<path d="M9 14 4 9l5-5"/><path d="M4 9h11"/>') }, { label: 'Клич', icon: ico('<path d="M4 10v4l10 5V5z"/>'), primary: true }, { label: 'Щиты', icon: ico('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>') }]));
}

// ================================================================ 8. Lane push
{
  const lanes = [80, 195, 310];
  let svg = `<path d="M10 40 H380 V80 H10 Z" fill="${BLUE}" fill-opacity=".18"/>${tent(195, 70, BLUE)}${label(195, 92, 'Ворота врага · 74%', '#c7d6ff')}
  <path d="M10 560 H380 V600 H10 Z" fill="${RED}" fill-opacity=".15"/>`;
  const front = [300, 230, 360];
  lanes.forEach((x, i) => {
    svg += `<path d="M${x} 110 V540" stroke="#bfae84" stroke-width="54" stroke-linecap="round" opacity=".55"/>
    <path d="M${x} 110 V540" stroke="${INK}" stroke-width="1" stroke-dasharray="3 7" opacity=".5"/>
    <path d="M${x - 30} ${front[i]} H${x + 30}" stroke="#2a1c10" stroke-width="3"/>
    <path d="${crowd(x, front[i] + 30, 22, 22, 26, 40 + i)}" fill="${RED}"/>
    <path d="${crowd(x, front[i] - 30, 22, 22, 22, 50 + i)}" fill="${BLUE}"/>`;
  });
  svg += `${label(80, 520, 'Левый фланг')}${label(195, 520, 'Центр')}${label(310, 520, 'Правый фланг')}
  <path d="M195 470 V300" stroke="${RED}" stroke-width="7" fill="none" opacity=".6" marker-end="url(#arR)"/>`;
  const bar = `<div style="height: 26px; flex: none; display: flex; align-items: center; gap: 8px; padding: 0 14px; background: #1e1913; border-bottom: 1px solid #3a3024; font-size: 11px; color: #b8aa8c">
    <span style="color: #f6d77a; font-weight: 700">Провиант</span>
    <div style="flex: 1 1 auto; height: 8px; border-radius: 999px; background: #3a3024; overflow: hidden"><div style="width: 62%; height: 100%; background: ${GOLD}"></div></div>
    <span style="color: #f6d77a; font-weight: 700">6 / 10</span></div>`;
  fs.writeFileSync(path.join(out, 'Lanes.dc.html'), page('Три фланга', 'Вариант 8', 'Три фланга', 'Вызывайте отряды на нужный фланг', '2:05', svg,
    'Выберите отряд снизу и проведите его на фланг. Пробейте ворота быстрее врага',
    [{ label: 'Пехота · 3', icon: ico('<rect x="7" y="5" width="10" height="14"/>') }, { label: 'Лучники · 4', icon: ico('<path d="M6 4c8 4 8 12 0 16"/><path d="M6 12h14"/>'), primary: true }, { label: 'Конница · 5', icon: ico('<path d="M4 16h14l2-6-5-2"/>') }, { label: 'Таран · 7', icon: ico('<path d="M3 12h15M15 8l4 4-4 4"/>') }], bar));
}

// ================================================================ 9. Siege
{
  let wall = '';
  for (let x = 20; x < 370; x += 14) wall += `<rect x="${x}" y="150" width="9" height="10" fill="#b9ad95" stroke="${INK}" stroke-width="1"/>`;
  const svg = `
  <path d="M0 0 H390 V170 H0 Z" fill="#cbb98a"/>
  <rect x="10" y="160" width="370" height="46" fill="#b9ad95" stroke="${INK}" stroke-width="1.6"/>
  ${wall}
  <rect x="40" y="110" width="44" height="96" fill="#a89c84" stroke="${INK}" stroke-width="1.6"/>
  <rect x="306" y="110" width="44" height="96" fill="#a89c84" stroke="${INK}" stroke-width="1.6"/>
  <path d="M168 206 V170 Q195 150 222 170 V206 Z" fill="#5a3d20" stroke="${INK}" stroke-width="1.6"/>
  <path d="${block(60, 128, 8, 2, 6)}${block(230, 128, 8, 2, 6)}" fill="${BLUE}"/>
  <g><rect x="150" y="214" width="90" height="8" rx="4" fill="#2a1c10"/><rect x="150" y="214" width="58" height="8" rx="4" fill="${GOLD}"/></g>
  ${label(195, 238, 'Ворота · пролом 64%')}
  <path d="M175 410 L195 250 L215 410 Z" fill="#6b4424" stroke="${INK}" stroke-width="1.4"/><path d="M180 250 h30" stroke="${INK}" stroke-width="6"/>
  ${label(195, 430, 'Таран')}
  <path d="M90 420 L80 210 M106 420 L96 210" stroke="#6b4424" stroke-width="3"/><path d="M84 400 h18 M83 370 h18 M82 340 h18 M81 310 h18 M80 280 h18 M79 250 h18" stroke="#6b4424" stroke-width="2.5"/>
  ${label(93, 438, 'Лестницы')}
  <circle cx="290" cy="160" r="30" fill="${RED}" fill-opacity=".14" stroke="${RED}" stroke-width="2" stroke-dasharray="5 4"/>
  <path d="M300 480 Q330 300 290 168" stroke="${RED}" stroke-width="2" fill="none" stroke-dasharray="3 5"/>
  <rect x="285" y="480" width="34" height="18" fill="#6b4424" stroke="${INK}" stroke-width="1.4"/><path d="M300 480 L318 452" stroke="#6b4424" stroke-width="4"/>
  ${label(300, 515, 'Онагр: цель — башня')}
  <path d="${crowd(195, 470, 70, 30, 90, 61)}${crowd(95, 450, 25, 16, 25, 62)}" fill="${RED}"/>
  `;
  fs.writeFileSync(path.join(out, 'Siege.dc.html'), page('Осада крепости', 'Вариант 9', 'Осада Капуи', 'Выберите, где ломать стену', '3:30', svg,
    'Назначьте осадные машины: таран — к воротам, лестницы — на стену, онагр — по башне',
    [{ label: 'Таран', icon: ico('<path d="M3 12h15M15 8l4 4-4 4"/>'), primary: true }, { label: 'Лестницы', icon: ico('<path d="M8 3v18M16 3v18M8 8h8M8 13h8M8 18h8"/>') }, { label: 'Онагр', icon: ico('<path d="M4 18h12M8 18l6-10"/><circle cx="16" cy="6" r="2"/>') }, { label: 'Штурм', icon: ico('<path d="M6 21V4"/><path d="M6 4h11l-3 4 3 4H6"/>') }]));
}

// ================================================================ 10. Deck of orders
{
  const front = 'M0 300 C60 280 120 320 190 300 S300 270 390 295';
  const svg = `
  <path d="${front} L390 630 L0 630 Z" fill="${RED}" fill-opacity=".10"/>
  <path d="${front} L390 0 L0 0 Z" fill="${BLUE}" fill-opacity=".10"/>
  <path d="${front}" stroke="#2a1c10" stroke-width="3.5" fill="none"/>
  <path d="${crowd(70, 320, 55, 12, 60, 71)}${crowd(190, 325, 55, 12, 60, 72)}${crowd(320, 315, 55, 12, 60, 73)}" fill="${RED}"/>
  <path d="${crowd(70, 278, 55, 12, 55, 74)}${crowd(190, 275, 55, 12, 55, 75)}${crowd(320, 270, 55, 12, 55, 76)}" fill="${BLUE}"/>
  <rect x="270" y="230" width="100" height="70" rx="10" fill="${GOLD}" fill-opacity=".18" stroke="${GOLD}" stroke-width="2.5" stroke-dasharray="6 4"/>
  ${label(320, 222, 'Фланговый удар — сюда')}
  <path d="M250 560 C270 470 300 380 318 300" stroke="${GOLD}" stroke-width="3" fill="none" stroke-dasharray="6 5" marker-end="url(#arG)"/>
  ${tent(195, 70, BLUE)}${label(195, 92, 'Лагерь врага', '#9ec1ff')}
  ${label(195, 420, 'Ход 4 · у врага 2 карты в руке', '#c7d6ff')}
  `;
  const hand = `<div style="height: 132px; flex: none; display: flex; gap: 8px; padding: 10px 12px; background: #221c14; border-top: 1px solid #3a3024; align-items: flex-end">
    ${[['Фланговый удар', 'конница бьёт во фланг ×2', 2, true], ['Черепаха', 'пехота −50% урона от стрел', 1], ['Град стрел', 'лучники по площади', 2], ['Резерв', '+20 воинов к фронту', 3]].map(([t, d, c, on]) => `<div style="flex: 1 1 0; min-width: 0; height: ${on ? 116 : 104}px; border-radius: 10px; border: 1.5px solid ${on ? GOLD : '#4a3d2c'}; background: #2e261b; display: flex; flex-direction: column; padding: 6px; gap: 4px; box-sizing: border-box"><span style="align-self: flex-end; width: 20px; height: 20px; border-radius: 50%; background: ${GOLD}; color: #1e1408; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center">${c}</span><b style="font-family: 'Cormorant SC', serif; font-size: 14px; line-height: 1.05">${t}</b><span style="font-size: 10.5px; color: #b8aa8c; line-height: 1.2">${d}</span></div>`).join('')}
  </div>`;
  fs.writeFileSync(path.join(out, 'Cards.dc.html'), page('Колода приказов', 'Вариант 10', 'Колода приказов', 'Приказы 3 из 5 · карта на фронт', 'Ход 4', svg,
    'Перетащите карту приказа на участок фронта. Новые карты — за победы и технологии',
    [{ label: 'Сброс', icon: ico('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>') }, { label: 'Конец хода', icon: ico('<path d="M5 12h12M13 6l6 6-6 6"/>'), primary: true }], '').replace('<div style="height: 86px; flex: none;', hand + '\n  <div style="height: 86px; flex: none;'));
}

// ================================================================ canvas index: merge onto the saved version
const idxPath = path.join(__dirname, 'saved-canvas.json');
const canvas = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
const row2 = [['Setup.dc.html', '6 · Расстановка и автобой'], ['Shore.dc.html', '7 · Оборона берега'], ['Lanes.dc.html', '8 · Три фланга'], ['Siege.dc.html', '9 · Осада крепости'], ['Cards.dc.html', '10 · Колода приказов']];
const Y2 = 844 + 420;
row2.forEach(([f, t], i) => { canvas.boards[f] = { x: i * 470, y: Y2, w: 390, h: 844, title: t }; if (!canvas.order.includes(f)) canvas.order.push(f); });
canvas.notes = canvas.notes || {};
canvas.notes.head2 = { x: 0, y: Y2 - 260, text: 'Ещё 5 вариантов', kind: 'title1', maxW: 2270 };
canvas.notes.refs1 = { x: 2350, y: 0, w: 380, fill: 'orange', size: 'm', text:
  'Рефы, ряд 1\n\n1 · Линия фронта — Hearts of Iron IV (боевые планы и фронты)\n2 · План и исполнение — Frozen Synapse (одновременные ходы)\n3 · Строй и фланги — Rome: Total War, Ultimate General: Gettysburg (приказы рисуются путём)\n4 · Удержание высот — Company of Heroes, Battlefield «Захват»\n5 · Полководец на поле — Mount & Blade, Kingdom: Two Crowns' };
canvas.notes.refs2 = { x: 2350, y: Y2, w: 380, fill: 'orange', size: 'm', text:
  'Рефы, ряд 2\n\n6 · Расстановка и автобой — Art of War: Legions (мобильная), TABS\n7 · Оборона берега — Bad North (4 отряда на острове, высадки с разных сторон)\n8 · Три фланга — Warpips, Stick War: Legacy\n9 · Осада крепости — Stronghold, Kingdom Rush наоборот\n10 · Колода приказов — Clash Royale (карты на поле), Slay the Spire' };
fs.writeFileSync(path.join(out, 'canvas.json'), JSON.stringify(canvas, null, 1));
console.log('ok', row2.map(r => r[0]));
