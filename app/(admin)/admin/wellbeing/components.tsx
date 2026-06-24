'use client'

import { useActionState } from 'react'
import { addFollowUpNotes } from '@/app/actions/admin-wellbeing'

const initialState = { error: undefined as string | undefined, success: undefined as boolean | undefined }

export function FollowUpForm({ checkinId }: { checkinId: string }) {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      formData.set('checkin_id', checkinId)
      const result = await addFollowUpNotes(formData)
      return result as typeof initialState
    },
    initialState
  )

  if (state?.success) {
    return <p className="font-mono text-xs text-sage-deep">Follow-up notes saved.</p>
  }

  return (
    <form action={action} className="flex gap-2 mt-2">
      <input
        name="follow_up_notes"
        placeholder="Add follow-up notes..."
        className="flex-1 rounded-lg border border-rule bg-cream-soft/50 px-3 py-1.5 font-mono text-xs text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-charcoal px-3 py-1.5 font-mono text-[10px] tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
      >
        {pending ? '...' : 'Save'}
      </button>
      {state?.error && <p className="font-mono text-xs text-rosewood">{state.error}</p>}
    </form>
  )
}
