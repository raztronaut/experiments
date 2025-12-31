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

## Controls
- **Mouse Drag**: Pan the view (apply Möbius transformation).
- **Arrow Keys**: Pan the view with keyboard for precision control.
- **Click Tile**: (Placeholder) Interaction with nodes.

## How it works: Procedural Generation
The knowledge graph is generated procedurally using a **Radial Tree Layout** adapted for the Poincaré disk:
1.  **Layers**: Nodes are assigned to concentric layers at specific radii (e.g., `0.4`, `0.7`, `0.88`). In hyperbolic space, circumference grows exponentially, allowing for more nodes in outer layers without crowding.
2.  **Sector Assignment**: Each child node is assigned an angular sector within its parent's wedge.
3.  **Jitter**: Random angular jitter is added to create an organic, "mind-map" feel rather than a rigid grid.
4.  **Icons**: Nodes are procedurally assigned types (Area, Project, Note) and icons based on their hierarchy level.

## Developer Notes: HyperbolicMath Utility
The core geometry logic is isolated in `HyperbolicMath.ts`. Key concepts for contributors:
-   **`Complex` Class**: Basic arithmetic (`add`, `sub`, `mul`, `div`) and properties (`abs`, `arg`, `conj`) for complex numbers $z = x + iy$.
-   **`mobiusTransform(z, a)`**: The primary "camera" operation. Maps point $a$ to the origin. If you want to center the view on node $N$, you apply $T(z) = \frac{z - N_{pos}}{1 - \bar{N}_{pos}z}$ to all points.
-   **`getGeodesicPath(z1, z2)`**: Calculates the SVG path data for the shortest line between two points. In the Poincaré disk, this is usually an circular arc orthogonal to the boundary.
-   **`screenToPoincare` / `poincareToScreen`**: Utilities to map between the unit disk model (math space) and normalized DOM coordinates.
