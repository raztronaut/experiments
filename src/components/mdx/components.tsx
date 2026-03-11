import dynamic from "next/dynamic";
import type React from "react";
import { Callout } from "./Callout";
import { CodeBlock } from "./CodeBlock";
import { CodeStep } from "./CodeStep";
import { InteractiveWidget } from "./InteractiveWidget";
import { LiveDemo } from "./LiveDemo";

const SandpackDemo = dynamic(() =>
  import("./SandpackDemo").then((mod) => mod.SandpackDemo)
);

function isExternalUrl(href: string): boolean {
  return /^https?:\/\//.test(href) && !href.includes("razisyed.cv");
}

// biome-ignore lint: MDXComponents type is overly strict with intrinsic element props
export const articleComponents: Record<string, React.ComponentType<any>> = {
  h2: ({
    children,
    id,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => {
    if (id?.includes("footnote-label")) {
      return null;
    }
    return (
      <h2 id={id} {...props}>
        {children}
      </h2>
    );
  },
  a: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const external = href ? isExternalUrl(href) : false;
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
        {external && <span className="ml-0.5 text-xs">↗</span>}
      </a>
    );
  },
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <CodeBlock {...props}>{children}</CodeBlock>
  ),
  code: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLElement>) => {
    if (className?.includes("language-")) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return <code {...props}>{children}</code>;
  },
  blockquote: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-border border-l-2 pl-4" {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="border-border border-b bg-muted/50 px-4 py-2 text-left font-semibold"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border-border/50 border-b px-4 py-2" {...props}>
      {children}
    </td>
  ),
  img: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      alt={alt || ""}
      className="rounded-lg"
      decoding="async"
      loading="lazy"
      {...props}
    />
  ),
  Callout,
  CodeStep,
  InteractiveWidget,
  LiveDemo,
  SandpackDemo,
};
