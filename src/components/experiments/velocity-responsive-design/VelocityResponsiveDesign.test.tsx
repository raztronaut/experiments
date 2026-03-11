import { act, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VelocityEngineConfig } from "./hooks/useVelocityEngine";
import { useVelocityEngine } from "./hooks/useVelocityEngine";

// ---------------------------------------------------------------------------
// Shared mocks for integration test
// ---------------------------------------------------------------------------

vi.mock("@/lib/toolkit/scroll", () => ({
  createUnifiedScroll: () => ({
    lenis: { on: vi.fn(), off: vi.fn(), velocity: 0, scroll: 0 },
    destroy: vi.fn(),
  }),
}));

vi.mock("motion/react", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop === "string") {
          return (props: Record<string, unknown>) => {
            const {
              initial,
              animate,
              exit,
              transition,
              layout,
              whileHover,
              whileTap,
              layoutId,
              ...rest
            } = props;
            return <div {...rest} />;
          };
        }
        return undefined;
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useReducedMotion: () => false,
}));

vi.mock("@/hooks/useDevControls", () => ({
  useDevControls: (
    _folder: string,
    schema: Record<string, { value: unknown }>
  ) => {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(schema)) {
      result[key] = schema[key].value;
    }
    return result;
  },
}));

vi.mock("@/components/ui/AIWidget", () => ({
  AIWidget: () => <div data-testid="ai-widget" />,
}));

vi.mock("tempus/react", () => ({ useTempus: vi.fn() }));

vi.stubGlobal(
  "HTMLCanvasElement",
  class {
    getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      scale: vi.fn(),
      strokeStyle: "",
      lineWidth: 0,
    }));
    width = 1024;
    height = 768;
  }
);

// ---------------------------------------------------------------------------
// useVelocityEngine unit tests
// ---------------------------------------------------------------------------

type LenisHandler = (l: { velocity: number; scroll: number }) => void;

function createMockLenis() {
  const handlers = new Map<string, LenisHandler>();
  return {
    on: vi.fn((event: string, handler: LenisHandler) =>
      handlers.set(event, handler)
    ),
    off: vi.fn((event: string) => handlers.delete(event)),
    fire(velocity: number, scroll = 100) {
      handlers.get("scroll")?.({ velocity, scroll });
    },
    velocity: 0,
    scroll: 0,
  };
}

const DEFAULT_CONFIG: VelocityEngineConfig = {
  velocityScale: 10,
  skimEnter: 500,
  skimExit: 400,
  skimExitDelay: 2500,
  normalizationMax: 3000,
};

