export default function Loading() {
  return (
    <main className="flex-1 min-h-0 flex flex-col px-4 pb-6 animate-page-in" style={{ paddingTop: 'calc(var(--safe-top) + 1.5rem)' }}>
      <div className="mx-auto w-full max-w-[390px] flex flex-col gap-4">
        <div className="h-7 w-32 rounded-xl bg-white/5 animate-pulse" />
        <div className="card-glass h-24 animate-pulse" />
        <div className="card-glass h-20 animate-pulse" />
      </div>
    </main>
  );
}
