export const SPEC_LABELS: Record<string, string> = {
  brand: "Marque",
  color: "Couleur",
  connectors: "Connecteurs",
  dimensions: "Dimensions",
  frequency: "Fréquence",
  graphics_card: "Carte graphique",
  graphics_reference: "Réf. graphique",
  is_gaming: "Gaming",
  keyboard: "Clavier",
  memory: "Mémoire",
  memory_type: "Type mémoire",
  model: "Modèle",
  operating_system: "Système d'exploitation",
  processor: "Processeur",
  processor_cache: "Cache processeur",
  processor_frequency: "Fréq. processeur",
  processor_generation: "Génération",
  processor_model: "Modèle processeur",
  ram: "Mémoire RAM",
  screen_size: "Taille écran",
  screen_resolution: "Résolution",
  screen_type: "Type d'écran",
  storage: "Stockage",
  storage_type: "Type stockage",
  weight: "Poids",
  warranty: "Garantie",
  wifi: "Wi‑Fi",
  bluetooth: "Bluetooth",
  battery: "Batterie",
  camera: "Caméra",
  refresh_rate: "Fréquence de rafraîchissement",
};

export const HIDDEN_SPEC_KEYS = new Set([
  "brand",
  "data_quality_score",
  "shop_count",
  "gtin",
  "sku",
  "reference",
  "normalized_sku",
  "ean",
  "barcode",
]);

export function formatSpecLabel(key: string): string {
  if (SPEC_LABELS[key]) return SPEC_LABELS[key];
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
