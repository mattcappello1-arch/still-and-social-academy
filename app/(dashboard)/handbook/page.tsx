import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES: Record<string, { label: string; icon: string }> = {
  policies: { label: 'Policies', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  procedures: { label: 'Procedures', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  uniform: { label: 'Uniform', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  leave: { label: 'Leave', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  emergency: { label: 'Emergency', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
  rostering: { label: 'Rostering', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  expectations: { label: 'Expectations', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
}

const CATEGORY_ORDER = ['policies', 'procedures', 'uniform', 'leave', 'emergency', 'rostering', 'expectations']

export default async function HandbookPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const params = await searchParams
  const query = params.q ?? ''
  const categoryFilter = params.category ?? ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let sectionsQuery = supabase
    .from('academy_handbook_sections')
    .select('*')
    .order('sort_order')

  if (categoryFilter) {
    sectionsQuery = sectionsQuery.eq('category', categoryFilter)
  }

  const { data: sections } = await sectionsQuery

  // Client-side search filter
  const filtered = (sections ?? []).filter(s => {
    if (!query) return true
    const q = query.toLowerCase()
    return s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
  })

  // Group by category
  const grouped = CATEGORY_ORDER.reduce<Record<string, typeof filtered>>((acc, cat) => {
    const items = filtered.filter(s => s.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  // Any uncategorized
  const categorized = new Set(CATEGORY_ORDER)
  const uncategorized = filtered.filter(s => !categorized.has(s.category))
  if (uncategorized.length > 0) grouped['other'] = uncategorized

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Staff Handbook</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Everything you need to know about working at Still & Social.
        </p>
      </div>

      {/* Search + Filter */}
      <form className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          name="q"
          type="text"
          defaultValue={query}
          placeholder="Search handbook..."
          className="flex-1 rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
        />
        <select
          name="category"
          defaultValue={categoryFilter}
          className="rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
        >
          <option value="">All Categories</option>
          {CATEGORY_ORDER.map(cat => (
            <option key={cat} value={cat}>{CATEGORIES[cat]?.label ?? cat}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-charcoal px-4 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna"
        >
          Search
        </button>
        {(query || categoryFilter) && (
          <a
            href="/handbook"
            className="flex items-center rounded-lg border border-rule px-4 py-2.5 font-mono text-sm text-ink-soft transition hover:border-sienna/30 hover:text-sienna"
          >
            Clear
          </a>
        )}
      </form>

      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => {
            const cat = CATEGORIES[category]
            return (
              <section key={category}>
                <div className="mb-3 flex items-center gap-2">
                  {cat && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sienna shrink-0">
                      <path d={cat.icon} />
                    </svg>
                  )}
                  <h2 className="font-serif text-xl font-light text-ink">
                    {cat?.label ?? category}
                  </h2>
                  <span className="font-mono text-xs text-ink-soft">({items.length})</span>
                </div>
                <div className="space-y-2">
                  {items.map((section: any) => (
                    <Link
                      key={section.id}
                      href={`/handbook/${section.slug}`}
                      className="group flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4 transition hover:border-sienna/30 hover:shadow-sm"
                    >
                      <div>
                        <h3 className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition">
                          {section.title}
                        </h3>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-soft shrink-0 transition group-hover:text-sienna group-hover:translate-x-0.5">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">
            {query || categoryFilter
              ? 'No handbook sections match your search.'
              : 'No handbook sections have been added yet. Check back soon.'}
          </p>
        </div>
      )}
    </div>
  )
}
