import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ROLES } from '@/lib/utils/roles'
import { getRoleLabel } from '@/lib/utils/roles'
import type { Role } from '@/lib/utils/roles'

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    role?: string
    section?: string
    type?: string
    status?: string
    staff?: string
  }>
}) {
  const params = await searchParams
  const query = params.q?.trim() ?? ''
  const roleFilter = params.role ?? ''
  const sectionFilter = params.section ?? ''
  const typeFilter = params.type ?? ''
  const statusFilter = params.status ?? ''
  const staffFilter = params.staff ?? ''

  const db = await createAdminClient()

  // Fetch staff list for the staff filter dropdown
  const { data: allStaff } = await db
    .from('academy_staff')
    .select('id, first_name, last_name, role')
    .eq('status', 'active')
    .order('first_name')

  // Only search if there's a query or filter
  const hasSearch = query || roleFilter || sectionFilter || typeFilter || statusFilter || staffFilter

  let staffResults: any[] = []
  let moduleResults: any[] = []
  let handbookResults: any[] = []
  let signingResults: any[] = []
  let certResults: any[] = []

  if (hasSearch) {
    // Search staff
    if (!typeFilter || typeFilter === 'staff') {
      let staffQ = db.from('academy_staff').select('id, first_name, last_name, role, status, email').eq('status', 'active')
      if (query) staffQ = staffQ.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      if (roleFilter) staffQ = staffQ.eq('role', roleFilter)
      const { data } = await staffQ.limit(20)
      staffResults = data ?? []
    }

    // Search training modules
    if (!typeFilter || typeFilter === 'training_module') {
      let modQ = db.from('academy_training_modules')
        .select('id, title, slug, academy_training_paths(slug, title, department)')
      if (query) modQ = modQ.ilike('title', `%${query}%`)
      if (sectionFilter === 'learn' || !sectionFilter) {
        // only filter by section if explicitly set
      }
      const { data } = await modQ.limit(20)
      moduleResults = data ?? []
    }

    // Search handbook sections
    if (!typeFilter || typeFilter === 'handbook') {
      let hbQ = db.from('academy_handbook_sections')
        .select('id, title, slug, category')
        .eq('is_active', true)
      if (query) hbQ = hbQ.ilike('title', `%${query}%`)
      const { data } = await hbQ.limit(20)
      handbookResults = data ?? []
    }

    // Search signing documents
    if (!typeFilter || typeFilter === 'signing') {
      let sigQ = db.from('academy_signing_documents')
        .select('id, title, doc_type')
      if (query) sigQ = sigQ.ilike('title', `%${query}%`)
      const { data } = await sigQ.limit(20)
      signingResults = data ?? []
    }

    // Search certifications
    if (!typeFilter || typeFilter === 'certification') {
      let certQ = db.from('academy_certifications')
        .select('id, title, cert_type, staff_id, status, expiry_date, academy_staff!academy_certifications_staff_id_fkey(first_name, last_name)')
      if (query) certQ = certQ.ilike('title', `%${query}%`)
      if (staffFilter) certQ = certQ.eq('staff_id', staffFilter)
      if (statusFilter === 'expired') certQ = certQ.lt('expiry_date', new Date().toISOString())
      if (statusFilter === 'active') certQ = certQ.gt('expiry_date', new Date().toISOString())
      const { data } = await certQ.limit(20)
      certResults = data ?? []
    }
  }

  const totalResults = staffResults.length + moduleResults.length + handbookResults.length + signingResults.length + certResults.length

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-3xl font-light text-ink mb-2">Admin Search</h1>
      <p className="font-mono text-sm text-ink-soft mb-6">Search across all staff, content, and records</p>

      {/* Search form */}
      <form method="GET" className="mb-8 space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search staff, modules, documents..."
            className="flex-1 rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-charcoal px-6 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna"
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <select name="role" defaultValue={roleFilter} className="rounded-lg border border-rule bg-white/60 px-3 py-2 font-mono text-xs text-ink focus:border-sienna/30 focus:outline-none">
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{getRoleLabel(r)}</option>
            ))}
          </select>

          <select name="section" defaultValue={sectionFilter} className="rounded-lg border border-rule bg-white/60 px-3 py-2 font-mono text-xs text-ink focus:border-sienna/30 focus:outline-none">
            <option value="">All Sections</option>
            <option value="learn">Learn</option>
            <option value="operate">Operate</option>
            <option value="comply">Comply</option>
            <option value="people">People</option>
            <option value="develop">Develop</option>
          </select>

          <select name="type" defaultValue={typeFilter} className="rounded-lg border border-rule bg-white/60 px-3 py-2 font-mono text-xs text-ink focus:border-sienna/30 focus:outline-none">
            <option value="">All Types</option>
            <option value="staff">Staff</option>
            <option value="training_module">Training Module</option>
            <option value="handbook">Handbook</option>
            <option value="signing">Signing Document</option>
            <option value="certification">Certification</option>
          </select>

          <select name="status" defaultValue={statusFilter} className="rounded-lg border border-rule bg-white/60 px-3 py-2 font-mono text-xs text-ink focus:border-sienna/30 focus:outline-none">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>

          <select name="staff" defaultValue={staffFilter} className="rounded-lg border border-rule bg-white/60 px-3 py-2 font-mono text-xs text-ink focus:border-sienna/30 focus:outline-none">
            <option value="">All Staff</option>
            {(allStaff ?? []).map((s: any) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </select>
        </div>
      </form>

      {/* Results */}
      {hasSearch && (
        <p className="font-mono text-xs text-ink-soft mb-6">
          {totalResults} result{totalResults !== 1 ? 's' : ''} found
        </p>
      )}

      {hasSearch && totalResults === 0 && (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">No results found. Try adjusting your filters.</p>
        </div>
      )}

      {/* Staff Results */}
      {staffResults.length > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl font-light text-ink mb-4">Staff</h2>
          <div className="space-y-2">
            {staffResults.map((s: any) => (
              <Link key={s.id} href={`/admin/staff/${s.id}`}
                className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4 hover:border-sienna/30 hover:shadow-sm transition">
                <div>
                  <p className="font-mono text-sm font-medium text-ink">{s.first_name} {s.last_name}</p>
                  <p className="font-mono text-xs text-ink-soft">{s.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cream-soft border border-rule px-2 py-0.5 font-mono text-[10px] tracking-wider text-ink-soft">
                    {getRoleLabel(s.role as Role)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Module Results */}
      {moduleResults.length > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl font-light text-ink mb-4">Training Modules</h2>
          <div className="space-y-2">
            {moduleResults.map((m: any) => (
              <Link key={m.id} href={`/admin/training`}
                className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4 hover:border-sienna/30 hover:shadow-sm transition">
                <div>
                  <p className="font-mono text-sm font-medium text-ink">{m.title}</p>
                  <p className="font-mono text-xs text-ink-soft">{(m as any).academy_training_paths?.title ?? ''}</p>
                </div>
                <span className="rounded-full bg-sienna/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-sienna">
                  Module
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Handbook Results */}
      {handbookResults.length > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl font-light text-ink mb-4">Handbook</h2>
          <div className="space-y-2">
            {handbookResults.map((h: any) => (
              <Link key={h.id} href={`/admin/handbook`}
                className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4 hover:border-sienna/30 hover:shadow-sm transition">
                <p className="font-mono text-sm font-medium text-ink">{h.title}</p>
                <span className="rounded-full bg-olive/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-olive capitalize">
                  {h.category}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Signing Document Results */}
      {signingResults.length > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl font-light text-ink mb-4">Signing Documents</h2>
          <div className="space-y-2">
            {signingResults.map((d: any) => (
              <Link key={d.id} href={`/admin/signing`}
                className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4 hover:border-sienna/30 hover:shadow-sm transition">
                <p className="font-mono text-sm font-medium text-ink">{d.title}</p>
                <span className="rounded-full bg-coffee/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-coffee capitalize">
                  {d.doc_type}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Certification Results */}
      {certResults.length > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl font-light text-ink mb-4">Certifications</h2>
          <div className="space-y-2">
            {certResults.map((c: any) => {
              const staffName = c.academy_staff ? `${c.academy_staff.first_name} ${c.academy_staff.last_name}` : ''
              return (
                <Link key={c.id} href={`/admin/certifications`}
                  className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4 hover:border-sienna/30 hover:shadow-sm transition">
                  <div>
                    <p className="font-mono text-sm font-medium text-ink">{c.title || c.cert_type}</p>
                    {staffName && <p className="font-mono text-xs text-ink-soft">{staffName}</p>}
                  </div>
                  <span className="rounded-full bg-sage/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-sage capitalize">
                    {c.cert_type}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
