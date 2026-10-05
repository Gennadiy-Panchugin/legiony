const fs = require('fs');
let t = fs.readFileSync('terrain.js', 'utf8');
function rep(a, b) { if (!t.includes(a)) { console.error('MISS', a.slice(0, 70)); process.exit(1); } t = t.replace(a, () => b); }
for (let i = 1; i <= 6; i++) rep('<figure><div class="pic"><canvas id="mo' + i + '"', '<figure class="pick" data-n="' + i + '" tabindex="0" role="button" aria-pressed="false"><div class="pic"><canvas id="mo' + i + '"');
rep('  <h2>Значки местности</h2>', '  <p class="chosen" id="chosen">Коснитесь вариантов, которые нравятся: можно выбрать несколько.</p>\n  <h2>Значки местности</h2>');
rep('  .strip {', `  .pick { cursor: pointer; position: relative; border-radius: 22px; padding: 6px; transition: transform .12s; }
  .pick:hover { transform: translateY(-3px); }
  .pick .pic { transition: box-shadow .12s, border-color .12s; }
  .pick.on .pic { border-color: #ffcc33; box-shadow: 0 0 0 4px #ffcc33, 0 0 22px rgba(255,204,51,.55); }
  .pick.on::after { content: '✓'; position: absolute; top: 14px; right: 14px; width: 40px; height: 40px; border-radius: 50%; background: #ffcc33; border: 3px solid #2b1a10; color: #2b1a10; font: 400 24px var(--display); display: flex; align-items: center; justify-content: center; }
  .pick:focus-visible { outline: 3px solid #fff; }
  .chosen { margin-top: 14px; padding: 12px 16px; border-radius: 16px; background: #3a2414; border: 2.5px solid var(--gold); color: #ffe6a8; font-weight: 800; max-width: 760px; }
  .strip {`);
rep("(document.fonts && document.fonts.load", `const picks = [...document.querySelectorAll('.pick')], showChosen = () => { const on = picks.filter(p => p.classList.contains('on')).map(p => p.querySelector('figcaption b').textContent); document.getElementById('chosen').textContent = on.length ? 'Вы выбрали: ' + on.join(', ') + '. Напишите мне — добавлю их на карту.' : 'Коснитесь вариантов, которые нравятся: можно выбрать несколько.'; try { localStorage.setItem('mounds', JSON.stringify(picks.map(p => p.classList.contains('on')))); } catch (_) {} };
try { const saved = JSON.parse(localStorage.getItem('mounds') || '[]'); picks.forEach((p, i) => { if (saved[i]) { p.classList.add('on'); p.setAttribute('aria-pressed', 'true'); } }); } catch (_) {}
picks.forEach(p => { const tog = () => { p.classList.toggle('on'); p.setAttribute('aria-pressed', String(p.classList.contains('on'))); showChosen(); }; p.addEventListener('click', tog); p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } }); });
showChosen();
(document.fonts && document.fonts.load`);
fs.writeFileSync('terrain.js', t); console.log('ok');
