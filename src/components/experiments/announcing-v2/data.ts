export interface ExperimentItem {
  poster: string;
  slug: string;
  title: string;
  video?: string;
}

export const EXPERIMENTS: ExperimentItem[] = [
  {
    slug: "basketball-replay-center",
    title: "Basketball Replay Center",
    poster: "/experiments/announcing-v2/previews/basketball-replay-center.jpg",
    video: "/experiments/announcing-v2/previews/basketball-replay-center.mp4",
  },
  {
    slug: "send-button",
    title: "Send Button",
    poster: "/experiments/announcing-v2/previews/send-button.jpg",
  },
  {
    slug: "shader-landing",
    title: "Shader Landing",
    poster: "/experiments/announcing-v2/previews/shader-landing.jpg",
  },
  {
    slug: "keyboard-keys",
    title: "Keyboard Keys",
    poster: "/experiments/announcing-v2/previews/keyboard-keys.jpg",
    video: "/experiments/announcing-v2/previews/keyboard-keys.mp4",
  },
  {
    slug: "mountain-transition",
    title: "Mountain Transition",
    poster: "/experiments/announcing-v2/previews/mountain-transition.jpg",
    video: "/experiments/announcing-v2/previews/mountain-transition.mp4",
  },
  {
    slug: "cursor-depth-explorer",
    title: "Cursor Depth Explorer",
    poster: "/experiments/announcing-v2/previews/cursor-depth-explorer.jpg",
    video: "/experiments/announcing-v2/previews/cursor-depth-explorer.mp4",
  },
  {
    slug: "game-of-life-shader",
    title: "Game of Life Shader",
    poster: "/experiments/announcing-v2/previews/game-of-life-shader.jpg",
    video: "/experiments/announcing-v2/previews/game-of-life-shader.mp4",
  },
  {
    slug: "life-3d",
    title: "Life 3D",
    poster: "/experiments/announcing-v2/previews/life-3d.jpg",
    video: "/experiments/announcing-v2/previews/life-3d.mp4",
  },
  {
    slug: "velocity-responsive-design",
    title: "Velocity Responsive",
    poster:
      "/experiments/announcing-v2/previews/velocity-responsive-design.jpg",
    video: "/experiments/announcing-v2/previews/velocity-responsive-design.mp4",
  },
  {
    slug: "transit-airport-split-flap-display",
    title: "Split-Flap Display",
    poster:
      "/experiments/announcing-v2/previews/transit-airport-split-flap-display.jpg",
    video:
      "/experiments/announcing-v2/previews/transit-airport-split-flap-display.mp4",
  },
  {
    slug: "non-euclidean-hyperbolic-workspace",
    title: "Hyperbolic Workspace",
    poster:
      "/experiments/announcing-v2/previews/non-euclidean-hyperbolic-workspace.jpg",
    video:
      "/experiments/announcing-v2/previews/non-euclidean-hyperbolic-workspace.mp4",
  },
  {
    slug: "rabbithole-chat-gallery-explore",
    title: "Rabbithole Gallery",
    poster:
      "/experiments/announcing-v2/previews/rabbithole-chat-gallery-explore.jpg",
    video:
      "/experiments/announcing-v2/previews/rabbithole-chat-gallery-explore.mp4",
  },
  {
    slug: "rabbithole-chat-preloader",
    title: "Rabbithole Preloader",
    poster: "/experiments/announcing-v2/previews/rabbithole-chat-preloader.jpg",
    video: "/experiments/announcing-v2/previews/rabbithole-chat-preloader.mp4",
  },
  {
    slug: "bugged-out-game-of-life-shader-experiment",
    title: "Bugged Out GoL",
    poster:
      "/experiments/announcing-v2/previews/bugged-out-game-of-life-shader-experiment.jpg",
    video:
      "/experiments/announcing-v2/previews/bugged-out-game-of-life-shader-experiment.mp4",
  },
];

export const PRELOADER_CONTENT = {
  logo: "V2 Lab",
  navLinks: ["Blueprint", "Process", "Showcase", "Control"],
  header: "The Lab, Rebuilt",
  footerItems: ["Creative Coding", "AI-Partnered", "2026"],
  heroImage: "/experiments/announcing-v2/death.jpg",
};

export const BLUEPRINT_CONTENT = {
  sectionTitle: "THE PRACTICE",
  subtitle: "A creative coding laboratory, rebuilt from the ground up.",
  panels: [
    {
      id: "creative-coding",
      label: "01. CREATIVE CODING",
      heading: "Art Meets Engineering",
      text: "Code as a creative medium, not just a tool. Every experiment pushes the boundary between visual art and software craft.",
    },
    {
      id: "isolation",
      label: "02. ISOLATION",
      heading: "Each Experiment, Its Own World",
      text: "Own HTML root, own dependencies, no cross-contamination. Constraints become creative catalysts.",
    },
    {
      id: "ai-partnership",
      label: "03. AI PARTNERSHIP",
      heading: "Scaffolded by AI, Refined by Hand",
      text: "AI agents generate the foundation. The human curates, shapes, and pushes toward publishable quality.",
    },
    {
      id: "shipping",
      label: "04. SHIP OR IT DIDN'T HAPPEN",
      heading: "Every Experiment Ships",
      text: "Not prototypes. Not drafts. Published artifacts — each one production-grade, each one live.",
    },
  ],
  stats: [
    { label: "EXPERIMENTS", value: 18 },
    { label: "SHADERS", value: 6 },
    { label: "TECHNOLOGIES", value: 12 },
    { label: "COMPONENTS", value: 45 },
  ],
};

export const PROCESS_CONTENT = {
  phases: [
    {
      label: "PHASE 01",
      title: "Scaffolded by AI",
      text: "AI agents generate the skeleton — layout, boilerplate, initial animation structure. Raw potential, shaped by prompts.",
    },
    {
      label: "PHASE 02",
      title: "Refined by Hand",
      text: "Human craft takes over. Timing, easing, visual weight, the details that separate a demo from an experience.",
    },
    {
      label: "PHASE 03",
      title: "Shipped with Intent",
      text: "Every experiment pushed to production. Not a prototype — a finished artifact, live on the web.",
    },
  ],
};

export const MISSION_CONTROL_CONTENT = {
  stationLabel: "EXPERIMENT LAB // DIAGNOSTIC READOUT",
  stats: [
    { label: "EXPERIMENTS SHIPPED", value: 18, unit: "" },
    { label: "CUSTOM SHADERS", value: 6, unit: "" },
    { label: "TECHNOLOGIES", value: 12, unit: "" },
    { label: "COMPONENTS BUILT", value: 45, unit: "" },
    { label: "UPTIME", value: 99.7, unit: "%" },
  ],
};

export const JESKOJETS_CONTENT = {
  headerLeft: {
    title: "See for\nyourself",
    description:
      "3D scenes, custom shaders, scroll-driven animation, interactive physics — every experiment isolated, every one publishable.",
  },
  headerRight: {
    label: "razisyed.cv",
    title: "Explore\nthe lab",
  },
  copy: "What unfolds here is not a portfolio, but a practice. A sustained commitment where code becomes craft, constraints become catalysts, and each experiment teaches something the last one couldn't.",
  outroText: "The practice continues.",
};
