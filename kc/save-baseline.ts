// The entry form's baseline after a save attempt: the saved values when the
// save went through, the old baseline when it did not. A save that reports
// nothing (undefined) counts as saved, as upstream's callers did.
export function nextBaseline<T>(current: T, submitted: T, saveResult: boolean | void): T {
  return saveResult === false ? current : submitted;
}
