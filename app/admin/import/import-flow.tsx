"use client";

import { Check, Download, FileSpreadsheet, Loader2, TriangleAlert, Upload } from "lucide-react";
import Link from "next/link";
import { useId, useState, useTransition } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ImportReport } from "@/lib/types";
import { importProducts } from "../actions";

type Step = "choose" | "review" | "done";
const STEPS: { key: Step; label: string }[] = [
  { key: "choose", label: "Choose a file" },
  { key: "review", label: "Review" },
  { key: "done", label: "Import" },
];

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function ImportFlow() {
  const [step, setStep] = useState<Step>("choose");
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const run = (chosen: File, dryRun: boolean) =>
    startTransition(async () => {
      setError(undefined);
      const form = new FormData();
      form.append("file", chosen);
      const result = await importProducts(form, dryRun);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setReport(result.report);
      setStep(dryRun ? "review" : "done");
    });

  const reset = () => {
    setStep("choose");
    setFile(null);
    setReport(null);
    setError(undefined);
  };

  return (
    <div className="mt-8 flex flex-col gap-8">
      <Stepper current={step} />
      <FormAlert status={error ? "error" : "idle"} message={error} />

      {step === "choose" && (
        <ChooseFile
          file={file}
          pending={pending}
          onChoose={(chosen) => {
            setFile(chosen);
            setError(undefined);
          }}
          onCheck={() => file && run(file, true)}
        />
      )}

      {step === "review" && report && file && (
        <Review report={report} fileName={file.name} pending={pending} onImport={() => run(file, false)} onBack={reset} />
      )}

      {step === "done" && report && (
        <section aria-labelledby="done-title" className="flex flex-col items-start gap-4 rounded-xl border bg-card px-6 py-8">
          <span className="flex size-10 items-center justify-center rounded-full bg-moss/15 text-forest">
            <Check className="size-5" aria-hidden />
          </span>
          <div>
            <h2 id="done-title" className="text-xl font-semibold">
              Imported {plural(report.created + report.updated, "product")}
            </h2>
            <p className="mt-1 text-ink-muted">
              {plural(report.created, "new product")} added, {plural(report.updated, "product")} updated
              {report.brandsCreated.length > 0 && `, ${plural(report.brandsCreated.length, "new brand")} created`}.
              {report.failed > 0 && ` ${plural(report.failed, "row")} with problems ${report.failed === 1 ? "was" : "were"} skipped.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/admin/products">View products</Link>
            </Button>
            <Button variant="outline" onClick={reset}>
              Import another file
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function Stepper({ current }: { current: Step }) {
  const index = STEPS.findIndex((item) => item.key === current);
  return (
    <ol className="flex items-center gap-2 text-sm sm:gap-3" aria-label="Import progress">
      {STEPS.map((item, i) => {
        const done = i < index || current === "done";
        const active = i === index && current !== "done";
        return (
          <li key={item.key} className="flex items-center gap-2 sm:gap-3" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular",
                done && "border-forest bg-forest text-paper",
                active && "border-forest text-forest",
                !done && !active && "border-line-strong text-ink-muted",
              )}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <span className={cn("hidden sm:inline", active ? "font-medium text-ink" : "text-ink-muted")}>
              {item.label}
            </span>
            {done && <span className="sr-only">(done)</span>}
            {i < STEPS.length - 1 && <span aria-hidden className="h-px w-6 bg-line-strong sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}

function ChooseFile({
  file,
  pending,
  onChoose,
  onCheck,
}: {
  file: File | null;
  pending: boolean;
  onChoose: (file: File) => void;
  onCheck: () => void;
}) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  return (
    <section aria-label="Choose a file" className="flex flex-col gap-5">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const dropped = event.dataTransfer.files[0];
          if (dropped) onChoose(dropped);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed bg-card px-6 py-10 text-center transition-colors",
          "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo",
          dragging ? "border-indigo bg-accent" : "border-line-strong hover:border-ink-muted",
        )}
      >
        {file ? (
          <>
            <FileSpreadsheet className="size-9 text-forest" strokeWidth={1.5} aria-hidden />
            <span className="font-medium break-all">{file.name}</span>
            <span className="text-sm text-ink-muted tabular">
              {(file.size / 1024).toFixed(file.size < 10240 ? 1 : 0)} KB. Choose another file to replace it.
            </span>
          </>
        ) : (
          <>
            <Upload className="size-9 text-moss" strokeWidth={1.5} aria-hidden />
            <span className="font-medium">
              <span className="hidden sm:inline">Drop a CSV file here, or </span>
              <span className="text-indigo underline decoration-indigo/40 underline-offset-4">
                <span className="sm:hidden">Choose a CSV file</span>
                <span className="hidden sm:inline">choose one</span>
              </span>
            </span>
            <span className="text-sm text-ink-muted">Up to 2 MB and 5,000 rows.</span>
          </>
        )}
        <input
          id={inputId}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => {
            const chosen = event.target.files?.[0];
            if (chosen) onChoose(chosen);
            event.target.value = "";
          }}
        />
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="link" className="self-start">
          <a href="/admin/import/template" download>
            <Download aria-hidden />
            Download the template
          </a>
        </Button>
        <Button onClick={onCheck} disabled={!file || pending}>
          {pending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Checking file…
            </>
          ) : (
            "Check file"
          )}
        </Button>
      </div>

      <details className="rounded-lg border bg-card px-4 py-3 text-sm [&_summary]:min-h-8">
        <summary className="cursor-pointer font-medium">What the file needs</summary>
        <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-ink-muted">
          <li>
            Required columns: <strong className="font-medium text-ink">gtin, sku, name, brandName</strong>.
          </li>
          <li>Barcodes can be 8, 12, 13 or 14 digits. Keep leading zeros by formatting the column as text.</li>
          <li>For figures, fill both carbonScoreGrams and recyclabilityPercent, and set verified to true or false.</li>
          <li>Brands that don&apos;t exist yet are created for you.</li>
          <li>Nothing is saved until you&apos;ve reviewed the check.</li>
        </ul>
      </details>
    </section>
  );
}

function Review({
  report,
  fileName,
  pending,
  onImport,
  onBack,
}: {
  report: ImportReport;
  fileName: string;
  pending: boolean;
  onImport: () => void;
  onBack: () => void;
}) {
  const writable = report.created + report.updated;

  return (
    <section aria-labelledby="review-title" className="flex flex-col gap-6">
      <div>
        <h2 id="review-title" className="text-xl font-semibold">
          {writable > 0 ? `Ready to import ${plural(writable, "product")}` : "Nothing in this file can be imported"}
        </h2>
        <p className="mt-1 text-ink-muted">
          Checked {plural(report.totalRows, "row")} in <span className="break-all">{fileName}</span>. Nothing has been saved yet.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-line sm:grid-cols-4">
        {[
          ["New products", report.created],
          ["Updates", report.updated],
          ["New brands", report.brandsCreated.length],
          ["Rows to fix", report.failed],
        ].map(([label, value]) => (
          <div key={label} className="bg-card px-4 py-3">
            <dt className="text-sm text-ink-muted">{label}</dt>
            <dd
              className={cn(
                "font-heading text-2xl font-semibold tabular",
                label === "Rows to fix" && Number(value) > 0 && "text-rust",
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {report.brandsCreated.length > 0 && (
        <p className="text-sm">
          <span className="text-ink-muted">New brands: </span>
          {report.brandsCreated.join(", ")}
        </p>
      )}

      {report.errors.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 font-sans text-base font-semibold tracking-normal">
            <TriangleAlert className="size-4 text-rust" aria-hidden />
            {plural(report.errors.length, "row")} will be skipped
          </h3>
          <p className="text-sm text-ink-muted">
            Fix these lines in your spreadsheet and import the file again; rows already imported are just updated.
          </p>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b bg-wash/60 text-ink-muted">
                <tr>
                  <th scope="col" className="w-20 px-4 py-2.5 font-medium">Line</th>
                  <th scope="col" className="w-40 px-4 py-2.5 font-medium">Barcode</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">What to fix</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {report.errors.map((row) => (
                  <tr key={row.row} className="align-top">
                    <td className="px-4 py-3 tabular">{row.row}</td>
                    <td className="px-4 py-3 tabular text-ink-muted">{row.gtin ?? "Missing"}</td>
                    <td className="px-4 py-3">
                      <ul className="flex flex-col gap-1">
                        {row.messages.map((message) => (
                          <li key={message}>{message}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onBack} disabled={pending}>
          Choose a different file
        </Button>
        {writable > 0 && (
          <Button onClick={onImport} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Importing…
              </>
            ) : (
              `Import ${plural(writable, "product")}`
            )}
          </Button>
        )}
      </div>
    </section>
  );
}
