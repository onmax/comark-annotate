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
