export const ASSET_BASE = "/experiments/airplanes";

export const HERO = {
  title: "Airplanes.",
  subtitle: "The beginners guide.",
  description: "You've probably forgotten what these are.",
  scrollCta: "Scroll",
} as const;

export const NARRATIVE_SECTIONS = [
  {
    lines: ["They're kinda like buses..."],
    align: "left" as const,
  },
  {
    lines: ["..except they leave the ground.", "Saaay what!?."],
    align: "right" as const,
  },
  {
    lines: ["They fly through the sky.", "For realsies!"],
    align: "left" as const,
  },
  {
    lines: ["Defying all known physical laws.", "It's actual magic!"],
    align: "right" as const,
  },
] as const;

export const BLUEPRINT_FACTS = [
  { label: "Length.", value: "Long.", className: "length" },
  {
    label: "Wing Span.",
    value: "I dunno, longer than a cat probably.",
    className: "wingspan",
  },
  { label: "Left Phalange", value: "Missing", className: "phalange" },
  { label: "Engines", value: "Turbine funtime", className: "" },
] as const;

export const END = {
  title: "Fin.",
  credits: [
    {
      text: "Plane model by",
      link: {
        label: "Google",
        href: "https://poly.google.com/view/8VysVzMlBtk",
      },
    },
    {
      text: "Animated using",
      link: {
        label: "GSAP ScrollTrigger",
        href: "https://greensock.com/scrolltrigger",
      },
    },
  ],
} as const;

const TAU = Math.PI * 2;

export interface PlaneKeyframe {
  ease?: string;
  position: { x: number; y: number; z: number };
  positionEase?: string;
  rotation: { x: number; y: number; z: number };
}

export const SECTION_DURATION = 1;

export const BLUEPRINT_HOLD_INDEX = 6;

export const PLANE_KEYFRAMES: PlaneKeyframe[] = [
  // 0: Initial (set, not tweened)
  {
    position: { x: 80, y: -32, z: -60 },
    rotation: { x: 0, y: TAU * -0.25, z: 0 },
  },
  // 1: Slide in from right
  {
    position: { x: -10, y: -32, z: -60 },
    rotation: { x: 0, y: TAU * -0.25, z: 0 },
    positionEase: "power1.in",
  },
  // 2: Bank left
  {
    position: { x: -40, y: 0, z: -60 },
    rotation: { x: TAU * 0.25, y: 0, z: -TAU * 0.05 },
    ease: "power1.inOut",
  },
  // 3: Bank right
  {
    position: { x: 40, y: 0, z: -60 },
    rotation: { x: TAU * 0.25, y: 0, z: TAU * 0.05 },
    ease: "power3.inOut",
    positionEase: "power2.inOut",
  },
  // 4: Swoop left
  {
    position: { x: -40, y: 0, z: -30 },
    rotation: { x: TAU * 0.2, y: 0, z: -TAU * 0.1 },
    ease: "power3.inOut",
    positionEase: "power2.inOut",
  },
  // 5: Face camera
  {
    position: { x: 0, y: -10, z: 50 },
    rotation: { x: 0, y: TAU * 0.25, z: 0 },
  },
  // 6: (blueprint section hold - same as 5)
  {
    position: { x: 0, y: -10, z: 50 },
    rotation: { x: 0, y: TAU * 0.25, z: 0 },
  },
  // 7: Rotate toward viewer
  {
    position: { x: 0, y: -10, z: 30 },
    rotation: { x: TAU * 0.25, y: TAU * 0.5, z: 0 },
    ease: "power4.inOut",
  },
  // 8: Slide right
  {
    position: { x: 30, y: -10, z: 60 },
    rotation: { x: TAU * 0.25, y: TAU * 0.5, z: 0 },
    ease: "power4.inOut",
  },
  // 9: Tumble
  {
    position: { x: 20, y: 0, z: 100 },
    rotation: { x: TAU * 0.35, y: TAU * 0.75, z: TAU * 0.6 },
    ease: "power4.inOut",
  },
  // 10: Pull away
  {
    position: { x: 0, y: 0, z: -150 },
    rotation: { x: TAU * 0.15, y: TAU * 0.85, z: 0 },
    ease: "power1.in",
    positionEase: "power1.inOut",
  },
  // 11: Fly over camera
  {
    position: { x: 0, y: 30, z: 320 },
    rotation: { x: -TAU * 0.05, y: TAU, z: -TAU * 0.1 },
    ease: "none",
    positionEase: "power1.in",
  },
];

export const MODEL_MATERIAL = {
  color: 0x17_15_11,
  specular: 0xd0_cb_c7,
  shininess: 5,
} as const;

export const INITIAL_CAMERA_Z = 180;

export const LIGHT_CONFIG = {
  point: {
    color: 0xff_ff_ff,
    intensity: 0.75,
    position: { x: 70, y: -20, z: 150 },
  },
  ambient: { color: 0xff_ff_ff, intensity: 1.5 },
} as const;
