'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface IFilterBarProps {
  cuisines: Array<string>
  areas: Array<string>
}

export const FilterBar = ({ cuisines, areas }: IFilterBarProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCuisine = searchParams.get('cuisine') ?? ''
  const currentArea = searchParams.get('area') ?? ''
  const currentIsVeg = searchParams.get('is_veg') === 'true'

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const clearAll = useCallback(() => {
    router.push('/', { scroll: false })
  }, [router])

  const hasFilters = Boolean(currentCuisine || currentArea || currentIsVeg)

  return (
    <div className="flex items-center gap-3 py-3 overflow-x-auto">
      <select
        value={currentCuisine}
        onChange={event => updateParam('cuisine', event.target.value)}
        className="h-9 rounded-full border border-stone-200 bg-white px-3 pr-8 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer whitespace-nowrap flex-shrink-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2378716C' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
      >
        <option value="">All Cuisines</option>
        {cuisines.map(cuisine => (
          <option key={cuisine} value={cuisine}>{cuisine}</option>
        ))}
      </select>

      <select
        value={currentArea}
        onChange={event => updateParam('area', event.target.value)}
        className="h-9 rounded-full border border-stone-200 bg-white px-3 pr-8 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer whitespace-nowrap flex-shrink-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2378716C' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
      >
        <option value="">All Areas</option>
        {areas.map(area => (
          <option key={area} value={area}>{area}</option>
        ))}
      </select>

      <button
        onClick={() => updateParam('is_veg', currentIsVeg ? '' : 'true')}
        className={`h-9 rounded-full border px-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap flex-shrink-0 transition-colors ${
          currentIsVeg
            ? 'bg-green-50 border-green-300 text-green-700'
            : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
        }`}
      >
        <span className={`w-2.5 h-2.5 rounded-full ${currentIsVeg ? 'bg-green-500' : 'bg-stone-300'}`} />
        Veg Only
      </button>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="h-9 rounded-full px-3 text-sm text-stone-400 hover:text-stone-600 whitespace-nowrap flex-shrink-0 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
