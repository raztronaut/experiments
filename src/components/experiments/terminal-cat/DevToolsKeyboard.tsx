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
      <p className="font-medium text-neutral-500 text-xs uppercase tracking-widest">
        Press
      </p>
      <div className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950 p-3 shadow-2xl shadow-black/50">
        {isMac ? (
          <>
            <Key keyCode="Meta" label="⌘" />
            <Key keyCode="Alt" label="⌥" />
            <Key keyCode="i" label="I" />
          </>
        ) : (
          <>
            <Key keyCode="Control" label="Ctrl" width="w-20" />
            <Key keyCode="Shift" label="⇧" />
            <Key keyCode="i" label="I" />
          </>
        )}
      </div>
    </div>
  );
}
