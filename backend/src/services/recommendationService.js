const Restaurant = require('../models/Restaurant');
const { haversineDistance } = require('../utils/haversine');
const { distanceScore, budgetMatchScore, vibeScore, ratingScore } = require('../utils/normalize');
const googleIngestionService = require('./googleIngestionService');

const SEARCH_RADIUS_KM = 5;
const TOP_N_RESULTS = 5;

// How many degrees lat/lng correspond to ~5 km (rough bounding box for DB query)
const LAT_LNG_DEGREE_BUFFER = 0.05;

const SCORING_WEIGHTS = {
  vibe: 0.35,
  distance: 0.25,
  budget: 0.20,
  rating: 0.15,
  priority: 0.05,
};

const PRIORITY_BOOSTS = {
  admin: 1.0,    // normalized: 40/40
  curated: 0.75, // normalized: 30/40
  google: 0.25,  // normalized: 10/40
};

const MOOD_VIBE_MAP = {
  date: restaurant => (vibeScore(restaurant.vibeScores.romantic) + vibeScore(restaurant.vibeScores.cozy)) / 2,
  chill: restaurant => vibeScore(restaurant.vibeScores.cozy),
  work: restaurant => vibeScore(restaurant.vibeScores.workFriendly),
  quick: restaurant => 1 - vibeScore(restaurant.vibeScores.loud) * 0.5,
};

const computeVibeScore = (restaurant, mood) => {
  const scoreFn = MOOD_VIBE_MAP[mood] || MOOD_VIBE_MAP.chill;
  return scoreFn(restaurant);
};

const computePriorityBoost = source => PRIORITY_BOOSTS[source] ?? 0;

const scoreRestaurant = (restaurant, userLat, userLng, mood, budget) => {
  const distKm = haversineDistance(userLat, userLng, restaurant.location.lat, restaurant.location.lng);

  const scores = {
    vibe: computeVibeScore(restaurant, mood),
    distance: distanceScore(distKm, SEARCH_RADIUS_KM),
    budget: budgetMatchScore(restaurant.priceRange || 1, budget),
    rating: ratingScore(restaurant.rating || 0),
    priority: computePriorityBoost(restaurant.source),
  };

  const total =
    SCORING_WEIGHTS.vibe * scores.vibe +
    SCORING_WEIGHTS.distance * scores.distance +
    SCORING_WEIGHTS.budget * scores.budget +
    SCORING_WEIGHTS.rating * scores.rating +
    SCORING_WEIGHTS.priority * scores.priority;

  return { restaurant, distanceKm: distKm, score: total };
};

const fetchCandidatesFromDB = async (lat, lng) => {
  return Restaurant.find({
    'location.lat': { $gte: lat - LAT_LNG_DEGREE_BUFFER, $lte: lat + LAT_LNG_DEGREE_BUFFER },
    'location.lng': { $gte: lng - LAT_LNG_DEGREE_BUFFER, $lte: lng + LAT_LNG_DEGREE_BUFFER },
  }).lean();
};

const getRecommendations = async ({ lat, lng, mood, budget }) => {
  let candidates = await fetchCandidatesFromDB(lat, lng);

  // Trigger Google ingestion if DB has no nearby restaurants
  if (candidates.length === 0) {
    await googleIngestionService.ingestNearbyRestaurants(lat, lng);
    candidates = await fetchCandidatesFromDB(lat, lng);
  }

  // Filter by real haversine distance and exact budget tolerance
  const filtered = candidates.filter(restaurant => {
    const distKm = haversineDistance(lat, lng, restaurant.location.lat, restaurant.location.lng);
    const priceRange = restaurant.priceRange || 1;
    const budgetDiff = Math.abs(priceRange - budget);
    return distKm <= SEARCH_RADIUS_KM && budgetDiff <= 1;
  });

  const scored = filtered
    .map(restaurant => scoreRestaurant(restaurant, lat, lng, mood, budget))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N_RESULTS);

  return scored.map(({ restaurant, distanceKm, score }) => ({
    ...restaurant,
    distanceKm: Math.round(distanceKm * 10) / 10,
    relevanceScore: Math.round(score * 100) / 100,
  }));
};

module.exports = { getRecommendations };
