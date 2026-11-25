import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: staff } = await supabase
    .from('academy_staff')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!staff?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: subscribers } = await supabase
    .from('shop_subscribers')
    .select('*')
    .is('unsubscribed_at', null)
    .order('subscribed_at', { ascending: false })

  const rows = [
    ['Email', 'First Name', 'Source', 'Subscribed At'].join(','),
    ...(subscribers ?? []).map((s) =>
      [s.email, s.first_name ?? '', s.source ?? '', s.subscribed_at ?? ''].join(',')
    ),
  ].join('\n')

  return new Response(rows, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
