import { SCENARIOS } from './scenarios';
import { describe, it, expect } from 'vitest';

describe('Voronoi Scenarios Interaction Logic', () => {

    describe('Trauma Bay (er-triage)', () => {
        const scenario = SCENARIOS['er-triage'];
        const initialState = scenario.getPoints(1, 1);

        it('should start with Arrival state', () => {
            const startSurvey = initialState.find(p => p.id === 'start_triage');
            expect(startSurvey).toBeDefined();
        });

        it('should transition to Primary Survey on start', () => {
            const startIndex = initialState.findIndex(p => p.id === 'start_triage');
            const nextState = scenario.onInteract(initialState, startIndex);

            // Should now contain Primary Survey items (e.g., airway)
            expect(nextState.some(p => p.id === 'airway_menu')).toBe(true);
            expect(nextState.some(p => p.id === 'breathing_menu')).toBe(true);
            // And SHOULD NOT contain start_triage
            expect(nextState.some(p => p.id === 'start_triage')).toBe(false);
        });

        it('should toggle items in Primary Survey', () => {
            // 1. Get into Primary Survey
            const startIndex = initialState.findIndex(p => p.id === 'start_triage');
            let state = scenario.onInteract(initialState, startIndex);

            // 2. Find Airway
            const airwayIndex = state.findIndex(p => p.id === 'airway_menu');
            expect(airwayIndex).toBeGreaterThan(-1);

            // 3. Toggle disability
            const disabilityIndex = state.findIndex(p => p.id === 'disability');
            const disabilityInitialActive = state[disabilityIndex].isActive;
            state = scenario.onInteract(state, disabilityIndex);

            const disabilityNew = state.find(p => p.id === 'disability');
            expect(disabilityNew?.isActive).toBe(!disabilityInitialActive);
        });
    });

    describe('Smart Home', () => {
        const scenario = SCENARIOS['smart-home'];

        it('should cycle light states', () => {
            const items = scenario.getPoints(1, 1);
            const lightIndex = items.findIndex(p => p.id === 'light');

            // Initial: 50%
            expect(items[lightIndex].value).toBe('50%');

            // Cycle: 50 -> 100
            let state = scenario.onInteract(items, lightIndex);
            expect(state[lightIndex].value).toBe('100%');

            // Cycle: 100 -> Party
            state = scenario.onInteract(state, lightIndex);
            expect(state[lightIndex].value).toBe('Party');

            // Cycle: Party -> Off
            state = scenario.onInteract(state, lightIndex);
            expect(state[lightIndex].value).toBe('Off');
            expect(state[lightIndex].isActive).toBe(false);
        });

        it('should cycle temperature Modes', () => {
            const items = scenario.getPoints(1, 1);
            const tempIndex = items.findIndex(p => p.id === 'temp');

            // Initial: Eco
            expect(items[tempIndex].value).toBe('Eco');

            // Eco -> 72
            let state = scenario.onInteract(items, tempIndex);
            expect(state[tempIndex].value).toBe('72°F');

            // 72 -> 68
            state = scenario.onInteract(state, tempIndex);
            expect(state[tempIndex].value).toBe('68°F');

            // 68 -> 74
            state = scenario.onInteract(state, tempIndex);
            expect(state[tempIndex].value).toBe('74°F');

            // 74 -> Eco
            state = scenario.onInteract(state, tempIndex);
            expect(state[tempIndex].value).toBe('Eco');
        });


        it('should toggle purifier state', () => {
            const initialState = scenario.getPoints(1, 1);
            const airIndex = initialState.findIndex(p => p.id === 'air');
            const nextState = scenario.onInteract(initialState, airIndex);
            const airItem = nextState[airIndex];
            expect(airItem.isActive).toBe(true);
            expect(airItem.value).toBe('Auto');

            const offState = scenario.onInteract(nextState, airIndex);
            expect(offState[airIndex].isActive).toBe(false);
            expect(offState[airIndex].value).toBe('Off');
        });
    });
});
