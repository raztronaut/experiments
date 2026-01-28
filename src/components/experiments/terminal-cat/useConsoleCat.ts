
import { useEffect, useRef } from 'react';

// ASCII Frames
// Standard Cat (Fallback)
const CAT_BODY = [
    [
        `     /\\_ /\\`,
        ` ___ / o o \\`,
        `/ ___   =-= /`,
        `\\____)-m-m)`,
    ],
    [
        `     /\\_/\\`,
        ` ___/ o o \\`,
        `/___   =-= /`,
        `\\____)mm__)`,
    ],
    [
        `     /\\_/\\`,
        ` ___/ · · \\`,
        `/___   =-= /`,
        `\\___)-m__m)`,
    ],
    [
        `     /\\_/\\`,
        ` ___/ o o \\`,
        `/___   =-= /`,
        `\\____)-mm-)`,
    ]
];

// Christmas Cat (With Hat)
const CAT_BODY_WITH_HAT = [
    [
        `       *`,
        `      /o\\`,
        `     {/\\_/\\}`,
        `  ___/ o o \\`,
        ` /___  =-= /`,
        ` \\____)-m-m)`,
    ],
    [
        `       *`,
        `      /o\\`,
        `     {/\\_/\\}`,
        `  ___/ o o \\`,
        ` /___  =-= /`,
        ` \\____)mm__)`,
    ],
    [
        `       *`,
        `      /o\\`,
        `     {/\\_/\\}`,
        `  ___/ · · \\`,
        ` /___  =-= /`,
        ` \\___)-m__m)`,
    ],
    [
        `       *`,
        `      /o\\`,
        `     {/\\_/\\}`,
        `  ___/ o o \\`,
        ` /___  =-= /`,
        ` \\____)-mm-)`,
    ]
];

const CHRISTMAS_PHRASES = [
    "Meowy Xmas!",
    "Ho Ho Ho!",
    "Coding in the snow...",
    "Where's my gift?",
    "*Purr*",
    "Santa is coming!",
    "Jingle Bells~",
];

const SNOW_TERRAIN_CHARS = ["_", "_", "_", ".", "*", " "];

// Helper to check for Christmas season logic (always true if user asks for theme, but keeping logic for robustness)
const isChristmasSeason = (): boolean => {
    // For this demo, we can just return true or checking logic. 
    // Since user explicitly asked for Christmas theme, let's force it if needed, 
    // but for the hook's general reusability I'll keep the date check OR default to true for the sake of the demo request.
    // Actually, I'll stick to the date check but expand it to encompass "now" since they are running it now.
    return true;
};

export const useConsoleCat = (enabled: boolean = true) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Animation State Refs (to persist across renders without re-triggering effect if not needed)
    const stateRef = useRef({
        frame: 0,
        pos: 0,
        direction: 1, // 1 = right, -1 = left
        terrainOffset: 0,
        speech: {
            text: "",
            timer: 0,
            visible: false
        }
    });

    useEffect(() => {
        if (!enabled) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        const frames = isChristmasSeason() ? CAT_BODY_WITH_HAT : CAT_BODY;
        const catWidth = 15;
        const termWidth = 60;

        // Generate a static wide terrain string that we can slice/scroll
        const fullTerrainWidth = 200;
        let baseTerrain = "";
        for (let i = 0; i < fullTerrainWidth; i++) {
            baseTerrain += SNOW_TERRAIN_CHARS[Math.floor(Math.random() * SNOW_TERRAIN_CHARS.length)];
        }

        const render = () => {
            const state = stateRef.current;
            state.frame++;
            state.terrainOffset = (state.terrainOffset + 1) % fullTerrainWidth;

            // Ping-pong movement logic
            // let maxPos = termWidth - catWidth;
            // For scrolling feel, maybe we stay in middle? 
            // User asked for "scrolling terrain", usually implies character stays relatively static or moves slightly while world moves.
            // Let's keep the ping-pong for run variety but add terrain scrolling.

            let maxPos = termWidth - catWidth;
            if (maxPos < 0) maxPos = 0;

            // Update Position
            // state.pos += state.direction;
            // if (state.pos >= maxPos || state.pos <= 0) {
            //   state.direction *= -1;
            // }
            // Smoother ping pong based on frame
            let cycleLength = maxPos * 2;
            if (cycleLength === 0) cycleLength = 1;
            const tick = state.frame % cycleLength;
            state.pos = tick > maxPos ? cycleLength - tick : tick;

            // Speech Logic
            if (state.speech.visible) {
                state.speech.timer--;
                if (state.speech.timer <= 0) {
                    state.speech.visible = false;
                }
            } else {
                // Random chance to speak
                if (Math.random() < 0.05) { // 5% chance per frame
                    state.speech.text = CHRISTMAS_PHRASES[Math.floor(Math.random() * CHRISTMAS_PHRASES.length)];
                    state.speech.visible = true;
                    state.speech.timer = 20; // Show for ~3 seconds (20 * 150ms)
                }
            }

            // -- Render Composition --
            const c = window.console;
            c.clear();

            let outputBuffer = "";
            const styles: string[] = [];

            const padding = " ".repeat(state.pos);

            // 1. Speech Bubble
            if (state.speech.visible) {
                const bubble = `  🗨️  ${state.speech.text}`;
                outputBuffer += `%c${padding}${bubble}\n`;
                // Green text for Christmas speech
                styles.push("color: #50fa7b; font-weight: bold;");
            } else {
                // Empty line to keep vertical stability?
                // console.clear() handles it, but maybe better to print empty line to push cat down?
                // Let's just not print it, console.clear is absolute.
                outputBuffer += "\n";
            }

            // 2. Cat Body
            const bodyIdx = state.frame % frames.length;
            const body = frames[bodyIdx];

            body.forEach((line, index) => {
                const isHat = isChristmasSeason() && index < 3;
                const hatColor = "color: #ff5555; font-weight: bold; font-family: monospace;"; // Red
                const bodyColor = "color: #ff79c6; font-weight: bold; font-family: monospace;"; // Pink

                outputBuffer += `%c${padding}${line}\n`;
                styles.push(isHat ? hatColor : bodyColor);
            });

            // 3. Scrolling Terrain
            // Slice a window of the terrain
            // We want the terrain to move "left" so indices increase
            const viewWidth = termWidth + 10;
            const start = state.terrainOffset % (fullTerrainWidth - viewWidth);
            const terrainSlice = baseTerrain.substring(start, start + viewWidth);

            outputBuffer += `%c${terrainSlice}`;
            styles.push("color: #8be9fd; font-weight: bold;"); // Cyan/Ice color for snow

            c.log(outputBuffer, ...styles);
        };

        intervalRef.current = setInterval(render, 150);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [enabled]);
};

