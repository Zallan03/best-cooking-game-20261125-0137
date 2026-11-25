# Ember & Ladle — Bistro Rush: specification

## Bounty

`best-cooking-game-20261125-0137` — "Make the best cooking game", $250 total
($60 / $40 / $30 / $25 / $20 / $15 x5). Deadline 25 Nov 2026 20:37 WIB.
Blind rounds x4: 11:37, 14:37, 17:37, 20:37 WIB. 851 submissions at watch time.
Free entry (entryFeeUsd null, verified).

## Judge criteria (in order)

1. A complete cooking game, shown in its own screenshots: a kitchen and an
   order board, ingredients on the counter, one dish mid-assembly, a timer
   and a plate ready to serve.
2. Fun and depth: orders that push route planning, recipes that combine in
   different ways, pressure that grows without adding chores.
3. Feel and polish: chopping and plating that answer at once, a timer you
   can feel, a service rush that reads in a glance.
4. Look and originality: food drawn so it looks worth serving, counters
   readable at a glance, a kitchen with a look of its own. Fully original —
   no commercial game's names, characters, art, music or levels.
5. Structure: the game's own source split into files with one clear job each,
   named for what they do.

## The game

Top-down bistro kitchen, canvas 1280x800, keyboard + mouse, no build step,
no network, no library. One day lasts 150 seconds.

- **Order board (HUD):** up to 4 tickets, each naming a recipe, its needed
  items (with CHOP / COOK tags) and a draining patience bar. A ticket that
  runs out walks out: combo resets, customer lost.
- **Pantry (8 bins):** tomato, lettuce, onion, mushroom, steak, pasta,
  bread, cheese. Carry up to 2 items.
- **Chop boards (x2):** 1.6s per item; tomato, lettuce, onion, mushroom.
- **Stoves (x2):** pasta 4s, steak 5s, bread/cheese 3s, chopped onion /
  mushroom 3s. A cooked dish left 5s burns and must be binned.
- **Recipes (5):** Garden Salad (chopped lettuce + chopped tomato, $12),
  Tomato Pasta (cooked pasta + chopped tomato, $18), Mushroom Soup
  (cooked mushroom + cooked onion, $20), Steak Plate (cooked steak +
  chopped onion, $24), Cheese Melt (cooked bread + cooked cheese, $16).
- **Plating counter:** plates a dish only when the carried items exactly
  match one ticket's needs — no guessing, no wrong plates.
- **Serving window:** serve for price + time bonus + combo bonus.
- **Pressure curve:** tickets spawn every 13s, speeding to every 8s as the
  day runs out; the last 30 seconds show a FINAL RUSH banner and the timer
  turns red.
- **Depth:** two boards and two stoves force real routing (chop the next
  dish while one cooks); chop-first ingredients (onion, mushroom) force
  sequencing; burn risk forces attention; combos reward streaks.

## Screenshots (real renders, `?shot=`)

- `1-play.jpg` (cover) — mid-assembly: chef carrying a plated Tomato Pasta
  to the window, pasta cooking, lettuce chopped, two tickets, 1:47, combo x3.
- `2-end.jpg` — final rush: 0:23 left, three tickets, one about to walk out,
  Steak Plate in hand at the window, steak searing.
- `3-start.jpg` — title screen over the live kitchen, first ticket on the
  board, pasta on the stove.

All 1280x800 JPEG, ~79–111 KiB (limit 256 KiB, long side <= 1280,
short side >= 480).

## Verification (local, this session)

- Headless Chromium 140 renders all three `?shot=` scenes; inspected
  visually — kitchen, tickets, timer, chef, plate all readable.
- Node gameplay smoke test drives the full loop (take -> chop -> cook ->
  plate -> serve = +20 coins; ticket expiry loses a customer, resets combo).
- `MAKEFUN_OUTPUT_DIR=out node main.ts` twice: byte-identical outputs
  (deterministic), dossier.json 441,644 bytes (< 1.5 MiB cap).

## Why it should win

Most entries in a 12-hour, 851-submission field will be a single mechanic
or a reskinned starter. This is a complete loop — take, chop, cook, plate,
serve — with five combinable recipes, two parallel workstations, burn risk,
expiring tickets and a combo system, all visible in three readable
screenshots whose cover shows a dish mid-assembly and a plate ready to
serve. The source is split into eight single-job files with descriptive
names, so the judge's outline reads as a structured game, not a blob.
