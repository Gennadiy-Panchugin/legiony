# legion-flow-concept — concept prototype

> PROTOTYPE - NOT FOR PRODUCTION. Throwaway code; never refactor into production.

## Hypothesis

**v2 (current):** if unit types behave differently (infantry tanky, archers ranged
and fragile, cavalry charge burst) and the AI acts at human pace, the player wins
by composition, not numbers. We will know if the player (b) can name the trick that
won, and wins at least one capture while their army is the smaller one.

v1 hypothesis (PIVOT, see `REPORT.md`): flow-line combat with unit-type counters
produces "I outsmarted the enemy" decisions.

## How to run

Open `prototype.html` in any browser (double-click, no server). `prototype-v1.html`
is the first version, kept for comparison.

`objective-battle.html` is a separate mobile-first combat experiment: capture a
warehouse by assigning orders to infantry, archers, and cavalry. Open it directly,
or use the link above the map in `prototype.html`.

### Android (WebView wrapper)

`android/` packs the full playable build (`android/game/legiony.html`, the published
artifact) into `android/legiony.apk` — a full-screen portrait WebView, debug-signed.
Rebuild with `bash android/build.sh`; it uses only the SDK and JDK bundled in Unity's
Android Build Support module (no Gradle, no downloads). Install by copying the APK to
the phone and allowing installs from unknown sources. Not a release build.

## Status

concluded — v2 verdict **PROCEED** (2026-10-01). v1 verdict PIVOT.
Both reports in `REPORT.md`.

## Findings

v1: capture-by-roads and building choice work; unit types felt the same, numbers
decided the fight, the AI was too fast.
v2: hypothesis CONFIRMED — "class and speed decide now". Winning trick: fast
rebuilds to pick the right class. Best moment: archers defend while cavalry
attacks. Problem: the single bridge deadlocks the fight; proposed fix is a
player-only "temporary bridge" booster. Tuning values are in `REPORT.md`.
