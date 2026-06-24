'use client'

import { useState, useTransition } from 'react'
import { managerSignOff, bulkManagerSignOff } from '@/app/actions/training'

interface ModuleItem {
  moduleId: string
  title: string
  pathTitle: string
  completedAt: string
}

interface StaffGroup {
  staffId: string
  staffName: string
  modules: ModuleItem[]
}

export function SignOffList({ groups }: { groups: StaffGroup[] }) {
  const [signedOff, setSignedOff] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()

  const handleSignOff = (staffId: string, moduleId: string) => {
    startTransition(async () => {
      const result = await managerSignOff(staffId, moduleId)
      if (result.success) {
        setSignedOff(prev => new Set([...prev, `${staffId}:${moduleId}`]))
      }
    })
  }

  const handleSignOffAll = (staffId: string, moduleIds: string[]) => {
    startTransition(async () => {
      const result = await bulkManagerSignOff(staffId, moduleIds)
      if (result.success) {
        setSignedOff(prev => {
          const next = new Set(prev)
          moduleIds.forEach(id => next.add(`${staffId}:${id}`))
          return next
        })
      }
    })
  }

  const remainingGroups = groups
    .map(g => ({
      ...g,
      modules: g.modules.filter(m => !signedOff.has(`${g.staffId}:${m.moduleId}`)),
    }))
    .filter(g => g.modules.length > 0)

  if (remainingGroups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage mx-auto mb-3">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
        </svg>
        <p className="font-mono text-sm text-ink-soft">All modules have been signed off.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {remainingGroups.map((group) => (
        <div key={group.staffId} className="rounded-xl border border-rule bg-white/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-rule bg-cream-soft/50">
            <a href={`/admin/staff/${group.staffId}`} className="font-mono text-sm font-medium text-ink hover:text-sienna transition">
              {group.staffName}
            </a>
            <button
              type="button"
              onClick={() => handleSignOffAll(group.staffId, group.modules.map(m => m.moduleId))}
              disabled={pending}
              className="rounded-lg bg-charcoal px-3 py-1.5 font-mono text-[10px] font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
            >
              Sign Off All ({group.modules.length})
            </button>
          </div>
          <div className="divide-y divide-rule/50">
            {group.modules.map((mod) => (
              <div key={mod.moduleId} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm text-ink truncate">{mod.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {mod.pathTitle && (
                      <span className="font-mono text-[10px] text-ink-soft">{mod.pathTitle}</span>
                    )}
                    <span className="font-mono text-[10px] text-ink-soft">
                      Completed {new Date(mod.completedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSignOff(group.staffId, mod.moduleId)}
                  disabled={pending}
                  className="shrink-0 ml-3 rounded-lg border border-sienna/30 bg-sienna/5 px-3 py-1.5 font-mono text-[10px] font-medium text-sienna transition hover:bg-sienna/10 disabled:opacity-50"
                >
                  Sign Off
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
