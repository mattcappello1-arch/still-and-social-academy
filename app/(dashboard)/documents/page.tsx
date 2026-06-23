import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DocumentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch staff documents with template info
  const { data: documents } = await supabase
    .from('academy_staff_documents')
    .select(
      `
      id,
      status,
      signed_at,
      created_at,
      academy_document_templates (
        id, slug, title, description, category, requires_signature
      )
    `
    )
    .eq('staff_id', user.id)
    .order('created_at', { ascending: false })

  const categoryLabels: Record<string, string> = {
    personal_info: 'Personal Info',
    employment: 'Employment',
    policy: 'Policy',
    certification: 'Certification',
  }

  const categoryColors: Record<string, string> = {
    personal_info: 'bg-coffee/10 text-coffee border-coffee/20',
    employment: 'bg-sienna/10 text-sienna border-sienna/20',
    policy: 'bg-rosewood/10 text-rosewood border-rosewood/20',
    certification: 'bg-sage/10 text-sage border-sage/20',
  }

  const statusStyles: Record<string, string> = {
    pending: 'bg-oatmeal/30 text-oatmeal-dk',
    viewed: 'bg-sienna/10 text-sienna',
    signed: 'bg-sage/10 text-sage',
    expired: 'bg-cream-soft text-ink-soft',
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Documents</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Review and sign your employment documents
        </p>
      </div>

      {documents && documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => {
            const template = doc.academy_document_templates as unknown as {
              id: string
              slug: string
              title: string
              description: string | null
              category: string
              requires_signature: boolean
            } | null

            if (!template) return null

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-rule bg-white/60 p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-medium text-ink">
                      {template.title}
                    </p>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase ${categoryColors[template.category] ?? 'bg-cream-soft text-ink-soft border-rule'}`}
                    >
                      {categoryLabels[template.category] ?? template.category}
                    </span>
                  </div>
                  {template.description && (
                    <p className="font-mono text-xs text-ink-soft">
                      {template.description}
                    </p>
                  )}
                  {doc.status === 'signed' && doc.signed_at && (
                    <p className="mt-1 font-mono text-xs text-sage">
                      Signed on{' '}
                      {new Date(doc.signed_at).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wide uppercase ${statusStyles[doc.status] ?? statusStyles.pending}`}
                  >
                    {doc.status}
                  </span>

                  {doc.status !== 'signed' ? (
                    <Link
                      href={`/documents/${doc.id}`}
                      className="rounded-lg bg-sienna px-4 py-2 font-mono text-xs font-medium tracking-wide text-cream transition hover:bg-sienna/90"
                    >
                      {template.requires_signature
                        ? 'View & Sign'
                        : 'View'}
                    </Link>
                  ) : (
                    <Link
                      href={`/documents/${doc.id}`}
                      className="rounded-lg border border-rule px-4 py-2 font-mono text-xs tracking-wide text-ink-soft transition hover:border-sienna/30 hover:text-sienna"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">
            No documents pending. You&apos;re all caught up.
          </p>
        </div>
      )}
    </div>
  )
}
