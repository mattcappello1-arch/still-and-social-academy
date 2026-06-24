export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse">
      <div className="h-8 w-36 rounded bg-oatmeal/30 mb-2" />
      <div className="h-4 w-56 rounded bg-oatmeal/20 mb-8" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="rounded-xl border border-rule bg-white/60 p-4 flex items-center gap-4">
            <div className="h-8 w-8 rounded bg-oatmeal/30" />
            <div className="flex-1">
              <div className="h-4 w-48 rounded bg-oatmeal/30 mb-2" />
              <div className="h-3 w-72 rounded bg-oatmeal/20" />
            </div>
            <div className="h-3 w-3 rounded bg-oatmeal/20" />
          </div>
        ))}
      </div>
    </div>
  )
}
