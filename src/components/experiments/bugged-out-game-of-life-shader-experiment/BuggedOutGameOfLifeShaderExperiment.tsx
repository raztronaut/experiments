"use client";

import React from 'react';
import { LifeSimulation } from './LifeSimulation';

export default function BuggedOutGameOfLifeShaderExperiment() {
    return (
        <div className="relative w-full h-full min-h-[400px]">
            <LifeSimulation />
        </div>
    );
}