import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MicronutrientScorecard } from "./MicronutrientScorecard";
import type { NutrientRow } from "./MicronutrientScorecard";

const iron: NutrientRow = {
  key: "Iron",
  group: "min",
  intake: 8500,
  unit: "µg",
  rda: 16000,
  ul: 45000,
  conf: "high",
};

const vitD: NutrientRow = {
  key: "Vit D",
  group: "vit",
  intake: 600,
  unit: "IU",
  rda: 800,
  ul: 4000,
  conf: "medium",
};

const noRda: NutrientRow = {
  key: "Selenium",
  group: "min",
  intake: 0,
  unit: "µg",
  rda: 0,
  ul: 400,
  conf: "low",
};

const noUl: NutrientRow = {
  key: "Calcium",
  group: "min",
  intake: 900000,
  unit: "µg",
  rda: 1000000,
  ul: null,
  conf: "high",
};

describe("MicronutrientScorecard", () => {
  describe("basic rendering", () => {
    it("renders the section with accessible label", () => {
      render(<MicronutrientScorecard nutrients={[iron]} />);
      expect(screen.getByRole("region", { name: /micronutrient adequacy/i })).toBeTruthy();
    });

    it("renders nutrient key, intake, and unit", () => {
      render(<MicronutrientScorecard nutrients={[iron]} />);
      expect(screen.getByText("Iron")).toBeTruthy();
      expect(screen.getByText("8500")).toBeTruthy();
    });

    it("renders PRI reference value in meta", () => {
      render(<MicronutrientScorecard nutrients={[iron]} />);
      expect(screen.getByText(/PRI 16000/)).toBeTruthy();
    });

    it("renders UL reference value in meta when ul is set", () => {
      render(<MicronutrientScorecard nutrients={[iron]} />);
      expect(screen.getByText(/UL 45000/)).toBeTruthy();
    });

    it("does NOT render UL reference in meta when ul is null", () => {
      render(<MicronutrientScorecard nutrients={[noUl]} />);
      // Legend always renders "over UL"; check that the per-row meta "· UL {value}" is absent.
      expect(screen.queryByText(/·\s+UL/)).toBeNull();
    });

    it("renders multiple nutrient rows", () => {
      render(<MicronutrientScorecard nutrients={[iron, vitD, noUl]} />);
      expect(screen.getByText("Iron")).toBeTruthy();
      expect(screen.getByText("Vit D")).toBeTruthy();
      expect(screen.getByText("Calcium")).toBeTruthy();
    });
  });

  describe("rda === 0 edge case (Issue 3 regression)", () => {
    it("UL marker renders with left: '0%' when rda === 0", () => {
      const { container } = render(<MicronutrientScorecard nutrients={[noRda]} />);
      const ulMarker = container.querySelector<HTMLElement>("[title='UL']");
      expect(ulMarker).not.toBeNull();
      // Must be 0% not Infinity — regression guard for round 3 fix
      expect(ulMarker?.style.left).toBe("0%");
    });

    it("bar fill width is 0% when rda === 0 (no divide-by-zero)", () => {
      const { container } = render(<MicronutrientScorecard nutrients={[noRda]} />);
      // The fill div is the first child of the nbar div; its width should be 0%
      const fills = container.querySelectorAll<HTMLElement>("[class*='nbarFill']");
      expect(fills.length).toBeGreaterThan(0);
      expect(fills[0].style.width).toBe("0%");
    });

    it("heatmap renders 0% adequacy when rda === 0", () => {
      render(<MicronutrientScorecard nutrients={[noRda]} />);
      const heatmapBtn = screen.getByRole("button", { name: "Heatmap" });
      fireEvent.click(heatmapBtn);
      expect(screen.getByText("0%")).toBeTruthy();
    });
  });

  describe("UL marker positioning", () => {
    it("positions UL marker at (ul/rda)*100% when rda > 0", () => {
      // iron: ul=45000, rda=16000 → (45000/16000)*100 = 281.25 → clamped to 150
      const { container } = render(<MicronutrientScorecard nutrients={[iron]} />);
      const ulMarker = container.querySelector<HTMLElement>("[title='UL']");
      expect(ulMarker?.style.left).toBe("150%");
    });

    it("positions VitD UL marker at exactly 500% clamped to 150%", () => {
      // vitD: ul=4000, rda=800 → 500% → clamped to 150
      const { container } = render(<MicronutrientScorecard nutrients={[vitD]} />);
      const ulMarker = container.querySelector<HTMLElement>("[title='UL']");
      expect(ulMarker?.style.left).toBe("150%");
    });

    it("UL marker is absent when ul is null", () => {
      const { container } = render(<MicronutrientScorecard nutrients={[noUl]} />);
      const ulMarker = container.querySelector("[title='UL']");
      expect(ulMarker).toBeNull();
    });
  });

  describe("view mode toggle", () => {
    it("defaults to list view (List button is active)", () => {
      render(<MicronutrientScorecard nutrients={[iron]} />);
      expect(screen.getByRole("button", { name: "List" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Heatmap" })).toBeTruthy();
    });

    it("switches to heatmap on Heatmap click", () => {
      render(<MicronutrientScorecard nutrients={[iron]} />);
      fireEvent.click(screen.getByRole("button", { name: "Heatmap" }));
      // Heatmap renders percentage value
      expect(screen.getByText("53%")).toBeTruthy(); // (8500/16000)*100 ≈ 53.125
    });

    it("switches back to list on List click", () => {
      render(<MicronutrientScorecard nutrients={[iron]} />);
      fireEvent.click(screen.getByRole("button", { name: "Heatmap" }));
      fireEvent.click(screen.getByRole("button", { name: "List" }));
      // List shows PRI reference
      expect(screen.getByText(/PRI 16000/)).toBeTruthy();
    });
  });

  describe("band classification", () => {
    it("intake over UL is classified as 'hi' band", () => {
      const overUl: NutrientRow = { ...iron, intake: 50000 }; // > ul=45000
      const { container } = render(<MicronutrientScorecard nutrients={[overUl]} />);
      const fill = container.querySelector("[class*='nbarFill']");
      expect(fill?.className).toMatch(/hi/);
    });

    it("intake below 67% RDA is classified as 'lo' band", () => {
      const low: NutrientRow = { ...iron, intake: 5000 }; // 5000/16000 = 31%
      const { container } = render(<MicronutrientScorecard nutrients={[low]} />);
      const fill = container.querySelector("[class*='nbarFill']");
      expect(fill?.className).toMatch(/lo/);
    });

    it("intake 67–99% RDA is classified as 'mid' band", () => {
      const mid: NutrientRow = { ...iron, intake: 12000 }; // 75%
      const { container } = render(<MicronutrientScorecard nutrients={[mid]} />);
      const fill = container.querySelector("[class*='nbarFill']");
      expect(fill?.className).toMatch(/mid/);
    });

    it("intake exactly at RDA is classified as 'ok' band", () => {
      const ok: NutrientRow = { ...iron, intake: 16000 }; // 100%
      const { container } = render(<MicronutrientScorecard nutrients={[ok]} />);
      const fill = container.querySelector("[class*='nbarFill']");
      expect(fill?.className).toMatch(/ok/);
    });
  });
});
