// The squad roster: the training tree, prices, unlocks and the numbers shown on cards.
// One source for the barracks page (army.html) and the battles (war.html, tibur-war.html).
// Numbers are the game-designer's starting values (2026-10-05) — not yet balance-tested.
const TREE = {
  tiro:      { name: 'Новобранцы', tier: 0, from: null,      cost: 60,  n: 6, stats: [2, 2, 3, 1], role: 'Дешёвая затычка: сомкнут ряды и подержат',
               order: { name: 'Сомкнуть ряды', text: 'урон по отряду −25% на 6 с', cd: 25 }, strong: [], weak: [['Все', 'ALL']] },
  hastati:   { name: 'Гастаты',    tier: 1, from: 'tiro',    cost: 120, n: 8, stats: [3, 4, 2, 1], role: 'Линия: щиты держат стрелы',
               order: { name: 'Черепаха', text: 'стрелы почти не ранят, отряд медленнее', cd: 24 }, strong: [['Лучники', 'ARC']], weak: [['Конница с фланга', 'CAV']] },
  velites:   { name: 'Велиты',     tier: 1, from: 'tiro',    cost: 120, n: 6, stats: [2, 1, 4, 3], role: 'Застрельщики: дротики издали',
               order: { name: 'Залп', text: 'урон ×2,5 на 4 с', cd: 18 }, strong: [['Пехота', 'INF']], weak: [['Конница', 'CAV']] },
  eques:     { name: 'Всадники',   tier: 1, from: 'tiro',    cost: 200, n: 5, stats: [4, 3, 5, 1], role: 'Ударный кулак: удар с разгона',
               order: { name: 'Клин', text: 'разгон и мощный удар', cd: 30 }, strong: [['Лучники', 'ARC']], weak: [['Копья в лоб', 'INF']] },
  eng:       { name: 'Инженеры',   tier: 1, from: 'tiro',    cost: 180, n: 4, stats: [1, 2, 3, 1], role: 'Строят мосты, поднимают решётки',
               order: { name: 'Ловушка', text: 'яма: урон и замедление', cd: 14 }, strong: [], weak: [['Все', 'ALL']] },
  principes: { name: 'Принципы',   tier: 2, from: 'hastati', cost: 350, n: 6, stats: [4, 4, 2, 2], role: 'Тяжёлая пехота: пилумы перед сшибкой',
               order: { name: 'Пилумы', text: 'залп по ближайшему врагу, снимает «Черепаху»', cd: 30 }, strong: [['Фаланга', 'INF']], weak: [['Стрелы с фланга', 'ARC']],
               unlock: { prov: 2, why: 'Возьмите первый город Лация' } },
  triarii:   { name: 'Триарии',    tier: 2, from: 'hastati', cost: 450, n: 6, stats: [3, 5, 1, 1], role: 'Якорь против конницы: стена копий',
               order: { name: 'Ёж', text: 'конница бьёт втрое слабее и встаёт на 2 с; отряд стоит', cd: 20 }, strong: [['Конница', 'CAV']], weak: [['Пращники', 'ARC']],
               unlock: { prov: 3, why: 'Возьмите два города Лация' } },
  slingers:  { name: 'Пращники',   tier: 2, from: 'velites', cost: 350, n: 7, stats: [2, 1, 3, 5], role: 'Бьют дальше всех, слабы вблизи',
               order: { name: 'Камень в шлем', text: 'оглушает отряд на 3 с', cd: 25 }, strong: [['Лучники', 'ARC'], ['Фаланга', 'INF']], weak: [['Ближний бой', 'INF']],
               unlock: { prov: 2, why: 'Возьмите первый город Лация' } },
  cretans:   { name: 'Критяне',    tier: 2, from: 'velites', cost: 500, n: 6, stats: [3, 2, 3, 4], role: 'Наёмные лучники с огнём',
               order: { name: 'Огненные стрелы', text: 'поджигают место: урон 6 с, выкуривают засаду', cd: 35 }, strong: [['Засады', 'INF']], weak: [['Конница', 'CAV']],
               unlock: { own: 'ostia', why: 'Нужен порт: захватите Остию' } },
  scouts:    { name: 'Разведчики', tier: 2, from: 'eques',   cost: 400, n: 5, stats: [2, 2, 5, 2], role: 'Глаза армии: находят засады',
               order: { name: 'Разведка', text: 'открывает засады вокруг на 8 с', cd: 30 }, strong: [['Засады', 'INF']], weak: [['Пехота в лоб', 'INF']],
               unlock: { prov: 4, why: 'Возьмите три города' } },
  scorpion:  { name: 'Скорпион',   tier: 2, from: 'eng',     cost: 550, n: 4, stats: [5, 1, 1, 5], role: 'Баллиста: стреляет, только когда стоит',
               order: { name: 'Пробой', text: 'болт прошивает до 4 отрядов на линии', cd: 20 }, strong: [['Фаланга', 'INF']], weak: [['Конница', 'CAV']],
               unlock: { own: 'tibur', why: 'Возьмите Тибур' } }
};
const TREE_KIND = { tiro: 'INF', hastati: 'INF', principes: 'INF', triarii: 'INF', velites: 'ARC', slingers: 'ARC', cretans: 'ARC', eques: 'CAV', scouts: 'CAV', eng: 'SPEC', scorpion: 'SPEC',
  e_inf: 'INF', e_arc: 'ARC', e_cav: 'CAV', hoplite: 'INF', ambush: 'INF' };
const ARMY_DEFAULT = ['hastati', 'velites', 'eques', 'eng'];
// can this general's squad be retrained into `to`? (down its branch, or back to recruits to switch branch)
function canRetrain(cur, to) { if (cur === to) return false; if (to === 'tiro') return true; return TREE[to].from === cur; }
function unlockedNow(id, owned) { const u = TREE[id].unlock; if (!u) return true; if (u.prov) return owned.length >= u.prov; if (u.own) return owned.includes(u.own); return true; }
// a rough counter verdict for the pre-battle report and the in-battle ▲/▼: +1 strong, −1 weak, 0 even
const ENEMY_NAME = { e_inf: 'Копейщики', e_arc: 'Лучники', e_cav: 'Конница', hoplite: 'Фаланга', ambush: 'Засадники' };
function verdict(cls, foe) {
  const k = TREE_KIND[cls], f = TREE_KIND[foe];
  if (cls === 'triarii' && f === 'CAV') return 1; if ((cls === 'principes' || cls === 'scorpion' || cls === 'slingers') && foe === 'hoplite') return 1;
  if ((cls === 'scouts' || cls === 'cretans') && foe === 'ambush') return 1; if (cls === 'slingers' && f === 'INF' && foe !== 'hoplite') return -1;
  if (k === 'SPEC') return f === 'CAV' ? -1 : 0;
  const beats = { INF: 'CAV', CAV: 'ARC', ARC: 'INF' };
  return beats[k] === f ? 1 : beats[f] === k ? -1 : 0;
}
