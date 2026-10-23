// Serves docs/dist for the end-to-end checks, like the Cloudflare site: a directory answers with its index.html.
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const output = new URL("../docs/dist/", import.meta.url).pathname;
// Nitro writes static assets below `public/`; older Nuxt output placed them
// directly in the configured directory. Supporting both keeps the test server
// aligned with the generated output used by each supported Nuxt version.
const publicRoot = join(output, "public");
const types: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

createServer(async (request, response) => {
  const path = normalize(
    decodeURIComponent(new URL(request.url ?? "/", "http://x").pathname),
  ).replace(/^(\.\.[/\\])+/, "");
  const relative = path.endsWith("/") ? `${path}index.html` : path;
  // Nitro has emitted pages beside `public` in some versions and under it in others.
  // Try both roots so the test server mirrors either static layout.
  for (const root of [publicRoot, output]) {
    const file = join(root, relative);
    try {
      const body = await readFile(file);
      response
        .writeHead(200, {
          "content-type": types[extname(file)] ?? "application/octet-stream",
        })
        .end(body);
      return;
    } catch {
      // Try the other Nitro output root.
    }
  }
  response.writeHead(404).end("Not found");
}).listen(Number(process.env.E2E_PORT ?? 4173), "127.0.0.1");
