import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ModuleContent } from '@/components/training/ModuleContent'
import { ReadAloudWrapper } from './read-aloud-wrapper'
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

  // Fetch path — try with user client first, fall back to direct query
  let { data: path } = await supabase
    .from('academy_training_paths')
    .select('id, slug, title')
    .eq('slug', pathSlug)
    .single()

  // If RLS blocks it, try with a fresh client
  if (!path) {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const admin = await createAdminClient()
    const result = await admin
      .from('academy_training_paths')
      .select('id, slug, title')
      .eq('slug', pathSlug)
      .single()
    path = result.data
  }

  if (!path) notFound()

  // Fetch module
  let { data: module } = await supabase
    .from('academy_training_modules')
    .select('*')
    .eq('path_id', path.id)
    .eq('slug', moduleSlug)
    .single()

  if (!module) {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const admin = await createAdminClient()
    const result = await admin
      .from('academy_training_modules')
      .select('*')
      .eq('path_id', path.id)
      .eq('slug', moduleSlug)
      .single()
    module = result.data
  }

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
  const totalModules = (allModules ?? []).length

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 font-mono text-xs text-ink-soft">
        <Link href="/training" className="transition hover:text-sienna">
          Training
        </Link>
        <span className="text-oatmeal">&rsaquo;</span>
        <Link
          href={`/training/${pathSlug}`}
          className="transition hover:text-sienna"
        >
          {path.title}
        </Link>
        <span className="text-oatmeal">&rsaquo;</span>
        <span className="text-ink">{module.title}</span>
      </nav>

      {/* Module progress indicator */}
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-xs text-ink-soft">
          Module {currentIndex + 1} of {totalModules}
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
              Completed
            </span>
          )}
        </div>
        {module.description && (
          <p className="font-mono text-sm text-ink-soft">
            {module.description}
          </p>
        )}
        {module.estimated_minutes && (
          <p className="mt-1.5 flex items-center gap-1 font-mono text-xs text-ink-soft">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            {module.estimated_minutes} min
          </p>
        )}
      </div>

      {/* Content */}
      <div className="mb-8">
        <ModuleContent blocks={contentBlocks as never[]} moduleId={module.id} />
      </div>

      {/* Read Aloud Player */}
      <div className="mb-6">
        <ReadAloudWrapper
          moduleId={module.id}
          blocks={contentBlocks as Array<{ type: string; data: Record<string, unknown> }>}
          readAloudEnabled={module.read_aloud_enabled ?? true}
          audioIntroUrl={module.audio_intro_url ?? undefined}
          progressStatus={progress?.status ?? 'not_started'}
        />
      </div>

      {/* Mark as Complete */}
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

      {/* Prev / Next navigation */}
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
