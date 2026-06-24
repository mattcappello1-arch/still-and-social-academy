'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addFollowUpNotes(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: staff } = await supabase
    .from('academy_staff')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!staff?.is_admin) return { error: 'Not authorized' }

  const checkinId = formData.get('checkin_id') as string
  const notes = formData.get('follow_up_notes') as string

  const { error } = await supabase
    .from('academy_wellbeing_checkins')
    .update({
      follow_up_notes: notes,
      followed_up_at: new Date().toISOString(),
    })
    .eq('id', checkinId)

  if (error) return { error: error.message }
  revalidatePath('/admin/wellbeing')
  return { success: true }
}
