import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Staff counts
  const { count: totalStaff } = await supabase
    .from('academy_staff')
    .select('*', { count: 'exact', head: true })

  const { count: activeStaff } = await supabase
    .from('academy_staff')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: pendingStaff } = await supabase
    .from('academy_staff')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: inactiveStaff } = await supabase
    .from('academy_staff')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'inactive')

  // Training completion
  const { data: allProgress } = await supabase
    .from('academy_staff_module_progress')
    .select('status')

  const totalProgress = allProgress?.length ?? 0
  const completedProgress = allProgress?.filter((p) => p.status === 'completed').length ?? 0
  const completionRate = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0

  // Probation due
  const { data: activeStaffList } = await supabase
    .from('academy_staff')
    .select('id, first_name, last_name, start_date')
    .eq('status', 'active')

  const now = new Date()
  const probationDue = (activeStaffList ?? [])
    .filter((s: any) => s.start_date)
    .map((s: any) => {
      const days = Math.floor((now.getTime() - new Date(s.start_date).getTime()) / (1000 * 60 * 60 * 24))
      return { ...s, days }
    })
    .filter((s: any) => s.days <= 100 && s.days >= 23) // within probation window

  // Existing reviews to check which probation milestones are done
  const probationStaffIds = probationDue.map((s: any) => s.id)
  const { data: existingReviews } = await supabase
    .from('academy_reviews')
    .select('staff_id, review_type')
    .in('staff_id', probationStaffIds.length ? probationStaffIds : ['none'])

  const reviewSet = new Set((existingReviews ?? []).map((r: any) => `${r.staff_id}:${r.review_type}`))

  const probationAlerts = probationDue
    .map((s: any) => {
      const milestones: string[] = []
      if (s.days >= 23 && !reviewSet.has(`${s.id}:probation_30`)) milestones.push('30-day')
      if (s.days >= 53 && !reviewSet.has(`${s.id}:probation_60`)) milestones.push('60-day')
      if (s.days >= 83 && !reviewSet.has(`${s.id}:probation_90`)) milestones.push('90-day')
      return { ...s, milestones }
    })
    .filter((s: any) => s.milestones.length > 0)

  // Expiring certifications (next 30 days)
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  const { data: expiringCerts } = await supabase
    .from('academy_certifications')
    .select('*, academy_staff!academy_certifications_staff_id_fkey(first_name, last_name)')
    .lte('expiry_date', thirtyDaysFromNow.toISOString())
    .gte('expiry_date', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('expiry_date')

  // Wellbeing alerts (rating 1 or 2, recent)
  const { data: wellbeingAlerts } = await supabase
    .from('academy_wellbeing_checkins')
    .select('*, academy_staff!academy_wellbeing_checkins_staff_id_fkey(first_name, last_name)')
    .lte('rating', 2)
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent activity (recent staff + completed modules)
  const { data: recentStaff } = await supabase
    .from('academy_staff')
    .select('first_name, last_name, role, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentCompletions } = await supabase
    .from('academy_staff_module_progress')
    .select('completed_at, academy_staff!academy_staff_module_progress_staff_id_fkey(first_name, last_name), academy_training_modules!academy_staff_module_progress_module_id_fkey(title)')
    .eq('status', 'completed')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(5)

  // Pending signing assignments
  const { count: pendingSignOffs } = await supabase
    .from('academy_signing_assignments')
    .select('*', { count: 'exact', head: true })
    .in('status', ['sent', 'viewed'])

  // Pending manager sign-offs on completed modules
  const { count: pendingModuleSignOffs } = await supabase
    .from('academy_staff_module_progress')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .is('manager_signoff_at', null)
    .not('completed_at', 'is', null)

  // Overdue modules (in_progress for more than 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { count: overdueModules } = await supabase
    .from('academy_staff_module_progress')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'in_progress')
    .lt('updated_at', thirtyDaysAgo.toISOString())

  // Reviews due
  const { count: reviewsDue } = await supabase
    .from('academy_reviews')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'completed')

  // Staff readiness summary
  const { data: allReadiness } = await supabase
    .from('academy_shift_readiness')
    .select('manager_signed_off')

  const readyStaffCount = (allReadiness ?? []).filter((r: any) => r.manager_signed_off).length
  const totalReadinessStaff = allReadiness?.length ?? 0

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">Admin Overview</h1>
          <p className="mt-1 font-mono text-sm text-ink-soft">Staff operating system at a glance</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-3">
        <a href="/admin/staff/new" className="flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna active:scale-[0.98]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>
          Invite Staff
        </a>
        <a href="/admin/reviews" className="flex items-center gap-2 rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm tracking-wide text-ink transition hover:border-sienna/30 hover:text-sienna">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Create Review
        </a>
        <a href="/admin/signing" className="flex items-center gap-2 rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm tracking-wide text-ink transition hover:border-sienna/30 hover:text-sienna">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" /></svg>
          Assign Document
        </a>
        <a href="/admin/recognition" className="flex items-center gap-2 rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm tracking-wide text-ink transition hover:border-sienna/30 hover:text-sienna">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          Award Recognition
        </a>
      </div>

      {/* OS Section Stats */}
      <div className="mb-8 space-y-6">
        {/* LEARN */}
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Learn</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-serif text-3xl font-light text-ink">{completionRate}%</p>
              <p className="font-mono text-xs text-ink-soft mt-1">overall completion rate</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-oatmeal/30">
                <div className="h-full rounded-full bg-sienna transition-all" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
            <div>
              <p className="font-serif text-3xl font-light text-ink">{overdueModules ?? 0}</p>
              <p className="font-mono text-xs text-ink-soft mt-1">overdue modules (&gt;30 days in progress)</p>
            </div>
          </div>
        </div>

        {/* OPERATE */}
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Operate</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-serif text-3xl font-light text-ink">{readyStaffCount}</p>
              <p className="font-mono text-xs text-ink-soft mt-1">staff shift-ready</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-light text-ink-soft">{totalReadinessStaff - readyStaffCount}</p>
              <p className="font-mono text-xs text-ink-soft mt-1">not yet ready</p>
            </div>
          </div>
        </div>

        {/* COMPLY */}
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Comply</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className={`font-serif text-3xl font-light ${(expiringCerts?.length ?? 0) > 0 ? 'text-sienna' : 'text-ink'}`}>
                {expiringCerts?.length ?? 0}
              </p>
              <p className="font-mono text-xs text-ink-soft mt-1">expiring certifications (30 days)</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-light text-ink">{pendingSignOffs ?? 0}</p>
              <p className="font-mono text-xs text-ink-soft mt-1">pending document sign-offs</p>
            </div>
            <div>
              <a href="/admin/signoffs" className="group">
                <p className={`font-serif text-3xl font-light ${(pendingModuleSignOffs ?? 0) > 0 ? 'text-sienna' : 'text-ink'}`}>
                  {pendingModuleSignOffs ?? 0}
                </p>
                <p className="font-mono text-xs text-ink-soft mt-1 group-hover:text-sienna transition">
                  module sign-offs pending
                </p>
              </a>
            </div>
          </div>
        </div>

        {/* PEOPLE */}
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">People</p>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="font-serif text-3xl font-light text-ink">{totalStaff ?? 0}</p>
              <p className="font-mono text-xs text-ink-soft mt-1">total staff</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-light text-sage">{activeStaff ?? 0}</p>
              <p className="font-mono text-xs text-ink-soft mt-1">active</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-light text-oatmeal-dk">{pendingStaff ?? 0}</p>
              <p className="font-mono text-xs text-ink-soft mt-1">pending</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-light text-ink-soft">{inactiveStaff ?? 0}</p>
              <p className="font-mono text-xs text-ink-soft mt-1">inactive</p>
            </div>
          </div>
        </div>

        {/* DEVELOP */}
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Develop</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className={`font-serif text-3xl font-light ${(reviewsDue ?? 0) > 0 ? 'text-sienna' : 'text-ink'}`}>{reviewsDue ?? 0}</p>
              <p className="font-mono text-xs text-ink-soft mt-1">reviews due</p>
            </div>
            <div>
              <p className={`font-serif text-3xl font-light ${probationAlerts.length > 0 ? 'text-sienna' : 'text-ink'}`}>{probationAlerts.length}</p>
              <p className="font-mono text-xs text-ink-soft mt-1">probation alerts</p>
            </div>
            <div>
              <p className={`font-serif text-3xl font-light ${(wellbeingAlerts?.length ?? 0) > 0 ? 'text-rosewood' : 'text-ink'}`}>{wellbeingAlerts?.length ?? 0}</p>
              <p className="font-mono text-xs text-ink-soft mt-1">wellbeing alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Probation Due */}
      {probationAlerts.length > 0 && (
        <div className="mb-8 rounded-xl border border-sienna/30 bg-sienna/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sienna">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <h2 className="font-mono text-xs font-medium text-sienna uppercase tracking-wider">Probation Reviews Due</h2>
          </div>
          <div className="space-y-2">
            {probationAlerts.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-rule bg-white/80 px-4 py-3">
                <div>
                  <a href={`/admin/staff/${s.id}`} className="font-mono text-sm font-medium text-ink hover:text-sienna transition">
                    {s.first_name} {s.last_name}
                  </a>
                  <span className="font-mono text-xs text-ink-soft ml-2">Day {s.days}</span>
                </div>
                <div className="flex gap-1.5">
                  {s.milestones.map((m: string) => (
                    <span key={m} className="rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider bg-sienna/10 text-sienna">
                      {m} due
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiring Certifications */}
      {(expiringCerts?.length ?? 0) > 0 && (
        <div className="mb-8 rounded-xl border border-rule bg-white/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sienna">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <h2 className="font-mono text-xs font-medium text-ink-soft uppercase tracking-wider">Expiring Certifications</h2>
            </div>
            <a href="/admin/certifications?status=expiring" className="font-mono text-xs text-sienna hover:underline">View all</a>
          </div>
          <div className="space-y-2">
            {expiringCerts!.slice(0, 5).map((cert: any) => {
              const staffName = cert.academy_staff ? `${cert.academy_staff.first_name} ${cert.academy_staff.last_name}` : 'Unknown'
              const isExpired = new Date(cert.expiry_date) < now
              return (
                <div key={cert.id} className="flex items-center justify-between rounded-lg border border-rule/50 px-4 py-2">
                  <span className="font-mono text-sm text-ink">{staffName} — {cert.cert_type}</span>
                  <span className={`font-mono text-xs ${isExpired ? 'text-rosewood' : 'text-sienna'}`}>
                    {isExpired ? 'Expired' : `Expires ${new Date(cert.expiry_date).toLocaleDateString('en-AU')}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Wellbeing Alerts */}
      {(wellbeingAlerts?.length ?? 0) > 0 && (
        <div className="mb-8 rounded-xl border border-rosewood/20 bg-rosewood/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rosewood">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
              </svg>
              <h2 className="font-mono text-xs font-medium text-rosewood uppercase tracking-wider">Wellbeing Alerts</h2>
            </div>
            <a href="/admin/wellbeing" className="font-mono text-xs text-rosewood hover:underline">View all</a>
          </div>
          <div className="space-y-2">
            {wellbeingAlerts!.map((ci: any) => {
              const staffName = ci.academy_staff ? `${ci.academy_staff.first_name} ${ci.academy_staff.last_name}` : 'Unknown'
              return (
                <div key={ci.id} className="flex items-center justify-between rounded-lg border border-rosewood/10 bg-white/80 px-4 py-3">
                  <div>
                    <span className="font-mono text-sm text-ink font-medium">{staffName}</span>
                    <span className="font-mono text-xs text-ink-soft ml-2">
                      {new Date(ci.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                    </span>
                    {ci.notes && <p className="font-mono text-xs text-ink-soft mt-1 line-clamp-1">{ci.notes}</p>}
                  </div>
                  <span className="rounded-full bg-rosewood/10 px-2.5 py-0.5 font-mono text-xs text-rosewood font-medium">
                    {ci.rating}/5
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-light text-ink">Recent Activity</h2>
        </div>
        <div className="space-y-2">
          {(recentStaff ?? []).map((s: any, i: number) => (
            <div key={`staff-${i}`} className="flex items-center justify-between rounded-lg border border-rule bg-white/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sienna/10 text-sienna">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>
                </div>
                <div>
                  <p className="font-mono text-sm text-ink">{s.first_name} {s.last_name} joined</p>
                  <p className="font-mono text-[10px] text-ink-soft capitalize">{s.role.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <span className="font-mono text-xs text-ink-soft">
                {new Date(s.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
          {(recentCompletions ?? []).map((c: any, i: number) => (
            <div key={`comp-${i}`} className="flex items-center justify-between rounded-lg border border-rule bg-white/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sage/10 text-sage">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <div>
                  <p className="font-mono text-sm text-ink">
                    {c.academy_staff?.first_name} {c.academy_staff?.last_name} completed
                  </p>
                  <p className="font-mono text-[10px] text-ink-soft">{c.academy_training_modules?.title}</p>
                </div>
              </div>
              <span className="font-mono text-xs text-ink-soft">
                {c.completed_at ? new Date(c.completed_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : ''}
              </span>
            </div>
          ))}
          {!(recentStaff?.length) && !(recentCompletions?.length) && (
            <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-8 text-center">
              <p className="font-mono text-sm text-ink-soft">No recent activity.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function AdminStatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string
  value: string
  accent?: string
  icon?: string
}) {
  return (
    <div className="rounded-xl border border-rule bg-white/60 p-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">{label}</p>
        {icon && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-oatmeal-dk"><path d={icon} /></svg>
        )}
      </div>
      <p className={`font-serif text-3xl font-light ${accent ? `text-${accent}` : 'text-ink'}`}>
        {value}
      </p>
    </div>
  )
}
