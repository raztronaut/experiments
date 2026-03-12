# Snippet: Hyperbolic Geometry Utilities

Standalone complex number arithmetic, Möbius transforms, and geodesic path generation for the Poincaré disk model.

## Install

No external dependencies. Copy `HyperbolicMath.ts` directly.

## Usage

```typescript
import { Complex, mobiusTransform, getGeodesicPath } from "./HyperbolicMath";

// Create points on the Poincaré disk (must be inside the unit circle)
const center = new Complex(0.3, 0.2);
const point = new Complex(-0.4, 0.5);

// Navigate: transform all points so `center` becomes the origin
const transformed = mobiusTransform(point, center);

// Compute a geodesic SVG path between two points
const svgRadius = 150; // pixels
const pathData = getGeodesicPath(point, center, svgRadius);
// Returns: "M ... A ..." (SVG path `d` attribute)

// Conformal scale factor at a transformed position
const scale = Math.max(0, 1 - transformed.abs() ** 2);
```

## API

### `Complex`

| Method | Signature | Description |
|---|---|---|
| `constructor` | `(re: number, im: number)` | Create a complex number |
| `add` | `(other: Complex) → Complex` | Addition |
| `sub` | `(other: Complex) → Complex` | Subtraction |
| `mul` | `(other: Complex) → Complex` | Multiplication |
| `div` | `(other: Complex) → Complex` | Division (throws on zero) |
| `conj` | `() → Complex` | Complex conjugate |
| `abs` | `() → number` | Absolute value (modulus) |
| `arg` | `() → number` | Argument (angle) |

Static: `Complex.ONE`, `Complex.ZERO`

### `mobiusTransform(z, a)`

Maps point `a` to the origin on the Poincaré disk: `z → (z - a) / (1 - conj(a)·z)`.

- Preserves angles (conformal)
- Maps the unit disk to itself
- Maps the boundary circle to itself
- Composable: `mobiusTransform(mobiusTransform(z, a), b)` is a valid Möbius transform

### `getGeodesicPath(z1, z2, r)`

Returns an SVG `d` attribute string for the geodesic (shortest path) between two points on the Poincaré disk, scaled to viewport radius `r`.

- Handles the collinear case (straight line through origin)
- Computes the orthogonal circle via 3-point construction
- Uses the inversion point `1/conj(z1)` to guarantee orthogonality

## Gotchas

- **All points must be inside the unit disk** (`z.abs() < 1`). The Möbius transform is undefined on the boundary.
- **Numerical stability**: Points very close to the boundary (`abs > 0.99`) can produce large intermediate values. The experiment culls nodes at `scale < 0.05` (roughly `abs > 0.97`).
- **The transform is not commutative**: `mobiusTransform(z, a)` ≠ `mobiusTransform(a, z)` in general.
- **Division by zero**: `Complex.div` throws if the denominator is zero. The Möbius transform denominator `1 - conj(a)·z` is zero only when `z` is on the boundary and `a` is the inversion of `z` — which shouldn't happen with valid disk-interior points.
