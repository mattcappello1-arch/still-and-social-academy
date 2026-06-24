'use client'

import { useActionState } from 'react'
import { createReview, submitManagerReview } from '@/app/actions/reviews'

const initialState = { error: undefined as string | undefined, success: undefined as boolean | undefined }

export function CreateReviewForm({ staffList }: { staffList: { id: string; first_name: string; last_name: string }[] }) {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createReview(formData)
      return result as typeof initialState
    },
    initialState
  )

  return (
    <form action={action} className="rounded-xl border border-rule bg-white/60 p-5">
      <p className="mb-4 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Create New Review</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">Staff Member</label>
          <select
            name="staff_id"
            required
            className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink focus:border-sienna/30 focus:outline-none"
          >
            <option value="">Select staff...</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">Review Type</label>
          <select
            name="review_type"
            required
            className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink focus:border-sienna/30 focus:outline-none"
          >
            <option value="">Select type...</option>
            <option value="performance">Performance Review</option>
            <option value="probation_30">30-Day Probation</option>
            <option value="probation_60">60-Day Probation</option>
            <option value="probation_90">90-Day Probation</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-charcoal px-4 py-2 font-mono text-xs font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
          >
            {pending ? 'Creating...' : 'Create Review'}
          </button>
        </div>
      </div>
      {state?.error && <p className="mt-2 font-mono text-xs text-rosewood">{state.error}</p>}
      {state?.success && <p className="mt-2 font-mono text-xs text-sage-deep">Review created successfully.</p>}
    </form>
  )
}

export function ManagerReviewForm({ reviewId, isProbation }: { reviewId: string; isProbation: boolean }) {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      formData.set('review_id', reviewId)
      const result = await submitManagerReview(formData)
      return result as typeof initialState
    },
    initialState
  )

  if (state?.success) {
    return (
      <div className="rounded-xl border border-sage/20 bg-sage/10 p-6 text-center">
        <p className="font-mono text-sm text-sage-deep">Manager review submitted successfully.</p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block mb-1 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Strengths</label>
        <textarea name="strengths" required rows={3} className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none resize-none" placeholder="Employee strengths..." />
      </div>
      <div>
        <label className="block mb-1 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Areas for Development</label>
        <textarea name="areas_for_development" required rows={3} className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none resize-none" placeholder="Areas to develop..." />
      </div>
      <div>
        <label className="block mb-1 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Training Recommendations</label>
        <textarea name="training_recommendations" rows={3} className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none resize-none" placeholder="Recommended training..." />
      </div>
      <div>
        <label className="block mb-1 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Future Opportunities</label>
        <textarea name="future_opportunities" rows={3} className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none resize-none" placeholder="Future growth opportunities..." />
      </div>
      <div>
        <label className="block mb-1 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Additional Notes</label>
        <textarea name="additional_notes" rows={2} className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none resize-none" placeholder="Any other notes..." />
      </div>
      {isProbation && (
        <div>
          <label className="block mb-1 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Probation Outcome</label>
          <select name="probation_outcome" required className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink focus:border-sienna/30 focus:outline-none">
            <option value="">Select outcome...</option>
            <option value="pass">Pass</option>
            <option value="extend">Extend</option>
            <option value="development_plan">Development Plan</option>
          </select>
        </div>
      )}
      {state?.error && <p className="font-mono text-xs text-rosewood">{state.error}</p>}
      <button type="submit" disabled={pending} className="rounded-lg bg-charcoal px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50">
        {pending ? 'Submitting...' : 'Submit Manager Review'}
      </button>
    </form>
  )
}
