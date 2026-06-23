import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProgressBar } from '@/components/training/ProgressBar'
import Link from 'next/link'

export default async function TrainingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get staff record for role
  const { data: staff } = await supabase
    .from('academy_staff')
    .select('role, department')
    .eq('id', user.id)
    .single()

  if (!staff) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-light text-ink">Training</h1>
        <EmptyState message="Your staff profile hasn't been set up yet. Please contact your manager." />
      </div>
    )
  }

  // Get assigned paths for this role
  const { data: rolePaths } = await supabase
    .from('academy_role_training_paths')
    .select(
      `
      path_id,
      is_required,
      sort_order,
      academy_training_paths (
        id, slug, title, description, department, sort_order
      )
    `
    )
    .eq('role', staff.role)
    .order('sort_order')

  // Get all modules for these paths
  const pathIds = (rolePaths ?? []).map((rp) => rp.path_id)
  const { data: modules } =
    pathIds.length > 0
      ? await supabase
          .from('academy_training_modules')
          .select('id, path_id')
          .in('path_id', pathIds)
          .eq('is_active', true)
      : { data: [] }

  // Get user's progress
  const moduleIds = (modules ?? []).map((m) => m.id)
  const { data: progress } =
    moduleIds.length > 0
      ? await supabase
          .from('academy_staff_module_progress')
          .select('module_id, status')
          .eq('staff_id', user.id)
          .in('module_id', moduleIds)
      : { data: [] }

  // Build progress map
  const progressMap = new Map(
    (progress ?? []).map((p) => [p.module_id, p.status])
  )

  // Calculate per-path stats
  type PathData = {
    id: string
    slug: string
    title: string
    description: string | null
    department: string
    isRequired: boolean
    moduleCount: number
    completedCount: number
    inProgressCount: number
    percent: number
  }

  const paths: PathData[] = (rolePaths ?? [])
    .filter((rp) => rp.academy_training_paths)
    .map((rp) => {
      const path = rp.academy_training_paths as unknown as {
        id: string
        slug: string
        title: string
        description: string | null
        department: string
      }
      const pathModules = (modules ?? []).filter(
        (m) => m.path_id === path.id
      )
      const completedCount = pathModules.filter(
        (m) => progressMap.get(m.id) === 'completed'
      ).length
      const inProgressCount = pathModules.filter(
        (m) => progressMap.get(m.id) === 'in_progress'
      ).length
      const percent =
        pathModules.length > 0
          ? Math.round((completedCount / pathModules.length) * 100)
          : 0

      return {
        id: path.id,
        slug: path.slug,
        title: path.title,
        description: path.description,
        department: path.department,
        isRequired: rp.is_required,
        moduleCount: pathModules.length,
        completedCount,
        inProgressCount,
        percent,
      }
    })

  const departmentColors: Record<string, string> = {
    foh: 'bg-sienna/10 text-sienna border-sienna/20',
    kitchen: 'bg-olive/10 text-olive border-olive/20',
    leadership: 'bg-rosewood/10 text-rosewood border-rosewood/20',
    universal: 'bg-coffee/10 text-coffee border-coffee/20',
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Training</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Your assigned training paths and progress
        </p>
      </div>

      {paths.length > 0 ? (
        <div className="space-y-4">
          {paths.map((path) => (
            <Link
              key={path.id}
              href={`/training/${path.slug}`}
              className="block rounded-xl border border-rule bg-white/60 p-5 transition hover:border-sienna/30 hover:shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-xl font-light text-ink">
                      {path.title}
                    </h2>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase ${departmentColors[path.department] ?? departmentColors.universal}`}
                    >
                      {path.department}
                    </span>
                    {path.isRequired && (
                      <span className="inline-flex rounded-full border border-rosewood/20 bg-rosewood/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-rosewood uppercase">
                        Required
                      </span>
                    )}
                  </div>
                  {path.description && (
                    <p className="font-mono text-sm text-ink-soft">
                      {path.description}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-serif text-2xl font-light text-ink">
                    {path.percent}%
                  </p>
                  <p className="font-mono text-[10px] text-ink-soft">
                    {path.completedCount}/{path.moduleCount} modules
                  </p>
                </div>
              </div>

              <ProgressBar value={path.percent} showLabel={false} size="sm" />

              {path.inProgressCount > 0 && (
                <p className="mt-2 font-mono text-xs text-sienna">
                  {path.inProgressCount} module
                  {path.inProgressCount > 1 ? 's' : ''} in progress
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState message="No training paths assigned to your role yet. Check back soon or speak to your manager." />
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-8 rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
      <p className="font-mono text-sm text-ink-soft">{message}</p>
    </div>
  )
}
