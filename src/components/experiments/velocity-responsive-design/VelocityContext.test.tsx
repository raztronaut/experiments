import { expect, test, describe, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { VelocityProvider, useVelocityState } from './VelocityContext';
import React from 'react';
import { VELOCITY_THRESHOLDS, TIMINGS } from './constants';

// Mock framer-motion's useVelocity and useScroll
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        useScroll: () => ({ scrollY: { get: () => 0, on: () => () => { } } }),
        useVelocity: () => ({ get: () => 0, on: () => () => { } }),
        useSpring: () => ({
            get: () => 0,
            on: (event: string, callback: (v: number) => void) => {
                if (event === 'change') {
                    // Expose the callback to simulate changes
                    (global as typeof globalThis & { simulateVelocityChange?: (v: number) => void }).simulateVelocityChange = callback;
                }
                return () => { };
            }
        }),
    };
});

describe('VelocityContext Logic', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <VelocityProvider>{children}</VelocityProvider>
    );

    test('should initialize with detailed state', () => {
        const { result } = renderHook(() => useVelocityState(), { wrapper });
        expect(result.current.readingState).toBe('detailed');
    });

    const simulateChange = (v: number) => {
        const globalObj = global as typeof globalThis & { simulateVelocityChange: (v: number) => void };
        globalObj.simulateVelocityChange(v);
    };

    test('should enter skim mode when velocity exceeds threshold', () => {
        const { result } = renderHook(() => useVelocityState(), { wrapper });

        act(() => {
            simulateChange(VELOCITY_THRESHOLDS.SKIM_ENTER + 100);
        });

        expect(result.current.readingState).toBe('skim');
    });

    test('should stay in skim mode when velocity drops below exit threshold but within delay', () => {
        const { result } = renderHook(() => useVelocityState(), { wrapper });

        // Enter skim mode
        act(() => {
            simulateChange(VELOCITY_THRESHOLDS.SKIM_ENTER + 100);
        });
        expect(result.current.readingState).toBe('skim');

        // Drop velocity
        act(() => {
            simulateChange(VELOCITY_THRESHOLDS.SKIM_EXIT - 50);
        });

        // Should still be in skim mode due to timer
        expect(result.current.readingState).toBe('skim');

        // Advance timers by half the delay
        act(() => {
            vi.advanceTimersByTime(TIMINGS.SKIM_EXIT_DELAY / 2);
        });
        expect(result.current.readingState).toBe('skim');

        // Advance timers past the delay
        act(() => {
            vi.advanceTimersByTime(TIMINGS.SKIM_EXIT_DELAY / 2 + 100);
        });
        expect(result.current.readingState).toBe('detailed');
    });

    test('should cancel exit timer if velocity spikes again', () => {
        const { result } = renderHook(() => useVelocityState(), { wrapper });

        // Enter skim mode
        act(() => {
            simulateChange(VELOCITY_THRESHOLDS.SKIM_ENTER + 100);
        });

        // Drop velocity to trigger exit timer
        act(() => {
            simulateChange(VELOCITY_THRESHOLDS.SKIM_EXIT - 50);
        });

        // Advance timers halfway
        act(() => {
            vi.advanceTimersByTime(TIMINGS.SKIM_EXIT_DELAY / 2);
        });
        expect(result.current.readingState).toBe('skim');

        // Spike velocity again
        act(() => {
            simulateChange(VELOCITY_THRESHOLDS.SKIM_ENTER + 100);
        });

        // Advance timers past the original delay
        act(() => {
            vi.advanceTimersByTime(TIMINGS.SKIM_EXIT_DELAY);
        });

        // Should STILL be in skim mode because the timer should have been cleared/reset
        expect(result.current.readingState).toBe('skim');
    });
});
