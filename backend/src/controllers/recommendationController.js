const recommendationService = require('../services/recommendationService');

const VALID_MOODS = ['date', 'chill', 'work', 'quick'];

const getRecommendations = async (req, res) => {
  const { lat, lng, mood, budget } = req.body;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  if (!mood || !VALID_MOODS.includes(mood)) {
    return res.status(400).json({ error: `mood must be one of: ${VALID_MOODS.join(', ')}` });
  }

  const parsedBudget = parseInt(budget, 10);
  if (!parsedBudget || parsedBudget < 1 || parsedBudget > 4) {
    return res.status(400).json({ error: 'budget must be an integer between 1 and 4' });
  }

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    return res.status(400).json({ error: 'lat and lng must be valid numbers' });
  }

  try {
    const results = await recommendationService.getRecommendations({
      lat: parsedLat,
      lng: parsedLng,
      mood,
      budget: parsedBudget,
    });

    return res.json({ results });
  } catch (err) {
    console.error('Recommendation error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};

module.exports = { getRecommendations };
