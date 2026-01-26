"use client";

import { useState, useEffect } from "react";
import { AIIcons } from "./ai-icons";
import { cn } from "@/lib/utils";
import { WithHover } from "./cursor/WithHover";

type ServiceId = "chatgpt" | "claude" | "perplexity" | "gemini" | "grok";

interface ServiceConfig {
    id: ServiceId;
    name: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    buildUrl: (prompt: string, url: string) => string;
}

const services: ServiceConfig[] = [
    {
        id: "chatgpt",
        name: "ChatGPT",
        icon: AIIcons.ChatGPT,
        buildUrl: (prompt, url) =>
            `https://chat.openai.com/?q=${encodeURIComponent(`${prompt} ${url}`)}`,
    },
    {
        id: "claude",
        name: "Claude",
        icon: AIIcons.Claude,
        buildUrl: (prompt, url) =>
            `https://claude.ai/new?q=${encodeURIComponent(`${prompt} ${url}`)}`,
    },
    {
        id: "perplexity",
        name: "Perplexity",
        icon: AIIcons.Perplexity,
        buildUrl: (prompt, url) =>
            `https://www.perplexity.ai/search/new?q=${encodeURIComponent(`${prompt} ${url}`)}`,
    },
    {
        id: "gemini",
        name: "Gemini",
        icon: AIIcons.Gemini,
        buildUrl: (prompt, url) =>
            `https://gemini.google.com/app?q=${encodeURIComponent(`${prompt} ${url}`)}`,
    },
    {
        id: "grok",
        name: "Grok",
        icon: AIIcons.Grok,
        buildUrl: (prompt, url) =>
            `https://x.com/i/grok?text=${encodeURIComponent(`${prompt} ${url}`)}`,
    },
];

export function AIWidget() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const handleSummarize = (service: ServiceConfig) => {
        const currentUrl = window.location.href;
        const prompt = "Summarize this page:";
        const targetUrl = service.buildUrl(prompt, currentUrl);
        window.open(targetUrl, "_blank", "noopener,noreferrer");
    };

    if (!mounted) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
            <div className="flex items-center p-2 rounded-xl bg-background/80 backdrop-blur-md border shadow-lg transition-all duration-300 hover:bg-background/90 group">
                {services.map((service) => (
                    <WithHover key={service.id} config={{ hoverOffset: 2 }}>
                        <button
                            onClick={() => handleSummarize(service)}
                            className={cn(
                                "relative p-2 rounded-md text-muted-foreground transition-all duration-200",
                                "hover:text-foreground hover:bg-muted active:scale-95",
                                "focus:outline-none focus:ring-2 focus:ring-primary/20"
                            )}
                            aria-label={`Summarize with ${service.name}`}
                            title={`Summarize with ${service.name}`}
                        >
                            <service.icon className="w-5 h-5" />
                            <span className="sr-only">{service.name}</span>
                        </button>
                    </WithHover>
                ))}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium pr-4 select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                AI Summary
            </div>
        </div>
    );
}
