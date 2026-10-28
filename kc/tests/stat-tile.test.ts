import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// JSX and "@/" imports cannot load under node --test, so these read the source.
const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const tile = read("../stat-tile.tsx");
const server = read("../dashboard-server.tsx");

const grid = tile.match(/STAT_GRID = "([^"]+)"/)![1].split(" ");

test("the dashboard tiles render through StatTile and the old Tile is gone", () => {
  assert.equal((server.match(/<StatTile label=/g) ?? []).length, 3);
  assert.doesNotMatch(server, /<Tile |function Tile\(/);
  assert.match(server, /<ul className=\{STAT_GRID\}>/);
});

test("the grid is two columns at the base width, with no breakpoint prefix", () => {
  assert.ok(grid.includes("grid-cols-2"));
  assert.ok(!grid.includes("grid-cols-1"));
  assert.ok(grid.some((c) => /^@\[900px\]:grid-cols-1$/.test(c)), "900px layout kept");
  assert.ok(grid.every((c) => !/^(min-\[|sm:|md:|lg:)/.test(c)), "wider layouts come from container queries");
});

test("the label is plain case: no uppercase or tracking classes", () => {
  const start = tile.indexOf("export function StatTile(");
  const body = tile.slice(start, tile.indexOf("export function StatTileSkeleton"));
  assert.doesNotMatch(body, /uppercase|tracking-|capitalize/);
  assert.ok(body.indexOf("tabular-nums") < body.indexOf("{label}</span>\n      {change"), "number before label");
});

test("the loading skeleton VisitsSkeleton uses StatTileSkeleton, not its own list", () => {
  const sk = read("../dashboard-skeleton.tsx");
  const visits = sk.slice(sk.indexOf("export function VisitsSkeleton"), sk.indexOf("export function SearchHealthSkeleton"));
  assert.match(sk, /import \{ StatTileSkeleton \} from "\.\/stat-tile\.tsx"/);
  assert.match(visits, /<StatTileSkeleton \/>/);
  assert.doesNotMatch(visits, /<ul|<li|min-\[480px\]/);
});

test("the skeleton draws the same tile count in the same grid, in shimmer blocks", () => {
  const skel = tile.slice(tile.indexOf("export function StatTileSkeleton"));
  assert.match(skel, /<ul className=\{STAT_GRID\}>/);
  assert.match(skel, /length: STAT_TILE_COUNT/);
  assert.match(tile, /STAT_TILE_COUNT = 3/);
  assert.match(tile, /BLOCK = "[^"]*kc-shimmer/);
  assert.equal((server.match(/<StatTile label=/g) ?? []).length, 3);
});
