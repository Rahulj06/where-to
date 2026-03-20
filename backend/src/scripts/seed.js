require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const rawData = require('../data/restaurants.json');

const toPriceRange = price_for_two => {
  if (!price_for_two) return 1;
  if (price_for_two <= 300) return 1;
  if (price_for_two <= 800) return 2;
  if (price_for_two <= 2000) return 3;
  return 4;
};

const toPriorityScore = status => (status === 'to_try' ? 1 : 2);

const buildDocument = r => ({
  name: r.name,
  slug: r.slug,
  location: {
    area: r.location.area,
    city: r.location.city,
    lat: r.location.lat,
    lng: r.location.lng,
    address: r.location.address,
  },
  cuisines: r.cuisines,
  tags: r.tags,
  price_for_two: r.price_for_two,
  priceRange: toPriceRange(r.price_for_two),
  is_veg: r.is_veg,
  must_try: r.must_try,
  notes: r.notes,
  source: r.source,
  status: r.status || 'verified',
  priorityScore: toPriorityScore(r.status),
  googlePlaceId: r.google.place_id,
  media: r.media,
  opening_hours: r.opening_hours,
  contact: r.contact,
});

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/where-to');
    console.log('Connected to MongoDB');

    let inserted = 0;
    let skipped = 0;

    for (const raw of rawData) {
      try {
        await Restaurant.create(buildDocument(raw));
        inserted++;
      } catch (err) {
        if (err.code === 11000) {
          skipped++;
        } else {
          console.error(`Failed to insert "${raw.name}":`, err.message);
        }
      }
    }

    console.log(`Seed complete: ${inserted} inserted, ${skipped} skipped (duplicates)`);
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
