import { createHtmlRenderer } from "@comark/html";
import { expect, type Page, test } from "@playwright/test";
import code, { components } from "../packages/code/src/html.ts";
import tabs, { components as tabsComponents } from "../packages/tabs/src/html.ts";

const render = createHtmlRenderer({
  plugins: [code({ actions: [{ id: "run", label: "Run", languages: ["sh"] }] })],
  components,
});
// On the docs site's origin, a secure context, so the clipboard is there to grant.
const open = async (page: Page, markdown: string, options: { script?: boolean } = {}) => {
  let html = await render(markdown);
  if (options.script === false) html = html.replace(/<script>[\s\S]*?<\/script>/g, "");
  await page.goto("/no-such-page");
  await page.setContent(
    `<!doctype html><html><body style="width:30rem;margin:2rem"><style>pre{margin:1rem 0;padding:1rem;overflow-x:auto;background:#f4f4f5}</style>${html}</body></html>`,
  );
};
const long = `echo ${"word ".repeat(40)}`;
const sh = `\`\`\`sh\n${long}\n\`\`\``;

test("Copy writes the block's code to the clipboard and says so", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, `${sh}\n\n\`\`\`ts\nconst a = 1\nconst b = 2\n\`\`\``);
  const block = page.locator(".ck").nth(1);
  await block.hover();
  await block.getByRole("button", { name: "Copy code" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "const a = 1\nconst b = 2",
  );
  await expect(block.getByRole("status")).toHaveText("Copied");
  await expect(block.locator(".ck-copy-done")).toBeVisible();
  // Empty, it's hidden, so it's out of the accessibility tree.
  await expect(block.locator(".ck-status")).toBeEmpty({ timeout: 3000 });
});

test("without the clipboard, Copy selects the code and says how to copy it", async ({ page }) => {
  await open(page, sh);
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { value: undefined }));
  await page.locator(".ck").hover();
  await page.getByRole("button", { name: "Copy code" }).click();
  expect(await page.evaluate(() => getSelection()?.toString())).toBe(long);
  await expect(page.getByRole("status")).toContainText("Press Ctrl+C or ⌘C");
});

test("Wrap breaks the block's long lines and unwraps them again", async ({ page }) => {
  await open(page, `${sh}\n\n${sh}`);
  const [first, second] = [page.locator(".ck pre").first(), page.locator(".ck pre").nth(1)];
  const overflows = (pre: typeof first) =>
    pre.evaluate((element) => element.scrollWidth > element.clientWidth);
  expect(await overflows(first)).toBe(true);
  await page.locator(".ck").first().hover();
  const wrap = page.locator(".ck").first().getByRole("button", { name: "Wrap lines" });
  await wrap.click();
  await expect(wrap).toHaveAttribute("aria-pressed", "true");
  expect(await overflows(first)).toBe(false);
  expect(await overflows(second)).toBe(true);
  await wrap.click();
  await expect(wrap).toHaveAttribute("aria-pressed", "false");
  expect(await overflows(first)).toBe(true);
});

test("an action sends the block's code and language to the page", async ({ page }) => {
  await open(page, `${sh}\n\n\`\`\`ts\nconst a = 1\n\`\`\``);
  await expect(page.locator(".ck").nth(1).getByRole("button", { name: "Run" })).toHaveCount(0);
  const detail = page.evaluate(
    () =>
      new Promise((resolve) =>
        document.addEventListener("comark-code-action", (event) => resolve(event.detail), {
          once: true,
        }),
      ),
  );
  await page.locator(".ck").first().hover();
  await page.getByRole("button", { name: "Run" }).click();
  expect(await detail).toEqual({ action: "run", code: long, language: "sh" });
});

test("the buttons show on hover and focus, and not at all without the script", async ({ page }) => {
  await open(page, sh);
  const bar = page.locator(".ck-bar");
  await expect(bar).toHaveCSS("opacity", "0");
  // Chromium focuses a block that scrolls before its buttons; either way the bar shows.
  await page.keyboard.press("Tab");
  await expect(bar).toHaveCSS("opacity", "1");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Run" })).toBeFocused();
  await open(page, sh, { script: false });
  await expect(bar).toBeHidden();
});

test("a block in a code group still hangs from the group's header", async ({ page }) => {
  const html = await createHtmlRenderer({
    plugins: [code(), tabs()],
    components: { ...tabsComponents, ...components },
  })("::code-group\n```sh [pnpm]\npnpm add x\n```\n\n```sh [npm]\nnpm i x\n```\n::");
  await page.goto("/no-such-page");
  await page.setContent(
    `<!doctype html><html><body style="width:30rem;margin:2rem"><style>pre{margin:1.25rem 0;padding:1rem;border-radius:8px}</style>${html}</body></html>`,
  );
  const [header, pre] = await Promise.all(
    [".ct-list", ".ct-panel:not([data-inactive]) pre"].map((selector) =>
      page.locator(selector).evaluate((element) => element.getBoundingClientRect()),
    ),
  );
  expect(Math.abs(pre.top - (header.bottom - 1))).toBeLessThan(1);
  await expect(page.locator(".ct-panel:not([data-inactive]) pre")).toHaveCSS(
    "border-top-left-radius",
    "0px",
  );
});
