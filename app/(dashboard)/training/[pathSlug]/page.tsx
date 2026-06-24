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
  let { data: path } = await supabase
    .from('academy_training_paths')
    .select('*')
    .eq('slug', pathSlug)
    .single()

  if (!path) {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const admin = await createAdminClient()
    const result = await admin.from('academy_training_paths').select('*').eq('slug', pathSlug).single()
    path = result.data
  }

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

  // Check which modules have quizzes
  const { data: quizzes } = moduleIds.length > 0
    ? await supabase
        .from('academy_quizzes')
        .select('module_id')
        .in('module_id', moduleIds)
    : { data: [] }

  const quizModuleIds = new Set((quizzes ?? []).map((q) => q.module_id))

  const departmentColors: Record<string, string> = {
    foh: 'bg-sienna/10 text-sienna border-sienna/20',
    kitchen: 'bg-olive/10 text-olive border-olive/20',
    leadership: 'bg-rosewood/10 text-rosewood border-rosewood/20',
    universal: 'bg-coffee/10 text-coffee border-coffee/20',
  }

  // Calculate estimated total time
  const totalMinutes = (modules ?? []).reduce((sum, m) => sum + (m.estimated_minutes ?? 0), 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60
  const timeLabel = totalHours > 0
    ? `${totalHours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`
    : `${totalMinutes}m`

  // Find first incomplete module for "Start Training" CTA
  const firstIncomplete = (modules ?? []).find(
    (m) => progressMap.get(m.id)?.status !== 'completed'
  )
  const hasNotStarted = completedCount === 0 && !(progress ?? []).some((p) => p.status === 'in_progress')

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 font-mono text-xs text-ink-soft">
        <Link href="/training" className="transition hover:text-sienna">
          Training
        </Link>
        <span className="text-oatmeal">/</span>
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
          {percent === 100 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sage/10 px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-sage uppercase">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
              Complete
            </span>
          )}
        </div>
        {path.description && (
          <p className="font-mono text-sm text-ink-soft">{path.description}</p>
        )}
        {totalMinutes > 0 && (
          <p className="mt-1 font-mono text-xs text-ink-soft">
            Estimated time: {timeLabel} across {totalCount} modules
          </p>
        )}
      </div>

      {/* Progress overview */}
      <div className="mb-6 rounded-xl border border-rule bg-white/60 p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">
            Overall Progress
          </p>
          <p className="font-mono text-sm text-ink">
            {completedCount} of {totalCount} modules completed
          </p>
        </div>
        <ProgressBar value={percent} size="md" />
        {percent === 100 && (
          <div className="mt-4 flex items-center gap-3">
            <a
              href={`/api/certificate/${pathSlug}`}
              className="inline-flex items-center gap-2 rounded-lg border border-sage/30 bg-sage/10 px-4 py-2 font-mono text-sm font-medium tracking-wide text-sage transition hover:bg-sage/20"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
              Download Certificate
            </a>
          </div>
        )}
      </div>

      {/* Start Training CTA */}
      {hasNotStarted && firstIncomplete && (
        <div className="mb-8">
          <Link
            href={`/training/${pathSlug}/${firstIncomplete.slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-sienna px-6 py-3 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna/90"
          >
            Start Training
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      )}

      {/* Module list with connecting lines */}
      {modules && modules.length > 0 ? (
        <div className="relative">
          {modules.map((module, index) => {
            const prog = progressMap.get(module.id)
            const status = (prog?.status ?? 'not_started') as string
            const hasQuiz = quizModuleIds.has(module.id)
            const isLast = index === modules.length - 1

            return (
              <div key={module.id} className="relative flex gap-4">
                {/* Vertical line + step indicator */}
                <div className="flex flex-col items-center">
                  {/* Step circle */}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center">
                    {status === 'completed' ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/20 ring-2 ring-sage/10">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage"><path d="M20 6L9 17l-5-5" /></svg>
                      </div>
                    ) : status === 'in_progress' ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sienna/20 ring-2 ring-sienna/10">
                        <div className="h-3 w-3 rounded-full bg-sienna" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-oatmeal-dk/30 bg-cream">
                        <span className="font-mono text-xs text-ink-soft">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  {/* Connecting line */}
                  {!isLast && (
                    <div className={`w-0.5 flex-1 ${
                      status === 'completed' ? 'bg-sage/30' : 'bg-oatmeal/30'
                    }`} />
                  )}
                </div>

                {/* Module card */}
                <Link
                  href={`/training/${pathSlug}/${module.slug}`}
                  className="mb-3 flex flex-1 items-center gap-4 rounded-xl border border-rule bg-white/60 p-4 transition hover:border-sienna/30 hover:shadow-md hover:-translate-y-[1px] group"
                >
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition">
                        {module.title}
                      </p>
                      {hasQuiz && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-coffee/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-coffee">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" /></svg>
                          Quiz
                        </span>
                      )}
                    </div>
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
              </div>
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
