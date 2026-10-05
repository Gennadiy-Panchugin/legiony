// Adds CSS animation to the ten saved artboards (the user's edits kept: we only add classes, keyframes and
// a few moving dots on top of the files as they were last saved).
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'artifact-files', '1d25ded1-f771-4d89-b64c-5f5b8837311d', 'project');
const OUT = path.join(__dirname, 'project');
const FILES = ['Main', 'Plan', 'Formation', 'Heights', 'General', 'Setup', 'Shore', 'Lanes', 'Siege', 'Cards'].map(n => n + '.dc.html');
const CSS = `
.pushR{animation:pushR 1.8s ease-in-out infinite}
@keyframes pushR{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.pushB{animation:pushB 1.8s ease-in-out infinite}
@keyframes pushB{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}
.flow{stroke-dasharray:18 8;animation:flow 1.3s linear infinite}
@keyframes flow{to{stroke-dashoffset:-26}}
.march{animation:march 30s linear infinite}
@keyframes march{to{stroke-dashoffset:-600}}
.spin{transform-box:fill-box;transform-origin:center;animation:spin 14s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 1.3s ease-in-out infinite}
@keyframes pulse{50%{transform:scale(1.14)}}
.blink{animation:blink 1.6s ease-in-out infinite}
@keyframes blink{50%{opacity:.35}}
.bob{animation:bob 2.4s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-3px) rotate(-2deg)}}
.ram{animation:ram 1.4s ease-in-out infinite}
@keyframes ram{50%{transform:translateY(-8px)}}
.lift{animation:lift 1.6s ease-in-out infinite}
@keyframes lift{50%{transform:translateY(-5px)}}
.run{animation:run 2.6s linear infinite}
@keyframes run{0%{offset-distance:0%;opacity:0}12%{opacity:1}88%{opacity:1}100%{offset-distance:100%;opacity:0}}
@media (prefers-reduced-motion: reduce){.pushR,.pushB,.flow,.march,.spin,.pulse,.blink,.bob,.ram,.lift,.run{animation:none}}
`;
const COLOR = { R: '#c0261b', B: '#2f6fd6', W: '#fff8e6', G: '#d9a441' };

function animate(s) {
  if (s.includes('@keyframes pushR')) return s;                         // already animated
  s = s.replace('a{color:#d9a441}a:hover{color:#f0c66a}', 'a{color:#d9a441}a:hover{color:#f0c66a}' + CSS);
  // crowds and formed cohorts: red presses forward, blue pushes back
  s = s.replace(/(<path d="M[^"]*?(?:h3\.2v4\.4|h4v4h-4z)[^"]*")( fill="#c0261b")/g, '$1 class="pushR"$2');
  s = s.replace(/(<path d="M[^"]*?(?:h3\.2v4\.4|h4v4h-4z)[^"]*")( fill="#2f6fd6")/g, '$1 class="pushB"$2');
  // order arrows become moving flows, with soldiers running along them
  s = s.replace(/<path d="([^"]+)"([^>]*?)marker-end="url\(#ar([RBWG])\)"([^>]*?)(\/>|>\s*<\/path>)/g, (m, d, a1, c, a2, end) => {
    const dashed = /stroke-dasharray/.test(a1 + a2);
    const tag = `<path d="${d}"${a1}class="${dashed ? 'march' : 'flow'}" marker-end="url(#ar${c})"${a2}${end}`;
    const dot = (delay) => `<circle cx="0" cy="0" r="${c === 'W' ? 2.6 : 3.4}" fill="${c === 'W' ? '#c0261b' : COLOR[c]}" stroke="#fff8e6" stroke-width="1" class="run" style="offset-path: path('${d}'); offset-rotate: 0deg; animation-delay: ${delay}s"/>`;
    return tag + dot(0) + dot(-1.3);
  });
  // the onager's throw: a stone flies along its dashed arc
  s = s.replace(/(<path d="(M300 480 Q330 300 290 168)"[^>]*?)(\/>|>\s*<\/path>)/, (m, a, d, end) =>
    `${a} class="march"${end}<circle cx="0" cy="0" r="5" fill="#6b5a44" stroke="#2a1c10" stroke-width="1" class="run" style="offset-path: path('${d}'); offset-rotate: 0deg"/>`);
  // dashed circles: order radii, selection rings — slow turn; dashed boxes blink; other dashed lines march
  s = s.replace(/<circle([^>]*?)stroke-dasharray="([^"]+)"([^>]*?)>/g, (m, a, d, b) => /class=|transform=/.test(a + b) ? m : `<circle${a}stroke-dasharray="${d}" class="spin"${b}>`);
  s = s.replace(/<rect([^>]*?)stroke-dasharray="([^"]+)"([^>]*?)>/g, (m, a, d, b) => /class=|stroke-opacity="\.35"/.test(a + b) ? m : `<rect${a}stroke-dasharray="${d}" class="blink"${b}>`);
  s = s.replace(/<path([^>]*?)stroke-dasharray="([^"]+)"([^>]*?)>/g, (m, a, d, b) => /class=/.test(a + b) ? m : `<path${a}stroke-dasharray="${d}" class="march"${b}>`);
  // alarms, capture zones, the drop target pulse
  s = s.replace(/(<circle cx="[^"]+" cy="[^"]+" r="13" fill="#7d1d16")/g, '$1 class="pulse"');
  s = s.replace(/(<circle cx="[^"]+" cy="[^"]+" r="40" fill="#(?:c0261b|2f6fd6)" fill-opacity="\.08")/g, '$1 class="pulse"');
  s = s.replace(/(<rect [^>]*?fill="none" stroke="#d9a441" stroke-width="2\.5")/g, '$1 class="pulse"');
  // the plan timer's arc ticks
  s = s.replace(/(<path d="M345 18 A22 22 0 1 1 323\.4 44")/, '$1 class="blink"');
  // boats ride the swell (wrapped, so their placement transform stays)
  s = s.replace(/(<g transform="translate\([^"]+\) rotate\([^"]+\)">)([\s\S]*?)(<\/g>)/g, '$1<g class="bob">$2</g>$3');
  // the ram swings at the gate
  s = s.replace(/(<path d="M175 410 L195 250 L215 410 Z")/, '$1 class="ram"');
  // the chosen card or unit card floats up a little
  s = s.replace(/<div style="([^"]*?border: 1\.5px solid #d9a441[^"]*)"/g, '<div class="lift" style="$1"');
  s = s.replace(/<div style="(flex: 1 1 0; border-radius: 10px; border: 1px solid #d9a441;[^"]*)"/g, '<div class="lift" style="$1"');
  return s;
}

for (const f of FILES) {
  const src = fs.readFileSync(path.join(SRC, f), 'utf8');
  const out = animate(src);
  fs.writeFileSync(path.join(OUT, f), out);
  const n = k => (out.match(new RegExp('class="' + k + '"', 'g')) || []).length;
  console.log(f.padEnd(20), ['pushR', 'pushB', 'flow', 'march', 'run', 'spin', 'pulse', 'blink', 'bob', 'ram', 'lift'].map(k => k + ':' + n(k)).filter(x => !x.endsWith(':0')).join(' '));
}
