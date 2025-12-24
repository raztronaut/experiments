"use client";

import { useState } from "react";
import { Key } from "./Key";

export function DevToolsKeyboard() {
    const [isMac] = useState(() => {
        if (typeof navigator !== "undefined") {
            return navigator.platform.toUpperCase().includes("MAC");
        }
        return false;
    });

    return (
        <div className="inline-flex flex-col items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">Press</p>
            <div className="flex items-center gap-1.5 rounded-xl border p-3 shadow-2xl border-neutral-800 bg-neutral-950 shadow-black/50">
                {isMac ? (
                    <>
                        <Key label="⌘" keyCode="Meta" />
                        <Key label="⌥" keyCode="Alt" />
                        <Key label="I" keyCode="i" />
                    </>
                ) : (
                    <>
                        <Key label="Ctrl" keyCode="Control" width="w-20" />
                        <Key label="⇧" keyCode="Shift" />
                        <Key label="I" keyCode="i" />
                    </>
                )}
            </div>
        </div>
    );
}
