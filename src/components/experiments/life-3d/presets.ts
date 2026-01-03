import { Life3dRules } from './SimulationEngine';

export const PRESETS: Record<string, { label: string, rules: Life3dRules, density: number }> = {
    neural: {
        label: 'Neural Net',
        rules: { survival: [4, 5], birth: [5] }, // B5/S4,5
        density: 0.15
    },
    amoeba: {
        label: 'Organic Amoeba',
        rules: { survival: [5, 6, 7], birth: [6] }, // B6/S5,6,7
        density: 0.12
    },
    fluid: {
        label: 'Digital Fluid',
        rules: { survival: [2, 3], birth: [3] }, // B3/S2,3
        density: 0.08
    },
    stable: {
        label: 'Stable Islands',
        rules: { survival: [4, 5, 6, 7], birth: [4, 5] }, // B4,5/S4,5,6,7
        density: 0.18
    }
};
