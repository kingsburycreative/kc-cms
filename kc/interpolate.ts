// Moved from lib/schema.ts so kc/tests can load it; lib/schema re-exports both.

// Safely access nested properties in an object
function safeAccess(obj: Record<string, any>, path: string) {
  return path.split(".").reduce((acc, part) => {
    if (part.endsWith("]")) {
      const [arrayPath, index] = part.split("[");
      if (!acc || typeof acc !== "object") return undefined;
      const arrayValue = acc[arrayPath];
      if (!Array.isArray(arrayValue)) return undefined;
      const parsedIndex = parseInt(index.replace("]", ""), 10);
      if (Number.isNaN(parsedIndex)) return undefined;
      return arrayValue[parsedIndex];
    }
    return acc && acc[part];
  }, obj);
}

// The entry's file name without its final extension, from data.name or the last
// segment of data.path. A name with no dot, or only a leading dot, stays whole.
function stemOf(data: Record<string, any>): string | undefined {
  let name = typeof data?.name === "string" ? data.name : undefined;
  if (name === undefined && typeof data?.path === "string") {
    name = data.path.split("/").pop();
  }
  if (!name) return undefined;
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

// Interpolate a string with a data object, with optional prefix fallback (e.g. "fields")
function interpolate(input: string, data: Record<string, any>, prefixFallback?: string): string {
  return input.replace(/(?<!\\)\{([^}]+)\}/g, (_, token) => {
    // First try direct access
    let value: unknown = safeAccess(data, token);

    // {stem} is built in, but a real data.stem wins
    if (value === undefined && token === "stem") {
      value = stemOf(data);
    }

    // If value is undefined and we have a prefix fallback, try with prefix
    if (value === undefined && prefixFallback) {
      value = safeAccess(data, `${prefixFallback}.${token}`);
    }

    return value !== undefined ? String(value) : '';
  }).replace(/\\([{}])/g, '$1');
}

export { safeAccess, interpolate };
