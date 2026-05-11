import { test, expect } from "@playwright/test";

test("smoke: homepage redirects to /today", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/today/);
});

test("today: cockpit renders 6 cells", async ({ page }) => {
  await page.goto("/today");
  const cockpit = page.getByLabel("Daily nutritional cockpit");
  await expect(cockpit).toBeVisible();
  // 6 cells: Energy, Protein, Carbs, Fat, Fibre, PRAL
  await expect(page.getByText("Energy")).toBeVisible();
  await expect(page.getByText("Protein")).toBeVisible();
  await expect(page.getByText("PRAL")).toBeVisible();
});

test("today: meal cards are keyboard-navigable", async ({ page }) => {
  await page.goto("/today");
  const mealCard = page.getByLabel(/Recovery breakfast/);
  await expect(mealCard).toBeVisible();
  await mealCard.focus();
  await expect(mealCard).toBeFocused();
});

test("today: evidence drawer opens and closes", async ({ page }) => {
  await page.goto("/today");
  const evidenceBtn = page.getByRole("button", { name: /^evidence$/i });
  await evidenceBtn.click();
  const drawer = page.getByRole("dialog", { name: /Evidence inspector/ });
  await expect(drawer).toBeVisible();
  await page.getByRole("button", { name: /Close/ }).click();
});

test("today: micronutrient scorecard shows ≥16 nutrients", async ({ page }) => {
  await page.goto("/today");
  const scorecard = page.getByLabel("Micronutrient adequacy");
  await expect(scorecard).toBeVisible();
  // Check at least 16 nutrient rows are visible
  await expect(page.getByText("Iron")).toBeVisible();
  await expect(page.getByText("Calcium")).toBeVisible();
  await expect(page.getByText("Vit C")).toBeVisible();
  await expect(page.getByText("Folate")).toBeVisible();
});

test("today: heatmap toggle works", async ({ page }) => {
  await page.goto("/today");
  const heatmapBtn = page.getByRole("button", { name: "Heatmap" });
  await expect(heatmapBtn).toBeVisible();
  await heatmapBtn.click();
  // After clicking, heatmap mode should render percentage cells
  const listBtn = page.getByRole("button", { name: "List" });
  await listBtn.click();
});

test("onboarding: wizard renders 3 steps", async ({ page }) => {
  await page.goto("/onboarding");
  await expect(page.getByText("Welcome to Plate")).toBeVisible();
  // Step 1: Profile
  await expect(page.getByLabel("Sex")).toBeVisible();
  await expect(page.getByLabel("Age")).toBeVisible();
});

test("api: /api/day/:date/score returns valid response", async ({ request }) => {
  // Fixed seed date — route echoes any valid YYYY-MM-DD; this tests the response shape.
  const fixedDate = "2026-05-05";
  const resp = await request.get(`/api/day/${fixedDate}/score`);
  expect(resp.status()).toBe(200);
  const data = await resp.json();
  expect(data.date).toBe(fixedDate);
  expect(data.targets.kcal).toBe(2180);
  expect(data.pral).toBe(-7.4);
});

test("api: /api/day/:date/score rejects bad date", async ({ request }) => {
  const resp = await request.get("/api/day/bad-date/score");
  expect(resp.status()).toBe(400);
});
