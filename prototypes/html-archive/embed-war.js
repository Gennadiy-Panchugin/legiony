// Puts the cartoon battle on Tibur's own map (art-toon/toonwar/tibur-war.html) into the main game as the battle for Тибур.
// Re-run after rebuilding it (node tibur-gen.js in toonwar): node embed-war.js
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, 'legiony.html');
let t = fs.readFileSync(file, 'utf8');
const war = fs.readFileSync(path.join(__dirname, '..', 'art-toon', 'toonwar', 'tibur-war.html'));
const B64 = war.toString('base64');
function rep(a, b) { if (!t.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); }

// Tibur's own battle map: keep the campaign's title and describe the new map
t = t.replace(/(title: )'Переправа у Тибура'(, stars: 3, war: true,\n    desc: )'[^']*'/, (m, a, b) => a + "'Горный перевал'" + b + "'Хребет сквозь гору: короткий путь — туннелем через крепость в скале, решётку поднимают инженеры; длинный — по западной долине вброд. Возьмите храм Весты.'");
if (t.includes('/*WAR_B64*/')) {
  t = t.replace(/\/\*WAR_B64\*\/'[A-Za-z0-9+\/=]*'/, () => "/*WAR_B64*/'" + B64 + "'");
} else {
  rep("  { title: 'Горный перевал', stars: 3,\n    desc: 'Сплошной хребет. Короткая дорога — туннелем через крепость в скале, длинная — в обход по долине.',",
      "  { title: 'Переправа у Тибура', stars: 3, war: true,\n    desc: 'Новый бой: четыре генерала со своими отрядами. Река с бродами, хребты с башней и амбаром, баррикада на перевале — возьмите форт на плато.',");
  rep("  if (S.cheat) return 1;", "  if (S.cheat) return 1;\n  if (S.war) return 1 + (S.t < 300 ? 1 : 0) + (S.stats.lostP === 0 ? 1 : 0);");
  rep("  refreshUI(); tutShow();\n}\n", `  refreshUI(); tutShow();
  if (MAPS[p.map].war && !S.arena && !S.rebel) openWar(p);
}
// ---------------------------------------------------------------- the new cartoon battle (Тибур)
const WAR_HTML = /*WAR_B64*/'${B64}';
let warFrame = null;
function openWar(p) {
  S.war = true; paused = true;
  const html = new TextDecoder().decode(Uint8Array.from(atob(WAR_HTML), c => c.charCodeAt(0)));
  warFrame = document.createElement('iframe');
  warFrame.name = 'legwar'; warFrame.title = 'Бой: ' + p.name;
  warFrame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:50;background:#2a1a0e';
  warFrame.srcdoc = html;
  document.body.appendChild(warFrame);
}
window.addEventListener('message', e => {
  const m = e.data;
  if (!warFrame || e.source !== warFrame.contentWindow || !m || m.legWar !== 'end') return;
  warFrame.remove(); warFrame = null; paused = false;
  if (mode !== 'battle' || S.over) return;
  S.t = m.t; S.stats.captured = m.flags; S.stats.killsP = m.kills; S.stats.lostP = m.lost;
  S.over = true; S.winner = m.win; S.surrendered = m.surrendered;
  resolveBattle();
});
`);
}

