import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRoleLabel } from '@/lib/utils/roles'
import type { Role } from '@/lib/utils/roles'
import { ReadinessChecklist } from './readiness-checklist'

export default async function ReadinessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: staff } = await supabase
    .from('academy_staff')
    .select('role, department, first_name')
    .eq('id', user.id)
    .single()

  if (!staff) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-light text-ink">Shift Readiness</h1>
        <div className="mt-8 rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">Your staff profile hasn't been set up yet.</p>
        </div>
      </div>
    )
  }

  const { data: readiness } = await supabase
    .from('academy_shift_readiness')
    .select('*')
    .eq('staff_id', user.id)
    .single()

  const checklistItems = (readiness?.checklist_items ?? []) as Array<{ name: string; completed: boolean }>
  const managerSignedOff = readiness?.manager_signed_off ?? false

  const completedCount = checklistItems.filter(i => i.completed).length
  const totalCount = checklistItems.length
  const allDone = totalCount > 0 && completedCount === totalCount && managerSignedOff
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Shift Readiness</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Complete your readiness checklist to be cleared for shifts.
        </p>
      </div>

      {/* Status banner */}
      {allDone ? (
        <div className="mb-8 rounded-xl border-2 border-sage/30 bg-sage/5 p-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
            <span className="font-serif text-2xl font-light text-sage">Shift Ready</span>
          </div>
          <p className="font-mono text-sm text-sage/80">
            All items completed and signed off by management.
          </p>
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-rule bg-white/60 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                {getRoleLabel(staff.role as Role)} Readiness
              </p>
              <p className="mt-1 font-mono text-xs text-ink-soft">
                {completedCount} of {totalCount} items completed
              </p>
            </div>
            <span className="font-serif text-3xl font-light text-ink">{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-oatmeal/30">
            <div
              className="h-full rounded-full bg-sienna transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Checklist */}
      {checklistItems.length > 0 ? (
        <ReadinessChecklist items={checklistItems} managerSignedOff={managerSignedOff} />
      ) : (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">
            No readiness checklist has been set up for your role yet. Contact your manager.
          </p>
        </div>
      )}

      {/* Manager sign-off status */}
      {checklistItems.length > 0 && (
        <div className={`mt-6 rounded-xl border p-5 ${
          managerSignedOff
            ? 'border-sage/30 bg-sage/5'
            : 'border-rule bg-white/60'
        }`}>
          <div className="flex items-center gap-3">
            {managerSignedOff ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage shrink-0">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-soft shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            )}
            <div>
              <p className={`font-mono text-sm font-medium ${managerSignedOff ? 'text-sage' : 'text-ink'}`}>
                Manager Sign-Off
              </p>
              <p className="font-mono text-xs text-ink-soft">
                {managerSignedOff
                  ? 'Your manager has signed off on your readiness.'
                  : 'Awaiting manager sign-off. Complete all items above first.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
