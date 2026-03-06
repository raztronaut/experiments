import { LifeSimulation } from "@/components/experiments/bugged-out-game-of-life-shader-experiment/LifeSimulation";

/**
 * Bugged Out Game of Life + Shader Experiment Page
 */
export default function Page() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-950">
      <LifeSimulation className="z-10" />
    </div>
  );
}
