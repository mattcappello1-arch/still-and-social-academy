import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRoleLabel } from '@/lib/utils/roles'
import type { Role } from '@/lib/utils/roles'

export default async function TeamPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get active staff — only non-sensitive fields
  const { data: staff } = await supabase
    .from('academy_staff')
    .select('id, first_name, last_name, role, department, start_date, avatar_url')
    .eq('status', 'active')
    .order('first_name')

  // Get achievements for all staff
  const staffIds = (staff ?? []).map((s) => s.id)
  const { data: achievements } = staffIds.length > 0
    ? await supabase
        .from('academy_achievements')
        .select('staff_id, badge_slug, title')
        .in('staff_id', staffIds)
    : { data: [] }

  // Group achievements by staff
  const achievementsByStaff = new Map<string, { badge_slug: string; title: string }[]>()
  for (const a of achievements ?? []) {
    const list = achievementsByStaff.get(a.staff_id) ?? []
    list.push({ badge_slug: a.badge_slug, title: a.title })
    achievementsByStaff.set(a.staff_id, list)
  }

  // Group staff by department
  const departments: Record<string, typeof staff> = {
    foh: [],
    kitchen: [],
    leadership: [],
  }

  for (const s of staff ?? []) {
    const dept = s.department as string
    if (departments[dept]) {
      departments[dept]!.push(s)
    } else {
      departments.foh!.push(s)
    }
  }

  const departmentLabels: Record<string, string> = {
    foh: 'Front of House',
    kitchen: 'Kitchen',
    leadership: 'Leadership',
  }

  const departmentStyles: Record<string, string> = {
    foh: 'border-sienna/20 bg-sienna/10 text-sienna',
    kitchen: 'border-olive/20 bg-olive/10 text-olive',
    leadership: 'border-rosewood/20 bg-rosewood/10 text-rosewood',
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Team</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Meet the Still & Social crew
          {staff && <span className="ml-1">({staff.length} members)</span>}
        </p>
      </div>

      {Object.entries(departments).map(([dept, members]) => {
        if (!members || members.length === 0) return null

        return (
          <div key={dept} className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-serif text-xl font-light text-ink">
                {departmentLabels[dept] ?? dept}
              </h2>
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-wide uppercase ${departmentStyles[dept] ?? departmentStyles.foh}`}>
                {members.length}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((s) => {
                const badges = achievementsByStaff.get(s.id) ?? []
                const initials = `${s.first_name[0]}${s.last_name[0]}`
                const startLabel = s.start_date
                  ? new Date(s.start_date).toLocaleDateString('en-AU', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : null

                return (
                  <div
                    key={s.id}
                    className="rounded-xl border border-rule bg-white/60 p-5 transition hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      {s.avatar_url ? (
                        <img
                          src={s.avatar_url}
                          alt={`${s.first_name} ${s.last_name}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal/10 font-mono text-xs font-medium text-charcoal">
                          {initials}
                        </div>
                      )}
                      <div>
                        <p className="font-mono text-sm font-medium text-ink">
                          {s.first_name} {s.last_name}
                        </p>
                        <p className="font-mono text-xs text-ink-soft">
                          {getRoleLabel(s.role as Role)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase ${departmentStyles[dept] ?? departmentStyles.foh}`}>
                        {departmentLabels[dept] ?? dept}
                      </span>
                      {startLabel && (
                        <span className="font-mono text-[10px] text-ink-soft">
                          Since {startLabel}
                        </span>
                      )}
                    </div>

                    {badges.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {badges.slice(0, 4).map((b) => (
                          <span
                            key={b.badge_slug}
                            title={b.title}
                            className="inline-flex items-center rounded-full bg-coffee/10 px-2 py-0.5 font-mono text-[10px] text-coffee"
                          >
                            {b.title}
                          </span>
                        ))}
                        {badges.length > 4 && (
                          <span className="inline-flex items-center rounded-full bg-oatmeal/20 px-2 py-0.5 font-mono text-[10px] text-ink-soft">
                            +{badges.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {(!staff || staff.length === 0) && (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">
            No active team members yet.
          </p>
        </div>
      )}
    </div>
  )
}
