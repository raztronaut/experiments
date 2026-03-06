import type React from "react";
import { cn } from "@/lib/utils";

type CalloutVariant = "info" | "warning" | "tip";

interface CalloutProps {
  children: React.ReactNode;
  title?: string;
  variant?: CalloutVariant;
}

const variantStyles: Record<
  CalloutVariant,
  { border: string; bg: string; icon: string }
> = {
  info: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    icon: "ℹ",
  },
  warning: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    icon: "⚠",
  },
  tip: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    icon: "✦",
  },
};

export function Callout({ variant = "info", title, children }: CalloutProps) {
  const styles = variantStyles[variant];

  return (
    <aside
      className={cn(
        "my-6 rounded-lg border-l-4 px-5 py-4",
        styles.border,
        styles.bg
      )}
    >
      {title && (
        <p className="mb-2 font-semibold text-sm">
          <span className="mr-2">{styles.icon}</span>
          {title}
        </p>
      )}
      <div className="text-muted-foreground text-sm [&>p]:m-0">{children}</div>
    </aside>
  );
}
