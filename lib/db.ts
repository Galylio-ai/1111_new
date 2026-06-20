import { Pool } from "pg";

declare global {
  var __dbPools: { aliment?: Pool; para?: Pool; retail?: Pool } | undefined;
}

const pools = globalThis.__dbPools ?? (globalThis.__dbPools = {});

export function alimentPool(): Pool {
  if (!pools.aliment) {
    pools.aliment = new Pool({ connectionString: process.env.ALIMENTATION_DB_URL, max: 3 });
  }
  return pools.aliment;
}

export function paraPool(): Pool {
  if (!pools.para) {
    pools.para = new Pool({ connectionString: process.env.PARA_DB_URL, max: 3 });
  }
  return pools.para;
}

export function retailPool(): Pool {
  if (!pools.retail) {
    pools.retail = new Pool({ connectionString: process.env.RETAIL_DB_URL, max: 3 });
  }
  return pools.retail;
}

export const CATALOGS = [
  { key: "super",  label: "Supermarché",   path: "/supermarche",   getPool: alimentPool },
  { key: "para",   label: "Parapharmacie", path: "/parapharmacie", getPool: paraPool },
  { key: "retail", label: "Magasins",      path: "/retail",        getPool: retailPool },
] as const;

export type CatalogKey = typeof CATALOGS[number]["key"];
