import { test, expect } from "@playwright/test";

test("home page carrega", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
});
