# 29. SEO and AI-answer panel beside the editor

## Objective
Plan card 21. While a client edits an entry, a panel checks the page the way KC's SEO rules do: title and description length, how the result snippet will truncate, headings, image alt text, reading grade, and whether the page opens with a short direct answer (what AI answer engines quote). All checks are pure functions in `kc/seo/`, run in the browser on the live form values, with no network. The panel shows only when the entry has the fields it needs.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, Copy rule, `kc/` imports use relative `.ts` paths)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, card 21
- `D:\Dev\htdocs\kc-cms\.claude\rules\content-and-seo.md` (the source of the length rules; read only)
- `D:\Dev\htdocs\kc-cms-app\components\entry\entry-form.tsx` (the render at about 1153-1178; `Form` is react-hook-form's provider, so a child can `useWatch`)
- `D:\Dev\htdocs\kc-cms-app\kc\dashboard.tsx` and `kc\tests\dashboard.test.ts` (style of a KC component and its source test)
- `C:\personas\cas\memory\design-slop.md`

## Start here
- `kc/seo/rules.ts`: pure. Title 50 to 60 chars, description 120 to 155; snippet truncation (cut at the limit on a word boundary with an ellipsis); any H1 in the body flagged (markdown `# ` and `<h1`), since the template's title is the H1; skipped heading levels (h2 then h4); markdown images `![](...)` and `<img>` without alt; answer-first: the first paragraph comes before any heading and runs 25 to 60 words. Each check returns a plain result (ok or a problem with a short message).
- `kc/seo/readability.ts`: Flesch-Kincaid grade (0.39*words/sentences + 11.8*syllables/words - 15.59) with a simple syllable counter. The test uses a fixed paragraph whose grade you count by hand in a comment; within 0.5.
- `kc/seo/panel.tsx`: client component. Finds fields by name `title`, `description`, `body` (top level); returns null when they are missing. Watches values with `useWatch`. Below the form inside a `<details>` on a phone (mobile first, works without JS as a closed details); beside the form from 1280 (`min-[1280px]:` or `xl:`), open there.
- `entry-form.tsx`: smallest hook. Render `<SeoPanel fields={fields} />` inside `<Form>`, and wrap form plus panel in a container that is one column by default and two columns from 1280. The form's own markup otherwise unchanged.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/seo-rules.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\seo\rules.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\seo\readability.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\seo\panel.tsx` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\seo-rules.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\components\entry\entry-form.tsx` (upstream file, named by the card)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\29-seo-panel\result.md` (new)

## Done-test
`node --test kc/tests/seo-rules.test.ts` passes. Title 50 to 60 and description 120 to 155 characters (from `content-and-seo.md`); snippet truncation; any H1 in the body flagged (the template's title is the H1); skipped heading levels; markdown and `<img>` without alt; Flesch-Kincaid grade on a fixed paragraph within 0.5 of a hand count; an answer-first check that the first paragraph comes before any heading and runs 25 to 60 words. Fields found by name (`title`, `description`, `body`), panel hidden without them; no `fetch` or `http` in `kc/seo/`. Below the form in a `<details>` on a phone, beside it from 1280 (a source test on `panel.tsx` and `entry-form.tsx`). Also `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: change the title upper limit from 60 to 70 in `rules.ts`, run the done-test, name the tests that failed, restore, run again green. Every run filtered to `kc/tests/seo-rules.test.ts`; never the full suite.

## Context
- Copy rule: every label and message a client reads in the panel is written with the `prose` skill, then run through `avoid-ai-writing` and `humanizer`, each invoked with the Skill tool. The panel's UI goes through `avoid-ai-design`. If the Skill tool refuses one, stop and say so in result.md. No eyebrow labels, no comma headlines (design-slop.md).
- Plain words for clients: no "SEO score", no jargon like "meta description" without saying what it is (the text under the link in search results).

## Boundaries
No commit, no push, no install, nothing outward. No new dependency: write the syllable counter yourself. Nothing in `kc/seo/` makes a network call. `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, each piece of copy written, and any call made and why. Say what was not done, including whether it was seen in a browser.
