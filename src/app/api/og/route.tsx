import { ImageResponse } from "next/og";

export const runtime = "edge";

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(
      new URL(
        "../../../../public/fonts/Replica/ReplicaTrial-Bold.otf",
        import.meta.url
      )
    );
    if (res.ok) {
      return res.arrayBuffer();
    }
  } catch {
    // Local font failed -- try Google Fonts woff fallback
  }

  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Inter:wght@700",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
        },
      }
    );
    const css = await cssRes.text();
    const woffUrl = css.match(
      /src:\s*url\(([^)]+)\)\s*format\(['"]woff['"]\)/
    )?.[1];
    if (woffUrl) {
      const fontRes = await fetch(woffUrl);
      if (fontRes.ok) {
        return fontRes.arrayBuffer();
      }
    }
  } catch {
    // Font fetch failed -- render without custom font
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Razi's Experiments";
    const description = searchParams.get("description");
    const tags = searchParams.get("tags");

    const fontData = await loadFont();
    const fontFamily = fontData
      ? "CustomFont, sans-serif"
      : "system-ui, sans-serif";

    const truncatedDescription =
      description && description.length > 120
        ? `${description.slice(0, 117)}...`
        : description;

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          backgroundColor: "#111115",
          color: "#fafafa",
          fontFamily,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "16px",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: "#888",
            }}
          >
            razisyed.cv/experiments
          </div>
          <div
            style={{
              fontSize: title.length > 30 ? "48px" : "56px",
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
          {truncatedDescription && (
            <div
              style={{
                fontSize: "18px",
                lineHeight: 1.4,
                color: "#999",
                maxWidth: "800px",
              }}
            >
              {truncatedDescription}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {tags && (
            <div style={{ display: "flex", gap: "8px" }}>
              {tags
                .split(",")
                .slice(0, 4)
                .map((tag) => (
                  <div
                    key={tag}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      border: "1px solid #333",
                      fontSize: "14px",
                      color: "#aaa",
                    }}
                  >
                    {tag.trim()}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        ...(fontData && {
          fonts: [
            {
              name: "CustomFont",
              data: fontData,
              style: "normal" as const,
            },
          ],
        }),
      }
    );
  } catch {
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
