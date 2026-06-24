import { createAdminClient } from '@/lib/supabase/server'
import { getRoleLabel } from '@/lib/utils/roles'
import type { Role } from '@/lib/utils/roles'
import { ReadinessAdmin } from './readiness-admin'

export default async function AdminReadinessPage() {
  const db = await createAdminClient()

  // Get all staff with readiness data
  const { data: staff } = await db
    .from('academy_staff')
    .select('id, first_name, last_name, role, department, status')
    .eq('status', 'active')
    .order('first_name')

  const staffIds = (staff ?? []).map(s => s.id)
  const { data: readinessRows } = staffIds.length
    ? await db
        .from('academy_shift_readiness')
        .select('*')
        .in('staff_id', staffIds)
    : { data: [] }

  const readinessMap = new Map(
    (readinessRows ?? []).map((r: any) => [r.staff_id, r])
  )

  const staffWithReadiness = (staff ?? []).map((s: any) => {
    const readiness = readinessMap.get(s.id)
    const items = (readiness?.checklist_items ?? []) as Array<{ name: string; completed: boolean }>
    const completedCount = items.filter(i => i.completed).length
    const totalCount = items.length
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    return {
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      role: getRoleLabel(s.role as Role),
      department: s.department,
      completedCount,
      totalCount,
      pct,
      managerSignedOff: readiness?.manager_signed_off ?? false,
      hasReadiness: !!readiness,
      items,
    }
  })

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Shift Readiness</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          View and manage staff shift readiness status.
        </p>
      </div>

      {/* Summary stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase mb-1">Shift Ready</p>
          <p className="font-serif text-3xl font-light text-sage">
            {staffWithReadiness.filter(s => s.pct === 100 && s.managerSignedOff).length}
          </p>
        </div>
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase mb-1">In Progress</p>
          <p className="font-serif text-3xl font-light text-sienna">
            {staffWithReadiness.filter(s => s.pct > 0 && s.pct < 100).length}
          </p>
        </div>
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase mb-1">Not Started</p>
          <p className="font-serif text-3xl font-light text-ink-soft">
            {staffWithReadiness.filter(s => s.pct === 0 || !s.hasReadiness).length}
          </p>
        </div>
      </div>

      <ReadinessAdmin staff={staffWithReadiness} />
    </div>
  )
}
