/**
 * Casts a partial object to a full type (for testing/mocking only).
 * @param value The partial value.
 * @returns The value cast as T.
 */
export function mock<T>(value: Partial<T>): T {
  return value as T;
}
