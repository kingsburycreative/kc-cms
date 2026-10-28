"use client";

import { useMemo, type ReactNode } from "react";
import { useOptionalRepoHeader } from "@/components/repo/repo-header-context";

// Sets the repo header, which carries the phone menu button, for pages that have no header of their own.
// Title first, then one subtitle line, then one kind of action. The action sits under the title on a phone
// and at the end of the row from 768px.
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  const header = useMemo(
    () => (
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="min-w-0">
          <h1 className="min-w-24 break-words text-lg font-semibold">{title}</h1>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    ),
    [title, subtitle, action],
  );
  useOptionalRepoHeader({ header });
  return null;
}
