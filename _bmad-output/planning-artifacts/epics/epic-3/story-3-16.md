# Story 3.16: Implement Rider Database Management

**Status:** done

## Story

Dispatcher searches and browses the rider database.

## Acceptance Criteria

1. GET form accepts a query string `q`.
2. Matches on first/last name or phone via Supabase `ilike` (case-insensitive).
3. Empty state friendly message when no matches.
4. Results table limited to 100 rows.

## Implementation

`apps/web/app/dispatch/riders/page.tsx` — URL-driven search (no client JS), Supabase `.or()` with ILIKE patterns.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
