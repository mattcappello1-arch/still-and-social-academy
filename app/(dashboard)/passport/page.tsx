import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRoleLabel, getDepartment, getDepartmentLabel } from '@/lib/utils/roles'
import type { Role, Department } from '@/lib/utils/roles'
import Link from 'next/link'
import { effectiveStatus, STATUS_META } from '@/lib/status'

export default async function PassportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: staff } = await supabase.from('academy_staff').select('*').eq('id', user.id).single()

  // Get assigned training paths
  const { data: rolePaths } = staff
    ? await supabase
        .from('academy_role_training_paths')
        .select('path_id, is_required, sort_order, academy_training_paths(id, title, slug, department)')
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
    .select('module_id, status, completed_at')
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

  const overallTotal = pathProgress.reduce((s, p) => s + p.total, 0)
  const overallCompleted = pathProgress.reduce((s, p) => s + p.completed, 0)
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

  // Completed paths count
  const completedPaths = pathProgress.filter(p => p.pct === 100).length

  // Get signing assignments
  const { data: signingDocs } = await supabase
    .from('academy_signing_assignments')
    .select('id, status, expires_at, signed_at, academy_signing_documents(title)')
    .eq('staff_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const pendingSigningCount = (signingDocs ?? []).filter((d: any) => {
    const s = effectiveStatus(d)
    return s === 'sent' || s === 'viewed'
  }).length

  // Recent completions
  const recentCompletions = (progress ?? [])
    .filter((p: any) => p.status === 'completed' && p.completed_at)
    .sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    .slice(0, 5)

  const recentWithNames = recentCompletions.map((p: any) => {
    const mod = (allModules ?? []).find((m: any) => m.id === p.module_id)
    return { ...p, module_title: mod?.title ?? 'Module' }
  })

  const role = (staff?.role ?? 'waiter') as Role
  const department = getDepartment(role)

  const deptColors: Record<Department, string> = {
    foh: 'bg-sienna/10 text-sienna border-sienna/20',
    kitchen: 'bg-olive/10 text-olive border-olive/20',
    leadership: 'bg-rosewood/10 text-rosewood border-rosewood/20',
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">
          {staff ? `Welcome, ${staff.first_name}` : 'Welcome to the Academy'}
        </h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">Your staff passport and training overview</p>
      </div>

      {/* Role badges */}
      {staff && (
        <div className="mb-8 flex flex-wrap gap-2">
          <span className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs tracking-wide ${deptColors[department]}`}>
            {getDepartmentLabel(department)}
          </span>
          <span className="inline-flex items-center rounded-full border border-rule bg-white/60 px-3 py-1 font-mono text-xs tracking-wide text-ink-soft">
            {getRoleLabel(role)}
          </span>
          <span className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs tracking-wide ${
            staff.status === 'active' ? 'border-sage/20 bg-sage/10 text-sage' : 'border-rule bg-cream-soft text-ink-soft'
          }`}>
            {staff.status}
          </span>
        </div>
      )}

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Overall Progress</p>
          <p className="font-serif text-3xl font-light text-ink">{overallPct}%</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-oatmeal/30">
            <div className="h-full rounded-full bg-sienna transition-all" style={{ width: `${overallPct}%` }} />
          </div>
          <p className="mt-2 font-mono text-xs text-ink-soft">{overallCompleted} of {overallTotal} modules</p>
        </div>
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Paths Completed</p>
          <p className="font-serif text-3xl font-light text-ink">{completedPaths}</p>
          <p className="mt-2 font-mono text-xs text-ink-soft">of {pathProgress.length} assigned</p>
        </div>
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Modules Done</p>
          <p className="font-serif text-3xl font-light text-ink">{overallCompleted}</p>
          <p className="mt-2 font-mono text-xs text-ink-soft">{overallTotal - overallCompleted} remaining</p>
        </div>
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Documents</p>
          <p className="font-serif text-3xl font-light text-ink">{pendingSigningCount}</p>
          <p className="mt-2 font-mono text-xs text-ink-soft">{pendingSigningCount > 0 ? 'Awaiting signature' : 'All signed'}</p>
        </div>
      </div>

      {/* Next up */}
      {nextModule && (
        <div className="mb-8 rounded-xl border border-sienna/20 bg-sienna/5 p-5">
          <p className="font-mono text-[10px] tracking-widest text-sienna uppercase mb-2">Continue Where You Left Off</p>
          <Link href={`/training/${nextModule.pathSlug}/${nextModule.slug}`}
            className="font-serif text-xl font-light text-ink hover:text-sienna transition">
            {nextModule.title} &rarr;
          </Link>
        </div>
      )}

      {/* Training paths */}
      <section className="mb-8">
        <h2 className="mb-4 font-serif text-xl font-light text-ink">Your Training Paths</h2>
        <div className="space-y-3">
          {pathProgress.map((p: any) => (
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
        </div>
      </section>

      {/* Achievements */}
      {completedPaths > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 font-serif text-xl font-light text-ink">Achievements</h2>
          <div className="flex flex-wrap gap-3">
            {pathProgress.filter(p => p.pct === 100).map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 rounded-full border border-sage/20 bg-sage/10 px-4 py-2">
                <span className="text-sage-deep">&#10003;</span>
                <span className="font-mono text-xs text-sage-deep">{p.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending documents */}
      {signingDocs && signingDocs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 font-serif text-xl font-light text-ink">Documents</h2>
          <div className="space-y-2">
            {signingDocs.map((d: any) => {
              const status = effectiveStatus(d)
              const meta = STATUS_META[status]
              return (
                <div key={d.id} className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4">
                  <span className="font-mono text-sm text-ink">{d.academy_signing_documents?.title}</span>
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${meta.cls}`}>
                    {meta.label}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Recent activity */}
      <section>
        <h2 className="mb-4 font-serif text-xl font-light text-ink">Recent Activity</h2>
        {recentWithNames.length > 0 ? (
          <div className="space-y-2">
            {recentWithNames.map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sage-deep">&#10003;</span>
                  <span className="font-mono text-sm text-ink">{r.module_title}</span>
                </div>
                <span className="font-mono text-xs text-ink-soft">
                  {new Date(r.completed_at).toLocaleDateString('en-AU')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-8 text-center">
            <p className="font-mono text-sm text-ink-soft">Complete your first training module to see activity here.</p>
          </div>
        )}
      </section>
    </div>
  )
}
