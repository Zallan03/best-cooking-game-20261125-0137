// Ember & Ladle — canvas drawing. One job: everything the player and the
// judge see — the kitchen, the food, the chef, the order board, the timer
// and the prompts. It reads state only; it never changes it.

import {
  FLOOR,
  HUD_H,
  INGREDIENTS,
  PALETTE,
  STATIONS,
  VIEW_H,
  VIEW_W,
  recipeById,
} from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 700} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// One ingredient, drawn from shapes at (x, y) with radius r. State changes
// the look: chopped is cut into pieces, cooked is darker with steam, burnt
// is blackened.
export function drawIngredient(ctx, kind, x, y, r, state) {
  const def = INGREDIENTS[kind];
  const color = state === 'burnt' ? '#2b2b2b' : state === 'cooked' ? def.dark : def.color;
  ctx.save();
  ctx.translate(x, y);
  if (state === 'chopped') {
    for (let i = 0; i < 3; i += 1) {
      const ox = (i - 1) * r * 0.62;
      const oy = i === 1 ? -r * 0.28 : r * 0.22;
      ctx.fillStyle = i === 1 ? def.dark : color;
      ctx.beginPath();
      ctx.arc(ox, oy, r * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }
  if (kind === 'tomato') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3f9e4d';
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(-r * 0.4, -r * 0.45);
    ctx.lineTo(r * 0.4, -r * 0.45);
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'lettuce') {
    ctx.fillStyle = color;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(-r * 0.55 + i * r * 0.55, (i % 2) * r * 0.3 - r * 0.1, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'onion') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = r * 0.14;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === 'mushroom') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -r * 0.15, r * 0.95, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff6e3';
    ctx.fillRect(-r * 0.32, -r * 0.1, r * 0.64, r * 0.8);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-r * 0.4, -r * 0.55, r * 0.18, 0, Math.PI * 2);
    ctx.arc(r * 0.35, -r * 0.7, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'steak') {
    ctx.fillStyle = color;
    roundRect(ctx, -r, -r * 0.7, r * 2, r * 1.4, r * 0.6);
    ctx.fill();
    ctx.fillStyle = '#e8b48a';
    ctx.beginPath();
    ctx.ellipse(r * 0.2, 0, r * 0.5, r * 0.28, 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'pasta') {
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(0, (i - 1) * r * 0.5, r * 0.55, 0.3, Math.PI * 1.7);
      ctx.stroke();
    }
  } else if (kind === 'bread') {
    ctx.fillStyle = color;
    roundRect(ctx, -r, -r * 0.75, r * 2, r * 1.5, r * 0.5);
    ctx.fill();
    ctx.fillStyle = def.dark;
    ctx.beginPath();
    ctx.arc(-r * 0.4, 0, r * 0.1, 0, Math.PI * 2);
    ctx.arc(r * 0.3, -r * 0.2, r * 0.1, 0, Math.PI * 2);
    ctx.arc(r * 0.1, r * 0.3, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'cheese') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.7);
    ctx.lineTo(r, r * 0.7);
    ctx.lineTo(r * 0.2, -r * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = def.dark;
    ctx.beginPath();
    ctx.arc(0, r * 0.25, r * 0.16, 0, Math.PI * 2);
    ctx.arc(r * 0.4, r * 0.45, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  if (state === 'cooked') {
    // Steam curls above hot food.
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 1.1);
    ctx.quadraticCurveTo(-r * 0.5, -r * 1.5, -r * 0.3, -r * 1.8);
    ctx.moveTo(r * 0.3, -r * 1.1);
    ctx.quadraticCurveTo(r * 0.5, -r * 1.5, r * 0.3, -r * 1.8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStateTag(ctx, x, y, label, color) {
  ctx.fillStyle = color;
  roundRect(ctx, x - 26, y - 9, 52, 18, 9);
  ctx.fill();
  text(ctx, label, x, y + 1, 11, '#ffffff', 800, 'center');
}

function drawTicket(ctx, ticket, x, y) {
  const recipe = recipeById(ticket.recipeId);
  const w = 168;
  const h = 78;
  const urgent = ticket.patience < 12;
  ctx.fillStyle = urgent ? '#ffe1de' : '#fffdf6';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.lineWidth = urgent ? 3 : 2;
  ctx.strokeStyle = urgent ? '#e5484d' : '#d9b380';
  ctx.stroke();
  text(ctx, recipe.name, x + 10, y + 15, 14, PALETTE.ink, 800);
  recipe.needs.forEach((need, i) => {
    const ix = x + 24 + i * 52;
    drawIngredient(ctx, need.kind, ix, y + 42, 15, need.state);
    if (need.state === 'chopped') drawStateTag(ctx, ix, y + 64, 'CHOP', '#3f9e4d');
    if (need.state === 'cooked') drawStateTag(ctx, ix, y + 64, 'COOK', '#e07b39');
  });
  const frac = Math.max(0, ticket.patience / ticket.maxPatience);
  ctx.fillStyle = '#e8dcc8';
  roundRect(ctx, x + 10, y + h - 12, w - 20, 6, 3);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#3f9e4d' : frac > 0.25 ? '#e8a13c' : '#e5484d';
  roundRect(ctx, x + 10, y + h - 12, (w - 20) * frac, 6, 3);
  ctx.fill();
}

function drawHud(ctx, state) {
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = '#5d3418';
  ctx.fillRect(0, HUD_H - 6, VIEW_W, 6);
  text(ctx, 'EMBER & LADLE', 20, 26, 26, '#ffd94d', 900);
  text(ctx, 'bistro rush', 20, 52, 13, '#f3d9a4', 600);
  const mins = Math.floor(state.timeLeft / 60);
  const secs = Math.floor(state.timeLeft % 60);
  const timeText = `${mins}:${String(secs).padStart(2, '0')}`;
  const timeColor = state.timeLeft <= 30 ? '#ff6b5e' : '#ffffff';
  text(ctx, timeText, 20, 80, 22, timeColor, 900);
  state.tickets.forEach((ticket, i) => {
    drawTicket(ctx, ticket, 300 + i * 180, 9);
  });
  text(ctx, `🪙 ${state.coins} coins`, 1060, 26, 20, '#ffd94d', 800);
  text(ctx, `Served ${state.served}   Lost ${state.lost}`, 1060, 52, 14, '#f3d9a4', 600);
  if (state.combo >= 2) {
    text(ctx, `COMBO x${state.combo}`, 1060, 78, 16, '#ff9d5c', 900);
  }
}

function drawFloor(ctx) {
  ctx.fillStyle = PALETTE.floorA;
  ctx.fillRect(0, HUD_H, VIEW_W, VIEW_H - HUD_H);
  const tile = 64;
  for (let ty = HUD_H; ty < VIEW_H; ty += tile) {
    for (let tx = 0; tx < VIEW_W; tx += tile) {
      const odd = (Math.floor(tx / tile) + Math.floor(ty / tile)) % 2 === 0;
      if (!odd) {
        ctx.fillStyle = PALETTE.floorB;
        ctx.fillRect(tx, ty, tile, tile);
      }
    }
  }
  ctx.strokeStyle = 'rgba(125,79,39,0.25)';
  ctx.lineWidth = 1;
  for (let tx = 0; tx <= VIEW_W; tx += tile) {
    ctx.beginPath();
    ctx.moveTo(tx, HUD_H);
    ctx.lineTo(tx, VIEW_H);
    ctx.stroke();
  }
  for (let ty = HUD_H; ty <= VIEW_H; ty += tile) {
    ctx.beginPath();
    ctx.moveTo(0, ty);
    ctx.lineTo(VIEW_W, ty);
    ctx.stroke();
  }
}

function drawStationBase(ctx, rect, top, body, label, labelColor) {
  ctx.fillStyle = body;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.fillStyle = top;
  roundRect(ctx, rect.x, rect.y, rect.w, 18, 9);
  ctx.fill();
  ctx.fillRect(rect.x, rect.y + 9, rect.w, 9);
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h - 12, 12, labelColor || '#ffffff', 800, 'center');
}

function drawProgress(ctx, x, y, w, frac, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  roundRect(ctx, x, y, w, 10, 5);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(ctx, x, y, w * Math.max(0, Math.min(1, frac)), 10, 5);
  ctx.fill();
}

function drawChef(ctx, state) {
  const { x, y, face } = state.chef;
  ctx.save();
  ctx.translate(x, y);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 16, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body / apron.
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, -18, -6, 36, 30, 12);
  ctx.fill();
  ctx.fillStyle = '#3f9e4d';
  roundRect(ctx, -18, 8, 36, 16, 8);
  ctx.fill();
  // Head.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(0, -20, 15, 0, Math.PI * 2);
  ctx.fill();
  // Toque.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-10, -32, 9, 0, Math.PI * 2);
  ctx.arc(0, -36, 10, 0, Math.PI * 2);
  ctx.arc(10, -32, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-14, -34, 28, 8);
  // Face.
  ctx.fillStyle = '#2b1d12';
  ctx.beginPath();
  ctx.arc(-5 * face, -20, 2, 0, Math.PI * 2);
  ctx.arc(5 * face, -20, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b1d12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(2 * face, -14, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();
  // Carried ingredients above the head.
  state.hands.forEach((item, i) => {
    const ox = (i - (state.hands.length - 1) / 2) * 34;
    drawIngredient(ctx, item.kind, ox, -58, 14, item.state);
  });
  // Carried plate: a white dish with the finished meal.
  if (state.plate) {
    const recipe = recipeById(state.plate.recipeId);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -58, 26, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9b380';
    ctx.lineWidth = 2;
    ctx.stroke();
    recipe.needs.forEach((need, i) => {
      drawIngredient(ctx, need.kind, -14 + i * 28, -60, 10, need.state);
    });
  }
  ctx.restore();
}

function drawStations(ctx, state) {
  for (const bin of STATIONS.bins) {
    drawStationBase(ctx, bin, PALETTE.steel, '#8a6f4d', INGREDIENTS[bin.kind].label.toUpperCase());
    drawIngredient(ctx, bin.kind, bin.x + bin.w / 2, bin.y + bin.h / 2 - 6, 26, 'raw');
  }
  state.boards.forEach((slot, i) => {
    const rect = STATIONS.boards[i];
    const boardLabel = !slot.item
      ? 'CHOP BOARD'
      : slot.done
        ? 'CHOPPED ✓'
        : 'CHOPPING…';
    const boardLabelColor = slot.item && slot.done ? '#7dff9e' : '#ffffff';
    drawStationBase(ctx, rect, '#e8c98f', '#b98a4e', boardLabel, boardLabelColor);
    if (slot.item) {
      drawIngredient(ctx, slot.item.kind, rect.x + rect.w / 2, rect.y + rect.h / 2 - 8, 24, slot.item.state);
      if (!slot.done) drawProgress(ctx, rect.x + 20, rect.y + rect.h - 30, rect.w - 40, slot.progress, '#3f9e4d');
    } else {
      text(ctx, 'empty', rect.x + rect.w / 2, rect.y + rect.h / 2 - 4, 14, 'rgba(255,255,255,0.75)', 600, 'center');
    }
  });
  state.stoves.forEach((slot, i) => {
    const rect = STATIONS.stoves[i];
    const hot = slot.item && !slot.done;
    const stoveLabel = !slot.item
      ? 'STOVE'
      : slot.done
        ? slot.item.state === 'burnt'
          ? 'BURNT!'
          : 'READY ✓'
        : 'COOKING…';
    const stoveLabelColor = slot.item && slot.done && slot.item.state !== 'burnt' ? '#7dff9e'
      : slot.item && slot.done ? '#ff6b5e' : '#ffffff';
    drawStationBase(ctx, rect, hot ? '#ff8c42' : PALETTE.steelDark, '#5d5d66', stoveLabel, stoveLabelColor);
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2 - 8, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#9aa0ab';
    ctx.lineWidth = 4;
    ctx.stroke();
    if (slot.item) {
      drawIngredient(ctx, slot.item.kind, rect.x + rect.w / 2, rect.y + rect.h / 2 - 8, 22, slot.item.state);
      if (!slot.done) drawProgress(ctx, rect.x + 20, rect.y + rect.h - 30, rect.w - 40, slot.progress, '#e07b39');
    }
    if (hot) {
      ctx.fillStyle = '#ffcf5c';
      ctx.beginPath();
      ctx.moveTo(rect.x + 30, rect.y + rect.h - 34);
      ctx.lineTo(rect.x + 38, rect.y + rect.h - 48);
      ctx.lineTo(rect.x + 46, rect.y + rect.h - 34);
      ctx.closePath();
      ctx.fill();
    }
  });
  const plating = STATIONS.plating;
  drawStationBase(ctx, plating, '#ffffff', '#c9a06a', 'PLATING — ASSEMBLE DISHES HERE');
  text(ctx, 'match a ticket to plate', plating.x + plating.w / 2, plating.y + plating.h / 2, 14, 'rgba(255,255,255,0.8)', 600, 'center');
  const win = STATIONS.window;
  drawStationBase(ctx, win, '#ffd94d', '#8a6f4d', '★ SERVE ★');
  ctx.fillStyle = '#fff6e3';
  roundRect(ctx, win.x + 16, win.y + 26, win.w - 32, 44, 8);
  ctx.fill();
  text(ctx, 'Ring the bell,', win.x + win.w / 2, win.y + 42, 13, PALETTE.ink, 600, 'center');
  text(ctx, 'serve the dish!', win.x + win.w / 2, win.y + 60, 13, PALETTE.ink, 600, 'center');
  const trash = STATIONS.trash;
  drawStationBase(ctx, trash, '#6b7280', '#4b5563', 'TRASH');
  text(ctx, '✕', trash.x + trash.w / 2, trash.y + trash.h / 2 - 4, 30, '#ffffff', 900, 'center');
}

function drawPrompt(ctx, state) {
  if (state.phase !== 'play') return;
  if (state.message && state.elapsed - state.messageAt < 3) {
    ctx.fillStyle = 'rgba(43,29,18,0.85)';
    roundRect(ctx, VIEW_W / 2 - 260, HUD_H + 12, 520, 34, 17);
    ctx.fill();
    text(ctx, state.message, VIEW_W / 2, HUD_H + 30, 15, '#fff6e3', 700, 'center');
  }
  if (state.prompt) {
    ctx.fillStyle = 'rgba(255,246,227,0.95)';
    const w = Math.max(220, state.prompt.length * 8.5 + 32);
    roundRect(ctx, VIEW_W / 2 - w / 2, VIEW_H - 44, w, 32, 16);
    ctx.fill();
    ctx.strokeStyle = '#d9b380';
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, state.prompt, VIEW_W / 2, VIEW_H - 27, 15, PALETTE.ink, 700, 'center');
  }
  text(ctx, 'Move: WASD / arrows / click   •   Interact: E   •   Restart: R', VIEW_W / 2, VIEW_H - 58, 12, 'rgba(43,29,18,0.55)', 600, 'center');
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(43,29,18,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#fff6e3';
  roundRect(ctx, 290, 180, 700, 340, 24);
  ctx.fill();
  ctx.strokeStyle = '#d9b380';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'EMBER & LADLE', 640, 240, 54, '#b3272e', 900, 'center');
  text(ctx, '— bistro rush —', 640, 282, 20, PALETTE.ink, 600, 'center');
  text(ctx, 'Tickets arrive. Chop it, cook it, plate it, serve it', 640, 330, 17, PALETTE.ink, 600, 'center');
  text(ctx, '— before the customer walks out.', 640, 356, 17, PALETTE.ink, 600, 'center');
  text(ctx, 'WASD / arrows or click to move  •  E to interact', 640, 404, 16, '#7d4f27', 700, 'center');
  text(ctx, 'Day lasts 2:30 — serve fast, keep the combo alive!', 640, 432, 16, '#7d4f27', 700, 'center');
  ctx.fillStyle = '#b3272e';
  roundRect(ctx, 490, 462, 300, 40, 20);
  ctx.fill();
  text(ctx, '▶  START COOKING', 640, 483, 18, '#ffffff', 900, 'center');
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(43,29,18,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#fff6e3';
  roundRect(ctx, 340, 200, 600, 320, 24);
  ctx.fill();
  ctx.strokeStyle = '#d9b380';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'DAY OVER!', 640, 250, 44, '#b3272e', 900, 'center');
  text(ctx, `Coins earned: ${state.coins}`, 640, 316, 22, PALETTE.ink, 800, 'center');
  text(ctx, `Dishes served: ${state.served}    Customers lost: ${state.lost}`, 640, 352, 18, PALETTE.ink, 600, 'center');
  text(ctx, `Best combo: x${state.bestCombo}`, 640, 384, 18, PALETTE.ink, 600, 'center');
  text(ctx, 'Press R to cook another day', 640, 448, 17, '#7d4f27', 700, 'center');
}

export function render(ctx, state) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawFloor(ctx);
  drawStations(ctx, state);
  drawChef(ctx, state);
  drawHud(ctx, state);
  if (state.phase === 'play' && state.timeLeft <= 30 && state.timeLeft > 0) {
    text(ctx, '⚡ FINAL RUSH ⚡', VIEW_W / 2, HUD_H + 62, 20, '#e5484d', 900, 'center');
  }
  drawPrompt(ctx, state);
  if (state.phase === 'title') drawTitle(ctx, state);
  if (state.phase === 'over') drawGameOver(ctx, state);
}
