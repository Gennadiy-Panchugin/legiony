const fs = require('fs');
let s = fs.readFileSync(__dirname + '/front.html', 'utf8');
function rep(a, b) { const n = s.split(a).length - 1; if (n !== 1) { console.error('MISS', n, a.slice(0, 100)); process.exit(1); } s = s.replace(a, b); }
// idle holders engage enemies that come close (archers keep shooting from their spot)
rep("    } else [tx, ty] = u.hold || [u.x, u.y];",
`    } else {
      [tx, ty] = u.hold || [u.x, u.y];
      if (u.kind !== ARC) {                                            // close with an intruder near the line
        let e = null, ed = AGGRO * AGGRO;
        for (const o of near(u, AGGRO)) { if (o.owner === u.owner) continue; const d2 = (o.x - u.x) ** 2 + (o.y - u.y) ** 2; if (d2 < ed) { ed = d2; e = o; } }
        if (e) { tx = e.x; ty = e.y; }
      }
    }`);
rep("const HOME_BONUS = 1.25, BRIDGE_PENALTY = 1.5;", "const HOME_BONUS = 1.25, BRIDGE_PENALTY = 1.5, AGGRO = 60;");
fs.writeFileSync(__dirname + '/front.html', s);
console.log('ok');
