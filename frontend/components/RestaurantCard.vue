<script setup lang="ts">
import type { IRestaurant } from '~/composables/useRecommendations'
import { useVibeDescription } from '~/composables/useVibeDescription'

const props = defineProps<{
  restaurant: IRestaurant
  animationDelay: number
}>()

const emit = defineEmits<{
  (e: 'feedback', restaurantId: string, liked: boolean): void
}>()

const { getVibeDescription } = useVibeDescription()

const feedback = ref<'liked' | 'disliked' | null>(null)

const vibeDescription = computed(() =>
  getVibeDescription(props.restaurant.vibeScores, props.restaurant.crowdLevel)
)

const priceIndicator = computed(() => '₹'.repeat(props.restaurant.priceRange))

const handleFeedback = (liked: boolean) => {
  feedback.value = liked ? 'liked' : 'disliked'
  emit('feedback', props.restaurant._id, liked)
}
</script>

<template>
  <div
    class="restaurant-card"
    :style="{ animationDelay: `${animationDelay}ms` }"
  >
    <!-- Header row -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 leading-snug truncate">
          {{ restaurant.name }}
        </h3>
        <p class="text-sm text-gray-500 mt-0.5">{{ vibeDescription }}</p>
      </div>
      <div class="flex flex-col items-end shrink-0">
        <span class="text-brand-500 font-semibold text-sm tracking-wide">
          {{ priceIndicator }}
        </span>
        <span class="text-gray-400 text-xs mt-0.5">{{ restaurant.distanceKm }} km away</span>
      </div>
    </div>

    <!-- Cuisines -->
    <div class="flex flex-wrap gap-1.5 mb-4">
      <span
        v-for="cuisine in restaurant.cuisines.slice(0, 3)"
        :key="cuisine"
        class="cuisine-tag"
      >
        {{ cuisine }}
      </span>
    </div>

    <!-- Footer row: rating + feedback -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <span class="text-amber-400 text-base leading-none">★</span>
        <span class="text-gray-800 font-medium text-sm">{{ restaurant.rating }}</span>
        <span class="text-gray-400 text-xs">({{ restaurant.reviewCount.toLocaleString() }})</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          :class="['feedback-btn', feedback === 'liked' ? 'active-like' : '']"
          :disabled="feedback !== null"
          aria-label="Like this restaurant"
          @click="handleFeedback(true)"
        >
          👍
        </button>
        <button
          :class="['feedback-btn', feedback === 'disliked' ? 'active-dislike' : '']"
          :disabled="feedback !== null"
          aria-label="Dislike this restaurant"
          @click="handleFeedback(false)"
        >
          👎
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.restaurant-card {
  @apply bg-white rounded-2xl p-5 shadow-sm border border-gray-100
         opacity-0 animate-fade-up transition-shadow duration-200;
  animation-fill-mode: forwards;
}

.restaurant-card:hover {
  @apply shadow-md border-gray-200;
}

.cuisine-tag {
  @apply text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium;
}

.feedback-btn {
  @apply text-lg p-1.5 rounded-full transition-all duration-150
         hover:bg-gray-100 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed;
}

.active-like {
  @apply bg-green-100 ring-2 ring-green-300;
}

.active-dislike {
  @apply bg-red-100 ring-2 ring-red-300;
}
</style>
