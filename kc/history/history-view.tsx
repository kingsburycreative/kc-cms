"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useConfig } from "@/contexts/config-context";
import { recentEdits, type FeedItem, type RecentEdit } from "../dashboard.ts";
import { PageHeader } from "../page-header.tsx";
import { diffEntry, type EntryDiff } from "./diff.ts";

type Node = { type?: string; name?: string; path?: string; fields?: any[]; items?: Node[] };

const flatten = (nodes: Node[]): Node[] =>
  nodes.flatMap((node) => (node.type === "group" ? flatten(node.items ?? []) : [node]));

function schemaFor(object: any, path: string): Node | undefined {
  return flatten(object?.content ?? []).find(
    (node) => node.path && (node.type === "file" ? node.path === path : path.startsWith(node.path)),
  );
}

const show = (value: unknown) =>
  value === null || value === undefined ? "" : typeof value === "string" ? value : JSON.stringify(value);

const when = (date: string | null) => (date ? new Date(date).toLocaleDateString() : "");

export function SiteHistory() {
  const { config } = useConfig();
  const [edits, setEdits] = useState<(RecentEdit & { sha?: string })[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!config) return;
    let cancelled = false;
    fetch(`/api/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/history?limit=50`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("feed"))))
      .then((body) => {
        if (cancelled) return;
        const items: FeedItem[] = body.data ?? [];
        const edits = recentEdits(items, items.length, config.object);
        setEdits(edits.map((edit, i) => ({ ...edit, sha: items[i].sha })));
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.owner, config?.repo, config?.branch]);

  if (!config) return null;
  const base = `/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/history/entry`;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6">
      <PageHeader title="History" />
      <h1 className="text-xl font-semibold">History</h1>
      {failed
        ? <p className="text-sm text-muted-foreground">The history could not be loaded.</p>
        : edits === null
          ? <p className="text-sm text-muted-foreground">Loading the history</p>
          : edits.length === 0
            ? <p className="text-sm text-muted-foreground">Nothing has been edited yet.</p>
            : (
              <ul className="divide-y rounded-md border">
                {edits.map((edit, index) => (
                  <li key={`${edit.sha}-${index}`}>
                    <Link
                      href={`${base}?path=${encodeURIComponent(edit.path)}&sha=${encodeURIComponent(edit.sha ?? "")}`}
                      className="flex flex-col gap-0.5 p-3 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 min-[520px]:flex-row min-[520px]:items-baseline min-[520px]:gap-4"
                    >
                      <span className="font-medium">{edit.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {when(edit.date)}
                        {edit.authorName ? ` by ${edit.authorName}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
    </div>
  );
}

async function readEntry(config: any, name: string, path: string, ref: string | null) {
  if (!ref) return null;
  const url = `/api/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/entries/${encodeURIComponent(path)}?name=${encodeURIComponent(name)}&ref=${encodeURIComponent(ref)}`;
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("entry");
  return (await response.json()).data?.contentObject ?? null;
}

export function EntryHistory({ path, sha }: { path: string; sha: string }) {
  const { config } = useConfig();
  const [diff, setDiff] = useState<EntryDiff | null>(null);
  const [meta, setMeta] = useState<{ date: string | null; authorName: string } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!config || !path || !sha) return;
    const schema = schemaFor(config.object, path);
    if (!schema?.name) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const feed = await fetch(`/api/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/history?limit=100`);
      if (!feed.ok) throw new Error("feed");
      const items: any[] = (await feed.json()).data ?? [];
      const item = items.find((candidate) => candidate.sha === sha);
      if (!item) throw new Error("missing");
      const parent: string | null = item.parentSha ?? item.parents?.[0]?.sha ?? null;
      const [after, before] = await Promise.all([
        readEntry(config, schema.name!, path, sha),
        readEntry(config, schema.name!, path, parent),
      ]);
      if (cancelled) return;
      const [edit] = recentEdits([item], 1, config.object);
      setMeta({ date: edit.date, authorName: edit.authorName });
      setDiff(diffEntry(before, after, schema.fields ?? []));
    })().catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.owner, config?.repo, config?.branch, path, sha]);

  if (!config) return null;
  const back = `/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/history`;
  const target = schemaFor(config.object, path);
  const editor = `/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}`;
  const restore = target?.name
    ? target.type === "file"
      ? `${editor}/file/${encodeURIComponent(target.name)}?restore=${encodeURIComponent(sha)}`
      : `${editor}/collection/${encodeURIComponent(target.name)}/edit/${encodeURIComponent(path)}?restore=${encodeURIComponent(sha)}`
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6">
      <PageHeader title="History" />
      <Link href={back} className="text-sm underline">All history</Link>
      <h1 className="text-xl font-semibold break-words">{path.split("/").pop()}</h1>
      {meta && (
        <p className="text-sm text-muted-foreground">
          {when(meta.date)}
          {meta.authorName ? ` by ${meta.authorName}` : ""}
        </p>
      )}
      {restore && <Link href={restore} className="block text-sm underline">Restore this version</Link>}
      {failed
        ? <p className="text-sm text-muted-foreground">This edit could not be loaded.</p>
        : diff === null
          ? <p className="text-sm text-muted-foreground">Loading this edit</p>
          : diff.fields.length === 0 && diff.body.length === 0
            ? <p className="text-sm text-muted-foreground">No visible changes in this edit.</p>
            : (
              <>
                {diff.fields.length > 0 && (
                  <ul className="space-y-3">
                    {diff.fields.map((change, index) => (
                      <li key={`${change.label}-${index}`} className="rounded-md border p-3">
                        <div className="mb-2 text-sm font-medium">{change.label}</div>
                        {change.kind !== "added" && (
                          <div className="break-words bg-red-50 p-2 text-sm text-red-900 line-through">{show(change.before)}</div>
                        )}
                        {change.kind !== "removed" && (
                          <div className="mt-1 break-words bg-green-50 p-2 text-sm text-green-900">{show(change.after)}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {diff.body.length > 0 && (
                  <section>
                    <h2 className="mb-2 text-lg font-semibold">Body</h2>
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border p-3 text-sm">
                      {diff.body.map((line, index) => (
                        <div
                          key={index}
                          className={line.kind === "added" ? "bg-green-50 text-green-900" : line.kind === "removed" ? "bg-red-50 text-red-900 line-through" : ""}
                        >
                          {line.text || " "}
                        </div>
                      ))}
                    </pre>
                  </section>
                )}
              </>
            )}
    </div>
  );
}
