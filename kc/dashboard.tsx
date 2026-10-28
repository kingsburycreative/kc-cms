"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConfig } from "@/contexts/config-context";
import { useUser } from "@/contexts/user-context";
import { hasGithubIdentity } from "@/lib/authz-shared";
import { isConfigEnabled } from "@/lib/config";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageHeader } from "./page-header.tsx";
import { quickActions, recentActivity, type Activity } from "./dashboard.ts";
import { clientName, siteUrl } from "./client-view.ts";
import { timeAgo } from "./publish/status.ts";
import { shortHref } from "./short-url.ts";
import { LIVE_SITE_NOT_SET_UP } from "./not-set-up.ts";

const LIMIT = 5;

type Props = {
  hasInsights?: boolean;
  publish?: ReactNode;
  visits?: ReactNode;
  searchHealth?: ReactNode;
  topLists?: ReactNode;
  version?: ReactNode;
  staffStrip?: ReactNode;
};

export function Dashboard({ hasInsights = false, publish, visits, searchHealth, topLists, version, staffStrip }: Props) {
  const { config } = useConfig();
  const { user } = useUser();
  const router = useRouter();
  const [edits, setEdits] = useState<Activity[] | null>(null);
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
        if (!cancelled) setEdits(recentActivity(body.data ?? [], LIMIT, object));
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
      router.replace(shortHref(`/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/configuration`));
    }
  }, [toConfiguration, config, router]);

  // Memoised: PageHeader pushes it into the repo header, and a new element each render would re-push forever.
  const site = siteUrl(object.kc);
  const liveSite = useMemo(() => (site ? <LiveSiteLink site={site} /> : <span className="inline-flex min-h-11 items-center text-sm text-muted-foreground">{LIVE_SITE_NOT_SET_UP}</span>), [site]);

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
  const staff = hasGithubIdentity(user);
  const now = new Date();
  const historyHref = shortHref(`/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/history`);

  return (
    <div className="@container mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <PageHeader title="Dashboard" subtitle={publish} action={liveSite} />
      <h1 className="text-2xl font-semibold tracking-tight">{clientName(object.kc, config.repo)}</h1>
      {actions.length > 0 && (
        <section aria-labelledby="actions-h">
          <h2 id="actions-h" className="sr-only">Add something new</h2>
          <ul className="flex flex-col gap-2 @[600px]:flex-row @[600px]:flex-wrap">
            {actions.map((action) => (
              <li key={action.key} className="flex flex-col @[600px]:block">
                <Button asChild variant="secondary" className="h-auto min-h-11">
                  <Link href={action.href}>
                    <span aria-hidden="true" className="text-primary">{action.key === "upload-pdf" ? "↑" : "+"}</span>
                    {action.label}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {visits}
      <div className="grid grid-cols-1 gap-4 @[900px]:grid-cols-2">
        {hasContent && (
          <RecentChanges failed={failed} items={edits} staff={staff} now={now} historyHref={historyHref} />
        )}
        {searchHealth}
      </div>
      {topLists}
      {version}
      {staffStrip}
    </div>
  );
}

// The one panel allowed to vanish here: no https kc.site, no link.
function LiveSiteLink({ site }: { site: string | null }) {
  if (!site) return null;
  return (
    <a href={site} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
      See live site<span aria-hidden="true">{"↗"}</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function RecentChanges({ failed, items, staff, now, historyHref }: { failed: boolean; items: Activity[] | null; staff: boolean; now: Date; historyHref: string }) {
  return (
    <section aria-labelledby="activity-h" className="rounded-lg border p-4">
      <h2 id="activity-h" className="text-base font-semibold">Recent changes</h2>
      {failed
        ? <p className="mt-2 text-sm text-muted-foreground">Recent changes couldn&apos;t load.</p>
        : items === null
          ? (
            <ul aria-busy="true" aria-label="Loading recent changes" className="mt-3 space-y-3">
              {Array.from({ length: LIMIT }, (_, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="size-8 shrink-0 rounded-full kc-shimmer" />
                  <span className="h-4 w-48 rounded kc-shimmer" />
                </li>
              ))}
            </ul>
          )
          : items.length === 0
            ? <p className="mt-2 text-sm text-muted-foreground">Nothing has been edited yet.</p>
            : (
              <ol className="mt-3 space-y-3">
                {items.map((item, index) => (
                  <li key={`${item.path}-${item.date}-${index}`} className="flex items-start gap-3">
                    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{item.initials}</span>
                    <span className="flex min-w-0 flex-1 flex-col @[600px]:flex-row @[600px]:items-baseline @[600px]:gap-3">
                      <span className="text-sm">{item.sentence}</span>
                      <span className="text-xs text-muted-foreground @[600px]:ml-auto">{capitalise(timeAgo(item.date, now))}</span>
                      {staff && <span className="truncate text-xs text-muted-foreground">{item.path}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            )}
      <Link href={historyHref} className="mt-2 inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline">See all changes</Link>
    </section>
  );
}
