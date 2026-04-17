import { describe, expect, it } from "vitest";

import { parseServiceAreaPolygon, pointInServiceArea } from "./serviceArea";

describe("parseServiceAreaPolygon", () => {
  it("parses a vertex array", () => {
    const result = parseServiceAreaPolygon(
      JSON.stringify([
        { lat: 40, lng: -74 },
        { lat: 40, lng: -73 },
        { lat: 41, lng: -73 },
      ])
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.polygon).toHaveLength(3);
  });

  it("parses a GeoJSON Polygon (lng,lat order)", () => {
    const result = parseServiceAreaPolygon(
      JSON.stringify({
        type: "Polygon",
        coordinates: [
          [
            [-74, 40],
            [-73, 40],
            [-73, 41],
            [-74, 40],
          ],
        ],
      })
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.polygon[0]).toEqual({ lat: 40, lng: -74 });
  });

  it("rejects polygons with fewer than 3 vertices", () => {
    const result = parseServiceAreaPolygon(JSON.stringify([{ lat: 40, lng: -74 }]));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("polygon-needs-3-plus-vertices");
  });

  it("rejects out-of-range coordinates", () => {
    const result = parseServiceAreaPolygon(
      JSON.stringify([
        { lat: 200, lng: -74 },
        { lat: 40, lng: -73 },
        { lat: 41, lng: -73 },
      ])
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("vertex-out-of-range");
  });

  it("treats empty JSON array as empty polygon (no restriction)", () => {
    const result = parseServiceAreaPolygon(JSON.stringify([]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.polygon).toEqual([]);
  });
});

describe("pointInServiceArea", () => {
  const polygon = [
    { lat: 40, lng: -74 },
    { lat: 40, lng: -73 },
    { lat: 41, lng: -73 },
    { lat: 41, lng: -74 },
  ];

  it("returns true for point inside", () => {
    expect(pointInServiceArea({ lat: 40.5, lng: -73.5 }, polygon)).toBe(true);
  });

  it("returns false for point outside", () => {
    expect(pointInServiceArea({ lat: 39, lng: -75 }, polygon)).toBe(false);
  });

  it("returns true for empty polygon (no restriction)", () => {
    expect(pointInServiceArea({ lat: 0, lng: 0 }, [])).toBe(true);
  });
});
