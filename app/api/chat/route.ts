import { NextRequest, NextResponse } from "next/server";

type Message = { role: "user" | "assistant" | "system"; content: string };

// ── Tool definitions sent to the LLM ──────────────────────────────────────────
const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Recherche des produits par nom, marque ou mot-clé dans tous les catalogues (supermarché, para, retail/électronique). Utilise cet outil pour toute question sur un produit spécifique, son prix ou sa disponibilité.",
      parameters: {
        type: "object",
        properties: {
          q: { type: "string", description: "Mot-clé de recherche (nom produit, marque…)" },
        },
        required: ["q"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_supermarket_basket",
      description:
        "Compare les prix du panier alimentaire entre les grandes enseignes tunisiennes (Carrefour, Géant, Monoprix, Aziza, MG…). Utilise cet outil pour les questions sur où faire ses courses le moins cher, comparer les supermarchés, ou connaître les prix des produits alimentaires courants.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_market_index",
      description:
        "Retourne l'indice du marché tunisien des prix (tendance générale, économies, nombre de promos actives, nombre de produits suivis). Utilise pour les questions sur les tendances du marché, l'inflation, les statistiques globales.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_top_offers",
      description:
        "Retourne les meilleures offres du moment (smartphones, laptops gaming) avec les prix min/max par enseigne. Utilise pour les questions sur les bons plans, les promotions tech, les meilleurs prix électronique.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_fake_promos",
      description:
        "Détecte les fausses promotions : produits dont le 'prix barré' est gonflé artificiellement. Utilise pour les questions sur les arnaques, fausses promos, prix manipulés.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_latest_price_changes",
      description:
        "Retourne les dernières baisses et hausses de prix par catalogue. Utilise pour les questions sur les récentes variations de prix, les nouveautés tarifaires.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "compute_basket",
      description:
        "Calcule le coût d'un panier de courses dans chaque supermarché et trouve l'option la moins chère. Utilise quand l'utilisateur donne une liste de produits à acheter.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "Liste de produits à rechercher pour le panier",
            items: { type: "string" },
          },
        },
        required: ["items"],
      },
    },
  },
];

// ── Model fallback chain (lightest last resort = gemma2-9b) ───────────────────
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",   // best quality
  "llama-3.1-8b-instant",      // fast, low token usage
  "gemma2-9b-it",              // last resort
];

async function groqChat(
  apiKey: string,
  body: Record<string, unknown>,
  models = GROQ_MODELS
): Promise<Response> {
  for (const model of models) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ ...body, model }),
    });
    if (res.ok) return res;
    const err = await res.json().catch(() => ({}));
    const msg: string = err?.error?.message ?? "";
    // Only retry on rate-limit errors, not on auth/bad-request errors
    if (res.status !== 429 && !msg.includes("rate_limit") && !msg.includes("Rate limit")) {
      return res; // non-rate-limit error → return as-is
    }
    console.warn(`[Groq] Rate limit on ${model}, trying next model…`);
  }
  // All models exhausted — return last error
  return new Response(JSON.stringify({ error: { message: "Tous les modèles sont en limite de tokens. Réessayez dans quelques minutes." } }), { status: 429 });
}

