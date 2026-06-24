'use client'

import { useState, useTransition } from 'react'
import { bulkSendDocument, bulkCreateReview } from '@/app/actions/admin-bulk'

type Staff = {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  department: string
  status: string
  start_date: string | null
  employment_type: string | null
}

type Document = {
  id: string
  title: string
  doc_type: string
}

export function BulkStaffTable({
  staff,
  documents,
  children,
}: {
  staff: Staff[]
  documents: Document[]
  children: (props: { selectedIds: string[]; toggleId: (id: string) => void; toggleAll: () => void; allSelected: boolean }) => React.ReactNode
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [action, setAction] = useState<'send_document' | 'create_review' | ''>('')
  const [documentId, setDocumentId] = useState('')
  const [reviewType, setReviewType] = useState('')
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const toggleId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const allSelected = selectedIds.length === staff.length && staff.length > 0
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(staff.map((s) => s.id))
    }
  }

  const handleBulkAction = () => {
    if (selectedIds.length === 0) return

    startTransition(async () => {
      setResult(null)
      try {
        if (action === 'send_document' && documentId) {
          const res = await bulkSendDocument(selectedIds, documentId)
          if (res.error) {
            setResult({ message: res.error, type: 'error' })
          } else {
            setResult({ message: `Sent document to ${res.sent} staff member${res.sent !== 1 ? 's' : ''}${res.failed ? `. ${res.failed} failed.` : '.'}`, type: 'success' })
            setSelectedIds([])
            setAction('')
            setDocumentId('')
          }
        } else if (action === 'create_review' && reviewType) {
          const res = await bulkCreateReview(selectedIds, reviewType)
          if (res.error) {
            setResult({ message: res.error, type: 'error' })
          } else {
            setResult({ message: `Created ${res.created} review${res.created !== 1 ? 's' : ''}${res.failed ? `. ${res.failed} failed.` : '.'}`, type: 'success' })
            setSelectedIds([])
            setAction('')
            setReviewType('')
          }
        }
      } catch (e) {
        setResult({ message: 'An error occurred', type: 'error' })
      }
    })
  }

  return (
    <div>
      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-sienna/20 bg-sienna/5 px-4 py-3">
          <span className="font-mono text-sm text-ink">
            {selectedIds.length} selected
          </span>

          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value as typeof action)
              setDocumentId('')
              setReviewType('')
            }}
            className="rounded-lg border border-rule bg-white/80 px-3 py-1.5 font-mono text-sm text-ink outline-none"
          >
            <option value="">Bulk Action...</option>
            <option value="send_document">Send Document for Signing</option>
            <option value="create_review">Create Performance Review</option>
          </select>

          {action === 'send_document' && (
            <select
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="rounded-lg border border-rule bg-white/80 px-3 py-1.5 font-mono text-sm text-ink outline-none"
            >
              <option value="">Select document...</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.doc_type})
                </option>
              ))}
            </select>
          )}

          {action === 'create_review' && (
            <select
              value={reviewType}
              onChange={(e) => setReviewType(e.target.value)}
              className="rounded-lg border border-rule bg-white/80 px-3 py-1.5 font-mono text-sm text-ink outline-none"
            >
              <option value="">Select type...</option>
              <option value="performance">Performance Review</option>
              <option value="probation_30">30-Day Probation</option>
              <option value="probation_60">60-Day Probation</option>
              <option value="probation_90">90-Day Probation</option>
              <option value="quick_note">Manager Note</option>
            </select>
          )}

          <button
            onClick={handleBulkAction}
            disabled={isPending || !action || (action === 'send_document' && !documentId) || (action === 'create_review' && !reviewType)}
            className="rounded-lg bg-sienna px-4 py-1.5 font-mono text-sm font-medium text-cream transition hover:bg-sienna/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? 'Processing...' : 'Apply'}
          </button>

          <button
            onClick={() => setSelectedIds([])}
            className="font-mono text-sm text-ink-soft transition hover:text-sienna"
          >
            Clear
          </button>
        </div>
      )}

      {/* Result message */}
      {result && (
        <div className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 ${
          result.type === 'success'
            ? 'border-sage/20 bg-sage/5'
            : 'border-sienna/20 bg-sienna/5'
        }`}>
          <p className={`font-mono text-sm ${result.type === 'success' ? 'text-sage' : 'text-sienna'}`}>
            {result.message}
          </p>
          <button
            onClick={() => setResult(null)}
            className="ml-auto font-mono text-xs text-ink-soft hover:text-ink"
          >
            Dismiss
          </button>
        </div>
      )}

      {children({ selectedIds, toggleId, toggleAll, allSelected })}
    </div>
  )
}
