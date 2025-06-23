/**
 * Converts a hex string (with or without #) to a number.
 * @param str The hex string.
 * @returns The integer value.
 */
export function getIntFromHex(str: string): number {
  return parseInt(str.replace(/^#/, ""), 16);
}
