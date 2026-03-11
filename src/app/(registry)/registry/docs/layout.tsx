import { DocsLayout } from "fumadocs-ui/layouts/flux";
import type { ReactNode } from "react";
import { registrySource } from "@/lib/registry-source";

function SidebarBanner() {
  return (
    <div className="rounded-lg border border-fd-border bg-fd-card p-3 text-fd-muted-foreground text-xs">
      <p className="font-medium text-fd-foreground">Add to your project</p>
      <code className="mt-1 block text-[11px]">
        npx shadcn add https://razisyed.cv/r/NAME
      </code>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="flex flex-col gap-1.5 text-fd-muted-foreground text-xs">
      <a className="hover:text-fd-foreground hover:underline" href="/">
        &larr; back to site
      </a>
      <p>
        Built by{" "}
        <a
          className="text-fd-foreground hover:underline"
          href="https://www.razisyed.cv"
        >
          Razi Syed
        </a>
      </p>
    </div>
  );
}

export default function RegistryDocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DocsLayout
      githubUrl="https://github.com/raztronaut/experiments"
      nav={{ title: "razi's registry", url: "/registry/docs" }}
      sidebar={{
        defaultOpenLevel: 1,
        tabs: [
          { title: "Experiments", url: "/registry/docs/experiments" },
          { title: "Components", url: "/registry/docs/components" },
          { title: "Collected", url: "/registry/docs/collected" },
          { title: "Hooks", url: "/registry/docs/hooks" },
          { title: "Utilities", url: "/registry/docs/utilities" },
        ],
        banner: <SidebarBanner />,
        footer: <SidebarFooter />,
      }}
      tree={registrySource.getPageTree()}
    >
      {children}
    </DocsLayout>
  );
}
