// Serves docs/dist for the end-to-end checks, like the Cloudflare site: a directory answers with its index.html.
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = new URL("../docs/dist/public/", import.meta.url).pathname;
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
  const file = join(root, path.endsWith("/") ? `${path}index.html` : path);
  try {
    const body = await readFile(file);
    response
      .writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" })
      .end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(Number(process.env.E2E_PORT ?? 4173), "127.0.0.1");
