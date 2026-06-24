import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch staff counts by status
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

  // Fetch training module progress overview
  const { data: allProgress } = await supabase
    .from('academy_staff_module_progress')
    .select('status')

  const totalProgress = allProgress?.length ?? 0
  const completedProgress =
    allProgress?.filter((p) => p.status === 'completed').length ?? 0
  const completionRate =
    totalProgress > 0
      ? Math.round((completedProgress / totalProgress) * 100)
      : 0

  // Fetch pending invitations
  const { count: pendingInvites } = await supabase
    .from('academy_invitations')
    .select('*', { count: 'exact', head: true })
    .is('accepted_at', null)

  // Fetch recent staff
  const { data: recentStaff } = await supabase
    .from('academy_staff')
    .select('first_name, last_name, role, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">
            Admin Overview
          </h1>
          <p className="mt-1 font-mono text-sm text-ink-soft">
            Staff and training management at a glance
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-3">
        <a
          href="/admin/staff/new"
          className="flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna active:scale-[0.98]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>
          Invite Staff
        </a>
        <a
          href="/admin/signing"
          className="flex items-center gap-2 rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm tracking-wide text-ink transition hover:border-sienna/30 hover:text-sienna"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" /></svg>
          Assign Document
        </a>
        <a
          href="/admin/training"
          className="flex items-center gap-2 rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm tracking-wide text-ink transition hover:border-sienna/30 hover:text-sienna"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" /></svg>
          View Training
        </a>
        <a
          href="/admin/staff"
          className="flex items-center gap-2 rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm tracking-wide text-ink transition hover:border-sienna/30 hover:text-sienna"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 3a4 4 0 100 8 4 4 0 000-8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" /></svg>
          View All Staff
        </a>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Total Staff"
          value={String(totalStaff ?? 0)}
          icon="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 3a4 4 0 100 8 4 4 0 000-8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75"
        />
        <AdminStatCard
          label="Active"
          value={String(activeStaff ?? 0)}
          accent="sage"
          icon="M20 6L9 17l-5-5"
        />
        <AdminStatCard
          label="Pending"
          value={String(pendingStaff ?? 0)}
          accent="oatmeal-dk"
          icon="M12 8v4M12 16h.01"
        />
        <AdminStatCard
          label="Inactive"
          value={String(inactiveStaff ?? 0)}
          accent="ink-soft"
          icon="M18.36 5.64l-12.72 12.72M5.64 5.64l12.72 12.72"
        />
      </div>

      {/* Training + Invitations row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
            Training Completion
          </p>
          <p className="font-serif text-3xl font-light text-ink">
            {completionRate}%
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-oatmeal/30">
            <div
              className="h-full rounded-full bg-sienna transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-xs text-ink-soft">
            {completedProgress} of {totalProgress} modules completed across all
            staff
          </p>
        </div>

        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
            Pending Invitations
          </p>
          <p className="font-serif text-3xl font-light text-ink">
            {pendingInvites ?? 0}
          </p>
          <p className="mt-2 font-mono text-xs text-ink-soft">
            {pendingInvites && pendingInvites > 0
              ? 'Awaiting staff to accept'
              : 'No pending invitations'}
          </p>
        </div>
      </div>

      {/* Recent staff */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-light text-ink">
            Recent Staff
          </h2>
          <a href="/admin/staff" className="font-mono text-xs text-ink-soft transition hover:text-sienna">
            View all &rarr;
          </a>
        </div>
        {recentStaff && recentStaff.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-rule bg-white/60">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rule">
                  <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentStaff.map(
                  (
                    s: {
                      first_name: string
                      last_name: string
                      role: string
                      status: string
                      created_at: string
                    },
                    i: number
                  ) => (
                    <tr
                      key={i}
                      className="border-b border-rule transition last:border-b-0 hover:bg-cream-soft/30"
                    >
                      <td className="px-4 py-3 font-mono text-sm font-medium text-ink">
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-ink-soft capitalize">
                        {s.role.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                        {new Date(s.created_at).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-8 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 text-oatmeal-dk"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 3a4 4 0 100 8 4 4 0 000-8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" /></svg>
            <p className="font-mono text-sm text-ink-soft">
              No staff members yet. Invite your first team member to get
              started.
            </p>
            <a
              href="/admin/staff/new"
              className="mt-4 inline-block rounded-lg bg-charcoal px-4 py-2 font-mono text-xs font-medium tracking-wide text-cream transition hover:bg-sienna"
            >
              Invite Staff
            </a>
          </div>
        )}
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
        <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">
          {label}
        </p>
        {icon && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-oatmeal-dk"><path d={icon} /></svg>
        )}
      </div>
      <p
        className={`font-serif text-3xl font-light ${accent ? `text-${accent}` : 'text-ink'}`}
      >
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'border-sage/20 bg-sage/10 text-sage',
    pending: 'border-oatmeal-dk/30 bg-oatmeal/20 text-oatmeal-dk',
    inactive: 'border-rule bg-cream-soft text-ink-soft',
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-wide uppercase ${styles[status] ?? styles.inactive}`}
    >
      {status}
    </span>
  )
}
