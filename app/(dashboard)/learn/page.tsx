import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const FOUNDATION_SLUG = 'foundation'

export default async function LearnHubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: staff } = await supabase
    .from('academy_staff')
    .select('role')
    .eq('id', user.id)
    .single()

  // Get assigned training paths
  const { data: rolePaths } = staff
    ? await supabase
        .from('academy_role_training_paths')
        .select('path_id, is_required, sort_order, academy_training_paths(id, title, slug, department)')
        .eq('role', staff.role)
        .order('sort_order')
    : { data: null }

  const pathIds = (rolePaths ?? []).map((rp: any) => rp.path_id)
  const { data: allModules } = pathIds.length
    ? await supabase.from('academy_training_modules').select('id, path_id, title, slug').in('path_id', pathIds)
    : { data: [] }

  const { data: progress } = await supabase
    .from('academy_staff_module_progress')
    .select('module_id, status, completed_at')
    .eq('staff_id', user.id)

  const progressMap = new Map((progress ?? []).map((p: any) => [p.module_id, p]))

  const pathProgress = (rolePaths ?? []).map((rp: any) => {
    const path = rp.academy_training_paths
    const pathModules = (allModules ?? []).filter((m: any) => m.path_id === rp.path_id)
    const completed = pathModules.filter((m: any) => progressMap.get(m.id)?.status === 'completed').length
    const total = pathModules.length
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    return { ...path, completed, total, pct, is_required: rp.is_required }
  })

  // Separate foundation from other paths
  const foundationPath = pathProgress.find((p: any) => p.slug === FOUNDATION_SLUG)
  const otherPaths = pathProgress.filter((p: any) => p.slug !== FOUNDATION_SLUG)
  const foundationComplete = foundationPath ? foundationPath.pct === 100 : false

  const overallTotal = pathProgress.reduce((s: number, p: any) => s + p.total, 0)
  const overallCompleted = pathProgress.reduce((s: number, p: any) => s + p.completed, 0)
  const overallPct = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0

  // Find next incomplete module
  let nextModule: { title: string; slug: string; pathSlug: string } | null = null
  for (const pp of pathProgress) {
    if (pp.pct < 100) {
      const pathModules = (allModules ?? []).filter((m: any) => m.path_id === pp.id)
      const incomplete = pathModules.find((m: any) => progressMap.get(m.id)?.status !== 'completed')
      if (incomplete) {
        nextModule = { title: incomplete.title, slug: incomplete.slug, pathSlug: pp.slug }
        break
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Learn</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">Your training progress and learning resources</p>
      </div>

      {/* Foundation Training — prominent section */}
      {foundationPath && (
        <div className="mb-8">
          <Link
            href="/foundation"
            className="group block rounded-xl border-2 border-sienna/20 bg-gradient-to-br from-sienna/5 to-cream-soft/50 p-6 transition hover:border-sienna/40 hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sienna">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase">Required</span>
                </div>
                <h2 className="font-serif text-2xl font-light text-ink group-hover:text-sienna transition">Foundation Training</h2>
                <p className="mt-1 font-serif text-sm font-light text-ink-soft italic">Before we teach you how, we teach you why.</p>
              </div>
              {foundationComplete ? (
                <span className="flex items-center gap-1.5 rounded-full bg-sage/10 border border-sage/20 px-3 py-1 font-mono text-[10px] tracking-wider text-sage uppercase">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                  Complete
                </span>
              ) : (
                <span className="flex items-center gap-2 rounded-lg bg-sienna px-4 py-2 font-mono text-xs font-medium tracking-wide text-cream transition group-hover:bg-sienna/90">
                  {foundationPath.completed === 0 ? 'Start' : 'Continue'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </span>
              )}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-oatmeal/20">
              <div className="h-full rounded-full bg-sienna transition-all" style={{ width: `${foundationPath.pct}%` }} />
            </div>
            <p className="mt-2 font-mono text-xs text-ink-soft">{foundationPath.completed} of {foundationPath.total} modules completed</p>
          </Link>
        </div>
      )}

      {/* Foundation gate message */}
      {foundationPath && !foundationComplete && (
        <div className="mb-8 rounded-xl border border-oatmeal/40 bg-cream-soft/50 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-soft shrink-0">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Foundation Required</span>
          </div>
          <p className="font-mono text-sm text-ink-soft">Complete Foundation Training to unlock role-specific pathways.</p>
        </div>
      )}

      {/* Overall progress */}
      <div className="mb-8 rounded-xl border border-rule bg-white/60 p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">Overall Training Progress</p>
          <span className="font-serif text-3xl font-light text-ink">{overallPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-oatmeal/30">
          <div className="h-full rounded-full bg-sienna transition-all" style={{ width: `${overallPct}%` }} />
        </div>
        <p className="mt-2 font-mono text-xs text-ink-soft">{overallCompleted} of {overallTotal} modules completed</p>
      </div>

      {/* Continue where you left off */}
      {nextModule && (
        <div className="mb-8 rounded-xl border-2 border-sienna/30 bg-sienna/5 p-6">
          <p className="font-mono text-[10px] tracking-widest text-sienna uppercase mb-2">Continue Where You Left Off</p>
          <Link href={`/training/${nextModule.pathSlug}/${nextModule.slug}`}
            className="flex items-center justify-between group">
            <span className="font-serif text-xl font-light text-ink group-hover:text-sienna transition">
              {nextModule.title}
            </span>
            <span className="flex items-center gap-2 rounded-lg bg-sienna px-4 py-2 font-mono text-xs font-medium tracking-wide text-cream transition group-hover:bg-sienna/90">
              Continue
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </span>
          </Link>
        </div>
      )}

      {/* Training paths (excluding foundation) */}
      <section className="mb-8">
        <h2 className="mb-4 font-serif text-xl font-light text-ink">Training Paths</h2>
        <div className="space-y-3">
          {otherPaths.map((p: any) => (
            <Link key={p.id} href={`/training/${p.slug}`}
              className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4 hover:shadow-sm transition group">
              <div className="flex-1">
                <p className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition">{p.title}</p>
                <p className="font-mono text-xs text-ink-soft mt-0.5">{p.completed} of {p.total} modules · {p.is_required ? 'Required' : 'Optional'}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 rounded-full bg-oatmeal/30">
                  <div className="h-full rounded-full bg-sienna transition-all" style={{ width: `${p.pct}%` }} />
                </div>
                <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wider ${
                  p.pct === 100 ? 'bg-sage/20 text-sage-deep' :
                  p.pct > 0 ? 'bg-sienna/10 text-sienna' :
                  'bg-oatmeal/30 text-ink-soft'
                }`}>
                  {p.pct === 100 ? 'Complete' : p.pct > 0 ? `${p.pct}%` : 'Not started'}
                </span>
              </div>
            </Link>
          ))}
          {otherPaths.length === 0 && !foundationPath && (
            <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-8 text-center">
              <p className="font-mono text-sm text-ink-soft">No training paths assigned yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/training"
          className="rounded-xl border border-rule bg-white/60 p-5 transition hover:shadow-sm hover:border-sienna/30 group">
          <h3 className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition mb-1">All Training</h3>
          <p className="font-mono text-xs text-ink-soft">Browse all your training paths</p>
        </Link>
        <Link href="/handbook"
          className="rounded-xl border border-rule bg-white/60 p-5 transition hover:shadow-sm hover:border-sienna/30 group">
          <h3 className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition mb-1">Handbook</h3>
          <p className="font-mono text-xs text-ink-soft">Policies, procedures, and guides</p>
        </Link>
        <Link href="/resources"
          className="rounded-xl border border-rule bg-white/60 p-5 transition hover:shadow-sm hover:border-sienna/30 group">
          <h3 className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition mb-1">Resources</h3>
          <p className="font-mono text-xs text-ink-soft">Forms, templates, and references</p>
        </Link>
      </div>
    </div>
  )
}
