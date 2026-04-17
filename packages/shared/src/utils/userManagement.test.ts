import { describe, expect, it } from "vitest";

import { validateInviteInput } from "./userManagement";

describe("validateInviteInput", () => {
  it("accepts a valid dispatcher invite", () => {
    const result = validateInviteInput({ email: " User@Example.COM ", role: "dispatcher" });
    expect(result).toEqual({ ok: true, email: "user@example.com", role: "dispatcher" });
  });

  it("rejects empty email", () => {
    const result = validateInviteInput({ email: "", role: "admin" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("email-required");
  });

  it("rejects malformed email", () => {
    const result = validateInviteInput({ email: "not-an-email", role: "admin" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("email-invalid");
  });

  it("rejects rider/driver/family roles", () => {
    for (const role of ["rider", "driver", "family", "guest"]) {
      const result = validateInviteInput({ email: "x@y.com", role });
      expect(result.ok).toBe(false);
      if (result.ok) continue;
      expect(result.reason).toBe("role-not-allowed");
    }
  });
});
