// Stat tile after the ui-library stat card: the number first, a plain-case label
// under it, then an optional change and sparkline. Two columns from 390px up;
// wider layouts come from the dashboard's container width.
import type { ReactNode } from "react";
import { CountUp } from "./insights/chart.tsx";
import { TILE_COULD_NOT_LOAD, type PanelState } from "./panel-state.ts";
import { sparkPath, type RangeChange } from "./dashboard-visits.ts";

export const NOT_AVAILABLE = "Not available";
export const STAT_GRID = "grid grid-cols-2 gap-3 @[480px]:grid-cols-3 @[900px]:grid-cols-1";
export const STAT_TILE_COUNT = 3;
const CARD = "flex min-w-0 flex-col gap-1 rounded-lg border p-4";
const BLOCK = "rounded kc-shimmer";

function delta(change: RangeChange["change"]): ReactNode {
  if (change === null) return "";
  if (change === "new") return <span className="text-sm text-muted-foreground">None the 30 days before</span>;
  const up = change >= 0;
  return (
    <span className={`text-sm ${up ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span> {Math.abs(change)}%
      <span className="sr-only"> {up ? "up" : "down"} on the 30 days before</span>
    </span>
  );
}

export function StatTile({ label, value, change, spark, state }: { label: string; value: number | string | null; change?: RangeChange["change"]; spark?: number[]; state?: PanelState }) {
  const path = sparkPath(spark ?? []);
  if (state && state.kind !== "data") {
    return (
      <li className={CARD}>
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">{TILE_COULD_NOT_LOAD}</span>
      </li>
    );
  }
  return (
    <li className={CARD}>
      <span className="text-2xl font-semibold tabular-nums">
        {value === null ? <span className="text-base font-normal text-muted-foreground">{NOT_AVAILABLE}</span> : typeof value === "number" ? <CountUp value={value} /> : value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
      {change !== undefined && delta(change)}
      <svg data-spark viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true" focusable="false" className="mt-1 h-9 w-full text-primary">
        {path && <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />}
      </svg>
    </li>
  );
}

// Same grid and the same count as the real tiles, each at the loaded shape.
export function StatTileSkeleton() {
  return (
    <ul className={STAT_GRID}>
      {Array.from({ length: STAT_TILE_COUNT }, (_, i) => (
        <li key={i} className={CARD}>
          <div className={`h-8 w-16 ${BLOCK}`} />
          <div className={`h-5 w-20 ${BLOCK}`} />
          <div className={`mt-1 h-9 w-full ${BLOCK}`} />
        </li>
      ))}
    </ul>
  );
}
