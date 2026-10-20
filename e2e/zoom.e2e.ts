import { expect, test, type Locator, type Page } from "@playwright/test";

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

// The copy's box and the original's on the last frame of the closing animation, just before the original takes the
// copy's place.
async function lastFrame(page: Page, item: Locator) {
  await item.click();
  await expect(page.locator(".cz-dialog")).toBeVisible();
  await item.evaluate((original) => {
    const frames: { copy: DOMRect; original: DOMRect }[] = [];
    Object.assign(window, { closing: frames });
    const record = () => {
      const copy = document.querySelector(".cz-item")?.firstElementChild;
      if (!copy) return;
      frames.push({
        copy: copy.getBoundingClientRect(),
        original: original.getBoundingClientRect(),
      });
      requestAnimationFrame(record);
    };
    record();
  });
  await page.keyboard.press("Escape");
  await expect(page.locator(".cz-dialog")).toHaveCount(0);
  return page.evaluate(() => {
    const last = (
      window as Window & { closing?: { copy: DOMRect; original: DOMRect }[] }
    ).closing!.at(-1)!;
    return { copy: last.copy.toJSON(), original: last.original.toJSON() };
  });
}

test("a zoomed block closes onto the original without a jump", async ({ page }) => {
  await page.goto("/zoom/");
  const table = page
    .locator("main .example-preview .cz")
    .filter({ has: page.locator("table") })
    .last();
  // A length line height stays the same for larger text, unlike a ratio. The host's rule for spans mustn't fool the
  // zoom into reading it as one.
  await page.addStyleTag({ content: "main span{line-height:1.2;position:static!important}" });
  await page.evaluate(() =>
    document
      .querySelector("main")!
      .insertAdjacentHTML(
        "beforeend",
        '<div style="font:16px/24px sans-serif"><div id="fixed" data-zoom tabindex="0"><p>One</p><p style="font-size:2em">Two</p></div></div>',
      ),
  );
  for (const item of [table, page.locator("#fixed")]) {
    await item.scrollIntoViewIfNeeded();
    const { copy, original } = await lastFrame(page, item);
    for (const side of ["x", "y", "width", "height"] as const)
      expect(Math.abs(copy[side] - original[side])).toBeLessThan(1);
  }
});

test("a zoomed screenshot keeps the dialog's text color inside its context", async ({ page }) => {
  await page.goto("/annotate/");
  await page.addStyleTag({ content: ".ca{color:rgb(255,0,0)}" });
  await page.locator("main figure.ca-screenshot").first().click();
  const color = (selector: string) =>
    page.locator(selector).evaluate((node) => getComputedStyle(node).color);
  expect(await color(".cz-item > .ca")).toBe(await color(".cz-dialog"));
});

test("stopping the zoom while it's open gives the page its scroll restoration back", async ({
  page,
}) => {
  await page.goto("/zoom/");
  await page.locator("main img[data-zoom]").first().click();
  await expect(page.locator(".cz-dialog")).toBeVisible();
  expect(await page.evaluate(() => history.scrollRestoration)).toBe("manual");
  await page.evaluate(() => window.__comarkZoom!.stop());
  await expect(page.locator(".cz-dialog")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe("auto");
});
