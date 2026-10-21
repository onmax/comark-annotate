import { expect, test } from "@playwright/test";

test("a comparison lines up its screenshots and zooms them with their marks and colors, and their notes beside them", async ({
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

  // The notes sit beside the zoomed screenshot, and a mark lights up its note there too.
  const note = page.locator(".cz-aside .ca-notes li").first();
  await expect(note).toBeVisible();
  const aside = await page.locator(".cz-aside").boundingBox();
  const frame = await page.locator(".cz-item .ca-frame").boundingBox();
  expect(aside!.x).toBeGreaterThanOrEqual(frame!.x + frame!.width - 1);
  // Marks can overlap, so the note is the one to point at.
  await note.hover();
  await expect(page.locator('.cz-item .ca-mark[data-n="1"]')).toHaveCSS("--ca-on", "1");
  // The thumbnails are copies too, and stay out of it.
  await expect(page.locator('.cz-thumb .ca-mark[data-n="1"]').first()).not.toHaveCSS(
    "--ca-on",
    "1",
  );
});

test("the zoom maps its copies to the page and back", async ({ page }) => {
  await page.goto("/annotate/");
  await page.evaluate(() => {
    document.addEventListener("comark-zoom:open", (event) => {
      const { content, aside, copyOf, originalOf } = event.detail;
      const image = content.querySelector(".ca-frame img")!;
      const note = aside!.querySelector(".ca-notes li")!;
      const figure = event.detail.item.closest(".ca-screenshot")!;
      Object.assign(window, {
        mapped: {
          content: content.matches(".ca-stage"),
          image: originalOf(image) === event.detail.item.querySelector(".ca-frame img"),
          back: copyOf(originalOf(image)!) === image,
          note: originalOf(note) === figure.querySelector(".ca-notes li"),
          outside: originalOf(document.body),
        },
      });
    });
  });
  await page.locator(".ca-compare .ca-stage").first().click();
  await expect(page.locator(".cz-dialog")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { mapped: unknown }).mapped)).toEqual({
    content: true,
    image: true,
    back: true,
    note: true,
    outside: null,
  });
});

test("a host's `.ca` rule sets the default mark color, on the page and zoomed", async ({
  page,
}) => {
  await page.goto("/annotate/components/");
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
  await figure.locator(".ca-frame > img").evaluate((image) => (image as HTMLImageElement).decode());
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

  // Focusing and clicking the handle can scroll the page, so measure the pair again.
  const now = (await swipe.boundingBox())!;
  await page.mouse.click(now.x + now.width * 0.3, now.y + now.height * 0.6);
  await expect(page.locator(".cz-item .ca-swipe")).toBeVisible();
  const zoomed = page.locator(".cz-item .ca-handle");
  await expect(zoomed).toHaveAttribute("aria-valuenow", "95");
  await zoomed.focus();
  await page.keyboard.press("Home");
  await expect(zoomed).toHaveAttribute("aria-valuenow", "0");
});

test("Copy puts a screenshot on the clipboard with its marks, and a right-click on the image finds the same copy", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/annotate/");
  const figure = page
    .locator(".ca-screenshot:visible")
    .filter({ has: page.locator(".ca-mark .ca-stamp") })
    .first();
  await figure.hover();
  await expect(figure.locator(".ca-overlay")).toHaveAttribute("src", /^blob:/);
  await figure.locator(".ca-copy").click();
  await expect(figure.locator(".ca-copy-status")).toHaveText("Copied");

  // The copy holds the figure with a margin, so the first stamp's color is where the stamp sits on the page.
  const [copied, expected] = await figure.evaluate(async (node) => {
    const [item] = await navigator.clipboard.read();
    const bitmap = await createImageBitmap(await item!.getType("image/png"));
    const box = node.getBoundingClientRect();
    const stamp = node.querySelector(".ca-mark .ca-stamp")!;
    const at = stamp.getBoundingClientRect();
    const scale = bitmap.width / (box.width + 32);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d")!;
    context.drawImage(bitmap, 0, 0);
    const x = Math.round((at.left + at.width / 2 - box.left + 16) * scale);
    const y = Math.round((at.top + 2 - box.top + 16) * scale);
    const pixel = [...context.getImageData(x, y, 1, 1).data].slice(0, 3);
    context.fillStyle = getComputedStyle(stamp).backgroundColor;
    context.fillRect(0, 0, 1, 1);
    return [pixel, [...context.getImageData(0, 0, 1, 1).data].slice(0, 3)];
  });
  for (const [index, channel] of copied.entries())
    expect(Math.abs(channel - expected[index]!)).toBeLessThan(24);

  // The first right-click hits the frame, which arms the invisible copy before
  // the browser dispatches contextmenu to that copy.
  await figure.locator(".ca-frame").evaluate((frame) => {
    frame.addEventListener(
      "contextmenu",
      (event) => {
        (window as typeof window & { __annotateContextTarget?: string }).__annotateContextTarget = (
          event.target as Element
        ).className;
        (event.target as HTMLElement).click();
      },
      { once: true },
    );
  });
  const frame = figure.locator(".ca-frame");
  await frame.click({ button: "right" });
  await expect(figure.locator(".ca-overlay[data-menu]")).toHaveCount(1);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { __annotateContextTarget?: string }).__annotateContextTarget,
      ),
    )
    .toBe("ca-overlay");
  await expect(page.locator(".cz-dialog")).toBeVisible();
  await page.keyboard.press("ControlOrMeta+c");
  await expect(page.locator(".cz-item .ca-copy-status")).toHaveText("Copied");
});

test("a diff's counts stay readable when the page's theme and the system's disagree", async ({
  page,
}) => {
  // shadcn's neutral theme, set by class while the system says the opposite.
  const themes = {
    dark: "--background:#0a0a0a;--foreground:#fafafa;--accent:#262626",
    light: "--background:#fff;--foreground:#0a0a0a;--accent:#f5f5f5",
  };
  for (const [system, theme] of [
    ["light", themes.dark],
    ["dark", themes.light],
  ] as const) {
    await page.emulateMedia({ colorScheme: system });
    await page.goto("/annotate/components/");
    await page.addStyleTag({ content: `main{${theme}}` });
    const ratios = await page
      .locator(".ca-diff")
      .first()
      .evaluate((figure) => {
        // Painting a color resolves color-mix() and transparency the way the page shows them.
        const canvas = document.createElement("canvas").getContext("2d")!;
        const paint = (color: string, under: string) => {
          canvas.fillStyle = under;
          canvas.fillRect(0, 0, 1, 1);
          canvas.fillStyle = color;
          canvas.fillRect(0, 0, 1, 1);
          return `rgb(${canvas.getImageData(0, 0, 1, 1).data.slice(0, 3).join(" ")})`;
        };
        const luminance = (color: string) =>
          [...paint(color, "#000").matchAll(/\d+/g)]
            .map(([channel]) => Number(channel) / 255)
            .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
            .reduce((sum, c, index) => sum + c * [0.2126, 0.7152, 0.0722][index]!, 0);
        const header = paint(
          getComputedStyle(figure.querySelector("figcaption")!).backgroundColor,
          getComputedStyle(figure).backgroundColor,
        );
        return [".ca-added", ".ca-removed"].map((selector) => {
          const [high, low] = [
            luminance(getComputedStyle(figure.querySelector(selector)!).color),
            luminance(header),
          ].sort((a, b) => b - a);
          return (high! + 0.05) / (low! + 0.05);
        });
      });
    for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
  }
});
