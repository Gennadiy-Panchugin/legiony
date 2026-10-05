const P = require('./harness.js'); P.newBattle(); P.start(); const G = P.G; const [h, v, c, e] = G.rome;
for (const [s, x, y] of [[h, 180, 560], [v, 300, 580], [c, 120, 540]]) P.cmd(s, x, y, true);
for (let i = 0; i < 160; i++) P.step(0.05);
console.log('free walk after 8 s:', [h, v, c].map(s => s.cls + '@' + s.x.toFixed(0) + ',' + s.y.toFixed(0)).join(' '));
for (const s of [h, v, c]) P.cmd(s, 240, 490, true); P.cmd(e, 240, 560, true);
let t = 0; const log = []; while (t < 60 && !G.over) { P.step(0.05); t += 0.05; if (Math.abs(t % 10) < 0.03) log.push(Math.round(t) + 's: ' + P.alive().map(s => (s.side === 1 ? 'R' : 'B') + s.cls.slice(0, 3) + s.n.toFixed(1) + '@' + s.x.toFixed(0) + ',' + s.y.toFixed(0)).join(' ')); }
console.log(log.join('\n'));
console.log('alarms', JSON.stringify(Object.keys(G.alarm)), 'lost', G.lost, 'kills', G.kills);
