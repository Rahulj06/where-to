'use client'

import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { IRestaurant, TVote } from '@/lib/types'
import { DISCOVER_SESSION_COUNT_KEY } from '@/lib/discover-constants'
import { RestaurantCard } from './RestaurantCard'
import { VoteButtons } from './VoteButtons'

const EXIT_DURATION = 0.18
const SWIPE_THRESHOLD = 100

type IStats = { yes_percentage: number | null; total_votes: number }

const fetchRandomBatch = async (
  exclude: Array<string>,
  count: number
): Promise<Array<IRestaurant>> => {
  const excludeQuery =
    exclude.length > 0 ? `exclude=${encodeURIComponent(exclude.join(','))}&` : ''
  const response = await fetch(`/api/restaurants/random?${excludeQuery}count=${count}`)
  if (!response.ok) return []
  const payload = (await response.json()) as { restaurants: Array<IRestaurant> }
  return payload.restaurants ?? []
}

const postVote = async (restaurantId: string, vote: TVote): Promise<void> => {
  await fetch('/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ restaurant_id: restaurantId, vote }),
  })
}

const fetchStats = async (restaurantId: string): Promise<IStats> => {
  const response = await fetch(`/api/restaurants/stats/${restaurantId}`)
  if (!response.ok) return { yes_percentage: null, total_votes: 0 }
  return (await response.json()) as IStats
}

export const DiscoverFeed = () => {
  const [queue, setQueue] = useState<Array<IRestaurant>>([])
  const [statsById, setStatsById] = useState<Record<string, IStats>>({})
  const [exiting, setExiting] = useState(false)
  const [booted, setBooted] = useState(false)
  const seenRef = useRef<Set<string>>(new Set())
  const statsRequestedRef = useRef<Set<string>>(new Set())
  const [sessionExplored, setSessionExplored] = useState(0)
  const motionX = useMotionValue(0)
  const rotate = useTransform(motionX, [-220, 220], [-10, 10])

  useEffect(() => {
    const stored = globalThis.sessionStorage?.getItem(DISCOVER_SESSION_COUNT_KEY)
    const parsed = stored ? Number.parseInt(stored, 10) : 0
    if (!Number.isNaN(parsed)) setSessionExplored(parsed)
  }, [])

  const bumpSession = useCallback(() => {
    setSessionExplored(previous => {
      const next = previous + 1
      try {
        globalThis.sessionStorage?.setItem(DISCOVER_SESSION_COUNT_KEY, String(next))
      } catch {
        /* sessionStorage unavailable */
      }
      return next
    })
  }, [])

  const refillFrom = useCallback(async (base: Array<IRestaurant>) => {
    const need = 3 - base.length
    if (need <= 0) return
    const exclude = [...seenRef.current]
    const more = await fetchRandomBatch(exclude, need)
    more.forEach(item => seenRef.current.add(item.id))
    setQueue([...base, ...more])
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const exclude: Array<string> = []
      const accumulated: Array<IRestaurant> = []
      while (accumulated.length < 3 && !cancelled) {
        const batch = await fetchRandomBatch(
          [...exclude, ...accumulated.map(item => item.id)],
          3 - accumulated.length
        )
        if (!batch.length) break
        batch.forEach(item => {
          seenRef.current.add(item.id)
          accumulated.push(item)
        })
      }
      if (!cancelled) {
        setQueue(accumulated)
        setBooted(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    queue.slice(0, 3).forEach(item => {
      if (statsRequestedRef.current.has(item.id)) return
      statsRequestedRef.current.add(item.id)
      void fetchStats(item.id).then(stats => {
        setStatsById(previous => ({ ...previous, [item.id]: stats }))
      })
    })
  }, [queue])

  const finishVote = useCallback(
    (restaurantId: string, vote: TVote) => {
      void postVote(restaurantId, vote)
      bumpSession()
      setQueue(previous => {
        const next = previous.slice(1)
        void refillFrom(next)
        return next
      })
      motionX.set(0)
      setExiting(false)
    },
    [bumpSession, motionX, refillFrom]
  )

  const triggerExit = useCallback(
    (vote: TVote) => {
      const current = queue[0]
      if (!current || exiting) return
      setExiting(true)
      const width =
        typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 400
      const targetX = vote === 'yes' ? width * 1.1 : -width * 1.1
      animate(motionX, targetX, {
        duration: EXIT_DURATION,
        ease: [0.4, 0, 0.2, 1],
      }).then(() => {
        finishVote(current.id, vote)
      })
    },
    [queue, exiting, motionX, finishVote]
  )

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const current = queue[0]
      if (!current || exiting) return
      const offsetX = info.offset.x
      const velocityX = info.velocity.x
      if (offsetX > SWIPE_THRESHOLD || velocityX > 400) {
        triggerExit('yes')
        return
      }
      if (offsetX < -SWIPE_THRESHOLD || velocityX < -400) {
        triggerExit('no')
        return
      }
      void animate(motionX, 0, { duration: 0.12, ease: [0.4, 0, 0.2, 1] })
    },
    [queue, exiting, motionX, triggerExit]
  )

  if (!booted) {
    return (
      <div
        className="h-[100dvh] w-full bg-neutral-950"
        aria-busy
        aria-label="Loading"
      />
    )
  }

  if (queue.length === 0) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-6 bg-black px-6 text-center">
        <p className="text-base text-white/75">You&apos;ve seen everything for now.</p>
        <Link
          href="/"
          className="text-sm font-semibold text-orange-400 hover:text-orange-300"
        >
          ← Back to list
        </Link>
      </div>
    )
  }

  const visible = queue.slice(0, 3)

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      <header className="pointer-events-auto absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="text-sm font-medium text-white/80 hover:text-white">
          ← List
        </Link>
        {sessionExplored > 0 && (
          <p className="text-xs text-white/50">You explored {sessionExplored} places</p>
        )}
      </header>

      <div className="relative h-full w-full">
        {visible.map((restaurant, index) => {
          const isTop = index === 0
          const zIndex = 30 - index
          const stats = statsById[restaurant.id] ?? {
            yes_percentage: null,
            total_votes: 0,
          }

          if (isTop) {
            return (
              <motion.div
                key={restaurant.id}
                style={{ x: motionX, rotate, zIndex }}
                className="absolute inset-0 touch-pan-y"
                drag="x"
                dragElastic={0.85}
                dragConstraints={false}
                onDragEnd={handleDragEnd}
              >
                <RestaurantCard
                  restaurant={restaurant}
                  isTop
                  yesPercentage={stats.yes_percentage}
                  totalVotes={stats.total_votes}
                />
                <VoteButtons disabled={exiting} onVote={triggerExit} />
              </motion.div>
            )
          }

          return (
            <div key={restaurant.id} className="absolute inset-0" style={{ zIndex }}>
              <RestaurantCard
                restaurant={restaurant}
                isTop={false}
                yesPercentage={stats.yes_percentage}
                totalVotes={stats.total_votes}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
