"use client";
// The analytics IDs form in the staff strip. A plain form posting to a server
// action, so it saves without JS too.
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveInsightsKeysAction } from "./keys-action.ts";
import type { InsightsSources } from "./map.ts";

const FIELDS = [
  { name: "ga", label: "GA4 property ID", hint: "Digits only." },
  { name: "cf", label: "Cloudflare site tag", hint: "Letters, digits and dashes." },
  { name: "pages", label: "Pages project", hint: "Lowercase letters, digits and dashes." },
] as const;

export function InsightsKeysForm({ owner, repo, sources }: { owner: string; repo: string; sources: InsightsSources | null }) {
  const [result, action, pending] = useActionState(saveInsightsKeysAction, null);
  // After a save, show what was stored: React 19 resets the form to defaultValue.
  const values: Partial<Record<(typeof FIELDS)[number]["name"], string | null>> = result?.saved ?? sources ?? {};
  return (
    <form action={action} className="mt-4 border-t pt-4">
      <h3 className="text-sm font-medium">Analytics IDs</h3>
      <input type="hidden" name="owner" value={owner} />
      <input type="hidden" name="repo" value={repo} />
      <div className="mt-2 grid gap-3 @[600px]:grid-cols-3">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label htmlFor={`keys-${field.name}`} className="block">{field.label}</label>
            <Input
              key={`${field.name}-${values[field.name] ?? ""}`}
              id={`keys-${field.name}`}
              name={field.name}
              defaultValue={values[field.name] ?? ""}
              aria-describedby={`keys-${field.name}-hint`}
              aria-invalid={result?.field === field.name || undefined}
              autoComplete="off"
              className="mt-1 min-h-11"
            />
            <p id={`keys-${field.name}-hint`} className="mt-1 text-muted-foreground">{field.hint}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-muted-foreground">Leave a field empty to clear it.</p>
      <Button type="submit" disabled={pending} className="mt-3 min-h-11">Save IDs</Button>
      <p role="status" className={`mt-2 ${result && result.status !== 200 ? "text-destructive" : ""}`}>{result?.message}</p>
    </form>
  );
}
