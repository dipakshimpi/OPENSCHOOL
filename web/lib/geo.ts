/**
 * Calculates the distance between two points on Earth in meters
 * using the Haversine formula.
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * Checks if a user's current location is within a specified radius of a campus center
 */
export function isWithinGeofence(
    userLat: number,
    userLng: number,
    campusLat: number,
    campusLng: number,
    radiusMeters: number = 100
): boolean {
    const distance = calculateDistance(userLat, userLng, campusLat, campusLng);
    return distance <= radiusMeters;
}

/**
 * Common accuracy threshold for mobile/browser GPS in meters
 * Anything higher than this might be too unreliable for attendance
 */
export const GPS_ACCURACY_THRESHOLD = 50;
