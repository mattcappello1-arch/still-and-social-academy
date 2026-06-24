import { createClient } from '@/lib/supabase/server'
import { FollowUpForm } from './components'

const MOOD_META: Record<number, { emoji: string; label: string; cls: string }> = {
  5: { emoji: '\ud83d\ude0a', label: 'Thriving', cls: 'bg-sage/10 text-sage-deep' },
  4: { emoji: '\ud83d\ude42', label: 'Good', cls: 'bg-olive/10 text-olive' },
  3: { emoji: '\ud83d\ude10', label: 'Okay', cls: 'bg-oatmeal/20 text-oatmeal-dk' },
  2: { emoji: '\ud83d\ude15', label: 'Struggling', cls: 'bg-sienna/10 text-sienna' },
  1: { emoji: '\ud83d\ude1f', label: 'Need Support', cls: 'bg-rosewood/10 text-rosewood' },
}

export default async function AdminWellbeingPage() {
  const supabase = await createClient()

  const { data: checkins } = await supabase
    .from('academy_wellbeing_checkins')
    .select('*, academy_staff!academy_wellbeing_checkins_staff_id_fkey(first_name, last_name)')
    .order('created_at', { ascending: false })

  // Mood trends
  const moodCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  const recentCheckins = (checkins ?? []).slice(0, 50)
  for (const c of recentCheckins) {
    const r = c.rating as keyof typeof moodCounts
    if (r in moodCounts) moodCounts[r]++
  }
  const totalRecent = recentCheckins.length || 1

  const flagged = (checkins ?? []).filter((c: any) => c.rating <= 2)

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Wellbeing Dashboard</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">Monitor team wellbeing and follow up on concerns</p>
      </div>

      {/* Mood trends */}
      <div className="mb-8 rounded-xl border border-rule bg-white/60 p-5">
        <p className="mb-4 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Team Mood Trends</p>
        <div className="flex items-end gap-4">
          {([5, 4, 3, 2, 1] as const).map((rating) => {
            const mood = MOOD_META[rating]
            const pct = Math.round((moodCounts[rating] / totalRecent) * 100)
            return (
              <div key={rating} className="flex-1 text-center">
                <div className="mb-2 text-xl">{mood.emoji}</div>
                <div className="mx-auto h-24 w-full max-w-[40px] rounded-t-lg bg-oatmeal/20 relative overflow-hidden">
                  <div
                    className={`absolute bottom-0 w-full rounded-t-lg transition-all ${
                      rating >= 4 ? 'bg-sage' : rating === 3 ? 'bg-oatmeal-dk' : 'bg-rosewood'
                    }`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 font-mono text-[10px] text-ink-soft">{moodCounts[rating]}</p>
                <p className="font-mono text-[10px] text-ink-soft">{mood.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Flagged responses */}
      {flagged.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-serif text-xl font-light text-rosewood">Needs Attention</h2>
          <div className="space-y-3">
            {flagged.map((checkin: any) => {
              const mood = MOOD_META[checkin.rating] ?? MOOD_META[3]
              const staffName = checkin.academy_staff
                ? `${checkin.academy_staff.first_name} ${checkin.academy_staff.last_name}`
                : 'Unknown'
              return (
                <div key={checkin.id} className="rounded-xl border border-rosewood/20 bg-rosewood/5 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{mood.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-ink">{staffName}</span>
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${mood.cls}`}>{mood.label}</span>
                        <span className="font-mono text-xs text-ink-soft">
                          {new Date(checkin.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      {checkin.comments && (
                        <p className="mt-1 font-mono text-xs text-ink-soft">{checkin.comments}</p>
                      )}
                      {checkin.follow_up_notes ? (
                        <div className="mt-2 rounded-lg bg-white/60 border border-rule p-2">
                          <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-0.5">Follow-up</p>
                          <p className="font-mono text-xs text-ink">{checkin.follow_up_notes}</p>
                        </div>
                      ) : (
                        <FollowUpForm checkinId={checkin.id} />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All check-ins */}
      <section>
        <h2 className="mb-4 font-serif text-xl font-light text-ink">All Check-ins</h2>
        {checkins && checkins.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-rule bg-white/60">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rule">
                  <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">Staff</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">Mood</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">Date</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">Comments</th>
                </tr>
              </thead>
              <tbody>
                {checkins.map((checkin: any) => {
                  const mood = MOOD_META[checkin.rating] ?? MOOD_META[3]
                  const staffName = checkin.academy_staff
                    ? `${checkin.academy_staff.first_name} ${checkin.academy_staff.last_name}`
                    : 'Unknown'
                  return (
                    <tr key={checkin.id} className="border-b border-rule transition last:border-b-0 hover:bg-cream-soft/30">
                      <td className="px-4 py-3 font-mono text-sm text-ink">{staffName}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <span>{mood.emoji}</span>
                          <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${mood.cls}`}>{mood.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                        {new Date(checkin.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-soft max-w-xs truncate">
                        {checkin.comments || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
            <p className="font-mono text-sm text-ink-soft">No check-ins yet.</p>
          </div>
        )}
      </section>
    </div>
  )
}
