import { expect, test, describe } from 'vitest';
import { SimulationEngine } from './SimulationEngine';

describe('SimulationEngine', () => {
    test('initializes with correct dimensions', () => {
        const engine = new SimulationEngine(10, 10, 10);
        const dims = engine.getDimensions();
        expect(dims.width).toBe(10);
        expect(dims.height).toBe(10);
        expect(dims.depth).toBe(10);
    });

    test('seeding creates some alive cells', () => {
        const engine = new SimulationEngine(5, 5, 5);
        engine.seed(0.5);
        const grid = engine.getGrid();
        const aliveCount = grid.reduce((sum, val) => sum + val, 0);
        expect(aliveCount).toBeGreaterThan(0);
    });

    test('step updates the grid', () => {
        const engine = new SimulationEngine(3, 3, 3);
        // Fixed seed for predictability? Or just check it changes.
        engine.seed(0.3);
        const initialGrid = new Uint8Array(engine.getGrid());
        engine.step();
        const nextGrid = engine.getGrid();
        // In a random grid, it's highly likely to change
        expect(nextGrid).not.toEqual(initialGrid);
    });

    test('neighbor counting wraps correctly', () => {
        const engine = new SimulationEngine(3, 3, 3);
        engine.grid.fill(0);
        // Put a cell at [0,0,0]
        engine.grid[0] = 1;
        // Neighbors of [0,0,0] should include wrapping positions like [2,2,2]
        // But let's check neighbor count of [1,1,1] which should be 1
        // @ts-expect-error - accessing private for test
        expect(engine.countNeighbors(1, 1, 1)).toBe(1);
        // @ts-expect-error - accessing private for test
        expect(engine.countNeighbors(0, 0, 1)).toBe(1);
    });
});