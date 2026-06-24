import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { QuizRunner } from './quiz-runner'

export default async function QuizPage({
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
    .select('id, slug, title')
    .eq('path_id', path.id)
    .eq('slug', moduleSlug)
    .single()

  if (!module) notFound()

  // Fetch quiz
  const { data: quiz } = await supabase
    .from('academy_quizzes')
    .select('*')
    .eq('module_id', module.id)
    .limit(1)
    .maybeSingle()

  if (!quiz) notFound()

  // Get existing progress
  const { data: progress } = await supabase
    .from('academy_staff_module_progress')
    .select('status, quiz_score, quiz_attempts')
    .eq('staff_id', user.id)
    .eq('module_id', module.id)
    .maybeSingle()

  const questions = (quiz.questions ?? []) as Array<{
    question: string
    options?: string[]
    correct?: number
    type?: 'multiple_choice' | 'reflection' | 'scenario'
    context?: string
    minLength?: number
  }>

  // Strip correct answers for client — don't expose
  const clientQuestions = questions.map((q) => {
    const type = q.type || 'multiple_choice'
    if (type === 'reflection') {
      return { question: q.question, type: q.type, minLength: q.minLength }
    }
    if (type === 'scenario') {
      return { question: q.question, type: q.type, context: q.context, minLength: q.minLength }
    }
    return { question: q.question, options: q.options }
  })

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
        <Link
          href={`/training/${pathSlug}/${moduleSlug}`}
          className="transition hover:text-sienna"
        >
          {module.title}
        </Link>
        <span>/</span>
        <span className="text-ink">Quiz</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">
          {quiz.title}
        </h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Pass score: {quiz.pass_score}% &middot; {clientQuestions.length}{' '}
          question{clientQuestions.length !== 1 ? 's' : ''}
          {progress?.quiz_attempts
            ? ` · ${progress.quiz_attempts} previous attempt${progress.quiz_attempts !== 1 ? 's' : ''}`
            : ''}
        </p>
      </div>

      <QuizRunner
        questions={clientQuestions}
        quizId={quiz.id}
        moduleId={module.id}
        passScore={quiz.pass_score}
        pathSlug={pathSlug}
        moduleSlug={moduleSlug}
        alreadyPassed={progress?.status === 'completed'}
        previousScore={progress?.quiz_score}
      />
    </div>
  )
}
