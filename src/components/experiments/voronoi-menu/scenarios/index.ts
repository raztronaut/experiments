import { ScenarioType, ScenarioConfig } from './types';
import { SmartHomeScenario } from './smart-home';
import { ErTriageScenario } from './er-triage';

export const SCENARIOS: Record<ScenarioType, ScenarioConfig> = {
    'smart-home': SmartHomeScenario,
    'er-triage': ErTriageScenario,
};

export type { ScenarioType, ScenarioPoint, ScenarioConfig } from './types';
