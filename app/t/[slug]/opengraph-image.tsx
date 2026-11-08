import { loadPublicTag, renderTagImage, WIDE } from "@/lib/tag-image";

export const alt = "A verified STAKA tag";
export const size = WIDE;
export const contentType = "image/png";

/** The preview WhatsApp, X, LinkedIn and Facebook show when the link is pasted. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderTagImage(await loadPublicTag(slug), "wide");
}
