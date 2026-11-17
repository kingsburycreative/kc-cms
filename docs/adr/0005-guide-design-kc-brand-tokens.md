# 0005: The guide looks like Kingsbury Creative, from one swappable tokens file

Date: 2026-11-17. Decided by: Rob ("The font is gross. The design is weak... remember, we're Kingsbury CREATIVE"; "Sure go" on the PM's direction; "I'll be revamping the KC design system soon anyway"), direction from D:\Dev\hq\.claude\work\guide-redesign\research.md with one change by the PM.

## Context

The first preview used the system font, a stray green and bare placeholders. KC's brand (D:\Dev\htdocs\kingsburycreative\css\themes.css, fonts.css, fonts\) has Inter, Fraunces, JetBrains Mono, terracotta #C2602E and warm darks. Rob called Fraunces headlines "gross" on 2026-11-01 (design-slop item 7). The KC design system will be revamped soon.

## Decision

- Every font, colour, size, radius and shadow the guide uses comes from one file, `kc/guide/tokens.css`, copied from KC's current brand. Nothing else in the guide names a raw colour or font. When the KC design system changes, that file (and the font files beside it) is swapped and the guide follows.
- Type: Inter for headings and body, headings heavier at normal tracking. No Fraunces headings. Big terracotta step numerals may use a display face from the tokens file. JetBrains Mono for menu paths.
- White page, terracotta accent, warm-dark text, no cream base (slop items 3, 7). Fonts self-hosted, no third-party requests.
- Page anatomy from the research: goal line, time and version stamp at the top; numbered steps, one action each, with "You will see" and "If not"; screenshots with one ring and a numbered dot matching the step; "Check it worked" and a help bar at the end. Mobile first: menu sheet on phones, on-this-page rail on desktop.

## Consequences

- The KC design system revamp needs no guide rewrite, only a new tokens file.
- Pages must use the shared step and figure markup, not free HTML, so the look stays consistent.
