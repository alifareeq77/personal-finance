export default function Loading() {
  return (
    <main className="flex-1 min-h-0 flex flex-col px-4 pb-6 animate-page-in" style={{ paddingTop: 'calc(var(--safe-top) + 1.5rem)' }}>
      <div className="mx-auto w-full max-w-lg flex flex-col min-h-0 flex-1">
        <div className="h-7 w-24 rounded-xl bg-white/5 animate-pulse mb-4 shrink-0" />
        <div className="card-glass h-20 mb-4 shrink-0 animate-pulse" />
        <div className="h-11 w-36 rounded-2xl bg-white/5 animate-pulse mb-4 shrink-0" />
        <div className="space-y-2 flex-1 min-h-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-glass h-16 animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
