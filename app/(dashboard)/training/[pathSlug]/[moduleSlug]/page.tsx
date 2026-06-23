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
        <span>/</span>
        <Link
          href={`/training/${pathSlug}`}
          className="transition hover:text-sienna"
        >
          {path.title}
        </Link>
        <span>/</span>
        <span className="text-ink">{module.title}</span>
      </nav>

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
        </div>
        {module.description && (
          <p className="font-mono text-sm text-ink-soft">
            {module.description}
          </p>
        )}
        {module.estimated_minutes && (
          <p className="mt-1 font-mono text-xs text-ink-soft">
            Estimated time: {module.estimated_minutes} minutes
          </p>
        )}
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
      <div className="mt-8 flex items-center justify-between border-t border-rule pt-6">
        {prevModule ? (
          <Link
            href={`/training/${pathSlug}/${prevModule.slug}`}
            className="group flex items-center gap-2 font-mono text-sm text-ink-soft transition hover:text-sienna"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="transition group-hover:-translate-x-0.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {prevModule.title}
          </Link>
        ) : (
          <div />
        )}

        {nextModule ? (
          <Link
            href={`/training/${pathSlug}/${nextModule.slug}`}
            className="group flex items-center gap-2 font-mono text-sm text-ink-soft transition hover:text-sienna"
          >
            {nextModule.title}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="transition group-hover:translate-x-0.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
