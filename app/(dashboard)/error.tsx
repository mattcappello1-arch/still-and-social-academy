'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <h1 className="font-serif text-3xl font-light text-ink mb-4">Something went wrong</h1>
      <p className="text-sm text-ink-soft mb-6">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-sienna px-6 py-2.5 text-sm font-medium text-cream transition hover:bg-sienna/90"
      >
        Try Again
      </button>
    </div>
  )
}
