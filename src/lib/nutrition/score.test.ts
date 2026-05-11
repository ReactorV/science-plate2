import { describe, it, expect, beforeEach } from "vitest";
import { scoreDay } from "./score";
import { computeHash, canonicalStringify } from "./hash";
import { registerAllRules, clearRules } from "@/lib/bioavailability";
import type { DayScoreInput } from "./score";

const SEED_INPUT: DayScoreInput = {
  profile: {
    sex: "F",
    age: 31,
    weightKg: 62,
    heightCm: 168,
    activityLevel: "moderate",
    goalType: "lose",
    goalRateKgPerWeek: -0.25,
  },
  nutrientTotals: {
    proteinG: 106.5,
    phosphorusMg: 1368,
    potassiumMg: 4095,
    magnesiumMg: 445,
    calciumMg: 985,
  },
  intakes: [
    { nutrientId: "iron", foodOnly: 17400, supplementAmount: 0, clinicianOverride: 0 },
    { nutrientId: "calcium", foodOnly: 985000, supplementAmount: 0, clinicianOverride: 0 },
  ],
  referenceValues: [
    { nutrientId: "iron", valueType: "PRI", amount: 16000 },
    { nutrientId: "iron", valueType: "UL", amount: 45000 },
    { nutrientId: "calcium", valueType: "PRI", amount: 950000 },
    { nutrientId: "calcium", valueType: "UL", amount: 2500000 },
  ],
  confidenceItems: [
    { provenanceTier: "branded", kcalContribution: 130 },
    { provenanceTier: "analytical", kcalContribution: 230 },
    { provenanceTier: "analytical", kcalContribution: 72 },
    { provenanceTier: "analytical", kcalContribution: 93 },
    { provenanceTier: "analytical", kcalContribution: 32 },
    { provenanceTier: "analytical", kcalContribution: 280 },
    { provenanceTier: "analytical", kcalContribution: 200 },
    { provenanceTier: "analytical", kcalContribution: 55 },
    { provenanceTier: "analytical", kcalContribution: 170 },
    { provenanceTier: "branded", kcalContribution: 155 },
    { provenanceTier: "calculated", kcalContribution: 280 },
    { provenanceTier: "branded", kcalContribution: 120 },
    { provenanceTier: "analytical", kcalContribution: 2 },
  ],
  evidencePackVersion: "1.0.0",
  ruleSetVersion: "1.0.0",
};

describe("scoreDay", () => {
  beforeEach(() => {
    clearRules();
    registerAllRules();
  });

  it("AC-20: same input produces same hash byte-for-byte", async () => {
    const result1 = await scoreDay(SEED_INPUT);
    const result2 = await scoreDay(SEED_INPUT);
    expect(result1.hash).toBe(result2.hash);
    expect(result1.hash).toHaveLength(64); // SHA-256 hex
  });

  it("AC-20: mutating 1 µg changes the hash", async () => {
    const result1 = await scoreDay(SEED_INPUT);
    const mutated = {
      ...SEED_INPUT,
      intakes: [
        { nutrientId: "iron", foodOnly: 17401, supplementAmount: 0, clinicianOverride: 0 },
        ...SEED_INPUT.intakes.slice(1),
      ],
    };
    const result2 = await scoreDay(mutated);
    expect(result1.hash).not.toBe(result2.hash);
  });

  it("returns expected structure", async () => {
    const result = await scoreDay(SEED_INPUT);
    expect(result.targets.kcal).toBeGreaterThan(0);
    expect(result.pral).toBeLessThan(0);
    expect(result.adequacy).toHaveLength(2);
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.ruleResults).toBeDefined();
    expect(result.evidencePackVersion).toBe("1.0.0");
  });

  it("rule results populated when dayInput provided", async () => {
    const inputWithDay: DayScoreInput = {
      ...SEED_INPUT,
      dayInput: {
        meals: [
          {
            index: 0,
            time: "08:00",
            items: [
              { foodId: "oats", nutrients: { iron: 4500, vitamin_c: 0 } },
              { foodId: "kiwi", nutrients: { iron: 300, vitamin_c: 71000 } },
            ],
          },
        ],
        supplements: [],
      },
    };
    const result = await scoreDay(inputWithDay);
    expect(result.ruleResults.length).toBeGreaterThan(0);
    expect(result.ruleResults.some((r) => r.ruleId === "fe-vitc")).toBe(true);
  });
});

describe("hash", () => {
  it("canonical JSON sorts keys", () => {
    const a = canonicalStringify({ b: 1, a: 2 });
    const b = canonicalStringify({ a: 2, b: 1 });
    expect(a).toBe(b);
  });

  it("produces consistent hash", async () => {
    const h1 = await computeHash({ x: 1 });
    const h2 = await computeHash({ x: 1 });
    expect(h1).toBe(h2);
  });

  it("handles null and undefined", () => {
    expect(canonicalStringify(null)).toBe("null");
    expect(canonicalStringify(undefined)).toBe("null");
  });

  it("handles boolean primitives", () => {
    expect(canonicalStringify(true)).toBe("true");
    expect(canonicalStringify(false)).toBe("false");
  });

  it("handles numbers", () => {
    expect(canonicalStringify(42)).toBe("42");
    expect(canonicalStringify(3.14)).toBe("3.14");
  });

  it("handles string primitives", () => {
    expect(canonicalStringify("hello")).toBe('"hello"');
  });

  it("handles arrays", () => {
    expect(canonicalStringify([1, 2, 3])).toBe("[1,2,3]");
  });

  it("handles nested objects with key sorting", () => {
    const result = canonicalStringify({ z: [3, 2], a: { y: 1, x: 2 } });
    // keys sorted: a first, then z; inner object: x then y
    expect(result).toBe('{"a":{"x":2,"y":1},"z":[3,2]}');
  });
});
