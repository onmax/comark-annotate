import { createHtmlRenderer } from "@comark/html";
import { expect, type Page, test } from "@playwright/test";
import media, { components } from "../packages/media/src/html.ts";

const render = createHtmlRenderer({ plugins: [media()], components });
// Four seconds of silence as a WAV, so the player has a length without a server.
const silence = (() => {
  const rate = 8000;
  const bytes = rate * 4;
  const wav = Buffer.alloc(44 + bytes, 128);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + bytes, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate, 28);
  wav.writeUInt16LE(1, 32);
  wav.writeUInt16LE(8, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(bytes, 40);
  return wav;
})();
// The page loads `silence.wav` from a route, since a Markdown image's src must end in `.wav`. Chromium only seeks in a
// file whose server answers byte ranges, as real hosts do.
const open = async (page: Page, markdown: string, options: { script?: boolean } = {}) => {
  await page.route("**/silence.wav*", (route) => {
    const [, from = "0", to] =
      /bytes=(\d+)-(\d*)/.exec(route.request().headers().range ?? "") ?? [];
    const start = Number(from);
    const end = to ? Number(to) : silence.length - 1;
    return route.fulfill({
      status: 206,
      body: silence.subarray(start, end + 1),
      headers: {
        "accept-ranges": "bytes",
        "content-range": `bytes ${start}-${end}/${silence.length}`,
        "content-type": "audio/wav",
      },
    });
  });
  await page.route("**/missing.wav", (route) => route.fulfill({ status: 404 }));
  let html = await render(markdown);
  if (options.script === false) html = html.replace(/<script>[\s\S]*?<\/script>/g, "");
  await page.route("http://media.test/", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><body style="width:32rem;margin:2rem">${html}</body></html>`,
    }),
  );
  await page.goto("http://media.test/");
};

test("an audio player plays, pauses, and seeks with its own controls", async ({ page }) => {
  await open(page, "![Silence](silence.wav)");
  const player = page.getByRole("group", { name: "Silence" });
  const times = player.locator(".cm-time");
  await expect(player.locator("audio")).toBeHidden();
  await expect(times.last()).toHaveText("0:04");

  await player.getByRole("button", { name: "Play" }).click();
  await expect(player.getByRole("button", { name: "Pause" })).toBeVisible();
  await expect(times.first()).not.toHaveText("0:00");
  await player.getByRole("button", { name: "Pause" }).click();
  await expect(player).not.toHaveAttribute("data-playing");

  const seek = player.getByRole("slider", { name: "Seek" });
  await seek.focus();
  await page.keyboard.press("Home");
  await expect(times.first()).toHaveText("0:00");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(seek).toHaveAttribute("aria-valuetext", "0:01 of 0:04");

  await player.getByRole("button", { name: "Mute" }).click();
  await expect(player.getByRole("button", { name: "Unmute" })).toBeVisible();
});

test("one audio player plays at a time", async ({ page }) => {
  await open(page, "![One](silence.wav)\n\n![Two](silence.wav?two)");
  await page.getByRole("group", { name: "One" }).getByRole("button", { name: "Play" }).click();
  await page.getByRole("group", { name: "Two" }).getByRole("button", { name: "Play" }).click();
  await expect(page.getByRole("group", { name: "Two" })).toHaveAttribute("data-playing");
  await expect(page.getByRole("group", { name: "One" })).not.toHaveAttribute("data-playing");
});

test("the browser's player shows without the script, and when the file can't play", async ({
  page,
}) => {
  await open(page, "![Silence](silence.wav)", { script: false });
  const player = page.getByRole("group", { name: "Silence" });
  await expect(player.locator("audio")).toBeVisible();
  await expect(player.locator(".cm-bar")).toBeHidden();

  await open(page, "![Missing](missing.wav)");
  const missing = page.getByRole("group", { name: "Missing" });
  await expect(missing).toHaveAttribute("data-error");
  await expect(missing.locator("audio")).toBeVisible();
  await expect(missing.locator(".cm-bar")).toBeHidden();
});
