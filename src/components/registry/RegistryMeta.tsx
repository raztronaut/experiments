import { cn } from "@/lib/utils";

interface RegistryMetaProps {
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
  dependencies = [],
  registryDependencies = [],
  tags = [],
  tech = [],
  fileCount = 0,
  type,
}: Partial<RegistryMetaProps>) {
  const typeLabel = type ? (TYPE_LABELS[type] ?? "Block") : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {typeLabel && (
        <MetaBadge className="border-primary/30 bg-primary/10 text-primary">
          {typeLabel}
        </MetaBadge>
      )}

      <MetaBadge>
        {fileCount} {fileCount === 1 ? "file" : "files"}
      </MetaBadge>

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

      {tags.map((tag) => (
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-muted-foreground text-xs"
          key={tag}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export { RegistryMeta };
export type { RegistryMetaProps };
