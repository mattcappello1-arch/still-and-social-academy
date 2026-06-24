import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DevelopHubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Reviews
  const { data: reviews } = await supabase
    .from('academy_reviews')
    .select('id, review_type, status, scheduled_date, created_at')
    .eq('staff_id', user.id)
    .order('created_at', { ascending: false })

  const pendingReviews = (reviews ?? []).filter((r: any) => r.status !== 'completed')
  const completedReviews = (reviews ?? []).filter((r: any) => r.status === 'completed')

  // Find next review date
  const nextReview = pendingReviews.find((r: any) => r.scheduled_date)
  const nextReviewDate = nextReview?.scheduled_date
    ? new Date(nextReview.scheduled_date)
    : null
  const daysUntilReview = nextReviewDate
    ? Math.ceil((nextReviewDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Growth goals
  const { data: goals } = await supabase
    .from('academy_growth_goals')
    .select('id, status')
    .eq('staff_id', user.id)

  const activeGoals = (goals ?? []).filter((g: any) => g.status === 'active' || g.status === 'in_progress').length
  const completedGoals = (goals ?? []).filter((g: any) => g.status === 'completed').length

  // Skills
  const { data: skills } = await supabase
    .from('academy_staff_skills')
    .select('skill_name, level')
    .eq('staff_id', user.id)

  // Wellbeing check-in this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
  const { data: thisMonthCheckin } = await supabase
    .from('academy_wellbeing_checkins')
    .select('id')
    .eq('staff_id', user.id)
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd)
    .limit(1)
  const hasCheckedInThisMonth = (thisMonthCheckin?.length ?? 0) > 0

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Develop</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">Reviews, goals, skills, and career growth</p>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Next Review</p>
          {daysUntilReview !== null ? (
            <>
              <p className="font-serif text-3xl font-light text-ink">{daysUntilReview}d</p>
              <p className="mt-1 font-mono text-xs text-ink-soft">
                {nextReviewDate?.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
              </p>
            </>
          ) : (
            <>
              <p className="font-serif text-3xl font-light text-ink-soft">--</p>
              <p className="mt-1 font-mono text-xs text-ink-soft">No review scheduled</p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Active Goals</p>
          <p className="font-serif text-3xl font-light text-ink">{activeGoals}</p>
          <p className="mt-1 font-mono text-xs text-ink-soft">{completedGoals} completed</p>
        </div>

        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Skills</p>
          <p className="font-serif text-3xl font-light text-ink">{skills?.length ?? 0}</p>
          <p className="mt-1 font-mono text-xs text-ink-soft">tracked</p>
        </div>

        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Reviews</p>
          <p className="font-serif text-3xl font-light text-ink">{completedReviews.length}</p>
          <p className="mt-1 font-mono text-xs text-ink-soft">completed</p>
        </div>
      </div>

      {/* Wellbeing check-in prompt */}
      {!hasCheckedInThisMonth && (
        <div className="mb-8 rounded-xl border border-olive/20 bg-olive/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-light text-ink">Monthly Check-in</h2>
              <p className="mt-1 font-mono text-sm text-ink-soft">
                How are you feeling? Take a moment to check in with yourself.
              </p>
            </div>
            <Link
              href="/wellbeing"
              className="flex items-center gap-2 rounded-lg bg-olive px-5 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-olive/90"
            >
              Check In
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      )}

      {/* Skill levels overview */}
      {skills && skills.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 font-serif text-xl font-light text-ink">Skill Levels</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {skills.map((skill: any) => {
              const levelPct = Math.round((skill.level / 4) * 100)
              const labels: Record<number, string> = { 0: 'Not Started', 1: 'Beginner', 2: 'Learning', 3: 'Confident', 4: 'Trainer' }
              return (
                <div key={skill.skill_name} className="rounded-xl border border-rule bg-white/60 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-mono text-sm text-ink">{skill.skill_name.replace(/_/g, ' ')}</p>
                    <span className="font-mono text-xs text-ink-soft">{labels[skill.level] ?? `Level ${skill.level}`}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-oatmeal/30">
                    <div className="h-full rounded-full bg-sienna transition-all" style={{ width: `${levelPct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/reviews" className="rounded-xl border border-rule bg-white/60 p-5 transition hover:shadow-sm hover:border-sienna/30 group">
          <h3 className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition">Reviews</h3>
          <p className="mt-1 font-mono text-xs text-ink-soft">{pendingReviews.length} pending</p>
        </Link>
        <Link href="/growth" className="rounded-xl border border-rule bg-white/60 p-5 transition hover:shadow-sm hover:border-sienna/30 group">
          <h3 className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition">Growth</h3>
          <p className="mt-1 font-mono text-xs text-ink-soft">{activeGoals} active goals</p>
        </Link>
        <Link href="/career" className="rounded-xl border border-rule bg-white/60 p-5 transition hover:shadow-sm hover:border-sienna/30 group">
          <h3 className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition">Career</h3>
          <p className="mt-1 font-mono text-xs text-ink-soft">View your path</p>
        </Link>
        <Link href="/wellbeing" className="rounded-xl border border-rule bg-white/60 p-5 transition hover:shadow-sm hover:border-sienna/30 group">
          <h3 className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition">Wellbeing</h3>
          <p className="mt-1 font-mono text-xs text-ink-soft">{hasCheckedInThisMonth ? 'Checked in' : 'Not checked in'}</p>
        </Link>
      </div>
    </div>
  )
}
