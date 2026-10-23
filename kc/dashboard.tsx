"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConfig } from "@/contexts/config-context";
import { useUser } from "@/contexts/user-context";
import { hasGithubIdentity } from "@/lib/authz-shared";
import { isConfigEnabled } from "@/lib/config";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "./page-header.tsx";
import { dashboardTiles, recentEdits, type RecentEdit } from "./dashboard.ts";

const LIMIT = 8;

export function Dashboard({ hasInsights = false }: { hasInsights?: boolean }) {
  const { config } = useConfig();
  const { user } = useUser();
  const router = useRouter();
  const [edits, setEdits] = useState<RecentEdit[] | null>(null);
  const [failed, setFailed] = useState(false);

  const object = (config?.object ?? {}) as any;
  const hasContent = Array.isArray(object.content) && object.content.length > 0;
  const hasMedia = Array.isArray(object.media) && object.media.length > 0;

  useEffect(() => {
    if (!config || !hasContent) return;
    let cancelled = false;
    fetch(`/api/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/history?limit=${LIMIT}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("feed"))))
      .then((body) => {
        if (!cancelled) setEdits(recentEdits(body.data ?? [], LIMIT, object));
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.owner, config?.repo, config?.branch, hasContent]);

  const toConfiguration = !!config && !hasContent && !hasMedia && hasGithubIdentity(user) && isConfigEnabled(object);
  useEffect(() => {
    if (toConfiguration && config) {
      router.replace(`/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/configuration`);
    }
  }, [toConfiguration, config, router]);

  if (!config) return null;

  if (!hasContent && !hasMedia) {
    return hasGithubIdentity(user) && isConfigEnabled(object)
      ? null
      : hasGithubIdentity(user)
        ? (
          <Empty className="absolute inset-0 border-0 rounded-none">
            <EmptyHeader>
              <EmptyTitle>Configuration unavailable</EmptyTitle>
              <EmptyDescription>This repository is not configured, and configuration access is disabled here. Edit &quot;.pages.yml&quot; on GitHub if you think this is a mistake.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                className={buttonVariants({ variant: "default" })}
                href={`https://github.com/${config.owner}/${config.repo}/edit/${encodeURIComponent(config.branch)}/.pages.yml`}
              >
                Edit configuration on GitHub
              </Link>
            </EmptyContent>
          </Empty>
        )
        : (
          <Empty className="absolute inset-0 border-0 rounded-none">
            <EmptyHeader>
              <EmptyTitle>Repository not configured</EmptyTitle>
              <EmptyDescription>This repository does not have a &quot;.pages.yml&quot; file yet. Ask a GitHub admin to initialize the configuration first.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        );
  }

  const tiles = dashboardTiles(object, { owner: config.owner, repo: config.repo, branch: config.branch, hasInsights });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-4 md:p-6">
      
      <PageHeader title="Dashboard" />
      <ul className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <li key={tile.key}>
            <Link
              href={tile.href}
              className="block rounded-md border p-4 font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {tile.label}
            </Link>
          </li>
        ))}
      </ul>
      {hasContent && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Recent edits</h2>
          {failed
            ? <p className="text-sm text-muted-foreground">Recent edits could not be loaded.</p>
            : edits === null
              ? <p className="text-sm text-muted-foreground">Loading recent edits</p>
              : edits.length === 0
                ? <p className="text-sm text-muted-foreground">Nothing has been edited yet.</p>
                : (
                  <ul className="divide-y rounded-md border">
                    {edits.map((edit, index) => (
                      <li key={`${edit.path}-${edit.date}-${index}`} className="flex flex-col gap-0.5 p-3 min-[520px]:flex-row min-[520px]:items-baseline min-[520px]:gap-4">
                        <span className="font-medium">{edit.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {edit.date ? new Date(edit.date).toLocaleDateString() : ""}
                          {edit.authorName ? ` by ${edit.authorName}` : ""}
                        </span>
                        <span className="truncate text-xs text-muted-foreground min-[520px]:ml-auto">{edit.path}</span>
                      </li>
                    ))}
                  </ul>
                )}
        </section>
      )}
    </div>
  );
}
