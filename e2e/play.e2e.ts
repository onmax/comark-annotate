import { expect, test } from "@playwright/test";

test("the playground renders a preset, reports issues as you type, and opens a shared link", async ({
  page,
}) => {
  await page.goto("/play/#preset=github");
  const preview = page.frameLocator(".play-preview");
  await expect(preview.locator(".cgc").first()).toBeVisible();
  await expect(page.locator(".sidebar .pages a[aria-current]")).toHaveText("GitHub");
  const npmx = page.locator(".top a.npmx");
  await expect(npmx).toHaveAttribute("href", "https://npmx.dev/package/comark-github");

  const editor = page.getByRole("textbox", { name: "Markdown" });
  await editor.fill('::screenshot{src="/after.png"}\n::');
  await expect(page.getByRole("list", { name: "Issues" })).toContainText("`alt` is required");
  await expect(preview.getByRole("figure")).toBeVisible();
  await expect(page.locator(".sidebar .pages a[aria-current]")).toHaveCount(0);
  await expect(page).toHaveURL(/#md=/);

  const shared = page.url();
  await page.goto("/");
  await page.goto(shared);
  await expect(editor).toHaveValue('::screenshot{src="/after.png"}\n::');
  await expect(npmx).toHaveAttribute("href", "https://npmx.dev/~onmax_");
  await expect(page.getByRole("list", { name: "Issues" })).toContainText("`alt` is required");
});

test("an example's Playground link opens its Markdown in the playground", async ({ page }) => {
  await page.goto("/github/");
  const source = await page.locator(".example-code code").first().textContent();
  await page.locator(".example-play").first().click();
  await expect(page).toHaveURL(/\/play\/#md=/);
  await expect(page.getByRole("textbox", { name: "Markdown" })).toHaveValue(
    (source ?? "").trimEnd(),
  );
  await expect(page.frameLocator(".play-preview").locator(".cgc").first()).toBeVisible();
});

test("the playground puts comark-code's buttons on code blocks, and actions from the config", async ({
  page,
}) => {
  await page.goto("/play/#preset=code-copy-and-wrap");
  const preview = page.frameLocator(".play-preview");
  await expect(preview.getByRole("button", { name: "Copy code" })).toBeAttached();
  await expect(preview.getByRole("button", { name: "Run" })).toHaveCount(0);

  await page.getByRole("button", { name: "Config" }).click();
  await page
    .getByRole("textbox", { name: "Config" })
    .fill(
      '{ "comark-code": { "actions": [{ "id": "run", "label": "Run", "languages": ["sh"] }] } }',
    );
  await expect(preview.getByRole("button", { name: "Run" })).toBeAttached();
});

test("a package's Open in playground link opens its first example", async ({ page }) => {
  await page.goto("/annotate/");
  await page.locator(".sidebar").getByRole("link", { name: "Open in playground" }).click();
  await expect(page).toHaveURL(/\/play\/#preset=annotate-/);
  await expect(page.locator(".sidebar .pages a[aria-current]")).toHaveText("Before / after");
});

test("search opens with Ctrl+K and goes to the heading you pick", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const field = page.getByRole("combobox", { name: "Search the docs" });
  await expect(field).toBeFocused();
  await field.fill("side notes");
  await expect(page.getByRole("option").first()).toContainText("annotate › Guides");
  await field.press("Enter");
  await expect(page).toHaveURL(/\/annotate\/guides\/#side-notes$/);
  await page.keyboard.press("Control+k");
  await field.fill("zzzz");
  await expect(page.getByRole("status")).toHaveText("No page or heading matches.");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
