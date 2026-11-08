import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Scanner } from "./scanner";

export const metadata: Metadata = { title: "Scan a product" };

export default function ScanPage() {
  return (
    <>
      <PageHeader
        title="Scan a product"
        description="Hold the barcode on the clothing label inside the frame. QR codes on tags work too."
      />
      <Scanner />
    </>
  );
}
