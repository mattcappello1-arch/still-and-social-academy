export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-8 w-32 rounded bg-oatmeal/30 mb-2" />
          <div className="h-4 w-48 rounded bg-oatmeal/20" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-oatmeal/30" />
      </div>
      {/* Staff list */}
      <div className="rounded-xl border border-rule bg-white/60 overflow-hidden">
        <div className="border-b border-rule px-5 py-3 flex gap-8">
          <div className="h-3 w-32 rounded bg-oatmeal/20" />
          <div className="h-3 w-24 rounded bg-oatmeal/20" />
          <div className="h-3 w-20 rounded bg-oatmeal/20" />
          <div className="h-3 w-20 rounded bg-oatmeal/20" />
        </div>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="border-b border-rule/50 px-5 py-3 flex items-center gap-8">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-8 w-8 rounded-full bg-oatmeal/30" />
              <div>
                <div className="h-4 w-32 rounded bg-oatmeal/30 mb-1" />
                <div className="h-3 w-40 rounded bg-oatmeal/20" />
              </div>
            </div>
            <div className="h-3 w-20 rounded bg-oatmeal/20" />
            <div className="h-4 w-16 rounded-full bg-oatmeal/20" />
            <div className="h-3 w-20 rounded bg-oatmeal/20" />
          </div>
        ))}
      </div>
    </div>
  )
}
