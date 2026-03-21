import Link from 'next/link'
import type { IRestaurant } from '@/lib/types'

interface IRestaurantCardProps {
  restaurant: IRestaurant
}

const formatPrice = (price: number | null): string => {
  if (!price) return ''
  return `₹${price.toLocaleString('en-IN')} for two`
}

const formatReviews = (count: number | null): string => {
  if (!count) return ''
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return `${count}`
}

export const RestaurantCard = ({ restaurant }: IRestaurantCardProps) => {
  const topDishes = restaurant.must_try.slice(0, 2)
  const reviewsLabel = formatReviews(restaurant.google_reviews_count)
  const priceLabel = formatPrice(restaurant.price_for_two)

  return (
    <Link href={`/restaurant/${restaurant.slug}`} className="block group">
      <article className="h-full bg-white rounded-2xl border border-stone-200 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                restaurant.is_veg ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                restaurant.is_veg ? 'text-green-700' : 'text-red-600'
              }`}
            >
              {restaurant.is_veg ? 'Pure Veg' : 'Non-Veg'}
            </span>
          </div>

          {restaurant.google_rating && (
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1">
              <span className="text-amber-400 text-xs leading-none">★</span>
              <span className="text-amber-700 text-xs font-semibold">{restaurant.google_rating}</span>
              {reviewsLabel && (
                <span className="text-amber-400 text-xs">({reviewsLabel})</span>
              )}
            </div>
          )}
        </div>

        <h2 className="text-stone-900 font-semibold text-base mb-0.5 line-clamp-1 group-hover:text-orange-600 transition-colors">
          {restaurant.name}
        </h2>

        <p className="text-stone-400 text-sm mb-4">
          {restaurant.area}
          {restaurant.city && restaurant.city !== restaurant.area && (
            <> · {restaurant.city}</>
          )}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {restaurant.cuisines.slice(0, 3).map(cuisine => (
            <span
              key={cuisine}
              className="text-xs bg-stone-100 text-stone-600 rounded-full px-2.5 py-1"
            >
              {cuisine}
            </span>
          ))}
        </div>

        {topDishes.length > 0 && (
          <p className="text-stone-500 text-sm mb-4 line-clamp-1">
            <span className="text-stone-400">Must try: </span>
            {topDishes.join(', ')}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <span className="text-stone-600 text-sm font-medium">{priceLabel}</span>
          <span className="text-stone-300 group-hover:text-orange-500 transition-colors text-lg leading-none">
            →
          </span>
        </div>
      </article>
    </Link>
  )
}
