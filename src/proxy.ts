import { type NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "www.razisyed.cv";

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|glb|gltf|hdr|woff2?|ttf|otf|json|xml|xsl|txt|css|js)).*)",
  ],
};
