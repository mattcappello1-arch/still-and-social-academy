export default async function OrdersPage() {
  let orders: any[] = []
  let error: string | null = null

  try {
    const res = await fetch('https://connect.squareup.com/v2/orders/search', {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location_ids: ['LYWEP6QX2PFZN'],
        query: {
          filter: {
            state_filter: { states: ['OPEN', 'COMPLETED'] },
          },
          sort: { sort_field: 'CREATED_AT', sort_order: 'DESC' },
        },
        limit: 50,
      }),
      cache: 'no-store',
    })

    const data = await res.json()
    orders = data.orders ?? []
  } catch (e: any) {
    error = e.message ?? 'Failed to fetch orders'
  }

  function formatMoney(amount?: { amount?: number; currency?: string }) {
    if (!amount?.amount) return '$0.00'
    return `$${(amount.amount / 100).toFixed(2)}`
  }

  function shortenId(id: string) {
    return id.slice(0, 8).toUpperCase()
  }

  function getCustomer(order: any) {
    const fulfillment = order.fulfillments?.[0]
    const recipient = fulfillment?.shipment_details?.recipient ?? fulfillment?.pickup_details?.recipient ?? {}
    return {
      name: recipient.display_name ?? recipient.email_address ?? '—',
      email: recipient.email_address ?? '',
    }
  }

  function getItems(order: any) {
    return (order.line_items ?? []).map((li: any) => li.name).join(', ') || '—'
  }

  function getShippingStatus(order: any) {
    const fulfillment = order.fulfillments?.[0]
    if (!fulfillment) return 'No fulfillment'
    return fulfillment.state?.replace(/_/g, ' ').toLowerCase() ?? '—'
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Orders</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">Recent shop orders from Square</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-mono text-sm text-red-700">{error}</p>
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-soft">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-rule bg-white/60">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-rule">
                <th className="px-4 py-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Order</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Date</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Customer</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Items</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase text-right">Total</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Status</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-widest text-ink-soft uppercase">Shipping</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => {
                const customer = getCustomer(order)
                const isCompleted = order.state === 'COMPLETED'
                return (
                  <tr key={order.id} className="border-b border-rule/50 last:border-0 hover:bg-oatmeal/10 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-ink">{shortenId(order.id)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                      {new Date(order.created_at).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      <br />
                      <span className="text-ink-soft/60">
                        {new Date(order.created_at).toLocaleTimeString('en-AU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm text-ink">{customer.name}</p>
                      {customer.email && (
                        <p className="font-mono text-[10px] text-ink-soft">{customer.email}</p>
                      )}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 font-mono text-xs text-ink-soft truncate">
                      {getItems(order)}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-ink text-right">
                      {formatMoney(order.total_money)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wide ${
                          isCompleted
                            ? 'bg-sage/10 text-sage'
                            : 'bg-sienna/10 text-sienna'
                        }`}
                      >
                        {order.state?.toLowerCase() ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft capitalize">
                      {getShippingStatus(order)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 font-mono text-[10px] text-ink-soft/50">
        Showing {orders.length} order{orders.length !== 1 ? 's' : ''} from Square
      </p>
    </div>
  )
}
