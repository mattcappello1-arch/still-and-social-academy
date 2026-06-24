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

  const pendingCount = (documents ?? []).filter(
    (d) => d.status === 'pending' || d.status === 'viewed'
  ).length
  const signedCount = (documents ?? []).filter(
    (d) => d.status === 'signed'
  ).length

  const statusLabels: Record<string, string> = {
    pending: 'Awaiting Review',
    viewed: 'In Progress',
    signed: 'Signed',
    expired: 'Expired',
  }

  const statusIcons: Record<string, string> = {
    pending: 'M12 8v4M12 16h.01',
    viewed: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
    signed: 'M20 6L9 17l-5-5',
    expired: 'M18.36 5.64l-12.72 12.72M5.64 5.64l12.72 12.72',
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Documents</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Review and sign your employment documents. These include policies, contracts, and other important information you need to acknowledge.
        </p>
      </div>

      {/* Summary */}
      {documents && documents.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-4">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-sienna/20 bg-sienna/5 px-4 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sienna"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
              <span className="font-mono text-xs text-sienna">{pendingCount} document{pendingCount > 1 ? 's' : ''} awaiting your signature</span>
            </div>
          )}
          {signedCount > 0 && pendingCount === 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-sage/20 bg-sage/5 px-4 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage"><path d="M20 6L9 17l-5-5" /></svg>
              <span className="font-mono text-xs text-sage">All documents signed. You're all caught up.</span>
            </div>
          )}
        </div>
      )}

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

            const isPending = doc.status === 'pending' || doc.status === 'viewed'

            return (
              <div
                key={doc.id}
                className={`flex items-center justify-between gap-4 rounded-xl border p-5 transition ${
                  isPending
                    ? 'border-sienna/20 bg-sienna/[0.03]'
                    : 'border-rule bg-white/60'
                }`}
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
                    className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wide uppercase ${statusStyles[doc.status] ?? statusStyles.pending}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={statusIcons[doc.status] ?? statusIcons.pending} /></svg>
                    {statusLabels[doc.status] ?? doc.status}
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
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 text-oatmeal-dk"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" /></svg>
          <p className="font-mono text-sm text-ink-soft">
            No documents assigned yet. When your manager sends you documents to review or sign, they'll appear here.
          </p>
        </div>
      )}
    </div>
  )
}
