export interface ContentItem {
  alt?: string;
  code?: string;
  detailed?: string;
  filename?: string;
  language?: string;
  src?: string;
  summary?: string;
  type: "text" | "image" | "code";
}

export const CONTENT: ContentItem[] = [
  {
    type: "text",
    detailed:
      "Velocity-Responsive Design (VRD) is a paradigm shift in how we think about content layout in the digital age. Traditionally, responsive design has been synonymous with screen size adaptation—moving from a three-column desktop layout to a single-column mobile stack. However, VRD introduces a third dimension: Time and Kinetic Intent. It acknowledges that a user's attention span and information needs are directly proportional to their physical interaction with the device. When a user scrolls slowly, they are in a 'Deep Reading' state, seeking nuance, detail, and narrative. When they scroll rapidly, they are 'Skimming', seeking visual anchors, summaries, and broad structural understanding.",
    summary:
      "VRD adapts UI density based on kinetic intent and scroll velocity.",
  },
  {
    type: "image",
    src: "/experiments/velocity-responsive-design/summary1.png",
    alt: "Kinetic UI Visualization",
  },
  {
    type: "text",
    detailed:
      "The implementation relies on constant monitoring of the scroll velocity vector. By applying hysteresis—a technique commonly used in control systems to prevent rapid oscillation between states—the UI remains stable. We define thresholds: the 'Skim' state is triggered at high velocities, while the 'Detailed' state is restored only when the velocity drops significantly. This prevents flickering and creates a deliberate, fluid transition that feels natural to the user's hand.",
    summary:
      "Hysteresis ensures layout stability during rapid state transitions.",
  },
  {
    type: "code",
    filename: "VelocityContext.tsx",
    language: "typescript",
    code: `const velocity = manualVelocity ?? scrollV;\nconst normalizedVelocity = Math.min(velocity / 1200, 1);\nconst readingState = velocity > 800 ? "skim" : "detailed";`,
  },
  {
    type: "image",
    src: "/experiments/velocity-responsive-design/summary2.png",
    alt: "Abstract Digital Horizon",
  },
  {
    type: "text",
    detailed:
      "At the heart of VRD is the concept of 'Kinetic Hierarchy'. In a static layout, hierarchy is defined by font size and weight. In a velocity-responsive layout, hierarchy is defined by 'Kinetic Persistence'. Some elements are designed to persist longer than others as speed increases. A headline might stay sharp while its supporting paragraph blurs. An image might expand to fill the screen, effectively becoming a chapter marker that the user can recognize even at 3000 pixels per second.",
    summary:
      "Kinetic Hierarchy uses element persistence for high-speed legibility.",
  },
  {
    type: "text",
    detailed:
      "Designing for inertia means acknowledging that the user's scroll isn't just a mathematical delta; it's a physical gesture with momentum. If the UI responds too instantly, it feels jittery and digital. If it responds too slowly, it feels sluggish and unresponsive. The 'Golden Ratio' of kinetic UI lies in matching the software's reaction curves to the physiological expectations of the human hand—using springs instead of tweens, and applying damping that feels like friction.",
    summary:
      "Fluid interfaces match software reaction curves to human physiology.",
  },
  {
    type: "code",
    filename: "VelocityText.tsx",
    language: "typescript",
    code: "<motion.div\n  animate={{\n    opacity: isSkim ? 0.8 : 1,\n    filter: `blur(${isSkim ? v * 3 : 0}px)`,\n  }}\n>\n  {isSkim ? summary : detailed}\n</motion.div>",
  },
  {
    type: "image",
    src: "/experiments/velocity-responsive-design/summary3.png",
    alt: "Visual Warp Effects",
  },
  {
    type: "text",
    detailed:
      "The 'Relativistic' terminology isn't just a marketing flourish. As you approach the 'speed of content light' (max scroll speed), your perception of the layout actually shifts. Time (reading time) dilates. Mass (visual weight) increases on images. Length (text block height) contracts. By embracing these physics-inspired themes, we create a UI that feels like it exists in a 4D space rather than just a flat 2D viewport.",
    summary: "Relativistic effects like visual time dilation create 4D depth.",
  },
  {
    type: "text",
    detailed:
      "Visual Inertia refers to the perceived weight and momentum of interface elements. In the Relativistic Reader, elements don't just appear and disappear; they enter the viewport with kinetic energy. High-velocity scrolling causes elements to 'stretch' and 'compress', simulating the physical effects of acceleration. This visual feedback loop helps the user calibrate their own interaction speed, creating a more intuitive navigation experience.",
    summary:
      "Visual Inertia uses kinetic feedback loops for intuitive navigation.",
  },
  {
    type: "image",
    src: "/experiments/velocity-responsive-design/summary4.png",
    alt: "Abstract 3D Motion",
  },
  {
    type: "text",
    detailed:
      "Cognitive Bandwidth is the bottleneck of digital consumption. When we scroll quickly, our brain's processing capacity is redirected from deep comprehension to pattern recognition. VRD respects this shift by providing high-signal summaries that are optimized for peripheral vision. We aren't just hiding content; we are compressing it into a form that matches the user's metabolic rate of information intake.",
    summary:
      "Adaptive summaries optimize for the brain's fluctuating cognitive bandwidth.",
  },
  {
    type: "code",
    filename: "VisualInertia.glsl",
    language: "glsl",
    code: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  float stretch = u_velocity * 0.001;\n  uv.y += sin(uv.x * 10.0) * stretch;\n  gl_FragColor = texture2D(u_texture, uv);\n}",
  },
  {
    type: "image",
    src: "/experiments/velocity-responsive-design/summary5.png",
    alt: "Cinematic Motion Blur",
  },
  {
    type: "text",
    detailed:
      "Kinetic Friction in UI design is the resistance provided by the interface to slow down or steady the user's progress. In VRD, we can simulate friction by increasing the damping of our springs or subtly altering the scroll resistance when important content is reached. This creates 'Visual Speed Bumps' that naturally guide the user towards high-value information without using intrusive modals or popups.",
    summary:
      "Kinetic friction creates natural 'speed bumps' for high-value content.",
  },
  {
    type: "text",
    detailed:
      "The future of the web isn't just about 'mobile-first' or 'AI-first'. It's about 'Human-First' logic—interfaces that are empathetic to the user's current context and physiological state. If I am flinging a page with my thumb, I am telling the software: 'I am in a hurry, show me the highlights.' If I am resting my finger and nudging the screen, I am saying: 'I am interested, teach me.' Responsive design finally has an answer for the speed of thought.",
    summary:
      "Human-First logic creates empathetic interfaces for the speed of thought.",
  },
];
