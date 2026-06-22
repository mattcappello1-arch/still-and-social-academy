import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRoleLabel, getDepartment, getDepartmentLabel } from '@/lib/utils/roles'
import type { Role, Department } from '@/lib/utils/roles'

export default async function PassportPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch staff profile
  const { data: staff } = await supabase
    .from('academy_staff')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch training progress
  const { data: progress } = await supabase
    .from('academy_staff_module_progress')
    .select('status, module_id')
    .eq('staff_id', user.id)

  // Fetch role training paths
  const { data: rolePaths } = staff
    ? await supabase
        .from('academy_role_training_paths')
        .select('path_id, is_required, academy_training_paths(id, title, slug)')
        .eq('role', staff.role)
    : { data: null }

  // Fetch pending documents
  const { count: pendingDocs } = await supabase
    .from('academy_staff_documents')
    .select('*', { count: 'exact', head: true })
    .eq('staff_id', user.id)
    .in('status', ['pending', 'viewed'])

  const totalModules = progress?.length ?? 0
  const completedModules =
    progress?.filter((p) => p.status === 'completed').length ?? 0
  const overallPercent =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  const role = (staff?.role ?? 'waiter') as Role
  const department = getDepartment(role)

  const departmentColors: Record<Department, string> = {
    foh: 'bg-sienna/10 text-sienna border-sienna/20',
    kitchen: 'bg-olive/10 text-olive border-olive/20',
    leadership: 'bg-rosewood/10 text-rosewood border-rosewood/20',
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">
          {staff
            ? `Welcome, ${staff.first_name}`
            : 'Welcome to the Academy'}
        </h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Your staff passport and training overview
        </p>
      </div>

      {/* Role + Department badges */}
      {staff && (
        <div className="mb-8 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs tracking-wide ${departmentColors[department]}`}
          >
            {getDepartmentLabel(department)}
          </span>
          <span className="inline-flex items-center rounded-full border border-rule bg-white/60 px-3 py-1 font-mono text-xs tracking-wide text-ink-soft">
            {getRoleLabel(role)}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs tracking-wide ${
              staff.status === 'active'
                ? 'border-sage/20 bg-sage/10 text-sage'
                : staff.status === 'pending'
                  ? 'border-oatmeal-dk/30 bg-oatmeal/20 text-oatmeal-dk'
                  : 'border-rule bg-cream-soft text-ink-soft'
            }`}
          >
            {staff.status}
          </span>
        </div>
      )}

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Training Progress"
          value={`${overallPercent}%`}
          subtitle={`${completedModules} of ${totalModules} modules`}
          hasProgress
          percent={overallPercent}
        />
        <StatCard
          label="Training Paths"
          value={String(rolePaths?.length ?? 0)}
          subtitle="Assigned to your role"
        />
        <StatCard
          label="Pending Documents"
          value={String(pendingDocs ?? 0)}
          subtitle={
            pendingDocs && pendingDocs > 0
              ? 'Awaiting your signature'
              : 'All caught up'
          }
        />
      </div>

      {/* Training paths */}
      <section className="mb-8">
        <h2 className="mb-4 font-serif text-xl font-light text-ink">
          Your Training Paths
        </h2>
        {rolePaths && rolePaths.length > 0 ? (
          <div className="space-y-3">
            {rolePaths.map((rp: Record<string, unknown>) => {
              const path = rp.academy_training_paths as {
                id: string
                title: string
                slug: string
              } | null
              return (
                <div
                  key={rp.path_id as string}
                  className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4"
                >
                  <div>
                    <p className="font-mono text-sm font-medium text-ink">
                      {path?.title ?? 'Training Path'}
                    </p>
                    <p className="font-mono text-xs text-ink-soft">
                      {rp.is_required ? 'Required' : 'Optional'}
                    </p>
                  </div>
                  <span className="rounded-full bg-oatmeal/30 px-3 py-1 font-mono text-xs text-ink-soft">
                    Not started
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState message="No training paths assigned yet. Your manager will set these up for your role." />
        )}
      </section>

      {/* Recent activity placeholder */}
      <section>
        <h2 className="mb-4 font-serif text-xl font-light text-ink">
          Recent Activity
        </h2>
        <EmptyState message="No activity yet. Complete your first training module to see progress here." />
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  subtitle,
  hasProgress,
  percent,
}: {
  label: string
  value: string
  subtitle: string
  hasProgress?: boolean
  percent?: number
}) {
  return (
    <div className="rounded-xl border border-rule bg-white/60 p-5">
      <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
        {label}
      </p>
      <p className="font-serif text-3xl font-light text-ink">{value}</p>
      {hasProgress && percent !== undefined && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-oatmeal/30">
          <div
            className="h-full rounded-full bg-sienna transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      <p className="mt-2 font-mono text-xs text-ink-soft">{subtitle}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-8 text-center">
      <p className="font-mono text-sm text-ink-soft">{message}</p>
    </div>
  )
}
