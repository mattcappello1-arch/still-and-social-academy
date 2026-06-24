'use client'

import { useState } from 'react'

interface Template {
  id: string
  title: string
  description: string
  category: string
  requires_signature: boolean
  template_content: any
  categoryLabel: string
  categoryColor: string
}

export function TemplateViewer({
  templates,
  createSigningDocAction,
}: {
  templates: Template[]
  createSigningDocAction: (formData: FormData) => Promise<void>
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = templates.find((t) => t.id === selectedId)

  return (
    <div className="grid gap-4">
      {templates.map((t) => (
        <div key={t.id}>
          <button
            onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
            className="w-full text-left bg-cream-soft border border-rule rounded-xl p-5 flex items-start justify-between hover:shadow-sm transition"
          >
            <div>
              <h3 className="text-ink font-medium">{t.title}</h3>
              <p className="text-ink-soft text-sm mt-1">{t.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${t.categoryColor}`}
                >
                  {t.categoryLabel}
                </span>
                {t.requires_signature && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-charcoal/10 text-charcoal">
                    Signature Required
                  </span>
                )}
              </div>
            </div>
            <span className="shrink-0 mt-1 font-mono text-xs text-ink-soft">
              {selectedId === t.id ? 'Close' : 'View'}
            </span>
          </button>

          {/* Expanded detail panel */}
          {selectedId === t.id && selected && (
            <div className="mt-1 border border-rule border-t-0 rounded-b-xl bg-white/60 p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1">
                    Title
                  </p>
                  <p className="text-sm text-ink">{selected.title}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1">
                    Category
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${selected.categoryColor}`}
                  >
                    {selected.categoryLabel}
                  </span>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1">
                    Signature Required
                  </p>
                  <p className="text-sm text-ink">
                    {selected.requires_signature ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {selected.description && (
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1">
                    Description
                  </p>
                  <p className="text-sm text-ink-soft">{selected.description}</p>
                </div>
              )}

              {selected.template_content?.body && (
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1">
                    Content
                  </p>
                  <div className="rounded-lg border border-rule bg-cream-soft/50 p-4 text-sm text-ink whitespace-pre-wrap">
                    {selected.template_content.body}
                  </div>
                </div>
              )}

              <form action={createSigningDocAction}>
                <input type="hidden" name="template_id" value={selected.id} />
                <input type="hidden" name="template_title" value={selected.title} />
                <input type="hidden" name="template_doc_type" value={selected.category === 'employment' ? 'Employment contract' : selected.category === 'policy' ? 'Workplace policies' : 'Other'} />
                <input type="hidden" name="template_body" value={selected.template_content?.body || selected.description || ''} />
                <button
                  type="submit"
                  className="rounded-lg bg-sienna px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna/90"
                >
                  Create Signing Document from Template
                </button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
