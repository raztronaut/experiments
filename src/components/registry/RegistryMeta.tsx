import { cn } from "@/lib/utils";

interface RegistryMetaProps {
  category?: string;
  dependencies: string[];
  fileCount: number;
  registryDependencies: string[];
  tags: string[];
  tech: string[];
  type?: string;
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
        "inline-flex items-center rounded-md border border-border px-2.5 py-1",
        "font-medium text-muted-foreground text-xs",
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
        {typeLabel && (
          <MetaBadge className="border-primary/30 bg-primary/10 text-primary">
            {typeLabel}
          </MetaBadge>
        )}
        {categoryLabel && categoryLabel !== typeLabel && (
          <MetaBadge className="border-accent bg-accent/50 text-accent-foreground">
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
                "inline-flex items-center rounded-md border border-border px-2.5 py-1",
                "font-medium text-muted-foreground text-xs",
                "transition-colors hover:border-primary/30 hover:text-primary"
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
              className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 font-medium text-accent-foreground text-xs"
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
              className="inline-flex items-center rounded-full px-2 py-0.5 text-muted-foreground text-xs"
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
