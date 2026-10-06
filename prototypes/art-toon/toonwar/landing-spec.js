// The landing on Sardinia («Рассвет у нурагов», art sheet toon2d/sardinia.js) as a city battle: the map data and the picture.
// The shared drawing pieces (the marker below) are copied in by city-gen.js from the art sheet and live in their own scope, so they cannot clash with the other maps' helpers.
const LD_WL = x => 1130 + 16 * Math.sin(x * 0.012) + 8 * Math.sin(x * 0.0276), LD_DP = x => 1240 + 14 * Math.sin(x * 0.01 + 1) + 7 * Math.sin(x * 0.023 + 2);
const ldEdge = f => { const out = []; for (let x = 0; x <= 900; x += 20) out.push([x, f(x)]); return out; };
const LD_DUNES = [[150, 860, 80, 26], [330, 800, 70, 22], [640, 830, 84, 26], [800, 900, 70, 24], [90, 980, 60, 20]];
const LANDING = (() => {
/*PIECES*/
  function draw(g, r) {
    const t = 0, wl = LD_WL, dp = LD_DP;
    g.fillStyle = '#7ba83a'; g.fillRect(0, 0, 900, 1500);
    for (let i = 0; i < 160; i++) { const x = r() * 900, y = 120 + r() * 980; g.fillStyle = r() < 0.5 ? 'rgba(255,255,160,.14)' : 'rgba(40,90,20,.14)'; g.beginPath(); g.ellipse(x, y, 20 + r() * 26, 8 + r() * 8, 0, 0, 7); g.fill(); }
    const sg = g.createLinearGradient(0, 1130, 0, 1500); sg.addColorStop(0, '#7fe0d0'); sg.addColorStop(0.3, '#1fa7c9'); sg.addColorStop(1, '#1580a8'); g.fillStyle = sg; g.fillRect(0, 1100, 900, 400);
    band(g, dp, 1500, '#1fa7c9');
    g.beginPath(); g.moveTo(0, wl(0)); for (let x = 12; x <= 900; x += 12) g.lineTo(x, wl(x)); for (let x = 900; x >= 0; x -= 12) g.lineTo(x, dp(x)); g.closePath(); g.fillStyle = '#86e3d2'; g.fill();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2.5; for (let k = 0; k < 40; k++) { const x = r() * 900, y = wl(x) + 14 + r() * 80; g.beginPath(); g.moveTo(x - 14, y); g.quadraticCurveTo(x, y - 5, x + 14, y); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; for (let k = 0; k < 36; k++) { const x = r() * 900, y = 1260 + r() * 230; g.beginPath(); g.moveTo(x - 20, y); g.quadraticCurveTo(x, y - 7, x + 20, y); g.stroke(); }
    const top = x => shoreY(x, 930, 30, 0.009, 2);
    g.beginPath(); g.moveTo(0, wl(0)); for (let x = 12; x <= 900; x += 12) g.lineTo(x, wl(x)); for (let x = 900; x >= 0; x -= 12) g.lineTo(x, top(x)); g.closePath(); fo(g, '#f2d48a', 3.4);
    g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 40; k++) { const x = r() * 900, y = 960 + r() * 150; g.beginPath(); g.ellipse(x, y, 6 + r() * 14, 2.5, 0, 0, 7); g.fill(); }
    foam(g, wl, t, 0.9);
    // the spit with the beachhead camp
    g.beginPath(); g.moveTo(402, 1110); g.quadraticCurveTo(408, 1170, 430, 1206); g.lineTo(470, 1206); g.quadraticCurveTo(492, 1170, 498, 1110); g.closePath(); fo(g, '#f2d48a', 3.4);
    g.beginPath(); g.moveTo(436, 1192); g.quadraticCurveTo(450, 1218, 464, 1192); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; g.stroke();
    
    for (const [x, y, rx, ry] of LD_DUNES) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI, 0); g.closePath(); fo(g, '#eecb7a', 3); g.beginPath(); g.ellipse(x + rx * 0.2, y - ry * 0.5, rx * 0.45, ry * 0.3, 0, Math.PI, 0); g.fillStyle = 'rgba(255,245,200,.55)'; g.fill(); }
    // rock ridges with the passes between them: left, centre (between the two outcrops) and right; the side passes are blocked by rubble
    ridge(g, 110, 650, 160, 130, '#8c7a6b', 'rgba(60,40,30,.28)'); ridge(g, 790, 650, 160, 130, '#8c7a6b', 'rgba(60,40,30,.28)');
    ridge(g, 370, 592, 40, 34, '#8c7a6b', 'rgba(60,40,30,.28)'); ridge(g, 530, 592, 40, 34, '#8c7a6b', 'rgba(60,40,30,.28)');
    // the roads: the middle one to the gate, two narrower side ones over the rubble passes
    const road = (pts, w) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = w + 6; g.strokeStyle = OL; g.stroke(); g.lineWidth = w; g.strokeStyle = '#e3c98a'; g.stroke(); };
    road([[300, 905], [310, 800], [300, 680], [305, 560], [305, 480]], 24); road([[600, 905], [590, 800], [600, 680], [595, 560], [595, 480]], 24); road([[420, 930], [430, 800], [450, 680], [450, 520], [450, 440]], 32);
    { const gr = g.createLinearGradient(0, 900, 0, 1120); gr.addColorStop(0, '#e3c98a'); gr.addColorStop(1, '#9a7442');
      g.beginPath(); g.moveTo(404, 900); g.bezierCurveTo(396, 980, 380, 1040, 372, 1118); g.lineTo(492, 1118); g.bezierCurveTo(482, 1040, 466, 980, 442, 900); g.closePath(); g.fillStyle = gr; g.fill();
      g.strokeStyle = 'rgba(43,26,16,.8)'; g.lineWidth = 3.2; g.beginPath(); g.moveTo(404, 900); g.bezierCurveTo(396, 980, 380, 1040, 372, 1118); g.moveTo(442, 900); g.bezierCurveTo(466, 980, 482, 1040, 492, 1118); g.stroke();
      for (const [x, y, rx, ry] of [[424, 980, 18, 7], [440, 1030, 26, 8], [410, 1080, 22, 7]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fillStyle = 'rgba(70,45,20,.5)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.8; g.stroke(); }
      for (const [x, y, s, c] of [[392, 940, 1, '#b9ab94'], [458, 950, 1.1, '#9a8c76'], [384, 1000, 1.1, '#9a8c76'], [470, 1010, 1, '#b9ab94'], [372, 1060, 0.9, '#b9ab94'], [486, 1070, 1.2, '#9a8c76'], [398, 970, 0.7, '#b9ab94'], [452, 990, 0.7, '#b9ab94']]) { g.beginPath(); g.ellipse(x, y, 8 * s, 5 * s, 0, 0, 7); fo(g, c, 2.2); g.beginPath(); g.ellipse(x - 2 * s, y - 2 * s, 3.4 * s, 1.7 * s, 0, 0, 7); g.fillStyle = '#d6cab6'; g.fill(); } }
    // the wet causeway runs on from the road's end down to the moored galley
    { g.beginPath(); g.moveTo(372, 1116); g.lineTo(492, 1116); g.lineTo(500, 1170); g.lineTo(396, 1170); g.closePath(); g.fillStyle = '#9a7442'; g.fill(); g.strokeStyle = 'rgba(43,26,16,.8)'; g.lineWidth = 3.2; g.beginPath(); g.moveTo(372, 1116); g.lineTo(396, 1170); g.moveTo(492, 1116); g.lineTo(500, 1170); g.stroke();
      for (const [x, y, rx, ry] of [[440, 1140, 22, 6], [460, 1160, 16, 5]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fillStyle = 'rgba(70,45,20,.5)'; g.fill(); }
      for (const [x, y, s, c] of [[378, 1134, 1, '#9a8c76'], [498, 1146, 1, '#b9ab94'], [392, 1162, 0.9, '#b9ab94']]) { g.beginPath(); g.ellipse(x, y, 8 * s, 5 * s, 0, 0, 7); fo(g, c, 2.2); } }
    // scrub, olives and the grove of the ambush on the east dunes
    for (const [x, y, s] of [[260, 920, 1], [560, 920, 1.1], [700, 770, 1], [250, 780, 1], [480, 820, 0.9], [60, 780, 1], [850, 780, 1], [830, 1030, 0.9], [870, 980, 0.9]]) maquis(g, x, y, s);
    for (const [x, y, s] of [[200, 720, 1], [680, 700, 1.1], [60, 880, 1], [820, 990, 1], [860, 1010, 1], [840, 1035, 0.9], [200, 1040, 0.9], [74, 790, 1], [110, 812, 1], [92, 770, 0.9], [506, 742, 1], [540, 756, 1], [524, 726, 0.9], [560, 735, 0.9]]) olive(g, x, y, s);
    for (const [x, y, s] of [[60, 818, 0.9], [130, 790, 0.9], [492, 765, 0.9], [574, 762, 0.9]]) maquis(g, x, y, s);
    for (const [x, y] of [[120, 1040], [790, 1080], [700, 1000], [330, 1050], [570, 1060]]) agave(g, x, y, 1);
    // the plateau, its cliff with three climbs, the palisades, the nuraghe and the camp
    cliff(g, [[0, 430], [90, 420], [200, 440], [330, 424], [450, 436], [580, 424], [700, 444], [820, 420], [900, 432]], 46, '#b3a37a', '#8c7a6b');
    const climb = (xb, xt, wb, wt) => { const y0 = 418, y1 = 504; const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#e8d29a'); gr.addColorStop(1, '#d2b274');
      g.beginPath(); g.moveTo(xb - wb / 2 - 14, y1 + 10); g.quadraticCurveTo(xb - wb / 2, y1 - 6, xt - wt / 2, y0); g.lineTo(xt + wt / 2, y0); g.quadraticCurveTo(xb + wb / 2, y1 - 6, xb + wb / 2 + 14, y1 + 10); g.closePath(); g.fillStyle = gr; g.fill();
      g.strokeStyle = OL; g.lineWidth = 3.4; g.lineJoin = 'round'; g.beginPath(); g.moveTo(xb - wb / 2 - 14, y1 + 10); g.quadraticCurveTo(xb - wb / 2, y1 - 6, xt - wt / 2, y0); g.moveTo(xb + wb / 2 + 14, y1 + 10); g.quadraticCurveTo(xb + wb / 2, y1 - 6, xt + wt / 2, y0); g.stroke();
      g.strokeStyle = 'rgba(110,80,40,.5)'; g.lineWidth = 2.4; for (let k = 1; k <= 5; k++) { const f = k / 6, yy = y0 + (y1 - y0) * f, w = wt + (wb - wt) * f, cx = xt + (xb - xt) * f; g.beginPath(); g.moveTo(cx - w / 2 + 3, yy); g.quadraticCurveTo(cx, yy + 5, cx + w / 2 - 3, yy); g.stroke(); }
      g.fillStyle = 'rgba(60,40,20,.22)'; g.beginPath(); g.moveTo(xt - wt / 2, y0); g.lineTo(xt - wt / 2 + 7, y0); g.lineTo(xb - wb / 2 + 8, y1); g.lineTo(xb - wb / 2, y1); g.closePath(); g.fill(); };
    climb(305, 316, 58, 34); climb(595, 584, 58, 34); climb(450, 450, 66, 40);
    road([[316, 420], [322, 405]], 24); road([[584, 420], [578, 405]], 24); road([[450, 420], [450, 400]], 32);
    g.fillStyle = 'rgba(255,255,255,.1)'; for (let k = 0; k < 14; k++) { g.beginPath(); g.ellipse(r() * 900, 140 + r() * 220, 30 + r() * 30, 10, 0, 0, 7); g.fill(); }
    stakes(g, 120, 360, 290, 360); stakes(g, 610, 360, 780, 360);
    nuraghe(g, 450, 330, 1.9);
    for (const [x, y, s] of [[200, 250, 0.6], [700, 240, 0.6], [110, 150, 0.5], [800, 140, 0.5]]) nuraghe(g, x, y, s);
    for (const [x, y] of [[250, 330], [650, 330], [160, 220], [740, 210]]) carthTent(g, x, y);
    for (const [x, y] of [[330, 250], [570, 250], [450, 120]]) { g.beginPath(); g.ellipse(x, y, 16, 7, 0, 0, 7); fo(g, '#5a4a40', 2.4); fire(g, x, y - 2, 0.55, t); }
    smoke(g, 330, 240, 5, 'rgba(70,60,60,.35)'); smoke(g, 570, 240, 5, 'rgba(70,60,60,.35)');
    // our hospital galley run half way up the beach: the bow on the sand, the stern in the shallows; the squads that step aboard are refilled from the reserve
    for (const [x, y, rx, ry] of [[358, 1142, 9, 4], [544, 1142, 8, 3], [366, 1218, 8, 4], [534, 1220, 10, 4]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); fo(g, '#b9ab94', 2); }
    trireme(g, 450, 1178, 0.9, '#d6402e', Math.PI / 2);
    g.beginPath(); g.moveTo(381, 1178); g.lineTo(381, 1130); g.strokeStyle = OL; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#8a5a30'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(381, 1130); g.lineTo(407, 1140); g.lineTo(381, 1152); g.closePath(); fo(g, '#3fbf4a', 2.6);
    // ships, gangways, boats and the burning ship
    for (const [x, y] of [[140, 1370], [330, 1400], [570, 1400], [760, 1370]]) trireme(g, x, y, 0.95, '#d6402e', 0);
    for (const [x, y, a] of [[250, 1230, 0.3], [650, 1236, -0.3], [95, 1210, 0.1]]) boat(g, x, y, 1, a);
    trireme(g, 840, 1230, 0.7, '#d6402e', 0.5, true); fire(g, 836, 1226, 0.9, t); smoke(g, 832, 1200, 6, 'rgba(60,55,60,.4)');
    foam(g, dp, t, 0.4);
    const dg = g.createLinearGradient(0, 0, 0, 700); dg.addColorStop(0, 'rgba(255,170,120,.42)'); dg.addColorStop(1, 'rgba(255,170,120,0)'); g.fillStyle = dg; g.fillRect(0, 0, 900, 700);
    const sun = g.createRadialGradient(450, 40, 10, 450, 40, 360); sun.addColorStop(0, 'rgba(255,230,160,.65)'); sun.addColorStop(1, 'rgba(255,230,160,0)'); g.fillStyle = sun; g.fillRect(0, 0, 900, 460);
    g.fillStyle = 'rgba(255,220,230,.12)'; g.fillRect(0, 700, 900, 420);
  }
  return { draw };
})();

