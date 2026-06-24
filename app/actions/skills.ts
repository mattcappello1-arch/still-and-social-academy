'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSkillLevel(formData: FormData) {
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
  const skill_name = formData.get('skill_name') as string
  const level = parseInt(formData.get('level') as string)

  if (level < 0 || level > 4) return { error: 'Invalid skill level' }

  const { error } = await supabase
    .from('academy_skill_levels')
    .upsert(
      {
        staff_id,
        skill_name,
        level,
        updated_by: user.id,
      },
      { onConflict: 'staff_id,skill_name' }
    )

  if (error) return { error: error.message }
  revalidatePath('/admin/skills')
  revalidatePath('/growth')
  return { success: true }
}
