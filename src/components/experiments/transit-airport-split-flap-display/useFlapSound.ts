"use client";

import { useCallback, useEffect, useRef } from "react";

export function useFlapSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterCompressorRef = useRef<DynamicsCompressorNode | null>(null);
  const isMuted = useRef(false);

  // Concurrency tracking
  const lastTriggerTime = useRef<number>(0);
  const concurrentCount = useRef<number>(0);
  const MAX_CONCURRENT = 12; // Max sounds starting in a 50ms window
  const CONCURRENCY_WINDOW = 0.05; // 50ms

  // Cached noise buffers
  const preClickBufferRef = useRef<AudioBuffer | null>(null);
  const snapBufferRef = useRef<AudioBuffer | null>(null);
  const resonanceBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const createNoiseBuffer = (ctx: AudioContext, duration: number) => {
    const buffer = ctx.createBuffer(
      1,
      ctx.sampleRate * duration,
      ctx.sampleRate
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const ensureContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();

      // Initialize Master Compressor to prevent clipping
      const compressor = audioContextRef.current.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(
        -24,
        audioContextRef.current.currentTime
      );
      compressor.knee.setValueAtTime(30, audioContextRef.current.currentTime);
      compressor.ratio.setValueAtTime(12, audioContextRef.current.currentTime);
      compressor.attack.setValueAtTime(
        0.003,
        audioContextRef.current.currentTime
      );
      compressor.release.setValueAtTime(
        0.25,
        audioContextRef.current.currentTime
      );
      compressor.connect(audioContextRef.current.destination);
      masterCompressorRef.current = compressor;
    }
    const ctx = audioContextRef.current!;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Pre-generate buffers if they don't exist
    if (!preClickBufferRef.current) {
      preClickBufferRef.current = createNoiseBuffer(ctx, 0.02);
      snapBufferRef.current = createNoiseBuffer(ctx, 0.04);
      resonanceBufferRef.current = createNoiseBuffer(ctx, 0.15);
    }

    return ctx;
    // biome-ignore lint/correctness/useExhaustiveDependencies: legacy experiment, intentional dep pattern
  }, [createNoiseBuffer]);

  const playClick = useCallback(() => {
    if (isMuted.current) {
      return;
    }

    try {
      const ctx = ensureContext();
      const now = ctx.currentTime;

      // --- Concurrency Limit Logic ---
      if (now - lastTriggerTime.current < CONCURRENCY_WINDOW) {
        concurrentCount.current++;
        if (concurrentCount.current > MAX_CONCURRENT) {
          return; // Drop sound
        }
      } else {
        concurrentCount.current = 1;
        lastTriggerTime.current = now;
      }

      // --- Dynamic Volume Scaling ---
      // If many cells are flapping, reduce individual volume slightly
      const loadFactor = Math.min(1, concurrentCount.current / MAX_CONCURRENT);
      const masterVolScale = 1 - loadFactor * 0.4; // Scale down by up to 40%

      // --- Randomization Engine ---
      // Each "clack" should be unique to avoid machine-gun effect
      const pitchJitter = 1 + (Math.random() - 0.5) * 0.15;
      const volJitter = 0.8 + Math.random() * 0.4;
      const panValue = (Math.random() - 0.5) * 0.4; // Subtle stereo spread

      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(panValue, now);
      panner.connect(masterCompressorRef.current || ctx.destination);

      /**
       * Layer 0: The "Pre-Click" (Flap clearing the previous one)
       * Very subtle, slightly earlier transient
       */
      const preDelay = 0.015;
      const preClickDuration = 0.02;
      if (preClickBufferRef.current) {
        const source = ctx.createBufferSource();
        source.buffer = preClickBufferRef.current;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.setValueAtTime(4000 * pitchJitter, now);
        bandpass.Q.setValueAtTime(10, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(
          0.02 * volJitter * masterVolScale,
          now + 0.002
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, now + preClickDuration);

        source.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(panner);

        source.start(now);
        source.stop(now + preClickDuration);
      }

      /**
       * Layer 1: The "Snap" (Main Transient)
       * Sharp high-frequency click when the flap hits the stopper
       */
      const mainTime = now + preDelay;
      const snapDuration = 0.04;
      if (snapBufferRef.current) {
        const source = ctx.createBufferSource();
        source.buffer = snapBufferRef.current;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.setValueAtTime(3200 * pitchJitter, mainTime);
        bandpass.Q.setValueAtTime(4, mainTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, mainTime);
        gain.gain.linearRampToValueAtTime(
          0.08 * volJitter * masterVolScale,
          mainTime + 0.003
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, mainTime + snapDuration);

        source.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(panner);

        source.start(mainTime);
        source.stop(mainTime + snapDuration);
      }

      /**
       * Layer 2: The "Thud" (Impact Body)
       * Low frequency component representing the mass of the flap
       */
      {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lp = ctx.createBiquadFilter();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(160 * pitchJitter, mainTime);
        osc.frequency.exponentialRampToValueAtTime(
          60 * pitchJitter,
          mainTime + 0.06
        );

        lp.type = "lowpass";
        lp.frequency.setValueAtTime(800, mainTime);

        gain.gain.setValueAtTime(0, mainTime);
        gain.gain.linearRampToValueAtTime(
          0.06 * volJitter * masterVolScale,
          mainTime + 0.012
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, mainTime + 0.1);

        osc.connect(lp);
        lp.connect(gain);
        gain.connect(panner);

        osc.start(mainTime);
        osc.stop(mainTime + 0.12);
      }

      /**
       * Layer 3: The "Resonance" (Metallic Ring)
       * Short-lived metallic vibration after impact
       */
      const resonanceDuration = 0.15;
      if (resonanceBufferRef.current) {
        const source = ctx.createBufferSource();
        source.buffer = resonanceBufferRef.current;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.setValueAtTime(1200 * pitchJitter, mainTime + 0.01);
        bandpass.Q.setValueAtTime(15, mainTime); // High Q for metallic feel

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, mainTime + 0.01);
        gain.gain.linearRampToValueAtTime(
          0.03 * volJitter * masterVolScale,
          mainTime + 0.02
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          mainTime + resonanceDuration
        );

        source.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(panner);

        source.start(mainTime + 0.01);
        source.stop(mainTime + resonanceDuration + 0.02);
      }
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, [ensureContext]);

  const setMuted = useCallback((muted: boolean) => {
    isMuted.current = muted;
  }, []);

  return { playClick, setMuted };
}
