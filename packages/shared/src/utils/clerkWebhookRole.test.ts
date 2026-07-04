import { describe, expect, it } from "vitest";

import { resolveWebhookRole } from "./clerkWebhookRole";

describe("resolveWebhookRole", () => {
  it.each(["rider", "driver", "family", "dispatcher", "admin"] as const)(
    "returns %s when public_metadata.role is the valid role %s",
    (role) => {
      expect(resolveWebhookRole({ role })).toBe(role);
    }
  );

  it("returns null when role is an unknown string", () => {
    expect(resolveWebhookRole({ role: "superuser" })).toBeNull();
  });

  it("returns null when role is missing", () => {
    expect(resolveWebhookRole({})).toBeNull();
  });

  it("returns null when role is not a string", () => {
    expect(resolveWebhookRole({ role: 42 })).toBeNull();
    expect(resolveWebhookRole({ role: null })).toBeNull();
    expect(resolveWebhookRole({ role: ["admin"] })).toBeNull();
  });

  it("returns null when metadata itself is absent or not an object", () => {
    expect(resolveWebhookRole(undefined)).toBeNull();
    expect(resolveWebhookRole(null)).toBeNull();
    expect(resolveWebhookRole("admin")).toBeNull();
    expect(resolveWebhookRole(7)).toBeNull();
  });
});
