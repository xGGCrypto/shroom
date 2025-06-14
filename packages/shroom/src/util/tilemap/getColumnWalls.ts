import { TileType } from "../../types/TileType";
import { getTileInfo } from "../getTileInfo";

/**
 * Represents a wall segment along a column in the tilemap.
 */
export type ColumnWall = {
  startX: number;
  endX: number;
  y: number;
  height: number;
};

/**
 * Finds all column-aligned wall segments in a tilemap.
 * @param tilemap The 2D array of TileType.
 * @returns An array of ColumnWall objects.
 */
export function getColumnWalls(tilemap: TileType[][]): ColumnWall[] {
  let lastX = tilemap[0].length - 1;

  let wallEndX: number | undefined;
  let wallStartX: number | undefined;
  let height: number | undefined;

  const walls: ColumnWall[] = [];

  if (!Array.isArray(tilemap) || tilemap.length === 0 || !Array.isArray(tilemap[0])) {
    throw new Error("Invalid tilemap: must be a non-empty 2D array");
  }
  for (let y = 0; y < tilemap.length; y++) {
    for (let x = lastX; x >= 0; x--) {
      const current = getTileInfo(tilemap, x, y);

      if (current.colEdge && !current.rowDoor) {
        if (wallEndX == null) {
          wallEndX = x;
        }

        wallStartX = x;
        lastX = x - 1;
        if (height == null || (current.height ?? 0) < height) {
          height = current.height;
        }
      } else {
        if (wallEndX != null && wallStartX != null) {
          walls.push({
            startX: wallStartX,
            endX: wallEndX,
            y: y - 1,
            height: height ?? 0,
          });
          wallEndX = undefined;
          wallStartX = undefined;
          height = undefined;
        }
      }
    }
  }

  return walls;
}
