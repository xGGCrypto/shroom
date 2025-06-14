import { TileType } from "../../types/TileType";
import { getTileInfo } from "../getTileInfo";

/**
 * Represents a wall segment along a row in the tilemap.
 */
export type RowWall = {
  startY: number;
  endY: number;
  x: number;
  height: number;
};

/**
 * Finds all row-aligned wall segments in a tilemap.
 * @param tilemap The 2D array of TileType.
 * @returns An array of RowWall objects.
 */
export function getRowWalls(tilemap: TileType[][]): RowWall[] {
  let lastY = tilemap.length - 1;

  let wallEndY: number | undefined;
  let wallStartY: number | undefined;
  let height: number | undefined;

  const walls: RowWall[] = [];

  if (!Array.isArray(tilemap) || tilemap.length === 0 || !Array.isArray(tilemap[0])) {
    throw new Error("Invalid tilemap: must be a non-empty 2D array");
  }
  for (let x = 0; x < tilemap[0].length; x++) {
    for (let y = lastY; y >= 0; y--) {
      const current = getTileInfo(tilemap, x, y);

      if (current.rowEdge && !current.rowDoor) {
        if (wallEndY == null) {
          wallEndY = y;
        }

        wallStartY = y;
        lastY = y - 1;

        if (height == null || (current.height ?? 0) < height) {
          height = current.height;
        }
      } else {
        if (wallEndY != null && wallStartY != null) {
          walls.push({
            startY: wallStartY,
            endY: wallEndY,
            x: x - 1,
            height: height ?? 0,
          });
          wallEndY = undefined;
          wallStartY = undefined;
          height = undefined;
        }
      }
    }
  }

  return walls;
}
