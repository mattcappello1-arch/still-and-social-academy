import { createClient } from '@/lib/supabase/server'

function getExpiryStatus(expiryDate: string | null): { label: string; cls: string } {
  if (!expiryDate) return { label: 'No Expiry', cls: 'bg-oatmeal/20 text-ink-soft' }
  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntil < 0) return { label: 'Expired', cls: 'bg-rosewood/10 text-rosewood' }
  if (daysUntil <= 30) return { label: 'Expiring Soon', cls: 'bg-sienna/10 text-sienna' }
  return { label: 'Active', cls: 'bg-sage/10 text-sage-deep' }
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

  // Filter by status client-side since it's computed
  const filtered = (certifications ?? []).filter((cert: any) => {
    if (!params.status) return true
    const expiry = getExpiryStatus(cert.expiry_date)
    if (params.status === 'expired') return expiry.label === 'Expired'
    if (params.status === 'expiring') return expiry.label === 'Expiring Soon'
    if (params.status === 'active') return expiry.label === 'Active'
    return true
  })

  const certTypes = ['RSA', 'Food Safety', 'First Aid', 'Drivers Licence', 'Other']

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Certifications</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">View and manage all staff certifications</p>
      </div>

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
                const expiry = getExpiryStatus(cert.expiry_date)
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
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${expiry.cls}`}>{expiry.label}</span>
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
