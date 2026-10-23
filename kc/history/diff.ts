// What one edit changed, field by field. Pure: no React, no network.

export type Field = { name: string; label?: string; type?: string; list?: boolean; fields?: Field[] };

export type FieldChange = { label: string; kind: "changed" | "added" | "removed"; before: unknown; after: unknown };
export type BodyLine = { kind: "same" | "added" | "removed"; text: string };
export type EntryDiff = { fields: FieldChange[]; body: BodyLine[] };

const isEmpty = (value: unknown) => value === undefined || value === null || value === "";
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function compare(label: string, before: unknown, after: unknown, field: Field, out: FieldChange[]) {
  if (isEmpty(before) && isEmpty(after)) return;
  const nested = field.fields?.length ? field.fields : null;
  if (nested && Array.isArray(before ?? after) && (Array.isArray(before) || isEmpty(before)) && (Array.isArray(after) || isEmpty(after))) {
    const a = (before as unknown[]) ?? [];
    const b = (after as unknown[]) ?? [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      walk(`${label} > ${i + 1}`, a[i], b[i], nested, out);
    }
    return;
  }
  if (nested && (isObject(before) || isEmpty(before)) && (isObject(after) || isEmpty(after))) {
    walk(label, before, after, nested, out);
    return;
  }
  if (same(before, after)) return;
  const kind = isEmpty(before) ? "added" : isEmpty(after) ? "removed" : "changed";
  out.push({ label, kind, before: before ?? null, after: after ?? null });
}

function walk(prefix: string, before: unknown, after: unknown, fields: Field[], out: FieldChange[]) {
  const a = isObject(before) ? before : {};
  const b = isObject(after) ? after : {};
  if (isEmpty(before) && isEmpty(after)) return;
  // A list item that appeared or vanished whole is one change, not one per field.
  if (isEmpty(before) !== isEmpty(after)) {
    out.push({ label: prefix, kind: isEmpty(before) ? "added" : "removed", before: before ?? null, after: after ?? null });
    return;
  }
  for (const field of fields) {
    compare(`${prefix} > ${field.label || field.name}`, a[field.name], b[field.name], field, out);
  }
}

// Line by line, through the longest common run.
export function diffLines(before: string, after: string): BodyLine[] {
  const a = before === "" ? [] : before.split("\n");
  const b = after === "" ? [] : after.split("\n");
  const table: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const lines: BodyLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { lines.push({ kind: "same", text: a[i] }); i++; j++; }
    else if (table[i + 1][j] >= table[i][j + 1]) { lines.push({ kind: "removed", text: a[i] }); i++; }
    else { lines.push({ kind: "added", text: b[j] }); j++; }
  }
  while (i < a.length) lines.push({ kind: "removed", text: a[i++] });
  while (j < b.length) lines.push({ kind: "added", text: b[j++] });
  return lines;
}

// Only what differs. The "body" key is diffed by line; other keys by schema field.
export function diffEntry(before: Record<string, unknown> | null | undefined, after: Record<string, unknown> | null | undefined, fields: Field[]): EntryDiff {
  const a = before ?? {};
  const b = after ?? {};
  const out: FieldChange[] = [];
  for (const field of fields) {
    if (field.name === "body") continue;
    compare(field.label || field.name, a[field.name], b[field.name], field, out);
  }
  const bodyA = typeof a.body === "string" ? a.body : "";
  const bodyB = typeof b.body === "string" ? b.body : "";
  const body = bodyA === bodyB ? [] : diffLines(bodyA, bodyB);
  return { fields: out, body };
}
