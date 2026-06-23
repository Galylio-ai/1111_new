import { catalogPool } from "@/lib/db";

// Engagement tables (favorites / alerts / notifications) live in the catalog DB
// so the alert price-checker has direct, fast access to product prices.
//
// We bootstrap the schema lazily on first use (idempotent) — the app uses raw
// `pg`, not a migration runner, so this keeps deploys to a single `git pull +
// build` with no extra migrate step.

let ensured: Promise<void> | null = null;

export function ensureEngagementSchema(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      const pool = catalogPool();
      await pool.query(`
        CREATE EXTENSION IF NOT EXISTS pgcrypto;

        -- Favorites: a saved product. We store a snapshot (name/img/price/shop)
        -- so the profile can render & link them without re-joining at read time.
        CREATE TABLE IF NOT EXISTS user_favorites (
          id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id      TEXT NOT NULL,
          slug         TEXT NOT NULL,
          shop_slug    TEXT,
          name         TEXT NOT NULL,
          img          TEXT,
          brand        TEXT,
          price        NUMERIC(14,3),
          created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE (user_id, slug)
        );
        CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);

        -- Alerts: watch a product for a price drop. baseline_price is the price
        -- at creation (or last notification); the checker compares against it.
        -- We store the user's email/name so the cron job is self-sufficient.
        CREATE TABLE IF NOT EXISTS user_alerts (
          id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id        TEXT NOT NULL,
          email          TEXT,
          full_name      TEXT,
          slug           TEXT NOT NULL,
          shop_slug      TEXT,
          name           TEXT NOT NULL,
          img            TEXT,
          brand          TEXT,
          baseline_price NUMERIC(14,3),
          last_price     NUMERIC(14,3),
          active         BOOLEAN NOT NULL DEFAULT true,
          created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
          last_checked_at TIMESTAMPTZ,
          last_notified_at TIMESTAMPTZ,
          UNIQUE (user_id, slug)
        );
        CREATE INDEX IF NOT EXISTS idx_user_alerts_user ON user_alerts(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_alerts_active ON user_alerts(active);

        -- Notifications: shown in the profile + navbar bell.
        CREATE TABLE IF NOT EXISTS user_notifications (
          id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id     TEXT NOT NULL,
          type        TEXT NOT NULL DEFAULT 'price_drop',
          title       TEXT NOT NULL,
          body        TEXT,
          slug        TEXT,
          shop_slug   TEXT,
          img         TEXT,
          old_price   NUMERIC(14,3),
          new_price   NUMERIC(14,3),
          read        BOOLEAN NOT NULL DEFAULT false,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id, read, created_at DESC);
      `);
    })().catch((e) => {
      // Reset so a transient failure can retry on the next request.
      ensured = null;
      throw e;
    });
  }
  return ensured;
}
