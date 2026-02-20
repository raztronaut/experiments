"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with R3F
const ReplayPreloader = dynamic(() => import("./ReplayPreloader"), {
    ssr: false,
});

export default function BasketballReplayCenter() {
    const [preloaderComplete, setPreloaderComplete] = useState(false);

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                background: "#050508",
                overflow: "hidden",
                position: "relative",
            }}
        >
            {!preloaderComplete && (
                <ReplayPreloader onComplete={() => setPreloaderComplete(true)} />
            )}

            {preloaderComplete && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        color: "rgba(255,255,255,0.6)",
                        fontFamily: "monospace",
                    }}
                >
                    <p style={{ fontSize: "0.9rem", letterSpacing: "0.2em" }}>
                        Pick and Roll
                    </p>
                </div>
            )}
        </div>
    );
}