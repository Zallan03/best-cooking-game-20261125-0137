// Ember & Ladle — kitchen state and rules. One job: the whole simulation:
// the chef, tickets, chopping, cooking, plating, serving, the day timer and
// the score. Rendering never touches these rules; it only draws the state.

import {
  BURN_AFTER,
  CHEF_RADIUS,
  CHEF_SPEED,
  DAY_SECONDS,
  FLOOR,
  HAND_LIMIT,
  INGREDIENTS,
  MAX_TICKETS,
  RECIPES,
  STATIONS,
  TICKET_PATIENCE,
  recipeById,
} from './config.js';
import { makeRandom, pick } from './random.js';
import {
  soundBad,
  soundBurn,
  soundChop,
  soundCookDone,
  soundPickup,
  soundServe,
  soundTicket,
} from './audio.js';

let ticketSeq = 0;

export function makeItem(kind, state) {
  return { kind, state };
}

export function createState(seed) {
  const rng = makeRandom(seed || 20261125);
  return {
    rng,
    phase: 'title', // title | play | over
    elapsed: 0,
    timeLeft: DAY_SECONDS,
    coins: 0,
    served: 0,
    lost: 0,
    combo: 0,
    bestCombo: 0,
    chef: { x: 640, y: 560, face: 1 },
    hands: [],
    plate: null, // { recipeId } carried to the window, or null
    boards: STATIONS.boards.map(() => ({ item: null, progress: 0, done: false })),
    stoves: STATIONS.stoves.map(() => ({ item: null, progress: 0, done: false, burn: 0 })),
    tickets: [],
    spawnIn: 6,
    message: '',
    messageAt: 0,
    overAt: 0,
    // Nearest station for the prompt line; recomputed every frame.
    near: null,
    prompt: '',
  };
}

function say(state, text) {
  state.message = text;
  state.messageAt = state.elapsed;
}

function handsFull(state) {
  return state.plate !== null || state.hands.length >= HAND_LIMIT;
}

function sameNeed(a, b) {
  return a.kind === b.kind && a.state === b.state;
}

// True when the carried items are exactly one ticket's needs, in any order.
function matchingTicket(state) {
  if (state.hands.length === 0) return null;
  return state.tickets.find((ticket) => {
    const recipe = recipeById(ticket.recipeId);
    if (recipe.needs.length !== state.hands.length) return false;
    return recipe.needs.every((need) =>
      state.hands.some((item) => sameNeed(item, need)),
    );
  }) || null;
}

function spawnTicket(state) {
  const recipe = pick(state.rng, RECIPES);
  ticketSeq += 1;
  state.tickets.push({
    id: ticketSeq,
    recipeId: recipe.id,
    patience: TICKET_PATIENCE,
    maxPatience: TICKET_PATIENCE,
  });
  soundTicket();
}

export function startDay(state) {
  const fresh = createState(20261125 + Math.floor(Math.random() * 9999));
  Object.assign(state, fresh, { phase: 'play' });
  spawnTicket(state);
  state.spawnIn = 9;
}

function stationRects() {
  const rects = [];
  for (const bin of STATIONS.bins) rects.push(bin);
  for (const board of STATIONS.boards) rects.push(board);
  for (const stove of STATIONS.stoves) rects.push(stove);
  rects.push(STATIONS.plating, STATIONS.window, STATIONS.trash);
  return rects;
}

function nearestStation(state) {
  const { x, y } = state.chef;
  const reach = CHEF_RADIUS + 26;
  // Distance from the chef to a rectangle (0 when overlapping it). The
  // nearest station inside reach wins, so standing between two pantry bins
  // always offers the bin the chef is actually closest to.
  const gap = (rect) => {
    const dx = Math.max(rect.x - x, 0, x - (rect.x + rect.w));
    const dy = Math.max(rect.y - y, 0, y - (rect.y + rect.h));
    return Math.hypot(dx, dy);
  };
  const candidates = [];
  for (const bin of STATIONS.bins) candidates.push({ gap: gap(bin), station: { type: 'bin', bin } });
  STATIONS.boards.forEach((board, index) => {
    candidates.push({ gap: gap(board), station: { type: 'board', index, board } });
  });
  STATIONS.stoves.forEach((stove, index) => {
    candidates.push({ gap: gap(stove), station: { type: 'stove', index, stove } });
  });
  candidates.push({ gap: gap(STATIONS.plating), station: { type: 'plating' } });
  candidates.push({ gap: gap(STATIONS.window), station: { type: 'window' } });
  candidates.push({ gap: gap(STATIONS.trash), station: { type: 'trash' } });
  let best = null;
  for (const candidate of candidates) {
    if (candidate.gap <= reach && (!best || candidate.gap < best.gap)) best = candidate;
  }
  return best ? best.station : null;
}

