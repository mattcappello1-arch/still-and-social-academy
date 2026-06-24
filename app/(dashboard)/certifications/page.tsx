import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UploadCertForm, DeleteCertButton } from './components'

function getExpiryStatus(expiryDate: string | null): { label: string; cls: string } {
  if (!expiryDate) return { label: 'No Expiry', cls: 'bg-oatmeal/20 text-ink-soft' }

  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil < 0) return { label: 'Expired', cls: 'bg-rosewood/10 text-rosewood' }
  if (daysUntil <= 30) return { label: 'Expiring Soon', cls: 'bg-sienna/10 text-sienna' }
  return { label: 'Active', cls: 'bg-sage/10 text-sage-deep' }
}

export default async function CertificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: certifications } = await supabase
    .from('academy_certifications')
    .select('*')
    .eq('staff_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Certifications</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          Manage your certificates and licences
        </p>
      </div>

      {/* Certifications list */}
      {certifications && certifications.length > 0 ? (
        <div className="mb-8 space-y-3">
          {certifications.map((cert: any) => {
            const expiry = getExpiryStatus(cert.expiry_date)
            return (
              <div key={cert.id} className="rounded-xl border border-rule bg-white/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono text-sm font-medium text-ink">{cert.title}</p>
                      <span className="rounded-full border border-rule bg-cream-soft px-2 py-0.5 font-mono text-[10px] tracking-wider text-ink-soft">
                        {cert.cert_type}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${expiry.cls}`}>
                        {expiry.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {cert.issuing_body && (
                        <span className="font-mono text-xs text-ink-soft">Issuer: {cert.issuing_body}</span>
                      )}
                      {cert.cert_number && (
                        <span className="font-mono text-xs text-ink-soft">No: {cert.cert_number}</span>
                      )}
                      {cert.issue_date && (
                        <span className="font-mono text-xs text-ink-soft">
                          Issued: {new Date(cert.issue_date).toLocaleDateString('en-AU')}
                        </span>
                      )}
                      {cert.expiry_date && (
                        <span className="font-mono text-xs text-ink-soft">
                          Expires: {new Date(cert.expiry_date).toLocaleDateString('en-AU')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {cert.file_path && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/academy-certifications/${cert.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-rule p-1.5 text-ink-soft transition hover:border-sienna/30 hover:text-sienna"
                        title="Download"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                      </a>
                    )}
                    <DeleteCertButton certId={cert.id} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 text-oatmeal-dk">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <p className="font-mono text-sm text-ink-soft">No certifications uploaded yet. Add your first one below.</p>
        </div>
      )}

      <UploadCertForm />
    </div>
  )
}
