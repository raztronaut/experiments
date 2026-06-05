import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Experiment } from "@/lib/experiments";

interface ExperimentListProps {
  experiments: Experiment[];
}

// Cache Intl.DateTimeFormat to avoid parsing/allocation overhead on each render
// Also explicitly specify "en-US" locale to prevent potential SSR hydration mismatches
const dateFormatter = new Intl.DateTimeFormat("en-US");

export function ExperimentList({ experiments }: ExperimentListProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {experiments.map((experiment) => (
        <Link href={experiment.href} key={experiment.href}>
          <Card className="h-full cursor-pointer border-zinc-200 transition-colors hover:bg-muted/50 dark:border-zinc-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{experiment.title}</CardTitle>
                {experiment.created && (
                  <span
                    className="text-muted-foreground text-xs tabular-nums"
                    suppressHydrationWarning
                  >
                    {dateFormatter.format(new Date(experiment.created))}
                  </span>
                )}
              </div>
              <CardDescription>{experiment.description}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}

      {experiments.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No experiments found. Run{" "}
          <code className="rounded bg-muted px-1 py-0.5">
            npm run new:experiment
          </code>{" "}
          to create one.
        </div>
      )}
    </div>
  );
}
