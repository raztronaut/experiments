"use client";

import { useEffect } from "react";

export function AIWidget() {
    useEffect(() => {
        // Dynamic import to avoid SSR issues (HTMLElement only exists in browser)
        import("summarize-with-ai").then(({ SummarizeWidget }) => {
            const container = document.getElementById("summarize-widget-container");
            if (container) {
                SummarizeWidget.init({
                    target: container,
                    theme: "minimal",
                    compact: true,
                    promptPrefix: "Summarize this experiments page:",
                });
            }
        });
    }, []);

    return (
        <div
            id="summarize-widget-container"
            className="fixed bottom-6 right-6 z-[9999]"
        />
    );
}
