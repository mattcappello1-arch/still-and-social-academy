import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Staff counts
  const { count: totalStaff } = await supabase
    .from('academy_staff')
    .select('*', { count: 'exact', head: true })

  const { count: activeStaff } = await supabase
    .from('academy_staff')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Training completion
  const { data: allProgress } = await supabase
    .from('academy_staff_module_progress')
    .select('status')

  const totalProgress = allProgress?.length ?? 0
  const completedProgress = allProgress?.filter((p) => p.status === 'completed').length ?? 0
  const completionRate = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0

  // Pending manager sign-offs
  const { count: pendingSignOffs } = await supabase
    .from('academy_staff_module_progress')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .is('manager_signoff_at', null)
    .not('completed_at', 'is', null)

  // Recent completions
  const { data: recentCompletions } = await supabase
    .from('academy_staff_module_progress')
    .select('completed_at, academy_staff!academy_staff_module_progress_staff_id_fkey(first_name, last_name), academy_training_modules!academy_staff_module_progress_module_id_fkey(title)')
    .eq('status', 'completed')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(8)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Academy Dashboard</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">Training overview at a glance</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-3">
        <a href="/admin/staff/new" className="flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna active:scale-[0.98]">
          Invite Staff
        </a>
        <a href="/admin/training" className="flex items-center gap-2 rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm tracking-wide text-ink transition hover:border-sienna/30 hover:text-sienna">
          Manage Training
        </a>
        <a href="/admin/signoffs" className="flex items-center gap-2 rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm tracking-wide text-ink transition hover:border-sienna/30 hover:text-sienna">
          Sign-Offs {(pendingSignOffs ?? 0) > 0 && <span className="rounded-full bg-sienna/10 px-1.5 py-0.5 text-[10px] text-sienna">{pendingSignOffs}</span>}
        </a>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Total Staff</p>
          <p className="font-serif text-3xl font-light text-ink">{totalStaff ?? 0}</p>
          <p className="mt-2 font-mono text-xs text-ink-soft">{activeStaff ?? 0} active</p>
        </div>
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Completion Rate</p>
          <p className="font-serif text-3xl font-light text-ink">{completionRate}%</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-oatmeal/30">
            <div className="h-full rounded-full bg-sienna transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Modules Done</p>
          <p className="font-serif text-3xl font-light text-ink">{completedProgress}</p>
          <p className="mt-2 font-mono text-xs text-ink-soft">of {totalProgress} assigned</p>
        </div>
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Pending Sign-Offs</p>
          <p className={`font-serif text-3xl font-light ${(pendingSignOffs ?? 0) > 0 ? 'text-sienna' : 'text-ink'}`}>{pendingSignOffs ?? 0}</p>
          <p className="mt-2 font-mono text-xs text-ink-soft">{(pendingSignOffs ?? 0) > 0 ? 'Awaiting review' : 'All clear'}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-4 font-serif text-xl font-light text-ink">Recent Activity</h2>
        {(recentCompletions?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            {recentCompletions!.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sage">&#10003;</span>
                  <div>
                    <p className="font-mono text-sm text-ink">
                      {c.academy_staff?.first_name} {c.academy_staff?.last_name}
                    </p>
                    <p className="font-mono text-[10px] text-ink-soft">{c.academy_training_modules?.title}</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-ink-soft">
                  {c.completed_at ? new Date(c.completed_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-8 text-center">
            <p className="font-mono text-sm text-ink-soft">No activity yet. Invite staff to get started.</p>
          </div>
        )}
      </section>
    </div>
  )
}
