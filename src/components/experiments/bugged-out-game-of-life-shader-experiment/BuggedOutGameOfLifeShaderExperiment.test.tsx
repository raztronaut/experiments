import { test, vi } from 'vitest';
import { render } from '@testing-library/react';
import BuggedOutGameOfLifeShaderExperiment from './BuggedOutGameOfLifeShaderExperiment';

// Mock GradientBackground to avoid WebGL errors in JSDOM
vi.mock('./GradientBackground', () => ({
    GradientBackground: () => <div data-testid="gradient-background" />
}));

test('Bugged Out Game of Life Shader renders correctly', () => {
    // Mock Worker for the test environment
    if (typeof globalThis !== 'undefined' && !globalThis.Worker) {
        globalThis.Worker = class {
            onmessage = vi.fn();
            postMessage = vi.fn();
            terminate = vi.fn();
        } as unknown as typeof Worker;
    }

    render(<BuggedOutGameOfLifeShaderExperiment />);
});