// ---------------------------------------------------------------- the barracks: generals' squads, the training tree, the pre-battle screen (art-toon/toonwar/army.html)
const ARMY = fs.readFileSync(path.join(__dirname, '..', 'art-toon', 'toonwar', 'army.html')).toString('base64');
if (t.includes('/*ARMY_B64*/')) {
  t = t.replace(/\/\*ARMY_B64\*\/'[A-Za-z0-9+\/=]*'/, () => "/*ARMY_B64*/'" + ARMY + "'");
} else {
  // a war map opens the pre-battle screen first; the battle gets the generals' squads from the campaign
  rep("  if (MAPS[p.map].war && !S.arena && !S.rebel) openWar(p);", "  if (MAPS[p.map].war && !S.arena && !S.rebel) openArmy('pre', p);");
  rep("  if (!warFrame || e.source !== warFrame.contentWindow || !m || m.legWar !== 'end') return;",
      "  if (!warFrame || e.source !== warFrame.contentWindow || !m) return;\n  if (m.legWar === 'ready') { warFrame.contentWindow.postMessage({ legWar: 'init', slots: camp.army || ARMY_DEF }, '*'); return; }\n  if (m.legWar !== 'end') return;");
  rep("title: 'Горный перевал', stars: 3, war: true,", "title: 'Горный перевал', stars: 3, war: true, recon: ['hoplite', 'e_arc', 'e_inf', 'ambush', 'e_cav'],");
  rep('function renderBarracks() {', `function renderBarracks() {
  renderBarracksLevels();
  $('barracksCard').insertAdjacentHTML('afterbegin', '<button class="btn" type="button" id="armyBtn" style="width:100%;margin:0 0 10px">⚔ Отряды генералов · дерево обучения</button>');
  $('armyBtn').onclick = () => { sfx('click'); closeSheet(); openArmy('barracks', null); };
}
function renderBarracksLevels() {`);
  rep("let warFrame = null;\n", `let warFrame = null;
const ARMY_HTML = /*ARMY_B64*/'${ARMY}';
const ARMY_DEF = ['hastati', 'velites', 'eques', 'eng'];
const ARMY_IDS = ['tiro', 'hastati', 'principes', 'triarii', 'velites', 'slingers', 'cretans', 'eques', 'scouts', 'eng', 'scorpion'];
let armyFrame = null, armyFor = null, armyMode = 'barracks';
function openArmy(m, p) {
  if (!Array.isArray(camp.army) || camp.army.length !== 4) camp.army = ARMY_DEF.slice();
  armyFor = p || null; armyMode = m; if (p) paused = true;
  armyFrame = document.createElement('iframe');
  armyFrame.name = 'legarmy'; armyFrame.title = p ? 'Перед боем: ' + p.name : 'Казарма';
  armyFrame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:50;background:#2a1a0e';
  armyFrame.srcdoc = new TextDecoder().decode(Uint8Array.from(atob(ARMY_HTML), c => c.charCodeAt(0)));
  document.body.appendChild(armyFrame);
}
function armyState() { const mp = armyFor && MAPS[armyFor.map]; return { mode: armyMode, coins: camp.coins, army: camp.army.slice(), owned: camp.owned.slice(), recon: mp && mp.recon || [], title: mp ? mp.title : 'Казарма' }; }
window.addEventListener('message', e => {
  const m = e.data; if (!armyFrame || e.source !== armyFrame.contentWindow || !m || !m.legArmy) return;
  const post = type => armyFrame.contentWindow.postMessage({ legArmy: true, type, state: armyState() }, '*');
  if (m.type === 'ready') post('init');
  else if (m.type === 'train') {
    const g = m.gi | 0, cost = Math.round(+m.cost);
    if (g >= 0 && g < 4 && cost > 0 && camp.coins >= cost && ARMY_IDS.includes(m.cls)) { camp.coins -= cost; camp.army[g] = m.cls; saveCamp(); sfx('click'); }
    post('state');
  } else if (m.type === 'close') { armyFrame.remove(); armyFrame = null; if (armyFor) { paused = false; mode = 'campaign'; armyFor = null; } refreshUI(); }
  else if (m.type === 'fight') { const p = armyFor; armyFrame.remove(); armyFrame = null; armyFor = null; if (p) openWar(p); }
});
`);
}
// ---------------------------------------------------------------- the five other cities on their own maps (art-toon/toonwar/citywar.html)
const CITY = fs.readFileSync(path.join(__dirname, '..', 'art-toon', 'toonwar', 'citywar.html')).toString('base64');
if (t.includes('/*CITY_B64*/')) {
  t = t.replace(/\/\*CITY_B64\*\/'[A-Za-z0-9+\/=]*'/, () => "/*CITY_B64*/'" + CITY + "'");
} else {
  const city = (title, stars, recon, desc) => { const re = new RegExp("(\\{ title: )'" + title + "', stars: " + stars + ",\\n    desc: '[^']*'"); if (!re.test(t)) { console.error('MISS map', title); process.exit(1); } t = t.replace(re, (m, a) => a + "'" + title + "', stars: " + stars + ", war: 'city', recon: " + JSON.stringify(recon).replace(/"/g, "'") + ",\n    desc: '" + desc + "'"); };
  city('Первая кровь', 1, ['e_inf', 'e_arc', 'e_cav'], 'Этрусский город на туфовом плато за ручьём Кремера. Завалы на мосту и в теснине у некрополя: инженеры разберут их за 6 с, в обход — долго или под стрелами.');
  city('Устье Тибра', 2, ['e_inf', 'e_arc', 'ambush', 'e_cav'], 'Тибр раздваивается вокруг Священного острова: два моста и паром к верфи. Солеварни у лагуны, засада в сосновом бору у моря.');
  city('Один мост', 3, ['hoplite', 'e_inf', 'e_arc', 'e_cav'], 'Единственный мост через Астуру с предмостьем, мель у устья под стенами и место для временного моста. Акведук пересекает равнину аркадой.');
  city('Крепость на холме', 4, ['ambush', 'hoplite', 'e_inf', 'e_arc', 'e_cav'], 'Гать через болото у Трера к южным воротам или долгий обход мимо мельницы к восточным. На кочках в болоте засады, наверху — святилище Фортуны.');
  city('Столица', 5, ['hoplite', 'ambush', 'e_inf', 'e_arc', 'e_cav'], 'Осада в два акта: надвратные башни внешней стены, затем цитадель. Таран у арсенала на восточном поле, пятый отряд из школы гладиаторов, подкрепления по мосту за городом.');
  rep("if (!camp.tutDone && id === 'veii')", "if (!camp.tutDone && id === 'veii' && !MAPS[p.map].war)");
  rep('  const html = new TextDecoder().decode(Uint8Array.from(atob(WAR_HTML), c => c.charCodeAt(0)));', "  const city = MAPS[p.map].war === 'city', html = new TextDecoder().decode(Uint8Array.from(atob(city ? CITY_HTML : WAR_HTML), c => c.charCodeAt(0)));");
  rep("  warFrame.name = 'legwar'; warFrame.title = 'Бой: ' + p.name;", "  warFrame.name = city ? 'legwar:' + p.id : 'legwar'; warFrame.title = 'Бой: ' + p.name;");
  rep("let warFrame = null;\n", "let warFrame = null;\nconst CITY_HTML = /*CITY_B64*/'" + CITY + "';\n");
}
// ---------------------------------------------------------------- the old battle underneath: while the new battle runs and after it ends,
// the game draws the campaign map behind its popups instead of the old province battle map, and hides the old battle bars
if (!t.includes('/*NOBG*/')) {
  rep("  if (mode === 'battle') drawBattle(); else if (mode === 'campaign') drawCampaign();", "  if (mode === 'battle' && S.war) { /*NOBG*/ $('hudBattle').hidden = true; $('battleBar').hidden = true; drawCampaign(); } else if (mode === 'battle') drawBattle(); else if (mode === 'campaign') drawCampaign();");
}
// ---------------------------------------------------------------- the rebellion: waves against the governor's villa (citywar.html#rebel), not the old province battle
if (!t.includes('/*REBEL*/')) {
  rep("  else if (S.arena && !S.rebel) openWar(p, true);", "  else if (S.arena && !S.rebel) openWar(p, true);\n  else if (S.rebel) openWar(p, 'rebel');   /*REBEL*/");
  rep("warFrame.name = city ? 'legwar:' + (arena ? 'arena:' + p.id + ':' + pickArenaSky() : p.id) : 'legwar'; warFrame.title = (arena ? 'Арена: ' : 'Бой: ') + p.name;",
      "warFrame.name = city ? 'legwar:' + (arena === 'rebel' ? 'rebel:' + p.id + ':clear:dusk' : arena ? 'arena:' + p.id + ':' + pickArenaSky() : p.id) : 'legwar'; warFrame.title = (arena === 'rebel' ? 'Мятеж: ' : arena ? 'Арена: ' : 'Бой: ') + p.name;");
}
// ---------------------------------------------------------------- the advice in the defeat window: the old tips talk about buildings to capture, which the new battles do not have
if (!t.includes('/*WARTIP*/')) {
  rep("const tip = won ? '' : st.killsP < st.lostP", "const tip = won ? '' : S.war ? warTip(st) : st.killsP < st.lostP");
  rep("function openWar(p, arena) {", `/*WARTIP*/
function warTip(st) {
  if (S.rebel) return 'Совет: мятежники идут по дорогам к главному зданию города — перекройте проход и держитесь у завалов и мостов. Поджигателей бейте первыми, раненые отряды уводите в палатки.';
  if (S.arena) return 'Совет: держите отряды вместе в центре арены, раненых не оставляйте одних — на песке отступать некуда. Чемпионов бейте всеми отрядами сразу.';
  if (st.killsP < st.lostP) return 'Совет: когда выбран отряд, над врагами горят ▲ и ▼: бейте тех, у кого ▲, и обходите тех, у кого ▼. Фаланга слаба с фланга.';
  if (st.captured < 1) return 'Совет: захватите хотя бы одну точку — она даёт +3 в резерв, а палатки пополняют отряды.';
  return 'Совет: инженеры открывают короткие пути — завалы, ворота, мосты. Прикройте их стрелками и не оставляйте одних.';
}
function openWar(p, arena) {`);
}
// ---------------------------------------------------------------- test buttons: start a capture / arena / rebellion battle from the main screen without walking the map
// (the campaign is saved before the test battle and restored when the player leaves it); a cheat in the settings calls a rebellion in the chosen city
if (!t.includes('/*TESTBTNS*/')) {
  rep("const SCREENS = {", String.raw`/*TESTBTNS*/
const TB_CITIES = [['veii', 'Вейи'], ['ostia', 'Остия'], ['tibur', 'Тибур'], ['antium', 'Анций'], ['praeneste', 'Пренесте'], ['capua', 'Капуя']];
let tbCity = (() => { try { return localStorage.getItem('tbCity') || 'veii'; } catch (_) { return 'veii'; } })();
let testSave = null;
const tbName = () => (TB_CITIES.find(c => c[0] === tbCity) || TB_CITIES[0])[1];
const tbChips = () => '<div class="tbcities">' + TB_CITIES.map(c => '<button type="button" data-tbcity="' + c[0] + '"' + (c[0] === tbCity ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '>' + c[1] + '</button>').join('') + '</div>';
const tbBlock = () => '<div class="scr tb"><p class="tag">Тест боёв · выберите город</p>' + tbChips() +
  '<div class="tbrow"><button class="btn tbbtn" type="button" data-tb="capture">Бой<br>захват города</button><button class="btn tbbtn" type="button" data-tb="arena">Бой<br>на арене</button><button class="btn tbbtn" type="button" data-tb="rebel">Бой<br>мятеж</button></div></div>';
function testBattle(kind) {
  const id = tbCity; if (!prov(id)) return;
  if (testSave === null) testSave = JSON.stringify(camp);
  camp.rebel = null;
  if (kind === 'capture') camp.owned = camp.owned.filter(x => x !== id);
  else { if (!camp.owned.includes(id)) camp.owned.push(id); if (kind === 'rebel') camp.rebel = id; }
  if (!camp.owned.includes('rome')) camp.owned.unshift('rome');
  closeTip(); startBattle(id);
}
function endTest() {
  hideResult(); try { camp = normalizeCamp(JSON.parse(testSave)); } catch (_) {} testSave = null; saveCamp();
  $('tutBox').hidden = true; $('board').classList.remove('tutmode'); mode = 'menu'; closeTip(); refreshUI();
}
function cheatRebel() {
  const id = tbCity; if (!prov(id)) return;
  if (!camp.owned.includes(id)) camp.owned.push(id);
  camp.rebel = id; saveCamp(); mode = 'campaign'; closeTip(); refreshUI(); openRebelNews();
}
$('screen').addEventListener('click', e => {
  const c = e.target.closest('[data-tbcity]'); if (c) { tbCity = c.dataset.tbcity; try { localStorage.setItem('tbCity', tbCity); } catch (_) {} sfx('click'); refreshUI(); return; }
  const b = e.target.closest('[data-tb]'); if (!b) return;
  sfx('click'); if (b.dataset.tb === 'cheatrebel') cheatRebel(); else testBattle(b.dataset.tb);
});
const SCREENS = {`);
  rep("'<button class=\"btn big\" type=\"button\" data-act=\"exit\">Выход</button></div>',", "'<button class=\"btn big\" type=\"button\" data-act=\"exit\">Выход</button></div>' + tbBlock(),");
  rep("'<button class=\"btn big\" type=\"button\" data-act=\"gold\">Чит: +500 денариев</button>' +", "'<button class=\"btn big\" type=\"button\" data-act=\"gold\">Чит: +500 денариев</button>' + tbChips() +\n              '<button class=\"btn big\" type=\"button\" data-tb=\"cheatrebel\">Чит: мятеж в городе «' + tbName() + '»</button>' +");
  rep("function goCampaign() {", "function goCampaign() {\n  if (testSave !== null) { endTest(); return; }");
  rep("  @media (prefers-reduced-motion: reduce) { .btn.big { transition: none; } }", "  .tb { margin-top: 4px; gap: 8px; }\n  .tbcities { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; max-width: 330px; }\n  .tbcities button { padding: 5px 10px; border-radius: 14px; border: 1px solid var(--gold); background: rgba(0,0,0,.4); color: var(--ink); font: inherit; font-size: 12px; cursor: pointer; }\n  .tbcities button.on { background: var(--gold); color: #2a1a10; font-weight: 700; }\n  .tbrow { display: flex; gap: 8px; width: min(340px, 94%); }\n  .tbbtn { flex: 1; padding: 10px 4px; font-size: 13px; line-height: 1.2; }\n  @media (prefers-reduced-motion: reduce) { .btn.big { transition: none; } }");
}
// ---------------------------------------------------------------- music and battle sounds are switched in the settings (the battle HUD no longer has the buttons)
if (!t.includes('/*AUDIO*/')) {
  rep("if (m.legWar === 'ready') { warFrame.contentWindow.postMessage({ legWar: 'init', slots: camp.army || ARMY_DEF }, '*'); return; }", "if (m.legWar === 'ready') { warFrame.contentWindow.postMessage({ legWar: 'init', slots: camp.army || ARMY_DEF }, '*'); sendAudio(); return; } /*AUDIO*/");
  rep("const SCREENS = {", "function sendAudio() { try { if (warFrame && warFrame.contentWindow) warFrame.contentWindow.postMessage({ legWar: 'audio', music: camp.music !== false, sfx: camp.sfx !== false }, '*'); } catch (_) {} }\nconst SCREENS = {");
  rep("'<button class=\"btn big\" type=\"button\" data-act=\"gold\">Чит: +500 денариев</button>' + tbChips() +", "'<button class=\"btn big\" type=\"button\" data-act=\"music\" aria-pressed=\"' + (camp.music !== false) + '\">Музыка в бою: ' + (camp.music !== false ? 'вкл' : 'выкл') + '</button>' +\n              '<button class=\"btn big\" type=\"button\" data-act=\"sfx\" aria-pressed=\"' + (camp.sfx !== false) + '\">Звуки боя: ' + (camp.sfx !== false ? 'вкл' : 'выкл') + '</button>' +\n              '<button class=\"btn big\" type=\"button\" data-act=\"gold\">Чит: +500 денариев</button>' + tbChips() +");
  rep("if (act === 'gold') { cheatGold(); refreshUI(); return; }", "if (act === 'music' || act === 'sfx') { camp[act] = camp[act] === false; saveCamp(); sfx('click'); sendAudio(); refreshUI(); return; }\n  if (act === 'gold') { cheatGold(); refreshUI(); return; }");
}
// the test block sits under the logo, the main buttons go below it
if (!t.includes("/*TBTOP*/")) {
  rep("Выход</button></div>' + tbBlock(),", "Выход</button></div>', /*TBTOP*/");
  rep("<p class=\"tag\">Кампания «Лаций»</p></div>' +", "<p class=\"tag\">Кампания «Лаций»</p></div>' + tbBlock() +");
}
// the test block a little higher
if (t.includes(".tb { margin-top: 4px; gap: 8px; }")) rep(".tb { margin-top: 4px; gap: 8px; }", ".tb { margin-top: -26px; gap: 8px; }");
if (t.includes(".tb { margin-top: -26px; gap: 8px; }")) rep(".tb { margin-top: -26px; gap: 8px; }", ".tb { margin-top: -40px; gap: 8px; }");
// ---------------------------------------------------------------- the landing on Sardinia: a fourth test button (the province and the map exist only while the test battle runs)
if (!t.includes('/*LANDBTN*/')) {
  rep('data-tb="rebel">Бой<br>мятеж</button>', 'data-tb="rebel">Бой<br>мятеж</button><button class="btn tbbtn" type="button" data-tb="landing">Бой<br>десант</button>');
  rep('.tbbtn { flex: 1; padding: 10px 4px; font-size: 13px; line-height: 1.2; }', '.tbbtn { flex: 1; padding: 10px 2px; font-size: 12px; line-height: 1.2; }');
  rep("function testBattle(kind) {\n", "/*LANDBTN*/\nfunction testLanding() {\n  if (testSave === null) testSave = JSON.stringify(camp);\n  if (!MAPS.some(m => m.landing)) MAPS.push({ ...MAPS[1], landing: true, title: 'Десант на Сардинию', stars: 2, recon: ['e_inf', 'e_arc', 'ambush', 'e_cav', 'hoplite'], desc: 'Высадка на берег Сардинии: мелководье, дюны, скалы с тремя проходами и нураг на плато.' });\n  if (!prov('sardinia')) PROVINCES.push({ id: 'sardinia', name: 'Сардиния', x: -100, y: -100, map: MAPS.findIndex(m => m.landing), hidden: true });\n  camp.rebel = null; camp.owned = camp.owned.filter(x => x !== 'sardinia'); if (!camp.owned.includes('rome')) camp.owned.unshift('rome');\n  closeTip(); startBattle('sardinia');\n}\nfunction testBattle(kind) {\n  if (kind === 'landing') return testLanding();\n");
  rep("testSave = null; saveCamp();\n  $('tutBox')", "testSave = null; saveCamp(); { const i = PROVINCES.findIndex(p => p.id === 'sardinia'); if (i >= 0) PROVINCES.splice(i, 1); const j = MAPS.findIndex(m => m.landing); if (j >= 0) MAPS.splice(j, 1); }\n  $('tutBox')");
}
// the demo landing map of the old node battle (flag landing) must stay untouched: the test battle uses a map entry of its own
if (!t.includes('/*LANDFIX*/')) {
  rep("if (!MAPS.some(m => m.landing)) MAPS.push({ ...MAPS[1], landing: true,", "/*LANDFIX*/ if (!MAPS.some(m => m.cityLanding)) MAPS.push({ ...MAPS[1], cityLanding: true,");
  rep("map: MAPS.findIndex(m => m.landing), hidden: true", "map: MAPS.findIndex(m => m.cityLanding), hidden: true");
  rep("const j = MAPS.findIndex(m => m.landing); if (j >= 0) MAPS.splice(j, 1);", "const j = MAPS.findIndex(m => m.cityLanding); if (j >= 0) MAPS.splice(j, 1);");
}
// ---------------------------------------------------------------- the landing on Sardinia in the game: the demo node battle becomes the city-engine battle (citywar.html#sardinia) with the pre-battle screen
if (!t.includes('/*LANDGAME*/')) {
  const repL = (a, b) => { if (t.includes(a)) return rep(a, b); rep(a.split('\n').join('\r\n'), b.split('\n').join('\r\n')); };
  repL("const LANDING_MAP = MAPS.length - 1;", "const LANDING_MAP = MAPS.length - 1;\nObject.assign(MAPS[LANDING_MAP], { war: 'city', recon: ['e_inf', 'e_arc', 'ambush', 'e_cav', 'hoplite'], desc: 'Высадка на берег Сардинии: мелководье, дюны, три прохода между скалами и нураг на плато. На пляже вытащена галера для лечения, на пути засады и ловушки.' }); /*LANDGAME*/");
  repL("function startLanding() {\n  if (portClosed()) {", "function startLanding(force) {\n  if (!force && portClosed()) {");
  repL("  refreshUI(); say('Высадка! Ведите воинов с кораблей на берег');\n}", "  refreshUI(); openArmy('pre', { id: 'sardinia', name: 'Сардиния', map: LANDING_MAP });\n}");
  repL("if (armyFor) { paused = false; mode = 'campaign'; armyFor = null; }", "if (armyFor) { paused = false; mode = S && S.landing ? 'world' : 'campaign'; armyFor = null; }");
  repL("'Высадка · демо'", "'Высадка'");
  repL("Это демо морского похода — полная кампания острова скоро.", "Нураг на плато взят, плацдарм удержан.");
  repL("'Демо морского похода · '", "'Десант · '");
  repL("function warTip(st) {\n", "function warTip(st) {\n  if (S.landing) return 'Совет: на мелководье отряды вязнут — выходите на берег и лечитесь на галере (место одно). Боковые проходы закрыты завалами: инженеры разберут их за 6 с. Ямы-ловушки лучше обходить, засады ищите в рощах.';\n");
  repL("closeTip(); startBattle('sardinia');", "closeTip(); startLanding(true);");
}
// ---------------------------------------------------------------- patrol battles in the new format: the city engine generates the field (citywar.html, frame «legwar:patrol:seed:weather:time:place:stars»)
if (!t.includes('/*PATROLGEN*/')) {
  const swapFn = (name, code) => {
    const i = t.indexOf('function ' + name + '('); if (i < 0) { console.error('MISS function', name); process.exit(1); }
    let d = 0, j = t.indexOf('{', i); for (let k = j; k < t.length; k++) { if (t[k] === '{') d++; else if (t[k] === '}') { d--; if (!d) { j = k + 1; break; } } }
    t = t.slice(0, i) + code + t.slice(j);
  };
  swapFn('patrolReward', "function patrolReward(stars) { return 20 + 10 * stars; } /*PATROLGEN*/\n" +
    "// what each place is (the order is the one of PATROL_PLACES and of PLACES in patrol-spec.js)\n" +
    "const PATROL_INFO = [{ kind: 'Брод и мост', obst: 'река, брод, мост для инженеров', amb: 1 }, { kind: 'Холмы', obst: 'холмы с лучниками, скалы' }, { kind: 'Лес', obst: 'густые рощи, засады, ловушки', amb: 1 },\n" +
    "  { kind: 'Лагуна', obst: 'вязкая лагуна, гать, засады в камышах', amb: 1 }, { kind: 'Болото', obst: 'болото, гать, засады в камышах', amb: 1 }, { kind: 'Перевал', obst: 'каменные гряды, завалы в проходах' },\n" +
    "  { kind: 'Руины', obst: 'стены руин, курганы' }, { kind: 'Виноградники', obst: 'ряды лоз, тесные проходы' }, { kind: 'Селение', obst: 'дома и ограды' }, { kind: 'Каменоломня', obst: 'гряды, завалы, карьер' }];\n" +
    "const PATROL_SKY = { clear: 'clear:day', fog: 'fog:dawn', rain: 'rain:day', night: 'clear:night', heat: 'heat:day' };\n" +
    "const patrolFrame = pk => 'legwar:patrol:' + pk.seed + ':' + PATROL_SKY[pk.weather || 'clear'] + ':' + pk.idx + ':' + pk.stars;");
  swapFn('rollPatrol', "function rollPatrol() {\n  const prev = patrolPick ? patrolPick.idx : -1;\n  let idx; do idx = Math.floor(Math.random() * PATROL_PLACES.length); while (idx === prev);\n" +
    "  const stars = 1 + Math.floor(Math.random() * 3);\n  patrolPick = { idx, place: PATROL_PLACES[idx], foe: pick1(PATROL_FOES), weather: pick1(Object.keys(WEATHER)), stars, seed: 1 + Math.floor(Math.random() * 99999), reward: patrolReward(stars) };\n}");
  swapFn('openPatrol', "function openPatrol(reroll) {\n  infoReset();\n  if (reroll || !patrolPick) rollPatrol();\n  const pk = patrolPick, pi = PATROL_INFO[pk.idx];\n  infoKind = 'patrol';\n" +
    "  $('infEyebrow').textContent = 'Дозор · разведка';\n  $('infTitle').textContent = pk.place;\n  $('infText').textContent = 'Разведчики наткнулись на ' + pk.foe + '. Дайте бой — или ищите другую стычку.';\n" +
    "  $('infBody').innerHTML = '<div class=\"infmeta\">' +\n    '<div><span>Поле боя</span><b>' + pi.kind + '</b></div>' +\n    '<div><span>Сила врага</span><b>' + '●'.repeat(pk.stars) + '○'.repeat(5 - pk.stars) + '</b></div>' +\n" +
    "    '<div><span>Преграды</span><b>' + pi.obst + '</b></div>' +\n    '<div><span>Награда</span><b class=\"gold\">+' + pk.reward + ' ден.</b></div>' +\n" +
    "    '<div style=\"grid-column: 1 / -1\"><span>Погода</span><b>' + WEATHER[pk.weather].name + ' — ' + WEATHER[pk.weather].desc.toLowerCase() + '</b></div></div>' +\n" +
    "    '<p class=\"meta\">Каждая стычка собирается заново: другое поле, другие засады. Дозор не меняет карту кампании — это тренировка с небольшой наградой.</p>';\n" +
    "  $('infMain').textContent = 'В бой'; $('infAlt').hidden = false; $('infAlt').textContent = 'Искать другой бой';\n  showInfo();\n}");
  swapFn('startPatrol', "function startPatrol(pk) {\n  hideInfo(); closeAllPanels(); hideResult();\n  loadMap(LANDING_MAP); mode = 'battle'; newGame();\n" +
    "  S.patrol = { idx: pk.idx, place: pk.place, foe: pk.foe, reward: pk.reward, weather: pk.weather, stars: pk.stars, seed: pk.seed }; S.arena = false; S.weather = pk.weather || 'clear';\n" +
    "  refreshUI(); const pi = PATROL_INFO[pk.idx];\n  openArmy('pre', { id: 'patrol', name: pk.place, map: LANDING_MAP, frame: patrolFrame(pk), title: pk.place, recon: ['e_inf', 'e_arc', 'e_cav', 'hoplite'].concat(pi.amb ? ['ambush'] : []) });\n}");
  rep("recon: mp && mp.recon || [], title: mp ? mp.title : 'Казарма'", "recon: armyFor && armyFor.recon || mp && mp.recon || [], title: armyFor && armyFor.title || (mp ? mp.title : 'Казарма')");
  rep("warFrame.name = city ? 'legwar:'", "warFrame.name = p.frame ? p.frame : city ? 'legwar:'");
  // the rain, fog and heat of the patrol are now played by the city engine: the notes in the weather list say what they do there
  rep("heat:  { name: 'Зной',  desc: 'Гарнизоны растут на 30% медленнее' }", "heat:  { name: 'Зной',  desc: 'Лечение в лагере на 30% медленнее' }");
}
if (!t.includes('/*PATROLBACK*/')) { rep("mode = S && S.landing ? 'world' : 'campaign'; armyFor = null;", "mode = S && (S.landing || S.patrol) ? 'world' : 'campaign'; armyFor = null; /*PATROLBACK*/"); }
if (!t.includes('/*PATROLTIP*/')) {
  rep("  if (S.landing) return 'Совет: на мелководье", "  if (S.patrol) return 'Совет: на этой местности — ' + PATROL_INFO[S.patrol.idx].obst + '. Захватывайте точки: каждая даёт +3 в резерв, а раненые отряды лечатся в лагере. ' + ({ rain: 'Под дождём конница медленнее.', fog: 'В тумане стрелки бьют ближе.', night: 'Ночью все отряды медленнее.', heat: 'В зной лагерь лечит медленнее.' }[S.patrol.weather] || ''); /*PATROLTIP*/\n  if (S.landing) return 'Совет: на мелководье");
}
// ---------------------------------------------------------------- the boosts in the city-engine battle: the bought stock goes in with «init», a spent one comes back as «boost»
if (!t.includes('/*BOOSTS*/')) {
  rep("{ legWar: 'init', slots: camp.army || ARMY_DEF }", "{ legWar: 'init', slots: camp.army || ARMY_DEF, boosts: battleBoosts() }");
  rep("  if (m.legWar !== 'end') return;", "  if (m.legWar === 'boost') { if (m.id === 'cry' || m.id === 'reinf' || m.id === 'wall' || m.id === 'pont') { camp.boosts[m.id] = Math.max(0, (camp.boosts[m.id] || 0) - 1); saveCamp(); } return; } /*BOOSTS*/\n  if (m.legWar !== 'end') return;");
  rep("function sendAudio() {", "function battleBoosts() { return { cry: camp.boosts.cry || 0, reinf: camp.boosts.reinf || 0, wall: camp.boosts.wall || 0, merc: mercCharges(), pont: camp.boosts.pont || 0 }; }\nfunction sendAudio() {");
}
// ---------------------------------------------------------------- the builders: a boost that opens one obstacle at once, priced well above the others so it competes with keeping engineers
if (!t.includes('/*ARMYTUT*/')) {
  rep("return { mode: armyMode, coins: camp.coins,", "return { tut: !camp.armyTut, mode: armyMode, coins: camp.coins,");
  rep("  if (m.type === 'ready') post('init');", "  if (m.type === 'tutDone') { camp.armyTut = true; saveCamp(); return; } /*ARMYTUT*/\n  if (m.type === 'ready') post('init');");
}
if (!t.includes('/*WARTUT*/')) {
  rep("boosts: battleBoosts() }", "boosts: battleBoosts(), tut: !camp.warTut }");
  rep("  if (m.legWar !== 'end') return;", "  if (m.legWar === 'tut') { camp.warTut = true; saveCamp(); return; } /*WARTUT*/\n  if (m.legWar !== 'end') return;");
  rep("'<button class=\"btn big\" type=\"button\" data-act=\"gold\">Чит: +500 денариев</button>' + tbChips() +", "'<button class=\"btn big\" type=\"button\" data-act=\"tut\">Показать обучение боя снова</button>' +\n              '<button class=\"btn big\" type=\"button\" data-act=\"gold\">Чит: +500 денариев</button>' + tbChips() +");
  rep("if (act === 'gold') { cheatGold(); refreshUI(); return; }", "if (act === 'tut') { camp.warTut = false; saveCamp(); sfx('click'); say('Обучение покажут в следующем бою'); return; }\n  if (act === 'gold') { cheatGold(); refreshUI(); return; }");
}
if (!t.includes('/*TUTRESET*/')) {
  rep("if (act === 'tut') { camp.warTut = false; saveCamp();", "if (act === 'tut') { camp.warTut = false; camp.armyTut = false; /*TUTRESET*/ saveCamp();");
}
if (!t.includes('/*NOSKIP*/')) {
  rep("$('tutOk').hidden = true; $('tutSkip').hidden = false;", "$('tutOk').hidden = true; $('tutSkip').hidden = true; /*NOSKIP*/");
}
if (!t.includes('/*BARTUT*/')) {
  rep("return { tut: !camp.armyTut, mode: armyMode,", "return { tut: !camp.armyTut, barTut: !camp.barTut, mode: armyMode,");
  rep("if (m.type === 'tutDone') { camp.armyTut = true; saveCamp(); return; }", "if (m.type === 'tutDone') { if (m.which === 'bar') camp.barTut = true; else camp.armyTut = true; saveCamp(); return; } /*BARTUT*/");
  rep("camp.warTut = false; camp.armyTut = false;", "camp.warTut = false; camp.armyTut = false; camp.barTut = false;");
}
if (!t.includes('/*NOTUTTEST*/')) {
  rep("boosts: battleBoosts(), tut: !camp.warTut }", "boosts: battleBoosts(), tut: !camp.warTut && testSave === null /*NOTUTTEST*/ }");
  rep("tut: !camp.armyTut, barTut: !camp.barTut,", "tut: !camp.armyTut && testSave === null, barTut: !camp.barTut && testSave === null,");
}
if (!t.includes('/*PONTBOOST*/')) {
  rep("const UNIT_NAME = ['Пехота'", "BOOSTS.pont = { short: 'Строители', name: 'Вольные строители', desc: 'Сразу открывают выбранную преграду: завал, мост или баррикаду. Инженеры не нужны.', dur: 240 }; /*PONTBOOST*/\nconst UNIT_NAME = ['Пехота'");
  rep("const SHOP = { cry: 30, reinf: 40, wall: 50 };", "const SHOP = { cry: 30, reinf: 40, wall: 50, pont: 120 };");
  rep("function renderBattleBar() {", "ICON.pont = '<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M3 15h18M5 15v5M19 15v5M7 15V9h10v6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"/></svg>';\nfunction renderBattleBar() {");
}
fs.writeFileSync(file, t);
console.log('ok', Math.round(t.length / 1024) + ' KB');
