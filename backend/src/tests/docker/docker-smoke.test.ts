import { describe, expect, it } from "vitest";

const baseUrl = process.env.DOCKER_TEST_BASE_URL || "http://localhost:4000";

describe("docker smoke", () => {
  it("responde health en /health", async () => {
    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { status?: string };
    expect(payload.status).toBe("ok");
  });

  it("expone la API en /api/events", async () => {
    const response = await fetch(`${baseUrl}/api/events`);

    expect(response.status).toBe(200);
    expect(Array.isArray(await response.json())).toBe(true);
  });
});
