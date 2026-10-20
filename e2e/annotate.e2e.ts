import { expect, test } from "@playwright/test";

test("a comparison lines up its screenshots and zooms them with their marks, colors, and notes", async ({
  page,
}) => {
  await page.goto("/annotate/");
  const compare = page.locator(".ca-compare").first();
  const tops = await compare
    .locator(".ca-frame img")
    .evaluateAll((images) => images.map((image) => Math.round(image.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);

  const mark = compare.locator(".ca-mark").first();
  const color = await mark.evaluate((node) => getComputedStyle(node).color);
  await mark.click({ force: true });
  const zoomed = page.locator(".cz-item .ca-mark").first();
  await expect(zoomed).toBeVisible();
  expect(await zoomed.evaluate((node) => getComputedStyle(node).color)).toBe(color);
  await expect(page.locator(".cz-count")).toHaveText("1 / 2");
  await expect(page.locator(".cz-item .ca-notes").first()).toBeVisible();
});

test("a host's `.ca` rule sets the default mark color, on the page and zoomed", async ({
  page,
}) => {
  await page.goto("/annotate/");
  await page.addStyleTag({ content: ".ca{--ca-color:rgb(1, 2, 3)}" });
  const plain = ".ca-mark:not([style*='--ca-color'])";
  const mark = page.locator(`${plain}:visible`).first();
  await expect(mark).toHaveCSS("color", "rgb(1, 2, 3)");
  await mark.click({ force: true });
  await expect(page.locator(`.cz-item ${plain}`).first()).toHaveCSS("color", "rgb(1, 2, 3)");
});

test("a side note lines up with its arrow when the screenshot also has a note above it", async ({
  page,
}) => {
  await page.goto("/annotate/");
  await page.getByRole("tab", { name: "Pointers" }).click();
  const figure = page.locator(".ca-screenshot.ca-top.ca-left:visible").first();
  const middle = (selector: string) =>
    figure.locator(selector).evaluate((node) => {
      const { top, height } = node.getBoundingClientRect();
      return top + height / 2;
    });
  const note = await middle(".ca-callout-left");
  expect(Math.abs(note - (await middle(".ca-arrow-left")))).toBeLessThan(2);
});

test("a slider moves its divider by drag and by key, and a click without a drag zooms it", async ({
  page,
}) => {
  await page.goto("/annotate/");
  await page.getByRole("tab", { name: "Slider" }).click();
  const swipe = page.locator(".ca-swipe:visible").first();
  const handle = swipe.locator(".ca-handle");
  await expect(handle).toHaveAttribute("aria-valuenow", "50");

  const box = (await swipe.boundingBox())!;
  const y = box.y + box.height * 0.6;
  await page.mouse.move(box.x + box.width * 0.5, y);
  await page.mouse.down();
  for (let step = 1; step <= 10; step++)
    await page.mouse.move(box.x + box.width * (0.5 - 0.025 * step), y);
  // Holding still before letting go places the divider instead of flicking it.
  await page.waitForTimeout(150);
  await page.mouse.up();
  await expect(handle).toHaveAttribute("aria-valuenow", "25");
  await expect(handle).toHaveAttribute("aria-valuetext", "Before 25%, After 75%");
  // The click that ends a drag doesn't zoom.
  await expect(page.locator(".cz-dialog")).toHaveCount(0);

  await handle.focus();
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowLeft");
  await expect(handle).toHaveAttribute("aria-valuenow", "95");

  await swipe.locator(".ca-grip").click();
  await expect(page.locator(".cz-dialog")).toHaveCount(0);

  await page.mouse.click(box.x + box.width * 0.3, y);
  await expect(page.locator(".cz-item .ca-swipe")).toBeVisible();
  const zoomed = page.locator(".cz-item .ca-handle");
  await expect(zoomed).toHaveAttribute("aria-valuenow", "95");
  await zoomed.focus();
  await page.keyboard.press("Home");
  await expect(zoomed).toHaveAttribute("aria-valuenow", "0");
});
