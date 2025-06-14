import { getTilePosition } from "./getTilePosition";
import { ShroomPoint } from "../../../pixi-proxy";

/**
 * Returns the top, left, and right screen positions for a tile.
 *
 * @param roomX The X coordinate in the room.
 * @param roomY The Y coordinate in the room.
 * @returns An object with top, left, and right ShroomPoints.
 */
export function getTilePositionForTile(roomX: number, roomY: number): TilePositionForTile {
  return {
    top: getTilePosition(roomX, roomY),
    left: getTilePosition(roomX, roomY + 1),
    right: getTilePosition(roomX + 1, roomY),
  };
}

/**
 * Represents the top, left, and right screen positions for a tile.
 */
export interface TilePositionForTile {
  left: ShroomPoint;
  right: ShroomPoint;
  top: ShroomPoint;
}
