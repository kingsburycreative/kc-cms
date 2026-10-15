# 11. Settings gate: result

**Files:** new `kc/settings-gate.ts` (pure `pushDenial`, `isSettingsPath`), `kc/settings-gate-server.ts` (`requireOwnRepoPush`, any failure a 403). Hooks in files POST and DELETE, rename, entries, history, actions POST, action run POST. `lib/operations.ts` unchanged.

**Round 3 (audit fix):** DELETE and rename now check `isSettingsPath(raw) || isSettingsPath(normalized)`, so the string GitHub receives is always judged; rename's destination checks `normalizedNewPath` the same way. POST, entries and history already checked `normalizedPath` (history sends its decoded form, which `isSettingsPath` decodes identically).

**Tests:** `kc/tests/settings-gate.test.ts`, 13 tests. New: `a\b/../.pages.yml` and `a%2Fb/../.pages.yml` count once normalised. DELETE and rename source-order tests now require the normalised check and that the normalised variable is what goes to GitHub. Suite 98/98; tsc and eslint exit 0.

**Mutation:** round 1, gate removed from actions POST: "actions POST..." failed. Round 3, rename destination back to raw only: "rename: .pages.yml is gated and refused as source, and refused as destination" failed; DELETE back to raw only: "files DELETE: .pages.yml is gated and still refused before the delete" failed. Restored, green. Round 2's rerun mutation was refused by the permission classifier and not run.

**Calls:** renaming onto `.pages.yml` is refused for everyone; GET actions stays open (lists only); email collaborators can no longer dispatch actions.
