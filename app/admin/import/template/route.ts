import { apiRaw } from "@/lib/api";
import { requireAdmin } from "@/lib/session";

/** Streams the API's CSV template through, attaching the admin's token server-side. */
export async function GET() {
  await requireAdmin();
  const upstream = await apiRaw("/products/import/template");
  if (!upstream.ok) {
    return new Response("The template isn't available right now. Try again in a moment.", {
      status: upstream.status,
    });
  }
  return new Response(upstream.body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="staka-products-template.csv"',
    },
  });
}