describe("useVelocityEngine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts in detailed state with zero velocity", () => {
    const { result } = renderHook(() =>
      useVelocityEngine(null, DEFAULT_CONFIG, {
        reducedMotion: false,
        manualVelocity: null,
      })
    );
    expect(result.current.velocity).toBe(0);
    expect(result.current.readingState).toBe("detailed");
    expect(result.current.isScrolling).toBe(false);
    expect(result.current.normalizedVelocity).toBe(0);
  });

  it("transitions to skim when velocity exceeds skimEnter", () => {
    const lenis = createMockLenis();
    const { result } = renderHook(() =>
      useVelocityEngine(lenis as never, DEFAULT_CONFIG, {
        reducedMotion: false,
        manualVelocity: null,
      })
    );

    act(() => {
      lenis.fire(60);
    }); // 60 * 10 = 600 > 500 (skimEnter)
    expect(result.current.readingState).toBe("skim");
    expect(result.current.velocity).toBe(600);
  });

  it("stays in skim within the hysteresis dead zone", () => {
    const lenis = createMockLenis();
    const { result } = renderHook(() =>
      useVelocityEngine(lenis as never, DEFAULT_CONFIG, {
        reducedMotion: false,
        manualVelocity: null,
      })
    );

    act(() => {
      lenis.fire(60);
    }); // enter skim (600 > 500)
    expect(result.current.readingState).toBe("skim");

    act(() => {
      lenis.fire(45);
    }); // 450 is between exit (400) and enter (500) -- dead zone
    expect(result.current.readingState).toBe("skim");
  });

  it("returns to detailed after sustained drop below skimExit + delay", () => {
    const lenis = createMockLenis();
    const { result } = renderHook(() =>
      useVelocityEngine(lenis as never, DEFAULT_CONFIG, {
        reducedMotion: false,
        manualVelocity: null,
      })
    );

    act(() => {
      lenis.fire(60);
    }); // enter skim
    expect(result.current.readingState).toBe("skim");

    act(() => {
      lenis.fire(30);
    }); // 300 < 400 (skimExit) -- starts exit timer
    expect(result.current.readingState).toBe("skim"); // still skim, timer pending

    act(() => {
      vi.advanceTimersByTime(2500);
    }); // exit delay elapses
    expect(result.current.readingState).toBe("detailed");
  });

  it("cancels exit timer if velocity rises back into dead zone", () => {
    const lenis = createMockLenis();
    const { result } = renderHook(() =>
      useVelocityEngine(lenis as never, DEFAULT_CONFIG, {
        reducedMotion: false,
        manualVelocity: null,
      })
    );

    act(() => {
      lenis.fire(60);
    }); // enter skim
    act(() => {
      lenis.fire(30);
    }); // drop below exit -- start timer
    act(() => {
      vi.advanceTimersByTime(1000);
    }); // partial delay
    act(() => {
      lenis.fire(45);
    }); // back into dead zone -- should cancel exit timer

    act(() => {
      vi.advanceTimersByTime(5000);
    }); // wait way past exit delay
    expect(result.current.readingState).toBe("skim"); // never exited
  });

  it("locks readingState to detailed when reducedMotion is true", () => {
    const lenis = createMockLenis();
    const { result } = renderHook(() =>
      useVelocityEngine(lenis as never, DEFAULT_CONFIG, {
        reducedMotion: true,
        manualVelocity: null,
      })
    );

    act(() => {
      lenis.fire(100);
    }); // 1000 >> skimEnter
    expect(result.current.readingState).toBe("detailed");
    expect(result.current.velocity).toBe(1000);
  });

  it("resets velocity to 0 on idle (no scroll events for 150ms)", () => {
    const lenis = createMockLenis();
    const { result } = renderHook(() =>
      useVelocityEngine(lenis as never, DEFAULT_CONFIG, {
        reducedMotion: false,
        manualVelocity: null,
      })
    );

    act(() => {
      lenis.fire(20);
    }); // 200
    expect(result.current.velocity).toBe(200);

    act(() => {
      vi.advanceTimersByTime(150);
    }); // idle timeout
    expect(result.current.velocity).toBe(0);
  });

  it("uses manualVelocity as the effective velocity when set", () => {
    const { result } = renderHook(() =>
      useVelocityEngine(null, DEFAULT_CONFIG, {
        reducedMotion: false,
        manualVelocity: 1500,
      })
    );

    expect(result.current.velocity).toBe(1500);
    expect(result.current.normalizedVelocity).toBe(0.5);
    expect(result.current.isScrolling).toBe(true);
  });

  it("normalizes velocity to 0-1 range", () => {
    const lenis = createMockLenis();
    const { result } = renderHook(() =>
      useVelocityEngine(lenis as never, DEFAULT_CONFIG, {
        reducedMotion: false,
        manualVelocity: null,
      })
    );

    act(() => {
      lenis.fire(150);
    }); // 1500
    expect(result.current.normalizedVelocity).toBe(0.5);

    act(() => {
      lenis.fire(500);
    }); // 5000 -- capped at 1
    expect(result.current.normalizedVelocity).toBe(1);
  });

  it("ignores scroll events during velocity lock", () => {
    const lenis = createMockLenis();
    const { result } = renderHook(() =>
      useVelocityEngine(lenis as never, DEFAULT_CONFIG, {
        reducedMotion: false,
        manualVelocity: null,
      })
    );

    act(() => {
      result.current.lockVelocity();
    });
    act(() => {
      lenis.fire(100);
    }); // should be ignored
    expect(result.current.velocity).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Integration smoke tests
// ---------------------------------------------------------------------------

describe("VelocityResponsiveDesign", () => {
  it("renders without crashing", async () => {
    const { default: VRD } = await import("./VelocityResponsiveDesign");
    const { container } = render(<VRD />);
    expect(container).toBeTruthy();
  });

  it("renders the header", async () => {
    const { default: VRD } = await import("./VelocityResponsiveDesign");
    const { container } = render(<VRD />);
    const heading = container.querySelector("h1");
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toContain("Relativistic");
  });

  it("renders content items", async () => {
    const { default: VRD } = await import("./VelocityResponsiveDesign");
    const { container } = render(<VRD />);
    const main = container.querySelector("main");
    expect(main).toBeTruthy();
    expect(main?.children.length).toBeGreaterThan(0);
  });
});
