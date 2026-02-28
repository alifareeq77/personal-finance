export default function Loading() {
  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-below-nav overflow-y-auto animate-page-in">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-4 pt-3 pb-5">
          <div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-7 flex-1 max-w-[180px] rounded-xl bg-white/5 animate-pulse" />
        </div>
        <div className="card-glass p-5 animate-pulse">
          <div className="h-6 w-24 mb-4 rounded bg-white/10" />
          <div className="h-8 w-32 mb-5 rounded bg-white/10" />
          <dl className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between gap-2">
                <div className="h-4 w-16 rounded bg-white/10" />
                <div className="h-4 flex-1 max-w-[120px] rounded bg-white/10" />
              </div>
            ))}
          </dl>
          <div className="h-12 mt-5 w-full rounded-2xl bg-white/10" />
        </div>
      </div>
    </main>
  );
}
