import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ModuleContent } from '@/components/training/ModuleContent'

const CATEGORY_LABELS: Record<string, string> = {
  policies: 'Policies',
  procedures: 'Procedures',
  uniform: 'Uniform',
  leave: 'Leave',
  emergency: 'Emergency',
  rostering: 'Rostering',
  expectations: 'Expectations',
}

export default async function HandbookSectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: section } = await supabase
    .from('academy_handbook_sections')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!section) notFound()

  const blocks = (section.content ?? []) as Array<{ type: string; data: Record<string, unknown> }>

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 font-mono text-xs text-ink-soft">
        <Link href="/handbook" className="hover:text-sienna transition">Handbook</Link>
        <span>/</span>
        <span className="text-ink">{section.title}</span>
      </div>

      {/* Category badge */}
      <div className="mb-4">
        <span className="inline-flex rounded-full border border-sienna/20 bg-sienna/10 px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-sienna uppercase">
          {CATEGORY_LABELS[section.category] ?? section.category}
        </span>
      </div>

      <h1 className="mb-8 font-serif text-3xl font-light text-ink">{section.title}</h1>

      {/* Render content blocks */}
      <ModuleContent blocks={blocks as any} moduleId={section.id} />

      {/* Back link */}
      <div className="mt-10 border-t border-rule pt-6">
        <Link
          href="/handbook"
          className="inline-flex items-center gap-2 font-mono text-sm text-ink-soft hover:text-sienna transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Handbook
        </Link>
      </div>
    </div>
  )
}