function promptFor(state, near) {
  if (!near) return '';
  if (near.type === 'bin') {
    if (state.plate) return 'Hands full with a plate — serve it first';
    if (state.hands.length >= HAND_LIMIT) return 'Hands full';
    return `E — Take ${INGREDIENTS[near.bin.kind].label}`;
  }
  if (near.type === 'board') {
    const slot = state.boards[near.index];
    if (slot.item && slot.done) return `E — Take chopped ${INGREDIENTS[slot.item.kind].label}`;
    if (slot.item) return 'Chopping…';
    const choppable = state.hands.find(
      (item) => item.state === 'raw' && INGREDIENTS[item.kind].chopSeconds > 0,
    );
    if (choppable) return `E — Chop ${INGREDIENTS[choppable.kind].label}`;
    return 'Board — bring something to chop';
  }
  if (near.type === 'stove') {
    const slot = state.stoves[near.index];
    if (slot.item && slot.done) {
      return slot.item.state === 'burnt'
        ? `E — Take burnt ${INGREDIENTS[slot.item.kind].label} (bin it!)`
        : `E — Take cooked ${INGREDIENTS[slot.item.kind].label}`;
    }
    if (slot.item) return 'Cooking…';
    const cookable = state.hands.find((item) => {
      const def = INGREDIENTS[item.kind];
      if (def.cookSeconds === 0) return false;
      if (def.chopFirst && item.state !== 'chopped') return false;
      return item.state === 'raw' || item.state === 'chopped';
    });
    if (cookable) return `E — Cook ${INGREDIENTS[cookable.kind].label}`;
    return 'Stove — bring something to cook';
  }
  if (near.type === 'plating') {
    if (state.hands.length === 0) return 'Plating counter — bring dish parts';
    return matchingTicket(state) ? 'E — Plate the dish!' : 'E — No ticket matches these parts';
  }
  if (near.type === 'window') {
    return state.plate ? 'E — Serve the dish!' : 'Serving window — bring a plated dish';
  }
  if (near.type === 'trash') {
    return state.hands.length > 0 ? 'E — Throw away the last item' : 'Trash — nothing to throw';
  }
  return '';
}

function takeFromHands(state, predicate) {
  const index = state.hands.findIndex(predicate);
  if (index === -1) return null;
  return state.hands.splice(index, 1)[0];
}

export function interact(state) {
  const near = state.near;
  if (!near || state.phase !== 'play') return;
  if (near.type === 'bin') {
    if (state.plate || state.hands.length >= HAND_LIMIT) {
      soundBad();
      say(state, 'Hands full!');
      return;
    }
    state.hands.push(makeItem(near.bin.kind, 'raw'));
    soundPickup();
    say(state, `Took ${INGREDIENTS[near.bin.kind].label}`);
    return;
  }
  if (near.type === 'board') {
    const slot = state.boards[near.index];
    if (slot.item && slot.done) {
      if (handsFull(state)) {
        soundBad();
        say(state, 'Hands full!');
        return;
      }
      state.hands.push(slot.item);
      slot.item = null;
      slot.progress = 0;
      slot.done = false;
      soundPickup();
      return;
    }
    if (slot.item) return; // still chopping
    const item = takeFromHands(
      state,
      (held) => held.state === 'raw' && INGREDIENTS[held.kind].chopSeconds > 0,
    );
    if (!item) {
      soundBad();
      say(state, 'Nothing here needs chopping');
      return;
    }
    slot.item = item;
    slot.progress = 0;
    slot.done = false;
    soundChop();
    return;
  }
  if (near.type === 'stove') {
    const slot = state.stoves[near.index];
    if (slot.item && slot.done) {
      if (handsFull(state)) {
        soundBad();
        say(state, 'Hands full!');
        return;
      }
      state.hands.push(slot.item);
      slot.item = null;
      slot.progress = 0;
      slot.done = false;
      slot.burn = 0;
      soundPickup();
      return;
    }
    if (slot.item) return; // still cooking
    const item = takeFromHands(state, (held) => {
      const def = INGREDIENTS[held.kind];
      if (def.cookSeconds === 0) return false;
      if (def.chopFirst && held.state !== 'chopped') return false;
      return held.state === 'raw' || held.state === 'chopped';
    });
    if (!item) {
      soundBad();
      say(state, 'Nothing here can cook yet — chop it first?');
      return;
    }
    slot.item = item;
    slot.progress = 0;
    slot.done = false;
    slot.burn = 0;
    soundPickup();
    return;
  }
  if (near.type === 'plating') {
    const ticket = matchingTicket(state);
    if (!ticket) {
      soundBad();
      say(state, 'No ticket matches what you are carrying');
      return;
    }
    const recipe = recipeById(ticket.recipeId);
    state.hands = [];
    state.plate = { recipeId: recipe.id };
    state.tickets = state.tickets.filter((t) => t.id !== ticket.id);
    soundCookDone();
    say(state, `${recipe.name} plated — serve it at the window!`);
    return;
  }
  if (near.type === 'window') {
    if (!state.plate) {
      soundBad();
      say(state, 'Bring a plated dish to serve');
      return;
    }
    const recipe = recipeById(state.plate.recipeId);
    const timeBonus = 2;
    const earned = recipe.price + timeBonus + Math.min(state.combo, 5);
    state.coins += earned;
    state.served += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.plate = null;
    soundServe();
    say(state, `Served ${recipe.name}! +${earned} coins (combo x${state.combo})`);
    return;
  }
  if (near.type === 'trash') {
    if (state.hands.length === 0) return;
    const dropped = state.hands.pop();
    soundBad();
    say(state, `Threw away ${INGREDIENTS[dropped.kind].label}`);
  }
}

