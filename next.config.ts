import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    qualities: [70, 75],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
  outputFileTracingIncludes: {
    '/': ['./src/app/experiments/**/*'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/experiments/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, content-type, Authorization' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Proxy Umami analytics to bypass ad blockers
      {
        source: '/u/:path*',
        destination: 'https://cloud.umami.is/:path*',
      },
      // Simplified registry URLs: /r/slug -> /registry/slug.json
      {
        source: '/r/:slug',
        destination: '/registry/:slug.json',
      },
    ];
  },
};

export default nextConfig;

