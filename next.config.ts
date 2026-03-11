import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

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
];

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "motion",
      "leva",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@codesandbox/sandpack-react",
      "shiki",
      "fumadocs-core",
      "fumadocs-ui",
    ],
  },
  images: {
    qualities: [70, 75],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
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
    ];
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
