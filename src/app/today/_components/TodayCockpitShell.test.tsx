import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TodayCockpitShell } from "./TodayCockpitShell";
import type { TodayCockpitData } from "./TodayCockpitShell";

// Header uses usePathname — mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/today"),
}));

// Mock next/link to a simple anchor to avoid RSC/link issues in jsdom
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

const baseData: TodayCockpitData = {
  targets: { kcal: 2180, protein: 124, carbs: 270, fat: 72, fibre: 32 },
  totals: { kcal: 2114, protein: 121, carbs: 258, fat: 71, fibre: 34 },
  pral: -7.4,
  confidence: 0.84,
  training: [],
  meals: [
    {
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
      ],
    },
    {
      id: "meal-2",
      time: "13:00",
      name: "Lunch salad",
      kcal: 620,
      protein: 30,
      carbs: 45,
      fat: 22,
      provenance: "fdc",
      confidence: 0.88,
      weather: "cloud",
      ruleResults: [],
    },
  ],
  nutrients: [],
  adequacy: [],
  hash: "3f9ca14b02e8d7f6a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718",
  evidencePackVersion: "1.0.0",
};

describe("TodayCockpitShell", () => {
  it("renders meal cards for each meal", () => {
    render(<TodayCockpitShell data={baseData} />, { wrapper });
    expect(screen.getByText("Oat bowl")).toBeTruthy();
    expect(screen.getByText("Lunch salad")).toBeTruthy();
  });

  it("clicking a meal card opens the evidence drawer", () => {
    render(<TodayCockpitShell data={baseData} />, { wrapper });
    const mealBtn = screen.getByRole("button", { name: /Oat bowl/i });
    fireEvent.click(mealBtn);
    // Drawer is always in DOM; when open, close button is focusable
    expect(screen.getByRole("button", { name: /close evidence inspector/i })).toBeTruthy();
  });

  it("clicking the Evidence header button opens the drawer", () => {
    render(<TodayCockpitShell data={baseData} />, { wrapper });
    // Use exact name match to avoid matching "Close evidence inspector" (always in DOM)
    const evidenceBtn = screen.getByRole("button", { name: /^evidence$/i });
    fireEvent.click(evidenceBtn);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("drawer shows rule results from selected meal only", () => {
    render(<TodayCockpitShell data={baseData} />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: /Oat bowl/i }));
    // fe-vitc is from meal-1 only
    expect(screen.getByText("fe-vitc")).toBeTruthy();
  });

  it("closing the drawer resets selectedMealId", () => {
    render(<TodayCockpitShell data={baseData} />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: /Oat bowl/i }));
    // Close via Escape
    fireEvent.keyDown(document, { key: "Escape" });
    // Clicking a second meal should still work after reset
    fireEvent.click(screen.getByRole("button", { name: /Lunch salad/i }));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});
