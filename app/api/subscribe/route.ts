import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const headers = {
    'Access-Control-Allow-Origin': 'https://stillandsocial.com.au',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  const { email, first_name } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400, headers })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('shop_subscribers')
    .upsert({ email, first_name, source: 'shop' }, { onConflict: 'email' })

  if (error) return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500, headers })
  return NextResponse.json({ success: true }, { headers })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://stillandsocial.com.au',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
