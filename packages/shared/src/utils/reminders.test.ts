/**
 * Tests for ride reminder helpers (Story 4.6).
 */

import { describe, expect, it } from "vitest";

import {
  buildReminderMessage,
  windowRange,
  windowToNotificationType,
  type ReminderRide,
} from "./reminders";

const baseRide: ReminderRide = {
  id: "ride-1",
  scheduledPickupTime: "2026-05-01T14:30:00Z",
  pickupAddress: "123 Main St",
  dropoffAddress: "Austin VA Clinic",
  driverName: null,
};

describe("buildReminderMessage", () => {
  it("creates a 24-hour reminder", () => {
    const message = buildReminderMessage(24, baseRide);
    expect(message.title).toBe("Ride tomorrow");
    expect(message.body).toContain("123 Main St");
    expect(message.body).toContain("Austin VA Clinic");
  });

  it("creates a 1-hour reminder without driver name", () => {
    const message = buildReminderMessage(1, baseRide);
    expect(message.title).toContain("1 hour");
    expect(message.body).not.toContain("Your driver is");
  });

  it("includes driver name when present in the 1-hour reminder", () => {
    const message = buildReminderMessage(1, { ...baseRide, driverName: "Mike" });
    expect(message.body).toContain("Mike");
  });
});

describe("windowToNotificationType", () => {
  it("maps 24 -> reminder_24h and 1 -> reminder_1h", () => {
    expect(windowToNotificationType(24)).toBe("reminder_24h");
    expect(windowToNotificationType(1)).toBe("reminder_1h");
  });
});

describe("windowRange", () => {
  it("brackets the target time with +/-5 minutes", () => {
    const now = new Date("2026-05-01T10:00:00Z");
    const { start, end } = windowRange(now, 1);
    expect(start.toISOString()).toBe("2026-05-01T10:55:00.000Z");
    expect(end.toISOString()).toBe("2026-05-01T11:05:00.000Z");
  });

  it("handles the 24h window", () => {
    const now = new Date("2026-05-01T10:00:00Z");
    const { start, end } = windowRange(now, 24);
    expect(start.toISOString()).toBe("2026-05-02T09:55:00.000Z");
    expect(end.toISOString()).toBe("2026-05-02T10:05:00.000Z");
  });
});
