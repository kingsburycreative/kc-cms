import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { sql } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { emailKeySql, normaliseEmail } from "../email-normalise.ts";

const source = readFileSync(new URL("../../lib/collaborator-access.ts", import.meta.url), "utf8");
const render = (q: ReturnType<typeof sql>) => new PgDialect().sqlToQuery(q).sql;

// Postgres' split_part/replace/lower, enough to run the rendered key in JS.
function runKey(stored: string): string {
  const lower = stored.trim().toLowerCase();
  const [local, domain = ""] = lower.split("@");
  const text = render(emailKeySql(sql.raw("email")));
  const gmail = /in \('gmail\.com', 'googlemail\.com'\)/.test(text) && ["gmail.com", "googlemail.com"].includes(domain);
  if (!gmail) return lower;
  let out = local;
  if (/split_part\(split_part\(.*'@', 1\), '\+', 1\)/.test(text)) out = out.split("+")[0];
  if (/replace\(.*'\.', ''\)/.test(text)) out = out.replace(/\./g, "");
  return /\|\| '@gmail\.com'/.test(text) ? `${out}@gmail.com` : `${out}@${domain}`;
}

test("a stored Gmail invite matches the signing-in address with or without dots, plus tags or googlemail", () => {
  for (const signIn of ["first.last@gmail.com", "firstlast+x@googlemail.com", "FirstLast@gmail.com"]) {
    for (const stored of ["first.last@gmail.com", "FirstLast@googlemail.com", "firstlast+cms@gmail.com"]) {
      assert.equal(runKey(stored), normaliseEmail(signIn), `${stored} vs ${signIn}`);
    }
  }
});

test("non-Gmail invites keep their dots on both sides", () => {
  assert.equal(runKey("First.Last@example.com"), "first.last@example.com");
  assert.equal(normaliseEmail("First.Last@example.com"), "first.last@example.com");
  assert.notEqual(runKey("first.last@example.com"), normaliseEmail("firstlast@example.com"));
});

test("every email comparison in collaborator-access goes through kc/email-normalise", () => {
  assert.doesNotMatch(source, /lower\(\$\{\w+\.email\}\)/);
  assert.match(source, /from "@\/kc\/email-normalise"/);
  const uses = source.match(/emailKeySql\(\w+\.email\)\} = \$\{normaliseEmail\(/g) ?? [];
  assert.ok(uses.length >= 8, `expected every lookup normalised, found ${uses.length}`);
});
