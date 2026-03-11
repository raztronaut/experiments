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
  dependencies,
  registryDependencies,
  tags,
  tech,
  fileCount,
  type,
}: RegistryMetaProps) {
  const depCount = dependencies.length + registryDependencies.length;
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

      {depCount > 0 && (
        <MetaBadge>
          {depCount} {depCount === 1 ? "dep" : "deps"}
        </MetaBadge>
      )}

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
