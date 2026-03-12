import { type NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "www.razisyed.cv";

function isMarkdownPreferred(request: NextRequest): boolean {
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/markdown") && !accept.includes("text/html");
}

export function proxy(request: NextRequest) {
  const { hostname, pathname, search } = request.nextUrl;

  if (
    hostname !== CANONICAL_HOST &&
    hostname !== "localhost" &&
    !hostname.startsWith("192.168.") &&
    !hostname.endsWith(".vercel.app")
  ) {
    const canonical = new URL(`https://${CANONICAL_HOST}${pathname}${search}`);
    return NextResponse.redirect(canonical, 308);
  }

  // Strip trailing slashes (except root)
  if (pathname !== "/" && pathname.endsWith("/")) {
    const clean = new URL(request.url);
    clean.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(clean, 308);
  }

  if (isMarkdownPreferred(request)) {
    const articleMatch = pathname.match(/^\/experiments\/([^/]+)\/article$/);
    if (articleMatch) {
      const url = request.nextUrl.clone();
      url.pathname = `/experiments/llms.mdx/${articleMatch[1]}/article`;
      return NextResponse.rewrite(url);
    }

    const registryMatch = pathname.match(/^\/registry\/docs\/(.+)$/);
    if (registryMatch) {
      const url = request.nextUrl.clone();
      url.pathname = `/registry/llms.mdx/${registryMatch[1]}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|glb|gltf|hdr|woff2?|ttf|otf|json|xml|xsl|txt|css|js)).*)",
  ],
};
