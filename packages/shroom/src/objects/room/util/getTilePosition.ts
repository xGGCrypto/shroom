import { ShroomPoint } from "../../../pixi-proxy";

/**
 * Returns the screen position for a tile based on even/odd room coordinates.
 *
 * @param roomX The X coordinate in the room.
 * @param roomY The Y coordinate in the room.
 * @returns A ShroomPoint representing the tile's screen offset.
 */
export function getTilePosition(roomX: number, roomY: number): ShroomPoint {
  const xEven = roomX % 2 === 0;
  const yEven = roomY % 2 === 0;
  return new ShroomPoint(xEven ? 0 : 32, yEven ? 32 : 0);
}
