# 111 result

Files: `kc/save-error.ts` (already existed with card 77's 413 helpers; classifier appended, old code kept), `kc/sign-in-error.ts` (new), `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts` (calls `classifySaveError`, console.warn with owner, repo, status, GitHub message on "protected"), `components/sign-in.tsx` (inline error under email, red border, aria-invalid/aria-describedby, cleared on input, mailto with min-h-11 = 44px; toast kept for other codes).

Tests: `kc/tests/save-error.test.ts`, `kc/tests/sign-in-error.test.ts`. Runner ran the full suite: 891 pass.

Mutation: removed the classic-protection patterns; "classic protected-branch 409 is protected, never conflict" failed; restored, green.

Matched strings: "Repository rule violations found" (rulesets), "Protected branch update failed for refs/heads/<branch>." and "Changes must be made through a pull request." (classic protection, from memory of GitHub REST responses, not re-checked against docs this run).

Copy: sign-in uses Rob's approved wording verbatim. Save: "Your change couldn't be saved because of a setting on this site. Your text is still on screen, so don't close this page. Email hello@kingsburycreative.com and we'll sort it out."

Not done: prose / avoid-ai-writing / humanizer passes on the copy; tsc, eslint; 390px screenshot. Sign-in relies on `result.error.code === "EMAIL_NOT_INVITED"` from better-auth, unverified live.
