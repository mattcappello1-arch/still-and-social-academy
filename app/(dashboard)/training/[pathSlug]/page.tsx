import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ProgressBar } from '@/components/training/ProgressBar'
import Link from 'next/link'

export default async function TrainingPathPage({
  params,
}: {
  params: Promise<{ pathSlug: string }>
}) {
  const { pathSlug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch path
  const { data: path } = await supabase
    .from('academy_training_paths')
    .select('*')
    .eq('slug', pathSlug)
    .single()

  if (!path) notFound()

  // Fetch modules in order
  const { data: modules } = await supabase
    .from('academy_training_modules')
    .select('id, slug, title, description, content_type, estimated_minutes, sort_order')
    .eq('path_id', path.id)
    .eq('is_active', true)
    .order('sort_order')

  // Fetch user progress for these modules
  const moduleIds = (modules ?? []).map((m) => m.id)
  const { data: progress } =
    moduleIds.length > 0
      ? await supabase
          .from('academy_staff_module_progress')
          .select('module_id, status, completed_at')
          .eq('staff_id', user.id)
          .in('module_id', moduleIds)
      : { data: [] }

  const progressMap = new Map(
    (progress ?? []).map((p) => [p.module_id, p])
  )

  const completedCount = (progress ?? []).filter(
    (p) => p.status === 'completed'
  ).length
  const totalCount = (modules ?? []).length
  const percent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const departmentColors: Record<string, string> = {
    foh: 'bg-sienna/10 text-sienna border-sienna/20',
    kitchen: 'bg-olive/10 text-olive border-olive/20',
    leadership: 'bg-rosewood/10 text-rosewood border-rosewood/20',
    universal: 'bg-coffee/10 text-coffee border-coffee/20',
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 font-mono text-xs text-ink-soft">
        <Link href="/training" className="transition hover:text-sienna">
          Training
        </Link>
        <span>/</span>
        <span className="text-ink">{path.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h1 className="font-serif text-3xl font-light text-ink">
            {path.title}
          </h1>
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase ${departmentColors[path.department] ?? departmentColors.universal}`}
          >
            {path.department}
          </span>
        </div>
        {path.description && (
          <p className="font-mono text-sm text-ink-soft">{path.description}</p>
        )}
      </div>

      {/* Progress overview */}
      <div className="mb-8 rounded-xl border border-rule bg-white/60 p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">
            Overall Progress
          </p>
          <p className="font-mono text-sm text-ink">
            {completedCount} of {totalCount} modules completed
          </p>
        </div>
        <ProgressBar value={percent} size="md" />
      </div>

      {/* Module list */}
      {modules && modules.length > 0 ? (
        <div className="space-y-3">
          {modules.map((module, index) => {
            const prog = progressMap.get(module.id)
            const status = (prog?.status ?? 'not_started') as string

            return (
              <Link
                key={module.id}
                href={`/training/${pathSlug}/${module.slug}`}
                className="flex items-center gap-4 rounded-xl border border-rule bg-white/60 p-4 transition hover:border-sienna/30 hover:shadow-sm"
              >
                {/* Status icon */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {status === 'completed' ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/20">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-sage"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  ) : status === 'in_progress' ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sienna/20">
                      <div className="h-3 w-3 rounded-full border-2 border-sienna border-r-transparent" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-oatmeal-dk/30">
                      <span className="font-mono text-xs text-ink-soft">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-medium text-ink">
                    {module.title}
                  </p>
                  {module.description && (
                    <p className="mt-0.5 truncate font-mono text-xs text-ink-soft">
                      {module.description}
                    </p>
                  )}
                </div>

                {/* Meta */}
                <div className="flex shrink-0 items-center gap-3">
                  {module.estimated_minutes && (
                    <span className="font-mono text-xs text-ink-soft">
                      {module.estimated_minutes} min
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wide uppercase ${
                      status === 'completed'
                        ? 'bg-sage/10 text-sage'
                        : status === 'in_progress'
                          ? 'bg-sienna/10 text-sienna'
                          : 'bg-oatmeal/30 text-ink-soft'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">
            No modules have been added to this path yet.
          </p>
        </div>
      )}
    </div>
  )
}
