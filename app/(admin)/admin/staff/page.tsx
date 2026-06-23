import { createClient } from '@/lib/supabase/server'
import { getRoleLabel, getDepartment, getDepartmentLabel } from '@/lib/utils/roles'
import type { Role } from '@/lib/utils/roles'

export default async function StaffListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; success?: string }>
}) {
  const params = await searchParams
  const query = params.q ?? ''
  const roleFilter = params.role ?? ''
  const success = params.success

  const supabase = await createClient()

  let staffQuery = supabase
    .from('academy_staff')
    .select('id, first_name, last_name, email, role, department, status, start_date, employment_type')
    .order('created_at', { ascending: false })

  if (query) {
    staffQuery = staffQuery.or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`
    )
  }

  if (roleFilter) {
    staffQuery = staffQuery.eq('role', roleFilter)
  }

  const { data: staff } = await staffQuery

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">Staff</h1>
          <p className="mt-1 font-mono text-sm text-ink-soft">
            Manage your team members
          </p>
        </div>
        <a
          href="/admin/staff/new"
          className="rounded-lg bg-charcoal px-4 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna active:scale-[0.98]"
        >
          Invite Staff
        </a>
      </div>

      {success && (
        <div className="mb-4 rounded-lg border border-sage/20 bg-sage/5 px-4 py-3 font-mono text-sm text-sage">
          {success}
        </div>
      )}

      {/* Search + Filter */}
      <form className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          name="q"
          type="text"
          defaultValue={query}
          placeholder="Search by name or email..."
          className="flex-1 rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
        />
        <select
          name="role"
          defaultValue={roleFilter}
          className="rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
        >
          <option value="">All Roles</option>
          {(
            [
              'waiter',
              'restaurant_all_rounder',
              'bartender',
              'kitchen_hand',
              'entree_chef',
              'wok_chef',
              'curries_chef',
              'expo_chef',
              'supervisor',
              'manager',
            ] as Role[]
          ).map((role) => (
            <option key={role} value={role}>
              {getRoleLabel(role)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink transition hover:bg-oatmeal/20"
        >
          Filter
        </button>
      </form>

      {/* Staff table */}
      {staff && staff.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-rule bg-white/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-rule">
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Department</Th>
                  <Th>Status</Th>
                  <Th>Start Date</Th>
                </tr>
              </thead>
              <tbody>
                {staff.map(
                  (s: {
                    id: string
                    first_name: string
                    last_name: string
                    email: string
                    role: string
                    department: string
                    status: string
                    start_date: string | null
                    employment_type: string | null
                  }) => (
                    <tr
                      key={s.id}
                      className="border-b border-rule transition last:border-b-0 hover:bg-cream-soft/30"
                    >
                      <td className="px-4 py-3 font-mono text-sm font-medium text-ink">
                        <a href={`/admin/staff/${s.id}`} className="hover:text-sienna transition">
                          {s.first_name} {s.last_name}
                        </a>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-ink-soft">
                        {s.email}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-ink-soft">
                        {getRoleLabel(s.role as Role)}
                      </td>
                      <td className="px-4 py-3">
                        <DepartmentBadge department={s.department} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-ink-soft">
                        {s.start_date
                          ? new Date(s.start_date).toLocaleDateString('en-AU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">
            {query || roleFilter
              ? 'No staff match your search. Try adjusting your filters.'
              : 'No staff members yet. Invite your first team member to get started.'}
          </p>
        </div>
      )}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">
      {children}
    </th>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'border-sage/20 bg-sage/10 text-sage',
    pending: 'border-oatmeal-dk/30 bg-oatmeal/20 text-oatmeal-dk',
    inactive: 'border-rule bg-cream-soft text-ink-soft',
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-wide uppercase ${styles[status] ?? styles.inactive}`}
    >
      {status}
    </span>
  )
}

function DepartmentBadge({ department }: { department: string }) {
  const styles: Record<string, string> = {
    foh: 'border-sienna/20 bg-sienna/10 text-sienna',
    kitchen: 'border-olive/20 bg-olive/10 text-olive',
    leadership: 'border-rosewood/20 bg-rosewood/10 text-rosewood',
  }

  const labels: Record<string, string> = {
    foh: 'FOH',
    kitchen: 'Kitchen',
    leadership: 'Leadership',
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-wide uppercase ${styles[department] ?? styles.foh}`}
    >
      {labels[department] ?? department}
    </span>
  )
}
