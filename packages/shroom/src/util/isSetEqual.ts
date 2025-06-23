/**
 * Checks if two sets are equal (contain the same elements).
 * @param as First set.
 * @param bs Second set.
 * @returns True if sets are equal, false otherwise.
 */
export function isSetEqual<T>(as: Set<T>, bs: Set<T>): boolean {
  if (as.size !== bs.size) return false;
  for (const a of as) {
    if (!bs.has(a)) return false;
  }
  return true;
}
