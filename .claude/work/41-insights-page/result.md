# 41 result

Files: `kc/insights/charts-section.tsx` (new), `app/(main)/[owner]/[repo]/[branch]/insights/page.tsx` (load series, render section above cards; key read once into `key` and shared by both loaders), `kc/tests/insights-page.test.ts` (new, 5 source tests).

Page calls `loadSeries` with the same sources and key, `.catch(() => null)`; on null no section, cards unchanged. ChartsSection takes only `series`; only `series.days` reaches the client `InsightsChart`.

Mutation: removed `{series && <ChartsSection ... />}` from the page. Failed: "charts section sits above the cards", "a series failure drops only the charts", "charts section props carry no key or token". Restored, 271 pass. tsc and eslint kc exit 0.

Copy (prose, then avoid-ai-writing and humanizer, both clean, no edits):
- Heading: "Daily traffic" (changed from the reviewed "Visits by day" because the section shows page views too)
- "A visit is one person coming to the site. A page view is each page they open while they are there, so one visit can count several page views."
- GA4 only: "These charts only count visitors who allowed analytics on the site."

avoid-ai-design: dashboard profile, existing tokens, no tells found.

Not done: not viewed in a browser (375/768/1024 unchecked). The runner ran the whole glob even with the file arg.
