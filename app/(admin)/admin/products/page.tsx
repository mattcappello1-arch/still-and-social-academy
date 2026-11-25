const PRODUCT_NAMES = [
  'Signature Candle',
  'Gift of Pause',
  'Love Tea, Single',
  '3 Tea Gift Pack',
]

async function searchProduct(name: string) {
  const res = await fetch('https://connect.squareup.com/v2/catalog/search', {
    method: 'POST',
    headers: {
      'Square-Version': '2024-01-18',
      'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      object_types: ['ITEM'],
      query: {
        exact_query: {
          attribute_name: 'name',
          attribute_value: name,
        },
      },
    }),
    cache: 'no-store',
  })
  const data = await res.json()
  return data.objects?.[0] ?? null
}

function formatPrice(variation: any) {
  const money = variation?.item_variation_data?.price_money
  if (!money?.amount) return '—'
  return `$${(money.amount / 100).toFixed(2)}`
}

export default async function ProductsPage() {
  let products: any[] = []
  let error: string | null = null

  try {
    const results = await Promise.all(PRODUCT_NAMES.map(searchProduct))
    products = results.map((item, i) => ({
      searchName: PRODUCT_NAMES[i],
      item,
    }))
  } catch (e: any) {
    error = e.message ?? 'Failed to fetch products'
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Products</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">Rituals collection from Square catalog</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-mono text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {products.map(({ searchName, item }) => {
          const variations = item?.item_data?.variations ?? []
          const firstVariation = variations[0]
          const price = formatPrice(firstVariation)
          const itemId = item?.id ?? '—'
          const name = item?.item_data?.name ?? searchName

          return (
            <div
              key={searchName}
              className="rounded-xl border border-rule bg-white/60 p-5 transition hover:border-sienna/20"
            >
              <div className="mb-3">
                <h3 className="font-serif text-lg font-light text-ink">{name}</h3>
                {item ? (
                  <p className="mt-1 font-mono text-xl text-ink">{price}</p>
                ) : (
                  <p className="mt-1 font-mono text-sm text-sienna">Not found in catalog</p>
                )}
              </div>

              <div className="space-y-1.5 border-t border-rule/50 pt-3">
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                    Item ID
                  </span>
                  <span className="font-mono text-xs text-ink-soft">
                    {itemId !== '—' ? itemId.slice(0, 16) + '...' : '—'}
                  </span>
                </div>
                {variations.length > 1 && (
                  <div className="flex justify-between">
                    <span className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                      Variations
                    </span>
                    <span className="font-mono text-xs text-ink-soft">
                      {variations.length}
                    </span>
                  </div>
                )}
              </div>

              {item && (
                <a
                  href={`https://squareup.com/dashboard/items/library/${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-center rounded-lg border border-rule bg-white/60 px-3 py-2 font-mono text-xs tracking-wide text-ink transition hover:border-sienna/30 hover:text-sienna"
                >
                  Edit in Square Dashboard
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
