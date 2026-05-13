import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

const PROTECTED_PREFIXES = ["/today", "/foods", "/plans", "/athlete"];

export async function proxy(request: NextRequest) {
  if (
    process.env.E2E_AUTH_BYPASS === "true" &&
    process.env.NODE_ENV !== "production"
  ) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );
  if (!isProtected) return NextResponse.next();

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/today/:path*", "/foods/:path*", "/plans/:path*", "/athlete/:path*"],
};
