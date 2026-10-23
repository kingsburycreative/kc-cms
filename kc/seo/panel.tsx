"use client";

import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { DESCRIPTION_MAX, TITLE_MAX, hasSeoFields, runChecks, snippet } from "./rules.ts";

const text = (value: unknown) => (typeof value === "string" ? value : "");

export function SeoPanel({ fields }: { fields: unknown }) {
  const { control } = useFormContext();
  const [title, description, body] = useWatch({ control, name: ["title", "description", "body"] });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(window.matchMedia("(min-width: 1280px)").matches);
  }, []);

  if (!hasSeoFields(fields)) return null;

  const t = text(title);
  const d = text(description);
  const checks = runChecks({ title: t, description: d, body: text(body) });

  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="rounded-md border p-4 min-[1280px]:sticky min-[1280px]:top-4"
    >
      <summary className="cursor-pointer font-medium">How this page shows up in search</summary>
      <div className="mt-4 space-y-4">
        <div className="space-y-1 text-sm">
          <p className="font-medium text-muted-foreground">Preview in search results</p>
          <p className="break-words text-base text-blue-700">{snippet(t, TITLE_MAX) || "Page title"}</p>
          <p className="break-words text-muted-foreground">
            {snippet(d, DESCRIPTION_MAX) || "The text under the link in search results"}
          </p>
        </div>
        <ul className="space-y-2 text-sm">
          {checks.map((c) => (
            <li key={c.key} className="flex gap-2">
              <span className={c.ok ? "font-medium text-green-700" : "font-medium text-amber-700"}>
                {c.ok ? "Good" : "Fix"}
              </span>
              <span>
                <span className="font-medium">{c.label}.</span> {c.message}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
