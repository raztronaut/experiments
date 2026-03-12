"use client";

import Script from "next/script";

export function UmamiScript() {
  // Disable tracking in development
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  return (
    <Script
      data-website-id="4fdcf10c-cc4d-40f7-be60-f2e9c59f236f"
      id="umami-analytics"
      src="/u/script.js"
      strategy="lazyOnload"
    />
  );
}
