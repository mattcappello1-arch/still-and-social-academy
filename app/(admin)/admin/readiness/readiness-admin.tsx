'use client'

import { useState, useTransition } from 'react'
import { managerSignoff } from '@/app/actions/readiness'

type StaffReadiness = {
  id: string
  name: string
  role: string
  department: string
  completedCount: number
  totalCount: number
  pct: number
  managerSignedOff: boolean
  hasReadiness: boolean
  items: Array<{ name: string; completed: boolean }>
}

export function ReadinessAdmin({ staff }: { staff: StaffReadiness[] }) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null)

  const handleSignoff = (staffId: string) => {
    setError('')
    startTransition(async () => {
      const result = await managerSignoff(staffId)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Staff signed off successfully')
        setTimeout(() => setSuccess(''), 3000)
      }
    })
  }

  const deptColors: Record<string, string> = {
    foh: 'border-sienna/20 bg-sienna/10 text-sienna',
    kitchen: 'border-olive/20 bg-olive/10 text-olive',
    leadership: 'border-rosewood/20 bg-rosewood/10 text-rosewood',
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-rosewood/20 bg-rosewood/5 px-4 py-3">
          <p className="font-mono text-sm text-rosewood">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-sage/20 bg-sage/5 px-4 py-3">
          <p className="font-mono text-sm text-sage">{success}</p>
        </div>
      )}

      <div className="space-y-3">
        {staff.map(s => (
          <div key={s.id} className="rounded-xl border border-rule bg-white/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedStaff(expandedStaff === s.id ? null : s.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-cream-soft/30 transition"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-mono text-sm font-medium text-ink">{s.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-wide uppercase ${deptColors[s.department] ?? deptColors.foh}`}>
                      {s.role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {s.hasReadiness ? (
                  <>
                    <div className="text-right">
                      <p className="font-mono text-xs text-ink-soft">{s.completedCount}/{s.totalCount}</p>
                      <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-oatmeal/30">
                        <div className="h-full rounded-full bg-sienna" style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                    {s.pct === 100 && s.managerSignedOff ? (
                      <span className="rounded-full border border-sage/20 bg-sage/10 px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-sage uppercase">
                        Ready
                      </span>
                    ) : s.pct === 100 ? (
                      <span className="rounded-full border border-sienna/20 bg-sienna/10 px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-sienna uppercase">
                        Needs Sign-off
                      </span>
                    ) : (
                      <span className="rounded-full border border-rule bg-cream-soft px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-ink-soft uppercase">
                        In Progress
                      </span>
                    )}
                  </>
                ) : (
                  <span className="rounded-full border border-rule bg-cream-soft px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-ink-soft uppercase">
                    No Checklist
                  </span>
                )}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`text-ink-soft shrink-0 transition-transform ${expandedStaff === s.id ? 'rotate-180' : ''}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </button>

            {expandedStaff === s.id && s.hasReadiness && (
              <div className="border-t border-rule px-4 pb-4 pt-3">
                <div className="space-y-2">
                  {s.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        item.completed ? 'border-sage bg-sage' : 'border-oatmeal bg-white'
                      }`}>
                        {item.completed && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-cream">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </div>
                      <span className={`font-mono text-sm ${item.completed ? 'text-ink-soft line-through' : 'text-ink'}`}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Manager sign-off button */}
                {s.pct === 100 && !s.managerSignedOff && (
                  <button
                    type="button"
                    onClick={() => handleSignoff(s.id)}
                    disabled={isPending}
                    className="mt-4 rounded-lg bg-charcoal px-4 py-2 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
                  >
                    {isPending ? 'Signing off...' : 'Sign Off as Ready'}
                  </button>
                )}
                {s.managerSignedOff && (
                  <div className="mt-4 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                    <span className="font-mono text-xs text-sage">Manager signed off</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
