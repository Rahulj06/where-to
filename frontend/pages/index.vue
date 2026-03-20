<script setup lang="ts">
import type { Mood } from '~/composables/useRecommendations'
import { useRecommendations } from '~/composables/useRecommendations'
import { useAnonymousId } from '~/composables/useAnonymousId'

interface IMoodOption {
  value: Mood
  label: string
  emoji: string
  description: string
}

interface IBudgetOption {
  value: number
  label: string
  indicator: string
}

const MOOD_OPTIONS: Array<IMoodOption> = [
  { value: 'date', label: 'Date night', emoji: '🕯️', description: 'Romantic & intimate' },
  { value: 'chill', label: 'Chill out', emoji: '☕', description: 'Laid-back & cozy' },
  { value: 'work', label: 'Work session', emoji: '💻', description: 'Quiet & focused' },
  { value: 'quick', label: 'Quick bite', emoji: '⚡', description: 'Fast & no-fuss' },
]

const BUDGET_OPTIONS: Array<IBudgetOption> = [
  { value: 1, label: 'Budget', indicator: '₹' },
  { value: 2, label: 'Moderate', indicator: '₹₹' },
  { value: 3, label: 'Splurge', indicator: '₹₹₹' },
  { value: 4, label: 'Fine dining', indicator: '₹₹₹₹' },
]

const { results, loading, error, fetch, submitFeedback } = useRecommendations()
const { getOrCreate } = useAnonymousId()

const selectedMood = ref<Mood | null>(null)
const selectedBudget = ref<number | null>(null)
const locationError = ref<string | null>(null)
const hasSearched = ref(false)

const canSearch = computed(() => selectedMood.value !== null && selectedBudget.value !== null)

const getLocation = (): Promise<GeolocationCoordinates> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      position => resolve(position.coords),
      () => reject(new Error('Location access denied. Please allow location to get recommendations.'))
    )
  })

const handleSearch = async () => {
  if (!canSearch.value) return

  locationError.value = null

  let coords: GeolocationCoordinates

  try {
    coords = await getLocation()
  } catch (err) {
    locationError.value = err instanceof Error ? err.message : 'Could not get location'
    return
  }

  hasSearched.value = true

  await fetch({
    lat: coords.latitude,
    lng: coords.longitude,
    mood: selectedMood.value!,
    budget: selectedBudget.value!,
  })
}

const handleFeedback = (restaurantId: string, liked: boolean) => {
  const anonymousId = getOrCreate()
  submitFeedback(restaurantId, liked, anonymousId)
}

const handleReset = () => {
  hasSearched.value = false
  selectedMood.value = null
  selectedBudget.value = null
  locationError.value = null
}
</script>

<template>
  <div class="min-h-screen bg-stone-50 font-sans">
    <!-- Hero header -->
    <header class="bg-white border-b border-gray-100 px-6 py-5">
      <div class="max-w-xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="font-display text-2xl text-gray-900 leading-none">Where To?</h1>
          <p class="text-gray-400 text-sm mt-1">Find your next table in Mumbai</p>
        </div>
        <button
          v-if="hasSearched"
          class="text-sm text-brand-500 font-medium hover:text-brand-600 transition-colors"
          @click="handleReset"
        >
          ← Start over
        </button>
      </div>
    </header>

    <main class="max-w-xl mx-auto px-6 py-8">
      <!-- ── Selection panel ─────────────────────────────────────────────── -->
      <div v-if="!hasSearched" class="space-y-8">
        <!-- Mood selection -->
        <section>
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            What's the vibe?
          </h2>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="option in MOOD_OPTIONS"
              :key="option.value"
              :class="[
                'mood-btn',
                selectedMood === option.value ? 'mood-btn--active' : '',
              ]"
              @click="selectedMood = option.value"
            >
              <span class="text-2xl mb-1 block">{{ option.emoji }}</span>
              <span class="font-semibold text-sm block">{{ option.label }}</span>
              <span class="text-xs text-gray-400 block mt-0.5">{{ option.description }}</span>
            </button>
          </div>
        </section>

        <!-- Budget selection -->
        <section>
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Budget per person
          </h2>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="option in BUDGET_OPTIONS"
              :key="option.value"
              :class="[
                'budget-btn',
                selectedBudget === option.value ? 'budget-btn--active' : '',
              ]"
              @click="selectedBudget = option.value"
            >
              <span class="block font-semibold text-sm">{{ option.indicator }}</span>
              <span class="block text-xs text-gray-400 mt-0.5 truncate">{{ option.label }}</span>
            </button>
          </div>
        </section>

        <!-- Location error -->
        <p v-if="locationError" class="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
          {{ locationError }}
        </p>

        <!-- CTA -->
        <button
          :disabled="!canSearch"
          :class="[
            'w-full py-4 rounded-2xl text-base font-semibold transition-all duration-200',
            canSearch
              ? 'bg-brand-500 text-white hover:bg-brand-600 active:scale-95 shadow-lg shadow-brand-500/20'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed',
          ]"
          @click="handleSearch"
        >
          Find my table →
        </button>
      </div>

      <!-- ── Loading state ───────────────────────────────────────────────── -->
      <div v-else-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
        <p class="text-gray-400 text-sm animate-pulse-soft">Finding the right table for you…</p>
      </div>

      <!-- ── Error state ─────────────────────────────────────────────────── -->
      <div v-else-if="error" class="text-center py-20">
        <p class="text-4xl mb-4">😕</p>
        <p class="text-gray-500 mb-6">{{ error }}</p>
        <button
          class="text-brand-500 font-medium hover:text-brand-600 text-sm"
          @click="handleReset"
        >
          Try again
        </button>
      </div>

      <!-- ── Empty state ─────────────────────────────────────────────────── -->
      <div v-else-if="results.length === 0" class="text-center py-20">
        <p class="text-4xl mb-4">🔍</p>
        <p class="text-gray-500 mb-2">No restaurants found nearby</p>
        <p class="text-gray-400 text-sm mb-6">Try adjusting your budget or mood</p>
        <button
          class="text-brand-500 font-medium hover:text-brand-600 text-sm"
          @click="handleReset"
        >
          ← Change filters
        </button>
      </div>

      <!-- ── Results ─────────────────────────────────────────────────────── -->
      <div v-else>
        <div class="flex items-baseline justify-between mb-5">
          <h2 class="font-display text-xl text-gray-900">
            {{ results.length }} great option{{ results.length > 1 ? 's' : '' }} for you
          </h2>
          <button
            class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            @click="handleReset"
          >
            Change
          </button>
        </div>

        <div class="space-y-4">
          <RestaurantCard
            v-for="(restaurant, index) in results"
            :key="restaurant._id"
            :restaurant="restaurant"
            :animation-delay="index * 80"
            @feedback="handleFeedback"
          />
        </div>

        <p class="text-center text-xs text-gray-300 mt-8">
          Showing top results within 5 km · Tap 👍👎 to improve future picks
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.mood-btn {
  @apply bg-white border border-gray-200 rounded-2xl p-4 text-left
         transition-all duration-150 hover:border-brand-300 hover:shadow-sm
         active:scale-95 cursor-pointer;
}

.mood-btn--active {
  @apply border-brand-400 bg-brand-50 shadow-sm ring-2 ring-brand-200;
}

.budget-btn {
  @apply bg-white border border-gray-200 rounded-xl py-3 px-2 text-center
         transition-all duration-150 hover:border-brand-300
         active:scale-95 cursor-pointer;
}

.budget-btn--active {
  @apply border-brand-400 bg-brand-50 ring-2 ring-brand-200;
}
</style>
