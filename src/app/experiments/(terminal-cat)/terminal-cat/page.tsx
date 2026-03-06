"use client";

import { DevToolsKeyboard } from "@/components/experiments/terminal-cat/DevToolsKeyboard";
import { MobileNotice } from "@/components/experiments/terminal-cat/MobileNotice";
import { useConsoleCat } from "@/components/experiments/terminal-cat/useConsoleCat";

export default function Page() {
  useConsoleCat();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-950 p-8 text-center font-sans text-neutral-200">
      <MobileNotice />
      <div className="max-w-md space-y-6">
        <div className="mb-4 text-6xl">🐱</div>
        <h1 className="font-bold text-3xl tracking-tight">Check the Console</h1>
        <p className="text-neutral-400">
          Open your browser&apos;s Developer Tools and switch to the{" "}
          <span className="rounded bg-neutral-900 px-2 py-1 font-mono text-brand-500">
            Console
          </span>{" "}
          tab to see the cat in action.
        </p>
        <DevToolsKeyboard />
      </div>
    </div>
  );
}
