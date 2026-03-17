import { FileText } from "lucide-react";
import Link from "next/link";
import { getExperimentsBySlugs } from "@/lib/experiments";

interface RelatedExperimentsSectionProps {
  slugs: string[];
  /** For article context: use narrower max-width. For experiment: full width. */
  variant?: "article" | "experiment";
}

export async function RelatedExperimentsSection({
  slugs,
  variant = "article",
}: RelatedExperimentsSectionProps) {
  const experiments = (await getExperimentsBySlugs(slugs)).filter(
    (e) => e.status === "shipped" && (e.listing ?? "public") === "public"
  );
  if (experiments.length === 0) {
    return null;
  }

  const containerClass =
    variant === "article"
      ? "mx-auto max-w-3xl px-4 sm:px-6"
      : "w-full px-4 py-8 sm:px-6";

  return (
    <aside
      aria-label="Related experiments"
      className={`mt-16 border-border border-t pt-8 ${containerClass}`}
    >
      <h2 className="mb-4 font-semibold text-foreground text-sm">
        Related experiments
      </h2>
      <ul className="flex flex-col gap-3">
        {experiments.map((exp) => (
          <li key={exp.slug}>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                className="font-medium text-foreground text-sm underline decoration-muted-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
                href={exp.href}
              >
                {exp.title}
              </Link>
              {exp.articleHref && (
                <Link
                  aria-label={`Read article: ${exp.title}`}
                  className="inline-flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
                  href={exp.articleHref}
                >
                  <FileText className="h-3 w-3" />
                  Article
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
