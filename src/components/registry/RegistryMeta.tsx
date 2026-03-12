import { cn } from "@/lib/utils";

interface RegistryMetaProps {
  category?: string;
  dependencies: string[];
  fileCount: number;
  registryDependencies: string[];
  tags: string[];
  tech: string[];
  type?: string;
  verified?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  "registry:block": "Block",
  "registry:component": "Component",
  "registry:hook": "Hook",
  "registry:lib": "Utility",
};

const CATEGORY_LABELS: Record<string, string> = {
  experiments: "Experiment",
  collected: "Collected",
  components: "Component",
  hooks: "Hook",
  utilities: "Utility",
};

function MetaBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-fd-border px-2.5 py-1",
        "font-medium text-fd-muted-foreground text-xs",
        className
      )}
    >
      {children}
    </span>
  );
}

function RegistryMeta({
  category,
  dependencies = [],
  registryDependencies = [],
  tags = [],
  tech = [],
  fileCount = 0,
  type,
  verified = false,
}: Partial<RegistryMetaProps>) {
  const typeLabel = type ? (TYPE_LABELS[type] ?? "Block") : null;
  const categoryLabel = category ? CATEGORY_LABELS[category] : null;

  const hasDeps =
    dependencies.length > 0 ||
    registryDependencies.length > 0 ||
    tech.length > 0;
  const hasTags = tags.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {verified ? (
          <MetaBadge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Verified
          </MetaBadge>
        ) : (
          <MetaBadge className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
            Not Verified
          </MetaBadge>
        )}
        {typeLabel && (
          <MetaBadge className="border-fd-primary/30 bg-fd-primary/10 text-fd-primary">
            {typeLabel}
          </MetaBadge>
        )}
        {categoryLabel && categoryLabel !== typeLabel && (
          <MetaBadge className="border-fd-accent bg-fd-accent/50 text-fd-accent-foreground">
            {categoryLabel}
          </MetaBadge>
        )}
        <MetaBadge>
          {fileCount} {fileCount === 1 ? "file" : "files"}
        </MetaBadge>
      </div>

      {hasDeps && (
        <div className="flex flex-wrap items-center gap-2">
          {registryDependencies.map((dep) => (
            <MetaBadge key={dep}>{dep}</MetaBadge>
          ))}
          {dependencies.map((dep) => (
            <a
              className={cn(
                "inline-flex items-center rounded-md border border-fd-border px-2.5 py-1",
                "font-medium text-fd-muted-foreground text-xs",
                "transition-colors hover:border-fd-primary/30 hover:text-fd-primary"
              )}
              href={`https://www.npmjs.com/package/${dep}`}
              key={dep}
              rel="noopener noreferrer"
              target="_blank"
            >
              {dep}
            </a>
          ))}
          {tech.map((t) => (
            <span
              className="inline-flex items-center rounded-full bg-fd-accent px-2.5 py-1 font-medium text-fd-accent-foreground text-xs"
              key={t}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {hasTags && (
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((tag) => (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-fd-muted-foreground text-xs"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export { RegistryMeta };
export type { RegistryMetaProps };
