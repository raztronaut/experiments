"use client";

import { domAnimation, LazyMotion, motion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { useElementSize } from "@/hooks/useElementSize";
import { useLiquidGlassStyle } from "@/hooks/useLiquidGlassStyle";
import { cn } from "@/lib/utils";
import { AIIcons } from "./ai-icons";
import { WithHover } from "./cursor/WithHover";
import { LiquidGlassFilter } from "./LiquidGlassFilter";

type ServiceId = "chatgpt" | "claude" | "perplexity" | "gemini" | "grok";

interface ServiceConfig {
  buildUrl: (prompt: string, url: string) => string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  id: ServiceId;
  name: string;
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
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const filterId = useId().replace(/:/g, "");

  const RADIUS = 8; // Matches rounded-lg

  const glassStyle = useLiquidGlassStyle({
    filterId: `liquid-glass-ai-${filterId}`,
    fallbackBlur: 10,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSummarize = (service: ServiceConfig) => {
    const currentUrl = window.location.href;
    const prompt = "Summarize this page:";
    const targetUrl = service.buildUrl(prompt, currentUrl);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  if (!mounted) {
    return null;
  }

  // We only apply the glass style if we have dimensions
  const hasSize = width > 0 && height > 0;

  return (
    <LazyMotion features={domAnimation}>
      <div className="fixed right-6 bottom-6 z-9999 flex flex-col items-end gap-2">
        <LiquidGlassFilter
          displacementScale={32}
          height={height}
          id={`liquid-glass-ai-${filterId}`}
          radius={RADIUS}
          width={width} // High strength to confirm it's working
        />
        <motion.div
          className={cn(
            "group flex items-center rounded-lg border border-border/50 p-2 shadow-lg",
            "bg-muted/40 transition-colors duration-300" // Visible base, no manual blur (handled by glassStyle fallback)
          )}
          initial={false}
          layout
          ref={ref}
          style={hasSize ? glassStyle : {}}
        >
          {services.map((service) => (
            <WithHover config={{ hoverOffset: 2 }} key={service.id}>
              <button
                aria-label={`Summarize with ${service.name}`}
                className={cn(
                  "relative rounded-md p-2 text-muted-foreground transition-colors duration-200",
                  "hover:bg-muted hover:text-foreground active:scale-95",
                  "focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                )}
                onClick={() => handleSummarize(service)}
                title={`Summarize with ${service.name}`}
              >
                <service.icon className="h-5 w-5" />
                <span className="sr-only">{service.name}</span>
              </button>
            </WithHover>
          ))}
        </motion.div>

        <div className="pointer-events-none select-none pr-4 font-medium text-[10px] text-muted-foreground/50 uppercase tracking-widest opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          AI Summary
        </div>
      </div>
    </LazyMotion>
  );
}
