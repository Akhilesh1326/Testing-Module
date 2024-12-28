import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Allow access to API docs without authentication
  if (url.pathname.startsWith('/api-docs') || url.pathname.startsWith('/api/swagger')) {
    return NextResponse.next();
  }

  if (
    token &&
    (url.pathname.startsWith("/") ||
      url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/new-password") ||
      url.pathname.startsWith("/register"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/", "/dashboard/:path*", "/new-password", "/api-docs", "/api/swagger"],
};
