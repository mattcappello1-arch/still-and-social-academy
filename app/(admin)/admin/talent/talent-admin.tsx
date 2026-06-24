'use client'

import { useState, useTransition } from 'react'
import { updateTalentCategory } from '@/app/actions/talent'

type StaffTalent = {
  id: string
  name: string
  role: string
  department: string
  talentCategory: string | null
  talentNotes: string
}

const TALENT_CATEGORIES = [
  { value: '', label: 'Not Assigned', icon: '' },
  { value: 'emerging', label: 'Emerging Talent', icon: '\u{1F331}' },
  { value: 'future_supervisor', label: 'Future Supervisor', icon: '\u{2B50}' },
  { value: 'future_leader', label: 'Future Leader', icon: '\u{2B50}' },
  { value: 'leadership_pathway', label: 'Leadership Pathway', icon: '\u{2B50}' },
]

const CATEGORY_STYLES: Record<string, string> = {
  emerging: 'border-olive/20 bg-olive/10 text-olive',
  future_supervisor: 'border-sienna/20 bg-sienna/10 text-sienna',
  future_leader: 'border-rosewood/20 bg-rosewood/10 text-rosewood',
  leadership_pathway: 'border-sage/20 bg-sage/10 text-sage',
}

const CATEGORY_LABELS: Record<string, string> = {
  emerging: 'Emerging Talent',
  future_supervisor: 'Future Supervisor',
  future_leader: 'Future Leader',
  leadership_pathway: 'Leadership Pathway',
}

export function TalentAdmin({ staff }: { staff: StaffTalent[] }) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState('')

  const deptColors: Record<string, string> = {
    foh: 'border-sienna/20 bg-sienna/10 text-sienna',
    kitchen: 'border-olive/20 bg-olive/10 text-olive',
    leadership: 'border-rosewood/20 bg-rosewood/10 text-rosewood',
  }

  const handleSave = (staffId: string, formData: FormData) => {
    setError('')
    const category = formData.get('talent_category') as string
    const notes = formData.get('talent_notes') as string

    startTransition(async () => {
      const result = await updateTalentCategory(staffId, category || null, notes)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Updated successfully')
        setEditingId(null)
        setTimeout(() => setSuccess(''), 3000)
      }
    })
  }

  const filteredStaff = filterCategory
    ? staff.filter(s => s.talentCategory === filterCategory)
    : staff

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-rosewood/20 bg-rosewood/5 px-4 py-3">
          <p className="font-mono text-sm text-rosewood">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-sage/20 bg-sage/5 px-4 py-3">
          <p className="font-mono text-sm text-sage">{success}</p>
        </div>
      )}

      {/* Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterCategory('')}
          className={`rounded-full border px-3 py-1.5 font-mono text-xs tracking-wide transition ${
            !filterCategory ? 'border-sienna bg-sienna/10 text-sienna' : 'border-rule text-ink-soft hover:border-sienna/30'
          }`}
        >
          All Staff
        </button>
        {TALENT_CATEGORIES.filter(c => c.value).map(cat => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setFilterCategory(cat.value)}
            className={`rounded-full border px-3 py-1.5 font-mono text-xs tracking-wide transition ${
              filterCategory === cat.value ? 'border-sienna bg-sienna/10 text-sienna' : 'border-rule text-ink-soft hover:border-sienna/30'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Staff list */}
      <div className="space-y-3">
        {filteredStaff.map(s => (
          <div key={s.id} className="rounded-xl border border-rule bg-white/60 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-mono text-sm font-medium text-ink">{s.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-wide uppercase ${deptColors[s.department] ?? deptColors.foh}`}>
                      {s.role}
                    </span>
                    {s.talentCategory && (
                      <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-wide uppercase ${CATEGORY_STYLES[s.talentCategory] ?? ''}`}>
                        {CATEGORY_LABELS[s.talentCategory] ?? s.talentCategory}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingId(editingId === s.id ? null : s.id)}
                className="font-mono text-xs text-sienna hover:underline"
              >
                {editingId === s.id ? 'Close' : 'Edit'}
              </button>
            </div>

            {editingId === s.id && (
              <div className="border-t border-rule px-4 pb-4 pt-3">
                <form
                  action={(formData) => handleSave(s.id, formData)}
                  className="space-y-3"
                >
                  <div>
                    <label className="mb-1 block font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                      Talent Category
                    </label>
                    <select
                      name="talent_category"
                      defaultValue={s.talentCategory ?? ''}
                      className="w-full rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
                    >
                      {TALENT_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon ? `${cat.icon} ${cat.label}` : cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                      Development Notes
                    </label>
                    <textarea
                      name="talent_notes"
                      rows={3}
                      defaultValue={s.talentNotes}
                      placeholder="Notes about development plan, strengths, areas for growth..."
                      className="w-full rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-charcoal px-4 py-2 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : 'Save'}
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">
            {filterCategory ? 'No staff in this talent category.' : 'No active staff found.'}
          </p>
        </div>
      )}
    </div>
  )
}
