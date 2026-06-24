import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRoleLabel } from '@/lib/utils/roles'
import type { Role } from '@/lib/utils/roles'

const FOH_PATH: { role: string; title: string; description: string; training: string[] }[] = [
  {
    role: 'waiter',
    title: 'Waiter',
    description: 'Learn the fundamentals of front-of-house service, including greeting guests, taking orders, and delivering exceptional dining experiences.',
    training: ['Sequence of Service', 'Menu Knowledge', 'POS Training', 'RSA Certification'],
  },
  {
    role: 'restaurant_all_rounder',
    title: 'Senior Waiter',
    description: 'Take on more responsibility with section leadership, handling complex guest situations, and mentoring new team members.',
    training: ['Advanced Service Techniques', 'Conflict Resolution', 'Wine & Beverage Knowledge', 'Table Management'],
  },
  {
    role: 'bartender',
    title: 'Bartender',
    description: 'Master the art of cocktail crafting, bar operations, and creating memorable bar experiences for guests.',
    training: ['Cocktail Foundations', 'Bar Operations', 'Speed & Efficiency', 'Spirits Knowledge'],
  },
  {
    role: 'supervisor',
    title: 'Supervisor',
    description: 'Lead floor operations, manage staff during service, handle escalated guest concerns, and ensure service standards.',
    training: ['Leadership Fundamentals', 'Staff Management', 'Operations Overview', 'Financial Awareness'],
  },
  {
    role: 'manager',
    title: 'Venue Manager',
    description: 'Oversee all venue operations, strategic planning, team development, and business performance.',
    training: ['Business Management', 'People Leadership', 'Strategic Planning', 'Financial Management'],
  },
]

const KITCHEN_PATH: { role: string; title: string; description: string; training: string[] }[] = [
  {
    role: 'kitchen_hand',
    title: 'Kitchen Hand',
    description: 'Build foundational kitchen skills including food safety, prep work, dishwashing, and maintaining a clean kitchen environment.',
    training: ['Food Safety Level 1', 'Kitchen Orientation', 'Equipment Training', 'Cleaning Procedures'],
  },
  {
    role: 'entree_chef',
    title: 'Prep Cook',
    description: 'Advance to ingredient preparation, basic cooking techniques, and supporting the line during service.',
    training: ['Prep Techniques', 'Knife Skills', 'Recipe Standards', 'Station Setup'],
  },
  {
    role: 'wok_chef',
    title: 'Section Chef',
    description: 'Own a section of the kitchen, mastering specific cooking techniques and managing your station during high-volume service.',
    training: ['Section Mastery', 'Time Management', 'Quality Control', 'Menu Development'],
  },
  {
    role: 'expo_chef',
    title: 'Senior Chef',
    description: 'Lead kitchen operations across multiple sections, mentor junior staff, and ensure consistency across all dishes.',
    training: ['Kitchen Leadership', 'Menu Engineering', 'Cost Management', 'Training & Development'],
  },
  {
    role: 'manager',
    title: 'Kitchen Leader',
    description: 'Direct the entire kitchen operation, manage suppliers, develop menus, and drive culinary excellence.',
    training: ['Kitchen Management', 'Supplier Relations', 'Menu Innovation', 'Team Building'],
  },
]

function getRolePosition(role: string, path: typeof FOH_PATH): number {
  const idx = path.findIndex(p => p.role === role)
  return idx >= 0 ? idx : 0
}

