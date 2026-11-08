"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

/** A form's primary button: shows a spinner and its in-progress label while pending. */
export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant,
  size,
  disabled,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className={className}
      variant={variant}
      size={size}
      disabled={pending || disabled}
      aria-disabled={pending || disabled}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
