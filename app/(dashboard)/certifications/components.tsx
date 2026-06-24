'use client'

import { useState, useTransition } from 'react'
import { uploadCertification, deleteCertification } from '@/app/actions/certifications'

export function UploadCertForm() {
  const [state, setState] = useState<{ error?: string; success?: boolean }>({})
  const [pending, startTransition] = useTransition()

  const action = (formData: FormData) => {
    startTransition(async () => {
      const result = await uploadCertification(formData)
      setState(result as { error?: string; success?: boolean })
    })
  }

  return (
    <form action={action} className="rounded-xl border border-rule bg-white/60 p-5">
      <p className="mb-4 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Upload Certification</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">Type</label>
          <select
            name="cert_type"
            required
            className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink focus:border-sienna/30 focus:outline-none"
          >
            <option value="">Select type...</option>
            <option value="RSA">RSA</option>
            <option value="Food Safety">Food Safety</option>
            <option value="First Aid">First Aid</option>
            <option value="Drivers Licence">Drivers Licence</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">Title</label>
          <input
            name="title"
            required
            placeholder="Certificate title"
            className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">Issuing Body</label>
          <input
            name="issuing_body"
            placeholder="e.g. VCGLR"
            className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">Certificate Number</label>
          <input
            name="cert_number"
            placeholder="Optional"
            className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">Issue Date</label>
          <input
            name="issue_date"
            type="date"
            className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink focus:border-sienna/30 focus:outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">Expiry Date</label>
          <input
            name="expiry_date"
            type="date"
            className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink focus:border-sienna/30 focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">File Upload</label>
          <input
            name="file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full rounded-lg border border-rule bg-cream-soft/50 px-3 py-2 font-mono text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-charcoal file:px-3 file:py-1 file:font-mono file:text-xs file:text-cream focus:border-sienna/30 focus:outline-none"
          />
        </div>
      </div>
      {state?.error && (
        <p className="mt-3 font-mono text-xs text-rosewood">{state.error}</p>
      )}
      {state?.success && (
        <p className="mt-3 font-mono text-xs text-sage-deep">Certification uploaded successfully.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-lg bg-charcoal px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
      >
        {pending ? 'Uploading...' : 'Upload Certification'}
      </button>
    </form>
  )
}

export function DeleteCertButton({ certId }: { certId: string }) {
  const handleDelete = async (formData: FormData) => {
    formData.set('id', certId)
    await deleteCertification(formData)
  }

  return (
    <form action={handleDelete}>
      <input type="hidden" name="id" value={certId} />
      <button
        type="submit"
        className="rounded-lg border border-rule p-1.5 text-ink-soft transition hover:border-rosewood/30 hover:text-rosewood"
        title="Delete"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      </button>
    </form>
  )
}
