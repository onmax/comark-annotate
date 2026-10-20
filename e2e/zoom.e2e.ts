import { createHtmlRenderer } from "@comark/html";
import { expect, type Locator, type Page, test } from "@playwright/test";
import annotate, { components as annotateComponents } from "../packages/annotate/src/html.ts";
import carousel, { components as carouselComponents } from "../packages/carousel/src/html.ts";
import zoom, { components as zoomComponents } from "../packages/zoom/src/html.ts";

const render = createHtmlRenderer({
  plugins: [annotate(), carousel(), zoom()],
  components: { ...annotateComponents, ...carouselComponents, ...zoomComponents },
});

// A page of the plugins' HTML, served at a path of the docs site so its images load.
async function fixture(page: Page, body: string) {
  await page.route("**/fixture/", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><meta charset="utf-8"><style>main{width:600px;margin:auto}img{max-width:100%}</style><main>${body}</main>`,
    }),
  );
  await page.goto("/fixture/");
}

const rect = (page: Page, selector: string) =>
  page.locator(selector).evaluate((node) => node.getBoundingClientRect().toJSON() as DOMRect);

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

test("Enter on an item inside a slide opens that slide, the only tab stop", async ({ page }) => {
  const shot = (src: string, alt: string) => `:::screenshot{src="${src}" alt="${alt}"}\n:::`;
  const slides = [
    shot("/before.png", "One"),
    shot("/after.png", "Two"),
    shot("/dashboard.png", "Three"),
  ];
  await fixture(page, await render(`::carousel\n${slides.join("\n\n")}\n::`));
  await expect(page.locator(".ca-screenshot[tabindex]")).toHaveCount(0);

  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
  await expect(page.locator(".cc-slide").nth(2)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".cz-count")).toHaveText("3 / 3");
  await page.keyboard.press("Escape");
  await expect(page.locator(".cz-dialog")).toHaveCount(0);

  // A host can still make the inner item focusable; it opens its slide too.
  const inner = page.locator(".ca-screenshot").nth(1);
  await inner.evaluate((node) => node.setAttribute("tabindex", "-1"));
  await inner.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".cz-count")).toHaveText("2 / 3");
});

test("an item nested in one added later stops being a tab stop, unless its author set the tabindex", async ({
  page,
}) => {
  await fixture(page, await render("![One](/before.png)"));
  await page.evaluate(() =>
    document
      .querySelector("main")!
      .insertAdjacentHTML(
        "beforeend",
        '<div data-zoom tabindex="0"><img id="added" src="/after.png" alt="" data-zoom tabindex="0"><img id="kept" src="/after.png" alt="" data-zoom tabindex="-1"></div>',
      ),
  );
  await expect(page.locator("#added")).not.toHaveAttribute("tabindex");
  await expect(page.locator("#kept")).toHaveAttribute("tabindex", "-1");
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

test("a zoom opened as another closes keeps scroll restoration off until it closes too", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/zoom/");
  const image = page.locator("main img[data-zoom]").first();
  await image.click();
  await image.evaluate((node) =>
    node.addEventListener("comark-zoom:close", () => (node as HTMLElement).click(), { once: true }),
  );
  await page.goBack();
  await expect(page.locator(".cz-dialog")).toBeVisible();
  await page.waitForTimeout(50);
  expect(await page.evaluate(() => history.scrollRestoration)).toBe("manual");
  await page.keyboard.press("Escape");
  await expect(page.locator(".cz-dialog")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe("auto");
});

test("a group leaves out the items in a closed tab, and its strip is a group", async ({ page }) => {
  await page.goto("/zoom/");
  // The Group tab above holds the same group, hidden.
  const item = page.locator("main .example-preview [data-zoom-group='tour']").last();
  await item.scrollIntoViewIfNeeded();
  await item.click();
  await expect(page.locator(".cz-count")).toHaveText("2 / 2");
  await expect(page.locator(".cz-strip")).toHaveAttribute("role", "group");
  await expect(page.locator(".cz-thumb")).toHaveCount(2);
  await expect(page.locator(".cz-thumb").nth(1)).toHaveAttribute("aria-current", "true");
});

test("data-zoom-src shows the page's image until the larger one loads, then fits it", async ({
  page,
}) => {
  let release = () => {};
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route(
    (url) => url.searchParams.has("large"),
    async (route) => {
      await held;
      await route.continue();
    },
  );
  await fixture(
    page,
    await render(
      '![Wide](/before.png){data-zoom-src="/dashboard.png?large" srcset="/before.png 1x"}',
    ),
  );
  await page.locator("main img").click();
  const copy = page.locator(".cz-item img");
  await expect(copy).toHaveAttribute("src", "/before.png");
  expect(await copy.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBe(1280);

  // The larger file is taller for its width, so the copy has to shrink to stay on the stage.
  release();
  await expect(copy).toHaveAttribute("src", "/dashboard.png?large");
  await expect(copy).not.toHaveAttribute("srcset");
  const stage = await rect(page, ".cz-stage");
  await expect.poll(async () => (await rect(page, ".cz-item")).height).toBeLessThan(stage.height);
});

test("a group's strip shows the page's images and loads no larger file", async ({ page }) => {
  const large: string[] = [];
  page.on("request", (request) => {
    const { search } = new URL(request.url());
    if (search.includes("large")) large.push(search);
  });
  const image = (src: string, n: number) =>
    `![Item ${n}](${src}){data-zoom-group="g" data-zoom-src="${src}?large=${n}"}`;
  const images = [image("/before.png", 1), image("/after.png", 2), image("/dashboard.png", 3)];
  await fixture(page, await render(images.join("\n\n")));
  await page.locator("main img").first().click();
  await expect(page.locator(".cz-item img")).toHaveAttribute("src", "/before.png?large=1");
  const thumbs = page.locator(".cz-thumb img");
  await expect(thumbs).toHaveCount(3);
  expect(
    await thumbs.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("src"))),
  ).toEqual(["/before.png", "/after.png", "/dashboard.png"]);
  expect(large).toEqual(["?large=1"]);
});

test("an image zooms no larger than its natural size", async ({ page }) => {
  await page.route("**/small.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><rect width="100" height="50"/></svg>',
    }),
  );
  await page.route("**/medium.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="75"><rect width="150" height="75"/></svg>',
    }),
  );
  await fixture(page, await render('![Small](/small.svg){width="50"}'));
  await page.locator("main img").click();
  await expect.poll(async () => Math.round((await rect(page, ".cz-item")).width)).toBe(100);
  await page.keyboard.press("Escape");
  await expect(page.locator(".cz-dialog")).toHaveCount(0);

  // A larger file stops at its own size too.
  await fixture(page, await render('![Small](/small.svg){width="50" data-zoom-src="/medium.svg"}'));
  await page.locator("main img").click();
  await expect(page.locator(".cz-item img")).toHaveAttribute("src", "/medium.svg");
  await expect.poll(async () => Math.round((await rect(page, ".cz-item")).width)).toBe(150);
});

test("start() from the client entry adds its own styles", async ({ page }) => {
  const dist = new URL("../packages/zoom/dist/", import.meta.url);
  await page.route("**/client/*.mjs", (route) => {
    const file = new URL(route.request().url()).pathname.split("/").pop() ?? "";
    return route.fulfill({ contentType: "text/javascript", path: new URL(file, dist).pathname });
  });
  await fixture(page, '<img src="/before.png" alt="Plain" data-zoom tabindex="0">');
  await page.evaluate(async () => {
    const entry = "/client/client.mjs";
    const client = (await import(entry)) as { start: () => () => void };
    client.start();
  });
  await page.locator("main img").click();
  await expect(page.locator(".cz-dialog")).toHaveCSS("position", "fixed");
});
