import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabase } from '@/lib/supabase-route'

export const dynamic = 'force-dynamic'

interface IRouteParams {
  params: { id: string }
}

export async function GET(_request: NextRequest, context: IRouteParams) {
  const { id } = context.params
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  try {
    const supabase = createRouteSupabase()
    const { data, error } = await supabase.from('votes').select('vote').eq('restaurant_id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const rows = data ?? []
    const totalVotes = rows.length
    const yesCount = rows.filter(row => row.vote === 'yes').length
    const yesPercentage = totalVotes === 0 ? null : Math.round((yesCount / totalVotes) * 100)

    return NextResponse.json({
      restaurant_id: id,
      total_votes: totalVotes,
      yes_percentage: yesPercentage,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
