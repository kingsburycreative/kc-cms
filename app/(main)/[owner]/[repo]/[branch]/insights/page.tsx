import { getRepoReadContext } from "@/lib/api-repo-context";
import { insightsPropertyFor } from "@/kc/insights/map";
import { defaultCache, loadInsights, readKey } from "@/kc/insights/route";
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

function Card({ title, sentence, items }: { title: string; sentence: string; items?: { label: string; value: number }[] }) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
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
  try {
    await getRepoReadContext({ owner, repo, branch: decodeURIComponent(branch) });
  } catch {
    return <Message title="Access denied" text="You do not have permission to access this repository." />;
  }

  const propertyId = insightsPropertyFor(owner, repo);
  if (!propertyId) return <Message title="Insights not set up" text="Insights aren't set up for this site yet." />;

  const result = await loadInsights({
    propertyId,
    key: readKey(process.env.KC_GA4_KEY_FILE),
    fetchFn: fetch,
    cache: defaultCache,
  });
  if (!result.ok) return <Message title="Insights" text={result.message} />;

  const { visitors, cities, pages, channels, engagement } = result.cards;
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-lg font-semibold">Insights</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Visitors" sentence={visitors.sentence} />
        <Card title="Average time on site" sentence={engagement.sentence} />
        <Card title="Top towns" sentence={cities.sentence} items={cities.items} />
        <Card title="Top pages" sentence={pages.sentence} items={pages.items} />
        <Card title="How people found the site" sentence={channels.sentence} items={channels.items} />
      </div>
    </div>
  );
}
