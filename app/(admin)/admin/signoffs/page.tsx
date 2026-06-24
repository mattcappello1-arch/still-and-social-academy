import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignOffList } from './components'

export default async function PendingSignOffsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = await createAdminClient()

  // Fetch all completed modules without manager sign-off
  const { data: pending } = await db
    .from('academy_staff_module_progress')
    .select('staff_id, module_id, completed_at, manager_signoff_at, manager_signoff_by')
    .eq('status', 'completed')
    .is('manager_signoff_at', null)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  if (!pending || pending.length === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-light text-ink mb-2">Pending Sign-Offs</h1>
        <p className="font-mono text-sm text-ink-soft mb-8">Module completions awaiting manager sign-off</p>
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage mx-auto mb-3">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
          </svg>
          <p className="font-mono text-sm text-ink-soft">All modules have been signed off.</p>
        </div>
      </div>
    )
  }

  // Get unique staff and module IDs
  const staffIds = [...new Set(pending.map(p => p.staff_id))]
  const moduleIds = [...new Set(pending.map(p => p.module_id))]

  // Fetch staff names
  const { data: staffList } = await db
    .from('academy_staff')
    .select('id, first_name, last_name')
    .in('id', staffIds)

  const staffMap = new Map((staffList ?? []).map((s: any) => [s.id, s]))

  // Fetch module details with path info
  const { data: moduleList } = await db
    .from('academy_training_modules')
    .select('id, title, academy_training_paths(title)')
    .in('id', moduleIds)

  const moduleMap = new Map((moduleList ?? []).map((m: any) => [m.id, m]))

  // Group by staff
  const grouped = new Map<string, { staff: any; modules: any[] }>()
  for (const item of pending) {
    const staff = staffMap.get(item.staff_id)
    const mod = moduleMap.get(item.module_id)
    if (!staff || !mod) continue

    if (!grouped.has(item.staff_id)) {
      grouped.set(item.staff_id, { staff, modules: [] })
    }
    grouped.get(item.staff_id)!.modules.push({
      moduleId: item.module_id,
      title: mod.title,
      pathTitle: (mod as any).academy_training_paths?.title ?? '',
      completedAt: item.completed_at,
    })
  }

  const groupedArray = Array.from(grouped.entries()).map(([staffId, data]) => ({
    staffId,
    staffName: `${data.staff.first_name} ${data.staff.last_name}`,
    modules: data.modules,
  }))

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-3xl font-light text-ink mb-2">Pending Sign-Offs</h1>
      <p className="font-mono text-sm text-ink-soft mb-8">
        {pending.length} module completion{pending.length !== 1 ? 's' : ''} awaiting sign-off
      </p>
      <SignOffList groups={groupedArray} />
    </div>
  )
}
