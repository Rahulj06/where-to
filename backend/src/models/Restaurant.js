const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    cuisines: [{ type: String, trim: true }],
    priceRange: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      required: true,
      default: 0,
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
    address: {
      type: String,
      trim: true,
    },
    googlePlaceId: {
      type: String,
      sparse: true,
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
