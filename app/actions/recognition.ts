'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function awardRecognition(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify admin
  const { data: staff } = await supabase
    .from('academy_staff')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!staff?.is_admin) return { error: 'Not authorized' }

  const staff_id = formData.get('staff_id') as string
  const badge_type = formData.get('badge_type') as string
  const description = formData.get('description') as string

  const { error } = await supabase.from('academy_recognition').insert({
    staff_id,
    badge_type,
    description: description || null,
    awarded_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/recognition')
  revalidatePath('/passport')
  return { success: true }
}

export async function awardAchievement(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify admin
  const { data: staff } = await supabase
    .from('academy_staff')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!staff?.is_admin) return { error: 'Not authorized' }

  const staff_id = formData.get('staff_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const { error } = await supabase.from('academy_achievements').insert({
    staff_id,
    title,
    description: description || null,
    awarded_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/recognition')
  revalidatePath('/passport')
  return { success: true }
}
