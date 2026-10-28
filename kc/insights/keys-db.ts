// The insights_keys table, read and written by repo ("owner/repo", lower case).
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { insightsKeysTable } from "@/db/schema";
import { rowSources, type KeysField, type KeysRow } from "./keys.ts";
import type { InsightsSources } from "./map.ts";

export async function findInsightsKeys(repo: string): Promise<InsightsSources | null> {
  const row = await db.query.insightsKeysTable.findFirst({ where: eq(insightsKeysTable.repo, repo.toLowerCase()) });
  return row ? rowSources(row) : null;
}

export async function tableReposUsing(field: KeysField, value: string): Promise<string[]> {
  const rows = await db.select({ repo: insightsKeysTable.repo }).from(insightsKeysTable)
    .where(eq(insightsKeysTable[field], value));
  return rows.map((row) => row.repo);
}

export async function saveInsightsKeysRow(repo: string, row: KeysRow, by: string) {
  const values = { ...row, updatedAt: new Date(), updatedBy: by };
  await db.insert(insightsKeysTable).values({ repo: repo.toLowerCase(), ...values })
    .onConflictDoUpdate({ target: insightsKeysTable.repo, set: values });
}
