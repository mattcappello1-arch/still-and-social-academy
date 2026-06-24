import { createClient } from '@/lib/supabase/server'
import { getDepartmentLabel } from '@/lib/utils/roles'
import type { Department } from '@/lib/utils/roles'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // --- Training Analytics ---

  // All active modules
  const { data: allModules } = await supabase
    .from('academy_training_modules')
    .select('id, path_id')
    .eq('is_active', true)

  // All paths
  const { data: allPaths } = await supabase
    .from('academy_training_paths')
    .select('id, slug, title, department')
    .eq('is_active', true)

  // All completions
  const { data: allProgress } = await supabase
    .from('academy_staff_module_progress')
    .select('staff_id, module_id, status, completed_at')

  // All active staff
  const { data: allStaff } = await supabase
    .from('academy_staff')
    .select('id, first_name, last_name, department, role')
    .eq('status', 'active')

  const pathMap = new Map((allPaths ?? []).map((p) => [p.id, p]))
  const modulesByPath = new Map<string, string[]>()
  for (const m of allModules ?? []) {
    const list = modulesByPath.get(m.path_id) ?? []
    list.push(m.id)
    modulesByPath.set(m.path_id, list)
  }

  // Completions this week / this month
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const completions = (allProgress ?? []).filter((p) => p.status === 'completed')
  const completionsThisWeek = completions.filter((p) => p.completed_at && p.completed_at >= weekAgo).length
  const completionsThisMonth = completions.filter((p) => p.completed_at && p.completed_at >= monthStart).length

  // Average completion rate per department
  const staffByDept = new Map<string, string[]>()
  for (const s of allStaff ?? []) {
    const dept = s.department as string
    const list = staffByDept.get(dept) ?? []
    list.push(s.id)
    staffByDept.set(dept, list)
  }

  const completedModulesByStaff = new Map<string, number>()
  for (const p of completions) {
    completedModulesByStaff.set(p.staff_id, (completedModulesByStaff.get(p.staff_id) ?? 0) + 1)
  }

  const totalModuleCount = allModules?.length ?? 0

  const deptCompletionRates: { dept: string; label: string; rate: number }[] = []
  for (const [dept, staffIds] of staffByDept) {
    if (staffIds.length === 0 || totalModuleCount === 0) continue
    const totalCompleted = staffIds.reduce((sum, id) => sum + (completedModulesByStaff.get(id) ?? 0), 0)
    const avgRate = Math.round((totalCompleted / (staffIds.length * totalModuleCount)) * 100)
    deptCompletionRates.push({ dept, label: getDepartmentLabel(dept as Department), rate: avgRate })
  }

  // Path completion counts
  const pathCompletionCounts: { title: string; slug: string; completedBy: number; totalStaff: number }[] = []
  for (const path of allPaths ?? []) {
    const moduleIds = modulesByPath.get(path.id) ?? []
    if (moduleIds.length === 0) continue

    let completedBy = 0
    for (const s of allStaff ?? []) {
      const staffCompletedInPath = completions.filter(
        (p) => p.staff_id === s.id && moduleIds.includes(p.module_id)
      ).length
      if (staffCompletedInPath === moduleIds.length) completedBy++
    }

    pathCompletionCounts.push({
      title: path.title,
      slug: path.slug,
      completedBy,
      totalStaff: allStaff?.length ?? 0,
    })
  }

  const mostCompleted = [...pathCompletionCounts].sort((a, b) => b.completedBy - a.completedBy).slice(0, 5)
  const leastCompleted = [...pathCompletionCounts].sort((a, b) => a.completedBy - b.completedBy).slice(0, 5)

  // Staff with 0% and 100% progress
  const staffProgress: { id: string; name: string; percent: number }[] = []
  for (const s of allStaff ?? []) {
    const completed = completedModulesByStaff.get(s.id) ?? 0
    const percent = totalModuleCount > 0 ? Math.round((completed / totalModuleCount) * 100) : 0
    staffProgress.push({ id: s.id, name: `${s.first_name} ${s.last_name}`, percent })
  }

  const notStarted = staffProgress.filter((s) => s.percent === 0)
  const fullyTrained = staffProgress.filter((s) => s.percent === 100)

  // --- Wellbeing trend (last 6 months) ---
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()
  const { data: wellbeingCheckins } = await supabase
    .from('academy_wellbeing_checkins')
    .select('mood_score, created_at')
    .gte('created_at', sixMonthsAgo)
    .order('created_at')

  const monthlyMoods: { month: string; avg: number; count: number }[] = []
  const moodByMonth = new Map<string, number[]>()
  for (const c of wellbeingCheckins ?? []) {
    const d = new Date(c.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const list = moodByMonth.get(key) ?? []
    list.push(c.mood_score)
    moodByMonth.set(key, list)
  }

  for (const [month, scores] of [...moodByMonth.entries()].sort()) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    monthlyMoods.push({
      month: new Date(month + '-01').toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }),
      avg: Math.round(avg * 10) / 10,
      count: scores.length,
    })
  }

  // --- Certification status ---
  const { data: certifications } = await supabase
    .from('academy_certifications')
    .select('staff_id, cert_type, status, expiry_date')

  const certTypes = new Map<string, { valid: number; expired: number; total: number }>()
  for (const c of certifications ?? []) {
    const entry = certTypes.get(c.cert_type) ?? { valid: 0, expired: 0, total: 0 }
    entry.total++
    const isExpired = c.expiry_date && new Date(c.expiry_date) < now
    if (c.status === 'verified' && !isExpired) {
      entry.valid++
    } else {
      entry.expired++
    }
    certTypes.set(c.cert_type, entry)
  }

  const totalStaffCount = allStaff?.length ?? 0

  const CERT_LABELS: Record<string, string> = {
    rsa: 'RSA',
    food_safety: 'Food Safety',
    first_aid: 'First Aid',
    food_handler: 'Food Handler',
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Analytics</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Training, wellbeing, and certification insights
        </p>
      </div>

      {/* Top-level stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Completed This Week" value={completionsThisWeek} />
        <StatCard label="Completed This Month" value={completionsThisMonth} />
        <StatCard label="Fully Trained Staff" value={fullyTrained.length} subtitle={`of ${totalStaffCount}`} />
        <StatCard label="Not Started" value={notStarted.length} subtitle={`of ${totalStaffCount}`} accent={notStarted.length > 0 ? 'warning' : undefined} />
      </div>

      {/* Department Completion Rates */}
      <div className="mb-8 rounded-xl border border-rule bg-white/60 p-5">
        <h2 className="mb-4 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
          Average Completion by Department
        </h2>
        <div className="space-y-3">
          {deptCompletionRates.map((d) => (
            <div key={d.dept}>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-sm text-ink">{d.label}</span>
                <span className="font-mono text-sm font-medium text-ink">{d.rate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-oatmeal/30">
                <div
                  className="h-2 rounded-full bg-sienna/80 transition-all"
                  style={{ width: `${d.rate}%` }}
                />
              </div>
            </div>
          ))}
          {deptCompletionRates.length === 0 && (
            <p className="font-mono text-sm text-ink-soft">No data yet</p>
          )}
        </div>
      </div>

      {/* Path Rankings */}
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <h2 className="mb-4 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
            Most Completed Paths
          </h2>
          {mostCompleted.length > 0 ? (
            <div className="space-y-2">
              {mostCompleted.map((p, i) => (
                <div key={p.slug} className="flex items-center justify-between">
                  <span className="font-mono text-sm text-ink">
                    {i + 1}. {p.title}
                  </span>
                  <span className="font-mono text-xs text-ink-soft">
                    {p.completedBy}/{p.totalStaff} staff
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-sm text-ink-soft">No data yet</p>
          )}
        </div>

        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <h2 className="mb-4 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
            Least Completed Paths (Need Attention)
          </h2>
          {leastCompleted.length > 0 ? (
            <div className="space-y-2">
              {leastCompleted.map((p, i) => (
                <div key={p.slug} className="flex items-center justify-between">
                  <span className="font-mono text-sm text-ink">
                    {i + 1}. {p.title}
                  </span>
                  <span className="font-mono text-xs text-sienna">
                    {p.completedBy}/{p.totalStaff} staff
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-sm text-ink-soft">No data yet</p>
          )}
        </div>
      </div>

      {/* Staff Progress Extremes */}
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <h2 className="mb-4 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
            Fully Trained (100%)
          </h2>
          {fullyTrained.length > 0 ? (
            <div className="space-y-1.5">
              {fullyTrained.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage shrink-0"><path d="M20 6L9 17l-5-5" /></svg>
                  <span className="font-mono text-sm text-ink">{s.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-sm text-ink-soft">No staff at 100% yet</p>
          )}
        </div>

        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <h2 className="mb-4 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
            Not Started (0%)
          </h2>
          {notStarted.length > 0 ? (
            <div className="space-y-1.5">
              {notStarted.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sienna shrink-0"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg>
                  <span className="font-mono text-sm text-ink">{s.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-sm text-ink-soft">All staff have started training</p>
          )}
        </div>
      </div>

      {/* Wellbeing Trend */}
      <div className="mb-8 rounded-xl border border-rule bg-white/60 p-5">
        <h2 className="mb-4 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
          Wellbeing Trend (Last 6 Months)
        </h2>
        {monthlyMoods.length > 0 ? (
          <div className="space-y-3">
            {monthlyMoods.map((m) => (
              <div key={m.month}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-sm text-ink">{m.month}</span>
                  <span className="font-mono text-sm text-ink-soft">
                    {m.avg}/5 avg ({m.count} check-ins)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-oatmeal/30">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(m.avg / 5) * 100}%`,
                      backgroundColor: m.avg >= 4 ? 'var(--color-sage, #7a8a6e)' : m.avg >= 3 ? 'var(--color-olive, #808a5c)' : 'var(--color-sienna, #a0522d)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-ink-soft">No wellbeing data yet</p>
        )}
      </div>

      {/* Certification Status */}
      <div className="rounded-xl border border-rule bg-white/60 p-5">
        <h2 className="mb-4 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
          Certification Status
        </h2>
        {certTypes.size > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...certTypes.entries()].map(([type, data]) => {
              const pct = totalStaffCount > 0 ? Math.round((data.valid / totalStaffCount) * 100) : 0
              return (
                <div key={type} className="rounded-lg border border-rule bg-cream-soft/30 p-4">
                  <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                    {CERT_LABELS[type] ?? type}
                  </p>
                  <p className="font-mono text-2xl font-medium text-ink">{pct}%</p>
                  <p className="font-mono text-xs text-ink-soft">
                    {data.valid} valid of {totalStaffCount} staff
                  </p>
                  {data.expired > 0 && (
                    <p className="mt-1 font-mono text-xs text-sienna">
                      {data.expired} expired/pending
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="font-mono text-sm text-ink-soft">No certification data yet</p>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  subtitle,
  accent,
}: {
  label: string
  value: number
  subtitle?: string
  accent?: 'warning'
}) {
  return (
    <div className="rounded-xl border border-rule bg-white/60 p-5">
      <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
        {label}
      </p>
      <p className={`font-mono text-3xl font-medium ${accent === 'warning' && value > 0 ? 'text-sienna' : 'text-ink'}`}>
        {value}
      </p>
      {subtitle && (
        <p className="font-mono text-xs text-ink-soft">{subtitle}</p>
      )}
    </div>
  )
}
