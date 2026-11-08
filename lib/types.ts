/** Shapes returned by the STAKA API (see api/openapi.json). */

export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface BrandSummary extends Brand {
  productCount: number;
  createdAt: string;
}

export interface SustainabilityInfo {
  carbonScoreGrams: number;
  recyclabilityPercent: number;
  verified: boolean;
  verifiedAt?: string;
  certifierName?: string;
}

export interface Product {
  id: string;
  gtin: string;
  sku: string;
  name: string;
  description?: string;
  imageUrl?: string;
  brand: Brand;
  sustainabilityInfo?: SustainabilityInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export type OwnershipStatus = "UNVERIFIED" | "PENDING" | "REJECTED" | "BLOCKED" | "VERIFIED";
export type ClaimMethod = "ORDER_MATCH" | "RECEIPT";
export type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Ownership {
  status: OwnershipStatus;
  method?: ClaimMethod;
  verifiedAt?: string;
  pendingSince?: string;
  lastRejectionReason?: string;
  receiptAttemptsUsed: number;
  receiptAttemptsLeft: number;
}

export interface DigitalCard {
  id: string;
  createdAt: string;
  user: { id: string; name: string };
  product: Product;
  ownership: Ownership;
  /** Present while the tag is publicly shared. */
  share?: ShareLink;
}

export interface ShareLink {
  slug: string;
  createdAt: string;
}

/** A shared tag as anyone with the link sees it. */
export interface PublicTag {
  slug: string;
  product: Product;
  ownerFirstName: string;
  verifiedAt: string;
  verifiedBy?: ClaimMethod;
  sharedAt: string;
}

export interface Claim {
  id: string;
  method: ClaimMethod;
  status: ClaimStatus;
  createdAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  reviewedByName?: string;
  orderId?: string;
  hasReceipt: boolean;
  receiptMimeType?: string;
  receiptAttempt?: number;
  user: { id: string; name: string; email: string };
  product: { id: string; name: string; gtin: string; sku: string; brandName: string; imageUrl?: string };
}

export interface ClaimPage {
  items: Claim[];
  total: number;
  page: number;
  limit: number;
}

export interface ClaimDetail extends Claim {
  history: Claim[];
}

export interface ImportReport {
  dryRun: boolean;
  totalRows: number;
  created: number;
  updated: number;
  failed: number;
  brandsCreated: string[];
  errors: { row: number; gtin?: string; messages: string[] }[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}
