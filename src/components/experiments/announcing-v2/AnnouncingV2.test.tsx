import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import AnnouncingV2 from "./AnnouncingV2";
import { MetricsVisualization } from "./components/MetricsVisualization";
import { ToolkitSection } from "./sections/ToolkitSection";

const { destroyScroll, createUnifiedScrollMock } = vi.hoisted(() => {
  const destroy = vi.fn();
  return {
    destroyScroll: destroy,
    createUnifiedScrollMock: vi.fn(() => ({
      destroy,
      lenis: {} as never,
    })),
  };
});

vi.mock("@gsap/react", () => ({
  useGSAP: vi.fn(),
}));

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

vi.mock("next/font/local", () => ({
  default: () => ({
    className: "font-test",
    style: { fontFamily: "Test Font" },
    variable: "font-test-variable",
  }),
}));

vi.mock("next/font/google", () => ({
  Space_Grotesk: () => ({
    className: "font-google-test",
    style: { fontFamily: "Google Test Font" },
    variable: "font-google-test-variable",
  }),
}));

vi.mock("./components/GlobalCanvas", () => ({
  GlobalCanvas: () => null,
}));

vi.mock("@/lib/toolkit/scroll", () => ({
  createUnifiedScroll: createUnifiedScrollMock,
}));

describe("AnnouncingV2", () => {
  beforeEach(() => {
    destroyScroll.mockClear();
    createUnifiedScrollMock.mockClear();
    window.__experimentMetrics = undefined;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders the hero and primary narrative sections", () => {
    render(<AnnouncingV2 />);

    expect(
      screen.getByRole("heading", { level: 1, name: "RAZI'S" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "EXPERIMENTS" })
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Hero" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Manifesto" })
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Toolkit" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Closing" })).toBeInTheDocument();
  });

  test("configures unified scroll for reduced motion users", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<AnnouncingV2 />);

    expect(createUnifiedScrollMock).toHaveBeenCalledWith(
      expect.objectContaining({
        lenisOptions: expect.objectContaining({
          lerp: 1,
          smoothWheel: false,
          syncTouch: false,
        }),
      })
    );
  });

  test("shows an honest waiting state when runtime metrics are unavailable", () => {
    render(<MetricsVisualization />);

    expect(screen.getAllByText("Waiting")).toHaveLength(4);
    expect(screen.getByText("debug only")).toBeInTheDocument();
  });

  test("toolkit rows are keyboard and click accessible", () => {
    render(<ToolkitSection />);

    const lenisButton = screen.getByRole("button", { name: /Lenis/i });
    expect(lenisButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(lenisButton);

    expect(lenisButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/momentum and touch support/i)).toBeInTheDocument();
  });
});
