import type { Interest, PlayerProfile, POI, Quiz } from "@/types/index";

/**
 * Filters POIs based on player interests.
 * At least 60% matching interests, 40% discovery (non-matching).
 */
export function filterPOIsByInterests(
  pois: POI[],
  interests: Interest[],
): POI[] {
  const matching = pois.filter((poi) => interests.includes(poi.category));
  const discovery = pois.filter((poi) => !interests.includes(poi.category));

  const targetMatching = Math.ceil(pois.length * 0.6);
  const targetDiscovery = pois.length - targetMatching;

  const selectedMatching = matching.slice(0, targetMatching);
  const selectedDiscovery = discovery.slice(0, targetDiscovery);

  // If not enough matching, fill with discovery and vice versa
  const result = [...selectedMatching, ...selectedDiscovery];
  if (result.length < pois.length) {
    const remaining = pois.filter((p) => !result.includes(p));
    result.push(...remaining.slice(0, pois.length - result.length));
  }

  return result;
}

/**
 * Sorts POIs by geographic proximity using nearest-neighbor heuristic.
 */
export function sortByProximity(
  pois: POI[],
  startLat: number,
  startLng: number,
): POI[] {
  if (pois.length === 0) return [];

  const remaining = [...pois];
  const sorted: POI[] = [];
  let currentLat = startLat;
  let currentLng = startLng;

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineDistance(
        currentLat,
        currentLng,
        remaining[i].latitude,
        remaining[i].longitude,
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    }

    const nearest = remaining.splice(nearestIndex, 1)[0];
    sorted.push(nearest);
    currentLat = nearest.latitude;
    currentLng = nearest.longitude;
  }

  return sorted;
}

/**
 * Haversine distance between two coordinates in meters.
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Maps player level to quiz difficulty.
 */
export function calibrateDifficulty(
  level: PlayerProfile["level"],
): Quiz["difficulty"] {
  const mapping: Record<PlayerProfile["level"], Quiz["difficulty"]> = {
    casual: "easy",
    medium: "medium",
    expert: "hard",
  };
  return mapping[level];
}

/**
 * Returns narrative tone parameters based on player age.
 */
export function adaptTone(age: number): {
  style: "playful" | "standard" | "formal";
  maxSentenceLength: number;
} {
  if (age < 14) {
    return { style: "playful", maxSentenceLength: 15 };
  }
  if (age < 30) {
    return { style: "standard", maxSentenceLength: 25 };
  }
  return { style: "formal", maxSentenceLength: 30 };
}
