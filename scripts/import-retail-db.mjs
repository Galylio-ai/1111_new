#!/usr/bin/env node
/**
 * Wrapper: import matched_retail.jsonl + full_products_catalog.jsonl into retail_db.
 *
 * This script re-uses import-supermarche-clean.mjs logic but targets RETAIL_DB_URL.
 *
 * Usage on VPS:
 *   RETAIL_DB_URL=postgres://retail_user:galylio-ai@localhost:5433/retail_db \
 *     node scripts/import-retail-db.mjs --matched ./matched_retail.jsonl
 *
 *   RETAIL_DB_URL=... \
 *     node scripts/import-retail-db.mjs --unmatched ./full_products_catalog.jsonl
 *
 *   --matched   sets is_matched=true, TRUNCATES first (fresh start)
 *   --unmatched sets is_matched=false, appends (--no-truncate)
 *   --dry-run   parse only, zero writes
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const RETAIL_DB_URL = process.env.RETAIL_DB_URL;
if (!RETAIL_DB_URL) {
  console.error("RETAIL_DB_URL env var is required");
  process.exit(1);
}

const rawArgs = process.argv.slice(2);
const isMatched   = rawArgs.includes("--matched");
const isUnmatched = rawArgs.includes("--unmatched");
const isDryRun    = rawArgs.includes("--dry-run");
const file        = rawArgs.find(a => !a.startsWith("--"));

if (!isMatched && !isUnmatched) {
  console.error("Specify --matched or --unmatched");
  process.exit(1);
}
if (!file) {
  console.error("Usage: node scripts/import-retail-db.mjs --matched|--unmatched <file.jsonl> [--dry-run]");
  process.exit(1);
}

const importer = join(__dirname, "import-supermarche-clean.mjs");

const extraFlags = [];
if (isMatched)   extraFlags.push("--is-matched");          // TRUNCATE + import as matched
if (isUnmatched) extraFlags.push("--no-truncate");         // append as unmatched
if (isDryRun)    extraFlags.push("--dry-run");

console.log(`\n→ Running: node ${importer} ${file} ${extraFlags.join(" ")}`);
console.log(`→ DB: ${RETAIL_DB_URL.replace(/:[^:@]+@/, ":***@")}\n`);

const result = spawnSync(
  process.execPath,
  [importer, file, ...extraFlags],
  {
    stdio: "inherit",
    env: { ...process.env, ALIMENTATION_DB_URL: RETAIL_DB_URL },
  }
);

process.exit(result.status ?? 1);
