import { describe, it, expect } from "vitest";
import { pralFromTotals, pralByMeal } from "./pral";

describe("pralFromTotals", () => {
  // AC-9: prototype seed day yields -7.4 ± 0.2 mEq
  it("AC-9: prototype seed day returns -7.4 ± 0.2", () => {
    // Prototype seed day totals (5 meals, fish-heavy pescatarian day)
    const result = pralFromTotals({
      proteinG: 106.5,
      phosphorusMg: 1368,
      potassiumMg: 4095,
      magnesiumMg: 445,
      calciumMg: 985,
    });
    expect(result).toBeGreaterThanOrEqual(-7.6);
    expect(result).toBeLessThanOrEqual(-7.2);
  });

  it("zero input returns 0", () => {
    const result = pralFromTotals({
      proteinG: 0,
      phosphorusMg: 0,
      potassiumMg: 0,
      magnesiumMg: 0,
      calciumMg: 0,
    });
    expect(result).toBe(0);
  });

  it("high protein + low minerals is positive (acidic)", () => {
    const result = pralFromTotals({
      proteinG: 200,
      phosphorusMg: 100,
      potassiumMg: 100,
      magnesiumMg: 50,
      calciumMg: 50,
    });
    expect(result).toBeGreaterThan(0);
  });

  it("symmetric K and Ca contributions are negative", () => {
    const kOnly = pralFromTotals({
      proteinG: 0,
      phosphorusMg: 0,
      potassiumMg: 1000,
      magnesiumMg: 0,
      calciumMg: 0,
    });
    const caOnly = pralFromTotals({
      proteinG: 0,
      phosphorusMg: 0,
      potassiumMg: 0,
      magnesiumMg: 0,
      calciumMg: 1000,
    });
    expect(kOnly).toBeLessThan(0);
    expect(caOnly).toBeLessThan(0);
  });
});

describe("pralByMeal", () => {
  it("returns per-meal PRAL values", () => {
    const meals = [
      { proteinG: 30, phosphorusMg: 300, potassiumMg: 800, magnesiumMg: 100, calciumMg: 200 },
      { proteinG: 40, phosphorusMg: 400, potassiumMg: 600, magnesiumMg: 80, calciumMg: 150 },
    ];
    const results = pralByMeal(meals);
    expect(results).toHaveLength(2);
    results.forEach((r) => expect(typeof r).toBe("number"));
  });
});
