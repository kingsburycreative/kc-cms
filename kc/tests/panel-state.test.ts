import { test } from "node:test";
import assert from "node:assert/strict";
import { panelState } from "../panel-state.ts";

test("no IDs is setup-pending, whether or not the fetch worked", () => {
  assert.equal(panelState({ configured: false, ok: false, staff: false }).kind, "not-set-up");
  assert.equal(panelState({ configured: false, ok: true, staff: true }).kind, "not-set-up");
});

test("IDs set with a failed fetch is could-not-load, never the setup state", () => {
  assert.deepEqual(panelState({ configured: true, ok: false, staff: true }), { kind: "could-not-load" });
});

test("IDs set with a good fetch is data", () => {
  assert.deepEqual(panelState({ configured: true, ok: true, staff: false }), { kind: "data" });
});

test("the staff link is only for staff", () => {
  assert.deepEqual(panelState({ configured: false, ok: false, staff: true }), { kind: "not-set-up", staffLink: true });
  assert.deepEqual(panelState({ configured: false, ok: false, staff: false }), { kind: "not-set-up", staffLink: false });
});
