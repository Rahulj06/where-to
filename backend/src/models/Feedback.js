const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    anonymousId: {
      type: String,
      required: true,
      index: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    liked: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate feedback per user per restaurant
feedbackSchema.index({ anonymousId: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
