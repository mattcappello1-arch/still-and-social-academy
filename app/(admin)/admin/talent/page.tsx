import { createAdminClient } from '@/lib/supabase/server'
import { getRoleLabel } from '@/lib/utils/roles'
import type { Role } from '@/lib/utils/roles'
import { TalentAdmin } from './talent-admin'

export default async function AdminTalentPage() {
  const db = await createAdminClient()

  const { data: staff } = await db
    .from('academy_staff')
    .select('id, first_name, last_name, role, department, status, talent_category, talent_notes')
    .eq('status', 'active')
    .order('first_name')

  const staffList = (staff ?? []).map((s: any) => ({
    id: s.id,
    name: `${s.first_name} ${s.last_name}`,
    role: getRoleLabel(s.role as Role),
    department: s.department,
    talentCategory: s.talent_category ?? null,
    talentNotes: s.talent_notes ?? '',
  }))

  const categoryCounts: Record<string, number> = {}
  staffList.forEach(s => {
    if (s.talentCategory) {
      categoryCounts[s.talentCategory] = (categoryCounts[s.talentCategory] ?? 0) + 1
    }
  })

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Talent Tracking</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Internal promotion pipeline and talent development.
        </p>
      </div>

      {/* Category summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase mb-1">Emerging Talent</p>
          <p className="font-serif text-3xl font-light text-ink">{categoryCounts['emerging'] ?? 0}</p>
        </div>
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase mb-1">Future Supervisor</p>
          <p className="font-serif text-3xl font-light text-ink">{categoryCounts['future_supervisor'] ?? 0}</p>
        </div>
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase mb-1">Future Leader</p>
          <p className="font-serif text-3xl font-light text-ink">{categoryCounts['future_leader'] ?? 0}</p>
        </div>
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase mb-1">Leadership Pathway</p>
          <p className="font-serif text-3xl font-light text-ink">{categoryCounts['leadership_pathway'] ?? 0}</p>
        </div>
      </div>

      <TalentAdmin staff={staffList} />
    </div>
  )
}
