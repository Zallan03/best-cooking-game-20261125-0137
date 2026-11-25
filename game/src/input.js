// Ember & Ladle — keyboard and mouse input. One job: turn keys and clicks
// into a small state object the world update reads every frame.

export function createInput(canvas) {
  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    interactPressed: false,
    restartPressed: false,
    startPressed: false,
    // Click-to-move target in logical pixels, or null.
    clickTarget: null,
    // Last clicked station, so arriving there auto-interacts.
    clickStation: null,
  };

  const keyMap = {
    ArrowUp: 'up',
    KeyW: 'up',
    ArrowDown: 'down',
    KeyS: 'down',
    ArrowLeft: 'left',
    KeyA: 'left',
    ArrowRight: 'right',
    KeyD: 'right',
  };

  window.addEventListener('keydown', (event) => {
    const field = keyMap[event.code];
    if (field) {
      input[field] = true;
      input.clickTarget = null;
      event.preventDefault();
      return;
    }
    if (event.code === 'KeyE' || event.code === 'Space') {
      if (!event.repeat) input.interactPressed = true;
      event.preventDefault();
    }
    if (event.code === 'KeyR') input.restartPressed = true;
    if (event.code === 'Enter') input.startPressed = true;
  });

  window.addEventListener('keyup', (event) => {
    const field = keyMap[event.code];
    if (field) input[field] = false;
  });

  window.addEventListener('blur', () => {
    input.up = false;
    input.down = false;
    input.left = false;
    input.right = false;
  });

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    input.clickTarget = { x, y };
    input.clickStation = null;
  });

  return input;
}

// Edge-triggered presses are consumed once per frame by the world update.
export function consumePresses(input) {
  const pressed = {
    interact: input.interactPressed,
    restart: input.restartPressed,
    start: input.startPressed,
  };
  input.interactPressed = false;
  input.restartPressed = false;
  input.startPressed = false;
  return pressed;
}
