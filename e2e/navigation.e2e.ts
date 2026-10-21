import { expect, test } from "@playwright/test";

test("client navigation preserves the app and reinitializes page scripts", async ({ page }) => {
  await page.goto("/");
  const marker = await page.evaluate(() => {
    const w = window as typeof window & { __comarkNavigation?: number };
    return (w.__comarkNavigation ??= Math.random());
  });
  await page.getByRole("link", { name: "tabs", exact: true }).click();
  await expect(page).toHaveURL(/\/tabs\/$/);
  await expect(page.locator("main")).toContainText("comark-tabs");
  await page.getByRole("link", { name: "annotate", exact: true }).click();
  await expect(page).toHaveURL(/\/annotate\/$/);
  await expect(page.locator("main")).toContainText("comark-annotate");
  await page.goBack();
  await expect(page).toHaveURL(/\/tabs\/$/);
  expect(
    await page.evaluate(
      () => (window as typeof window & { __comarkNavigation?: number }).__comarkNavigation,
    ),
  ).toBe(marker);
});
