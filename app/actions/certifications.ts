'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadCertification(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const cert_type = formData.get('cert_type') as string
  const title = formData.get('title') as string
  const issuing_body = formData.get('issuing_body') as string
  const cert_number = formData.get('cert_number') as string
  const issue_date = formData.get('issue_date') as string
  const expiry_date = formData.get('expiry_date') as string
  const file = formData.get('file') as File | null

  let file_path: string | null = null

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('academy-certifications')
      .upload(fileName, file)

    if (uploadError) return { error: `File upload failed: ${uploadError.message}` }
    file_path = fileName
  }

  const { error } = await supabase.from('academy_certifications').insert({
    staff_id: user.id,
    cert_type,
    title,
    issuing_body: issuing_body || null,
    cert_number: cert_number || null,
    issue_date: issue_date || null,
    expiry_date: expiry_date || null,
    file_path,
  })

  if (error) return { error: error.message }
  revalidatePath('/certifications')
  return { success: true }
}

export async function deleteCertification(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const id = formData.get('id') as string

  // Get file path before deleting
  const { data: cert } = await supabase
    .from('academy_certifications')
    .select('file_path')
    .eq('id', id)
    .eq('staff_id', user.id)
    .single()

  if (cert?.file_path) {
    await supabase.storage.from('academy-certifications').remove([cert.file_path])
  }

  const { error } = await supabase
    .from('academy_certifications')
    .delete()
    .eq('id', id)
    .eq('staff_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/certifications')
  return { success: true }
}
