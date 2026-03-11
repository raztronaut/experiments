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

export const INVERSA_CONTENT = {
  title: "Location Framework",
  blocks: [
    {
      heading: "Coordinate Mapping",
      text: "A creative coding laboratory where every experiment pushes the boundary between art and engineering.",
    },
    {
      heading: "Active Locations",
      text: "Scaffolded by AI agents. Refined by hand. Shipped with intent.",
    },
    {
      heading: "Spatial Center",
      text: "3D scenes, custom shaders, scroll-driven animation, interactive physics — each one isolated, each one publishable.",
    },
  ],
  markers: [
    { label: "AI Scaffolding", color: "#dc5935" },
    { label: "Human Refinement", color: "#d3ef76" },
  ],
  outroText: "The system has reached its final spatial state.",
};

export const JESKOJETS_CONTENT = {
  headerLeft: {
    title: "V2 is\nlive",
    description:
      "A creative coding laboratory rebuilt from the ground up. AI agents as creative partners, every experiment isolated and publishable.",
  },
  headerRight: {
    label: "razisyed.cv",
    title: "Explore\nthe lab",
  },
  copy: "What unfolds here is not a portfolio, but a practice. A sustained commitment where code becomes craft, constraints become catalysts, and each experiment teaches something the last one couldn't.",
  outroText: "End of view.",
};

export const PRELOADER_CONTENT = {
  logo: "V2 Lab",
  navLinks: ["Experiments", "Shaders", "Process", "Info"],
  header: "Experiments",
  footerItems: ["Creative Coding", "AI-Native", "V2"],
  heroImage: "/experiments/announcing-v2/death.jpg",
};

export const FIDDLE_CONTENT = {
  navLeft: "AI as Creative Partner",
  navRight: "razisyed.cv/v2",
  footerLeft: "Experiment Lab",
  footerRight: "Built with AI Agents",
  heroImage: "/experiments/announcing-v2/fiddle-img.jpg",
};

export const GRID_SYMBOLS = ["O", "X", "*", ">", "$", "W"];
