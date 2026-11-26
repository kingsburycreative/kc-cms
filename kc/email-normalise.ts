import { sql, type SQL, type SQLWrapper } from "drizzle-orm";

// Card 112: Gmail ignores dots and anything after "+" in the local part, so
// "first.last+x@googlemail.com" and "FirstLast@gmail.com" reach one inbox.
// Other providers keep their dots: they may be significant there.
const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

export function normaliseEmail(email: string): string {
  const lower = email.trim().toLowerCase();
  const at = lower.lastIndexOf("@");
  if (at < 1) return lower;
  const domain = lower.slice(at + 1);
  if (!GMAIL_DOMAINS.has(domain)) return lower;
  const local = lower.slice(0, at).split("+")[0].replace(/\./g, "");
  return `${local}@gmail.com`;
}

export function sameInbox(a: string, b: string): boolean {
  return normaliseEmail(a) === normaliseEmail(b);
}

// The same key computed in Postgres, for the stored side of an invite lookup.
// Compare it with normaliseEmail() of the address signing in.
export function emailKeySql(column: SQLWrapper): SQL {
  const lower = sql`lower(trim(${column}))`;
  return sql`(case when split_part(${lower}, '@', 2) in ('gmail.com', 'googlemail.com') then replace(split_part(split_part(${lower}, '@', 1), '+', 1), '.', '') || '@gmail.com' else ${lower} end)`;
}
