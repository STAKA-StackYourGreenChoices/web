import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Extend this list as routes are added. A route listed here that does not exist
// yet fails the suite, which is the point: it keeps the list honest.
const routes = ["/"];

for (const path of routes) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const serious = violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}
