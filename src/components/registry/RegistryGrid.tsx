"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { RegistryCard } from "@/components/registry/RegistryCard";
import { cn } from "@/lib/utils";

interface RegistrySlimItem {
  category?: string;
  description: string;
  featured?: boolean;
  library?: string;
  libraryUrl?: string;
  name: string;
  poster?: string | null;
  reference?: boolean;
  source?: string;
  status?: string;
  tags?: string[];
  tech?: string[];
  title: string;
  type?: string;
  video?: string | null;
}

interface RegistryItemWithSearch extends RegistrySlimItem {
  _searchString: string;
}

interface RegistryGridProps {
  items: RegistrySlimItem[];
}

const CATEGORY_ORDER = [
  "all",
  "experiments",
  "components",
  "collected",
  "hooks",
  "utilities",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  experiments: "Experiments",
  components: "Components",
  collected: "Collected",
  hooks: "Hooks",
  utilities: "Utilities",
};

function useDebounce(delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  return useCallback(
    (fn: () => void) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(fn, delay);
    },
    [delay]
  );
}

function RegistryGrid({ items: rawItems }: RegistryGridProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounce = useDebounce(200);

  const items = useMemo<RegistryItemWithSearch[]>(
    () =>
      rawItems
        .filter((item) => !item.name.endsWith(".story"))
        .map((item) => {
          const searchString = [
            item.title,
            item.description,
            item.tags?.join(" "),
            item.library,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return { ...item, _searchString: searchString };
        }),
    [rawItems]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      debounce(() => setDebouncedQuery(value));
    },
    [debounce]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const item of items) {
      const cat = item.category ?? "experiments";
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const availableCategories = useMemo(
    () =>
      CATEGORY_ORDER.filter(
        (cat) => cat === "all" || (categoryCounts[cat] ?? 0) > 0
      ),
    [categoryCounts]
  );

  const filteredItems = useMemo(() => {
    const query = debouncedQuery.toLowerCase().trim();

    return items.filter((item) => {
      if (activeCategory !== "all") {
        const itemCategory = item.category ?? "experiments";
        if (itemCategory !== activeCategory) {
          return false;
        }
      }

      if (query && !item._searchString.includes(query)) {
        return false;
      }

      return true;
    });
  }, [items, activeCategory, debouncedQuery]);

  const featuredItems = useMemo(
    () => filteredItems.filter((item) => item.featured),
    [filteredItems]
  );

  const regularItems = useMemo(
    () => filteredItems.filter((item) => !item.featured),
    [filteredItems]
  );

  const hasFeatured = featuredItems.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          aria-label="Filter by category"
          className="flex gap-1"
          role="tablist"
        >
          {availableCategories.map((cat) => (
            <button
              aria-selected={activeCategory === cat}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
                activeCategory === cat
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              key={cat}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              type="button"
            >
              {CATEGORY_LABELS[cat] ?? cat}
              <span className="ml-1.5 text-xs opacity-60">
                {categoryCounts[cat] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <svg
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            aria-label="Search registry items"
            className={cn(
              "h-9 w-full rounded-md border border-border bg-background pr-3 pl-9 text-foreground text-sm",
              "placeholder:text-muted-foreground/60",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              "sm:w-64"
            )}
            onChange={handleSearchChange}
            placeholder="Search items..."
            type="search"
            value={searchQuery}
          />
        </div>
      </div>

      <p className="text-muted-foreground/60 text-sm">
        {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
        {activeCategory !== "all" && (
          <span>
            {" "}
            in{" "}
            <span className="text-muted-foreground">
              {CATEGORY_LABELS[activeCategory] ?? activeCategory}
            </span>
          </span>
        )}
        {debouncedQuery && (
          <span>
            {" "}
            matching{" "}
            <span className="text-muted-foreground">
              &ldquo;{debouncedQuery}&rdquo;
            </span>
          </span>
        )}
      </p>

      {filteredItems.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground text-sm">
            No items found. Try adjusting your search or filter.
          </p>
        </div>
      )}

      {hasFeatured && (
        <section aria-label="Featured items">
          <h2 className="mb-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Featured
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredItems.map((item) => (
              <RegistryCard
                category={item.category ?? "experiments"}
                description={item.description}
                key={item.name}
                library={item.library}
                poster={item.poster ?? ""}
                reference={item.reference}
                slug={item.name}
                source={item.source}
                tags={item.tags ?? []}
                tech={item.tech ?? []}
                title={item.title}
                video={item.video ?? ""}
              />
            ))}
          </div>
        </section>
      )}

      {regularItems.length > 0 && (
        <section aria-label={hasFeatured ? "All items" : undefined}>
          {hasFeatured && (
            <h2 className="mb-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
              All Items
            </h2>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regularItems.map((item) => (
              <RegistryCard
                category={item.category ?? "experiments"}
                description={item.description}
                key={item.name}
                library={item.library}
                poster={item.poster ?? ""}
                reference={item.reference}
                slug={item.name}
                source={item.source}
                tags={item.tags ?? []}
                tech={item.tech ?? []}
                title={item.title}
                video={item.video ?? ""}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export type { RegistrySlimItem };
export { RegistryGrid };
