import { ean13Bars } from "@/lib/ean13";
import { cn } from "@/lib/utils";

/**
 * A real, scannable EAN-13 barcode drawn as SVG, with the human-readable
 * digits underneath in the standard 1 + 6 + 6 grouping.
 */
export function Barcode({ code, className }: { code: string; className?: string }) {
  const bars = ean13Bars(code);
  // 11 modules of quiet zone either side, as the standard requires.
  const quiet = 11;
  const width = 95 + quiet * 2;
  const guards = new Set([0, 2, 46, 48, 92, 94]);
  return (
    <svg
      viewBox={`0 0 ${width} 66`}
      role="img"
      aria-label={`Barcode ${code}`}
      className={cn("block", className)}
      shapeRendering="crispEdges"
    >
      <rect width={width} height="66" fill="#fff" />
      {bars.map(([start, w]) => (
        <rect
          key={start}
          x={start + quiet}
          y="4"
          width={w}
          // Guard bars run longer, as on a printed label.
          height={guards.has(start) ? 54 : 48}
          fill="#1a1f1c"
        />
      ))}
      <g fontFamily="var(--font-inter), sans-serif" fontSize="8" fill="#1a1f1c" textAnchor="middle">
        <text x={quiet - 5} y="62">{code[0]}</text>
        <text x={quiet + 3 + 21} y="62" letterSpacing="1.6">{code.slice(1, 7)}</text>
        <text x={quiet + 50 + 21} y="62" letterSpacing="1.6">{code.slice(7)}</text>
      </g>
    </svg>
  );
}
