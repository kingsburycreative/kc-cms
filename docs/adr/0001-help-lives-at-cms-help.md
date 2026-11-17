# 0001: The help guide lives on the CMS site at /help

Status: superseded by 0004 (2026-11-17).

Date: 2026-11-17. Decided by: Rob (asked for one guide plus modules, replacing PDFs; accepted the PM's recommendation when he said "write the prd and adr's and begin").

## Context

Clients edit through KC CMS. Guides so far were a PDF or a page per client (public/guides/besciworks). A guide behind sign-in cannot help someone who cannot sign in.

## Decision

The guide is a set of public pages served by the CMS app at /help: one core guide and one page per module. Inside the app, a Help link opens the core guide and lists only the modules that client's site has (read from its .pages.yml). Pages hold no client data.

## Consequences

- Sign-in help is reachable without signing in.
- One place to update; no PDFs to regenerate.
- A module page is visible to anyone with the URL. Acceptable: it shows how a screen works, not anyone's content.
