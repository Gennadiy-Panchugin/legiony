// Generates five phone mock-ups (one per battle-mechanic option) for the Design canvas.
const fs = require('fs'), path = require('path');
const out = path.join(__dirname, 'project');
fs.mkdirSync(out, { recursive: true });

// deterministic crowd: small soldier rects scattered in an ellipse
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function crowd(cx, cy, rx, ry, n, seed) {
  const r = rnd(seed); let d = '';
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, k = Math.sqrt(r());
    const x = (cx + Math.cos(a) * rx * k).toFixed(1), y = (cy + Math.sin(a) * ry * k).toFixed(1);
    d += `M${x} ${y}h3.2v4.4h-3.2z`;
  }
  return d;
}
function block(x0, y0, cols, rows, gap) {               // a formed cohort: a grid of soldiers
  let d = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) d += `M${x0 + c * gap} ${y0 + r * gap}h3.2v4.4h-3.2z`;
  return d;
}
function wedge(x0, y0, rows, gap, dir) {                 // a triangle of riders pointing up (dir -1) or down (1)
  let d = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c <= r; c++) d += `M${x0 + (c - r / 2) * gap} ${y0 + dir * r * gap}h4v4h-4z`;
  return d;
}
const RED = '#c0261b', RED_D = '#7d1d16', BLUE = '#2f6fd6', BLUE_D = '#1d4a9a', GOLD = '#d9a441', INK = '#4a3420';

const parchment = `
  <rect x="0" y="0" width="390" height="630" fill="#e6d6ad"/>
  <circle cx="70" cy="120" r="90" fill="#d9c493" opacity=".35"/>
  <circle cx="320" cy="470" r="120" fill="#d4bd88" opacity=".3"/>
  <circle cx="240" cy="60" r="60" fill="#f1e4c3" opacity=".5"/>
  <rect x="10" y="10" width="370" height="610" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="2 5"/>`;
const peak = (x, y, s) => `<path d="M${x - s} ${y}L${x} ${y - s * 1.3}L${x + s} ${y}Z" fill="#cdb98c" stroke="${INK}" stroke-width="1.4"/><path d="M${x} ${y - s * 1.3}L${x + s * 0.35} ${y - s * 0.7}L${x} ${y - s * 0.8}Z" fill="#fff8e6"/>`;
const tent = (x, y, c) => `<path d="M${x - 18} ${y}L${x} ${y - 26}L${x + 18} ${y}Z" fill="${c}" stroke="${INK}" stroke-width="1.6"/><path d="M${x - 6} ${y}L${x} ${y - 14}L${x + 6} ${y}Z" fill="#2a1c10"/><path d="M${x} ${y - 26}V${y - 40}" stroke="${INK}" stroke-width="1.6"/><path d="M${x} ${y - 40}l12 4l-12 4z" fill="${c}"/>`;
const label = (x, y, t, c) => `<g><rect x="${x - t.length * 3.3 - 6}" y="${y - 11}" width="${t.length * 6.6 + 12}" height="18" rx="4" fill="#1e1913" fill-opacity=".85"/><text x="${x}" y="${y + 2}" text-anchor="middle" font-size="11" font-weight="700" fill="${c || '#f6e7bf'}" font-family="Alegreya Sans, sans-serif">${t}</text></g>`;

