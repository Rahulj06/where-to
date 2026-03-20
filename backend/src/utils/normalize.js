/**
 * Normalizes a value from [min, max] to [0, 1].
 * Returns 0 if the range is zero to avoid division by zero.
 */
const normalize = (value, min, max) => {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

/**
 * Inverts a normalized score: closer = higher score.
 * distanceKm is clipped to maxKm before normalizing.
 */
const distanceScore = (distanceKm, maxKm = 5) => {
  const clipped = Math.min(distanceKm, maxKm);
  return 1 - clipped / maxKm;
};

/**
 * Returns 1 if restaurant price matches budget exactly,
 * decays by 0.25 per price tier difference.
 */
const budgetMatchScore = (priceRange, budget) => {
  const diff = Math.abs(priceRange - budget);
  return Math.max(0, 1 - diff * 0.25);
};

/**
 * Normalizes a 0–10 vibe score to [0, 1].
 */
const vibeScore = value => normalize(value, 0, 10);

/**
 * Normalizes a 0–5 star rating to [0, 1].
 */
const ratingScore = rating => normalize(rating, 0, 5);

module.exports = { normalize, distanceScore, budgetMatchScore, vibeScore, ratingScore };
