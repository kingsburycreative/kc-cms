// Card 112: a client's typed edits laid over a newer version of the file.
// Three-way, field by field: what they loaded (base), what is on GitHub now
// (theirs), what they typed (mine). A field only they changed keeps their text,
// a field only GitHub changed takes the new value, a field both changed keeps
// their text and is listed in conflicts by its dotted path.

type Obj = Record<string, unknown>;

export const isPlain = (value: unknown): value is Obj =>
  !!value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export type MergeResult = { merged: Obj; conflicts: string[] };

export function mergeFields(base: unknown, theirs: unknown, mine: unknown, prefix = ""): MergeResult {
  const b = isPlain(base) ? base : {};
  const t = isPlain(theirs) ? theirs : {};
  const m = isPlain(mine) ? mine : {};
  const merged: Obj = {};
  const conflicts: string[] = [];
  for (const key of new Set([...Object.keys(b), ...Object.keys(t), ...Object.keys(m)])) {
    const path = prefix ? `${prefix}.${key}` : key;
    // A key the form does not hold is one the client never saw: GitHub's value stands.
    if (!(key in m) || same(m[key], b[key])) {
      if (key in t) merged[key] = t[key];
      continue;
    }
    if (same(t[key], b[key]) || same(t[key], m[key])) {
      merged[key] = m[key];
      continue;
    }
    if (isPlain(m[key]) && isPlain(t[key]) && isPlain(b[key])) {
      const inner = mergeFields(b[key], t[key], m[key], path);
      merged[key] = inner.merged;
      conflicts.push(...inner.conflicts);
      continue;
    }
    merged[key] = m[key];
    conflicts.push(path);
  }
  return { merged, conflicts };
}

// A tab whose field list predates a .pages.yml change holds no value for the
// fields added since. Saving keeps the file's value for every key the form
// does not hold, at any depth of plain objects; the form wins wherever it has one.
export function keepUnknownFields(file: unknown, form: unknown): unknown {
  if (!isPlain(file) || !isPlain(form)) return form;
  const result: Obj = { ...form };
  for (const key of Object.keys(file)) {
    result[key] = key in form ? keepUnknownFields(file[key], form[key]) : file[key];
  }
  return result;
}
