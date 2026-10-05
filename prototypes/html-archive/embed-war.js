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
  city('Столица', 5, ['hoplite', 'ambush', 'e_inf', 'e_arc', 'e_cav'], 'Осада в два акта: надвратные башни внешней стены, затем цитадель. Таран из осадного двора, пятый отряд из школы гладиаторов, подкрепления по мосту за городом.');
  rep("if (!camp.tutDone && id === 'veii')", "if (!camp.tutDone && id === 'veii' && !MAPS[p.map].war)");
  rep('  const html = new TextDecoder().decode(Uint8Array.from(atob(WAR_HTML), c => c.charCodeAt(0)));', "  const city = MAPS[p.map].war === 'city', html = new TextDecoder().decode(Uint8Array.from(atob(city ? CITY_HTML : WAR_HTML), c => c.charCodeAt(0)));");
  rep("  warFrame.name = 'legwar'; warFrame.title = 'Бой: ' + p.name;", "  warFrame.name = city ? 'legwar:' + p.id : 'legwar'; warFrame.title = 'Бой: ' + p.name;");
  rep("let warFrame = null;\n", "let warFrame = null;\nconst CITY_HTML = /*CITY_B64*/'" + CITY + "';\n");
}
fs.writeFileSync(file, t);
console.log('ok', Math.round(t.length / 1024) + ' KB');
