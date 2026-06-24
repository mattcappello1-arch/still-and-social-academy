'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSection(formData: FormData) {
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
  const slug = formData.get('slug') as string
  const category = formData.get('category') as string
  const content = formData.get('content') as string

  let parsedContent
  try {
    parsedContent = JSON.parse(content)
  } catch {
    parsedContent = [{ type: 'text', data: { html: content } }]
  }

  const db = await createAdminClient()

  // Get max sort_order
  const { data: maxRow } = await db
    .from('academy_handbook_sections')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sortOrder = (maxRow?.sort_order ?? 0) + 1

  const { error } = await db
    .from('academy_handbook_sections')
    .insert({
      title,
      slug,
      category,
      content: parsedContent,
      sort_order: sortOrder,
    })

  if (error) return { error: error.message }

  revalidatePath('/admin/handbook')
  revalidatePath('/handbook')
  return { success: true }
}

export async function updateSection(id: string, formData: FormData) {
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
  const slug = formData.get('slug') as string
  const category = formData.get('category') as string
  const content = formData.get('content') as string

  let parsedContent
  try {
    parsedContent = JSON.parse(content)
  } catch {
    parsedContent = [{ type: 'text', data: { html: content } }]
  }

  const db = await createAdminClient()

  const { error } = await db
    .from('academy_handbook_sections')
    .update({ title, slug, category, content: parsedContent })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/handbook')
  revalidatePath('/handbook')
  revalidatePath(`/handbook/${slug}`)
  return { success: true }
}

export async function deleteSection(id: string) {
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
    .from('academy_handbook_sections')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/handbook')
  revalidatePath('/handbook')
  return { success: true }
}

export async function reorderSections(orderedIds: string[]) {
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

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .from('academy_handbook_sections')
      .update({ sort_order: i + 1 })
      .eq('id', orderedIds[i])
  }

  revalidatePath('/admin/handbook')
  revalidatePath('/handbook')
  return { success: true }
}
