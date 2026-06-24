import { createClient } from '@/lib/supabase/server'
import { CreateReviewForm, ManagerReviewForm } from './components'

const REVIEW_TYPE_LABELS: Record<string, string> = {
  performance: 'Performance Review',
  probation_30: '30-Day Probation',
  probation_60: '60-Day Probation',
  probation_90: '90-Day Probation',
  quick_note: 'Manager Note',
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  employee_pending: { label: 'Employee Pending', cls: 'bg-sienna/10 text-sienna' },
  manager_pending: { label: 'Manager Pending', cls: 'bg-oatmeal/20 text-oatmeal-dk' },
  completed: { label: 'Completed', cls: 'bg-sage/10 text-sage-deep' },
}

export default async function AdminReviewsPage() {
  const supabase = await createClient()

  // Fetch all staff for the create form
  const { data: allStaff } = await supabase
    .from('academy_staff')
    .select('id, first_name, last_name, start_date, status')
    .eq('status', 'active')
    .order('first_name')

  // Fetch all reviews with staff info
  const { data: reviews } = await supabase
    .from('academy_reviews')
    .select('*, academy_staff!academy_reviews_staff_id_fkey(first_name, last_name)')
    .order('created_at', { ascending: false })

  // Compute probation due staff
  const now = new Date()
  const probationStaff = (allStaff ?? [])
    .filter((s: any) => s.start_date)
    .map((s: any) => {
      const startDate = new Date(s.start_date)
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const milestones: { day: number; type: string; label: string }[] = []

      if (daysSinceStart <= 100) {
        // Check which milestones are upcoming or overdue
        const checkpoints = [
          { day: 30, type: 'probation_30', label: '30-Day Review' },
          { day: 60, type: 'probation_60', label: '60-Day Review' },
          { day: 90, type: 'probation_90', label: '90-Day Review' },
        ]

        // Check existing reviews for this staff
        const staffReviews = (reviews ?? []).filter((r: any) => r.staff_id === s.id)

        for (const cp of checkpoints) {
          const hasReview = staffReviews.some((r: any) => r.review_type === cp.type)
          if (!hasReview && daysSinceStart >= cp.day - 7) {
            // Due within 7 days or overdue
            milestones.push(cp)
          }
        }
      }

      return { ...s, daysSinceStart, milestones }
    })
    .filter((s: any) => s.milestones.length > 0)

  // Filter out quick_note from the reviews list
  const formalReviews = (reviews ?? []).filter((r: any) => r.review_type !== 'quick_note')

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Reviews Management</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">Create and manage staff performance reviews</p>
      </div>

      {/* Probation Due Section */}
      {probationStaff.length > 0 && (
        <div className="mb-8 rounded-xl border border-sienna/30 bg-sienna/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sienna">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <h2 className="font-mono text-sm font-medium text-sienna uppercase tracking-wider">Probation Reviews Due</h2>
          </div>
          <div className="space-y-3">
            {probationStaff.map((s: any) => (
              <div key={s.id} className="rounded-lg border border-rule bg-white/80 p-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-medium text-ink">{s.first_name} {s.last_name}</p>
                  <p className="font-mono text-xs text-ink-soft">
                    Day {s.daysSinceStart} — Started {new Date(s.start_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {s.milestones.map((m: any) => (
                    <span
                      key={m.type}
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wider ${
                        s.daysSinceStart > m.day ? 'bg-rosewood/10 text-rosewood' : 'bg-sienna/10 text-sienna'
                      }`}
                    >
                      {s.daysSinceStart > m.day ? `${m.label} Overdue` : `${m.label} Due`}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <CreateReviewForm staffList={(allStaff ?? []).map((s: any) => ({ id: s.id, first_name: s.first_name, last_name: s.last_name }))} />
      </div>

      {/* Reviews list */}
      {formalReviews.length > 0 ? (
        <div className="space-y-4">
          {formalReviews.map((review: any) => {
            const staffName = review.academy_staff
              ? `${review.academy_staff.first_name} ${review.academy_staff.last_name}`
              : 'Unknown'
            const statusMeta = STATUS_LABELS[review.status] ?? STATUS_LABELS.employee_pending
            const isProbation = review.review_type?.startsWith('probation_')

            return (
              <div key={review.id} className="rounded-xl border border-rule bg-white/60 overflow-hidden">
                <div className="flex items-center justify-between border-b border-rule px-5 py-4">
                  <div>
                    <p className="font-mono text-sm font-medium text-ink">{staffName}</p>
                    <p className="mt-0.5 font-mono text-xs text-ink-soft">
                      {REVIEW_TYPE_LABELS[review.review_type] ?? 'Review'} &middot;{' '}
                      {new Date(review.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wider ${statusMeta.cls}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <div className="p-5">
                  {review.status === 'manager_pending' && (
                    <div>
                      {/* Show employee reflection */}
                      <div className="mb-6 rounded-lg border border-rule bg-cream-soft/30 p-4">
                        <p className="mb-3 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Employee Reflection</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Proud of</p>
                            <p className="font-mono text-sm text-ink">{review.employee_proud_of}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Learned</p>
                            <p className="font-mono text-sm text-ink">{review.employee_learned}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Improve</p>
                            <p className="font-mono text-sm text-ink">{review.employee_improve}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Support needed</p>
                            <p className="font-mono text-sm text-ink">{review.employee_support_needed}</p>
                          </div>
                        </div>
                      </div>
                      <ManagerReviewForm reviewId={review.id} isProbation={isProbation} />
                    </div>
                  )}

                  {review.status === 'employee_pending' && (
                    <p className="font-mono text-sm text-ink-soft">Waiting for employee to complete their reflection.</p>
                  )}

                  {review.status === 'completed' && (
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div>
                        <p className="mb-3 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Employee Reflection</p>
                        <div className="space-y-2">
                          <div><p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase">Proud of</p><p className="font-mono text-sm text-ink">{review.employee_proud_of}</p></div>
                          <div><p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase">Learned</p><p className="font-mono text-sm text-ink">{review.employee_learned}</p></div>
                          <div><p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase">Improve</p><p className="font-mono text-sm text-ink">{review.employee_improve}</p></div>
                          <div><p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase">Support</p><p className="font-mono text-sm text-ink">{review.employee_support_needed}</p></div>
                        </div>
                      </div>
                      <div>
                        <p className="mb-3 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Manager Feedback</p>
                        <div className="space-y-2">
                          <div><p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase">Strengths</p><p className="font-mono text-sm text-ink">{review.manager_strengths}</p></div>
                          <div><p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase">Development</p><p className="font-mono text-sm text-ink">{review.manager_areas_for_development}</p></div>
                          <div><p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase">Training</p><p className="font-mono text-sm text-ink">{review.manager_training_recommendations}</p></div>
                          <div><p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase">Opportunities</p><p className="font-mono text-sm text-ink">{review.manager_future_opportunities}</p></div>
                          {review.probation_outcome && (
                            <div className="rounded-lg border border-rule bg-cream-soft/50 p-3">
                              <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase">Probation Outcome</p>
                              <p className="font-mono text-sm font-medium text-ink capitalize">{review.probation_outcome.replace(/_/g, ' ')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">No reviews yet. Create one above to get started.</p>
        </div>
      )}
    </div>
  )
}
