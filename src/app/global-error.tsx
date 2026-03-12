"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            fontFamily: "system-ui, sans-serif",
            gap: 12,
          }}
        >
          <h2 style={{ margin: 0 }}>Something went wrong</h2>
          <button
            onClick={reset}
            style={{ padding: "8px 16px", cursor: "pointer" }}
            type="button"
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
