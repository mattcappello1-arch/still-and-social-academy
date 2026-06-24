'use client'

import { useState } from 'react'
import { startModule, markModuleComplete } from '@/app/actions/training'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function ModuleActions({
  moduleId,
  isCompleted,
  hasQuiz,
  quizUrl,
  progressStatus,
}: {
  moduleId: string
  isCompleted: boolean
  hasQuiz: boolean
  quizUrl?: string
  progressStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(progressStatus !== 'not_started')
  const router = useRouter()

  const handleStart = async () => {
    setLoading(true)
    await startModule(moduleId)
    setStarted(true)
    setLoading(false)
    router.refresh()
  }

  const handleComplete = async () => {
    setLoading(true)
    await markModuleComplete(moduleId)
    setLoading(false)
    router.refresh()
  }

  if (isCompleted) {
    return (
      <div className="rounded-xl border border-sage/30 bg-sage/5 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <div>
            <p className="font-mono text-sm font-medium text-sage">Module completed</p>
            <p className="font-mono text-xs text-sage/70">Well done! You can move on to the next module.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-rule bg-white/60 p-5">
      <div className="flex flex-wrap items-center gap-3">
        {!started && (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-charcoal px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
          >
            {loading ? (
              'Starting...'
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                Start Module
              </>
            )}
          </button>
        )}

        {started && hasQuiz && quizUrl && (
          <Link
            href={quizUrl}
            className="flex items-center gap-2 rounded-lg bg-sienna px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna/90"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" /></svg>
            Take Quiz to Complete
          </Link>
        )}

        {started && !hasQuiz && (
          <button
            onClick={handleComplete}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-sienna px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna/90 disabled:opacity-50"
          >
            {loading ? (
              'Saving...'
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                Mark as Complete
              </>
            )}
          </button>
        )}

        {started && (
          <p className="font-mono text-xs text-ink-soft">
            {hasQuiz ? 'Complete the quiz to finish this module' : 'Finished reading? Mark this module as complete'}
          </p>
        )}
        {!started && (
          <p className="font-mono text-xs text-ink-soft">
            Start this module to begin tracking your progress
          </p>
        )}
      </div>
    </div>
  )
}
