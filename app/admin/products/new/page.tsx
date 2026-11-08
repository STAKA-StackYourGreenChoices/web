import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/page-header";
import { api } from "@/lib/api";
import type { BrandSummary } from "@/lib/types";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  const brands = await api<BrandSummary[]>("/brands");
  return (
    <>
      <PageHeader
        back={<BackLink href="/admin/products">Products</BackLink>}
        title="Add product"
        description="Shoppers find this product by scanning its barcode."
      />
      <ProductForm brands={brands} />
    </>
  );
}
