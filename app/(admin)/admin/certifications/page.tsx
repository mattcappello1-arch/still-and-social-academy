import { createClient } from '@/lib/supabase/server'

function getExpiryStatus(expiryDate: string | null): { label: string; cls: string; priority: number } {
  if (!expiryDate) return { label: 'No Expiry', cls: 'bg-oatmeal/20 text-ink-soft', priority: 3 }
  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntil < 0) return { label: 'Expired', cls: 'bg-rosewood/10 text-rosewood', priority: 0 }
  if (daysUntil <= 30) return { label: 'Expiring Soon', cls: 'bg-sienna/10 text-sienna', priority: 1 }
  return { label: 'Active', cls: 'bg-sage/10 text-sage-deep', priority: 2 }
}

export default async function AdminCertificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('academy_certifications')
    .select('*, academy_staff!academy_certifications_staff_id_fkey(first_name, last_name)')
    .order('created_at', { ascending: false })

  if (params.type) {
    query = query.eq('cert_type', params.type)
  }

  const { data: certifications } = await query

  // Categorize all certs
  const allCerts = (certifications ?? []).map((cert: any) => ({
    ...cert,
    expiryInfo: getExpiryStatus(cert.expiry_date),
  }))

  // Sort by urgency
  allCerts.sort((a: any, b: any) => a.expiryInfo.priority - b.expiryInfo.priority)

  const expiredCerts = allCerts.filter((c: any) => c.expiryInfo.label === 'Expired')
  const expiringCerts = allCerts.filter((c: any) => c.expiryInfo.label === 'Expiring Soon')

  // Filter by status if requested
  const filtered = allCerts.filter((cert: any) => {
    if (!params.status) return true
    if (params.status === 'expired') return cert.expiryInfo.label === 'Expired'
    if (params.status === 'expiring') return cert.expiryInfo.label === 'Expiring Soon'
    if (params.status === 'active') return cert.expiryInfo.label === 'Active'
    return true
  })

  const certTypes = ['RSA', 'Food Safety', 'First Aid', 'Drivers Licence', 'Other']

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Certifications</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">View and manage all staff certifications</p>
      </div>

      {/* Urgent alerts */}
      {!params.status && !params.type && (expiredCerts.length > 0 || expiringCerts.length > 0) && (
        <div className="mb-8 space-y-4">
          {/* Expired */}
          {expiredCerts.length > 0 && (
            <div className="rounded-xl border border-rosewood/30 bg-rosewood/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rosewood">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
                </svg>
                <h2 className="font-mono text-sm font-medium text-rosewood uppercase tracking-wider">
                  Expired ({expiredCerts.length})
                </h2>
              </div>
              <div className="space-y-2">
                {expiredCerts.map((cert: any) => {
                  const staffName = cert.academy_staff
                    ? `${cert.academy_staff.first_name} ${cert.academy_staff.last_name}`
                    : 'Unknown'
                  return (
                    <div key={cert.id} className="flex items-center justify-between rounded-lg border border-rosewood/20 bg-white/80 px-4 py-3">
                      <div>
                        <span className="font-mono text-sm text-ink font-medium">{staffName}</span>
                        <span className="font-mono text-xs text-ink-soft ml-2">{cert.cert_type} - {cert.title}</span>
                      </div>
                      <span className="font-mono text-xs text-rosewood">
                        Expired {new Date(cert.expiry_date).toLocaleDateString('en-AU')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Expiring Soon */}
          {expiringCerts.length > 0 && (
            <div className="rounded-xl border border-sienna/30 bg-sienna/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sienna">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <h2 className="font-mono text-sm font-medium text-sienna uppercase tracking-wider">
                  Expiring Within 30 Days ({expiringCerts.length})
                </h2>
              </div>
              <div className="space-y-2">
                {expiringCerts.map((cert: any) => {
                  const staffName = cert.academy_staff
                    ? `${cert.academy_staff.first_name} ${cert.academy_staff.last_name}`
                    : 'Unknown'
                  const daysLeft = Math.ceil((new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={cert.id} className="flex items-center justify-between rounded-lg border border-sienna/20 bg-white/80 px-4 py-3">
                      <div>
                        <span className="font-mono text-sm text-ink font-medium">{staffName}</span>
                        <span className="font-mono text-xs text-ink-soft ml-2">{cert.cert_type} - {cert.title}</span>
                      </div>
                      <span className="font-mono text-xs text-sienna">
                        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <a href="/admin/certifications" className={`rounded-lg border px-3 py-1.5 font-mono text-xs tracking-wide transition ${!params.type && !params.status ? 'border-sienna bg-sienna/10 text-sienna' : 'border-rule text-ink-soft hover:border-sienna/30'}`}>
          All
        </a>
        {certTypes.map((t) => (
          <a key={t} href={`/admin/certifications?type=${encodeURIComponent(t)}`} className={`rounded-lg border px-3 py-1.5 font-mono text-xs tracking-wide transition ${params.type === t ? 'border-sienna bg-sienna/10 text-sienna' : 'border-rule text-ink-soft hover:border-sienna/30'}`}>
            {t}
          </a>
        ))}
        <span className="mx-2 border-l border-rule" />
        <a href="/admin/certifications?status=expiring" className={`rounded-lg border px-3 py-1.5 font-mono text-xs tracking-wide transition ${params.status === 'expiring' ? 'border-sienna bg-sienna/10 text-sienna' : 'border-rule text-ink-soft hover:border-sienna/30'}`}>
          Expiring Soon
        </a>
        <a href="/admin/certifications?status=expired" className={`rounded-lg border px-3 py-1.5 font-mono text-xs tracking-wide transition ${params.status === 'expired' ? 'border-rosewood bg-rosewood/10 text-rosewood' : 'border-rule text-ink-soft hover:border-sienna/30'}`}>
          Expired
        </a>
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-rule bg-white/60">
          <table className="w-full">
            <thead>
              <tr className="border-b border-rule">
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">Staff</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">Type</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">Title</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">Expiry</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">Status</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-ink-soft uppercase">File</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cert: any) => {
                const staffName = cert.academy_staff
                  ? `${cert.academy_staff.first_name} ${cert.academy_staff.last_name}`
                  : 'Unknown'
                return (
                  <tr key={cert.id} className="border-b border-rule transition last:border-b-0 hover:bg-cream-soft/30">
                    <td className="px-4 py-3 font-mono text-sm text-ink">{staffName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">{cert.cert_type}</td>
                    <td className="px-4 py-3 font-mono text-sm text-ink">{cert.title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                      {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('en-AU') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${cert.expiryInfo.cls}`}>{cert.expiryInfo.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {cert.file_path ? (
                        <a
                          href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/academy-certifications/${cert.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-sienna hover:underline"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="font-mono text-xs text-ink-soft">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">No certifications found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
