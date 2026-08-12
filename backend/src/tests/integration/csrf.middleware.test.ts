import { describe, expect, it, vi } from "vitest";
import { enforceCsrfForCookieAuth } from "../../middleware/httpSecurity.js";

describe("enforceCsrfForCookieAuth", () => {
  it("permits public event registration requests without a CSRF token", () => {
    const req = {
      method: "POST",
      path: "/api/events/12/assist",
      cookies: {},
      header: vi.fn(() => undefined),
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    const next = vi.fn();

    enforceCsrfForCookieAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
