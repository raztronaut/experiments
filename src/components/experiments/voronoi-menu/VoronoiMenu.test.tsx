import { expect, test, describe, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VoronoiMenu from './VoronoiMenu';

// Mock ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Mock layout dimensions for JSDOM
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1000 });
Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 800 });

// Mock VoronoiCanvas to avoid complex d3/canvas operations in tests
vi.mock('./VoronoiCanvas', () => ({
    VoronoiCanvas: () => <div data-testid="voronoi-canvas-mock" />
}));

describe('VoronoiMenu Integration', () => {
    test('renders correctly and defaults to Smart Home', async () => {
        render(<VoronoiMenu />);
        // Check if error boundary caught distinct error
        const error = screen.queryByText(/Something went wrong/i);
        if (error) {
            console.error('Error Boundary Triggered');
            screen.debug();
            throw new Error('Component crashed');
        }

        // "Trauma Bay 1" is the title for default er-triage
        const headings = await screen.findAllByText(/Trauma Bay 1/i);
        expect(headings.length).toBeGreaterThanOrEqual(1);
        expect(await screen.findByText(/ATLS Primary Survey Sim/i)).toBeDefined();
    });

    test('switches scenarios when buttons are clicked', async () => {
        render(<VoronoiMenu />);

        // Find and click 'Residence Control'
        const smartHomeBtn = await screen.findByText('Residence Control');
        fireEvent.click(smartHomeBtn);

        // Expect title to change
        // Expect title to change (Button + H1)
        const titles = await screen.findAllByText(/Residence Control/i);
        expect(titles.length).toBeGreaterThanOrEqual(2);
        // Expect subtitle to change
        expect(await screen.findByText(/IoT Mesh Network/i)).toBeDefined();
    });

    test('renders Sidebar interactions', () => {
        render(<VoronoiMenu />);
        // Default is Trauma Bay 1
        // It has "HR" label
        expect(screen.getByText('HR')).toBeDefined();
    });


});