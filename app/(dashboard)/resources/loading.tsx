export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse">
      <div className="h-8 w-36 rounded bg-oatmeal/30 mb-2" />
      <div className="h-4 w-52 rounded bg-oatmeal/20 mb-8" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-xl border border-rule bg-white/60 p-5">
            <div className="h-8 w-8 rounded bg-oatmeal/30 mb-3" />
            <div className="h-4 w-32 rounded bg-oatmeal/30 mb-2" />
            <div className="h-3 w-full rounded bg-oatmeal/20 mb-1" />
            <div className="h-3 w-3/4 rounded bg-oatmeal/20" />
          </div>
        ))}
      </div>
    </div>
  )
}
