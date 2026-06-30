import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRoleLabel } from '@/lib/utils/roles'
import type { Role } from '@/lib/utils/roles'
import Link from 'next/link'

export default async function PassportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: staff } = await supabase.from('academy_staff').select('*').eq('id', user.id).single()

  // Get assigned training paths
  const { data: rolePaths } = staff
    ? await supabase
        .from('academy_role_training_paths')
        .select('path_id, is_required, sort_order, academy_training_paths(id, title, slug)')
        .eq('role', staff.role)
        .order('sort_order')
    : { data: null }

  // Get ALL modules for assigned paths
  const pathIds = (rolePaths ?? []).map((rp: any) => rp.path_id)
  const { data: allModules } = pathIds.length
    ? await supabase.from('academy_training_modules').select('id, path_id, title, slug').in('path_id', pathIds)
    : { data: [] }

  // Get user progress
  const { data: progress } = await supabase
    .from('academy_staff_module_progress')
    .select('module_id, status, completed_at, manager_signoff_at')
    .eq('staff_id', user.id)

  const progressMap = new Map((progress ?? []).map((p: any) => [p.module_id, p]))

  // Calculate per-path progress
  const pathProgress = (rolePaths ?? []).map((rp: any) => {
    const path = rp.academy_training_paths
    const pathModules = (allModules ?? []).filter((m: any) => m.path_id === rp.path_id)
    const completed = pathModules.filter((m: any) => progressMap.get(m.id)?.status === 'completed').length
    const total = pathModules.length
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    return { ...path, completed, total, pct, is_required: rp.is_required }
  })

  const overallTotal = pathProgress.reduce((s: number, p: any) => s + p.total, 0)
  const overallCompleted = pathProgress.reduce((s: number, p: any) => s + p.completed, 0)
  const overallPct = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0

  // Find next module to complete
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

  // Modules awaiting sign-off
  const awaitingSignoff = (progress ?? []).filter((p: any) =>
    p.status === 'completed' && !p.manager_signoff_at
  )
  const awaitingWithNames = awaitingSignoff.map((p: any) => {
    const mod = (allModules ?? []).find((m: any) => m.id === p.module_id)
    return { ...p, module_title: mod?.title ?? 'Module' }
  })

  // Recent completions
  const recentCompletions = (progress ?? [])
    .filter((p: any) => p.status === 'completed' && p.completed_at)
    .sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    .slice(0, 5)
    .map((p: any) => {
      const mod = (allModules ?? []).find((m: any) => m.id === p.module_id)
      return { ...p, module_title: mod?.title ?? 'Module' }
    })

  // Completed paths = certificates earned
  const completedPaths = pathProgress.filter((p: any) => p.pct === 100)

  // Time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const role = (staff?.role ?? 'waiter') as Role

  return (
    <div className="mx-auto max-w-3xl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">
          {staff ? `${greeting}, ${staff.first_name}` : 'Welcome'}
        </h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          {getRoleLabel(role)} &middot; Still & Social Academy
        </p>
      </div>

      {/* Overall progress */}
      <div className="mb-8 rounded-xl border border-rule bg-white/60 p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">Overall Progress</p>
          <p className="font-serif text-2xl font-light text-ink">{overallPct}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-oatmeal/30">
          <div className="h-full rounded-full bg-sienna transition-all" style={{ width: `${overallPct}%` }} />
        </div>
        <p className="mt-2 font-mono text-xs text-ink-soft">
          {overallCompleted} of {overallTotal} modules completed
        </p>
      </div>

      {/* Continue where you left off */}
      {nextModule && (
        <Link href={`/training/${nextModule.pathSlug}/${nextModule.slug}`}
          className="mb-8 flex items-center justify-between rounded-xl border-2 border-sienna/20 bg-sienna/5 p-5 group transition hover:border-sienna/40">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-sienna uppercase mb-1">Continue Learning</p>
            <p className="font-serif text-lg font-light text-ink group-hover:text-sienna transition">{nextModule.title}</p>
          </div>
          <span className="flex items-center gap-2 rounded-lg bg-sienna px-4 py-2 font-mono text-xs font-medium tracking-wide text-cream">
            Continue
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </span>
        </Link>
      )}

      {/* Training Paths */}
      <section className="mb-8">
        <h2 className="mb-4 font-serif text-xl font-light text-ink">My Training</h2>
        <div className="space-y-3">
          {pathProgress.map((p: any) => (
            <Link key={p.id} href={`/training/${p.slug}`}
              className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4 hover:shadow-sm transition group">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition truncate">{p.title}</p>
                <p className="font-mono text-xs text-ink-soft mt-0.5">{p.completed} of {p.total} modules</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <div className="w-20 h-1.5 rounded-full bg-oatmeal/30 hidden sm:block">
                  <div className="h-full rounded-full bg-sienna transition-all" style={{ width: `${p.pct}%` }} />
                </div>
                <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wider ${
                  p.pct === 100 ? 'bg-sage/20 text-sage' :
                  p.pct > 0 ? 'bg-sienna/10 text-sienna' :
                  'bg-oatmeal/30 text-ink-soft'
                }`}>
                  {p.pct === 100 ? 'Complete' : p.pct > 0 ? `${p.pct}%` : 'Start'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Awaiting Sign-Off */}
      {awaitingWithNames.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 font-serif text-xl font-light text-ink">Awaiting Sign-Off</h2>
          <div className="space-y-2">
            {awaitingWithNames.map((m: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-oatmeal/40 bg-oatmeal/10 p-4">
                <span className="font-mono text-sm text-ink">{m.module_title}</span>
                <span className="rounded-full bg-oatmeal/30 px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-oatmeal-dk">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certificates Earned */}
      {completedPaths.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 font-serif text-xl font-light text-ink">Certificates</h2>
          <div className="space-y-2">
            {completedPaths.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-sage/20 bg-sage/5 p-4">
                <div className="flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  <span className="font-mono text-sm text-ink">{p.title}</span>
                </div>
                <a href={`/api/certificate/${p.slug}`} className="font-mono text-xs text-sienna hover:underline">
                  Download
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {recentCompletions.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-xl font-light text-ink">Recent Activity</h2>
          <div className="space-y-2">
            {recentCompletions.map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sage">&#10003;</span>
                  <span className="font-mono text-sm text-ink">{r.module_title}</span>
                </div>
                <span className="font-mono text-xs text-ink-soft">
                  {new Date(r.completed_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
