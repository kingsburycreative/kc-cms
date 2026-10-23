import { getInsightsAccess, getRepoReadContext } from "@/lib/api-repo-context";
import { insightsSourcesFor } from "@/kc/insights/map";
import { defaultCache, defaultCloudflareCache, loadSiteInsights, readKey } from "@/kc/insights/route";
import { PageHeader } from "@/kc/page-header";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

function Message({ title, text }: { title: string; text: string }) {
  return (
    <Empty className="absolute inset-0 border-0 rounded-none">
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{text}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

const CONSENT_LABEL = "From visitors who allowed analytics";

function Card({
  title,
  sentence,
  items,
  note,
}: {
  title: string;
  sentence: string;
  items?: { label: string; value: number }[];
  note?: string;
}) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
      <p className="mt-2">{sentence}</p>
      {items && items.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between gap-4">
              <span className="truncate">{item.label}</span>
              <span>{item.value.toLocaleString("en-US")}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function Page(
  props: Readonly<{ params: Promise<{ owner: string; repo: string; branch: string }> }>,
) {
  const { owner, repo, branch } = await props.params;
  // The same access check the repo API routes use, before anything else.
  let allowed = false;
  try {
    const { user } = await getRepoReadContext({ owner, repo, branch: decodeURIComponent(branch) });
    allowed = await getInsightsAccess(user, owner, repo);
  } catch {}
  if (!allowed) {
    return <Message title="Access denied" text="You do not have permission to access this repository." />;
  }

  const sources = insightsSourcesFor(owner, repo);
  if (!sources) return <Message title="Insights not set up" text="Insights aren't set up for this site yet." />;

  const result = await loadSiteInsights({
    propertyId: sources.ga,
    key: readKey(process.env.KC_GA4_KEY_FILE),
    fetchFn: fetch,
    cache: defaultCache,
    cloudflare: sources.cf
      ? {
          siteTag: sources.cf,
          accountId: process.env.KC_CF_ACCOUNT_ID,
          token: process.env.CLOUDFLARE_ANALYTICS_TOKEN,
          cache: defaultCloudflareCache,
        }
      : null,
  });
  if (!result.ok) return <Message title="Insights" text={result.message} />;

  const { visitors, pages, detail } = result;
  // GA4 only loads after consent, so its cards cover fewer people than Cloudflare's totals.
  const note = result.totalsFrom === "cloudflare" ? CONSENT_LABEL : undefined;
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader title="Insights" />
      <h1 className="text-lg font-semibold">Insights</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Visitors" sentence={visitors.sentence} />
        {detail && <Card title="Average time on site" sentence={detail.engagement.sentence} note={note} />}
        {detail && <Card title="Top towns" sentence={detail.cities.sentence} items={detail.cities.items} note={note} />}
        <Card title="Top pages" sentence={pages.sentence} items={pages.items} />
        {detail && (
          <Card title="How people found the site" sentence={detail.channels.sentence} items={detail.channels.items} note={note} />
        )}
      </div>
    </div>
  );
}
