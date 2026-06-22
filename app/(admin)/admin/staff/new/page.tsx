import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROLES, getRoleLabel } from '@/lib/utils/roles'

async function inviteStaff(formData: FormData) {
  'use server'

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const email = formData.get('email') as string
  const phone = (formData.get('phone') as string) || null
  const role = formData.get('role') as string
  const employmentType = formData.get('employment_type') as string
  const startDate = (formData.get('start_date') as string) || null

  const supabase = await createClient()
  const admin = await createAdminClient()

  // Get the current user (who is inviting)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Create the invitation record
  const { error: inviteError } = await admin
    .from('academy_invitations')
    .insert({
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      employment_type: employmentType,
      invited_by: user?.id ?? null,
    })

  if (inviteError) {
    redirect(
      `/admin/staff/new?error=${encodeURIComponent(inviteError.message)}`
    )
  }

  // Send the invite email via Supabase Auth
  const { error: authError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      first_name: firstName,
      last_name: lastName,
      role,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/accept-invite`,
  })

  if (authError) {
    redirect(
      `/admin/staff/new?error=${encodeURIComponent(authError.message)}`
    )
  }

  redirect(
    `/admin/staff?success=${encodeURIComponent(`Invitation sent to ${firstName} ${lastName} (${email})`)}`
  )
}

export default async function NewStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <a
          href="/admin/staff"
          className="mb-4 inline-flex items-center gap-1 font-mono text-sm text-ink-soft transition hover:text-sienna"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Staff
        </a>
        <h1 className="font-serif text-3xl font-light text-ink">
          Invite New Staff
        </h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Send an invitation to join the academy
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-sienna/20 bg-sienna/5 px-4 py-3 font-mono text-sm text-sienna">
          {error}
        </div>
      )}

      <form
        action={inviteStaff}
        className="space-y-6 rounded-xl border border-rule bg-white/60 p-6"
      >
        {/* Name row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="first_name"
              className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase"
            >
              First Name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
              placeholder="First name"
            />
          </div>
          <div>
            <label
              htmlFor="last_name"
              className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase"
            >
              Last Name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              required
              className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
              placeholder="Last name"
            />
          </div>
        </div>

        {/* Contact row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
              placeholder="staff@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase"
            >
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label
            htmlFor="role"
            className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
          >
            <option value="">Select a role</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {getRoleLabel(role)}
              </option>
            ))}
          </select>
        </div>

        {/* Employment + Start date */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="employment_type"
              className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase"
            >
              Employment Type
            </label>
            <select
              id="employment_type"
              name="employment_type"
              required
              className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
            >
              <option value="">Select type</option>
              <option value="casual">Casual</option>
              <option value="part_time">Part-Time</option>
              <option value="full_time">Full-Time</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="start_date"
              className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase"
            >
              Start Date
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-charcoal px-6 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna active:scale-[0.98]"
          >
            Send Invitation
          </button>
          <a
            href="/admin/staff"
            className="rounded-lg border border-rule px-4 py-2.5 font-mono text-sm text-ink-soft transition hover:bg-cream-soft"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
