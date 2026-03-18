import { withSentryConfig } from "@sentry/nextjs";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

// Sentry CSP report endpoint (Settings > Security Headers); built from DSN so violations show in Sentry
function getSentryReportUri(): string {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return "";
  }
  try {
    const u = new URL(dsn);
    const key = u.username;
    const projectId = u.pathname.replace(/^\//, "");
    const host = u.hostname;
    return `https://${host}/api/${projectId}/security/?sentry_key=${key}`;
  } catch {
    return "";
  }
}

const sentryReportUri = getSentryReportUri();
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self' https://cloud.umami.is https://api-gateway.umami.dev https://*.vercel-insights.com https://*.ingest.sentry.io https://api.open-meteo.com blob:",
  "worker-src 'self' blob:",
  "media-src 'self'",
  "object-src 'none'",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  ...(sentryReportUri ? [`report-uri ${sentryReportUri}`] : []),
];

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Document-Policy",
    value: "js-profiling",
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives.join("; "),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "motion",
      "framer-motion",
      "leva",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@codesandbox/sandpack-react",
      "shiki",
      "fumadocs-core",
      "fumadocs-ui",
      "@radix-ui/react-popover",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-tabs",
      "@radix-ui/react-separator",
      "@radix-ui/react-progress",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "sonner",
      "vaul",
      "katex",
      "lottie-react",
    ],
  },
  images: {
    qualities: [70, 75],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
  compiler: {
    removeConsole: {
      exclude: ["error"],
    },
  },
  outputFileTracingIncludes: {
    "/": ["./src/app/experiments/**/*"],
    "/registry": ["./public/registry/**/*"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Source maps: noindex to avoid indexing minified source structure
      {
        source: "/_next/static/chunks/:filename(.+\\.map)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/swipe-gesture-icon.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source:
          "/experiments/:path*.:ext(mp4|webm|png|jpg|jpeg|webp|gif|avif|glb|gltf|hdr)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/experiments/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, content-type, Authorization",
          },
        ],
      },
      {
        source: "/registry/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://www.razisyed.cv",
              "font-src 'self'",
              "frame-src 'self'",
              "connect-src 'self' https://cloud.umami.is",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Redirect phantom /experiments URL to homepage (experiments are a tab)
      {
        source: "/experiments",
        destination: "/",
        permanent: true,
      },
      // llm.txt compatibility redirect (AI Visibility spec variant)
      {
        source: "/llm.txt",
        destination: "/llms.txt",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/u/:path*",
        destination: "https://cloud.umami.is/:path*",
      },
      {
        source: "/r/:slug",
        destination: "/registry/:slug.json",
      },
      {
        source: "/experiments/:slug/article.mdx",
        destination: "/experiments/llms.mdx/:slug/article",
      },
      {
        source: "/experiments/:slug.mdx",
        destination: "/experiments/llms.mdx/:slug",
      },
    ];
  },
};

const withMDX = createMDX();

const sentryEnabled =
  Boolean(process.env.SENTRY_DSN) ||
  Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

const sentryOptions = sentryEnabled
  ? {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
      silent: !process.env.CI,
    }
  : undefined;

const configWithMDX = withMDX(nextConfig);

export default sentryOptions
  ? withSentryConfig(configWithMDX, sentryOptions)
  : configWithMDX;
