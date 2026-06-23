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
      <div className="rounded-xl border border-sage/30 bg-sage/5 p-5 text-center">
        <p className="font-mono text-sm text-sage">
          You have completed this module.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!started && (
        <button
          onClick={handleStart}
          disabled={loading}
          className="rounded-lg bg-charcoal px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
        >
          {loading ? 'Starting...' : 'Start Module'}
        </button>
      )}

      {started && hasQuiz && quizUrl && (
        <Link
          href={quizUrl}
          className="rounded-lg bg-sienna px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna/90"
        >
          Take Quiz
        </Link>
      )}

      {started && !hasQuiz && (
        <button
          onClick={handleComplete}
          disabled={loading}
          className="rounded-lg bg-sienna px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna/90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Mark as Complete'}
        </button>
      )}
    </div>
  )
}
