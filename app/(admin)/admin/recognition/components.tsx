'use client'

import { useActionState } from 'react'
import { awardRecognition } from '@/app/actions/recognition'

const initialState = { error: undefined as string | undefined, success: undefined as boolean | undefined }

export function AwardRecognitionForm({ staffList }: { staffList: { id: string; first_name: string; last_name: string }[] }) {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await awardRecognition(formData)
      return result as typeof initialState
    },
    initialState
  )

  const badgeTypes = [
    'Guest Experience Champion',
    'Team Player',
    'Leadership Potential',
    'Growth Mindset',
    'Hospitality Excellence',
    'Above & Beyond',
  ]

  return (
    <form action={action} className="rounded-xl border border-rule bg-white/60 p-5">
      <p className="mb-4 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Award Recognition</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">Staff Member</label>
          <select name="staff_id" required className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink focus:border-sienna/30 focus:outline-none">
            <option value="">Select staff...</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">Badge Type</label>
          <select name="badge_type" required className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink focus:border-sienna/30 focus:outline-none">
            <option value="">Select badge...</option>
            {badgeTypes.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">Description</label>
          <textarea
            name="description"
            rows={2}
            placeholder="Why are they being recognized?"
            className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none resize-none"
          />
        </div>
      </div>
      {state?.error && <p className="mt-2 font-mono text-xs text-rosewood">{state.error}</p>}
      {state?.success && <p className="mt-2 font-mono text-xs text-sage-deep">Recognition awarded successfully.</p>}
      <button type="submit" disabled={pending} className="mt-4 rounded-lg bg-charcoal px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50">
        {pending ? 'Awarding...' : 'Award Recognition'}
      </button>
    </form>
  )
}
