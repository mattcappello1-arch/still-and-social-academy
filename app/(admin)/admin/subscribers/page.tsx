import { createClient } from '@/lib/supabase/server'
import { ExportSubscribersButton } from './export-button'

export default async function SubscribersPage() {
  const supabase = await createClient()

  const { data: subscribers, count } = await supabase
    .from('shop_subscribers')
    .select('*', { count: 'exact' })
    .is('unsubscribed_at', null)
    .order('subscribed_at', { ascending: false })

  const totalCount = count ?? 0

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">Subscribers</h1>
          <p className="mt-1 font-mono text-sm text-ink-soft">Email list from the shop</p>
        </div>
        <ExportSubscribersButton />
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
            Total Subscribers
          </p>
          <p className="font-serif text-3xl font-light text-ink">{totalCount}</p>
        </div>
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
            This Month
          </p>
          <p className="font-serif text-3xl font-light text-ink">
            {subscribers?.filter((s) => {
              const d = new Date(s.subscribed_at)
              const now = new Date()
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            }).length ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-rule bg-white/60 p-5">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
            Sources
          </p>
          <p className="font-serif text-3xl font-light text-ink">
            {new Set(subscribers?.map((s) => s.source)).size || 0}
          </p>
        </div>
      </div>

      {/* Table */}
      {(subscribers?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">
            No subscribers yet. The signup form on stillandsocial.com.au will add them here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-rule bg-white/60">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-rule">
                <th className="px-4 py-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                  Email
                </th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                  Name
                </th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                  Source
                </th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                  Subscribed
                </th>
              </tr>
            </thead>
            <tbody>
              {subscribers!.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-rule/50 last:border-0 hover:bg-oatmeal/10 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-sm text-ink">{sub.email}</td>
                  <td className="px-4 py-3 font-mono text-sm text-ink-soft">
                    {sub.first_name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-oatmeal/20 px-2 py-0.5 font-mono text-[10px] tracking-wide text-ink-soft">
                      {sub.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                    {new Date(sub.subscribed_at).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
