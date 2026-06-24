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

  // Get all modules for these paths (including estimated_minutes)
  const pathIds = (rolePaths ?? []).map((rp) => rp.path_id)
  const { data: modules } =
    pathIds.length > 0
      ? await supabase
          .from('academy_training_modules')
          .select('id, path_id, estimated_minutes')
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
    estimatedMinutesRemaining: number
    status: 'not_started' | 'in_progress' | 'complete'
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

      // Calculate remaining minutes (incomplete modules)
      const estimatedMinutesRemaining = pathModules
        .filter((m) => progressMap.get(m.id) !== 'completed')
        .reduce((sum, m) => sum + (m.estimated_minutes ?? 0), 0)

      const status: PathData['status'] =
        percent === 100
          ? 'complete'
          : completedCount > 0 || inProgressCount > 0
            ? 'in_progress'
            : 'not_started'

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
        estimatedMinutesRemaining,
        status,
      }
    })

  const departmentColors: Record<string, string> = {
    foh: 'bg-sienna/10 text-sienna border-sienna/20',
    kitchen: 'bg-olive/10 text-olive border-olive/20',
    leadership: 'bg-rosewood/10 text-rosewood border-rosewood/20',
    universal: 'bg-coffee/10 text-coffee border-coffee/20',
  }

  const departmentLabels: Record<string, string> = {
    universal: 'Universal',
    foh: 'Front of House',
    kitchen: 'Kitchen',
    leadership: 'Leadership',
  }

  const statusLabels: Record<string, { text: string; className: string }> = {
    not_started: { text: 'Not Started', className: 'text-ink-soft bg-cream-soft border-rule' },
    in_progress: { text: 'In Progress', className: 'text-sienna bg-sienna/5 border-sienna/20' },
    complete: { text: 'Complete', className: 'text-sage bg-sage/5 border-sage/20' },
  }

  const overallCompleted = paths.reduce((s, p) => s + p.completedCount, 0)
  const overallTotal = paths.reduce((s, p) => s + p.moduleCount, 0)
  const overallPct = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Learning Pathways</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Complete your assigned training paths to build your skills and knowledge.
        </p>
      </div>

      {/* Overall progress summary */}
      {paths.length > 0 && (
        <div className="mb-8 rounded-xl border border-rule bg-white/60 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">Overall Progress</p>
            <p className="font-mono text-sm text-ink">{overallCompleted} of {overallTotal} modules completed</p>
          </div>
          <ProgressBar value={overallPct} size="md" />
        </div>
      )}

      {paths.length > 0 ? (
        <div className="space-y-4">
          {paths.map((path) => {
            const deptColor = departmentColors[path.department] ?? departmentColors.universal
            const status = statusLabels[path.status]
            return (
              <Link
                key={path.id}
                href={`/training/${path.slug}`}
                className="group block rounded-xl border border-rule bg-white/60 p-5 transition hover:border-sienna/30 hover:shadow-md hover:-translate-y-[1px]"
              >
                {/* Top row: badges */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase ${deptColor}`}>
                    {departmentLabels[path.department] ?? path.department}
                  </span>
                  {path.isRequired && (
                    <span className="inline-flex rounded-full border border-rosewood/20 bg-rosewood/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-rosewood uppercase">
                      Required
                    </span>
                  )}
                  <span className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase ${status.className}`}>
                    {status.text}
                  </span>
                  {path.percent === 100 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-sage/30 bg-sage/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-sage uppercase">
                      Certified
                    </span>
                  )}
                </div>

                {/* Title + description */}
                <h3 className="mb-1 font-serif text-xl font-light text-ink group-hover:text-sienna transition">
                  {path.title}
                </h3>
                {path.description && (
                  <p className="mb-3 font-mono text-sm text-ink-soft line-clamp-2">
                    {path.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mb-2">
                  <ProgressBar value={path.percent} showLabel={false} size="sm" />
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-ink-soft">
                  <span>{path.completedCount} of {path.moduleCount} modules completed</span>
                  <span className="font-serif text-lg font-light text-ink">{path.percent}%</span>
                  {path.estimatedMinutesRemaining > 0 && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                      Est. {path.estimatedMinutesRemaining} min remaining
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
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
