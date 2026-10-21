import { expect, test } from "@playwright/test";

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
    await page.goto("/diff/");
    await page.addStyleTag({ content: `main{${theme}}` });
    const ratios = await page
      .locator(".cd")
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
        return [".cd-added", ".cd-removed"].map((selector) => {
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
