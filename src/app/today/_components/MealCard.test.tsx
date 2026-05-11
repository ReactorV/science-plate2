import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MealCard } from "./MealCard";
import type { MealCardData } from "./MealCard";

const baseMeal: MealCardData = {
  id: "meal-1",
  time: "08:00",
  name: "Oat bowl",
  kcal: 450,
  protein: 18,
  carbs: 62,
  fat: 12,
  provenance: "fdc",
  confidence: 0.92,
  weather: "sun",
};

describe("MealCard", () => {
  it("renders as a <button> element (AC-11 / Issue 11 fix)", () => {
    render(<MealCard meal={baseMeal} />);
    const btn = screen.getByRole("button");
    expect(btn.tagName).toBe("BUTTON");
  });

  it("aria-label contains meal name, time, and kcal", () => {
    render(<MealCard meal={baseMeal} />);
    const btn = screen.getByRole("button", { name: /Oat bowl at 08:00, 450 kcal/i });
    expect(btn).toBeTruthy();
  });

  it("calls onSelect with the meal id when clicked", () => {
    const onSelect = vi.fn();
    render(<MealCard meal={baseMeal} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith("meal-1");
  });

  it("does not throw when onSelect is not provided", () => {
    render(<MealCard meal={baseMeal} />);
    expect(() => fireEvent.click(screen.getByRole("button"))).not.toThrow();
  });

  it("renders rule-result chips when ruleResults provided", () => {
    const meal: MealCardData = {
      ...baseMeal,
      ruleResults: [
        {
          ruleId: "fe-vitc",
          ruleVersion: "1.0.0",
          evidenceRefs: ["Hallberg1989"],
          kind: "synergy",
          affects: ["iron"],
          humanReason: "VitC enhances iron.",
          mealIndex: 0,
          strength: 0.7,
        },
        {
          ruleId: "tea-iron",
          ruleVersion: "1.0.0",
          evidenceRefs: ["Disler1975"],
          kind: "caution",
          affects: ["iron"],
          humanReason: "Tea polyphenols inhibit iron absorption.",
          mealIndex: 0,
          strength: 0.4,
        },
      ],
    };
    render(<MealCard meal={meal} />);
    // Synergy chip: ☀ fe-vitc; caution chip: ☁ tea-iron
    expect(screen.getByText(/fe-vitc/)).toBeTruthy();
    expect(screen.getByText(/tea-iron/)).toBeTruthy();
  });

  it("does not render chips section when ruleResults is empty", () => {
    render(<MealCard meal={{ ...baseMeal, ruleResults: [] }} />);
    expect(screen.queryByText(/fe-vitc/)).toBeNull();
  });

  it("renders the meal name visibly", () => {
    render(<MealCard meal={baseMeal} />);
    expect(screen.getByText("Oat bowl")).toBeTruthy();
  });
});
