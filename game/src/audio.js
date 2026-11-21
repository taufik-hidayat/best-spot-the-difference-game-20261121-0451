// audio.js — the game's sounds, synthesized with WebAudio: no audio files,
// no network, just oscillators. A found difference chimes, a wrong click
// buzzes low, a cleared scene plays a little arpeggio.

let audioCtx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

function tone(freq, startAt, duration, type, gain) {
  const ac = ctx();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + startAt;
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp);
  amp.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/** Two-note chime for a found difference. */
export function playFound() {
  tone(660, 0, 0.14, 'sine', 0.22);
  tone(990, 0.09, 0.22, 'sine', 0.2);
}

/** Low buzz for a wrong click. */
export function playWrong() {
  tone(150, 0, 0.18, 'sawtooth', 0.1);
  tone(110, 0.05, 0.2, 'sawtooth', 0.08);
}

/** A rising arpeggio for a cleared scene. */
export function playSceneClear() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.24, 'triangle', 0.2));
}

/** A short click for buttons and the hint. */
export function playClick() {
  tone(880, 0, 0.06, 'sine', 0.12);
}
