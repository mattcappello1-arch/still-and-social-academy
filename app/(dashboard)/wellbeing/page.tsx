import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckinForm } from './components'

const MOOD_META: Record<number, { emoji: string; label: string; cls: string }> = {
  5: { emoji: '\ud83d\ude0a', label: 'Thriving', cls: 'bg-sage/10 text-sage-deep' },
  4: { emoji: '\ud83d\ude42', label: 'Good', cls: 'bg-olive/10 text-olive' },
  3: { emoji: '\ud83d\ude10', label: 'Okay', cls: 'bg-oatmeal/20 text-oatmeal-dk' },
  2: { emoji: '\ud83d\ude15', label: 'Struggling', cls: 'bg-sienna/10 text-sienna' },
  1: { emoji: '\ud83d\ude1f', label: 'Need Support', cls: 'bg-rosewood/10 text-rosewood' },
}

export default async function WellbeingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if checked in this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { data: thisMonth } = await supabase
    .from('academy_wellbeing_checkins')
    .select('*')
    .eq('staff_id', user.id)
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd)
    .limit(1)

  const hasCheckedIn = thisMonth && thisMonth.length > 0
  const currentCheckin = hasCheckedIn ? thisMonth[0] : null

  // Get history
  const { data: history } = await supabase
    .from('academy_wellbeing_checkins')
    .select('*')
    .eq('staff_id', user.id)
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Wellbeing Check-in</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Monthly check-in to help us support your wellbeing
        </p>
      </div>

      {/* Current month status */}
      {hasCheckedIn && currentCheckin ? (
        <div className="mb-8 rounded-xl border border-sage/20 bg-sage/5 p-6 text-center">
          <p className="font-mono text-xs tracking-wider text-sage-deep uppercase mb-3">
            You have checked in this month
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">{MOOD_META[currentCheckin.rating]?.emoji}</span>
            <span className="font-serif text-xl font-light text-ink">
              {MOOD_META[currentCheckin.rating]?.label}
            </span>
          </div>
          {currentCheckin.comments && (
            <p className="mt-3 font-mono text-sm text-ink-soft italic">
              &ldquo;{currentCheckin.comments}&rdquo;
            </p>
          )}
          <p className="mt-3 font-mono text-[10px] text-ink-soft">
            Submitted {new Date(currentCheckin.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      ) : (
        <div className="mb-8">
          <CheckinForm />
        </div>
      )}

      {/* History */}
      {history && history.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-xl font-light text-ink">Your Check-in History</h2>
          <div className="space-y-2">
            {history.map((checkin: any) => {
              const mood = MOOD_META[checkin.rating] ?? MOOD_META[3]
              return (
                <div key={checkin.id} className="flex items-center gap-4 rounded-xl border border-rule bg-white/60 p-4">
                  <span className="text-xl">{mood.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${mood.cls}`}>
                        {mood.label}
                      </span>
                      <span className="font-mono text-xs text-ink-soft">
                        {new Date(checkin.created_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    {checkin.comments && (
                      <p className="mt-1 font-mono text-xs text-ink-soft">{checkin.comments}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
