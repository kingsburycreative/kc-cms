// Skeletons for the dashboard's server panels, each at its loaded height.
// A shimmer while loading (.kc-shimmer in app/globals.css); still under prefers-reduced-motion.
const BLOCK = "rounded kc-shimmer";

export function VisitsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading visits" className="grid grid-cols-1 gap-4 @[900px]:grid-cols-3">
      <section className="rounded-lg border p-4 @[900px]:col-span-2">
        <div className={`h-5 w-16 ${BLOCK}`} />
        <div className={`mt-3 h-11 w-64 max-w-full ${BLOCK}`} />
        <div className={`mt-3 h-[260px] w-full sm:h-[290px] ${BLOCK}`} />
      </section>
      <ul className="grid gap-3 min-[480px]:grid-cols-3 @[900px]:grid-cols-1">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className="rounded-lg border p-4">
            <div className={`h-4 w-20 ${BLOCK}`} />
            <div className={`mt-2 h-7 w-16 ${BLOCK}`} />
            <div className={`mt-2 h-9 w-full ${BLOCK}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SearchHealthSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading search health" className="min-h-36 rounded-lg border p-4">
      <div className={`h-5 w-28 ${BLOCK}`} />
      <div className="mt-3 flex items-center gap-4">
        <div className={`size-28 shrink-0 rounded-full ${BLOCK}`} />
        <div className={`h-4 w-1/2 ${BLOCK}`} />
      </div>
      <div className={`mt-4 h-4 w-1/2 ${BLOCK}`} />
      <div className={`mt-2 h-4 w-1/2 ${BLOCK}`} />
    </section>
  );
}

export function TopListsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading visitor lists" className="grid grid-cols-1 gap-4 @[700px]:grid-cols-2">
      {Array.from({ length: 2 }, (_, i) => (
        <section key={i} className="rounded-lg border p-4">
          <div className={`h-5 w-40 ${BLOCK}`} />
          {Array.from({ length: 5 }, (_, j) => <div key={j} className={`mt-2 h-8 w-full ${BLOCK}`} />)}
        </section>
      ))}
    </div>
  );
}

export function PublishSkeleton() {
  return <div aria-busy="true" aria-label="Loading publish status" className={`h-5 w-44 ${BLOCK}`} />;
}

export function StaffSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading staff details" className="rounded-lg border border-dashed p-4">
      <div className={`h-5 w-24 ${BLOCK}`} />
      <div className={`mt-3 h-16 w-full ${BLOCK}`} />
    </div>
  );
}

export function VersionSkeleton() {
  return <div aria-busy="true" aria-label="Loading CMS version" className={`h-5 w-48 ${BLOCK}`} />;
}
