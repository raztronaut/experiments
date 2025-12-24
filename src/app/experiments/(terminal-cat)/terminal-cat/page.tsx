"use client";

import { useConsoleCat } from "@/components/experiments/terminal-cat/useConsoleCat";

export default function Page() {
    useConsoleCat();

    return (
        <div className="w-full h-screen bg-neutral-950 flex flex-col items-center justify-center text-center p-8 text-neutral-200 font-sans">
            <div className="max-w-md space-y-6">
                <div className="text-6xl mb-4">🐱</div>
                <h1 className="text-3xl font-bold tracking-tight">Check the Console</h1>
                <p className="text-neutral-400">
                    Open your browser&apos;s Developer Tools (F12) and switch to the <span className="text-brand-500 font-mono bg-neutral-900 px-2 py-1 rounded">Console</span> tab to see the cat in action.
                </p>
            </div>
        </div>
    );
}