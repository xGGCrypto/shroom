import { getPosition } from "./getPosition";
import { ParsedTileType } from "../../../util/parseTileMap";

/**
 * Computes the bounding box for a tilemap in screen coordinates.
 * Defensive: throws if no valid tile is found.
 *
 * @param tilemap The parsed tilemap (2D array of ParsedTileType).
 * @param wallOffsets The wall offset values (x, y).
 * @returns The bounding box with minX, minY, maxX, maxY.
 * @throws Error if no valid tile is found.
 */
export function getTileMapBounds(
  tilemap: ParsedTileType[][],
  wallOffsets: { x: number; y: number }
): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX: number | undefined;
  let minY: number | undefined;
  let maxX: number | undefined;
  let maxY: number | undefined;

  tilemap.forEach((row, y) => {
    row.forEach((column, x) => {
      if (column.type !== "tile") return;
      const position = getPosition(x, y, column.z, wallOffsets);
      const localMaxX = position.x + 64;
      const localMaxY = position.y + 32;

      if (minX == null || position.x < minX) {
        minX = position.x;
      }
      if (minY == null || position.y < minY) {
        minY = position.y;
      }
      if (maxX == null || localMaxX > maxX) {
        maxX = localMaxX;
      }
      if (maxY == null || localMaxY > maxY) {
        maxY = localMaxY;
      }
    });
  });

  if (minX == null || minY == null || maxX == null || maxY == null) {
    throw new Error("Could not determine tilemap bounds: no valid tile found.");
  }

  return {
    minX,
    minY: minY - 32,
    maxX,
    maxY: maxY - 32,
  };
}
