import { test, expect } from "@playwright/test";

// Tagged @smoke: this subset is re-run against the live preview after deploy.
test("@smoke home page renders", async ({ page }) => {
  // Collect client-side exceptions before navigating, so a blank page that
  // "loaded fine" still fails loudly.
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("@smoke health route reports ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect((await response.json()).status).toBe("ok");
});

test("@smoke order summary renders the clamped total", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("total")).toHaveText("$40.00");
});
