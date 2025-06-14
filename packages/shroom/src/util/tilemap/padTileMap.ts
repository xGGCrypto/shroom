import { TileType } from "../../types/TileType";

/**
 * Pads a tilemap with an extra row/column of 'x' tiles if needed for edge detection.
 * @param tilemap The 2D array of TileType.
 * @returns The padded tilemap and the offsets applied.
 */
export function padTileMap(tilemap: TileType[][]): { tilemap: TileType[][]; offsetX: number; offsetY: number } {
  const firstRow = tilemap[0];
  if (!Array.isArray(tilemap) || firstRow == null) throw new Error("Invalid tilemap: must be a non-empty 2D array");

  let offsetY = 0;
  let offsetX = 0;

  if (firstRow.some((type) => type !== "x")) {
    tilemap = [firstRow.map(() => "x" as const), ...tilemap];
    offsetY += 1;
  }

  const nonPrefixedRows = tilemap.filter((row) => row[0] !== "x");
  if (nonPrefixedRows.length > 1) {
    tilemap = tilemap.map((row): TileType[] => ["x", ...row]);
    offsetX += 1;
  }

  return {
    tilemap,
    offsetX,
    offsetY,
  };
}
