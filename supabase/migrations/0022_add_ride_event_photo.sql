-- Migration: 0022_add_ride_event_photo
-- Story 3.9: Photo arrival confirmation.
-- Adds a nullable photo_url to ride_events. Storage bucket creation is
-- declarative and handled by Supabase tooling, not SQL migrations.

ALTER TABLE ride_events
  ADD COLUMN IF NOT EXISTS photo_url TEXT;
