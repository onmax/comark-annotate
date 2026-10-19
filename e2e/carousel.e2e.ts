import { expect, test } from "@playwright/test";

test("a carousel pages with its arrows, and its zoomed view keeps the carousel in step", async ({
  page,
}) => {
  await page.goto("/carousel/");
  const carousel = page.locator(".cc").first();
  const current = carousel.locator(".cc-dot[aria-current=true]");

  await expect(current).toHaveAttribute("aria-label", "Slide 1");
  await carousel.getByRole("button", { name: "Next slide" }).click();
  await expect(current).toHaveAttribute("aria-label", "Slide 2");

  await carousel.locator(".cc-slide").nth(1).click();
  await expect(page.locator(".cz-count")).toHaveText("2 / 3");
  await expect(page.locator(".cz-thumb")).toHaveCount(3);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".cz-count")).toHaveText("3 / 3");
  await expect(current).toHaveAttribute("aria-label", "Slide 3");
  await page.keyboard.press("Escape");
  await expect(page.locator(".cz-dialog")).toHaveCount(0);
});
