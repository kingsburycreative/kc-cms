// Card 77: cap JSON body size under /api before any route parses it, so zod 3
// never sees an oversized payload (GHSA-mrhx-c7xc-m3w5). Uploads are JSON
// base64 on the same /files/ route as content saves, so the proxy allows
// /files/ up to nginx's 25 MB and the route refuses non-media bodies over 1 MB.

export const SAVE_CAP = 1024 * 1024;
export const FILES_CAP = 25 * 1024 * 1024;
export const TOO_LARGE_MESSAGE = "Request body is too large.";

const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function tooLarge(): Response {
  return Response.json({ status: "error", message: TOO_LARGE_MESSAGE }, { status: 413 });
}

/** Proxy check: a 413 Response when the request is over its cap, else null. */
export function checkRequestSize(pathname: string, method: string, headers: Headers): Response | null {
  if (!pathname.startsWith("/api/") || pathname === "/api/webhook/github") return null;
  if (!BODY_METHODS.has(method.toUpperCase())) return null;
  if ((headers.get("content-type") ?? "").toLowerCase().startsWith("multipart/form-data")) return null;  const raw = headers.get("content-length");
  if (raw === null) {
    // DELETE without a body is normal; only body methods must declare length.
    return method.toUpperCase() === "DELETE" ? null : tooLarge();
  }
  const length = Number(raw);
  if (!Number.isFinite(length) || length < 0) return tooLarge();
  const cap = /^\/api\/[^/]+\/[^/]+\/[^/]+\/files\//.test(pathname) ? FILES_CAP : SAVE_CAP;
  return length > cap ? tooLarge() : null;
}

/** Route check for /files/: non-media bodies over 1 MB are refused before zod. */
export function checkFilesBody(data: { type?: unknown } | null | undefined, length: number): Response | null {
  return data?.type !== "media" && length > SAVE_CAP ? tooLarge() : null;
}
