import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ProgressBar } from '@/components/training/ProgressBar'

const FOUNDATION_SLUG = 'foundation'

export default async function FoundationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get foundation path
  const { data: path } = await supabase
    .from('academy_training_paths')
    .select('id, slug, title, description')
    .eq('slug', FOUNDATION_SLUG)
    .single()

  if (!path) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl font-light text-ink">Foundation Training</h1>
        <p className="mt-4 font-mono text-sm text-ink-soft">Foundation training is being set up. Check back soon.</p>
      </div>
    )
  }

  // Get all modules
  const { data: modules } = await supabase
    .from('academy_training_modules')
    .select('id, slug, title, description, estimated_minutes, sort_order')
    .eq('path_id', path.id)
    .eq('is_active', true)
    .order('sort_order')

  // Get progress
  const moduleIds = (modules ?? []).map(m => m.id)
  const { data: progress } = moduleIds.length > 0
    ? await supabase
        .from('academy_staff_module_progress')
        .select('module_id, status, completed_at')
        .eq('staff_id', user.id)
        .in('module_id', moduleIds)
    : { data: [] }

  const progressMap = new Map((progress ?? []).map(p => [p.module_id, p]))

  const totalModules = (modules ?? []).length
  const completedCount = (modules ?? []).filter(m => progressMap.get(m.id)?.status === 'completed').length
  const pct = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0
  const isComplete = pct === 100

  // Find next incomplete module
  const nextModule = (modules ?? []).find(m => progressMap.get(m.id)?.status !== 'completed')

  // Module status helpers
  const moduleStatus = (moduleId: string) => {
    const p = progressMap.get(moduleId)
    if (!p) return 'not_started'
    return p.status as string
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-2">
        <p className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase">Foundation</p>
      </div>
      <h1 className="font-serif text-3xl font-light text-ink">Foundation Training</h1>
      <p className="mt-2 font-serif text-lg font-light text-ink-soft italic">
        Before we teach you how, we teach you why.
      </p>

      {/* Progress card */}
      <div className="mt-8 rounded-xl border border-rule bg-white/60 p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">Your Progress</p>
          <span className="font-serif text-3xl font-light text-ink">{pct}%</span>
        </div>
        <ProgressBar value={pct} size="md" />
        <p className="mt-2 font-mono text-xs text-ink-soft">
          {completedCount} of {totalModules} modules completed
          {!isComplete && nextModule && (
            <> &middot; Est. {(modules ?? []).filter(m => progressMap.get(m.id)?.status !== 'completed').reduce((s, m) => s + (m.estimated_minutes ?? 0), 0)} min remaining</>
          )}
        </p>
      </div>

      {/* Continue button */}
      {!isComplete && nextModule && (
        <Link
          href={`/training/${FOUNDATION_SLUG}/${nextModule.slug}`}
          className="mt-4 flex items-center justify-between rounded-xl border-2 border-sienna/30 bg-sienna/5 p-5 transition hover:border-sienna/50 hover:bg-sienna/10 group"
        >
          <div>
            <p className="font-mono text-[10px] tracking-widest text-sienna uppercase mb-1">
              {completedCount === 0 ? 'Start Here' : 'Continue Where You Left Off'}
            </p>
            <p className="font-serif text-xl font-light text-ink group-hover:text-sienna transition">
              {nextModule.title}
            </p>
          </div>
          <span className="flex items-center gap-2 rounded-lg bg-sienna px-5 py-2.5 font-mono text-xs font-medium tracking-wide text-cream transition group-hover:bg-sienna/90">
            {completedCount === 0 ? 'Begin' : 'Continue'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </span>
        </Link>
      )}

      {/* Completion certificate */}
      {isComplete && (
        <div className="mt-6 rounded-xl border-2 border-sage/40 bg-sage/5 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sage/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-light text-ink mb-1">Foundation Complete</h2>
          <p className="font-mono text-sm text-ink-soft mb-4">
            You have completed all Foundation Training modules. You now understand the heart and soul of Still & Social.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-sage/10 px-4 py-1.5 font-mono text-xs tracking-wide text-sage uppercase">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Foundation Certified
          </div>
        </div>
      )}

      {/* Module journey */}
      <div className="mt-8">
        <h2 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">The Journey</h2>
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-oatmeal/40" />

          <div className="space-y-3">
            {(modules ?? []).map((mod, i) => {
              const status = moduleStatus(mod.id)
              const isCompleted = status === 'completed'
              const isInProgress = status === 'in_progress'
              const isCurrent = nextModule?.id === mod.id
              const isLocked = !isCompleted && !isInProgress && !isCurrent && i > 0 && moduleStatus((modules ?? [])[i - 1]?.id) !== 'completed'

              return (
                <Link
                  key={mod.id}
                  href={isLocked ? '#' : `/training/${FOUNDATION_SLUG}/${mod.slug}`}
                  className={`group relative flex items-start gap-4 rounded-xl border p-4 transition ${
                    isCurrent
                      ? 'border-sienna/30 bg-sienna/5 hover:border-sienna/50'
                      : isCompleted
                        ? 'border-sage/20 bg-sage/5 hover:border-sage/30'
                        : isLocked
                          ? 'border-rule/50 bg-cream-soft/30 cursor-default opacity-60'
                          : 'border-rule bg-white/60 hover:border-sienna/30 hover:shadow-sm'
                  }`}
                  aria-disabled={isLocked}
                  tabIndex={isLocked ? -1 : undefined}
                >
                  {/* Step indicator */}
                  <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-mono ${
                    isCompleted
                      ? 'bg-sage text-cream'
                      : isCurrent
                        ? 'bg-sienna text-cream'
                        : isInProgress
                          ? 'bg-sienna/20 text-sienna border-2 border-sienna'
                          : 'bg-oatmeal/20 text-ink-soft border border-oatmeal/40'
                  }`}>
                    {isCompleted ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    ) : (
                      i + 1
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-serif text-base font-light ${
                        isCurrent ? 'text-sienna' : isCompleted ? 'text-sage-deep' : 'text-ink'
                      } ${!isLocked ? 'group-hover:text-sienna' : ''} transition`}>
                        {mod.title}
                      </h3>
                      {isCompleted && (
                        <span className="rounded-full bg-sage/10 px-2 py-0.5 font-mono text-[9px] tracking-wider text-sage uppercase">Done</span>
                      )}
                      {isCurrent && (
                        <span className="rounded-full bg-sienna/10 px-2 py-0.5 font-mono text-[9px] tracking-wider text-sienna uppercase">Up Next</span>
                      )}
                    </div>
                    {mod.description && (
                      <p className="mt-0.5 font-mono text-xs text-ink-soft line-clamp-1">{mod.description}</p>
                    )}
                    {mod.estimated_minutes && (
                      <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-ink-soft">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                        {mod.estimated_minutes} min
                      </p>
                    )}
                  </div>

                  {/* Arrow for accessible modules */}
                  {!isLocked && !isCompleted && (
                    <div className="flex items-center self-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-soft group-hover:text-sienna transition group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
