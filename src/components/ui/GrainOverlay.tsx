import { cn } from "@/lib/utils";

interface GrainOverlayProps {
  className?: string;
}

export function GrainOverlay({ className }: GrainOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-[-1] select-none",
        "bg-[url('/grain.gif')]",
        "opacity-[0.02] dark:opacity-[0.07]",
        "mix-blend-multiply",
        className
      )}
    />
  );
}
