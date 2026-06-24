'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function createNotification(
  staffId: string,
  title: string,
  message: string,
  type: string = 'info',
  link?: string
) {
  const db = await createAdminClient()
  await db.from('academy_notifications').insert({
    staff_id: staffId,
    title,
    message,
    type,
    link,
  })
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient()
  await supabase.from('academy_notifications').update({ is_read: true }).eq('id', notificationId)
}

export async function markAllAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('academy_notifications').update({ is_read: true }).eq('staff_id', user.id).eq('is_read', false)
}
