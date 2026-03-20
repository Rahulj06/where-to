const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    location: {
      area: { type: String, trim: true },
      city: { type: String, trim: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, trim: true, default: null },
    },
    cuisines: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    price_for_two: {
      type: Number,
      default: null,
    },
    priceRange: {
      type: Number,
      min: 1,
      max: 4,
      default: 1,
    },
    is_veg: {
      type: Boolean,
      default: false,
    },
    must_try: [{ type: String, trim: true }],
    notes: {
      type: String,
      trim: true,
      default: null,
    },
    source: {
      type: String,
      enum: ['curated', 'google', 'admin'],
      required: true,
    },
    priorityScore: {
      type: Number,
      min: 1,
      max: 4,
      default: 1,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    vibeScores: {
      romantic: { type: Number, min: 0, max: 10, default: 5 },
      cozy: { type: Number, min: 0, max: 10, default: 5 },
      loud: { type: Number, min: 0, max: 10, default: 5 },
      workFriendly: { type: Number, min: 0, max: 10, default: 5 },
    },
    crowdLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    aestheticScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    googlePlaceId: {
      type: String,
      default: null,
      sparse: true,
    },
    media: {
      cover_image: { type: String, default: null },
      images: [{ type: String }],
    },
    opening_hours: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    contact: {
      phone: { type: String, default: null },
      website: { type: String, default: null },
    },
    status: {
      type: String,
      enum: ['verified', 'to_try'],
      default: 'verified',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate restaurants by name + location
restaurantSchema.index(
  { name: 1, 'location.lat': 1, 'location.lng': 1 },
  { unique: true }
);

// Geo index for fast radius queries
restaurantSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
