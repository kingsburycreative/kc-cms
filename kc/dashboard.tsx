"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConfig } from "@/contexts/config-context";
import { useUser } from "@/contexts/user-context";
import { hasGithubIdentity } from "@/lib/authz-shared";
import { isConfigEnabled } from "@/lib/config";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "./page-header.tsx";
import { quickActions, recentEdits, type RecentEdit } from "./dashboard.ts";
import { dashboardName, siteUrl } from "./client-view.ts";

const LIMIT = 8;

type Props = { hasInsights?: boolean; visits?: ReactNode; searchHealth?: ReactNode; version?: ReactNode };

export function Dashboard({ hasInsights = false, visits, searchHealth, version }: Props) {
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

  const actions = quickActions(object, { owner: config.owner, repo: config.repo, branch: config.branch, hasInsights });
  const site = siteUrl(object.kc);

  return (
    <div className="@container mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-2 @[600px]:flex-row @[600px]:items-baseline @[600px]:justify-between">
        <div>
          <PageHeader title="Dashboard" />
          <p className="text-sm text-muted-foreground">{dashboardName(object.kc, config.repo)}</p>
        </div>
        {/* Publish status (card 43) goes here. */}
        {site && (
          <a href={site} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline">
            See live site
          </a>
        )}
      </header>
      {actions.length > 0 && (
        <nav aria-label="Quick actions">
          <ul className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <li key={action.key}>
                <Link
                  href={action.href}
                  className="inline-flex min-h-11 items-center rounded-md bg-primary/10 px-3 text-sm font-medium text-primary hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {action.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="grid grid-cols-1 gap-4 @[900px]:grid-cols-3">
        <div className="@[900px]:col-span-2">{visits}</div>
        <div>{searchHealth}</div>
      </div>
      {hasContent && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Recent changes</h2>
          {failed
            ? <p className="text-sm text-muted-foreground">Recent changes could not be loaded.</p>
            : edits === null
              ? (
                <ul aria-busy="true" aria-label="Loading recent changes" className="divide-y rounded-md border">
                  {Array.from({ length: LIMIT }, (_, index) => (
                    <li key={index} className="flex flex-col gap-1.5 p-3 min-[520px]:flex-row min-[520px]:items-center min-[520px]:gap-4">
                      <span className="h-4 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                      <span className="h-3 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    </li>
                  ))}
                </ul>
              )
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
      {version}
    </div>
  );
}
