import { renderHook } from '@testing-library/react';
import { useVoronoi, Point } from './useVoronoi';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock console.warn to check for validation messages
const originalWarn = console.warn;
beforeEach(() => {
    console.warn = vi.fn();
});
afterEach(() => {
    console.warn = originalWarn;
});

describe('useVoronoi', () => {
    const mockPoints: Point[] = [
        { id: '1', x: 20, y: 20, label: 'P1' },
        { id: '2', x: 80, y: 80, label: 'P2' },
        { id: '3', x: 50, y: 50, label: 'P3' },
    ];

    it('should generate delaunay and voronoi diagrams', () => {
        const { result } = renderHook(() => useVoronoi(mockPoints, 100, 100));

        expect(result.current.delaunay).not.toBeNull();
        expect(result.current.voronoi).not.toBeNull();
    });

    it('should find nearest neighbor correctly', () => {
        const { result } = renderHook(() => useVoronoi(mockPoints, 100, 100));

        // Point near P1 (20, 20)
        expect(result.current.findNearest(21, 21)).toBe(0); // Index of P1

        // Point near P2 (80, 80)
        expect(result.current.findNearest(79, 79)).toBe(1); // Index of P2
    });

    it('should handle zero dimensions without crashing', () => {
        const { result } = renderHook(() => useVoronoi(mockPoints, 0, 0));

        expect(result.current.delaunay).toBeNull();
        expect(result.current.voronoi).toBeNull();
        expect(result.current.findNearest(10, 10)).toBeNull();
    });

    // NOTE: This test requires process.env.NODE_ENV !== 'production' to work as per implementation
    it('should warn on colliding points', () => {
        const collidingPoints: Point[] = [
            { id: 'a', x: 0.5, y: 0.5, label: 'A' },
            { id: 'b', x: 0.501, y: 0.501, label: 'B' }, // Very close
        ];

        renderHook(() => useVoronoi(collidingPoints, 100, 100));

        // We expect console.warn to have been called if validation logic is active
        // Check implementation environment logic if this fails
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Potential overlap detected'));
        }
    });
});
