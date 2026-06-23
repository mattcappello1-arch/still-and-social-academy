'use server'

import { createClient } from '@/lib/supabase/server'

export async function viewDocument(docId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Only update if currently pending
  const { error } = await supabase
    .from('academy_staff_documents')
    .update({ status: 'viewed' })
    .eq('id', docId)
    .eq('staff_id', user.id)
    .eq('status', 'pending')

  if (error) return { error: error.message }
  return { success: true }
}

export async function signDocument(
  docId: string,
  signatureDataUrl: string,
  formData?: Record<string, unknown>
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const updateData: Record<string, unknown> = {
    status: 'signed',
    signature_image_url: signatureDataUrl,
    signed_at: new Date().toISOString(),
  }

  if (formData) {
    updateData.form_data = formData
  }

  const { error } = await supabase
    .from('academy_staff_documents')
    .update(updateData)
    .eq('id', docId)
    .eq('staff_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
