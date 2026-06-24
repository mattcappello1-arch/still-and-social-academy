'use client'

import { useActionState } from 'react'
import { updateSkillLevel } from '@/app/actions/skills'

const initialState = { error: undefined as string | undefined, success: undefined as boolean | undefined }

export function SkillLevelSelect({
  staffId,
  skillName,
  currentLevel,
}: {
  staffId: string
  skillName: string
  currentLevel: number
}) {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      formData.set('staff_id', staffId)
      formData.set('skill_name', skillName)
      const result = await updateSkillLevel(formData)
      return result as typeof initialState
    },
    initialState
  )

  return (
    <form action={action} className="flex items-center gap-1">
      <select
        name="level"
        defaultValue={currentLevel}
        onChange={(e) => {
          const form = e.target.closest('form')
          if (form) form.requestSubmit()
        }}
        disabled={pending}
        className={`w-full rounded border border-rule bg-transparent px-1 py-0.5 font-mono text-[10px] text-ink focus:border-sienna/30 focus:outline-none ${pending ? 'opacity-50' : ''}`}
      >
        <option value="0">-</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
      {state?.error && <span className="text-rosewood text-[8px]">!</span>}
    </form>
  )
}
