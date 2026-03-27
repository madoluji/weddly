import {NextRequest, NextResponse} from "next/server";
import {getToken} from "next-auth/jwt";
import {authenticateToken} from "./app/lib/authorizationMiddleware";


export async function proxy(req: NextRequest) {
  const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
  const pathname = req.nextUrl.pathname;

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/api/register";

  const isAdminAuthPage =
    pathname === "/admin/login" || pathname === "/api/admin/register";

  const isUserPage =
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api") &&
    !isAuthPage &&
    !isAdminAuthPage;

  if (pathname.startsWith("/api/") && !isAuthPage) {
    const authTokenMiddleware = await authenticateToken(req);

    if (!authTokenMiddleware?.user) {
      return NextResponse.json(
        {error: authTokenMiddleware?.error || "Authentication required"},
        {status: 401}
      );
    }

    if (pathname.startsWith('/api/admin/super-admin') && authTokenMiddleware.user.role !== "superadmin") {
      return NextResponse.json(
        {error: "Unauthorized: Superadmin role required"},
        {status: 403}
      );
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("user", JSON.stringify(authTokenMiddleware.user));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if ((isAuthPage || isAdminAuthPage) && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token && !isAuthPage && !isAdminAuthPage) {
    if (pathname.startsWith("/api")) {
      return new NextResponse(JSON.stringify({error: "Unauthorized"}), {
        status: 401,
        headers: {"Content-Type": "application/json"},
      });
    }
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(req.url)}`, req.url)
    );
  }

  if (token && token.role === "admin" && isUserPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images|icons|logo|favicon.ico|public|api/auth).*)",
  ],
};