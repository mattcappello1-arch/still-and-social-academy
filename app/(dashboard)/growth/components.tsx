'use client'

import { useState, useTransition } from 'react'
import { addGoal, completeGoal, deleteGoal } from '@/app/actions/growth'

export function AddGoalForm({ category }: { category: string }) {
  const [state, setState] = useState<{ error?: string; success?: boolean }>({})
  const [pending, startTransition] = useTransition()

  const action = (formData: FormData) => {
    formData.set('category', category)
    startTransition(async () => {
      const result = await addGoal(formData)
      setState(result as { error?: string; success?: boolean })
    })
  }

  return (
    <form action={action} className="rounded-xl border border-rule bg-white/60 p-5">
      <p className="mb-4 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Add New Goal</p>
      <div className="space-y-3">
        <input
          name="title"
          placeholder="Goal title"
          required
          className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none"
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          rows={2}
          className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none resize-none"
        />
        <input
          name="target_date"
          type="date"
          className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink focus:border-sienna/30 focus:outline-none"
        />
        {state?.error && (
          <p className="font-mono text-xs text-rosewood">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-charcoal px-4 py-2 font-mono text-xs font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
        >
          {pending ? 'Adding...' : 'Add Goal'}
        </button>
      </div>
    </form>
  )
}

export function GoalCard({ goal }: { goal: { id: string; title: string; description: string | null; target_date: string | null; status: string; completed_at: string | null } }) {
  const isCompleted = goal.status === 'completed'

  return (
    <div className={`rounded-xl border bg-white/60 p-4 ${isCompleted ? 'border-sage/20' : 'border-rule'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className={`font-mono text-sm font-medium ${isCompleted ? 'text-sage-deep line-through' : 'text-ink'}`}>
            {goal.title}
          </p>
          {goal.description && (
            <p className="mt-1 font-mono text-xs text-ink-soft">{goal.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            {goal.target_date && (
              <span className="font-mono text-[10px] tracking-wider text-ink-soft">
                Target: {new Date(goal.target_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
            <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${
              isCompleted ? 'bg-sage/10 text-sage-deep' : 'bg-sienna/10 text-sienna'
            }`}>
              {isCompleted ? 'Completed' : 'Active'}
            </span>
          </div>
        </div>
        {!isCompleted && (
          <div className="flex gap-1">
            <form action={async (formData: FormData) => {
              formData.set('id', goal.id)
              await completeGoal(formData)
            }}>
              <input type="hidden" name="id" value={goal.id} />
              <button type="submit" className="rounded-lg border border-sage/20 bg-sage/10 p-1.5 text-sage transition hover:bg-sage/20" title="Mark complete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
              </button>
            </form>
            <form action={async (formData: FormData) => {
              formData.set('id', goal.id)
              await deleteGoal(formData)
            }}>
              <input type="hidden" name="id" value={goal.id} />
              <button type="submit" className="rounded-lg border border-rule p-1.5 text-ink-soft transition hover:border-rosewood/30 hover:text-rosewood" title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export function SkillCheckboxes({ selectedSkills }: { selectedSkills: string[] }) {
  const skills = [
    'Customer Service', 'Leadership', 'Communication', 'Bartending',
    'Kitchen Skills', 'Time Management', 'Team Training', 'Business Skills',
  ]

  return (
    <div className="grid grid-cols-2 gap-2">
      {skills.map((skill) => (
        <label key={skill} className="flex items-center gap-2 rounded-lg border border-rule bg-white/60 px-3 py-2 cursor-pointer hover:border-sienna/20 transition">
          <input
            type="checkbox"
            defaultChecked={selectedSkills.includes(skill)}
            disabled
            className="accent-sienna"
          />
          <span className="font-mono text-xs text-ink">{skill}</span>
        </label>
      ))}
    </div>
  )
}
