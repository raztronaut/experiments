export const smoothEase = (x: number) => x * x * (3 - 2 * x);

/** Fade-in / hold / fade-out envelope over a scroll progress range [0,1]. */
export function phaseValue(
  progress: number,
  fadeInStart: number,
  fadeInEnd: number,
  fadeOutStart: number,
  fadeOutEnd: number
): number {
  if (progress <= fadeInStart || progress > fadeOutEnd) {
    return 0;
  }
  if (progress <= fadeInEnd) {
    return smoothEase((progress - fadeInStart) / (fadeInEnd - fadeInStart));
  }
  if (progress <= fadeOutStart) {
    return 1;
  }
  return (
    1 - smoothEase((progress - fadeOutStart) / (fadeOutEnd - fadeOutStart))
  );
}
