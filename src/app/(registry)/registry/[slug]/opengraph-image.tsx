import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface RegistryItem {
  category?: string;
  description: string;
  name: string;
  title: string;
  type?: string;
}

const TYPE_LABELS: Record<string, string> = {
  "registry:block": "Block",
  "registry:component": "Component",
  "registry:hook": "Hook",
  "registry:lib": "Utility",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let title = slug;
  let description = "";
  let typeLabel = "";
  let category = "";

  try {
    const filePath = join(process.cwd(), "public", "registry", `${slug}.json`);
    const content = await readFile(filePath, "utf-8");
    const item = JSON.parse(content) as RegistryItem;
    title = item.title;
    description = item.description;
    typeLabel = item.type ? (TYPE_LABELS[item.type] ?? "") : "";
    category = item.category ?? "";
  } catch {
    /* Fall back to slug as title */
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        backgroundColor: "hsl(240, 8.25%, 6.84%)",
        color: "#fafafa",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            maxWidth: "900px",
          }}
        >
          {title}
        </div>
        {(typeLabel || category) && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              fontSize: 18,
              color: "hsl(240, 5%, 50%)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {typeLabel && <span>{typeLabel}</span>}
            {typeLabel && category && <span>·</span>}
            {category && <span>{category}</span>}
          </div>
        )}
        {description && (
          <div
            style={{
              fontSize: 24,
              color: "hsl(240, 5%, 64.9%)",
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div style={{ fontSize: 20, color: "hsl(240, 5%, 64.9%)" }}>
          razisyed.cv/registry/{slug}
        </div>
        <div style={{ fontSize: 20, color: "hsl(240, 5%, 45%)" }}>
          razi&apos;s registry
        </div>
      </div>
    </div>,
    { ...size }
  );
}
