import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Experiment } from "@/lib/experiments";

interface ExperimentListProps {
    experiments: Experiment[];
}

export function ExperimentList({ experiments }: ExperimentListProps) {
    return (
        <div className="grid grid-cols-1 gap-4">
            {experiments.map((experiment) => (
                <Link key={experiment.href} href={experiment.href}>
                    <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{experiment.title}</CardTitle>
                                {experiment.created && (
                                    <span suppressHydrationWarning className="text-xs text-muted-foreground tabular-nums">
                                        {new Date(experiment.created).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <CardDescription>{experiment.description}</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            ))}

            {experiments.length === 0 && (
                <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                    No experiments found. Run <code className="bg-muted px-1 py-0.5 rounded">npm run new:experiment</code> to create one.
                </div>
            )}
        </div>
    );
}
