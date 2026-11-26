"use client";

import { Button } from "@/components/ui/button";

// Card 112: the page changed on the site while the client has unsaved edits.
// A banner, not a dialog, so typing carries on underneath it.
export const UPDATE_BANNER_TEXT = "This page was updated after you opened it. Load the latest version and your unsaved changes will stay.";
export const UPDATE_BANNER_ACTION = "Load the latest";
export const CONFLICT_FIELD_NOTE = "This also changed on the site. We kept your text. Check it before you save.";

export function conflictNote(conflicts: string[]): string | null {
  if (conflicts.length === 0) return null;
  return `These fields also changed on the site. We kept your text: ${conflicts.join(", ")}. Check them before you save.`;
}

export function UpdateBanner({ onLoad }: { onLoad: () => void }) {
  return (
    <div role="status" className="mx-auto mb-4 flex w-full max-w-screen-md flex-col gap-2 rounded-md border p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p>{UPDATE_BANNER_TEXT}</p>
      <Button type="button" size="sm" onClick={onLoad}>{UPDATE_BANNER_ACTION}</Button>
    </div>
  );
}
