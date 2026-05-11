import { describe, it, expect } from "vitest";
import { Quantity } from "./Quantity";

describe("Quantity", () => {
  describe("round-trip precision", () => {
    it("mg → ug → mg preserves value", () => {
      const q = Quantity.fromMg(0.001);
      expect(q.toMg()).toBe(0.001);
    });

    it("g → mg → g preserves value", () => {
      const q = Quantity.fromG(1.5);
      expect(q.toG()).toBe(1.5);
    });

    it("kcal round-trips through canonical", () => {
      const q = Quantity.fromKcal(2180);
      expect(q.toKcal()).toBe(2180);
    });
  });

  describe("addition across same kind", () => {
    it("adds two mass quantities", () => {
      const a = Quantity.fromMg(100);
      const b = Quantity.fromG(0.1); // 100 mg
      expect(a.add(b).toMg()).toBe(200);
    });

    it("adds two energy quantities", () => {
      const a = Quantity.fromKcal(500);
      const b = Quantity.fromKcal(300);
      expect(a.add(b).toKcal()).toBe(800);
    });
  });

  describe("refusal to add mass to energy", () => {
    it("throws when adding mass to energy", () => {
      const mass = Quantity.fromMg(1);
      const energy = Quantity.fromKcal(1);
      expect(() => mass.add(energy)).toThrow("Cannot combine mass and energy");
    });

    it("throws when adding energy to mass", () => {
      const mass = Quantity.fromMg(1);
      const energy = Quantity.fromKcal(1);
      expect(() => energy.add(mass)).toThrow("Cannot combine energy and mass");
    });
  });

  describe("multiplication by float scalars", () => {
    it("rounds to canonical integer", () => {
      const q = Quantity.fromMg(1); // 1000 ug
      const result = q.mul(0.3333); // 333.3 ug → rounds to 333
      expect(result.canonical).toBe(333);
      expect(Number.isInteger(result.canonical)).toBe(true);
    });

    it("preserves integer when scalar is whole number", () => {
      const q = Quantity.fromMg(10);
      const result = q.mul(3);
      expect(result.toMg()).toBe(30);
    });
  });

  describe("subtraction", () => {
    it("subtracts quantities of same kind", () => {
      const a = Quantity.fromMg(200);
      const b = Quantity.fromMg(50);
      expect(a.sub(b).toMg()).toBe(150);
    });

    it("throws on kind mismatch", () => {
      expect(() => Quantity.fromMg(1).sub(Quantity.fromKcal(1))).toThrow();
    });
  });

  describe("conversion guards", () => {
    it("toKcal on mass throws", () => {
      expect(() => Quantity.fromMg(1).toKcal()).toThrow("Cannot convert mass");
    });

    it("toMg on energy throws", () => {
      expect(() => Quantity.fromKcal(1).toMg()).toThrow("Cannot convert energy");
    });
  });

  describe("IU", () => {
    it("stores and retrieves IU", () => {
      const q = Quantity.fromIU(400);
      expect(q.toIU()).toBe(400);
    });

    it("refuses to add IU to mass", () => {
      expect(() => Quantity.fromIU(1).add(Quantity.fromMg(1))).toThrow();
    });
  });

  describe("serialisation", () => {
    it("toJSON returns canonical form", () => {
      const q = Quantity.fromMg(5);
      const json = q.toJSON();
      expect(json).toEqual({ canonical: 5000, kind: "mass" });
    });

    it("fromJSON restores a Quantity", () => {
      const original = Quantity.fromG(2.5);
      const restored = Quantity.fromJSON(original.toJSON());
      expect(restored.toG()).toBe(2.5);
    });
  });

  describe("fromCanonical", () => {
    it("creates from stored integer", () => {
      const q = Quantity.fromCanonical(5000, "mass");
      expect(q.toMg()).toBe(5);
    });
  });

  describe("fromUg", () => {
    it("stores micrograms directly", () => {
      const q = Quantity.fromUg(500);
      expect(q.canonical).toBe(500);
      expect(q.kind).toBe("mass");
    });

    it("toUg returns same value", () => {
      const q = Quantity.fromUg(1234);
      expect(q.toUg()).toBe(1234);
    });
  });

  describe("fromKg", () => {
    it("converts kg to µg canonical", () => {
      const q = Quantity.fromKg(0.001); // 1g = 1,000,000 µg
      expect(q.toG()).toBeCloseTo(1, 5);
    });

    it("round-trips kg value", () => {
      const q = Quantity.fromKg(2);
      // 2kg = 2,000,000,000 µg
      expect(q.canonical).toBe(2_000_000_000);
      expect(q.toG()).toBe(2000);
    });
  });

  describe("toUg guard", () => {
    it("throws when converting energy to µg", () => {
      expect(() => Quantity.fromKcal(100).toUg()).toThrow("Cannot convert energy");
    });
  });
});
