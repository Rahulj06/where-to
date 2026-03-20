const Feedback = require('../models/Feedback');

const submitFeedback = async (req, res) => {
  const { anonymousId, restaurantId, liked } = req.body;

  if (!anonymousId || !restaurantId || liked === undefined) {
    return res.status(400).json({ error: 'anonymousId, restaurantId, and liked are required' });
  }

  if (typeof liked !== 'boolean') {
    return res.status(400).json({ error: 'liked must be a boolean' });
  }

  try {
    const feedback = await Feedback.findOneAndUpdate(
      { anonymousId, restaurantId },
      { liked },
      { upsert: true, new: true }
    );

    return res.json({ success: true, feedback });
  } catch (err) {
    console.error('Feedback error:', err.message);
    return res.status(500).json({ error: 'Failed to save feedback' });
  }
};

module.exports = { submitFeedback };
