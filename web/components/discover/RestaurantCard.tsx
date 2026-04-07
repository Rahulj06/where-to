'use client'

import Image from 'next/image'
import type { IRestaurant } from '@/lib/types'
import { DEFAULT_DISCOVER_IMAGE_URL } from '@/lib/discover-constants'
import {
  getDiscoverCuisineLabel,
  getDiscoverDishLabel,
  getDiscoverLocationLabel,
  getPriceTierLabel,
} from '@/lib/discover-format'

const MIN_VOTES_FOR_SOCIAL = 3

interface IRestaurantCardProps {
  restaurant: IRestaurant
  isTop: boolean
  yesPercentage: number | null
  totalVotes: number
}

export const RestaurantCard = ({
  restaurant,
  isTop,
  yesPercentage,
  totalVotes,
}: IRestaurantCardProps) => {
  const imageSrc =
    restaurant.image_url && restaurant.image_url.trim().length > 0
      ? restaurant.image_url
      : DEFAULT_DISCOVER_IMAGE_URL
  const cuisineLine = `${getDiscoverCuisineLabel(restaurant)} • ${getPriceTierLabel(
    restaurant.price_for_two
  )}`
  const showSocial =
    totalVotes >= MIN_VOTES_FOR_SOCIAL && yesPercentage !== null

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-black ${
        isTop ? '' : 'pointer-events-none'
      }`}
    >
      <Image
        src={imageSrc}
        alt=""
        fill
        unoptimized
        sizes="100vw"
        priority={isTop}
        className="object-cover"
        draggable={false}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 pb-36 sm:p-8 sm:pb-40">
        <div>
          <p className="text-sm font-medium tracking-wide text-white/90 sm:text-base">
            {getDiscoverLocationLabel(restaurant)}
          </p>
        </div>
        <div>
          {showSocial && (
            <p className="mb-3 text-sm font-semibold text-amber-300/95">
              🔥 {yesPercentage}% said YES
            </p>
          )}
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {getDiscoverDishLabel(restaurant)}
          </h2>
          <p className="mt-2 text-lg text-white/80 sm:text-xl">{cuisineLine}</p>
        </div>
      </div>
    </div>
  )
}
