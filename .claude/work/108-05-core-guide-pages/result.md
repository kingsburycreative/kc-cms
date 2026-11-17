# 108.05 result

Prose, avoid-ai-writing and humanizer were all invoked via the Skill tool (none refused). Copy was drafted from the BeSciWorks guide, so the passes were light.

**Pages (kc/guide/pages/core-*.ts, all `approved = false`):** sign-in, find-your-way, change-page-text, add-remove-entry, photos-and-files, format-text, save-and-live-site, undo, see-who-visits, getting-help. Copy is in those files.

**Shape change:** `approved?: boolean` on GuidePage and `approvedPages()` in pages.ts; build.ts skips unapproved pages (no html, no nav). Placeholder (no flag) still builds. shell.ts untouched.

**Tests:** kc/tests/help-pages.test.ts (new). guide-build green. Note: the runner ran the full suite (697 pass).

**Mutation:** approvedPages returning everything, plus "repo" in core-undo: failed "uses none of the banned words" (core-undo) and "are left out of the built nav and the output". Restored, green.

**Picture markers (13):** sign-in page; dashboard; left menu; page open for editing; new blank entry; entry with three-dot menu; picture box Upload then file name; Media screen with three dots; long text box with formatting vs site; Save button; clock button with recent changes; earlier version with Restore; Insights page.

**Not verified:** every step is from the October BeSciWorks guide, not re-checked in the current CMS source. Image-specific steps (photos page) are inferred from the PDF steps; format-text drops footnotes; "Insights may be switched off" and "reload the page" lines are my inference. The follow-the-page-as-a-new-reader pass was not run separately.
