import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMobileBlocker } from "./MobileBlocker";

describe("useMobileBlocker", () => {
  beforeEach(() => {
    vi.stubGlobal("innerWidth", 1024);
    window.dispatchEvent(new Event("resize"));
  });

  it("should return false when window width is 1024 (desktop)", () => {
    const { result } = renderHook(() => useMobileBlocker());
    expect(result.current).toBe(false);
  });

  it("should return true when window width is 375 (mobile)", () => {
    vi.stubGlobal("innerWidth", 375);
    const { result } = renderHook(() => useMobileBlocker());

    // Initial check
    expect(result.current).toBe(true);
  });

  it("should update when window is resized", () => {
    const { result } = renderHook(() => useMobileBlocker());
    expect(result.current).toBe(false);

    act(() => {
      vi.stubGlobal("innerWidth", 375);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(true);

    act(() => {
      vi.stubGlobal("innerWidth", 1024);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(false);
  });
});
