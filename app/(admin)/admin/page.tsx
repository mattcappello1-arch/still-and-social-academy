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
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">
          Admin Overview
        </h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Staff and training management at a glance
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Total Staff"
          value={String(totalStaff ?? 0)}
        />
        <AdminStatCard
          label="Active"
          value={String(activeStaff ?? 0)}
          accent="sage"
        />
        <AdminStatCard
          label="Pending"
          value={String(pendingStaff ?? 0)}
          accent="oatmeal-dk"
        />
        <AdminStatCard
          label="Inactive"
          value={String(inactiveStaff ?? 0)}
          accent="ink-soft"
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
          <a
            href="/admin/staff/new"
            className="mt-3 inline-block rounded-lg bg-charcoal px-4 py-2 font-mono text-xs font-medium tracking-wide text-cream transition hover:bg-sienna"
          >
            Invite Staff
          </a>
        </div>
      </div>

      {/* Recent staff */}
      <section>
        <h2 className="mb-4 font-serif text-xl font-light text-ink">
          Recent Staff
        </h2>
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
                      className="border-b border-rule last:border-b-0"
                    >
                      <td className="px-4 py-3 font-mono text-sm text-ink">
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-ink-soft">
                        {s.role.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-8 text-center">
            <p className="font-mono text-sm text-ink-soft">
              No staff members yet. Invite your first team member to get
              started.
            </p>
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
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-rule bg-white/60 p-5">
      <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
        {label}
      </p>
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
