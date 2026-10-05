// v3: static defenders (no reinforcements), forest ambush for ranged squads, synthesised sound and music.
const fs = require('fs'), path = require('path');
const F = path.join(__dirname, 'castle.html');
let s = fs.readFileSync(F, 'utf8');
function rep(a, b) { const i = s.indexOf(a); if (i < 0 || s.indexOf(a, i + 1) >= 0) { console.error('MISS', a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); }

// ---------------------------------------------------------------- static defenders
rep('owner: 2, prog: 0, spawn: 6 }', 'owner: 2, prog: 0, spawn: 1e9 }');
rep('owner: 2, prog: 0, spawn: 12 }', 'owner: 2, prog: 0, spawn: 1e9 }');
rep('const TIME = 270, WAVES = [70, 130, 190],', 'const TIME = 1e9, WAVES = [],');
rep('if (tgt && bd < 170 && Math.hypot(tgt.x - hx, tgt.y - hy) < 260 && s.kind !== ARC) s.atk = tgt;', 'if (tgt && bd < 115 && Math.hypot(tgt.x - hx, tgt.y - hy) < 190 && s.kind !== ARC) s.atk = tgt;');
rep('Math.hypot(s.atk.x - hx, s.atk.y - hy) > 300)) s.atk = null;', 'Math.hypot(s.atk.x - hx, s.atk.y - hy) > 230)) s.atk = null;');
rep('<span id="sub">Займите донжон до подхода подмоги</span>', '<span id="sub">Займите донжон, враги стоят на постах</span>');
rep('<p>Лагеря рожают отряды, пока их не взяли. Мы выбираем состав — коснитесь, чтобы сменить класс:</p>', '<p>Враги стоят на постах и не получают подкрепления, так что каждый ваш воин на счету. Выберите состав, коснитесь, чтобы сменить класс:</p>');
rep('<b>Поражение:</b> все отряды выбиты или подошла подмога (4:30).</p>', '<b>Поражение:</b> все отряды выбиты.</p>');
rep('<b>Дорога</b> быстрее. Красный знак «!» предупреждает, откуда выйдет враг.</p>', '<b>Дорога</b> быстрее. <b>Дальнобойные в лесу</b> не видны врагу, пока он дальше двух клеток, даже когда стреляют. Но обстрелянная пехота бросится искать засаду.</p>');
rep("  $('clock').textContent = clock(left);\n  const nextWave = WAVES[G.waveN];", "  $('clock').textContent = clock(G.t);\n  const foesLeft = G.sq.filter(s => s.alive && s.side === 2 && s.ai !== 'tower').length;\n  SND.slow(!!G.sel); SND.level(G.sq.filter(s => s.alive && s.fighting).length / 3);");
rep("'Лагеря ' + camps + '/2 · башни ' + towers + '/2 · ' + (nextWave ? 'подмога через ' + clock(nextWave - G.t) : 'подмога вышла');", "'Лагеря ' + camps + '/2 · башни ' + towers + '/2 · вражеских отрядов ' + foesLeft;");
rep("'Донжон захватывается: ' + Math.ceil(KEEP_NEED - G.keep.prog) + ' с' : 'Займите донжон до подхода подмоги';", "'Донжон захватывается: ' + Math.ceil(KEEP_NEED - G.keep.prog) + ' с' : 'Займите донжон, враги стоят на постах';");

// ---------------------------------------------------------------- forest ambush: ranged squads stay unseen while shooting
rep("const hidden = s => s.side === 1 && T[s.r][s.c] === 'f' && !s.fighting;", "const hidden = s => s.side === 1 && T[s.r][s.c] === 'f' && (s.range > 0 || !s.fighting);");
rep("    t.pend += v; t.hurt = 0.25;", "    t.pend += v; t.hurt = 0.25;\n    if (a.side === 1 && ranged && hidden(a) && t.side === 2 && t.ai === 'hold' && t.kind !== ARC) t.atk = a;        // the stung infantry goes hunting for the ambush");

// ---------------------------------------------------------------- hooks for sound
rep("G.sel = s; if (s.skill) { /* skill button state in uiCards */ }", "G.sel = s; SND.play('select');");
rep("s.sk = s.skill.dur; s.cd = s.skill.cd;", "s.sk = s.skill.dur; s.cd = s.skill.cd; SND.play({ hastati: 'shield', velites: 'volley', eques: 'gallop', eng: 'rush' }[s.cls], s.x);");
rep("  s.path = p; return true;", "  s.path = p; if (!quiet) SND.play('order'); return true;");
rep("a.clash = ranged ? 0.5 : 0.35; bleed(t);", "a.clash = ranged ? 0.5 : 0.35; bleed(t); SND.hit(a);");
rep("a.travel = 0; G.fx.push({ x: (a.x + t.x) / 2", "a.travel = 0; SND.play('charge', a.x); G.fx.push({ x: (a.x + t.x) / 2");
rep("s.clash = 0.35; const [wx, wy] = cellXY(w.r, w.c);", "s.clash = 0.35; const [wx, wy] = cellXY(w.r, w.c); SND.play('tool', wx);");
rep("if (w.left <= 0) { const ch = T[w.r][w.c];", "if (w.left <= 0) { SND.play('crash', cellXY(w.r, w.c)[0]); const ch = T[w.r][w.c];");
rep("cp.owner = 1; cp.prog = 0;", "cp.owner = 1; cp.prog = 0; SND.play('capture');");
rep("      } else cp.prog = Math.max(0, cp.prog - dt * 0.5);", "      } else { const was = cp.prog; cp.prog = Math.max(0, cp.prog - dt * 0.5); if (was > 0 && cp.prog === 0) SND.play('lost'); }");
rep("else G.keep.prog = Math.max(0, G.keep.prog - dt * 0.5); }", "else { const was = G.keep.prog; G.keep.prog = Math.max(0, G.keep.prog - dt * 0.5); if (was > 0 && G.keep.prog === 0) SND.play('lost'); } }");
rep("  G.fx.push({ x: s.x, y: s.y, t: 0.9, big: true, rout: true });", "  G.fx.push({ x: s.x, y: s.y, t: 0.9, big: true, rout: true });\n  SND.play(s.side === 1 ? 'death' : s.ai === 'tower' ? 'crash' : 'kill', s.x);");
rep("  G.over = true; G.sel = null;", "  G.over = true; G.sel = null; SND.play(win === 1 ? 'win' : 'lose');");
rep("$('helpOk').addEventListener('click', () => { $('help').hidden = true; started = true; });", "$('helpOk').addEventListener('click', () => { $('help').hidden = true; started = true; SND.init(); });\n$('snd').addEventListener('click', () => { SND.toggle(); $('snd').textContent = SND.isOn() ? '♪' : '✕'; });\ndocument.addEventListener('visibilitychange', () => SND.visible(!document.hidden));");
rep("function restart() { newBattle(); $('over').hidden = true; $('help').hidden = true; started = true; }", "function restart() { newBattle(); $('over').hidden = true; $('help').hidden = true; started = true; SND.init(); }");
rep('    <span class="chip" id="clock">4:30</span>', '    <button class="ibtn" id="snd" type="button" aria-label="Звук и музыка" title="Звук и музыка">♪</button>\n    <span class="chip" id="clock">0:00</span>');

// ---------------------------------------------------------------- the sound engine: everything is synthesised, no files
const AUDIO = String.raw`// ---------------------------------------------------------------- sound: synthesised with Web Audio, no files
const SND = (() => {
  let ac = null, master, sfx, mus, filt, nbuf, on = true, timer = 0, nextT = 0, stepN = 0, lvl = 0, slowOn = false;
  const last = {}, SP = 60 / 96 / 4, hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; return; }
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(ac.destination);
    master = ac.createGain(); master.gain.value = on ? 0.8 : 0; master.connect(comp);
    sfx = ac.createGain(); sfx.gain.value = 0.9; sfx.connect(master);
    filt = ac.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 7000;
    mus = ac.createGain(); mus.gain.value = 0.55; mus.connect(filt); filt.connect(master);
    nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    nextT = ac.currentTime + 0.2; stepN = 0; timer = setInterval(sched, 90);
  }
  const out = (bus, pan) => { if (!ac.createStereoPanner || pan === undefined) return bus; const p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); p.connect(bus); return p; };
  function tone(f, dur, type, vol, o) {
    o = o || {}; if (!ac) return;
    const t0 = o.at || ac.currentTime, osc = ac.createOscillator(), g = ac.createGain();
    osc.type = type; osc.frequency.setValueAtTime(f, t0); if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + (o.attack || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    if (o.lp) { const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp; osc.connect(lp); lp.connect(g); } else osc.connect(g);
    g.connect(out(o.bus || sfx, o.pan)); osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  function noise(dur, vol, o) {
    o = o || {}; if (!ac) return;
    const t0 = o.at || ac.currentTime, src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = nbuf; src.loop = true; f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 2000, t0); if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + dur); f.Q.value = o.q || 0.8;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + (o.attack || 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(out(o.bus || sfx, o.pan)); src.start(t0, Math.random() * 0.5); src.stop(t0 + dur + 0.05);
  }
  // carnyx-like brass: a sawtooth chord through a low-pass
  function horn(notes, times, len, dark) {
    notes.forEach((n, i) => { const at = ac.currentTime + times[i];
      tone(hz(n), len, 'sawtooth', 0.15, { at, attack: 0.05, lp: dark ? 900 : 1700 }); tone(hz(n - 12), len, 'sawtooth', 0.12, { at, attack: 0.05, lp: 700 }); });
  }
  const fx = {
    clash: p => { noise(0.07, 0.34, { type: 'highpass', f: 3000, pan: p }); tone(1500 + Math.random() * 900, 0.14, 'square', 0.05, { to: 900, pan: p }); tone(220, 0.08, 'triangle', 0.14, { pan: p }); },
    thud: p => { noise(0.1, 0.4, { type: 'lowpass', f: 900, pan: p }); tone(130, 0.14, 'sine', 0.35, { to: 60, pan: p }); },
    arrow: p => { noise(0.26, 0.22, { f: 1200, to: 3800, q: 1.5, pan: p, attack: 0.05 }); tone(240, 0.09, 'triangle', 0.14, { at: ac.currentTime + 0.22, pan: p }); },
    javelin: p => { noise(0.2, 0.2, { f: 900, to: 2600, q: 1.2, pan: p, attack: 0.04 }); tone(160, 0.1, 'sine', 0.3, { at: ac.currentTime + 0.18, to: 80, pan: p }); },
    hoof: p => { for (let i = 0; i < 3; i++) tone(95, 0.07, 'sine', 0.3, { at: ac.currentTime + i * 0.085, to: 60, pan: p }); },
    charge: p => { tone(70, 0.5, 'sine', 0.6, { to: 35, pan: p }); noise(0.35, 0.5, { type: 'lowpass', f: 700, to: 200, pan: p }); noise(0.1, 0.3, { type: 'highpass', f: 2500, pan: p }); },
    tool: p => { tone(820, 0.05, 'square', 0.09, { to: 500, pan: p }); noise(0.08, 0.25, { f: 1800, q: 3, pan: p }); },
    crash: p => { noise(0.7, 0.55, { type: 'lowpass', f: 1400, to: 150, pan: p }); tone(55, 0.6, 'sine', 0.55, { to: 30, pan: p }); },
    select: () => tone(560, 0.06, 'sine', 0.12),
    order: () => { tone(330, 0.07, 'triangle', 0.14); tone(495, 0.09, 'triangle', 0.1, { at: ac.currentTime + 0.05 }); },
    shield: p => { tone(660, 0.45, 'square', 0.06, { to: 640, lp: 2500, pan: p }); tone(990, 0.35, 'square', 0.04, { lp: 2500, pan: p }); noise(0.1, 0.3, { type: 'highpass', f: 3500, pan: p }); },
    volley: p => { for (let i = 0; i < 4; i++) noise(0.3, 0.16, { f: 1000, to: 3600, q: 1.4, at: ac.currentTime + i * 0.05, attack: 0.06, pan: p }); },
    gallop: p => { for (let i = 0; i < 6; i++) tone(90, 0.07, 'sine', 0.28, { at: ac.currentTime + i * 0.07, to: 55, pan: p }); },
    rush: () => { [0, 1, 2].forEach(i => tone(600 + i * 200, 0.08, 'square', 0.05, { at: ac.currentTime + i * 0.06, lp: 2400 })); },
    capture: () => horn([62, 66, 69, 74], [0, 0.22, 0.44, 0.7], 0.5),
    lost: () => horn([62, 58, 55, 50], [0, 0.22, 0.44, 0.7], 0.55, true),
    death: p => { tone(150, 0.9, 'sawtooth', 0.2, { to: 55, lp: 700, pan: p }); tone(60, 0.7, 'sine', 0.5, { to: 35, pan: p }); noise(0.6, 0.25, { type: 'lowpass', f: 600, to: 150, pan: p }); },
    kill: p => { tone(80, 0.3, 'sine', 0.35, { to: 45, pan: p }); noise(0.2, 0.3, { type: 'lowpass', f: 800, pan: p }); },
    win: () => horn([62, 66, 69, 74, 78], [0, 0.25, 0.5, 0.8, 1.2], 0.7),
    lose: () => horn([62, 59, 55, 50, 43], [0, 0.4, 0.8, 1.2, 1.7], 0.8, true)
  };
  const GAP = { clash: 70, thud: 90, arrow: 140, javelin: 140, hoof: 300, tool: 200, select: 60, order: 60 };
  function play(name, x) {
    if (!ac || !on || !fx[name]) return;
    const n = performance.now(); if (GAP[name] && last[name] && n - last[name] < GAP[name]) return; last[name] = n;
    fx[name](x === undefined ? undefined : (x - 270) / 270 * 0.7);
  }
  // each kind of squad sounds different in battle
  function hit(a) {
    const n = a.cls;
    if (n === 'velites') play('javelin', a.x); else if (n === 'e_arc' || n === 'e_tower') play('arrow', a.x);
    else if (n === 'e_inf') play('thud', a.x);
    else if (n === 'eques') { play('clash', a.x); play('hoof', a.x); }
    else play('clash', a.x);
  }
  // music: low drone, frame drums, a brass motif that joins when the fighting starts (D minor)
  const CH = [[38, 45], [34, 41], [36, 43], [38, 45]];
  const MEL = [[[0, 62, 6], [8, 65, 4], [12, 67, 4]], [[0, 69, 6], [8, 67, 4], [12, 65, 4]], [[0, 64, 6], [8, 65, 4], [12, 67, 4]], [[0, 62, 8], [8, 57, 8]]];
  function boom(t, v) { tone(78, 0.3, 'sine', 0.5 * v, { at: t, to: 42, bus: mus }); noise(0.05, 0.1 * v, { type: 'lowpass', f: 1200, at: t, bus: mus }); }
  function sched() {
    if (!ac || !on) { if (ac) nextT = Math.max(nextT, ac.currentTime); return; }
    while (nextT < ac.currentTime + 0.35) {
      const s = stepN % 64, bar = Math.floor(s / 16), st = s % 16, t = nextT;
      if (st === 0) CH[bar].forEach(n => tone(hz(n), SP * 16, 'sawtooth', 0.07, { at: t, attack: 0.5, lp: 420, bus: mus }));
      const hot = lvl > 0.34;
      if (hot ? [0, 3, 6, 8, 10, 12, 14].includes(st) : (st === 0 || st === 8)) boom(t, st === 0 ? 1 : 0.7);
      if (lvl > 0.7 && st % 2 === 1) noise(0.04, 0.07, { type: 'highpass', f: 5000, at: t, bus: mus });
      if (lvl > 0.2) for (const [ms, m, len] of MEL[bar]) if (ms === st) { tone(hz(m), SP * len, 'sawtooth', 0.1, { at: t, attack: 0.06, lp: 1300, bus: mus }); tone(hz(m - 12), SP * len, 'sawtooth', 0.08, { at: t, attack: 0.06, lp: 800, bus: mus }); }
      nextT += SP; stepN++;
    }
  }
  return {
    init, play, hit,
    toggle() { on = !on; if (!ac) { if (on) init(); return; } master.gain.setTargetAtTime(on ? 0.8 : 0, ac.currentTime, 0.05); },
    isOn: () => on,
    slow(b) { if (!ac || b === slowOn) return; slowOn = b; filt.frequency.setTargetAtTime(b ? 500 : 7000, ac.currentTime, 0.12); },
    level(v) { lvl += (Math.min(1, v) - lvl) * 0.04; },
    visible(v) { if (ac) { if (v) { if (on) ac.resume(); } else ac.suspend(); } }
  };
})();

`;
rep('let G, uid = 0, started = false;', AUDIO + 'let G, uid = 0, started = false;');
fs.writeFileSync(F, s);
console.log('ok v3', s.length);
