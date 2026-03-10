import { ArrowRight, Rss } from "lucide-react";
import Link from "next/link";
import type { Article } from "@/lib/articles";
import { replica } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { WithHover } from "./cursor/WithHover";

const TEXT_SCALE_CONFIG = { scale: 1.5 } as const;

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
    return null;
  }

  return (
    <section className="mb-16" id="writing">
      <div className="mb-6 flex items-center justify-between">
        <WithHover config={TEXT_SCALE_CONFIG} type="text">
          <h2
            className={cn(
              "font-bold text-xl tracking-tight md:text-2xl",
              replica.className
            )}
          >
            Writing
          </h2>
        </WithHover>
        <WithHover>
          <a
            aria-label="RSS Feed"
            className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/20 px-2.5 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted/40 hover:text-foreground"
            href="/feed.xml"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Rss className="h-3 w-3" />
            RSS
          </a>
        </WithHover>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {articles.map((article) => (
          <WithHover key={article.slug}>
            <Link
              className="group flex flex-col gap-3 rounded-xl border border-border p-5 transition-[border-color,box-shadow] duration-200 hover:border-foreground/20 hover:shadow-sm"
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
                <p className="mt-0.5 text-muted-foreground/70 text-xs">
                  {article.experimentSlug}
                </p>
              </div>

              {article.description && (
                <p className="line-clamp-2 text-pretty text-muted-foreground text-sm leading-relaxed">
                  {article.description}
                </p>
              )}

              <span className="mt-auto flex items-center gap-1 text-muted-foreground text-xs transition-colors group-hover:text-foreground">
                Read article
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </WithHover>
        ))}
      </div>
    </section>
  );
}
