"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { deleteProduct } from "../actions";

export function DeleteProduct({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setOpen(false);
      toast.success(`${productName} deleted`);
      router.push("/admin/products");
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
        <Button variant="destructive">
          <Trash2 aria-hidden />
          Delete product
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {productName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Shoppers will no longer find it by scanning. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FormAlert status={error ? "error" : "idle"} message={error} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep product</AlertDialogCancel>
          {/* A plain Button, so the dialog stays open to show an error */}
          <Button variant="destructive" onClick={confirm} disabled={pending || Boolean(error)}>
            {pending ? "Deleting…" : "Delete product"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
