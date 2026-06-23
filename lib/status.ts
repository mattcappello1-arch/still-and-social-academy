export type AssignmentStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'expired'

export function effectiveStatus(assignment: { status: string; expires_at: string | null; signed_at: string | null }): AssignmentStatus {
  if (assignment.status === 'signed') return 'signed'
  if (assignment.expires_at && new Date(assignment.expires_at) < new Date() && assignment.status !== 'signed') {
    return 'expired'
  }
  return assignment.status as AssignmentStatus
}

export const STATUS_META: Record<AssignmentStatus, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-oatmeal/30 text-coffee' },
  sent: { label: 'Sent', cls: 'bg-sienna/10 text-sienna' },
  viewed: { label: 'Viewed', cls: 'bg-olive/10 text-olive' },
  signed: { label: 'Signed', cls: 'bg-sage/20 text-sage-deep' },
  expired: { label: 'Expired', cls: 'bg-rosewood/10 text-rosewood' },
}

export const DOC_TYPES = [
  'Trial shift agreement',
  'Staff handbook acknowledgement',
  'Employment contract',
  'Workplace policies',
  'Position description',
  'Other',
] as const
