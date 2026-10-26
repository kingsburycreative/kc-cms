// Short addresses: /besciworks/history <-> /kingsburycreative/besciworks/main/history.
// Pure functions, no imports. The owner and branch are fixed, so a short path
// can never name another owner or branch.

const OWNER = "kingsburycreative";
const BRANCH = "main";

// Top-level names that already mean something: every folder under app/ (route
// groups flattened, dynamic segments dropped), the public/ entries, and the
// owner name itself so /kingsburycreative/... stays a full path.
export const RESERVED: ReadonlySet<string> = new Set([
  "api",
  "auth",
  "sign-in",
  "settings",
  "admin",
  "_next",
  "images",
  "favicon.ico",
  "icon.svg",
  OWNER,
]);

export type ShortResult = { rewrite: string } | { redirect: string } | null;

// Returns the lowercase decoded name when the raw segment is a usable repo
// segment, otherwise null.
function repoName(raw: string): string | null {
  if (!raw) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (
    decoded === "" ||
    decoded.startsWith(".") ||
    decoded.includes("/") ||
    decoded.includes("\\") ||
    decoded.includes("..") ||
    decoded.includes("%") ||
    /[\u0000-\u001f\u007f]/.test(decoded)
  ) {
    return null;
  }
  const lower = decoded.toLowerCase();
  return RESERVED.has(lower) ? null : lower;
}

// A short path whose third segment reads as the branch (/owner/repo/main) is a
// full path for some other owner, so it is never rewritten. shortHref keeps the
// full form for such paths so the round trip holds.
function looksLikeBranch(segment: string | undefined): boolean {
  if (segment === undefined) return false;
  try {
    return decodeURIComponent(segment).toLowerCase() === BRANCH;
  } catch {
    return false;
  }
}

function splitSuffix(input: string): [string, string] {
  const i = input.search(/[?#]/);
  return i === -1 ? [input, ""] : [input.slice(0, i), input.slice(i)];
}

export function resolveShort(pathname: string, method: string): ShortResult {
  if (!pathname.startsWith("/")) return null;
  const [path, suffix] = splitSuffix(pathname);
  const segments = path.slice(1).split("/");
  const first = segments[0];

  if (first.toLowerCase() === OWNER) {
    const m = method.toUpperCase();
    if (m !== "GET" && m !== "HEAD") return null;
    if (segments.length < 3) return null;
    if (repoName(segments[1]) === null) return null;
    if (segments[2] !== BRANCH || looksLikeBranch(segments[4])) return null;
    const rest = segments.slice(3).join("/");
    return { redirect: `/${segments[1]}${rest ? `/${rest}` : ""}${suffix}` };
  }

  if (repoName(first) === null) return null;
  if (looksLikeBranch(segments[2])) return null;
  const rest = segments.slice(1).join("/");
  const tail = rest === "" ? "" : `/${rest}`;
  return { rewrite: `/${OWNER}/${first}/${BRANCH}${tail}${suffix}` };
}

// True when the proxy should pass the request through untouched. A dotted path
// skips only when it is not a short address; public/ names are in RESERVED, so
// resolveShort already gives nothing for them. /api/ never skips, so the
// Origin check runs on every /api/ path.
export function isStaticPath(pathname: string, method: string): boolean {
  if (pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico") return true;
  if (!/\.[^/]+$/.test(pathname)) return false;
  return resolveShort(pathname, method) === null;
}

export function shortHref(fullPath: string): string {
  const [path, suffix] = splitSuffix(fullPath);
  const segments = path.split("/");
  if (
    segments.length < 4 ||
    segments[0] !== "" ||
    segments[1].toLowerCase() !== OWNER ||
    segments[3] !== BRANCH ||
    repoName(segments[2]) === null ||
    looksLikeBranch(segments[5])
  ) {
    return fullPath;
  }
  const rest = segments.slice(4).join("/");
  return `/${segments[2]}${rest ? `/${rest}` : ""}${suffix}`;
}
