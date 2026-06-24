import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReflectionForm } from './components'

const REVIEW_TYPE_LABELS: Record<string, string> = {
  performance: 'Performance Review',
  probation_30: '30-Day Probation Review',
  probation_60: '60-Day Probation Review',
  probation_90: '90-Day Probation Review',
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  employee_pending: { label: 'Your Reflection Needed', cls: 'bg-sienna/10 text-sienna' },
  manager_pending: { label: 'Awaiting Manager', cls: 'bg-oatmeal/20 text-oatmeal-dk' },
  completed: { label: 'Completed', cls: 'bg-sage/10 text-sage-deep' },
}

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: reviews } = await supabase
    .from('academy_reviews')
    .select('*')
    .eq('staff_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Performance Reviews</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Your review history and reflections
        </p>
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review: any) => {
            const statusMeta = STATUS_LABELS[review.status] ?? STATUS_LABELS.employee_pending

            return (
              <div key={review.id} className="rounded-xl border border-rule bg-white/60 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-rule px-5 py-4">
                  <div>
                    <p className="font-mono text-sm font-medium text-ink">
                      {REVIEW_TYPE_LABELS[review.review_type] ?? 'Review'}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-ink-soft">
                      {new Date(review.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wider ${statusMeta.cls}`}>
                    {statusMeta.label}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  {review.status === 'employee_pending' && (
                    <ReflectionForm reviewId={review.id} />
                  )}

                  {(review.status === 'manager_pending' || review.status === 'completed') && (
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Employee section */}
                      <div>
                        <p className="mb-3 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Your Reflection</p>
                        <div className="space-y-3">
                          <div>
                            <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Proud of</p>
                            <p className="font-mono text-sm text-ink">{review.employee_proud_of}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Learned</p>
                            <p className="font-mono text-sm text-ink">{review.employee_learned}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Want to improve</p>
                            <p className="font-mono text-sm text-ink">{review.employee_improve}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Support needed</p>
                            <p className="font-mono text-sm text-ink">{review.employee_support_needed}</p>
                          </div>
                        </div>
                      </div>

                      {/* Manager section */}
                      {review.status === 'completed' && (
                        <div>
                          <p className="mb-3 font-mono text-xs font-medium tracking-wider text-ink-soft uppercase">Manager Feedback</p>
                          <div className="space-y-3">
                            <div>
                              <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Strengths</p>
                              <p className="font-mono text-sm text-ink">{review.manager_strengths}</p>
                            </div>
                            <div>
                              <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Areas for Development</p>
                              <p className="font-mono text-sm text-ink">{review.manager_areas_for_development}</p>
                            </div>
                            <div>
                              <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Training Recommendations</p>
                              <p className="font-mono text-sm text-ink">{review.manager_training_recommendations}</p>
                            </div>
                            <div>
                              <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Future Opportunities</p>
                              <p className="font-mono text-sm text-ink">{review.manager_future_opportunities}</p>
                            </div>
                            {review.manager_additional_notes && (
                              <div>
                                <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Additional Notes</p>
                                <p className="font-mono text-sm text-ink">{review.manager_additional_notes}</p>
                              </div>
                            )}
                            {review.probation_outcome && (
                              <div className="mt-3 rounded-lg border border-rule bg-cream-soft/50 p-3">
                                <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Probation Outcome</p>
                                <p className="font-mono text-sm font-medium text-ink capitalize">
                                  {review.probation_outcome.replace(/_/g, ' ')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {review.status === 'manager_pending' && (
                        <div className="flex items-center justify-center rounded-lg border border-dashed border-oatmeal bg-cream-soft/30 p-6">
                          <p className="font-mono text-sm text-ink-soft text-center">
                            Your manager will complete their feedback soon.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 text-oatmeal-dk">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-mono text-sm text-ink-soft">No reviews yet. Your manager will create a review when it is time.</p>
        </div>
      )}
    </div>
  )
}
