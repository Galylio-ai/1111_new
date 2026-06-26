const SKIP_KEYS = new Set(["gtin", "sku", "reference"]);

function cleanKey(k) {
  return String(k ?? "").trim();
}

function cleanValue(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return "";
  return String(v).trim().replace(/\s+/g, " ");
}

/**
 * @param {Record<string, unknown>} rec — matched.jsonl row
 * @returns {{ spec_key: string; spec_value: string }[]}
 */
export function extractProductSpecs(rec) {
  const rows = [];
  const seen = new Set();

  const add = (key, value) => {
    const spec_key = cleanKey(key);
    const spec_value = cleanValue(value);
    if (!spec_key || !spec_value || SKIP_KEYS.has(spec_key)) return;
    const sig = `${spec_key}\0${spec_value}`;
    if (seen.has(sig)) return;
    seen.add(sig);
    rows.push({ spec_key, spec_value });
  };

  if (rec.data_quality_score != null && rec.data_quality_score !== "") {
    add("data_quality_score", rec.data_quality_score);
  }
  if (rec.shop_count != null && rec.shop_count !== "") {
    add("shop_count", rec.shop_count);
  }

  const techSpecs = rec.specifications ?? rec.specs;
  if (!techSpecs) return rows;

  if (Array.isArray(techSpecs)) {
    for (const spec of techSpecs) {
      if (!spec || typeof spec !== "object") continue;
      const s = /** @type {Record<string, unknown>} */ (spec);
      add(s.spec_key ?? s.key, s.spec_value ?? s.value);
    }
    return rows;
  }

  if (typeof techSpecs === "object") {
    for (const [k, v] of Object.entries(techSpecs)) {
      add(k, v);
    }
  }

  return rows;
}

export const HIDDEN_SPEC_KEYS = ["data_quality_score", "shop_count"];

/**
 * @param {unknown} specifications — JSONB object/array from catalog_db
 * @returns {{ spec_key: string; spec_value: string }[]}
 */
export function specificationsToRows(specifications) {
  return extractProductSpecs({ specifications });
}

/** @param {string | null | undefined} url */
export function normalizeProductUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url.trim());
    u.hash = "";
    let path = u.pathname.replace(/\/+$/, "") || "/";
    return `${u.origin}${path}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase().replace(/\/+$/, "");
  }
}
