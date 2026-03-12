import { describe, expect, it } from "vitest";
import {
  Complex,
  getGeodesicPath,
  mobiusTransform,
  poincareToScreen,
} from "./HyperbolicMath";

describe("Complex", () => {
  it("adds two complex numbers", () => {
    const a = new Complex(1, 2);
    const b = new Complex(3, 4);
    const result = a.add(b);
    expect(result.re).toBe(4);
    expect(result.im).toBe(6);
  });

  it("subtracts two complex numbers", () => {
    const result = new Complex(5, 3).sub(new Complex(2, 1));
    expect(result.re).toBe(3);
    expect(result.im).toBe(2);
  });

  it("multiplies two complex numbers", () => {
    // (1+2i)(3+4i) = 3 + 4i + 6i + 8i^2 = 3 + 10i - 8 = -5 + 10i
    const result = new Complex(1, 2).mul(new Complex(3, 4));
    expect(result.re).toBe(-5);
    expect(result.im).toBe(10);
  });

  it("divides two complex numbers", () => {
    // (1+2i)/(1+0i) = 1+2i
    const result = new Complex(1, 2).div(new Complex(1, 0));
    expect(result.re).toBeCloseTo(1);
    expect(result.im).toBeCloseTo(2);
  });

  it("throws on division by zero", () => {
    expect(() => new Complex(1, 0).div(new Complex(0, 0))).toThrow(
      "Division by zero"
    );
  });

  it("computes conjugate", () => {
    const result = new Complex(3, -7).conj();
    expect(result.re).toBe(3);
    expect(result.im).toBe(7);
  });

  it("computes absolute value", () => {
    expect(new Complex(3, 4).abs()).toBeCloseTo(5);
    expect(new Complex(0, 0).abs()).toBe(0);
  });

  it("computes argument", () => {
    expect(new Complex(1, 0).arg()).toBeCloseTo(0);
    expect(new Complex(0, 1).arg()).toBeCloseTo(Math.PI / 2);
    expect(new Complex(-1, 0).arg()).toBeCloseTo(Math.PI);
  });

  it("provides static ONE and ZERO", () => {
    expect(Complex.ONE.re).toBe(1);
    expect(Complex.ONE.im).toBe(0);
    expect(Complex.ZERO.re).toBe(0);
    expect(Complex.ZERO.im).toBe(0);
  });
});

describe("mobiusTransform", () => {
  it("maps the center 'a' to the origin", () => {
    const a = new Complex(0.3, 0.4);
    const result = mobiusTransform(a, a);
    expect(result.re).toBeCloseTo(0, 10);
    expect(result.im).toBeCloseTo(0, 10);
  });

  it("maps the origin to -a when a is the center", () => {
    const a = new Complex(0.3, 0.0);
    const result = mobiusTransform(Complex.ZERO, a);
    // M_a(0) = (0 - a)/(1 - conj(a)*0) = -a
    expect(result.re).toBeCloseTo(-0.3);
    expect(result.im).toBeCloseTo(0);
  });

  it("is an identity when a = 0", () => {
    const z = new Complex(0.5, 0.3);
    const result = mobiusTransform(z, Complex.ZERO);
    expect(result.re).toBeCloseTo(0.5);
    expect(result.im).toBeCloseTo(0.3);
  });

  it("preserves the unit disk (|result| < 1 for |z| < 1)", () => {
    const z = new Complex(0.7, 0.5);
    const a = new Complex(-0.2, 0.6);
    const result = mobiusTransform(z, a);
    expect(result.abs()).toBeLessThan(1);
  });

  it("preserves angles (conformal): maps boundary to boundary", () => {
    // A point on the unit circle should map to a point on the unit circle
    const angle = Math.PI / 4;
    const z = new Complex(Math.cos(angle), Math.sin(angle));
    const a = new Complex(0.3, 0.2);
    const result = mobiusTransform(z, a);
    expect(result.abs()).toBeCloseTo(1, 5);
  });
});

describe("poincareToScreen", () => {
  it("converts complex to screen coordinates", () => {
    const result = poincareToScreen(new Complex(0.5, -0.3));
    expect(result.x).toBe(0.5);
    expect(result.y).toBe(-0.3);
  });
});

describe("getGeodesicPath", () => {
  it("returns straight line for collinear points", () => {
    const z1 = new Complex(0.2, 0);
    const z2 = new Complex(0.8, 0);
    const path = getGeodesicPath(z1, z2, 300);
    expect(path).toMatch(/^M .+ L .+$/);
  });

  it("returns arc for non-collinear points", () => {
    const z1 = new Complex(0.3, 0.2);
    const z2 = new Complex(-0.1, 0.5);
    const path = getGeodesicPath(z1, z2, 300);
    expect(path).toMatch(/^M .+ A .+$/);
  });

  it("produces orthogonal geodesic circle (center satisfies |C|^2 = R^2 + 1)", () => {
    const z1 = new Complex(0.5, 0.3);
    const z2 = new Complex(-0.2, 0.4);
    const path = getGeodesicPath(z1, z2, 1);

    // Parse the arc: M x1 y1 A R R 0 0 sweep x2 y2
    const parts = path.split(/\s+/);
    expect(parts[0]).toBe("M");
    expect(parts[3]).toBe("A");

    const R = Number.parseFloat(parts[4]);

    // Reconstruct center from the three-point circle
    const denom = z1.re * z1.re + z1.im * z1.im;
    const z1Inv = new Complex(z1.re / denom, z1.im / denom);

    const x1 = z1.re,
      y1p = z1.im;
    const x2 = z2.re,
      y2 = z2.im;
    const x3 = z1Inv.re,
      y3 = z1Inv.im;

    const D = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1p) + x3 * (y1p - y2));
    const N1 = x1 * x1 + y1p * y1p;
    const N2 = x2 * x2 + y2 * y2;
    const N3 = x3 * x3 + y3 * y3;

    const cx = (N1 * (y2 - y3) + N2 * (y3 - y1p) + N3 * (y1p - y2)) / D;
    const cy = (N1 * (x3 - x2) + N2 * (x1 - x3) + N3 * (x2 - x1)) / D;

    const centerDistSq = cx * cx + cy * cy;

    // For a circle orthogonal to the unit circle: |C|^2 = R^2 + 1
    // Precision limited by .toFixed(2) rounding in SVG path output
    expect(centerDistSq).toBeCloseTo(R * R + 1, 1);
  });

  it("returns straight line when z1 is at origin", () => {
    const z1 = new Complex(0, 0);
    const z2 = new Complex(0.5, 0.5);
    const path = getGeodesicPath(z1, z2, 300);
    expect(path).toMatch(/^M .+ L .+$/);
  });
});
