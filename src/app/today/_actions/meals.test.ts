import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers before importing the server actions
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// Mock the auth module
vi.mock("@/lib/auth/server", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from "@/lib/auth/server";
import { addMealItem, addSupplement, removeMealItem } from "./meals";

const mockGetSession = vi.mocked(auth.api.getSession);

function makeFormData(fields: Record<string, string | number>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, String(v));
  }
  return fd;
}

describe("server actions — auth guard (Issue 2 fix)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addMealItem", () => {
    it("returns { error: 'Unauthorized' } when session is null", async () => {
      mockGetSession.mockResolvedValue(null);
      const result = await addMealItem(
        makeFormData({ dayPlanId: "dp1", mealId: "m1", foodId: "f1", amountG: "200" }),
      );
      expect(result).toEqual({ error: "Unauthorized" });
    });

    it("proceeds past auth when session is valid", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "user-1" }, session: {} } as never);
      const result = await addMealItem(
        makeFormData({ dayPlanId: "dp1", mealId: "m1", foodId: "f1", amountG: "200" }),
      );
      // DB is stubbed, so it should return success
      expect(result).toEqual({ success: true });
    });

    it("returns validation error for negative amountG even with valid session", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "user-1" }, session: {} } as never);
      const result = await addMealItem(
        makeFormData({ dayPlanId: "dp1", mealId: "m1", foodId: "f1", amountG: "-10" }),
      );
      expect(result).toHaveProperty("error");
      expect(result).not.toEqual({ error: "Unauthorized" });
    });
  });

  describe("addSupplement", () => {
    it("returns { error: 'Unauthorized' } when session is null", async () => {
      mockGetSession.mockResolvedValue(null);
      const result = await addSupplement(
        makeFormData({ dayPlanId: "dp1", nutrientId: "iron", amountCanonical: "5000", time: "08:00" }),
      );
      expect(result).toEqual({ error: "Unauthorized" });
    });

    it("proceeds past auth when session is valid", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "user-1" }, session: {} } as never);
      const result = await addSupplement(
        makeFormData({ dayPlanId: "dp1", nutrientId: "iron", amountCanonical: "5000", time: "08:00" }),
      );
      expect(result).toEqual({ success: true });
    });

    it("rejects malformed time format even with valid session", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "user-1" }, session: {} } as never);
      const result = await addSupplement(
        makeFormData({ dayPlanId: "dp1", nutrientId: "iron", amountCanonical: "5000", time: "8am" }),
      );
      expect(result).toHaveProperty("error");
      expect(result).not.toEqual({ error: "Unauthorized" });
    });
  });

  describe("removeMealItem", () => {
    it("returns { error: 'Unauthorized' } when session is null", async () => {
      mockGetSession.mockResolvedValue(null);
      const result = await removeMealItem(makeFormData({ mealItemId: "mi-1" }));
      expect(result).toEqual({ error: "Unauthorized" });
    });

    it("proceeds past auth when session is valid", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "user-1" }, session: {} } as never);
      const result = await removeMealItem(makeFormData({ mealItemId: "mi-1" }));
      expect(result).toEqual({ success: true });
    });

    it("returns validation error when mealItemId is missing even with valid session", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "user-1" }, session: {} } as never);
      const result = await removeMealItem(makeFormData({}));
      expect(result).toHaveProperty("error");
      expect(result).not.toEqual({ error: "Unauthorized" });
    });
  });
});
