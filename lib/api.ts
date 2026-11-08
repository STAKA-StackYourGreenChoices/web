import "server-only";
import { getAccessToken } from "./session";

export const API_URL = (process.env.API_URL ?? "http://localhost:7070").replace(
  /\/+$/,
  "",
);

/** An error response from the API, with Nest's message(s) normalised. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly messages: string[],
  ) {
    super(messages[0] ?? `Request failed (${status})`);
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  json?: unknown;
  form?: FormData;
  /** Defaults to the signed-in user's token; pass null for public routes. */
  token?: string | null;
}

/** Server-side call to the API. Throws ApiError for any non-2xx response. */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token === undefined ? await getAccessToken() : options.token;
  const headers: Record<string, string> = { accept: "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  if (options.json !== undefined) headers["content-type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.form ?? (options.json !== undefined ? JSON.stringify(options.json) : undefined),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(503, [
      "STAKA's server isn't reachable right now. Check that the API is running, then try again.",
    ]);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const body: unknown = text ? safeJson(text) : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, extractMessages(body, response.status));
  }
  return body as T;
}

/** Raw response for non-JSON payloads such as the CSV template. */
export async function apiRaw(path: string): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${API_URL}${path}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractMessages(body: unknown, status: number): string[] {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) return message.map(String);
    if (typeof message === "string") return [message];
  }
  if (status === 401) return ["Your session has ended. Sign in again."];
  if (status === 403) return ["Your account doesn't have access to this."];
  return [`Request failed (${status})`];
}
