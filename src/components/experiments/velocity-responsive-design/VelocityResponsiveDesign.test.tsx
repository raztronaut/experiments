import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/toolkit/scroll", () => ({
  createUnifiedScroll: () => ({
    lenis: { on: vi.fn(), off: vi.fn(), velocity: 0, scroll: 0 },
    destroy: vi.fn(),
  }),
}));

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    to: vi.fn(),
    set: vi.fn(),
    timeline: vi.fn(() => ({ to: vi.fn(), from: vi.fn() })),
    ticker: {
      add: vi.fn(),
      remove: vi.fn(),
      lagSmoothing: vi.fn(),
    },
  },
  gsap: {
    registerPlugin: vi.fn(),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    refresh: vi.fn(),
    create: vi.fn(),
    getAll: vi.fn(() => []),
    killAll: vi.fn(),
  },
}));

vi.mock("motion/react", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === "div" || prop === "img" || prop === "span") {
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

vi.mock("tempus/react", () => ({
  useTempus: vi.fn(),
}));

const canvasMock = {
  getContext: vi.fn(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    scale: vi.fn(),
    strokeStyle: "",
    lineWidth: 0,
  })),
  width: 1024,
  height: 768,
};

vi.stubGlobal(
  "HTMLCanvasElement",
  class {
    getContext = canvasMock.getContext;
    width = canvasMock.width;
    height = canvasMock.height;
  }
);

describe("VelocityResponsiveDesign", () => {
  it("renders without crashing", async () => {
    const { default: VelocityResponsiveDesign } = await import(
      "./VelocityResponsiveDesign"
    );
    const { container } = render(<VelocityResponsiveDesign />);
    expect(container).toBeTruthy();
  });

  it("renders the header", async () => {
    const { default: VelocityResponsiveDesign } = await import(
      "./VelocityResponsiveDesign"
    );
    const { container } = render(<VelocityResponsiveDesign />);
    const heading = container.querySelector("h1");
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toContain("Relativistic");
  });

  it("renders content items", async () => {
    const { default: VelocityResponsiveDesign } = await import(
      "./VelocityResponsiveDesign"
    );
    const { container } = render(<VelocityResponsiveDesign />);
    const main = container.querySelector("main");
    expect(main).toBeTruthy();
    expect(main?.children.length).toBeGreaterThan(0);
  });
});
