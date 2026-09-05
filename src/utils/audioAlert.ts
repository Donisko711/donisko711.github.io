// Audio Alert System for LiveScore using Web Audio API
// Fully client-side, zero external MP3 dependencies, reliable in all browsers

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Play a referee whistle sound (e.g. for Kick-Off or Full-Time)
 */
export function playRefereeWhistle(type: 'kickoff' | 'fulltime' = 'kickoff'): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'kickoff') {
      // 1 sharp, crisp whistle blast (350ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2600, now);
      osc.frequency.exponentialRampToValueAtTime(2800, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(2500, now + 0.35);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } else {
      // 3 short whistle blasts for Full-Time (Tiit... tiit... tiiiit!)
      [0, 0.22, 0.44].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + offset;
        const dur = idx === 2 ? 0.35 : 0.16;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2600, startTime);
        osc.frequency.exponentialRampToValueAtTime(2850, startTime + dur * 0.5);

        gain.gain.setValueAtTime(0.01, startTime);
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + dur + 0.02);
      });
    }
  } catch {
    // Graceful fallback if audio is blocked
  }
}

/**
 * Play a stadium goal horn / fanfare
 */
export function playGoalCelebration(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First: high energetic chime
    const tones = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + (idx * 0.08);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });

    // Second: rich stadium synth horn burst (at 0.35s)
    const hornStart = now + 0.35;
    [329.63, 440, 554.37].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, hornStart);

      gain.gain.setValueAtTime(0.01, hornStart);
      gain.gain.linearRampToValueAtTime(0.12, hornStart + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, hornStart + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(hornStart);
      osc.stop(hornStart + 0.65);
    });
  } catch {
    // Graceful fallback
  }
}
