export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-3 w-16 rounded bg-oatmeal/20" />
        <div className="h-3 w-3 rounded bg-oatmeal/10" />
        <div className="h-3 w-24 rounded bg-oatmeal/20" />
        <div className="h-3 w-3 rounded bg-oatmeal/10" />
        <div className="h-3 w-36 rounded bg-oatmeal/20" />
      </div>
      {/* Progress dots */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-3 w-28 rounded bg-oatmeal/20" />
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-1.5 rounded-full bg-oatmeal/20 ${i === 2 ? 'w-6' : 'w-1.5'}`} />
          ))}
        </div>
      </div>
      {/* Title */}
      <div className="h-8 w-64 rounded bg-oatmeal/30 mb-2" />
      <div className="h-4 w-96 rounded bg-oatmeal/20 mb-2" />
      <div className="h-3 w-20 rounded bg-oatmeal/20 mb-8" />
      {/* Content blocks */}
      <div className="space-y-6">
        <div className="h-4 w-full rounded bg-oatmeal/20" />
        <div className="h-4 w-5/6 rounded bg-oatmeal/20" />
        <div className="h-4 w-4/6 rounded bg-oatmeal/20" />
        <div className="h-32 w-full rounded-xl bg-oatmeal/10" />
        <div className="h-4 w-full rounded bg-oatmeal/20" />
        <div className="h-4 w-3/4 rounded bg-oatmeal/20" />
      </div>
    </div>
  )
}
