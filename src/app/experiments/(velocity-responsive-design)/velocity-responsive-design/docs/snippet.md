# Snippet: Velocity-Responsive Design

## Install

```bash
npm install lenis tempus motion
```

## Usage — Velocity Engine Hook

The core pattern: read Lenis velocity, apply hysteresis, normalize to 0–1.

```typescript
import type Lenis from "lenis";
import { useCallback, useEffect, useRef, useState } from "react";

type ReadingState = "detailed" | "skim";

interface VelocityEngineConfig {
  skimEnter: number;       // Enter skim above this (px/s)
  skimExit: number;        // Start exit below this (px/s)
  skimExitDelay: number;   // Hold skim for this long after drop (ms)
  velocityScale: number;   // Lenis velocity multiplier
  normalizationMax: number; // Ceiling for 0–1 normalization
}

export function useVelocityEngine(lenis: Lenis | null, config: VelocityEngineConfig) {
  const [velocity, setVelocity] = useState(0);
  const [readingState, setReadingState] = useState<ReadingState>("detailed");
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lenis) return;
    const handler = (l: Lenis) => {
      const v = Math.floor(Math.abs(l.velocity) * config.velocityScale);
      setVelocity(v);

      if (v > config.skimEnter) {
        setReadingState("skim");
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      } else if (v < config.skimExit) {
        setReadingState((prev) => {
          if (prev === "skim" && !exitTimerRef.current) {
            exitTimerRef.current = setTimeout(() => {
              setReadingState("detailed");
              exitTimerRef.current = null;
            }, config.skimExitDelay);
          }
          return prev;
        });
      } else if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
    lenis.on("scroll", handler);
    return () => lenis.off("scroll", handler);
  }, [lenis, config]);

  const normalizedVelocity = Math.min(velocity / config.normalizationMax, 1);

  return { velocity, normalizedVelocity, readingState };
}
```

## Props / API

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skimEnter` | `number` | `500` | Velocity threshold to enter skim mode (scaled px/s) |
| `skimExit` | `number` | `400` | Velocity must drop below this to start exit countdown |
| `skimExitDelay` | `number` | `2500` | Milliseconds to hold skim after velocity drops |
| `velocityScale` | `number` | `10` | Multiplier for Lenis's lerp-smoothed velocity |
| `normalizationMax` | `number` | `3000` | Velocity ceiling for 0–1 normalization |

## Returns

| Field | Type | Description |
|-------|------|-------------|
| `velocity` | `number` | Current scaled velocity in px/s |
| `normalizedVelocity` | `number` | Velocity mapped to 0–1 range |
| `readingState` | `"detailed" \| "skim"` | Current reading mode |

## Gotchas

- **Lenis velocity is lerp-smoothed** — raw values are small (typically 0–5). The `velocityScale` multiplier maps them to a usable range.
- **Exit delay is critical** — without it, brief scroll pauses (repositioning hand, reaching end of gesture) trigger false exits from skim mode.
- **Dead zone width matters** — `skimEnter - skimExit` gap should be at least 50–100 px/s. Too narrow and you lose the stability benefit of hysteresis.
- **Programmatic scrolls** need velocity locking — `scrollBy`/`scrollTo` calls register as scroll events. Lock velocity tracking during corrections or you'll create feedback loops.
