'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTalentCategory(
  staffId: string,
  talentCategory: string | null,
  notes?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: admin } = await supabase
    .from('academy_staff')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!admin?.is_admin) return { error: 'Not authorized' }

  const db = await createAdminClient()

  const updateData: Record<string, unknown> = {
    talent_category: talentCategory,
  }

  if (notes !== undefined) {
    updateData.talent_notes = notes
  }

  const { error } = await db
    .from('academy_staff')
    .update(updateData)
    .eq('id', staffId)

  if (error) return { error: error.message }

  revalidatePath('/admin/talent')
  return { success: true }
}
