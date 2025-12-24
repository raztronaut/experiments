export { };

/**
 * SIMULATION WORKER
 * -----------------
 * This Web Worker handles the mathematical core of the Game of Life.
 * 
 * By running in a worker, we decouple the simulation tick rate from the main UI thread.
 * Even if the simulation becomes computationally heavy (e.g. valid large grids), the
 * user's scrolling and browser responsiveness remain unaffected.
 */

// Cell States
const ALIVE = 255; // A fully alive cell value
const DEAD = 0;    // A fully dead cell value

/**
 * DECAY_RATE determines the length of the "Ghost Trails".
 * 
 * In standard Conway's Game of Life, cells die instantly (1 -> 0).
 * Here, we use values 0-255. When a cell dies, we don't set it to 0,
 * we subtract this rate.
 * 
 * Value 5 means trails last ~50 frames (255/5), which is nearly 1 second at 60fps.
 * This creates the smooth, comet-like tail effect behind gliders.
 */
const DECAY_RATE = 5;

// Message Types for Type Safety
type WorkerMessage =
    | { type: 'INIT', width: number, height: number }
    | { type: 'TICK' }
    | { type: 'SPLAT', x: number, y: number, radius: number }
    | { type: 'RESET' };

// Internal State
// We use Uint8Array for maximum memory efficiency and cache locality.
// It is significantly faster than standard JS arrays of objects.
let grid: Uint8Array;     // The current state of the universe
let nextGrid: Uint8Array; // The "write buffer" for the next frame
let width: number = 0;
let height: number = 0;

/**
 * Initialize the grid memory buffers.
 */
function initGrid(w: number, h: number) {
    width = w;
    height = h;
    // We add +2 padding to the size (though simplified logic below doesn't use it yet)
    // to potentially allow for easier boundary checking optimizations in future.
    const size = (width + 2) * (height + 2);
    grid = new Uint8Array(size);
    nextGrid = new Uint8Array(size);

    randomize();
}

/**
 * Seed the universe with random chaos.
 */
function randomize() {
    for (let i = 0; i < grid.length; i++) {
        // 15% chance of a cell starting ALIVE
        grid[i] = Math.random() > 0.85 ? ALIVE : DEAD;
    }
}

/**
 * THE MAIN SIMULATION LOOP (TICK)
 * -------------------------------
 * This function computes the Next Generation of the universe based on Conway's 4 Rules.
 */
function tick() {
    if (!grid || !width) return;

    const wReal = width;
    const hReal = height;

    // Optimized Loop traversing y then x for memory locality
    for (let y = 0; y < hReal; y++) {
        // COORDINATE WRAPPING (Toroidal Geometry)
        // We simulate a universe that wraps around edges (Pac-Man style).
        // If you exit the right side, you enter the left. 
        // This preserves "energy" inside the system longer than hard walls.

        // Pre-calculating row offsets helps performance inside the inner loop
        const yUp = ((y - 1 + hReal) % hReal) * wReal;
        const ySame = y * wReal;
        const yDown = ((y + 1) % hReal) * wReal;

        for (let x = 0; x < wReal; x++) {
            const xLeft = (x - 1 + wReal) % wReal;
            const xRight = (x + 1) % wReal;

            // Count Living Neighbors (Moore Neighborhood)
            // Checks all 8 surrounding cells:
            // TL T TR
            //  L . R
            // BL B BR
            let neighbors = 0;

            // Top Row
            if (grid[yUp + xLeft] === ALIVE) neighbors++;
            if (grid[yUp + x] === ALIVE) neighbors++;
            if (grid[yUp + xRight] === ALIVE) neighbors++;

            // Middle Row (Left/Right)
            if (grid[ySame + xLeft] === ALIVE) neighbors++;
            if (grid[ySame + xRight] === ALIVE) neighbors++;

            // Bottom Row
            if (grid[yDown + xLeft] === ALIVE) neighbors++;
            if (grid[yDown + x] === ALIVE) neighbors++;
            if (grid[yDown + xRight] === ALIVE) neighbors++;

            const selfIndex = ySame + x;
            const selfVal = grid[selfIndex];

            // APPLY RULES:
            // 1. Survival: A live cell with 2 or 3 neighbors lives on.
            // 2. Birth: A dead cell with exactly 3 neighbors becomes alive.
            // 3. Death: Overpopulation (>3) or Loneliness (<2) kills the cell.
            // 4. Decay: (Custom Rule) Dead/Dying cells fade out slowly.

            if (selfVal === ALIVE) {
                if (neighbors === 2 || neighbors === 3) {
                    nextGrid[selfIndex] = ALIVE;
                } else {
                    // Rule 3: Death (start decaying)
                    nextGrid[selfIndex] = Math.max(0, selfVal - DECAY_RATE);
                }
            } else {
                if (neighbors === 3) {
                    // Rule 2: Birth
                    nextGrid[selfIndex] = ALIVE;
                } else {
                    // Rule 4: Continue decaying if not fully dead
                    nextGrid[selfIndex] = Math.max(0, selfVal - DECAY_RATE);
                }
            }
        }
    }

    // "Double Buffering": Swap the arrays.
    // `nextGrid` becomes the current `grid` for the next frame.
    // `grid` becomes the scratchpad for the next calculation.
    // This is much faster than creating a new array every frame.
    const temp = grid;
    grid = nextGrid;
    nextGrid = temp;

    // Send the calculated frame back to the Main Thread/UI for rendering
    self.postMessage({ type: 'UPDATE', grid });
}


/**
 * INTERACTION: SPLAT
 * Adds a splash of life at a specific coordinate (e.g., mouse cursor).
 */
function splat(centerX: number, centerY: number, radius: number) {
    if (!grid) return;

    // Add random life in a circular area
    const r2 = radius * radius;

    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            // Circle distance check
            if (x * x + y * y <= r2) {
                // Wrap coordinates logic
                const tX = (centerX + x + width) % width;
                const tY = (centerY + y + height) % height;

                // 50% chance to add life per pixel in the brush
                if (Math.random() > 0.5) {
                    grid[tY * width + tX] = ALIVE;
                }
            }
        }
    }
}

// Global Event Listener for messages from the Main Thread
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const { type } = e.data;

    switch (type) {
        case 'INIT':
            initGrid(e.data.width, e.data.height);
            break;
        case 'TICK':
            tick();
            break;
        case 'SPLAT':
            splat(e.data.x, e.data.y, e.data.radius);
            break;
        case 'RESET':
            randomize();
            break;
    }
};
