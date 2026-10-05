const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync('crossing.html', 'utf8'), src = html.match(/<script>([\s\S]*)<\/script>/)[1];
function el() { return { style: {}, hidden: false, textContent: '', innerHTML: '', className: '', disabled: false, children: [], addEventListener() {}, setPointerCapture() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 540, height: 960 }), getContext: () => ctx2d(), width: 0, height: 0, setAttribute() {}, setProperty() {} }; }
function ctx2d() { return new Proxy({}, { get: (t, k) => k in t ? t[k] : (k === 'measureText' ? () => ({ width: 10 }) : (k === 'createLinearGradient' || k === 'createRadialGradient' ? () => ({ addColorStop() {} }) : () => {})), set: (t, k, v) => (t[k] = v, true) }); }
const els = {};
const sb = { document: { addEventListener() {}, hidden: false, getElementById: id => els[id] || (els[id] = el()), createElement: () => el() }, innerWidth: 540, innerHeight: 960, addEventListener() {}, performance: { now: () => 0 }, requestAnimationFrame() {}, setTimeout() {}, clearTimeout() {}, Math, console };
sb.window = sb; vm.createContext(sb); vm.runInContext(src, sb);
module.exports = sb.__cr;
