import { createAdminClient } from '@/lib/supabase/server'
import { HandbookAdmin } from './handbook-admin'

const CATEGORY_LABELS: Record<string, string> = {
  policies: 'Policies',
  procedures: 'Procedures',
  uniform: 'Uniform',
  leave: 'Leave',
  emergency: 'Emergency',
  rostering: 'Rostering',
  expectations: 'Expectations',
}

export default async function AdminHandbookPage() {
  const db = await createAdminClient()

  const { data: sections } = await db
    .from('academy_handbook_sections')
    .select('*')
    .order('sort_order')

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">Handbook Management</h1>
          <p className="mt-1 font-mono text-sm text-ink-soft">
            Manage handbook sections and content.
            {sections && <span className="ml-1">({sections.length} sections)</span>}
          </p>
        </div>
      </div>

      <HandbookAdmin
        sections={(sections ?? []).map((s: any) => ({
          ...s,
          categoryLabel: CATEGORY_LABELS[s.category] ?? s.category,
        }))}
        categoryLabels={CATEGORY_LABELS}
      />
    </div>
  )
}
