export interface IRestaurant {
  id: string
  name: string
  slug: string
  area: string
  city: string
  lat: number
  lng: number
  address: string | null
  cuisines: Array<string>
  tags: Array<string>
  price_for_two: number | null
  is_veg: boolean
  must_try: Array<string>
  notes: string | null
  source: string
  status: string
  google_place_id: string | null
  google_rating: number | null
  google_reviews_count: number | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export type TVote = 'yes' | 'no'

export interface IRestaurantStats {
  restaurant_id: string
  total_votes: number
  yes_count: number
  yes_percentage: number | null
}

export interface IRestaurantFilters {
  cuisine?: string
  area?: string
  is_veg?: boolean
}
