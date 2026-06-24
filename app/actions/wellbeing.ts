'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitCheckin(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const rating = parseInt(formData.get('rating') as string)
  const comments = formData.get('comments') as string

  if (!rating || rating < 1 || rating > 5) return { error: 'Invalid rating' }

  // Check if already checked in this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { data: existing } = await supabase
    .from('academy_wellbeing_checkins')
    .select('id')
    .eq('staff_id', user.id)
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd)
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: 'You have already checked in this month' }
  }

  const { error } = await supabase.from('academy_wellbeing_checkins').insert({
    staff_id: user.id,
    rating,
    comments: comments || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/wellbeing')
  return { success: true }
}
