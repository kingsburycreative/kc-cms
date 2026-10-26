"use client";

import { shortHref } from "@/kc/short-url";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getInitialsFromName } from "@/lib/utils/avatar";
import { useConfig } from "@/contexts/config-context";
import type { EntryHistoryItem } from "@/types/api";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { History } from "lucide-react";

type HistoryConfig = { owner: string; repo: string; branch: string } | null | undefined;

const siteHistoryHref = (config: HistoryConfig) =>
  shortHref(`/${config?.owner}/${config?.repo}/${encodeURIComponent(config?.branch ?? "")}/history`);

const entryHistoryHref = (config: HistoryConfig, path: string, sha: string) =>
  `${siteHistoryHref(config)}/entry?path=${encodeURIComponent(path)}&sha=${encodeURIComponent(sha)}`;

function HistoryItemContent({
  item,
  compact = false,
}: {
  item: EntryHistoryItem;
  compact?: boolean;
}) {
  const authorName = item.authorName || item.commit?.author?.name || item.author?.login || "Unknown author";
  const rawDate = item.date ?? item.commit?.author?.date;
  const authorDate = rawDate ? new Date(rawDate) : null;

  return (
    <>
      <Avatar className={compact ? "size-7" : "h-8 w-8"}>
        <AvatarFallback>{getInitialsFromName(authorName)}</AvatarFallback>
      </Avatar>
      <div className={compact ? "text-left overflow-hidden" : "text-left overflow-hidden ml-3"}>
        <div className={compact ? "truncate" : "text-sm font-medium truncate"}>{authorName}</div>
        <div className="text-xs text-muted-foreground truncate">
          {authorDate ? `${formatDistanceToNow(authorDate)} ago` : "Unknown date"}
        </div>
      </div>
    </>
  );
}

export function EntryHistoryBlock({
  path,
  history,
}: {
  path: string;
  history: EntryHistoryItem[];
}) {
  const { config } = useConfig();

  if (!history || history.length === 0) return null;

  return (
    <div className="flex flex-col gap-y-1 text-sm">
      {history.slice(0, 3).map((item) => (
        <Link
          href={entryHistoryHref(config, path, item.sha)}
          key={item.sha}
          className="flex items-center rounded-lg px-3 py-2 transition-all hover:bg-accent ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <HistoryItemContent item={item} />
        </Link>
      ))}
      {history.length > 3 && (
        <Link
          href={shortHref(`/${config?.owner}/${config?.repo}/${encodeURIComponent(config?.branch ?? "")}/history`)}
          className="flex items-center rounded-lg px-3 py-2 transition-all hover:bg-accent ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="mr-4">See all changes</span>
        </Link>
      )}
    </div>
  );
}

export function EntryHistoryDropdown({
  path,
  history,
  triggerVariant = "ghost",
  triggerSize = "icon",
}: {
  path: string;
  history: EntryHistoryItem[];
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
  triggerSize?: React.ComponentProps<typeof Button>["size"];
}) {
  const { config } = useConfig();

  if (!history || history.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant={triggerVariant} size={triggerSize}>
          <History />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-3xs">
        {history.slice(0, 3).map((item) => (
          <DropdownMenuItem key={item.sha} asChild>
            <Link href={entryHistoryHref(config, path, item.sha)} className="w-full truncate flex items-center gap-3">
              <HistoryItemContent item={item} compact />
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator/>
        <DropdownMenuItem asChild>
          <Link href={siteHistoryHref(config)} className="flex items-center w-full">
            See all changes
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
