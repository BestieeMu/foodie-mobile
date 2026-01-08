export type LatLng = { latitude: number; longitude: number };

// Mock route generator: creates a smooth polyline between start and end
export async function getRouteBetween(start: LatLng, end: LatLng): Promise<LatLng[]> {
  const points: LatLng[] = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // simple linear interpolation with slight curve
    const lat = start.latitude + (end.latitude - start.latitude) * t;
    const lon = start.longitude + (end.longitude - start.longitude) * t;
    // add subtle curve using sine to avoid perfectly straight line
    const curve = Math.sin(t * Math.PI) * 0.0005; // ~50m lateral curve
    points.push({ latitude: lat + curve, longitude: lon - curve });
  }
  return points;
}