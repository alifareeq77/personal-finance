export default function Loading() {
  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-below-nav overflow-y-auto animate-page-in">
      <div className="mx-auto max-w-md">
        <div className="h-7 w-28 rounded-xl bg-white/5 animate-pulse mb-4" />
        <div className="card-glass h-24 mb-4 animate-pulse" />
        <div className="card-glass h-32 animate-pulse" />
      </div>
    </main>
  );
}
