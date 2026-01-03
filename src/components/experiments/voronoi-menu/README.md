# Voronoi Menu Experiment

An interactive research prototype demonstrating **Fitts's Law** optimization using Voronoi tessellation. In this menu, the active area for each item is defined by the mathematical proximity to the point, rather than a fixed bounding box. This theoretically allows for faster target acquisition.

## Architecture

- **`VoronoiMenu.tsx`**: The main orchestrator. Handles input, finding the nearest neighbor, and rendering the canvas overlay.
- **`useVoronoi.ts`**: React hook encapsulating the D3-Delaunay math. 
  - Validates points for potential collisions (overlaps).
  - Generates the Delaunay triangulation.
  - Generates the Voronoi diagram.
  - Provides O(1) `findNearest` lookups.
- **`scenarios/`**: Contains the logic for different use cases (Smart Home, Medical, etc.). Each scenario provides:
  - `getPoints(w, h)`: Initial layout.
  - `onInteract(items, index)`: Pure reducer-like state transition.
  - `SidebarComponent`: The visual simulation.

## Key Concepts

### 1. Fitts's Law Application
By using Voronoi cells, we ensure that the "clickable area" for any button expands indefinitely into empty space until it hits the boundary of another button's cell. This maximizes the $W$ (Width) term in Fitts's Law ($T = a + b \log_2(2D/W)$), reducing the index of difficulty.

### 2. Geometry & Collision
Points are defined in a normalized coordinate space (0-1).
- `(0,0)` is Top-Left.
- `(1,1)` is Bottom-Right.
- **Note**: If two points are too close (< 0.05 normalized distance), the hook will warn in development, as this creates tiny, hard-to-hit cells that violate the usability goals.

## Development

### Adding a New Scenario
1. Define a new `ScenarioType` in `scenarios/types.ts`.
2. Create a new file `scenarios/my-scenario.tsx`.
3. Export a `ScenarioConfig` object implementing `getPoints`, `onInteract`, and `SidebarComponent`.
4. Register it in `SCENARIOS` in `scenarios/index.ts`.

### Reliability
The sidebar simulation is wrapped in an **Error Boundary**. If a specific scenario crashes (e.g., due to a canvas error), the rest of the app will remain stable, and the user can reload the scenario.
