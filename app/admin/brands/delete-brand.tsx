"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FormAlert } from "@/components/forms/form-alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { BrandSummary } from "@/lib/types";
import { deleteBrand } from "../actions";

export function DeleteBrand({ brand }: { brand: BrandSummary }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const blocked = brand.productCount > 0;

  const confirm = () =>
    startTransition(async () => {
      const result = await deleteBrand(brand.id);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setOpen(false);
      toast.success(`${brand.name} deleted`);
    });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(undefined);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Delete ${brand.name}`} className="text-rust hover:bg-rust/8 hover:text-rust">
          <Trash2 aria-hidden />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? `${brand.name} still has products` : `Delete ${brand.name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {blocked
              ? `Delete its ${brand.productCount} ${brand.productCount === 1 ? "product" : "products"} or move them to another brand first.`
              : "This can't be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FormAlert status={error ? "error" : "idle"} message={error} />
        <AlertDialogFooter>
          {blocked ? (
            <>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <Button asChild>
                <Link href={`/admin/products?brand=${brand.id}`}>See its products</Link>
              </Button>
            </>
          ) : (
            <>
              <AlertDialogCancel disabled={pending}>Keep brand</AlertDialogCancel>
              <Button variant="destructive" onClick={confirm} disabled={pending || Boolean(error)}>
                {pending ? "Deleting…" : "Delete brand"}
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
