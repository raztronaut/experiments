"use client";

import { LifeSimulation } from "./LifeSimulation";

export default function BuggedOutGameOfLifeShaderExperiment() {
  return (
    <div className="relative h-full min-h-[400px] w-full">
      <LifeSimulation />
    </div>
  );
}
