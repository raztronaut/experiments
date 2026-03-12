export default function Loading() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 p-4 pt-40 md:p-24 md:pt-64">
        <div className="mb-8 space-y-4 md:mb-12">
          <div className="h-6 w-48 animate-pulse rounded bg-muted/20" />
          <div className="h-12 w-80 animate-pulse rounded bg-muted/20" />
          <div className="h-6 w-96 animate-pulse rounded bg-muted/15" />
        </div>
        <div className="mb-16 space-y-4">
          <div className="h-8 w-32 animate-pulse rounded bg-muted/20" />
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-lg bg-muted/10" />
            <div className="h-20 animate-pulse rounded-lg bg-muted/10" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-40 animate-pulse rounded bg-muted/20" />
            <div className="h-8 w-20 animate-pulse rounded bg-muted/20" />
          </div>
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-lg bg-muted/10" />
            <div className="h-16 animate-pulse rounded-lg bg-muted/10" />
            <div className="h-16 animate-pulse rounded-lg bg-muted/10" />
          </div>
        </div>
      </main>
    </div>
  );
}
