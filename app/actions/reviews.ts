'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReflection(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const reviewId = formData.get('review_id') as string
  const proud_of = formData.get('proud_of') as string
  const learned = formData.get('learned') as string
  const improve = formData.get('improve') as string
  const support_needed = formData.get('support_needed') as string

  const { error } = await supabase
    .from('academy_reviews')
    .update({
      employee_proud_of: proud_of,
      employee_learned: learned,
      employee_improve: improve,
      employee_support_needed: support_needed,
      status: 'manager_pending',
      employee_submitted_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .eq('staff_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/reviews')
  return { success: true }
}

export async function submitManagerReview(formData: FormData) {
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

  const reviewId = formData.get('review_id') as string
  const strengths = formData.get('strengths') as string
  const areas_for_development = formData.get('areas_for_development') as string
  const training_recommendations = formData.get('training_recommendations') as string
  const future_opportunities = formData.get('future_opportunities') as string
  const additional_notes = formData.get('additional_notes') as string
  const probation_outcome = formData.get('probation_outcome') as string | null

  const updateData: Record<string, unknown> = {
    manager_strengths: strengths,
    manager_areas_for_development: areas_for_development,
    manager_training_recommendations: training_recommendations,
    manager_future_opportunities: future_opportunities,
    manager_additional_notes: additional_notes,
    manager_id: user.id,
    status: 'completed',
    manager_submitted_at: new Date().toISOString(),
  }

  if (probation_outcome) {
    updateData.probation_outcome = probation_outcome
  }

  const { error } = await supabase
    .from('academy_reviews')
    .update(updateData)
    .eq('id', reviewId)

  if (error) return { error: error.message }
  revalidatePath('/admin/reviews')
  return { success: true }
}

export async function createReview(formData: FormData) {
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
  const review_type = formData.get('review_type') as string

  const { error } = await supabase.from('academy_reviews').insert({
    staff_id,
    review_type,
    status: 'employee_pending',
    created_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/reviews')
  return { success: true }
}
