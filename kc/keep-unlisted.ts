// deepMap rebuilds content from the schema's fields alone, so a key the CMS's
// copy of .pages.yml does not list is dropped on read and on save (Henike's
// FAQ, card 108). This puts every unlisted key from the raw content back into
// what the schema kept. A listed field is never overridden by the raw value.

type FieldLike = {
  name: string;
  type?: unknown;
  list?: unknown;
  fields?: FieldLike[];
  blocks?: FieldLike[];
  blockKey?: string;
};

const isPlain = (value: unknown): value is Record<string, any> =>
  !!value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);

function innerFields(field: FieldLike, item: unknown): FieldLike[] | null {
  if (field.type === "object") return field.fields || [];
  if (field.type === "block" && isPlain(item)) {
    const name = item[field.blockKey || "_block"];
    return field.blocks?.find((block) => block.name === name)?.fields || null;
  }
  return null;
}

function keepOne(field: FieldLike, raw: unknown, kept: unknown): unknown {
  if (field.list) {
    if (!Array.isArray(raw) || !Array.isArray(kept)) return kept;
    return kept.map((item, index) => {
      const inner = innerFields(field, raw[index]);
      return inner ? keepUnlisted(inner, raw[index], item) : item;
    });
  }
  const inner = innerFields(field, raw);
  return inner ? keepUnlisted(inner, raw, kept) : kept;
}

export function keepUnlisted<T>(fields: FieldLike[], raw: unknown, kept: T): T {
  if (!isPlain(raw) || !isPlain(kept)) return kept;
  const result: Record<string, any> = { ...kept };
  const listed = new Map(fields.map((field) => [field.name, field]));
  for (const key of Object.keys(raw)) {
    const field = listed.get(key);
    if (!field) {
      if (!(key in result)) result[key] = raw[key];
    } else if (key in result) {
      result[key] = keepOne(field, raw[key], result[key]);
    }
  }
  return result as T;
}
