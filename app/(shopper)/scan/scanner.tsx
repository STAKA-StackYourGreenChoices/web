"use client";

import type { IScannerControls } from "@zxing/browser";
import { Camera, CameraOff, Keyboard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { parseScan } from "@/lib/scan";
import { cn } from "@/lib/utils";

type CameraState =
  | { kind: "starting" }
  | { kind: "scanning" }
  | { kind: "found"; gtin: string }
  | { kind: "blocked" }
  | { kind: "unavailable"; reason: string }
  | { kind: "stopped" };

export function Scanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [camera, setCamera] = useState<CameraState>({ kind: "starting" });
  const [notice, setNotice] = useState<string>();
  const [typedError, setTypedError] = useState<string>();

  const stop = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
  }, []);

  const open = useCallback(
    (gtin: string) => {
      stop();
      router.push(`/products/${gtin}`);
    },
    [router, stop],
  );

  const start = useCallback(async () => {
    setNotice(undefined);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera({
        kind: "unavailable",
        reason: window.isSecureContext
          ? "This browser can't use the camera."
          : "The camera only works over a secure (https) connection.",
      });
      return;
    }
    setCamera({ kind: "starting" });

    try {
      // Loaded on demand: the decoder is only needed on this screen.
      const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
        import("@zxing/browser"),
        import("@zxing/library"),
      ]);
      const hints = new Map([
        [
          DecodeHintType.POSSIBLE_FORMATS,
          [
            BarcodeFormat.EAN_13,
            BarcodeFormat.EAN_8,
            BarcodeFormat.UPC_A,
            BarcodeFormat.UPC_E,
            BarcodeFormat.QR_CODE,
          ],
        ],
      ]);
      const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 150 });
      if (!videoRef.current) return;

      controlsRef.current = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } }, audio: false },
        videoRef.current,
        (result) => {
          if (!result) return;
          const parsed = parseScan(result.getText());
          if (!parsed.ok) {
            // Keep scanning; tell the person why that code was ignored.
            setNotice(parsed.reason);
            return;
          }
          navigator.vibrate?.(40);
          setCamera({ kind: "found", gtin: parsed.gtin });
          open(parsed.gtin);
        },
      );
      setCamera((current) => (current.kind === "found" ? current : { kind: "scanning" }));
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") setCamera({ kind: "blocked" });
      else if (name === "NotFoundError" || name === "OverconstrainedError")
        setCamera({ kind: "unavailable", reason: "No camera was found on this device." });
      else if (name === "NotReadableError")
        setCamera({ kind: "unavailable", reason: "Another app is using the camera. Close it and try again." });
      else setCamera({ kind: "unavailable", reason: "The camera couldn't start." });
    }
  }, [open]);

  // Start the camera once the page is on screen; deferred a tick so the
  // state changes inside start() don't run synchronously in the effect.
  useEffect(() => {
    const timer = setTimeout(() => void start(), 0);
    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [start, stop]);

  const live = camera.kind === "scanning" || camera.kind === "starting" || camera.kind === "found";

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <section aria-label="Camera">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-forest-deep sm:aspect-video">
          <video
            ref={videoRef}
            muted
            playsInline
            aria-hidden
            className={cn("size-full object-cover transition-opacity", live ? "opacity-100" : "opacity-0")}
          />

          {live && (
            /* Aiming frame: a wide box suits 1D barcodes and still fits a QR code */
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-[38%] w-[78%] max-w-[440px] rounded-lg shadow-[0_0_0_100vmax_rgb(23_48_31_/_0.45)]">
                {["top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-lg", "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-lg", "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-lg", "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-lg"].map((corner) => (
                  <span key={corner} className={cn("absolute size-7 border-paper", corner)} />
                ))}
                {camera.kind === "scanning" && (
                  <span className="absolute inset-x-3 top-1/2 h-0.5 rounded-full bg-moss/90 motion-safe:animate-pulse" />
                )}
              </div>
            </div>
          )}

          {!live && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-paper">
              <CameraOff className="size-9 text-paper/80" strokeWidth={1.5} aria-hidden />
              <p className="max-w-[36ch]">
                {camera.kind === "blocked"
                  ? "Camera access is blocked. Allow it in your browser's site settings, then try again. Or type the number."
                  : camera.kind === "unavailable"
                    ? `${camera.reason} Type the barcode number instead.`
                    : "Camera is off."}
              </p>
              {camera.kind !== "unavailable" && (
                <Button variant="secondary" onClick={() => void start()}>
                  <Camera aria-hidden />
                  {camera.kind === "blocked" ? "Try again" : "Turn camera on"}
                </Button>
              )}
            </div>
          )}

          {camera.kind === "starting" && (
            <div className="absolute inset-0 flex items-center justify-center text-paper">
              <Loader2 className="size-7 animate-spin" aria-hidden />
            </div>
          )}
        </div>

        <p className="mt-3 min-h-6 text-sm text-ink-muted" role="status" aria-live="polite">
          {camera.kind === "found"
            ? `Found ${camera.gtin}. Opening the product…`
            : camera.kind === "scanning"
              ? (notice ?? "Looking for a barcode…")
              : camera.kind === "starting"
                ? "Starting the camera…"
                : ""}
        </p>
        {camera.kind === "scanning" && (
          <Button variant="ghost" size="sm" onClick={() => { stop(); setCamera({ kind: "stopped" }); }}>
            Turn camera off
          </Button>
        )}
      </section>

      <section aria-labelledby="type-title" className="rounded-xl border bg-card p-5">
        <h2 id="type-title" className="flex items-center gap-2 font-sans text-base font-semibold tracking-normal">
          <Keyboard className="size-4 text-ink-muted" aria-hidden />
          Type the number instead
        </h2>
        <form
          noValidate
          className="mt-4 flex flex-col gap-4"
          action={(formData) => {
            const parsed = parseScan(String(formData.get("code") ?? ""));
            if (!parsed.ok) {
              setTypedError(parsed.reason);
              return;
            }
            setTypedError(undefined);
            open(parsed.gtin);
          }}
        >
          <Field data-invalid={typedError ? true : undefined}>
            <FieldLabel htmlFor="field-code">Barcode number</FieldLabel>
            <Input
              id="field-code"
              name="code"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 8901234500019"
              className="tabular"
              aria-invalid={typedError ? true : undefined}
              aria-describedby={typedError ? "field-code-error" : "field-code-hint"}
            />
            {typedError ? (
              <FieldError id="field-code-error">{typedError}</FieldError>
            ) : (
              <FieldDescription id="field-code-hint">The digits printed under the bars.</FieldDescription>
            )}
          </Field>
          <SubmitButton pendingLabel="Looking up…" className="w-full">
            Look up product
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
