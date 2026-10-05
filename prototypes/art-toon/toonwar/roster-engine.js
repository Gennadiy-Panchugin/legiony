// New squad types for the battle engine: classes, orders and banners. Loaded after the castle's CLS / BOOST / BAN.
// def — incoming damage multiplier; vsCav — bonus against cavalry; weakNear — ranged damage when an enemy is in melee reach;
// deploy — seconds standing still before it can shoot; front — damage taken from the front (phalanx); first — first strike from hiding.
Object.assign(CLS.tiro, { n: 6, def: 1.15, hint: 'дёшево: сомкнут ряды и подержат' });
CLS.hastati.def = 1; CLS.velites.def = 1.2; CLS.eques.def = 1; CLS.eng.def = 1.1;
Object.assign(CLS, {
  principes: { name: 'Принципы', letter: 'П', kind: INF, n: 6, k: 0.13, speed: 28, def: 0.8, hint: 'тяжёлая пехота, пилумы' },
  triarii:   { name: 'Триарии', letter: 'Т', kind: INF, n: 6, k: 0.10, speed: 24, def: 0.7, vsCav: 1.4, hint: 'стена копий против конницы' },
  slingers:  { name: 'Пращники', letter: 'Р', kind: ARC, n: 7, k: 0.07, speed: 30, range: 240, def: 1.2, weakNear: 0.4, hint: 'бьют дальше всех' },
  cretans:   { name: 'Критяне', letter: 'Л', kind: ARC, n: 6, k: 0.10, speed: 30, range: 210, def: 1.1, hint: 'лучники-наёмники, огонь' },
  scouts:    { name: 'Разведчики', letter: 'Д', kind: CAV, n: 5, k: 0.07, speed: 76, def: 1.1, hint: 'видят засады' },
  scorpion:  { name: 'Скорпион', letter: 'С', kind: ARC, n: 4, k: 0.2, speed: 18, range: 260, def: 1.3, deploy: 2, hint: 'стреляет только стоя' },
  hoplite:   { name: 'Фаланга', letter: '', kind: INF, n: 6, k: 0.09, speed: 26, front: 0.45 },
  ambush:    { name: 'Засадники', letter: '', kind: INF, n: 5, k: 0.085, speed: 36, first: 2 }
});
Object.assign(BOOST, {
  close:  { name: 'Сомкнуть ряды', text: 'урон −25% на 6 с', kind: 'self', dur: 6, cd: 25 },
  pila:   { name: 'Пилумы', text: 'залп по ближайшему врагу', kind: 'self', dur: 0.5, cd: 30 },
  hedge:  { name: 'Ёж', text: 'стена копий против конницы', kind: 'self', dur: 6, cd: 20 },
  stun:   { name: 'Камень в шлем', text: 'оглушить отряд на 3 с', kind: 'target', range: 280, cd: 25 },
  fire:   { name: 'Огненные стрелы', text: 'поджечь место на 6 с', kind: 'target', range: 240, cd: 35, uses: 2 },
  scout:  { name: 'Разведка', text: 'открыть засады на 8 с', kind: 'self', dur: 8, cd: 30 },
  pierce: { name: 'Пробой', text: 'болт сквозь строй', kind: 'target', range: 320, cd: 20 }
});
Object.assign(BOOSTS, { tiro: ['close'], principes: ['pila', 'turtle'], triarii: ['hedge'], slingers: ['stun'], cretans: ['fire', 'rain'], scouts: ['scout', 'gallop'], scorpion: ['pierce'] });
Object.assign(BAN, {
  principes: { col: '#8a1a14', trim: '#d9a441', emb: 'eagle', shape: 'vex' }, triarii: { col: '#5a1410', trim: '#f4f0e4', emb: 'eagle', shape: 'vex' },
  slingers: { col: '#3a7a3e', trim: '#eef3d2', emb: 'wolf', shape: 'pennant' }, cretans: { col: '#2a6a5a', trim: '#ffcc66', emb: 'wolf', shape: 'pennant' },
  scouts: { col: '#5a3a8a', trim: '#f2e8ff', emb: 'horse', shape: 'swallow' }, scorpion: { col: '#b0701a', trim: '#2a1c10', emb: 'pick', shape: 'square' },
  hoplite: { col: '#2f6fd6', trim: '#ffd27a', emb: 'eagle', shape: 'vex' }, ambush: { col: '#2f6fd6', trim: '#b8e0a0', emb: 'wolf', shape: 'pennant' }
});
// the order each new class is shown with on the help screen's slot buttons
const ORDER_ALL = ['tiro', 'hastati', 'principes', 'triarii', 'velites', 'slingers', 'cretans', 'eques', 'scouts', 'eng', 'scorpion'];
