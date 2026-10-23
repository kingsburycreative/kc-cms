"use client";

import { useMemo } from "react";
import { useOptionalRepoHeader } from "@/components/repo/repo-header-context";

// Sets the repo header, which carries the phone menu button, for pages that have no header of their own.
export function PageHeader({ title }: { title: string }) {
  const header = useMemo(() => <h1 className="text-lg font-semibold">{title}</h1>, [title]);
  useOptionalRepoHeader({ header });
  return null;
}
