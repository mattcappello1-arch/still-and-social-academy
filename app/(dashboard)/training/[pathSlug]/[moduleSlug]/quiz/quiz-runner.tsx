'use client'

import { useState } from 'react'
import { submitQuiz } from '@/app/actions/training'
import Link from 'next/link'

interface QuizQuestion {
  question: string
  options: string[]
}

interface QuizResult {
  question: string
  selected: number
  correct: number
  isCorrect: boolean
}

export function QuizRunner({
  questions,
  quizId,
  moduleId,
  passScore,
  pathSlug,
  moduleSlug,
  alreadyPassed,
  previousScore,
}: {
  questions: QuizQuestion[]
  quizId: string
  moduleId: string
  passScore: number
  pathSlug: string
  moduleSlug: string
  alreadyPassed: boolean
  previousScore?: number | null
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    score: number
    passed: boolean
    results: QuizResult[]
    attempts: number
  } | null>(null)

  if (alreadyPassed) {
    return (
      <div className="rounded-xl border border-sage/30 bg-sage/5 p-6 text-center">
        <p className="font-mono text-sm text-sage">
          You have already passed this quiz
          {previousScore !== null && previousScore !== undefined
            ? ` with a score of ${previousScore}%`
            : ''}
          .
        </p>
        <Link
          href={`/training/${pathSlug}/${moduleSlug}`}
          className="mt-3 inline-block font-mono text-sm text-sienna transition hover:underline"
        >
          Back to module
        </Link>
      </div>
    )
  }

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const res = await submitQuiz(moduleId, quizId, answers)
    if (res.success) {
      setResult({
        score: res.score!,
        passed: res.passed!,
        results: res.results!,
        attempts: res.attempts!,
      })
    }
    setSubmitting(false)
  }

  const allAnswered = questions.every((_, i) => answers[i] !== undefined)

  if (result) {
    return (
      <div className="space-y-6">
        {/* Score card */}
        <div
          className={`rounded-xl border p-6 text-center ${
            result.passed
              ? 'border-sage/30 bg-sage/5'
              : 'border-rosewood/30 bg-rosewood/5'
          }`}
        >
          <p className="font-serif text-4xl font-light text-ink">
            {result.score}%
          </p>
          <p
            className={`mt-1 font-mono text-sm ${result.passed ? 'text-sage' : 'text-rosewood'}`}
          >
            {result.passed
              ? 'Congratulations, you passed!'
              : `You need ${passScore}% to pass. Try again.`}
          </p>
          <p className="mt-1 font-mono text-xs text-ink-soft">
            Attempt {result.attempts}
          </p>
        </div>

        {/* Results breakdown */}
        <div className="space-y-3">
          {result.results.map((r, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 ${
                r.isCorrect
                  ? 'border-sage/20 bg-white/60'
                  : 'border-rosewood/20 bg-rosewood/5'
              }`}
            >
              <div className="mb-2 flex items-start gap-2">
                <span
                  className={`mt-0.5 shrink-0 font-mono text-xs ${r.isCorrect ? 'text-sage' : 'text-rosewood'}`}
                >
                  {r.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <p className="font-mono text-sm text-ink">{r.question}</p>
              {!r.isCorrect && (
                <p className="mt-1 font-mono text-xs text-ink-soft">
                  Correct answer: {questions[i]?.options[r.correct]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {result.passed ? (
            <Link
              href={`/training/${pathSlug}/${moduleSlug}`}
              className="rounded-lg bg-sienna px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna/90"
            >
              Back to Module
            </Link>
          ) : (
            <button
              onClick={() => {
                setResult(null)
                setAnswers({})
              }}
              className="rounded-lg bg-charcoal px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna"
            >
              Try Again
            </button>
          )}
          <Link
            href={`/training/${pathSlug}`}
            className="font-mono text-sm text-ink-soft transition hover:text-sienna"
          >
            Back to Path
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <div
          key={qi}
          className="rounded-xl border border-rule bg-white/60 p-5"
        >
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
            Question {qi + 1} of {questions.length}
          </p>
          <p className="mb-4 font-mono text-sm font-medium text-ink">
            {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((option, oi) => (
              <label
                key={oi}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                  answers[qi] === oi
                    ? 'border-sienna/40 bg-sienna/5'
                    : 'border-rule hover:border-oatmeal-dk/30'
                }`}
              >
                <input
                  type="radio"
                  name={`q-${qi}`}
                  checked={answers[qi] === oi}
                  onChange={() => handleSelect(qi, oi)}
                  className="h-4 w-4 border-rule text-sienna accent-sienna"
                />
                <span className="font-mono text-sm text-ink">{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="w-full rounded-lg bg-sienna px-5 py-3 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna/90 disabled:opacity-40"
      >
        {submitting ? 'Submitting...' : 'Submit Answers'}
      </button>
    </div>
  )
}
