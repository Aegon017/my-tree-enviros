import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const sessionCookie =
    req.cookies.get("my-tree-enviros-session") || req.cookies.get("XSRF-TOKEN");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/notifications/:path*"],
};
