/**
 * Client-side fuzzy match of Nominatim hint strings to Payload geo list names.
 */

import type { GeoLocalityListItem, GeoSubdivisionListItem } from "@/lib/types/geography";

const diacriticRegex = /\p{M}/gu;

export function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(diacriticRegex, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function bestMatchId(
  hint: string,
  candidates: { id: string; name: string }[],
): string | null {
  const h = normalizeName(hint);
  if (!h || candidates.length === 0) return null;

  for (const c of candidates) {
    if (normalizeName(c.name) === h) return c.id;
  }

  for (const c of candidates) {
    const n = normalizeName(c.name);
    if (n && (h.includes(n) || n.includes(h))) return c.id;
  }

  const words = h.split(/\s+/).filter((w) => w.length > 2);
  for (const c of candidates) {
    const n = normalizeName(c.name);
    if (!n) continue;
    if (words.some((w) => n.includes(w) || w.includes(n))) return c.id;
  }

  return null;
}

type GeocodeAliasRow = { id: string; name: string; geocodeMatchAliases?: string[] };

function expandGeocodeAliasRows(rows: GeocodeAliasRow[]): { id: string; name: string }[] {
  const out: { id: string; name: string }[] = [];
  for (const row of rows) {
    out.push({ id: row.id, name: row.name });
    for (const a of row.geocodeMatchAliases ?? []) {
      const t = a.trim();
      if (t) out.push({ id: row.id, name: t });
    }
  }
  return out;
}

/** One row per display name and per geocode match alias, same locality id. */
export function expandLocalityMatchTargets(
  locs: GeoLocalityListItem[],
): { id: string; name: string }[] {
  return expandGeocodeAliasRows(locs);
}

/** One row per display name and per geocode match alias, same subdivision id. */
export function expandSubdivisionMatchTargets(
  subs: GeoSubdivisionListItem[],
): { id: string; name: string }[] {
  return expandGeocodeAliasRows(subs);
}

/**
 * Tries Nominatim-derived names in order (e.g. city, then suburb) until one
 * matches a CMS locality — improves locality matching when OSM splits labels.
 */
export function firstMatchingId(
  hints: string[],
  candidates: { id: string; name: string }[],
): string | null {
  for (const h of hints) {
    if (h.trim() === "") continue;
    const id = bestMatchId(h, candidates);
    if (id) return id;
  }
  return null;
}
