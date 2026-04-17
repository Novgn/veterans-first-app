# Story 5.13: Implement System Configuration — Service Area

**Status:** done

## Story

As an admin, I want to configure the operating service area polygon, so rides are only booked within our region (FR83).

## Acceptance Criteria

1. **Given** an admin opens `/admin/configuration/service-area`, **Then** they see the current polygon as a list of `{lat, lng}` vertices + a JSON textarea to paste a new polygon.
2. **Given** the admin submits a polygon (GeoJSON), **Then** the service validates that it has ≥3 vertices, each vertex is a valid `{lat, lng}` pair in range, saves it to `system_config` with `config_key='service_area'`, and writes an audit_logs entry.
3. **Given** a rider tries to book outside the service area, **Then** `pointInServiceArea(point)` returns false and the server-side booking flow refuses the request. (Booking flow integration is out of scope here; this story exposes the helper and admin UI; deferred finding lists the Story 2.3 wiring.)
4. **Given** the polygon has zero vertices (empty), **Then** `pointInServiceArea` returns true (no restriction applied — default "everywhere" until config is set).

## Implementation

- `packages/shared/src/utils/serviceArea.ts` — pure helpers:
  - `parseServiceAreaPolygon(json)` → `{ok, polygon} | {ok:false, reason}`.
  - `pointInServiceArea(point, polygon)` → boolean (ray-casting).
- `/admin/configuration/service-area/page.tsx` with textarea + save server action.
- `apps/web/lib/admin/saveSystemConfig.ts` — shared save helper that writes a system_config upsert + audit log.

## Tests

- `serviceArea.test.ts` — 5 cases: valid polygon parses, invalid vertex count rejected, invalid range rejected, point inside/outside, empty polygon defaults to true.

## Dev Notes

- Safer choice: validating polygon shape on write keeps bad input out of the DB; the pointInServiceArea helper stays a pure function consumable from Edge Functions and the web side. Later we'll switch to PostGIS for faster server-side queries (deferred finding).

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
