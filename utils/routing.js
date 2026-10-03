// Routing helpers for SeeBu maps. Expo Go safe: plain fetch, no native modules.
// Routing API: OSRM public demo server — free, no key, no billing.
// If it fails (rate limit / offline) callers fall back to straight-line
// distance + external maps handoff. ponytail: swap BASE_URL for self-hosted
// OSRM / OpenRouteService (needs key) / Google Routes (needs billing) later.
const OSRM_BASE = 'https://router.project-osrm.org/route/v1';

// Standard polyline decoder (~15 lines, avoids a new package).
export function decodePolyline(str) {
  const coords = [];
  let lat = 0;
  let lng = 0;
  let i = 0;
  while (i < str.length) {
    let shift = 0;
    let result = 0;
    let byte;
    do {
      byte = str.charCodeAt(i++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      byte = str.charCodeAt(i++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return coords;
}

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function formatEta(min) {
  if (min < 1) return '<1 min';
  if (min < 60) return `\u2248${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m === 0 ? `\u2248${h} hr` : `\u2248${h} hr ${m} min`;
}

// Returns { coords, distanceKm, etaMin } or throws with a human message.
export async function fetchRoute(from, to, profile = 'driving') {
  const url =
    `${OSRM_BASE}/${profile}/` +
    `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
    '?overview=full&geometries=polyline';
  let data;
  try {
    const res = await fetch(url);
    data = await res.json();
  } catch {
    throw new Error('Route server unreachable. Check connection.');
  }
  const route = data?.routes?.[0];
  if (data?.code !== 'Ok' || !route) {
    throw new Error('No road route found. Try external navigation.');
  }
  return {
    coords: decodePolyline(route.geometry),
    distanceKm: route.distance / 1000,
    etaMin: route.duration / 60,
  };
}
