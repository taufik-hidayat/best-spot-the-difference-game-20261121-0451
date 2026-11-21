# Night Harbour — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/taufik-hidayat/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/taufik-hidayat/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Referral:** `2z9vc20p` — [make.fun bounty page](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game that runs offline in a desktop browser
from static files — no build step, no network, no libraries. Two
near-identical harbour scenes sit side by side; seven differences hide in
the right panel. Find them all to clear the scene.

## The hunt

Three scenes, one harbour at night, seven differences each (21 in all):

1. **Sunset Pier** (Easy) — golden hour on the pier: gulls, boats, a lantern.
2. **Night Market** (Medium) — stalls, string lights, a cat, the moon.
3. **The Lighthouse** (Hard) — the beam, the tower stripes, the rocks.

## How to play

- **Click** a difference on either panel to mark it — a green ring and a
  check appear on both panels, the counter drops, and the found difference
  is named in the tray below.
- **Wrong clicks** cost 10 points and leave a red X.
- **Hint (H)** pulses a golden ring over one difference you have not found
  yet (−25 points, 3 per scene).
- **Magnifier (M)** opens a 2× zoom lens that follows your pointer.
- **Keyboard:** arrow keys move the crosshair, Enter/Space marks the spot,
  1–3 jump between scenes, N goes to the next scene when one is cleared,
  S toggles sound.
- Clearing a scene earns a time bonus; clearing all three ends the game
  with your final score.

## Run it

Serve `game/` with any static server and open `index.html`, for example:

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080
```

All art is drawn procedurally on canvas at run time and all sounds are
synthesized with WebAudio — the game loads nothing over the network.

## Structure

- `game/index.html` — the page: two panels, HUD, scene bar, controls
- `game/styles.css` — the harbour-night frame
- `game/src/scenes.js` — the three scenes: art + the 7 differences each
- `game/src/render.js` — panel painting, markers, cursor, magnifier lens
- `game/src/game.js` — state, score, timer, hints, scene flow
- `game/src/input.js` — mouse + keyboard
- `game/src/audio.js` — synthesized sound effects (WebAudio, no files)
- `game/src/main.js` — bootstrap
- `main.ts` — the Node 22 hand-in: copies `game/` + `screenshots/` to
  `/output` and writes `dossier.json` with `vendor/makefun-game.ts`

## License

MIT — see [LICENSE](LICENSE).
