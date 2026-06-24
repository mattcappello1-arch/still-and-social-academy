export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse">
      <div className="h-8 w-44 rounded bg-oatmeal/30 mb-2" />
      <div className="h-4 w-60 rounded bg-oatmeal/20 mb-8" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border border-rule bg-white/60 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-oatmeal/30" />
              <div className="h-4 w-28 rounded bg-oatmeal/30" />
            </div>
            <div className="h-3 w-full rounded bg-oatmeal/20 mb-2" />
            <div className="h-3 w-24 rounded bg-oatmeal/20" />
          </div>
        ))}
      </div>
    </div>
  )
}
