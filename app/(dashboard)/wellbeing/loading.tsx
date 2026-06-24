export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse">
      <div className="h-8 w-36 rounded bg-oatmeal/30 mb-2" />
      <div className="h-4 w-64 rounded bg-oatmeal/20 mb-8" />
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {[1, 2].map(i => (
          <div key={i} className="rounded-xl border border-rule bg-white/60 p-5">
            <div className="h-3 w-20 rounded bg-oatmeal/20 mb-3" />
            <div className="h-8 w-12 rounded bg-oatmeal/30 mb-2" />
            <div className="h-3 w-40 rounded bg-oatmeal/20" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border border-rule bg-white/60 p-4">
            <div className="h-4 w-40 rounded bg-oatmeal/30 mb-2" />
            <div className="h-3 w-full rounded bg-oatmeal/20" />
          </div>
        ))}
      </div>
    </div>
  )
}
