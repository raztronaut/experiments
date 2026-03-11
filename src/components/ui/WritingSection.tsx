import { ArrowRight, FlaskConical } from "lucide-react";
import Link from "next/link";
import type { Article } from "@/lib/articles";
import { WithHover } from "./cursor/WithHover";

interface WritingSectionProps {
  articles: Article[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function WritingSection({ articles }: WritingSectionProps) {
  if (articles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No articles yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {articles.map((article) => (
        <WithHover key={article.slug}>
          <Link
            className="group flex flex-col gap-3 rounded-xl border border-border p-5 transition-[border-color,box-shadow] duration-200 hover:border-foreground/20 hover:shadow-xs"
            data-umami-event="article_click"
            data-umami-event-article={article.slug}
            href={article.href}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-muted-foreground/60 text-xs">
                {formatDate(article.publishedAt)}
              </span>
              <span className="font-mono text-muted-foreground/60 text-xs">
                {article.readingMinutes} min read
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-foreground leading-tight tracking-tight transition-colors group-hover:text-primary">
                {article.title}
              </h3>
            </div>

            {article.description && (
              <p className="line-clamp-2 text-pretty text-muted-foreground text-sm leading-relaxed">
                {article.description}
              </p>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-[10px] text-primary">
                <FlaskConical className="h-3 w-3" />
                View Experiment
              </span>
              {article.tech?.slice(0, 3).map((t) => (
                <span
                  className="rounded-full bg-accent px-2 py-0.5 font-medium text-[10px] text-accent-foreground"
                  key={t}
                >
                  {t}
                </span>
              ))}
              {(article.tech?.length ?? 0) > 3 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  +{article.tech!.length - 3}
                </span>
              )}
            </div>

            <span className="flex items-center gap-1 text-muted-foreground text-xs transition-colors group-hover:text-foreground">
              Read article
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </WithHover>
      ))}
    </div>
  );
}
