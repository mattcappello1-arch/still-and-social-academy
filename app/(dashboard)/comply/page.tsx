import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { effectiveStatus, STATUS_META } from '@/lib/status'
import Link from 'next/link'

export default async function ComplyHubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get staff role + admin status for role-based filtering
  const { data: staff } = await supabase
    .from('academy_staff')
    .select('role, is_admin')
    .eq('id', user.id)
    .single()

  // Certifications
  const { data: certifications } = await supabase
    .from('academy_certifications')
    .select('id, expiry_date')
    .eq('staff_id', user.id)

  const now = new Date()
  let validCount = 0
  let expiringCount = 0
  let expiredCount = 0

  for (const cert of certifications ?? []) {
    if (!cert.expiry_date) {
      validCount++
      continue
    }
    const expiry = new Date(cert.expiry_date)
    const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil < 0) expiredCount++
    else if (daysUntil <= 30) expiringCount++
    else validCount++
  }

  // Pending signing assignments
  const { data: signingDocs } = await supabase
    .from('academy_signing_assignments')
    .select('id, status, expires_at, signed_at, academy_signing_documents(title)')
    .eq('staff_id', user.id)
    .order('created_at', { ascending: false })

  const pendingDocs = (signingDocs ?? []).filter((d: any) => {
    const s = effectiveStatus(d)
    return s === 'sent' || s === 'viewed'
  })

  // Compliance handbook sections with role-based filtering
  const isAdminOrManager = staff?.is_admin || staff?.role === 'manager'
  let handbookQuery = supabase
    .from('academy_handbook_sections')
    .select('id, title, slug, category, role_visibility')
    .in('category', ['policies', 'emergency', 'procedures'])
    .order('sort_order')

  if (!isAdminOrManager && staff?.role) {
    handbookQuery = handbookQuery.or(`role_visibility.is.null,role_visibility.cs.{${staff.role}}`)
  }

  const { data: handbookSections } = await handbookQuery

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Comply</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">Certifications, sign-offs, and compliance</p>
      </div>

      {/* Certification status cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-sage/30 bg-sage/5 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-sage-deep uppercase">Valid</p>
          <p className="font-serif text-3xl font-light text-sage-deep">{validCount}</p>
          <p className="mt-1 font-mono text-xs text-sage-deep/70">certifications</p>
        </div>
        <div className={`rounded-xl border p-5 ${expiringCount > 0 ? 'border-sienna/30 bg-sienna/5' : 'border-rule bg-white/60'}`}>
          <p className={`mb-1 font-mono text-[10px] tracking-widest uppercase ${expiringCount > 0 ? 'text-sienna' : 'text-ink-soft'}`}>Expiring Soon</p>
          <p className={`font-serif text-3xl font-light ${expiringCount > 0 ? 'text-sienna' : 'text-ink'}`}>{expiringCount}</p>
          <p className={`mt-1 font-mono text-xs ${expiringCount > 0 ? 'text-sienna/70' : 'text-ink-soft'}`}>within 30 days</p>
        </div>
        <div className={`rounded-xl border p-5 ${expiredCount > 0 ? 'border-rosewood/30 bg-rosewood/5' : 'border-rule bg-white/60'}`}>
          <p className={`mb-1 font-mono text-[10px] tracking-widest uppercase ${expiredCount > 0 ? 'text-rosewood' : 'text-ink-soft'}`}>Expired</p>
          <p className={`font-serif text-3xl font-light ${expiredCount > 0 ? 'text-rosewood' : 'text-ink'}`}>{expiredCount}</p>
          <p className={`mt-1 font-mono text-xs ${expiredCount > 0 ? 'text-rosewood/70' : 'text-ink-soft'}`}>need renewal</p>
        </div>
      </div>

      {/* Link to certifications page */}
      <Link href="/certifications"
        className="mb-8 flex items-center justify-between rounded-xl border border-rule bg-white/60 p-5 transition hover:shadow-sm hover:border-sienna/30 group block">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sienna">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <div>
            <p className="font-mono text-sm font-medium text-ink group-hover:text-sienna transition">Manage Certifications</p>
            <p className="font-mono text-xs text-ink-soft">Upload, view, and track your certificates</p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-soft group-hover:text-sienna transition"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </Link>

      {/* Pending sign-offs */}
      {pendingDocs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 font-serif text-xl font-light text-ink">Pending Sign-Offs</h2>
          <div className="space-y-2">
            {pendingDocs.map((d: any) => {
              const status = effectiveStatus(d)
              const meta = STATUS_META[status]
              return (
                <Link key={d.id} href={`/documents/${d.id}`}
                  className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4 hover:shadow-sm transition">
                  <span className="font-mono text-sm text-ink">{d.academy_signing_documents?.title}</span>
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${meta.cls}`}>
                    {meta.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Compliance handbook sections */}
      {handbookSections && handbookSections.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-xl font-light text-ink">Compliance Resources</h2>
          <div className="space-y-2">
            {handbookSections.map((section: any) => (
              <Link key={section.id} href={`/handbook/${section.slug}`}
                className="flex items-center justify-between rounded-xl border border-rule bg-white/60 p-4 hover:shadow-sm transition group">
                <div className="flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-soft">
                    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                  </svg>
                  <span className="font-mono text-sm text-ink group-hover:text-sienna transition">{section.title}</span>
                </div>
                <span className="rounded-full border border-rule bg-cream-soft px-2 py-0.5 font-mono text-[10px] tracking-wider text-ink-soft capitalize">
                  {section.category}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
