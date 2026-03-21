import { Suspense } from 'react'
import { getRestaurants, getAllCuisines, getAllAreas } from '@/lib/restaurants'
import { FilterBar } from '@/components/FilterBar'
import { RestaurantCard } from '@/components/RestaurantCard'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonGrid } from '@/components/SkeletonCard'

export const dynamic = 'force-dynamic'

interface IPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

const getString = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

export default async function HomePage({ searchParams }: IPageProps) {
  const cuisine = getString(searchParams.cuisine)
  const area = getString(searchParams.area)
  const isVeg = getString(searchParams.is_veg) === 'true' ? true : undefined

  const [restaurants, cuisines, areas] = await Promise.all([
    getRestaurants({ cuisine, area, is_veg: isVeg }),
    getAllCuisines(),
    getAllAreas(),
  ])

  const activeFiltersCount = [cuisine, area, isVeg].filter(Boolean).length

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Where To?</h1>
              <p className="text-stone-500 mt-1 text-sm">Curated restaurants, nothing else.</p>
            </div>
            <p className="text-stone-400 text-sm hidden sm:block">
              {restaurants.length} {restaurants.length === 1 ? 'place' : 'places'}
              {activeFiltersCount > 0 && (
                <span className="text-orange-500"> · {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active</span>
              )}
            </p>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Suspense fallback={<div className="h-14" />}>
            <FilterBar cuisines={cuisines} areas={areas} />
          </Suspense>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {restaurants.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 border-t border-stone-200 mt-8">
        <p className="text-stone-400 text-xs text-center">
          Curated with care · Only restaurants worth your time
        </p>
      </footer>
    </div>
  )
}
