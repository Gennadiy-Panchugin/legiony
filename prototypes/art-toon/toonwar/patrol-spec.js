// The patrol battles are generated: the frame name «legwar:patrol:<seed>:<weather>:<time>:<place>:<stars>» picks a place (and so a kind of terrain),
// the seed shuffles it, the stars scale the enemy. Everything is built here as ordinary city-battle data (nav shapes, sites, points, enemies) plus a picture.
// The shared drawing pieces (the marker below) are copied in by city-gen.js from the art sheet and live in their own scope.
const PATROL = (() => {
/*PIECES*/
  // place index -> kind of terrain (the list is the same as PATROL_PLACES in the game)
  const PLACES = [
    { name: 'Брод через Анио', kind: 'ford' }, { name: 'Альбанские холмы', kind: 'hills' }, { name: 'Лесная дорога у Альбы', kind: 'forest' }, { name: 'Соляная дорога', kind: 'marsh', decor: 'lagoon' },
    { name: 'Болота у Цирцеи', kind: 'marsh', decor: 'swamp' }, { name: 'Перевал у Сублакве', kind: 'pass' }, { name: 'Руины этрусской крепости', kind: 'ruins', decor: 'ruins' },
    { name: 'Виноградники Фалерна', kind: 'ruins', decor: 'vines' }, { name: 'Окрестности Лавиния', kind: 'ruins', decor: 'town' }, { name: 'Каменоломни у Габий', kind: 'pass', decor: 'quarry' }];
  const CLEAR = [], dist2 = (x, y, p, q) => Math.hypot(x - p, y - q);
  function make(seed, place, stars, wx, tod) {
    const P = PLACES[place] || PLACES[0], rnd = rng(seed * 7919 + place * 31 + 5), rf = (a, b) => a + rnd() * (b - a), ri = (a, b) => Math.floor(rf(a, b + 1));
    const cx = ri(400, 500), x1 = ri(380, 520), x2 = ri(380, 520), y1 = ri(1000, 1060), y2 = ri(650, 700);
    const road = [[450, 1330], [ri(400, 500), 1190], [x1, y1], [ri(400, 500), 840], [x2, y2], [ri(400, 500), 520], [cx, 420]];
    const nearRoad = (x, y, pad) => { for (let i = 0; i < road.length - 1; i++) { const [ax, ay] = road[i], [bx, by] = road[i + 1], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L)); if (dist2(x, y, ax + dx * t, ay + dy * t) < pad) return true; } return false; };
    const roadX = y => { for (let i = 0; i < road.length - 1; i++) { const [ax, ay] = road[i], [bx, by] = road[i + 1]; if ((y - ay) * (y - by) <= 0 && ay !== by) return ax + (bx - ax) * (y - ay) / (by - ay); } return 450; };
    const nav = { block: [], mound: [], water: [], ford: [], slow: [], deck: [], high: [], ramp: [], road: [{ line: road, w: 34 }] };
    const ops = [], sites = [], enemies = [], forest = [], reedZones = [], traps = [];
    const sc = 0.55 + 0.1 * stars, N = n => Math.max(2, Math.round(n * sc));
    let wade = 'swamp', pts1 = 'Застава', pts2 = 'Развилка', help = '';
    const decorTrees = (avoid, n) => { for (let i = 0; i < n; i++) { const x = rf(40, 860), y = rf(330, 1250); if (nearRoad(x, y, 70) || (y < 480 && Math.abs(x - cx) < 280) || enemies.some(e => dist2(x, y, e[2], e[3]) < 60) || nav.mound.some(m => dist2(x, y, m.ell[0], m.ell[1]) < m.ell[2] + 40) || avoid && avoid(x, y)) continue; ops.push(g => tree(g, x, y, rf(0.9, 1.2))); nav.block.push({ ell: [x, y - 6, 14, 9] }); } };
    // ---------------------------------------------------------------- the kinds of ground
    if (P.kind === 'ford') {
      const rY = ri(780, 860), pr = [[0, rY + ri(-30, 30)], [225, rY - ri(10, 40)], [450, rY + ri(0, 30)], [675, rY - ri(10, 40)], [900, rY + ri(-30, 30)]], fx = road.find(p => p[1] < rY + 100 && p[1] > rY - 100)[0] || 450;
      nav.water.push({ line: pr, w: 70 }); nav.ford.push({ rect: [fx - 55, rY - 60, 110, 120] });
      const bx = fx < 450 ? ri(640, 780) : ri(120, 260); nav.road.push({ line: [[bx, rY + 140], [bx, rY - 140]], w: 22 });
      sites.push({ kind: 'bridge', x: bx, y: rY, mask: { rect: [bx - 18, rY - 50, 36, 100] }, stand: [bx, rY + 85], need: 8, who: 'Мост наводят только инженеры', done: 'Мост наведён — второй путь через реку открыт' });
      ops.push(g => { g.beginPath(); pr.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 84; g.strokeStyle = OL; g.stroke(); g.lineWidth = 72; g.strokeStyle = '#49b6d6'; g.stroke(); g.lineWidth = 40; g.strokeStyle = '#7fe0d0'; g.stroke();
        g.fillStyle = 'rgba(210,230,200,.85)'; g.beginPath(); g.ellipse(fx, rY, 66, 40, 0, 0, 7); g.fill(); for (const [dx, dy] of [[-40, -10], [-14, 12], [14, -12], [38, 10], [0, 0]]) stone(g, fx + dx, rY + dy, 0.9); });
      for (let x = 40; x < 880; x += 60) ops.push(g => reeds(g, x + rf(-10, 10), rY + (x % 120 ? 40 : -40) + rf(-4, 4)));
      pts1 = 'Южный берег'; pts2 = 'Северный берег'; forest.push([x2 + (x2 < 450 ? 150 : -150), y2 - 60, 60, 40]); enemies.push(['ambush', N(3), x2 + (x2 < 450 ? 150 : -150), y2 - 60, 'am1']);
      ops.push(g => { for (const dx of [-60, 0, 60]) olive(g, x2 + (x2 < 450 ? 150 : -150) + dx, y2 - 60 + (dx ? 8 : -4), 1); });
      help = '<p><b>Брод</b> — единственный быстрый путь: по воде идут медленно. Второй путь — мост: инженеры наведут его за 8 с на фланге.</p>';
      decorTrees(null, 14);
    } else if (P.kind === 'hills') {
      const mounds = []; for (let i = 0; i < 4; i++) { const m = [rf(100, 800), rf(560, 1150), rf(80, 125), rf(38, 56)]; if (nearRoad(m[0], m[1], 40) && i > 1) continue; mounds.push(m); }
      mounds.push([x1 < 450 ? x1 + 200 : x1 - 200, y1 - 60, 100, 48]); mounds.forEach(([x, y, rx, ry]) => { nav.mound.push({ ell: [x, y - ry / 2, rx, ry / 2] }); ops.push(g => mound(g, x, y, rx, ry)); enemies.push(['e_arc', N(2), x, y - 10, 'hl']); });
      for (let i = 0; i < 9; i++) { const x = rf(60, 840), y = rf(520, 1200); if (nearRoad(x, y, 75) || mounds.some(([mx, my, mrx, mry]) => ((x - mx) / (mrx + 34)) ** 2 + ((y - my) / (mry + 34)) ** 2 < 1)) continue; ops.push(g => rock(g, x, y, rf(1.1, 1.6))); nav.block.push({ ell: [x, y - 8, 22, 12] }); }
      ops.push(g => watchtower(g, 150, 760)); nav.block.push({ ell: [150, 750, 28, 16] });
      pts1 = 'Подножие холма'; pts2 = 'Гребень'; help = '<p><b>Холмы</b> дают стрелкам высоту: на них бьют дальше. Выбивайте лучников с холмов пехотой и конницей и не стойте под ними на открытом месте.</p>'; decorTrees(null, 12);
    } else if (P.kind === 'forest') {
      const sides = [[-1, y1 - 40], [1, y1 - 220], [-1, y2 + 40], [1, y2 - 160]];
      sides.forEach(([sd, y], i) => { const x = 450 + sd * ri(190, 250), rx = ri(95, 125), ry = ri(70, 95); forest.push([x, y, rx, ry]); ops.push(g => grove(g, x, y, rx, ry, 8, 11 + i)); enemies.push(['ambush', N(3), x - sd * 20, y, 'am' + i]); traps.push([x - sd * rx * 0.6, y + 30, 22]); });
      for (let i = 0; i < 6; i++) { const x = rf(60, 840), y = rf(520, 1250); if (nearRoad(x, y, 70) || forest.some(([fx, fy, rx, ry]) => ((x - fx) / (rx + 30)) ** 2 + ((y - fy) / (ry + 30)) ** 2 < 1)) continue; ops.push(g => rock(g, x, y, 1.3)); nav.block.push({ ell: [x, y - 8, 20, 11] }); }
      pts1 = 'Просека'; pts2 = 'Лесной перекрёсток'; help = '<p><b>Лес</b> прячет засады: пока их не раскрыли разведчики или костёр, они невидимы. Держитесь дороги и не растягивайте отряды.</p>';
    } else if (P.kind === 'marsh') {
      wade = P.decor === 'lagoon' ? 'lagoon' : 'swamp';
      const poly = [[ri(70, 130), 720], [ri(260, 340), 650], [ri(560, 640), 670], [ri(780, 840), 730], [ri(820, 870), 980], [ri(680, 740), 1140], [ri(260, 340), 1160], [ri(60, 120), 1010]];
      nav.slow.push({ poly }); nav.deck.push({ line: road.slice(1, 6), w: 34 });
      const hum = []; for (let i = 0; i < 6; i++) { const x = rf(120, 780), y = rf(760, 1100); if (nearRoad(x, y, 60)) continue; hum.push([x, y, rf(40, 56)]); }
      hum.forEach(([x, y, r], i) => { nav.mound.push({ ell: [x, y - 6, r, r * 0.4] }); if (i < 3) { reedZones.push([x, y - 4, r + 6, 28]); enemies.push(['ambush', N(3), x, y - 4, 'am' + i]); } });
      ops.push(g => { if (P.decor === 'lagoon') lagoon(g, poly, rng(seed)); else swamp(g, 450, 930, 400, 230, seed); hum.forEach(([x, y, r]) => hummock(g, x, y, r)); causeway(g, road.slice(1, 6)); });
      pts1 = P.decor === 'lagoon' ? 'Соляная вышка' : 'Сухой островок'; pts2 = 'Гать'; help = '<p><b>' + (P.decor === 'lagoon' ? 'Лагуна' : 'Болото') + '</b> замедляет всех вдвое — идите по гати. На кочках с камышом сидят засады.</p>'; decorTrees(null, 8);
    } else if (P.kind === 'pass') {
      const ys = [y1 - ri(100, 130), y2 - ri(100, 120)];
      ys.forEach((y, k) => {
        const rx = roadX(y), gaps = [rx]; const far = [130, 770, 450].filter(x => Math.abs(x - rx) > 190); for (let i = 0; i < ri(1, 2) && i < far.length; i++) gaps.push(far[i]); gaps.sort((p, q) => p - q);
        const segs = []; let x0 = 0; gaps.forEach(gx => { if (gx - 52 > x0 + 20) segs.push([x0, gx - 52]); x0 = gx + 52; }); if (x0 < 880) segs.push([x0, 900]);
        segs.forEach(([a_, b_]) => { nav.block.push({ rect: [a_, y - 24, b_ - a_, 48] }); const L = b_ - a_, n = Math.max(1, Math.round(L / 120)); for (let k = 0; k < n; k++) { const cxk = a_ + L * (k + 0.5) / n, rxk = L / n / 2.05; ops.push(g => ridge(g, cxk, y + 30, rxk, 58, '#8c7a6b', 'rgba(60,40,30,.28)')); } });
        gaps.forEach(gx => { nav.road.push({ line: [[gx, y + 60], [gx, y - 60]], w: 24 }); enemies.push(['e_arc', N(2), gx + ri(-30, 30), y - 70, 'pg' + k]); });
        const side = gaps.find(gx => Math.abs(gx - rx) > 150); if (side !== undefined && (k === 1 || P.decor === 'quarry')) sites.push({ kind: 'rubble', x: side, y, mask: { ell: [side, y, 46, 24] }, stand: [side, y + 70], need: 6, done: 'Завал в проходе разобран — можно обойти с фланга' });
      });
      if (P.decor === 'quarry') { ops.push(g => { quarry(g, 150, 760); for (const [x, y] of [[700, 780], [740, 800], [760, 770]]) boulder(g, x, y, 1.2); }); nav.block.push({ ell: [150, 750, 60, 30] }, { ell: [730, 780, 40, 22] }); }
      for (let i = 0; i < 8; i++) { const x = rf(60, 840), y = rf(330, 1250); if (nearRoad(x, y, 75) || ys.some(yy => Math.abs(y - yy) < 70)) continue; ops.push(g => rock(g, x, y, 1.2)); nav.block.push({ ell: [x, y - 8, 20, 11] }); }
      pts1 = 'Нижний проход'; pts2 = 'Верхний проход'; help = '<p><b>Перевал</b>: две каменные гряды с проходами. Часть проходов закрыта завалами — инженеры разберут их за 6 с, и можно обойти с фланга.</p>'; decorTrees(null, 6);
    } else {
      const walls = []; const px = rf(150, 220), px2 = rf(680, 750), wy = ri(780, 860);
      if (P.decor === 'ruins') { [[px, wy, 150, 26], [px2, wy, 150, 26], [px, wy - 200, 26, 150], [px2, wy - 200, 26, 150]].forEach(([x, y, w, h]) => walls.push([x - w / 2, y - h / 2, w, h]));
        walls.forEach(r => { nav.block.push({ rect: r }); ops.push(g => { const horiz = r[2] > r[3], n = Math.max(1, Math.round((horiz ? r[2] : r[3]) / 60)); for (let k = 0; k < n; k++) { const t = (k + 0.5) / n; ruin(g, horiz ? r[0] + r[2] * t : r[0] + r[2] / 2, horiz ? r[1] + 26 : r[1] + r[3] * t + 20); } }); });
        for (const [x, y] of [[ri(110, 190), ri(900, 1050)], [ri(710, 790), ri(900, 1050)]]) { ops.push(g => tumulus(g, x, y, 44)); nav.mound.push({ ell: [x, y - 8, 44, 22] }); enemies.push(['e_arc', N(2), x, y - 6, 'ru']); } }
      else if (P.decor === 'vines') { for (const [x, y, w, h] of [[110, 760, 150, 130], [640, 760, 150, 130], [110, 1000, 150, 110], [640, 1010, 150, 110]]) { if (nearRoad(x + w / 2, y + h / 2, 90)) continue; nav.block.push({ rect: [x, y, w, h] }); ops.push(g => vineRows(g, x, y, w, h)); } ops.push(g => vineyard(g, 150, 640)); }
      else { for (const [x, y] of [[170, 780], [240, 840], [700, 790], [640, 850], [180, 1010], [720, 1020], [230, 640], [680, 620]]) { if (nearRoad(x, y, 80)) continue; ops.push(g => house(g, x, y)); nav.block.push({ ell: [x, y - 12, 28, 18] }); } enemies.push(['e_arc', N(2), 320, 800, 'tw'], ['e_arc', N(2), 590, 810, 'tw']); }
      enemies.push(['e_inf', N(3), x1, y1 - 120, 'rl']); pts1 = P.decor === 'vines' ? 'Давильня' : 'Околица'; pts2 = P.decor === 'ruins' ? 'Внутренний двор' : 'Площадь'; help = '<p><b>' + (P.decor === 'ruins' ? 'Руины' : P.decor === 'vines' ? 'Виноградники' : 'Селение') + '</b>: стены и ограды сужают дорогу. Занимайте точки и не лезьте в тесные проходы без прикрытия.</p>'; decorTrees(null, 8);
    }
    // ---------------------------------------------------------------- the enemy camp, the points and the squads
    nav.block.push({ ell: [cx, 318, 66, 30] }, { ell: [cx - 170, 352, 30, 12] }, { ell: [cx + 170, 352, 30, 12] });
    enemies.push(['e_inf', N(4), x1, y1 - 20, 'p1'], ['e_arc', N(3), x1 + (x1 < 450 ? 70 : -70), y1 + 30, 'p1'], ['e_inf', N(4), x2, y2 - 10, 'p2'], ['e_arc', N(3), x2 + (x2 < 450 ? -80 : 80), y2 + 30, 'p2'], ['hoplite', Math.max(3, N(4)), cx, 400, 'fc'], ['e_arc', N(2), cx - 110, 420, 'fc']);
    if (stars >= 2) enemies.push(['e_arc', N(2), cx + 110, 420, 'fc']); if (stars >= 4) enemies.push(['e_cav', 2, cx, 270, 'fc', [[cx, 270], [cx - 200, 330]]]);
    const draw = (g, r) => {
      g.fillStyle = '#7ba83a'; g.fillRect(0, 0, 900, 1500);
      for (let i = 0; i < 170; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,160,.14)' : 'rgba(40,90,20,.14)'; g.beginPath(); g.ellipse(r() * 900, r() * 1500, 20 + r() * 26, 8 + r() * 8, 0, 0, 7); g.fill(); }
      // the road first, so that bridges and groves lie over it
      g.beginPath(); road.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 40; g.strokeStyle = OL; g.stroke(); g.lineWidth = 34; g.strokeStyle = '#e3c98a'; g.stroke();
      for (const o of ops) o(g, r);
      fort(g, cx, 330); tent(g, cx - 170, 370); tent(g, cx + 170, 370); stakes(g, cx - 130, 392, cx - 40, 392); stakes(g, cx + 40, 392, cx + 130, 392);
      for (const [x, y] of [[cx - 70, 300], [cx + 70, 300]]) { g.beginPath(); g.ellipse(x, y, 14, 6, 0, 0, 7); fo(g, '#5a4a40', 2.4); fire(g, x, y - 2, 0.5, 0); }
      for (const [x, y] of [[370, 1430], [530, 1430], [450, 1456]]) tent(g, x, y);
      g.fillStyle = 'rgba(190,140,80,.45)'; g.beginPath(); g.ellipse(450, 1400, 160, 72, 0, 0, 7); g.fill();
    };
    return {
      title: P.name.toUpperCase(), sub: 'Дозор', seed: seed + 100, draw, win: 'Лагерь врага взят — стычка выиграна.', wade,
      help: '<p><b>Цель:</b> взять лагерь врага (встаньте у шатров на 6 секунд без врагов). Две точки на пути дают +3 в резерв.</p>' + ARMY_HELP + help,
      camp: { x: 450, y: 1400, rx: 160, ry: 72 }, tents: [[370, 1430], [530, 1430], [450, 1456]], starts: [[390, 1360], [500, 1360], [580, 1390], [310, 1390]], cam: { x: 450, y: 1250 },
      nav, sites, forest, reeds: reedZones, traps, sky: wx !== 'clear' || tod !== 'day' || undefined, weatherFx: tod === 'night' ? 'night' : wx, refillMul: tod !== 'night' && wx === 'heat' ? 1.3 : 1,
      points: [{ name: pts1, x: x1, y: y1 + 20, r: 64, need: 4 }, { name: pts2, x: x2, y: y2 + 20, r: 62, need: 4 }, { name: 'Лагерь врага', x: cx, y: 400, r: 90, need: 6, final: true }], enemies
    };
  }
  return { make, PLACES };
})();
CITYMAPS.patrol = (() => { const p = window.name.split(':'); if (p[1] !== 'patrol') return null; return PATROL.make(+p[2] || 1, +p[5] || 0, +p[6] || 1, p[3] || 'clear', p[4] || 'day'); })();
