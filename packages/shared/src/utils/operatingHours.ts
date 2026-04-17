/**
 * Operating hours helpers — Story 5.15
 *
 * Per-day open/close windows (HH:MM strings in the service's local
 * wall-clock time) + a list of yyyy-mm-dd closure dates. The booking
 * flow calls `isWithinOperatingHours(dateIso, config)`; the admin UI
 * uses `parseOperatingHoursForm`.
 */

export const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type DayKey = (typeof DAY_KEYS)[number];

export interface DayWindow {
  open: string;
  close: string;
}

export interface OperatingHoursConfig {
  days: Record<DayKey, DayWindow | null>;
  closures: string[];
}

export const DEFAULT_OPERATING_HOURS: OperatingHoursConfig = {
  days: {
    sunday: null,
    monday: { open: "06:00", close: "20:00" },
    tuesday: { open: "06:00", close: "20:00" },
    wednesday: { open: "06:00", close: "20:00" },
    thursday: { open: "06:00", close: "20:00" },
    friday: { open: "06:00", close: "20:00" },
    saturday: { open: "08:00", close: "18:00" },
  },
  closures: [],
};

const TIME_REGEX = /^(\d{2}):(\d{2})$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function timeToMinutes(time: string): number | null {
  const match = TIME_REGEX.exec(time);
  if (!match) return null;
  const hh = Number.parseInt(match[1] ?? "", 10);
  const mm = Number.parseInt(match[2] ?? "", 10);
  if (hh < 0 || hh > 24 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}

export type OperatingHoursParseResult =
  | { ok: true; config: OperatingHoursConfig }
  | { ok: false; reason: string; day?: DayKey };

export function parseOperatingHoursForm(input: {
  days: Record<DayKey, { open: string; close: string; enabled: boolean }>;
  closures: string;
}): OperatingHoursParseResult {
  const days: Record<DayKey, DayWindow | null> = {} as Record<DayKey, DayWindow | null>;
  for (const day of DAY_KEYS) {
    const entry = input.days[day];
    if (!entry.enabled) {
      days[day] = null;
      continue;
    }
    const openMinutes = timeToMinutes(entry.open);
    const closeMinutes = timeToMinutes(entry.close);
    if (openMinutes == null || closeMinutes == null) {
      return { ok: false, reason: "invalid-time", day };
    }
    if (closeMinutes <= openMinutes) {
      return { ok: false, reason: "close-before-open", day };
    }
    days[day] = { open: entry.open, close: entry.close };
  }

  const closures: string[] = [];
  for (const line of input.closures.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!DATE_REGEX.test(trimmed)) {
      return { ok: false, reason: "invalid-closure-date" };
    }
    closures.push(trimmed);
  }

  return {
    ok: true,
    config: { days, closures },
  };
}

export function isWithinOperatingHours(iso: string, config: OperatingHoursConfig): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const dateIso = date.toISOString().slice(0, 10);
  if (config.closures.includes(dateIso)) return false;
  const day = DAY_KEYS[date.getUTCDay()];
  if (!day) return false;
  const window = config.days[day];
  if (!window) return false;
  const openMinutes = timeToMinutes(window.open);
  const closeMinutes = timeToMinutes(window.close);
  if (openMinutes == null || closeMinutes == null) return false;
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  return minutes >= openMinutes && minutes < closeMinutes;
}
