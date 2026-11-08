import { apiRaw } from "@/lib/api";
import { requireAdmin } from "@/lib/session";

/** Streams a claim's receipt to an admin, keeping the API's safety headers. */
export async function GET(_: Request, { params }: RouteContext<"/admin/claims/[id]/receipt">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  const upstream = await apiRaw(`/claims/${id}/receipt`);
  if (!upstream.ok) return new Response("This receipt isn't available.", { status: upstream.status });

  const headers = new Headers();
  for (const name of ["content-type", "content-length", "x-content-type-options", "content-security-policy"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("content-disposition", "inline");
  headers.set("cache-control", "private, no-store");
  return new Response(upstream.body, { headers });
}
