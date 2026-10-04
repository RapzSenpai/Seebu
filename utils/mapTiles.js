// Keyless map tiles for the native (MapLibre) map. CARTO free basemaps,
// no account or billing — same family as the web Leaflet tiles.
// Dark style replaces the old Google customMapStyle JSON (not portable).
export const mapStyleFor = (dark) =>
  dark
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// MapLibre wants [lng, lat]; Firestore spots store { latitude, longitude }.
export const lngLatOf = (c) => [c.longitude, c.latitude];

// [west, south, east, north] for Camera.fitBounds.
export const boundsOf = (list) => {
  let w = 180;
  let s = 90;
  let e = -180;
  let n = -90;
  list.forEach((c) => {
    if (c.longitude < w) w = c.longitude;
    if (c.latitude < s) s = c.latitude;
    if (c.longitude > e) e = c.longitude;
    if (c.latitude > n) n = c.latitude;
  });
  return [w, s, e, n];
};
