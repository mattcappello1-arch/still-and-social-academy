'use client'

import { useState, useTransition } from 'react'
import { resetStaffPassword } from '@/app/actions/auth'
import { managerSignOff } from '@/app/actions/training'

const SKILL_NAMES: Record<string, string> = {
  foh_service: 'Front of House Service',
  guest_experience: 'Guest Experience',
  pos_system: 'POS System',
  food_running: 'Food Running',
  bar_service: 'Bar Service',
  cocktail_making: 'Cocktail Making',
  opening_procedures: 'Opening Procedures',
  closing_procedures: 'Closing Procedures',
  kitchen_operations: 'Kitchen Operations',
  leadership: 'Leadership',
  team_training: 'Team Training',
}

const SKILL_LEVELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Not Started', color: 'bg-oatmeal/30' },
  1: { label: 'Beginner', color: 'bg-rosewood/40' },
  2: { label: 'Learning', color: 'bg-sienna/50' },
  3: { label: 'Confident', color: 'bg-olive/60' },
  4: { label: 'Trainer', color: 'bg-sage' },
}

const TABS = [
  { key: 'personal', label: 'Personal Info' },
  { key: 'training', label: 'Training' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'growth', label: 'Growth' },
  { key: 'recognition', label: 'Recognition' },
  { key: 'wellbeing', label: 'Wellbeing' },
  { key: 'documents', label: 'Documents' },
  { key: 'readiness', label: 'Readiness' },
  { key: 'talent', label: 'Talent' },
  { key: 'notes', label: 'Notes' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function StaffProfileTabs({
  staffId,
  staff,
  personalDetails,
  pathProgress,
  certifications,
  reviews,
  goals,
  skillLevels,
  recognition,
  achievements,
  wellbeingCheckins,
  signingDocs,
  shiftReadiness,
  talentTracking,
  updateTalentCategoryAction,
  addManagerNoteAction,
}: {
  staffId: string
  staff: any
  personalDetails: any
  pathProgress: any[]
  certifications: any[]
  reviews: any[]
  goals: any[]
  skillLevels: any[]
  recognition: any[]
  achievements: any[]
  wellbeingCheckins: any[]
  signingDocs: any[]
  shiftReadiness: any[]
  talentTracking: any
  updateTalentCategoryAction: (formData: FormData) => Promise<void>
  addManagerNoteAction: (formData: FormData) => Promise<void>
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('personal')

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1 border-b border-rule mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 font-mono text-xs tracking-wide transition border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-sienna text-sienna'
                : 'border-transparent text-ink-soft hover:text-ink hover:border-oatmeal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Personal Information */}
      {activeTab === 'personal' && (
        <PersonalInfoSection staff={staff} personalDetails={personalDetails} />
      )}

      {/* Training Progress */}
      {activeTab === 'training' && (
        <TrainingSection pathProgress={pathProgress} staffId={staffId} />
      )}

      {/* Certifications */}
      {activeTab === 'certifications' && (
        <CertificationsSection certifications={certifications} />
      )}

      {/* Performance Reviews */}
      {activeTab === 'reviews' && (
        <ReviewsSection reviews={reviews} />
      )}

      {/* Growth Journey */}
      {activeTab === 'growth' && (
        <GrowthSection goals={goals} skillLevels={skillLevels} />
      )}

      {/* Recognition */}
      {activeTab === 'recognition' && (
        <RecognitionSection recognition={recognition} achievements={achievements} />
      )}

      {/* Wellbeing */}
      {activeTab === 'wellbeing' && (
        <WellbeingSection checkins={wellbeingCheckins} />
      )}

      {/* Documents */}
      {activeTab === 'documents' && (
        <DocumentsSection signingDocs={signingDocs} />
      )}

      {/* Shift Readiness */}
      {activeTab === 'readiness' && (
        <ReadinessSection shiftReadiness={shiftReadiness} />
      )}

      {/* Talent Category */}
      {activeTab === 'talent' && (
        <TalentSection
          staffId={staffId}
          talentTracking={talentTracking}
          updateAction={updateTalentCategoryAction}
        />
      )}

      {/* Manager Notes */}
      {activeTab === 'notes' && (
        <NotesSection
          staffId={staffId}
          reviews={reviews}
          addNoteAction={addManagerNoteAction}
        />
      )}
    </div>
  )
}

/* ──────────────── Personal Info ──────────────── */
function PersonalInfoSection({ staff, personalDetails }: { staff: any; personalDetails: any }) {
  const pd = personalDetails || {}
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-cream-soft border border-rule rounded-xl p-5 space-y-3">
        <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Contact Information</h3>
        <InfoRow label="Email" value={staff.email} />
        <InfoRow label="Phone" value={staff.phone || '-'} />
        <InfoRow label="Start Date" value={staff.start_date || '-'} />
        <InfoRow label="Employment Type" value={staff.employment_type?.replace('_', ' ') || '-'} />
      </div>
      <div className="bg-cream-soft border border-rule rounded-xl p-5 space-y-3">
        <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Address</h3>
        <InfoRow label="Address" value={pd.address_line_1 || '-'} />
        {pd.address_line_2 && <InfoRow label="" value={pd.address_line_2} />}
        <InfoRow label="Suburb" value={pd.suburb || '-'} />
        <InfoRow label="State" value={pd.state || '-'} />
        <InfoRow label="Postcode" value={pd.postcode || '-'} />
      </div>
      <div className="bg-cream-soft border border-rule rounded-xl p-5 space-y-3">
        <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Emergency Contact</h3>
        <InfoRow label="Name" value={pd.emergency_contact_name || '-'} />
        <InfoRow label="Phone" value={pd.emergency_contact_phone || '-'} />
        <InfoRow label="Relationship" value={pd.emergency_contact_relationship || '-'} />
      </div>
      <div className="bg-cream-soft border border-rule rounded-xl p-5 space-y-3">
        <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Personal Details</h3>
        <InfoRow label="Date of Birth" value={pd.date_of_birth || '-'} />
        <InfoRow label="Country" value={pd.country || 'Australia'} />
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      {label && <span className="font-mono text-xs text-ink-soft">{label}</span>}
      <span className="font-mono text-sm text-ink capitalize">{value}</span>
    </div>
  )
}

/* ──────────────── Training ──────────────── */
function TrainingSection({ pathProgress, staffId }: { pathProgress: any[]; staffId: string }) {
  const [signedOff, setSignedOff] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()

  const handleSignOff = (moduleId: string) => {
    startTransition(async () => {
      const result = await managerSignOff(staffId, moduleId)
      if (result.success) {
        setSignedOff((prev) => new Set([...prev, moduleId]))
      }
    })
  }

  return (
    <div className="space-y-4">
      {pathProgress.length === 0 ? (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 p-8 text-center text-ink-soft text-sm">No training paths assigned.</div>
      ) : (
        pathProgress.map((p: any) => (
          <div key={p.id} className="bg-cream-soft border border-rule rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-rule flex items-center justify-between">
              <div>
                <h3 className="font-mono text-sm font-medium text-ink">{p.title}</h3>
                <span className="font-mono text-xs text-ink-soft">{p.completed} of {p.total} modules</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24">
                  <div className="w-full bg-oatmeal/30 rounded-full h-1.5">
                    <div className="bg-sienna h-1.5 rounded-full" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
                <span className="font-mono text-xs text-ink-soft w-10 text-right">{p.pct}%</span>
              </div>
            </div>
            {p.modules && p.modules.length > 0 && (
              <div className="divide-y divide-rule/50">
                {p.modules.map((mod: any) => {
                  const isCompleted = mod.status === 'completed'
                  const hasSO = mod.manager_signoff_at || signedOff.has(mod.id)
                  return (
                    <div key={mod.id} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isCompleted ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage shrink-0"><path d="M20 6L9 17l-5-5" /></svg>
                        ) : mod.status === 'in_progress' ? (
                          <div className="h-3.5 w-3.5 rounded-full border-2 border-sienna shrink-0" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border-2 border-oatmeal-dk/30 shrink-0" />
                        )}
                        <span className="font-mono text-xs text-ink truncate">{mod.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${
                          isCompleted ? 'bg-sage/10 text-sage' :
                          mod.status === 'in_progress' ? 'bg-sienna/10 text-sienna' :
                          'bg-oatmeal/30 text-ink-soft'
                        }`}>
                          {mod.status.replace('_', ' ')}
                        </span>
                        {isCompleted && hasSO && (
                          <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5 font-mono text-[10px] text-sage">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                            Signed off
                          </span>
                        )}
                        {isCompleted && !hasSO && (
                          <button
                            type="button"
                            onClick={() => handleSignOff(mod.id)}
                            disabled={pending}
                            className="rounded-lg border border-sienna/30 bg-sienna/5 px-3 py-1 font-mono text-[10px] font-medium text-sienna transition hover:bg-sienna/10 disabled:opacity-50"
                          >
                            Sign Off
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

/* ──────────────── Certifications ──────────────── */
function CertificationsSection({ certifications }: { certifications: any[] }) {
  return (
    <div className="bg-cream-soft border border-rule rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-rule">
        <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Certifications</h2>
      </div>
      {certifications.length === 0 ? (
        <div className="p-8 text-center text-ink-soft text-sm">No certifications recorded.</div>
      ) : (
        <div className="divide-y divide-rule">
          {certifications.map((cert: any) => {
            const expiry = getExpiryStatus(cert.expiry_date)
            return (
              <div key={cert.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-ink font-medium">{cert.title}</div>
                  <div className="text-xs text-ink-soft">{cert.cert_type}</div>
                </div>
                <div className="flex items-center gap-3">
                  {cert.expiry_date && (
                    <span className="font-mono text-xs text-ink-soft">
                      Expires {new Date(cert.expiry_date).toLocaleDateString('en-AU')}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider ${expiry.cls}`}>
                    {expiry.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ──────────────── Reviews ──────────────── */
function ReviewsSection({ reviews }: { reviews: any[] }) {
  const REVIEW_TYPE_LABELS: Record<string, string> = {
    performance: 'Performance Review',
    probation_30: '30-Day Probation',
    probation_60: '60-Day Probation',
    probation_90: '90-Day Probation',
    quick_note: 'Manager Note',
  }

  // Filter out quick notes for this section
  const formalReviews = reviews.filter((r) => r.review_type !== 'quick_note')

  return (
    <div className="space-y-4">
      {formalReviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-8 text-center">
          <p className="font-mono text-sm text-ink-soft">No reviews recorded yet.</p>
        </div>
      ) : (
        formalReviews.map((review: any) => (
          <div key={review.id} className="bg-cream-soft border border-rule rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-mono text-sm font-medium text-ink">
                  {REVIEW_TYPE_LABELS[review.review_type] || 'Review'}
                </span>
                <span className="font-mono text-xs text-ink-soft ml-3">
                  {new Date(review.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider ${
                review.status === 'completed' ? 'bg-sage/10 text-sage-deep' :
                review.status === 'manager_pending' ? 'bg-oatmeal/20 text-oatmeal-dk' :
                'bg-sienna/10 text-sienna'
              }`}>
                {review.status.replace('_', ' ')}
              </span>
            </div>
            {review.status === 'completed' && (
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                {review.manager_strengths && (
                  <div>
                    <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Strengths</p>
                    <p className="font-mono text-ink-soft">{review.manager_strengths}</p>
                  </div>
                )}
                {review.manager_areas_for_development && (
                  <div>
                    <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase mb-1">Development</p>
                    <p className="font-mono text-ink-soft">{review.manager_areas_for_development}</p>
                  </div>
                )}
                {review.probation_outcome && (
                  <div className="col-span-2 rounded-lg border border-rule bg-cream-soft/50 p-3">
                    <p className="font-mono text-[10px] tracking-wider text-ink-soft uppercase">Probation Outcome</p>
                    <p className="font-mono text-sm font-medium text-ink capitalize">{review.probation_outcome.replace(/_/g, ' ')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

/* ──────────────── Growth ──────────────── */
function GrowthSection({ goals, skillLevels }: { goals: any[]; skillLevels: any[] }) {
  const skillMap = new Map(skillLevels.map((s: any) => [s.skill_name, s.level]))

  return (
    <div className="space-y-6">
      {/* Goals */}
      <div className="bg-cream-soft border border-rule rounded-xl p-5">
        <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-4">Goals</h3>
        {goals.length === 0 ? (
          <p className="text-sm text-ink-soft">No goals set yet.</p>
        ) : (
          <div className="space-y-3">
            {goals.map((goal: any) => (
              <div key={goal.id} className="flex items-center justify-between border-b border-rule/50 pb-3 last:border-0">
                <div>
                  <p className={`font-mono text-sm ${goal.status === 'completed' ? 'text-sage-deep line-through' : 'text-ink'}`}>
                    {goal.title}
                  </p>
                  {goal.description && <p className="font-mono text-xs text-ink-soft mt-0.5">{goal.description}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider ${
                  goal.status === 'completed' ? 'bg-sage/10 text-sage-deep' : 'bg-sienna/10 text-sienna'
                }`}>
                  {goal.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Levels */}
      <div className="bg-cream-soft border border-rule rounded-xl p-5">
        <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-4">Skill Levels</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(SKILL_NAMES).map(([key, name]) => {
            const level = skillMap.get(key) ?? 0
            const info = SKILL_LEVELS[level]
            return (
              <div key={key} className="flex items-center justify-between rounded-lg border border-rule/50 bg-white/40 p-3">
                <span className="font-mono text-xs text-ink">{name}</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map((dot) => (
                      <div key={dot} className={`h-1.5 w-4 rounded-full ${dot <= level ? info.color : 'bg-oatmeal/20'}`} />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-ink-soft w-16 text-right">{info.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ──────────────── Recognition ──────────────── */
function RecognitionSection({ recognition, achievements }: { recognition: any[]; achievements: any[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-cream-soft border border-rule rounded-xl p-5">
        <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-4">Recognition Badges</h3>
        {recognition.length === 0 ? (
          <p className="text-sm text-ink-soft">No recognition awarded yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recognition.map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 rounded-lg border border-rule/50 bg-white/40 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sienna/10 text-sienna font-serif text-lg">
                  {r.badge_emoji || '⭐'}
                </div>
                <div>
                  <p className="font-mono text-sm text-ink">{r.badge_name}</p>
                  <p className="font-mono text-[10px] text-ink-soft">
                    {new Date(r.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {r.message && <p className="font-mono text-xs text-ink-soft mt-1">{r.message}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-cream-soft border border-rule rounded-xl p-5">
        <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-4">Achievements</h3>
        {achievements.length === 0 ? (
          <p className="text-sm text-ink-soft">No achievements unlocked yet.</p>
        ) : (
          <div className="space-y-2">
            {achievements.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 border-b border-rule/50 pb-2 last:border-0">
                <span className="text-lg">{a.badge_emoji || '🏆'}</span>
                <div>
                  <p className="font-mono text-sm text-ink">{a.title}</p>
                  <p className="font-mono text-[10px] text-ink-soft">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ──────────────── Wellbeing ──────────────── */
function WellbeingSection({ checkins }: { checkins: any[] }) {
  return (
    <div className="bg-cream-soft border border-rule rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-rule">
        <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Wellbeing Check-ins (Last 6 Months)</h2>
      </div>
      {checkins.length === 0 ? (
        <div className="p-8 text-center text-ink-soft text-sm">No wellbeing check-ins recorded.</div>
      ) : (
        <div className="divide-y divide-rule">
          {checkins.map((ci: any) => {
            const rating = ci.rating ?? ci.mood_rating ?? 0
            const ratingColor = rating <= 2 ? 'bg-rosewood/10 text-rosewood' : rating <= 3 ? 'bg-sienna/10 text-sienna' : 'bg-sage/10 text-sage-deep'
            return (
              <div key={ci.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm text-ink">
                    {new Date(ci.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {ci.notes && <p className="font-mono text-xs text-ink-soft mt-1">{ci.notes}</p>}
                  {ci.follow_up_needed && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-rosewood/10 text-rosewood">
                      Follow-up needed
                    </span>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full font-mono text-sm font-medium ${ratingColor}`}>
                  {rating}/5
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ──────────────── Documents ──────────────── */
function DocumentsSection({ signingDocs }: { signingDocs: any[] }) {
  return (
    <div className="bg-cream-soft border border-rule rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-rule">
        <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Documents</h2>
      </div>
      {signingDocs.length === 0 ? (
        <div className="p-8 text-center text-ink-soft text-sm">No documents assigned yet.</div>
      ) : (
        <div className="divide-y divide-rule">
          {signingDocs.map((d: any) => (
            <div key={d.id} className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-ink">{d.academy_signing_documents?.title}</div>
                <div className="text-xs text-ink-soft">{d.academy_signing_documents?.doc_type}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                d.status === 'signed' ? 'bg-sage/20 text-sage-deep' :
                d.status === 'viewed' ? 'bg-olive/10 text-olive' :
                'bg-sienna/10 text-sienna'
              }`}>
                {d.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ──────────────── Shift Readiness ──────────────── */
function ReadinessSection({ shiftReadiness }: { shiftReadiness: any[] }) {
  return (
    <div className="bg-cream-soft border border-rule rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-rule">
        <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Shift Readiness</h2>
      </div>
      {shiftReadiness.length === 0 ? (
        <div className="p-8 text-center text-ink-soft text-sm">No shift readiness records.</div>
      ) : (
        <div className="divide-y divide-rule">
          {shiftReadiness.map((sr: any) => (
            <div key={sr.id} className="px-5 py-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-sm text-ink">
                  {new Date(sr.created_at).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                {sr.shift_type && (
                  <span className="ml-2 font-mono text-xs text-ink-soft capitalize">{sr.shift_type}</span>
                )}
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider ${
                sr.status === 'ready' ? 'bg-sage/10 text-sage-deep' :
                sr.status === 'partial' ? 'bg-sienna/10 text-sienna' :
                'bg-oatmeal/20 text-ink-soft'
              }`}>
                {sr.status || 'recorded'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ──────────────── Talent Category ──────────────── */
function TalentSection({
  staffId,
  talentTracking,
  updateAction,
}: {
  staffId: string
  talentTracking: any
  updateAction: (formData: FormData) => Promise<void>
}) {
  const categories = [
    { value: 'rising_star', label: 'Rising Star', desc: 'High potential, rapid growth' },
    { value: 'solid_performer', label: 'Solid Performer', desc: 'Consistent and reliable' },
    { value: 'emerging', label: 'Emerging', desc: 'Growing into the role' },
    { value: 'needs_support', label: 'Needs Support', desc: 'Requires additional guidance' },
    { value: 'at_risk', label: 'At Risk', desc: 'Performance concerns' },
  ]

  return (
    <div className="bg-cream-soft border border-rule rounded-xl p-5">
      <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-4">Talent Category</h3>
      <form action={updateAction}>
        <input type="hidden" name="staff_id" value={staffId} />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          {categories.map((cat) => (
            <label
              key={cat.value}
              className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${
                talentTracking?.category === cat.value
                  ? 'border-sienna bg-sienna/5'
                  : 'border-rule bg-white/40 hover:border-sienna/30'
              }`}
            >
              <input
                type="radio"
                name="category"
                value={cat.value}
                defaultChecked={talentTracking?.category === cat.value}
                className="mt-1 accent-sienna"
              />
              <div>
                <p className="font-mono text-sm text-ink">{cat.label}</p>
                <p className="font-mono text-[10px] text-ink-soft">{cat.desc}</p>
              </div>
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="rounded-lg bg-charcoal px-4 py-2 font-mono text-xs font-medium tracking-wide text-cream transition hover:bg-sienna"
        >
          Update Category
        </button>
      </form>
    </div>
  )
}

/* ──────────────── Manager Notes ──────────────── */
function NotesSection({
  staffId,
  reviews,
  addNoteAction,
}: {
  staffId: string
  reviews: any[]
  addNoteAction: (formData: FormData) => Promise<void>
}) {
  const notes = reviews.filter((r) => r.review_type === 'quick_note')

  return (
    <div className="space-y-6">
      <form action={addNoteAction} className="bg-cream-soft border border-rule rounded-xl p-5">
        <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-3">Add Manager Note</h3>
        <input type="hidden" name="staff_id" value={staffId} />
        <textarea
          name="note"
          required
          rows={3}
          placeholder="Add a note about this staff member..."
          className="w-full rounded-lg border border-rule bg-white/60 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none resize-none mb-3"
        />
        <button
          type="submit"
          className="rounded-lg bg-charcoal px-4 py-2 font-mono text-xs font-medium tracking-wide text-cream transition hover:bg-sienna"
        >
          Save Note
        </button>
      </form>

      {notes.length > 0 && (
        <div className="space-y-3">
          {notes.map((note: any) => (
            <div key={note.id} className="bg-cream-soft border border-rule rounded-xl p-5">
              <p className="font-mono text-xs text-ink-soft mb-2">
                {new Date(note.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="font-mono text-sm text-ink">{note.manager_strengths}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ──────────────── Reset Password ──────────────── */
export function ResetPasswordForm({ staffId }: { staffId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: boolean }>({})

  const handleSubmit = (formData: FormData) => {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm_password') as string

    if (password !== confirm) {
      setResult({ error: 'Passwords do not match' })
      return
    }
    if (password.length < 6) {
      setResult({ error: 'Password must be at least 6 characters' })
      return
    }

    startTransition(async () => {
      const res = await resetStaffPassword(staffId, password)
      setResult(res as { error?: string; success?: boolean })
      if ((res as any)?.success) {
        setShowForm(false)
      }
    })
  }

  return (
    <div className="bg-cream-soft border border-rule rounded-xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Account Security</h3>
        <button
          type="button"
          onClick={() => { setShowForm(!showForm); setResult({}) }}
          className="rounded-lg border border-rule px-3 py-1.5 font-mono text-xs text-ink-soft transition hover:border-sienna/30 hover:text-sienna"
        >
          {showForm ? 'Cancel' : 'Reset Password'}
        </button>
      </div>

      {showForm && (
        <form action={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">New Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-rule bg-white/60 px-3 py-2 font-mono text-sm text-ink focus:border-sienna/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="block mb-1 font-mono text-[10px] tracking-wider text-ink-soft uppercase">Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              required
              minLength={6}
              className="w-full rounded-lg border border-rule bg-white/60 px-3 py-2 font-mono text-sm text-ink focus:border-sienna/30 focus:outline-none"
            />
          </div>
          {result?.error && <p className="font-mono text-xs text-rosewood">{result.error}</p>}
          {result?.success && <p className="font-mono text-xs text-sage-deep">Password reset successfully.</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-charcoal px-4 py-2 font-mono text-xs font-medium tracking-wide text-cream transition hover:bg-sienna disabled:opacity-50"
          >
            {pending ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  )
}

/* ──────────────── Helpers ──────────────── */
function getExpiryStatus(expiryDate: string | null): { label: string; cls: string } {
  if (!expiryDate) return { label: 'No Expiry', cls: 'bg-oatmeal/20 text-ink-soft' }
  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntil < 0) return { label: 'Expired', cls: 'bg-rosewood/10 text-rosewood' }
  if (daysUntil <= 30) return { label: 'Expiring Soon', cls: 'bg-sienna/10 text-sienna' }
  return { label: 'Active', cls: 'bg-sage/10 text-sage-deep' }
}
