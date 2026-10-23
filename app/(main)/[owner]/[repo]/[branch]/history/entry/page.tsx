import { EntryHistory } from "@/kc/history/history-view.tsx";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ path?: string; sha?: string }>;
}) {
  const { path = "", sha = "" } = await searchParams;
  return <EntryHistory path={path} sha={sha} />;
}
