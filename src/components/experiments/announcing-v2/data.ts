export const HERO = {
  title: "razi's experiments",
  version: "v2",
  subtitle:
    "Check out this cool shit I built. It's a playground designed to let me build faster, experiment quicker, and test new interactions with strong scaffolding. Try adding ?debug to the URL to see under the hood.",
};

export const MANIFESTO = {
  heading: "The Setup",
  lines: [
    {
      text: "Strong scaffolding so I can drop straight into creative coding.",
      emphasis: "Zero config" as const,
    },
    {
      text: "Unified RAF loops, Tempus, and silky Lenis scroll right out of the box.",
      emphasis: "Performance first" as const,
    },
    {
      text: "Quick debug toggles and tools to inspect exactly what's rendering.",
      emphasis: "Debuggable" as const,
    },
    {
      text: "Publishing is automatic with built-in MDX and OG image generation.",
      emphasis: "Publishable" as const,
    },
  ],
  command:
    'npm run new:experiment:auto -- --name "anything" --profile scrollytelling --toolkit',
};

export interface ToolkitItem {
  color: string;
  description: string;
  name: string;
  tier: "core" | "domain" | "ui";
}

export const TOOLKIT: ToolkitItem[] = [
  {
    name: "Lenis",
    description: "Silky smooth scroll with momentum and touch support",
    tier: "core",
    color: "#ff4d4d",
  },
  {
    name: "Tempus",
    description: "Unified RAF manager with priority scheduling",
    tier: "core",
    color: "#4dff88",
  },
  {
    name: "GSAP",
    description: "Industry-standard timeline animations and ScrollTrigger",
    tier: "core",
    color: "#88ce02",
  },
  {
    name: "R3F",
    description: "React Three Fiber for declarative 3D scenes and shaders",
    tier: "core",
    color: "#049ef4",
  },
  {
    name: "Motion",
    description: "Spring physics, layout animations, and gesture support",
    tier: "core",
    color: "#ff0055",
  },
  {
    name: "Drei",
    description: "100+ helpers for lights, controls, materials, and text",
    tier: "domain",
    color: "#ffd700",
  },
  {
    name: "Theatre.js",
    description: "Visual timeline editor for animation sequencing",
    tier: "domain",
    color: "#b4ff39",
  },
  {
    name: "Leva",
    description: "Developer GUI controls, tree-shaken in production",
    tier: "domain",
    color: "#9b59b6",
  },
];

export const AI_BRIDGE = {
  heading: "Debug Introspection",
  description:
    "I wanted to make sure it was easy to see what's happening. Add ?debug to the URL on any experiment to expose the serialized scene graphs, performance metrics, and GUI controls.",
  metrics: [
    { label: "FPS", value: 60, suffix: "", format: "int" as const },
    { label: "Heap", value: 12.4, suffix: "MB", format: "float" as const },
    { label: "CLS", value: 0.001, suffix: "", format: "float" as const },
    { label: "GSAP Tweens", value: 24, suffix: "", format: "int" as const },
  ],
  sceneGraph: [
    "Scene",
    "  ├─ PerspectiveCamera (fov: 75)",
    "  ├─ AmbientLight (intensity: 0.5)",
    "  ├─ DirectionalLight (intensity: 1.2)",
    '  ├─ Mesh "hero-plane"',
    "  │   ├─ PlaneGeometry (2 × 2)",
    "  │   └─ ShaderMaterial (custom)",
    '  ├─ Group "particles"',
    "  │   └─ InstancedMesh (count: 1000)",
    '  └─ Mesh "floor"',
    "      ├─ PlaneGeometry (10 × 10)",
    "      └─ MeshStandardMaterial",
  ],
};

export interface ProfileCard {
  description: string;
  icon: string;
  name: string;
  profile: string;
}

export const PROFILES: ProfileCard[] = [
  {
    name: "3D Scene",
    profile: "r3f-scene",
    icon: "◆",
    description:
      "Interactive 3D environments with lights, models, and controls",
  },
  {
    name: "Shader Art",
    profile: "r3f-shader",
    icon: "◈",
    description: "Fullscreen GLSL shaders with noise, SDF, and color palettes",
  },
  {
    name: "Scrollytelling",
    profile: "scrollytelling",
    icon: "▼",
    description: "Scroll-driven narratives with pinned sections and scrub",
  },
  {
    name: "Interaction",
    profile: "interaction",
    icon: "◉",
    description: "Drag, spring physics, gestures, and tactile feedback",
  },
  {
    name: "Web Audio",
    profile: "web-audio",
    icon: "♫",
    description: "Audio-reactive visuals and sound synthesis experiments",
  },
  {
    name: "DOM Effect",
    profile: "dom-effect",
    icon: "✦",
    description: "CSS-powered VFX, shimmer, magnetic elements, and morphs",
  },
  {
    name: "Blank",
    profile: "blank",
    icon: "□",
    description: "Clean slate — bring your own stack and constraints",
  },
];

export const PUBLISHING = {
  heading: "Automated Publishing",
  description:
    "Because I like documenting this stuff, every experiment ships with automated MDX generation, dynamic OG images, and RSS feed integration to make sharing easy.",
  pipeline: [
    { label: "Experiment", icon: "⚡" },
    { label: "MDX Article", icon: "📝" },
    { label: "OG Image", icon: "🖼" },
    { label: "RSS Feed", icon: "📡" },
    { label: "Registry", icon: "📦" },
  ],
};

export const CLOSING = {
  heading: "Explore the Lab",
  cta: "Enter the Lab",
  ctaHref: "/",
};
