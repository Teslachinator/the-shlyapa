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

function tone(frequency, duration, { type = "sine", gain = 0.05, delay = 0 } = {}) {
  try {
    const audio = context();
    if (!audio) return;
    const start = audio.currentTime + delay;
    const oscillator = audio.createOscillator();
    const amp = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    amp.gain.setValueAtTime(gain, start);
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
  tone(880, 0.07, { type: "square", gain: 0.03 });
}

export function playPop() {
  tone(620, 0.08, { gain: 0.05 });
}

export function playPass() {
  tone(240, 0.08, { type: "triangle", gain: 0.04 });
}

export function playHorn() {
  tone(180, 0.28, { type: "sawtooth", gain: 0.04 });
}

export function playFanfare() {
  tone(523, 0.12, { gain: 0.05 });
  tone(659, 0.16, { gain: 0.05, delay: 0.1 });
}

export function playSignal(up) {
  if (up) {
    tone(520, 0.06, { gain: 0.05 });
    tone(780, 0.11, { gain: 0.05, delay: 0.07 });
    return;
  }
  tone(780, 0.06, { gain: 0.05 });
  tone(420, 0.11, { type: "triangle", gain: 0.05, delay: 0.07 });
}

export function pulse(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    /* вибрация необязательна */
  }
}
