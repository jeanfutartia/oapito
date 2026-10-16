type WhistleKind = 'SHORT' | 'LONG' | 'TRIPLE';

let ctx: AudioContext | null = null;
let muted = false;
let crowd: { src: AudioBufferSourceNode; gain: GainNode; filt: BiquadFilterNode } | null = null;
let noiseBuf: AudioBuffer | null = null;

const getCtx = (): AudioContext | null => {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

const noise = (c: AudioContext): AudioBuffer => {
  if (noiseBuf) return noiseBuf;
  const len = c.sampleRate * 3;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02; // ruído "marrom": som de multidão distante
    data[i] = last * 3.5;
  }
  noiseBuf = buf;
  return buf;
};

const tone = (freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12) => {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  const t0 = c.currentTime + start;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  osc.frequency.linearRampToValueAtTime(freq * 1.04, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
};

export const soundEffects = {
  playWhistle(kind: WhistleKind = 'SHORT') {
    const pattern: Record<WhistleKind, [number, number][]> = {
      SHORT: [[0, 0.22]],
      LONG: [[0, 0.8]],
      TRIPLE: [[0, 0.35], [0.45, 0.35], [0.9, 0.7]]
    };
    pattern[kind].forEach(([s, d]) => {
      tone(2900, s, d, 'square', 0.05);
      tone(3100, s, d, 'sine', 0.06);
    });
  },
  playRadioBeep() {
    tone(1200, 0, 0.09, 'sine', 0.1);
    tone(900, 0.12, 0.09, 'sine', 0.1);
  },
  playGoalRoar() {
    if (muted) return;
    const c = getCtx();
    if (!c) return;
    const src = c.createBufferSource();
    src.buffer = noise(c);
    const filt = c.createBiquadFilter();
    filt.type = 'bandpass';
    filt.Q.value = 0.7;
    const gain = c.createGain();
    const t0 = c.currentTime;
    filt.frequency.setValueAtTime(500, t0);
    filt.frequency.exponentialRampToValueAtTime(1500, t0 + 0.6);
    filt.frequency.exponentialRampToValueAtTime(700, t0 + 3.2);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.5, t0 + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.4);
    src.connect(filt).connect(gain).connect(c.destination);
    src.start(t0);
    src.stop(t0 + 3.5);
  },
  startCrowd() {
    if (muted || crowd) return;
    const c = getCtx();
    if (!c) return;
    const src = c.createBufferSource();
    src.buffer = noise(c);
    src.loop = true;
    const filt = c.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 700;
    const gain = c.createGain();
    gain.gain.value = 0.0001;
    src.connect(filt).connect(gain).connect(c.destination);
    src.start();
    gain.gain.setTargetAtTime(0.08, c.currentTime, 1.2);
    crowd = { src, gain, filt };
  },
  setCrowdIntensity(temperature: number) {
    const c = ctx;
    if (!crowd || !c) return;
    const k = Math.max(0, Math.min(100, temperature)) / 100;
    crowd.gain.gain.setTargetAtTime(0.05 + k * 0.16, c.currentTime, 0.8);
    crowd.filt.frequency.setTargetAtTime(500 + k * 900, c.currentTime, 0.8);
  },
  stopCrowd() {
    const c = ctx;
    if (!crowd || !c) return;
    const cur = crowd;
    crowd = null;
    cur.gain.gain.setTargetAtTime(0.0001, c.currentTime, 0.4);
    setTimeout(() => { try { cur.src.stop(); } catch { /* já parado */ } }, 1500);
  },
  setMuted(m: boolean) {
    muted = m;
    if (m) this.stopCrowd();
  },
  isMuted: () => muted
};
