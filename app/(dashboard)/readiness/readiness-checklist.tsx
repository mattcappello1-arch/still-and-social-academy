'use client'

import { useState, useTransition } from 'react'
import { updateChecklist } from '@/app/actions/readiness'

export function ReadinessChecklist({
  items,
  managerSignedOff,
}: {
  items: Array<{ name: string; completed: boolean }>
  managerSignedOff: boolean
}) {
  const [optimisticItems, setOptimisticItems] = useState(items)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (index: number) => {
    const item = optimisticItems[index]

    // Don't allow toggling manager sign-off
    if (item.name === 'Manager Sign Off') return

    const newCompleted = !item.completed

    // Optimistic update
    setOptimisticItems(prev =>
      prev.map((it, i) => i === index ? { ...it, completed: newCompleted } : it)
    )

    startTransition(async () => {
      const result = await updateChecklist(index, newCompleted)
      if (result.error) {
        // Revert on error
        setOptimisticItems(prev =>
          prev.map((it, i) => i === index ? { ...it, completed: !newCompleted } : it)
        )
      }
    })
  }

  return (
    <div className="rounded-xl border border-rule bg-white/60 overflow-hidden">
      <div className="border-b border-rule bg-charcoal/5 px-5 py-3">
        <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">
          Readiness Checklist
        </p>
      </div>
      <div className="divide-y divide-rule">
        {optimisticItems.map((item, i) => {
          const isManagerItem = item.name === 'Manager Sign Off'

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleToggle(i)}
              disabled={isManagerItem || isPending}
              className={`flex w-full items-center gap-4 px-5 py-4 text-left transition ${
                isManagerItem
                  ? 'cursor-default'
                  : 'hover:bg-cream-soft/30 cursor-pointer'
              }`}
            >
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                item.completed
                  ? 'border-sage bg-sage'
                  : 'border-oatmeal bg-white'
              }`}>
                {item.completed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-cream">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-mono text-sm transition ${
                  item.completed ? 'text-ink-soft line-through' : 'text-ink'
                }`}>
                  {item.name}
                </p>
                {isManagerItem && !item.completed && (
                  <p className="mt-0.5 font-mono text-[10px] text-ink-soft">
                    Admin only — requires manager approval
                  </p>
                )}
              </div>
              {isManagerItem && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-soft shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
