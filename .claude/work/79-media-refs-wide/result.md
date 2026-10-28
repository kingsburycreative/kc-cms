# 79 result

Files: `kc/media-refs.ts`, `kc/tests/media-refs.test.ts`, upstream `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts` (the `assertMediaUnused` call now passes `githubRepoReader(createOctokitInstance(token), owner, repo, branch)` instead of a `getCollectionCache` folder reader; the import line was changed to match). The register entry already lists the route, so `customizations.json` was left alone.

Search: one recursive `git.getTree` call, then `git.getBlob` for each text file under a `.pages.yml` path (file entries and collections, all subfolders) or under `src/`. Skipped: blobs over 1 MB and binary extensions. Matches the input path, the output path (with or without a slash) and `./`/`../` specifiers resolved against the importing file's folder. Five-name cap, 409 and message unchanged.

Tests added: type: file JSON hit, nested subfolder hit, src relative import hit, a relative import of a different file allowed, public output path hit in src, unreferenced allowed, >1 MB and binary skipped (never read), one tree call (fake octokit). Card 78's "src reference ignored" test was replaced with "file outside every root ignored", because this card reverses that rule.

Mutation: no recursion made 3 fail (nested subfolder, src relative import, src output path). Dropping src made 2 fail (src relative import, src output path). Restored, 502/502 green. tsc and eslint kc clean.

Note: the runner ran the full suite even with a file argument.
