import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import {
  calculateShortestPath,
  normalize,
  progressToIndex,
  TOTAL_FRAMES,
} from "./data";
import { Switcher } from "./Switcher";

// --- Pure function tests ---

describe("normalize", () => {
  test("min maps to 0", () => {
    expect(normalize(1, 1, 6)).toBe(0);
  });

  test("max maps to 1", () => {
    expect(normalize(6, 1, 6)).toBe(1);
  });

  test("midpoint maps to 0.5", () => {
    expect(normalize(3.5, 1, 6)).toBe(0.5);
  });

  test("below min clamps to 0", () => {
    expect(normalize(-5, 1, 6)).toBe(0);
  });

  test("above max clamps to 1", () => {
    expect(normalize(100, 1, 6)).toBe(1);
  });
});

describe("calculateShortestPath", () => {
  test("forward adjacent: 1 -> 2 = +1", () => {
    expect(calculateShortestPath(1, 2)).toBe(1);
  });

  test("backward adjacent: 3 -> 2 = -1", () => {
    expect(calculateShortestPath(3, 2)).toBe(-1);
  });

  test("wrap forward (shortest): 4 -> 1 = +1 (not -3)", () => {
    const result = calculateShortestPath(4, 1);
    expect(result).toBe(1);
  });

  test("wrap backward (shortest): 1 -> 4 = -1 (not +3)", () => {
    const result = calculateShortestPath(1, 4);
    expect(result).toBe(-1);
  });

  test("same state: 3 -> 3 = 0", () => {
    expect(calculateShortestPath(3, 3)).toBe(0);
  });

  test("equidistant with 4 states: 1 -> 3 = +2", () => {
    expect(calculateShortestPath(1, 3)).toBe(2);
  });
});

describe("progressToIndex", () => {
  test("progress 1.0 maps to index 0 (4 sequences)", () => {
    expect(progressToIndex(1)).toBe(0);
  });

  test("progress 5.0 maps to last index (4 sequences)", () => {
    expect(progressToIndex(5)).toBe(TOTAL_FRAMES - 1);
  });

  test("midpoint progress maps to roughly middle index", () => {
    const index = progressToIndex(3);
    expect(index).toBeGreaterThan(30);
    expect(index).toBeLessThan(66);
  });

  test("returns integer indices", () => {
    for (let p = 1; p <= 5; p += 0.25) {
      expect(Number.isInteger(progressToIndex(p))).toBe(true);
    }
  });
});

// --- Component tests ---

describe("Switcher", () => {
  test("renders 4 buttons", () => {
    render(<Switcher activePersona={1} onSelect={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  test("click calls onSelect with correct value", () => {
    let selected = -1;
    render(
      <Switcher
        activePersona={1}
        onSelect={(v) => {
          selected = v;
        }}
      />
    );

    const btn3 = screen.getByLabelText("Persona 3");
    fireEvent.click(btn3);
    expect(selected).toBe(3);
  });

  test("active persona has aria-current", () => {
    render(<Switcher activePersona={2} onSelect={() => {}} />);
    const activeBtn = screen.getByLabelText("Persona 2");
    expect(activeBtn.getAttribute("aria-current")).toBe("true");

    const otherBtn = screen.getByLabelText("Persona 4");
    expect(otherBtn.getAttribute("aria-current")).toBeNull();
  });

  test("displays persona labels", () => {
    render(<Switcher activePersona={1} onSelect={() => {}} />);
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("4")).toBeDefined();
  });
});