function moveChef(state, input, dt) {
  const chef = state.chef;
  let dx = 0;
  let dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  if (dx !== 0 || dy !== 0) {
    input.clickTarget = null;
  } else if (input.clickTarget) {
    const tx = input.clickTarget.x;
    const ty = input.clickTarget.y;
    const dist = Math.hypot(tx - chef.x, ty - chef.y);
    if (dist > 6) {
      dx = (tx - chef.x) / dist;
      dy = (ty - chef.y) / dist;
    } else {
      input.clickTarget = null;
      if (state.near) interact(state);
    }
  }
  if (dx === 0 && dy === 0) return;
  const len = Math.hypot(dx, dy);
  const step = CHEF_SPEED * dt;
  const nx = chef.x + (dx / len) * step;
  const ny = chef.y + (dy / len) * step;
  if (dx !== 0) chef.face = dx > 0 ? 1 : -1;
  const solids = stationRects();
  const blocked = (x, y) =>
    solids.some(
      (r) =>
        x > r.x - CHEF_RADIUS &&
        x < r.x + r.w + CHEF_RADIUS &&
        y > r.y - CHEF_RADIUS &&
        y < r.y + r.h + CHEF_RADIUS,
    );
  const insideFloor =
    nx >= FLOOR.x + CHEF_RADIUS &&
    nx <= FLOOR.x + FLOOR.w - CHEF_RADIUS &&
    ny >= FLOOR.y + CHEF_RADIUS &&
    ny <= FLOOR.y + FLOOR.h - CHEF_RADIUS;
  if (insideFloor && !blocked(nx, chef.y)) chef.x = nx;
  if (insideFloor && !blocked(chef.x, ny)) chef.y = ny;
}

function updateStations(state, dt) {
  for (const slot of state.boards) {
    if (!slot.item || slot.done) continue;
    const def = INGREDIENTS[slot.item.kind];
    slot.progress += dt / def.chopSeconds;
    if (slot.progress >= 1) {
      slot.progress = 1;
      slot.done = true;
      slot.item.state = 'chopped';
      soundChop();
    }
  }
  for (const slot of state.stoves) {
    if (!slot.item) continue;
    const def = INGREDIENTS[slot.item.kind];
    if (!slot.done) {
      slot.progress += dt / def.cookSeconds;
      if (slot.progress >= 1) {
        slot.progress = 1;
        slot.done = true;
        slot.item.state = 'cooked';
        soundCookDone();
      }
    } else if (slot.item.state === 'cooked') {
      slot.burn += dt;
      if (slot.burn >= BURN_AFTER) {
        slot.item.state = 'burnt';
        soundBurn();
        say(state, 'Something burned on the stove!');
      }
    }
  }
}

function updateTickets(state, dt) {
  state.spawnIn -= dt;
  if (state.spawnIn <= 0 && state.tickets.length < MAX_TICKETS) {
    spawnTicket(state);
    const rush = 1 - state.timeLeft / DAY_SECONDS;
    state.spawnIn = 13 - rush * 5;
  }
  for (const ticket of state.tickets) ticket.patience -= dt;
  const expired = state.tickets.filter((t) => t.patience <= 0);
  if (expired.length > 0) {
    state.tickets = state.tickets.filter((t) => t.patience > 0);
    state.lost += expired.length;
    state.combo = 0;
    soundBad();
    say(state, `A customer walked out! (${expired.length} lost)`);
  }
}

export function update(state, input, pressed, dt) {
  if (state.phase === 'title') {
    if (pressed.start || pressed.interact) startDay(state);
    return;
  }
  if (state.phase === 'over') {
    if (pressed.restart || pressed.start) startDay(state);
    return;
  }
  state.elapsed += dt;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.phase = 'over';
    state.overAt = state.elapsed;
    return;
  }
  moveChef(state, input, dt);
  state.near = nearestStation(state);
  state.prompt = promptFor(state, state.near);
  if (pressed.interact) interact(state);
  updateStations(state, dt);
  updateTickets(state, dt);
}
