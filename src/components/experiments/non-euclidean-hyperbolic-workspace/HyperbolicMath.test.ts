import { describe, it, expect } from 'vitest';
import { Complex, mobiusTransform, inverseMobiusTransform, screenToPoincare, poincareToScreen } from './HyperbolicMath';

describe('Complex Number Operations', () => {
    it('should add two complex numbers correctly', () => {
        const a = new Complex(1, 2);
        const b = new Complex(3, 4);
        const result = a.add(b);
        expect(result.re).toBeCloseTo(4);
        expect(result.im).toBeCloseTo(6);
    });

    it('should multiply two complex numbers correctly', () => {
        const a = new Complex(1, 2);
        const b = new Complex(3, 4);
        // (1+2i)(3+4i) = 3 + 4i + 6i + 8i^2 = 3 + 10i - 8 = -5 + 10i
        const result = a.mul(b);
        expect(result.re).toBeCloseTo(-5);
        expect(result.im).toBeCloseTo(10);
    });

    it('should calculate magnitude (abs) correctly', () => {
        const a = new Complex(3, 4);
        expect(a.abs()).toBeCloseTo(5);
    });

    it('should calculate conjugate correctly', () => {
        const a = new Complex(3, 4);
        const conj = a.conj();
        expect(conj.re).toBe(3);
        expect(conj.im).toBe(-4);
    });
});

describe('Möbius Transformations', () => {
    it('should map center to -a (approximately) in inverse transform logic check', () => {
        // Forward: z -> (z-a)/(...)
        // if z=a, result is 0
        const a = new Complex(0.5, 0);
        const z = new Complex(0.5, 0);
        const result = mobiusTransform(z, a);
        expect(result.abs()).toBeCloseTo(0);
    });

    it('should map origin to -a in standard z-a form', () => {
        // mobiusTransform(0, a) = (0 - a) / (1 - 0) = -a
        const a = new Complex(0.5, 0.5);
        const z = new Complex(0, 0);
        const result = mobiusTransform(z, a);
        expect(result.re).toBeCloseTo(-0.5);
        expect(result.im).toBeCloseTo(-0.5);
    });

    it('inverse should reverse the transformation', () => {
        const a = new Complex(0.3, -0.4);
        const z = new Complex(0.1, 0.2);

        const transformed = mobiusTransform(z, a);
        const original = inverseMobiusTransform(transformed, a);

        expect(original.re).toBeCloseTo(z.re);
        expect(original.im).toBeCloseTo(z.im);
    });

    it('should keep points on the boundary on the boundary', () => {
        // Point with mag 1 maps to point with mag 1 (rotates)
        const a = new Complex(0.5, 0);
        const z = new Complex(1, 0); // Boundary point

        const result = mobiusTransform(z, a);
        expect(result.abs()).toBeCloseTo(1);
    });
});

describe('Poincaré Coordinate Utilities', () => {
    it('should clamp out-of-bounds screen coordinates', () => {
        const p = screenToPoincare(2, 2);
        expect(p.abs()).toBeLessThan(1.0);
    });

    it('should round-trip clean coordinates', () => {
        const x = 0.5, y = -0.5;
        const p = screenToPoincare(x, y); // valid inside disk
        const s = poincareToScreen(p);
        expect(s.x).toBeCloseTo(x);
        expect(s.y).toBeCloseTo(y);
    });
});

import { getGeodesicPath } from './HyperbolicMath';

describe('Geodesic Path Generation', () => {
    it('should generate a straight line for points collinear with origin', () => {
        const z1 = new Complex(0.5, 0);
        const z2 = new Complex(-0.5, 0);
        const radius = 100;

        const path = getGeodesicPath(z1, z2, radius);
        // Expect format "M x1 y1 L x2 y2"
        expect(path).toContain('L');
        expect(path).not.toContain('A');

        // Check coordinates (scaled by radius 100)
        // z1 = (50, 0), z2 = (-50, 0)
        expect(path).toContain('M 50.00 0.00');
        expect(path).toContain('L -50.00 0.00');
    });

    it('should generate an arc for points not collinear with origin', () => {
        // Points on the imaginary axis and real axis form a curve
        const z1 = new Complex(0.5, 0);
        const z2 = new Complex(0, 0.5);
        const radius = 100;

        const path = getGeodesicPath(z1, z2, radius);
        // Expect format "M ... A ..."
        expect(path).toContain('A');

        // Start point
        expect(path).toContain('M 50.00 0.00');
        expect(path).toMatch(/50.00$/);
    });

    it('should produce consistent SVG path strings for known points', () => {
        const z1 = new Complex(0.5, 0.1);
        const z2 = new Complex(-0.2, 0.6);
        const radius = 100;

        const path = getGeodesicPath(z1, z2, radius);

        // We verify the structure is M ... A ...
        expect(path).toMatch(/^M -?\d+\.\d+ -?\d+\.\d+ A \d+\.\d+ \d+\.\d+ 0 0 1 -?\d+\.\d+ -?\d+\.\d+$/);

        // Also ensure it didn't fallback to L (Line)
        expect(path).not.toContain('L');
    });
});
