'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateChecklist(
  itemIndex: number,
  completed: boolean
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get current readiness record
  const { data: readiness } = await supabase
    .from('academy_shift_readiness')
    .select('*')
    .eq('staff_id', user.id)
    .single()

  if (!readiness) return { error: 'No readiness record found' }

  const items = (readiness.checklist_items as Array<{ name: string; completed: boolean }>) ?? []

  if (itemIndex < 0 || itemIndex >= items.length) return { error: 'Invalid item index' }

  // Don't allow unchecking manager sign-off
  if (items[itemIndex].name === 'Manager Sign Off' && !completed) {
    return { error: 'Only a manager can modify sign-off status' }
  }

  // Don't allow staff to check manager sign-off
  if (items[itemIndex].name === 'Manager Sign Off' && completed) {
    return { error: 'Only a manager can sign off' }
  }

  items[itemIndex].completed = completed

  const db = await createAdminClient()
  const { error } = await db
    .from('academy_shift_readiness')
    .update({ checklist_items: items })
    .eq('id', readiness.id)

  if (error) return { error: error.message }

  revalidatePath('/readiness')
  return { success: true }
}

export async function managerSignoff(staffId: string) {
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

  // Get the staff's readiness record
  const { data: readiness } = await db
    .from('academy_shift_readiness')
    .select('*')
    .eq('staff_id', staffId)
    .single()

  if (!readiness) return { error: 'No readiness record found' }

  const items = (readiness.checklist_items as Array<{ name: string; completed: boolean }>) ?? []

  // Find and check the Manager Sign Off item
  const signOffIndex = items.findIndex(i => i.name === 'Manager Sign Off')
  if (signOffIndex >= 0) {
    items[signOffIndex].completed = true
  }

  const { error } = await db
    .from('academy_shift_readiness')
    .update({
      checklist_items: items,
      manager_signed_off: true,
      signed_off_by: user.id,
      signed_off_at: new Date().toISOString(),
    })
    .eq('id', readiness.id)

  if (error) return { error: error.message }

  revalidatePath('/admin/readiness')
  revalidatePath('/readiness')
  return { success: true }
}

export async function updateChecklistItems(staffId: string, items: Array<{ name: string; completed: boolean }>) {
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
  const { error } = await db
    .from('academy_shift_readiness')
    .update({ checklist_items: items })
    .eq('staff_id', staffId)

  if (error) return { error: error.message }

  revalidatePath('/admin/readiness')
  revalidatePath('/readiness')
  return { success: true }
}
