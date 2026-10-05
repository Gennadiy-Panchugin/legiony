const fs = require('fs'); let t = fs.readFileSync('tibur.js', 'utf8');
const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); };
rep("g.beginPath(); g.ellipse(450, 320, 130, 70, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; g.stroke();",
    "g.beginPath(); g.ellipse(450, 320, 130, 70, 0, 0, 7); g.fillStyle = '#e6d6b0'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = OL; for (const [a0, a1] of [[-Math.PI / 2 + 0.17, Math.PI / 2 - 0.17], [Math.PI / 2 + 0.17, Math.PI * 1.5 - 0.17]]) { g.beginPath(); g.ellipse(450, 320, 130, 70, 0, a0, a1); g.stroke(); }");
rep("[262, 486], [300, 446], [400, 400]];", "[262, 486], [300, 452], [380, 450], [450, 446]];");
rep("NORTH = [[450, 230], [450, 0]]", "NORTH = [[450, 270], [450, 0]]");
rep("TOWN_ROAD = [[450, 620], [450, 470], [450, 380]]", "TOWN_ROAD = [[450, 620], [450, 470], [450, 360]]");
rep("roads(g, [[TUNNEL, 36], [VALLEY, 30], [TOWN_ROAD, 38, true], [NORTH, 34, true]], r);", "roads(g, [[TUNNEL, 36], [VALLEY, 30], [TOWN_ROAD, 36, true], [NORTH, 36, true]], r);");
fs.writeFileSync('tibur.js', t); console.log('ok');
