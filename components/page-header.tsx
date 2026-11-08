import { cn } from "@/lib/utils";

/** Page title, one line of context, and the page's main actions. */
export function PageHeader({
  title,
  description,
  actions,
  back,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {back}
        <h1 className="text-2xl font-semibold sm:text-[1.9375rem]">{title}</h1>
        {description && <p className="mt-2 max-w-[60ch] text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 sm:shrink-0">{actions}</div>}
    </div>
  );
}
