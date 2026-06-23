'use client'

import { useState } from 'react'
import { SignaturePad } from '@/components/documents/SignaturePad'
import { signDocument } from '@/app/actions/documents'
import { useRouter } from 'next/navigation'

export function DocumentSigner({ docId }: { docId: string }) {
  const [signature, setSignature] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handleSign = async () => {
    if (!signature) return
    setSubmitting(true)
    const result = await signDocument(docId, signature)
    if (result.success) {
      setDone(true)
      router.refresh()
    }
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="rounded-xl border border-sage/30 bg-sage/5 p-6 text-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mx-auto mb-3 text-sage"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <p className="font-mono text-sm text-sage">
          Document signed successfully.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-rule bg-white/60 p-6">
      <p className="font-mono text-sm text-ink">
        Please sign below to acknowledge you have read and agree to the contents
        of this document.
      </p>

      <SignaturePad onSave={(dataUrl) => setSignature(dataUrl)} />

      {signature && (
        <div className="flex items-center gap-3 border-t border-rule pt-4">
          <button
            onClick={handleSign}
            disabled={submitting}
            className="rounded-lg bg-sienna px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna/90 disabled:opacity-50"
          >
            {submitting ? 'Signing...' : 'Sign Document'}
          </button>
          <button
            onClick={() => setSignature(null)}
            className="font-mono text-sm text-ink-soft transition hover:text-rosewood"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
