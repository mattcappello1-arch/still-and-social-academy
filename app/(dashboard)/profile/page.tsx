import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRoleLabel, getDepartment, getDepartmentLabel } from '@/lib/utils/roles'
import type { Role } from '@/lib/utils/roles'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch staff record
  const { data: staff } = await supabase
    .from('academy_staff')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch personal details
  const { data: personalDetails } = await supabase
    .from('academy_staff_personal_details')
    .select('*')
    .eq('staff_id', user.id)
    .single()

  if (!staff) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl font-light text-ink">Profile</h1>
        <div className="mt-8 rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">
            Your profile hasn&apos;t been set up yet. Contact your manager.
          </p>
        </div>
      </div>
    )
  }

  const role = staff.role as Role
  const department = getDepartment(role)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-light text-ink">People</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Your profile, documents, and team
        </p>
      </div>

      {/* Quick links */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <a href="/profile" className="rounded-xl border-2 border-sienna/20 bg-sienna/5 p-4">
          <p className="font-mono text-sm font-medium text-ink">Profile</p>
          <p className="font-mono text-xs text-ink-soft">Your personal details</p>
        </a>
        <a href="/documents" className="rounded-xl border border-rule bg-white/60 p-4 hover:border-sienna/30 transition">
          <p className="font-mono text-sm font-medium text-ink">Documents</p>
          <p className="font-mono text-xs text-ink-soft">Sign and view documents</p>
        </a>
        <a href="/team" className="rounded-xl border border-rule bg-white/60 p-4 hover:border-sienna/30 transition">
          <p className="font-mono text-sm font-medium text-ink">Team</p>
          <p className="font-mono text-xs text-ink-soft">Your team directory</p>
        </a>
      </div>

      {/* Staff info card */}
      <div className="mb-8 rounded-xl border border-rule bg-white/60 p-6">
        <p className="mb-4 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
          Staff Details
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow label="Name" value={`${staff.first_name} ${staff.last_name}`} />
          <InfoRow label="Email" value={staff.email} />
          <InfoRow label="Phone" value={staff.phone ?? 'Not set'} />
          <InfoRow label="Role" value={getRoleLabel(role)} />
          <InfoRow label="Department" value={getDepartmentLabel(department)} />
          <InfoRow
            label="Employment"
            value={
              staff.employment_type
                ? staff.employment_type.replace('_', ' ')
                : 'Not set'
            }
          />
          <InfoRow
            label="Start Date"
            value={
              staff.start_date
                ? new Date(staff.start_date).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Not set'
            }
          />
          <InfoRow label="Status" value={staff.status} />
        </div>
      </div>

      {/* Editable personal details */}
      <ProfileForm
        staffId={user.id}
        phone={staff.phone ?? ''}
        personalDetails={personalDetails}
      />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-sm capitalize text-ink">{value}</p>
    </div>
  )
}
