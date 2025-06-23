/**
 * Type guard to check if a value is not null or undefined.
 * @param value The value to check.
 * @returns True if value is not null/undefined.
 */
export function notNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value != null;
}
