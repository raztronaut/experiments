import { cn } from "@/lib/utils";

export function CompletenessBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            score >= 80
              ? "bg-emerald-500"
              : score >= 50
                ? "bg-amber-500"
                : "bg-red-500"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="font-mono text-muted-foreground text-xs tabular-nums">
        {score}%
      </span>
    </div>
  );
}
