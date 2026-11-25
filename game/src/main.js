// Ember & Ladle — boot and frame loop. One job: own the canvas, the clock
// and the ?shot= screenshot mode; the simulation lives in world.js and the
// drawing in render.js.

import { VIEW_H, VIEW_W } from './config.js';
import { consumePresses, createInput } from './input.js';
import { render } from './render.js';
import { buildShotState } from './shots.js';
import { createState, update } from './world.js';
import { unlockAudio } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seedParam = Number(params.get('seed') || '20261125');

const input = createInput(canvas);
let state;

if (shotName) {
  // Screenshot mode: a fixed scene, rendered once and held still.
  state = buildShotState(shotName);
  render(ctx, state);
} else {
  state = createState(seedParam);
  let last = performance.now();
  const status = document.getElementById('status');
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const pressed = consumePresses(input);
    update(state, input, pressed, dt);
    render(ctx, state);
    if (status) {
      const phase = state.phase === 'play' ? 'playing' : state.phase;
      status.textContent =
        `Ember and Ladle, ${phase}. ` +
        `${state.coins} coins, ${state.served} served, ` +
        `${Math.ceil(state.timeLeft)} seconds left.`;
    }
    requestAnimationFrame(frame);
  }
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
  requestAnimationFrame(frame);
}
