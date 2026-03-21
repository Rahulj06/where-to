import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRestaurantBySlug } from '@/lib/restaurants'

export const dynamic = 'force-dynamic'

interface IPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: IPageProps): Promise<Metadata> {
  const restaurant = await getRestaurantBySlug(params.slug)
  if (!restaurant) return { title: 'Not Found' }

  return {
    title: `${restaurant.name} — Where To?`,
    description: restaurant.notes ?? `${restaurant.name} in ${restaurant.area}, ${restaurant.city}`,
  }
}

const formatPrice = (price: number | null): string => {
  if (!price) return 'Price not available'
  return `₹${price.toLocaleString('en-IN')} for two`
}

const formatReviews = (count: number | null): string => {
  if (!count) return ''
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k reviews`
  return `${count} reviews`
}

export default async function RestaurantPage({ params }: IPageProps) {
  const restaurant = await getRestaurantBySlug(params.slug)

  if (!restaurant) {
    notFound()
  }

  const mapsUrl = restaurant.google_place_id
    ? `https://www.google.com/maps/place/?q=place_id:${restaurant.google_place_id}`
    : `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lng}`

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm transition-colors"
          >
            <span>←</span>
            <span>Back</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-card">
          <div className={`h-1.5 w-full ${restaurant.is_veg ? 'bg-green-400' : 'bg-orange-400'}`} />

          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-1">{restaurant.name}</h1>
                <p className="text-stone-400">{restaurant.area} · {restaurant.city}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`w-3 h-3 rounded-full ${restaurant.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${restaurant.is_veg ? 'text-green-700' : 'text-red-600'}`}>
                  {restaurant.is_veg ? 'Pure Veg' : 'Non-Veg'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {restaurant.google_rating && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                  <span className="text-amber-400">★</span>
                  <span className="text-amber-800 font-bold text-lg">{restaurant.google_rating}</span>
                  {restaurant.google_reviews_count && (
                    <span className="text-amber-500 text-sm">· {formatReviews(restaurant.google_reviews_count)}</span>
                  )}
                </div>
              )}

              <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5">
                <span className="text-stone-700 font-medium">{formatPrice(restaurant.price_for_two)}</span>
              </div>
            </div>

            {restaurant.cuisines.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Cuisine</h2>
                <div className="flex flex-wrap gap-2">
                  {restaurant.cuisines.map(cuisine => (
                    <span key={cuisine} className="bg-stone-100 text-stone-700 rounded-full px-3 py-1.5 text-sm font-medium">
                      {cuisine}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {restaurant.must_try.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Must Try</h2>
                <ul className="space-y-2">
                  {restaurant.must_try.map(dish => (
                    <li key={dish} className="flex items-center gap-2.5 text-stone-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                      {dish}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {restaurant.tags.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {restaurant.tags.map(tag => (
                    <span key={tag} className="bg-orange-50 text-orange-700 border border-orange-100 rounded-full px-3 py-1 text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {restaurant.notes && (
              <section className="mb-8">
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Notes</h2>
                <blockquote className="border-l-2 border-orange-200 pl-4 text-stone-600 italic text-sm leading-relaxed">
                  {restaurant.notes}
                </blockquote>
              </section>
            )}

            {restaurant.address && (
              <section className="mb-8">
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Address</h2>
                <p className="text-stone-600 text-sm leading-relaxed">{restaurant.address}</p>
              </section>
            )}

            <div className="pt-6 border-t border-stone-100">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                View on Google Maps
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
