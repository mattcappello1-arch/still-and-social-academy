import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ModuleContent } from '@/components/training/ModuleContent'
import { ModuleActions } from './module-actions'

export default async function ModulePage({
  params,
}: {
  params: Promise<{ pathSlug: string; moduleSlug: string }>
}) {
  const { pathSlug, moduleSlug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch path
  const { data: path } = await supabase
    .from('academy_training_paths')
    .select('id, slug, title')
    .eq('slug', pathSlug)
    .single()

  if (!path) notFound()

  // Fetch module
  const { data: module } = await supabase
    .from('academy_training_modules')
    .select('*')
    .eq('path_id', path.id)
    .eq('slug', moduleSlug)
    .single()

  if (!module) notFound()

  // Fetch all modules in this path for prev/next navigation
  const { data: allModules } = await supabase
    .from('academy_training_modules')
    .select('id, slug, title, sort_order')
    .eq('path_id', path.id)
    .eq('is_active', true)
    .order('sort_order')

  const currentIndex =
    (allModules ?? []).findIndex((m) => m.id === module.id) ?? 0
  const prevModule = currentIndex > 0 ? allModules![currentIndex - 1] : null
  const nextModule =
    currentIndex < (allModules ?? []).length - 1
      ? allModules![currentIndex + 1]
      : null

  // Check if module has a quiz
  const { data: quiz } = await supabase
    .from('academy_quizzes')
    .select('id, title')
    .eq('module_id', module.id)
    .limit(1)
    .maybeSingle()

  // Get user progress
  const { data: progress } = await supabase
    .from('academy_staff_module_progress')
    .select('*')
    .eq('staff_id', user.id)
    .eq('module_id', module.id)
    .maybeSingle()

  const isCompleted = progress?.status === 'completed'
  const contentBlocks = (module.content as { blocks?: unknown[] })?.blocks ?? []

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 font-mono text-xs text-ink-soft">
        <Link href="/training" className="transition hover:text-sienna">
          Training
        </Link>
        <span className="text-oatmeal">/</span>
        <Link
          href={`/training/${pathSlug}`}
          className="transition hover:text-sienna"
        >
          {path.title}
        </Link>
        <span className="text-oatmeal">/</span>
        <span className="text-ink">{module.title}</span>
      </nav>

      {/* Progress indicator */}
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-xs text-ink-soft">
          Module {currentIndex + 1} of {(allModules ?? []).length}
        </p>
        <div className="flex items-center gap-1.5">
          {(allModules ?? []).map((m, i) => (
            <div
              key={m.id}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex
                  ? 'w-6 bg-sienna'
                  : i < currentIndex
                    ? 'w-1.5 bg-sage/40'
                    : 'w-1.5 bg-oatmeal/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-3xl font-light text-ink">
            {module.title}
          </h1>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sage/10 px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-sage uppercase">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Completed
            </span>
          )}
          {!!quiz && !isCompleted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-coffee/10 px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-coffee">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" /></svg>
              Quiz required
            </span>
          )}
        </div>
        {module.description && (
          <p className="font-mono text-sm text-ink-soft">
            {module.description}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          {module.estimated_minutes && (
            <span className="flex items-center gap-1 font-mono text-xs text-ink-soft">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              {module.estimated_minutes} min
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-8">
        <ModuleContent blocks={contentBlocks as never[]} moduleId={module.id} />
      </div>

      {/* Actions */}
      <ModuleActions
        moduleId={module.id}
        isCompleted={isCompleted}
        hasQuiz={!!quiz}
        quizUrl={
          quiz
            ? `/training/${pathSlug}/${moduleSlug}/quiz`
            : undefined
        }
        progressStatus={progress?.status ?? 'not_started'}
      />

      {/* Navigation */}
      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-rule pt-6">
        {prevModule ? (
          <Link
            href={`/training/${pathSlug}/${prevModule.slug}`}
            className="group flex flex-col rounded-xl border border-rule bg-white/60 p-4 transition hover:border-sienna/30 hover:shadow-sm"
          >
            <span className="mb-1 flex items-center gap-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transition group-hover:-translate-x-0.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Previous
            </span>
            <span className="font-mono text-sm text-ink group-hover:text-sienna transition truncate">
              {prevModule.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextModule ? (
          <Link
            href={`/training/${pathSlug}/${nextModule.slug}`}
            className="group flex flex-col items-end rounded-xl border border-rule bg-white/60 p-4 transition hover:border-sienna/30 hover:shadow-sm text-right"
          >
            <span className="mb-1 flex items-center gap-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
              Next
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transition group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </span>
            <span className="font-mono text-sm text-ink group-hover:text-sienna transition truncate">
              {nextModule.title}
            </span>
          </Link>
        ) : (
          <Link
            href={`/training/${pathSlug}`}
            className="group flex flex-col items-end rounded-xl border border-rule bg-white/60 p-4 transition hover:border-sienna/30 hover:shadow-sm text-right"
          >
            <span className="mb-1 flex items-center gap-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
              Finish
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 6L9 17l-5-5" /></svg>
            </span>
            <span className="font-mono text-sm text-ink group-hover:text-sienna transition">
              Back to {path.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}
