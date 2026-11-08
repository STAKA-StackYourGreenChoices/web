import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** The message above a form after it's submitted. Announced to screen readers. */
export function FormAlert({
  status,
  message,
  className,
}: {
  status: "idle" | "error" | "success";
  message?: string;
  className?: string;
}) {
  if (!message || status === "idle") return null;
  const isError = status === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm",
        isError ? "border-rust/30 bg-rust/5 text-rust" : "border-moss/40 bg-moss/10 text-forest",
        className,
      )}
    >
      {isError ? (
        <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
      ) : (
        <CircleCheck className="mt-px size-4 shrink-0" aria-hidden />
      )}
      <p>{message}</p>
    </div>
  );
}
