export const BRAND = {
  logo: "Canon",
  heading: "Canon",
} as const;

export const NAV_LINKS = [
  "Index",
  "Collection",
  "Material",
  "Process",
  "Info",
] as const;

export const FOOTER_WORDS = [
  "Permanence",
  "Craftsmanship",
  "Expression",
] as const;

export const TIMING = {
  counterDuration: 3,
  counterScaleDuration: 3,
  progressBarDuration: 3,
  counterDigitSlideDelay: 1,
  counterDigitSlideDuration: 0.75,
  counterDigitStagger: 0.1,
  clipReveal1Start: 4.5,
  clipReveal1Duration: 1.5,
  clipReveal2Start: 6,
  clipReveal2Duration: 2,
  progressRevealDuration: 2,
  charRevealStart: 7,
  charRevealDuration: 1,
  charStagger: 0.075,
  wordRevealStart: 7.5,
  wordRevealDuration: 1,
  wordStagger: 0.075,
} as const;

export const CLIP_PATHS = {
  closed: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
  partial: "polygon(35% 35%, 65% 35%, 65% 65%, 35% 65%)",
  open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
} as const;

export const HOP_EASE = "0.9, 0, 0.1, 1";
