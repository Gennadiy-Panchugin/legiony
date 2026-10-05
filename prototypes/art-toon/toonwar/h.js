const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync('war.html', 'utf8').match(/<script>([\s\S]*)<\/script>/)[1];
function el() { return { style: { setProperty() {} }, classList: { toggle() {} }, hidden: false, textContent: '', innerHTML: '', className: '', disabled: false, children: [], addEventListener() {}, setPointerCapture() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 540, height: 960 }), getContext: () => ctx2d(), width: 900, height: 1500, setAttribute() {} }; }
function ctx2d() { return new Proxy({}, { get: (t, k) => k in t ? t[k] : (k === 'measureText' ? () => ({ width: 10 }) : (k === 'createLinearGradient' || k === 'createRadialGradient' ? () => ({ addColorStop() {} }) : k === 'getImageData' ? (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }) : () => {})), set: (t, k, v) => (t[k] = v, true) }); }
const els = {};
const sb = { document: { addEventListener() {}, hidden: false, getElementById: id => els[id] || (els[id] = el()), createElement: () => el(), fonts: null }, innerWidth: 540, innerHeight: 960, devicePixelRatio: 1, addEventListener() {}, performance: { now: () => 0 }, requestAnimationFrame() {}, setTimeout() {}, clearTimeout() {}, Math, console };
sb.window = sb; vm.createContext(sb);
console.log('start'); vm.runInContext(src, sb, { timeout: 8000 }); console.log('loaded'); vm.runInContext('bake(); console.log("baked"); draw(0.1); console.log("drawn")', sb, { timeout: 8000 });
module.exports = sb.__tw;
