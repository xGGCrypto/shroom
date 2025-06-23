/**
 * Converts a string attribute to a number, or returns undefined if invalid.
 * @param value The string or null value.
 * @returns The number or undefined.
 */
export function getNumberFromAttribute(
  value: string | null
): number | undefined {
  if (value == null) return undefined;
  const numberValue = Number(value);
  if (isNaN(numberValue)) return undefined;
  return numberValue;
}
