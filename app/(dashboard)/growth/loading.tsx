export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse">
      {/* Title */}
      <div className="h-8 w-52 rounded bg-oatmeal/30 mb-2" />
      <div className="h-4 w-64 rounded bg-oatmeal/20 mb-8" />
      {/* Goal sections */}
      {[1, 2].map(s => (
        <div key={s} className="mb-10">
          <div className="h-6 w-40 rounded bg-oatmeal/30 mb-4" />
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="rounded-xl border border-rule bg-white/60 p-4">
                <div className="h-4 w-48 rounded bg-oatmeal/30 mb-2" />
                <div className="h-3 w-72 rounded bg-oatmeal/20 mb-2" />
                <div className="h-2 w-full rounded-full bg-oatmeal/20" />
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* Skill tracker */}
      <div className="h-6 w-32 rounded bg-oatmeal/30 mb-4" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl border border-rule bg-white/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-32 rounded bg-oatmeal/30" />
              <div className="h-4 w-16 rounded-full bg-oatmeal/20" />
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(d => (
                <div key={d} className="h-2 flex-1 rounded-full bg-oatmeal/20" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