function page(title, eyebrow, hudTitle, hudSub, chip, svg, hint, buttons, accentBar) {
  const btns = buttons.map(b => `<button type="button" style="flex: 1 1 0; min-width: 0; height: 52px; border-radius: 12px; border: 1px solid ${b.primary ? GOLD : '#4a3d2c'}; background: ${b.primary ? GOLD : '#2a231a'}; color: ${b.primary ? '#1e1408' : '#efe6d2'}; font: 700 13px 'Alegreya Sans', sans-serif; letter-spacing: .02em; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; cursor: pointer">${b.icon || ''}<span>${b.label}</span></button>`).join('\n      ');
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@600;700&amp;family=Alegreya+Sans:wght@400;500;700&amp;display=swap">
<style>
body{margin:0}
a{color:#d9a441}a:hover{color:#f0c66a}
</style>
</helmet>
<div style="width: 390px; height: 844px; box-sizing: border-box; background: #17130e; color: #efe6d2; font-family: 'Alegreya Sans', sans-serif; display: flex; flex-direction: column; overflow: hidden">
  <div style="height: 64px; flex: none; display: flex; align-items: center; gap: 10px; padding: 0 14px; background: #1e1913; border-bottom: 1px solid #3a3024">
    <button type="button" aria-label="Сдаться" style="width: 44px; height: 44px; border-radius: 10px; border: 1px solid #4a3d2c; background: #2a231a; color: #efe6d2; font-size: 18px; cursor: pointer">⚑</button>
    <div style="flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; line-height: 1.15">
      <span style="font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: ${GOLD}; font-weight: 700">${eyebrow}</span>
      <span style="font-family: 'Cormorant SC', serif; font-size: 22px; font-weight: 700; letter-spacing: .04em">${hudTitle}</span>
      <span style="font-size: 12px; color: #b8aa8c">${hudSub}</span>
    </div>
    <span style="padding: 6px 10px; border-radius: 999px; border: 1px solid #4a3d2c; background: #2a231a; font-size: 13px; font-weight: 700; color: #f6e7bf; white-space: nowrap">${chip}</span>
  </div>
  ${accentBar || ''}
  <div style="flex: 1 1 auto; position: relative; min-height: 0">
    <svg width="390" height="630" viewBox="0 0 390 630" style="display: block" role="img" aria-label="${title}">
      <defs>
        <marker id="arR" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${RED}"/></marker>
        <marker id="arB" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${BLUE}"/></marker>
        <marker id="arW" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#fff8e6"/></marker>
        <marker id="arG" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${GOLD}"/></marker>
      </defs>
      ${parchment}
      ${svg}
    </svg>
    <div style="position: absolute; left: 16px; right: 16px; bottom: 12px; display: flex; justify-content: center">
      <div style="max-width: 100%; padding: 9px 14px; border-radius: 12px; background: rgba(23,19,14,.92); border: 1px solid ${GOLD}; color: #f6d77a; font-size: 13px; font-weight: 700; text-align: center; line-height: 1.3">${hint}</div>
    </div>
  </div>
  <div style="height: 86px; flex: none; display: flex; align-items: center; gap: 8px; padding: 0 12px; background: #1e1913; border-top: 1px solid #3a3024">
      ${btns}
  </div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":390,"height":844}}'>
class Component extends DCLogic {
renderVals() {
return {};
}
}
</script>
</body>
</html>
`;
}
const ico = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

// ================================================================ 1. Front line
{
  const front = 'M0 300 C40 285 70 330 115 312 S175 250 215 262 S280 330 320 300 S370 270 390 282';
  const svg = `
  <path d="${front} L390 630 L0 630 Z" fill="${RED}" fill-opacity=".10"/>
  <path d="${front} L390 0 L0 0 Z" fill="${BLUE}" fill-opacity=".10"/>
  <path d="M0 150 C80 135 150 175 230 150 S340 120 390 140" stroke="#5d8fbf" stroke-width="16" fill="none" opacity=".8"/>
  <path d="M0 150 C80 135 150 175 230 150 S340 120 390 140" stroke="#9cc3e6" stroke-width="5" fill="none" stroke-dasharray="6 12" opacity=".8"/>
  <rect x="242" y="134" width="30" height="24" fill="#8a6a3c" stroke="${INK}" stroke-width="1.4"/>
  ${peak(330, 236, 18)}${peak(355, 248, 14)}${peak(60, 470, 16)}
  ${tent(195, 70, BLUE)}${label(195, 92, 'Лагерь врага', '#9ec1ff')}
  ${tent(195, 585, RED)}
  <path d="${front}" stroke="#2a1c10" stroke-width="3.5" fill="none"/>
  <path d="${front}" stroke="#fff8e6" stroke-width="1.2" fill="none" stroke-dasharray="5 6"/>
  <path d="${crowd(80, 322, 60, 12, 70, 1)}${crowd(210, 280, 50, 12, 60, 2)}${crowd(320, 318, 45, 12, 50, 3)}" fill="${RED}"/>
  <path d="${crowd(70, 284, 55, 12, 60, 4)}${crowd(205, 240, 50, 12, 55, 5)}${crowd(318, 280, 42, 11, 45, 6)}" fill="${BLUE}"/>
  <path d="M150 470 C150 400 180 330 205 255" stroke="${RED}" stroke-width="12" stroke-linecap="round" fill="none" opacity=".75" marker-end="url(#arR)"/>
  <path d="M310 450 C330 400 330 360 318 322" stroke="${RED}" stroke-width="9" stroke-linecap="round" fill="none" opacity=".55" marker-end="url(#arR)"/>
  <path d="M20 360 C70 372 110 372 150 360" stroke="${RED_D}" stroke-width="5" fill="none" stroke-dasharray="10 6"/>
  ${label(85, 392, 'Рубеж — держать')}
  ${label(160, 205, 'Наступление')}
  <path d="M205 210 C230 200 250 196 262 160" stroke="${BLUE}" stroke-width="6" fill="none" opacity=".5" stroke-dasharray="4 5" marker-end="url(#arB)"/>
  `;
  const bar = `<div style="height: 26px; flex: none; display: flex; align-items: center; gap: 8px; padding: 0 14px; background: #1e1913; border-bottom: 1px solid #3a3024; font-size: 11px; color: #b8aa8c">
    <span style="color: #ff8a80; font-weight: 700">Рим 58%</span>
    <div style="flex: 1 1 auto; height: 8px; border-radius: 999px; background: ${BLUE}; overflow: hidden"><div style="width: 58%; height: 100%; background: ${RED}"></div></div>
    <span style="color: #9ec1ff; font-weight: 700">42%</span></div>`;
  fs.writeFileSync(path.join(out, 'Main.dc.html'), page('Линия фронта', 'Вариант 1 · рекомендую', 'Линия фронта', 'Нарисуйте стрелку — легион давит фронт', '1:12', svg,
    'Проведите стрелку от своих войск — они пойдут в наступление вдоль неё',
    [{ label: 'Стрелка', icon: ico('<path d="M4 20 L18 6"/><path d="M10 6h8v8"/>'), primary: true }, { label: 'Рубеж', icon: ico('<path d="M3 16 h18" stroke-dasharray="4 3"/><path d="M3 10h18"/>') }, { label: 'Клич', icon: ico('<path d="M4 10v4l10 5V5z"/>') }, { label: 'Резерв', icon: ico('<path d="M12 5v14M5 12h14"/>') }], bar));
}

// ================================================================ 2. Plan and execute
{
  const coh = [[70, 520, 'I'], [140, 540, 'II'], [215, 545, 'III'], [290, 535, 'IV'], [345, 505, 'V']];
  const paths = ['M70 515 C60 450 70 390 95 330', 'M140 535 C150 470 160 420 175 360', 'M215 540 C215 470 220 420 235 365', 'M290 530 C300 470 330 420 345 360', 'M345 500 C380 430 375 330 330 250'];
  const ends = [[95, 318], [175, 348], [235, 352], [345, 348], [330, 240]];
  let svg = `
  <path d="M0 180 L390 180 L390 0 L0 0 Z" fill="#2a2a3a" opacity=".16"/>
  ${peak(80, 300, 16)}${peak(105, 310, 12)}
  <path d="M0 250 C120 240 250 270 390 235" stroke="#5d8fbf" stroke-width="12" fill="none" opacity=".7"/>
  <rect x="225" y="240" width="26" height="22" fill="#8a6a3c" stroke="${INK}" stroke-width="1.4"/>
  <g opacity=".45"><path d="${block(70, 120, 6, 3, 6)}${block(170, 100, 7, 3, 6)}${block(275, 125, 6, 3, 6)}" fill="${BLUE}"/></g>
  <text x="96" y="110" text-anchor="middle" font-size="18" font-weight="700" fill="${BLUE_D}" opacity=".6" font-family="Cormorant SC, serif">?</text>
  <text x="300" y="115" text-anchor="middle" font-size="18" font-weight="700" fill="${BLUE_D}" opacity=".6" font-family="Cormorant SC, serif">?</text>
  ${label(195, 74, 'Враг тоже планирует — его ход скрыт', '#c7d6ff')}`;
  coh.forEach(([x, y, n], i) => {
    svg += `<path d="${paths[i]}" stroke="#fff8e6" stroke-width="3" fill="none" stroke-dasharray="7 6" marker-end="url(#arW)"/>
    <path d="${paths[i]}" stroke="${RED}" stroke-width="1.6" fill="none" stroke-dasharray="7 6" opacity=".9"/>
    <rect x="${ends[i][0] - 16}" y="${ends[i][1] - 8}" width="32" height="16" rx="3" fill="none" stroke="${RED}" stroke-width="1.6" stroke-dasharray="3 3"/>
    <path d="${block(x - 15, y - 9, 6, 3, 6)}" fill="${RED}"/>
    <circle cx="${x}" cy="${y - 22}" r="11" fill="#1e1913" stroke="${GOLD}" stroke-width="1.6"/>
    <text x="${x}" y="${y - 18}" text-anchor="middle" font-size="11" font-weight="700" fill="#f6e7bf" font-family="Cormorant SC, serif">${n}</text>`;
  });
  svg += `${label(330, 220, 'Конница — в обход')}
  <g><circle cx="345" cy="40" r="22" fill="#1e1913" stroke="${GOLD}" stroke-width="2"/><path d="M345 18 A22 22 0 1 1 323.4 44" fill="none" stroke="${RED}" stroke-width="4"/><text x="345" y="45" text-anchor="middle" font-size="13" font-weight="700" fill="#f6e7bf" font-family="Alegreya Sans, sans-serif">0:09</text></g>`;
  const bar = `<div style="height: 26px; flex: none; display: flex; align-items: center; justify-content: center; gap: 6px; background: #2a1f12; border-bottom: 1px solid ${GOLD}; font-size: 12px; font-weight: 700; color: ${GOLD}; letter-spacing: .08em; text-transform: uppercase">Пауза · фаза плана</div>`;
  fs.writeFileSync(path.join(out, 'Plan.dc.html'), page('План и исполнение', 'Вариант 2', 'Раунд 2 из 5', 'Задайте путь каждой когорте', '5 когорт', svg,
    'Протяните путь от когорты. Когда все готовы — «В бой»: 15 секунд обе армии исполняют приказы',
    [{ label: 'Отменить путь', icon: ico('<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>') }, { label: 'В бой · 15 с', icon: ico('<path d="M7 4v16l13-8z"/>'), primary: true }], bar));
}

// ================================================================ 3. Formations and flanks
{
  const svg = `
  ${peak(40, 120, 14)}${peak(360, 520, 16)}
  <path d="${block(90, 160, 12, 3, 6)}" fill="${BLUE}"/>
  <path d="${block(230, 175, 10, 3, 6)}" fill="${BLUE}"/>
  <path d="${wedge(330, 120, 5, 6, 1)}" fill="${BLUE}"/>
  <path d="${block(70, 330, 14, 3, 6)}" fill="${RED}"/>
  ${label(110, 365, 'Линия')}
  <rect x="212" y="318" width="44" height="44" fill="none" stroke="${GOLD}" stroke-width="1.6"/>
  <path d="${block(216, 322, 7, 7, 6)}" fill="${RED}"/>
  <path d="M212 318h44v44h-44z" fill="${GOLD}" fill-opacity=".12"/>
  ${label(234, 380, 'Черепаха')}
  <circle cx="234" cy="340" r="36" fill="none" stroke="${GOLD}" stroke-width="2.5" stroke-dasharray="6 4"/>
  <path d="M262 312 A40 40 0 0 1 270 330" stroke="${GOLD}" stroke-width="3" fill="none" marker-end="url(#arG)"/>
  <path d="${wedge(330, 420, 6, 6, -1)}" fill="${RED}"/>
  ${label(330, 440, 'Клин конницы')}
  <path d="M335 385 C360 300 340 230 290 210" stroke="${RED}" stroke-width="9" stroke-linecap="round" fill="none" opacity=".75" marker-end="url(#arR)"/>
  <g><rect x="250" y="250" width="110" height="30" rx="6" fill="${RED_D}"/><text x="305" y="270" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Alegreya Sans, sans-serif">Удар во фланг ×2</text></g>
  <path d="M120 320 C120 280 130 240 140 205" stroke="${RED}" stroke-width="5" fill="none" opacity=".5" stroke-dasharray="6 5" marker-end="url(#arR)"/>
  ${label(195, 130, 'Тыл врага: удар ×3 и паника', '#c7d6ff')}
  `;
  fs.writeFileSync(path.join(out, 'Formation.dc.html'), page('Строй и фланги', 'Вариант 3', 'Строй и фланги', 'Выбрана: II когорта · черепаха', '4 когорты', svg,
    'Тяните когорту пальцем, поворачивайте дугой. Бейте во фланг и тыл',
    [{ label: 'Линия', icon: ico('<path d="M3 12h18"/><path d="M3 8h18"/>') }, { label: 'Черепаха', icon: ico('<rect x="5" y="5" width="14" height="14"/>'), primary: true }, { label: 'Клин', icon: ico('<path d="M12 4 20 19H4z"/>') }, { label: 'Каре', icon: ico('<rect x="6" y="6" width="12" height="12"/><rect x="9" y="9" width="6" height="6"/>') }]));
}

// ================================================================ 4. Hold the heights
{
  const pt = (x, y, name, bonus, redPct, icon) => {
    const r = 30, c = 2 * Math.PI * r, red = c * redPct;
    return `<circle cx="${x}" cy="${y}" r="${r + 10}" fill="${redPct > 0.5 ? RED : BLUE}" fill-opacity=".08"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="#efe3c3" stroke="#bfae84" stroke-width="7"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${RED}" stroke-width="7" stroke-dasharray="${red.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${x} ${y})"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${BLUE}" stroke-width="7" stroke-dasharray="0 ${red.toFixed(1)} ${(c - red).toFixed(1)} 0" transform="rotate(-90 ${x} ${y})"/>
    ${icon}
    ${label(x, y + 52, name)}
    <text x="${x}" y="${y + 72}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${INK}" font-family="Alegreya Sans, sans-serif">${bonus}</text>`;
  };
  const svg = `
  <path d="M0 330 C100 320 260 350 390 320" stroke="#5d8fbf" stroke-width="18" fill="none" opacity=".75"/>
  <path d="M0 330 C100 320 260 350 390 320" stroke="#9cc3e6" stroke-width="5" fill="none" stroke-dasharray="6 12"/>
  ${tent(195, 590, RED)}${tent(195, 60, BLUE)}
  <path d="M180 560 C120 500 90 440 85 390" stroke="${RED}" stroke-width="10" stroke-linecap="round" fill="none" opacity=".6" marker-end="url(#arR)"/>
  <path d="M200 560 C200 480 200 420 200 372" stroke="${RED}" stroke-width="10" stroke-linecap="round" fill="none" opacity=".6" marker-end="url(#arR)"/>
  <path d="M210 82 C260 140 300 180 310 218" stroke="${BLUE}" stroke-width="10" stroke-linecap="round" fill="none" opacity=".55" marker-end="url(#arB)"/>
  <path d="${crowd(85, 360, 32, 14, 40, 11)}${crowd(200, 345, 26, 12, 30, 12)}" fill="${RED}"/>
  <path d="${crowd(310, 250, 30, 14, 40, 13)}${crowd(205, 315, 22, 10, 20, 14)}" fill="${BLUE}"/>
  ${pt(85, 360, 'Холм', '+дальность лучникам', 0.85, peak(85, 370, 12))}
  ${pt(200, 332, 'Брод', 'переправа через реку', 0.55, `<path d="M186 334 q7 -6 14 0 t14 0" stroke="#3b6fa8" stroke-width="3" fill="none"/>`)}
  ${pt(310, 240, 'Святилище', '+подкрепления', 0.2, `<path d="M296 250h28M299 250v-14M305 250v-14M315 250v-14M321 250v-14M294 236l16-10 16 10z" stroke="${INK}" stroke-width="2" fill="none"/>`)}
  `;
  const bar = `<div style="height: 26px; flex: none; display: flex; align-items: center; gap: 8px; padding: 0 14px; background: #1e1913; border-bottom: 1px solid #3a3024; font-size: 11px; color: #b8aa8c">
    <span style="color: #ff8a80; font-weight: 700">Слава 340</span>
    <div style="flex: 1 1 auto; height: 8px; border-radius: 999px; background: #3a3024; overflow: hidden"><div style="width: 68%; height: 100%; background: ${RED}"></div></div>
    <span style="color: #9ec1ff; font-weight: 700">210</span><span>до 500</span></div>`;
  fs.writeFileSync(path.join(out, 'Heights.dc.html'), page('Удержание высот', 'Вариант 4', 'Удержание высот', 'Высоты: 2 у вас · 1 у врага', '1:48', svg,
    'Ведите войска на высоты. Кто стоит на высоте — тот её держит и копит славу',
    [{ label: 'Стрелка', icon: ico('<path d="M4 20 L18 6"/><path d="M10 6h8v8"/>'), primary: true }, { label: 'Снять', icon: ico('<path d="M6 6l12 12M18 6 6 18"/>') }, { label: 'Клич', icon: ico('<path d="M4 10v4l10 5V5z"/>') }, { label: 'Щиты', icon: ico('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>') }], bar));
}

// ================================================================ 5. General on the field
{
  const general = (x, y, c, cd) => `<ellipse cx="${x}" cy="${y + 4}" rx="20" ry="8" fill="#e4ded2" stroke="${INK}" stroke-width="1.4"/>
    <path d="M${x + 14} ${y}l10 -14l6 2l-8 14z" fill="#e4ded2" stroke="${INK}" stroke-width="1.2"/>
    <path d="M${x - 14} ${y + 8}v12M${x - 6} ${y + 9}v12M${x + 8} ${y + 9}v12M${x + 14} ${y + 8}v12" stroke="#bfb8aa" stroke-width="3"/>
    <rect x="${x - 5}" y="${y - 20}" width="10" height="16" fill="${GOLD}"/>
    <circle cx="${x}" cy="${y - 25}" r="5" fill="#e0b48a"/>
    <path d="M${x - 5} ${y - 27}a5 5 0 0 1 10 0z" fill="${GOLD}"/>
    <path d="M${x - 8} ${y - 31}h16" stroke="${c}" stroke-width="3"/>
    <path d="M${x + 9} ${y - 18}V${y - 58}" stroke="${INK}" stroke-width="2"/>
    <path d="M${x + 9} ${y - 58}h20v14h-20z" fill="${c}" stroke="${cd}" stroke-width="1"/>`;
  const svg = `
  ${peak(60, 200, 16)}${peak(340, 420, 15)}
  <circle cx="160" cy="430" r="92" fill="${GOLD}" fill-opacity=".08" stroke="${GOLD}" stroke-width="2" stroke-dasharray="8 6"/>
  ${label(160, 538, 'Радиус приказа')}
  <path d="${crowd(160, 440, 80, 60, 150, 21)}" fill="${RED}"/>
  ${general(160, 420, RED, RED_D)}
  <circle cx="250" cy="170" r="80" fill="${BLUE}" fill-opacity=".06" stroke="${BLUE}" stroke-width="2" stroke-dasharray="8 6" opacity=".7"/>
  <path d="${crowd(250, 175, 70, 50, 120, 22)}" fill="${BLUE}"/>
  ${general(250, 160, BLUE, BLUE_D)}
  <path d="M40 330 C110 320 220 320 330 300" stroke="${RED_D}" stroke-width="5" fill="none" stroke-dasharray="10 6"/>
  ${label(285, 330, 'Держать рубеж')}
  <path d="M175 360 C200 300 220 260 240 228" stroke="${RED}" stroke-width="11" stroke-linecap="round" fill="none" opacity=".75" marker-end="url(#arR)"/>
  ${label(120, 300, 'Знамя вперёд!')}
  <g><rect x="110" y="380" width="100" height="6" rx="3" fill="#2a1c10"/><rect x="110" y="380" width="78" height="6" rx="3" fill="#6fd17a"/></g>
  `;
  fs.writeFileSync(path.join(out, 'General.dc.html'), page('Полководец на поле', 'Вариант 5', 'Полководец на поле', 'Сципион · легион следует за знаменем', 'HP 78%', svg,
    'Ведите полководца — войска в радиусе приказа идут за ним. Потеряете его — легион дрогнет',
    [{ label: 'Знамя вперёд', icon: ico('<path d="M6 21V4"/><path d="M6 4h11l-3 4 3 4H6"/>'), primary: true }, { label: 'Держать', icon: ico('<path d="M3 16 h18" stroke-dasharray="4 3"/>') }, { label: 'Клич', icon: ico('<path d="M4 10v4l10 5V5z"/>') }, { label: 'Сомкнуть', icon: ico('<rect x="5" y="5" width="14" height="14"/>') }]));
}

// ================================================================ the canvas index
const names = [['Main.dc.html', '1 · Линия фронта (рекомендую)'], ['Plan.dc.html', '2 · План и исполнение'], ['Formation.dc.html', '3 · Строй и фланги'], ['Heights.dc.html', '4 · Удержание высот'], ['General.dc.html', '5 · Полководец на поле']];
const boards = {};
names.forEach(([f, t], i) => { boards[f] = { x: i * 470, y: 0, w: 390, h: 844, title: t }; });
const canvas = {
  v: 3, createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') },
  title: 'Легионы — 5 механик боя', launch: { view: 'canvas' }, pages: [], boards, order: names.map(n => n[0]),
  notes: { head: { x: 0, y: -260, text: 'Легионы — 5 вариантов механики боя', kind: 'title1', maxW: 2270 } }, designSystems: []
};
fs.writeFileSync(path.join(out, 'canvas.json'), JSON.stringify(canvas, null, 1));
console.log('ok', fs.readdirSync(out));
