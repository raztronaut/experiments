import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Razi's Experiments";
    const tags = searchParams.get("tags");

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
          fontFamily: "system-ui, -apple-system, sans-serif",
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
      }
    );
  } catch {
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
