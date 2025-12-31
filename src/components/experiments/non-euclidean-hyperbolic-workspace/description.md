# Non-Euclidean Hyperbolic Workspace

## Concept
This experiment abandons the standard Euclidean plane of the web browser for **Hyperbolic Geometry**, specifically utilizing the **Poincaré Disk Model**. In this non-Euclidean space, the entire infinite plane is mapped onto a finite unit circle.

## The Math
- **Poincaré Disk**: A model of hyperbolic geometry where "lines" are circular arcs orthogonal to the boundary circle.
- **Möbius Transformations**: Navigation is not simple addition ($x + \Delta x$); it is a complex conformal mapping ($z \mapsto \frac{z - a}{1 - \bar{a}z}$) that preserves angles but distorts distances.
- ** exponential Growth**: The circumference of a halo around a point grows exponentially with radius, allowing for infinite information density at the "horizon" (the edge of the circle).

## Interaction
- **Panning**: Dragging the workspace applies a Möbius transformation to the world, bringing distant (tiny) objects to the center (large) and pushing central objects to the periphery.
- **The Horizon**: Items never leave the screen; they simply tessellate and shrink towards the boundary circle, which represents infinity.
