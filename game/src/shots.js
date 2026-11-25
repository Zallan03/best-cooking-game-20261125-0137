// Ember & Ladle — deterministic screenshot scenes. One job: build a fixed,
// fully-played-looking kitchen state for each ?shot= name, so the screenshots
// in screenshots/ are real renders of this game's own code. Nothing here is
// edited or composited; the render path is the same one players see.

import { createState, makeItem } from './world.js';
import { recipeById } from './config.js';

function baseTicket(state, recipeId, patience) {
  const recipe = recipeById(recipeId);
  state.tickets.push({
    id: state.tickets.length + 1,
    recipeId: recipe.id,
    patience,
    maxPatience: 50,
  });
}

// start: the title screen over a live kitchen — one ticket on the board, a
// pan already on the stove, chopped tomato waiting on a board.
export function shotStart() {
  const state = createState(11);
  state.phase = 'title';
  state.chef.x = 640;
  state.chef.y = 560;
  baseTicket(state, 'pasta', 44);
  state.boards[0].item = makeItem('tomato', 'chopped');
  state.boards[0].done = true;
  state.boards[0].progress = 1;
  state.stoves[0].item = makeItem('pasta', 'raw');
  state.stoves[0].progress = 0.45;
  state.timeLeft = 150;
  return state;
}

// play: mid-assembly — the chef carries chopped tomato toward a stove where
// pasta cooks, lettuce waits chopped on a board, a plated pasta is already
// in hand, two tickets run with the clock at 1:47.
export function shotPlay() {
  const state = createState(22);
  state.phase = 'play';
  state.elapsed = 43;
  state.timeLeft = 107;
  state.coins = 120;
  state.served = 6;
  state.combo = 3;
  state.bestCombo = 3;
  state.chef.x = 660;
  state.chef.y = 430;
  state.chef.face = 1;
  state.plate = { recipeId: 'pasta' };
  baseTicket(state, 'pasta', 32);
  baseTicket(state, 'salad', 41);
  state.boards[0].item = makeItem('lettuce', 'chopped');
  state.boards[0].done = true;
  state.boards[0].progress = 1;
  state.boards[1].item = makeItem('tomato', 'raw');
  state.boards[1].progress = 0.55;
  state.stoves[0].item = makeItem('pasta', 'raw');
  state.stoves[0].progress = 0.6;
  state.stoves[1].item = makeItem('steak', 'cooked');
  state.stoves[1].done = true;
  state.stoves[1].progress = 1;
  state.stoves[1].burn = 1.2;
  state.spawnIn = 7;
  state.prompt = 'E — Serve the dish!';
  state.near = { type: 'window' };
  return state;
}

// end: the final rush — 23 seconds left, three tickets, one about to walk
// out, a steak plate in hand at the window, onion chopped and steak searing.
export function shotEnd() {
  const state = createState(33);
  state.phase = 'play';
  state.elapsed = 127;
  state.timeLeft = 23;
  state.coins = 340;
  state.served = 17;
  state.lost = 2;
  state.combo = 4;
  state.bestCombo = 5;
  state.chef.x = 1085;
  state.chef.y = 335;
  state.chef.face = 1;
  state.plate = { recipeId: 'steak' };
  baseTicket(state, 'steak', 6);
  baseTicket(state, 'soup', 28);
  baseTicket(state, 'melt', 38);
  state.boards[0].item = makeItem('onion', 'chopped');
  state.boards[0].done = true;
  state.boards[0].progress = 1;
  state.stoves[0].item = makeItem('steak', 'raw');
  state.stoves[0].progress = 0.8;
  state.stoves[1].item = makeItem('cheese', 'cooked');
  state.stoves[1].done = true;
  state.stoves[1].progress = 1;
  state.stoves[1].burn = 3.5;
  state.spawnIn = 4;
  state.prompt = 'E — Serve the dish!';
  state.near = { type: 'window' };
  return state;
}

export function buildShotState(name) {
  if (name === 'play') return shotPlay();
  if (name === 'end') return shotEnd();
  return shotStart();
}
