"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ExperimentBackButton() {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        // Only show if we are NOT in an iframe
        if (window.self === window.top) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShouldShow(true);
        }
    }, []);

    if (!shouldShow) return null;

    return (
        <Link
            href="/"
            className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-900/70 text-white rounded-full text-sm font-medium transition-colors backdrop-blur-sm border border-white/10"
        >
            <ArrowLeft className="w-4 h-4" />
            Return to Experiments
        </Link>
    );
}
