import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getRoleLabel, getDepartment, getDepartmentLabel } from '@/lib/utils/roles'
import type { Role } from '@/lib/utils/roles'
import { BulkStaffTable } from './bulk-actions'

export default async function StaffListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; department?: string; status?: string; success?: string }>
}) {
  const params = await searchParams
  const query = params.q ?? ''
  const roleFilter = params.role ?? ''
  const departmentFilter = params.department ?? ''
  const statusFilter = params.status ?? ''
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

  if (departmentFilter) {
    staffQuery = staffQuery.eq('department', departmentFilter)
  }

  if (statusFilter) {
    staffQuery = staffQuery.eq('status', statusFilter)
  }

  const { data: staff } = await staffQuery

  // Fetch signing documents for bulk action dropdown
  const admin = await createAdminClient()
  const { data: signingDocs } = await admin
    .from('academy_signing_documents')
    .select('id, title, doc_type')
    .order('created_at', { ascending: false })

  const activeFilters = [query, roleFilter, departmentFilter, statusFilter].filter(Boolean).length

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">Staff</h1>
          <p className="mt-1 font-mono text-sm text-ink-soft">
            Manage your team members
            {staff && <span className="ml-1">({staff.length} {staff.length === 1 ? 'member' : 'members'})</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export-staff"
            className="flex items-center gap-2 rounded-lg border border-rule px-4 py-2.5 font-mono text-sm tracking-wide text-ink-soft transition hover:border-sienna/30 hover:text-sienna"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Export CSV
          </a>
          <a
            href="/admin/staff/new"
            className="flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna active:scale-[0.98]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>
            Invite Staff
          </a>
        </div>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-sage/20 bg-sage/5 px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage shrink-0"><path d="M20 6L9 17l-5-5" /></svg>
          <p className="font-mono text-sm text-sage">{success}</p>
        </div>
      )}

      {/* Search + Filters */}
      <form className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          name="q"
          type="text"
          defaultValue={query}
          placeholder="Search by name or email..."
          className="flex-1 min-w-[200px] rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
        />
        <select
          name="department"
          defaultValue={departmentFilter}
          className="rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
        >
          <option value="">All Departments</option>
          <option value="foh">Front of House</option>
          <option value="kitchen">Kitchen</option>
          <option value="leadership">Leadership</option>
        </select>
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
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-charcoal px-4 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna"
          >
            Filter
          </button>
          {activeFilters > 0 && (
            <a
              href="/admin/staff"
              className="flex items-center rounded-lg border border-rule px-4 py-2.5 font-mono text-sm text-ink-soft transition hover:border-sienna/30 hover:text-sienna"
            >
              Clear
            </a>
          )}
        </div>
      </form>

      {/* Staff table with bulk actions */}
      {staff && staff.length > 0 ? (
        <BulkStaffTable
          staff={staff as any}
          documents={(signingDocs ?? []) as any}
        >
          {({ selectedIds, toggleId, toggleAll, allSelected }) => (
            <div className="overflow-hidden rounded-xl border border-rule bg-white/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-rule">
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-rule text-sienna accent-sienna"
                        />
                      </th>
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
                          className={`border-b border-rule transition last:border-b-0 hover:bg-cream-soft/30 ${
                            selectedIds.includes(s.id) ? 'bg-sienna/5' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(s.id)}
                              onChange={() => toggleId(s.id)}
                              className="h-4 w-4 rounded border-rule text-sienna accent-sienna"
                            />
                          </td>
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
                              : '\u2014'}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </BulkStaffTable>
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
