import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BLUEPRINT_FACTS, END, HERO, NARRATIVE_SECTIONS } from "./data";

vi.mock("@/lib/toolkit/scroll", () => ({
  createUnifiedScroll: () => ({
    lenis: { on: vi.fn() },
    destroy: vi.fn(),
  }),
}));

vi.mock("gsap", () => {
  const gsap = {
    to: vi.fn(),
    from: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      fromTo: vi.fn().mockReturnThis(),
    })),
    registerPlugin: vi.fn(),
  };
  return { default: gsap, __esModule: true };
});

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    create: vi.fn(),
    refresh: vi.fn(),
  },
}));

vi.mock("@gsap/react", () => ({
  useGSAP: vi.fn(),
}));

vi.mock("./hooks/useAirplaneScene", () => ({
  useAirplaneScene: () => ({
    init: vi.fn().mockResolvedValue(null),
  }),
}));

describe("Airplanes", () => {
  it("renders loading state and all content sections", async () => {
    const { default: Airplanes } = await import("./Airplanes");
    render(<Airplanes />);

    expect(screen.getByText("Loading")).toBeDefined();
    expect(screen.getByText(HERO.title)).toBeDefined();
    expect(screen.getByText(HERO.subtitle)).toBeDefined();
    expect(screen.getByText(HERO.scrollCta)).toBeDefined();
  });

  it("renders all narrative sections from data", async () => {
    const { default: Airplanes } = await import("./Airplanes");
    render(<Airplanes />);

    for (const section of NARRATIVE_SECTIONS) {
      for (const line of section.lines) {
        expect(screen.getByText(line)).toBeDefined();
      }
    }
  });

  it("renders all blueprint facts from data", async () => {
    const { default: Airplanes } = await import("./Airplanes");
    render(<Airplanes />);

    for (const fact of BLUEPRINT_FACTS) {
      expect(screen.getByText(fact.label)).toBeDefined();
      expect(screen.getByText(fact.value)).toBeDefined();
    }
  });

  it("renders credits with external links", async () => {
    const { default: Airplanes } = await import("./Airplanes");
    render(<Airplanes />);

    expect(screen.getByText(END.title)).toBeDefined();

    for (const credit of END.credits) {
      const link = screen.getByText(credit.link.label);
      expect(link).toBeDefined();
      expect(link.getAttribute("href")).toBe(credit.link.href);
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      expect(link.getAttribute("target")).toBe("_blank");
    }
  });
});
