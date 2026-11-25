// Ember & Ladle — tiny synthesized sounds. One job: short WebAudio blips for
// pickup, chopping, cooking, serving and burning. No audio files, no network;
// everything is silent until the first key or click creates the context.

let context = null;

function ctx() {
  if (context) return context;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    context = new AudioCtx();
  } catch {
    context = null;
  }
  return context;
}

function blip(freq, seconds, type, gainValue) {
  const ac = ctx();
  if (!ac) return;
  try {
    if (ac.state === 'suspended') void ac.resume();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainValue, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + seconds);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + seconds);
  } catch {
    // Sound is garnish; a blocked context never breaks the game.
  }
}

export function unlockAudio() {
  ctx();
}

export function soundPickup() {
  blip(660, 0.08, 'sine', 0.12);
}

export function soundChop() {
  blip(220, 0.06, 'square', 0.08);
}

export function soundCookDone() {
  blip(880, 0.12, 'sine', 0.12);
  setTimeout(() => blip(1174, 0.14, 'sine', 0.1), 90);
}

export function soundServe() {
  blip(523, 0.1, 'triangle', 0.14);
  setTimeout(() => blip(659, 0.1, 'triangle', 0.14), 90);
  setTimeout(() => blip(784, 0.18, 'triangle', 0.14), 180);
}

export function soundBurn() {
  blip(140, 0.3, 'sawtooth', 0.1);
}

export function soundTicket() {
  blip(980, 0.09, 'sine', 0.1);
}

export function soundBad() {
  blip(180, 0.15, 'square', 0.07);
}
