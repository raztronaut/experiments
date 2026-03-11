/**
 * Velocity-Responsive Design (VRD) Constants
 */

export const VELOCITY_THRESHOLDS = {
  VELOCITY_SCALE: 10, // Lenis velocity amplifier (lerp-smoothed → display-scale)
  SKIM_ENTER: 500, // Transition to skim mode at 500 (scaled) px/s
  SKIM_EXIT: 400, // Must drop below 400 (scaled) px/s to trigger exit countdown
  IS_SCROLLING: 10,
  NORMALIZATION_MAX: 3000, // Visual effects scale relative to this peak
};

export const TIMINGS = {
  SKIM_EXIT_DELAY: 2500, // Duration to stay in skim mode after speed drops
  SCROLL_LOCK_DURATION: 700, // Duration to lock velocity tracking during programmatic scrolls (covers spring animation)
};

export const SPRING_CONFIGS = {
  TRANSITION: {
    duration: 0.6,
    type: "spring" as const,
    damping: 30,
    stiffness: 100,
  },
  IMAGE_TRANSITION: {
    type: "spring" as const,
    damping: 30,
    stiffness: 150,
  },
  IMAGE_MOTION: {
    type: "spring" as const,
    damping: 25,
    stiffness: 120,
    mass: 0.5,
  },
};
