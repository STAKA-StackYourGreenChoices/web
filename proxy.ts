import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  cookieOptions,
  decodeClaims,
  sessionCookies,
} from "@/lib/session-core";
import type { AuthTokens } from "@/lib/types";

const API_URL = (process.env.API_URL ?? "http://localhost:7070").replace(/\/+$/, "");
/** Refresh this many seconds before the access token actually expires. */
const REFRESH_LEEWAY = 30;
/** Pages for signed-out visitors; signed-in visitors are sent home. */
const GUEST_ONLY = ["/login", "/register", "/forgot-password"];

/**
 * Runs before every page render:
 * 1. refreshes an expired or expiring access token using the refresh cookie,
 *    so server components always see a valid one;
 * 2. sends signed-out visitors to /login, non-admins away from /admin, and
 *    signed-in visitors away from guest-only pages.
 * The API remains the real authority; these are navigation checks only.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  let access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  let claims = decodeClaims(access);
  let refreshed: AuthTokens | null = null;
  let refreshFailed = false;

  const now = Math.floor(Date.now() / 1000);
  if (refresh && (!claims || claims.exp - now < REFRESH_LEEWAY)) {
    refreshed = await refreshTokens(refresh);
    if (refreshed) {
      access = refreshed.accessToken;
      claims = decodeClaims(access);
      // Let this same request's server components see the new token.
      for (const [name, value] of sessionCookies(refreshed)) {
        request.cookies.set(name, value);
      }
    } else {
      refreshFailed = true;
      claims = null;
      request.cookies.delete(ACCESS_COOKIE);
      request.cookies.delete(REFRESH_COOKIE);
    }
  }

  const isPublic =
    GUEST_ONLY.includes(pathname) ||
    pathname === "/reset-password" ||
    pathname === "/verify-email" ||
    // Shared tags (and their preview images) are open to anyone with the link.
    pathname.startsWith("/t/");

  let response: NextResponse;
  if (!claims && !isPublic) {
    const login = new URL("/login", request.url);
    if (pathname !== "/") login.searchParams.set("next", pathname + search);
    response = NextResponse.redirect(login);
  } else if (claims && GUEST_ONLY.includes(pathname)) {
    response = NextResponse.redirect(new URL("/", request.url));
  } else if (pathname.startsWith("/admin") && claims?.role !== "ADMIN") {
    response = NextResponse.redirect(new URL("/", request.url));
  } else {
    response = NextResponse.next({ request: { headers: request.headers } });
  }

  if (refreshed) {
    for (const [name, value, maxAge] of sessionCookies(refreshed)) {
      response.cookies.set(name, value, cookieOptions(maxAge));
    }
  } else if (refreshFailed) {
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
  }
  return response;
}

/**
 * The API rotates refresh tokens: each one works exactly once. A page load
 * and its link prefetches can arrive together carrying the same expired
 * session, so concurrent refreshes for one token share a single API call and
 * its result (kept briefly for stragglers). Per-process, which suits a single
 * Next.js instance; multiple instances would need sticky sessions or a shared
 * store.
 */
const inflight = new Map<string, Promise<AuthTokens | null>>();

function refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
  const existing = inflight.get(refreshToken);
  if (existing) return existing;
  const pending = callRefresh(refreshToken);
  inflight.set(refreshToken, pending);
  void pending.finally(() =>
    setTimeout(() => inflight.delete(refreshToken), 10_000),
  );
  return pending;
}

async function callRefresh(refreshToken: string): Promise<AuthTokens | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    return response.ok ? ((await response.json()) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export const config = {
  // Skip static assets, images and metadata files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
