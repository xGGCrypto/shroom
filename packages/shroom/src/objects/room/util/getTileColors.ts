
/**
 * Computes color tints for a tile based on a base color.
 * Defensive: expects a valid hex color string (e.g., '#RRGGBB').
 *
 * @param color The base color as a hex string.
 * @returns An object with tileTint, borderLeftTint, and borderRightTint as numbers.
 */
export function getTileColors(color: string) {
  const tileTint = fromHex(color);
  const borderLeftTint = fromHex(adjust(color, -20));
  const borderRightTint = fromHex(adjust(color, -40));
  return {
    tileTint,
    borderLeftTint,
    borderRightTint,
  };
}


/**
 * Computes color tints for a wall based on a base color.
 * Defensive: expects a valid hex color string (e.g., '#RRGGBB').
 *
 * @param color The base color as a hex string.
 * @returns An object with topTint, leftTint, and rightTint as numbers.
 */
export function getWallColors(color: string) {
  const leftTint = fromHex(color);
  const topTint = fromHex(adjust(color, -103));
  const rightTint = fromHex(adjust(color, -52));
  return {
    topTint,
    leftTint,
    rightTint,
  };
}


/**
 * Converts a hex color string to a number.
 * Defensive: returns 0 if input is invalid.
 *
 * @param color The color string (e.g., '#RRGGBB').
 * @returns The color as a number.
 */
function fromHex(color: string): number {
  if (typeof color !== 'string' || !/^#?[0-9a-fA-F]{6}$/.test(color)) return 0;
  return parseInt(color.replace("#", "0x"), 16);
}


/**
 * Adjusts a hex color string by a given amount.
 * Defensive: clamps values to [0, 255].
 *
 * @param color The color string (e.g., '#RRGGBB').
 * @param amount The amount to adjust each channel by.
 * @returns The adjusted color string.
 */
function adjust(color: string, amount: number): string {
  return (
    "#" +
    color
      .replace(/^#/, "")
      .replace(/../g, (color) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substr(-2)
      )
  );
}
