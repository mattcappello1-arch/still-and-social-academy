export function ProgressBar({
  value,
  showLabel = true,
  size = 'md',
}: {
  value: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)))
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex-1 overflow-hidden rounded-full bg-oatmeal-dk/20 ${heights[size]}`}
      >
        <div
          className="h-full rounded-full bg-sienna transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 font-mono text-xs tabular-nums text-ink-soft">
          {clamped}%
        </span>
      )}
    </div>
  )
}
