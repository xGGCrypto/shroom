/**
 * Type guard to check if a tile type is a valid tile (not 'x').
 * @param type The tile type.
 * @returns True if the type is a number (tile), false if 'x'.
 */
export const isTile = (type: number | "x"): type is number => !isNaN(Number(type));
