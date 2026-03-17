import { spaceGrotesk } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * Server-rendered, zero-JS placeholder for the above-the-fold location/status UI.
 * Replaced after idle by `LocationStatusEnhancer`.
 */
export function LocationStatusStatic() {
  return (
    <div
      className={cn(
        "flex w-full select-none flex-wrap items-center gap-2 text-sm md:w-auto md:text-base",
        spaceGrotesk.className
      )}
    >
      <div className="flex min-h-[28px] w-full items-center justify-between gap-0.5 rounded-md border border-border/50 bg-muted/20 px-3 py-1 shadow-xs md:min-h-[46px] md:w-auto md:justify-start md:gap-1 md:rounded-xl md:px-2.5 md:py-1.5">
        <div className="flex flex-1 justify-start md:flex-none">
          <div className="h-4 w-20 rounded-full bg-foreground/10" />
        </div>
        <div className="flex items-center">
          <span className="cursor-default select-none font-light opacity-15">
            •
          </span>
        </div>
        <div className="flex flex-1 justify-center md:flex-none">
          <div className="h-4 w-14 rounded-full bg-foreground/10" />
        </div>
        <div className="flex items-center">
          <span className="cursor-default select-none font-light opacity-15">
            •
          </span>
        </div>
        <div className="flex flex-1 justify-end md:flex-none">
          <div className="h-4 w-16 rounded-full bg-foreground/10" />
        </div>
        <div className="hidden items-center md:flex">
          <span className="cursor-default select-none font-light opacity-15">
            •
          </span>
        </div>
        <div className="hidden md:block">
          <div className="h-4 w-28 rounded-full bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}
