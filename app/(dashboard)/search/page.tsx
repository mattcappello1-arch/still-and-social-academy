import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  if (!q?.trim()) redirect('/passport')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const query = q.trim()

  // Search training modules
  const { data: modules } = await supabase
    .from('academy_training_modules')
    .select('id, slug, title, description, academy_training_paths!inner(slug, title)')
    .ilike('title', `%${query}%`)
    .limit(10)

  // Search handbook sections
  const { data: handbook } = await supabase
    .from('academy_handbook_sections')
    .select('id, slug, title, category')
    .ilike('title', `%${query}%`)
    .eq('is_active', true)
    .limit(10)

  // Search resources
  const { data: resources } = await supabase
    .from('academy_resources')
    .select('id, title, description, category, resource_type')
    .ilike('title', `%${query}%`)
    .limit(10)

  const totalResults = (modules?.length ?? 0) + (handbook?.length ?? 0) + (resources?.length ?? 0)

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl font-light text-ink mb-2">Search Results</h1>
      <p className="text-sm text-ink-soft mb-8">
        {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
      </p>

      {totalResults === 0 && (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="text-sm text-ink-soft">No results found. Try a different search term.</p>
        </div>
      )}

      {modules && modules.length > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl font-light text-ink mb-4">Training Modules</h2>
          <div className="space-y-2">
            {modules.map((m: any) => (
              <Link key={m.id} href={`/training/${m.academy_training_paths.slug}/${m.slug}`}
                className="block rounded-xl border border-rule bg-white/60 p-4 hover:border-sienna/30 hover:shadow-sm transition">
                <p className="text-sm font-medium text-ink">{m.title}</p>
                <p className="text-xs text-ink-soft mt-0.5">{m.academy_training_paths.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {handbook && handbook.length > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl font-light text-ink mb-4">Handbook</h2>
          <div className="space-y-2">
            {handbook.map((h: any) => (
              <Link key={h.id} href={`/handbook/${h.slug}`}
                className="block rounded-xl border border-rule bg-white/60 p-4 hover:border-sienna/30 hover:shadow-sm transition">
                <p className="text-sm font-medium text-ink">{h.title}</p>
                <p className="text-xs text-ink-soft mt-0.5 capitalize">{h.category}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {resources && resources.length > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl font-light text-ink mb-4">Resources</h2>
          <div className="space-y-2">
            {resources.map((r: any) => (
              <Link key={r.id} href="/resources"
                className="block rounded-xl border border-rule bg-white/60 p-4 hover:border-sienna/30 hover:shadow-sm transition">
                <p className="text-sm font-medium text-ink">{r.title}</p>
                <p className="text-xs text-ink-soft mt-0.5 capitalize">{r.category} · {r.resource_type}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
