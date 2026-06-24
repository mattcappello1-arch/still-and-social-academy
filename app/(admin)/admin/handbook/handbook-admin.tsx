'use client'

import { useState, useTransition } from 'react'
import { createSection, updateSection, deleteSection } from '@/app/actions/handbook'

type Section = {
  id: string
  title: string
  slug: string
  category: string
  categoryLabel: string
  content: unknown
  sort_order: number
}

const CATEGORIES = [
  { value: 'policies', label: 'Policies' },
  { value: 'procedures', label: 'Procedures' },
  { value: 'uniform', label: 'Uniform' },
  { value: 'leave', label: 'Leave' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'rostering', label: 'Rostering' },
  { value: 'expectations', label: 'Expectations' },
]

export function HandbookAdmin({
  sections,
  categoryLabels,
}: {
  sections: Section[]
  categoryLabels: Record<string, string>
}) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Section | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCreate = (formData: FormData) => {
    setError('')
    startTransition(async () => {
      const result = await createSection(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Section created')
        setShowForm(false)
        setTimeout(() => setSuccess(''), 3000)
      }
    })
  }

  const handleUpdate = (formData: FormData) => {
    if (!editing) return
    setError('')
    startTransition(async () => {
      const result = await updateSection(editing.id, formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Section updated')
        setEditing(null)
        setTimeout(() => setSuccess(''), 3000)
      }
    })
  }

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteSection(id)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Section deleted')
        setTimeout(() => setSuccess(''), 3000)
      }
    })
  }

  const getContentString = (content: unknown) => {
    if (!content) return ''
    try {
      return JSON.stringify(content, null, 2)
    } catch {
      return ''
    }
  }

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

      {/* Add / Edit form */}
      {(showForm || editing) && (
        <div className="mb-8 rounded-xl border border-rule bg-white/60 p-6">
          <h2 className="mb-4 font-serif text-xl font-light text-ink">
            {editing ? 'Edit Section' : 'New Section'}
          </h2>
          <form action={editing ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-mono text-[10px] tracking-widest text-ink-soft uppercase">Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={editing?.title ?? ''}
                  className="w-full rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] tracking-widest text-ink-soft uppercase">Slug</label>
                <input
                  name="slug"
                  type="text"
                  required
                  defaultValue={editing?.slug ?? ''}
                  placeholder="e.g. dress-code"
                  className="w-full rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] tracking-widest text-ink-soft uppercase">Category</label>
              <select
                name="category"
                required
                defaultValue={editing?.category ?? ''}
                className="w-full rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                Content (JSON blocks or plain text)
              </label>
              <textarea
                name="content"
                rows={10}
                defaultValue={editing ? getContentString(editing.content) : ''}
                placeholder='Plain text or JSON content blocks, e.g. [{"type":"text","data":{"html":"<p>Your content...</p>"}}]'
                className="w-full rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-xs text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-charcoal px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
              >
                {isPending ? 'Saving...' : editing ? 'Update Section' : 'Create Section'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null) }}
                className="rounded-lg border border-rule px-5 py-2.5 font-mono text-sm text-ink-soft transition hover:border-sienna/30"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && !editing && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mb-6 flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Add Section
        </button>
      )}

      {/* Sections list */}
      {sections.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-rule bg-white/60">
          <table className="w-full">
            <thead>
              <tr className="border-b border-rule">
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Slug</Th>
                <Th>Order</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {sections.map(section => (
                <tr key={section.id} className="border-b border-rule last:border-b-0 hover:bg-cream-soft/30 transition">
                  <td className="px-4 py-3 font-mono text-sm font-medium text-ink">
                    {section.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-sienna/20 bg-sienna/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-sienna uppercase">
                      {section.categoryLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{section.slug}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{section.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(section)}
                        className="font-mono text-xs text-sienna hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(section.id, section.title)}
                        className="font-mono text-xs text-rosewood hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">No handbook sections yet.</p>
        </div>
      )}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">
      {children}
    </th>
  )
}
