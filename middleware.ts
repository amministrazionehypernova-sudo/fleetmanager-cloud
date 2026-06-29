import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/health"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  const isApiAuth = pathname.startsWith("/api/auth");
  const isNextAsset = pathname.startsWith("/_next");
  const isPublicFile =
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

  if (isPublicPath || isApiAuth || isNextAsset || isPublicFile) {
    return NextResponse.next();
  }

  const session = request.cookies.get("fleet_session")?.value;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
