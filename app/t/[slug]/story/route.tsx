import { loadPublicTag, renderTagImage } from "@/lib/tag-image";

/** A tall 1080×1920 image of the tag for Instagram and WhatsApp stories. */
export async function GET(_: Request, { params }: RouteContext<"/t/[slug]/story">) {
  const { slug } = await params;
  const tag = await loadPublicTag(slug);
  if (!tag) return new Response("This tag isn't shared any more.", { status: 404 });
  const image = await renderTagImage(tag, "story");
  const headers = new Headers(image.headers);
  headers.set("content-disposition", `attachment; filename="staka-${slug}.png"`);
  return new Response(image.body, { headers });
}
