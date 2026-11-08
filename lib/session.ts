import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  cookieOptions,
  decodeClaims,
  sessionCookies,
  type SessionClaims,
} from "./session-core";
import type { AuthTokens } from "./types";

/**
 * Server-side session access. The API's tokens live in httpOnly cookies, so
 * browser JavaScript can never read them; proxy.ts refreshes an expiring
 * access token before a page renders.
 */

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function getSession(): Promise<SessionClaims | null> {
  return decodeClaims(await getAccessToken());
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

/** For pages and actions that need a signed-in user. */
export async function requireSession(): Promise<SessionClaims> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<SessionClaims> {
  const session = await requireSession();
  if (session.role !== "ADMIN") redirect("/");
  return session;
}

/** Only callable from Server Actions and Route Handlers. */
export async function saveSession(
  tokens: Pick<AuthTokens, "accessToken" | "refreshToken">,
) {
  const store = await cookies();
  for (const [name, value, maxAge] of sessionCookies(tokens)) {
    store.set(name, value, cookieOptions(maxAge));
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}
