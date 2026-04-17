/**
 * Tests for useDriverEarnings aggregation (Story 3.8)
 *
 * Focused on the pure aggregation function; the hook wiring reuses the same
 * clerk/supabase mock pattern proved in prior tests.
 */

import { aggregateEarnings, formatMoneyCents } from '../useDriverEarnings';

describe('formatMoneyCents', () => {
  it.each([
    [0, '$0.00'],
    [100, '$1.00'],
    [12345, '$123.45'],
    [99, '$0.99'],
  ])('formats %s cents as %s', (cents, expected) => {
    expect(formatMoneyCents(cents)).toBe(expected);
  });
});

describe('aggregateEarnings', () => {
  const wednesdayNoon = new Date('2026-04-15T12:00:00Z'); // fixed reference "now"

  it('returns all zeros for empty input', () => {
    const out = aggregateEarnings([], wednesdayNoon);
    expect(out.todayCents).toBe(0);
    expect(out.weekCents).toBe(0);
    expect(out.monthCents).toBe(0);
    expect(out.allTimeCents).toBe(0);
    expect(out.recent).toEqual([]);
  });

  it('buckets by today / week / month correctly', () => {
    const out = aggregateEarnings(
      [
        {
          id: 'r1',
          fare_cents: 2500,
          completed_at: '2026-04-15T11:00:00Z',
          pickup_address: 'A',
          dropoff_address: 'B',
        }, // today
        {
          id: 'r2',
          fare_cents: 1500,
          completed_at: '2026-04-14T10:00:00Z',
          pickup_address: 'C',
          dropoff_address: 'D',
        }, // this week (Tue)
        {
          id: 'r3',
          fare_cents: 500,
          completed_at: '2026-04-01T10:00:00Z',
          pickup_address: 'E',
          dropoff_address: 'F',
        }, // this month earlier
        {
          id: 'r4',
          fare_cents: 999,
          completed_at: '2025-12-01T10:00:00Z',
          pickup_address: 'G',
          dropoff_address: 'H',
        }, // older
      ],
      wednesdayNoon
    );

    expect(out.todayCents).toBe(2500);
    expect(out.weekCents).toBe(2500 + 1500);
    expect(out.monthCents).toBe(2500 + 1500 + 500);
    expect(out.allTimeCents).toBe(2500 + 1500 + 500 + 999);
    expect(out.tripCountToday).toBe(1);
    expect(out.tripCountWeek).toBe(2);
    expect(out.tripCountMonth).toBe(3);
  });

  it('skips rides missing completed_at but still counts all-time', () => {
    const out = aggregateEarnings(
      [
        {
          id: 'r1',
          fare_cents: 1000,
          completed_at: null,
          pickup_address: 'A',
          dropoff_address: 'B',
        },
      ],
      wednesdayNoon
    );

    expect(out.todayCents).toBe(0);
    expect(out.weekCents).toBe(0);
    expect(out.monthCents).toBe(0);
    expect(out.allTimeCents).toBe(1000);
    expect(out.recent).toEqual([]); // excluded because no completed_at
  });

  it('returns up to 10 most-recent completed rides', () => {
    const rows = Array.from({ length: 15 }, (_, i) => ({
      id: `r${i}`,
      fare_cents: 500,
      completed_at: new Date(Date.UTC(2026, 3, 10 + (i % 5))).toISOString(),
      pickup_address: 'X',
      dropoff_address: 'Y',
    }));

    const out = aggregateEarnings(rows, wednesdayNoon);
    expect(out.recent.length).toBe(10);
  });
});
