import { describe, expect, it } from "vitest";

import {
  DEFAULT_OPERATING_HOURS,
  isWithinOperatingHours,
  parseOperatingHoursForm,
} from "./operatingHours";

const baseInput = {
  days: {
    sunday: { open: "09:00", close: "17:00", enabled: false },
    monday: { open: "06:00", close: "20:00", enabled: true },
    tuesday: { open: "06:00", close: "20:00", enabled: true },
    wednesday: { open: "06:00", close: "20:00", enabled: true },
    thursday: { open: "06:00", close: "20:00", enabled: true },
    friday: { open: "06:00", close: "20:00", enabled: true },
    saturday: { open: "08:00", close: "18:00", enabled: true },
  },
  closures: "2026-07-04\n2026-12-25\n",
};

describe("parseOperatingHoursForm", () => {
  it("normalizes enabled days + closures", () => {
    const result = parseOperatingHoursForm(baseInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.days.sunday).toBeNull();
    expect(result.config.days.monday).toEqual({ open: "06:00", close: "20:00" });
    expect(result.config.closures).toEqual(["2026-07-04", "2026-12-25"]);
  });

  it("rejects close-before-open", () => {
    const input = JSON.parse(JSON.stringify(baseInput));
    input.days.monday.close = "05:00";
    const result = parseOperatingHoursForm(input);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("close-before-open");
  });

  it("rejects malformed closure dates", () => {
    const input = JSON.parse(JSON.stringify(baseInput));
    input.closures = "not-a-date";
    const result = parseOperatingHoursForm(input);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("invalid-closure-date");
  });
});

describe("isWithinOperatingHours", () => {
  it("rejects booking on a closure date", () => {
    const config = JSON.parse(JSON.stringify(DEFAULT_OPERATING_HOURS));
    config.closures = ["2026-07-04"];
    expect(isWithinOperatingHours("2026-07-04T10:00:00Z", config)).toBe(false);
  });

  it("rejects booking on a day when the service is closed", () => {
    expect(isWithinOperatingHours("2026-04-19T10:00:00Z", DEFAULT_OPERATING_HOURS)).toBe(false);
  });

  it("accepts booking within the window", () => {
    expect(isWithinOperatingHours("2026-04-17T10:00:00Z", DEFAULT_OPERATING_HOURS)).toBe(true);
  });

  it("rejects booking after close", () => {
    expect(isWithinOperatingHours("2026-04-17T21:00:00Z", DEFAULT_OPERATING_HOURS)).toBe(false);
  });
});
