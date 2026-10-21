import { expect, test } from "@playwright/test";

test("the index's window types its Markdown, then shows the page rendered from it", async ({
  page,
}) => {
  await page.goto("/");
  const source = page.getByRole("tab", { name: "review.md" });
  const rendered = page.getByRole("tab", { name: "Rendered" });
  await expect(source).toHaveAttribute("aria-selected", "true");
  await expect(rendered).toHaveAttribute("aria-selected", "true", { timeout: 8000 });
  await expect(page.locator("#window-page figure")).toBeVisible();
  await expect(page.locator("#window-source")).toBeHidden();

  await source.click();
  await expect(page.locator("#window-source")).toBeVisible();
  await expect(page.locator("#window-page")).toBeHidden();
  await source.press("ArrowRight");
  await expect(rendered).toBeFocused();
  await expect(rendered).toHaveAttribute("aria-selected", "true");
});

test("with reduced motion, the index's window shows the rendered page at once", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Rendered" })).toHaveAttribute(
    "aria-selected",
    "true",
    { timeout: 500 },
  );
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
