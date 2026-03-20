const axios = require('axios');
const Restaurant = require('../models/Restaurant');

const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const SEARCH_RADIUS_METERS = 2500;
const MIN_RATING = 4.5;
const MIN_REVIEW_COUNT = 200;

const PRICE_LEVEL_MAP = { 0: 1, 1: 1, 2: 2, 3: 3, 4: 4 };

const mapPriceLevel = googlePriceLevel => PRICE_LEVEL_MAP[googlePriceLevel] ?? 2;

const isDuplicate = async (name, lat, lng) => {
  const existing = await Restaurant.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    'location.lat': { $gte: lat - 0.001, $lte: lat + 0.001 },
    'location.lng': { $gte: lng - 0.001, $lte: lng + 0.001 },
  });
  return Boolean(existing);
};

const buildRestaurantFromGooglePlace = place => ({
  name: place.name,
  location: {
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
  },
  cuisines: place.types
    .filter(type => !['restaurant', 'food', 'point_of_interest', 'establishment'].includes(type))
    .slice(0, 3),
  priceRange: mapPriceLevel(place.price_level),
  rating: place.rating,
  reviewCount: place.user_ratings_total,
  source: 'google',
  priorityScore: 1,
  vibeScores: {
    romantic: 5,
    cozy: 5,
    loud: 5,
    workFriendly: 5,
  },
  crowdLevel: 5,
  aestheticScore: 5,
  address: place.vicinity,
  googlePlaceId: place.place_id,
});

const ingestNearbyRestaurants = async (lat, lng) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn('GOOGLE_PLACES_API_KEY not set — skipping ingestion');
    return;
  }

  let results = [];
  let nextPageToken = null;

  try {
    do {
      const params = {
        location: `${lat},${lng}`,
        radius: SEARCH_RADIUS_METERS,
        type: 'restaurant',
        key: apiKey,
        ...(nextPageToken && { pagetoken: nextPageToken }),
      };

      const response = await axios.get(GOOGLE_PLACES_URL, { params });
      const data = response.data;

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Google Places API error:', data.status, data.error_message);
        break;
      }

      results = results.concat(data.results || []);
      nextPageToken = data.next_page_token || null;

      // Google requires a short delay before using next_page_token
      if (nextPageToken) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } while (nextPageToken);

    const filtered = results.filter(
      place => place.rating >= MIN_RATING && place.user_ratings_total >= MIN_REVIEW_COUNT
    );

    let insertedCount = 0;

    for (const place of filtered) {
      const placeLat = place.geometry.location.lat;
      const placeLng = place.geometry.location.lng;

      const duplicate = await isDuplicate(place.name, placeLat, placeLng);
      if (duplicate) continue;

      try {
        await Restaurant.create(buildRestaurantFromGooglePlace(place));
        insertedCount++;
      } catch (err) {
        if (err.code !== 11000) {
          console.error('Error inserting restaurant:', err.message);
        }
      }
    }

    console.log(`Google ingestion: inserted ${insertedCount} of ${filtered.length} filtered results`);
  } catch (err) {
    console.error('Google ingestion failed:', err.message);
  }
};

module.exports = { ingestNearbyRestaurants };
