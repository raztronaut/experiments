export const SEQUENCE_COUNT = 4;
export const FRAMES_PER_SEQUENCE = 24;
export const TOTAL_FRAMES = SEQUENCE_COUNT * FRAMES_PER_SEQUENCE;
export const CANVAS_SIZE = 720;
export const ANIMATION_DURATION_MS = 1000;

export const PERSONAS = ["1", "2", "3", "4"] as const;

const SEQUENCE_PAIRS = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 1],
] as const;

/** Folder mapping: new 1→2 uses old 3→4, new 2→3 uses old 4→1, etc. (3→1, 4→2, 1→3, 2→4) */
const SEQUENCE_FOLDERS: [number, number][] = [
  [3, 4], // new 1-2
  [4, 1], // new 2-3
  [1, 2], // new 3-4
  [2, 3], // new 4-1
];

export function generateSequencePaths(): string[] {
  const paths: string[] = [];
  const cacheBust = typeof window !== "undefined" ? `?v=${Date.now()}` : "";

  for (const [from, to] of SEQUENCE_FOLDERS) {
    for (let i = 0; i < FRAMES_PER_SEQUENCE; i++) {
      const padded = i.toString().padStart(2, "0");
      paths.push(
        `/experiments/luma-morphing/morphing/${from}-${to}/${from}-${to}${padded}.png${cacheBust}`
      );
    }
  }

  return paths;
}

/**
 * Normalize a value within [min, max] to [0, 1], clamped.
 */
export function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Find the shortest circular distance from `start` to `end`
 * on a ring of SEQUENCE_COUNT states (1-indexed, wrapping at SEQUENCE_COUNT).
 * Positive = forward, negative = backward.
 */
export function calculateShortestPath(start: number, end: number): number {
  const direct = end - start;
  const throughTop = end + SEQUENCE_COUNT - start;
  const throughBottom = end - (start + SEQUENCE_COUNT);

  const candidates = [direct, throughTop, throughBottom];
  const absValues = candidates.map(Math.abs);
  const minAbs = Math.min(...absValues);

  return candidates[absValues.indexOf(minAbs)];
}

/**
 * Map a progress value (1 to SEQUENCE_COUNT+1) to a frame index (0 to TOTAL_FRAMES-1).
 */
export function progressToIndex(progress: number): number {
  return Math.round(
    normalize(progress, 1, SEQUENCE_COUNT + 1) * (TOTAL_FRAMES - 1)
  );
}
