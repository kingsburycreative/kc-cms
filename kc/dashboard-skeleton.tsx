// Skeletons for the dashboard's server panels, each at its loaded height.
// A soft pulse while loading; still under prefers-reduced-motion.
const BLOCK = "rounded bg-muted animate-pulse motion-reduce:animate-none";

export function VisitsSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading visits" className="rounded-lg border p-4">
      <div className={`h-4 w-16 ${BLOCK}`} />
      <div className={`mt-3 h-5 w-3/4 ${BLOCK}`} />
      <div className={`mt-3 h-[72px] w-full ${BLOCK}`} />
    </section>
  );
}

export function SearchHealthSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading search health" className="min-h-36 rounded-lg border p-4">
      <div className={`h-4 w-28 ${BLOCK}`} />
      <div className={`mt-3 h-5 w-2/3 ${BLOCK}`} />
      <div className={`mt-4 h-4 w-1/2 ${BLOCK}`} />
      <div className={`mt-2 h-4 w-1/2 ${BLOCK}`} />
    </section>
  );
}

export function VersionSkeleton() {
  return <div aria-busy="true" aria-label="Loading CMS version" className={`h-5 w-48 ${BLOCK}`} />;
}
