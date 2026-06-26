#!/usr/bin/env node
/**
 * Uploads category_shop_price_rankings.json into retail_db.
 *
 * Creates two tables:
 *   price_ranking_scopes  — one row per scope
 *   price_ranking_shops   — one row per shop per scope
 *
 * Safe to re-run: truncates and re-inserts every time.
 *
 * Usage:
 *   RETAIL_DB_URL=postgres://retail_user:galylio-ai@localhost:5433/retail_db \
 *     node scripts/import-price-rankings.mjs ./category_shop_price_rankings.json
 */
import { readFileSync } from "node:fs";
import { Pool } from "pg";

const DB_URL = process.env.RETAIL_DB_URL;
if (!DB_URL) { console.error("RETAIL_DB_URL is required"); process.exit(1); }

const file = process.argv[2];
if (!file) { console.error("Usage: node scripts/import-price-rankings.mjs <file.json>"); process.exit(1); }

const pool = new Pool({ connectionString: DB_URL, max: 2 });

async function main() {
  const data = JSON.parse(readFileSync(file, "utf8"));
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_ranking_scopes (
        id          SERIAL PRIMARY KEY,
        scope_id    TEXT UNIQUE NOT NULL,
        scope_name  TEXT NOT NULL,
        level1_id   TEXT,
        level2_id   TEXT,
        matched_products INT,
        distinct_shops   INT,
        generated_at     TIMESTAMPTZ
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_ranking_shops (
        id                        SERIAL PRIMARY KEY,
        scope_id                  TEXT NOT NULL REFERENCES price_ranking_scopes(scope_id) ON DELETE CASCADE,
        rank                      INT NOT NULL,
        shop_key                  TEXT NOT NULL,
        products_compared         INT,
        coverage_rate             NUMERIC(8,6),
        pairwise_comparisons      INT,
        wins                      INT,
        losses                    INT,
        ties                      INT,
        fair_win_rate             NUMERIC(8,6),
        cheapest_score            NUMERIC(12,4),
        avg_price_index           NUMERIC(10,6),
        median_price_index        NUMERIC(10,6),
        avg_extra_cost_vs_cheapest NUMERIC(12,4),
        confidence                TEXT,
        UNIQUE(scope_id, shop_key)
      )
    `);

    // Truncate and re-insert
    await client.query("TRUNCATE price_ranking_shops, price_ranking_scopes RESTART IDENTITY CASCADE");
    console.log("✓ Tables truncated.");

    const generatedAt = data.metadata?.generated_at ?? null;

    for (const scope of data.scopes) {
      await client.query(
        `INSERT INTO price_ranking_scopes
           (scope_id, scope_name, level1_id, level2_id, matched_products, distinct_shops, generated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (scope_id) DO UPDATE SET
           scope_name=EXCLUDED.scope_name, matched_products=EXCLUDED.matched_products,
           distinct_shops=EXCLUDED.distinct_shops, generated_at=EXCLUDED.generated_at`,
        [scope.scope_id, scope.scope_name, scope.level1_id ?? null, scope.level2_id ?? null,
         scope.matched_products_in_scope ?? null, scope.distinct_shops ?? null, generatedAt]
      );

      for (const sh of scope.ranked_shops) {
        await client.query(
          `INSERT INTO price_ranking_shops
             (scope_id, rank, shop_key, products_compared, coverage_rate, pairwise_comparisons,
              wins, losses, ties, fair_win_rate, cheapest_score, avg_price_index,
              median_price_index, avg_extra_cost_vs_cheapest, confidence)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
           ON CONFLICT (scope_id, shop_key) DO UPDATE SET
             rank=EXCLUDED.rank, fair_win_rate=EXCLUDED.fair_win_rate,
             cheapest_score=EXCLUDED.cheapest_score, confidence=EXCLUDED.confidence`,
          [scope.scope_id, sh.rank, sh.shop, sh.products_compared ?? null,
           sh.coverage_rate ?? null, sh.pairwise_comparisons ?? null,
           sh.wins ?? null, sh.losses ?? null, sh.ties ?? null,
           sh.fair_win_rate ?? null, sh.cheapest_score ?? null,
           sh.avg_price_index ?? null, sh.median_price_index ?? null,
           sh.avg_extra_cost_vs_cheapest ?? null, sh.confidence ?? null]
        );
      }
      console.log(`  ✓ ${scope.scope_id} — ${scope.ranked_shops.length} shops`);
    }

    await client.query("COMMIT");
    console.log("\n✓ Import complete.");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
