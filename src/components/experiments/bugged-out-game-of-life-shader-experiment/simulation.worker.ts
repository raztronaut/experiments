
/**
 * SIMULATION WORKER
 * -----------------
 * This Web Worker handles the mathematical core of the Game of Life.
 */

// Cell States
const ALIVE = 255;
const DEAD = 0;

// Age Parameters
const MAX_AGE = 255;

/**
 * DECAY_RATE determines the length of the "Ghost Trails".
 * Slightly increased for smoother visual transitions.
 */
const DECAY_RATE = 4;

// Internal State
let grid: Uint8Array;
let nextGrid: Uint8Array;
let ageGrid: Uint8Array;
let nextAgeGrid: Uint8Array;

let width: number = 0;
let height: number = 0;

/**
 * Initialize the grid memory buffers.
 */
function initGrid(w: number, h: number) {
    width = w;
    height = h;
    const size = width * height;

    grid = new Uint8Array(size);
    nextGrid = new Uint8Array(size);
    ageGrid = new Uint8Array(size);
    nextAgeGrid = new Uint8Array(size);

    randomize();
}

/**
 * Seed the universe with random chaos.
 */
function randomize() {
    for (let i = 0; i < grid.length; i++) {
        const isAlive = Math.random() > 0.85;
        grid[i] = isAlive ? ALIVE : DEAD;
        ageGrid[i] = 0;
    }
}

/**
 * THE MAIN SIMULATION LOOP (TICK)
 * 
 * Logic Repair: Neighbor counting now considers "mostly alive" cells (> 128)
 * as neighbors. This makes the simulation much more robust to decaying trails.
 */
function tick() {
    if (!grid || !width) return;

    const wReal = width;
    const hReal = height;

    // Stats calculation
    let totalAlive = 0;
    let totalBirths = 0;
    let sumX = 0;
    let sumY = 0;

    for (let y = 0; y < hReal; y++) {
        const yUp = ((y - 1 + hReal) % hReal) * wReal;
        const ySame = y * wReal;
        const yDown = ((y + 1) % hReal) * wReal;

        for (let x = 0; x < wReal; x++) {
            const xLeft = (x - 1 + wReal) % wReal;
            const xRight = (x + 1) % wReal;

            // Neighbor counting with fuzzy logic (counting trails)
            let neighbors = 0;
            if (grid[yUp + xLeft] > 128) neighbors++;
            if (grid[yUp + x] > 128) neighbors++;
            if (grid[yUp + xRight] > 128) neighbors++;
            if (grid[ySame + xLeft] > 128) neighbors++;
            if (grid[ySame + xRight] > 128) neighbors++;
            if (grid[yDown + xLeft] > 128) neighbors++;
            if (grid[yDown + x] > 128) neighbors++;
            if (grid[yDown + xRight] > 128) neighbors++;

            const selfIndex = ySame + x;
            const selfVal = grid[selfIndex];
            const selfAge = ageGrid[selfIndex];

            // CONWAY RULES
            if (selfVal === ALIVE) {
                if (neighbors === 2 || neighbors === 3) {
                    nextGrid[selfIndex] = ALIVE;
                    nextAgeGrid[selfIndex] = Math.min(MAX_AGE, selfAge + 1);
                } else {
                    nextGrid[selfIndex] = Math.max(0, selfVal - DECAY_RATE);
                    nextAgeGrid[selfIndex] = 0;
                }
            } else {
                if (neighbors === 3) {
                    nextGrid[selfIndex] = ALIVE;
                    nextAgeGrid[selfIndex] = 0;
                } else {
                    nextGrid[selfIndex] = Math.max(0, selfVal - DECAY_RATE);
                    nextAgeGrid[selfIndex] = 0;
                }
            }

            // Stats update
            if (nextGrid[selfIndex] === ALIVE) {
                totalAlive++;
                sumX += x;
                sumY += y;
                if (nextAgeGrid[selfIndex] === 0) {
                    totalBirths++;
                }
            }
        }
    }

    const totalCells = wReal * hReal;
    const stats = {
        density: totalAlive / totalCells,
        activity: totalBirths / Math.max(1, totalAlive),
        centroidX: totalAlive > 0 ? sumX / totalAlive / wReal : 0.5,
        centroidY: totalAlive > 0 ? sumY / totalAlive / hReal : 0.5
    };

    const tempGrid = grid;
    grid = nextGrid;
    nextGrid = tempGrid;

    const tempAge = ageGrid;
    ageGrid = nextAgeGrid;
    nextAgeGrid = tempAge;

    self.postMessage({ type: 'UPDATE', grid, ageGrid, stats });
}

function splat(centerX: number, centerY: number, radius: number) {
    if (!grid) return;
    const r2 = radius * radius;
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            if (x * x + y * y <= r2) {
                const tX = (centerX + x + width) % width;
                const tY = (centerY + y + height) % height;
                if (Math.random() > 0.5) {
                    const idx = tY * width + tX;
                    grid[idx] = ALIVE;
                    ageGrid[idx] = 0;
                }
            }
        }
    }
}

self.onmessage = (e: MessageEvent) => {
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
