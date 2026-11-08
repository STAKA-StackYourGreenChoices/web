import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/page-header";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { BrandSummary, Product } from "@/lib/types";
import { DeleteProduct } from "../delete-product";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [product, brands] = await Promise.all([
    api<Product>(`/products/${id}`).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }),
    api<BrandSummary[]>("/brands"),
  ]);

  return (
    <>
      <PageHeader
        back={<BackLink href="/admin/products">Products</BackLink>}
        title={product.name}
        description={`Last updated ${formatDate(product.updatedAt)}.`}
        actions={<DeleteProduct productId={product.id} productName={product.name} />}
      />
      <ProductForm brands={brands} product={product} />
    </>
  );
}
