'use server'

import { createClient } from '@/lib/supabase/server'
import { checkAndAwardAchievements } from '@/lib/utils/achievements'
import { createNotification } from '@/app/actions/notifications'

export async function startModule(moduleId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('academy_staff_module_progress')
    .upsert(
      {
        staff_id: user.id,
        module_id: moduleId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      },
      { onConflict: 'staff_id,module_id', ignoreDuplicates: false }
    )

  if (error) return { error: error.message }
  return { success: true }
}

export async function markModuleComplete(moduleId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('academy_staff_module_progress')
    .upsert(
      {
        staff_id: user.id,
        module_id: moduleId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'staff_id,module_id', ignoreDuplicates: false }
    )

  if (error) return { error: error.message }

  // Award achievements and notify
  try {
    await checkAndAwardAchievements(user.id)
    // Get module title for notification
    const { data: mod } = await supabase.from('academy_training_modules').select('title').eq('id', moduleId).single()
    if (mod) {
      await createNotification(user.id, 'Module Completed', `You completed "${mod.title}"`, 'training', '/passport')
    }
  } catch { /* non-critical */ }

  return { success: true }
}

export async function submitQuiz(
  moduleId: string,
  quizId: string,
  answers: Record<number, number>,
  textAnswers?: Record<number, string>
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Fetch quiz
  const { data: quiz, error: quizError } = await supabase
    .from('academy_quizzes')
    .select('*')
    .eq('id', quizId)
    .single()

  if (quizError || !quiz) return { error: 'Quiz not found' }

  const questions = quiz.questions as Array<{
    question: string
    options?: string[]
    correct?: number
    type?: 'multiple_choice' | 'reflection' | 'scenario'
    minLength?: number
    context?: string
  }>

  // Grade
  let correct = 0
  const results: Array<{
    question: string
    selected: number
    correct: number
    isCorrect: boolean
    textAnswer?: string
  }> = []

  questions.forEach((q, i) => {
    const type = q.type || 'multiple_choice'

    if (type === 'reflection' || type === 'scenario') {
      const text = textAnswers?.[i] || ''
      const meetsMin = text.length >= (q.minLength ?? 1)
      if (meetsMin) correct++
      results.push({
        question: q.question,
        selected: -1,
        correct: -1,
        isCorrect: meetsMin,
        textAnswer: text,
      })
    } else {
      const selected = answers[i] ?? -1
      const isCorrect = selected === (q.correct ?? -1)
      if (isCorrect) correct++
      results.push({
        question: q.question,
        selected,
        correct: q.correct ?? 0,
        isCorrect,
      })
    }
  })

  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0
  const passed = score >= (quiz.pass_score ?? 80)

  // Get current attempt count
  const { data: existing } = await supabase
    .from('academy_staff_module_progress')
    .select('quiz_attempts')
    .eq('staff_id', user.id)
    .eq('module_id', moduleId)
    .single()

  const attempts = (existing?.quiz_attempts ?? 0) + 1

  // Update progress
  const progressData: Record<string, unknown> = {
    staff_id: user.id,
    module_id: moduleId,
    quiz_score: score,
    quiz_attempts: attempts,
  }

  if (passed) {
    progressData.status = 'completed'
    progressData.completed_at = new Date().toISOString()
  } else {
    progressData.status = 'in_progress'
  }

  await supabase
    .from('academy_staff_module_progress')
    .upsert(progressData, { onConflict: 'staff_id,module_id', ignoreDuplicates: false })

  return {
    success: true,
    score,
    passed,
    passScore: quiz.pass_score,
    results,
    attempts,
  }
}
