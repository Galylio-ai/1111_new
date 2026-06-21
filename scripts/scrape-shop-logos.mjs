/**
 * Scrape a real logo for every shop in catalog_db and save it locally.
 *
 * For each shop (domain derived from its product URLs / website_url):
 *   1. Fetch the homepage HTML.
 *   2. Extract the best logo candidate, in priority order:
 *        a. <link rel="...icon"> with the largest declared size (svg/png preferred)
 *        b. og:image / twitter:image meta
 *        c. <img> whose src/class/alt contains "logo"
 *        d. apple-touch-icon
 *   3. Fall back to Google's favicon service (always returns something).
 *   4. Download the image to public/shop-logos/<shop_key>.<ext>.
 *   5. Update shops.logo_url = "/shop-logos/<shop_key>.<ext>".
 *
 * Runs on the VPS (needs internet + DB). No extra deps — uses global fetch (Node 18+).
 *
 *   cd /home/ubuntu/project
 *   node scripts/scrape-shop-logos.mjs           # all shops missing a local logo
 *   node scripts/scrape-shop-logos.mjs --force   # re-fetch every shop
 *   node scripts/scrape-shop-logos.mjs spacenet mytek   # only these shops
 */
import pg from "pg";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public", "shop-logos");

/* ── env ──────────────────────────────────────────────────────────────────── */
const envPath = path.join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.CATALOG_DB_URL, max: 4 });

const FORCE = process.argv.includes("--force");
const ONLY = process.argv.slice(2).filter(a => !a.startsWith("--"));

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });

/* ── helpers ──────────────────────────────────────────────────────────────── */
async function fetchText(url, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, "Accept": "text/html" }, signal: ctrl.signal, redirect: "follow" });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; } finally { clearTimeout(t); }
}

async function fetchBuffer(url, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: ctrl.signal, redirect: "follow" });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!/image\//i.test(ct)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 200) return null;                       // junk / empty
    const ext = ct.includes("svg") ? "svg" : ct.includes("png") ? "png"
              : ct.includes("webp") ? "webp" : ct.includes("x-icon") || ct.includes("vnd.microsoft") ? "ico"
              : "jpg";
    return { buf, ext };
  } catch { return null; } finally { clearTimeout(t); }
}

function abs(base, src) {
  try { return new URL(src, base).href; } catch { return null; }
}

// Pull ordered logo candidate URLs out of homepage HTML.
function candidatesFromHtml(html, baseUrl) {
  const out = [];
  const push = u => { const a = abs(baseUrl, u); if (a && !out.includes(a)) out.push(a); };

  // og:image / twitter:image
  for (const re of [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi,
  ]) { let m; while ((m = re.exec(html))) push(m[1]); }

  // <link rel="...icon"> — prefer larger sizes / svg
  const links = [];
  const linkRe = /<link[^>]+>/gi; let lm;
  while ((lm = linkRe.exec(html))) {
    const tag = lm[0];
    if (!/rel=["'][^"']*icon[^"']*["']/i.test(tag) && !/rel=["']apple-touch-icon["']/i.test(tag)) continue;
    const href = (tag.match(/href=["']([^"']+)["']/i) || [])[1];
    if (!href) continue;
    const sizes = (tag.match(/sizes=["'](\d+)/i) || [])[1];
    const isSvg = /\.svg(\?|$)/i.test(href);
    links.push({ href, score: isSvg ? 9999 : (sizes ? parseInt(sizes, 10) : 16) });
  }
  links.sort((a, b) => b.score - a.score).forEach(l => push(l.href));

  // header <img> with "logo" in src/class/alt/id
  const imgRe = /<img[^>]+>/gi; let im;
  const logoImgs = [];
  while ((im = imgRe.exec(html))) {
    const tag = im[0];
    if (!/logo/i.test(tag)) continue;
    const src = (tag.match(/(?:data-src|src)=["']([^"']+)["']/i) || [])[1];
    if (src && !/sprite|placeholder|spinner|loading/i.test(src)) logoImgs.push(src);
  }
  logoImgs.slice(0, 5).forEach(push);

  return out;
}

function domainFor(shop) {
  if (shop.website_url) { try { return new URL(shop.website_url).hostname.replace(/^www\./, ""); } catch {} }
  return null;
}

async function resolveLogo(shop) {
  const domain = domainFor(shop);
  if (!domain) return null;
  const home = `https://${domain}/`;

  // 1. homepage candidates
  const html = await fetchText(home);
  const candidates = html ? candidatesFromHtml(html, home) : [];

  // 2. always-available fallbacks appended last
  candidates.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
  candidates.push(`${home}favicon.ico`);

  for (const url of candidates) {
    const img = await fetchBuffer(url);
    if (img) return { ...img, from: url, domain };
  }
  return null;
}

/* ── main ─────────────────────────────────────────────────────────────────── */
async function main() {
  let q = `SELECT id, shop_key, name, website_url, logo_url FROM shops WHERE product_count > 0`;
  const params = [];
  if (ONLY.length) { q += ` AND shop_key = ANY($1)`; params.push(ONLY); }
  q += ` ORDER BY product_count DESC`;
  const { rows: shops } = await pool.query(q, params);

  let ok = 0, fail = 0, skip = 0;
  for (const shop of shops) {
    const alreadyLocal = shop.logo_url?.startsWith("/shop-logos/");
    if (alreadyLocal && !FORCE) { skip++; continue; }

    const logo = await resolveLogo(shop);
    if (!logo) {
      console.log(`  ✗ ${shop.shop_key.padEnd(24)} no logo found`);
      fail++;
      continue;
    }
    const file = `${shop.shop_key}.${logo.ext}`;
    writeFileSync(path.join(PUBLIC_DIR, file), logo.buf);
    const publicPath = `/shop-logos/${file}`;
    await pool.query(`UPDATE shops SET logo_url=$1, updated_at=now() WHERE id=$2`, [publicPath, shop.id]);
    console.log(`  ✓ ${shop.shop_key.padEnd(24)} ${(logo.buf.length/1024).toFixed(0).padStart(4)}KB  ${logo.ext}  ${logo.from.slice(0, 70)}`);
    ok++;
  }

  console.log(`\nDONE. downloaded=${ok} failed=${fail} skipped=${skip} (of ${shops.length})`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
