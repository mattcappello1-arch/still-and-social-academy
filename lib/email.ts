// Email helpers — no-ops if RESEND_API_KEY is not set
const RESEND_KEY = process.env.RESEND_API_KEY

async function send(to: string, subject: string, html: string) {
  if (!RESEND_KEY) {
    console.log(`[Email skipped] To: ${to} | Subject: ${subject}`)
    return
  }
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Still & Social Academy <noreply@stillandsocial.com.au>',
        to,
        subject,
        html,
      }),
    })
  } catch (e) {
    console.error('Email send failed:', e)
  }
}

export async function sendInvite(email: string, name: string, documentTitle: string, signUrl: string) {
  await send(email, `Document to sign: ${documentTitle}`, `
    <p>Hi ${name},</p>
    <p>You have a document to review and sign: <strong>${documentTitle}</strong></p>
    <p><a href="${signUrl}" style="display:inline-block;padding:12px 24px;background:#9F5136;color:#fff;text-decoration:none;border-radius:8px;">Review and Sign</a></p>
    <p>This link expires in 7 days.</p>
    <p>Still & Social Academy</p>
  `)
}

export async function sendSignedCopy(email: string, name: string, documentTitle: string) {
  await send(email, `Signed: ${documentTitle}`, `
    <p>Hi ${name},</p>
    <p>Your signed copy of <strong>${documentTitle}</strong> has been recorded.</p>
    <p>You can view your signed documents in the Academy portal.</p>
    <p>Still & Social Academy</p>
  `)
}

export async function sendAdminNotify(documentTitle: string, staffName: string) {
  await send('matt@stillandsocial.com', `Document signed: ${documentTitle}`, `
    <p><strong>${staffName}</strong> has signed <strong>${documentTitle}</strong>.</p>
    <p>View in the Academy admin portal.</p>
  `)
}