CITYMAPS.sardinia = {
  wade: 'sea', title: 'САРДИНИЯ', sub: 'Нураг у моря', seed: 61, draw: (g, r) => LANDING.draw(g, r), win: 'Нураг взят — плацдарм на Сардинии удержан.',
  help: '<p><b>Цель:</b> взять нураг на плато — встаньте у него на 6 секунд без врагов рядом. Береговой дозор на дюнах и перевал у скал дают +3 в резерв. <b>Лечение:</b> на корабле место одно — встаньте отрядом у галеры, лежащей поперёк косы, уходящей в воду, — он взойдёт на борт и пополнится из резерва.</p>' + ARMY_HELP +
    '<p><b>Мелководье</b> замедляет всех, глубина непроходима. <b>Дюны</b> дают стрелкам высоту. Через гряду три прохода: центральный открыт, но его держит пехота; в боковых <b>завалы ⛏</b> — инженеры разберут их за 6 с, и можно обойти с фланга. На плато ведут три подъёма.</p>',
  camp: { x: 450, y: 1178, rx: 92, ry: 40 }, tents: [[450, 1194]], oneHeal: true, starts: [[200, 1178], [456, 1068], [620, 1192], [770, 1178]], cam: { x: 450, y: 1110 },
  nav: {
    water: [{ poly: [...ldEdge(LD_DP), [900, 1500], [0, 1500]] }],
    slow: [{ poly: [...ldEdge(LD_WL), ...ldEdge(LD_DP).reverse()] }],
    deck: [{ poly: [[372, 1096], [396, 1170], [430, 1206], [470, 1206], [500, 1170], [492, 1096]] }, { rect: [378, 1158, 144, 44] }],
    mound: LD_DUNES.map(([x, y, rx, ry]) => ({ ell: [x, y - ry / 2, rx, ry / 2] })),
    high: [{ rect: [0, 0, 900, 458] }],
    ramp: [{ rect: [275, 424, 60, 72] }, { rect: [420, 424, 60, 72] }, { rect: [565, 424, 60, 72] }],
    block: [{ poly: [[0, 520], [200, 520], [272, 580], [280, 690], [0, 690]] }, { poly: [[900, 520], [700, 520], [628, 580], [620, 690], [900, 690]] }, { ell: [370, 578, 38, 17] }, { ell: [530, 578, 38, 17] },
      { rect: [0, 440, 275, 46] }, { rect: [335, 440, 85, 46] }, { rect: [480, 440, 85, 46] }, { rect: [625, 440, 275, 46] },
      { rect: [120, 352, 170, 14] }, { rect: [610, 352, 170, 14] }, { ell: [450, 318, 90, 30] }, { ell: [200, 242, 34, 14] }, { ell: [700, 232, 34, 14] }, { ell: [110, 142, 28, 12] }, { ell: [800, 132, 28, 12] },
      ...[[250, 330], [650, 330], [160, 220], [740, 210]].map(([x, y]) => ({ ell: [x, y - 6, 30, 12] }))],
    road: [{ line: [[300, 905], [310, 800], [300, 680], [305, 560], [305, 480]], w: 24 }, { line: [[600, 905], [590, 800], [600, 680], [595, 560], [595, 480]], w: 24 }, { line: [[420, 930], [430, 800], [450, 680], [450, 520], [450, 440]], w: 32 }]
  },
  sites: [
    { kind: 'rubble', x: 305, y: 572, mask: { ell: [305, 572, 46, 22] }, stand: [305, 640], need: 6, done: 'Левый проход расчищен — можно обойти с фланга' },
    { kind: 'rubble', x: 596, y: 572, mask: { ell: [596, 572, 46, 22] }, stand: [596, 640], need: 6, done: 'Правый проход расчищен — можно обойти с фланга' }],
  points: [{ name: 'Береговой дозор', x: 450, y: 870, r: 70, need: 4 }, { name: 'Перевал', x: 450, y: 625, r: 62, need: 4 }, { name: 'Нураг', x: 450, y: 395, r: 92, need: 6, final: true }],
  enemies: [['e_arc', 3, 330, 790, 'dn'], ['e_arc', 3, 640, 815, 'dn'], ['e_inf', 3, 150, 850, 'dl'], ['e_inf', 3, 760, 880, 'dr'], ['e_inf', 4, 450, 850, 'ch'], ['ambush', 3, 840, 1005, 'ol'], ['ambush', 3, 92, 800, 'am1'], ['ambush', 3, 524, 748, 'am2'],
    ['e_inf', 4, 450, 610, 'pas'], ['e_arc', 3, 372, 520, 'pas'], ['e_arc', 2, 528, 520, 'pas'], ['e_arc', 2, 260, 410, 'wl'], ['e_arc', 2, 640, 410, 'wr'], ['hoplite', 4, 450, 400, 'nu'],
    ['e_inf', 3, 220, 395, 'tc'], ['e_inf', 3, 680, 395, 'tc'], ['e_cav', 3, 450, 250, 'tc', [[450, 250], [300, 300]]]],
  forest: [[840, 1005, 52, 34], [92, 796, 54, 36], [524, 746, 52, 32]],
  traps: [[440, 780, 24], [470, 715, 22], [335, 868, 22], [565, 862, 22], [305, 706, 22], [596, 706, 22], [450, 540, 22], [300, 1000, 22], [610, 1000, 22]]
};
