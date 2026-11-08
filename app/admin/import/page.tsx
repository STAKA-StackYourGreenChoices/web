import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ImportFlow } from "./import-flow";

export const metadata: Metadata = { title: "Import products" };

export default function ImportPage() {
  return (
    <>
      <PageHeader
        title="Import products"
        description="Add or update many products at once from a spreadsheet saved as CSV. Rows are matched on barcode: new barcodes are added, known ones are updated."
      />
      <ImportFlow />
    </>
  );
}
