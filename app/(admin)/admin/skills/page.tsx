import { createClient } from '@/lib/supabase/server'
import { SkillLevelSelect } from './components'

const SKILLS = [
  { key: 'foh_service', label: 'FOH Service' },
  { key: 'guest_experience', label: 'Guest Exp.' },
  { key: 'pos_system', label: 'POS' },
  { key: 'food_running', label: 'Food Run' },
  { key: 'bar_service', label: 'Bar' },
  { key: 'cocktail_making', label: 'Cocktails' },
  { key: 'opening_procedures', label: 'Open' },
  { key: 'closing_procedures', label: 'Close' },
  { key: 'kitchen_operations', label: 'Kitchen' },
  { key: 'leadership', label: 'Lead' },
  { key: 'team_training', label: 'Train' },
]

const LEVEL_COLORS: Record<number, string> = {
  0: 'bg-oatmeal/20 text-ink-soft',
  1: 'bg-rosewood/20 text-rosewood',
  2: 'bg-sienna/20 text-sienna',
  3: 'bg-olive/20 text-olive',
  4: 'bg-sage/20 text-sage-deep',
}

export default async function AdminSkillsPage() {
  const supabase = await createClient()

  const { data: allStaff } = await supabase
    .from('academy_staff')
    .select('id, first_name, last_name')
    .eq('status', 'active')
    .order('first_name')

  const { data: allSkills } = await supabase
    .from('academy_skill_levels')
    .select('staff_id, skill_name, level')

  // Build skill map: staffId -> skillName -> level
  const skillMap = new Map<string, Map<string, number>>()
  for (const s of allSkills ?? []) {
    if (!skillMap.has(s.staff_id)) skillMap.set(s.staff_id, new Map())
    skillMap.get(s.staff_id)!.set(s.skill_name, s.level)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Skills Management</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">View and update staff skill levels</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <span className="font-mono text-[10px] text-ink-soft">Levels:</span>
          {[
            { n: 1, l: 'Beginner' },
            { n: 2, l: 'Learning' },
            { n: 3, l: 'Confident' },
            { n: 4, l: 'Trainer' },
          ].map((lv) => (
            <span key={lv.n} className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${LEVEL_COLORS[lv.n]}`}>
              {lv.n} = {lv.l}
            </span>
          ))}
        </div>
      </div>

      {allStaff && allStaff.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-rule bg-white/60">
          <table className="w-full">
            <thead>
              <tr className="border-b border-rule">
                <th className="sticky left-0 bg-white/90 px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">Staff</th>
                {SKILLS.map((s) => (
                  <th key={s.key} className="px-2 py-3 text-center font-mono text-[10px] tracking-widest text-ink-soft uppercase whitespace-nowrap">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allStaff.map((staff: any) => {
                const staffSkills = skillMap.get(staff.id)
                return (
                  <tr key={staff.id} className="border-b border-rule transition last:border-b-0 hover:bg-cream-soft/30">
                    <td className="sticky left-0 bg-white/90 px-4 py-2 font-mono text-sm text-ink whitespace-nowrap">
                      {staff.first_name} {staff.last_name}
                    </td>
                    {SKILLS.map((skill) => {
                      const level = staffSkills?.get(skill.key) ?? 0
                      return (
                        <td key={skill.key} className="px-2 py-2 text-center">
                          <SkillLevelSelect
                            staffId={staff.id}
                            skillName={skill.key}
                            currentLevel={level}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">No active staff found.</p>
        </div>
      )}
    </div>
  )
}
