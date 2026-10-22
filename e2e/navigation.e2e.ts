import { expect, test } from "@playwright/test";

test("client navigation preserves the app and reinitializes page scripts", async ({ page }) => {
  await page.goto("/guide/renderers/");
  const marker = await page.evaluate(() => {
    const w = window as typeof window & { __comarkNavigation?: number };
    return (w.__comarkNavigation ??= Math.random());
  });
  await page.locator(".sidebar").getByRole("link", { name: "tabs", exact: true }).click();
  await expect(page).toHaveURL(/\/tabs\/$/);
  await expect(page.locator("h1")).toHaveText("comark-tabs");
  await page.locator(".sidebar").getByRole("link", { name: "annotate", exact: true }).click();
  await expect(page).toHaveURL(/\/annotate\/$/);
  await expect(page.locator("h1")).toHaveText("comark-annotate");
  // The body came as island JSON, so its zoom script had to run again for a mark to open the zoom.
  await page.locator(".ca-compare .ca-mark").first().click({ force: true });
  await expect(page.locator(".cz-dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".cz-dialog")).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/tabs\/$/);
  expect(
    await page.evaluate(
      () => (window as typeof window & { __comarkNavigation?: number }).__comarkNavigation,
    ),
  ).toBe(marker);
});

test("the landing canvas paints its cards centered after a client navigation", async ({ page }) => {
  await page.goto("/zoom/");
  // Every frame's position of the first card, from the click until the canvas has settled.
  const positions = await page.evaluate(async () => {
    const seen: number[] = [];
    document.querySelector<HTMLAnchorElement>('header a[href="/"]')!.click();
    const start = performance.now();
    while (performance.now() - start < 1500) {
      await new Promise(requestAnimationFrame);
      const card = document.querySelector(".canvas-stage .demo");
      if (card) seen.push(Math.round(card.getBoundingClientRect().x));
    }
    return seen;
  });
  expect(positions.length).toBeGreaterThan(0);
  expect(new Set(positions).size).toBe(1);
});
