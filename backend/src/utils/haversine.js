const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the great-circle distance between two coordinates in kilometres.
 * Uses the Haversine formula.
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = deg => (deg * Math.PI) / 180;

  const deltaLat = toRad(lat2 - lat1);
  const deltaLng = toRad(lng2 - lng1);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(deltaLng / 2) ** 2;

  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * centralAngle;
};

module.exports = { haversineDistance };
