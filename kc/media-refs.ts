// Card 78: refuse deleting a media file that content still uses (Henike site issue 48).
// Card 79: the search covers every .pages.yml path (file entries and collections, with
// their subfolders) and the site code under src/, so an image a component imports cannot
// be deleted and break the deploy. One recursive tree read per delete.

export const MAX_MEDIA_REFS = 5;
export const MAX_BLOB_BYTES = 1024 * 1024;

type MediaConfig = { input: string; output?: string };
type ContentFile = { path: string; content?: string | null };
type ContentItem = { type?: string; path?: string };
export type TreeEntry = { path: string; type: string; sha: string; size?: number };
export type RepoReader = {
  tree: () => Promise<TreeEntry[]>;
  blob: (sha: string) => Promise<string>;
};

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

const BINARY_EXT = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "avif", "svg", "ico", "bmp", "tif", "tiff", "heic",
  "woff", "woff2", "ttf", "otf", "eot", "pdf", "mp4", "webm", "mov", "avi", "mkv", "mp3",
  "wav", "ogg", "zip", "gz", "tgz", "tar", "rar", "7z",
]);

const isBinaryPath = (filePath: string) => {
  const name = filePath.split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  return dot > 0 && BINARY_EXT.has(name.slice(dot + 1).toLowerCase());
};

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

/** Resolves a relative specifier ("./x", "../x") against the folder of the file using it. */
function resolveRelative(fromFile: string, spec: string): string {
  const parts = fromFile.split("/").slice(0, -1);
  for (const seg of spec.split("/")) {
    if (seg === "..") parts.pop();
    else if (seg !== "." && seg !== "") parts.push(seg);
  }
  return parts.join("/");
}

const RELATIVE_SPEC = /["'`(]\s*(\.{1,2}\/[^"'`)\s?#]+)/g;

function referencesMedia(file: { path: string; content: string }, forms: string[], inputPath: string): boolean {
  if (forms.some((form) => file.content.includes(form))) return true;
  for (const match of file.content.matchAll(RELATIVE_SPEC)) {
    if (resolveRelative(file.path, match[1]) === inputPath) return true;
  }
  return false;
}

/** Files (under contentRoots) that reference the media file, capped at five. */
export function findMediaRefs(
  mediaPath: string,
  media: MediaConfig,
  files: ContentFile[],
  contentRoots: string[],
): string[] {
  const forms = mediaPathForms(mediaPath, media);
  const inputPath = trimSlashes(mediaPath);
  const refs: string[] = [];
  for (const file of files) {
    if (refs.length >= MAX_MEDIA_REFS) break;
    const path = trimSlashes(file.path);
    if (!file.content || !contentRoots.some((root) => isUnder(path, root))) continue;
    if (referencesMedia({ path, content: file.content }, forms, inputPath)) refs.push(file.path);
  }
  return refs;
}

/** The roots to search: every config content path (file or collection) plus src/. */
export function contentScope(content: ContentItem[] | undefined): { roots: string[] } {
  const roots: string[] = ["src"];
  for (const item of content ?? []) {
    if (item?.path) roots.push(trimSlashes(item.path));
  }
  return { roots: Array.from(new Set(roots)) };
}

/** Reads the text files under the roots from one recursive tree, skipping binaries and big blobs. */
export async function loadScopedFiles(roots: string[], repo: RepoReader): Promise<ContentFile[]> {
  const entries = await repo.tree();
  const wanted = entries.filter((entry) =>
    entry.type === "blob" &&
    (entry.size ?? 0) <= MAX_BLOB_BYTES &&
    !isBinaryPath(entry.path) &&
    roots.some((root) => isUnder(trimSlashes(entry.path), root)),
  );
  return Promise.all(wanted.map(async (entry) => ({ path: entry.path, content: await repo.blob(entry.sha) })));
}

type GitOctokit = {
  rest: {
    git: {
      getTree: (args: { owner: string; repo: string; tree_sha: string; recursive: string }) =>
        Promise<{ data: { tree: Array<{ path?: string; type?: string; sha?: string; size?: number }> } }>;
      getBlob: (args: { owner: string; repo: string; file_sha: string }) =>
        Promise<{ data: { content: string; encoding: string } }>;
    };
  };
};

/** The route's GitHub reads: one recursive tree call, then blobs by sha. */
export function githubRepoReader(octokit: GitOctokit, owner: string, repo: string, branch: string): RepoReader {
  return {
    tree: async () => {
      const { data } = await octokit.rest.git.getTree({ owner, repo, tree_sha: branch, recursive: "1" });
      return data.tree
        .filter((e) => e.path && e.type && e.sha)
        .map((e) => ({ path: e.path!, type: e.type!, sha: e.sha!, size: e.size }));
    },
    blob: async (sha) => {
      const { data } = await octokit.rest.git.getBlob({ owner, repo, file_sha: sha });
      return data.encoding === "base64" ? Buffer.from(data.content, "base64").toString("utf8") : data.content;
    },
  };
}

export const MEDIA_IN_USE = (pages: string[]) =>
  `This file is still used on these pages: ${pages.join(", ")}. Remove it from them first, then delete it here.`;

/** The route's hook: throws a 409 with the friendly message when content or src code uses the file. */
export async function assertMediaUnused(
  mediaPath: string,
  media: MediaConfig,
  content: ContentItem[] | undefined,
  repo: RepoReader,
  createError: (message: string, status: number) => Error,
): Promise<void> {
  const { roots } = contentScope(content);
  const files = await loadScopedFiles(roots, repo);
  const refs = findMediaRefs(mediaPath, media, files, roots);
  if (refs.length > 0) throw createError(MEDIA_IN_USE(refs), 409);
}
