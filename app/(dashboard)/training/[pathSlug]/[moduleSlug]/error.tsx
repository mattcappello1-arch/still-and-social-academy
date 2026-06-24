'use client'

import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <h1 className="font-serif text-3xl font-light text-ink mb-4">Could not load module</h1>
      <p className="text-sm text-ink-soft mb-6">
        {error.message || 'There was a problem loading this training module. Please try again.'}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-sienna px-6 py-2.5 text-sm font-medium text-cream transition hover:bg-sienna/90"
        >
          Try Again
        </button>
        <Link
          href="/training"
          className="rounded-lg border border-rule px-6 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-cream-soft"
        >
          Back to Training
        </Link>
      </div>
    </div>
  )
}
