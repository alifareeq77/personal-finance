export default function Loading() {
  return (
    <main className="flex-1 min-h-0 flex flex-col px-4 pt-[var(--safe-top)] pb-6 animate-page-in">
      <div className="mx-auto max-w-md flex flex-col min-h-0 flex-1 w-full">
        <div className="h-7 w-28 rounded-xl bg-white/5 animate-pulse mb-4 shrink-0" />
        <div className="card-glass h-14 mb-4 shrink-0 animate-pulse" />
        <div className="grid grid-cols-3 gap-2 mb-5 shrink-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-glass h-16 animate-pulse" />
          ))}
        </div>
        <div className="flex gap-2.5 mb-5 shrink-0">
          <div className="flex-1 h-11 rounded-2xl bg-white/5 animate-pulse" />
          <div className="flex-1 h-11 rounded-2xl bg-white/5 animate-pulse" />
        </div>
        <div className="space-y-2 flex-1 min-h-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-glass h-14 animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
