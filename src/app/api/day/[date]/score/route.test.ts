import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

// Minimal mock for NextResponse.json — Vitest/jsdom doesn't provide it
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => {
      return {
        body,
        status: init?.status ?? 200,
        json: async () => body,
      };
    },
  },
}));

async function callGET(date: string) {
  const request = new Request(`http://localhost/api/day/${date}/score`);
  const params = Promise.resolve({ date });
  const response = await GET(request, { params });
  return (response as unknown as { body: Record<string, unknown> }).body;
}

describe("GET /api/day/[date]/score", () => {
  it("returns 400 for an invalid date format", async () => {
    const request = new Request("http://localhost/api/day/2024-13-01/score");
    const params = Promise.resolve({ date: "not-a-date" });
    const response = await GET(request, { params });
    expect(response.status).toBe(400);
  });

  it("returns 200 with a 64-character SHA-256 hash (Issue 9 fix)", async () => {
    const body = await callGET("2024-01-15");
    expect(typeof body.hash).toBe("string");
    expect((body.hash as string).length).toBe(64);
  });

  it("hash contains only hex characters", async () => {
    const body = await callGET("2024-01-15");
    expect(body.hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("returns the requested date in the response", async () => {
    const body = await callGET("2024-03-20");
    expect(body.date).toBe("2024-03-20");
  });

  it("returns expected shape with targets, totals, pral, confidence, evidencePackVersion", async () => {
    const body = await callGET("2024-01-15");
    expect(body).toHaveProperty("targets");
    expect(body).toHaveProperty("totals");
    expect(body).toHaveProperty("pral");
    expect(body).toHaveProperty("confidence");
    expect(body).toHaveProperty("evidencePackVersion");
  });
});
