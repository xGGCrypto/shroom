



/**
 * Finds the closest valid direction for a furniture item, given a desired direction and a list of valid directions.
 * If the exact direction is not found, returns the closest lower valid direction, or the first valid direction as fallback.
 *
 * @param direction The desired direction (e.g., 0, 90, 180, 270).
 * @param validDirections The list of valid directions for the furniture (must be sorted ascending).
 * @returns The closest valid direction.
 * @category Furniture
 */
export function getDirectionForFurniture(
  direction: number,
  validDirections: number[]
): number {
  if (validDirections.length < 1) {
    throw new Error("No valid directions provided for furniture.");
  }

  let fallbackDirection = validDirections[0];
  for (let i = 0; i < validDirections.length; i++) {
    const validDirection = validDirections[i];
    if (validDirection === direction) return direction;

    if (validDirection > direction) {
      return fallbackDirection;
    }

    fallbackDirection = validDirection;
  }

  return fallbackDirection;
}
