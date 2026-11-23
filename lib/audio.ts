"use client";

/**
 * Motor de audio interactivo sintetizado con Web Audio API.
 * Produce efectos de sonido limpios, sutiles y futuristas para clics, hovers y cambios de estado
 * sin necesidad de cargar archivos de audio externos pesados.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (enabled) {
    playChime();
  }
}

export function toggleSound(): boolean {
  setSoundEnabled(!soundEnabled);
  return soundEnabled;
}

/** Tono suave al pasar el ratón por botones o links */
export function playHoverSound(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(540, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.015, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // Silencioso en caso de error
  }
}

/** Clic nítido y moderno */
export function playClickSound(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // Silencioso
  }
}

/** Chime futurista para activar audio o abrir modales */
export function playChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // Acorde C mayor
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.03);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.02, ctx.currentTime + idx * 0.03 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.03 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.03);
      osc.stop(ctx.currentTime + idx * 0.03 + 0.36);
    });
  } catch {
    // Silencioso
  }
}

