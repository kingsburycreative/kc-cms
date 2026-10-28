// Route skeleton shown while a page streams in: header bar, content blocks, and from md up a sidebar.
// Shimmer comes from .kc-shimmer in app/globals.css; still under prefers-reduced-motion.
const BLOCK = "rounded kc-shimmer";

export function RouteSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading page" className="absolute inset-0 flex bg-background">
      <aside className="hidden w-64 shrink-0 flex-col gap-3 border-r p-4 md:flex">
        <div className={`h-8 w-full ${BLOCK}`} />
        {Array.from({ length: 6 }, (_, i) => <div key={i} className={`h-6 w-full ${BLOCK}`} />)}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <div className={`h-6 w-40 ${BLOCK}`} />
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className={`h-10 w-2/3 max-w-full ${BLOCK}`} />
          <div className={`h-40 w-full ${BLOCK}`} />
          <div className={`h-24 w-full ${BLOCK}`} />
        </div>
      </div>
    </div>
  );
}
