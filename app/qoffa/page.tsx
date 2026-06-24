import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { QoffaSection } from "@/components/QoffaSection";
import { alimentPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Qoffa Tounsi — 1111.tn" };

type BasketItem = {
  key: string;
  label: string;
  qtyLabel: string;
  productName: string;
  slug: string | null;
  shops: string;
  totalPrice: number;
};

const basketRefs = [
  { key: "semoule", label: "Semoule fine", qtyLabel: "5 kg", components: [{ productId: 2141, qty: 1 }] },
  { key: "huile", label: "Huile végétale", qtyLabel: "1 bidon", components: [{ productId: 26062, qty: 1 }] },
  { key: "boeuf", label: "Viande de boeuf", qtyLabel: "2 kg", components: [{ productId: 7142, qty: 2 }] },
  {
    key: "legumes",
    label: "Légumes frais",
    qtyLabel: "mix",
    components: [
      { productId: 10817, qty: 1 },
      { productId: 3191, qty: 1 },
    ],
  },
  { key: "lait", label: "Lait demi-écrémé", qtyLabel: "6 L", components: [{ productId: 4313, qty: 6 }] },
  { key: "oeufs", label: "Oeufs", qtyLabel: "1 plateau", components: [{ productId: 3101, qty: 1 }] },
  { key: "cafe", label: "Café moulu", qtyLabel: "2 paquets", components: [{ productId: 2773, qty: 2 }] },
  { key: "sucre", label: "Sucre poudre blanc", qtyLabel: "2 kg", components: [{ productId: 16642, qty: 2 }] },
] as const;

const fallbackBasket: BasketItem[] = [
  { key: "semoule", label: "Semoule fine", qtyLabel: "5 kg", productName: "Semoule fine 5Kg", slug: null, shops: "Carrefour", totalPrice: 3.7 },
  { key: "huile", label: "Huile végétale", qtyLabel: "1 bidon", productName: "Huile végétale", slug: null, shops: "Geant / Monoprix", totalPrice: 8.97 },
  { key: "boeuf", label: "Viande de boeuf", qtyLabel: "2 kg", productName: "Jarret de boeuf sans os", slug: null, shops: "Carrefour", totalPrice: 105 },
  { key: "legumes", label: "Légumes frais", qtyLabel: "mix", productName: "Tomate fraiche + Oignon rouge", slug: null, shops: "Aziza / Monoprix", totalPrice: 2.49 },
  { key: "lait", label: "Lait demi-écrémé", qtyLabel: "6 L", productName: "Lait demi-écrémé U.H.T", slug: null, shops: "Carrefour", totalPrice: 8.1 },
  { key: "oeufs", label: "Oeufs", qtyLabel: "1 plateau", productName: "Oeufs", slug: null, shops: "Aziza", totalPrice: 9.79 },
  { key: "cafe", label: "Café moulu", qtyLabel: "2 paquets", productName: "Café moulu", slug: null, shops: "Aziza", totalPrice: 9.78 },
  { key: "sucre", label: "Sucre poudre blanc", qtyLabel: "2 kg", productName: "Sucre poudre blanc vrac", slug: null, shops: "Carrefour", totalPrice: 2.8 },
];

function fmtPrice(n: number): string {
  return n.toFixed(3).replace(/\.?0+$/, "").replace(".", ",");
}

async function getBasketComposition(): Promise<{ items: BasketItem[]; isFallback: boolean }> {
  try {
    const components = basketRefs.flatMap((line, lineIndex) =>
      line.components.map((component, componentIndex) => ({
        lineKey: line.key,
        productId: component.productId,
        qty: component.qty,
        ord: lineIndex * 10 + componentIndex,
      }))
    );
    const valuesSql = components
      .map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}::bigint, $${i * 4 + 3}::numeric, $${i * 4 + 4})`)
      .join(", ");
    const params = components.flatMap((item) => [item.lineKey, item.productId, item.qty, item.ord]);

    const { rows } = await alimentPool().query<{
      line_key: string;
      product_id: string;
      qty: string;
      ord: number;
      product_name: string | null;
      slug: string | null;
      unit_price: string | null;
      shops: string | null;
    }>(
      `WITH requested(line_key, product_id, qty, ord) AS (
         VALUES ${valuesSql}
       ),
       best_prices AS (
         SELECT
           r.line_key,
           r.product_id,
           r.qty,
           r.ord,
           p.name AS product_name,
           p.slug,
           MIN(sp.current_price) AS unit_price
         FROM requested r
         LEFT JOIN products p ON p.id = r.product_id
         LEFT JOIN shop_prices sp ON sp.product_id = r.product_id AND sp.current_price > 0
         GROUP BY r.line_key, r.product_id, r.qty, r.ord, p.name, p.slug
       )
       SELECT
         bp.line_key,
         bp.product_id::text,
         bp.qty::text,
         bp.ord,
         bp.product_name,
         bp.slug,
         bp.unit_price::text,
         (
           SELECT string_agg(s.name, ' / ' ORDER BY s.name)
           FROM shop_prices sp
           JOIN shops s ON s.id = sp.shop_id
           WHERE sp.product_id = bp.product_id
             AND sp.current_price = bp.unit_price
         ) AS shops
       FROM best_prices bp
       ORDER BY bp.ord`,
      params
    );

    const items = basketRefs.map((line, i) => {
      const lineRows = rows.filter((row) => row.line_key === line.key);
      const productNames = lineRows
        .map((row, componentIndex) => row.product_name?.trim() || fallbackBasket[i]?.productName.split(" + ")[componentIndex])
        .filter(Boolean);
      const shops = [...new Set(lineRows.flatMap((row) => (row.shops ?? "").split(" / ").map((shop) => shop.trim()).filter(Boolean)))];
      const totalPrice = lineRows.reduce((sum, row) => {
        const qty = Number(row.qty) || 1;
        const unit = Number(row.unit_price) || 0;
        return sum + unit * qty;
      }, 0);

      return {
        key: line.key,
        label: line.label,
        qtyLabel: line.qtyLabel,
        productName: productNames.join(" + ") || fallbackBasket[i]?.productName || line.label,
        slug: lineRows.length === 1 ? lineRows[0]?.slug ?? null : null,
        shops: shops.join(" / ") || fallbackBasket[i]?.shops || "Non disponible",
        totalPrice: totalPrice || fallbackBasket[i]?.totalPrice || 0,
      };
    });

    return { items, isFallback: false };
  } catch {
    return { items: fallbackBasket, isFallback: true };
  }
}

export default async function QoffaPage() {
  const { items: panier, isFallback } = await getBasketComposition();
  const total = panier.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <PageShell
      icon="basket"
      title="Qoffa Tounsi"
      arabic="قفة التونسي"
      description="Le coût réel de la vie en Tunisie — suivez le prix du panier familial, les recettes populaires et le classement des enseignes."
      chips={[
        { label: "Coût du panier", value: `${fmtPrice(total)} DT`, tone: "gold" },
        { label: "Base", value: `${panier.length} produits`, tone: "emerald" },
      ]}
    >
      <QoffaSection />

      <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <div className="card card-pad">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="section-title">Composition du panier familial</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                  Prix minimum actuel par produit, calculé depuis les enseignes supermarché indexées.
                </p>
              </div>
              <span className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-gold">
                {panier.length} produits essentiels
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {panier.map((p) => {
                const content = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0 text-sm font-semibold text-slate-900 dark:text-white">
                        {p.label}
                      </span>
                      <span className="shrink-0 rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-white/5 dark:text-white/50">
                        {p.qtyLabel}
                      </span>
                    </div>
                    <div className="mt-1 line-clamp-1 text-[11px] text-slate-500 dark:text-white/45">
                      {p.productName}
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <span className="text-lg font-extrabold tabular-nums text-slate-900 dark:text-white">
                        {fmtPrice(p.totalPrice)} <span className="text-[10px] font-normal text-slate-400 dark:text-white/40">DT</span>
                      </span>
                      <span className="min-w-0 truncate text-right text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                        {p.shops}
                      </span>
                    </div>
                  </>
                );

                return p.slug ? (
                  <Link
                    key={p.key}
                    href={`/supermarche/${p.slug}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-brand-gold/40 hover:bg-white dark:border-white/5 dark:bg-bg-800 dark:hover:border-brand-gold/30 dark:hover:bg-bg-700"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={p.key} className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition dark:border-white/5 dark:bg-bg-800">
                    {content}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-white/65">
                {isFallback ? "Snapshot de secours production" : "Données live alimentation"}
              </span>
              <span className="text-sm font-black tabular-nums text-emerald-600 dark:text-emerald-300">
                Total panier: {fmtPrice(total)} DT
              </span>
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
