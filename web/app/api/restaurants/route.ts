import { NextRequest, NextResponse } from 'next/server'
import { getRestaurants } from '@/lib/restaurants'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const cuisine = searchParams.get('cuisine') ?? undefined
  const area = searchParams.get('area') ?? undefined
  const isVegParam = searchParams.get('is_veg')
  const is_veg = isVegParam === 'true' ? true : isVegParam === 'false' ? false : undefined

  try {
    const restaurants = await getRestaurants({ cuisine, area, is_veg })
    return NextResponse.json({ data: restaurants, count: restaurants.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch restaurants'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
