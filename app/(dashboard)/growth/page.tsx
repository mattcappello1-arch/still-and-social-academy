import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddGoalForm, GoalCard, SkillCheckboxes } from './components'
import { getRecommendations } from '@/lib/utils/recommendations'

const SKILL_NAMES: Record<string, string> = {
  foh_service: 'Front of House Service',
  guest_experience: 'Guest Experience',
  pos_system: 'POS System',
  food_running: 'Food Running',
  bar_service: 'Bar Service',
  cocktail_making: 'Cocktail Making',
  opening_procedures: 'Opening Procedures',
  closing_procedures: 'Closing Procedures',
  kitchen_operations: 'Kitchen Operations',
  leadership: 'Leadership',
  team_training: 'Team Training',
}

const SKILL_LEVELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Not Started', color: 'bg-oatmeal/30' },
  1: { label: 'Beginner', color: 'bg-rosewood/40' },
  2: { label: 'Learning', color: 'bg-sienna/50' },
  3: { label: 'Confident', color: 'bg-olive/60' },
  4: { label: 'Trainer', color: 'bg-sage' },
}

export default async function GrowthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: staff } = await supabase
    .from('academy_staff')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

  // Fetch goals by category
  const { data: goals } = await supabase
    .from('academy_goals')
    .select('*')
    .eq('staff_id', user.id)
    .order('created_at', { ascending: false })

  const personalGoals = (goals ?? []).filter((g: any) => g.category === 'personal')
  const careerGoals = (goals ?? []).filter((g: any) => g.category === 'career')
  const businessGoals = (goals ?? []).filter((g: any) => g.category === 'business')

  // Fetch skill levels
  const { data: skillLevels } = await supabase
    .from('academy_skill_levels')
    .select('skill_name, level')
    .eq('staff_id', user.id)

  const skillMap = new Map((skillLevels ?? []).map((s: any) => [s.skill_name, s.level]))

  // Compute training recommendations
  const allGoals = (goals ?? []).map((g: any) => ({
    title: g.title,
    description: g.description,
    category: g.category,
  }))
  // Derive selected skill names from skill levels that have level > 0
  const selectedSkillNames = (skillLevels ?? [])
    .filter((s: any) => s.level > 0)
    .map((s: any) => SKILL_NAMES[s.skill_name] || s.skill_name)

  const recommendations = getRecommendations(allGoals, selectedSkillNames)

  // Check which training paths actually exist
  const { data: trainingPaths } = await supabase
    .from('academy_training_paths')
    .select('slug, title')
    .eq('is_active', true)

  const existingPathSlugs = new Set((trainingPaths ?? []).map((p: any) => p.slug))

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">My Growth Journey</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Track your goals, skills, and development
        </p>
      </div>

      {/* Personal Goals */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-xl font-light text-ink">Personal Goals</h2>
        <div className="space-y-3 mb-4">
          {personalGoals.length > 0 ? (
            personalGoals.map((goal: any) => (
              <GoalCard key={goal.id} goal={goal} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-6 text-center">
              <p className="font-mono text-sm text-ink-soft">No personal goals yet. Add one below.</p>
            </div>
          )}
        </div>
        <AddGoalForm category="personal" />
      </section>

      {/* Career Development */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-xl font-light text-ink">Career Development</h2>
        <div className="space-y-3 mb-4">
          {careerGoals.length > 0 ? (
            careerGoals.map((goal: any) => (
              <GoalCard key={goal.id} goal={goal} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-6 text-center">
              <p className="font-mono text-sm text-ink-soft">No career goals yet. Add one below.</p>
            </div>
          )}
        </div>
        <AddGoalForm category="career" />

        <div className="mt-6">
          <h3 className="mb-3 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Skills I Want to Develop</h3>
          <SkillCheckboxes selectedSkills={[]} />
        </div>
      </section>

      {/* Recommended Training */}
      {recommendations.length > 0 && (
        <section className="mb-10">
          <div className="rounded-xl border border-sienna/20 bg-sienna/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sienna">
                <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
                <path d="M10 21h4" />
              </svg>
              <h2 className="font-serif text-xl font-light text-ink">Recommended Training</h2>
            </div>
            <p className="font-mono text-xs text-ink-soft mb-4">
              Based on your goals and skill interests, we recommend these training paths:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {recommendations.map((rec) => {
                const exists = existingPathSlugs.has(rec.slug)
                return (
                  <div key={rec.slug} className="rounded-xl border border-rule bg-white/80 p-4">
                    <p className="font-mono text-sm font-medium text-ink mb-1">{rec.title}</p>
                    <p className="font-mono text-[10px] text-ink-soft mb-3">{rec.reason}</p>
                    {exists ? (
                      <a
                        href={`/training/${rec.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sienna/10 px-3 py-1.5 font-mono text-xs text-sienna transition hover:bg-sienna/20"
                      >
                        Start Training
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-oatmeal/10 px-3 py-1.5 font-mono text-xs text-ink-soft">
                        Coming Soon
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Still & Social Goals */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-xl font-light text-ink">Still & Social Goals</h2>
        <div className="space-y-3 mb-4">
          {businessGoals.length > 0 ? (
            businessGoals.map((goal: any) => (
              <GoalCard key={goal.id} goal={goal} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-6 text-center">
              <p className="font-mono text-sm text-ink-soft">No business goals yet. Add one below.</p>
            </div>
          )}
        </div>
        <AddGoalForm category="business" />
      </section>

      {/* Skill Tracker */}
      <section>
        <h2 className="mb-4 font-serif text-xl font-light text-ink">Skill Tracker</h2>
        <p className="mb-4 font-mono text-xs text-ink-soft">
          Your skill levels are updated by your manager during reviews.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(SKILL_NAMES).map(([key, name]) => {
            const level = skillMap.get(key) ?? 0
            const info = SKILL_LEVELS[level]
            return (
              <div key={key} className="rounded-xl border border-rule bg-white/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-ink">{name}</span>
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${
                    level === 0 ? 'bg-oatmeal/20 text-ink-soft' :
                    level === 4 ? 'bg-sage/10 text-sage-deep' :
                    'bg-sienna/10 text-sienna'
                  }`}>
                    {info.label}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((dot) => (
                    <div
                      key={dot}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        dot <= level ? info.color : 'bg-oatmeal/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
