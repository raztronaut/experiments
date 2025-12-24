import { GradientBackground } from "@/components/experiments/game-of-life-shader/GradientBackground";
import { LifeSimulation } from "@/components/experiments/game-of-life-shader/LifeSimulation";

/**
 * Game of Life + Shader Experiment Page
 * 
 * This page composes the "Living Refraction" visual effect.
 * It layers a WebGL gradient shader underneath a Canvas-based simulation.
 * 
 * LAYOUT ARCHITECTURE:
 * The effect relies on Z-Index stacking:
 * 1. Z-0: GradientBackground (The colors)
 * 2. Z-10: LifeSimulation (The mask/pattern)
 */
export default function Page() {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {/* 
               LAYER 1: The "Energy"
               The beautiful, shifting gradient shader. It sits at the bottom.
            */}
            <div className="absolute inset-0 z-0">
                <GradientBackground />
            </div>

            {/* 
               LAYER 2: The "Pattern"
               The Game of Life simulation. 
               - It renders mostly BLACK (hiding the gradient).
               - Living cells render CLEAR (revealing the gradient).
               - pointer-events-none allows clicks to pass through if we needed, 
                 but the component inside enables its own pointer-events: auto 
                 for interaction.
            */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <LifeSimulation />
            </div>
        </div>
    );
}