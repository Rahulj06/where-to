import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface IRawRestaurant {
  id: string
  name: string
  slug: string
  location: { area: string; city: string; lat: number; lng: number; address: string | null }
  cuisines: Array<string>
  tags: Array<string>
  price_for_two: number | null
  is_veg: boolean
  must_try: Array<string>
  notes: string | null
  source: string
  status: string
  google: { place_id: string | null; rating: number | null; reviews_count: number | null }
  meta: { created_at: string; updated_at: string }
  media?: { cover_image: string | null; images: Array<string> }
}

const dataPath = path.join(__dirname, '../../backend/src/data/restaurants.json')
const raw: Array<IRawRestaurant> = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

const rows = raw.map(r => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  area: r.location.area,
  city: r.location.city,
  lat: r.location.lat,
  lng: r.location.lng,
  address: r.location.address,
  cuisines: r.cuisines,
  tags: r.tags,
  price_for_two: r.price_for_two,
  is_veg: r.is_veg,
  must_try: r.must_try,
  notes: r.notes,
  source: r.source,
  status: r.status,
  google_place_id: r.google.place_id,
  google_rating: r.google.rating,
  google_reviews_count: r.google.reviews_count,
  image_url: r.media?.cover_image ?? null,
  created_at: r.meta.created_at,
  updated_at: r.meta.updated_at,
}))

const run = async () => {
  console.log(`Importing ${rows.length} restaurants...`)

  const { error, count } = await supabase
    .from('restaurants')
    .upsert(rows, { onConflict: 'id', count: 'exact' })

  if (error) {
    console.error('Import failed:', error.message)
    process.exit(1)
  }

  console.log(`Done — ${count} rows upserted.`)
}

run()
