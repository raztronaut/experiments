# Web Audio Profile

> Activate when `experiment.json` has `"profile": "web-audio"`

## Behavioral Mode
**Sound design precision, audio-visual synchronization.** Audio IS the experiment (or a core pillar of it). Prioritize timing accuracy, timbral quality, and seamless sync with visual events.

## Priority Ordering
1. Timing precision (audio events must align with visual triggers)
2. Audio quality (no clipping, no clicks, smooth envelopes)
3. Browser compatibility (autoplay policy, vendor prefixes)
4. Performance (limit concurrent nodes, reuse buffers)
5. Accessibility (mute controls, `prefers-reduced-motion` awareness)

## Toolkit Setup: AudioContext Initialization
```tsx
'use client'

import { useCallback, useEffect, useRef } from 'react'

function useAudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null)
  const compressorRef = useRef<DynamicsCompressorNode | null>(null)

  useEffect(() => {
    return () => { ctxRef.current?.close() }
  }, [])

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )()

      const comp = ctxRef.current.createDynamicsCompressor()
      comp.threshold.setValueAtTime(-24, ctxRef.current.currentTime)
      comp.knee.setValueAtTime(30, ctxRef.current.currentTime)
      comp.ratio.setValueAtTime(12, ctxRef.current.currentTime)
      comp.attack.setValueAtTime(0.003, ctxRef.current.currentTime)
      comp.release.setValueAtTime(0.25, ctxRef.current.currentTime)
      comp.connect(ctxRef.current.destination)
      compressorRef.current = comp
    }

    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  return { ctxRef, compressorRef, ensureContext }
}
```
Always route through a `DynamicsCompressorNode` on the master bus to prevent clipping when multiple sounds overlap.

## Synthesis Patterns

**Noise buffers** -- pre-generate and cache for percussive textures:
```tsx
const createNoiseBuffer = (ctx: AudioContext, duration: number) => {
  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buf
}
```

**Oscillator synthesis** -- short-lived oscillators for tonal transients:
```tsx
const osc = ctx.createOscillator()
osc.type = 'triangle'
osc.frequency.setValueAtTime(160, now)
osc.frequency.exponentialRampToValueAtTime(60, now + 0.06)
osc.start(now)
osc.stop(now + 0.12)
```

**Gain envelopes** -- shape amplitude to avoid clicks:
```tsx
const gain = ctx.createGain()
gain.gain.setValueAtTime(0, now)
gain.gain.linearRampToValueAtTime(0.08, now + 0.003)       // attack
gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)  // decay
```
Never jump gain to zero -- ramp to `0.0001` then let the node stop.

**BiquadFilter** -- bandpass for character, lowpass for warmth:
```tsx
const bp = ctx.createBiquadFilter()
bp.type = 'bandpass'
bp.frequency.setValueAtTime(3200, now)
bp.Q.setValueAtTime(4, now)
```

**Stereo panning** -- subtle spread avoids monotone center:
```tsx
const panner = ctx.createStereoPanner()
panner.pan.setValueAtTime((Math.random() - 0.5) * 0.4, now)
```

## Concurrency Limiting

When many sounds trigger in a short window (e.g., split-flap cells), cap concurrency to prevent audio thread overload:
```tsx
const MAX_CONCURRENT = 12
const WINDOW = 0.05 // 50ms

if (now - lastTrigger < WINDOW) {
  concurrent++
  if (concurrent > MAX_CONCURRENT) return // drop sound
} else {
  concurrent = 1
  lastTrigger = now
}
```
Scale individual volume inversely with load: `masterVol * (1 - loadFactor * 0.4)`.

## Randomization

Avoid the "machine gun effect" by jittering each sound instance:
- **Pitch**: `1 + (Math.random() - 0.5) * 0.15`
- **Volume**: `0.8 + Math.random() * 0.4`
- **Pan**: `(Math.random() - 0.5) * 0.4`
- **Timing micro-offsets**: 1--5ms pre-delay for layered transients

## Gotchas

| Problem | Fix |
|---------|-----|
| Autoplay policy blocks audio | Create `AudioContext` on first user gesture (click/tap), not on mount |
| `AudioContext` suspended after tab switch | Check `ctx.state === 'suspended'` and call `ctx.resume()` before each use |
| Safari `webkitAudioContext` | Use `window.AudioContext \|\| window.webkitAudioContext` |
| Clicks/pops on start/stop | Always ramp gain from/to near-zero; never set gain discontinuously |
| Memory leaks from orphaned nodes | `OscillatorNode` and `BufferSource` auto-disconnect after `.stop()` -- but long chains need manual cleanup |
| Audio thread overload | Cap concurrent sounds, pre-generate buffers, reuse filter/panner nodes where possible |
| Mobile silent mode (iOS) | No workaround -- document that audio requires ringer on |

## Pre-Implementation Checklist
- [ ] `AudioContext` created lazily on user gesture
- [ ] Master `DynamicsCompressorNode` in signal chain
- [ ] Mute/unmute control exposed to user
- [ ] `prefers-reduced-motion` respected (disable sound-on-interaction when active)
- [ ] Gain envelopes on all sound sources (no raw start/stop)
- [ ] Noise buffers pre-generated and cached in refs
- [ ] Concurrency cap if >1 sound can trigger per frame
- [ ] `AudioContext.close()` in cleanup/unmount
