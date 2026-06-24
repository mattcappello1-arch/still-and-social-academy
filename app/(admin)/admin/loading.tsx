export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse">
      <div className="h-8 w-48 rounded bg-oatmeal/30 mb-2" />
      <div className="h-4 w-64 rounded bg-oatmeal/20 mb-8" />
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl border border-rule bg-white/60 p-5">
            <div className="h-3 w-20 rounded bg-oatmeal/20 mb-3" />
            <div className="h-8 w-16 rounded bg-oatmeal/30 mb-2" />
            <div className="h-3 w-28 rounded bg-oatmeal/20" />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="rounded-xl border border-rule bg-white/60 overflow-hidden">
        <div className="border-b border-rule px-5 py-3 flex gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-3 w-20 rounded bg-oatmeal/20" />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="border-b border-rule/50 px-5 py-3 flex gap-8">
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="h-3 w-24 rounded bg-oatmeal/20" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
