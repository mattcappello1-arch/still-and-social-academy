'use client'

import { useState, useTransition } from 'react'
import { createResource, updateResource, deleteResource } from '@/app/actions/resources'

type Resource = {
  id: string
  title: string
  description: string | null
  category: string
  type: string
  url: string
  is_management_only: boolean
}

const CATEGORIES = [
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'communication', label: 'Communication' },
  { value: 'food-beverage', label: 'Food & Beverage' },
  { value: 'brand-resources', label: 'Brand Resources' },
  { value: 'management-resources', label: 'Management Resources' },
]

const TYPES = [
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Document' },
  { value: 'link', label: 'Link' },
  { value: 'template', label: 'Template' },
]

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]))

export function ResourcesAdmin({ resources }: { resources: Resource[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Resource | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isManagementOnly, setIsManagementOnly] = useState(false)

  const handleCreate = (formData: FormData) => {
    formData.set('is_management_only', isManagementOnly ? 'true' : 'false')
    setError('')
    startTransition(async () => {
      const result = await createResource(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Resource created')
        setShowForm(false)
        setIsManagementOnly(false)
        setTimeout(() => setSuccess(''), 3000)
      }
    })
  }

  const handleUpdate = (formData: FormData) => {
    if (!editing) return
    formData.set('is_management_only', isManagementOnly ? 'true' : 'false')
    setError('')
    startTransition(async () => {
      const result = await updateResource(editing.id, formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Resource updated')
        setEditing(null)
        setIsManagementOnly(false)
        setTimeout(() => setSuccess(''), 3000)
      }
    })
  }

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteResource(id)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Resource deleted')
        setTimeout(() => setSuccess(''), 3000)
      }
    })
  }

  const startEdit = (resource: Resource) => {
    setEditing(resource)
    setIsManagementOnly(resource.is_management_only)
    setShowForm(false)
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

      {/* Form */}
      {(showForm || editing) && (
        <div className="mb-8 rounded-xl border border-rule bg-white/60 p-6">
          <h2 className="mb-4 font-serif text-xl font-light text-ink">
            {editing ? 'Edit Resource' : 'Add Resource'}
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
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] tracking-widest text-ink-soft uppercase">Description</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={editing?.description ?? ''}
                className="w-full rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-mono text-[10px] tracking-widest text-ink-soft uppercase">Type</label>
                <select
                  name="type"
                  required
                  defaultValue={editing?.type ?? ''}
                  className="w-full rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
                >
                  <option value="">Select type...</option>
                  {TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] tracking-widest text-ink-soft uppercase">External URL</label>
                <input
                  name="external_url"
                  type="url"
                  defaultValue={editing?.url ?? ''}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                Or Upload File
              </label>
              <input
                name="file"
                type="file"
                className="w-full rounded-lg border border-rule bg-white/60 px-4 py-2 font-mono text-sm text-ink file:mr-4 file:rounded-lg file:border-0 file:bg-charcoal file:px-3 file:py-1.5 file:text-xs file:text-cream file:font-mono"
              />
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isManagementOnly}
                  onChange={e => setIsManagementOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-rule text-sienna accent-sienna"
                />
                <span className="font-mono text-sm text-ink">Management only (hidden from non-admin staff)</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-charcoal px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
              >
                {isPending ? 'Saving...' : editing ? 'Update Resource' : 'Create Resource'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); setIsManagementOnly(false) }}
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
          Add Resource
        </button>
      )}

      {/* Resources list */}
      {resources.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-rule bg-white/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-rule">
                  <Th>Title</Th>
                  <Th>Category</Th>
                  <Th>Type</Th>
                  <Th>Access</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {resources.map(resource => (
                  <tr key={resource.id} className="border-b border-rule last:border-b-0 hover:bg-cream-soft/30 transition">
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm font-medium text-ink">{resource.title}</p>
                      {resource.description && (
                        <p className="font-mono text-xs text-ink-soft line-clamp-1">{resource.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-sienna/20 bg-sienna/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-sienna uppercase">
                        {CATEGORY_LABELS[resource.category] ?? resource.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-rule bg-cream-soft px-2 py-0.5 font-mono text-[10px] tracking-wide text-ink-soft uppercase">
                        {resource.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {resource.is_management_only ? (
                        <span className="rounded-full border border-rosewood/20 bg-rosewood/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-rosewood uppercase">
                          Management
                        </span>
                      ) : (
                        <span className="rounded-full border border-sage/20 bg-sage/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-sage uppercase">
                          All Staff
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(resource)}
                          className="font-mono text-xs text-sienna hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(resource.id, resource.title)}
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
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">No resources yet.</p>
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
