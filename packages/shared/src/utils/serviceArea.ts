/**
 * Service area helpers — Story 5.13
 *
 * Validates polygon shape on admin save + provides a point-in-polygon
 * check for the booking flow. Polygon is an array of `{lat, lng}`
 * vertices; empty polygon means "no restriction" (booking allowed
 * anywhere) so deployments without a configured boundary default to
 * the current behavior.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export type ServiceAreaPolygon = LatLng[];

export type ServiceAreaParseResult =
  | { ok: true; polygon: ServiceAreaPolygon }
  | { ok: false; reason: string };

function isLatLng(value: unknown): value is LatLng {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  const lat = obj.lat;
  const lng = obj.lng;
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  );
}

export function parseServiceAreaPolygon(raw: string): ServiceAreaParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "not-json" };
  }

  let vertices: unknown[] = [];
  if (Array.isArray(parsed)) {
    vertices = parsed;
  } else if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (obj.type === "Polygon" && Array.isArray(obj.coordinates)) {
      const ring = obj.coordinates[0];
      if (Array.isArray(ring)) {
        vertices = ring
          .map((pair) => {
            if (!Array.isArray(pair) || pair.length < 2) return null;
            const [lng, lat] = pair as number[];
            return { lat, lng };
          })
          .filter((v) => v !== null);
      }
    } else if (Array.isArray(obj.vertices)) {
      vertices = obj.vertices;
    }
  }

  if (vertices.length === 0) {
    return { ok: true, polygon: [] };
  }
  if (vertices.length < 3) {
    return { ok: false, reason: "polygon-needs-3-plus-vertices" };
  }

  const polygon: ServiceAreaPolygon = [];
  for (const v of vertices) {
    if (!isLatLng(v)) return { ok: false, reason: "vertex-out-of-range" };
    polygon.push({ lat: v.lat, lng: v.lng });
  }
  return { ok: true, polygon };
}

/**
 * Ray-casting algorithm. Empty polygon returns true (no restriction).
 */
export function pointInServiceArea(point: LatLng, polygon: ServiceAreaPolygon): boolean {
  if (polygon.length === 0) return true;
  if (polygon.length < 3) return false;

  let inside = false;
  const { lat, lng } = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const vi = polygon[i];
    const vj = polygon[j];
    if (!vi || !vj) continue;
    const intersect =
      vi.lng > lng !== vj.lng > lng &&
      lat < ((vj.lat - vi.lat) * (lng - vi.lng)) / (vj.lng - vi.lng + 1e-12) + vi.lat;
    if (intersect) inside = !inside;
  }
  return inside;
}
