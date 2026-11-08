/* eslint-disable @next/next/no-img-element -- ImageResponse (Satori) renders plain <img>, not next/image */
import "server-only";
import { ImageResponse } from "next/og";
import { api, ApiError } from "./api";
import { carbonParts } from "./format";
import { imageSrc } from "./images";
import type { PublicTag } from "./types";

export const WIDE = { width: 1200, height: 630 };
export const STORY = { width: 1080, height: 1920 };

const C = {
  paper: "#FBFAF7",
  forest: "#1F3D2B",
  moss: "#7C8B4F",
  ink: "#1A1F1C",
  muted: "#5C615D",
  tag: "#FFFEFB",
  line: "#C9C8C0",
};

export async function loadPublicTag(slug: string): Promise<PublicTag | null> {
  try {
    return await api<PublicTag>(`/public/tags/${encodeURIComponent(slug)}`, { token: null });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/**
 * STAKA's heading face for the images. Satori needs TTF/OTF, which Google
 * Fonts serves to non-browser clients. Cached per process; if the download
 * fails the images still render in the default face.
 */
let headingFont: Promise<ArrayBuffer | null> | undefined;
function loadHeadingFont() {
  headingFont ??= (async () => {
    try {
      const css = await fetch(
        "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700",
        { cache: "force-cache" },
      ).then((response) => response.text());
      const url = /url\((https:[^)]+\.ttf)\)/.exec(css)?.[1];
      if (!url) return null;
      const font = await fetch(url, { cache: "force-cache" });
      return font.ok ? await font.arrayBuffer() : null;
    } catch {
      return null;
    }
  })();
  return headingFont;
}

async function imageOptions(size: { width: number; height: number }) {
  const font = await loadHeadingFont();
  return {
    ...size,
    fonts: font ? [{ name: "Bricolage", data: font, weight: 700 as const, style: "normal" as const }] : undefined,
  };
}

/** A filled check mark drawn as SVG: the default image font has no ✓ glyph. */
function Check({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ marginRight: size / 3 }}>
      <circle cx="12" cy="12" r="11" fill={C.moss} />
      <path d="M7 12.5l3.2 3.2L17 9" stroke={C.paper} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Fetches the product image and inlines it, so the PNG never depends on another request. */
async function inlineImage(raw?: string): Promise<string | null> {
  const src = imageSrc(raw);
  if (!src) return null;
  // Catalog illustrations come from this server, fetched over loopback.
  const url = src.startsWith("/") ? `http://localhost:${process.env.PORT ?? 3000}${src}` : src;
  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return null;
    const type = response.headers.get("content-type")?.split(";")[0] ?? "image/png";
    if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(type)) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 2 * 1024 * 1024) return null;
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Draws a shared tag as a PNG. "wide" is the 1200×630 link preview;
 * "story" is 1080×1920 for Instagram and WhatsApp stories.
 */
export async function renderTagImage(tag: PublicTag | null, format: "wide" | "story") {
  const size = format === "wide" ? WIDE : STORY;
  if (!tag) {
    return new ImageResponse(
      (
        <div style={{ ...fill, background: C.forest, color: C.paper, alignItems: "center", justifyContent: "center", fontSize: 56 }}>
          staka
        </div>
      ),
      await imageOptions(size),
    );
  }

  const image = await inlineImage(tag.product.imageUrl);
  const info = tag.product.sustainabilityInfo;
  const carbon = info ? carbonParts(info.carbonScoreGrams) : null;
  const story = format === "story";
  const tagWidth = story ? 760 : 470;
  const s = story ? 1.5 : 1; // type scale for the tall format

  const hangTag = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* string */}
      <div style={{ width: 3, height: story ? 160 : 40, background: "rgba(251,250,247,0.6)" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: tagWidth,
          background: C.tag,
          borderRadius: 18,
          padding: story ? 48 : 30,
          paddingTop: story ? 84 : 56,
          position: "relative",
          boxShadow: "0 30px 50px rgba(0,0,0,0.35)",
        }}
      >
        {/* punched hole with reinforcement ring */}
        <div
          style={{
            position: "absolute",
            top: story ? 26 : 16,
            left: tagWidth / 2 - (story ? 21 : 15),
            width: story ? 42 : 30,
            height: story ? 42 : 30,
            borderRadius: 999,
            background: C.forest,
            border: `${story ? 6 : 4}px solid rgba(124,139,79,0.45)`,
          }}
        />
        <div style={{ display: "flex", fontSize: 22 * s, color: C.muted }}>{tag.product.brand.name}</div>
        <div style={{ display: "flex", fontSize: 40 * s, fontWeight: 700, fontFamily: "Bricolage", color: C.ink, lineHeight: 1.1, marginTop: 4 }}>
          {tag.product.name}
        </div>
        {image && story && (
          <img
            src={image}
            alt=""
            width={tagWidth - 96}
            height={tagWidth - 96}
            style={{ marginTop: 36, borderRadius: 14, objectFit: "cover" }}
          />
        )}
        {carbon && info && (
          <div style={{ display: "flex", marginTop: story ? 40 : 24, gap: 48 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 18 * s, color: C.muted }}>Footprint</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 44 * s, fontWeight: 700, fontFamily: "Bricolage", color: C.ink }}>{carbon.value}</span>
                <span style={{ fontSize: 20 * s, color: C.muted }}>{carbon.unit}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 18 * s, color: C.muted }}>Recyclable</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 44 * s, fontWeight: 700, fontFamily: "Bricolage", color: C.ink }}>{info.recyclabilityPercent}</span>
                <span style={{ fontSize: 20 * s, color: C.muted }}>%</span>
              </div>
            </div>
          </div>
        )}
        <div
          style={{
            display: "flex",
            marginTop: story ? 36 : 22,
            paddingTop: story ? 24 : 16,
            borderTop: `2px dashed ${C.line}`,
            fontSize: 20 * s,
            color: C.forest,
            fontWeight: 600,
            alignItems: "center",
          }}
        >
          <Check size={22 * s} />
          Verified owner: {tag.ownerFirstName}
        </div>
      </div>
    </div>
  );

  if (story) {
    return new ImageResponse(
      (
        <div style={{ ...fill, background: C.forest, flexDirection: "column", alignItems: "center", padding: 80 }}>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, fontFamily: "Bricolage", color: C.paper, letterSpacing: -1 }}>staka</div>
          <div style={{ display: "flex", flex: 1, alignItems: "center" }}>{hangTag}</div>
          <div style={{ display: "flex", fontSize: 34, color: "rgba(251,250,247,0.8)", textAlign: "center" }}>
            Every piece I own, with its footprint attached.
          </div>
        </div>
      ),
      await imageOptions(size),
    );
  }

  return new ImageResponse(
    (
      <div style={{ ...fill, background: C.forest, padding: "0 70px", alignItems: "center", gap: 60 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, color: C.paper }}>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, fontFamily: "Bricolage", letterSpacing: -1 }}>staka</div>
          <div style={{ display: "flex", fontSize: 54, fontWeight: 700, fontFamily: "Bricolage", lineHeight: 1.1, marginTop: 28 }}>
            {tag.ownerFirstName} owns this {tag.product.name}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "rgba(251,250,247,0.75)", marginTop: 20 }}>
            Proof of purchase checked. See its footprint on STAKA.
          </div>
        </div>
        {hangTag}
      </div>
    ),
    await imageOptions(size),
  );
}

const fill = { width: "100%", height: "100%", display: "flex" } as const;
