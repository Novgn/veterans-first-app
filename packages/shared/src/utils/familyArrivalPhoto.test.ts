import { describe, expect, it } from "vitest";

import { pickArrivalPhotoUrl } from "./familyMessages";

describe("pickArrivalPhotoUrl", () => {
  it("returns the most recent arrived event's photo url", () => {
    const events = [
      { eventType: "arrived", photoUrl: "old.jpg", createdAt: "2026-04-01T10:00:00Z" },
      { eventType: "arrived", photoUrl: "new.jpg", createdAt: "2026-04-01T11:00:00Z" },
      { eventType: "trip_completed", photoUrl: "wrong.jpg", createdAt: "2026-04-01T12:00:00Z" },
    ];
    expect(pickArrivalPhotoUrl(events)).toBe("new.jpg");
  });

  it("returns null when no arrived event has a photo", () => {
    const events = [
      { eventType: "arrived", photoUrl: null, createdAt: "2026-04-01T10:00:00Z" },
      {
        eventType: "trip_completed",
        photoUrl: "irrelevant.jpg",
        createdAt: "2026-04-01T11:00:00Z",
      },
    ];
    expect(pickArrivalPhotoUrl(events)).toBeNull();
  });
});
