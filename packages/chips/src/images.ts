/** An image ready to draw, or the HTTP status of one that doesn't exist. */
export type Image = { src: string } | { status: number };

const LIMIT = 100_000;

class Missing extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`HTTP ${status}`);
    this.status = status;
  }
}

function base64(bytes: Uint8Array) {
  let binary = "";
  for (let at = 0; at < bytes.length; at += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(at, at + 0x8000));
  return btoa(binary);
}

async function download(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Missing(response.status);
  const type = response.headers.get("content-type")?.split(";", 1)[0]?.trim() ?? "";
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!type.startsWith("image/") || bytes.length > LIMIT) throw new Error("not a small image");
  return `data:${type};base64,${base64(bytes)}`;
}

// Each image by URL, kept across parses and instances, so a site that builds many pages downloads each once. A failed
// download isn't kept, so the next parse tries again.
const downloaded = new Map<string, Promise<string>>();

/**
 * Downloads each URL and inlines it as a data URI. A URL that answers with an HTTP error maps to its status. Any other
 * failure, such as no network, a browser's CORS rules, or a large image, keeps the URL, so the reader's browser
 * loads it instead.
 */
export async function inline(urls: Iterable<string>): Promise<Map<string, Image>> {
  const unique = [...new Set(urls)];
  return new Map(
    await Promise.all(
      unique.map(async (url): Promise<[string, Image]> => {
        let pending = downloaded.get(url);
        if (!pending) {
          pending = download(url);
          downloaded.set(url, pending);
          pending.catch(() => downloaded.delete(url));
        }
        try {
          return [url, { src: await pending }];
        } catch (error) {
          return [url, error instanceof Missing ? { status: error.status } : { src: url }];
        }
      }),
    ),
  );
}
