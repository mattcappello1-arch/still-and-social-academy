import { createAdminClient } from '@/lib/supabase/server'
import { ResourcesAdmin } from './resources-admin'

export default async function AdminResourcesPage() {
  const db = await createAdminClient()

  const { data: resources } = await db
    .from('academy_resources')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">Resource Library Management</h1>
          <p className="mt-1 font-mono text-sm text-ink-soft">
            Manage downloadable resources and learning materials.
            {resources && <span className="ml-1">({resources.length} resources)</span>}
          </p>
        </div>
      </div>

      <ResourcesAdmin resources={resources ?? []} />
    </div>
  )
}
