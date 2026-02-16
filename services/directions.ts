export type LatLng = { latitude: number; longitude: number };

// Returns a polyline of LatLngs between two points.
// Tries Mapbox Directions API when EXPO_PUBLIC_MAPBOX_TOKEN is set; falls back to a smooth mock.
export async function getRouteBetween(start: LatLng, end: LatLng): Promise<LatLng[]> {
  const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  if (token) {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?geometries=geojson&overview=full&access_token=${token}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const coords: [number, number][] = data.routes?.[0]?.geometry?.coordinates || [];
        if (coords.length) {
          return coords.map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
        }
      }
    } catch {
      // fall through to mock
    }
  }
  const points: LatLng[] = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = start.latitude + (end.latitude - start.latitude) * t;
    const lon = start.longitude + (end.longitude - start.longitude) * t;
    const curve = Math.sin(t * Math.PI) * 0.0005;
    points.push({ latitude: lat + curve, longitude: lon - curve });
  }
  return points;
}