export default async function CareerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: staff } = await supabase
    .from('academy_staff')
    .select('role, department')
    .eq('id', user.id)
    .single()

  const role = (staff?.role ?? 'waiter') as Role
  const department = staff?.department ?? 'foh'
  const isFoh = department === 'foh' || department === 'leadership'
  const isKitchen = department === 'kitchen'

  const fohPosition = getRolePosition(role, FOH_PATH)
  const kitchenPosition = getRolePosition(role, KITCHEN_PATH)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Career Roadmap</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Your career pathway at Still & Social. See where you are and where you can go.
        </p>
      </div>

      {/* Current position */}
      <div className="mb-8 rounded-xl border-2 border-sienna/30 bg-sienna/5 p-5">
        <p className="font-mono text-[10px] tracking-widest text-sienna uppercase mb-1">Your Current Role</p>
        <p className="font-serif text-2xl font-light text-ink">{getRoleLabel(role)}</p>
        <p className="mt-1 font-mono text-xs text-ink-soft">
          {department === 'foh' ? 'Front of House' : department === 'kitchen' ? 'Kitchen' : 'Leadership'} Team
        </p>
      </div>

      {/* FOH Path */}
      {(isFoh || department === 'leadership') && (
        <section className="mb-10">
          <h2 className="mb-6 font-serif text-xl font-light text-ink">Front of House Pathway</h2>
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-oatmeal" />

            <div className="space-y-6">
              {FOH_PATH.map((step, i) => {
                const isCurrent = isFoh && i === fohPosition
                const isCompleted = isFoh && i < fohPosition
                const isFuture = !isFoh || i > fohPosition

                return (
                  <div key={step.role} className="relative">
                    {/* Node */}
                    <div className={`absolute -left-8 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      isCurrent
                        ? 'border-sienna bg-sienna'
                        : isCompleted
                        ? 'border-sage bg-sage'
                        : 'border-oatmeal bg-cream'
                    }`}>
                      {isCompleted ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-cream">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : isCurrent ? (
                        <div className="h-2 w-2 rounded-full bg-cream" />
                      ) : null}
                    </div>

                    <div className={`rounded-xl border p-5 transition ${
                      isCurrent
                        ? 'border-sienna/30 bg-sienna/5 shadow-sm'
                        : isCompleted
                        ? 'border-sage/20 bg-sage/5'
                        : 'border-rule bg-white/60'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-serif text-lg font-light ${isCurrent ? 'text-sienna' : 'text-ink'}`}>
                              {step.title}
                            </h3>
                            {isCurrent && (
                              <span className="rounded-full bg-sienna px-2 py-0.5 font-mono text-[9px] tracking-wider text-cream uppercase">
                                You are here
                              </span>
                            )}
                            {isCompleted && (
                              <span className="rounded-full bg-sage/20 px-2 py-0.5 font-mono text-[9px] tracking-wider text-sage uppercase">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-sm text-ink-soft leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Required training */}
                      <div className="mt-3 border-t border-rule/50 pt-3">
                        <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase mb-2">
                          {isFuture ? 'Required Training' : 'Key Training'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {step.training.map(t => (
                            <span key={t} className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                              isCompleted
                                ? 'border-sage/20 bg-sage/5 text-sage'
                                : isCurrent
                                ? 'border-sienna/20 bg-sienna/5 text-sienna'
                                : 'border-rule bg-cream-soft text-ink-soft'
                            }`}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Kitchen Path */}
      {(isKitchen || department === 'leadership') && (
        <section className="mb-10">
          <h2 className="mb-6 font-serif text-xl font-light text-ink">Kitchen Pathway</h2>
          <div className="relative pl-8">
            <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-oatmeal" />

            <div className="space-y-6">
              {KITCHEN_PATH.map((step, i) => {
                const isCurrent = isKitchen && i === kitchenPosition
                const isCompleted = isKitchen && i < kitchenPosition
                const isFuture = !isKitchen || i > kitchenPosition

                return (
                  <div key={step.role} className="relative">
                    <div className={`absolute -left-8 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      isCurrent
                        ? 'border-olive bg-olive'
                        : isCompleted
                        ? 'border-sage bg-sage'
                        : 'border-oatmeal bg-cream'
                    }`}>
                      {isCompleted ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-cream">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : isCurrent ? (
                        <div className="h-2 w-2 rounded-full bg-cream" />
                      ) : null}
                    </div>

                    <div className={`rounded-xl border p-5 transition ${
                      isCurrent
                        ? 'border-olive/30 bg-olive/5 shadow-sm'
                        : isCompleted
                        ? 'border-sage/20 bg-sage/5'
                        : 'border-rule bg-white/60'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-serif text-lg font-light ${isCurrent ? 'text-olive' : 'text-ink'}`}>
                              {step.title}
                            </h3>
                            {isCurrent && (
                              <span className="rounded-full bg-olive px-2 py-0.5 font-mono text-[9px] tracking-wider text-cream uppercase">
                                You are here
                              </span>
                            )}
                            {isCompleted && (
                              <span className="rounded-full bg-sage/20 px-2 py-0.5 font-mono text-[9px] tracking-wider text-sage uppercase">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-sm text-ink-soft leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 border-t border-rule/50 pt-3">
                        <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase mb-2">
                          {isFuture ? 'Required Training' : 'Key Training'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {step.training.map(t => (
                            <span key={t} className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                              isCompleted
                                ? 'border-sage/20 bg-sage/5 text-sage'
                                : isCurrent
                                ? 'border-olive/20 bg-olive/5 text-olive'
                                : 'border-rule bg-cream-soft text-ink-soft'
                            }`}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
