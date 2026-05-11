import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Cockpit } from "./Cockpit";

const baseData = {
  targets: { kcal: 2180, protein: 124, carbs: 270, fat: 72, fibre: 32 },
  totals:  { kcal: 2180, protein: 124, carbs: 270, fat: 72, fibre: 32 },
  pral: 0,
  confidence: 0.84,
};

describe("Cockpit", () => {
  it("renders the daily nutritional cockpit section", () => {
    render(<Cockpit data={baseData} />);
    expect(screen.getByRole("region", { name: /daily nutritional cockpit/i })).toBeTruthy();
  });

  it("renders all 6 nutrient cells (Energy, Protein, Carbs, Fat, Fibre, PRAL)", () => {
    render(<Cockpit data={baseData} />);
    for (const label of ["Energy", "Protein", "Carbs", "Fat", "Fibre", "PRAL"]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  describe("PRAL marker clamping (Issue 15 fix)", () => {
    it("PRAL = -30 → left position clamped to 0%", () => {
      render(<Cockpit data={{ ...baseData, pral: -30 }} />);
      // 50 + (-30 * 2) = -10 → clamped to 0
      const pralMark = document.querySelector<HTMLElement>("[class*='pralMark']");
      expect(pralMark?.style.left).toBe("0%");
    });

    it("PRAL = 25 → left position clamped to 100%", () => {
      render(<Cockpit data={{ ...baseData, pral: 25 }} />);
      // 50 + (25 * 2) = 100 → stays at 100
      const pralMark = document.querySelector<HTMLElement>("[class*='pralMark']");
      expect(pralMark?.style.left).toBe("100%");
    });

    it("PRAL = 30 → left position clamped to 100% (exceeds 100)", () => {
      render(<Cockpit data={{ ...baseData, pral: 30 }} />);
      // 50 + (30 * 2) = 110 → clamped to 100
      const pralMark = document.querySelector<HTMLElement>("[class*='pralMark']");
      expect(pralMark?.style.left).toBe("100%");
    });

    it("PRAL = -7.4 → left position is ~35.2%", () => {
      render(<Cockpit data={{ ...baseData, pral: -7.4 }} />);
      // 50 + (-7.4 * 2) = 35.2
      const pralMark = document.querySelector<HTMLElement>("[class*='pralMark']");
      expect(pralMark?.style.left).toBe("35.2%");
    });

    it("PRAL = 0 → left position is 50%", () => {
      render(<Cockpit data={{ ...baseData, pral: 0 }} />);
      const pralMark = document.querySelector<HTMLElement>("[class*='pralMark']");
      expect(pralMark?.style.left).toBe("50%");
    });
  });

  it("displays the correct kcal total", () => {
    render(<Cockpit data={{ ...baseData, totals: { ...baseData.totals, kcal: 1750 } }} />);
    expect(screen.getByText("1750")).toBeTruthy();
  });
});
