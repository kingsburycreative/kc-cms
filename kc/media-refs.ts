// Card 78: refuse deleting a media file that content still uses (Henike site issue 48).
// Only files under the .pages.yml content paths are searched. A reference in src code
// does not block the delete: the CMS cannot load or edit those files, and the client
// could not act on the message.

export const MAX_MEDIA_REFS = 5;

type MediaConfig = { input: string; output?: string };
type ContentFile = { path: string; content?: string | null };
type ContentItem = { type?: string; path?: string };

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

/** Every form a content file can use to point at the media file. */
export function mediaPathForms(mediaPath: string, media: MediaConfig): string[] {
  const inputPath = trimSlashes(mediaPath);
  const input = trimSlashes(media.input);
  const forms = [inputPath];
  if (media.output !== undefined && (inputPath === input || inputPath.startsWith(`${input}/`))) {
    const rest = inputPath.slice(input.length).replace(/^\/+/, "");
    const output = trimSlashes(media.output);
    forms.push(output ? `${output}/${rest}` : rest);
  }
  return Array.from(new Set(forms.filter(Boolean)));
}

const isUnder = (filePath: string, root: string) => {
  const r = trimSlashes(root);
  return r === "" || filePath === r || filePath.startsWith(`${r}/`);
};

/** Content files (under contentRoots) that reference the media file, capped at five. */
export function findMediaRefs(
  mediaPath: string,
  media: MediaConfig,
  files: ContentFile[],
  contentRoots: string[],
): string[] {
  const forms = mediaPathForms(mediaPath, media);
  const refs: string[] = [];
  for (const file of files) {
    if (refs.length >= MAX_MEDIA_REFS) break;
    if (!file.content || !contentRoots.some((root) => isUnder(trimSlashes(file.path), root))) continue;
    if (forms.some((form) => file.content!.includes(form))) refs.push(file.path);
  }
  return refs;
}

/** The roots to search and the folders to read, from the config's content entries. */
export function contentScope(content: ContentItem[] | undefined): { roots: string[]; dirs: string[] } {
  const roots: string[] = [];
  const dirs: string[] = [];
  for (const item of content ?? []) {
    if (!item?.path) continue;
    const p = trimSlashes(item.path);
    roots.push(p);
    dirs.push(item.type === "file" ? p.split("/").slice(0, -1).join("/") : p);
  }
  return { roots, dirs: Array.from(new Set(dirs)) };
}

export const MEDIA_IN_USE = (pages: string[]) =>
  `This file is still used on these pages: ${pages.join(", ")}. Remove it from them first, then delete it here.`;

/** The route's hook: throws a 409 with the friendly message when content uses the file. */
export async function assertMediaUnused(
  mediaPath: string,
  media: MediaConfig,
  content: ContentItem[] | undefined,
  readDir: (dir: string) => Promise<ContentFile[]>,
  createError: (message: string, status: number) => Error,
): Promise<void> {
  const { roots, dirs } = contentScope(content);
  const files = (await Promise.all(dirs.map(readDir))).flat();
  const refs = findMediaRefs(mediaPath, media, files, roots);
  if (refs.length > 0) throw createError(MEDIA_IN_USE(refs), 409);
}
