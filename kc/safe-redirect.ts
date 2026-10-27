// True only for a same-origin path: exactly one leading "/", no backslash,
// no whitespace or control character, no encoded slash or backslash in the
// first segment. Checked again once decoded; a malformed escape is refused.
function passes(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (value.includes("\\")) return false;
  if (/[\s\u0000-\u001f\u007f]/.test(value)) return false;
  const firstSegment = value.slice(1).split(/[/?#]/)[0];
  if (/%(2f|5c)/i.test(firstSegment)) return false;
  return true;
}

export function isSameOriginPath(value: string): boolean {
  if (!passes(value)) return false;
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return false;
  }
  return passes(decoded);
}
