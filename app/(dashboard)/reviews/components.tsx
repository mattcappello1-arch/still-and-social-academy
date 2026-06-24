'use client'

import { useActionState } from 'react'
import { submitReflection } from '@/app/actions/reviews'

const initialState = { error: undefined as string | undefined, success: undefined as boolean | undefined }

export function ReflectionForm({ reviewId }: { reviewId: string }) {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      formData.set('review_id', reviewId)
      const result = await submitReflection(formData)
      return result as typeof initialState
    },
    initialState
  )

  if (state?.success) {
    return (
      <div className="rounded-xl border border-sage/20 bg-sage/10 p-6 text-center">
        <p className="font-mono text-sm text-sage-deep">Your reflection has been submitted. Your manager will review it soon.</p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block mb-1 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">
          What are you most proud of?
        </label>
        <textarea
          name="proud_of"
          required
          rows={3}
          className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none resize-none"
          placeholder="Share what you're proud of..."
        />
      </div>
      <div>
        <label className="block mb-1 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">
          What have you learned recently?
        </label>
        <textarea
          name="learned"
          required
          rows={3}
          className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none resize-none"
          placeholder="Recent learnings..."
        />
      </div>
      <div>
        <label className="block mb-1 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">
          What would you like to improve?
        </label>
        <textarea
          name="improve"
          required
          rows={3}
          className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none resize-none"
          placeholder="Areas for improvement..."
        />
      </div>
      <div>
        <label className="block mb-1 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">
          What support would help you grow?
        </label>
        <textarea
          name="support_needed"
          required
          rows={3}
          className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none resize-none"
          placeholder="Support you'd like..."
        />
      </div>
      {state?.error && (
        <p className="font-mono text-xs text-rosewood">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-charcoal px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
      >
        {pending ? 'Submitting...' : 'Submit Reflection'}
      </button>
    </form>
  )
}
