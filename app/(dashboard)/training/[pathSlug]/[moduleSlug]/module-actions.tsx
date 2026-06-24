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
  const [done, setDone] = useState(isCompleted)
  const router = useRouter()

  const handleComplete = async () => {
    setLoading(true)
    // Auto-start if not started yet
    if (progressStatus === 'not_started') {
      await startModule(moduleId)
    }
    await markModuleComplete(moduleId)
    setDone(true)
    setLoading(false)
    router.refresh()
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-sage/30 bg-sage/5 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-sage"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <p className="font-mono text-sm font-medium text-sage">Completed</p>
      </div>
    )
  }

  if (hasQuiz && quizUrl) {
    return (
      <div className="rounded-xl border border-rule bg-white/60 p-5">
        <Link
          href={quizUrl}
          className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" /></svg>
          Complete Quiz
        </Link>
        <p className="mt-2 font-mono text-xs text-ink-soft">Pass the quiz to complete this module</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-rule bg-white/60 p-5">
      <button
        onClick={handleComplete}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
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
    </div>
  )
}
