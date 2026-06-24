'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createResource(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: staff } = await supabase
    .from('academy_staff')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!staff?.is_admin) return { error: 'Not authorized' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const type = formData.get('type') as string
  const externalUrl = formData.get('external_url') as string
  const isManagementOnly = formData.get('is_management_only') === 'true'
  const file = formData.get('file') as File | null

  const db = await createAdminClient()
  let fileUrl = externalUrl || ''

  // Handle file upload
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await db.storage
      .from('academy-resources')
      .upload(filePath, file)

    if (uploadError) return { error: `Upload failed: ${uploadError.message}` }

    const { data: urlData } = db.storage
      .from('academy-resources')
      .getPublicUrl(filePath)

    fileUrl = urlData.publicUrl
  }

  const { error } = await db
    .from('academy_resources')
    .insert({
      title,
      description,
      category,
      type,
      url: fileUrl,
      is_management_only: isManagementOnly,
    })

  if (error) return { error: error.message }

  revalidatePath('/admin/resources')
  revalidatePath('/resources')
  return { success: true }
}

export async function updateResource(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: staff } = await supabase
    .from('academy_staff')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!staff?.is_admin) return { error: 'Not authorized' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const type = formData.get('type') as string
  const externalUrl = formData.get('external_url') as string
  const isManagementOnly = formData.get('is_management_only') === 'true'
  const file = formData.get('file') as File | null

  const db = await createAdminClient()

  const updateData: Record<string, unknown> = {
    title,
    description,
    category,
    type,
    is_management_only: isManagementOnly,
  }

  // Handle new file upload
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await db.storage
      .from('academy-resources')
      .upload(filePath, file)

    if (uploadError) return { error: `Upload failed: ${uploadError.message}` }

    const { data: urlData } = db.storage
      .from('academy-resources')
      .getPublicUrl(filePath)

    updateData.url = urlData.publicUrl
  } else if (externalUrl) {
    updateData.url = externalUrl
  }

  const { error } = await db
    .from('academy_resources')
    .update(updateData)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/resources')
  revalidatePath('/resources')
  return { success: true }
}

export async function deleteResource(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: staff } = await supabase
    .from('academy_staff')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!staff?.is_admin) return { error: 'Not authorized' }

  const db = await createAdminClient()
  const { error } = await db
    .from('academy_resources')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/resources')
  revalidatePath('/resources')
  return { success: true }
}
