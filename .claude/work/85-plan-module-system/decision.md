# Card 01 decision (Rob, 2026-10-28)

- Modules live in their own repo, kingsburycreative/kc-modules, not in kc-framework. Cards 02-14 point at `D:\Dev\htdocs\kc-modules`, and the `.gitattributes` and `git archive` checks in card 02 are dropped since there is no WordPress zip to protect.
- Installing `@kingsburycreative/kc-modules` in besciworks and henike-contracting: approved.
- Read-only GitHub Packages token (classic, `read:packages` only, 1 year): made and saved in Infisical, project KC-CMS, as `KC_PACKAGES_READ_TOKEN`. It goes into each site's Cloudflare build secrets at card 11.
