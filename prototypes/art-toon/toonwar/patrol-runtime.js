// The weather of a patrol battle changes how the squads move and shoot (the picture comes from the arena sky): night and rain slow them, fog shortens the shots.
if (MAP.weatherFx && MAP.sky) {
  const fx = MAP.weatherFx;
  for (const k of Object.keys(CLS)) { const d = CLS[k]; if (fx === 'night') d.speed *= 0.85; if (fx === 'rain' && d.kind === CAV) d.speed *= 0.75; if (fx === 'fog' && d.range) d.range *= 0.6; }
}
