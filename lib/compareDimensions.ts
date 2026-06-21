// Shared spec→dimension mapping + scoring for the versus-style comparison.
// Scraped specs are arbitrary French key/value pairs, so we bucket each spec
// key into a high-level dimension by keyword, then score a product per
// dimension by how rich/strong its specs are relative to the other product.

export type SpecMap = Record<string, string>;

export const DIMENSIONS = [
  "Performance",
  "Écran",
  "Caméra",
  "Batterie",
  "Connectivité",
  "Design",
] as const;
export type Dimension = (typeof DIMENSIONS)[number];

// French keyword → dimension. Matched as substrings against lowercased spec keys.
const DIM_KEYWORDS: Record<Dimension, string[]> = {
  Performance: ["processeur", "cpu", "ram", "mémoire", "memoire", "ghz", "coeur", "cœur", "puce", "chipset", "gpu", "graphique", "stockage", "ssd", "disque", "rom", "performance"],
  "Écran": ["écran", "ecran", "affichage", "résolution", "resolution", "pouce", "display", "dalle", "taux de rafraîchissement", "rafraichissement", "hz", "amoled", "oled", "lcd", "luminosité", "nits"],
  "Caméra": ["caméra", "camera", "photo", "appareil photo", "mégapixel", "megapixel", "mp", "capteur", "objectif", "selfie", "flash", "zoom", "vidéo", "video"],
  Batterie: ["batterie", "battery", "mah", "autonomie", "charge", "recharge", "wattheure", "watt"],
  "Connectivité": ["bluetooth", "wifi", "wi-fi", "réseau", "reseau", "5g", "4g", "lte", "nfc", "usb", "port", "hdmi", "jack", "sim", "gps", "type-c", "type c", "connectique", "connecteur"],
  Design: ["poids", "épaisseur", "epaisseur", "dimension", "dimensions", "couleur", "matériau", "materiau", "matière", "étanche", "etanche", "ip68", "ip67", "design", "format", "bracelet"],
};

export function dimensionOf(key: string): Dimension | null {
  const k = key.toLowerCase();
  for (const dim of DIMENSIONS) {
    if (DIM_KEYWORDS[dim].some((w) => k.includes(w))) return dim;
  }
  return null;
}

// Count how many specs each product has in each dimension.
function dimCounts(specs: SpecMap): Record<Dimension, number> {
  const counts = Object.fromEntries(DIMENSIONS.map((d) => [d, 0])) as Record<Dimension, number>;
  for (const key of Object.keys(specs)) {
    const dim = dimensionOf(key);
    if (dim) counts[dim] += 1;
  }
  return counts;
}

export type RadarPoint = { dimension: Dimension; a: number; b: number };

// Produce 0–100 radar scores per dimension for A vs B. A dimension's score
// reflects how many comparable specs that product lists for it, scaled against
// the better of the two so the chart always uses the full range.
export function radarScores(specsA: SpecMap, specsB: SpecMap): RadarPoint[] {
  const ca = dimCounts(specsA);
  const cb = dimCounts(specsB);
  return DIMENSIONS.map((dim) => {
    const a = ca[dim];
    const b = cb[dim];
    const max = Math.max(a, b);
    if (max === 0) return { dimension: dim, a: 0, b: 0 };
    // base 35 so a present-but-thin dimension still shows on the chart
    return {
      dimension: dim,
      a: Math.round((a / max) * 65) + (a > 0 ? 35 : 0),
      b: Math.round((b / max) * 65) + (b > 0 ? 35 : 0),
    };
  });
}

// Total "points" per side (versus.com style) = sum of radar scores.
export function totalPoints(radar: RadarPoint[]): { a: number; b: number } {
  const a = radar.reduce((s, r) => s + r.a, 0);
  const b = radar.reduce((s, r) => s + r.b, 0);
  const max = Math.max(a, b, 1);
  // normalize to a friendly 0–100 scale
  return { a: Math.round((a / max) * 100), b: Math.round((b / max) * 100) };
}
