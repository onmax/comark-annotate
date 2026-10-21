import { expect, test } from "@playwright/test";

test("the playground renders a preset, reports issues as you type, and opens a shared link", async ({
  page,
}) => {
  await page.goto("/play/#preset=github-callouts-types");
  const preview = page.frameLocator(".play-preview");
  await expect(preview.locator(".cgc").first()).toBeVisible();
  await expect(page.locator(".sidebar .pages a[aria-current]")).toHaveText("Types");

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
  await expect(page.getByRole("list", { name: "Issues" })).toContainText("`alt` is required");
});

test("an example's Playground link opens its Markdown in the playground", async ({ page }) => {
  await page.goto("/github-callouts/");
  const source = await page.locator(".example-code code").first().textContent();
  await page.locator(".example-play").first().click();
  await expect(page).toHaveURL(/\/play\/#md=/);
  await expect(page.getByRole("textbox", { name: "Markdown" })).toHaveValue(
    (source ?? "").trimEnd(),
  );
  await expect(page.frameLocator(".play-preview").locator(".cgc").first()).toBeVisible();
});
