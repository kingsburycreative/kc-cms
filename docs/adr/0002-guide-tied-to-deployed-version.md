# 0002: One live guide, stamped with the version it was checked on

Date: 2026-11-17. Decided by: Rob ("TIED TO VERSIONS"), shape recommended by the PM after a review pass, accepted with "begin".

## Context

Releases are tagged kc-2.1.8.N and listed in CHANGELOG-KC.md. kc.1 to kc.8 shipped in three days (Oct 27 to 29). All clients appear to use the one deployed CMS at cms.kingsburycreative.com (not confirmed for every repo). Keeping a full copy of the guide per release would mean eight near-identical guides nobody reads.

## Decision

- There is one live guide. Every page shows "Checked on KC CMS <version>, <date>".
- One script takes every guide screenshot from the demo site (kc-test-site with each module's config). Each release re-runs it and lists the pages whose pictures changed. Those pages are rechecked and re-stamped before the release is called done. A page with no changed pictures keeps its stamp.
- Rob reads each new or changed page before it goes live.

## Consequences

- The stamp tells a client, and us, exactly what the page was checked against.
- Changelog wording no longer has to be read by a person to catch a stale page; the pictures do it.
- If a client is ever pinned to an older CMS, this ADR is superseded by one that keeps per-version copies.
