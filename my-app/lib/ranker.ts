import type { Internship } from './types';

const MAX_RESULTS = 1000;

// Deduplicate by appUrl (keep first seen, O(n)), then score and sort descending.
// Scoring formula: recency (0.6) + prestige (0.4) with link health & expiration multipliers
export function rankInternships(internships: Internship[], _userLocation = ''): Internship[] {
  // 1. Dedup by appUrl. Rows without an appUrl keep their fallback id.
  const seen = new Set<string>();
  const unique: Internship[] = [];
  for (const i of internships) {
    const key = i.appUrl || i.id;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(i);
  }

  // 2. Recency normalization range (over known dates only).
  let min = Infinity;
  let max = -Infinity;
  for (const i of unique) {
    if (i.dateMs > 0) {
      if (i.dateMs < min) min = i.dateMs;
      if (i.dateMs > max) max = i.dateMs;
    }
  }
  const span = max - min;

  const scoreOf = (i: Internship): number => {
    // Base score: recency (0.6) + prestige (0.4)
    const recency =
      i.dateMs > 0 && span > 0 ? (i.dateMs - min) / span : i.dateMs > 0 ? 1 : 0;
    const prestige = i.prestigeScore; // 0 | 0.5 | 1.0
    let baseScore = recency * 0.6 + prestige * 0.4;

    // Apply link health multiplier: 1.0 if healthy, 0.8 if invalid
    const linkHealthMult =
      i.linkHealth && (i.linkHealth === 'not-found' || i.linkHealth === 'server-error' || i.linkHealth === 'timeout')
        ? 0.8
        : 1.0;
    baseScore *= linkHealthMult;

    // Apply expiration penalty: 0.1x if expired
    if (i.isExpired) {
      baseScore *= 0.1;
    }

    return baseScore;
  };

  // 3. Sort descending by score.
  return unique
    .map((i) => ({ i, s: scoreOf(i) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, MAX_RESULTS)
    .map((x) => x.i);
}
