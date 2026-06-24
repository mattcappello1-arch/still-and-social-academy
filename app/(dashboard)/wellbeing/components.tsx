'use client'

import { useActionState } from 'react'
import { submitCheckin } from '@/app/actions/wellbeing'

const initialState = { error: undefined as string | undefined, success: undefined as boolean | undefined }

const MOODS = [
  { value: 5, emoji: '\ud83d\ude0a', label: 'Thriving' },
  { value: 4, emoji: '\ud83d\ude42', label: 'Good' },
  { value: 3, emoji: '\ud83d\ude10', label: 'Okay' },
  { value: 2, emoji: '\ud83d\ude15', label: 'Struggling' },
  { value: 1, emoji: '\ud83d\ude1f', label: 'Need Support' },
]

export function CheckinForm() {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await submitCheckin(formData)
      return result as typeof initialState
    },
    initialState
  )

  if (state?.success) {
    return (
      <div className="rounded-xl border border-sage/20 bg-sage/10 p-8 text-center">
        <p className="font-serif text-xl font-light text-sage-deep">Thank you for checking in</p>
        <p className="mt-2 font-mono text-sm text-sage-deep/70">Your response has been recorded.</p>
      </div>
    )
  }

  return (
    <form action={action} className="rounded-xl border-2 border-sienna/20 bg-white/60 p-6">
      <p className="mb-2 font-serif text-xl font-light text-ink text-center">How are you feeling at work?</p>
      <p className="mb-6 font-mono text-xs text-ink-soft text-center">Your response is confidential and helps us support you better.</p>

      <div className="flex justify-center gap-3 mb-6">
        {MOODS.map((mood) => (
          <label key={mood.value} className="cursor-pointer group">
            <input type="radio" name="rating" value={mood.value} required className="peer sr-only" />
            <div className="flex flex-col items-center gap-1 rounded-xl border border-rule bg-cream-soft/50 px-4 py-3 transition peer-checked:border-sienna peer-checked:bg-sienna/10 group-hover:border-sienna/30">
              <span className="text-2xl">{mood.emoji}</span>
              <span className="font-mono text-[10px] tracking-wider text-ink-soft">{mood.label}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-mono text-xs text-ink-soft">Comments (optional)</label>
        <textarea
          name="comments"
          rows={3}
          placeholder="Anything you'd like to share..."
          className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none resize-none"
        />
      </div>

      {state?.error && (
        <p className="mb-3 font-mono text-xs text-rosewood">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-charcoal px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
      >
        {pending ? 'Submitting...' : 'Submit Check-in'}
      </button>
    </form>
  )
}
