# Board

## Now

- **insights-gate**: close the cross-tenant gap the security audit of PR #16
  found. Today the Insights check is "can this user read the repo on GitHub",
  and anyone can sign up with GitHub, so a mapped repo that is public, or an
  org member with read on every repo, would show a client's analytics to
  someone who isn't that client.
  - Insights (the page in `app/(main)/[owner]/[repo]/[branch]/insights/page.tsx`
    and the sidebar flag computed in the repo `layout.tsx`) is shown only to:
    an admin (`hasAdminAccess` from `lib/admin.ts`); a GitHub-login user whose
    GitHub repo permissions include `push` (from the same repo lookup the
    access check already makes, not a new GitHub call if one is avoidable);
    or an email-login collaborator of that exact repo (the existing
    collaborator check). Everyone else gets the "Access denied" message and
    no sidebar item. Put the decision in a pure `kc/insights/gate.ts`
    function so it is testable.
  - Trim cities and channel labels to 80 characters too, like page paths
    (`kc/insights/route.ts`).
  - Tests: the gate for admin, push, read-only GitHub user, collaborator,
    stranger; and the trimming of all three label kinds. Risky path.

## Next

## Waiting on Rob

- B2 signup.

## Blocked

## Done

- **title-hook**: committed on feat/07-title-hook, gate green, no audit (not a risky path).
- **update-banner**: committed on feat/06-update-banner, gate green, no audit (not a risky path).
- **client-view**: committed on feat/05-client-view, gate green, no audit (not a risky path).
- **branding**: committed on feat/03-branding, gate green, audit clean.
- **upstream-watch**: PR #5, merged. A manual run went green and opened no PR.
- **insights-core**: PR #1, merged.
- **uptime**: PR #3, merged, and `KC_UPTIME_ENABLED` is `true`.
