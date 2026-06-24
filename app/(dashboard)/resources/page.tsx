import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const CATEGORIES: Record<string, string> = {
  hospitality: 'Hospitality',
  leadership: 'Leadership',
  wellness: 'Wellness',
  communication: 'Communication',
  'food-beverage': 'Food & Beverage',
  'brand-resources': 'Brand Resources',
  'management-resources': 'Management Resources',
}

const CATEGORY_ORDER = [
  'hospitality',
  'leadership',
  'wellness',
  'communication',
  'food-beverage',
  'brand-resources',
  'management-resources',
]

const TYPE_ICONS: Record<string, { path: string; bg: string; color: string }> = {
  pdf: {
    path: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6',
    bg: 'bg-rosewood/10',
    color: 'text-rosewood',
  },
  video: {
    path: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    bg: 'bg-olive/10',
    color: 'text-olive',
  },
  link: {
    path: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
    bg: 'bg-sienna/10',
    color: 'text-sienna',
  },
  document: {
    path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    bg: 'bg-coffee/10',
    color: 'text-coffee',
  },
  template: {
    path: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z M16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    bg: 'bg-sage/10',
    color: 'text-sage',
  },
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const categoryFilter = params.category ?? ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if staff is admin
  const { data: staff } = await supabase
    .from('academy_staff')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  let resourcesQuery = supabase
    .from('academy_resources')
    .select('*')
    .order('created_at', { ascending: false })

  if (categoryFilter) {
    resourcesQuery = resourcesQuery.eq('category', categoryFilter)
  }

  // Non-admin: hide management-only resources
  if (!staff?.is_admin) {
    resourcesQuery = resourcesQuery.eq('is_management_only', false)
  }

  const { data: resources } = await resourcesQuery

  // Group by category
  const grouped = CATEGORY_ORDER.reduce<Record<string, typeof resources>>((acc, cat) => {
    const items = (resources ?? []).filter(r => r.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Resource Library</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Downloadable resources, guides, and learning materials.
        </p>
      </div>

      {/* Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <a
          href="/resources"
          className={`rounded-full border px-3 py-1.5 font-mono text-xs tracking-wide transition ${
            !categoryFilter
              ? 'border-sienna bg-sienna/10 text-sienna'
              : 'border-rule text-ink-soft hover:border-sienna/30 hover:text-sienna'
          }`}
        >
          All
        </a>
        {CATEGORY_ORDER.map(cat => (
          <a
            key={cat}
            href={`/resources?category=${cat}`}
            className={`rounded-full border px-3 py-1.5 font-mono text-xs tracking-wide transition ${
              categoryFilter === cat
                ? 'border-sienna bg-sienna/10 text-sienna'
                : 'border-rule text-ink-soft hover:border-sienna/30 hover:text-sienna'
            }`}
          >
            {CATEGORIES[cat]}
          </a>
        ))}
      </div>

      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-4 font-serif text-xl font-light text-ink">
                {CATEGORIES[category] ?? category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {(items ?? []).map((resource: any) => {
                  const typeInfo = TYPE_ICONS[resource.type] ?? TYPE_ICONS.document
                  return (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-4 rounded-xl border border-rule bg-white/60 p-4 transition hover:border-sienna/30 hover:shadow-sm"
                    >
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${typeInfo.bg}`}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={typeInfo.color}>
                          <path d={typeInfo.path} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition line-clamp-1">
                            {resource.title}
                          </h3>
                          <span className="shrink-0 rounded-full border border-rule bg-cream-soft px-2 py-0.5 font-mono text-[9px] tracking-wider text-ink-soft uppercase">
                            {resource.type}
                          </span>
                        </div>
                        {resource.description && (
                          <p className="mt-1 font-mono text-xs text-ink-soft line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                        {resource.is_management_only && (
                          <span className="mt-2 inline-flex rounded-full border border-rosewood/20 bg-rosewood/10 px-2 py-0.5 font-mono text-[9px] tracking-wider text-rosewood uppercase">
                            Management Only
                          </span>
                        )}
                      </div>
                    </a>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">
            {categoryFilter
              ? 'No resources found in this category.'
              : 'No resources have been added yet. Check back soon.'}
          </p>
        </div>
      )}
    </div>
  )
}
