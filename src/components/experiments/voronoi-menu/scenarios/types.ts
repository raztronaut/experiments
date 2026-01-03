import React from 'react';
import { Point } from '../useVoronoi';

export type ScenarioType = 'smart-home' | 'er-triage';

export interface ScenarioPoint {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    x: number; // Normalized 0-1
    y: number; // Normalized 0-1
    value?: string;
    isActive: boolean;
    color?: string; // For color picker specific cells
}

export interface ScenarioConfig {
    title: string;
    subtitle: string;
    systemStatus: string;
    statusColor: string;
    debug?: boolean;
    getPoints: (width: number, height: number, time?: number) => ScenarioPoint[];
    onInteract: (items: ScenarioPoint[], index: number) => ScenarioPoint[];
    SidebarComponent: React.FC<{ items: ScenarioPoint[] }>;
    OverlayComponent?: React.FC;
    renderCell?: (ctx: CanvasRenderingContext2D, point: Point, path: Path2D, isActive: boolean, isHovered: boolean) => void;
}