// ── Tool execution ─────────────────────────────────────────────────────────────
// Base URL is derived per-request from the inbound request origin, so the same
// code works in dev (localhost:3000), VPS prod (production.1111.tn), and Netlify.
async function callTool(BASE_URL: string, name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "search_products": {
        const q = encodeURIComponent(String(args.q ?? ""));
        const res = await fetch(`${BASE_URL}/api/search?q=${q}&limit=50`);
        const data = await res.json();
        if (!data?.items || !Array.isArray(data.items) || data.items.length === 0) {
          return "Aucun produit trouvé pour cette recherche.";
        }

        type RawProduct = { name: string; price: number; oldPrice: number; store: string };

        // Normalize name to group same product across stores
        const normalize = (name: string) =>
          name.toLowerCase().replace(/\s+/g, " ").replace(/[''"`]/g, "").trim();

        // Group by normalized name
        const groups = new Map<string, { displayName: string; offers: { store: string; price: number; oldPrice: number }[] }>();
        for (const p of data.items as RawProduct[]) {
          const key = normalize(p.name);
          if (!groups.has(key)) groups.set(key, { displayName: p.name, offers: [] });
          const g = groups.get(key)!;
          // avoid duplicate store entries
          if (!g.offers.find((o) => o.store === p.store)) {
            g.offers.push({ store: p.store, price: p.price, oldPrice: p.oldPrice });
          }
        }

        // Extract distinct brands: first word only, skip generic/descriptor words
        const genericWords = new Set([
          "CHARGEUR", "ADAPTATEUR", "CABLE", "HOUSSE", "COQUE", "BATTERIE",
          "ANNEAU", "SUPPORT", "ECRAN", "PROTECTION", "ACCESSOIRE", "KIT",
          "ROUGE", "CREME", "GEL", "SERUM", "LOTION", "SPRAY", "HUILE",
          "BABY", "PACK", "SET", "BOX", "MINI",
        ]);
        const brands = new Set<string>();
        for (const p of data.items as RawProduct[]) {
          const firstWord = p.name.trim().split(/\s+/)[0].toUpperCase();
          if (firstWord.length >= 2 && !genericWords.has(firstWord)) {
            brands.add(firstWord.charAt(0) + firstWord.slice(1).toLowerCase());
          }
        }

        // If too many distinct brands, signal that clarification is needed
        if (brands.size >= 3 && groups.size >= 5) {
          const brandList = [...brands].slice(0, 8).join(", ");
          return `NEEDS_CLARIFICATION\nBrands: ${brandList}${brands.size > 8 ? ` (+${brands.size - 8})` : ""}`;
        }

        // Sort groups by min price, take top 6
        const sorted = [...groups.values()]
          .sort((a, b) => Math.min(...a.offers.map((o) => o.price)) - Math.min(...b.offers.map((o) => o.price)))
          .slice(0, 6);

        const blocks = sorted.map((g) => {
          // Sort offers cheapest first
          const offersSorted = [...g.offers].sort((a, b) => a.price - b.price).slice(0, 3);
          const cheapest = offersSorted[0];
          const offerLines = offersSorted.map((o, i) => {
            const promo = o.oldPrice > o.price
              ? ` (promo -${Math.round((1 - o.price / o.oldPrice) * 100)}%)`
              : "";
            const tag = i === 0 ? " ✅ moins cher" : i === offersSorted.length - 1 && offersSorted.length > 1 ? " ❌ plus cher" : "";
            return `   ${i + 1}. ${o.store} → ${o.price.toFixed(3)} DT${promo}${tag}`;
          });
          const saving = offersSorted.length > 1
            ? `\n   💡 Économie : ${(offersSorted[offersSorted.length - 1].price - cheapest.price).toFixed(3)} DT en choisissant ${cheapest.store}`
            : "";
          return `📦 ${g.displayName}\n${offerLines.join("\n")}${saving}`;
        });

        return `Résultats pour "${args.q}" — ${sorted.length} produit(s), classés du moins cher au plus cher par boutique :\n\n${blocks.join("\n\n")}`;
      }

      case "get_supermarket_basket": {
        const res = await fetch(`${BASE_URL}/api/stats/grande-distrib`);
        const data = await res.json();
        if (data.error) return "Données panier indisponibles.";
        const ens = data.enseignes
          ?.map((e: { name: string; price: string; diff: string; best: boolean }) =>
            `• ${e.name} : ${e.price} DT${e.best ? " ✓ Moins cher" : ` (${e.diff})`}`
          )
          .join("\n") ?? "";
        const veille = data.veille
          ?.map((v: { name: string; price: string; change: string; down: boolean }) =>
            `• ${v.name} : ${v.price} DT (${v.down ? "↘" : "↗"} ${v.change})`
          )
          .join("\n") ?? "";
        return `Comparaison panier de ${data.basketSize} produits :\n${ens}\n\nÉconomie possible : ${data.economy} DT\n\nProduits sous surveillance :\n${veille}`;
      }

      case "get_market_index": {
        const res = await fetch(`${BASE_URL}/api/market-index`);
        const data = await res.json();
        if (data.error) return "Indice marché indisponible.";
        const s = data.stats ?? {};
        return `Indice marché 1111.tn : ${data.index ?? "—"}\n• ${s.totalProducts?.toLocaleString("fr-FR") ?? "—"} produits suivis\n• ${s.totalPromos ?? "—"} promotions actives\n• ${s.totalSavingsDT?.toLocaleString("fr-FR") ?? "—"} DT d'économies détectées\n• Remise moyenne : ${s.avgDiscountPct ?? "—"}%`;
      }

      case "get_top_offers": {
        const res = await fetch(`${BASE_URL}/api/stats/top-offers`);
        const data = await res.json();
        const list = Array.isArray(data.offers) ? data.offers : Array.isArray(data.items) ? data.items : [];
        if (data.error || list.length === 0) return "Aucune offre disponible.";
        const lines = list.slice(0, 5).map((o: { name: string; brand: string; minPrice: number | string; savings: number | string; offers: Array<{ shop: string; price: number }> }) => {
          const cheapestShop = o.offers?.[0];
          return `• ${o.name} (${o.brand}) — à partir de ${o.minPrice ?? "—"} DT chez ${cheapestShop?.shop ?? "—"} (économie : ${o.savings ?? "—"} DT)`;
        });
        return `Meilleures offres du moment :\n${lines.join("\n")}`;
      }

      case "get_fake_promos": {
        const res = await fetch(`${BASE_URL}/api/stats/illogical-promo`);
        const data = await res.json();
        // Endpoint may return either { item } (singular, current) or { items } (array)
        const list: Array<{ name: string; shopName?: string; shop?: string; currentPrice: number; oldPrice?: number; honestMin?: number }> =
          data.items ?? (data.item ? [data.item] : []);
        if (data.error || list.length === 0) return "Aucune fausse promo détectée actuellement.";
        const lines = list.slice(0, 5).map((p) => {
          const shopName = p.shopName ?? p.shop ?? "?";
          const claimed = p.oldPrice && p.currentPrice ? Math.round(((p.oldPrice - p.currentPrice) / p.oldPrice) * 100) : null;
          const honest = p.honestMin && p.currentPrice ? Math.round(((p.honestMin - p.currentPrice) / p.honestMin) * 100) : null;
          return `• ${p.name} chez ${shopName} — affichée${claimed != null ? ` à -${claimed}%` : ""}${honest != null ? ` mais réelle : -${honest}%` : ""} (prix : ${p.currentPrice?.toFixed?.(3) ?? p.currentPrice} DT)`;
        });
        return `Fausses promotions détectées :\n${lines.join("\n")}`;
      }

      case "get_latest_price_changes": {
        const res = await fetch(`${BASE_URL}/api/stats/latest-price-change`);
        const data = await res.json();
        if (data.error || !data.items?.length) return "Aucune variation récente disponible.";
        const lines = data.items.map((p: { name: string; shopName: string; oldPrice: number; newPrice: number; catalog: string }) => {
          const diff = p.newPrice - p.oldPrice;
          const pct = Math.abs(Math.round((diff / p.oldPrice) * 100));
          return `• ${p.name} chez ${p.shopName} [${p.catalog}] : ${p.oldPrice?.toFixed(3)} → ${p.newPrice?.toFixed(3)} DT (${diff < 0 ? "↘" : "↗"} ${pct}%)`;
        });
        return `Dernières variations de prix :\n${lines.join("\n")}`;
      }

      case "compute_basket": {
        const items = (args.items as string[]) ?? [];
        const resolved: Array<{ id: string; name: string; qty: number }> = [];
        for (const item of items.slice(0, 8)) {
          const res = await fetch(`${BASE_URL}/api/couffin/search?q=${encodeURIComponent(item)}&limit=1`);
          const data = await res.json();
          if (data.items?.[0]) {
            resolved.push({ id: String(data.items[0].id), name: data.items[0].name, qty: 1 });
          }
        }
        if (!resolved.length) return "Aucun produit trouvé pour ce panier.";

        const computeRes = await fetch(`${BASE_URL}/api/couffin/compute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: resolved.map((r) => ({ id: r.id, qty: r.qty })) }),
        });
        const computeData = await computeRes.json();
        if (computeData.error) return "Erreur calcul panier.";

        const foundNames = resolved.map((r) => r.name).join(", ");
        const shopLines = computeData.shops
          ?.slice(0, 4)
          .map((s: { shop: string; total: number; coverage: number }) =>
            `• ${s.shop} : ${s.total?.toFixed(3)} DT (${s.coverage} produit${s.coverage > 1 ? "s" : ""} trouvé${s.coverage > 1 ? "s" : ""})`
          )
          .join("\n") ?? "";

        return `Panier calculé pour : ${foundNames}\n\nCoût par enseigne :\n${shopLines}`;
      }

      default:
        return "Outil inconnu.";
    }
  } catch (err) {
    console.error(`Tool ${name} error:`, err);
    return `Erreur lors de l'exécution de l'outil ${name}.`;
  }
}

// ── System prompt ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es l'assistant de 1111.tn, le comparateur de prix en Tunisie.
Ton rôle est d'aider les utilisateurs à trouver les meilleurs prix.

Directives :
1. Utilise l'outil 'search_products' UNIQUEMENT si le message contient un nom de produit précis (ex: "iPhone", "lait", "rouge à lèvres Artdeco"). N'utilise JAMAIS cet outil pour des salutations ("hello", "bonjour", "salut"), des remerciements, des questions générales ou des messages sans nom de produit.
2. Quand tu as demandé à l'utilisateur de choisir une marque et qu'il répond avec un nom de marque uniquement, tu DOIS combiner cette marque avec le produit demandé initialement dans la conversation. Par exemple si l'utilisateur a cherché "ecran solaire" puis choisit "Zynia", appelle search_products avec q="ecran solaire Zynia". Ne cherche JAMAIS une marque seule sans le produit original.
3. Réponds toujours en français (ou en arabe si besoin).
4. Affiche les prix en Dinars Tunisiens (DT).
5. Ne suppose jamais un prix si tu ne le trouves pas via les outils.`;

// ── Keyword extractor (fallback when LLM tool call fails) ─────────────────────
function extractSearchQuery(text: string): string {
  const stopWords = /\b(je|veux|connaitre|savoir|trouver|cherche|le|la|les|du|de|des|un|une|prix|cout|coût|combien|où|ou|est|sont|disponible|moins|cher|pas|cher|pour|avec|sans|avoir|voir)\b/gi;
  return text.replace(stopWords, " ").replace(/\s+/g, " ").trim() || text.trim();
}

// ── Detect if the assistant previously asked for a brand choice ────────────────
function findOriginalProductQuery(messages: Message[]): string | null {
  // Look for the last assistant message that listed brands (clarification step)
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "assistant") {
      // Assistant asked to choose a brand — find the user message before that
      const brandsKeywords = ["marque", "Quelle marque", "préférez-vous"];
      if (brandsKeywords.some((kw) => msg.content.includes(kw))) {
        // Find the original user query before this assistant message
        for (let j = i - 1; j >= 0; j--) {
          if (messages[j].role === "user") {
            return messages[j].content.trim();
          }
        }
      }
    }
  }
  return null;
}

// ── Main handler ───────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages requis" }, { status: 400 });
    }

    // Resolve the base URL for tool calls so we hit *this* Next.js instance's
    // /api/* endpoints regardless of which host/port it's running on.
    const BASE_URL =
      process.env.NEXT_PUBLIC_BASE_URL ||
      request.nextUrl.origin ||
      "http://localhost:3000";

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Clé API manquante" }, { status: 500 });
    }

    // Detect if user is replying with a brand name after a clarification step
    const originalProduct = findOriginalProductQuery(messages);
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    let augmentedMessages = messages;
    if (originalProduct && lastUserMsg) {
      const chosenBrand = lastUserMsg.content.trim();
      // If the original product doesn't already include the chosen brand text, inject context
      if (!originalProduct.toLowerCase().includes(chosenBrand.toLowerCase())) {
        // Replace the last user message with the combined query so the LLM searches correctly
        augmentedMessages = messages.map((m, idx) =>
          idx === messages.length - 1 && m.role === "user"
            ? { ...m, content: `${originalProduct} ${chosenBrand}` }
            : m
        );
      }
    }

    const groqMessages: Message[] = [{ role: "system", content: SYSTEM_PROMPT }, ...augmentedMessages];

    // Let the LLM decide which tool to use (auto is more reliable on some Groq models)
    const toolChoice = "auto";

    // ── Step 1: First LLM call — may request tool use ─────────────────────────
    const firstRes = await groqChat(apiKey, {
      messages: groqMessages,
      tools: TOOLS,
      tool_choice: toolChoice,
      max_tokens: 1024,
      temperature: 0,
    });

    if (!firstRes.ok) {
      const err = await firstRes.json().catch(() => ({}));
      console.error("Groq API error (Step 1):", JSON.stringify(err, null, 2));
      // Fallback: extract keyword from last user message and search directly
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        const q = extractSearchQuery(lastUserMsg.content);
        const result = await callTool(BASE_URL, "search_products", { q });
        const clean = result.replace(/^NEEDS_CLARIFICATION\n/, "").trim();
        return NextResponse.json({ reply: clean });
      }
      return NextResponse.json({
        error: "Erreur API Groq",
        details: err.error?.message || "Erreur inconnue"
      }, { status: 502 });
    }

    const firstData = await firstRes.json();
    const firstChoice = firstData.choices?.[0];

    // If finish_reason is "tool_calls" but content signals a failed generation, fallback
    if (firstChoice?.finish_reason === "tool_calls" && firstChoice?.message?.tool_calls?.length) {
      try {
        JSON.parse(firstChoice.message.tool_calls[0].function.arguments ?? "{}");
      } catch {
        const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
        if (lastUserMsg) {
          const q = extractSearchQuery(lastUserMsg.content);
          const result = await callTool(BASE_URL, "search_products", { q });
          const clean = result.replace(/^NEEDS_CLARIFICATION\n/, "").trim();
          return NextResponse.json({ reply: clean });
        }
      }
    }

    // ── Step 2: If no tool calls ──────────────────────────────────────────────
    if (!firstChoice?.message?.tool_calls?.length) {
      // If the LLM ignored a product query (fallback model misbehavior), search directly
      const lastUserMsg = [...augmentedMessages].reverse().find((m) => m.role === "user");
      const greetings = /^(bonjour|salut|hello|bonsoir|merci|ok|oui|non|salam|هلا|شكرا)$/i;
      if (lastUserMsg && !greetings.test(lastUserMsg.content.trim())) {
        const q = extractSearchQuery(lastUserMsg.content);
        if (q.length >= 2) {
          const result = await callTool(BASE_URL, "search_products", { q });
          const clean = result.replace(/^NEEDS_CLARIFICATION\n/, "").trim();
          return NextResponse.json({ reply: clean });
        }
      }
      return NextResponse.json({ reply: firstChoice?.message?.content ?? "" });
    }

    // ── Step 3: Execute all tool calls in parallel ────────────────────────────
    const toolCalls = firstChoice.message.tool_calls as Array<{
      id: string;
      function: { name: string; arguments: string };
    }>;

    const toolResults = await Promise.all(
      toolCalls.map(async (tc) => {
        const args = JSON.parse(tc.function.arguments ?? "{}");
        const result = await callTool(BASE_URL, tc.function.name, args);
        return { tool_call_id: tc.id, role: "tool" as const, content: result, name: tc.function.name };
      })
    );

    // ── Step 4: Return results or ask clarification ───────────────────────────
    const searchResult = toolResults.find((r) => r.name === "search_products");
    const needsClarification = searchResult?.content.startsWith("NEEDS_CLARIFICATION");

    // If search returned direct results → return them as-is, no second LLM call needed
    if (searchResult && !needsClarification) {
      return NextResponse.json({ reply: searchResult.content });
    }

    // Non-search tools (basket, market index, etc.) → also return directly
    if (!needsClarification && toolResults.length > 0) {
      return NextResponse.json({ reply: toolResults.map((r) => r.content).join("\n\n") });
    }

    // Needs clarification → second LLM call only to format the brand question
    if (needsClarification && searchResult) {
      const brandsLine = searchResult.content.split("\n")[1] ?? "";
      const brandList = brandsLine.replace("Brands:", "").trim();
      const clarificationSystem = `${SYSTEM_PROMPT}\n\nPlusieurs marques sont disponibles : ${brandList}. Pose UNE question courte en français : "Quelle marque préférez-vous ?" puis liste ces marques en choix numérotés. N'affiche AUCUN prix, AUCUN bloc produit, AUCUN texte technique comme "NEEDS_CLARIFICATION" ou "Brands:".`;

      const secondRes = await groqChat(apiKey, {
        messages: [
          { role: "system", content: clarificationSystem },
          ...augmentedMessages,
          firstChoice.message,
          ...toolResults,
        ],
        max_tokens: 512,
        temperature: 0.2,
      });

      if (!secondRes.ok) {
        // Fallback: format brand list manually without LLM
        const brands = brandList.split(",").map((b, i) => `${i + 1}. ${b.trim()}`).join("\n");
        return NextResponse.json({ reply: `Quelle marque préférez-vous ?\n${brands}` });
      }

      const secondData = await secondRes.json();
      return NextResponse.json({ reply: secondData.choices?.[0]?.message?.content ?? "" });
    }

    return NextResponse.json({ reply: "" });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
