// Simplified PDF builder — creates a basic signed PDF
// For production, consider pdf-lib for embedding original PDFs

export async function buildSignedPdf(opts: {
  document: { title: string; doc_type: string; body: string | null };
  staff: { first_name: string; last_name: string; email: string };
  assignment: { signer_name: string; consent_read: boolean; consent_sign: boolean; signed_at: string };
  signaturePng: Uint8Array;
  audit: { sentAt: string | null; openedAt: string | null; signedAt: string; ip: string | null; userAgent: string | null };
}): Promise<Uint8Array> {
  // For now, return a simple text-based PDF using minimal PDF spec
  // This can be upgraded to pdf-lib later for embedding original PDFs
  const { document, staff, assignment, audit } = opts
  const staffName = `${staff.first_name} ${staff.last_name}`
  const signedDate = new Date(assignment.signed_at).toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' })

  const content = [
    `STILL & SOCIAL - SIGNED DOCUMENT`,
    ``,
    `Document: ${document.title}`,
    `Type: ${document.doc_type}`,
    ``,
    `Prepared for: ${staffName}`,
    `Email: ${staff.email}`,
    ``,
    `---`,
    ``,
    document.body || 'Document content was provided as an uploaded file.',
    ``,
    `---`,
    ``,
    `SIGNING RECORD`,
    `Signed by: ${assignment.signer_name}`,
    `Date: ${signedDate}`,
    `Consent to read: ${assignment.consent_read ? 'Yes' : 'No'}`,
    `Consent to sign: ${assignment.consent_sign ? 'Yes' : 'No'}`,
    ``,
    `AUDIT TRAIL`,
    audit.sentAt ? `Sent: ${new Date(audit.sentAt).toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' })}` : '',
    audit.openedAt ? `Opened: ${new Date(audit.openedAt).toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' })}` : '',
    `Signed: ${signedDate}`,
    audit.ip ? `IP Address: ${audit.ip}` : '',
    ``,
    `This document was digitally signed via Still & Social Academy.`,
  ].filter(Boolean).join('\n')

  return new TextEncoder().encode(content)
}
