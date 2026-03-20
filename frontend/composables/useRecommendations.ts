export interface IVibeScores {
  romantic: number
  cozy: number
  loud: number
  workFriendly: number
}

export interface IRestaurant {
  _id: string
  name: string
  cuisines: Array<string>
  priceRange: number
  rating: number
  reviewCount: number
  vibeScores: IVibeScores
  crowdLevel: number
  aestheticScore: number
  address?: string
  distanceKm: number
  relevanceScore: number
  source: 'curated' | 'google' | 'admin'
}

export type Mood = 'date' | 'chill' | 'work' | 'quick'

interface IRecommendationParams {
  lat: number
  lng: number
  mood: Mood
  budget: number
}

export const useRecommendations = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const results = ref<Array<IRestaurant>>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetch = async (params: IRecommendationParams) => {
    loading.value = true
    error.value = null
    results.value = []

    try {
      const data = await $fetch<{ results: Array<IRestaurant> }>(`${apiBase}/api/recommendations`, {
        method: 'POST',
        body: params,
      })
      results.value = data.results
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch recommendations'
    } finally {
      loading.value = false
    }
  }

  const submitFeedback = async (restaurantId: string, liked: boolean, anonymousId: string) => {
    try {
      await $fetch(`${apiBase}/api/feedback`, {
        method: 'POST',
        body: { anonymousId, restaurantId, liked },
      })
    } catch {
      // Feedback is best-effort — silently ignore failures
    }
  }

  return { results, loading, error, fetch, submitFeedback }
}
