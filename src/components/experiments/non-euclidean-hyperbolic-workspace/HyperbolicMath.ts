export class Complex {
  constructor(
    public re: number,
    public im: number
  ) {}

  add(other: Complex): Complex {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other: Complex): Complex {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  div(other: Complex): Complex {
    const denom = other.re * other.re + other.im * other.im;
    if (denom === 0) {
      throw new Error("Division by zero");
    }
    return new Complex(
      (this.re * other.re + this.im * other.im) / denom,
      (this.im * other.re - this.re * other.im) / denom
    );
  }

  conj(): Complex {
    return new Complex(this.re, -this.im);
  }

  abs(): number {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  arg(): number {
    return Math.atan2(this.im, this.re);
  }

  static readonly ONE = new Complex(1, 0);
  static readonly ZERO = new Complex(0, 0);
}

/**
 * Applies a Möbius transformation to a point z on the Poincaré disk.
 * transformation: z -> (z - a) / (1 - conj(a) * z)
 * This maps 'a' to the origin (0,0).
 * 'a' conceptually represents the "center" of the view in Poincaré coordinates.
 */
export function mobiusTransform(z: Complex, a: Complex): Complex {
  const num = z.sub(a);
  const den = Complex.ONE.sub(a.conj().mul(z));
  return num.div(den);
}

/**
 * Converts a Complex number on the Poincaré disk to screen coordinates
 * (relative to center, normalized to [-1, 1]).
 */
export function poincareToScreen(z: Complex): { x: number; y: number } {
  return { x: z.re, y: z.im };
}

/**
 * Generates an SVG path command for the geodesic segment connecting two points
 * in the Poincaré disk model.
 *
 * @param z1 Start point (Complex, unit disk)
 * @param z2 End point (Complex, unit disk)
 * @param r  Viewport radius in pixels (to scale the output)
 * @returns SVG 'd' attribute string (e.g., "M x1 y1 A ...")
 */
export function getGeodesicPath(z1: Complex, z2: Complex, r: number): string {
  const p1x = z1.re * r;
  const p1y = z1.im * r;
  const p2x = z2.re * r;
  const p2y = z2.im * r;

  // Check for collinearity with origin (straight line case)
  // Cross product of vectors z1 and z2.
  // If they are collinear with origin, the geodesic is a straight line.
  const cross = z1.re * z2.im - z1.im * z2.re;

  // Threshold for straight line
  if (Math.abs(cross) < 1e-6) {
    return `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} L ${p2x.toFixed(2)} ${p2y.toFixed(2)}`;
  }

  // General case: Arc of a circle orthogonal to the unit disk.
  // To find this circle, we use the property that it passes through z1, z2,
  // and the inverse of z1 relative to the unit circle (z1_inv = 1 / conj(z1)).

  const denom = z1.re * z1.re + z1.im * z1.im;
  if (denom < 1e-9) {
    // z1 is origin, straight line to z2
    return `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} L ${p2x.toFixed(2)} ${p2y.toFixed(2)}`;
  }

  const z1Inv = new Complex(z1.re / denom, z1.im / denom); // 1/conj(z1) = z1/|z1|^2

  // Now find circle passing through z1, z2, z1Inv.
  // Circle equation: |z - c|^2 = R^2
  // This is a standard "Circle from 3 points" problem.
  // Let's use a determinant method or algebraic solver.
  // D = 2(x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2))

  const x1 = z1.re,
    y1 = z1.im;
  const x2 = z2.re,
    y2 = z2.im;
  const x3 = z1Inv.re,
    y3 = z1Inv.im;

  const D = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));

  if (Math.abs(D) < 1e-9) {
    // Points are collinear -> Straight line (should have caught above, but safety fallback)
    return `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} L ${p2x.toFixed(2)} ${p2y.toFixed(2)}`;
  }

  const N1 = x1 * x1 + y1 * y1;
  const N2 = x2 * x2 + y2 * y2;
  const N3 = x3 * x3 + y3 * y3;

  const cx = (N1 * (y2 - y3) + N2 * (y3 - y1) + N3 * (y1 - y2)) / D;
  const cy = (N1 * (x3 - x2) + N2 * (x1 - x3) + N3 * (x2 - x1)) / D;

  const R_unit = Math.sqrt((cx - x1) ** 2 + (cy - y1) ** 2);

  // Convert circle params to screen space
  const R_screen = R_unit * r;

  // SVG Arc: large-arc-flag is 0 (short arc inside the disk).
  // Sweep-flag determined by cross product of (z1-C) x (z2-C) to ensure the
  // arc bows toward the origin (correct geodesic direction).
  const crossSweep = (x1 - cx) * (y2 - cy) - (y1 - cy) * (x2 - cx);
  const sweepFlag = crossSweep > 0 ? 1 : 0;

  return `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} A ${R_screen.toFixed(2)} ${R_screen.toFixed(2)} 0 0 ${sweepFlag} ${p2x.toFixed(2)} ${p2y.toFixed(2)}`;
}
