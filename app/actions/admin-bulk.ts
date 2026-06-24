'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateToken, expiryFromNow } from '@/lib/tokens'
import { revalidatePath } from 'next/cache'

async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: staff } = await supabase
    .from('academy_staff')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!staff?.is_admin) throw new Error('Not authorized')
  return user.id
}

export async function bulkSendDocument(staffIds: string[], documentId: string) {
  await verifyAdmin()

  if (!staffIds.length || !documentId) {
    return { error: 'Missing staff or document selection' }
  }

  const db = await createAdminClient()
  const now = new Date().toISOString()
  let sent = 0
  let failed = 0

  for (const staffId of staffIds) {
    try {
      const token = generateToken()
      const expiresAt = expiryFromNow(7)

      const { data: assignment } = await db
        .from('academy_signing_assignments')
        .insert({
          staff_id: staffId,
          document_id: documentId,
          token,
          status: 'sent',
          sent_at: now,
          expires_at: expiresAt,
        })
        .select('id')
        .single()

      if (assignment) {
        await db.from('academy_signing_audit').insert({
          assignment_id: assignment.id,
          event_type: 'sent',
          actor: 'admin',
        })
        sent++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  revalidatePath('/admin/staff')
  revalidatePath('/admin/signing')
  return { success: true, sent, failed }
}

export async function bulkCreateReview(staffIds: string[], reviewType: string) {
  const adminId = await verifyAdmin()

  if (!staffIds.length || !reviewType) {
    return { error: 'Missing staff or review type selection' }
  }

  const supabase = await createClient()
  let created = 0
  let failed = 0

  for (const staffId of staffIds) {
    try {
      const { error } = await supabase.from('academy_reviews').insert({
        staff_id: staffId,
        review_type: reviewType,
        status: 'employee_pending',
        created_by: adminId,
      })

      if (error) {
        failed++
      } else {
        created++
      }
    } catch {
      failed++
    }
  }

  revalidatePath('/admin/staff')
  revalidatePath('/admin/reviews')
  return { success: true, created, failed }
}
