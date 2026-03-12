// ── Complex number ──────────────────────────────────────────────────

export class C {
  constructor(
    public re: number,
    public im: number
  ) {}
  add(o: C) {
    return new C(this.re + o.re, this.im + o.im);
  }
  sub(o: C) {
    return new C(this.re - o.re, this.im - o.im);
  }
  mul(o: C) {
    return new C(
      this.re * o.re - this.im * o.im,
      this.re * o.im + this.im * o.re
    );
  }
  div(o: C) {
    const d = o.re * o.re + o.im * o.im;
    return new C(
      (this.re * o.re + this.im * o.im) / d,
      (this.im * o.re - this.re * o.im) / d
    );
  }
  conj() {
    return new C(this.re, -this.im);
  }
  abs() {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }
  scale(s: number) {
    return new C(this.re * s, this.im * s);
  }
}

const ONE = new C(1, 0);

export function mobius(z: C, a: C): C {
  return z.sub(a).div(ONE.sub(a.conj().mul(z)));
}

// ── Shared constants ────────────────────────────────────────────────

export const DISK_R = 0.45;
export const EDGE_BOUND = 0.98;
export const CLAMP_BOUND = 0.95;
export const BG = "#09090b";
export const PALETTE = ["#f43f5e", "#818cf8", "#a855f7", "#34d399", "#f59e0b"];
export const EDGE_ALPHA = 0.18;
export const LABEL_ALPHA = 0.7;

// ── Canvas helpers ──────────────────────────────────────────────────

export interface CanvasContext {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
}

export function setupCanvas(canvas: HTMLCanvasElement): CanvasContext | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, rect.width, rect.height);
  return { ctx, w: rect.width, h: rect.height };
}

// ── Coordinate transforms ───────────────────────────────────────────

export function diskToCanvas(
  z: C,
  cx: number,
  cy: number,
  r: number
): [number, number] {
  return [cx + z.re * r, cy + z.im * r];
}

export function canvasToDisk(
  px: number,
  py: number,
  cx: number,
  cy: number,
  r: number
): C {
  return new C((px - cx) / r, (py - cy) / r);
}

// ── Disk border ─────────────────────────────────────────────────────

export function drawDiskBorder(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(56,189,248,0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ── Orthogonal circle (geodesic geometry) ───────────────────────────

export interface OrthogonalCircle {
  center: C;
  radius: number;
  inversion: C;
}

/**
 * Compute the unique circle through z1, z2 orthogonal to the unit disk.
 * Returns null when the geodesic is a diameter (points collinear with origin).
 */
export function orthogonalCircle(z1: C, z2: C): OrthogonalCircle | null {
  const cross = z1.re * z2.im - z1.im * z2.re;
  const d = z1.re * z1.re + z1.im * z1.im;
  if (Math.abs(cross) < 1e-6 || d < 1e-9) {
    return null;
  }

  const inv = new C(z1.re / d, z1.im / d);
  const D =
    2 *
    (z1.re * (z2.im - inv.im) +
      z2.re * (inv.im - z1.im) +
      inv.re * (z1.im - z2.im));
  if (Math.abs(D) < 1e-9) {
    return null;
  }

  const n1 = z1.re ** 2 + z1.im ** 2;
  const n2 = z2.re ** 2 + z2.im ** 2;
  const n3 = inv.re ** 2 + inv.im ** 2;
  const cx =
    (n1 * (z2.im - inv.im) + n2 * (inv.im - z1.im) + n3 * (z1.im - z2.im)) / D;
  const cy =
    (n1 * (inv.re - z2.re) + n2 * (z1.re - inv.re) + n3 * (z2.re - z1.re)) / D;
  const R = Math.sqrt((cx - z1.re) ** 2 + (cy - z1.im) ** 2);

  return { center: new C(cx, cy), radius: R, inversion: inv };
}

// ── Geodesic arc drawing ────────────────────────────────────────────

export function geodesicArc(
  ctx: CanvasRenderingContext2D,
  z1: C,
  z2: C,
  cx: number,
  cy: number,
  r: number,
  color: string
) {
  const [x1, y1] = diskToCanvas(z1, cx, cy, r);
  const [x2, y2] = diskToCanvas(z2, cx, cy, r);

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  const circle = orthogonalCircle(z1, z2);
  if (!circle) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    return;
  }

  const { center: cc, radius: R } = circle;
  const [scx, scy] = diskToCanvas(cc, cx, cy, r);
  const sR = R * r;
  const a1 = Math.atan2(y1 - scy, x1 - scx);
  const a2 = Math.atan2(y2 - scy, x2 - scx);
  const crossSweep =
    (z1.re - cc.re) * (z2.im - cc.im) - (z1.im - cc.im) * (z2.re - cc.re);
  ctx.arc(scx, scy, sR, a1, a2, crossSweep <= 0);
  ctx.stroke();
}
