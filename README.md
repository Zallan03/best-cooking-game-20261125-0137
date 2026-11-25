[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Zallan03/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Zallan03/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Ember & Ladle — Bistro Rush

An original cooking game for the [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137) bounty ($250).

You are the chef of a tiny bistro. Tickets arrive on the order board — chop it, cook it, plate it, serve it before the customer walks out. Five recipes, eight ingredients, two chopping boards, two stoves, one very impatient dining room. A full day lasts 2:30; serve fast and keep the combo alive.

## How to play

- **Move:** WASD / arrow keys, or click anywhere to walk there
- **Interact:** E (or click a station to walk over and use it)
- **Restart:** R
- **Pantry (left):** take ingredients — tomato, lettuce, onion, mushroom, steak, pasta, bread, cheese
- **Chop board:** chops tomato, lettuce, onion, mushroom
- **Stove:** cooks pasta, steak, bread, cheese — and chopped onion / mushroom. Leave a cooked dish too long and it burns: bin it.
- **Plating counter:** plate a dish when your hands hold exactly what a ticket asks for
- **Serving window:** serve the plated dish for coins + combo

## Run it

No build step, no network: open `game/index.html` in desktop Chrome (or `node serve.ts` is not needed — any static server over `game/` works). Screenshots in `screenshots/` are real renders of this game's own code (`game/src/shots.js`, `?shot=start|play|end`).

## Files

- `main.ts` — hands the game in: copies `game/` + `screenshots/` to `/output` and writes `dossier.json`
- `game/index.html`, `game/src/*.js` — the game, split one job per file
- `game/src/config.js` — recipes, ingredients, kitchen layout
- `game/src/world.js` — simulation: tickets, chopping, cooking, plating, serving
- `game/src/render.js` — all canvas drawing
- `game/src/shots.js` — deterministic screenshot scenes
- `game/src/input.js` — keyboard + mouse
- `game/src/audio.js` — synthesized WebAudio blips (no audio files)
- `game/src/random.js` — seeded RNG

## License

MIT — see [LICENSE](LICENSE).
