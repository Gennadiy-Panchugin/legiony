// Rebellion in a province: the governor's villa stands on its hill in the town square, rebels come in 5 waves down the roads,
// the legions hold the villa (it burns if they reach it). Appended after arena-spec.js; the page picks it by the frame name «legwar:rebel:<city>».
// Waves, gate markers, the wave chip and the call button are the arena's (arena-runtime.js); the villa and the rebels are rebel-runtime.js.
const REBEL_ID = (window.name.split(':')[2] || new URLSearchParams(location.search).get('city') || 'veii').toLowerCase();
const REBEL_NAME = { veii: 'Вейи', ostia: 'Остия', tibur: 'Тибур', antium: 'Анций', praeneste: 'Пренесте', capua: 'Капуя' };
const VILLA = { x: 450, y: 750 };
function govVilla(g, x, y) {   // marble terrace with steps, a columned hall, a terracotta roof, the Roman banner
  g.fillStyle = 'rgba(20,40,10,.32)'; g.beginPath(); g.ellipse(x + 12, y + 70, 150, 26, 0, 0, 7); g.fill();
  rr(g, x - 124, y - 30, 248, 96, 12); fo(g, '#d8ccb4', 3);
  for (let k = 0; k < 3; k++) { rr(g, x - 64 + k * 8, y + 62 + k * 9, 128 - k * 16, 9, 3); fo(g, k % 2 ? '#cfc3ac' : '#efe6d2', 2); }
  rr(g, x - 96, y - 92, 192, 72, 4); fo(g, '#efe6d2', 3);
  for (let k = 0; k < 6; k++) { rr(g, x - 86 + k * 34, y - 86, 13, 60, 4); fo(g, '#fffaf0', 2.2); }
  rr(g, x - 20, y - 56, 40, 36, 14); fo(g, '#3a2414', 2.4);
  g.beginPath(); g.moveTo(x - 112, y - 90); g.lineTo(x, y - 146); g.lineTo(x + 112, y - 90); g.closePath(); fo(g, '#c8603a', 3);
  g.beginPath(); g.moveTo(x, y - 146); g.lineTo(x + 112, y - 90); g.lineTo(x + 2, y - 90); g.closePath(); g.fillStyle = '#a84a2c'; g.fill();
  g.strokeStyle = 'rgba(90,30,10,.5)'; g.lineWidth = 1.6; for (let k = -92; k <= 92; k += 16) { g.beginPath(); g.moveTo(x + k, y - 92); g.lineTo(x + k * 0.1, y - 140); g.stroke(); }
  rr(g, x - 118, y - 94, 236, 8, 3); fo(g, '#8e3d22', 2.2);
  flag(g, x + 4, y - 214, '#e2382c', 52);
  for (const sx of [-1, 1]) { rr(g, x + sx * 138 - 8, y - 6, 16, 60, 4); fo(g, '#efe6d2', 2.4); rr(g, x + sx * 138 - 12, y - 14, 24, 10, 3); fo(g, '#d9cbaa', 2.2); }
}
function infirmary(g, x, y) {   // the legion's field hospital: a small stone hall with a terracotta roof and a green cross
  g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 8, y + 6, 64, 14, 0, 0, 7); g.fill();
  rr(g, x - 50, y - 38, 100, 44, 6); fo(g, '#efe6d2', 3);
  g.beginPath(); g.moveTo(x - 58, y - 36); g.lineTo(x, y - 70); g.lineTo(x + 58, y - 36); g.closePath(); fo(g, '#c8603a', 3);
  g.beginPath(); g.moveTo(x, y - 70); g.lineTo(x + 58, y - 36); g.lineTo(x + 2, y - 36); g.closePath(); g.fillStyle = '#a84a2c'; g.fill();
  rr(g, x - 12, y - 24, 24, 30, 10); fo(g, '#3a2414', 2.4);
  rr(g, x - 44, y - 28, 22, 22, 4); fo(g, '#fffaf0', 2.2); g.fillStyle = '#3aa655'; g.fillRect(x - 36, y - 25, 6, 16); g.fillRect(x - 41, y - 20, 16, 6);
  rr(g, x + 22, y - 28, 22, 22, 4); fo(g, '#fffaf0', 2.2); g.fillStyle = '#3aa655'; g.fillRect(x + 30, y - 25, 6, 16); g.fillRect(x + 25, y - 20, 16, 6);
  flag(g, x, y - 112, '#3aa655', 40);
}
function cot(g, x, y) {   // a litter with a red blanket: the spot where a wounded squad is nursed
  g.fillStyle = 'rgba(20,40,10,.28)'; g.beginPath(); g.ellipse(x + 3, y + 2, 28, 7, 0, 0, 7); g.fill();
  rr(g, x - 24, y - 12, 48, 18, 6); fo(g, '#f3ead6', 2.6); rr(g, x - 4, y - 10, 26, 14, 5); fo(g, '#c8362c', 2.2);
  g.beginPath(); g.ellipse(x - 14, y - 4, 7, 5, 0, 0, 7); fo(g, '#fffaf0', 2);
}
function infirmaryCamp(g, camp, spots) { g.beginPath(); g.ellipse(camp.x, camp.y, camp.rx, camp.ry, 0, 0, 7); g.fillStyle = 'rgba(190,140,80,.45)'; g.fill(); infirmary(g, camp.x, camp.y - 8); for (const [x, y] of spots) cot(g, x, y + 14); }
function winery(g, x, y) {   // a stone press house with a terracotta roof, barrels at the wall and a vat of must
  g.fillStyle = 'rgba(20,40,10,.3)'; g.beginPath(); g.ellipse(x + 8, y + 12, 78, 16, 0, 0, 7); g.fill();
  rr(g, x - 54, y - 40, 108, 52, 6); fo(g, '#efe6d2', 3);
  g.beginPath(); g.moveTo(x - 64, y - 38); g.lineTo(x, y - 76); g.lineTo(x + 64, y - 38); g.closePath(); fo(g, '#c8603a', 3);
  g.beginPath(); g.moveTo(x, y - 76); g.lineTo(x + 64, y - 38); g.lineTo(x + 2, y - 38); g.closePath(); g.fillStyle = '#a84a2c'; g.fill();
  rr(g, x - 14, y - 26, 28, 38, 12); fo(g, '#3a2414', 2.4);
  for (const bx of [-86, -66]) { rr(g, x + bx - 12, y - 22, 24, 32, 10); fo(g, '#a8783e', 2.4); for (const hy of [-14, 4]) { g.beginPath(); g.moveTo(x + bx - 12, y + hy); g.lineTo(x + bx + 12, y + hy); g.strokeStyle = '#4a2c14'; g.lineWidth = 2.2; g.stroke(); } }
  g.beginPath(); g.ellipse(x + 74, y + 2, 24, 13, 0, 0, 7); fo(g, '#8a5a30', 2.6); g.beginPath(); g.ellipse(x + 74, y - 2, 19, 9, 0, 0, 7); fo(g, '#7a2a6a', 2);
  g.beginPath(); g.arc(x + 74, y - 34, 6, 0, 7); fo(g, '#7a2a6a', 2); g.beginPath(); g.arc(x + 80, y - 30, 6, 0, 7); fo(g, '#8a3a7a', 2); g.beginPath(); g.moveTo(x + 76, y - 42); g.lineTo(x + 80, y - 50); g.strokeStyle = '#3a8a3a'; g.lineWidth = 3; g.stroke();
}
function rebelWorld(g, r) {
  grass(g, 0, 0, WW, WH, '#86c456', r);
  vineRows(g, 40, 1100, 230, 150); vineRows(g, 640, 1120, 220, 130);
  roads(g, [[[[0, 830], [150, 838], [300, 806], [390, 796]], 34], [[[900, 830], [750, 838], [600, 806], [510, 796]], 34], [[[450, 1500], [450, 1250], [450, 1000], [450, 860]], 36], [[[450, 0], [450, 300], [450, 560], [450, 650]], 30]], r);
  g.beginPath(); g.ellipse(450, 790, 250, 112, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.8; g.strokeStyle = OL; g.stroke();
  for (let a = 0; a < 6.283; a += 0.42) { g.beginPath(); g.ellipse(450 + Math.cos(a) * 205, 790 + Math.sin(a) * 90, 16, 8, 0, 0, 7); g.strokeStyle = 'rgba(150,120,80,.5)'; g.lineWidth = 1.4; g.stroke(); }
  // the infirmary behind the villa: cots refill the squads from a limited reserve
  g.beginPath(); g.ellipse(CAMP_R.x, CAMP_R.y, CAMP_R.rx, CAMP_R.ry, 0, 0, 7); g.fillStyle = 'rgba(190,140,80,.45)'; g.fill();
  for (const [x, y] of CAMP_TENTS) cot(g, x, y + 14); infirmary(g, CAMP_R.x, CAMP_R.y - 14);
  // stake barricades across the three roads, each with a narrow gap (a place to hold)
  for (const [x, y] of BARR_R) { g.save(); g.translate(x, y); if (x === 260 || x === 640) g.rotate(Math.PI / 2); barricade(g, 0, 0); g.restore(); }
  for (const [x, y] of HOUSES_R) { if (BURN_R.some(b => b[0] === x && b[1] === y)) burningHouse2(g, x, y); else house(g, x, y); }
  winery(g, 140, 1060); winery(g, 760, 1080);
  govVilla(g, VILLA.x, VILLA.y);
  for (const [x, y, s] of [[60, 560, 1], [840, 560, 1], [60, 1330, 0.9], [850, 1340, 1], ]) pine(g, x, y, s);
}
const CAMP_R = { x: 450, y: 440, rx: 120, ry: 42 }, CAMP_TENTS = [[450, 478]];
const BARR_R = [[260, 760], [260, 900], [640, 760], [640, 900], [380, 1000], [520, 1000]];
const HOUSES_R = [[120, 640], [220, 700], [100, 900], [230, 960], [340, 1020], [790, 640], [690, 700], [800, 900], [670, 960], [560, 1020], [330, 500], [570, 500], [250, 410], [650, 410], [330, 1140], [580, 1140]];
const BURN_R = [[100, 900], [800, 900], [250, 410], [560, 1020]];
const REBEL_WAVES = [
  { name: 'Мятежники с вилами', sp: [['rebel', 6, 'w']] },
  { name: 'Мятежники', sp: [['rebel', 7, 'e'], ['rebel', 5, 'w']] },
  { name: 'Поджигатели', sp: [['torcher', 5, 's'], ['rebel', 7, 'w'], ['rebel', 5, 'e']] },
  { name: 'Толпа', sp: [['rebel', 7, 'w'], ['rebel', 7, 'e'], ['torcher', 4, 's']] },
  { name: 'Вожак мятежа', boss: true, sp: [['agitator', 3, 'n'], ['rebel', 7, 'w'], ['rebel', 7, 'e'], ['torcher', 5, 's']] }
];
const PLAZA_MAP = {
  title: 'МЯТЕЖ', sub: REBEL_NAME[REBEL_ID] || 'Провинция', seed: 77, draw: (g, r) => rebelWorld(g, r), win: 'Мятеж подавлен — жители сложили оружие.',
  help: '<p><b>Цель:</b> удержать <b>виллу наместника</b> и отбить <b>5 волн мятежников</b>. Они идут по дорогам с запада, востока и юга, над входом маркер с числом и таймером; вожак придёт с севера. Если мятежники дойдут до виллы, она загорится: при 0% вы проиграли.</p>'
    + ARMY_HELP + '<p><b>Держитесь у баррикад:</b> в каждой — узкий проход. Две винодельни на виноградниках тоже под ударом: мятежники жгут их первыми, а пока они стоят, в резерв приходит +1 каждые 20 секунд. Лазарет за виллой пополняет отряды из резерва: встаньте у носилок. Поджигатели с факелами быстрые и жгут виллу вдвое сильнее — бейте их первыми. Кнопка «Позвать волну» вызывает следующую раньше.</p>',
  oneHeal: true, camp: CAMP_R, tents: CAMP_TENTS.slice(), starts: [[390, 850], [510, 850], [450, 890], [450, 810]], cam: { x: 450, y: 900 },
  nav: {
    block: [...houseBlocks(HOUSES_R), { rect: [330, 656, 240, 156] }, ...BARR_R.map(([x, y]) => (x === 260 || x === 640) ? { rect: [x - 12, y - 52, 24, 104] } : { rect: [x - 52, y - 12, 104, 24] }), { rect: [86, 1018, 108, 54] }, { rect: [706, 1038, 108, 54] }],
    road: [{ line: [[0, 830], [150, 838], [300, 806], [390, 796]], w: 34 }, { line: [[900, 830], [750, 838], [600, 806], [510, 796]], w: 34 }, { line: [[450, 1500], [450, 1250], [450, 1000], [450, 860]], w: 36 }, { line: [[450, 0], [450, 300], [450, 560], [450, 650]], w: 30 }]
  },
  sites: [],
  points: [{ name: '-', x: -900, y: -900, r: 1, need: 99 }, { name: '-', x: -900, y: -900, r: 1, need: 99 }, { name: 'Вилла', x: -900, y: -900, r: 1, need: 99, final: true }],
  enemies: [],
  waves: { objs: [{ name: 'Западная винодельня', x: 140, y: 1060, r: 62 }, { name: 'Восточная винодельня', x: 760, y: 1080, r: 62 }], first: 18, pause: 14, town: [450, 835], def: { x: 450, y: 750, name: 'Вилла наместника', r: 175, bar: -232 }, gates: { w: [60, 830], e: [840, 830], s: [450, 1400], n: [450, 120] }, names: { w: 'запад', e: 'восток', s: 'юг', n: 'север' }, list: REBEL_WAVES }
};

// ---------------------------------------------------------------- the rebellion on a city's own map
const REBEL_CITY = {
  tibur: { name: 'Храм Весты', at: [450, 340], r: 150, bar: -150, camp: { x: 665, y: 330, rx: 60, ry: 34 }, tents: [[665, 352]], starts: [[400, 400], [500, 400], [450, 432], [450, 372]], cam: { x: 450, y: 420 },
           gates: { n: [450, 30], e: [450, 1290], s: [330, 1270], w: [200, 1090] }, names: { n: 'север', e: 'туннель', s: 'юг', w: 'долина' }, scale: 1.1,
           note: 'Туннель в горе открыт, решётка поднята: мятежники идут через него, по западной долине и с севера по дороге.' },
  veii: { scale: 1.25, name: 'Храм Портоначчо', at: [680, 300], r: 150, bar: -190, camp: { x: 700, y: 130, rx: 100, ry: 38 }, tents: [[700, 158]], starts: [[650, 370], [720, 370], [600, 330], [680, 420]], cam: { x: 560, y: 760 },
          gates: { w: [40, 1290], s: [330, 1380], e: [860, 900], n: [160, 110] }, note: 'К храму ведут две лестницы.' },
  ostia: { name: 'Форум', at: [450, 340], r: 150, bar: -120, camp: { x: 672, y: 330, rx: 60, ry: 34 }, tents: [[676, 352]], starts: [[410, 425], [490, 420], [450, 462], [372, 372]], cam: { x: 450, y: 780 },
           gates: { n: [620, 40], e: [860, 500], s: [720, 1400], w: [300, 1250] }, note: 'Паром ходит: через восточный рукав Тибра мятежники идут по мостам и на пароме.' },
  antium: { name: 'Храм Фортуны', at: [500, 330], r: 150, bar: -120, camp: { x: 440, y: 170, rx: 55, ry: 28 }, tents: [[444, 190]], starts: [[470, 440], [540, 440], [500, 480], [570, 385]], cam: { x: 470, y: 780 },
            gates: { s: [450, 1400], e: [860, 700], n: [780, 120], w: [300, 1250] }, note: 'Мост через Астуру наведён: мятежники идут по мосту и по мели у устья.' },
  praeneste: { name: 'Святилище Фортуны', at: [450, 330], r: 150, bar: -190, camp: { x: 640, y: 330, rx: 50, ry: 28 }, tents: [[640, 350]], starts: [[400, 400], [500, 400], [450, 450], [450, 370]], cam: { x: 450, y: 780 },
               gates: { s: [450, 1400], e: [760, 1000], w: [100, 700], n: [60, 200] }, note: 'К холму ведут гать через болото и долгий обход к восточным воротам.' }
};
function rebelOnCity(id) {
  const base = CITYMAPS[id], c = REBEL_CITY[id];
  return { ...base, title: 'МЯТЕЖ', sub: REBEL_NAME[id], win: 'Мятеж подавлен — жители сложили оружие.', noCamp: true, oneHeal: true,
    help: '<p><b>Цель:</b> удержать главное здание города — <b>' + c.name.toLowerCase() + '</b> — и отбить <b>5 волн мятежников</b>. Они идут по дорогам города с четырёх сторон, над входом маркер с числом и таймером. Если мятежники дойдут до здания, оно загорится: при 0% вы проиграли.</p>' + ARMY_HELP
      + '<p>' + c.note + ' Кроме главного здания держите ещё два: мятежники жгут их первыми, пока они стоят, в резерв приходит +1 каждые 20 секунд. Лазарет пополняет отряды из резерва: встаньте у носилок. Завалы разобраны, мосты наведены и все проходы открыты, так что мятежники идут со всех сторон. Поджигатели быстрые и жгут здание вдвое сильнее — бейте их первыми. Кнопка «Позвать волну» вызывает следующую раньше.</p>',
    camp: c.camp, tents: c.tents.slice(), starts: c.starts, cam: c.cam, enemies: [], forest: base.forest,
    points: [{ name: '-', x: -900, y: -900, r: 1, need: 99 }, { name: '-', x: -900, y: -900, r: 1, need: 99 }, { name: c.name, x: -900, y: -900, r: 1, need: 99, final: true }],
    waves: { objs: base.points.filter(p => !p.final).slice(0, 2).map(p => ({ name: p.name, x: p.x, y: p.y, r: Math.min(p.r, 70) })), first: 18, pause: 14, town: c.at.slice(), def: { x: c.at[0], y: c.at[1], name: c.name, r: c.r, bar: c.bar }, gates: c.gates, names: c.names || { w: 'запад', e: 'восток', s: 'юг', n: 'север' }, list: c.scale ? REBEL_WAVES.map(w => ({ ...w, sp: w.sp.map(([cls, n, g]) => [cls, Math.round(n * c.scale), g]) })) : REBEL_WAVES } };
}
CITYMAPS.rebel = REBEL_CITY[REBEL_ID] && CITYMAPS[REBEL_ID] ? rebelOnCity(REBEL_ID) : PLAZA_MAP;
