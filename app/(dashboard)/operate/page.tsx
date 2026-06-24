import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRoleLabel } from '@/lib/utils/roles'
import type { Role } from '@/lib/utils/roles'
import Link from 'next/link'

export default async function OperateHubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: staff } = await supabase
    .from('academy_staff')
    .select('role, first_name')
    .eq('id', user.id)
    .single()

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
        <h1 className="font-serif text-3xl font-light text-ink">Operate</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">Shift readiness and daily operations</p>
      </div>

      {/* Readiness status card */}
      <div className={`mb-8 rounded-xl border-2 p-6 ${
        allDone ? 'border-sage/30 bg-sage/5' : 'border-rule bg-white/60'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">
              Shift Readiness
            </p>
            {staff && (
              <p className="mt-1 font-mono text-xs text-ink-soft">
                {getRoleLabel(staff.role as Role)}
              </p>
            )}
          </div>
          {allDone ? (
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
              <span className="font-serif text-2xl font-light text-sage">Ready</span>
            </div>
          ) : (
            <span className="font-serif text-3xl font-light text-ink">{pct}%</span>
          )}
        </div>

        {!allDone && totalCount > 0 && (
          <>
            <div className="h-2 w-full overflow-hidden rounded-full bg-oatmeal/30 mb-3">
              <div className="h-full rounded-full bg-sienna transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="font-mono text-xs text-ink-soft">{completedCount} of {totalCount} items completed</p>
          </>
        )}

        {totalCount === 0 && (
          <p className="font-mono text-xs text-ink-soft">No readiness checklist assigned for your role yet.</p>
        )}
      </div>

      {/* Manager sign-off */}
      {totalCount > 0 && (
        <div className={`mb-8 rounded-xl border p-5 ${
          managerSignedOff ? 'border-sage/30 bg-sage/5' : 'border-rule bg-white/60'
        }`}>
          <div className="flex items-center gap-3">
            {managerSignedOff ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage shrink-0">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-soft shrink-0">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
            )}
            <div>
              <p className={`font-mono text-sm font-medium ${managerSignedOff ? 'text-sage' : 'text-ink'}`}>Manager Sign-Off</p>
              <p className="font-mono text-xs text-ink-soft">
                {managerSignedOff ? 'Signed off by management.' : 'Awaiting manager sign-off.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Link to full checklist */}
      <Link href="/readiness"
        className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-5 transition hover:shadow-sm hover:border-sienna/30 group">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sienna">
            <path d="M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          <div>
            <p className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition">View Full Checklist</p>
            <p className="font-mono text-xs text-ink-soft">Complete your daily readiness items</p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-soft group-hover:text-sienna transition"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </Link>
    </div>
  )
}
