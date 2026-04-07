import type { IRestaurant } from '@/lib/types'

export const getDiscoverLocationLabel = (restaurant: IRestaurant): string =>
  `${restaurant.name} • ${restaurant.area}`

export const getDiscoverDishLabel = (restaurant: IRestaurant): string => {
  const first = restaurant.must_try[0]
  if (first) return `${first} 🤤`
  return `${restaurant.name} 🤤`
}

export const getDiscoverCuisineLabel = (restaurant: IRestaurant): string => {
  const list = restaurant.cuisines
  if (!list.length) return 'Food'
  return list.slice(0, 2).join(' · ')
}

export const getPriceTierLabel = (priceForTwo: number | null): string => {
  if (priceForTwo === null || priceForTwo <= 0) return '₹₹'
  if (priceForTwo < 800) return '₹'
  if (priceForTwo < 2000) return '₹₹'
  return '₹₹₹'
}
