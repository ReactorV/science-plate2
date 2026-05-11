import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchFdc, fetchFdcFood } from "./search";

const MOCK_FOODS = [
  { fdcId: 175167, description: "Salmon, Atlantic, wild", dataType: "Foundation", score: 978 },
  { fdcId: 175168, description: "Salmon, Atlantic, farmed", dataType: "Foundation", score: 965 },
];

describe("searchFdc", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns foods array on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ foods: MOCK_FOODS, totalHits: 2 }),
      }),
    );

    const results = await searchFdc("salmon", "test-api-key");
    expect(results).toHaveLength(2);
    expect(results[0].description).toBe("Salmon, Atlantic, wild");
  });

  it("passes query + pageSize + dataType in request body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ foods: [], totalHits: 0 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await searchFdc("oats", "key123", { limit: 5, dataTypes: ["Foundation"] });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.query).toBe("oats");
    expect(body.pageSize).toBe(5);
    expect(body.dataType).toEqual(["Foundation"]);
  });

  it("uses default limit=10 and Foundation+SR Legacy when no options provided", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ foods: [], totalHits: 0 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await searchFdc("chicken", "key");
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.pageSize).toBe(10);
    expect(body.dataType).toEqual(["Foundation", "SR Legacy"]);
  });

  it("returns empty array when foods field is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ totalHits: 0 }),
      }),
    );
    const results = await searchFdc("xyz", "key");
    expect(results).toEqual([]);
  });

  it("throws on non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
      }),
    );
    await expect(searchFdc("salmon", "key")).rejects.toThrow("FDC search API error: 429");
  });
});

describe("fetchFdcFood", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on success", async () => {
    const mockFood = { fdcId: 175167, description: "Salmon", foodNutrients: [] };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockFood,
      }),
    );

    const result = await fetchFdcFood(175167, "key");
    expect(result.fdcId).toBe(175167);
  });

  it("includes fdcId in request URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchFdcFood(12345, "mykey");
    expect((mockFetch.mock.calls[0] as [string])[0]).toContain("12345");
  });

  it("throws on non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );
    await expect(fetchFdcFood(99999, "key")).rejects.toThrow("FDC detail API error: 404");
  });
});
