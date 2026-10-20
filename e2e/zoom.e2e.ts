import { expect, test } from "@playwright/test";

test("an image zooms, and Escape, Back, and a click around it close it", async ({ page }) => {
  await page.goto("/zoom/");
  const image = page.locator("main img[data-zoom]").first();
  const dialog = page.locator(".cz-dialog");

  await image.click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(image).toBeFocused();

  await image.click();
  await expect(dialog).toBeVisible();
  await page.goBack();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/zoom\/$/);

  await image.click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(8, 400);
  await expect(dialog).toHaveCount(0);
});

test("opening and closing the zoom doesn't shift the page sideways", async ({ page }) => {
  await page.goto("/carousel/");
  await page.evaluate(() => {
    const shifts: number[] = [];
    Object.assign(window, { shifts });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        shifts.push((entry as PerformanceEntry & { value: number }).value);
    }).observe({ type: "layout-shift" });
  });
  const heading = page.locator("main h2").first();
  const left = await heading.evaluate((node) => node.getBoundingClientRect().left);

  await page.locator(".cc-slide").first().click();
  await expect(page.locator(".cz-dialog")).toBeVisible();
  expect(await heading.evaluate((node) => node.getBoundingClientRect().left)).toBe(left);
  await page.keyboard.press("Escape");
  await expect(page.locator(".cz-dialog")).toHaveCount(0);
  expect(await heading.evaluate((node) => node.getBoundingClientRect().left)).toBe(left);
  expect(await page.evaluate(() => (window as Window & { shifts?: number[] }).shifts)).toEqual([]);
});

test("a zoomed table keeps its header row", async ({ page }) => {
  await page.goto("/zoom/");
  const block = page
    .locator("main .example-preview .cz")
    .filter({ has: page.locator("table") })
    .last();
  await block.scrollIntoViewIfNeeded();
  await block.click();
  await expect(page.locator(".cz-dialog th").first()).toHaveText("Attempt");
});

test("a zoomed block keeps its text styles, so it closes onto the original without a jump", async ({
  page,
}) => {
  await page.goto("/zoom/");
  const block = page
    .locator("main .example-preview .cz")
    .filter({ has: page.locator("table") })
    .last();
  await block.scrollIntoViewIfNeeded();
  const height = await block.evaluate((node) => (node as HTMLElement).offsetHeight);
  await block.click();
  const copy = page.locator(".cz-item > .cz");
  expect(await copy.evaluate((node) => (node as HTMLElement).offsetHeight)).toBe(height);
});
