import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { DocumentSigner } from './document-signer'
import { viewDocument } from '@/app/actions/documents'

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ docId: string }>
}) {
  const { docId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the staff document with template
  const { data: doc } = await supabase
    .from('academy_staff_documents')
    .select(
      `
      *,
      academy_document_templates (*)
    `
    )
    .eq('id', docId)
    .eq('staff_id', user.id)
    .single()

  if (!doc) notFound()

  const template = doc.academy_document_templates as unknown as {
    id: string
    slug: string
    title: string
    description: string | null
    category: string
    template_content: { blocks?: Array<{ type: string; data: { html?: string } }> } | null
    requires_signature: boolean
  }

  // Mark as viewed if pending
  if (doc.status === 'pending') {
    await viewDocument(docId)
  }

  const contentBlocks = template.template_content?.blocks ?? []
  const isSigned = doc.status === 'signed'

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 font-mono text-xs text-ink-soft">
        <Link href="/documents" className="transition hover:text-sienna">
          Documents
        </Link>
        <span>/</span>
        <span className="text-ink">{template.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">
          {template.title}
        </h1>
        {template.description && (
          <p className="mt-1 font-mono text-sm text-ink-soft">
            {template.description}
          </p>
        )}
      </div>

      {/* Document content */}
      <div className="mb-8 rounded-xl border border-rule bg-white/80 p-6 lg:p-8">
        {contentBlocks.length > 0 ? (
          <div className="space-y-4">
            {contentBlocks.map((block, i) => (
              <div
                key={i}
                className="prose prose-sm max-w-none font-mono text-ink prose-headings:font-serif prose-headings:font-light prose-headings:text-ink prose-p:text-ink-soft prose-strong:text-ink"
                dangerouslySetInnerHTML={{
                  __html: block.data?.html ?? '',
                }}
              />
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-ink-soft">
            No content available for this document.
          </p>
        )}
      </div>

      {/* Signature section */}
      {isSigned ? (
        <div className="rounded-xl border border-sage/30 bg-sage/5 p-6">
          <p className="mb-2 font-mono text-[10px] tracking-widest text-sage uppercase">
            Signed
          </p>
          <p className="font-mono text-sm text-ink">
            This document was signed on{' '}
            {new Date(doc.signed_at!).toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {doc.signature_image_url && (
            <div className="mt-4 inline-block rounded-lg border border-rule bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.signature_image_url}
                alt="Your signature"
                className="h-20"
              />
            </div>
          )}
        </div>
      ) : template.requires_signature ? (
        <DocumentSigner docId={docId} />
      ) : (
        <div className="rounded-xl border border-rule bg-cream-soft/50 p-5 text-center">
          <p className="font-mono text-sm text-ink-soft">
            This document is for your records. No signature required.
          </p>
        </div>
      )}
    </div>
  )
}
