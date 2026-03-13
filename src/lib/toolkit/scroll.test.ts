import { beforeEach, describe, expect, it, vi } from "vitest";

const gsap = {
  registerPlugin: vi.fn(),
  updateRoot: vi.fn(),
  ticker: {
    remove: vi.fn(),
    add: vi.fn(),
    lagSmoothing: vi.fn(),
  },
};

const scrollTrigger = {
  update: vi.fn(),
  create: vi.fn(() => ({ kill: vi.fn() })),
};

const tempusAdd = vi.fn(
  (_cb: (time: number) => void, _opts?: { priority?: number }) => vi.fn()
);

const lenisInstances: LenisMock[] = [];
class LenisMock {
  on = vi.fn();
  off = vi.fn();
  raf = vi.fn();
  destroy = vi.fn();
  scrollTo = vi.fn();
  options: unknown;

  constructor(options?: unknown) {
    this.options = options;
    lenisInstances.push(this);
  }
}

vi.mock("gsap", () => ({ default: gsap, __esModule: true }));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: scrollTrigger }));
vi.mock("tempus", () => ({
  default: { add: tempusAdd },
  __esModule: true,
}));
vi.mock("lenis", () => ({ default: LenisMock, __esModule: true }));

async function loadModule() {
  vi.resetModules();
  return import("./scroll");
}

beforeEach(() => {
  lenisInstances.length = 0;
  vi.clearAllMocks();
});

describe("createUnifiedScroll", () => {
  it("restores GSAP lagSmoothing defaults when destroyed", async () => {
    const { createUnifiedScroll } = await loadModule();

    const handle = createUnifiedScroll();

    expect(gsap.ticker.remove).toHaveBeenCalledWith(gsap.updateRoot);
    expect(gsap.ticker.lagSmoothing).toHaveBeenNthCalledWith(1, 0);

    handle.destroy();

    expect(gsap.ticker.add).toHaveBeenCalledWith(gsap.updateRoot);
    expect(gsap.ticker.lagSmoothing).toHaveBeenNthCalledWith(2, 500, 33);
    expect(lenisInstances[0]?.destroy).toHaveBeenCalledTimes(1);
  });

  it("keeps GSAP binding alive until the last instance is destroyed", async () => {
    const { createUnifiedScroll } = await loadModule();

    const first = createUnifiedScroll();
    const second = createUnifiedScroll();

    first.destroy();

    expect(gsap.ticker.add).not.toHaveBeenCalled();
    expect(gsap.ticker.lagSmoothing).toHaveBeenCalledTimes(1);

    second.destroy();

    expect(gsap.ticker.add).toHaveBeenCalledTimes(1);
    expect(gsap.ticker.lagSmoothing).toHaveBeenNthCalledWith(2, 500, 33);
  });
});
