// Tibur's own map (the art sheet toon2d/tibur.js, the same one as the capture battle) as a city map, so the rebellion in Tibur is played where the legion took the town.
// Everything of the art sheet lives inside one closure, so its helpers never clash with the other cities' art; city-gen.js pastes the sheet's code at the marker below.
// In the rebellion the mountain is solid rock except the tunnel: its grille is raised, the arch stands open and the rebels may come through it.
const TIB = (() => {
  /*TIBART*/
  const HOUSES_T = [[140, 210], [230, 180], [300, 280], [130, 380], [600, 200], [560, 290], [660, 140], [350, 450], [610, 420], [110, 300], [270, 250]];
  const APP_T = [[770, 0], [900, 0], [900, 1330], [830, 1320], [800, 1150], [790, 640], [770, 560]];
  const UPPER_T = [[770, 360], [740, 410], [700, 448], [690, 466]];
  const FOREST_T = [[250, 1110, 70, 40], [50, 1340, 50, 90], [620, 1100, 70, 34]];
  function bake(g, r) {
    grass(g, 0, 0, WW, WH, '#76c64a', r);
    plateau(g, TOWN_P, TOWN_P.slice(2).sort((a, b) => a[0] - b[0]), 30, '#8fd457', r);
    roads(g, [[TUNNEL, 36], [VALLEY, 30], [WEST_ST, 30, true], [TOWN_ROAD, 36, true], [NORTH, 36, true]], r);
    stream(g, TRER, 26, r); stream(g, UPPER_T, 26, r); stream(g, ANIO, 34, r); waterfall(g, 690, 462, 530, 34);
    for (const [x, y, s] of [[232, 586, 0.95], [246, 594, 1.05], [258, 588, 0.9], [240, 604, 0.85], [252, 606, 0.8]]) stone(g, x, y, s);
    stoneBridge(g, 450, 550, 598, 36); stairs(g, 262, 488, 32, 70);
    massif(g, r); apennines(g);
    cutaway(g, 450, 640, 1034, 44); exitStone(g, 450, 624);
    portcullis(g, 450, 1030, 0.62);   // the grille is raised: the arch stands open
    g.save(); g.translate(450, 1030); g.scale(0.62, 0.62); g.beginPath(); g.moveTo(-36, 2); g.lineTo(-36, -40); g.arc(0, -40, 36, Math.PI, 0); g.lineTo(36, 2); g.closePath(); fo(g, '#1a0e06', 3);
    g.strokeStyle = '#8a8a8a'; g.lineWidth = 3.2; for (let dx = -28; dx <= 28; dx += 11) { g.beginPath(); g.moveTo(dx, -70); g.lineTo(dx, -62); g.stroke(); } g.restore();
    for (const [x, y] of HOUSES_T) house(g, x, y);
    rock(g, 640, 486, 1.2); tree(g, 620, 470, 0.9);
    for (const [x, y, k] of [[40, 200, 1], [360, 140, 0.9], [540, 120, 0.9], [60, 470, 0.9]]) tree(g, x, y, k);
    g.beginPath(); g.ellipse(450, 320, 130, 70, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL;
    for (const [a0, a1] of [[-Math.PI / 2 + 0.17, Math.PI / 2 - 0.17], [Math.PI / 2 + 0.17, Math.PI - 0.3], [Math.PI + 0.3, Math.PI * 1.5 - 0.17]]) { g.beginPath(); g.ellipse(450, 320, 130, 70, 0, a0, a1); g.stroke(); }
    for (let a = 0; a < 6.28; a += 0.5) { g.beginPath(); g.ellipse(450 + Math.cos(a) * 100, 320 + Math.sin(a) * 52, 14, 7, 0, 0, 7); g.strokeStyle = 'rgba(150,120,80,.5)'; g.lineWidth = 1.4; g.stroke(); }
    roundTemple(g, 450, 320);
    mound(g, 122, 870, 44, 28); watchtower(g, 122, 868);
    FOREST_T.forEach(([x, y, rx, ry], i) => grove(g, x, y, rx, ry, [6, 7, 5][i], [5, 8, 4][i]));
    for (const [x, y, k] of [[340, 1260, 0.9], [570, 1260, 1], [30, 1460, 0.9], [870, 1440, 1]]) rock(g, x, y, k);
    mound(g, 300, 1180, 44, 26);
  }
  const hs = HOUSES_T.map(([x, y]) => ({ ell: [x, y - 12, 28, 18] }));
  return {
    bake,
    nav: {
      high: [{ poly: TOWN_P }],
      water: [{ line: ANIO, w: 34 }, { line: TRER, w: 26 }, { line: UPPER_T, w: 26 }],
      ford: [{ ell: [245, 596, 30, 28] }],
      deck: [{ rect: [426, 544, 48, 60] }],
      ramp: [{ rect: [244, 476, 36, 94] }, { rect: [428, 494, 44, 52] }],
      mound: [{ ell: [122, 870, 44, 28] }, { ell: [300, 1180, 44, 26] }],
      // the mountain on both sides of the tunnel, the Apennines in the east, the houses, the temple and the tower
      block: [{ poly: [[428, 598], [400, 616], [300, 640], [270, 790], [292, 990], [380, 1014], [428, 1004]] }, { poly: [[472, 600], [520, 600], [640, 612], [780, 590], [900, 610], [900, 1012], [700, 994], [560, 1016], [472, 1004]] },
        { poly: APP_T }, { rect: [392, 984, 36, 50] }, { rect: [472, 984, 36, 50] }, ...hs, { ell: [450, 304, 52, 28] }, { ell: [122, 856, 24, 14] }],
      road: [TUNNEL, VALLEY, WEST_ST, TOWN_ROAD, NORTH].map(l => ({ line: l, w: 34 }))
    }
  };
})();
CITYMAPS.tibur = {
  title: 'ТИБУР', sub: 'Тибур', seed: 11, draw: (g, r) => TIB.bake(g, r), win: 'Тибур удержан.', help: '',
  camp: { x: 665, y: 330, rx: 60, ry: 34 }, tents: [[640, 336], [690, 336], [665, 352]], starts: [[400, 400], [500, 400], [450, 432], [450, 372]], cam: { x: 450, y: 420 },
  enemies: [], forest: [], sites: [], nav: TIB.nav,
  points: [{ name: 'Сторожевая башня', x: 122, y: 880, r: 60, need: 4 }, { name: 'Дом старосты', x: 610, y: 420, r: 56, need: 4 }, { name: 'Храм Весты', x: -900, y: -900, r: 1, need: 99, final: true }]
};
