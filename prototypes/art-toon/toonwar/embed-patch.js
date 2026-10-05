// Embedded mode for the main game: report the result to the parent instead of restarting.
const fs = require('fs'); let t = fs.readFileSync('war.js', 'utf8');
function rep(a, b) { if (!t.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); }
rep("function checkEnd() {", "const EMBED = window.name === 'legwar';\nfunction report(win, surrendered) { parent.postMessage({ legWar: 'end', win, surrendered: !!surrendered, t: G.t, kills: G.kills, lost: G.lost, flags: G.points.filter(p => p.owner === 1).length }, '*'); }\nfunction checkEnd() {");
rep("$('restart').addEventListener('click', () => restart()); $('ovB').addEventListener('click', () => restart());",
    "$('restart').addEventListener('click', () => { if (!EMBED) return restart(); if (G.over) return; if (confirm('Отступить? Провинция останется за врагом.')) { G.over = true; report(2, true); } });\n$('ovB').addEventListener('click', () => EMBED ? report(G.winner) : restart());\nif (EMBED) { $('restart').textContent = '⚑'; $('restart').title = 'Отступить'; $('restart').setAttribute('aria-label', 'Отступить'); $('ovB').textContent = 'Дальше'; }");
fs.writeFileSync('war.js', t); console.log('ok');
