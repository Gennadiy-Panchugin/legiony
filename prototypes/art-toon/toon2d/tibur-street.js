const fs = require('fs'); let t = fs.readFileSync('tibur.js', 'utf8');
const rep = (a, b) => { if (!t.includes(a)) { console.error('MISS', a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); };
rep("[262, 486], [300, 452], [380, 450], [450, 446]];", "[262, 520]];\nconst WEST_ST = [[262, 500], [206, 448], [188, 384], [204, 330], [262, 316], [340, 320]];");
rep("roads(g, [[TUNNEL, 36], [VALLEY, 30], [TOWN_ROAD, 36, true], [NORTH, 36, true]], r);", "roads(g, [[TUNNEL, 36], [VALLEY, 30], [WEST_ST, 30, true], [TOWN_ROAD, 36, true], [NORTH, 36, true]], r);");
rep("for (const [a0, a1] of [[-Math.PI / 2 + 0.17, Math.PI / 2 - 0.17], [Math.PI / 2 + 0.17, Math.PI * 1.5 - 0.17]])", "for (const [a0, a1] of [[-Math.PI / 2 + 0.17, Math.PI / 2 - 0.17], [Math.PI / 2 + 0.17, Math.PI - 0.3], [Math.PI + 0.3, Math.PI * 1.5 - 0.17]])");
rep("[240, 440], [610, 420]]) house(g, x, y);", "[350, 450], [610, 420], [110, 300], [270, 250]]) house(g, x, y);");
fs.writeFileSync('tibur.js', t); console.log('ok');
