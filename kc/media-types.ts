// Which media files may be uploaded or renamed into. A media config that names
// no extensions (missing, or a list that came out empty) gets this safe list
// instead of anything at all, so a client cannot commit .svg, .html or .js
// into the site. Pure: the upload and rename routes call it.

export const DEFAULT_MEDIA_EXTENSIONS: readonly string[] = ["jpg", "jpeg", "png", "webp", "avif", "gif", "pdf"];

// Same rule as getFileExtension in lib/utils/file.ts: the text after the last
// dot of the file name, and none for a dotfile like .gitkeep.
function extensionOf(path: string): string {
  const filename = path.split("/").pop() || "";
  if (filename.startsWith(".") && !filename.includes(".", 1)) return "";
  return /(?:\.([^.]+))?$/.exec(filename)?.[1] ?? "";
}

// U+0000-U+001F or U+007F. A null byte in "x.html\0.jpg" would pass on the .jpg
// while a store that truncates there would write x.html.
function hasControlCharacter(path: string): boolean {
  for (let i = 0; i < path.length; i++) {
    const code = path.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

// A path with a control character is refused under any list. A config's own
// non-empty list is matched exactly, as before; the default list ignores case.
export function isMediaPathAllowed(path: string, extensions?: readonly string[] | null): boolean {
  if (hasControlCharacter(path)) return false;
  const extension = extensionOf(path);
  if (extensions != null && extensions.length > 0) return extensions.includes(extension);
  return extension !== "" && DEFAULT_MEDIA_EXTENSIONS.includes(extension.toLowerCase());
}
