import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROLES, getRoleLabel } from '@/lib/utils/roles'
import { generateToken, expiryFromNow } from '@/lib/tokens'
import { QuickSetupForm } from './quick-setup-form'

async function quickSetupAction(formData: FormData) {
  'use server'

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const employmentType = formData.get('employment_type') as string
  const startDate = (formData.get('start_date') as string) || null
  const templateIds = formData.getAll('template_ids') as string[]

  const supabase = await createClient()
  const admin = await createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Step 1: Create invitation record
  const { error: inviteError } = await admin
    .from('academy_invitations')
    .insert({
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      employment_type: employmentType,
      invited_by: user?.id ?? null,
    })

  if (inviteError) {
    redirect(
      `/admin/staff/new/quick-setup?error=${encodeURIComponent(inviteError.message)}`
    )
  }

  // Step 2: Send auth invite
  const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      first_name: firstName,
      last_name: lastName,
      role,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/accept-invite`,
  })

  // Step 3: If we got a user ID and selected templates, create signing assignments
  if (authData?.user && templateIds.length > 0) {
    // First create signing documents from templates
    for (const templateId of templateIds) {
      const { data: template } = await admin
        .from('academy_signing_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (template) {
        const { data: doc } = await admin
          .from('academy_signing_documents')
          .insert({
            title: template.title,
            doc_type: template.doc_type,
            body: template.body,
          })
          .select('id')
          .single()

        if (doc) {
          const token = generateToken()
          await admin.from('academy_signing_assignments').insert({
            staff_id: authData.user.id,
            document_id: doc.id,
            token,
            status: 'sent',
            sent_at: new Date().toISOString(),
            expires_at: expiryFromNow(14),
          })
        }
      }
    }
  }

  if (authError) {
    const isRateLimit = authError.message.toLowerCase().includes('rate limit') ||
      authError.message.toLowerCase().includes('too many requests') ||
      authError.status === 429

    if (isRateLimit) {
      redirect(
        `/admin/staff/new/quick-setup?error=${encodeURIComponent('Please wait a moment before sending another invitation')}`
      )
    }
    redirect(
      `/admin/staff/new/quick-setup?error=${encodeURIComponent(authError.message)}&partial=true`
    )
  }

  redirect(
    `/admin/staff/new/quick-setup?success=${encodeURIComponent(`${firstName} ${lastName} has been set up and invited. Training paths will be auto-assigned based on their role (${role}).${templateIds.length > 0 ? ` ${templateIds.length} document(s) sent for signing.` : ''}`)}`
  )
}

export default async function QuickSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; partial?: string }>
}) {
  const params = await searchParams
  const error = params.error
  const success = params.success
  const partial = params.partial === 'true'

  const admin = await createAdminClient()

  // Get signing templates for document selection
  const { data: signingTemplates } = await admin
    .from('academy_signing_templates')
    .select('id, title, doc_type')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <a
          href="/admin/staff"
          className="mb-4 inline-flex items-center gap-1 font-mono text-sm text-ink-soft transition hover:text-sienna"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Staff
        </a>
        <h1 className="font-serif text-3xl font-light text-ink">
          New Staff Quick Setup
        </h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Set up a new staff member in one step: create account, assign training, send documents, and invite.
        </p>
      </div>

      {success && (
        <div className="mb-4 rounded-lg border border-sage/30 bg-sage/5 px-4 py-3 font-mono text-sm text-sage">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-sienna/20 bg-sienna/5 px-4 py-3 font-mono text-sm text-sienna">
          {error}
          {partial && (
            <p className="mt-1 text-xs text-sienna/80">The invitation record was created but the email could not be sent.</p>
          )}
        </div>
      )}

      <QuickSetupForm
        roles={ROLES as unknown as string[]}
        getRoleLabel={getRoleLabel}
        signingTemplates={signingTemplates ?? []}
        quickSetupAction={quickSetupAction}
      />
    </div>
  )
}
