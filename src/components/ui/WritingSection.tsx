import type { Article } from "@/lib/articles";
import { ArticleCard } from "./ArticleCard";
import { WithHover } from "./cursor/WithHover";

interface WritingSectionProps {
  articles: Article[];
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
    <div className="grid h-feed grid-cols-1 gap-4 md:grid-cols-2" role="feed">
      {articles.map((article) => (
        <WithHover key={article.slug}>
          <ArticleCard article={article} />
        </WithHover>
      ))}
    </div>
  );
}
