// What an analytics panel shows: its data, a setup-pending note, or a load failure.
// The staff link is decided here, once, so no panel can show it to a client.
export type PanelState =
  | { kind: "data" }
  | { kind: "not-set-up"; staffLink: boolean }
  | { kind: "could-not-load" };

export function panelState({ configured, ok, staff }: { configured: boolean; ok: boolean; staff: boolean }): PanelState {
  if (!configured) return { kind: "not-set-up", staffLink: staff };
  return ok ? { kind: "data" } : { kind: "could-not-load" };
}

export const NOT_SET_UP = "Visit numbers will show here once analytics is connected.";
export const COULD_NOT_LOAD = "The visit numbers couldn't be loaded right now.";
export const STAFF_LINK_TEXT = "Add the analytics IDs";
export const STAFF_LINK_HREF = "#analytics-ids";
// Stat boxes are narrow, so they get a shorter line. Not set up has no tiles: one banner covers it.
export const TILE_COULD_NOT_LOAD = "Couldn't load right now.";
