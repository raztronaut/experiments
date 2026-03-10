"use client";

import { useEffect, useRef } from "react";

const ASCII_CAT_FRAMES = [
  "     /\\_ /\\\n ___ / o o \\\n/ ___   =-= /\n\\____)-m-m)",
  "     /\\_/\\\n ___/ o o \\\n/___   =-= /\n\\____)mm__)",
  "     /\\_/\\\n ___/ · · \\\n/___   =-= /\n\\___)-m__m)",
  "     /\\_/\\\n ___/ o o \\\n/___   =-= /\n\\____)-mm-)",
];

export function ConsoleEasterEgg() {
  const isPlaying = useRef(false);

  useEffect(() => {
    // ... styles ...
    const welcomeStyle = [
      "background: linear-gradient(to right, #2dd4bf, #06b6d4)",
      "color: white",
      "padding: 8px 12px",
      "border-radius: 6px",
      "font-size: 14px",
      "font-weight: bold",
      "font-family: system-ui, -apple-system, sans-serif",
      "text-shadow: 0 1px 2px rgba(0,0,0,0.2)",
    ].join(";");

    const hintStyle =
      "color: #8be9fd; font-style: italic; font-size: 11px; margin-top: 4px;";

    // Wait for initial page-load noise to settle (HMR, initial analytics, etc)
    const initTimer = setTimeout(() => {
      // Bypass Next.js removeConsole compiler option
      const c = window.console;
      c.clear();
      c.log("%c✨ RAZI'S EXPERIMENTS ✨", welcomeStyle);
      c.log(
        "%cCuriosity killed the cat... or did it? %ctry surpriseMe()",
        "color: #f8f8f2;",
        hintStyle
      );
    }, 1000);

    // 2. Secret Command
    (window as any).surpriseMe = () => {
      if (isPlaying.current) {
        return "Already purring! 🐾";
      }
      isPlaying.current = true;

      let frame = 0;
      const style =
        "color: #ff79c6; font-weight: bold; font-family: monospace; line-height: 1.2;";

      const interval = setInterval(() => {
        const c = window.console;
        c.clear();
        c.log(`%c${ASCII_CAT_FRAMES[frame % ASCII_CAT_FRAMES.length]}`, style);
        c.log(
          "%c%s",
          "color: #50fa7b; font-weight: bold;",
          "\n  🐾 Purr... Purr... (refresh to stop)"
        );
        frame++;
      }, 150);

      // Store interval to stop if needed, though we tell user to refresh
      (window as any)._stopSurprise = () => {
        clearInterval(interval);
        isPlaying.current = false;
        const c = window.console;
        c.clear();
        return "Cat is sleeping now. 😴";
      };

      return "Watch the console! 🐈✨";
    };

    return () => {
      clearTimeout(initTimer);
      if (typeof (window as any)._stopSurprise === "function") {
        (window as any)._stopSurprise();
      }
      (window as any).surpriseMe = undefined;
      (window as any)._stopSurprise = undefined;
    };
  }, []);

  return null; // Side-effect only component
}
