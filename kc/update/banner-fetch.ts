// Server-only: asks GitHub for open pull requests and hands them to pickBanner.
import { pickBanner, type Banner } from "./banner.ts";

const PULLS_URL = "https://api.github.com/repos/kingsburycreative/kc-cms/pulls?state=open";

type Fetcher = (url: string, init?: Record<string, unknown>) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export async function fetchBanner(fetcher: Fetcher = fetch as unknown as Fetcher): Promise<Banner | null> {
  try {
    const res = await fetcher(PULLS_URL, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (res.status !== 200) throw new Error(`GitHub answered ${res.status}`);
    return pickBanner(await res.json());
  } catch (err) {
    console.warn(`kc update banner: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}
