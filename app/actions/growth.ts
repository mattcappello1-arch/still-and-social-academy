'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const target_date = formData.get('target_date') as string
  const category = formData.get('category') as string

  const { error } = await supabase.from('academy_goals').insert({
    staff_id: user.id,
    title,
    description: description || null,
    target_date: target_date || null,
    category,
    status: 'active',
  })

  if (error) return { error: error.message }
  revalidatePath('/growth')
  return { success: true }
}

export async function updateGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const target_date = formData.get('target_date') as string

  const { error } = await supabase
    .from('academy_goals')
    .update({ title, description: description || null, target_date: target_date || null })
    .eq('id', id)
    .eq('staff_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/growth')
  return { success: true }
}

export async function completeGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const id = formData.get('id') as string

  const { error } = await supabase
    .from('academy_goals')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('staff_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/growth')
  return { success: true }
}

export async function deleteGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const id = formData.get('id') as string

  const { error } = await supabase
    .from('academy_goals')
    .delete()
    .eq('id', id)
    .eq('staff_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/growth')
  return { success: true }
}
