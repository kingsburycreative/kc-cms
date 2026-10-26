"use client";

import { useMemo, type ReactNode } from "react";
import { useOptionalRepoHeader } from "@/components/repo/repo-header-context";

// Sets the repo header, which carries the phone menu button, for pages that have no header of their own.
// An optional action sits at the right of the bar.
export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  const header = useMemo(
    () => action
      ? (
        <div className="flex items-center justify-between gap-2">
          <h1 className="min-w-0 truncate text-lg font-semibold">{title}</h1>
          <div className="shrink-0">{action}</div>
        </div>
      )
      : <h1 className="text-lg font-semibold">{title}</h1>,
    [title, action],
  );
  useOptionalRepoHeader({ header });
  return null;
}
