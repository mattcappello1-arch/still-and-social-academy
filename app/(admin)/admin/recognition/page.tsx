import { createClient } from '@/lib/supabase/server'
import { AwardRecognitionForm } from './components'

const BADGE_ICONS: Record<string, string> = {
  'Guest Experience Champion': '\u2b50',
  'Team Player': '\ud83e\udd1d',
  'Leadership Potential': '\ud83c\udf1f',
  'Growth Mindset': '\ud83c\udf31',
  'Hospitality Excellence': '\ud83c\udfc6',
  'Above & Beyond': '\ud83d\ude80',
}

export default async function AdminRecognitionPage() {
  const supabase = await createClient()

  const { data: allStaff } = await supabase
    .from('academy_staff')
    .select('id, first_name, last_name')
    .eq('status', 'active')
    .order('first_name')

  const { data: recognitions } = await supabase
    .from('academy_recognition')
    .select('*, academy_staff!academy_recognition_staff_id_fkey(first_name, last_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Recognition</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">Award recognition badges to your team</p>
      </div>

      <div className="mb-8">
        <AwardRecognitionForm staffList={allStaff ?? []} />
      </div>

      {/* All recognition */}
      <section>
        <h2 className="mb-4 font-serif text-xl font-light text-ink">All Recognition</h2>
        {recognitions && recognitions.length > 0 ? (
          <div className="space-y-3">
            {recognitions.map((rec: any) => {
              const staffName = rec.academy_staff
                ? `${rec.academy_staff.first_name} ${rec.academy_staff.last_name}`
                : 'Unknown'
              const icon = BADGE_ICONS[rec.badge_type] ?? '\u2b50'
              return (
                <div key={rec.id} className="flex items-start gap-4 rounded-xl border border-rule bg-white/60 p-4">
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-ink">{staffName}</span>
                      <span className="rounded-full border border-sienna/20 bg-sienna/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-sienna">
                        {rec.badge_type}
                      </span>
                    </div>
                    {rec.description && (
                      <p className="mt-1 font-mono text-xs text-ink-soft">{rec.description}</p>
                    )}
                    <p className="mt-1 font-mono text-[10px] text-ink-soft">
                      {new Date(rec.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
            <p className="font-mono text-sm text-ink-soft">No recognition awarded yet. Give your first one above.</p>
          </div>
        )}
      </section>
    </div>
  )
}
