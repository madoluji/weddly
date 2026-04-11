import {NextRequest, NextResponse} from "next/server";
import {getToken} from "next-auth/jwt";
import {authenticateToken} from "./app/lib/authorizationMiddleware";
import {createClient, RedisClientType} from "redis";

const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_SECONDS = 15 * 60;
const GENERAL_LIMIT = 120;
const GENERAL_WINDOW_SECONDS = 60;

const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST ?
  process.env.REDIS_URL || `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` :
  undefined;

let redisClient: RedisClientType | null = null;
let redisConnected = false;
const inMemoryRateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
const useRedis = Boolean(redisUrl);

const getRedisClient = async () => {
  if (!redisUrl) {
    throw new Error("Redis URL is not configured. Set REDIS_URL or REDIS_HOST/REDIS_PORT.");
  }

  if (!redisClient) {
    redisClient = createClient({ url: redisUrl });
  }

  if (!redisConnected) {
    await redisClient.connect();
    redisConnected = true;
  }

  return redisClient;
};

const getMemoryRateLimit = (key: string, limit: number, windowSeconds: number) => {
  const now = Date.now();
  const existing = inMemoryRateLimitBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowSeconds * 1000;
    inMemoryRateLimitBuckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  inMemoryRateLimitBuckets.set(key, existing);
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
};

const getClientIp = (req: NextRequest) => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
};

const checkRateLimit = async (key: string, limit: number, windowSeconds: number) => {
  if (!useRedis) {
    return getMemoryRateLimit(key, limit, windowSeconds);
  }

  try {
    const client = await getRedisClient();
    const count = await client.incr(key);

    if (count === 1) {
      await client.expire(key, windowSeconds);
    }

    const ttl = await client.ttl(key);
    const resetAt = Date.now() + Math.max(ttl, windowSeconds) * 1000;
    const allowed = count <= limit;

    return {
      allowed,
      remaining: allowed ? limit - count : 0,
      resetAt,
    };
  } catch (error) {
    console.warn("Redis rate limiting failed, falling back to in-memory rate limiting", error);
    return getMemoryRateLimit(key, limit, windowSeconds);
  }
};

const toRateLimitResponse = (limit: number, remaining: number, resetAt: number) =>
  new NextResponse(JSON.stringify({ error: "Too many requests" }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))),
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(Math.max(0, remaining)),
      "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
    },
  });

const withRateLimitHeaders = (
  response: NextResponse,
  limit: number,
  remaining: number,
  resetAt: number
) => {
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, remaining)));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
  return response;
};

export async function proxy(req: NextRequest) {
  const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
  const pathname = req.nextUrl.pathname;
  const role = typeof token?.role === "string" ? token.role.toLowerCase() : undefined;
  const allowE2EBypass = process.env.NEXT_PUBLIC_ENABLE_E2E === "true";
  const isE2EPage = allowE2EBypass && pathname.startsWith("/e2e");

  const roles = token?.roles as
    | { client?: boolean; freelancer?: boolean; venue?: boolean }
    | undefined;

  if (token) {
    if (pathname.startsWith("/client") && !roles?.client) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/user") && !roles?.freelancer) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    isE2EPage;

  const isAuthApiRoute =
    pathname.startsWith("/api/auth") || pathname === "/api/register";

  const isAdminAuthPage =
    pathname === "/admin/login" || pathname === "/api/admin/register";

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminProtectedPage = isAdminPage && pathname !== "/admin/login";

  const isUserPage =
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api") &&
    !isAuthPage &&
    !isAdminAuthPage;

  if (token && isAdminProtectedPage && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  let rateLimitResult: { allowed: boolean; remaining: number; resetAt: number } | null = null;
  let rateLimitLimit = GENERAL_LIMIT;

  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(req);
    const isAuthApi = pathname.startsWith("/api/auth") || pathname === "/api/register";
    const windowSeconds = isAuthApi ? REGISTER_WINDOW_SECONDS : GENERAL_WINDOW_SECONDS;
    const key = isAuthApi ? `ratelimit:auth:${ip}` : `ratelimit:api:${ip}`;
    const limit = isAuthApi ? GENERAL_LIMIT : GENERAL_LIMIT;

    // Allow NextAuth endpoints to be used normally without an extremely low auth limit.
    rateLimitResult = await checkRateLimit(key, limit, windowSeconds);
    if (!rateLimitResult.allowed) {
      return toRateLimitResponse(limit, rateLimitResult.remaining, rateLimitResult.resetAt);
    }
  }

  if (pathname.startsWith("/api/") && !isAuthApiRoute) {
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

    const isAdminApiRoute = pathname.startsWith("/api/admin/");
    const isAdminPublicApiRoute = pathname === "/api/admin/register";
    const adminAccessRoles = new Set(["useradmin", "superadmin"]);
    const apiRole = typeof authTokenMiddleware.user.role === "string"
      ? authTokenMiddleware.user.role.toLowerCase()
      : undefined;

    if (isAdminApiRoute && !isAdminPublicApiRoute && !adminAccessRoles.has(apiRole ?? "")) {
      return NextResponse.json(
        {error: "Unauthorized: Admin role required"},
        {status: 403}
      );
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("user", JSON.stringify(authTokenMiddleware.user));

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    if (rateLimitResult) {
      return withRateLimitHeaders(
        response,
        rateLimitLimit,
        rateLimitResult.remaining,
        rateLimitResult.resetAt
      );
    }

    return response;
  }

  if ((isAuthPage || isAdminAuthPage) && token) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token && !isAuthPage && !isAdminAuthPage && !isAuthApiRoute) {
    if (pathname.startsWith("/api")) {
      return new NextResponse(JSON.stringify({error: "Unauthorized"}), {
        status: 401,
        headers: {"Content-Type": "application/json"},
      });
    }

    if (isAdminProtectedPage) {
      return NextResponse.redirect(
        new URL(`/admin/login?callbackUrl=${encodeURIComponent(req.url)}`, req.url)
      );
    }

    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(req.url)}`, req.url)
    );
  }

  if (token && token.role === "admin" && isUserPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (pathname.startsWith("/api/") && rateLimitResult) {
    const response = NextResponse.next();
    return withRateLimitHeaders(
      response,
      rateLimitLimit,
      rateLimitResult.remaining,
      rateLimitResult.resetAt
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images|icons|logo|favicon.ico|public).*)",
  ],
};
