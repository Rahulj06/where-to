import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabase } from '@/lib/supabase-route'
import type { TVote } from '@/lib/types'

export const dynamic = 'force-dynamic'

const isVote = (value: unknown): value is TVote => value === 'yes' || value === 'no'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const record = body as Record<string, unknown>
  const restaurantId = record.restaurant_id
  const vote = record.vote

  if (typeof restaurantId !== 'string' || !restaurantId.length) {
    return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })
  }

  if (!isVote(vote)) {
    return NextResponse.json({ error: 'vote must be yes or no' }, { status: 400 })
  }

  try {
    const supabase = createRouteSupabase()
    const { error } = await supabase.from('votes').insert({
      restaurant_id: restaurantId,
      vote,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
