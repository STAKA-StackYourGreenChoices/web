import type { AuthTokens, Role } from "./types";

/** Cookie and token helpers shared by proxy.ts and lib/session.ts. */

export const ACCESS_COOKIE = "staka_at";
export const REFRESH_COOKIE = "staka_rt";
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // matches the API's JWT_REFRESH_EXPIRATION

export interface SessionClaims {
  userId: string;
  role: Role;
  exp: number;
}

/**
 * Reads the JWT payload without verifying it. That is safe because the claims
 * only steer navigation; the API verifies the signature on every call.
 */
export function decodeClaims(token: string | undefined): SessionClaims | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(part)) as {
      sub?: string;
      role?: Role;
      exp?: number;
    };
    if (!payload.sub || !payload.role || !payload.exp) return null;
    return { userId: payload.sub, role: payload.role, exp: payload.exp };
  } catch {
    return null;
  }
}

/** Cookie name, value and lifetime (seconds) for a token pair. */
export function sessionCookies(
  tokens: Pick<AuthTokens, "accessToken" | "refreshToken">,
): [string, string, number][] {
  const claims = decodeClaims(tokens.accessToken);
  const accessMaxAge = claims
    ? Math.max(claims.exp - Math.floor(Date.now() / 1000), 0)
    : 15 * 60;
  return [
    [ACCESS_COOKIE, tokens.accessToken, accessMaxAge],
    [REFRESH_COOKIE, tokens.refreshToken, REFRESH_MAX_AGE],
  ];
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
