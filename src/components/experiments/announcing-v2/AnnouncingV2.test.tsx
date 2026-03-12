import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./canvas/CanvasText", () => ({
  CanvasText: () => null,
}));

vi.mock("@/lib/toolkit/scroll", () => ({
  createUnifiedScroll: () => ({
    lenis: { on: vi.fn() },
    destroy: vi.fn(),
  }),
}));

vi.mock("@/lib/toolkit/r3f", () => ({
  ExperimentCanvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas">{children}</div>
  ),
}));

vi.mock("gsap", () => {
  const gsap = {
    to: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      fromTo: vi.fn().mockReturnThis(),
    })),
    registerPlugin: vi.fn(),
    ticker: {
      remove: vi.fn(),
      add: vi.fn(),
      lagSmoothing: vi.fn(),
    },
    updateRoot: vi.fn(),
    utils: { interpolate: vi.fn((a: number) => a) },
  };
  return { default: gsap, __esModule: true };
});

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    create: vi.fn(),
    refresh: vi.fn(),
    batch: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("gsap/CustomEase", () => ({
  CustomEase: { create: vi.fn() },
}));

vi.mock("gsap/SplitText", () => ({
  SplitText: {
    create: vi.fn(() => ({ chars: [], words: [] })),
  },
}));

vi.mock("@/hooks/useGSAPDebug", () => ({
  useGSAPDebug: vi.fn(),
}));

vi.mock("@react-three/fiber", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@react-three/fiber")>();
  return {
    ...actual,
    useFrame: vi.fn(),
    useThree: vi.fn(() => ({
      viewport: { width: 10, height: 10, factor: 1 },
      size: { width: 800, height: 600 },
    })),
    Canvas: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

vi.mock("@react-three/drei", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@react-three/drei")>();
  return {
    ...actual,
    Environment: () => null,
    Float: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Line: () => null,
    MeshDistortMaterial: () => null,
    ScreenQuad: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    useGLTF: Object.assign(
      vi.fn(() => ({
        scene: { position: { sub: vi.fn() } },
      })),
      { preload: vi.fn() }
    ),
  };
});

describe("AnnouncingV2", () => {
  it("renders without crashing", async () => {
    const { default: AnnouncingV2 } = await import("./AnnouncingV2");
    render(<AnnouncingV2 />);
    expect(document.body).toBeTruthy();
  });

  it("renders preloader section", async () => {
    const { default: AnnouncingV2 } = await import("./AnnouncingV2");
    const { container } = render(<AnnouncingV2 />);
    const heroSection = container.querySelector('[aria-label="Hero"]');
    expect(heroSection).toBeTruthy();
  });
});
