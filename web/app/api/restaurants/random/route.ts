import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabase } from '@/lib/supabase-route'
import type { IRestaurant } from '@/lib/types'

export const dynamic = 'force-dynamic'

const parseExclude = (value: string | null): Array<string> => {
  if (!value) return []
  return value
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0)
}

const fallbackRandom = async (
  supabase: ReturnType<typeof createRouteSupabase>,
  excludeIds: Array<string>,
  count: number
): Promise<Array<IRestaurant>> => {
  const { data: rows, error } = await supabase.from('restaurants').select('*').limit(300)
  if (error || !rows?.length) return []
  const pool = excludeIds.length
    ? rows.filter(row => !excludeIds.includes(row.id as string))
    : rows
  if (!pool.length) return []
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length)) as Array<IRestaurant>
}

export async function GET(request: NextRequest) {
  const excludeIds = parseExclude(request.nextUrl.searchParams.get('exclude'))
  const rawCount = request.nextUrl.searchParams.get('count')
  const count = Math.min(10, Math.max(1, Number.parseInt(rawCount ?? '1', 10) || 1))

  try {
    const supabase = createRouteSupabase()
    const { data, error } = await supabase.rpc('random_restaurants', {
      exclude_ids: excludeIds,
      n: count,
    })

    if (error) {
      const fallback = await fallbackRandom(supabase, excludeIds, count)
      return NextResponse.json({ restaurants: fallback })
    }

    const list = (data ?? []) as Array<IRestaurant>
    if (list.length >= count) {
      return NextResponse.json({ restaurants: list })
    }

    const merged = [...list]
    const seen = new Set<string>([...excludeIds, ...merged.map(r => r.id)])
    const supabase2 = createRouteSupabase()
    const { data: more, error: moreError } = await supabase2.rpc('random_restaurants', {
      exclude_ids: [...seen],
      n: count - merged.length,
    })
    if (!moreError && more?.length) {
      merged.push(...(more as Array<IRestaurant>))
    }
    if (merged.length < count) {
      const extra = await fallbackRandom(supabase, [...seen, ...merged.map(r => r.id)], count - merged.length)
      merged.push(...extra)
    }
    return NextResponse.json({ restaurants: merged.slice(0, count) })
  } catch {
    return NextResponse.json({ restaurants: [] }, { status: 200 })
  }
}
