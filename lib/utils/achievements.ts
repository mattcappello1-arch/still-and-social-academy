import { createAdminClient } from '@/lib/supabase/server'

const BADGE_DEFINITIONS = [
  { slug: 'first_week', title: 'First Week Completed', description: 'Successfully completed your first week at Still and Social.', checkDays: 7 },
  { slug: 'first_month', title: 'First Month Completed', description: 'One month at Still and Social. Thank you for being part of the team.', checkDays: 30 },
  { slug: '1_year', title: '1 Year Service', description: 'One year of dedication. A milestone worth celebrating.', checkDays: 365 },
  { slug: '2_year', title: '2 Year Service', description: 'Two years of commitment and growth. Thank you.', checkDays: 730 },
]

const PATH_BADGES: Record<string, { slug: string; title: string; description: string }> = {
  'foh-sequence-of-service': { slug: 'foh_certified', title: 'Front of House Certified', description: 'Completed the full Sequence of Service training.' },
  'bartender-training': { slug: 'bartender_certified', title: 'Bartender Certified', description: 'Completed all Bartender training modules.' },
  'general-kitchen-training': { slug: 'kitchen_certified', title: 'Kitchen Certified', description: 'Completed General Kitchen training.' },
  'leadership-academy': { slug: 'leadership_ready', title: 'Leadership Ready', description: 'Completed the Leadership Academy.' },
  'the-still-and-social-way': { slug: 'culture_champion', title: 'Culture Champion', description: 'Completed The Still and Social Way.' },
  'rituals-of-hospitality': { slug: 'rituals_master', title: 'Rituals Master', description: 'Completed all Rituals of Hospitality.' },
}

export async function checkAndAwardAchievements(staffId: string) {
  const db = await createAdminClient()

  // Get staff info
  const { data: staff } = await db.from('academy_staff').select('start_date').eq('id', staffId).single()
  if (!staff) return

  // Service milestones
  if (staff.start_date) {
    const daysSinceStart = Math.floor((Date.now() - new Date(staff.start_date).getTime()) / (1000 * 60 * 60 * 24))
    for (const badge of BADGE_DEFINITIONS) {
      if (daysSinceStart >= badge.checkDays) {
        await db.from('academy_achievements').upsert(
          { staff_id: staffId, badge_slug: badge.slug, title: badge.title, description: badge.description },
          { onConflict: 'staff_id,badge_slug', ignoreDuplicates: true }
        )
      }
    }
  }

  // Path completion badges
  for (const [pathSlug, badge] of Object.entries(PATH_BADGES)) {
    const { data: path } = await db.from('academy_training_paths').select('id').eq('slug', pathSlug).single()
    if (!path) continue

    const { data: modules } = await db.from('academy_training_modules').select('id').eq('path_id', path.id).eq('is_active', true)
    if (!modules?.length) continue

    const { data: completed } = await db.from('academy_staff_module_progress')
      .select('module_id')
      .eq('staff_id', staffId)
      .eq('status', 'completed')
      .in('module_id', modules.map(m => m.id))

    if (completed?.length === modules.length) {
      await db.from('academy_achievements').upsert(
        { staff_id: staffId, badge_slug: badge.slug, title: badge.title, description: badge.description },
        { onConflict: 'staff_id,badge_slug', ignoreDuplicates: true }
      )
    }
  }

  // Trainer badge — any skill at level 4
  const { data: trainerSkills } = await db.from('academy_skill_levels').select('id').eq('staff_id', staffId).eq('level', 4).limit(1)
  if (trainerSkills?.length) {
    await db.from('academy_achievements').upsert(
      { staff_id: staffId, badge_slug: 'team_trainer', title: 'Team Trainer', description: 'Achieved Trainer level in a skill area.' },
      { onConflict: 'staff_id,badge_slug', ignoreDuplicates: true }
    )
  }
}
