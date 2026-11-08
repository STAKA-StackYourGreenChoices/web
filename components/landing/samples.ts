import type { HangTagProduct } from "@/components/hang-tag";

/** Real products from the seeded catalog, shown as examples on the home page. */
export const SAMPLE_TEE: HangTagProduct = {
  name: "Organic Cotton Tee",
  gtin: "08901234500019",
  imageUrl: "/catalog-images/organic-cotton-tee.svg",
  brand: { name: "Terra Threads" },
  sustainabilityInfo: {
    carbonScoreGrams: 2100,
    recyclabilityPercent: 80,
    verified: true,
    certifierName: "Global Organic Textile Standard",
  },
};

export const SAMPLE_SNEAKERS: HangTagProduct = {
  name: "Hemp Canvas Sneakers",
  gtin: "08901234500057",
  imageUrl: "/catalog-images/hemp-canvas-sneakers.svg",
  brand: { name: "Loop Footwear" },
  sustainabilityInfo: {
    carbonScoreGrams: 6100,
    recyclabilityPercent: 65,
    verified: true,
    certifierName: "B Corp",
  },
};

export const SAMPLE_JEANS: HangTagProduct = {
  name: "Recycled Denim Jeans",
  gtin: "08901234500026",
  imageUrl: "/catalog-images/recycled-denim-jeans.svg",
  brand: { name: "Terra Threads" },
  sustainabilityInfo: {
    carbonScoreGrams: 9800,
    recyclabilityPercent: 70,
    verified: false,
  },
};

export const SAMPLE_SWEATER: HangTagProduct = {
  name: "Merino Wool Sweater",
  gtin: "08901234500033",
  imageUrl: "/catalog-images/merino-wool-sweater.svg",
  brand: { name: "Terra Threads" },
  sustainabilityInfo: {
    carbonScoreGrams: 7400,
    recyclabilityPercent: 85,
    verified: true,
    certifierName: "Responsible Wool Standard",
  },
};
