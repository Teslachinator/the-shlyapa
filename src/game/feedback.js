let audioContext;

function context() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioContext) audioContext = new Ctx();
  return audioContext;
}

export function unlockAudio() {
  try {
    const audio = context();
    if (audio && audio.state === "suspended") audio.resume();
  } catch {
    /* звук необязателен */
  }
}

function tone(frequency, duration, { type = "sine", gain = 0.34, delay = 0 } = {}) {
  try {
    const audio = context();
    if (!audio) return;
    if (audio.state === "suspended") audio.resume();
    const start = audio.currentTime + delay;
    const oscillator = audio.createOscillator();
    const amp = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    const hold = start + duration * 0.62;
    amp.gain.setValueAtTime(gain, start);
    amp.gain.setValueAtTime(gain, hold);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(amp);
    amp.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  } catch {
    /* звук необязателен */
  }
}

export function playTick() {
  tone(880, 0.07, { type: "square", gain: 0.2 });
}

export function playPop() {
  tone(620, 0.1, { gain: 0.92 });
}

export function playPass() {
  tone(240, 0.1, { type: "triangle", gain: 0.92 });
}

export function playHorn() {
  tone(180, 0.28, { type: "sawtooth", gain: 0.4 });
}

export function playFanfare() {
  tone(523, 0.12, { gain: 0.4 });
  tone(659, 0.16, { gain: 0.4, delay: 0.1 });
}

export function playSignal(up) {
  if (up) {
    tone(520, 0.06, { gain: 0.38 });
    tone(780, 0.11, { gain: 0.38, delay: 0.07 });
    return;
  }
  tone(780, 0.06, { gain: 0.38 });
  tone(420, 0.11, { type: "triangle", gain: 0.38, delay: 0.07 });
}

export function pulse(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    /* вибрация необязательна */
  }
}
