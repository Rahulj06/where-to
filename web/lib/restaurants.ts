import { supabase } from './supabase'
import type { IRestaurant, IRestaurantFilters } from './types'

const MIN_RATING = 4.5

export const getRestaurants = async (filters: IRestaurantFilters = {}): Promise<Array<IRestaurant>> => {
  let query = supabase
    .from('restaurants')
    .select('*')
    .or(`google_rating.gte.${MIN_RATING},google_rating.is.null`)
    .order('google_rating', { ascending: false, nullsFirst: false })
    .order('google_reviews_count', { ascending: false, nullsFirst: false })

  if (filters.cuisine) {
    query = query.contains('cuisines', [filters.cuisine])
  }

  if (filters.area) {
    query = query.eq('area', filters.area)
  }

  if (filters.is_veg !== undefined) {
    query = query.eq('is_veg', filters.is_veg)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export const getRestaurantBySlug = async (slug: string): Promise<IRestaurant | null> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}

export const getAllCuisines = async (): Promise<Array<string>> => {
  const { data } = await supabase.from('restaurants').select('cuisines')
  if (!data) return []
  const all = data.flatMap(row => row.cuisines ?? [])
  return [...new Set(all)].sort()
}

export const getAllAreas = async (): Promise<Array<string>> => {
  const { data } = await supabase.from('restaurants').select('area')
  if (!data) return []
  return [...new Set(data.map(row => row.area).filter(Boolean))].sort()
}
