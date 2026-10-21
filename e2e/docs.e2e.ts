import { expect, test } from "@playwright/test";

test("the index's studio types the agent's draft, reports its problem, fixes it, and renders the page", async ({
  page,
}) => {
  await page.goto("/");
  const studio = page.locator(".studio");
  await studio.scrollIntoViewIfNeeded();
  await expect(studio).toHaveAttribute("data-phase", "check", { timeout: 8000 });
  await expect(page.locator(".studio-issue")).toContainText("runs past the image edge");
  await expect(page.locator(".studio-fix del")).toHaveText("92.5");
  await expect(studio).toHaveAttribute("data-phase", "render", { timeout: 8000 });
  await expect(page.locator(".studio-ok")).toBeVisible();
  await expect(page.locator(".studio-page .ca-mark[data-fixed]")).toBeVisible();
  await expect(page.locator(".studio-steps [aria-current=step]")).toHaveText("Render");

  await page.getByRole("button", { name: "Replay" }).click();
  await expect(studio).toHaveAttribute("data-phase", "write");
});

test("with reduced motion, the index's studio shows the fixed Markdown and page at once", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".studio")).not.toHaveAttribute("data-phase");
  await expect(page.locator(".studio-page .ca-mark[data-fixed]")).toBeVisible();
  await expect(page.locator(".studio-fix ins")).toHaveText("82.5");
});

test("the index's canvas drags, coasts, and opens the card it was clicked on", async ({ page }) => {
  await page.goto("/");
  const viewport = page.locator(".canvas-viewport");
  await viewport.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Pause the animations" }).click();
  const stage = page.locator(".canvas-stage");
  const before = await stage.evaluate((el) => el.style.transform);
  const box = (await viewport.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++)
    await page.mouse.move(box.x + box.width / 2 - i * 40, box.y + box.height / 2);
  await page.mouse.up();
  // A drag that ends on a card doesn't open it.
  await expect(page).toHaveURL("/");
  expect(await stage.evaluate((el) => el.style.transform)).not.toBe(before);

  const card = await page.evaluate(() => {
    const view = document.querySelector(".canvas-viewport")!.getBoundingClientRect();
    for (const demo of document.querySelectorAll(".canvas-stage .demo")) {
      const r = demo.getBoundingClientRect();
      if (
        r.left > view.left &&
        r.right < view.right &&
        r.top > view.top &&
        r.bottom < view.bottom - 80
      )
        return {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          href: demo.querySelector("a")!.getAttribute("href")!,
        };
    }
  });
  await page.mouse.click(card!.x, card!.y);
  await expect(page).toHaveURL(card!.href);
});

test("the index's canvas switches to the list, and remembers it", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator(".canvas");
  await expect(canvas).toHaveAttribute("data-view", "canvas");
  await page.getByRole("button", { name: "List" }).click();
  await expect(page.getByRole("link", { name: /annotate/ }).first()).toBeVisible();
  await page.reload();
  await expect(canvas).toHaveAttribute("data-view", "list");
  await page.getByRole("button", { name: "Canvas" }).click();
  await expect(canvas).toHaveAttribute("data-view", "canvas");
});

test("tabbing into the index's packages shows them as a list", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Read the docs" }).focus();
  await page.keyboard.press("Tab");
  await expect(page.locator(".canvas")).toHaveAttribute("data-view", "list");
  await expect(page.locator(".grid a").first()).toBeFocused();
});

test("hovering the rail shows every section's name over the pages, without moving them", async ({
  page,
}) => {
  await page.goto("/lint/");
  const label = page.locator(".sidebar .rail-label", { hasText: "carousel" });
  const pages = page.locator(".sidebar .pages");
  const left = (await pages.boundingBox())?.x;
  await expect(label).toHaveCSS("opacity", "0");
  await page.locator(".sidebar .rail").hover();
  await expect(label).toHaveCSS("opacity", "1");
  expect((await pages.boundingBox())?.x).toBe(left);
  // Escape folds it back while the pointer is still over it.
  await page.locator(".sidebar .rail a").first().focus();
  await page.keyboard.press("Escape");
  await expect(label).toHaveCSS("opacity", "0");
});

test("a package's card copies its install command", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "List" }).click();
  await page.getByRole("button", { name: "Copy pnpm add comark-github" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("pnpm add comark-github");
});

test("no page scrolls sideways on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    "/",
    "/guide/renderers/",
    "/guide/theming/",
    "/annotate/guides/",
    "/charts/guides/",
    "/embed/syntax/",
    "/github/getting-started/",
    "/lint/vite-doctor/",
  ]) {
    await page.goto(path);
    const [scroll, width] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    expect(scroll, path).toBeLessThanOrEqual(width);
  }
});
